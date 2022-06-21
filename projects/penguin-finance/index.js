const { Connection, PublicKey } = require("@solana/web3.js");
const BufferLayout = require("@solana/buffer-layout");
const { MintLayout, TOKEN_PROGRAM_ID } = require("@solana/spl-token");
const { getTokenList } = require('../helper/solana')

const SOLANA_API_URL = "https://api.mainnet-beta.solana.com";
const PENGUIN_SWAP_PROGRAM_ADDRESS =
  "PSwapMdSai8tjrEXcxFeQth87xC4rRsa4VA5mhGhXkP";

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

async function tvl() {
  const tokenList = await getTokenList()

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
  await sleep(11000)

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
  await sleep(11000)
  let i = 0

  const poolsTokenAccounts = []
  
  for (const key of poolAuthorityPubKeys) {
    poolsTokenAccounts.push(await connection.getParsedTokenAccountsByOwner(key, {
      programId: TOKEN_PROGRAM_ID,
    }))
    await sleep(2000)
  }
  const balances = {};

  poolsTokenAccounts.forEach((tokenAccounts) => {
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
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    "TVL includes the total token value inside the protocol's liquidity pools.",
  solana: {
    tvl,
  },
}
