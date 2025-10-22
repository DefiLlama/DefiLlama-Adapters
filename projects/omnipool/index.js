async function tvl(api) {
  const pooledZeta = await api.call({ target: "0x82bbc3f521E5313cf5e8401797d7BaB6c030C908", abi: "uint256:getTotalPooledZeta" })
  api.addGasToken(pooledZeta)
}

module.exports = {
  zeta: { tvl }
}