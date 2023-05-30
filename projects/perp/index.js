const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking");

const perpToken = "0xbC396689893D065F41bc2C6EcbeE5e0085233447"
const stakingContract = "0x0f346e19F01471C02485DF1758cfd3d624E399B4"

module.exports = {
  ethereum: {
    staking: staking(stakingContract, perpToken)
  },
  optimism: {
    tvl: staking(
      [
        "0xAD7b4C162707E0B2b5f6fdDbD3f8538A5fbA0d60"
      ],
      [
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.OP,
        ADDRESSES.tombchain.FTM,
        ADDRESSES.optimism.FRAX])
  },
}