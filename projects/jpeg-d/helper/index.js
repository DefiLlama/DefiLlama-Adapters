const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../../helper/unwrapLPs");
const abi = require("./abis");

// NFT pUSD vaults
const CRYPTO_PUNK_PUSD_VAULT = "0xD636a2fC1C18A54dB4442c3249D5e620cf8fE98F";
const ETHER_ROCKS_PUSD_VAULT = "0x6837a113aa7393ffbd5f7464e7313593cd2dd560";
const BAYC_PUSD_VAULT = "0x271c7603aaf2bd8f68e8ca60f4a4f22c4920259f";
const MAYC_PUSD_VAULT = "0x7b179f9bfbe50cfa401c1cdde3cb2c339c6635f3";
const DOODLES_PUSD_VAULT = "0x0a36f4bf39ed7d4718bd1b8dd759c19986ccd1a7";
const PUDGY_PENGUINS_PUSD_VAULT = "0xe793eaedc048b7441ed61b51acb5df107af996c2";
const AZUKI_PUSD_VAULT = "0x2acd96c8db23978a3dd32448a2477b132b4436e4";
const CLONEX_PUSD_VAULT = "0xc001f165f7d7542d22a1e82b4640512034a91c7d";
const AUTOGLYPH_PUSD_VAULT = "0xf42366f60ccc0f454b505fd72fb070e7f23b8171";
const FIDENZA_PUSD_VAULT = "0x64979eA0e4C7EB440402Fef273483ec8e74146d0";
const RINGERS_PUSD_VAULT = "0xa699e2f651861ec68e74fe01017ade75a12d5c1b";
const SQUIGGLES_PUSD_VAULT = "0x266d98307469f86f134ab884afefa98d3b4835b1";
const OTHERDEED_PUSD_VAULT = "0x09765190845c35fb81efd6952e19c995f6bd6a72";

// NFT pETH vaults
const CRYPTO_PUNK_PETH_VAULT = "0x4e5f305bfca77b17f804635a9ba669e187d51719";
const ETHER_ROCKS_PETH_VAULT = "0x7Bc8c4D106f084304d6c224F48AC02e6854C7AC5";
const BAYC_PETH_VAULT = "0xaf5e4c1bfac63e355cf093eea3d4aba138ea4089";
const MAYC_PETH_VAULT = "0xc45775baa4a6040414f3e199767033257a2a91b9";
const DOODLES_PETH_VAULT = "0x229e09d943a94c162a662ba0ffbcad21521b477a";
const PUDGY_PENGUINS_PETH_VAULT = "0x4b94b38bec611a2c93188949f017806c22097e9f";
const AZUKI_PETH_VAULT = "0x72695c2af4193029e0669f2c01d84b619d8c25e7";
const CLONEX_PETH_VAULT = "0x46db8fda0be00e8912bc28357d1e28e39bb404e2";
const AUTOGLYPH_PETH_VAULT = "0xCFd74e932B49eEf26f6527091821aDa8A9A4CbDa";
const FIDENZA_PETH_VAULT = "0x9C1DceD6C1668c4159cf71C41f54F0fb9C2Dc9Dc";
const RINGERS_PETH_VAULT = "0x9895a329e1f8F7728a2e60F45Ef017565DdCB535";
const SQUIGGLES_PETH_VAULT = "0x2a8d4e3bb2e09541bf5d79a1cf8b9dd2b3a1c6ab";
const OTHERDEED_PETH_VAULT = "0x525a3999b65a7d06dbe1de9b0b5faab1dc72e83c";

const VAULT_ARRAY = [
  // pUSD vaults
  CRYPTO_PUNK_PUSD_VAULT,
  BAYC_PUSD_VAULT,
  MAYC_PUSD_VAULT,
  DOODLES_PUSD_VAULT,
  PUDGY_PENGUINS_PUSD_VAULT,
  AZUKI_PUSD_VAULT,
  ETHER_ROCKS_PUSD_VAULT,
  CLONEX_PUSD_VAULT,
  AUTOGLYPH_PUSD_VAULT,
  FIDENZA_PUSD_VAULT,
  RINGERS_PUSD_VAULT,
  SQUIGGLES_PUSD_VAULT,
  OTHERDEED_PUSD_VAULT,
  // pETH vaults
  CRYPTO_PUNK_PETH_VAULT,
  BAYC_PETH_VAULT,
  MAYC_PETH_VAULT,
  DOODLES_PETH_VAULT,
  PUDGY_PENGUINS_PETH_VAULT,
  AZUKI_PETH_VAULT,
  ETHER_ROCKS_PETH_VAULT,
  CLONEX_PETH_VAULT,
  AUTOGLYPH_PETH_VAULT,
  FIDENZA_PETH_VAULT,
  RINGERS_PETH_VAULT,
  SQUIGGLES_PETH_VAULT,
  OTHERDEED_PETH_VAULT,
];

const mapping = {
  '0x810fdbc7e5cfe998127a1f2aa26f34e64e0364f4': '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6',
  '0x2be665ee27096344b8f015b1952d3dfdb4db4691': '0xb7f7f6c52f2e2fdb1963eab30438024864c313f6',
  '0x1de562b03184521f9a699e9290a6d578cd32008d': '0xa3f5998047579334607c47a6a2889bf87a17fc02',
  '0x3d4d8cbd9c1087e9463143cb9762c41f18ac0f03': '0xa3f5998047579334607c47a6a2889bf87a17fc02',
}

const artBlockOwners = new Set([
  '0x0d3ac0aba8efb92222bc050509a0c8d2fbfe6489',
  '0x126e6da0caefeaf104c6b9d022394a42567d9a38',
  '0x14774cf533e38a2c568287228c5ef9fd9bd6a0bf',
  '0x9E208146A28A653f6212d2931f316932015A312b',
].map(i => i.toLowerCase()))

async function tvl(ts, b, cb, { api }) {
  const balances = {}
  // Fetch positions from vaults
  const positions = await api.multiCall({ calls: VAULT_ARRAY, abi: abi.VAULT_ABI.totalPositions, })
  let tokens = await api.multiCall({ abi: 'address:nftContract', calls: VAULT_ARRAY })
  tokens = tokens.map(i => i.toLowerCase())
  const transform = t => mapping[t.toLowerCase()] || t

  tokens.forEach((v, i) => {
    if (artBlockOwners.has(v)) return;
    sdk.util.sumSingleBalance(balances, transform(v), positions[i], api.chain)
  })
  return sumTokens2({ api, balances, resolveArtBlocks: true, owners: [...artBlockOwners] })
}

module.exports = {
  tvl,
};
