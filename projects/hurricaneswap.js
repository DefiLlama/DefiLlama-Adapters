const sdk = require('@defillama/sdk')
const { getChainTvl } = require('./helper/getUniSubgraphTvl');
const { getBlock } = require('./helper/getBlock');
const { default: BigNumber } = require('bignumber.js');

const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/hurricaneswap/exchange-v2',
}
const chainTvl = getChainTvl(graphUrls, "pancakeFactories")("avax")

const xhctBar = "0x75B797a0ed87F77bB546F3A3556F18fC35a01140"
const shctBar = "0xE4aE2E8648B8E84c4A487a559b04e884B822a350"
const hctToken = "0x45C13620B55C35A5f539d26E88247011Eb10fDbd"

function stakings(stakingContracts, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
  const AVAXToken = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
  const masterChef = "0x1c9F36FE608190D1fe99e001b596c31871696b24"
  return async (timestamp, _ethBlock, chainBlocks) => {
      const block = await getBlock(timestamp, chain, chainBlocks)
      const bal = (await sdk.api.abi.multiCall({
          calls: stakingContracts.map(c => ({ target: stakingToken, params: [c] })),
          chain,
          block,
          abi: "erc20:balanceOf"
      })).output.reduce((total, call)=> BigNumber(total).plus(call.output).toFixed(0), "0")
      let address = stakingToken;
      if (transformedTokenAddress) {
          address = transformedTokenAddress
      } else if (chain !== "ethereum") {
          address = `${chain}:${stakingToken}`
      }
      const stakedAVAX = (await sdk.api.erc20.balanceOf({
        target: AVAXToken,
        owner: masterChef,
        chain,
        block
      })).output
      let balances 
      if (decimals !== undefined) {
          balances = {
              [address]: Number(bal) / (10 ** decimals)
          }
      }
      balances = {
          [address]: bal
      }
      console.log(stakedAVAX)
      console.log((await stakedAVAX).output)
      sdk.util.sumSingleBalance(balances, AVAXToken, stakedAVAX)
      return balances
  }
}

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology: 'We count TVL from the "hurricaneswap/exchange-v2" subgraph, which includes all pairs data of HurricaneSwap. The staking portion includes the liquidity in the HCTBar (xHCT), StakingReward (sHCT) contract and the WAVAX deposited in pool contract.',
  avalanche:{
    tvl: chainTvl,
    staking: stakings([xhctBar,shctBar ], hctToken, "avax"),
  }
}
