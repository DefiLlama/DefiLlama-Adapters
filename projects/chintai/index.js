const { get } = require("../helper/http");
const { get_account_tvl } = require("../helper/chain/eos");
const { sumTokens2 } = require("../helper/solana");
const { sumTokensExport } = require("../helper/unwrapLPs");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const ADDRESSES = require("../helper/coreAssets.json");

const config = {
  ethereum: {
    addresses: {
      chex: "0x9Ce84F6A69986a83d92C324df10bC8E64771030f",
    },
    pools: {
      uniswapPools: [
        "0xD3e9895230E8FB1460852F6cDA3C4B926FbC29D8",
        "0x4CD9B6c163B80682D3FA8e5D8eAf686E68aF8D61",
        "0x1D48Fc96200153033476faAEFb837e3381e081ce",
        "0x91c13DF39144D5F84272d04b17f03d35aB9e8d7C",
      ],
    },
  },
  base: {
    addresses: {
      chex: "0xc43f3ae305a92043bd9b62ebd2fe14f7547ee485",
    },
    pools: {
      aerodromePools: ["0x6466e1a3b42Ef91f8f7C135970db4495e89F9C0A"],
    },
  },
  bsc: {
    addresses: {
      chex: "0x9Ce84F6A69986a83d92C324df10bC8E64771030f",
    },
    pools: {
      pancakeSwapPools: ["0xf51c15df6cdeb8c4a7ddee596cd3886db3365c6d"],
    },
  },
  solana: {
    addresses: {
      chex: "6dKCoWjpj5MFU5gWDEFdpUUeBasBLK3wLEwhUzQPAa1e",
      ninja: "FgX1WD9WzMU3yLwXaFSarPfkgzjLb2DZCqmkx9ExpuvJ",
      wbtc: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh",
    },
    pools: {
      orcaTokenAccounts: [
        "FU1Axs4T5G6QSD6UMvKQRmcgB4xkHmy2tTDEpyFHCySz",
        "5YYrLug5xJr9HXJidSStAaqR2yg8CD21ovU8fBZEBtuY",
        "BaNDYFKnVsJk9aS8zRifaZ3Duc312PPL3obZVWJNDeSr",
        "7KjuZf6Dwtd9JJjEnzvrb5LM2iJKvVLa47edrBE11am6",
      ],
      meteoraAccounts: [
        "5qmWvgyCSZQNJs2NWwTKdFsmcRT2NJJAuomti8GBCBfm",
        "Gs1dVEjVT3mSBKFxLsGw2BtQnkKaGKFkPc4CwchtqvP7",
        "5qmWvgyCSZQNJs2NWwTKdFsmcRT2NJJAuomti8GBCBfm",
        "8y3jryTeRcerNRyozfQR5bgdjME24hqBMFLQptZkBEhb",
        "LqZmiW9gmtNnHMu56stPii414pT5EUwhXkpiwa6d4RW",
        "FhCPZa4bjZdaV9GBrvjyeeK95XmjkU83AfwTNdr7bjn3",
      ],
      raydiumAccounts: [
        "3yc8oB6RE5Rz8ThRTJSvzwFqZSMpNAzzwMtJifgn2m7Z",
        "6yDMv6GEgMsJWV6Fr7Lk8YfXcMEAvz18CRsPzVn6B4hB",
        "2qmJC3SVFSkK2fYz7fswkPn7ySqtf9xH2AkLBZ999sbr",
        "AD7qRvY14byTLY19tWZTvXLaMF7AZj4dw4Gb1nHbgaW6",
      ],
    },
  },
};

async function solanaTvl() {
  return sumTokens2({
    tokenAccounts: [
      config.solana.pools.orcaTokenAccounts,
      config.solana.pools.meteoraAccounts,
      config.solana.pools.raydiumAccounts,
    ].flat(),
  });
}

async function eosTvl() {
  const tokens = [
    ["chexchexchex", "CHEX", "chex-token"],
    ["eosio.token", "EOS", "eos"],
  ];
  return await get_account_tvl(["swap.defi", "newdexpublic"], tokens);
}

const scaleValue = (value, times = 1) =>
  BigNumber(value).times(times).toFixed(0);

async function toBalances(symbol, value) {
  const address = ADDRESSES.ethereum[symbol];
  if (!address) {
    return null;
  }

  const decimals = (
    await sdk.api.abi.call({
      target: address,
      abi: "erc20:decimals",
      chain: "ethereum",
    })
  ).output;

  return {
    [address]: scaleValue(value, 10 ** decimals),
  };
}

async function chintaiTvl() {
  const stats = await get("https://sg.app.chintai.io/api/stats");

  let balances = {};
  for (const [symbol, supply] of Object.entries(stats.coinsBalances)) {
    let balance = await toBalances(symbol, supply);
    if (balance) {
      Object.assign(balances, balance);
    }
  }

  return balances;
}

module.exports = {
  methodology: `Chintai TVL is achieved by querying token balances from Chintai pools`,
  ethereum: {
    tvl: sumTokensExport({
      chain: "ethereum",
      owners: config.ethereum.pools.uniswapPools,
      tokens: [
        config.ethereum.addresses.chex,
        ADDRESSES.ethereum.WETH,
        ADDRESSES.ethereum.USDC,
      ],
    }),
  },
  base: {
    tvl: sumTokensExport({
      chain: "base",
      owners: config.base.pools.aerodromePools,
      tokens: [ADDRESSES.base.USDC, config.base.addresses.chex],
    }),
  },
  bsc: {
    tvl: sumTokensExport({
      chain: "bsc",
      owners: config.bsc.pools.pancakeSwapPools,
      tokens: [ADDRESSES.bsc.WBNB, config.bsc.addresses.chex],
    }),
  },
  solana: {
    tvl: solanaTvl,
  },
  eos: {
    tvl: eosTvl,
  },
  chintai: {
    tvl: chintaiTvl,
  },
};
