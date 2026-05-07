const { getConfig } = require('../helper/cache');

async function getOraclePackages() {
    const raw = await getConfig('rho/oracle', 'https://v2.roaracle.app/records');

    return raw.map(entry => ({
        marketId: entry.oraclePackage.marketId,
        timestamp: entry.oraclePackage.timestamp,
        signature: entry.oraclePackage.signature,
        indexValue: entry.oraclePackage.indexValue,
    }));
}

module.exports = {
    getOraclePackages
};