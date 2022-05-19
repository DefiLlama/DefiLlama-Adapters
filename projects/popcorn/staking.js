const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform } = require('../helper/portedTokens')
const { getBlock } = require('../helper/getBlock')

// gets balance of staking token held by the array of staking contract addresses.
function staking(stakingContracts, stakingToken, chain = "ethereum", transformedTokenAddress = undefined, decimals = undefined) {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, chain, chainBlocks)
    const bal = (await sdk.api.abi.multiCall({
      calls: stakingContracts.map(c => ({ target: stakingToken, params: [c] })),
      chain,
      block,
      abi: "erc20:balanceOf"
    })).output.reduce((total, call) => BigNumber(total).plus(call.output).toFixed(0), "0")
    let address = stakingToken;
    if (transformedTokenAddress) {
      address = transformedTokenAddress
    } else {
      address = (await getChainTransform(chain))(stakingToken)
    }
    if (decimals !== undefined) {
      return {
        [address]: Number(bal) / (10 ** decimals)
      }
    }
    return {
      [address]: bal
    }
  }
}

module.exports = {
  staking
}