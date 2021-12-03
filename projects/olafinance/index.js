const { getCompoundUsdTvl } = require("../helper/compound");

const unitroller_fantom = "0x892701d128d63c9856A9Eb5d967982F78FD3F2AE";
const unitroller_bsc = "0xAD48B2C9DC6709a560018c678e918253a65df86e";
//FUSE tvl combined with fuseswap as fusefi tvl
//const unitroller_fuse = "0x26a562B713648d7F3D1E1031DCc0860A4F3Fa340"

const abis = {
  oracle: {
    constant: true,
    inputs: [],
    name: "getRegistry",
    outputs: [{ internalType: "address", name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  underlyingPrice: {
    constant: true,
    inputs: [{ internalType: "address", name: "cToken", type: "address" }],
    name: "getPriceForUnderling",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
};

module.exports = {
  fantom: {
    tvl: getCompoundUsdTvl(
      unitroller_fantom,
      "fantom",
      "0xed8F2C964b47D4d607a429D4eeA972B186E6f111",
      abis
    ),
  },
  bsc: {
    tvl: getCompoundUsdTvl(
      unitroller_bsc,
      "bsc",
      "0x34878F6a484005AA90E7188a546Ea9E52b538F6f",
      abis
    ),
  },
};
