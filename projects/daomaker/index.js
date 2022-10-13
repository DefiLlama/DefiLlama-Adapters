const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");
const contracts = require("./contracts.json");
const axios = require("axios");

const chainNames = {
    "1": "ethereum",
    "56": "bsc",
    "137": "polygon",
    "250": "fantom", 
    "42220": "celo"
}

async function fetchBalances(exports, contracts, transform, chainBlocks, chain) {
    if (!contracts[chain]) return 0;

    const balances = await sdk.api.abi.multiCall({
        calls: Object.keys(contracts[chain]).map(c => ({
            target: contracts[chain][c].tokenAddress,
            params: [ contracts[chain][c].tokenHolder ]
        })),
        abi: "erc20:balanceOf",
        block: chainBlocks[chain],
        chain
    });

    sdk.util.sumMultiBalanceOf(exports, balances, false, transform);
};

// node test.js projects/daomaker/index.js
function tvl(chain) {
    return async (timestamp, block, chainBlocks) => {
        const balances = {};
        const transform = await getChainTransform(chain);

        const clientVesting = await getVestingData();

        await fetchBalances(
            balances, 
            clientVesting, 
            transform, 
            chainBlocks, 
            chain
        );

        const clientFarms = await getFarmsData();

        await fetchBalances(
            balances, 
            clientFarms, 
            transform, 
            chainBlocks, 
            chain
        );

        return balances;
    };
};

async function getVestingData() {
    const vestingContracts = (await axios.get("https://api.daomaker.com/get-all-vesting-contracts")).data;

    const clientVesting = {};

    for (const vestingContract of vestingContracts) {
        if (!clientVesting[vestingContract.chain_name]) {
            clientVesting[vestingContract.chain_name] = {};
        }
        
        clientVesting[vestingContract.chain_name][vestingContract.vesting_smart_contract_address] = {
            tokenHolder: vestingContract.vesting_smart_contract_address,
            tokenAddress: vestingContract.token_address
        };
    }
    return clientVesting;
}

async function getFarmsData() {
    const data = (await axios.get("https://api.daomaker.com/get-all-farms")).data;

    const clientFarms = {};

    for (const project of data) {
        for (const farm of project.farms) {
            const chainName = chainNames[farm.chain_id];

            if (!clientFarms[chainName]) {
                clientFarms[chainName] = {};
            }

            clientFarms[chainName][farm.farm_address] = {
                tokenHolder: farm.farm_address,
                tokenAddress: farm.staking_address
            };
        }
    }

    return clientFarms;
}

const chainTVLObject = contracts.chains.reduce(
    (agg, chain) => ({ ...agg, [chain]: {
        tvl: tvl(chain)
    }}), {}
);

chainTVLObject.ethereum.staking = stakings(
    [ contracts.stakingContractEth ], 
    contracts.stakingTokenEth
);

module.exports = {
    ...chainTVLObject
};