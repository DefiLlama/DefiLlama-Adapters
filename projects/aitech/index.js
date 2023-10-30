const sdk = require("@defillama/sdk");
const { getUniTVL } = require('../helper/unknownTokens.js')

const aitechStakingContract = '0x2C4dD7db5Ce6A9A2FB362F64fF189AF772C31184';
const aitechTokenContract = '0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944';
const pancakeswapFactory = '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73';



async function poolsTvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const stakedAITECH = sdk.api.erc20.balanceOf({
      target: aitechTokenContract,
      owner: aitechStakingContract,
      chain: 'bsc',
      block: chainBlocks.bsc
    })
    sdk.util.sumSingleBalance(balances, 'bsc:' + aitechTokenContract, (await stakedAITECH).output)
    return balances
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: uniTvlExport(pancakeswapFactory, 'bsc', true),
    staking: poolsTvl
  },
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the AITECH on 0x2D060Ef4d6BF7f9e5edDe373Ab735513c0e4F944",
}