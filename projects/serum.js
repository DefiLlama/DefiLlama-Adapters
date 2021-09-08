const axios = require("axios");
const { Connection, PublicKey } = require('@solana/web3.js');
const { Market } = require('@project-serum/serum');

const serumProgramId = '9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin'
const step = 1;

function add(balances, token, amount) {
  balances[token] = (balances[token] || 0) + amount
}

async function fetch() {
  let tvl = 0;
  const balances = {}
  const tokenPrices = {}

  const connection = new Connection('https://solana-api.projectserum.com/');
  const programId = new PublicKey(serumProgramId);
  const response = await axios.get('https://swap.sollet.io/api/markets');
  const markets = response.data.result;
  for (let i = 0; i < markets.length; i += step) {
    await Promise.all(markets.slice(i, i + step).map(async marketData => {
      const marketAddress = new PublicKey(marketData.address);
      const market = await Market.load(connection, marketAddress, {}, programId);
      const bids = await market.loadBids(connection);
      const asks = await market.loadAsks(connection);
      const ceil = Math.min(...Array.from(asks).map(ask => ask.price))
      const floor = Math.max(...Array.from(bids).map(ask => ask.price))
      if (floor === -Infinity || ceil === Infinity) return
      const price = (floor + ceil) / 2
      const [buyCurrency, quoteCurrency] = marketData.market.split('/')
      for (let order of Array.from(asks)) {
        add(balances, buyCurrency, order.size)
      }
      for (let order of Array.from(bids)) {
        add(balances, quoteCurrency, order.size * order.price)
      }

      if (quoteCurrency === 'USDT' || quoteCurrency === 'USDC') {
        tokenPrices[buyCurrency] = price
      }
    }))
  }
  tokenPrices['USDT'] = 1
  tokenPrices['USDC'] = 1

  Object.entries(balances).forEach(([token, balance]) => {
    const price = tokenPrices[token]
    if (price === undefined) {
      console.error(`There's no price for ${token}`)
      return
    }
    tvl += price * balance
  })
  return tvl;
}

module.exports = {
  fetch
}
