type HODLContract = {
  contract_id: string;
  status: string;
  client_pubkey: string;
  register_date: string;
  program_name: string;
  term_months: number;
  reward_percent: number;
  deposit_bytes: number;
  reward_bytes: number;
  payout_address: number;
  contract_address: string;
  timestamp_start: number;
  timestamp_payout: number;
  puzzle_reveal: string;
  tstamp_cancel_ok: number;
};
  
export default HODLContract;