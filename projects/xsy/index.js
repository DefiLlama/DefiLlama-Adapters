const { sumTokens2 } = require('../helper/unwrapLPs')

const MANAGEMENT_CONTRACT = '0x9B9cF4f6255f6b451132Bdf7a3682c7299D4c77A'
const UTY_TOKEN = '0xDBc5192A6B6FfEe7451301bb4ec312f844F02B4A'
const USDC_TOKEN = '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E'
const AVAX_TOKEN = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
    // track total UTY supply
    const utyTotalSupply = await api.call({
        abi: 'erc20:totalSupply',
        target: UTY_TOKEN,
    })
    api.add(UTY_TOKEN, utyTotalSupply)

    // track other protocol assets (non-UTY tokens since UTY total supply is tracked above)
    await sumTokens2({
        api,
        tokensAndOwners: [
            // Management contract deposits awaiting conversion
            [USDC_TOKEN, MANAGEMENT_CONTRACT],
            [AVAX_TOKEN, MANAGEMENT_CONTRACT],
        ],
    })
}

module.exports = {
    methodology: 'TVL consists of total UTY token supply, USDC deposits in management contract awaiting conversion, USDC in DEX pools, and USDT in Euler vaults.',
    start: 58017291, // block when UTY contract was deployed
    avax: {
        tvl,
    }
}
