const BigNumber = require("bignumber.js");
const axios = require("axios");
const BYTES = "100000000";
const NEAR_BYTES = "1000000000000000000000000";
const sdk = require('@defillama/sdk');
const abi = require('./abi')
const target_addr = '0xD539cb51D7662F93b2B2a2D1631b9C9e989b90ec'

const getTotalTVL = async (timestamp, block) => {
  const [price, stake_lock, stability_lock, oin_tvl] = await Promise.all([
    fetchTokenPrice(),
    fetchSystemLock(),
    fetchStabilityLock(),
    getOinTvl(timestamp, block)
  ]);
  return new BigNumber(price)
    .div(BYTES)
    .times(new BigNumber(stake_lock).div(NEAR_BYTES))
    .plus(new BigNumber(stability_lock).div(BYTES)).plus(oin_tvl)
    .toFixed();
};

const getOinTvl = async (timestamp, block) => {
  const promise = axios.get('https://dao.oin.finance/OINPrice');
  const promise_2 = sdk.api.abi.call({
    target: target_addr,
    abi: abi['totalToken'],
    block: block
  })
  const [price, lock] = await Promise.all([promise, promise_2])
  return new BigNumber(lock.output).div(BYTES).times(price.data).toFixed();
}

const fetchTokenPrice = async () => {
  const JSON_DATA = {
    jsonrpc: "2.0",
    id: "oin-finance.near",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "optimistic",
      account_id: "v3.oin_finance.near",
      method_name: "peek",
      args_base64: "e30=",
    },
  };
  let res = await axios.post("https://rpc.mainnet.near.org", JSON_DATA);
  if (res.status === 200) {
    let res_str = "";
    res.data.result.result.map((item) => {
      res_str += String.fromCharCode(item);
    });
    return res_str.replace(/['"]+/g, "");
  }
};

const fetchSystemLock = async () => {
  const JSON_DATA = {
    jsonrpc: "2.0",
    id: "oin-finance.near",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "optimistic",
      account_id: "v3.oin_finance.near",
      method_name: "get_total_token",
      args_base64: "e30=",
    },
  };
  let res = await axios.post("https://rpc.mainnet.near.org", JSON_DATA);
  if (res.status === 200) {
    let res_str = "";
    res.data.result.result.map((item) => {
      res_str += String.fromCharCode(item);
    });
    return res_str.replace(/['"]+/g, "");
  }
};

const fetchStabilityLock = async () => {
  const JSON_DATA = {
    jsonrpc: "2.0",
    id: "oin-finance.near",
    method: "query",
    params: {
      request_type: "call_function",
      finality: "optimistic",
      account_id: "v3.oin_finance.near",
      method_name: "get_total_usdo_deposits",
      args_base64: "e30=",
    },
  };
  let res = await axios.post("https://rpc.mainnet.near.org", JSON_DATA);
  if (res.status === 200) {
    let res_str = "";
    res.data.result.result.map((item) => {
      res_str += String.fromCharCode(item);
    });
    return res_str.replace(/['"]+/g, "");
  }
};

module.exports = {
  getTotalTVL,
  methodology: "Counts OIN, stNEAR tvl of OIN-Finance",
};
