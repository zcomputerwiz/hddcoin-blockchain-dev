import { service_hodl } from '../util/service_names';
import {
  async_api,
  get_programs,
  get_contracts,
  get_limits,
  get_profits,
} from './hodlMessages';
import type HODLProgram from '../types/HODLProgram';
import type HODLContract from 'types/HODLContract';

export function getPrograms() {
  return async (dispatch): Promise<HODLProgram[]> => {
    const { data } = await async_api(
      dispatch,
      get_programs(),
      true,
    );

    return data?.programs;
  };
}

export function getContracts() {
  return async (dispatch): Promise<HODLContract[]> => {
    const { data } = await async_api(
      dispatch,
      get_contracts(),
      true,
    );

    return data?.contracts;
  }
}

export type IncomingState = {
  wallet_id: number;
  fingerprint?: number | null;
  cancel: boolean;
  programs?: HODLProgram[] | null;
  contracts?: HODLContract[] | null;
  deposit_bytes: number;
  reward_bytes: number;
  contract_address?: string;
  payout_address?: string;
};

const initialState: IncomingState = {
  wallet_id: 1,
  fingerprint: null,
  cancel: false,
  deposit_bytes: 0,
  reward_bytes: 0,
};

export default function incomingReducer(
  state: IncomingState = { ...initialState },
  action: any,
): IncomingState {
  switch (action.type) {
    case 'OUTGOING_MESSAGE':
      if (
        action.message.command === 'send_transaction' ||
        action.message.command === 'cc_spend'
      ) {
        const wallet_id = action.message.data.wallet_id;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              sending_transaction: false,
              send_transaction_result: null,
            },
          ),
        };
      }
      return state;
    case 'INCOMING_MESSAGE':
      if (action.message.origin !== service_hodl) {
        return state;
      }

      const {
        message,
        message: {
          data,
          command,
          data: { success },
        },
      } = action;

      if (command === 'generate_mnemonic') {
        const mnemonic =
          typeof message.data.mnemonic === 'string'
            ? message.data.mnemonic.split(' ')
            : message.data.mnemonic;

        return {
          ...state,
          mnemonic,
        };
      }
      if (command === 'add_key') {
        return {
          ...state,
          logged_in: success,
          selected_fingerprint: success ? data.fingerprint : undefined,
        };
      }
      if (command === 'log_in') {
        return {
          ...state,
          logged_in: success,
        };
      }
      if (command === 'delete_all_keys' && success) {
        return {
          ...state,
          logged_in: false,
          selected_fingerprint: undefined,
          public_key_fingerprints: [],
          logged_in_received: true,
        };
      } else if (command === 'get_public_keys' && success) {
        const { public_key_fingerprints } = data;

        return {
          ...state,
          public_key_fingerprints,
          logged_in_received: true,
        };
      } 
      if (command === 'ping') {
        return {
          ...state,
          server_started: success,
        };
      } 
      if (command === 'get_wallets' && success) {
        const { wallets } = data;

        return {
          ...state,
          wallets: mergeArrays(state.wallets, (wallet) => wallet.id, wallets),
        };
      } 
      if (command === 'get_wallet_balance' && success) {
        const { wallets, ...rest } = state;

        const {
          wallet_balance,
          wallet_balance: {
            wallet_id,
            confirmed_wallet_balance,
            unconfirmed_wallet_balance,
          },
        } = data;

        const balance_pending =
          unconfirmed_wallet_balance - confirmed_wallet_balance;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              wallet_balance: {
                ...wallet_balance,
                balance_pending,
              },
            },
          ),
        };
      } 
      if (command === 'get_transactions' && success) {
        const { wallet_id, transactions } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              transactions: transactions.reverse(),
            },
          ),
        };
      } 
      if (command === 'get_next_address' && success) {
        const { wallet_id, address } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              address,
            },
          ),
        };
      } 
      if (command === 'get_connections' && success) {
        if (data.connections) {
          return {
            ...state,
            status: {
              ...state.status,
              connections: data.connections,
              connection_count: data.connections.length,
            },
          };
        }
      } else if (command === 'get_height_info') {
        return {
          ...state,
          status: {
            ...state.status,
            height: data.height,
          },
        };
      } else if (command === 'get_network_info' && success) {
        return {
          ...state,
          network_info: {
            network_name: data.network_name,
            network_prefix: data.network_prefix,
          },
        };
      } else if (command === 'get_sync_status' && success) {
        return {
          ...state,
          status: {
            ...state.status,
            syncing: data.syncing,
            synced: data.synced,
          },
        };
      } else if (command === 'cc_get_colour') {
        const { wallet_id, colour } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              colour,
            },
          ),
        };
      } else if (command === 'cc_get_name') {
        const { wallet_id, name } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              name,
            },
          ),
        };
      } else if (command === 'did_get_did') {
        const { wallet_id, my_did: mydid, coin_id: didcoin  } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              mydid,
              didcoin,
            },
          ),
        };
      } else if (command === 'did_get_recovery_list') {
        const { wallet_id, recover_list: backup_dids, num_required: dids_num_req  } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              backup_dids,
              dids_num_req,
            },
          ),
        };
      } else if (command === 'did_get_information_needed_for_recovery') {
        const { 
          wallet_id, 
          my_did: mydid, 
          coin_name: didcoin,
          newpuzhash: did_rec_puzhash,
          pubkey: did_rec_pubkey,
          backup_dids,
        } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              mydid,
              didcoin,
              did_rec_puzhash,
              did_rec_pubkey,
              backup_dids,
            },
          ),
        };
      } else if (command === 'did_recovery_spend') {
        // success = data.success;
      }

      if (command === 'state_changed' && data.state === 'tx_update') {
        const { wallet_id, additional_data: send_transaction_result } = data;
        const { wallets, ...rest } = state;

        return {
          ...rest,
          wallets: mergeArrayItem(
            wallets,
            (wallet: Wallet) => wallet.id === wallet_id,
            {
              sending_transaction: false,
              send_transaction_result,
            },
          ),
        };
      }
      if (command === 'get_farmed_amount') {
        return { ...state, farmed_amount: data };
      }
      if (command === 'get_reward_targets') {
        return { ...state, reward_targets: data };
      }
      return state;
    default:
      return state;
  }
}
