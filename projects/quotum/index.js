const { formatUnits } = require('ethers')

// QUOTUM: 0xFE936755185353b63a81dD72b47533Eb6021018E (18 decimals)
const STAKING = '0x7F1d2b117aBac121f99cEED7f80e5925fFF37A53'

// Published deployment: https://quotum.org/docs#contracts
// totalStaked counts deposited principal only, excluding unsolicited token transfers.
async function staking(api) {
  const amount = await api.call({ target: STAKING, abi: 'uint256:totalStaked' })
  // The Robinhood token address has no Llama price mapping yet; CoinGecko lists QUOTUM.
  api.addCGToken('quotum', Number(formatUnits(amount, 18)))
}

module.exports = {
  methodology: 'Staking is QUOTUM principal deposited in QuotumStaking, read from totalStaked. The protocol\'s own token is excluded from ordinary TVL. TaxSink funds earmarked for inference payments and buybacks are excluded from TVL.',
  robinhood: {
    tvl: async () => ({}),
    staking,
  },
}
