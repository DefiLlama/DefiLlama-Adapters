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
        "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
        "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        "0x4200000000000000000000000000000000000042",
        "0x4200000000000000000000000000000000000006",
        "0x2E3D870790dC77A83DD1d18184Acc7439A53f475"])
  },
}