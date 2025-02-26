const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const pools = [
  "0xcce4158494ae8296E3936823058B17e03eEBa6c3",
  "0x693c8D8256018ffCbd3A768bf6ef6Efc7B7B7eab",
  "0x9C6C618C96d65b68E57773D6285a0d83d1Bd6760",
  "0x9E1A69A8164817219e79090330B529556B274c9D",
  "0xD74a66c60761231960b9A67daB72871E545C72f5"
];

const tokens = [
  coreAssets.ethereum.UNI,
  coreAssets.ethereum.LINK,
  coreAssets.ethereum.MKR,
  "0x56d811088235F11C8920698a204A5010a788f4b3",
  "0xa0246c9032bC3A600820415aE600c6388619A14D",
];

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ tokensAndOwners2: [tokens, pools] })
  }
};
