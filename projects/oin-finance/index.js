const ADDRESSES = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");
const axios = require("axios");
const BYTES = "100000000";
const NEAR_BYTES = "1000000000000000000000000";
const sdk = require("@defillama/sdk");
const abi = require("./abi");

const { getChainTransform } = require('../helper/portedTokens')
const { pool2s } = require('../helper/pool2')
const { unwrapLPsAuto } = require('../helper/unwrapLPs')

const fetchNearTVL = async () => {
  const [price, near_stake,] = await Promise.all([fetchTokenPrice(),
  fetchSystemLock(),])
  return {
    tether: +BigNumber(price)
    .div(BYTES)
    .times(new BigNumber(near_stake).div(NEAR_BYTES))
  }
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

function getStaking(chain, configs) {
  return async (_, _b, { [chain]: block }) => {
    const balances = {}
    const transform = await getChainTransform(chain)
    for (const [token, stakingContract] of configs) {
      const { output: totalToken } = await sdk.api.abi.call({
        target: stakingContract,
        abi: abi["totalToken"],
        chain, block,
      })
      balances[transform(token)] = totalToken
    }

    await unwrapLPsAuto({ balances, chain, block, transformAddress: transform, })

    return balances
  }
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: getStaking('ethereum', [
      ['0xde7d85157d9714eadf595045cc12ca4a5f3e2adb', '0x062bf7b431dc9a3ab4062455e8d589df91748353'], // STPT
      ['0xf8c3527cc04340b208c854e985240c02f7b7793f', '0x6c64cded6BDD702a3BD9bB9e70C6d758fC358021'],  // FRONT
      ['0x9aeB50f542050172359A0e1a25a9933Bc8c01259', '0xD539cb51D7662F93b2B2a2D1631b9C9e989b90ec'], // OIN
    ]),
    pool2: pool2s(['0xae18cc5f00641563313422e5d61e608264012328', '0x37c3e8729b105b78013f47cb1a00584c7de90d1d',], ['0x54d16d35ca16163bc681f39ec170cf2614492517']),
  },
  harmony: {
    tvl: getStaking('harmony', [
      [ADDRESSES.harmony.WONE, '0xD018669755ad1e8c10807836A4729DCDEE8f036d'], // WONE
      ['0xb6768223895acc78efba06c28fdd8940f95a8ec2', '0x014186Ea70568806c2eEFeeaa1D2A71c18B9B95a'], // VIPER-LP
    ]),
  },
  near: {
    tvl: fetchNearTVL
  },
  methodology: "Counts TVL on multi-chain of OIN-Finance",
};
