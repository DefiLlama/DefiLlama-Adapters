const USX = '0x3b005fefC63Ca7c8d25eE21FbA3787229ba4CF03'

async function tvl(api) {
  const totalSupply = await api.call({ abi: 'erc20:totalSupply', target: USX })
  api.add(USX, totalSupply)
}

module.exports = {
  scroll: { tvl },
}