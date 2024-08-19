const config = require("./config");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { cachedGraphQuery } = require('../helper/cache');
const { getTokenPrices } = require('../helper/unknownTokens');
const { stripTokenHeader } = require('../helper/utils');
const sdk = require('@defillama/sdk');
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const { default: BigNumber } = require("bignumber.js");

const subgraphs = {
  "arbitrum": "https://api.studio.thegraph.com/query/16975/double-arbitrum/version/latest",
}

async function getTokens(chain) {
  const graphQuery = `
    {
      assetTokens(where: {amount_gt: "0"}) {
        tokenAddress
      }
      migrations(where: {pair_starts_with: "0x", lpAmount_gt: "0"}) {
        pair
        ammType
      }
      liquidities(where: {pair_starts_with: "0x", lpAmount_gt: "0"}) {
        pair
        ammType
      }
    }
  `;

  const { assetTokens, migrations, liquidities } = await cachedGraphQuery(`double2win/${chain}`, subgraphs[chain], graphQuery);

  return { assetTokens, migrations, liquidities };
}

module.exports = {}

Object.keys(config).forEach((network) => {
  const networkConfig = config[network];

  module.exports[network] = {
    tvl: async (api) => {
      // Initialize an empty map to store TVL per token
      const block = api.block;
      const tokenBalances = {};
      const tokenData = await getTokens(network);
      const pairAddresses = [];
      tokenData.migrations.forEach(migration => {
        pairAddresses.push(migration.pair.toLowerCase());
      });
      tokenData.liquidities.forEach(liquidity => {
        pairAddresses.push(liquidity.pair.toLowerCase());
      });
      const assetAddresses = [];
      tokenData.assetTokens.forEach(assetToken => {
        assetAddresses.push(assetToken.tokenAddress.toLowerCase());
      });
      // Iterate over each contract type within the network
      await Promise.all(
        Object.keys(networkConfig).map(async (contractType) => {
          const tokensAndOwners = [];
          const { doubleContract, fromBlock, type } = networkConfig[contractType];
          if (type.startsWith("v3")) {
            await sumTokens2({ api, balances: tokenBalances, owner: doubleContract, resolveUniV3: true, chain: network, sumChunkSize: 50 })
          } else {
            if (type.startsWith("v2")) {
              pairAddresses.forEach(pairAddress => {
                tokensAndOwners.push([pairAddress, doubleContract]);
              });
              await sumTokens2({ api, balances: tokenBalances, tokensAndOwners: tokensAndOwners, chain: network, resolveLP: true, sumChunkSize: 50})
            } else {
              assetAddresses.forEach(asset => {
                tokensAndOwners.push([asset, doubleContract]);
              });
              await sumTokens2({ api, balances: tokenBalances, tokensAndOwners: tokensAndOwners, chain: network, sumChunkSize: 50})
            }
          }
        })
      );
      const balances = Object.fromEntries(
        Object.entries(tokenBalances).filter(([_, value]) => !Number.isNaN(value))
      );
      const finalBalances = balances;
      const transformAddress = await getChainTransform(network);
      const { prices} = await getTokenPrices({ chain: network, block, lps: ["0x27D336a834775988b1305df42569E27128932bDD"],  useDefaultCoreAssets: true})
      Object.entries(balances).forEach(([address, amount = 0]) => {
        const token = stripTokenHeader(address)
        const price = prices[token];
        if (!price) return;
        let tokenAmount = price[1] * +amount
        const coreAsset = price[2]
        sdk.util.sumSingleBalance(balances, transformAddress(coreAsset), BigNumber(tokenAmount).toFixed(0))
        delete balances[address]
      })
      const fixBalances = await getFixBalances(network)
      fixBalances(finalBalances)
      return finalBalances
    },
  };
});
