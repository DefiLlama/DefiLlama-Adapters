async function tvl(api) {
  const supply = await api.call({ abi: 'erc20:totalSupply', target: '0xC2236204768456B21eAfEf0d232Ba1FccCe59823' })
  api.addCGToken('bitcoin', supply/1e18)
}
module.exports = {
  doublecounted: true,
  ailayer: { tvl },
}
