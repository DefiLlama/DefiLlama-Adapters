const fs = require('fs')
const configFile = __dirname + '/chains.json'
const csvFile = __dirname + '/data.csv'

const data = fs.readFileSync(csvFile, 'utf8')
const assetList = data.split('\n').map(i => i.split(',')).filter(i=> {
  return !i[5] || i[5] === '""'  // ignore address if it is a custodia 
})
assetList.pop()

const networkAddresses = {}
const ignoredChainSet = new Set(['ENJ', 'BEP2', 'STATEMINT'])

assetList.forEach(([_, network, address]) => {
  if (ignoredChainSet.has(network)) return;
  if (!networkAddresses[network]) {
    networkAddresses[network] = []
  }
  networkAddresses[network].push(address)
})

const chainMap = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BEP20: 'bsc',
  BSC: 'bsc',
  CELO: 'celo',
  CHZ2: 'chz',
  HBAR: 'hedera',
  TRX: 'tron',
  AVAX: 'avax',
  ARB: 'arbitrum',
  ARBITRUM: 'arbitrum',
  AVAXC: 'avax',
  LTC: 'litecoin',
  MATIC: 'polygon',
  OP: 'optimism',
  OPTIMISM: 'optimism',
  RON: 'ronin',
  XRP: 'ripple',
  SOL: 'solana',
  DOT: 'polkadot',
  ALGO: 'algorand',
  APT: 'aptos',
  FTM: 'fantom',
  BASE: 'base',
  ERA: 'era',
  ZKSYNCERA: 'era',
  MANTA: 'manta',
  SUI: 'sui',
  TON: 'ton',
  STK: 'starknet',
  STARKNET: 'starknet',
  OPBNB: 'op_bnb',
  NEAR: 'near',
  DOGE: 'doge',
  XLM: 'stellar',
  SCROLL: "scroll",
  SONIC: "sonic",
}


const chainData = {}
const key = Object.keys(networkAddresses).sort()

key.forEach((network) => {
  let addresses = networkAddresses[network]
  const chain = chainMap[network]
  if (chainData[chain]) addresses.push(...chainData[chain])
  if (!chain) throw new Error(`No chain mapping for ${network}`)
  addresses = addresses.map(i => i.startsWith('0x') ? i.toLowerCase() : i)
  addresses = [...new Set(addresses)]
  addresses.sort()
  chainData[chain] = addresses
})

fs.writeFileSync(configFile, JSON.stringify(chainData, null, 2))