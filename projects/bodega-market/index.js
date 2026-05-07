const { sumTokens2 } = require("../helper/chain/cardano")
const V2_MARKET_CREATION_SCRIPT_ADDRESS = 'addr1xy397mvr7dcm9a0jlevdh78d2vxse5upewend0m76rkw6ch5rawx2k37hx9mjk6pr0n0fg4rp7sswpv7pywfpvvuj6ks3rknx4'
const V2_MARKET_POSITIONS_SCRIPT_ADDRESS = 'addr1x99yh3eglqg320ee4yeefvafc7h9fk7khk8xwp5hqcq524l5rawx2k37hx9mjk6pr0n0fg4rp7sswpv7pywfpvvuj6ksj58rfr'
const V3_MARKET_CREATION_SCRIPT_ADDRESS = 'addr1x8x7nn5lch2uawxct2hjr06kgsplxu9rpm8gg9tyffv4u8agl7dv5f8n43cyguzxv2xu3vnqdynvj5nxu2yere25k4kqt4qep6'
const V3_MARKET_POSITIONS_SCRIPT_ADDRESS = 'addr1xx25vyyteavkeddsueufzr4ahgsa987fafvhv032tnmvg0dgl7dv5f8n43cyguzxv2xu3vnqdynvj5nxu2yere25k4kqf0df9x'

async function tvl() {
    return sumTokens2({ owners: [V2_MARKET_CREATION_SCRIPT_ADDRESS, V2_MARKET_POSITIONS_SCRIPT_ADDRESS, V3_MARKET_CREATION_SCRIPT_ADDRESS, V3_MARKET_POSITIONS_SCRIPT_ADDRESS] })
}

module.exports = {
    timetravel: false,
    cardano: {
        tvl,
    }
}
