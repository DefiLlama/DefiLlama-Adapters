const { masterchefExports, sumTokensExport } = require('../helper/unknownTokens')
const { mergeExports } = require('../helper/utils')

const MASTER_CHEF_CONTRACT = "0x2c8BBd2cecC77F2d18A04027Cc03CDB8Ab103214"
const NATIVE_TOKEN = "0x6386704cD6f7A584EA9D23cccA66aF7EBA5a727e"
const NATIVE_LP_TOKEN = "0x1B044593a78E374bD0E558Aa6633D2ff13fD5Bb7"
const SPARKLER_CONTRACT = "0x7b1C460d0Ad91c8A453B7b0DBc0Ae4F300423FFB"

const chefExport = masterchefExports({ chain: 'pulse', masterchef: MASTER_CHEF_CONTRACT, nativeToken: NATIVE_TOKEN, lps: [NATIVE_LP_TOKEN], useDefaultCoreAssets: true, })
delete chefExport.staking

module.exports =  mergeExports([chefExport, {
  pulse: {
    tvl: () => ({}),
    pool2: sumTokensExport({ owner: SPARKLER_CONTRACT, tokens: [NATIVE_LP_TOKEN], useDefaultCoreAssets: true,}),
    staking: sumTokensExport({ owners: [SPARKLER_CONTRACT, MASTER_CHEF_CONTRACT,], tokens: [NATIVE_TOKEN], useDefaultCoreAssets: true, lps: [NATIVE_LP_TOKEN]}),
  }
}])
