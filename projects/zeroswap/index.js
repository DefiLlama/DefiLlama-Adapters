const sdk = require('@defillama/sdk');
const BigNumber = require("bignumber.js")
const { transformBscAddress } = require('../helper/portedTokens');
const { transformPolygonAddress } = require('../helper/portedTokens');
const ETH_TOKEN_ADDRESS = '0x2eDf094dB69d6Dcd487f1B3dB9febE2eeC0dd4c5';
const ETH_STAKING_ADDRESS = '0xEDF822c90d62aC0557F8c4925725A2d6d6f17769';
const BSC_TOKEN_ADDRESS = '0x44754455564474A89358B2C2265883DF993b12F0';
const BSC_STAKING_ADDRESS = '0x593497878c33dd1f32098E3F4aE217773F803cf3';
const POLY_TOKEN_ADDRESS = '0xfd4959c06fbcc02250952daebf8e0fb38cf9fd8c';
const POLY_STAKING_ADDRESS = '0x89eA093C07f4FCc03AEBe8A1D5507c15dE88531f';

//etherum tvl
async function ethereum(timestamp, block) {
  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'ethereum',
    target: ETH_TOKEN_ADDRESS,
    params: [ETH_STAKING_ADDRESS],
    chain: 'ethereum'
  })).output;

  const balances = {
    [ETH_TOKEN_ADDRESS]: collateralBalance
  }

  return balances;
}

//bsc tvl
async function bsc(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformBscAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'bsc',
    target: BSC_TOKEN_ADDRESS,
    params: [BSC_STAKING_ADDRESS],
    block: chainBlocks['bsc'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(BSC_TOKEN_ADDRESS), collateralBalance)

  return balances;
}

//polygon tvl
async function polygon(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformPolygonAddress();

  const collateralBalance = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: 'polygon',
    target: POLY_TOKEN_ADDRESS,
    params: [POLY_STAKING_ADDRESS],
    block: chainBlocks['polygon'],
  })).output;

  await sdk.util.sumSingleBalance(balances, transform(POLY_TOKEN_ADDRESS), collateralBalance)

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts tvl of all the tokens staked through Staking Contracts',
  start: 1000235,
  ethereum: {
    tvl:ethereum
  },
  bsc: {
    tvl:bsc
  },
  polygon: {
    tvl:polygon
  }
};