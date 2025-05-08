/**
 * ZAMM – DefiLlama TVL adapter
 * Tracks the native ETH balance held at the ZAMM contract.
 *
 * Contract: 0x00000000000008882D72EfA6cCE4B6a40b24C860
 * Start block: 22361603 
 */

const ZAMM = '0x00000000000008882D72EfA6cCE4B6a40b24C860'
const ETH  = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
  const balance = await api.eth.getBalance(ZAMM)
  api.add(ETH, balance)
}

module.exports = {
  timetravel: true,             
  misrepresentedTokens: false,
  methodology: 'Sums the raw wei balance of ETH held in the ZAMM contract.',
  start: 22361603,
  ethereum: { tvl },
}
