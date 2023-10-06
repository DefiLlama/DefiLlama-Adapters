const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens } = require("../helper/unknownTokens");

const WFLR = ADDRESSES.flare.WFLR
const APS = '0xfF56Eb5b1a7FAa972291117E5E9565dA29bc808d'
const HLN = '0x140D8d3649Ec605CF69018C627fB44cCC76eC89f'

const chain = 'flare'

// farms which reward APS
// [LP token address, farm address]
async function farmTvl(timestamp, ethblock, { [chain]: block }) {
  const tokens = [
    ['0x7520005032F43229F606d3ACeae97045b9D6F7ea', "0x22beb4c7166DbAa0A33052A770C3b358cAbE9089"], 
    ['0x02C6b5B1fbE01Da872E21f9Dab1B980933B0EF27', "0xd3a273329bab3e263015C1C2ab79C3731769a5b0"], 
    [HLN, "0x660cc88B7924a0c727cA6a1a9F0B81D239966928"], 
    [HLN, "0xC296d1D1E3396bCCDeD32143ca715bAB0A9998cC"], 
  ];

  return sumUnknownTokens({ tokensAndOwners: tokens, chain, block, useDefaultCoreAssets: true, })
}

// farms where APS is one part of the pair
async function pool2(timestamp, ethblock, { [chain]: block }) {
  const tokens = [
    ['0xef24D5155818d4bD16AF0Cea1148A147eb620743', "0x3DA590b357Cf17a413ec8db70FeB02119AfE707f"], 
    ['0x87E0E33558c8e8EAE3c1E9EB276e05574190b48a', "0x2de4bC38f012DC90478f570083d3Da45B05659A9"],
  ]
  return sumUnknownTokens({ tokensAndOwners: tokens, chain, block, useDefaultCoreAssets: true, })
}

module.exports =  {
    tvl: farmTvl,
    pool2,
};