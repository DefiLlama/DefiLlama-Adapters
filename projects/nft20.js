const ADDRESSES = require('./helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const axios = require("axios")
const { staking } = require("./helper/staking");

const MUSE = "0xb6ca7399b4f9ca56fc27cbff44f4d2e4eef1fc81";
const stkMUSE = "0x9cfc1d1a45f79246e8e074cfdfc3f4aacdde8d9a";
const MUSE_ETH_univ2 = '0x20d2c17d1928ef4290bf17f922a10eaa2770bf43'
const MUSE_ETH_univ2_staking = '0x193b775af4bf9e11656ca48724a710359446bf52'

const abi = {
  uni_v2_getPair: "function getPair(address, address) view returns (address)",
  uni_v3_getPool: "function getPool(address, address, uint24) view returns (address)",
}
const nft20_rest_api_base = 'https://api.nft20.io/pools?perPage=2000&page=1'

const contracts = {
  ethereum: {
    nft20_rest_api: nft20_rest_api_base + '&network=0',
    uni_v2_factories: [
      '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f', // univ2_factory_ethereum, 
      '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac' // sushiv1_factory_ethereum
    ],
    weth: ADDRESSES.ethereum.WETH,
    univ3_factory: '0x1f98431c8ad98523631ae4a59f267346ea31f984',
    transform: addr => addr,
  }, 
  polygon: {
    nft20_rest_api: nft20_rest_api_base + '&network=1',
    uni_v2_factories: ['0xc35DADB65012eC5796536bD9864eD8773aBc74C4'], // sushiv1_factory_polygon
    weth: ADDRESSES.polygon.WETH_1,
    univ3_factory: [],
    transform: addr => `polygon:${addr}`,
  }
} 

function chainTvl(chain) {
  return async (timestamp, ethBlock, chainBlocks) => {
  // Define variables depending on chain
  const block = chainBlocks[chain]
  const {nft20_rest_api, uni_v2_factories, weth, univ3_factory, transform} = contracts[chain]

  // Retrieve pools using REST API
  let nft20_pools = (await axios.get(nft20_rest_api)).data.data // ?perPage=20&page=1&sortBy=pool_users
  const nft20_lp_usd_balance = nft20_pools.reduce((acc, p) => parseFloat(p['lp_usd_balance']) + acc, 0)
  sdk.log(`${chain}: nft20 pools count: ${nft20_pools.length}\n${chain}: nft20 usd balance of LP returned by API: ${(nft20_lp_usd_balance/1e6).toFixed(2)}M`)

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

  const LPs = [...uni_v2_LPs, ...uni_v3_LPs].filter(lp => lp.output !== ADDRESSES.null)
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

  const balances = {};
  sdk.util.sumMultiBalanceOf(balances, weth_LPs, true, transform);
  return balances
}
}

module.exports = {
  methodology: `TVL for NFT20 consists of the weth locked in LPs (uni_v2, uni_v3, sushi) of every NFT20 pool on mainnet and polygon.`, 
  ethereum:{
    tvl: chainTvl('ethereum'),
    staking: staking(stkMUSE, MUSE, "ethereum"), 
    pool2: staking(MUSE_ETH_univ2_staking, MUSE_ETH_univ2, "ethereum"), 
  },
  polygon: {
    tvl: chainTvl('polygon')
  }
}