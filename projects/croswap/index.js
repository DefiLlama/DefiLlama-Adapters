const { stakings } = require("../helper/staking");
const { gql, request } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");

const subgraphs = {
    cronos: "https://graph.croswap.com/subgraphs/name/croswap/croswap-v2",
    arbitrum: "https://arb1-graph.croswap.com/subgraphs/name/croswap/croswap-v2",
}

const stakingContracts = {
    cronos: [
      '0xedfe968033fd2b9a98371d052cd7f32a711e533a' // cros escrow pool
    ],
    arbitrum: [
      '0x8e9DA87f58A8480dD6b8878Aa37144a5Fb2F122D' // cros escrow pool
    ]
}

const cros = {
    cronos: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4',
    arbitrum: '0x780469101caBD2bFe4B596D98d4777C2a142e012'
}

const tvlQuery = gql`
    query get_tvl {
        uniswapFactories {
            totalLiquidityUSD
        }
    }
`

function getTvl(chain, graphUrl) {
    return async () => {
        const { uniswapFactories } = await request(graphUrl, tvlQuery)
        return toUSDTBalances(uniswapFactories[0].totalLiquidityUSD)
    }
}

module.exports = {
    methodology: 'Counts the tokens locked on AMM pools, pulling the data from the subgraph',
    timetravel: false,
    misrepresentedTokens: true,
}

for (const [chain, subgraph] of Object.entries(subgraphs)) {
    module.exports[chain] = {
        tvl: getTvl(chain, subgraph),
        staking: stakings(stakingContracts[chain], cros[chain], chain)
    }
}