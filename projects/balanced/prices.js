const axios = require("axios");

const getTokenStats = async () => {
    const stats = await axios.get('https://balanced.sudoblock.io/api/v1/stats/token-stats');
    return stats.data;
}

const getPrices = async () => {
    const tokenStats = await getTokenStats();
    const tokens = tokenStats.tokens;

    const bnUSDPrice = tokens && (parseInt(tokens.bnUSD.price, 16) / 10 ** 18);
    const sICXPrice = tokens && (parseInt(tokens.sICX.price, 16) / 10 ** 18);
    const ICXPrice = tokens && (parseInt(tokens.ICX.price, 16) / 10 ** 18);
    const USDSPrice = tokens && (parseInt(tokens.USDS.price, 16) / 10 ** 18);
    const IUSDCPrice = tokens && (parseInt(tokens.IUSDC.price, 16) / 10 ** 18);
    
    return {
        'bnUSD': bnUSDPrice,
        'sICX': sICXPrice,
        'ICX': ICXPrice,
        'USDS': USDSPrice,
        'IUSDC': IUSDCPrice
    }
}

module.exports = { getPrices };
