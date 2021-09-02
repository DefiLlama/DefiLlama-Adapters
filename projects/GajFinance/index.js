const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const GAJ_TOKEN = '0xf4b0903774532aee5ee567c02aab681a81539e92'
const GAJ_AVAX_TOKEN = '0x595c8481c48894771CE8FaDE54ac6Bf59093F9E8'
const NFTFARM_GAJ = '0xce52df6E9ca6db41DC4776B1735fdE60f5aD5012'
const NFTFARM_GAJ_AVAX = '0x65096f7dB56fC27C7646f0aBb6F9bC0CEA2d8765'
const JUNGLEPOOL = '0xD45AB9b5655D1A3d58162ed1a311df178C04ddDe'

async function nftFarmTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedGaj = sdk.api.erc20.balanceOf({
      target: GAJ_TOKEN,
      owner: NFTFARM_GAJ,
      chain: 'polygon',
      block: chainBlocks.polygon
    })
    sdk.util.sumSingleBalance(balances, 'polygon:' + GAJ_TOKEN, (await stakedGaj).output)
    return balances
}

async function nftFarmAvaxTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedGaj = sdk.api.erc20.balanceOf({
      target: GAJ_AVAX_TOKEN,
      owner: NFTFARM_GAJ_AVAX,
      chain: 'avax',
      block: chainBlocks.avax
    })
    sdk.util.sumSingleBalance(balances, 'avax:' + GAJ_AVAX_TOKEN, (await stakedGaj).output)
    return balances
}

async function JunglePoolTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedGaj = sdk.api.erc20.balanceOf({
      target: GAJ_TOKEN,
      owner: JUNGLEPOOL,
      chain: 'polygon',
      block: chainBlocks.polygon
    })
    sdk.util.sumSingleBalance(balances, 'polygon:' + GAJ_TOKEN, (await stakedGaj).output)
    return balances
}

module.exports = {
  misrepresentedTokens: true,
  junglepool:{
    tvl: JunglePoolTvl,
  },
  nftfarm:{
    tvl: nftFarmTvl,
  },
  avax_nftfarm:{
    tvl: nftFarmAvaxTvl,
  },
  methodology: "TVL comes from NFT Farming and Jungle Pools",
  tvl: sdk.util.sumChainTvls([JunglePoolTvl, nftFarmTvl, nftFarmAvaxTvl])
}
