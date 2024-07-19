const { staking } = require('../helper/staking')

const CHAIN = "smartbch"

// token contract
const CLY = "0x7642df81b5beaeeb331cc5a104bd13ba68c34b91"

module.exports = {
        methodology: "Staked CLY tokens are counted towards staking metric",
    smartbch: {
        tvl: () => ({}),
        staking: staking(CLY, CLY, CHAIN, "celery", 18),
    },
}
