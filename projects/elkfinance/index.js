const { calculateUniTvl } = require('../helper/calculateUniTvl.js')
const { transformFantomAddress, transformHarmonyAddress, fixHarmonyBalances, transformAvaxAddress, fixAvaxBalances, transformHecoAddress } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

async function polygon(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr => `polygon:${addr}`, chainBlocks['polygon'], 'polygon', '0xE3BD06c7ac7E1CeB17BdD2E5BA83E40D1515AF2a', 0, true);
}

async function avax(timestamp, ethBlock, chainBlocks) {
  const transform = await transformAvaxAddress()
  const balances = await calculateUniTvl(transform, chainBlocks['avax'], 'avax', "0x091d35d7F63487909C863001ddCA481c6De47091", 0, true);
  fixAvaxBalances(balances)
  return balances
}

async function fantom(timestamp, ethBlock, chainBlocks) {
  const transform = await transformFantomAddress()
  return calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', "0x7Ba73c99e6f01a37f3e33854c8F544BbbadD3420", 0, true);
}

async function xdai(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr=>`xdai:${addr}`, chainBlocks['xdai'], 'xdai', "0xCB018587dA9590A18f49fFE2b85314c33aF3Ad3B", 0, true);
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr => `bsc:${addr}`, chainBlocks['bsc'], 'bsc', "0x31aFfd875e9f68cd6Cd12Cee8943566c9A4bBA13", 0, true);
}

// Not good support from coingecko
async function heco(timestamp, ethBlock, chainBlocks) {
  const block = undefined
  const transform = await transformHecoAddress();
  let balances = await calculateUniTvl(transform, block, 'heco', "0x997fCE9164D630CC58eE366d4D275B9D773d54A4", 0, true);
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 
    2 * balances['avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c']};
}

// Missing: avax, harmony, okex

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: xdai
  },
  polygon: {
    tvl: polygon
  },
  fantom: {
    tvl: fantom,
  },
  bsc: {
    tvl: bsc
  },
  heco:{
    tvl: heco
  },
  avalanche:{
    tvl: avax
  },
  tvl: sdk.util.sumChainTvls([avax, polygon, fantom, bsc, xdai, heco])
}
