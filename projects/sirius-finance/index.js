/*==================================================
  Modules
  ==================================================*/
const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require("../helper/staking");
const { Chain, CoinGeckoID, Pools, SRS, VotingEscrow } = require("./constants");

/*==================================================
  TVL
  ==================================================*/
let o;
let ts;
async function tvl(timestamp, _block, { astar: block }) {
    const toa = []

    for ([o, ts] of Object.entries(Pools))
        ts.forEach(t => toa.push([t, o]))
    return sumTokens2({ chain: Chain, block, tokensAndOwners: toa, })
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    misrepresentedTokens: true,
        methodology: "All locked tokens includes stable and crypto assets in Sirius's pools.",
    astar: {
        start: 1650117600, // 2022/04/16 14:00 UTC
        tvl, // tvl adapter
        staking: staking(VotingEscrow, SRS, Chain, CoinGeckoID, 18),
    },
};
