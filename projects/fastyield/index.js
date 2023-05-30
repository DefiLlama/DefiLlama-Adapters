const { stakings, } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unwrapLPs");
const { yieldHelper } = require("../helper/yieldHelper");
const { mergeExports } = require("../helper/utils");

const NATIVE_CONTRACT = "0xe5AFC91CEA5df74748A2b07e1d48E4e01aacF52B";
const FAST = '0x0299461ee055bbb6de11fafe5a0636a0c3bd5e8d'

const chain = 'fantom'
const fantomTvl = yieldHelper({
  chain,
  project: 'fastyield',
  nativeToken: FAST,
  masterchef: NATIVE_CONTRACT,
})

module.exports = mergeExports([fantomTvl, {
  fantom: {
    staking: stakings(['0x1Fb33cB822bD554890242F4765505FA6340B1Fb9'], FAST, chain),
    pool2: sumTokensExport({ chain, owners: ['0xc0c84eFeB8290BA5Ac6bed682Cfdf2896cf26566'], tokens: ['0xe836997c9f3665986580fe98f79999fa876fc271'], resolveLP: true, })
  }
}])
