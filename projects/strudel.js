async function tvl(api) {
  const BTC = '0xe1406825186D63980fd6e2eC61888f7B91C4bAe4'
  const supply = await api.call({  abi: 'erc20:totalSupply', target: BTC })
  api.addCGToken('bitcoin', supply/1e18)
}

module.exports = {
  ethereum: { tvl },
}
