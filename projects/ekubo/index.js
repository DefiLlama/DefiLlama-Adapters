const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens } = require('../helper/chain/starknet')

const market = '0x00000005dd3d2f4429af886cd1a3b08289dbcea99a294197e9eb43b0e0325b4b'

const assets = [
    ADDRESSES.starknet.WBTC,
    ADDRESSES.starknet.ETH,
    ADDRESSES.starknet.USDC,
    ADDRESSES.starknet.DAI,
    ADDRESSES.starknet.USDT,
]

async function tvl(_, _1, _2, { api }) {
    return sumTokens({ api, owner: market, tokens: assets })
}

module.exports = {
    methodology: 'Value of LP in the DEX, includes LPs that are out of range and thus not providing active liquidity',
    starknet: {
        tvl
    },
}