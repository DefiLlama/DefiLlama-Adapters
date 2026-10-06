const { getLogs } = require('../helper/cache/getLogs')

const FACTORY = '0x9ace767D8654F79cD63a959C103c8ceb70DCffcb'
const FROM_BLOCK = 75186640

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: FACTORY,
    eventAbi: 'event TokenCreated(address indexed token, address indexed curve, address indexed creator, bytes32 imageHash, bool original)',
    fromBlock: FROM_BLOCK,
    onlyArgs: true,
  })
  if (!logs.length) return
  const quotes = await api.multiCall({
    abi: 'uint256:realQuote',
    calls: logs.map(i => i.curve),
    permitFailure: true,
  })
  for (const quote of quotes) if (quote) api.addGasToken(quote)
}

module.exports = {
  methodology: 'ETH sitting on live BullGems curves (realQuote). The memecoin, virtual reserves, fee pots and treasury are not included.',
  robinhood: { tvl, start: '2026-09-28' },
}
