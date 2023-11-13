
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const btcbStakingContract1 = "0x1EE28d16C380B2137E63EBf92a9F5B42e63E9500"
const btcbStakingContract2 = "0xa253D8BB6Ed85CE1F8FA646794E5681F30542aC9"
const b2bLpStakingContract = "0xB9922b10F86f92208ff7E6c4708D4f7C20CbFEb0"
const b2bLpAddress = "0xfa9B1a0a0851b951eA1D6a2DA2CB6E4025db643b"

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: [btcbStakingContract1, btcbStakingContract2,], tokens: [ADDRESSES.bsc.BTCB,] }),
    pool2: sumTokensExport({ owners: [b2bLpStakingContract,], tokens: [b2bLpAddress], resolveLP: true, }),
  }
}
