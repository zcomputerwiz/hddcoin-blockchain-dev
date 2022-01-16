from __future__ import annotations
import pathlib
from typing import Dict, Callable
from logging import log
import decimal
import time
import aiohttp
import asyncio
import time
import yaml
import typing as th


import hddcoin.types.coin_record
from hddcoin.hodl import BYTES_PER_HDD
from hddcoin.hodl import HODL_DIR_TMP
from hddcoin.hodl import exc
from hddcoin.hodl import exc as exc
from hddcoin.hodl.ContractDetails import ContractDetails
from hddcoin.hodl.hodlrpc import HodlRpcClient
from hddcoin.hodl.val import validateCancellation
from hddcoin.hodl.val import validateContract
from hddcoin.rpc.full_node_rpc_client import FullNodeRpcClient
from hddcoin.util.config import load_config
from hddcoin.util.default_root import DEFAULT_ROOT_PATH
from hddcoin.util.ints import uint16, uint64
from hddcoin.rpc.wallet_rpc_client import WalletRpcClient


class HodlRpcApi:
    fingerprint: int

    def __init__(self, hodl_node: HodlNode):
        assert hodl_node is not None
        self.service = hodl_node
        self.service_name = "hddcoin_hodl"

    def get_routes(self) -> Dict[str, Callable]:
        return {
            # Programs
            "/get_programs": self.get_programs,
            # Contracts
            "/commit_contract": self.commit_contract,
            "/cancel_contract": self.cancel_contract,
        }

    async def cancel_contract(self, contract_id: str) -> None:
        hodlRpcClient = self._get_hodl_client()
        apiDict = await hodlRpcClient.get(f"getContract/{contract_id}")
        contractDetails = ContractDetails.fromApiDict(apiDict)

        if contract_id != contractDetails.contract_id:
            raise exc.HodlError(f"Contract_id provided by server does not match.")
        elif contractDetails.status not in {"REGISTERED", "CONFIRMED", "GUARANTEED"}:
            raise exc.HodlError(f"Illegal state for cancel attempt: {contractDetails.status}")

        cooldownRemaining_s = max(0, contractDetails.tstamp_cancel_ok - time.time())
        if cooldownRemaining_s > 0:
            # Since same-block cancel/guarantee can easily happen when someone tries to immediately
            # cancel, we want to avoid confusion if their cancel attempt ends up not happening on the
            # blockchain (because our guarantee attempt "wins" in the same block). A short cooldown is
            # all we need here. This clears the moment a contract is GUARANTEED, so can certainly be
            # shorter than the reported tstamp_cancel_ok. There is zero risk of funds going astray, but
            # it's not cool if the user thinks they cancelled but it didn't actually work.
            raise exc.HodlError(f"Cooldown period has not expired before cancel attempt.")
        # need to validate the puzzlehash
        log.debug(1, "Validating contract details received from server")
        try:
            validateCancellation(contract_id, contractDetails)
        except Exception as e:
            raise exc.HodlError(f"Validation of contract details failed! {e}")

        try:
            config = load_config(DEFAULT_ROOT_PATH, "config.yaml")
            self_hostname = config["self_hostname"]
            rpc_port = config["full_node"]["rpc_port"]
            fullNodeClient = await FullNodeRpcClient.create(self_hostname, uint16(rpc_port), DEFAULT_ROOT_PATH, config)
            await hddcoin.hodl.util.cancelContract(self.hodlRpcClient, fullNodeClient, contractDetails)
        except Exception as e:
            if isinstance(e, aiohttp.ClientConnectorError):
                raise exc.HodlError(f"Connection error. Check if full node is running at {rpc_port}")
            else:
                raise exc.HodlError(f"Exception from 'full node' {e}")

        fullNodeClient.close()
        await fullNodeClient.await_closed()
        hodlRpcClient.close()

    async def get_programs(self):
        hodlRpcClient = self._get_hodl_client()
        
        programs = await hodlRpcClient.get("getPrograms")

        hodlRpcClient.close()

        return programs

    async def commit_contract(self: HodlRpcApi,
                        program_name: str,
                        commit_hdd: decimal.Decimal,
                        fee_hdd: decimal.Decimal,
                        payout_address: str,
                        ) -> None:
        SMALLEST_USEFUL_FEE_hdd = 0.0001
        fee_bytes = uint64(int(fee_hdd * BYTES_PER_HDD))
        wallet_id = 1
        hodlRpcClient = self._get_hodl_client()
        try:
            config = load_config(DEFAULT_ROOT_PATH, "config.yaml")
            self_hostname = config["self_hostname"]
            rpc_port = config["full_node"]["rpc_port"]
            walletRpcClient = await WalletRpcClient.create(self_hostname, rpc_port, DEFAULT_ROOT_PATH, config)
        except Exception as e:
            if isinstance(e, aiohttp.ClientConnectorError):
                raise exc.HodlError(f"Connection error. Check if wallet is running at {rpc_port}")
            else:
                raise exc.HodlError(f"Exception from 'wallet' {e}")


        if commit_hdd < 1:
            raise exc.HodlError(f"The minimum HODL contract amount is 1 HDD.")
        elif int(commit_hdd) != commit_hdd:
            raise exc.HodlError("The HODL deposit must be a whole number of HDD.")
        elif commit_hdd > 2**31:
            raise exc.HodlError("You wish you had that much HDD to deposit! :)")
        elif fee_hdd >= 1:
            raise exc.HodlError(f"fee of {fee_hdd} HDD seems too large")
        elif fee_hdd and (fee_bytes < 1):
            raise exc.HodlError("Fee must be at least one byte")
        elif fee_hdd and (fee_hdd < SMALLEST_USEFUL_FEE_hdd):
            raise exc.HodlError(f"Fee must be greater than {SMALLEST_USEFUL_FEE_hdd} to prioritize your deposit")

        log.debug(1, f"Checking for sufficient funds")

        try:
            await hddcoin.hodl.util.verifyWalletFunds(walletRpcClient, wallet_id, commit_hdd + fee_hdd)
        except Exception as e:
            raise exc.HodlError(f"Wallet funds not available due to error:\n{e}")

        log.debug(1, f"Fetching contract from HODL server")
        deposit_bytes = uint64(int(commit_hdd * BYTES_PER_HDD))
        requestRet = await hodlRpcClient.post("requestContract", dict(program_name = program_name,
                                                                    deposit_bytes = deposit_bytes,
                                                                    payout_address = payout_address))
        receipt = requestRet["receipt"]
        contract_id = receipt["receipt_info"]["contract_id"]
        log.info(1, f"Received contract id {contract_id}")

        ## VALIDATE WHAT WE GOT!!
        ##  - i.e. don't blindly trust a contract we just got from the internet with our HDDs
        ##  - ONLY THE PARANOID SURVIVE
        term_in_months = decimal.Decimal(receipt["terms"]["term_in_months"])
        reward_percent = decimal.Decimal(receipt["terms"]["reward_percent"])
        log.debug(1, "Starting contract validation")
        validateContract(program_name,
                        deposit_bytes,
                        payout_address,
                        str(hodlRpcClient.pk),
                        term_in_months, # to be visually confirmed below
                        reward_percent, # to be visually confirmed below
                        receipt,
                        )

        precommitReceiptPath = self._stashPrecommitReceipt(receipt)
        contract_address = receipt["coin_details"]["contract_address"]
        tx_id, pushTxComplete = \
            await self._createContractCoin(walletRpcClient, wallet_id, deposit_bytes,
                                    fee_bytes, contract_address)

        receiptStorageFailure = ""
        try:
            finalReceiptPath = self._storeFinalReceipt(precommitReceiptPath)
        except Exception as e:
            receiptStorageFailure = repr(e)
            finalReceiptPath = receiptStorageFailure

        if pushTxComplete:
            log.info(f"HODL contract purchase complete!")
        else:
            log.info(f"The wallet transaction is still pending")
        log.info(f"Receipt stored to {finalReceiptPath}")
        log.info(f"Contract ID is: {contract_id}")
        log.info(f"Transaction ID is: 0x{tx_id}")

        if receiptStorageFailure:
            # This is very odd, but we will let the user know the info is in the precommit path
            msg = (f"Unable to store final receipt: {receiptStorageFailure}"
                f"The contract has been pushed, check {precommitReceiptPath} for receipt")
            raise exc.HodlError(msg)
        walletRpcClient.close()
        await walletRpcClient.await_closed()
        hodlRpcClient.close()    



    def _stashPrecommitReceipt(receipt: th.Dict[str, th.Any]) -> pathlib.Path:
        HODL_DIR_TMP.mkdir(parents = True, exist_ok = True)
        contract_id = receipt["receipt_info"]["contract_id"]
        precommitPath = HODL_DIR_TMP / f"{contract_id}.yaml"
        with open(precommitPath, "w") as fp:
            fp.write(yaml.dump(receipt, sort_keys = False))
        return precommitPath


    async def _createContractCoin(walletClient: WalletRpcClient,
                                wallet_id: int,
                                deposit_bytes: uint64,
                                fee_bytes: uint64,
                                contract_address: str,
                                ) -> th.Tuple[str, bool]:
        tx: hddcoin.wallet.transaction_record.TransactionRecord

        deposit_hdd = decimal.Decimal(deposit_bytes) / BYTES_PER_HDD
        log.debug(f"Submitting transaction to purchase HODL contract for "
            f"{deposit_hdd} HDD ... ", end = "")

        try:
            tx = await walletClient.send_transaction(str(wallet_id), deposit_bytes, contract_address,
                                                    fee_bytes)
        except ValueError as e:
            # This is odd since we *should* have pre-validated everything, but maybe something changed?
            log.debug(1, f"Error trying to submit the HODL deposit transaction: {e}")
            raise exc.HodlError(f"Unexpected error submitting the HODL deposit transaction: {e}")

        tx_id = tx.name
        log.debug(2, "Waiting for transmission confirmation from nodes")
        pushTxComplete = False
        start_s = time.monotonic()
        while time.monotonic() - start_s < 10:
            await asyncio.sleep(0.1)
            tx = await walletClient.get_transaction(str(wallet_id), tx_id)
            if len(tx.sent_to) > 0:
                pushTxComplete = True
                log.info(f"Transaction sent to {tx.sent_to} node(s) OK")
                break
        else:
            log.err(f"RESULT UNCERTAIN")

        return tx_id, pushTxComplete


    def _storeFinalReceipt(precommitReceiptPath: pathlib.Path) -> pathlib.Path:
        hddcoin.hodl.HODL_DIR_RECEIPTS.mkdir(parents = True, exist_ok = True)
        finalReceiptPath = hddcoin.hodl.HODL_DIR_RECEIPTS / precommitReceiptPath.name
        precommitReceiptPath.rename(finalReceiptPath)
        return finalReceiptPath

    async def _get_hodl_client(self) -> HodlRpcClient:
        if self.fingerprint is None:
            # All HODL RPC calls require a public key, so we *need* a fingerprint.
            log.debug(2, "Collecting available fingerprints (no fingerprint was specified)")
            fingerprints = [pki[0].get_g1().get_fingerprint()
                            for pki in hddcoin.util.keychain.Keychain().get_all_private_keys()]
            numFingerprints = len(fingerprints)
            if numFingerprints == 0:
                raise exc.HodlError(f"No keys found! HODL'ing requires a fully synced wallet.")
            log.debug(1, f"Automatically selecting the first available fingerprint ({self.fingerprint})")
            self.fingerprint = fingerprints[0]

        # Create a HodlRpcClient...
        #  - every `hddcoin hodl` operation requires a call to the HODL server
        #  - WORTH NOTING: Once a HODL contract is launched (i.e. the smart coin is on-chain) this is
        #     not strictly necessary (since full reveal and solutions to copmpletely manage the coin are
        #     provided in the receipt), but it makes overall contract management portable (and easier)
        #     since there is no need to have the receipts at hand to work with the contracts.
        try:
            hodlRpcClient = HodlRpcClient(self.fingerprint)
        except exc.KeyNotFound as knf:
            # This can happen because A) we don't validate fingerprints given via -f, and B) the key
            # situation may have changed in the background.
            keyCount = int(knf.args[0])
            if keyCount:
                raise exc.HodlError(f"Unknown fingerprint.")
            else:
                raise exc.HodlError(f"No keys found! HODL'ing requires a fully synced wallet.")
        except Exception as e:
            raise exc.HodlError(f"Unable to create HODL RPC client: {e}")
        return hodlRpcClient
