const sdk = require("@defillama/sdk");
const retry = require("./helper/retry");
const axios = require("axios");
const { PromisePool } = require('@supercharge/promise-pool')
const {
  transformBscAddress,
  transformAvaxAddress,
  transformHecoAddress,
  transformPolygonAddress,
  transformFantomAddress,
  transformOptimismAddress,
  transformMoonriverAddress,
  transformMoonbeamAddress,
  transformOkexAddress,
  transformMetisAddress,
  transformBobaAddress,
} = require("./helper/portedTokens");

const factoryAddress = "0x72cc6E4DE47f673062c41C67505188144a0a3D84";
const wethAddress = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

const getDaos = {
  inputs: [],
  name: "getDaos",
  outputs: [{ internalType: "address[]", name: "", type: "address[]" }],
  stateMutability: "view",
  type: "function",
};

async function getTokens(chain, address) {
  let chainId;
  let method;
  let gasToken;

  switch (chain) {
    case "ethereum":
      chainId = 1;
      method = "covalentWithCoingecko";
      break;
    case "bsc":
      chainId = 56;
      method = "covalentWithCoingecko";
      break;
    case "polygon":
      chainId = 137;
      method = "covalentWithCoingecko";
      break;
    case "avax":
      chainId = 43114;
      method = "covalentWithCoingecko";
      break;
    case "fantom":
      chainId = 250;
      method = "covalentWithCoingecko";
      break;
    case "heco":
      chainId = 128;
      method = "covalentWithCoingecko";
      break;
    case "moonbeam":
      chainId = 1284;
      method = "covalentWithCoingecko";
      break;
    case "moonriver":
      chainId = 1285;
      method = "covalentWithCoingecko";
      break;
    case "astar":
      chainId = "astar";
      gasToken = "astar";
      method = "debank";
      break;
    case "optimism":
      chainId = "op";
      method = "debankWithCoingecko";
      break;
    case "okexchain":
      chainId = "okt";
      method = "debankWithCoingecko";
      break;
    case "metis":
      chainId = "metis";
      method = "debankWithCoingecko";
      break;
    case "boba":
      chainId = "boba";
      method = "debankWithCoingecko";
      break;
  }

  if (method === "covalentWithCoingecko") {
    const allTokens = (
      await retry(
        async (bail) =>
          await axios.get(
            `https://api.covalenthq.com/v1/${chainId}/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
          )
      )
    ).data.data.items.map((t) => t.contract_address);

    return allTokens;
  } 
  if (method === "debank") {  
    const allTokensRaw = (
      await retry(
        async (bail) =>
          await axios.get(
            `https://openapi.debank.com/v1/user/token_list?id=${address}&chain_id=${chainId}&is_all=true&has_balance=true`
          )
      )
    );

    const allTokens = allTokensRaw.data.map((t) => t.id);
    const gasTokenRaw = allTokensRaw.data.find((t) => (t.id === gasToken));
    const gasBalance = gasTokenRaw ? gasTokenRaw.amount : "0";
    
    return [allTokens, gasBalance];
  } 
  if (method === "debankWithCoingecko") {  
    const allTokens = (
      await retry(
        async (bail) =>
          await axios.get(
            `https://openapi.debank.com/v1/user/token_list?id=${address}&chain_id=${chainId}&is_all=true&has_balance=true`
          )
      )
    ).data.map((t) => t.id);
    
    return allTokens;
  } 

  return [];
}

async function getTransform(chain) {
  switch (chain) {
    case "ethereum":
      return (a) => a;
    case "bsc":
      return await transformBscAddress();
    case "polygon":
      return await transformPolygonAddress();
    case "avax":
      return await transformAvaxAddress();
    case "fantom":
      return await transformFantomAddress();
    case "heco":
      return await transformHecoAddress();
    case "moonbeam":
      return await transformMoonbeamAddress();
    case "moonriver":
      return await transformMoonriverAddress();
    case "okexchain":
      return async (a) => {
        if (a === "okt") {
          return "0x75231f58b43240c9718dd58b4967c5114342a86c"
        }
        return await transformOkexAddress(a);
      }
    case "optimism": 
      return async (a) => {
        if (a === "op") {
          return "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
        }
        return await transformOptimismAddress(a);
      } 
    case "metis": 
      return async (a) => {
        if (a === "metis") {
          return "0x9e32b13ce7f2e80a01932b42553652e053d6ed8e"
        }
        return await transformMetisAddress(a);
      } 
    case "boba": 
      return async (a) => {
        if (a === "boba") {
          return "0x42bbfa2e77757c645eeaad1655e0911a7553efbc"
        }
        return await transformMetisAddress(a);
      } 
    case "astar":
      return (a) => a;
  }
}

// node test.js projects/xdao.js
function tvl(chain, gasToken, method) {
  return async (timestamp, block, chainBlocks) => {
    block = chainBlocks[chain];
    let balances = {};
    let transform = (a) => a;
    transform = await getTransform(chain);

    const daos = (
      await sdk.api.abi.call({
        chain,
        block,
        target: factoryAddress,
        abi: getDaos,
      })
    ).output
    
    await PromisePool
      .withConcurrency(31)
      .for(daos)
      .process(addDao)

    return balances;

    async function addDao(dao) {
      let tokens = await getTokens(chain, dao);
      let gasBalanceDebank = "0";

      if (method === "debank") {
        gasBalanceDebank = tokens[1];
        tokens = tokens[0];
      }

      if (tokens.includes(gasToken)) {
        let gasBalance;
        if (method === "debank") {
          gasBalance = gasBalanceDebank;
        } else if (method === "coingecko") {
          gasBalance = (
            await sdk.api.eth.getBalance({
              target: dao,
              block,
              chain,
            })
          ).output;
        } else {
          gasBalance = "0"
        }
        
        sdk.util.sumSingleBalance(
          balances,
          chain == "ethereum" ? wethAddress : transform(gasToken),
          gasBalance
        );

        tokens = tokens.filter((i) => ![gasToken].includes(i));
      }

      const daoBalances = await sdk.api.abi.multiCall({
        calls: tokens.map((token) => ({
          target: token,
          params: dao,
        })),
        abi: "erc20:balanceOf",
        chain,
        block,
      });

      sdk.util.sumMultiBalanceOf(balances, daoBalances, true, transform);
    }
  };
}

module.exports = {
  ethereum: {
    tvl: tvl("ethereum", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "coingecko"),
  },
  bsc: {
    tvl: tvl("bsc", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "coingeko"),
  },
  polygon: {
    tvl: tvl("polygon", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "coingecko"),
  },
  avax: {
    tvl: tvl("avax", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "coingecko"),
  },
  fantom: {
    tvl: tvl("fantom", "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "coingecko"),
  },
  heco: {
    tvl: tvl("heco", "0xhecozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", "coingecko"),
  },
  astar: {
    tvl: tvl("astar", "astar", "debank"),
  },
  optimism: {
    tvl: tvl("optimism", "op", "coingecko"),
  },
  okexchain: {
    tvl: tvl("okexchain", "okt", "coingecko"),
  },
  moonbeam: {
    tvl: tvl("moonbeam", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "coingecko"),
  },
  moonriver: {
    tvl: tvl("moonriver", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "coingecko"),
  },
  metis: {
    tvl: tvl("metis", "metis", "coingecko"),
  },
  boba: {
    tvl: tvl("boba", "boba", "coingecko"),
  },
};
