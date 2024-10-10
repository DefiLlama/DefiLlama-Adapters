const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')
const MEN_TOKEN_CONTRACT = '0x94b959c93761835f634B8d6E655070C58E2CAa12';
const owners = [
  '0xF3Bc54A6b9615569194a203f852E64476f70d875',
  '0x58e353BA88F22d6955b99Ee3a84826751F5B01be',
  '0x126b40E61efAE1ef7b86ed3ffF4083369E3DaDF3',
  '0x8Db60A7F9Ff1C92288C905fE780aE4D6f69Dd72e',
  '0x0C6feFB39a0fe19054490F18C3Cb2412f407F650',
  '0xf72d1642a6ce6e8b50597b6dca636488e14b666b',
  '0xf416E1c9AdeCc1F8AF16E5fc26b06F69520A613b',
  '0x1a0900f58ed4c558a0b35f184276ec9383ff29b0',
  '0x56485038b32a24C7f5Ee1449eaC7f444ca4b21F2'
]

module.exports = {
  polygon: {
    tvl: sumTokensExport({ owners, token: ADDRESSES.polygon.USDT, }),
    staking: sumTokensExport({ owners, token: MEN_TOKEN_CONTRACT }),
    pool2: sumTokensExport({ owners, token: '0xD12bA2A40289Ed8728682447DC77D001F03675F9', resolveLP: true, }),
  },
}