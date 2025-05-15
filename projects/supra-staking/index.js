const sdk = require("@defillama/sdk");
const {
    invokeViewFunction,
} = require("../helper/chain/supra");
const { transformBalances } = require("../helper/portedTokens");

const SUPRA_COIN_INFO_STRUCT_TYPE = "0x1::supra_coin::SupraCoin"
const STAKING_POOL_MODULE_ADDRESS = "0x9d8ed683cfe28c658df277f9f326dcd987fb553905e4e3f079ff70eac5d18bba"
const STAKING_POOL_STAKED_DATA_FUNCTION_TYPE = `${STAKING_POOL_MODULE_ADDRESS}::ValidatorPoolManager::get_validators_staked_data`;

const calculateSupraStakingTVL = async (api) => {
    let balances = {};
    let chain = api.chain;
    let data = await invokeViewFunction(
        STAKING_POOL_STAKED_DATA_FUNCTION_TYPE,
        [],
        [STAKING_POOL_MODULE_ADDRESS]
    );

    for (const item of data[1]) {
        sdk.util.sumSingleBalance(balances, SUPRA_COIN_INFO_STRUCT_TYPE, item[0]);
    }
    return transformBalances(chain, balances);
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    supra: {
        tvl: calculateSupraStakingTVL,
    },
};