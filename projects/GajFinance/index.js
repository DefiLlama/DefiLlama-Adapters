const sdk = require("@defillama/sdk");
const { sumTokensAndLPsSharedOwners, unwrapUniswapLPs } = require('../helper/unwrapLPs');
const { fetchURL } = require("../helper/utils");
const vaultabi = require("./vaultabi.json");
const { transformAvaxAddress, transformPolygonAddress } = require("../helper/portedTokens");

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

function vaults(pool2, selectedChain) {
  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
    const vaults = (await fetchURL(pool2 ? nativeEndpoint : nonNativeEndpoint)).data
    for (const vault of vaults) { // Can't aggregate calls because there are multiple chains
      const chain = vault.chain.toLowerCase()
      if(selectedChain !== undefined && chain !== selectedChain){
        continue
      }
      const block = chainBlocks[chain]
      const balance = (
        await sdk.api.abi.call({
          abi: vaultabi.balanceOfPool,
          target: vault.contractAddress,
          block,
          chain
        })
      ).output


      const lpPositions = [{
        balance,
        token: vault.pairAddress
      }];

      await unwrapUniswapLPs(
        balances,
        lpPositions,
        block,
        chain,
        chain == "avax"
          ? await transformAvaxAddress()
          : await transformPolygonAddress()
      );
    }
    return balances
  }
}

module.exports = {
  methodology: "TVL comes from NFT Farming, Jungle Pools, MasterChef and Vaults",
  tvl: vaults(false),
  avalanche:{
    tvl: vaults(false, 'avax')
  },
  polygon:{
    tvl: vaults(false, 'polygon')
  },
  staking: {
    tvl: staking
  },
  pool2: {
    tvl: vaults(true)
  }
}
