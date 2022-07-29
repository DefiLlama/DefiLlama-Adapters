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
      method = "covalent";
      break;
    case "bsc":
      chainId = 56;
      method = "covalent";
      break;
    case "polygon":
      chainId = 137;
      method = "covalent";
      break;
    case "avax":
      chainId = 43114;
      method = "covalent";
      break;
    case "fantom":
      chainId = 250;
      method = "covalent";
      break;
    case "heco":
      chainId = 128;
      method = "covalent";
      break;
    case "astar":
      chainId = "astar";
      gasToken = "astar";
      method = "debank";
      break;
  }

  if (method === "covalent") {
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
    ).output;

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
        } else {
          gasBalance = (
            await sdk.api.eth.getBalance({
              target: dao,
              block,
              chain,
            })
          ).output;
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
    tvl: tvl("ethereum", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "covalent"),
  },
  bsc: {
    tvl: tvl("bsc", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "covalent"),
  },
  polygon: {
    tvl: tvl("polygon", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "covalent"),
  },
  avax: {
    tvl: tvl("avax", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee", "covalent"),
  },
  fantom: {
    tvl: tvl("fantom", "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", "covalent"),
  },
  heco: {
    tvl: tvl("heco", "0xhecozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz", "covalent"),
  },
  astar: {
    tvl: tvl("astar", "astar", "debank"),
  },
};
