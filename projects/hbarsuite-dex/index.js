const retry = require('async-retry');
const axios = require("axios");
const BigNumber = require("bignumber.js");

/*
 * HbarSuite is a decentralized network of features built on Hedera Hashgraph.
 * It is a suite of products that are built on top of the layer 1, 
 * relying on the security and speed of the Hedera network.
 * 
 * HbarSute Network relies entirely on HCS (Hedera Consensus Service) for its data storage, 
 * and HFS (Hedera File Service) for its file storage.
 * 
 * It also uses NFTs (Non-Fungible Tokens) to represent the Liquidity Providers' shares in the pools, 
 * storing the data on IPFS.
 */

// Listing the urls of the nodes that are used by HbarSuite to connect to the Hedera Mainnet.
const nodes = [
    'https://mainnet-sn1.hbarsuite.network',
    'https://mainnet-sn2.hbarsuite.network',
    'https://mainnet-sn3.hbarsuite.network',
    'https://mainnet-sn4.hbarsuite.network',
    'https://mainnet-sn5.hbarsuite.network',
    'https://mainnet-sn6.hbarsuite.network',
    'https://mainnet-sn7.hbarsuite.network',
    'https://mainnet-sn8.hbarsuite.network'
]

async function fetch() {
    // generating a random number, so to grab a random smart-node from the network..
    let randomNode = nodes[Math.floor(Math.random() * nodes.length)];

    // fetching the HSUITE price from coingecko...
    let hsuite_price = await retry(async bail => await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=hsuite&vs_currencies=usd'
    ));

    let hbar_price = await retry(async bail => await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd'
    ));

    // grabbing the list of the pools from the HbarSuite DEX..
    let pools = await retry(async bail => await axios.get(randomNode + '/pools/list'));
    
    // looping through the pools, and grabbing the total liquidity of each pool.
    // every pool on HbarSuite DEX has $HSUITE as the base token, and the other token as the quote token.
    // so we grab the $HSUITE amount of each pool, and we multiply it by 2, as the total liquidity of the pool is the sum of the two tokens.
    let tvl = pools.data.reduce(
        (accumulator, pool) => accumulator.plus(
            new BigNumber(pool.asset.pair.baseToken.amount).times(2)
        ),
        new BigNumber(0)
    ).times(hsuite_price.data['hsuite'].usd);

    // grabbing the list of the pools from the HbarSuite NFT-DEX..
    let nft_pools = await retry(async bail => await axios.get(randomNode + '/nft-pools/collections'));

    let nft_tvl = nft_pools.data.reduce(
        (accumulator, pool) => accumulator.plus(
            new BigNumber(pool.latest_statistics.stats.tvl.amount)
        ),
        new BigNumber(0)
    ).times(hbar_price.data['hedera-hashgraph'].usd);

    // returning the total liquidity of the pools, multiplied by the HBAR price..
    return (tvl.plus(nft_tvl).toString());
}

module.exports = {
    timetravel: false,
    methodology: 'The calculated TVL is the current USD sum of all pools and nft-pools under HbarSuite Protocol.',
    hedera: {
        tvl: fetch()
    },
    fetch
}