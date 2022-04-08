const utils = require("../helper/utils");
const { Connection, PublicKey } = require("@solana/web3.js");
const { Coder } = require("@project-serum/anchor");
const QuarryMineIDL = require("./quarry_mine.json");
const { getMSolLPTokens, MSOL_LP_MINT } = require("./msolLP");

const { getMultipleAccountBuffers } = require("../helper/solana");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const readTVL = async ({
  tokenA,
  tokenB,
  tokenAReserve,
  tokenBReserve,
  poolMint,
  tokenAmount,
}) => {
  const accountData = await getMultipleAccountBuffers({
    tokenAReserve,
    tokenBReserve,
    poolMint,
  });

  const decimals = accountData.poolMint.readUInt8(44);
  const divisor = 10 ** decimals;

  const lpTokenTotalSupply = Number(accountData.poolMint.readBigUInt64LE(36));
  const poolShare = (tokenAmount * divisor) / lpTokenTotalSupply;

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

  // this is a mapping of token mint to list of quarries
  // more details: https://github.com/QuarryProtocol/rewarder-list
  const {
    data: { quarriesByStakedMint, coingeckoIDs },
  } = await utils.fetchURL(
    "https://raw.githubusercontent.com/QuarryProtocol/rewarder-list-build/master/mainnet-beta/tvl.json"
  );
  const { data: saberPools } = await utils.fetchURL(
    "https://registry.saber.so/data/llama.mainnet.json"
  );

  const connection = new Connection("https://api.mainnet-beta.solana.com");
  const coder = new Coder(QuarryMineIDL);

  for (const [stakedMint, quarryKeys] of Object.entries(quarriesByStakedMint)) {
    const coingeckoID = coingeckoIDs[stakedMint];
    const saberPool = coingeckoID
      ? null
      : saberPools.find((p) => p.lpMint === stakedMint);
    const isMsolSolLP = stakedMint === MSOL_LP_MINT.toString();

    if (!coingeckoID && !saberPool && !isMsolSolLP) {
      // we can't price this asset, so don't bother fetching anything
      continue;
    }

    const quarriesRaw = await connection.getMultipleAccountsInfo(
      quarryKeys.map((q) => new PublicKey(q))
    );
    const quarries = quarriesRaw.map((q) =>
      coder.accounts.decode("Quarry", q.data)
    );
    const totalTokens = quarries.reduce(
      (sum, q) =>
        sum +
        parseFloat(q.totalTokensDeposited.toString()) /
          10 ** q.tokenMintDecimals,
      0
    );

    if (coingeckoID) {
      if (!tvlResult[coingeckoID]) {
        tvlResult[coingeckoID] = totalTokens;
      } else {
        tvlResult[coingeckoID] += totalTokens;
      }
    } else if (saberPool) {
      const quarryTVL = await readTVL({
        tokenA: saberPool.tokenACoingecko,
        tokenB: saberPool.tokenBCoingecko,
        tokenAReserve: saberPool.reserveA,
        tokenBReserve: saberPool.reserveB,
        poolMint: stakedMint,
        tokenAmount: totalTokens,
      });
      for (const [tokenId, amount] of Object.entries(quarryTVL)) {
        if (!tvlResult[tokenId]) {
          tvlResult[tokenId] = amount;
        } else {
          tvlResult[tokenId] += amount;
        }
      }
    } else if (isMsolSolLP) {
      const msolTVL = await getMSolLPTokens(totalTokens);
      for (const [tokenId, amount] of Object.entries(msolTVL)) {
        if (!tvlResult[tokenId]) {
          tvlResult[tokenId] = amount;
        } else {
          tvlResult[tokenId] += amount;
        }
      }
    }

    // sleep to avoid rate limiting issues
    await sleep(1200);
  }

  return tvlResult;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  methodology:
    "TVL counts deposits made to Quarry Protocol. CoinGecko is used to find the price of tokens in USD.",
  solana: { tvl },
};
