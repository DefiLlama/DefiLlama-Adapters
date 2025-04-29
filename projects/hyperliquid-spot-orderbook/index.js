const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios')
const WebSocket = require('ws')

const USDC = ADDRESSES.ethereum.USDC
const API_URL = 'https://api.hyperliquid.xyz/info'

const assetsInfos = async () => {
  const payload = { "type": "spotMetaAndAssetCtxs" }
  const { data } = await axios.post(API_URL, payload)

  return data[0].tokens.map((token) => {
    const ctxToken = data[1].find((item) => item.coin.replace("@", "") == token.index);
    return { ...token, ...ctxToken };
  });
}

const nSigFigs = 2
const getOrderbooks = async () => {
  const assets = await assetsInfos()
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('wss://api-ui.hyperliquid.xyz/ws');
    let coins = []
    let spotCoins = assets.map(asset => asset.coin).filter(Boolean)
    const receivedMessages = new Map(); // Track messages received per coin
    let allMids = null
    
    ws.on('open', () => {
      ws.send(JSON.stringify({"method":"subscribe","subscription":{"type":"allMids"}}));
    });

    ws.on('message', (data) => {
      const response = JSON.parse(data);
      // Check if message is for a specific coin
      if (response.channel === "l2Book" && response.data.coin) {
        if(!receivedMessages.has(response.data.coin)){
          receivedMessages.set(response.data.coin, response.data);
          ws.send(JSON.stringify({"method":"unsubscribe","subscription":{"type":"l2Book","coin":response.data.coin, nSigFigs}}));

          if (coins.every(coin => receivedMessages.has(coin))) {
            ws.close();
            resolve({
              books: Array.from(receivedMessages.values()),
              allMids: allMids
            });
          }
        }
      } else if (response.channel === "allMids" && allMids === null) {
        allMids = response.data.mids
        ws.send(JSON.stringify({"method":"unsubscribe","subscription":{"type":"allMids"}}));
        coins = Object.keys(allMids).filter(coin => spotCoins.includes(coin))
        coins.forEach(coin => {
          const subscriptionMsg = {
            method: "subscribe",
            subscription: {
              type: "l2Book", 
              coin: coin,
              nSigFigs
            }
          };
          ws.send(JSON.stringify(subscriptionMsg));
        });
      } else if(response.channel !== "subscriptionResponse"){
        console.log(response)
      }
    });

    ws.on('error', (error) => {
      reject(error);
    });

    // Add timeout to prevent hanging
    setTimeout(() => {
      ws.close();
      reject(new Error('WebSocket subscription timed out'));
    }, 10000);
  });
}


const tvl = async (api) => {
  const orderbooks = await getOrderbooks()
  let totalBalance = 0
  orderbooks.books.forEach(book => {
    const price = orderbooks.allMids[book.coin]
    const buySide = book.levels[0].reduce((sum, ask) => sum + Number(ask.sz)*Number(ask.px), 0)
    const sellSide = price * book.levels[1].reduce((sum, ask) => sum + Number(ask.sz), 0)
    const totalFromCoin =  buySide + sellSide
    totalBalance += totalFromCoin
  })

  return api.add(USDC, totalBalance * 1e6, { skipChain: true })
}

module.exports = {
  methodology: 'TVL represents assets locked in limit order on the spot order book',
  misrepresentedTokens: true,
  hyperliquid: { tvl }
}