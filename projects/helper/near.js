const axios = require("axios");

const endpoint = "https://rpc.mainnet.near.org";

async function call(contract, method, args = {}) {
  const result = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "query",
    "params": {
      "request_type": "call_function",
      "finality": "final",
      "account_id": contract,
      "method_name": method,
      "args_base64": Buffer.from(JSON.stringify(args)).toString("base64")
    }
  });
  if (result.data.error) {
    throw new Error(`${result.data.error.message}: ${result.data.error.data}`)
  }
  return JSON.parse(Buffer.from(result.data.result.result).toString())
}

async function getTokenBalance(token, account) {
  return call(token, "ft_balance_of", {account_id: account})
}


module.exports = {
  call,
  getTokenBalance
};
