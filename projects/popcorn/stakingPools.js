const sdk = require('@defillama/sdk');
const { getChainTransform } = require('../helper/portedTokens')
const { ADDRESSES } = require("./constants");
const { unwrapUniswapLPs } = require('../helper/unwrapLPs');

function getStakingPools(chain) {
  if (chain === 'ethereum') {
    // uni v3 and gelato pools
    return [
      {
        stakingContract: ADDRESSES.ethereum.popUsdcGelatoLpStaking,
        stakingToken: ADDRESSES.ethereum.popUsdcGelatoLp,
        isGelatoPoolToken: true
      },
     
    ]

  } else if (chain === 'polygon') {
    return [{
      stakingContract: ADDRESSES.polygon.arrakisPoolStaking,
      stakingToken: ADDRESSES.polygon.arrakisPool,
      isGelatoPoolToken: true
    }]
  }
  return []
}


async function addStakingPoolsTVL(balances, timestamp, chainBlocks, chain = "ethereum") {
  const stakingPools = getStakingPools(chain);
  const block = chainBlocks[chain]
  for (let i = 0; i < stakingPools.length; i++) {
    let pool = stakingPools[i]
    let stakingTokenBalance = (await sdk.api.abi.call({
      target: pool.stakingToken,
      params: [pool.stakingContract],
      chain,
      block,
      abi: "erc20:balanceOf"
    })).output;

    const lpPositions = [{ token: pool.stakingToken, balance: stakingTokenBalance }]
    await unwrapUniswapLPs(balances, lpPositions, block, chain, undefined, undefined, false, pool.isGelatoPoolToken ? 'gelato' : undefined,)
    let tokens = Object.keys(balances);
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i]
      let transformedAddress = (await getChainTransform(chain))(token);
      if (transformedAddress === "polygon:0xd0cd466b34a24fcb2f87676278af2005ca8a78c4") {
        transformedAddress = ADDRESSES.ethereum.pop
      }
      if (transformedAddress !== token) {
        sdk.util.sumSingleBalance(balances, transformedAddress, balances[token])
        delete balances[token]
      }
    }
  }
}

module.exports = {
  addStakingPoolsTVL
}