const { masterchefExports, sumTokensExport, } = require('../helper/unknownTokens');
const { mergeExports } = require("../helper/utils");

const masterChefCASH = "0xa4De1bCf1CBFc0d675c7a49Cd7d6aD132a35F15d";
const CASH = "0x654C908305021b2eaF881cEe774ECe1D2BCac5fc";

const masterChefSHARE = "0x18ac4eB45E3eE74bDeD0B97E0D08f2A3ca992F7e";
const SHARE = "0x0f96d8c1277BD75A251238af952A7A99Db1320E3";

const boardroom = "0x9D0047E9D09245cb18d2D3Ec7D48515A067086B1"
const nativeTokens = [CASH, SHARE]
const chain = 'arbitrum'

const lps = [
  '0x694c9e9d7778e2a9e4a0dc7d112141b130ebacd3',
  '0x85c4afd95c8dcea58fa608e34bf344a54647f84b',
]

module.exports = mergeExports([
  masterchefExports({ chain, nativeTokens, masterchef: masterChefCASH, useDefaultCoreAssets: true, lps, }),
  masterchefExports({ chain, nativeTokens, masterchef: masterChefSHARE, useDefaultCoreAssets: true, lps, }),
  {
    arbitrum: { staking:  sumTokensExport({ owner: boardroom, tokens: nativeTokens, lps, })}
  }
])