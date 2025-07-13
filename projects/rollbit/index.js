const { staking } = require('../helper/staking')
module.exports = {
    methodology: "Staking counts the RLB tokens locked in rollbot contract for lottery",
    ethereum: {
        tvl: () => ({}),
        staking: staking('0x772D8d6e4A4a5251d7a174e3F60E3F954B386aF0', '0x046EeE2cc3188071C02BfC1745A6b17c656e3f3d'),
    },
};
