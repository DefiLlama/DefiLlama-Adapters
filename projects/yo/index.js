const { get } = require('../helper/http')

const EVM_API = 'https://api.yo.xyz/api/v1/vault/stats'
const SOLANA_API = 'https://api.yo.xyz/api/v1/solana/vault/stats'

async function evmTvl(api) {
    const { data } = await get(EVM_API)
    for (const v of data) {
        if (v.chain.name !== api.chain) continue
        api.add(v.asset.address, v.tvl.raw)
    }
}

async function solanaTvl(api) {
    const { data } = await get(SOLANA_API)
    for (const v of data) {
        api.add(v.asset.address, v.tvl.raw)
    }
}

module.exports = {
    methodology: "TVL is fetched from api.yo.xyz — /vault/stats for EVM and /solana/vault/stats for Solana. Each vault's TVL is attributed to its primary chain; secondary (cross-chain bridged) access points are excluded since the underlying assets live on the primary chain. Matches the figure displayed on app.yo.xyz.",
    base: { tvl: evmTvl },
    ethereum: { tvl: evmTvl },
    solana: { tvl: solanaTvl },
}
