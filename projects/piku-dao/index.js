const ADDRESSES = require('../helper/coreAssets.json')

const USDC = ADDRESSES.ethereum.USDC
const USDC_DECIMALS = 6n

const USP_TOKEN = '0x098697bA3Fee4eA76294C5d6A466a4e3b3E95FE6'
const ORACLE = '0x433471901bA1A8BDE764E8421790C7D9bAB33552'
const STOCK_VAULT = '0x827Ce7E8e35861D9Ac7fE002755767b695A5594a'
const CARRY_VAULT = '0x2bf11d2E04Bc40daa95c24B8b90EC4F5c57Dd326'

const VAULT_ORACLES = {
  [STOCK_VAULT]: "0x1c7bEc0281080C0A4f85e55151191aF27EC69940", // StockMarketTRBasisTrade
  [CARRY_VAULT]: "0xc69731B51C6dBb2fb818D8DB1F4116FB8A379288", // CarryTradeUSDTRYLeverage
}

const LATEST_ROUND_DATA_ABI = 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)'

// used to exclude USP deposits into other piku vaults
const USP_BACKING_WALLETS = [
  "0xb7f15d1122c0F91eE77C1172B9EFa4C061952E3C", // hot
  "0x16c4150e22c53eCE02bB70763625DD3d61f1E7E9", // cold
  "0xa056f4a4213e78890ea6cdae7567ce9287c97726", // cold rewards
  "0x32a605e91ecc3ab972697e58712f6c9c37cabc1d", // issuance
  "0xe08b04Aa20F16fD0d5c38A98731d2d812bf8a36F", // treasury wallet
]

const VAULTS = [
  "0x99351BaEd3d8aB544CCb08aF96A105910fdA71E7", // FXArbUSDTRY
  STOCK_VAULT, // StockMarketTRBasisTrade
  CARRY_VAULT, // CarryTradeUSDTRYLeverage
]

const CHILD_VAULTS = {
  [STOCK_VAULT]: [
    "0xC6F9a91EeFd522d9C97F7978d90F52bB5456f1fD", // srStockMarketTRBasisTrade
    "0x91F00deE48313813f73828BD5f13eCcC44A0B895", // jrStockMarketTRBasisTrade
  ]
}

async function addUSPTvl(api) {
  // Get USP total supply and oracle price in parallel
  const [totalSupply, decimals, pricePerToken] = await Promise.all([
    api.call({ target: USP_TOKEN, abi: 'erc20:totalSupply' }),
    api.call({ target: USP_TOKEN, abi: 'uint256:decimals' }),
    api.call({ target: ORACLE, abi: 'function getPriceForIssuance() view returns (uint256)' })
  ])

  // Calculate TVL in USDC
  // totalSupply is in 18 decimals, pricePerToken is in 6 decimals (USDC format)
  // Result should be in USDC's 6 decimals
  // Formula: (totalSupply * price) / 10^18 = TVL in USDC (6 decimals)
  const tvlInUsdc = (totalSupply * pricePerToken) / (10 ** decimals)

  // Report as USDC for proper USD valuation
  api.add(ADDRESSES.ethereum.USDC, tvlInUsdc)
}

// retrieve USP backing in other piku vaults to avoid double counting
async function getUSPBacking(api) {
  const balances = {}
  for (const vault of VAULTS) {
    const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: USP_BACKING_WALLETS.map(wallet => ({ target: vault, params: wallet })) })
    balances[vault] = bals.reduce((acc, bal) => acc + BigInt(bal), 0n).toString()
  }

  const childBalances = {}
  for (const [parentVault, childVaults] of Object.entries(CHILD_VAULTS)) {
    for (const childVault of childVaults) {
      const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: USP_BACKING_WALLETS.map(wallet => ({ target: childVault, params: wallet })) })
      childBalances[childVault] = bals.reduce((acc, bal) => acc + BigInt(bal), 0n).toString()
    }
  }

  for (const [childVault, childBalance] of Object.entries(childBalances)) {
    const asset = await api.call({ target: childVault, abi: 'address:asset'})
    const parentBal = await api.call({ target: childVault, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [childBalance] })
    balances[asset] = (BigInt(balances[asset] || 0) + BigInt(parentBal)).toString()
  }

  return balances
}

async function addVaultsTvl(api, balances) {
  for (const vault of VAULTS) {
    const supply = await api.call({ target: vault, abi: 'erc20:totalSupply' })
    const adjustedSupply = BigInt(supply) - BigInt(balances[vault] || 0)
    if (adjustedSupply <= 0n) continue

    const oracle = VAULT_ORACLES[vault]
    if (oracle) {
      // no asset()/convertToAssets, Value the adjusted share supply with the vault's USD/share oracle
      const [tokenDecimals, oracleDecimals, roundData] = await Promise.all([
        api.call({ target: vault, abi: 'erc20:decimals' }),
        api.call({ target: oracle, abi: 'erc20:decimals' }),
        api.call({ target: oracle, abi: LATEST_ROUND_DATA_ABI }),
      ])
      const price = BigInt(roundData.answer ?? roundData[1])
      if (price <= 0n) throw new Error(`piku-dao: invalid price for vault ${vault}`)

      const tvlInUsdc = (adjustedSupply * price * (10n ** USDC_DECIMALS)) / ((10n ** BigInt(tokenDecimals)) * (10n ** BigInt(oracleDecimals)))
      api.add(USDC, tvlInUsdc.toString())
    } else {
      // convert supply into assets since totalAssets() reports idle
      const asset = await api.call({ target: vault, abi: 'address:asset' })
      const convertedSupply = await api.call({ target: vault, abi: 'function convertToAssets(uint256) view returns (uint256)', params: [adjustedSupply.toString()] })
      api.add(asset, convertedSupply.toString())
    }
  }
}

async function tvl(api) {
  await addUSPTvl(api)
  const bals = await getUSPBacking(api)
  await addVaultsTvl(api, bals)
}

module.exports = {
  methodology: "TVL includes USP total supply valued by its issuance oracle, and the Morini CarryTradeUSDTRYLeverage and StockMarketTRBasisTrade share supplies valued with their custom oracle latestRoundData answers. USP deposits into other piku vaults are excluded.",
  start: 23081800,
  timetravel: true,
  misrepresentedTokens: true,
  ethereum: {
    tvl,
  }
}