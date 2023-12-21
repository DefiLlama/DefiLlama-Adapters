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

    // fetching the HBAR price from coingecko..
    let price_feed = await retry(async bail => await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd'
    ));

    // grabbing the list of the pools from the smart-node..
    let pools = await retry(async bail => await axios.get(randomNode + '/pools/list'));
    
    // looping through the pools, and grabbing the total liquidity of each pool..
    let tvl = pools.data.reduce(
        (accumulator, pool) => accumulator.plus(
            new BigNumber(pool.asset.value)
        ),
        new BigNumber(0)
    );

    // returning the total liquidity of the pools, multiplied by the HBAR price..
    return (tvl.times(price_feed.data['hedera-hashgraph'].usd).toNumber());
}

module.exports = {
  fetch
}