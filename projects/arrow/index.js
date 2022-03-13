const utils = require("../helper/utils");
const SUNNY_POOLS = require("../helper/sunny-pools.json");

const { getMultipleAccountBuffers, getMultipleAccountsRaw } = require("../helper/solana");

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

  // this is a mapping of token mint to list of token accounts
  // more details: https://github.com/arrowprotocol/arrowdex
  const arrowTokens = await utils.fetchURL(
    "https://raw.githubusercontent.com/arrowprotocol/arrowdex/master/data/token-accounts.json"
  );

  // Run these serially to avoid rate limiting issues
  for (const [poolMint, tokenAccounts] of Object.entries(arrowTokens.data)) {
    const sunnyPool = SUNNY_POOLS.find(
      (pool) => pool.relevantAccounts.lpTokenSPL === poolMint
    );
    if (!sunnyPool) {
      continue;
    }

    const poolTVL = await readTVL({
      tokenA: sunnyPool.tokenA,
      tokenB: sunnyPool.tokenB,
      tokenAReserve: sunnyPool.relevantAccounts.tokenAReserve,
      tokenBReserve: sunnyPool.relevantAccounts.tokenBReserve,
      poolMint,
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
  timetravel: false,
  methodology:
    'TVL counts LP token deposits made to Arrow Protocol. CoinGecko is used to find the price of tokens in USD, only the original "SOL" token price is used for all existing variations of the token.',
  tvl,
};
