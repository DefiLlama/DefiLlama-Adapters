const sdk = require('@defillama/sdk');
const { default: BigNumber } = require('bignumber.js');
const { getChainTransform } = require('../helper/portedTokens')
const { addRewardsEscrowTVL } = require("./rewardsEscrow")

// gets balance of staking token held by the array of staking contract addresses.
function staking(isStakingEnabled, stakingContracts, stakingToken, chain = "ethereum",) {
  return async (timestamp, _ethBlock, chainBlocks) => {
    const block = chainBlocks[chain]
    const balances = {};
    if (isStakingEnabled) {
      const bal = (await sdk.api.abi.multiCall({
        calls: stakingContracts.map(c => ({ target: stakingToken, params: [c] })),
        chain,
        block,
        abi: "erc20:balanceOf"
      })).output.reduce((total, call) => BigNumber(total).plus(call.output).toFixed(0), "0")
      let address = stakingToken;
      address = (await getChainTransform(chain))(stakingToken)
      sdk.util.sumSingleBalance(balances, address, bal)
    }
    await addRewardsEscrowTVL(balances, timestamp, chainBlocks, chain)
    return balances
  }
}

module.exports = {
  staking
}