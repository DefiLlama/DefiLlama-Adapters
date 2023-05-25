const { request } = require("graphql-request");

// add chain deployments and subgraph endpoints here
const supportedChains = {
    polygon: {
        subgraphEndpoint: 'steer-protocol-polygon'
    },
    arbitrum: {
        subgraphEndpoint: 'steer-protocol-arbitrum'
    },
    // optimism: {
    //     subgraphEndpoint: 'steer-protocol-optimism'
    // },
    
}

const graphURLBaseEndpoint = 'https://api.thegraph.com/subgraphs/name/steerprotocol/'

// @note will need upgraded logic when scaling to more than 1000 vaults
const query = `{
    vaults(first: 1000) {
        totalAmount0
        totalAmount1
        fees1
        fees0
        accruedStrategistFees0
        accruedStrategistFees1
        token0
        token1
    }
}`

module.exports = {
    // @todo update to call vault.snapshot for time deterministic
    timetravel: false,
};

Object.keys(supportedChains).forEach(chain => {
    module.exports[chain] = {
        tvl: async (timestamp, blockHeight, miscBlockHeight, { api, }) => {
            const data = await request(graphURLBaseEndpoint + supportedChains[chain].subgraphEndpoint, query)
            const vaults = data.vaults.map((vault) => 
            ({
                totalToken0: (parseInt(vault.totalAmount0) + parseInt(vault.fees0) + parseInt(vault.accruedStrategistFees0)),
                totalToken1: (parseInt(vault.totalAmount1) + parseInt(vault.fees1) + parseInt(vault.accruedStrategistFees1)),
                token0: vault.token0,
                token1: vault.token1,
            }));
            vaults.forEach(vaultInfo => {
                api.add(vaultInfo.token0, vaultInfo.totalToken0)
                api.add(vaultInfo.token1, vaultInfo.totalToken1)
            });
        }
    }
})

