const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'ethereum'

async function tvl(_, _b, { [ chain]: block }) {
  const owners = [
    '0x335DE1cB210B6d981EF3c5253ed7A39456Ee8F1D'
  ]
  const tokens = [
    '0x4Fabb145d64652a948d72533023f6E7A623C7C53',//busd
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',//usdc
    '0xdac17f958d2ee523a2206206994597c13d831ec7',//usdt
    '0x6b175474e89094c44da98b954eedeac495271d0f',//dai
    '0x8e870d67f660d95d5be530380d0ec0bd388289e1',//usdp
]
  return sumTokens2({ chain, block, owners, tokens, })
}

module.exports = {
	ethereum: {
		tvl
	}
}