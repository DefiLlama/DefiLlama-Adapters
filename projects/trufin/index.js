const sdk = require('@defillama/sdk')
const { ethers } = require("ethers");
const BigNumber = require("bignumber.js");
const abi = require('./abi.json')

const TRUSTAKE_CONTRACT_ADDR = "0xcfab8530ccf1f9936daede537d6ebbc75289006d"
const MATIC_TOKEN_ADDR = "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0"

async function tvl(timestamp, block, chainBlocks) {
  const balances = {}

  const totalShares = (await sdk.api.abi.call({
    abi: abi.totalShares,
    chain: 'ethereum',
    target: TRUSTAKE_CONTRACT_ADDR,
    block: chainBlocks['ethereum']
  })).output

  const sharePrice = (await sdk.api.abi.call({
    abi: abi.sharePrice,
    chain: 'ethereum',
    target: TRUSTAKE_CONTRACT_ADDR,
    block: chainBlocks['ethereum']
  })).output

  const dust = (await sdk.api.abi.call({
    abi: abi.getDust,
    chain: 'ethereum',
    target: TRUSTAKE_CONTRACT_ADDR,
    block: chainBlocks['ethereum']
  })).output

  const fSharePrice  = new BigNumber(ethers.utils.formatEther(sharePrice))
  const fTotalShares = new BigNumber(ethers.utils.formatEther(totalShares))
  const fDust        = new BigNumber(ethers.utils.formatEther(dust))

  const fTotalMatic = fTotalShares.times(fSharePrice).plus(fDust)
  const totalMatic = ethers.utils.parseEther(fTotalMatic.decimalPlaces(18).toString()).toString()
  
  balances[MATIC_TOKEN_ADDR] = totalMatic

  return balances
}

module.exports = {
  methodology: `Counts the TVL of MATIC tokens in TruFin's TruStake vault.`,
  ethereum: {
    tvl
  }
}
