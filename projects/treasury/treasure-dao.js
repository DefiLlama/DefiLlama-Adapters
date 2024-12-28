const ADDRESSES = require('../helper/coreAssets.json')

const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x0eb5b03c0303f2f47cd81d7be4275af8ed347576";
const treasury2 = "0x1054e9d9091dc55a1738f9c8fc0c79e59e222804"
const treasury3 = "0x482729215aaf99b3199e41125865821ed5a4978a"
const treasury4 = "0x64bfb08217b30b70f287a1b7f0670bdd49f8a13f"
const treasury5 = "0x81fa605235e4c32d8b440eebe43d82e9e083166b"
const treasury6 = "0xdb6ab450178babcf0e467c1f3b436050d907e233"
const treasury7 = "0xe8409cd2abae06871d166e808d75addb0537033a"

const treasuryETH = "0xec834bd1f492a8bd5aa71023550c44d4fb14632a"
const MAGICETH = "0xb0c7a3ba49c7a6eaba6cd4a96c55a1391070ac9a"

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, treasury2, treasury3, treasury4, treasury5, treasury6, treasury7 ],
    ownTokens: [
      "0x539bde0d7dbd336b79148aa742883198bbf60342", // MAGIC
      "0x872bAD41CFc8BA731f811fEa8B2d0b9fd6369585", // GFLY
    ],
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.USDC,  // USDC
      ADDRESSES.arbitrum.WETH,  // WETH
      "0xb7e50106a5bd3cf21af210a755f9c8740890a8c9",  // SLP
    ],
  },
  ethereum: {
    tokens: [nullAddress, ADDRESSES.ethereum.USDC],
    owners: [treasuryETH],
    ownTokens: [MAGICETH],
  },
});