const sdk = require("@defillama/sdk");
const {calculateUniTvl} = require('../helper/calculateUniTvl.js')

const GAJ_TOKEN = '0xf4b0903774532aee5ee567c02aab681a81539e92'
const MASTER_GAJ = '0xb03f95e649724df6ba575c2c6ef062766a7fdb51'
const NFTFARM_GAJ = '0xce52df6E9ca6db41DC4776B1735fdE60f5aD5012'

async function masterChefTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedGaj = sdk.api.erc20.balanceOf({
      target: GAJ_TOKEN,
      owner: MASTER_GAJ,
      chain: 'polygon',
      block: chainBlocks.polygon
    })
    sdk.util.sumSingleBalance(balances, 'polygon:' + GAJ_TOKEN, (await stakedGaj).output)
    return balances
}

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

module.exports = {
  misrepresentedTokens: true,
  masterchef:{
    tvl: masterChefTvl,
  },
  nftfarm:{
    tvl: nftFarmTvl,
  },
  methodology: "TVL comes from NFT Farming and Masterchef",
  tvl: sdk.util.sumChainTvls([masterChefTvl, nftFarmTvl])
}
