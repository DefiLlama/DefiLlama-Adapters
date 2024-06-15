const { getPoolAddresses, getPoolDetails, tvl } = require('./v1');

function getTvl(chain, factoryAddress) {
  return async (api)=> {
    const balances = api.getBalances()
    const { block } = api

    // get list of pools
    const poolAddresses = await getPoolAddresses(factoryAddress, block, chain)
    // get pools detail
    const [tokens, reserves, withdrawingLiquidities] = await getPoolDetails(poolAddresses, block, chain)
    // sum tvl
    tvl(balances, tokens, reserves, withdrawingLiquidities)
  }
}

module.exports = {
  methodology: "Counts the tokens locked in the contracts to earn yield. Withdrawing tokens are not counted towards the TVL.",
  era: {
    tvl: getTvl("era", "0x846FcA826196B3D674fd1691Bb785F3E4216bc0F"),
  },
};

// node test.js projects/tivel-finance/index.js