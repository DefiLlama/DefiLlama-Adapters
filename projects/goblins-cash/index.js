const { graphQuery } = require("../helper/http");
const { toUSDTBalances } = require('../helper/balances');
const sdk = require('@defillama/sdk')

const contracts = {
    smartbch: {
        gob: "0x56381cb87c8990971f3e9d948939e1a95ea113a3",
        stakingContract: "0xfA3D02c971F6D97076b8405500c2210476C6A5E8",
        graph: "https://graph.dfd.cash/subgraphs/name/goblins/subgraph-v3",
    },
    bsc: {
        gob: "0x701aca29ae0f5d24555f1e8a6cf007541291d110",
        stakingContract: "0xb4d117f9c404652030f3d12f6de58172317a2eda",
        graph: "https://graph-bsc.goblins.cash/subgraphs/name/goblins/bsc-subgraph-v3",
    },
    base: {
        gob: "0xcdba3e4c5c505f37cfbbb7accf20d57e793568e3",
        stakingContract: "0x866932399DEBdc1694Da094027137Ebb85D97206",
        graph: "https://graph-base.goblins.cash/subgraphs/name/goblins/base-subgraph-v3",

    },
};


async function v3TvlPaged(chain) {
    const data1 = await graphQuery(contracts[chain].graph, `{
        pools{
        totalValueLockedUSD
        }
    }`)
    const total = data1.pools.reduce(
        (sum, item) => sum + parseFloat(item.totalValueLockedUSD),
        0
    );
    return toUSDTBalances(total)
}

async function getTokenUSDPrice(subgraphUrl, id) {
    try {
        const response = await graphQuery(subgraphUrl, `
            query {
                token(id: "${id}"){
                    id,
                    name,
                    volumeUSD,
                    totalValueLocked,
                    tokenDayData(orderBy: date  , orderDirection: desc){
                    open
                    date
                    }    
                }
            }`)

        const { token } = response
        return token?.tokenDayData[0]?.open
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
};

async function stakedToken(chain, stakingContract) {
    const abi = "function totalSupply() external view returns (uint)"
    const supply = await sdk.api.abi.call({
        target: stakingContract,
        abi,
        chain
    })

    const gobPrice = await getTokenUSDPrice(contracts[chain].graph, contracts[chain].gob)
    let amount = (supply.output.toString() / 10 ** 9) * gobPrice

    return toUSDTBalances(amount)
}

module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "TVL and staked GOB tokens towards staking",
    smartbch: {
        staking: async () => {
            return await stakedToken("smartbch", contracts.smartbch.stakingContract)
        },
        tvl: async () => {
            return await v3TvlPaged("smartbch")
        }
    },
    binance: {
        tvl: async () => {
            return await v3TvlPaged("bsc")
        },
        staking: async () => {
            return await stakedToken("bsc", contracts.bsc.stakingContract)
        },
    },
    base: {
        staking: async () => {
            return await stakedToken("base", contracts.base.stakingContract)
        },
        tvl: async () => {
            return await v3TvlPaged("base")
        }
    },
    start: '2024-07-07'
};
