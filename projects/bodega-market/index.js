const { sumTokens2 } = require("../helper/chain/cardano")
const { get } = require("../helper/http")
const V2_MARKET_CREATION_SCRIPT_ADDRESS = 'addr1xy397mvr7dcm9a0jlevdh78d2vxse5upewend0m76rkw6ch5rawx2k37hx9mjk6pr0n0fg4rp7sswpv7pywfpvvuj6ks3rknx4'
const V2_MARKET_POSITIONS_SCRIPT_ADDRESS = 'addr1x99yh3eglqg320ee4yeefvafc7h9fk7khk8xwp5hqcq524l5rawx2k37hx9mjk6pr0n0fg4rp7sswpv7pywfpvvuj6ksj58rfr'
const BODEGA_TOKEN = 'cardano:5deab590a137066fef0e56f06ef1b830f21bc5d544661ba570bdd2ae424f44454741'

async function tvl() {
    return sumTokens2({ owners: [V2_MARKET_CREATION_SCRIPT_ADDRESS, V2_MARKET_POSITIONS_SCRIPT_ADDRESS] })
}

async function stake() {
    const stakedTokens = (await get('https://beta.bodegamarket.io/api/staking/getInfo')).info.totalLiveStake
    return {
        [BODEGA_TOKEN]: stakedTokens
    };
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl,
        staking: stake
    }
}