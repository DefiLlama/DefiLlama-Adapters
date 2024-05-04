const { sumTokens2 } = require("../helper/unwrapLPs")
const ALB = "0x1dd2d631c92b1acdfcdd51a0f7145a50130050c4";
const esALB = "0x365c6d588e8611125De3bEA5B9280C304FA54113"


async function tvl(api) {
    const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: ALB,
        params: [esALB],
        chain: 'base'
    })

    api.add(ALB, balance)
    return sumTokens2({ api, resolveLP: true })
}

module.exports = {
    misrepresentedTokens: true,
    methodology: `Fetch the currently locked ALB in the esALB contract`,
    base: {
        tvl
    }
};