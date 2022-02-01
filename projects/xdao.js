const sdk = require("@defillama/sdk");
const retry = require("./helper/retry");
const axios = require("axios");
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

  switch (chain) {
    case "ethereum":
      chainId = 1;
      break;
    case "bsc":
      chainId = 56;
      break;
    case "polygon":
      chainId = 137;
      break;
    case "avax":
      chainId = 43114;
      break;
    case "fantom":
      chainId = 250;
      break;
    case "heco":
      chainId = 128;
      break;
  }

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
  }
}
// node test.js projects/xdao.js
function tvl(chain, gasToken) {
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

    for (const dao of daos) {
      let tokens = await getTokens(chain, dao);

      if (tokens.includes(gasToken)) {
        const gasBalance = (
          await sdk.api.eth.getBalance({
            target: dao,
            block,
            chain,
          })
        ).output;

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

    return balances;
  };
}

module.exports = {
  ethereum: {
    tvl: tvl("ethereum", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  },
  bsc: {
    tvl: tvl("bsc", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  },
  polygon: {
    tvl: tvl("polygon", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  },
  avax: {
    tvl: tvl("avax", "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"),
  },
  fantom: {
    tvl: tvl("fantom", "0xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"),
  },
  heco: {
    tvl: tvl("heco", "0xhecozzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz"),
  },
};
