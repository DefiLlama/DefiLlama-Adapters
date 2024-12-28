const sdk = require('@defillama/sdk');
const { compoundExports2 } = require('../helper/compound')
const { generalizedChainExports } = require('../helper/exports')

let allControllers = {
  ethereum: ["0x8B53Ab2c0Df3230EA327017C91Eb909f815Ad113"],
  bsc: ["0x0b53E608bD058Bb54748C35148484fD627E6dc0A"],
  arbitrum: ["0x8E7e9eA9023B81457Ae7E6D2a51b003D421E5408"],
  optimism: ["0xA300A84D8970718Dac32f54F61Bd568142d8BCF4"],
  polygon: ["0x52eaCd19E38D501D006D2023C813d7E37F025f37"],
  conflux: ["0xA377eCF53253275125D0a150aF195186271f6a56"],
  base: ["0xBae8d153331129EB40E390A7Dd485363135fcE22"],
};

const excludeAlliTokens = {
  ethereum: [
    "0x1AdC34Af68e970a93062b67344269fD341979eb0", // iUSX
    "0x44c324970e5CbC5D4C3F3B7604CbC6640C2dcFbF", // iEUX
  ],
  // Optimism
  optimism: [
    "0x7e7e1d8757b241Aa6791c089314604027544Ce43", // iUSX
  ],
  // BNB-Chain
  bsc: [
    "0x7B933e1c1F44bE9Fb111d87501bAADA7C8518aBe", // iUSX
    "0x983A727Aa3491AB251780A13acb5e876D3f2B1d8", // iEUX
  ],
  // Polygon
  polygon: [
    "0xc171EBE1A2873F042F1dDdd9327D00527CA29882", // iUSX
    "0x15962427A9795005c640A6BF7f99c2BA1531aD6d", // iEUX
  ],
  // Arbitrum
  arbitrum: [
    "0x0385F851060c09A552F1A28Ea3f612660256cBAA", // iUSX
    "0x5675546Eb94c2c256e6d7c3F7DcAB59bEa3B0B8B", // iEUX
  ],
  conflux: [
    "0x6f87b39a2e36F205706921d81a6861B655db6358" // iUSX
  ],
  base: [
    "0x82AFc965E4E18009DD8d5AF05cfAa99bF0E605df", // iUSX  
  ],
};

function getLendingTvl(chain, borrowed) {
  const controllers = allControllers[chain]
  const blacklistedTokens = excludeAlliTokens[chain]

  const res = controllers.map(comptroller => compoundExports2({
    comptroller, abis: { getAllMarkets: 'address[]:getAlliTokens' }, blacklistedTokens,
  })).map(i => borrowed ? i.borrowed : i.tvl)
  return sdk.util.sumChainTvls(res)
}

function chainTvl(chain) {
  return {
    tvl: getLendingTvl(chain, false),
    borrowed: getLendingTvl(chain, true),
  };
}


module.exports = {
  ...generalizedChainExports(chainTvl, Object.keys(allControllers)),
  start: '2019-07-26', // Jul-27-2019 02:17:24 AM +UTC
}
