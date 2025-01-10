const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')
const { ethers } = require("ethers");

// Add your contract ABIs
const AGENT_FACTORY_ABI = [
    "function totalAgents() public view returns (uint256)",
    "function allAgentTokens(uint256) public view returns (address)"
];

const AGENT_TOKEN_ABI = [
    "function liquidityPools() external view returns (address memory [])"
];


// Add your contract addresses
const AGENT_FACTORY_ADDRESS = "0xF646CD43ba52bfF41CA0b5Ca5cc355142D02858a";

async function tvl(timestamp, block, chainBlocks, { api }) {
    const chain = "sonic";
    const balances = {};

    // Create contract instances
    const agentFactory = new ethers.Contract(
        AGENT_FACTORY_ADDRESS,
        AGENT_FACTORY_ABI,
        api.provider
    );

    // Get total number of agents
    const totalAgents = await agentFactory.totalAgents();

    // Initialize arrays to store pool addresses and token pairs
    const poolAddresses = [];
    const tokensAndOwners = [];

    // Iterate through all agent tokens
    for (let i = 0; i < Number(totalAgents); i++) {
        const agentTokenAddress = await agentFactory.allAgentTokens(i);

        const agentToken = new ethers.Contract(
            agentTokenAddress,
            AGENT_TOKEN_ABI,
            api.provider
        );

        // Get liquidity pools for each agent token
        const pools = await agentToken.liquidityPools();
        if (pools.length > 0) {
            const uniV2Pool = pools[0]; // Get the first pool (UniV2)
            poolAddresses.push(uniV2Pool);

            // Get tokens in the UniV2 pool
            const token0 = await api.call({
                target: uniV2Pool,
                abi: 'function token0() view returns (address)'
            });

            const token1 = await api.call({
                target: uniV2Pool,
                abi: 'function token1() view returns (address)'
            });

            // Add token pairs to be processed
            tokensAndOwners.push([token0, uniV2Pool]);
            tokensAndOwners.push([token1, uniV2Pool]);
        }
    }

    // Sum all tokens in the pools
    await sumTokens2({ api, tokensAndOwners });

    return balances;
}

module.exports = {
    methodology: "Calculates TVL by summing the value of all tokens in UniV2 liquidity pools associated with agent tokens",
    sonic: {
        tvl
    }
};