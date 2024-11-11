const { getLogs } = require('../helper/cache/getLogs')

const config = {
  ethereum: {
    addr: '0xb16df6f4a58ecb26fab8e09a5195c062a08e21bc',
    fromBlock: 21128067,
  },
  bsc: {
    addr: '0x777ba19c9480c158941419c5d046832a120d42c8',
    fromBlock: 43769537,
  },
  bouncebit: {
    addr: '0xc4F65Bbdd0B9eCFeaA253a65DC0601C97061a02C',
    fromBlock: 5114582,
  }
}

async function tvl(api) {
  const { chain } = api
  const contract = config[chain]

  const openedLogs = await getLogs({
    extraKey: 'bouncebit-cedefi-01',
    api,
    target: contract.addr,
    fromBlock: contract.fromBlock,
    topics: ['0x0267b5ba596625864ff2ea09bacaa5d24b6089a4cbd9e727316aa2d32e8ed360'],
    eventAbi: 'event Opened(address indexed token, uint256 indexed strategyId, address indexed account, uint256, uint256, uint128 assets)',
    onlyArgs: true,
  })

  const rebasedLogs = await getLogs({
    extraKey: 'bouncebit-cedefi-02',
    api, 
    target: contract.addr,
    fromBlock: contract.fromBlock,
    topics: ['0x9ba01bfbd1abdae22ef89e290397b701f17fabada181012fb5175c674dc6f4a2'],
    eventAbi: 'event Rebased(address indexed token, address indexed account, uint256 indexed strategy, uint256, uint256 amount)',
    onlyArgs: true,
  })

  const normalClosedLogs = await getLogs({
    extraKey: 'bouncebit-cedefi-03',
    api,
    target: contract.addr,
    fromBlock: contract.fromBlock,
    topics: ['0x224282f8be4992654d94d4c85ac7cb330e5816984a67e566004978248b571453'],
    eventAbi: 'event NormalClosed(address indexed token, uint256 indexed strategyId, address indexed account, uint256, uint256, uint128, uint128 sharesAmount)',
    onlyArgs: true,
  })

  const fastClosedLogs = await getLogs({
    extraKey: 'bouncebit-cedefi-04',
    api,
    target: contract.addr,
    fromBlock: contract.fromBlock,
    topics: ['0xfce6a69a0d23d783f8e99b9474c89e1fb73305c9deffb4076c31c24e52c04af9'],
    eventAbi: 'event FastClosed(address indexed token, uint256 indexed strategyId, address indexed account, uint256, uint256, uint128 assets, uint128, uint128 fee)',
    onlyArgs: true,
  })

  const tokenBalances = {}
  openedLogs.forEach(log => {
    const token = log.token.toLowerCase()
    tokenBalances[token] = (tokenBalances[token] || 0) + Number(log.assets)
  })

  rebasedLogs.forEach(log => {
    const token = log.token.toLowerCase() 
    tokenBalances[token] = (tokenBalances[token] || 0) + Number(log.amount)
  })

  normalClosedLogs.forEach(log => {
    const token = log.token.toLowerCase()
    tokenBalances[token] = (tokenBalances[token] || 0) - Number(log.sharesAmount) 
  })

  fastClosedLogs.forEach(log => {
    const token = log.token.toLowerCase()
    tokenBalances[token] = (tokenBalances[token] || 0) - Number(log.assets) - Number(log.fee)
  })

  Object.entries(tokenBalances).forEach(([token, balance]) => {
    if(balance > 0) {
      api.add(token, balance)
    }
  })

  return api.getBalances()
}

module.exports = {
  methodology: "Calculate TVL by BounceBit Cedefi events"
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})