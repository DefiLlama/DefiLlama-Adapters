const { getConfig } = require('../helper/cache')
const { callSoroban } = require('../helper/chain/stellar')

const DEFINDEX_VAULTS_INFO_URL = 'https://api.defindex.io/vault/discover?network=mainnet'

async function tvl(api) {
    const res = await getConfig('defindex', DEFINDEX_VAULTS_INFO_URL)
    const vaultAddresses = res?.vaults?.map(v => v.address) || []

    for (const vault of vaultAddresses) {
        const funds = await callSoroban(vault, 'fetch_total_managed_funds')
        for (const fund of funds) {
            if (fund.asset && fund.total_amount != null) {
                api.add(fund.asset, fund.total_amount.toString())
            }
        }
    }
}

module.exports = {
    methodology: 'TVL is the sum of all assets managed by DeFindex vaults on Stellar, fetched on-chain via Soroban RPC simulation of each vault contract.',
    stellar: { tvl },
}