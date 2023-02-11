

const { unwrapUniswapV3NFTs, sumTokens2 } = require('../helper/unwrapLPs');


const arbitrumPools = [
  "0x04D9C66B4922A4BAe4aba29D2f2548a578853164", // WETH-USDC UniV3 5Bps
  "0x7f6dCCE64C01E930d93a2B1824Ac22aaF17074f7", // WBTC-WETH UniV3
  "0xAAaF1E4795D23923865e88413C65f7c8a366C18f", // USDT-USDC UniV3 5Bps
  "0x4458b4AaDCf376FF442f7e820E62bc90C00a45A5", // WETH-USDC UniV3 30Bps
  "0xe9287b61b27c1FA37EECcaF20a04871d6fe53903", // WETH-USDT UniV3 5Bps
  "0xb380f4E591fEc6A2646079DC4a72F0110cDF8EFa", // WETH-GMX  UniV3 30Bps
]

const optimismPools = [
  "0xf3Cb6E3EdFee802B9BAAbabe693861C52A0B580D", // WETH-USDC UniV3 5Bps
  "0x1d3Ae2a02fd0A9E1A4Ac83788B3066A1a31fB77e", // WETH-OP   UniV3 30Bps
]

const polygonPools = [
  "0xD3cBc6AB2840E7874905192164BFE70c4691A57E", // WMATIC-CRV  UniV3 30Bps
  "0x7f6dCCE64C01E930d93a2B1824Ac22aaF17074f7", // WBTC-WETH   UniV3 5Bps
  "0xaDa3AC8Bc18803C2EaFDD4B41f83C94900761CE6", // WMATIC-WETH UniV3 5Bps
  "0x43807Cbb138597f80D37d5F85359332f08dfEfA3", // WMATIC-USDT UniV3 5Bps
  "0x02359e119E241Af5A982295998A486d9B35842e5", // WMATIC-USDC UniV3 5Bps
  "0x06aF8069F69DF2717267AE8e57058de5DaC97771", // WMATIC/USDC UniV3 30Bps
  "0x6656cDfBc514AC02d3D9A4869ee511B51c92510F", // USDC/WETH   UniV3 5Bps
  "0x5020BD495f17f5626F4Fa31970bf99763140dB7b", // USDC/WETH   UniV3 30Bps
]

async function polygonTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await unwrapUniswapV3NFTs({balances, owners: polygonPools, block: chainBlocks.polygon, chain: 'polygon'})
  return balances;
}

async function arbitrumTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await unwrapUniswapV3NFTs({balances, owners: arbitrumPools, block: chainBlocks.arbitrum, chain: 'arbitrum'})
  return balances;
}

async function optimismTvl(timestamp, block, chainBlocks) {
  let balances = {};
  await unwrapUniswapV3NFTs({balances, owners: optimismPools, block: chainBlocks.optimism, chain: 'optimism'})
  return balances;
}


module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  optimism: {
    tvl: optimismTvl,
  },
  arbitrum: {
    tvl: arbitrumTvl,
  },
};