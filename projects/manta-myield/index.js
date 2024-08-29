const { sumTokensExport } = require("../helper/unwrapLPs")

const tokens = [
  "0x1468177DbCb2a772F3d182d2F1358d442B553089", // "mBTC"
  "0xACCBC418a994a27a75644d8d591afC22FaBA594e", // "mETH"
  "0x649d4524897cE85A864DC2a2D5A11Adb3044f44a", // "mUSD"
]
const mTokenStakeContract = "0x1B9bcc6644CC9b5e1F89aBaAb66904F5a562d4a1"

module.exports = {
  manta: {
    tvl: sumTokensExport({ owner: mTokenStakeContract, tokens }),
  },
}