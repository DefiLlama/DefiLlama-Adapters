const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, treasuryExports } = require("../helper/treasury");

const ethereum = {
  // Doc link: https://docs.dopex.io/developer/contracts/ethereum#active
  treasury: "0xb8689b7910954BF73431f63482D7dd155537ea7E",
  dpx: "0xEec2bE5c91ae7f8a338e1e5f3b5DE49d07AfdC81",
  rdpx: "0x0ff5A8451A839f5F0BB3562689D9A44089738D11",
};

const arbitrum = {
  // Doc link: https://docs.dopex.io/developer/contracts/arbitrum#other
  treasury: "0x2fa6F21eCfE274f594F470c376f5BDd061E08a37",
  dpx: "0x6C2C06790b3E3E3c38e12Ee22F8183b37a13EE55",
  rdpx: "0x32Eb7902D4134bf98A28b963D26de779AF92A212",
};

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.LUSD,
    ],
    owners: [ethereum.treasury],
    ownTokens: [ethereum.dpx, ethereum.rdpx],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.USDC,
      ADDRESSES.arbitrum.ARB,
    ],
    owners: [arbitrum.treasury],
    ownTokens: [arbitrum.dpx, arbitrum.rdpx],
  },
});
