

const { getBlock } = require('../helper/http')
const { providers } = require('@defillama/sdk/build/general');
const { Contract } = require('ethers')
const { sumTokens2 } = require('../helper/unwrapLPs')
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const LOGIUM_CORE = '0xc61d1dcceeec03c94d729d8f8344ce3be75d09fe'
const ONE_DAY = 24 * 60 * 60

const usdcABI = 'event Transfer(address indexed from, address indexed to, uint256 value)'

async function tvl(ts, block) {
  const fromBlock = await getBlock(ts - (31 * ONE_DAY), 'ethereum', {}, false) //33 days ago
  const usdcContract = new Contract(USDC, [usdcABI], providers.ethereum)
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