export type HODLTransactionData = {
    programName: string;
    walletId: number;
    commit: number;
    fee: number;
    payout_address: string;
    cancel: boolean;
  }
    
  type HODLProgram = {
    name: string; // p["name"]
    min_commit_bytes: number; // decimal.Decimal(p["min_commit_bytes"])
    term_in_months: number; // f"{p['term_in_months']:.2f}".rstrip("0").strip(".") + "M"
    reward_percent: number; // f"{p['reward_percent']:.2f}".rstrip("0").strip(".") + "%"
    description: string; // p["description"]
  };
  
  export type ProgramMap<T extends string, U> = {
    [K in T]?: U;
  };
  
  export default HODLProgram;
  