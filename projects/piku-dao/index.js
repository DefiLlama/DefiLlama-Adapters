const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.ethereum.USDC
const USDC_DECIMALS = 6n

const USP_TOKEN = '0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6'
const USP_ORACLE = '0x433471901bA1A8BDE764E8421790C7D9bAB33552'

const FX_ARB_VAULT = '0x99351BaEd3d8aB544CCb08aF96A105910fdA71E7'

const CARRY_TRADE_TOKEN =
  '0x2bf11d2E04Bc40daa95c24B8b90EC4F5c57Dd326'
const CARRY_TRADE_ORACLE =
  '0xc69731B51C6dBb2fb818D8DB1F4116FB8A379288'

const STOCK_MARKET_TOKEN =
  '0x827Ce7E8e35861D9Ac7fE002755767b695A5594a'
const STOCK_MARKET_ORACLE =
  '0x1c7bEc0281080C0A4f85e55151191aF27EC69940'

// The FXArbUSDTRY vault was deployed at this block. The other two Morini
// vaults were already live by then, so this prevents historical calls to
// contracts that did not yet exist.
const MORINI_VAULTS_START_BLOCK = 25136657

const LATEST_ROUND_DATA_ABI =
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'

function pow10(decimals) {
  return 10n ** BigInt(decimals)
}

function getOracleAnswer(roundData) {
  const answer = roundData.answer ?? roundData[1]
  const parsedAnswer = BigInt(answer)

  if (parsedAnswer <= 0n) {
    throw new Error('Morini oracle returned a non-positive answer')
  }

  return parsedAnswer
}

async function addUspTvl(api) {
  const [totalSupply, tokenDecimals, pricePerToken] = await Promise.all([
    api.call({
      target: USP_TOKEN,
      abi: 'erc20:totalSupply',
    }),
    api.call({
      target: USP_TOKEN,
      abi: 'erc20:decimals',
    }),
    api.call({
      target: USP_ORACLE,
      abi: 'function getPriceForIssuance() view returns (uint256)',
    }),
  ])

  const tvlInUsdc =
    (BigInt(totalSupply) * BigInt(pricePerToken)) / pow10(tokenDecimals)

  api.add(USDC, tvlInUsdc.toString())
}

async function addAccountableVaultTvl(api) {
  const [totalSupply, shareDecimals] = await Promise.all([
    api.call({
      target: FX_ARB_VAULT,
      abi: 'erc20:totalSupply',
    }),
    api.call({
      target: FX_ARB_VAULT,
      abi: 'erc20:decimals',
    }),
  ])

  const oneShare = pow10(shareDecimals)

  const assetsPerShare = await api.call({
    target: FX_ARB_VAULT,
    abi: 'function convertToAssets(uint256 shares) view returns (uint256 assets)',
    params: [oneShare.toString()],
  })

  // convertToAssets returns the underlying USDC amount in 6-decimal units.
  const tvlInUsdc =
    (BigInt(totalSupply) * BigInt(assetsPerShare)) / oneShare

  api.add(USDC, tvlInUsdc.toString())
}

async function addMidasVaultTvl(api, token, oracle) {
  const [totalSupply, tokenDecimals, oracleDecimals, roundData] =
    await Promise.all([
      api.call({
        target: token,
        abi: 'erc20:totalSupply',
      }),
      api.call({
        target: token,
        abi: 'erc20:decimals',
      }),
      api.call({
        target: oracle,
        abi: 'function decimals() view returns (uint8)',
      }),
      api.call({
        target: oracle,
        abi: LATEST_ROUND_DATA_ABI,
      }),
    ])

  const price = getOracleAnswer(roundData)

  const tvlInUsdc =
    (BigInt(totalSupply) * price * pow10(USDC_DECIMALS)) /
    (pow10(tokenDecimals) * pow10(oracleDecimals))

  api.add(USDC, tvlInUsdc.toString())
}

async function tvl(api) {
  await addUspTvl(api)

  if (api.block && api.block < MORINI_VAULTS_START_BLOCK) {
    return
  }

  await Promise.all([
    addAccountableVaultTvl(api),
    addMidasVaultTvl(
      api,
      CARRY_TRADE_TOKEN,
      CARRY_TRADE_ORACLE
    ),
    addMidasVaultTvl(
      api,
      STOCK_MARKET_TOKEN,
      STOCK_MARKET_ORACLE
    ),
  ])
}

module.exports = {
  methodology:
    'TVL includes USP total supply valued by its issuance oracle, the Morini FXArbUSDTRY vault share supply valued through ERC-4626 convertToAssets, and the Morini CarryTradeUSDTRYLeverage and StockMarketTRBasisTrade share supplies valued with their custom oracle latestRoundData answers. All values are reported as USDC.',
  start: 23081800,
  timetravel: true,
  misrepresentedTokens: false,
  ethereum: {
    tvl,
  },
}
