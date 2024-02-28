const { getLogs } = require('../helper/cache/getLogs')
const config = {
  mode: { factory: '0x4D1b18A7BDB8D0a02f692398337aBde8DeB8FB09', fromBlock: 4381503, },
}

function convert(baseQuote, isBid, price, amount) {
  const decDiff = 10 ** (Math.abs(baseQuote[2] - baseQuote[3]));
  const baseBquote = baseQuote[2] > baseQuote[3];
  if (isBid) {
    // convert quote to base
    return baseBquote
            ? ((amount * price) / 1e8) / decDiff
            : ((amount * price) / 1e8) * decDiff;
  } else {
    // convert base to quote
    return baseBquote
            ? ((amount * 1e8) / price) * decDiff
            : ((amount * 1e8) / price) / decDiff;
  }
}

Object.keys(config).forEach(chain => {
  const { factory, fromBlock } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const logs = await getLogs({ api, target: factory, eventAbi: 'event PairAdded(address orderbook, address base, address quote, uint8 bDecimal, uint8 qDecimal)', onlyArgs: true, fromBlock, })
      const ownerTokens = logs.map(log => [[log.base, log.quote], log.orderbook])
      return api.sumTokens({ ownerTokens })
    },
    volume: async (_, _b, _cb, { api, }) => {
      const pairLogs = await getLogs({ api, target: factory, eventAbi: 'event PairAdded(address orderbook, address base, address quote, uint8 bDecimal, uint8 qDecimal)', onlyArgs: true, fromBlock, })
      const baseQuote = {};
      // get base and quote from each pair log
      pairLogs.map((log) => {
        baseQuote[log.orderbook] = [log.base, log.quote, log.bDecimal, log.qDecimal]
      });
      // get all matched event
      const logs = await getLogs({ api, target: factory, eventAbi: 'event OrderMatched( address orderbook, uint256 id, bool isBid, address sender, address owner, uint256 price, uint256 amount)', onlyArgs: true, fromBlock, })
      const senderVolume = 0;
      const ownerVolume = 0;

      logs.map((log) => {
        // if isBid=True, matching amount is quote asset, if not matching amount is base asset
        const amount = log.amount;
        // convert matched amount with price and pair decimals for corresponding traded asset
        const converted = convert(baseQuote[log.orderbook], log.isBid, log.price, log.amount)
      })
      // sum up each asset volume into one 
      // return api.sumTokens({ ownerTokens})
    }
  }
})