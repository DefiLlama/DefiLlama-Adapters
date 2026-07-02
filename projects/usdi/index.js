const USDI = '0xAf1157149ff040DAd186a0142a796d901bEF1cf1'

async function tvl(api) {
  const supply = await api.call({ target: USDI, abi: 'erc20:totalSupply', })
  const decimals = await api.call({ target: USDI, abi: 'erc20:decimals', })
  const exchangeRate = await api.call({ target: USDI, abi: 'uint256:getExchangeRate', })
  api.addUSDValue((supply / 10 ** decimals) * (exchangeRate / 1e18))
}

module.exports = {
  misrepresentedTokens: true,
  methodology: 'USDi is a CPI-tracking unit of account fully backed by the USDi Coin Fund (US Treasuries, inflation-linked bonds, FX, commodities and cash). TVL is the USD value of those reserves, computed on-chain as the USDi totalSupply multiplied by the CPI-linked exchange rate from getExchangeRate on the token contract (also published via the Chainlink USDi/USD feed at 0x79F7ADfd5c3E736c6737B3936aF13b5f05f067FE).',
  ethereum: {
    tvl,
  },
}
