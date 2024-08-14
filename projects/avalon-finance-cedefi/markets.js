const abi = require("../helper/abis/avalon.json");

// @dev fetchMarketsData: call to get the reserve information for all markets. Call getPoolManagerReserveInformation for one market.
async function fetchMarketData(poolAddress, api) {
    const poolReserveInfo = await api.call({
        abi: abi.avalonCeDefi.getPoolManagerReserveInformation,
        target: poolAddress,
    });

    return poolReserveInfo;
}

module.exports = {
    fetchMarketData
}
