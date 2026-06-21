const { getBTCExport } = require('../projects/helper/bitcoin-book')
const { buildProtocolExports } = require('./utils')

// Adapters whose only export is a Bitcoin TVL sourced from the bitcoin addressbook.
// Each entry's `bitcoin` value is a bitcoin-book key (array of addresses or a fetcher fn),
// resolved via getBTCExport.
function bitcoinExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, key]) => {
    if (chain !== 'bitcoin') throw new Error(`bitcoin registry only supports the bitcoin chain, got: ${chain}`)
    result.bitcoin = { tvl: getBTCExport(key) }
  })
  return result
}

const configs = {
  "allo": {
    bitcoin: 'allo',
    methodology: `Total amount of BTC in restaked on babylon`,
    doublecounted: true,
  },
  "avalance-btc": {
    bitcoin: 'avalanche',
    methodology: 'BTC wallets on bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',
    hallmarks: [ [1769587279, "Acquired by Lombard"], ],
  },
  "bevm": {
    bitcoin: 'bevm',
    methodology: "TVL counts tokens deposited in BEVM",
  },
  "binance-btc": {
    bitcoin: 'binance2',
    methodology: "BTC on btc chain",
  },
  "bitget-btc": {
    bitcoin: 'bitgetBtc',
    methodology: "bgBTC, BitGet Wrapped Bitcoin",
  },
  "btnx": {
    bitcoin: 'btnx',
  },
  "chakra": {
    bitcoin: 'chakra',
    doublecounted: true,
  },
  "circle-btc": {
    bitcoin: 'circleBTC',
  },
  "dlc-link": {
    bitcoin: 'dlcLink',
  },
  "echo-mBTC": {
    bitcoin: 'echoMBTC',
    methodology: "Echo is a Bitcoin liquidity aggregation and yield infrastructure layer",
  },
  "esbtc": {
    bitcoin: 'esbtc',
    methodology: 'TVL is based on Bitcoin addresses in the exSat Staking BTC contract, summing their associated Bitcoin balances.',
    doublecounted: true,
    start: '2024-10-23',
  },
  "exsat": {
    bitcoin: 'exsatBridge',
    methodology: 'TVL for the exSat Bridge represents the total balance in custody BTC addresses, reflecting BTC assets bridged to the exSat network.',
  },
  "fbtc": {
    bitcoin: 'fbtc',
  },
  "gate-btc": {
    bitcoin: 'gateBtc',
    methodology: "BTC on btc chain",
  },
  "hemi-btc": {
    bitcoin: 'hemiBTC',
  },
  "kraken-btc": {
    bitcoin: 'krakenBTC',
  },
  "LeadFi-leadBTC": {
    bitcoin: 'leadbtc',
    methodology: "leadBTC, Lead Wrapped Bitcoin",
  },
  "lorenzo": {
    bitcoin: 'lorenzo',
    methodology: "Lorenzo, As the Bitcoin Liquidity Finance Layer",
    doublecounted: true,
  },
  "lorenzo-enzoBTC": {
    bitcoin: 'lorenzo2',
    methodology: "enzoBTC, Lorenzo Wrapped Bitcoin",
  },
  "nexusbtc": {
    bitcoin: 'nexusbtc',
    methodology: 'The total value locked (TVL) is calculated by summing up the balances of BTC wallets specified in the NexusBTC address list within the bitcoin address book',
  },
  "okx-xbtc": {
    bitcoin: 'xbtc',
    methodology: "BTC on btc chain. https://www.okx.com/xbtc#transparency",
  },
  "pstake-btc": {
    bitcoin: 'pstakeBTC',
    methodology: `Total amount of BTC restaked on babylon`,
    doublecounted: true,
  },
  "stacks-sbtc": {
    bitcoin: 'stacksSBTC',
  },
  "tezos-btc": {
    bitcoin: 'tzbtc',
    methodology: 'BTC wallets on bc1q2f0tczgrukdxjrhhadpft2fehzpcrwrz549u90',
  },
  "xlink-btc-lst": {
    bitcoin: 'xlinkLST',
    methodology: "Staking tokens via Babylon counts as TVL",
    doublecounted: true,
  },
  "zeus": {
    bitcoin: 'zeusZBTC',
  },
}

module.exports = buildProtocolExports(configs, bitcoinExportFn)
