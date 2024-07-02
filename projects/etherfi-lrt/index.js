const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens');

const owners = ["0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88"]

module.exports = {
  methodology: "LRTS on 0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88",
  doublecounted: true,
  ethereum: {
    tvl: sumTokensExport({
      owners,
      tokens: [ADDRESSES.ethereum.WSTETH, ADDRESSES.ethereum.sfrxETH, ADDRESSES.ethereum.cbETH, ADDRESSES.ethereum.EETH, ADDRESSES.ethereum.RETH, ADDRESSES.null, "0xf951E335afb289353dc249e82926178EaC7DEd78", "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee", "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b", "0xa2E3356610840701BDf5611a53974510Ae27E2e1", "0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa" ] 
    }),
  }}
