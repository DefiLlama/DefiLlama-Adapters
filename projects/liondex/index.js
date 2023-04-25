const { staking } = require('../helper/staking')
const { sumTokens2,sumTokensExport } = require('../helper/unwrapLPs')

const treasure = "0x7fca3bf8adc4e143bd789aecda36c0ce34f1d75b";
const lionDEXVault = "0x8eF99304eb88Af9BDe85d58a35339Cb0e2a557B6";
const lionStaking = "0x154E2b1dBE9F493fF7938E5d686366138ddCE017";
const LION = "0x8ebb85d53e6955e557b7c53acde1d42fd68561ec";
const fsGLP = "0x1aDDD80E6039594eE970E5872D247bf0414C8903";
const USDC = "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8";


module.exports = {
  methodology: `Counts USDC in treasure and fsGLP deposited to lionDEXVault. Staking counts Lion deposited to stakingPool.`,
  arbitrum: {
    tvl:  sumTokensExport({ chain: 'arbitrum', owners: [treasure, lionDEXVault], tokens: [ fsGLP, USDC]}),
    staking: staking(lionStaking, LION, 'arbitrum')
  }
}