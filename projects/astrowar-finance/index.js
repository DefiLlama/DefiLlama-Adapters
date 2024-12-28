const { sumTokens } = require('../helper/unwrapLPs')
const { getPoolInfo, } = require('../helper/masterchef')
// Enso finance TVL lies for now in the index tokens held by the liquidityMigration contracts

async function tvl(timestamp, _block, { harmony: block }) {
    const stakePool = '0x1B7084DD5A3874C7DE8ff3e7AA668290f0613Afb';
    const masterChef = '0x50bca04eb01e4B66cBb04dcdFA872D23942D0B00';
    const standardPoolInfoAbi = 'function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardBlock, uint256 accWeVEPerShare)'
    const chain = 'harmony'
    const poolInfo = await getPoolInfo(masterChef, block, chain, standardPoolInfoAbi)
    const toa = poolInfo.map(i => [i.output[0], stakePool])
    return sumTokens({}, toa, block, chain)
}

module.exports = {
    deadFrom: 1650564340,
    hallmarks: [
        [1650412800, "Rug Pull"]
    ],
    harmony: {
        tvl
    }
};