const config = {
  bsc: {
    listarush: "0x934c69e35cA3a2774Cc0aa36f5632f1C39f3aC36",
  }
}

async function staking(api) {
  const { listarush } = config[api.chain];

  const token_lista = await api.call({ abi: 'address:Lista', target: listarush, });
  const bal = await api.call({ abi: 'uint256:totalDeposited', target: listarush, });
  api.add(token_lista, bal)
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: () => ({}),
    staking,
  }
})

module.exports.doublecounted = true