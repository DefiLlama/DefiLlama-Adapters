const utils = require("../helper/utils");
const SUNNY_POOLS = require("../helper/sunny-pools.json");

const {
  getMultipleAccountBuffers,
  getMultipleAccountsRaw,
} = require("../helper/solana");

async function getTotalBalancesFromMultipleAccounts(tokenAccounts) {
  const tokenAccountsData = (await getMultipleAccountsRaw(tokenAccounts))
    .map((account) => {
      if (account !== null) {
        return Buffer.from(account.data[0], account.data[1]);
      }
      return null;
    })
    .filter((d) => !!d);
  return tokenAccountsData
    .map((tad) =>
      // sorry, this code is a tad hacky
      Number(tad.readBigUInt64LE(64))
    )
    .reduce((acc, el) => acc + el, 0);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  const cashioTreasuryAccounts = await utils.fetchURL(
    "https://raw.githubusercontent.com/cashioapp/treasury/master/data/token-accounts.json"
  );

  const { coingeckoTokens, sunnyPools } = cashioTreasuryAccounts.data;

  // fetch all normal tokens (tokens with coingecko IDs)
  for (const [coingeckoID, tokenAccounts] of Object.entries(coingeckoTokens)) {
    const amount = await getTotalBalancesFromMultipleAccounts(tokenAccounts);
    if (!tvlResult[coingeckoID]) {
      tvlResult[coingeckoID] = amount;
    } else {
      tvlResult[coingeckoID] += amount;
    }
  }

  // Run these serially to avoid rate limiting issues
  for (const [sunnyPoolKey, tokenAccounts] of  Object.entries(sunnyPools)) {
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
    console.log(sunnyPool.poolName, poolTVL);
    await sleep(1200);

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
  methodology:
    "TVL counts LP token deposits made to Cashio and accrued reward tokens to its bank. CoinGecko is used to find the price of tokens in USD.",
  tvl,
};
