const BigNumber = require("bignumber.js");
const axios = require("axios");
const BYTES = "100000000";
const BYTES_18 = "1000000000000000000";
const NEAR_BYTES = "1000000000000000000000000";
const sdk = require("@defillama/sdk");
const abi = require("./abi");
const target_addr = "0xD539cb51D7662F93b2B2a2D1631b9C9e989b90ec";
const wone_stake = "0xD018669755ad1e8c10807836A4729DCDEE8f036d";
const wone_stable = "0xaD09d25F9fFc9a6e3218b2F2d49b7D7AC8E62B88";
const wone_oracle = "0xae50Daf91B2cf3B3970f0E25DBba832517F8c6b3";
const viper_stake = "0x014186Ea70568806c2eEFeeaa1D2A71c18B9B95a";
const viper_stable = "0x8b1473f086178690124cB6793679770521DD20A2";
const viper_oracle = "0x74e290b0cc6D1c39948f2347606e88Fe759D674f";

const getTotalTVL = async (timestamp, block) => {
  const [near_tvl, oin_tvl, harmony_tvl] =
    await Promise.all([
      fetchNearTVL(),
      fetchOinTVL(timestamp, block),
      fetchHarmonyTVL(timestamp, block),
    ]);
  return new BigNumber(near_tvl)
    .plus(oin_tvl)
    .plus(harmony_tvl)
    .toFixed();
};

const fetchNearTVL = async () => {
  const [price, near_stake, near_stability] = await Promise.all([fetchTokenPrice(),
  fetchSystemLock(),
  fetchStabilityLock(),])
  return new BigNumber(price)
    .div(BYTES)
    .times(new BigNumber(near_stake).div(NEAR_BYTES))
    .plus(new BigNumber(near_stability).div(BYTES)).toFixed();
}

const fetchHarmonyTVL = async (timestamp, block) => {
  const p1 = sdk.api.abi.call({
    target: wone_stake,
    abi: abi["totalToken"],
    block: block,
    chain: "harmony",
  });
  const p2 = sdk.api.abi.call({
    target: wone_oracle,
    abi: abi["peek"],
    block: block,
    chain: "harmony",
  });
  const p3 = sdk.api.abi.call({
    target: wone_stable,
    abi: abi["totalUSDODeposits"],
    block: block,
    chain: "harmony",
  });
  const p4 = sdk.api.abi.call({
    target: viper_stake,
    abi: abi["totalToken"],
    block: block,
    chain: "harmony",
  });
  const p5 = sdk.api.abi.call({
    target: viper_stable,
    abi: abi["totalUSDODeposits"],
    block: block,
    chain: "harmony",
  });
  const p6 = sdk.api.abi.call({
    target: viper_oracle,
    abi: abi["peek"],
    block: block,
    chain: "harmony",
  });
  const [lock, price, stable_lock, viper_lock, viper_stable_lock, viper_price] =
    await Promise.all([p1, p2, p3, p4, p5, p6]);
  const wone_staking = new BigNumber(lock.output)
    .div(BYTES_18)
    .times(price.output)
    .div(BYTES_18);
  const wone_stablility = new BigNumber(stable_lock.output).div(BYTES);
  const viper_staking = new BigNumber(viper_lock.output)
    .div(BYTES_18)
    .times(new BigNumber(viper_price.output).div(BYTES_18));
  const viper_stability = new BigNumber(viper_stable_lock.output).div(BYTES);
  return new BigNumber(wone_staking)
    .plus(wone_stablility)
    .plus(viper_staking)
    .plus(viper_stability)
    .toFixed();
};

const fetchOinTVL = async (timestamp, block) => {
  const promise = axios.get("https://dao.oin.finance/OINPrice");
  const promise_2 = sdk.api.abi.call({
    target: target_addr,
    abi: abi["totalToken"],
    block: block,
  });
  const [price, lock] = await Promise.all([promise, promise_2]);
  return new BigNumber(lock.output).div(BYTES).times(price.data).toFixed();
};

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
  harmony: {
    fetchHarmonyTVL
  },
  ethereum: {
    fetchOinTVL
  },
  near: {
    fetchNearTVL
  },
  getTotalTVL,
  methodology: "Counts TVL on multi-chain of OIN-Finance",
};
