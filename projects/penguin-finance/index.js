const { Connection, PublicKey } = require("@solana/web3.js");
const BufferLayout = require("@solana/buffer-layout");
const { TokenListProvider } = require("@solana/spl-token-registry");
const { MintLayout, TOKEN_PROGRAM_ID } = require("@solana/spl-token");

const SOLANA_API_URL = "https://solana-api.projectserum.com";
const PENGUIN_SWAP_PROGRAM_ADDRESS =
  "PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP";
const STAKING_ACCOUNT_ADDRESS = "F7AkpGvjsXaUVW49mMMgyKQzToFxJvHSZjwB6EUta1W";
const BUD_TOKEN_SYMBOL = "BUD";

const TokenSwapLayout = BufferLayout.struct([
  BufferLayout.u8("version"),
  BufferLayout.u8("isInitialized"),
  BufferLayout.u8("bumpSeed"),
  BufferLayout.blob(32, "tokenProgramId"),
  BufferLayout.blob(32, "tokenAccountA"),
  BufferLayout.blob(32, "tokenAccountB"),
  BufferLayout.blob(32, "tokenPool"),
  BufferLayout.blob(32, "mintA"),
  BufferLayout.blob(32, "mintB"),
  BufferLayout.blob(32, "feeAccount"),
  BufferLayout.blob(8, "tradeFeeNumerator"),
  BufferLayout.blob(8, "tradeFeeDenominator"),
  BufferLayout.blob(8, "ownerTradeFeeNumerator"),
  BufferLayout.blob(8, "ownerTradeFeeDenominator"),
  BufferLayout.blob(8, "ownerWithdrawFeeNumerator"),
  BufferLayout.blob(8, "ownerWithdrawFeeDenominator"),
  BufferLayout.blob(8, "hostFeeNumerator"),
  BufferLayout.blob(8, "hostFeeDenominator"),
  BufferLayout.u8("curveType"),
  BufferLayout.blob(32, "curveParameters"),
]);

const connection = new Connection(SOLANA_API_URL);

// Derives BUD price as a ratio compared to another token it is paired with that has been listed on Coingecko
function getBUDPrice(poolsTokenAccounts, tokenMap, validTokenAddresses) {
  for (tokenAccounts of poolsTokenAccounts) {
    const poolTokens = tokenAccounts.value.filter((account) =>
      validTokenAddresses.has(account.account.data.parsed.info.mint)
    );

    const token1 = tokenMap.get(poolTokens[0].account.data.parsed.info.mint);
    const token2 = tokenMap.get(poolTokens[1].account.data.parsed.info.mint);
    const amount1 = poolTokens[0].account.data.parsed.info.tokenAmount.uiAmount;
    const amount2 = poolTokens[1].account.data.parsed.info.tokenAmount.uiAmount;

    // Checks if BUD has been added to Coingecko after the time this code was written
    if (token1.symbol === BUD_TOKEN_SYMBOL && token1.extensions.coingeckoId) {
      return { rate: amount1, symbol: token1.extensions.coingeckoId };
    }
    if (token2.symbol === BUD_TOKEN_SYMBOL && token2.extensions.coingeckoId) {
      return { rate: amount2, symbol: token2.extensions.coingeckoId };
    }

    if (token1.symbol === BUD_TOKEN_SYMBOL && token2.extensions.coingeckoId) {
      return { rate: amount2 / amount1, symbol: token2.extensions.coingeckoId };
    }

    if (token2.symbol === BUD_TOKEN_SYMBOL && token1.extensions.coingeckoId) {
      return { rate: amount1 / amount2, symbol: token1.extensions.coingeckoId };
    }
  }

  return { rate: undefined, symbol: undefined };
}

