const { staking } = require('../helper/staking');
const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const contracts = [
  "0x07b022bd57e22c8c5abc577535cf25e483dae3df",
  "0x4f5e12233ed7ca1699894174fcbd77c7ed60b03d",
  "0xc0b2FdA4EDb0f7995651B05B179596b112aBE0Ff",
  "0x0a7Df7BC7a01A4b6C9889d5994196C1600D4244a",
  "0x5982241e50Cb4C42cb51D06e74A97EAaCa3a8CE2",
  "0xDF03600C34cacE7496A0A8Ef102B4bCe718958a2",
  "0x3e0598fee8a73d09c06b3de3e205ba7ff8edb004"
];

const tokenAddresses = [
  "0xe5018913F2fdf33971864804dDB5fcA25C539032",
  "0x7122985656e38BDC0302Db86685bb972b145bD3C",
  "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84",
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // usdc
  "0xdAC17F958D2ee523a2206206994597C13D831ec7" // usdt
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owners: contracts, token: coreAssets.null }),
    staking: staking(
      contracts,
      tokenAddresses
    )
  }
};