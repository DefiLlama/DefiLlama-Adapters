const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const utils = require('../helper/utils');
const treasury = '0x85b6acaba696b9e4247175274f8263f99b4b9180'

// treasury address: 0xc47ec74a753acb09e4679979afc428cde0209639
async function tvl(api) {
  const { data: { tokens, extraUsdValues } } = await utils.fetchURL('https://api.spiral.farm/data/eth/treasury');
   const addrs = Object.keys(tokens).filter(addr => addr.startsWith('0x'))
  const decimals = await api.multiCall({  abi: 'erc20:decimals', calls: addrs})
  addrs.forEach((addr, idx) => {
    api.add(addr, tokens[addr].totalAmount * 10 ** decimals[idx])
  })
  api.add(nullAddress, tokens.eth.totalAmount * 1e18)
  api.add('coingecko:tether', extraUsdValues.tokenRedeemContractUsdcBalance, { skipChain: true })
  api.add('coingecko:tether', extraUsdValues.bribes, { skipChain: true })
  // return sumTokens2({ api,  owner: treasury,  fetchCoValentTokens: true,  })
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl
  }
}