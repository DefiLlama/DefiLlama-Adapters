const sdk = require('@defillama/sdk')

const priceFeed = '0x7391452a90dda26892bc52fef3ef42f92f19fc61'
const latestRoundData = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'

const config = {
  ethereum: '0xF252C5BD43907a6CAb079E990845a37a7C5730d9', // NGIPlus_ETH
  bsc: '0x50BF2924ceE59737EAD76e881643eD8569BAe6e8', // NGIPlus_BSC
  pharos: '0x85f51213A6c3F2566aF519D296BB75AD4EC6d234', // NGIPlus_PROS
}

async function getPrice(api) {
  const ethApi = api.chain === 'ethereum' ? api : new sdk.ChainApi({ chain: 'ethereum', timestamp: api.timestamp })
  const [{ answer }, decimals] = await Promise.all([
    ethApi.call({ target: priceFeed, abi: latestRoundData }),
    ethApi.call({ target: priceFeed, abi: 'uint8:decimals' }),
  ])

  const price = Number(answer) / 10 ** Number(decimals)
  if (price <= 0) throw new Error('Invalid NGI+ price')
  return price
}

async function tvl(api) {
  const token = config[api.chain]
  const [supply, tokenDecimals, price] = await Promise.all([
    api.call({ target: token, abi: 'erc20:totalSupply' }),
    api.call({ target: token, abi: 'erc20:decimals' }),
    getPrice(api),
  ])

  api.addUSDValue((Number(supply) / 10 ** Number(tokenDecimals)) * price)
}

module.exports = {
  methodology: "NGI+ is a 1:1 asset-backed token collateralized by the Partners Group Next Generation Infrastructure - Class PC USD ACC, which invests in a broadly diversified portfolio of private infrastructure investments. It intends to focus on private infrastructure direct and secondary investments with a priority on operational assets that offer strong downside protection.",
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})
