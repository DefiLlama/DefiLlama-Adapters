
const { Kamino } = require('@hubbleprotocol/kamino-sdk')
const { sleep } = require('../helper/utils')
const { getConnection } = require('../helper/solana')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')

async function tvl() {
  const kamino = new Kamino('mainnet-beta', getConnection());

  // get all strategies supported by Kamino 
  const strategies = await kamino.getStrategies();
  sdk.log('strategies count:', strategies.length)
  const sBalances = []

  const { errors } = await PromisePool
    .withConcurrency(5)
    .for(strategies)
    .process(async s => {
      sBalances.push(await kamino.getStrategyBalances(s))
      await sleep(2000)
    })

  if (errors && errors.length)
    throw errors[0]

  return {
    tether: sBalances.reduce((a, i) => a + +i.computedHoldings.totalSum, 0)
  };
}

module.exports = {
  solana: { tvl },
};
