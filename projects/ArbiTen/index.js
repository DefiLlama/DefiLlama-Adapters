const contracts = require("./contracts.json");

const { masterchefExports, sumTokensExport } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");


module.exports = mergeExports([
  masterchefExports({ chain: 'arbitrum', masterchef: contracts.masterchef, nativeTokens: [contracts.WHEAT, contracts.arbiten, contracts._10SHARE], useDefaultCoreAssets: true,}),
  {
    arbitrum: {
      tvl: sumTokensExport({ owner: contracts.ironPool, tokens: [contracts.weth]}),
      staking: sumTokensExport({ owner: contracts.boardroom, tokens: [ contracts.arbiten, contracts._10SHARE], lps: ['0x653c1b00eb6d6039d27e0d8a6d1f337f98156a04', '0xc76ccfcb48c423127672bdb9c1d6c80d3f945295'], useDefaultCoreAssets: true, }),
    }
  },
])