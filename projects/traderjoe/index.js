const sdk = require('@defillama/sdk')
const {transformAvaxAddress} = require('../helper/portedTokens')
const {calculateUniTvl} = require('../helper/calculateUniTvl')
const {getCompoundV2Tvl} = require('../helper/compound')

const comptroller = "0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC"
async function swapTvl(timestamp, ethBlock, chainBlocks){
  const trans = await transformAvaxAddress()
  const balances = calculateUniTvl(trans, chainBlocks.avax, 'avax', '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10', 0, true)
  return balances
}

const { getChainTvl } = require('../helper/getUniSubgraphTvl');
const { staking } = require('../helper/staking')
const joeBar = "0x57319d41F71E81F3c65F2a47CA4e001EbAFd4F33"
const joeToken = "0x6e84a6216eA6dACC71eE8E6b0a5B7322EEbC0fDd"

const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange',
}
const chainTvl = getChainTvl(graphUrls, "factories", "liquidityUSD")("avax")

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology: 'We count liquidity on the pairs and we get that information from the "traderjoe-xyz/exchange" subgraph. The staking portion of TVL includes the JoeTokens within the JoeBar contract.',
  avalanche:{
    tvl: sdk.util.sumChainTvls([
      swapTvl,
      getCompoundV2Tvl(comptroller, "avax", addr=>`avax:${addr}`, "0xC22F01ddc8010Ee05574028528614634684EC29e", "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7")
    ]),
    borrowed: getCompoundV2Tvl(comptroller, "avax", addr=>`avax:${addr}`, "0xC22F01ddc8010Ee05574028528614634684EC29e", "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", true),
    staking: staking(joeBar, joeToken, "avax"),
  }
}
