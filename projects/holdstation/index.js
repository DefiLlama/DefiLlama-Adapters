const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const vaultERA = "0xaf08a9d918f16332F22cf8Dc9ABE9D9E14DdcbC2";
const vaultBera = '0x6a6E4ad4a5ca14B940Cd6949b1A90f947AE21c19'
const vaultWC = '0x9BD647B2C8Fed689ADd2e7AA8b428d3eD12f75cb'
const vaultBSC = '0x7470C48FBf23067F6F8Ef63f7D9B4A2aA5D0afEf'

const stakingContractAddressEra = '0x7cF68AA037c67B6dae9814745345FFa9FC7075b1';
const stakingContractAddressBera = '0xA8dBa750A2D76586a234efB7bDF1d34fdCc48E14'

const HOLD_ERA = '0xed4040fD47629e7c8FBB7DA76bb50B3e7695F0f2'
const HOLD_BERA = '0xFF0a636Dfc44Bb0129b631cDd38D21B613290c98'

const usdc = ADDRESSES.era.USDC;
const honey = ADDRESSES.berachain.HONEY
const wld = ADDRESSES.wc.WLD
const usd1 = ADDRESSES.bsc.USD1

async function tvl(api) {
  return sumTokens2({ api, tokens: [usdc], owners: [vaultERA] })
}

async function tvlBera(api) {
  return sumTokens2({ api, tokens: [honey], owners: [vaultBera] })
}

async function tvlWC(api) {
  return sumTokens2({ api, tokens: [wld], owners: [vaultWC] })
}

async function tvlBSC(api) {
  return sumTokens2({ api, tokens: [usd1], owners: [vaultBSC] })
}

module.exports = {
  era: {
    tvl,
    staking: staking([stakingContractAddressEra],[HOLD_ERA]),
  },
  berachain: {
    tvl: tvlBera,
    staking: staking([stakingContractAddressBera],[HOLD_BERA]),
  },
  wc: {
    tvl: tvlWC
  },
  bsc: {
    tvl: tvlBSC
  }
};
