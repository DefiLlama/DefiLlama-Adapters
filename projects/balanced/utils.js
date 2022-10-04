
const bnusdContract = 'cx88fd7df7ddff82f7cc735c871dc519838cb235bb';
const sicxContract = 'cx2609b924e33ef00b648a409245c7ea394c467824';
const usdsContract = 'cxbb2871f468a3008f80b08fdde5b8b951583acf06';
const iusdcContract = 'cxae3034235540b924dfcc1b45836c293dcc82bfb7';

const getPoolTVL = (hexBalance, quoteDecimals, price, shouldDouble) => {
    const tvl = parseInt(hexBalance, 16) * price / 10 ** quoteDecimals;
    return shouldDouble ? tvl * 2 : tvl; // get the whole pool value if it isn't ICX/sICX pool
}

const getQuoteAddress = (symbol) => {
    switch (symbol) {
        case 'sICX':
            return sicxContract;
        case 'USDS':
            return usdsContract;
        case 'IUSDC':
            return iusdcContract;
        default:
            return bnusdContract;
    }
}

module.exports = {
    getPoolTVL,
    getQuoteAddress
};