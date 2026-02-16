const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

// Treasury address (same across all chains)
const TREASURY = '0x1118e1c057211306a40A4d7006C040dbfE1370Cb'

// Flying Tulip yield wrapper contract addresses (Ethereum)
const WRAPPERS = [
  '0x095d8B8D4503D590F647343F7cD880Fa2abbbf59', // USDC Wrapper
  '0x9d96bac8a4E9A5b51b5b262F316C4e648E44E305', // WETH Wrapper
  '0x267dF6b637DdCaa7763d94b64eBe09F01b07cB36', // USDT Wrapper
  '0xA143a9C486a1A4aaf54FAEFF7252CECe2d337573', // USDS Wrapper
  '0xE5270E0458f58b83dB3d90Aa6A616173c98C97b6', // USDTb Wrapper
  '0xe6880Fc961b1235c46552E391358A270281b5625', // USDe Wrapper
]

// Underlying tokens for the wrappers (Ethereum)
const USDS = '0xdC035D45d973E3EC169d2276DDab16f1e407384F'
const USDTb = '0xC139190F447e929f090Edeb554D95AbB8b18aC1C'

// FT token address
const FT_TOKEN = '0x5DD1A7A369e8273371d2DBf9d83356057088082c'

module.exports = treasuryExports({
  ethereum: {
    owners: [TREASURY],
    tokens: [
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDe,
      USDS,
      USDTb,
      ...WRAPPERS,
    ],
    ownTokens: [FT_TOKEN],
  },
  base: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.base.WETH,
      ADDRESSES.base.USDC,
      ADDRESSES.base.USDbC,
    ],
  },
  sonic: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.sonic.wS,
      ADDRESSES.sonic.USDC_e,
      ADDRESSES.sonic.WETH,
      ADDRESSES.sonic.scUSD,
    ],
  },
  avax: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.avax.WAVAX,
      ADDRESSES.avax.USDC,
      ADDRESSES.avax.USDt,
    ],
  },
  bsc: {
    owners: [TREASURY],
    tokens: [
      nullAddress,
      ADDRESSES.bsc.WBNB,
      ADDRESSES.bsc.USDC,
      ADDRESSES.bsc.USDT,
    ],
  },
})
