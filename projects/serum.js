const axios = require("axios");
const { Connection, PublicKey } = require('@solana/web3.js');
const { Market } = require('@project-serum/serum');

const serumProgramId = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'

async function fetch() {
  let tvl = 0;
  const balances = {}
  const tokenPrices = {}

  const connection = new Connection('https://solana-api.projectserum.com/');
  const programId = new PublicKey(serumProgramId);
  const markets = await axios.get('https://wallet-api.bonfida.com/cached/market-table')
  await Promise.all(markets.data.data.map(async marketData=>{
    const marketAddress = new PublicKey(marketData.address);
    const market = await Market.load(connection, marketAddress, {}, programId);
    const bids = await market.loadBids(connection);
    const asks = await market.loadAsks(connection);
    const ceil = Math.min(...Array.from(asks).map(ask=>ask.price))
    const floor = Math.max(...Array.from(bids).map(ask=>ask.price))
    if(floor === -Infinity || ceil === Infinity) return
    const price = (floor + ceil)/2
    let marketSize = 0;
    for (let order of Array.from(asks).concat(Array.from(bids))) {
      //console.log(order.size, order.side, order.price)
      marketSize += order.size
    }
    const [buyCurrency, quoteCurrency] = marketData.market.split('/')

    if(quoteCurrency === 'USDT'){
      tokenPrices[buyCurrency] = price
    }
    balances[quoteCurrency] = (balances[quoteCurrency] || 0) + marketSize*price
  }))
  tokenPrices['USDT'] = 1
  tokenPrices['USDC'] = 1
  Object.entries(balances).forEach(([token, balance])=>{
    const price = tokenPrices[token]
    if(price === undefined){
      return
    }
    tvl += price*balance
  })

  return tvl;
}

module.exports = {
  fetch
}
