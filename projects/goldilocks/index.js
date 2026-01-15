const ADDRESSES = require('../helper/coreAssets.json')
const HONEY_ADDRESS = ADDRESSES.berachain.HONEY
const GOLDISWAP_ADDRESS = '0xb7E448E5677D212B8C8Da7D6312E8Afc49800466'
const RUSD_ADDRESS = '0x09D4214C03D01F49544C0448DBE3A27f768F2b34'
const RUSDVAULT_ADDRESS = '0x8f65453BF050233d3BD6a08A5Eb53C1fD73312EC'
const UNIBTC_ADDRESS = '0xC3827A4BC8224ee2D116637023b124CED6db6e90'
const UNIBTCVAULT_ADDRESS = '0x8742DB52a4EAEFE88bE5D3431980E221aaAA1EE3'
const RSETH_ADDRESS = ADDRESSES.berachain.rsETH
const RSETHVAULT_ADDRESS = '0xE4dC8142CEd52C547384032e43379b0514341c22'

async function tvl(api) {
  const goldiswapBal = await api.call({
    abi: 'erc20:balanceOf',
    target: HONEY_ADDRESS,
    params: [GOLDISWAP_ADDRESS]
  })
  api.add(HONEY_ADDRESS, goldiswapBal)
  
  const rusdvaultBal = await api.call({
    abi: 'erc20:balanceOf',
    target: RUSD_ADDRESS,
    params: [RUSDVAULT_ADDRESS]
  })
  api.add(RUSD_ADDRESS, rusdvaultBal)
  
  const unibtcvaultBal = await api.call({
    abi: 'erc20:balanceOf',
    target: UNIBTC_ADDRESS,
    params: [UNIBTCVAULT_ADDRESS]
  })
  api.add(UNIBTC_ADDRESS, unibtcvaultBal)

  const rsethvaultBal = await api.call({
    abi: 'erc20:balanceOf',
    target: RSETH_ADDRESS,
    params: [RSETHVAULT_ADDRESS]
  })
  api.add(RSETH_ADDRESS, rsethvaultBal)
}

module.exports = {
  methodology: "The TVL metric counts the amount of Honey in Goldiswap and the amount of the deposit token in the rUSD, uniBTC, and rsETH Goldivaults.",
  berachain: {
    tvl
  }
}