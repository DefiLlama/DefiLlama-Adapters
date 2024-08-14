// Defillama Adapter for Avalon Finance CeDeFi Market
const { fetchMarketData } = require('./markets');
const { avalonCeDefi, lfbtc } = require("./addresses");
const coreAssets  = require('../helper/coreAssets.json');

// @dev getMetrics: call to get the collateral and debt of the Avalon CeDefi pool contract.
const getMetrics = async (poolAddress, lfbtcAddress, usdtAddress, api, borrowed) => {
    try {
        const marketData = await fetchMarketData(poolAddress, api);
        const balanceOfCollateral = marketData.collateral;
        const balanceOfDebt = marketData.debt;

        api.add(lfbtcAddress, balanceOfCollateral);
        if (borrowed) {
            api.add(usdtAddress, balanceOfDebt);
        }
    } catch (error) {
        console.error("Error in getMetrics:", error);
        throw error;
    }
};

const ethereum = function (borrowed) {
    const poolAddress = avalonCeDefi.ethereum
    const lfbtcAddress = lfbtc.ethereum
    const usdtAddress = coreAssets.ethereum.USDT
    return async (api) => {
        return getMetrics(poolAddress, lfbtcAddress, usdtAddress, api, borrowed);
    }
};

module.exports = {
    methodology: `lfbtc collateral and USDT debt of Avalon CeDefi pool contract`,
    doublecounted: false,
    ethereum: {
        tvl: ethereum(false),
        borrowed: ethereum(true),
    }
};

// export LLAMA_DEBUG_MODE="true"
// node test.js projects/avalon-finance-cedefi/index.js
