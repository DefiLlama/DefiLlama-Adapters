const { getSolBalanceFromStakePool, getStakedSol } = require('../projects/helper/solana')
const { buildProtocolExports } = require('./utils')

function isStakedConfig(config) {
  return typeof config === 'object' && config !== null && !Array.isArray(config) && config.type === 'staked'
}

function solanaStakePoolExportFn(chainConfigs) {
  const result = {}
  Object.entries(chainConfigs).forEach(([chain, config]) => {
    if (isStakedConfig(config)) {
      const addresses = Array.isArray(config.address) ? config.address : [config.address]
      result[chain] = {
        tvl: async (api) => {
          for (const address of addresses) {
            await getStakedSol(address, api)
          }
        }
      }
    } else {
      const addresses = Array.isArray(config) ? config : [config]
      result[chain] = {
        tvl: async (api) => {
          for (const address of addresses) {
            await getSolBalanceFromStakePool(address, api)
          }
        }
      }
    }
  })
  result.timetravel = false
  return result
}

const configs = {
  'bybitSOL': {
    solana: '2aMLkB5p5gVvCwKkdSo5eZAL1WwhZbxezQr1wxiynRhq',
  },
  'starke-sol': {
    solana: '6LXCxeyQZqdAL4yLCtgATFYF6dcayWvsiwjtBFYVfb1N',
  },
  'lantern-sol': {
    solana: 'LW3qEdGWdVrxNgxSXW8vZri7Jifg4HuKEQ1UABLxs3C',
  },
  'jagpool-sol': {
    solana: 'jagEdDepWUgexiu4jxojcRWcVKKwFqgZBBuAoGu2BxM',
  },
  'stronghold-staked-sol': {
    solana: 'GZDX5JYXDzCEDL3kybhjN7PSixL4ams3M2G4CvWmMmm5',
  },
  'laine-sol': {
    solana: '2qyEeSAWKfU18AFthrF7JA8z8ZCi1yt76Tqs917vwQTV',
  },
  'dz-sol': {
    solana: '3fV1sdGeXaNEZj6EPDTpub82pYxcRXwt2oie6jkSzeWi',
  },
  'dfdv-staked-sol': {
    solana: 'pyZMBjpWsVjKANAYK5mpNbKiws2krjRPZ2N2UYCSnbP',
  },
  'phantom-sol': {
    solana: 'pSPcvR8GmG9aKDUbn9nbKYjkxt9hxMS7kF1qqKJaPqJ',
  },
  'vsol': {
    solana: 'Fu9BYC6tWBo1KMKaP3CFoKfRhqv9akmy3DuYwnCyWiyC',
  },
  'shinobi-sol': {
    solana: 'spp1mo6shdcrRyqDK2zdurJ8H5uttZE6H6oVjHxN1QN',
  },
  'helius-sol': {
    solana: '3wK2g8ZdzAH8FJ7PKr2RcvGh7V9VYson5hrVsJM5Lmws',
  },
  'dSOL': {
    solana: '9mhGNSPArRMHpLDMSmxAvuoizBqtBGqYdT8WGuqgxNdn',
  },
  'bonk-sol': {
    solana: 'ArAQfbzsdotoKB5jJcZa3ajQrrPcWr2YQoDAEAiFxJAC',
  },
  'jpool': {
    methodology: "JSOL total supply as it's equal to the SOL staked",
    solana: 'CtMyWsrUtAwXWiGr9WjHT5fC3p3fgV8cyGpLTo2LJzG1',
  },
  'adrastea-lst': {
    methodology: "TVL represents the total amount of SOL staked in Adrastea's liquid staking pool",
    solana: '2XhsHdwf4ZDpp2JhpTqPovoVy3L2Atfp1XkLqFMwGP4Y',
  },
  'solanahub-sol': {
    doublecounted: true,
    methodology: "SolanaHub Staked SOL (hubSOL) is a tokenized representation on your staked SOL + stake rewards",
    solana: 'ECRqn7gaNASuvTyC5xfCUjehWZCSowMXstZiM5DNweyB',
  },
  'pico-sol': {
    doublecounted: true,
    methodology: "Pico Staked SOL (picoSOL) is a tokenized representation on your staked SOL + stake rewards",
    solana: '8Dv3hNYcEWEaa4qVx9BTN1Wfvtha1z8cWDUXb7KVACVe',
  },
  'hyloSOL': {
    solana: [
      'hy1oDeVCVRDGkxS26qLVDvRhDpZGfWJ6w9AMvwMegwL',
      'hy1o2kiYu9rUDFqHJSqwJH4j5ZkM23tBJsaEmqkP9sT',
    ],
  },
  // getStakedSol adapters
  'marinade-select': {
    methodology: 'We sum the amount of SOL staked by account STNi1NHDUi6Hvibvonawgze8fM83PFLeJhuGMEXyGps',
    solana: { type: 'staked', address: 'STNi1NHDUi6Hvibvonawgze8fM83PFLeJhuGMEXyGps' },
  },
  'thevault': {
    solana: { type: 'staked', address: 'GdNXJobf8fbTR5JSE7adxa6niaygjx4EEbnnRaDCHMMW' },
  },
  'marinade-native': {
    solana: { type: 'staked', address: 'stWirqFCf2Uts1JBL1Jsd3r6VBWhgnpdPxCTe1MFjrq' },
  },
  'bnsol': {
    solana: { type: 'staked', address: '75NPzpxoh8sXGuSENFMREidq6FMzEx4g2AfcBEB6qjCV' },
  },
  'blazestake': {
    solana: { type: 'staked', address: '6WecYymEARvjG5ZyqkrVQ6YkhPfujNzWpSPwNKXHCbV2' },
  },
}

module.exports = buildProtocolExports(configs, solanaStakePoolExportFn)
