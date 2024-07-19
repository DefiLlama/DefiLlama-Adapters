const { getLogs } = require("../helper/cache/getLogs");

const BLOCK_START = 19068863;
const HELIX_FACTORY_CONTRACT = '0x274515B23B9c4Dd616C88A6C5D715F5C88A4cc36';

async function borrowed(api) {
  const logs = await getLogs({
    target: HELIX_FACTORY_CONTRACT,
    api,
    fromBlock: BLOCK_START,
    eventAbi: 'event DealCreated(address indexed deal, address indexed dealWallet, address indexed dealManager, address borrower, uint256 dbPrjId)',
    onlyArgs: true
  })
  const deals = logs.map(i => i.deal)
  const bals = await api.multiCall({  abi: 'uint256:dealTVL', calls: deals})
  const tokens = await api.multiCall({  abi: 'address:dealCurrency', calls: deals})
  api.add(tokens, bals)
  return api.getBalances()
}

module.exports = {
  ethereum: {
    tvl: () => ({}),
    borrowed,
  }
}; 