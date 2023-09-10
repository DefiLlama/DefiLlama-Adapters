const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens } = require("../helper/unknownTokens");

const WFLR = ADDRESSES.flare.WFLR
const APS = '0xfF56Eb5b1a7FAa972291117E5E9565dA29bc808d'

const chain = 'flare'

// farms which reward APS
// [LP token address, farm address]
async function farmTvl(timestamp, ethblock, { [chain]: block }) {
  const tokens = [
    ['0x7520005032F43229F606d3ACeae97045b9D6F7ea', "0x22beb4c7166DbAa0A33052A770C3b358cAbE9089"], 
  ];

  return sumUnknownTokens({ tokensAndOwners: tokens, chain, block, useDefaultCoreAssets: true, })
}

// farms where APS is one part of the pair
async function pool2(timestamp, ethblock, { [chain]: block }) {
  const tokens = []
  return sumUnknownTokens({ tokensAndOwners: tokens, chain, block, useDefaultCoreAssets: true, })
}

module.exports =  {
    tvl: farmTvl,
    pool2,
};