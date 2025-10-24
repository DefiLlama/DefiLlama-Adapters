const { sumTokens2 } = require('../helper/unwrapLPs')
const { uniV3Export } = require('../helper/uniswapV3')

// Rain.one RAIN token address on Arbitrum
const RAIN_TOKEN = "0x25118290e6a5f4139381d072181157035864099d"

// Non-circulating & treasury wallets
const NON_CIRCULATING_ADDRESSES = [
    "0x467D5Bf8Cfa1a5f99328fBdCb9C751c78934b725", // Sablier Vesting
    "0xc41A5462362f6AB4A878AE0Aac91b7259f7176A5", // Claim Presale Contract
]

// ---- Treasury TVL ----
async function vesting(api) {
    return sumTokens2({
        api,
        tokensAndOwners: [
            ...NON_CIRCULATING_ADDRESSES.map(addr => [RAIN_TOKEN, addr]),
        ],
    })
}

// ---- DEX TVLs ----
// Uniswap V3 (official factory)
const v3TVL = uniV3Export({
    arbitrum:{
        factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
        fromBlock: 377328276,
    }
})

async function tvl(api) {
    await v3TVL?.arbitrum?.tvl(api);
    return api.getBalances()
}

module.exports = {
    timetravel: true,
    misrepresentedTokens: false,
    methodology:
        "TVL includes RAIN tokens held in Rain.one’s vesting/presale contracts, and liquidity in Uniswap V3 pools on Arbitrum.",
    arbitrum: {
        tvl,
        vesting,
    },
}