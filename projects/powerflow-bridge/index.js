const BigNumber = require("bignumber.js");
const ADDRESSES = require("../helper/coreAssets.json");
const { getBalance2 } = require("../helper/chain/cosmos.js");
const { sumTokensExport } = require("../helper/unwrapLPs.js");
const { sumTokens2 } = require("../helper/solana.js");

const config = {
  titan: {
    atkx: {
      coinGeckoId: "tokenize-xchange",
      decimals: 18,
    },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/usdc":
      {
        coinGeckoId: "usdc",
        decimals: 6,
      },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/usdt":
      {
        coinGeckoId: "tether",
        decimals: 6,
      },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/eth":
      {
        coinGeckoId: "ethereum",
        decimals: 18,
      },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/sol":
      {
        coinGeckoId: "solana",
        decimals: 9,
      },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/meow":
      {
        coinGeckoId: "meow-2",
        decimals: 8,
      },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/oracler":
      {
        coinGeckoId: "oracler-ai",
        decimals: 6,
      },
    "factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/monkeys":
      {
        coinGeckoId: "monkeys-2",
        decimals: 6,
      },
  },
};

async function titanTvl(api) {
  const bals = await getBalance2({
    chain: "titan",
    owner: "titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy",
  });

  Object.entries(bals).forEach(([denom, amount]) => {
    const token = config.titan[denom];
    if (!token) return;

    const tokenAmount = new BigNumber(amount)
      .dividedBy(new BigNumber(10).pow(token.decimals))
      .toNumber();

    api.addCGToken(token.coinGeckoId, tokenAmount);
  });
}

const erc20Contracts = [ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT];

async function ethereumTvl(api) {
  await sumTokensExport({
    owner: "0x9Be9C79f1d8bC09c5b9A6c312e360227Ddb57230",
    tokens: erc20Contracts,
  })(api);

  const weiAmount = await api.provider.getBalance(
    "0x9Be9C79f1d8bC09c5b9A6c312e360227Ddb57230"
  );
  const ethAmount = new BigNumber(weiAmount)
    .dividedBy(new BigNumber(10).pow(18))
    .toNumber();

  api.addCGToken("ethereum", ethAmount);
}

async function solanaTvl() {
  return await sumTokens2({
    owner: "Cqv9L3HeevzDQipST26xNR5DBrcRRRqRsg4HTHA1wE9L",
  });
}

module.exports = {
  methodology: "Counts the tokens locked in the PowerFlow Bridge contracts.",
  titan: {
    tvl: titanTvl,
  },
  ethereum: {
    tvl: ethereumTvl,
  },
  solana: {
    tvl: solanaTvl,
  },
};
