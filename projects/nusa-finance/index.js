const sdk = require('@defillama/sdk')
const { compoundExports2 } = require("../helper/compound");
const { sumTokensExport } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const baseLisk = compoundExports2({ comptroller: '0xF3a40B837e68C518F07A7150802809Ec2a3Bae77', cether: '0xDeFDb8648F38eaFeaF2786ddC7E76d49AE53E8c1'})
module.exports.lisk = baseLisk

const LISK_LP = '0x77B2D6400d814588e33A6BFb344f8e47C0c4684A'
const LISK_STAKING = '0x32b1664AdF690e4FB5161b4C25D46fBAfF1b1f82'
const liskFarmTvl = sumTokensExport({
  tokensAndOwners: [[LISK_LP, LISK_STAKING]],
  useDefaultCoreAssets: true,
  onlyLPs: true,
})

module.exports.lisk.tvl = sdk.util.sumChainTvls([module.exports.lisk.tvl, liskFarmTvl])

const BSC_LP = '0x10e1a96756c05B369EADC5E9cFbE52189350F556'
const BSC_STAKING_CONTRACTS = [
  '0x21805c9b4d7132E27CAa9A367b508527f94Efe0f',
  '0x0eE098D160BC989c8b83a72F4BaaE5f0B3B2CA85',
  '0x434D2873078a35450094157a4205d8D4D5A3022F',
]

module.exports.bsc = {}
module.exports.bsc.pool2 = sumTokensExport({
  tokensAndOwners: BSC_STAKING_CONTRACTS.map(owner => [BSC_LP, owner]),
  useDefaultCoreAssets: true,
  onlyLPs: true,
})

const NUSA_BSC = '0xe11F1D5EEE6BE945BeE3fa20dBF46FeBBC9F4A19'
const VE_NUSA_BSC = '0xE72852244b9382C1466551df6710D3871a0b17f2'
module.exports.bsc.staking = staking([VE_NUSA_BSC], NUSA_BSC, 'bsc')