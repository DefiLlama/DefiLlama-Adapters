const web3 = require('./config/web3.js');
const BigNumber = require("bignumber.js");
const retry = require('./helper/retry')
const axios = require("axios");
const abis = require('./config/flamincome/abis.js');

async function fetch() {
    var price_feed = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,tether,wrapped-bitcoin&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'))

    async function returnUnderlyingBalance(address) {
        let contract = new web3.eth.Contract(abis['VaultBaseline'], address);
        let decimals = await contract.methods.decimals().call();
        let balance = await contract.methods.balance().call();
        balance = await new BigNumber(balance).div(10 ** decimals).toFixed(2);
        return parseFloat(balance);
    }

    var tvl = 0;

    // Staking and pool assets
    const stakingAssets = [
        { contract: '0x54bE9254ADf8D5c8867a91E44f44c27f0c88e88A', slug: 'tether' },
        { contract: '0x1a389c381a8242B7acFf0eB989173Cd5d0EFc3e3', slug: 'wrapped-bitcoin' },
        { contract: '0x1E9DC5d843731D333544e63B2B2082D21EF78ed3', slug: 'ethereum' },
    ]

    await Promise.all(stakingAssets.map(async (asset) => {
        let balance = await returnUnderlyingBalance(asset.contract);
        tvl += (parseFloat(balance) * price_feed.data[asset.slug].usd)
    }))

    return tvl
}

module.exports = {
    fetch
}




