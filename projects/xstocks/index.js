const { getTokenSupplies, sumTokens2 } = require('../helper/solana')

const data = [
  { "name": "Honeywell xStock", "p": { "solana": "XsRbLZthfABAPAfumWNEJhPyiKDW6TvDVeAeW7oKqA2", "arbitrum-one": "0x62a48560861b0b451654bfffdb5be6e47aa8ff1b" } },
  { "name": "Amazon xStock", "p": { "solana": "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg", "arbitrum-one": "0x3557ba345b01efa20a1bddc61f573bfd87195081" } },
  { "name": "Coinbase xStock", "p": { "solana": "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu", "arbitrum-one": "0x364f210f430ec2448fc68a49203040f6124096f0" } },
  { "name": "Visa xStock", "p": { "solana": "XsqgsbXwWogGJsNcVZ3TyVouy2MbTkfCFhCGGGcQZ2p", "arbitrum-one": "0x2363fd1235c1b6d3a5088ddf8df3a0b3a30c5293" } },
  { "name": "Robinhood xStock", "p": { "solana": "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg", "arbitrum-one": "0xe1385fdd5ffb10081cd52c56584f25efa9084015" } },
  { "name": "AbbVie xStock", "p": { "solana": "XswbinNKyPmzTa5CskMbCPvMW6G5CMnZXZEeQSSQoie", "arbitrum-one": "0xfbf2398df672cee4afcc2a4a733222331c742a6a" } },
  { "name": "Alphabet xStock", "p": { "solana": "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN", "arbitrum-one": "0xe92f673ca36c5e2efd2de7628f815f84807e803f" } },
  { "name": "Gamestop xStock", "p": { "solana": "Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc", "arbitrum-one": "0xe5f6d3b2405abdfe6f660e63202b25d23763160d" } },
  { "name": "Microsoft xStock", "p": { "solana": "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX", "arbitrum-one": "0x5621737f42dae558b81269fcb9e9e70c19aa6b35" } },
  { "name": "McDonald's xStock", "p": { "solana": "XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2", "arbitrum-one": "0x80a77a372c1e12accda84299492f404902e2da67" } },
  { "name": "Johnson & Johnson xStock", "p": { "solana": "XsGVi5eo1Dh2zUpic4qACcjuWGjNv8GCt3dm5XcX6Dn", "arbitrum-one": "0xdb0482cfad4789798623e64b15eeba01b16e917c" } },
  { "name": "Thermo Fisher xStock", "p": { "solana": "Xs8drBWy3Sd5QY3aifG9kt9KFs2K3PGZmx7jWrsrk57", "arbitrum-one": "0xaf072f109a2c173d822a4fe9af311a1b18f83d19" } },
  { "name": "Medtronic xStock", "p": { "solana": "XsDgw22qRLTv5Uwuzn6T63cW69exG41T6gwQhEK22u2", "arbitrum-one": "0x0588e851ec0418d660bee81230d6c678daf21d46" } },
  { "name": "MicroStrategy xStock", "p": { "solana": "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ", "arbitrum-one": "0xae2f842ef90c0d5213259ab82639d5bbf649b08e" } },
  { "name": "Eli Lilly xStock", "p": { "solana": "Xsnuv4omNoHozR6EEW5mXkw8Nrny5rB3jVfLqi6gKMH", "arbitrum-one": "0x19c41ea77b34bbdee61c3a87a75d1abda2ed0be4" } },
  { "name": "Marvell xStock", "p": { "solana": "XsuxRGDzbLjnJ72v74b7p9VY6N66uYgTCyfwwRjVCJA", "arbitrum-one": "0xeaad46f4146ded5a47b55aa7f6c48c191deaec88" } },
  { "name": "Gold xStock", "p": { "solana": "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re", "arbitrum-one": "0x2380f2673c640fb67e2d6b55b44c62f0e0e69da9" } },
  { "name": "SP500 xStock", "p": { "solana": "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W", "arbitrum-one": "0x90a2a4c76b5d8c0bc892a69ea28aa775a8f2dd48" } },
  { "name": "Circle xStock", "p": { "solana": "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1", "arbitrum-one": "0xfebded1b0986a8ee107f5ab1a1c5a813491deceb" } },
  { "name": "TQQQ xStock", "p": { "solana": "XsjQP3iMAaQ3kQScQKthQpx9ALRbjKAjQtHg6TFomoc", "arbitrum-one": "0xfdddb57878ef9d6f681ec4381dcb626b9e69ac86" } },
  { "name": "Vanguard xStock", "p": { "solana": "XsssYEQjzxBCFgvYFFNuhJFBeHNdLWYeUSP8F45cDr9", "arbitrum-one": "0xbd730e618bcd88c82ddee52e10275cf2f88a4777" } },
  { "name": "Amber xStock", "p": { "solana": "XsaQTCgebC2KPbf27KUhdv5JFvHhQ4GDAPURwrEhAzb", "arbitrum-one": "0x2f9a35ab5ddfbc49927bfdeab98a86c53dc6e763" } },
  { "name": "Nasdaq xStock", "p": { "solana": "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ", "arbitrum-one": "0xa753a7395cae905cd615da0b82a53e0560f250af" } },
  { "name": "DFDV xStock", "p": { "solana": "Xs2yquAgsHByNzx68WJC55WHjHBvG9JsMB7CWjTLyPy", "arbitrum-one": "0x521860bb5df5468358875266b89bfe90d990c6e7" } },
  { "name": "Comcast xStock", "p": { "solana": "XsvKCaNsxg2GN8jjUmq71qukMJr7Q1c5R2Mk9P8kcS8", "arbitrum-one": "0xbc7170a1280be28513b4e940c681537eb25e39f4" } },
  { "name": "Goldman Sachs xStock", "p": { "arbitrum-one": "0x3ee7e9b3a992fd23cd1c363b0e296856b04ab149" } },
  { "name": "Oracle xStock", "p": { "arbitrum-one": "0x548308e91ec9f285c7bff05295badbd56a6e4971" } },
  { "name": "Apple xStock", "p": { "arbitrum-one": "0x9d275685dc284c8eb1c79f6aba7a63dc75ec890a" } },
  { "name": "Exxon Mobil xStock", "p": { "arbitrum-one": "0xeedb0273c5af792745180e9ff568cd01550ffa13" } },
  { "name": "Pfizer xStock", "p": { "arbitrum-one": "0x1ac765b5bea23184802c7d2d497f7c33f1444a9e" } },
  { "name": "JPMorgan Chase xStock", "p": { "arbitrum-one": "0xd9fc3e075d45254a1d834fea18af8041207dea0a" } },
  { "name": "Accenture xStock", "p": { "arbitrum-one": "0x03183ce31b1656b72a55fa6056e287f50c35bbeb" } },
  { "name": "Cisco xStock", "p": { "arbitrum-one": "0x053c784cd87b74f42e0c089f98643e79c1a3ff16" } },
  { "name": "UnitedHealth xStock", "p": { "solana": "XszvaiXGPwvk2nwb3o9C1CX4K6zH8sez11E6uyup6fe", "arbitrum-one": "0x167a6375da1efc4a5be0f470e73ecefd66245048" } },
  { "name": "Danaher xStock", "p": { "arbitrum-one": "0xdba228936f4079daf9aa906fd48a87f2300405f4" } },
  { "name": "PepsiCo xStock", "p": { "solana": "Xsv99frTRUeornyvCfvhnDesQDWuvns1M852Pez91vF", "arbitrum-one": "0x36c424a6ec0e264b1616102ad63ed2ad7857413e" } },
  { "name": "Chevron xStock", "p": { "solana": "XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts", "arbitrum-one": "0xad5cdc3340904285b8159089974a99a1a09eb4c0" } },
  { "name": "Abbott xStock", "p": { "solana": "XsHtf5RpxsQ7jeJ9ivNewouZKJHbPxhPoEy6yYvULr7", "arbitrum-one": "0x89233399708c18ac6887f90a2b4cd8ba5fedd06e" } },
  { "name": "CrowdStrike xStock", "p": { "arbitrum-one": "0x214151022c2a5e380ab80cdac31f23ae554a7345" } },
  { "name": "AstraZeneca xStock", "p": { "arbitrum-one": "0x5d642505fe1a28897eb3baba665f454755d8daa2" } },
  { "name": "AppLovin xStock", "p": { "arbitrum-one": "0x50a1291f69d9d3853def8209cfb1af0b46927be1" } },
  { "name": "Netflix xStock", "p": { "arbitrum-one": "0xa6a65ac27e76cd53cb790473e4345c46e5ebf961" } },
  { "name": "Palantir xStock", "p": { "arbitrum-one": "0x6d482cec5f9dd1f05ccee9fd3ff79b246170f8e2" } },
  { "name": "Salesforce xStock", "p": { "arbitrum-one": "0x4a4073f2eaf299a1be22254dcd2c41727f6f54a2" } },
  { "name": "NVIDIA xStock", "p": { "arbitrum-one": "0xc845b2894dbddd03858fd2d643b4ef725fe0849d" } },
  { "name": "Coca-Cola xStock", "p": { "arbitrum-one": "0xdcc1a2699441079da889b1f49e12b69cc791129b" } },
  { "name": "Bank of America xStock", "p": { "arbitrum-one": "0x314938c596f5ce31c3f75307d2979338c346d7f2" } },
  { "name": "Novo Nordisk xStock", "p": { "arbitrum-one": "0xf9523e369c5f55ad72dbaa75b0a9b92b3d8b147e" } },
  { "name": "International Business Machines xStock", "p": { "arbitrum-one": "0xd9913208647671fe0f48f7f260076b2c6f310aac" } },
  { "name": "Philip Morris xStock", "p": { "arbitrum-one": "0x02a6c1789c3b4fdb1a7a3dfa39f90e5d3c94f4f9" } },
  { "name": "Merck xStock", "p": { "solana": "XsnQnU7AdbRZYe2akqqpibDdXjkieGFfSkbkjX1Sd1X", "arbitrum-one": "0x17d8186ed8f68059124190d147174d0f6697dc40" } },
  { "name": "Linde xStock", "p": { "solana": "XsSr8anD1hkvNMu8XQiVcmiaTP7XGvYu7Q58LdmtE8Z", "arbitrum-one": "0x15059c599c16fd8f70b633ade165502d6402cd49" } },
  { "name": "Tesla xStock", "p": { "solana": "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB", "arbitrum-one": "0x8ad3c73f833d3f9a523ab01476625f269aeb7cf0" } },
  { "name": "Berkshire Hathaway xStock", "p": { "solana": "Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x", "arbitrum-one": "0x12992613fdd35abe95dec5a4964331b1ee23b50d" } },
  { "name": "Mastercard xStock", "p": { "solana": "XsApJFV9MAktqnAc6jqzsHVujxkGm9xcSUffaBoYLKC", "arbitrum-one": "0xb365cd2588065f522d379ad19e903304f6b622c6" } },
  { "name": "Home Depot xStock", "p": { "solana": "XszjVtyhowGjSC5odCqBpW1CtXXwXjYokymrk7fGKD3", "arbitrum-one": "0x766b0cd6ed6d90b5d49d2c36a3761e9728501ba9" } },
  { "name": "Intel xStock", "p": { "solana": "XshPgPdXFRWB8tP1j82rebb2Q9rPgGX37RuqzohmArM", "arbitrum-one": "0xf8a80d1cb9cfd70d03d655d9df42339846f3b3c8" } },
  { "name": "Walmart xStock", "p": { "solana": "Xs151QeqTCiuKtinzfRATnUESM2xTU6V9Wy8Vy538ci", "arbitrum-one": "0x7aefc9965699fbea943e03264d96e50cd4a97b21" } },
  { "name": "Broadcom xStock", "p": { "solana": "XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo", "arbitrum-one": "0x38bac69cbbd28156796e4163b2b6dcb81e336565" } },
  { "name": "Meta xStock", "p": { "solana": "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu", "arbitrum-one": "0x96702be57cd9777f835117a809c7124fe4ec989a" } },
  { "name": "Procter & Gamble xStock", "p": { "solana": "XsYdjDjNUygZ7yGKfQaB6TxLh2gC6RRjzLtLAGJrhzV", "arbitrum-one": "0xa90424d5d3e770e8644103ab503ed775dd1318fd" } }
]

const chainMapping = {
  arbitrum: 'arbitrum-one',
}

async function tvl(api) {
  const chainKey = chainMapping[api.chain]
  const tokens = data.map(stock => stock.p[chainKey]).filter(Boolean)
  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens })
  api.add(tokens, supplies)
}


Object.keys(chainMapping).forEach(chain => {
  module.exports[chain] = { tvl }
})

async function solTvl(api) {
  const tokens = data.map(stock => stock.p.solana).filter(Boolean)
  const supplies = await getTokenSupplies(tokens)
  api.add(tokens, tokens.map((token) => supplies[token] || '0'))
  const mintedBalance = await sumTokens2({ balances: {}, owner: 'S7vYFFWH6BjJyEsdrPQpqpYTqLTrPRK6KW3VwsJuRaS', computedTokenAccounts: true, tokens})
  tokens.forEach(token => {
    if (mintedBalance['solana:'+token]) {
      api.add(token, mintedBalance['solana:'+token] * -1)  // exclude pre-minted tokens
    }
  })
}

module.exports.solana = { tvl: solTvl }