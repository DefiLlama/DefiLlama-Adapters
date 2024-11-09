const swkava = '0x9d9682577CA889c882412056669bd936894663fd'
const swech = '0x86e4D91800c03e803d4c8FA3293d1C7d612A7300'

async function tvl(api) {

  const pooledCoin = await api.call({
    target: api.chain === 'kava' ? swkava : swech,
    abi: "uint256:totalSupply",
  })
  return {
    [api.chain === 'kava' ? 'kava' : 'echelon']: pooledCoin / 1e18,
  }
}

module.exports = {
  kava: { tvl },
  echelon: { tvl: () => ({}), },
  methodology: "Any & Each 1 SW-Token can only ever be minted by permanent locking of 1 Native token. Hence, the totalSupply() method is used to aggregate the amounts of underlying assets, with their prices fed by the DefiLlama SDK.",
}
