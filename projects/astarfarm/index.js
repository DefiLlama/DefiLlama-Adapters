const abi = require("./abi.json");
const sdk = require('@defillama/sdk')

const stakingContract = '0x992bad137Fc8a50a486B5C6375f581964b4A15FC'

module.exports = {
    astar: {
        tvl: async (ts, _block, { astar: block }) => {
            const { output: lockedAstar } = await sdk.api.abi.call({ target: stakingContract, block, abi: abi.find(i => i.name === 'staked'), chain: 'astar' })
            return { 'astar': +lockedAstar / 1e18 }
        }
    }
}
