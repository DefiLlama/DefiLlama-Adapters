const { sumTokensExport} = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
    timetravel: false,
    misrepresentedTokens:false,
    methodology:"The projects' idle funds stored in the smart contracts could directly contribute to TVL, as well as the funds recharged from projects or platforms like GameFi and DePin projects. And through the Defi Legos combination, Pay Protocol not only helps projects earn interest on short-term idle funds but also makes the merchants' idle funds workaround and channel back to the DeFi ecosystem through smart contracts, which could result in TVL&liquidity increasing as well.",
    tron: {
        tvl: sumTokensExport({ 
          tokensAndOwners: [
            [ADDRESSES.tron.USDT, 'TU7YFtc7NC4wJRybjkHhRf8DX9ZDSBhSdK'],
            [ADDRESSES.tron.USDT, 'TLuDFSgYQoKcwJ1YmQUsLMLrZdPLeackT1'],
            [ADDRESSES.tron.USDT, 'TRyHYqkG32NFmo87GwwgrQDvmBhD7JL67b'],
            [ADDRESSES.tron.USDT, 'TRwhon9hVQHbvQB3qkt7pVh9NsZktDy8En'],
            [ADDRESSES.tron.USDT, 'TRYEJ4PBow1sUudPMJR8UycQeHZ9PSzM8S'],
            [ADDRESSES.tron.USDT, 'TFv4XfhYAGkKiXiLUsp2SsAsPLUBRf9YdU'],
            [ADDRESSES.tron.USDT, 'TDyJDwzQLWZNxNxzYiMcpgiMHZv7vZ4FQv'],
            [ADDRESSES.tron.USDT, 'TXCw6qWT31ojxBvPe2HV9oQFS2hzqCM59Z'],
            [ADDRESSES.tron.USDT, 'TJ28y4XdSKg68wDEzzKBdJvQAoVrLoLGwZ'],
            [ADDRESSES.tron.USDT, 'TVeCjJFfC5A1C1oir3ut585NNqjmxfExGb'],
            [ADDRESSES.tron.USDT, 'TEZSXmDgUdjnVZYTsHk1SoGGY1webVtDGu'],
            [ADDRESSES.tron.USDT, 'TXgQQFaTinfmDaYNRhKkrqg4Q4mXr2Eq1j'],
          ],
        }),
    },

    bsc: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.bsc.USDT, '0x2FaF30c63Cc4138907062817090709a08b9fa6a6'],
        [ADDRESSES.bsc.USDT, '0x8590d7D019d7EdcC39AE6a0CB3013E7162fabd1f'],
        [ADDRESSES.bsc.USDT, '0x5B491a6aDf58dF70B3E3111a02eD2FBCdA9538a2'],
        [ADDRESSES.bsc.USDT, '0xEb8C48D196e0cf6f6DD60D27cfcC8A9FeE928ad9'],
        [ADDRESSES.bsc.USDT, '0x4076DD5c76134Ca2A4FBF88c0f06135151baC4b7'],
      ],
    }),
  },
};