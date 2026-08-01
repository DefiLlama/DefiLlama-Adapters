const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.ethereum.USDC

const LTF = {
  ethereum: '0x8c213ee79581ff4984583c6a801e5263418c4b86',
  base: '0x8c213ee79581ff4984583c6a801e5263418c4b86',
  celo: '0x27e8c820d05aea8824b1ac35116f63f9833b54c8',
}

const abi = 'function vault(address asset) view returns (address)'

const getNav = async (timestamp) => {
  const chain = 'ethereum'
  const ethApi = new sdk.ChainApi({ chain, timestamp })
  await ethApi.getBlock()
  const vault = await ethApi.call({ target: LTF[chain], params: [USDC], abi })
  return ethApi.call({ target: vault, abi: 'uint256:pricePerShare' })
}

const tvl = async (api) => {
  const { chain } = api
  const nav = await getNav(api.timestamp)
  const balance = await api.call({ target: LTF[chain], abi: 'erc20:totalSupply' })
  api.add(USDC, balance * nav / 1e6, { skipChain :true })
}

Object.keys(LTF).forEach((chain) => {
  module.exports[chain] = { tvl }
})

module.exports.misrepresentedTokens = true