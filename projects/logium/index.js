const ADDRESSES = require('../helper/coreAssets.json')


const { getBlock } = require('../helper/http')
const sdk = require('@defillama/sdk')
const { Contract } = require('ethers')
const { sumTokens2 } = require('../helper/unwrapLPs')
const USDC = ADDRESSES.ethereum.USDC
const LOGIUM_CORE = '0xc61d1dcceeec03c94d729d8f8344ce3be75d09fe'
const ONE_DAY = 24 * 60 * 60

const usdcABI = 'event Transfer(address indexed from, address indexed to, uint256 value)'

function getProvider(network) {
  const chainApi = new sdk.ChainApi(network)
  return chainApi.provider
}

async function tvl(ts, block) {
  const fromBlock = await getBlock(ts - (31 * ONE_DAY), 'ethereum', {}, false) //33 days ago
  const usdcContract = new Contract(USDC, [usdcABI], getProvider('ethereum'))
  const eventFilter = usdcContract.filters.Transfer(LOGIUM_CORE);
  const events = await usdcContract.queryFilter(eventFilter, fromBlock, block);
  const owners = [LOGIUM_CORE]
  events.forEach(e => {
    if (e.args.from.toLowerCase() !== LOGIUM_CORE)  return;
    owners.push(e.args.to)
  })
  return sumTokens2({ owners, tokens: [USDC] })
}

module.exports = {
  ethereum: {
    tvl
  }
}