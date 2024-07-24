const { getUniTVL } = require("../helper/unknownTokens.js");

const V2_FACTORY = "0x8e5dff1c121F661971d02950698f8c5EFc3DfA78";
const tvl = getUniTVL({ factory: V2_FACTORY, useDefaultCoreAssets: true, fetchBalances: true });

const chains = ['arbitrum', 'astar', 'aurora', 'avax', 'base', 'bsc', 'celo', 'cmp', 'conflux', 'core', 'dogechain', 'ethereum', 'fantom', 'flare', 'fuse', 'fusion', 'heco', 'kcc', 'kardia', 'kava', 'linea', 'metis', 'moonbeam', 'moonriver', 'optimism', 'palm', 'polygon', 'polygon_zkevm', 'thundercore']

module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory address (0x8e5dff1c121F661971d02950698f8c5EFc3DfA78) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};

chains.forEach(chain => module.exports[chain] = { tvl })