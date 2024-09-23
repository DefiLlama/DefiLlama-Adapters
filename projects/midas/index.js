const config = {
  ethereum: {
    mTBILL: '0xDD629E5241CbC5919847783e6C96B2De4754e438',
    mBASIS: '0x2a8c22E3b10036f3AEF5875d04f8441d4188b656',
  }
}

async function tvl(api) {
  const tokens = Object.values(config[api.chain])
  const bals = await api.multiCall({  abi: 'uint256:totalSupply', calls: tokens})
  api.add(tokens, bals)
}


Object.keys(config).forEach((chain) => {
  module.exports[chain] = { tvl }
})