const sdk = require("@defillama/sdk")
const axios = require("axios")
/*
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");
const {unwrapUniswapLPs} = require('../helper/unwrapLPs')
*/
const weth = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const univ2_factory = '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f'
const univ3_factory = '0x1f98431c8ad98523631ae4a59f267346ea31f984'
const sushiv1_factory = '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac'

const factory = sushiv1_factory 

async function tvl(timestamp, block, chainBlocks) {
  let nft20_pools = (await axios.get('https://api.nft20.io/pools?perPage=2000')).data.data // ?perPage=20&page=1&sortBy=pool_users

  // Filter out 
  nft20_lp_usd_balance = nft20_pools.reduce((acc, p) => parseFloat(p['lp_usd_balance']) + acc, 0)
  nft20_pools_filtered = nft20_pools.filter(p => parseFloat(p['lp_usd_balance']) > 10000)
  console.log('nft20_pools count above 10k$', nft20_pools_filtered.length)

  nft20_pools.sort((a,b) => parseFloat(b['lp_usd_balance']) - parseFloat(a['lp_usd_balance']))
  console.log('nft20 pools count', nft20_pools.length)
  console.log(`nft20 usd balance of LP returned by API: ${(nft20_lp_usd_balance/1e6).toFixed(2)}M`)
  //console.log(nft20_pools.slice(0,3).map(p => p['lp_usd_balance']))

  
  const uni_v2_LPs = (
    await sdk.api.abi.multiCall({
      calls: nft20_pools.map(p => [univ2_factory, sushiv1_factory].map(factory => ({
        target: factory,
        params: [weth, p['address']] // No need to put them in the correct order
      }))).flat(),
      abi: {"constant":true,"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"}],"name":"getPair","outputs":[{"internalType":"address","name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
      block,
      chain: 'ethereum'
    })
  ).output
  
  // v3: 1.35M / v2: 2.76M / v1: 1.35M
  const uni_v3_LPs = (
    await sdk.api.abi.multiCall({
      calls: nft20_pools.map(p => ({
        target: univ3_factory,
        params: [weth, p['address'], 0] // No need to put them in the correct order, and last argument is the fee
      })),
      abi: {"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint24","name":"","type":"uint24"}],"name":"getPool","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
      block,
      chain: 'ethereum'
    })
  ).output

  const LPs = uni_v2_LPs // uni_v3_LPs OR uni_v2_LPs;

  const balances = {};

  const weth_uni_v2 = (
    await sdk.api.abi.multiCall({
      calls: LPs.map(pool => ({
        target: weth,
        params: [pool.output] // No need to put them in the correct order
      })),
      abi: 'erc20:balanceOf',
      block,
      chain: 'ethereum'
    })
  )

  sdk.util.sumMultiBalanceOf(balances, weth_uni_v2);

  return balances
  /*
  address: '0x9d59eba4deaee09466ba9d4073bf912bc72982b0',
  nft: '0x57a204aa1042f6e66dd7730813f4024114d74f37',
  nft_type: '721',
  name: 'CyberKongz',
  symbol: 'KONGZ20',
  */
  // .slice(0,10)
  // realt_tokens = realt_tokens.slice(0,5)

  /*
  const calls_xdai = realt_tokens.map((token) => ({
    target: token['xDaiContract'],
  })).filter(t => t.target)
  
  const tokenSupplies_xdai = (
    await sdk.api.abi.multiCall({
      calls: calls_xdai,
      abi: 'erc20:totalSupply',
      block: chainBlocks['xdai'],
      chain: 'xdai'
    })
  ).output

  const tokenProperties = tokenSupplies_xdai.map((supply) => {
    const tokenContract = supply.input.target
    const token = realt_tokens.find(t => t['xDaiContract'] === tokenContract)
    return {
      'contract': tokenContract,
      'supply': supply.output,
      'tokenPrice': token['tokenPrice'],
      'propertyPrice': BigNumber(supply.output).div(1e18).times(BigNumber(token['tokenPrice']))
    }
  })

  // Accumulate to TVL in USD and log
  let tvl = tokenProperties.reduce(
    (acc, token) => acc.plus(BigNumber(token['propertyPrice'])), 
    BigNumber(0)
  ) 
  tvl = tvl.times(1e6).toFixed(0)
  console.log('Realt TVL:', tvl)
  return {[xdai_usdc]: tvl}
  */
}

module.exports = {
  methodology: `TVL for NFT20 consists of the LPs of every NFT20 pool`, 
  tvl
}



/*
// Some interesting properties returned by API
address	"0xd7ecc3b661eccb0b5f7deb09096504d28de58f49"
nft	"0x2c9ca0c1271522d6656f48db61efa499980bbe63"
nft_type	"1155"
name	"Ballin' PickHeads"
symbol	"PICK20"
lp_eth_balance	"0.1"
lp_usd_balance	"906.7040000000002"
nft_usd_price	"151.11733333333333"
nft_eth_price	"0.03333333333333333"
sell_price_eth	"0.024943707780835624"
buy_price_eth	"0.05015045135406219"
collection_total_assets	"7"
number_of_owners	"30"
nft_locked	"9"
token_supply	"900"
total_nft_transfers	"11"
pool_users	"2"
users_weekly	"0"
nft_value	"100"
volume_usd	"1511.1733333333333000000000000000000000"
price_now_usd	"170.5516014024058750"
price_now_eth	"0.03754707956744890700"
price_one_week_ago_eth	"0.03754707956744890700"
price_one_day_ago_eth	"0.03754707956744890700"
*/