const abi = require('./abi.json')

const config = {
    polygon: {
        vaultManager: '0x6008b366058B42792A2497972A3312274DC5e1A8',
    },
}

module.exports = {}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {
        tvl: async function (_, _1, _2, { api }) {
            // Stability Platform Vaults
            // Get all vaults
            const vaults = await api.call({
                abi: abi.vaultAddresses,
                target: config[chain].vaultManager
            });

            // Get strategy addresses
            const strategies = await api.multiCall({ abi: abi.strategy, calls: vaults, })

            // Get all assets amounts managed by strategies
            const assetsAmountsAll = await api.multiCall({ abi: abi.assetsAmounts, calls: strategies, })

            // Get summary balances
            const balances = {}
            for (const assetsAmounts of assetsAmountsAll) {
                for (let i = 0; i < assetsAmounts[0].length; i++) {
                    const asset = assetsAmounts[0][i]
                    if (balances[asset] === undefined) {
                        balances[asset] = 0
                    }
                    balances[asset] += +assetsAmounts[1][i]
                }
            }

            // Add data
            api.addTokens(Object.keys(balances), Object.keys(balances).map(asset => balances[asset]))            
          },
    }
})