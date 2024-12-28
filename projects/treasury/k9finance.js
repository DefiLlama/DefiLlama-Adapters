const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xDA4Df6E2121eDaB7c33Ed7FE0f109350939eDA84";
const shibtreasury = "0x5C3d21D406226F17a06510F1CB9157BD9e751416"

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [treasury],
    ownTokens: ["0x91fbb2503ac69702061f1ac6885759fc853e6eae"]
  },
  shibarium: {
    tokens: [nullAddress,ADDRESSES.shibarium.BONE_5],
    owners: [shibtreasury],
    ownTokens: ["0x91fbB2503AC69702061f1AC6885759Fc853e6EaE"]
  },
})