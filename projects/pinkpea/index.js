const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./lens.json");
const { ethers } = require("ethers");

const vaultLensAddress = "0x64958a77bE17f3B840d66260CB088f4C8dB1f47C";
const zeroAddress = ADDRESSES.null;

const tokenDecimals = {
  "0x53ff774ebE8Bf7E03df8D73D3E9915b2Ca4eC40E": 6,
};

const vaultsList = [
  "0x27A8432Fa94b2B33dfB77C4Ff2a5018b7e4bc975",
  "0x0aC81555c63011cB7269baf03e7f4B4bC2F7C60d",
  "0xe74ed82644c522b651b5D0281A2340E25ac497D3",
  "0xbbD431586F068eA2c4e846063a65ee7898A8fCEd",
  "0x756cB1EAB774108195229bcd3c13f5e15d26557F",
  "0x36Ab516a4D0FC0Fbf9540436b0D406b4b8C624B1",
  "0x2ea50f6A3623B4C08C58A40Cce715ed372f0e0B1",
  "0xd624E3D7921D534A251F60AC2d2eBDE6Ad046e21",
  "0x6cB6C36A3EE279ef63F8154b1BA21E65D87daF64",
  "0x158EBFB9b3021908C937921bE434a3C6BB755d19",
  "0x90C6CB346274c0CbF1eA9c2b42D78Ab74da0166e",
  "0x3FA7b079EA5e9D4d98A5C4C60355124B0a9eDcc9",
  "0x6060E56BE05783A1A7Ca385706A50Cf17E146e29",
  "0x53ff774ebE8Bf7E03df8D73D3E9915b2Ca4eC40E",
];
async function tvl(timestamp, ethBlock, chainBlocks) {
  let totalSupply = (
    await sdk.api.abi.call({
      target: vaultLensAddress,
      params: [vaultsList, zeroAddress],
      abi: abi.balanceInfoViews,
      chain: "aurora",
      block: chainBlocks.aurora,
    })
  ).output;

  let totalTvl = 0;
  totalSupply.forEach((data) => {
    let decimal = 24;
    if (tokenDecimals[data.vaultAddress]) {
      decimal = tokenDecimals[data.vaultAddress];
    }
    totalTvl +=
      Number(ethers.utils.formatUnits(data.tvl, data.decimal)) *
      Number(ethers.utils.formatUnits(data.tokenPrice, decimal));
  });
  return {
    ["aurora:" + ADDRESSES.aurora.USDT_e]: totalTvl * 1000000,
  };
}
module.exports = {
  aurora: {
    tvl,
  },
};
