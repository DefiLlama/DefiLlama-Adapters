const { staking } = require("../helper/staking");
const { getUniTVL } = require('../helper/unknownTokens');

const contracts = {
  avax: {
    factory: "0xCFBA329d49C24b70F3a8b9CC0853493d4645436b",
    cnr: "0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf",
    stakingContract: "0x39124Af473501Ccd83a5791eA1eFBc2e6dd78f10",
  },
  scroll: {
    factory: "0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf",
  },
};

module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.avax.factory, }),
    staking: staking(contracts.avax.stakingContract, contracts.avax.cnr),
  },
  scroll:{
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: contracts.scroll.factory, }),
  },
}
