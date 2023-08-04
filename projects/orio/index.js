const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')
const chain = 'ethereum'

async function tvl(_, _b, { [ chain]: block }) {
  const owners = [
    '0x335DE1cB210B6d981EF3c5253ed7A39456Ee8F1D'
  ]
  const tokens = [
    ADDRESSES.ethereum.BUSD,//busd
    ADDRESSES.ethereum.USDC,//usdc
    ADDRESSES.ethereum.USDT,//usdt
    ADDRESSES.ethereum.DAI,//dai
    '0x8e870d67f660d95d5be530380d0ec0bd388289e1',//usdp
]
  return sumTokens2({ chain, block, owners, tokens, })
}

module.exports = {
	ethereum: {
		tvl
	}
}