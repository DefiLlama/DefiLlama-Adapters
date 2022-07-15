const { sumTokens2 } = require('../helper/unwrapLPs')
const { getPoolInfo, } = require('../helper/masterchef')
const { staking, } = require('../helper/staking')
// Enso finance TVL lies for now in the index tokens held by the liquidityMigration contracts
const strategyX = '0xA5365f2E77bCe1cb2D42F5c808012C01b1548d3C'
const dao = '0x3F3b7DF206E5348Aed67010A1824FCfEc94c2dFb';
const chain = 'fantom'

async function tvl(timestamp, _block, { harmony: block }) {
    const masterChef = '0xA1d93770F2980D5743b71B0DF17b6046ae865195';
    const standardPoolInfoAbi = { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "poolInfo", "outputs": [{ "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, { "internalType": "uint256", "name": "allocPoint", "type": "uint256" }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, { "internalType": "uint256", "name": "accWeVEPerShare", "type": "uint256" }], "stateMutability": "view", "type": "function" }
    const poolInfo = await getPoolInfo(masterChef, block, chain, standardPoolInfoAbi)
    // const poolInfoDao = await getPoolInfo(dao, block, chain, standardPoolInfoAbi)
    const toa = poolInfo.map(i => [i.output[0], masterChef])
    return sumTokens2({ chain, block, blacklistedTokens: [strategyX], tokensAndOwners: toa, resolveLP: true })
}

module.exports = {
    fantom: {
        tvl,
        staking: staking(dao, strategyX, chain)
    }
};
