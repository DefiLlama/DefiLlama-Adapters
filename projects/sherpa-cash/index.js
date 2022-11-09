const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const ETHSherpaContracts = [
  "0x6ceB170e3ec0fAfaE3Be5A02FEFb81F524FE85C5",
  "0x7CE57f6a5a135eb1a8e9640Af1eff9665ade00D9",
  "0xe1376DeF383D1656f5a40B6ba31F8C035BFc26Aa",
];

function getNativeTVL(contractAddresses, chain) {
  return async function (timestamp, block, chainBlocks) {
    return sumTokens2({ chain, block: chainBlocks.block, owners: contractAddresses, tokens: [nullAddress], })
  };
}

module.exports = {
  methodology: "TVL consists of the sum of the balances of the Sherpa Cash privacy pools.",
  avax: {
    tvl: getNativeTVL(ETHSherpaContracts, "avax"),
  },
};
