const BigNumber = require("bignumber.js");
const axios = require("axios");
const http = require('./http')
const { Connection, PublicKey, Keypair } = require("@solana/web3.js")
const { AnchorProvider: Provider, Wallet, } = require("@project-serum/anchor");
const BufferLayout = require("@solana/buffer-layout")
const { MintLayout, TOKEN_PROGRAM_ID } = require("@solana/spl-token")
const { sleep, sliceIntoChunks, log, } = require('./utils')
const sdk = require('@defillama/sdk')

const solscan_base = "https://public-api.solscan.io/account/"

let connection, provider

const endpoint = process.env.SOLANA_RPC || "https://solana-api.projectserum.com/" // or "https://api.mainnet-beta.solana.com"

function getConnection() {
  if (!connection) connection = new Connection(endpoint)
  return connection
}

function getProvider() {
  if (!provider) {
    const dummy_keypair = Keypair.generate();
    const wallet = new Wallet(dummy_keypair);

    provider = new Provider(
      getConnection(), wallet
    );
  }
  return provider;
}


async function getSolBalances(accounts) {
  const formBody = key => ({ "jsonrpc": "2.0", "id": 1, "method": "getBalance", "params": [key] })
  const tokenBalances = await axios.post(endpoint, accounts.map(formBody));
  return tokenBalances.data.reduce((a, i) => a + i.result.value, 0) / 1e9
}

async function getSolBalance(account) {
  return getSolBalances([account])
}

const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json"

async function getTokenSupply(token) {
  const tokenSupply = await axios.post(endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenSupply",
    params: [token],
  });
  return tokenSupply.data.result.value.uiAmount;
}

function formTokenBalanceQuery(token, account) {
  return {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenAccountsByOwner",
    params: [
      account,
      { mint: token, },
      { encoding: "jsonParsed", },
    ],
  }
}
async function getTokenBalance(token, account) {
  const tokenBalance = await axios.post(endpoint, formTokenBalanceQuery(token, account));
  return tokenBalance.data.result.value.reduce(
    (total, account) =>
      total + account.account.data.parsed.info.tokenAmount.uiAmount,
    0
  );
}

async function getTokenBalances(tokensAndAccounts) {
  const body = tokensAndAccounts.map(([token, account]) => formTokenBalanceQuery(token, account))
  const tokenBalances = await axios.post(endpoint, body);
  const balances = {}
  tokenBalances.data.forEach(({ result: { value } }) => {
    value.forEach(({ account: { data: { parsed: { info: { mint, tokenAmount: { uiAmount } } } } } }) => {
      balances[mint] = (balances[mint] || 0) + uiAmount
    })
  })
  return balances
}

async function getTokenAccountBalances(tokenAccounts) {
  const formBody = account => ({ method: "getAccountInfo", jsonrpc: "2.0", params: [account, { encoding: "jsonParsed", commitment: "confirmed" }], id: 1 })

  const body = tokenAccounts.map(formBody)
  const data = await axios.post(endpoint, body);
  const balances = {}
  data.data.forEach(({ result: { value } }, i) => {
    if (!value) {
      console.log(data.data.map(i => i.result.value )[i], tokenAccounts[i])
    }
    const { data: { parsed: { info: { mint, tokenAmount: { uiAmount }}}}} = value
    balances[mint] = (balances[mint] || 0) + uiAmount
  })
  return balances
}


