
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const btcbStakingContract1 = "0x1EE28d16C380B2137E63EBf92a9F5B42e63E9500"
const btcbStakingContract2 = "0xa253D8BB6Ed85CE1F8FA646794E5681F30542aC9"

const btcuAddress = '0x54B8E454790D8c508F7b4f691721B0d7A7D75Fa5'
const btcuStakingContract = "0x3A76fdf6dd5e7835647375aBb69a5fCeFD2dcbC3"
const troveContract = '0x3e846dCdaFd15770957935C23F0524497281ff0D'

const b2bLpStakingContract = "0xB9922b10F86f92208ff7E6c4708D4f7C20CbFEb0"
const b2bLpAddress = "0xfa9B1a0a0851b951eA1D6a2DA2CB6E4025db643b"

const btcbBtcuLpStakingContract = "0x004d02677d22f0e6a977dbF5eEa3351580220997"
const btcbBtcuLpAddress = "0x70E3eEaacC553dA549fbD734475f61e00A40AA28"

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: [btcbStakingContract1, btcbStakingContract2, troveContract,], tokens: [ADDRESSES.bsc.BTCB,] }),
    pool2: sumTokensExport({ owners: [b2bLpStakingContract, btcbBtcuLpStakingContract], tokens: [b2bLpAddress, btcbBtcuLpAddress,], resolveLP: true, }),
  }
}
