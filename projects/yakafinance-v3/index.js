const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
    sei: { tvl },
}

async function tvl(api) {
    // 1. get Hypervisor
    const hypervisors = await getConfig('yaka-finance/uni-v3-pools', undefined, {
        fetcher: async () => {

            const { data } = await get('https://backend.yaka.finance/api/v1/fusions')
            const validTypes = ['Wide', 'CL_Stable', 'Narrow', 'Correlated']
            const filteredHypervisors = data
                .filter(pool => validTypes.includes(pool.type))
                .map(pool => ({
                    hypervisor: pool.address, // Hypervisor
                    token0: pool.token0.address,
                    token1: pool.token1.address,
                    type: pool.type,
                }))
            console.log(`Yaka Finance Hypervisor total: ${filteredHypervisors.length}`)
            return filteredHypervisors

        },
        ttl: 3600, //1 Hour
    })

    // 2. get Algebra Pool
    const poolAddresses = await api.multiCall({
        abi: 'function pool() external view returns (address)',
        calls: hypervisors.map(h => h.hypervisor),
    })

    // 3. Sort out the Algebra Pool addresses and token pairs
    const ownerTokens = hypervisors.map((h, i) => [[h.token0, h.token1], poolAddresses[i]])

    // 4. TVL
    return sumTokens2({ api, ownerTokens })
}