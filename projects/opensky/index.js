const { getLogs } = require('../helper/cache/getLogs');
const methodologies = require('../helper/methodologies');
const { sumTokens2 } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

const abi = {
  create: 'event Create(uint256 indexed reserveId, address indexed underlyingAsset, address indexed oTokenAddress, string name, string symbol, uint8 decimals)',
  getAvailableLiquidity: "function getAvailableLiquidity(uint256 reserveId) view returns (uint256)",
  getTotalBorrowBalance: "function getTotalBorrowBalance(uint256 reserveId) view returns (uint256)",
}

async function tvl(api) {
  const balances = {};
  const factory = '0xdae29a91f663faf7657594f908e183e3b826d437'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0xa974e5e75ec9215fd423fc8e00fbfed574e4e36bfa650d4c54ffc9b12224d105'],
    fromBlock: 15223160,
    eventAbi: abi.create
  })
  const deposits = await api.multiCall({  abi: abi.getAvailableLiquidity, calls: logs.map(i => i.args.reserveId.toString()), target: factory }) 
  deposits.map((val, i) => sdk.util.sumSingleBalance(balances,logs[i].args.underlyingAsset,val, api.chain))
  return sumTokens2({ api, owner: '0x87d6dec027e167136b081f888960fe48bb10328a', resolveNFTs: true, balances, })
}

async function borrowed(api) {
  const balances = {};
  const factory = '0xdae29a91f663faf7657594f908e183e3b826d437'
  const logs = await getLogs({
    api,
    target: factory,
    topics: ['0xa974e5e75ec9215fd423fc8e00fbfed574e4e36bfa650d4c54ffc9b12224d105'],
    fromBlock: 15223160,
    eventAbi: abi.create
  })
  const borrowed = await api.multiCall({  abi: abi.getTotalBorrowBalance, calls: logs.map(i => i.args.reserveId.toString()), target: factory }) 
  borrowed.map((val, i) => sdk.util.sumSingleBalance(balances,logs[i].args.underlyingAsset,val, api.chain))
  return balances
}

module.exports = {
  methodology: methodologies.lendingMarket,
  ethereum: {
    tvl,
    borrowed,
  },
}