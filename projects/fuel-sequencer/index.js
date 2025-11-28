const { queryV1Beta1 } = require("../helper/chain/cosmos");

const chain = "fuelsequencer";

async function fetchStakingPool() {
    const response = await queryV1Beta1({ chain, url: "staking/v1beta1/pool" });
    return response.pool;
}

// Appendix; not used in the main function, but useful additional metrics not exposed through DefiLlama
/*
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
// This function fetches all relevant metrics but they are not returned in standard DeFiLlama format
// The metrics are available for logging or custom display purposes
async function fetchAllMetrics() {
    const [pool, vestingAmount, validators, annualProvisions, stakingParams, mintParams] = await Promise.all([
        fetchStakingPool(),
        fetchVestingAmount(),
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

        // Amount Locked in Vesting
        vestingAmount,

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
*/

// Fetch all accounts with vesting and calculate locked vesting amount
async function fetchVestingAmount() {
    let totalVestingLocked = 0;
    let paginationKey = null;
    const currentTime = Math.floor(Date.now() / 1000);

    do {
        try {
            const response = await queryV1Beta1({
                chain,
                url: "auth/v1beta1/accounts",
                paginationKey,
            });

            const accounts = response.accounts || [];

            for (const account of accounts) {
                const accountType = account['@type'] || '';

                // Skip non-vesting accounts
                if (!accountType.includes('VestingAccount')) continue;

                // Handle multi-schedule vesting accounts
                if (accountType.includes('EthOwnedMultiContinuousVestingAccount') && account.infos) {
                    for (const info of account.infos) {
                        const locked = calculateLockedVesting(info, currentTime);
                        if (locked > 0) totalVestingLocked += locked;
                    }
                }
                // Handle single-schedule vesting accounts
                else if (account.vesting_account) {
                    const vestingAccount = account.vesting_account;
                    const startTime = Number(vestingAccount.start_time || 0);
                    const endTime = Number(vestingAccount.base_vesting_account?.end_time || 0);
                    const originalVesting = Number(vestingAccount.base_vesting_account?.original_vesting?.[0]?.amount || 0);

                    const locked = calculateLockedVesting({
                        original_vesting: [{ amount: originalVesting }],
                        start_time: startTime,
                        end_time: endTime
                    }, currentTime);
                    if (locked > 0) totalVestingLocked += locked;
                }
            }

            paginationKey = response.pagination?.next_key;
        } catch (error) {
            console.warn('Error fetching vesting accounts:', error.message);
            break;
        }
    } while (paginationKey);

    return totalVestingLocked;
}

// Calculate locked (unvested) amount for a single vesting schedule
function calculateLockedVesting(vestingInfo, currentTime) {
    const originalVesting = Number(vestingInfo.original_vesting?.[0]?.amount || 0);
    const startTime = Number(vestingInfo.start_time || 0);
    const endTime = Number(vestingInfo.end_time || 0);

    // Validate schedule
    if (originalVesting <= 0 || startTime >= endTime) return 0;

    // Calculate vested amount (what's already unlocked)
    let vestedAmount = 0;
    if (currentTime <= startTime) {
        vestedAmount = 0; // Not started
    } else if (currentTime >= endTime) {
        vestedAmount = originalVesting; // Fully vested
    } else {
        // Linear vesting
        const vestedTime = currentTime - startTime;
        const totalVestingTime = endTime - startTime;
        vestedAmount = Math.floor(originalVesting * (vestedTime / totalVestingTime));
    }

    // Return locked amount (original - vested)
    return originalVesting - vestedAmount;
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

async function vesting(api) {
    const vestingLocked = await fetchVestingAmount();

    // Add locked vesting tokens
    api.add("coingecko:fuel-network", vestingLocked / 1e9, { skipChain: true });
}

module.exports = {
    timetravel: false,
    methodology: "TVL represents total locked FUEL tokens (bonded + unbonding) on the Fuel Shared Decentralised Sequencer. Staking shows only actively bonded tokens. The Sequencer is a standalone Cosmos SDK chain where FUEL tokens from Fuel Ignition and Ethereum are bridged to participate in Tendermint PoS consensus for transaction ordering.",
    fuel: {
        tvl, // Bonded + Unbonding (total locked)
        staking, // Actively bonded tokens
        vesting, // Locked vesting tokens
    },
};
