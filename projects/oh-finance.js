const BigNumber = require("bignumber.js");
const { fetchURL } = require('./helper/utils')

async function fetch() {
  
    const tvla = await fetchURL('https://api.snowtrace.io/api?module=stats&action=tokensupply&contractaddress=0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB&apikey=7GBBD2GIED6XMWJ65TCQ8B4SGGSK6ZTMWG');
    const tvle = await fetchURL('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0xa528639AAe2E765351dcd1e0C2dD299D6279dB52&apikey=C5NDJA3ZN4JNDEHWMDBYTF6FC474DJYJH3');
            
           const eth_tvl = new BigNumber(tvle.data.result).div(10 ** 8).toFixed(2);
           const avax_tvl = new BigNumber(tvla.data.result).div(10 ** 8).toFixed(2);
           //console.log(eth_tvl);
           //console.log(avax_tvl);
           return (BigNumber.sum(eth_tvl,avax_tvl));

}

async function fetchEthereum() {
    const tvl = await fetchURL('https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0xa528639AAe2E765351dcd1e0C2dD299D6279dB52&apikey=C5NDJA3ZN4JNDEHWMDBYTF6FC474DJYJH3');
    //console.log(new BigNumber(tvl.data.result).div(10 ** 8).toFixed(2));
    return new BigNumber(tvl.data.result).div(10 ** 8).toFixed(2);
}

async function fetchAvax() {
    const tvl = await fetchURL('https://api.snowtrace.io/api?module=stats&action=tokensupply&contractaddress=0x8B1Be96dc17875ee01cC1984e389507Bb227CaAB&apikey=7GBBD2GIED6XMWJ65TCQ8B4SGGSK6ZTMWG');
    return new BigNumber(tvl.data.result).div(10 ** 8).toFixed(2);
}

module.exports = {
    ethereum: {
        fetch: fetchEthereum,
    },
    avax: {
        fetch: fetchAvax,
    },
    fetch
}
