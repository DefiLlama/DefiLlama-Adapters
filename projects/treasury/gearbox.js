const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0x7b065Fcb0760dF0CEA8CFd144e08554F3CeA73D1";
const treasuryFee = "0x3E965117A51186e41c2BB58b729A1e518A715e5F";
const treasuryArb = "0x2c31eFFE426765E68A43163A96DD13DF70B53C14";
const treasuryOpt = "0x1ACc5BC353f23B901801f3Ba48e1E51a14263808";
const aeraVault = "0x564bc596affd8eb9c5065bc37835d801f3830c9e";

const GEAR = "0xBa3335588D9403515223F109EdC4eB7269a9Ab5D";
const GEAR_ARB = "0x2F26337576127efabEEc1f62BE79dB1bcA9148A4";
const GEAR_OPT = "0x39E6C2E1757ae4354087266E2C3EA9aC4257C1eb";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.WSTETH,//wsteth
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.CRVUSD,
    ],
    owners: [treasury,treasuryFee,aeraVault],
    ownTokens: [GEAR]
  },
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.USDC_CIRCLE,
    ],
    owners: [treasuryArb],
    ownTokens: [GEAR_ARB]
  },
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.WETH,
      ADDRESSES.optimism.USDC,
      ADDRESSES.optimism.USDC_CIRCLE,
    ],
    owners: [treasuryOpt],
    ownTokens: [GEAR_OPT]
  },
});
