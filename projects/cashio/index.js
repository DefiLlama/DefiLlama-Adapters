const ADDRESSES = require('../helper/coreAssets.json')
const SUNNY_POOLS = [{
  "poolName": "quarry_saber_usdc_usdt",
  "relevantAccounts": {
    "sunnyPool": "3Zk1PhVap6mwrB9jZktucoSaMBa2whYSq8jtLew3tXbp",
    "tokenAMint": ADDRESSES.solana.USDC,
    "tokenBMint": ADDRESSES.solana.USDT,
    "tokenAReserve": "CfWX7o2TswwbxusJ4hCaPobu2jLCb1hfXuXJQjVq3jQF",
    "tokenBReserve": "EnTrdMMpdhugeH6Ban6gYZWXughWxKtVGfCwFn78ZmY3",
    "lpTokenSPL": "2poo1w1DL6yd2WNTCnNTzDqkC6MBXq7axo77P16yrBuf"
  },
  "tokenA": "usd-coin",
  "tokenB": "tether",
  "tvlReader": "sunnyQuarrySaberPoolReader"
}];

const {
  getMultipleAccountBuffers,
  getMultipleAccountsRaw,
} = require("../helper/solana");

const readTVL = async ({
  tokenA,
  tokenB,
  tokenAReserve,
  tokenBReserve,
  poolMint,
  tokenAccounts,
}) => {
  const accountData = await getMultipleAccountBuffers({
    tokenAReserve,
    tokenBReserve,
    poolMint,
  });
  if (accountData.sunnyPool === null) {
    return {};
  }

  const decimals = accountData.poolMint.readUInt8(44);
  const divisor = 10 ** decimals;

  const tokenAccountsData = (await getMultipleAccountsRaw(tokenAccounts))
    .map((account) => {
      if (account !== null) {
        return Buffer.from(account.data[0], account.data[1]);
      }
      return null;
    })
    .filter((d) => !!d);
  const totalTokens = tokenAccountsData
    .map((tad) =>
      // sorry, this code is a tad hacky
      Number(tad.readBigUInt64LE(64))
    )
    .reduce((acc, el) => acc + el, 0);
  const lpTokenTotalSupply = Number(accountData.poolMint.readBigUInt64LE(36));
  const poolShare = totalTokens / lpTokenTotalSupply;

  const reserveAAmount =
    Number(accountData.tokenAReserve.readBigUInt64LE(64)) / divisor;
  const reserveBAmount =
    Number(accountData.tokenBReserve.readBigUInt64LE(64)) / divisor;

  const poolTvlCoins = {};

  if (tokenA === tokenB) {
    poolTvlCoins[tokenA] =
      poolShare * reserveAAmount + poolShare * reserveBAmount;
  } else {
    poolTvlCoins[tokenA] = poolShare * reserveAAmount;
    poolTvlCoins[tokenB] = poolShare * reserveBAmount;
  }

  return poolTvlCoins;
};

async function tvl() {
  // a mapping of coin name to coin amount
  const tvlResult = {};

  // contains a list of all token accounts + their associated sunny pool or coingecko ID
  // more details: https://github.com/cashioapp/treasury
  const cashioTreasuryAccounts = {
    "sunnyPools": {
      "3Zk1PhVap6mwrB9jZktucoSaMBa2whYSq8jtLew3tXbp": [
        "D67ZNjaRERdc7Ej8SjbpyGwJT4MnadgzfGnwgCmMJAa1",
        "CJdU6oLxuzuDffqtrzv3YvQjdjQ7egCkuRshwmKXNYjM"
      ]
    }
  }
  

  const { sunnyPools } = cashioTreasuryAccounts;

  // Run these serially to avoid rate limiting issues
  for (const [sunnyPoolKey, tokenAccounts] of Object.entries(sunnyPools)) {
    const sunnyPool = SUNNY_POOLS.find(
      (pool) => pool.relevantAccounts.sunnyPool === sunnyPoolKey
    );
    if (!sunnyPool) {
      continue;
    }

    const poolTVL = await readTVL({
      tokenA: sunnyPool.tokenA,
      tokenB: sunnyPool.tokenB,
      tokenAReserve: sunnyPool.relevantAccounts.tokenAReserve,
      tokenBReserve: sunnyPool.relevantAccounts.tokenBReserve,
      poolMint: sunnyPool.relevantAccounts.lpTokenSPL,
      tokenAccounts,
    });

    for (const [tokenId, amount] of Object.entries(poolTVL)) {
      if (!tvlResult[tokenId]) {
        tvlResult[tokenId] = amount;
      } else {
        tvlResult[tokenId] += amount;
      }
    }
  }

  return tvlResult;
}

module.exports = {
  timetravel: false,
  hallmarks: [
    [1647993600, "Infinite mint glitch"]
],
  methodology:
    "TVL counts LP token deposits made to Cashio and accrued reward tokens to its bank. CoinGecko is used to find the price of tokens in USD.",
  solana: { tvl },
};
