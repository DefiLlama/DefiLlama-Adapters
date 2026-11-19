const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk")
const { addDexPosition, resolveLPPosition, getStorage, usdtAddressTezos, } = require('../helper/chain/tezos')
const { dexes, farms } = require('./data')
const { PromisePool } = require('@supercharge/promise-pool');

const engines = {
  uUSDTezosV1: 'KT1FFE2LC5JpVakVjHm5mM36QVp2p3ZzH4hH',
  uUSDTezosV3: 'KT1DHndgk8ah1MLfciDnCV2zPJrVbnnAH9fd',
  uUSDUSDtV3: 'KT1JmfujyCYTw5krfu9bSn7YbLYuz2VbNaje',
  uUSDtzBTCV3: 'KT1V9Rsc4ES3eeQTr4gEfJmNhVbeHrAZmMgC',
  uUSDtzBTCV2: 'KT1HxgqnVjGy7KsSUTEsQ6LgpD5iKSGu7QpA',
  uUSDtzBTCLPV2: 'KT1FzcHaNhmpdYPNTgfb8frYXx7B5pvVyowu',
  uUSDtzBTCLPV3: 'KT1F1JMgh6SfqBCK6T6o7ggRTdeTLw91KKks',
  uDefiuUSDV2: 'KT1B2GSe47rcMCZTRk294havTpyJ36JbgdeB',
  uDefitzV2: 'KT1LQcsXGpmLXnwrfftuQdCLNvLRLUAuNPCV',
  uDefitzBTCLPV2: 'KT1E45AvpSr7Basw2bee3g8ri2LK2C2SV2XG',
  uBTCTezosV2: 'KT1VjQoL5QvyZtm9m1voQKNTNcQLi5QiGsRZ',
  uBTCTezosV3: 'KT1CP1C8afHqdNfBsSE3ggQhzM2iMHd4cRyt',
  uBTCtzBTCLPV2: 'KT1NFWUqr9xNvVsz2LXCPef1eRcexJz5Q2MH',
  uBTCtzBTCLPV3: 'KT1G6RzVX25YnoU55Xb7Vve3zvuZKmouf24a',
}

const uDEFI_LP = 'KT1H8sJY2VzrbiX4pYeUVsoMUd4iGw2DV7XH'
const uDEFI_TOKEN = 'KT1XRPEPXbZK25r3Htzp2o1x7xdMMmfocKNW-1'
const tzBTC_TOKEN = ADDRESSES.tezos.tzBTC


// sum of collateral recorded per vault in the engine's vault_contexts big map
async function fetchBalance(balances, token, engineAddress, decimals = 0, sharePrice) {
  const { vault_contexts } = await getStorage(engineAddress)
  const vaults = await sdk.chains.tezos.getBigMapKeys({ id: vault_contexts, select: 'value' })
  let balance = vaults.reduce((sum, vault) => sum + +vault.balance, 0) / 10 ** decimals

  if (token === 'tzbtc-lp') {
    const balancetZ = balance * sharePrice.xtzPool / sharePrice.lqtTotal
    const balanceBTC = balance * sharePrice.tokenPool / sharePrice.lqtTotal
    sdk.util.sumSingleBalance(balances, 'tezos', balancetZ / 1e6, 'tezos')
    sdk.util.sumSingleBalance(balances, sharePrice.tokenAddress, balanceBTC, 'tezos')
    return;
  }

  sdk.util.sumSingleBalance(balances, token, balance, 'tezos')
}


async function getTzBTCLPSharePrice() {
  return getStorage('KT1TxqZ8QtKvLu3V3JH7Gx58n7Co8pgtpQU5')
}

async function tvl() {
  const balances = {}
  const sharePrice = await getTzBTCLPSharePrice()
  const vaults = [
    // [ADDRESSES.tezos.uUSD, engines.uDefiuUSDV2, 0],  // disabling this because backing of uUSD is already counted in tvl
    [usdtAddressTezos, engines.uUSDUSDtV3, 0],
    [tzBTC_TOKEN, engines.uUSDtzBTCV2, 0],
    [tzBTC_TOKEN, engines.uUSDtzBTCV3, 0],
    ['tezos', engines.uUSDTezosV1, 6],
    ['tezos', engines.uUSDTezosV3, 6],
    ['tezos', engines.uBTCTezosV2, 6],
    ['tezos', engines.uBTCTezosV3, 6],
    ['tezos', engines.uDefitzV2, 6],
    ['tzbtc-lp', engines.uUSDtzBTCLPV2, 0],
    ['tzbtc-lp', engines.uUSDtzBTCLPV3, 0],
    ['tzbtc-lp', engines.uBTCtzBTCLPV2, 0],
    ['tzbtc-lp', engines.uBTCtzBTCLPV3, 0],
    ['tzbtc-lp', engines.uDefitzBTCLPV2, 0],
  ]
  for (const [token, engine, decimals] of vaults)
    await fetchBalance(balances, token, engine, decimals, sharePrice)

  return balances
}

async function pool2() {
  const balances = {}

  const youvesLPs = dexes.map(i => i.contractAddress).filter(i => i)
  let eligibleFarms = farms.filter(i => !youvesLPs.includes(i.lpToken)).map(({ farmContract, lpToken: { contractAddress } }) => ({ farmContract, contractAddress }))

  await PromisePool
    .withConcurrency(3)
    .for(youvesLPs)
    .process(account => addDexPosition({ balances, account }))

  for (const { farmContract, contractAddress } of eligibleFarms)
    await resolveLPPosition({ balances, lpToken: contractAddress, owner: farmContract, ignoreList: youvesLPs })

  return balances
}

module.exports = {
  timetravel: false,
  tezos: { tvl, pool2 }
}