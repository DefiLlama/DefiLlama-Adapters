const sdk = require('@defillama/sdk')

const stakingContract = '0x992bad137Fc8a50a486B5C6375f581964b4A15FC'

module.exports = {
    astar: {
        tvl: async (api) => {
            const locked = await api.call({  abi: 'uint128:stakedV2', target: stakingContract})
            api.addGasToken(locked)
        }
    }
}
