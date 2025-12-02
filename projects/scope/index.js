// HLSCOPE
const CONFIG = {
  ethereum: [
    '0xDa2fFA104356688E74D9340519B8C17f00d7752E'
  ],
  polygon: ['0x4C5cA366e26409845624E29B62C388a06961A792'], 
  optimism: ['0x720f86f4B5b5d5d0ea3E5718EC43071d4d05134b']
}

const tvl = async (api) => {
  const tokens = CONFIG[api.chain]
  const supplies = await api.multiCall({ calls: tokens, abi: 'erc20:totalSupply' })
  api.add(tokens, supplies)
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})