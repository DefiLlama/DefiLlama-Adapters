// const LendingContract = "0xdc93413cbe690a1643d285c9f075b271372c9b36"
const { graphQuery } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

async function borrowed(api) {
  const query = `{
  loans(where: {id_not: "1", status: ACCEPTED, startTime_lte: "${api.timestamp}" }) {
    amount
  }
}`

  const { loans } = await graphQuery("https://api.thegraph.com/subgraphs/name/lucidao-developer/altr-lend", query);
  api.add(ADDRESSES.polygon.USDT, loans.map(i => i.amount));
  return api.getBalances()
}

module.exports = {
  methodology: "Determined by querying from our public TheGraph the total USD value of all active loans",
  start: 1707874007,
  polygon: {
    tvl: () => ({}),
    borrowed,
  },
}
