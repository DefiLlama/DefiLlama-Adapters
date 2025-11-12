const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')
const {
  bentPools,
  bentCVXAddress,
  weBent,
  bentCVXSingleStaking,
  pool2Address,
  sushiLpAddress,
  bentAddress,
} = require("./constants");

async function tvl(api) {
  const poolAddresses = Object.values(bentPools);
  const tokens = await api.multiCall({  abi: 'address:lpToken', calls: poolAddresses})
  const bals  = await api.multiCall({  abi: 'erc20:totalSupply', calls: poolAddresses})
  api.add(tokens, bals)
  return api.sumTokens({ owner: bentCVXSingleStaking, token: bentCVXAddress })

}

module.exports = {
  methodology: `TVL:BENT allows users to stake their curve LP tokens. For each supported curve pool LP token: Find the total supply of the LP token, Find the balance of LP staked in bent, Find the curve pool whose liquidity it represents, Enumerate the addresses of each token that makes up the pool, Get the balance of each token from 4, Use 1 & 2 to work out the LP share staked in bent, Multiply the token balances from 5 by the bent share to get the bent balances. Pool2 and staking: Pool2 and staking are fairly standard. Pool2 calculates fraction of LP staked as a share of the sushi LP and multiplies by the sushi LP coin balances. Staking simply takes the balance of the staking contract for BENT.`,
  ethereum: {
    tvl,
    pool2: pool2(pool2Address, sushiLpAddress),
    staking: staking(weBent, bentAddress),
  },
};
