
const { clusterApiUrl, Connection } = require('@solana/web3.js')
const { Kamino } = require('@hubbleprotocol/kamino-sdk')
const { sleep } = require('../helper/utils')
const sdk = require('@defillama/sdk')

async function tvl() {
  const connection = new Connection(clusterApiUrl('mainnet-beta'));
  const kamino = new Kamino('mainnet-beta', connection); 
  
  // get all strategies supported by Kamino 
  const strategies = await kamino.getStrategies();
  sdk.log('strategies count:', strategies.length)
  const sBalances = []
  for (const s of strategies) {
    sBalances.push(await kamino.getStrategyBalances(s))
    await sleep(3000)
  }

	return  {
    tether: sBalances.reduce((a, i) => a + +i.computedHoldings.totalSum, 0)
  };
}

module.exports = {
  solana: { tvl },
};
