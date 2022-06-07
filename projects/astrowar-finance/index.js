const { sumTokens } = require('../helper/unwrapLPs')
const { getPoolInfo, } = require('../helper/masterchef')
// Enso finance TVL lies for now in the index tokens held by the liquidityMigration contracts

async function tvl(timestamp, _block, { harmony: block }) {
    const stakePool = '0x1B7084DD5A3874C7DE8ff3e7AA668290f0613Afb';
    const masterChef = '0x50bca04eb01e4B66cBb04dcdFA872D23942D0B00';
    const standardPoolInfoAbi = { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "accWeVEPerShare", "type": "uint256" }], "stateMutability": "view", "type": "function" }
    const chain = 'harmony'
    const poolInfo = await getPoolInfo(masterChef, block, chain, standardPoolInfoAbi)
    const toa = poolInfo.map(i => [i.output[0], stakePool])
    return sumTokens({}, toa, block, chain, undefined, { resolveLP: true })
}

module.exports = {
    deadFrom: 1650564340,
    harmony: {
        tvl
    }
};