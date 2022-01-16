export function hodlMessage(message) {
  return {
    type: 'OUTGOING_MESSAGE',
    message: {
      destination: service_hodl,
      ...message,
    },
  };
}

export function format_message(command, data) {
  return hodlMessage({
    command,
    data,
  });
}

export const commit = (program, wallet_id, amount, fee, address) => {
    /*
        programName: string;
        walletId: number;
        amount: number;
        fee: number;
        payout_address: string;
        cancel: boolean;
    */
  const action = hodlMessage();
  action.message.command = 'commit';
  action.message.data = {
    program,
    wallet_id,
    amount,
    fee,
    address,
  };
  return action;
};

export const get_programs = () => {
  const action = hodlMessage();
  action.message.command = 'get_programs';
  action.message.data = {};
  return action;
};

export const get_contracts = () => {
    const action = hodlMessage();
    action.message.command = 'get_contracts';
    action.message.data = {};
    return action;
};

export const cancel_contract = (contract) => {
    const action = hodlMessage();
    action.message.command = 'cancel_contract';
    action.message.data = { contract };
    return action;
};

export const get_profits = () => {
  const action = hodlMessage();
  action.message.command = 'get_profits';
  action.message.data = {};
  return action;
};

export const get_limits = () => {
  const action = hodlMessage();
  action.message.command = 'get_limits'
  action.message.data = {};
  return action;
}

export const async_api = (dispatch, action, usePromiseReject) => {
  const promise = new Promise((resolve, reject) => {
    action.resolve = resolve;
    action.reject = reject;
  })

  action.usePromiseReject = usePromiseReject;

  dispatch(action);

  return promise;
};