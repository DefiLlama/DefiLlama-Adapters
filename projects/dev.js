const ADDRESS_CONFIG_ADDRESS = '0x1D415aa39D647834786EB9B5a333A50e9935b796'
const TOKEN_ADDRESS = '0x5cAf454Ba92e6F2c929DF14667Ee360eD9fD5b26'

async function staking(api) {
  const lockupAddress= await api.call({  abi: 'address:lockup', target: ADDRESS_CONFIG_ADDRESS})
  const bal = await api.call({  abi: 'uint256:getAllValue', target: lockupAddress})
  api.add(TOKEN_ADDRESS, bal)
}

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking,
  }
}
