const { ohmTvl } = require('../helper/ohm')
const abi = require('./abi.json')
const sdk = require('@defillama/sdk')

const treasury = '0x226e7af139a0f34c6771deb252f9988876ac1ced' 
const cnv_token = '0xdea1fc87b6f4536e852aea73aeb8f4ac0cf843c3'
const stakingAddress = '0x0000000000000000000000000000000000000000'
const treasuryTokens = [
    ['0x6b175474e89094c44da98b954eedeac495271d0f', false], //DAI
    ['0x0ab87046fBb341D058F17CBC4c1133F25a20a52f', false], //gOHM

    // ['0xa3fa99a148fa48d14ed51d610c367c61876997f1', false], //MAI
   ]
module.exports = ohmTvl(treasury, treasuryTokens, 'ethereum', stakingAddress, cnv_token, undefined, undefined, true)



const cvxUST_whv23CRV_BaseRewardPool = '0x7e2b9b5244bcfa5108a76d5e7b507cfd5581ad4a'
const cvxUST_whv23CRV_f = '0x2d2006135e682984a8a2eb74f5c87c2251cc71e9' // CVX LP, base reward pool holds 100% of that token plus some crv. Can be queried via stakingToken method on baseRewardPool
const UST_whv23CRV_f = '0xceaf7747579696a2f0bb206a14210e3c9e6fb269' // Crv LP, Best would be to derive it from the baseRewardPool or cvx contract
const abi_crvLP_coins = {"stateMutability":"view","type":"function","name":"coins","inputs":[{"name":"arg0","type":"uint256"}],"outputs":[{"name":"","type":"address"}],"gas":3123}

async function testConvexTvl(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  const chain = 'ethereum'
  const {output: cvx_LP_bal} = await sdk.api.abi.call({
    abi: abi['cvx_balanceOf'], // cvx_balanceOf cvx_earned cvx_rewards cvx_userRewardPerTokenPaid
    target: cvxUST_whv23CRV_BaseRewardPool,
    params: [treasury],
    chain,
    block: ethBlock,
  })
  console.log(cvx_LP_bal)

  const {output: crv_supply} = await sdk.api.abi.call({
    abi: 'erc20:totalSupply', 
    target: UST_whv23CRV_f,
    chain,
    block: ethBlock,
  })
  
  // const coins = []
  // let coins_idx = 0
  // A while-loop would need a try-catch because sending error when idx > tokens_count
  // while (coins_idx >= 0) {
  //   console.log(coins_idx)
  //   try {
  //     const coins_i_response = await sdk.api.abi.call({
  //       abi: abi_crvLP_coins, 
  //       params: [coins_idx],
  //       target: UST_whv23CRV_f,
  //       chain,
  //       block: ethBlock,
  //     })
  //     console.log(coins_i_response)
  //     if (coins_i_response && coins_i_response.output) {
  //       coins.push(coins_i_response.output)
  //       coins_idx ++;
  //     } else {
  //       coins_idx = -1
  //     }
  //   } catch {
  //     break
  //   }
  // }
  const {output: crv_symbol} = await sdk.api.abi.call({
    abi: 'erc20:symbol', 
    target: UST_whv23CRV_f,
    chain,
    block: ethBlock,
  })
  const LP_tokens_count = 1 + (crv_symbol.match(/_/g) || []).length
  const coins_indices = Array.from(Array(LP_tokens_count).keys())
  console.log(coins_indices)
  const {output: coins_response} = await sdk.api.abi.multiCall({
    abi: abi_crvLP_coins, 
    calls: coins_indices.map(i => ({params: [i]})),
    target: UST_whv23CRV_f,
    chain,
    block: ethBlock,
  })
  const coins = coins_response.map(c => c.output)
  console.log(coins)
  const crvLP_token_balances = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf', 
    calls: coins.map(c => ({
      target: c,
      params: UST_whv23CRV_f,
    })),
    chain,
    block: ethBlock,
  })
  console.log('crvLP_token_balances', crvLP_token_balances)

  // Edit the balances to weigh with respect to the wallet holdings of the crv LP token

  sdk.util.sumMultiBalanceOf(balances, crvLP_token_balances);

  

  return balances
}


module.exports.ethereum.tvl = testConvexTvl

// TODO: missing ether balance
// TODO: missing CVX UST/3crv position, which is 99% of the treasury balance