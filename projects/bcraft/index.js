const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const clans = "0x0De0D0cF717af57D2101F6Be0962fA890c1FBeC6"
async function tvl(time, ethBlock, _b, { api}) {
    return sumTokens2({ tokens: [nullAddress], owner: clans, api })
}

module.exports = {
    methodology: `We count the ETH on ${clans}`,
    base: {
        tvl: tvl
    }
}