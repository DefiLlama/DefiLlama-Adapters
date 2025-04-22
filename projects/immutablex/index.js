const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/sumTokens");
const { stakings } = require("../helper/staking");

const owners = ["0x5FDCCA53617f4d2b9134B29090C87D01058e27e9"];

const tokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.USDC,
  "0xeD35af169aF46a02eE13b9d79Eb57d6D68C1749e", // OMI
  "0xccC8cb5229B0ac8069C51fd58367Fd1e622aFD97", // GODS
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners, tokens }),
    staking: stakings(owners, "0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF"),
  },
  hallmarks: [[1643241600, "OMI migration"]],
};
