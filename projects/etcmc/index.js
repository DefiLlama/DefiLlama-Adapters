const { getUniTVL } = require('../helper/unknownTokens');
const { staking } = require('../helper/unknownTokens')

const ETCPOW = '0x6c3B413C461c42a88160Ed1B1B31d6f7b02a1C83'
module.exports = {
  misrepresentedTokens: true,
  methodology: "Factory address (0x164999e9174686b39987dfB7E0FAb28465b867A5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  ethereumclassic: {
    tvl: getUniTVL({ factory: '0x164999e9174686b39987dfB7E0FAb28465b867A5', useDefaultCoreAssets: true, }),
    staking: staking({ tokensAndOwners: [[ETCPOW, '0xca1F5a20E07610d82e28683519c72f6817A3505a', ]], lps: ['0x730F59a8690b50724914D7b9b2f49a8dD18F5572'], useDefaultCoreAssets: true}),
  },
};
