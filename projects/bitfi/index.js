async function tvl(api) {
  const BFBTC = '0xC2236204768456B21eAfEf0d232Ba1FccCe59823'
  const supply = await api.call({ abi: 'erc20:totalSupply', target: BFBTC })
  api.add(BFBTC, supply)
}
module.exports = {
  doublecounted: true,
  ailayer: { tvl },
}
