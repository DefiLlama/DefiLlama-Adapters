const { getConfig } = require('../helper/cache')

const DEFINDEX_API_BASE_URL = 'https://api.defindex.com'
const DEFINDEX_VAIULTS_INFO_URL = `${DEFINDEX_API_BASE_URL}/vault/discover?network=mainnet`

async function tvl(api) {
    const res = await getConfig('defindex', DEFINDEX_VAIULTS_INFO_URL)
    const vaults = res.vaults
    for (const vault of vaults) {
        if (!vault.totalManagedFunds || vault.totalManagedFunds.length === 0) {
            continue
        }
        for (const fund of vault.totalManagedFunds) {
            const amount = fund.total_amount
            api.add(fund.asset, amount)
        }

    }
}

module.exports = {
  methodology: 'TVL is the sum of all assets managed by DeFindex vaults on Stellar, including idle funds and funds invested in yield strategies.',
  stellar: { tvl },
}