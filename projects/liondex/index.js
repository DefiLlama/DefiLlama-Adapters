const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require('../helper/staking')
const { sumTokens2,sumTokensExport } = require('../helper/unwrapLPs')

//const treasure = "0x7fca3bf8adc4e143bd789aecda36c0ce34f1d75b";
const lionDEXVault = "0x8eF99304eb88Af9BDe85d58a35339Cb0e2a557B6";
const lionStaking = "0x154E2b1dBE9F493fF7938E5d686366138ddCE017";
const LION = "0x8ebb85d53e6955e557b7c53acde1d42fd68561ec";
const fsGLP = ADDRESSES.arbitrum.fsGLP;
const USDC = ADDRESSES.arbitrum.USDC;


module.exports = {
  methodology: `Counts fsGLP and USDC deposited to lionDEXVault. Staking counts Lion deposited to stakingPool.`,
  arbitrum: {
    tvl:  sumTokensExport({ owners: [lionDEXVault], tokens: [ fsGLP, USDC]}),
    staking: staking(lionStaking, LION)
  }
}
