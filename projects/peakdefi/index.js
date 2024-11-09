const ADDRESSES = require('../helper/coreAssets.json')

const { sumTokens2 } = require('../helper/unwrapLPs')
const { staking } = require('../helper/staking');

const peakAddress = '0x630d98424eFe0Ea27fB1b3Ab7741907DFFEaAd78'

const tokens = [
  ADDRESSES.ethereum.USDC,
]

const funds = {
  globalFund: '0x07cDB44fA1E7eCEb638c12A3451A3Dc9CE1400e4',
  nftFund: '0xC120C7dB0804ae3AbEB1d5f9c9C70402347B4685',
}

const stakingContracts = {
  ethereum: '0x9733f49D577dA2b6705cA173382C0e3CdFff2A48',
  bsc: '0xe9428B8acaA6b9d7C3314D093975c291Ec59A009',
}

async function tvl(api) {
  return sumTokens2({ api, owners: Object.values(funds), tokens })
}
module.exports = {
  start: 1607405152,        // Dec-08-2020 05:25:52 PM +UTC
  bsc: {
    staking: staking(stakingContracts.bsc, peakAddress, "bsc", peakAddress),
  },
  ethereum: {
    staking: staking(stakingContracts.ethereum, peakAddress),
    tvl
  },
}