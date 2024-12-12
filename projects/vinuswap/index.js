const { default: BigNumber } = require('bignumber.js')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens, nullAddress } = require('../helper/sumTokens')

// On-chain tokens
const TOKENS = {
    tether: {
        address: '0xC0264277fcCa5FCfabd41a8bC01c1FcAF8383E41',
        decimals: 6
    },
    ethereum: {
        address: '0xDd4b9b3Ce03faAbA4a3839c8B5023b7792be6e2C',
        decimals: 18
    },
    'vita-inu': {
        address: '0x00c1E515EA9579856304198EFb15f525A0bb50f6',
        decimals: 18
    },
    vinuchain: {
        address: nullAddress,
        decimals: 18
    }
}

// Deployed with an old contract
const V1_POOLS = [
    '0xa97FA6E9A764306107F2103a2024Cfe660c5dA33',
    '0x3424b0dd7715C8db92414DB0c5A9E5FA0D51cCb5',
    '0xfD763943f628e125CEE3D8d85DC0fc7098355d16',
    '0x8d713bC2d35327B536A8B2CCec9392e57C0D04B4',
    '0xd50ee26F62B1825d14e22e23747939D96746434c'
]

// v1.1 factory
const FACTORY = '0xd74dEe1C78D5C58FbdDe619b707fcFbAE50c3EEe'

async function tvl(api) {
    // VinuSwap is based on a variant of Uniswap v3, but the uniswap v3 helper doesn't work here

    const reverseTokenMapping = Object.fromEntries(
        Object.entries(TOKENS).map(([key, value]) => [value.address.toLowerCase(), key])
    )

    const logs = await getLogs({
        api,
        target: FACTORY,
        eventAbi: 'event PoolCreated(address indexed token0, address indexed token1, uint24 indexed fee, int24 tickSpacing, address feeManager, address pool)',
        fromBlock: 1
    })

    const pools = [...V1_POOLS, ...logs.map(log => log.args.pool)]

    const balances = await sumTokens({
        owners: pools,
        tokens: Object.values(TOKENS).map(token => token.address),
        logCalls: true,
        chain: 'vinu'
    })

    const adjustedBalances = {}

    for (const [compositeAddress, balance] of Object.entries(balances)) {
        const address = compositeAddress.split(':')[1].toLowerCase()
        const token = reverseTokenMapping[address]
        adjustedBalances[token] = BigNumber(balance).div(`1e${TOKENS[token].decimals}`).toString()
    }

    return adjustedBalances
}

module.exports={
    vinu: {
       tvl
    }
}