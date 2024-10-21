async function tvl(api) {
  const pools = [
    '0x8dBE744F6558F36d34574a0a6eCA5A8dAa827235',
  ]
  const tokens = await api.fetchList({  lengthAbi: 'numTokens', itemAbi: 'tokens', calls:pools, groupedByInput: true, })
  console.log(tokens)
  const ownerTokens = pools.map((v, i) => [tokens[i], v])
  return api.sumTokens({ ownerTokens })
}


module.exports = {
  start: 1693971707,
  ethereum: { tvl }
};
