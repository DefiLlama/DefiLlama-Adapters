//20230428 initial release: simple and clear
//20230606 update: add chain: zkSync Era
//20240321 update: add chain: scroll, base, mantle, manta, polygon_zkevm
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  methodology: "TVL is equal to users' deposits minus withdrawals",
  start: '2022-01-08', // Jan-08-2022 07:00:00 AM +UTC
}

const config = {
  arbitrum: { owner: '0x7a08b29A7Ad4A19A5ECa0c82F5F082872488D135', tokens: [
    ADDRESSES.arbitrum.USDC, // USDC.e
    ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
    ADDRESSES.null, // ETH
    ADDRESSES.arbitrum.USDT, // USDT
    ADDRESSES.arbitrum.WBTC, // WBTC
  ] },
  avax: { owner: '0xd8b0D18faE7eA29F2AD95d01FFb479E0021a9A5e', tokens: [
    ADDRESSES.avax.USDC, // USDC
    ADDRESSES.null, // AVAX
    ADDRESSES.avax.BTC_b, // BTC.b
    ADDRESSES.avax.WETH_e, // WETH.e
    ADDRESSES.avax.USDt, // USDt
  ] },
  era: { owner: '0xa1795B95C543428AFf866dA613e43895457bf1C1', tokens: [
    ADDRESSES.era.USDC, // USDC
    ADDRESSES.null, // ETH
  ] },
  scroll: { owner: '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F', tokens: [
    ADDRESSES.scroll.USDC, // USDC
    ADDRESSES.null, // ETH
  ] },
  base: { owner: '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F', tokens: [
    ADDRESSES.base.USDC, // USDC
    ADDRESSES.null, // ETH
  ] },
  mantle: { owner: '0x8712FA9569658c27556d95C820f775939513faEf', tokens: [
    ADDRESSES.mantle.USDC, // USDC
  ] },
  manta: { owner: '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F', tokens: [
    ADDRESSES.manta.USDC, // USDC
    "0x95CeF13441Be50d20cA4558CC0a27B601aC544E5", // MANTA
    ADDRESSES.berachain.STONE, // STONE
  ] },
  polygon_zkevm: { owner: '0xaA830eA4Ca3C7b13be85a8D3ab8441db5cA0Cc5F', tokens: [
    ADDRESSES.polygon_zkevm.USDC, // USDC
    ADDRESSES.polygon_zkevm.USDC_CIRCLE, //USDC.E
  ] },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl: sumTokensExport(config[chain]) }
})