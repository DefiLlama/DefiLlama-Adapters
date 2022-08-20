/*==================================================
  Modules
  ==================================================*/
const { sumTokens } = require('../helper/unwrapLPs')
const { staking } = require("../helper/staking");
const { Chain, CoinGeckoID, Pools, SRS, VotingEscrow } = require("./constants");
const { remap } = require("./lib");


/*==================================================
  TVL
  ==================================================*/
let o;
let ts;
async function tvl(timestamp, _block, { astar: block }) {
    const toa = []

    for ([o, ts] of Object.entries(Pools))
        ts.forEach(t => toa.push([t, o]))

    return remap(await sumTokens({}, toa, block, Chain));
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
    misrepresentedTokens: true,
    timetravel: true,
    methodology: "All locked tokens includes stable and crypto assets in Sirius's pools.",
    astar: {
        start: 1650117600, // 2022/04/16 14:00 UTC
        tvl, // tvl adapter
        staking: staking(VotingEscrow, SRS, Chain, CoinGeckoID, 18),
    },
};
