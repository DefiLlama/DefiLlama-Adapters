const sdk = require("@defillama/sdk");
const { stakings } = require("../helper/staking");
const { getChainTransform } = require("../helper/portedTokens");
const contracts = require("./contracts.json");
const axios = require("axios");
const { pool2s } = require("../helper/pool2");

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

// node test.js projects/infinitypad/index.js
function tvl(chain) {
    return async (timestamp, block, chainBlocks) => {
        const balances = {};
        const transform = await getChainTransform(chain);

        const vestingContracts = (await axios.get("https://api.infinitypad.com/get-all-vesting-contracts")).data;
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

        await fetchBalances(
            balances, 
            clientVesting, 
            transform, 
            chainBlocks, 
            chain
        );

        return balances;
    };
};

const chainTVLObject = contracts.chains.reduce(
    (agg, chain) => ({ ...agg, [chain]: {tvl: tvl(chain) }}), {}
);

chainTVLObject.bsc.staking = stakings(
    [ contracts.stakingContractBsc ], 
    contracts.stakingTokenBsc,
    "bsc"
);

chainTVLObject.bsc.pool2 = pool2s(
    [ contracts.stakingContractBsc ], 
    [ contracts.stakingTokenLp ], 
    'bsc'
);

module.exports = {
    ...chainTVLObject
};