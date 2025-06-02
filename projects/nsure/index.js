const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

const constant = {
  capitalStakePool:"0xB98eD9800fCD2982d26Cf0E4a6B53C96bbeff6A6",
  stakePool:"0x1a66f065303299d78693f122c800Ab3dEbE9c966",
  buyPool:"0x702aff99b08e8891fc70811174701fb7407b4477",
  surplusPool:"0x80e711b29e46d430ff1553eb2ada670e2a25593c",
  treasuryPool:"0xfd0D28539aeD12477dcba1575eB40fca53969440",
}

module.exports = {
  start: '2021-04-22', // Thu Apr 22 2021 16:46:35
  ethereum: { tvl: sumTokensExport({
    tokensAndOwners: [
      [ADDRESSES.ethereum.WETH, constant.stakePool],
      [ADDRESSES.ethereum.WETH, constant.buyPool],
      [ADDRESSES.ethereum.WETH, constant.surplusPool],
      [ADDRESSES.ethereum.WETH, constant.treasuryPool],
      ['0x20945ca1df56d237fd40036d47e866c7dccd2114', constant.stakePool],
      [ADDRESSES.null,  '0xa6b658Ce4b1CDb4E7d8f97dFFB549B8688CAFb84'],
    ]
  }) }
};