async function getSharedState() {
  const tokenList = await new TokenListProvider()
    .resolve()
    .then((tokens) => tokens.filterByClusterSlug("mainnet-beta").getList());

  // tokenList is giant, Map lookups are more performant than object lookups so use a Map
  const tokenMap = tokenList.reduce((map, token) => {
    map.set(token.address, token);
    return map;
  }, new Map());

  const penguinSwapProgramPublicKey = new PublicKey(
    PENGUIN_SWAP_PROGRAM_ADDRESS
  );

  const programAccounts = await connection.getParsedProgramAccounts(
    penguinSwapProgramPublicKey
  );

  const validTokenAddresses = new Set();

  programAccounts.forEach((account) => {
    const tokenSwap = TokenSwapLayout.decode(account.account.data);
    validTokenAddresses.add(new PublicKey(tokenSwap.mintA).toString());
    validTokenAddresses.add(new PublicKey(tokenSwap.mintB).toString());
  });

  const tokenPoolMints = programAccounts.map(
    (account) =>
      new PublicKey(TokenSwapLayout.decode(account.account.data).tokenPool)
  );

  const poolAuthorityPubKeys = await connection
    .getMultipleAccountsInfo(tokenPoolMints)
    .then((poolAccounts) =>
      poolAccounts.map(
        (account) =>
          new PublicKey(MintLayout.decode(account.data).mintAuthority)
      )
    );

  const poolsTokenAccounts = await Promise.all(
    poolAuthorityPubKeys.map((key) =>
      connection.getParsedTokenAccountsByOwner(key, {
        programId: TOKEN_PROGRAM_ID,
      })
    )
  );

  return { validTokenAddresses, tokenMap, poolsTokenAccounts };
}

async function staking(time, ethBlock, chainBlocks) {
  const { validTokenAddresses, tokenMap, poolsTokenAccounts } =
    await getSharedState();

  const stakingAccountPubKey = new PublicKey(STAKING_ACCOUNT_ADDRESS);
  const stakingAccount = await connection.getParsedAccountInfo(
    stakingAccountPubKey
  );

  const { symbol, rate } = getBUDPrice(
    poolsTokenAccounts,
    tokenMap,
    validTokenAddresses
  );

  return {
    [symbol]: rate * stakingAccount.value.data.parsed.info.tokenAmount.uiAmount,
  };
}

function getFilteredPools(
  poolsTokenAccounts,
  validTokenAddresses,
  tokenMap,
  calculatePool2
) {
  return poolsTokenAccounts.filter((tokenAccounts) => {
    const poolTokens = tokenAccounts.value.filter((account) =>
      validTokenAddresses.has(account.account.data.parsed.info.mint)
    );

    const symbol1 = tokenMap.get(
      poolTokens[0].account.data.parsed.info.mint
    ).symbol;
    const symbol2 = tokenMap.get(
      poolTokens[1].account.data.parsed.info.mint
    ).symbol;

    if (calculatePool2) {
      return symbol1 === BUD_TOKEN_SYMBOL || symbol2 === BUD_TOKEN_SYMBOL;
    }

    return symbol1 !== BUD_TOKEN_SYMBOL && symbol2 !== BUD_TOKEN_SYMBOL;
  });
}

function tvl(calculatePool2) {
  return async (time, ethBlock, chainBlocks) => {
    const { validTokenAddresses, tokenMap, poolsTokenAccounts } =
      await getSharedState();

    const filteredPools = getFilteredPools(
      poolsTokenAccounts,
      validTokenAddresses,
      tokenMap,
      calculatePool2
    );

    const balances = {};

    filteredPools.forEach((tokenAccounts) => {
      const poolTokens = tokenAccounts.value.filter((account) =>
        validTokenAddresses.has(account.account.data.parsed.info.mint)
      );

      const token1 = tokenMap.get(poolTokens[0].account.data.parsed.info.mint);
      const token2 = tokenMap.get(poolTokens[1].account.data.parsed.info.mint);
      const symbol1 = token1.extensions.coingeckoId;
      const symbol2 = token2.extensions.coingeckoId;

      let amount1 = poolTokens[0].account.data.parsed.info.tokenAmount.uiAmount;
      let amount2 = poolTokens[1].account.data.parsed.info.tokenAmount.uiAmount;

      // Future proofing - only add this pool's tokens to balances if one of the pool's tokens are listed on Coingecko
      // As of March 23, 2022 all of Penguin Finance pools have at least one token listed on Coingecko
      if (symbol1 || symbol2) {
        // If one of the pool's tokens is not on Coingecko we will double the amount of the other token to get a pool TVL estimation
        if (!symbol1 && symbol2) {
          amount2 *= 2;
          balances[symbol2] = (balances[symbol2] ?? 0) + amount2;
        } else if (symbol1 && !symbol2) {
          amount1 *= 2;
          balances[symbol1] = (balances[symbol1] ?? 0) + amount1;
        } else {
          balances[symbol1] = (balances[symbol1] ?? 0) + amount1;
          balances[symbol2] = (balances[symbol2] ?? 0) + amount2;
        }
      }
    });

    return balances;
  };
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools and governance token staking contract. Pools that have one side BUD token have been separated into the pool2 filter.",
  solana: {
    staking,
    tvl: tvl(false),
    pool2: tvl(true),
  },
};
