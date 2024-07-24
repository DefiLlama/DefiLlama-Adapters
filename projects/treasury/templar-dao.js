const ADDRESSES = require("../helper/coreAssets.json");
const { treasuryExports } = require("../helper/treasury");
const { nullAddress } = require("../helper/unwrapLPs");

const bscOwner = "0xEA724deA000b5e5206d28f4BC2dAD5f2FA1fe788";
const bscTreasuryContract = "0xd01e8D805BB310F06411e70Fd50eB58cAe2B4C27";

const bscTokens = {
  BUSD: ADDRESSES.bsc.BUSD,
  WBNB: ADDRESSES.bsc.WBNB,
  MIM: "0xfe19f0b51438fd612f6fd59c1dbb3ea319f433ba",
  TM: "0x194d1D62d8d798Fcc81A6435e6d13adF8bcC2966",
  DAI: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  TEM: "0x19e6BfC1A6e4B042Fb20531244D47E252445df01",
  VBUSD: "0x95c78222B3D6e262426483D42CfA53685A67Ab9D",
  VBTC: "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B",
};

const LP = "0xEA724deA000b5e5206d28f4BC2dAD5f2FA1fe788";

const ethTokens = {
  USDC: ADDRESSES.ethereum.USDC,
  USDT: ADDRESSES.ethereum.USDT,
};
const ethOwner = "0x4Bd973e98585b003c31f4C8b9d6eAC5d3293B1e5";

module.exports = treasuryExports({
  bsc: {
    tokens: [
      nullAddress,
      bscTokens.TM,
      bscTokens.DAI,
      bscTokens.BUSD,
      bscTokens.WBNB,
      bscTokens.VBUSD,
      bscTokens.VBTC,
    ],
    owners: [bscOwner, bscTreasuryContract],
    ownTokens: ['0x19e6BfC1A6e4B042Fb20531244D47E252445df01'],
    resolveUniV3: true,
  },
  ethereum: {
    owner: ethOwner,
    tokens: [
      nullAddress,
      ethTokens.USDC,
      ethTokens.USDT,
      ADDRESSES.ethereum.WBTC,
    ],
    resolveUniV3: true,
  },
});