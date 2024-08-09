const { sumTokensExport } = require("../helper/unwrapLPs");
const { sumTokens2 } = require("../helper/solana");
const { get_account_tvl } = require("../helper/chain/eos");
const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

const ADDRESSES = require("../helper/coreAssets.json");
const config = {
  addresses: {
    ethereum: {
      chex: "0x9Ce84F6A69986a83d92C324df10bC8E64771030f",
    },
    base: {
      chex: "0xc43f3ae305a92043bd9b62ebd2fe14f7547ee485",
    },
    bsc: {
      chex: "0x9Ce84F6A69986a83d92C324df10bC8E64771030f",
    },
    solana: {
      chex: "6dKCoWjpj5MFU5gWDEFdpUUeBasBLK3wLEwhUzQPAa1e",
      ninja: "FgX1WD9WzMU3yLwXaFSarPfkgzjLb2DZCqmkx9ExpuvJ",
      wbtc: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
    },
  },
};

const uniswapPools = [
  "0xD3e9895230E8FB1460852F6cDA3C4B926FbC29D8",
  "0x4CD9B6c163B80682D3FA8e5D8eAf686E68aF8D61",
  "0x1D48Fc96200153033476faAEFb837e3381e081ce",
  "0x91c13DF39144D5F84272d04b17f03d35aB9e8d7C",
];

const aerodromePool = "0x6466e1a3b42Ef91f8f7C135970db4495e89F9C0A";
const pancakeSwapPool = "0xf51c15df6cdeb8c4a7ddee596cd3886db3365c6d";

async function solanaTvl() {
  const orcaTokenAccounts = [
    "FU1Axs4T5G6QSD6UMvKQRmcgB4xkHmy2tTDEpyFHCySz",
    "5YYrLug5xJr9HXJidSStAaqR2yg8CD21ovU8fBZEBtuY",
    "BaNDYFKnVsJk9aS8zRifaZ3Duc312PPL3obZVWJNDeSr",
    "7KjuZf6Dwtd9JJjEnzvrb5LM2iJKvVLa47edrBE11am6",
  ];

  const meteoraAccounts = [
    "5qmWvgyCSZQNJs2NWwTKdFsmcRT2NJJAuomti8GBCBfm",
    "Gs1dVEjVT3mSBKFxLsGw2BtQnkKaGKFkPc4CwchtqvP7",
    "5qmWvgyCSZQNJs2NWwTKdFsmcRT2NJJAuomti8GBCBfm",
    "8y3jryTeRcerNRyozfQR5bgdjME24hqBMFLQptZkBEhb",
    "LqZmiW9gmtNnHMu56stPii414pT5EUwhXkpiwa6d4RW",
    "FhCPZa4bjZdaV9GBrvjyeeK95XmjkU83AfwTNdr7bjn3",
  ];

  const raydiumAccounts = [
    "3yc8oB6RE5Rz8ThRTJSvzwFqZSMpNAzzwMtJifgn2m7Z",
    "6yDMv6GEgMsJWV6Fr7Lk8YfXcMEAvz18CRsPzVn6B4hB",
    "2qmJC3SVFSkK2fYz7fswkPn7ySqtf9xH2AkLBZ999sbr",
    "AD7qRvY14byTLY19tWZTvXLaMF7AZj4dw4Gb1nHbgaW6",
  ];

  return sumTokens2({
    tokenAccounts: [orcaTokenAccounts, meteoraAccounts, raydiumAccounts].flat(),
  });
}

async function eosTvl() {
  const tokens = [
    ["chexchexchex", "CHEX", "chex-token"],
    ["eosio.token", "EOS", "eos-token"],
  ];
  return await get_account_tvl(["swap.defi", "newdexpublic"], tokens);
}

async function fetchChintaiTvl() {
  const stats = await get("https://sg.app.chintai.io/api/stats");
  return toUSDTBalances(stats.totalValueLocked);
}

module.exports = {
  methodology: `Chintai TVL is achieved by querying token balances from Chintai pools`,
  ethereum: {
    tvl: sumTokensExport({
      chain: "ethereum",
      owners: uniswapPools,
      tokens: [
        config.addresses.ethereum.chex,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDC,
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      chain: "base",
      owners: [aerodromePool],
      tokens: [ADDRESSES.base.USDC, config.addresses.base.chex],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      chain: "bsc",
      owners: [pancakeSwapPool],
      tokens: [ADDRESSES.bsc.WBNB, config.addresses.bsc.chex],
    }),
  },
  solana: {
    tvl: solanaTvl,
  },
  eos: {
    tvl: eosTvl,
  },
  chintai: {
    tvl: fetchChintaiTvl,
  },
};
