const { sumTokens2, } = require("../helper/solana")
const ADDRESSES = require("../helper/coreAssets.json");

const ADDRESSES_solana_ESF = 'BzMWbt7ko3P8c457gzxuBCCt6q73sJyG98nQNeTfcCom';
const ADDRESSES_solana_LP_ESF_SOL = '7wTChQDj3KG4kHXYjWrPw5bWUkKzNpJySU5CABEkHogv';

async function staking() {
    const tokensAndOwners = [
            ADDRESSES.solana.USDC,
            ADDRESSES.solana.SOL,
            ADDRESSES.solana.USDT,
            ADDRESSES_solana_ESF,
            ADDRESSES_solana_LP_ESF_SOL,
        ];

    return async () => {
        return sumTokens2({
            tokensAndOwners
        });
    };
}

module.exports = {
    timetravel: false,
    solana: {
        tvl: () => ({}),
        staking
    }
}