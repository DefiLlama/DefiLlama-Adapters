const { calculateUniTvl } = require('../helper/calculateUniTvl.js')
const { 
  transformFantomAddress, transformHarmonyAddress, transformAvaxAddress, 
  transformHecoAddress, transformBscAddress, transformPolygonAddress, 
  transformKccAddress, transformOkexAddress, transformMoonriverAddress 
} = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')
const sdk = require('@defillama/sdk')

const stakingContracts = {
  "heco": "0xdE16c49fA4a4B78071ae0eF04B2E496dF584B2CE",
  "polygon": "0xB8CBce256a713228F690AC36B6A0953EEd58b957",
  "bsc": "0xD5B9b0DB5f766B1c934B5d890A2A5a4516A97Bc5",
  "avax": "0xB105D4D17a09397960f2678526A4063A64FAd9bd",
  "fantom": "0x6B7E64854e4591f8F8E552b56F612E1Ab11486C3",
  "xdai": "0xAd3379b0EcC186ddb842A7895350c4657f151e6e"
};

async function polygon(timestamp, ethBlock, chainBlocks) {
  const transform = await transformPolygonAddress()
  return calculateUniTvl(transform, chainBlocks['polygon'], 'polygon', '0xE3BD06c7ac7E1CeB17BdD2E5BA83E40D1515AF2a', 0, true);
}

async function avax(timestamp, ethBlock, chainBlocks) {
  const transform = await transformAvaxAddress()
  const balances = await calculateUniTvl(transform, chainBlocks['avax'], 'avax', "0x091d35d7F63487909C863001ddCA481c6De47091", 0, true);
  return balances
}

async function kcc(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'kcc', chainBlocks);
  const transform = await transformKccAddress()
  let balances = await calculateUniTvl(transform, block, 'kcc', "0x1f9aa39001ed0630dA6854859D7B3eD255648599", 0, true);
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 
    2 * balances['avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c']};
}

async function harmony(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'harmony', chainBlocks);
  const transform = await transformHarmonyAddress()
  let balances = await calculateUniTvl(transform, block, 'harmony', "0xCdde1AbfF5Ae3Cbfbdb55c1e866Ac56380e18720", 0, true);
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 
    2 * balances['avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c']};
}

async function okex(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'okexchain', chainBlocks);
  const transform = await transformOkexAddress()
  let balances = await calculateUniTvl(transform, block, 'okexchain', "0x1116f8B82028324f2065078b4ff6b47F1Cc22B97", 0, true);
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 
    2 * balances['avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c']};
}

async function moonriver(timestamp, ethBlock, chainBlocks) {
  const block = await getBlock(timestamp, 'moonriver', chainBlocks);
  const transform = await transformMoonriverAddress()
  let balances = await calculateUniTvl(transform, block, 'moonriver', "0xd45145f10fD4071dfC9fC3b1aefCd9c83A685e77", 0, true);
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 
    2 * balances['avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c']};
}

async function fantom(timestamp, ethBlock, chainBlocks) {
  const transform = await transformFantomAddress()
  return calculateUniTvl(transform, chainBlocks['fantom'], 'fantom', "0x7Ba73c99e6f01a37f3e33854c8F544BbbadD3420", 0, true);
}

async function xdai(timestamp, ethBlock, chainBlocks) {
  return calculateUniTvl(addr=>`xdai:${addr}`, chainBlocks['xdai'], 'xdai', "0xCB018587dA9590A18f49fFE2b85314c33aF3Ad3B", 0, true);
}

async function bsc(timestamp, ethBlock, chainBlocks) {
  const transform = await transformBscAddress()
  return calculateUniTvl(transform, chainBlocks['bsc'], 'bsc', "0x31aFfd875e9f68cd6Cd12Cee8943566c9A4bBA13", 0, true);
}

async function heco(timestamp, ethBlock, chainBlocks) {
  const block = undefined
  const transform = await transformHecoAddress();
  let balances = await calculateUniTvl(transform, block, 'heco', "0x997fCE9164D630CC58eE366d4D275B9D773d54A4", 0, true);
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': 
    2 * balances['avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c']};
}
async function staking(timestamp, ethBlock, chainBlocks) {
  balance = 0;
  for (const key of Object.keys(stakingContracts)) {
    balance += Number((await sdk.api.erc20.balanceOf({
      target: '0xE1C110E1B1b4A1deD0cAf3E42BfBdbB7b5d7cE1C',
      owner: stakingContracts[key],
      block: chainBlocks[key],
      chain: key
    })).output)
  }
  return {'avax:0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c': balance};
}

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
  staking:{
    tvl: staking
  },
  kcc: {
    tvl: kcc
  },
  harmony: {
    tvl: harmony
  },
  okex: {
    tvl: okex
  },
  moonriver: {
    tvl: moonriver
  }
}