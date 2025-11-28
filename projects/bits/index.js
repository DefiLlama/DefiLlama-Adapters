const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BITS_VAULTS_ETHEREUM = [
  '0xC516FF2349A5C869B851Ce78De740ac209180b56', // WBTC vault on Ethereum
]

const BITS_VAULTS_COREDAO = [
  '0xdC2168Db73E0282CEd0a18F66aE54bd9E904376F', // COREBTC vault on CoreDAO
]

const BITS_VAULTS_BASE = [
  '0x094df7fcF2E6069516B7969B1Cf7C6dFAE623672', // BASEBTC vault on Base
]

// Token addresses
const WBTC = ADDRESSES.ethereum.WBTC
const COREBTC = "0x5832f53d147b3d6Cd4578B9CBD62425C7ea9d0Bd"
const BASEBTC = ADDRESSES.base.cbBTC

async function tvl(api) {
  // Get WBTC balances for all Ethereum vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS_ETHEREUM.map(vault => ({
      target: WBTC,
      params: [vault]
    }))
  })
  // Add all Ethereum balances to the API
  api.add(WBTC, balances)
}

async function tvlCore(api) {
  // Get COREBTC balances for all CoreDAO vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS_COREDAO.map(vault => ({
      target: COREBTC,
      params: [vault]
    }))
  })
  
  // Add all CoreDAO balances to the API
  api.add(COREBTC, balances)
}

async function tvlBase(api) {
  // Get BASEBTC balances for all Base vaults using multicall
  const balances = await api.multiCall({
    abi: 'erc20:balanceOf',
    calls: BITS_VAULTS_BASE.map(vault => ({
      target: BASEBTC,
      params: [vault]
    }))
  })
  
  // Add all Base balances to the API
  api.add(BASEBTC, balances)
}

module.exports = {
  methodology: 'Counts the total value of WBTC assets locked in Bits yield product contracts on Ethereum network, COREBTC assets on CoreDAO network, and BASEBTC assets on Base network.',
  start: 1749621314,
  ethereum: {
    tvl,
  },
  core: {
    tvl: tvlCore,
  },
  base: {
    tvl: tvlBase,
  }
} 