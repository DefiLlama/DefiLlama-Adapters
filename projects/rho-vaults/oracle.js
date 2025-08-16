const axios = require('axios');

async function getOraclePackages() {
    const response = await axios.get('https://v2.roaracle.app/records');
    const raw = response.data;

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