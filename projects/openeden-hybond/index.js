const HYBOND_TOKEN = {
  ethereum: '0x1204371AC0e5176f4B8c5B2F16C2Bec551b6FC1a',
  bsc: '0xB613Ab1BE4039A7d799aD968bA9e425B6Bff4224',
}

const HYBOND_ORACLE = {
  ethereum: '0x74995e6133062Aee330653c618E39F34016D6F39',
  bsc: '0xDf473AA7960d54564bEa7035Bd29169386730138',
}

const latestRoundDataAbi =
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'

async function getHybondTVL(api, chain) {
  const token = HYBOND_TOKEN[chain]
  const oracle = HYBOND_ORACLE[chain]

  const totalSupply = await api.call({
    abi: 'uint256:totalSupply',
    target: token,
  })

  const tokenDecimals = await api.call({
    abi: 'uint8:decimals',
    target: token,
  })

  const oracleDecimals = await api.call({
    abi: 'uint8:decimals',
    target: oracle,
  })

  const latestRoundData = await api.call({
    abi: latestRoundDataAbi,
    target: oracle,
  })

  const price = latestRoundData.answer ?? latestRoundData[1]

  const tvlUsd =
    Number(totalSupply) *
    Number(price) /
    10 ** Number(tokenDecimals) /
    10 ** Number(oracleDecimals)

  api.addUSDValue(tvlUsd)
}

async function ethTVL(api) {
  return getHybondTVL(api, 'ethereum')
}

async function bscTVL(api) {
  return getHybondTVL(api, 'bsc')
}

module.exports = {
  methodology:
    'TVL is calculated as HYBOND totalSupply multiplied by the HYBOND price from the PriceOracle latestRoundData answer.',
  ethereum: {
    tvl: ethTVL,
  },
  bsc: {
    tvl: bscTVL,
  },
}
