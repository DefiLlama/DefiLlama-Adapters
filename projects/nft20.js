const sdk = require("@defillama/sdk")
const axios = require("axios")

const abi = {
  'uni_v2_getPair': {"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"}, 
  'uni_v3_getPool': {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
}
const nft20_rest_api_base = 'https://api.nft20.io/pools?perPage=2000&page=1'
eth = async (timestamp, block, chainBlocks) => tvl(timestamp, block, chainBlocks, 'ethereum') 
polygon = async (timestamp, block, chainBlocks) => tvl(timestamp, block, chainBlocks, 'polygon') 

async function tvl(timestamp, block, chainBlocks, chain) {
  // Define variables depending on chain
  let nft20_rest_api, uni_v2_factories, weth, univ3_factory, transform
  if (chain == 'ethereum') {
    nft20_rest_api = nft20_rest_api_base + '&network=0'
    uni_v2_factories = [
      '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', // univ2_factory_ethereum, 
      '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac' // sushiv1_factory_ethereum
    ]
    weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    univ3_factory = '0x1f98431c8ad98523631ae4a59f267346ea31f984'
    transform = addr => addr
  }
  else if (chain == 'polygon') {
    nft20_rest_api = nft20_rest_api_base + '&network=1'
    uni_v2_factories = ['0xc35DADB65012eC5796536bD9864eD8773aBc74C4'] // sushiv1_factory_polygon
    weth = '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'
    univ3_factory = []
    transform = addr => `polygon:${addr}`
  }

  // Retrieve pools using REST API
  let nft20_pools = (await axios.get(nft20_rest_api)).data.data // ?perPage=20&page=1&sortBy=pool_users
  const nft20_lp_usd_balance = nft20_pools.reduce((acc, p) => parseFloat(p['lp_usd_balance']) + acc, 0)
  console.log(`${chain}: nft20 pools count: ${nft20_pools.length}\n${chain}: nft20 usd balance of LP returned by API: ${(nft20_lp_usd_balance/1e6).toFixed(2)}M`)

  //nft20_pools_filtered = nft20_pools.filter(p => parseFloat(p['lp_usd_balance']) > 10000)
  //console.log('nft20_pools count above 10k$', nft20_pools_filtered.length)
  //nft20_pools.sort((a,b) => parseFloat(b['lp_usd_balance']) - parseFloat(a['lp_usd_balance']))

  // Get LPs addresses of UNI_v2 and SUSHI_v1 pools
  const calls_v2 = nft20_pools
    .filter(p => p.lp_version !== '3')
    .map(p => uni_v2_factories.map(factory => ({ 
      target: factory,
      params: [weth, p['address']] // No need to put them in the correct order
    }))).flat()
  const uni_v2_LPs = (
    await sdk.api.abi.multiCall({
      calls: calls_v2,
      abi: abi['uni_v2_getPair'],
      block,
      chain
    })
  ).output
  
  // Get LPs addresses of UNI_v3 pools
  const calls_v3 = nft20_pools
    .filter(p => p.lp_version === '3')
    .map((p, i) => ({
      target: univ3_factory,
      params: [weth, p.address, p.lp_fee] 
    }))
  const uni_v3_LPs = (
    await sdk.api.abi.multiCall({
      calls: calls_v3,
      abi: abi['uni_v3_getPool'],
      block,
      chain
    })
  ).output

  const LPs = [...uni_v2_LPs, ...uni_v3_LPs].filter(lp => lp.output !== '0x0000000000000000000000000000000000000000')
  const weth_LPs = (
    await sdk.api.abi.multiCall({
      calls: LPs.map(pool => ({
        target: weth,
        params: [pool.output] 
      })),
      abi: 'erc20:balanceOf',
      block,
      chain
    })
  )

  // Mainnet: v3: 150k / v2: 2M / v1: 1.5k | Polygon: almost zero tvl for now
  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, weth_LPs, true, transform);
  return balances
}

module.exports = {
  methodology: `TVL for NFT20 consists of the weth locked in LPs (uni_v2, uni_v3, sushi) of every NFT20 pool on mainnet and polygon.`, 
  ethereum:{tvl: eth},
  polygon: {tvl: polygon}
}
