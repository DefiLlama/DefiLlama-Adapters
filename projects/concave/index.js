const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js");
const { ohmTvl } = require('../helper/ohm')
const cvx_abi = require('./cvx_abi.json')
const crv_abi = require('./crv_abi.json')
const cvxBoosterAddress = "0xF403C135812408BFbE8713b5A23a04b3D48AAE31";

// Treasury backing the CNV price, similar to OHM so using the ohm wrapper
const treasury = '0x226e7af139a0f34c6771deb252f9988876ac1ced' 
const etherAddress = '0x0000000000000000000000000000000000000000'
const cnv_token = '0xdea1fc87b6f4536e852aea73aeb8f4ac0cf843c3'
const stakingAddress = '0x0000000000000000000000000000000000000000'
const treasuryTokens = [
    ['0x6b175474e89094c44da98b954eedeac495271d0f', false], //DAI
    ['0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', false], //gOHM
]

// Generic CRV position unwrapping, useful for a CVX position unwrapping
// CVX treasury position parameters
const cvxUST_whv23CRV_BaseRewardPool = '0x7e2b9b5244bcfa5108a76d5e7b507cfd5581ad4a'
// const cvxUST_whv23CRV_f = '0x2d2006135e682984a8a2eb74f5c87c2251cc71e9' // CVX LP, queried via stakingToken method on baseRewardPool
// const UST_whv23CRV_f = '0xceaf7747579696a2f0bb206a14210e3c9e6fb269' // Crv LP, Derived  from the poolInfo method on the convex booster contract, using pool_id

async function genericUnwrapCrv(balances, crvToken, lpBalance, block, chain) {
  const {output: resolvedCrvTotalSupply} = await sdk.api.erc20.totalSupply({
    target: crvToken,
    chain, block })

  // Get Curve LP token balances
  // A while-loop would need a try-catch because sending error when idx > tokens_count
  const {output: crv_symbol} = await sdk.api.abi.call({
    abi: 'erc20:symbol', 
    target: crvToken,
    chain,
    block
  })
  const LP_tokens_count = 1 + (crv_symbol.match(/_/g) || []).length
  const coins_indices = Array.from(Array(LP_tokens_count).keys())
  const coins = (await sdk.api.abi.multiCall({
    abi: crv_abi['crvLP_coins'], 
    calls: coins_indices.map(i => ({params: [i]})),
    target: crvToken,
    chain,
    block
  })).output.map(c => c.output)
  const crvLP_token_balances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf', 
    calls: coins.map(c => ({
      target: c,
      params: crvToken,
    })),
    chain,
    block
  })

  // Edit the balances to weigh with respect to the wallet holdings of the crv LP token
  crvLP_token_balances.output.forEach(call => 
    call.output = BigNumber(call.output).times(lpBalance).div(resolvedCrvTotalSupply).toFixed(0)
  )
  sdk.util.sumMultiBalanceOf(balances, crvLP_token_balances);
}

async function genericUnwrapCvx(balances, holder, cvx_BaseRewardPool, block, chain)  {
    // Compute the balance of the treasury of the CVX position and unwrap
  const [
    {output: cvx_LP_bal}, 
    {output: pool_id}
  ] = await Promise.all([
    sdk.api.abi.call({
      abi: cvx_abi['cvxBRP_balanceOf'], // cvx_balanceOf cvx_earned cvx_rewards cvx_userRewardPerTokenPaid
      target: cvx_BaseRewardPool,
      params: [holder],
      chain, block
    }),
    // const {output: pool_id} = await 
    sdk.api.abi.call({
      abi: cvx_abi['cvxBRP_pid'], 
      target: cvx_BaseRewardPool,
      chain, block
    })
  ])
  const {output: crvPoolInfo} = await sdk.api.abi.call({
    abi: cvx_abi['cvxBooster_poolInfo'],
    target: cvxBoosterAddress,
    params: [pool_id],
    chain,
    block: block,
  })
  await genericUnwrapCrv(balances, crvPoolInfo.lptoken, cvx_LP_bal, block, chain)
}


async function tvl(timestamp, ethBlock, chainBlocks) {
  // Get ether balance
  const balances = {
    [etherAddress]: (await sdk.api.eth.getBalance({ target: treasury, ethBlock })).output
  }

  // Compute the balance of the treasury of the CVX position and unwrap
  const chain = 'ethereum'
  await genericUnwrapCvx(balances, treasury, cvxUST_whv23CRV_BaseRewardPool, ethBlock, chain)

  return balances
}


module.exports = ohmTvl(treasury, treasuryTokens, 'ethereum', stakingAddress, cnv_token, undefined, undefined, true)
module.exports.ethereum.tvl = sdk.util.sumChainTvls([tvl, module.exports.ethereum.tvl])
module.exports.methodology = 'Count the treasury assets (cvx position, ohm etc) baackin the CNV price'