const { queryV1Beta1 } = require("../helper/chain/cosmos");

const chain = "fuelsequencer";

async function fetchStakingPool() {
    const response = await queryV1Beta1({ chain, url: "staking/v1beta1/pool" });
    return response.pool;
}

async function fetchValidators() {
    const validators = [];
    let paginationKey = null;

    do {
        const response = await queryV1Beta1({
            chain,
            url: "staking/v1beta1/validators",
            paginationKey,
        });
        validators.push(...(response.validators || []));
        paginationKey = response.pagination?.next_key;
    } while (paginationKey);

    return validators;
}

async function fetchAnnualProvisions() {
    const response = await queryV1Beta1({ chain, url: "mint/v1beta1/annual_provisions" });
    return response.annual_provisions;
}

async function fetchStakingParams() {
    const response = await queryV1Beta1({ chain, url: "staking/v1beta1/params" });
    return response.params;
}

async function fetchMintParams() {
    const response = await queryV1Beta1({ chain, url: "mint/v1beta1/params" });
    return response.params;
}

// Fetch all on-chain metrics
// This function fetches all required metrics but they are not returned in standard DeFiLlama format
// The metrics are available for logging or custom display purposes
async function fetchAllMetrics() {
    const [pool, validators, annualProvisions, stakingParams, mintParams] = await Promise.all([
        fetchStakingPool(),
        fetchValidators(),
        fetchAnnualProvisions(),
        fetchStakingParams(),
        fetchMintParams(),
    ]);

    const activeValidators = validators.filter(v => v.status === "BOND_STATUS_BONDED");
    const validatorNames = activeValidators.map(v => ({
        moniker: v.description?.moniker || "Unknown",
        operatorAddress: v.operator_address,
        tokens: v.tokens,
        commission: v.commission?.commission_rates?.rate,
    }));

    return {
        // Amount Bonded to the Sequencer
        bondedAmount: pool.bonded_tokens,
        notBondedAmount: pool.not_bonded_tokens,

        // Number of Validators and Validator Names
        totalValidators: validators.length,
        activeValidators: activeValidators.length,
        validatorNames,

        // Emissions Per Year (Annual Provisions)
        annualProvisions,

        // Staking Module Parameters
        stakingParams: {
            unbondingTime: stakingParams.unbonding_time,
            maxValidators: stakingParams.max_validators,
            maxEntries: stakingParams.max_entries,
            historicalEntries: stakingParams.historical_entries,
            bondDenom: stakingParams.bond_denom,
            minCommissionRate: stakingParams.min_commission_rate,
        },

        // Mint Module Parameters
        mintParams: {
            mintDenom: mintParams.mint_denom,
            inflationRateChange: mintParams.inflation_rate_change,
            inflationMax: mintParams.inflation_max,
            inflationMin: mintParams.inflation_min,
            goalBonded: mintParams.goal_bonded,
            blocksPerYear: mintParams.blocks_per_year,
        },
    };
}

async function tvl(api) {
    const pool = await fetchStakingPool();
    const bondedAmount = pool.bonded_tokens || "0";
    const notBondedAmount = pool.not_bonded_tokens || "0";

    // Total locked value (bonded + unbonding)
    const totalLocked = Number(bondedAmount) + Number(notBondedAmount);
    api.add("coingecko:fuel-network", totalLocked / 1e9, { skipChain: true });
}

async function staking(api) {
    const pool = await fetchStakingPool();
    const bondedAmount = pool.bonded_tokens || "0";

    // Only actively staked/bonded tokens
    api.add("coingecko:fuel-network", Number(bondedAmount) / 1e9, { skipChain: true });
}

module.exports = {
    timetravel: false,
    methodology: "TVL represents total locked FUEL tokens (bonded + unbonding) on the Fuel Decentralised Sequencer. Staking shows only actively bonded tokens. The sequencer is a standalone Cosmos SDK chain where FUEL tokens from Fuel Ignition and Ethereum are bridged to participate in Tendermint PoS consensus for transaction ordering.",
    fuel: {
        tvl, // Bonded + Unbonding (total locked)
        staking, // Actively bonded tokens
    },
};
