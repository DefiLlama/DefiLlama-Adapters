const BigNumber = require("bignumber.js");
const axios = require("axios")

module.exports = {
    methodology: "Sums the total supplies of Spiko's issued tokens.",
};


const chains = [
    { key: 'ethereum', id: 1 },
    { key: 'polygon', id: 137 },
]


const getAllShareClasses = () => 
    axios.get('https://public-api.spiko.finance/v0/share-classes/')
    .then((res) => res.data);

const getNAV = async (shareClassSymbol, timestamp) => {
    const today = new Date(timestamp * 1000).toISOString().split('T')[0];
    const navToday = await axios.get(
        `https://public-api.spiko.finance/v0/net-asset-values/${shareClassSymbol}/${today}`,
        { validateStatus: (status) => status === 200 || status === 404 }
    );
    if (navToday.status === 200) return navToday.data;

    // If NAV for today is not available, try to get NAV for the day before
    return getNAV(shareClassSymbol, timestamp - 86400);
}

const navToUSD = async (nav) => {
    if (nav.amount.currency === 'USD') {
        return new BigNumber(nav.amount.value);
    }
    if (nav.amount.currency === 'EUR') {
        // fixme: use real exchange rate
        return new BigNumber(nav.amount.value);
    }
    throw new Error(`Unsupported currency: ${nav.amount.currency}`);
}

chains.forEach((chain) => {
    module.exports[chain.key] = {
        tvl: async (api) => {
            const shareClasses = await getAllShareClasses();
            
            for (const shareClass of shareClasses) {
                const tokens = shareClass.tokens.filter(token => token.chainId === chain.id);

                for (const token of tokens) {
                    const supply = await api.call({ target: token.address, abi: 'erc20:totalSupply' });
                    const nav = await getNAV(shareClass.symbol, api.timestamp);
                    const navInUSD = await navToUSD(nav);
                    const tvlInUSD = navInUSD.times(supply).div(10**shareClass.shareDecimals);
                    
                    api.add(shareClass.symbol, tvlInUSD.toNumber());
                }
            }
        }
    };
});
  