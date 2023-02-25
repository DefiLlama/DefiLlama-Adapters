const { Kamino } = require('@hubbleprotocol/kamino-sdk')
const { sleep } = require('../helper/utils')
const { getConnection, } = require('../helper/solana')
const { PromisePool } = require('@supercharge/promise-pool')
const sdk = require('@defillama/sdk')
const { PublicKey } = require("@solana/web3.js")
const { default: axios } = require("axios")

async function tvl() {
  const kamino = new Kamino('mainnet-beta', getConnection());

  // get all enabled Kamino strategies
  const strategyList = (await axios.get("https://api.hubbleprotocol.io/strategies/enabled?env=mainnet-beta")).data.map(i => new PublicKey(i.address))
  sdk.log('strategies count:', strategyList.length)
  const sBalances = []

  const { errors } = await PromisePool
    .withConcurrency(3)
    .for(strategyList)
    .process(async s => {
      const shareData = await kamino.getStrategyShareData(s);
      sBalances.push(shareData.balance.computedHoldings.totalSum);
      await sleep(1000)
    })

  if (errors && errors.length)
    throw errors[0]

  return {
    tether: sBalances.reduce((a, i) => a + i.toNumber(), 0)
  };
}

module.exports = {
  solana: { tvl },
};
