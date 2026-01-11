
async function tvl(api) {
  const bal = await api.call({ abi: 'uint256:getTotalCelo', target: '0x4aAD04D41FD7fd495503731C5a2579e19054C432' })
  api.addGasToken(bal)
}

module.exports = {
  methodology: 'TVL counts Celo staked by the protocol.',
  celo: {
    tvl
  }
}
