const retry = require('../helper/retry')
const axios = require('axios')
const BigNumber = require('bignumber.js')
const sdk = require('@defillama/sdk')

const _fetchKft = async () => {
  let kft_price_feed = await retry(
    async bail =>
      await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=knit-finance&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
      )
  )
  let kft_response = await retry(
    async bail =>
      await axios.get(
        'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=0xef53462838000184f35f7d991452e5f25110b207&apikey=UZC789UVNGW1UDUUZAQXD562CEG64JWTAE'
      )
  )
  let kft_tvl = new BigNumber(kft_response.data.result).div(10 ** 18)
  return {
    'knit-finance': kft_tvl
  }
}

const _fetchForBsc = async () => {
  let price_feed = await retry(
    async bail =>
      await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin,cardano,polygon,avalanche,elrond,iost,dash,ripple,stellar,dogecoin,bitcoin-cash,zcash,bitcoin-sv,frontier,stacks,fantom,loom-network-new&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true'
      )
  )

  let btc_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x922a05bf1b7e07cf27d3f5fadc8133e00c75b75f&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let bsc_btc_tvl = new BigNumber(btc_bsc_response.data.result).div(10 ** 18)

  let eth_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xb7141b1a194e9d5e32711917c68fee5db7778e65&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let bsc_eth_tvl = new BigNumber(eth_bsc_response.data.result).div(10 ** 18)

  let ltc_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xa57963d8cb08c157d46862d77be4c0e6b5675494&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let ltc_bsc_tvl = new BigNumber(ltc_bsc_response.data.result).div(10 ** 18)

  let cardano_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x24fcff967fc28afced3c4891b86c1db56d33020e&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )

  let cardano_bsc_tvl = new BigNumber(cardano_bsc_response.data.result).div(
    10 ** 18
  )

  let polygon_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xae35b15e58eaee102fc5c575cea17b8b6ca3dcb6&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let polygon_bsc_tvl = new BigNumber(polygon_bsc_response.data.result).div(
    10 ** 18
  )

  let avalanche_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x54e67c935c5dc9634bcc16f86e6f5747a76b2da4&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )

  let avalanche_bsc_tvl = new BigNumber(avalanche_bsc_response.data.result).div(
    10 ** 18
  )

  let elrond_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x226be9b1840364c5883a18b354f41ae342d948f1&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )

  let elrond_bsc_tvl = new BigNumber(elrond_bsc_response.data.result).div(
    10 ** 18
  )

  let iost_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x1ad5021af1d2be561c4a086bb1e0015803c3810f&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let iost_bsc_tvl = new BigNumber(iost_bsc_response.data.result).div(10 ** 18)

  let dash_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xb2a04c839b9f91889f333e661c9c51deaa6e642d&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let dash_bsc_tvl = new BigNumber(dash_bsc_response.data.result).div(10 ** 18)

  let ripple_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x28cf5786dbc2e9ecc1e5b8fd8a2fce005f095c06&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let ripple_bsc_tvl = new BigNumber(dash_bsc_response.data.result).div(
    10 ** 18
  )

  let stellar_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xf3e94c72889afba13ba53898d22717821883e1a5&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let stellar_bsc_tvl = new BigNumber(stellar_bsc_response.data.result).div(
    10 ** 18
  )

  let doge_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x52a86ed7d5bed75c876ec9fd44d259375f623ac0&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let doge_bsc_tvl = new BigNumber(doge_bsc_response.data.result).div(10 ** 18)

  let bitcoincash_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x31ef831ff9f4e4bd88cb3c1f6c6c5d33c89cb6fd&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let bitcoincash_bsc_tvl = new BigNumber(
    bitcoincash_bsc_response.data.result
  ).div(10 ** 18)

  let zcash_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x941661c8066e0ef6050dcbb84891a77d9db1a20e&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let zcash_bsc_tvl = new BigNumber(zcash_bsc_response.data.result).div(
    10 ** 18
  )

  let bitcoinsv_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x186b614883e57cd31b67b7ae417098aac732010c&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let bitcoinsv_bsc_tvl = new BigNumber(bitcoinsv_bsc_response.data.result).div(
    10 ** 18
  )

  let frontier_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x60aa3676582a1369a79ae415122470f245fbc5a8&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let frontier_bsc_tvl = new BigNumber(frontier_bsc_response.data.result).div(
    10 ** 18
  )

  let stacks_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xe3312a1c2877b0f9d92e251793bfac2d1a81612e&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let stacks_bsc_tvl = new BigNumber(stacks_bsc_response.data.result).div(
    10 ** 18
  )

  let fantom_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0x1d9f90c145df4950a50e7637a8b4066b90727159&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let fantom_bsc_tvl = new BigNumber(fantom_bsc_response.data.result).div(
    10 ** 18
  )

  let loom_bsc_response = await retry(
    async bail =>
      await axios.get(
        'https://api.bscscan.com/api?module=stats&action=tokensupply&contractaddress=0xd7110c535aedbe0edaedab40cbc74cc7f45fc9e7&apikey=H8S7Y2FBEFSP2I5D1ZSTRR5DM6BDH9Q8SG'
      )
  )
  let loom_bsc_tvl = new BigNumber(loom_bsc_response.data.result).div(10 ** 18)

  return {
    bitcoin: bsc_btc_tvl,
    ethereum: bsc_eth_tvl,
    litecoin: ltc_bsc_tvl,
    cardano: cardano_bsc_tvl,
    polygon: polygon_bsc_tvl,
    avalanche: avalanche_bsc_tvl,
    elrond: elrond_bsc_tvl,
    iost: iost_bsc_tvl,
    dash: dash_bsc_tvl,
    ripple: ripple_bsc_tvl,
    stellar: stellar_bsc_tvl,
    dogecoin: doge_bsc_tvl,
    'bitcoin-cash': bitcoincash_bsc_tvl,
    zcash: zcash_bsc_tvl,
    'bitcoin-sv': bitcoinsv_bsc_tvl,
    frontier: frontier_bsc_tvl,
    stacks: stacks_bsc_tvl,
    fantom: fantom_bsc_tvl,
    loom: loom_bsc_tvl
  }
}

module.exports = {
  methodology:
    'TVL is calculated based on the total KFT in circulation along with every k-assset minted on other chains against native assets deposited.',
  ethereum: {
    tvl: _fetchKft
  },
  bsc: {
    tvl: _fetchForBsc
  }
}
