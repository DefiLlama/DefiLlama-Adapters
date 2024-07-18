const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  avax: { tvl  },
}

async function tvl(api) {
  const wsAVAX = '0x7aa5c727270c7e1642af898e0ea5b85a094c17a1'
  const sAVAX = '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE'
  const wsAvaxBal= await api.call({  abi: 'erc20:balanceOf', target: wsAVAX, params: '0xDC325ad34C762C19FaAB37d439fbf219715f9D58'})
  const wsAvaxSupply = await api.call({  abi: 'uint256:totalSupply', target: wsAVAX })
  const sAvaxBal= await api.call({  abi: 'erc20:balanceOf', target: '0x2b2C81e08f1Af8835a78Bb2A90AE924ACE0eA4bE', params: wsAVAX})
  api.add(sAVAX, wsAvaxBal * sAvaxBal / wsAvaxSupply)
}