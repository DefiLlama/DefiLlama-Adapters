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

  const roundId = BigInt(latestRoundData.roundId ?? latestRoundData[0])
  const price = BigInt(latestRoundData.answer ?? latestRoundData[1])
  const updatedAt = BigInt(latestRoundData.updatedAt ?? latestRoundData[3])
  const answeredInRound = BigInt(latestRoundData.answeredInRound ?? latestRoundData[4])

  if (price <= 0n) throw new Error(`Invalid HYBOND oracle price on ${chain}`)
  if (updatedAt === 0n || answeredInRound < roundId) {
    throw new Error(`Stale/incomplete HYBOND oracle round on ${chain}`)
  }

  const tvlUsd =
    Number(
      BigInt(totalSupply) *
        price *
        1000000n /
        10n ** BigInt(tokenDecimals) /
        10n ** BigInt(oracleDecimals)
    ) / 1e6

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