async function getTokenAccountBalance(account) {
  const tokenBalance = await axios.post(
    endpoint,
    {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountBalance",
      params: [account],
    },
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return tokenBalance.data.result?.value?.uiAmount;
}

let tokenList
let _tokenList

async function getTokenList() {
  if (!_tokenList)
    _tokenList = http.get(TOKEN_LIST_URL)
  tokenList = (await _tokenList).tokens
  return tokenList
}

// tokenList is giant, Map lookups are more performant than object lookups so use a Map
async function getTokenMap() {
  return (await getTokenList()).reduce((map, token) => {
    map.set(token.address, token);
    return map;
  }, new Map())
}


async function getCoingeckoId() {
  const tokenlist = await getTokenList();
  return address => tokenlist.find((t) => t.address === address)?.extensions
    ?.coingeckoId;
}

// Example: [[token1, account1], [token2, account2], ...]
async function sumTokens(tokensAndAccounts, balances = {}, ignoreBadTokens = false) {
  const tokenlist = await getTokenList();
  const tokenBalances = await Promise.all(
    tokensAndAccounts.map((t) => getTokenBalance(...t))
  );
  for (let i = 0; i < tokensAndAccounts.length; i++) {
    const token = tokensAndAccounts[i][0];
    let coingeckoId = tokenlist.find((t) => t.address === token)?.extensions
      ?.coingeckoId;
    const replacementCoingeckoId = tokensAndAccounts[i][2];
    if (coingeckoId === undefined) {
      if (replacementCoingeckoId !== undefined) {
        coingeckoId = replacementCoingeckoId;
      } else {
        if (!ignoreBadTokens)
          throw new Error(`Solana token ${token} has no coingecko id`)
        log(`Solana token ${token} has no coingecko id, it is ignored`)
      }
    }
    if (coingeckoId)
      balances[coingeckoId] = (balances[coingeckoId] || 0) + tokenBalances[i];
  }
  return balances;
}

// Example: [[token1, account1], [token2, account2], ...]
async function sumTokensUnknown(tokensAndAccounts) {
  const tokenlist = await getTokenList();
  const tokenBalances = await Promise.all(
    tokensAndAccounts.map((t) => getTokenBalance(...t))
  );
  const balances = {};
  for (let i = 0; i < tokensAndAccounts.length; i++) {
    const token = tokensAndAccounts[i][0];
    let coingeckoId = tokenlist.find((t) => t.address === token)?.extensions?.coingeckoId;
    const replacementCoingeckoId = tokensAndAccounts[i][2];
    if (coingeckoId === undefined) {
      if (replacementCoingeckoId !== undefined) {
        coingeckoId = replacementCoingeckoId;
        balances[coingeckoId] = (balances[coingeckoId] || 0) + tokenBalances[i];
      } else {
        balances[token] = (balances[token] || 0) + tokenBalances[i];
        log(`Solana token ${token} has no coingecko id`);
      }
    } else {
      balances[coingeckoId] = (balances[coingeckoId] || 0) + tokenBalances[i];
    }
  }
  return balances;
}

// accountsArray is an array of base58 address strings
async function getMultipleAccountsRaw(accountsArray) {
  if (
    !Array.isArray(accountsArray) ||
    accountsArray.length === 0 ||
    typeof accountsArray[0] !== "string"
  ) {
    throw new Error("Expected accountsArray to be an array of strings");
  }
  const accountsInfo = await axios.post(endpoint, {
    jsonrpc: "2.0",
    id: 1,
    method: "getMultipleAccounts",
    params: [accountsArray],
  });
  return accountsInfo.data.result.value;
}

// Gets data in Buffers of all addresses, while preserving labels
// Example: labeledAddresses = { descriptiveLabel: "9xDUcgo8S6DdRjvrR6ULQ2zpgqota8ym1a4tvxiv2dH8", ... }
async function getMultipleAccountBuffers(labeledAddresses) {
  let labels = [];
  let addresses = [];

  for (const [label, address] of Object.entries(labeledAddresses)) {
    labels.push(label);
    addresses.push(address);
  }
  const accountsData = await getMultipleAccountsRaw(addresses);

  const results = {};
  accountsData.forEach((account, index) => {
    if (account === null) {
      results[labels[index]] = null;
    } else {
      results[labels[index]] = Buffer.from(account.data[0], account.data[1]);
    }

    // Uncomment and paste into a hex editor to do some reverse engineering
    // console.log(`${labels[index]}: ${results[labels[index]].toString("hex")}`);
  });

  return results;
}

// Example: [[token1, account1], [token2, account2], ...]
async function sumOrcaLPs(tokensAndAccounts) {
  const [tokenlist, orcaPools] = await Promise.all([
    getTokenList(),
    axios.get("https://api.orca.so/pools").then((r) => r.data),
  ]);
  let totalUsdValue = 0;
  await Promise.all(
    tokensAndAccounts.map(async ([token, owner]) => {
      const balance = await getTokenBalance(token, owner);
      const symbol = tokenlist
        .find((t) => t.address === token)
        ?.symbol?.replace("[stable]", "");
      const supply = await getTokenSupply(token);
      const poolLiquidity =
        orcaPools.find((p) => p.name2 === symbol)?.liquidity ?? 0;
      totalUsdValue += (balance * poolLiquidity) / supply;
    })
  );
  return totalUsdValue;
}

function exportDexTVL(DEX_PROGRAM_ID) {
  return async () => {
    const connection = getConnection()

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
    ])

    const tokenMap = await getTokenMap()

    const programPublicKey = new PublicKey(DEX_PROGRAM_ID)

    const programAccounts = await connection.getParsedProgramAccounts(programPublicKey);

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

    const poolAuthorityPubKeys = []
    const chunks = sliceIntoChunks(tokenPoolMints, 99)
    for (const chunk of chunks)
      poolAuthorityPubKeys.push(...await connection
        .getMultipleAccountsInfo(chunk)
        .then((poolAccounts) =>
          poolAccounts.map(
            (account) =>
              new PublicKey(MintLayout.decode(account.data).mintAuthority)
          )
        ))

    const poolsTokenAccounts = []

    for (const key of poolAuthorityPubKeys) {
      poolsTokenAccounts.push(await connection.getParsedTokenAccountsByOwner(key, {
        programId: TOKEN_PROGRAM_ID,
      }))
      await sleep(300)
    }
    const balances = {};

    poolsTokenAccounts.forEach((tokenAccounts) => {
      const poolTokens = tokenAccounts.value.filter((account) =>
        validTokenAddresses.has(account.account.data.parsed.info.mint)
      );

      const token1 = tokenMap.get(poolTokens[0].account.data.parsed.info.mint);
      const token2 = tokenMap.get(poolTokens[1].account.data.parsed.info.mint);
      const symbol1 = token1?.extensions?.coingeckoId;
      const symbol2 = token2?.extensions?.coingeckoId;

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
}

async function getSaberPools() {
  return http.get('https://registry.saber.so/data/llama.mainnet.json')
}
async function getQuarryData() {
  return http.get('https://raw.githubusercontent.com/QuarryProtocol/rewarder-list-build/master/mainnet-beta/tvl.json')
}

async function sumTokens2({
  balances = {},
  tokensAndOwners = [],
  tokens = [],
  owners = [],
  owner,
  ignoreBadTokens = true,
  tokenAccounts = [],
  solOwners = []
}) {
  if (!tokensAndOwners.length) {
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }

  if (tokensAndOwners.length) {
    const chunks = sliceIntoChunks(tokensAndOwners, 99)
    for (const chunk of chunks) {
      await _sumTokens(chunk)
      if (chunks.length > 2) {
        log('waiting before more calls')
        await sleep(2000)
      }
    }
  }
  
  if (tokenAccounts.length) {
    const chunks = sliceIntoChunks(tokenAccounts, 31)
    for (const chunk of chunks) {
      await _sumTokenAccounts(chunk)
      if (chunks.length > 2) {
        log('waiting before more calls')
        await sleep(5000)
      }
    }
  }

  if (solOwners.length)  {
    const solBalance = await getSolBalances(solOwners)
    sdk.util.sumSingleBalance(balances, 'solana', solBalance)
  }

  return balances

  async function _sumTokens(tokensAndAccounts) {
    const tokenBalances = await getTokenBalances(tokensAndAccounts)
    return transformBalances({ tokenBalances, balances, ignoreBadTokens, })
  }

  async function _sumTokenAccounts(tokenAccounts) {
    const tokenBalances = await getTokenAccountBalances(tokenAccounts)
    return transformBalances({ tokenBalances, balances, ignoreBadTokens, })
  }
}

async function transformBalances({ tokenBalances, balances = {}, ignoreBadTokens = true, }) {
  const tokenlist = await getTokenList();
  for (const [token, balance] of Object.entries(tokenBalances)) {
    let coingeckoId = tokenlist.find((t) => t.address === token)?.extensions?.coingeckoId;
    if (!coingeckoId) {
      if (!ignoreBadTokens)
        throw new Error(`Solana token ${token} has no coingecko id`)
      log(`Solana token ${token} has no coingecko id, it is ignored`)
    }
    if (coingeckoId)
      balances[coingeckoId] = (balances[coingeckoId] || 0) + balance;
  }
  return balances
}

module.exports = {
  endpoint,
  TOKEN_LIST_URL,
  getTokenList,
  getTokenMap,
  getTokenSupply,
  getTokenBalance,
  getTokenAccountBalance,
  sumTokens,
  getMultipleAccountsRaw,
  getMultipleAccountBuffers,
  sumOrcaLPs,
  getSolBalance,
  getCoingeckoId,
  sumTokensUnknown,
  exportDexTVL,
  getProvider,
  getConnection,
  getSaberPools,
  getQuarryData,
  sumTokens2,
  getTokenBalances,
  transformBalances,
  getSolBalances,
};
