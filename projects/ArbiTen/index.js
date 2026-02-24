const contracts = {
    "weth": "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    "_10SHARE": "0xc8a1c0D8255bc2eB5f6236e119E3428FD0c33A74",
    "boardroom": "0xCa262a493aA4FBA5c6913c6FC3AD0bC724f37A2E",
    "masterchef": "0xd3f9f6D52f46BF047388FA0EA19F9e671eaD080a",
    "ironPool": "0x9388160a6f9F3B58Ac95A50A4B58Cd3034535790",
    "arbiten": "0x3e6b3021Dab44dEbf93091030DbFCBdf52464Afe",
    "WHEAT": "0x384f5698aB5B73470F8741b38aD4ABBC84F3fCC1"
  };

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