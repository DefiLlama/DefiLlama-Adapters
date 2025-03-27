async function tvl(api) {
  const mphBTC = '0x950e7FB62398C3CcaBaBc0e3e0de3137fb0daCd2'
  const supply = await api.call({ abi: 'erc20:totalSupply', target: mphBTC })
  api.add(mphBTC, supply)
}

module.exports = {
  morph: { tvl }
}
