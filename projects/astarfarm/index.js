const sdk = require('@defillama/sdk')

const stakingContract = '0x992bad137Fc8a50a486B5C6375f581964b4A15FC'

module.exports = {
    astar: {
        tvl: async (ts, _block, { astar: block }) => {
            const { output: lockedAstar } = await sdk.api.abi.call({ target: stakingContract, block, abi: 'uint128:stakedV2', chain: 'astar' })
            return { 'astar': +lockedAstar / 1e18 }
        }
    }
}
