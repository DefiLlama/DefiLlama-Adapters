const { get } = require('../helper/http')

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

async function tvl(api) {
  // generating a random number, so to grab a random smart-node from the network..
  let randomNode = nodes[Math.floor(Math.random() * nodes.length)]

  // grabbing the list of the pools from the HbarSuite DEX..
  let pools = await get(randomNode + '/pools/list')

  // looping through the pools, and grabbing the total liquidity of each pool.
  // every pool on HbarSuite DEX has $HSUITE as the base token, and the other token as the quote token.
  // so we grab the $HSUITE amount of each pool, and we multiply it by 2, as the total liquidity of the pool is the sum of the two tokens.
  // grabbing the list of the pools from the HbarSuite NFT-DEX..
  pools.forEach(i => api.addCGToken('hsuite', i.asset.pair.baseToken.amount * 2))
  let nft_pools = await get(randomNode + '/nft-pools/collections')
  nft_pools.forEach(i => api.addCGToken('hedera-hashgraph', +i.latest_statistics.stats.tvl.amount))
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'The calculated TVL is the current USD sum of all pools and nft-pools under HbarSuite Protocol.',
  hedera: {
    tvl
  },
}