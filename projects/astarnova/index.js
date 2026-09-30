const { sumTokens2 } = require('../helper/unwrapLPs')

// the dashboard contract (0x63d3b2d066c1247245B31252441B3B6744e5BeB1, tvlOfPool) reverts on every RPC;
// each VaultFarm exposes its staking token and the total staked balance directly
const pools = [
    '0x2426F33359ef3BC6cb80104D3e2C81D81c790D6F',
    '0x3ad9F054454E948D0016aaa568D05b22CE1B7b37',
    '0xa573fd50404ffFa247Ea5B74ecC24EB9574300F0',
    '0xf1819937dE70179D0dcBf81dDBe372e5b5A4F1Fc',
    '0xe1bA9549DCf544c225BF7352803814fA8248F53F',
    '0x344fd0308a00db704b05Bd95760160C660787a38',
    '0x8b332a0EaEe5F774AfB344D39D1F643f2B98Db80',
    '0x5a28E0a888bf710248Ab27914168b2EB7F930cb8',
    '0x812A2EB0094aCB81337150E768De9CAbc13E1580',
    '0xd854566C787548172Ada3e17724045107b2412C3',
    '0x989f69D2C64E53f93DBfb5cE1eC62294f915Bc0C'
]

async function astar(api) {
    const tokens = await api.multiCall({ abi: 'address:stakingToken', calls: pools, permitFailure: true })
    const bals = await api.multiCall({ abi: 'uint256:balance', calls: pools, permitFailure: true })
    tokens.forEach((token, i) => { if (token && bals[i]) api.add(token, bals[i]) })
    return sumTokens2({ api, resolveLP: true })
}

module.exports = {
    astar: {
        tvl: astar
    },
}
