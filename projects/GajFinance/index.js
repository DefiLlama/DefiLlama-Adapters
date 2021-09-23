const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs');
const { fetchURL } = require("../helper/utils");
const vaultabi = require("./vaultabi.json");
const { transformAvaxAddress } = require("../helper/portedTokens");
const { transformPolygonAddress } = require("../helper/portedTokens");

const GAJ_TOKEN = '0xf4b0903774532aee5ee567c02aab681a81539e92'
const GAJ_AVAX_TOKEN = '0x595c8481c48894771CE8FaDE54ac6Bf59093F9E8'
const MASTER_GAJ = '0xb03f95e649724df6ba575c2c6ef062766a7fdb51'
const NFTFARM_GAJ = '0xce52df6E9ca6db41DC4776B1735fdE60f5aD5012'
const NFTFARM_GAJ_AVAX = '0x65096f7dB56fC27C7646f0aBb6F9bC0CEA2d8765'
const JUNGLEPOOL = '0xD45AB9b5655D1A3d58162ed1a311df178C04ddDe'

const nativeEndpoint = "https://gajvaultapi.herokuapp.com/native"
const nonNativeEndpoint = "https://gajvaultapi.herokuapp.com/nonNative"

async function staking(timestamp, ethBlock, chainBlocks) {
  const balances = {};
  await sumTokensAndLPsSharedOwners(balances, [[GAJ_TOKEN, false]], [NFTFARM_GAJ, MASTER_GAJ, JUNGLEPOOL], chainBlocks.polygon, 'polygon', addr => `polygon:${addr}`)
  await sumTokensAndLPsSharedOwners(balances, [[GAJ_AVAX_TOKEN, false]], [NFTFARM_GAJ_AVAX], chainBlocks.avax, 'avax', addr => `avax:${addr}`)
  return balances
}

async function vaultsNonNative(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const vaults = (await fetchURL(nativeEndpoint)).data.filter(v => {
      const pool2 = v.vaultName.includes("GAJ")
      return !pool2
    })
    const balance = (
    await sdk.api.abi.multiCall({
      abi: abi.balanceOfPool,
      calls: vaults.map((vault) => ({
        target: vault.contractAddress,
      })),
      block,
      ...((chain == "avax" || chain == "polygon") && { chain }),
    })
  ).output.map((bal) => bal.output);
  
  
  const lpPositions = [];
  for (const vault of vaults) {
      lpPositions.push({
        token: vault.contractAddress,
        balance: balance[vault.id],
      });
   }
 
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    chain == "avax"
      ? await transformAvaxAddress()
      : await transformPolygonAddress()
  );
  return balances
}

async function vaultsNative(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const vaults = (await fetchURL(nonNativeEndpoint)).data.filter(v => {
      const pool2 = v.vaultName.includes("GAJ")
      return pool2
    })
    const balance = (
    await sdk.api.abi.multiCall({
      abi: abi.balanceOfPool,
      calls: vaults.map((vault) => ({
        target: vault.contractAddress,
      })),
      block,
      ...((chain == "avax" || chain == "polygon") && { chain }),
    })
  ).output.map((bal) => bal.output);
  
  
  const lpPositions = [];
  for (const vault of vaults) {
      lpPositions.push({
        token: vault.contractAddress,
        balance: balance[vault.id],
      });
   }
 
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    chain == "avax"
      ? await transformAvaxAddress()
      : await transformPolygonAddress()
  );
  return balances
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "TVL comes from NFT Farming, Jungle Pools, MasterChef and Vaults",
  tvl: vaultsNonNative,
  staking: {
    tvl: staking
  },
  pool2:{
    tvl: vaultsNative
  }
}
