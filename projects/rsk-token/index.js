async function tvl(ts, block, _, { api }) {
  const RIF = '0x2acc95758f8b5f583470ba265eb685a8f45fc9d5'
  const supply = await api.call({ abi: 'uint256:totalSupply', target: RIF })
  api.add(RIF, supply)
}

module.exports = {
  rsk: { tvl }
}