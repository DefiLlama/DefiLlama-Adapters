const { masterChefExports, } = require("../helper/masterchef")


const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');
const axios = require('axios');
const { ethers } = require("ethers");
const Subgraphs = [
    { ethereum: 'https://api.thegraph.com/subgraphs/name/hats-finance/hats' },
    { polygon: 'https://api.thegraph.com/subgraphs/name/hats-finance/hats_polygon' },
    //{bsc:'https://api.thegraph.com/subgraphs/name/hats-finance/hats_bsc'},
    { arbitrum: 'https://api.thegraph.com/subgraphs/name/hats-finance/hats_arbitrum' },
    { optimism: 'https://api.thegraph.com/subgraphs/name/hats-finance/hats_optimism' }
]


const owner = '0x571f39d351513146248AcafA9D0509319A327C4D' // vault address
const token = "nulladdress";
const chain = 'ethereum'; // The chain the MasterChef contract is on

const masterChefTVL = masterChefExports(owner, chain, token);

async function tvlCheff(timestamp, block) {
    let balances = {};
    // Get the TVL from the MasterChef contract
    const chainBlocks = { ethereum: block };
    // Add the MasterChef TVL to the balances
    const masterChefBalances = await masterChefTVL[chain].tvl(timestamp, block, chainBlocks);
    for (let [key, value] of Object.entries(masterChefBalances)) {
        sdk.util.sumSingleBalance(balances, `${chain}:${key}`, new BigNumber(value).toFixed());
    }
    return balances;
}

async function tvl(timestamp, block) {
    let balances = {};


    // Define the GraphQL query
    const query = `
    {
        vaults {
            id
            pid
            name
            stakingToken
            honeyPotBalance
        }
    }
  `;

    // Send the query to your subgraph

    // Process the response
    for (let subgraph of Subgraphs) {
        const network = Object.keys(subgraph)[0]; // Get the network name
        const url = Object.values(subgraph)[0]; // Get the URL of the subgraph

        // Send the query to the subgraph
        const response = await axios.post(url, { query });

        // Process the response
        for (let vault of response.data.data.vaults) {
            // Convert the balance to a BigNumber and add it to the balances
            sdk.util.sumSingleBalance(balances, `${network}:${vault.stakingToken}`, new BigNumber(vault.honeyPotBalance).toFixed());
        }
    }

    return balances;
}



module.exports = {
    methodology: 'TVL counts the tokens deposited to the vaults on each chain',
    ethereum: {
        tvl: async (timestamp, block) => {
            const balances = await tvl(timestamp, block);
            const balancesCheff = await tvlCheff(timestamp, block);

            const combinedBalances = { ...balances };

            // Add the values from balancesCheff to combinedBalances
            for (const [key, value] of Object.entries(balancesCheff)) {
                if (combinedBalances[key]) {
                    combinedBalances[key] =  new BigNumber(combinedBalances[key]).plus(value).toFixed();

                } else {
                    combinedBalances[key] = value;
                }
            }
            // Filter the combined object to only include entries where the key starts with 'ethereum:'
            return Object.fromEntries(
                Object.entries(combinedBalances).filter(([key]) => key.startsWith('ethereum:'))
            );
        },
    },
    polygon: {
        tvl: async (timestamp, block) => {
            const balances = await tvl(timestamp, block);
            return Object.fromEntries(
                Object.entries(balances).filter(([key]) => key.startsWith('polygon:'))
            );
        },
    },
    arbitrum: {
        tvl: async (timestamp, block) => {
            const balances = await tvl(timestamp, block);
            return Object.fromEntries(
                Object.entries(balances).filter(([key]) => key.startsWith('arbitrum:'))
            );
        },
    },
    optimism: {
        tvl: async (timestamp, block) => {
            const balances = await tvl(timestamp, block);
            return Object.fromEntries(
                Object.entries(balances).filter(([key]) => key.startsWith('optimism:'))
            );
        },
    }
};
