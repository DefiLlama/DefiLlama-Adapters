const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x068e297e8FF74115C9E1C4b5B83B700FdA5aFdEB";

const tokens = [
  nullAddress,
  ADDRESSES.avax.DAI, // DAI
  ADDRESSES.avax.SAVAX, // sAVAX
  ADDRESSES.avax.USDC, // USDC
  ADDRESSES.avax.USDT_e, // USDT.e
  ADDRESSES.polygon.BUSD, // BUSD
  ADDRESSES.avax.BTC_b, // BTC.b
  ADDRESSES.avax.USDt, // USDt
  "0xF7D9281e8e363584973F946201b82ba72C965D27", // yyAVAX
  ADDRESSES.avax.JOE, // JOE
  "0x026187BdbC6b751003517bcb30Ac7817D5B766f8", // H2O
  ADDRESSES.avax.WAVAX, // WAVAX
  "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5", // QI
  "0xd9D90f882CDdD6063959A9d837B05Cb748718A05", // MORE
  "0x77777777777d4554c39223C354A05825b2E8Faa3", // YETI
];

const ownTokens = [
  "0x22d4002028f537599bE9f666d1c4Fa138522f9c8", // PTP
];

module.exports = treasuryExports({
  avax: {
    tokens,
    owners: [treasury],
    ownTokens,
  },
});
