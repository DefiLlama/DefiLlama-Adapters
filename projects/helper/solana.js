const ADDRESSES = require('./coreAssets.json')
const axios = require("axios");
const http = require('./http')
const { getEnv } = require('./env')
const { transformBalances: transformBalancesOrig, transformDexBalances, } = require('./portedTokens.js')
const { getUniqueAddresses } = require('./tokenMapping')
const { Connection, PublicKey, Keypair } = require("@solana/web3.js")
const { AnchorProvider: Provider, Wallet, } = require("@project-serum/anchor");
const { sleep, sliceIntoChunks, log, } = require('./utils')
const { decodeAccount } = require('./utils/solana/layout')

const sdk = require('@defillama/sdk')

const blacklistedTokens_default = [
  'CowKesoLUaHSbAMaUxJUj7eodHHsaLsS65cy8NFyRDGP',
  '674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7', // $WOOD
  'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd', // SNS
  'A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g', // ZION
  '2HeykdKjzHKGm2LKHw8pDYwjKPiFEoXAz74dirhUgQvq', // SAO
]

let connection, provider

const endpoint = () => getEnv('SOLANA_RPC')

function getConnection() {
  if (!connection) connection = new Connection(endpoint())
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
  const tokenBalances = []
  const chunks = sliceIntoChunks(accounts, 99)
  for (let chunk of chunks) {
    const bal = await axios.post(endpoint(), chunk.map(formBody))
    tokenBalances.push(...bal.data)
  }
  return tokenBalances.reduce((a, i) => a + i.result.value, 0)
}

async function getSolBalance(account) {
  return getSolBalances([account])
}

const TOKEN_LIST_URL = "https://cdn.jsdelivr.net/gh/solana-labs/token-list@main/src/tokens/solana.tokenlist.json"

async function getTokenSupply(token) {
  const tokenSupply = await axios.post(endpoint(), {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenSupply",
    params: [token],
  });
  return tokenSupply.data.result.value.uiAmount;
}

async function getGeckoSolTokens() {
  const tokens = await getTokenList()
  const tokenSet = new Set()
  tokens.filter(i => i.extensions?.coingeckoId && i.chainId === 101).forEach(i => tokenSet.add(i.address))
  return tokenSet
}


async function getValidGeckoSolTokens() {
  const tokens = await getTokenList()
  const tokenSet = new Set()
  tokens.filter(i => i.extensions?.coingeckoId && i.chainId === 101 && !i.name.includes('(Wormhole v1)')).forEach(i => tokenSet.add(i.address))
  return tokenSet
}

async function getTokenDecimals(tokens) {
  const calls = tokens => tokens.map((t, i) => ({ jsonrpc: '2.0', id: t, method: 'getTokenSupply', params: [t] }))
  const res = {}
  const chunks = sliceIntoChunks(tokens, 99)
  for (const chunk of chunks) {
    const tokenSupply = await axios.post(endpoint(), calls(chunk))
    tokenSupply.data.forEach(({ id, result }) => res[id] = result.value.decimals)
  }
  return res
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
  const tokenBalance = await axios.post(endpoint(), formTokenBalanceQuery(token, account));
  return tokenBalance.data.result.value.reduce(
    (total, account) =>
      total + account.account.data.parsed.info.tokenAmount.uiAmount,
    0
  );
}

async function getTokenBalances(tokensAndAccounts) {
  const body = tokensAndAccounts.map(([token, account]) => formTokenBalanceQuery(token, account))
  const tokenBalances = await axios.post(endpoint(), body);
  const balances = {}
  tokenBalances.data.forEach((v, i )=> {
    if (!v.result) console.log(v, tokensAndAccounts[i])
  } )
  tokenBalances.data.forEach(({ result: { value } }) => {
    value.forEach(({ account: { data: { parsed: { info: { mint, tokenAmount: { amount } } } } } }) => {
      sdk.util.sumSingleBalance(balances, mint, amount)
    })
  })
  return balances
}

async function getTokenAccountBalances(tokenAccounts, { individual = false, chunkSize = 99, allowError = false, } = {}) {
  log('total token accounts: ', tokenAccounts.length)
  const formBody = account => ({ method: "getAccountInfo", jsonrpc: "2.0", params: [account, { encoding: "jsonParsed", commitment: "confirmed" }], id: account })
  const balancesIndividual = []
  const balances = {}
  const chunks = sliceIntoChunks(tokenAccounts, chunkSize)
  for (const chunk of chunks) {
    const body = chunk.map(formBody)
    const data = await axios.post(endpoint(), body);
    data.data.forEach(({ result: { value } }, i) => {
      if (!value || !value.data.parsed) {
        if (tokenAccounts[i].toString() === '11111111111111111111111111111111') {
          log('Null account: skipping it')
          return;
        }
        console.log(data.data.map(i => i.result.value)[i], tokenAccounts[i].toString())
        if (allowError) return;
      }
      const { data: { parsed: { info: { mint, tokenAmount: { amount } } } } } = value
      sdk.util.sumSingleBalance(balances, mint, amount)
      balancesIndividual.push({ mint, amount })
    })
    if (chunks.length > 4) {
      log('waiting before more calls')
      await sleep(300)
    }
  }
  if (individual) return balancesIndividual
  return balances
}


async function getTokenAccountBalance(account) {
  const tokenBalance = await axios.post(
    endpoint(),
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

// Example: [[token1, account1], [token2, account2], ...]
async function sumTokens(tokensAndOwners, balances = {}) {
  return sumTokens2({ balances, tokensAndOwners, })
}

// Example: [[token1, account1], [token2, account2], ...]
async function sumTokensUnknown(tokensAndOwners) {
  return sumTokens2({ tokensAndOwners, })
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
  const res = []
  const chunks = sliceIntoChunks(accountsArray, 99)
  for (const chunk of chunks) {
    const accountsInfo = await axios.post(endpoint(), {
      jsonrpc: "2.0",
      id: 1,
      method: "getMultipleAccounts",
      params: [chunk],
    })
    res.push(...accountsInfo.data.result.value)
  }

  return res;
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

function exportDexTVL(DEX_PROGRAM_ID, getTokenAccounts) {
  return async () => {
    if (!getTokenAccounts) getTokenAccounts = _getTokenAccounts

    const tokenAccounts = await getTokenAccounts()

    const chunks = sliceIntoChunks(tokenAccounts, 99)
    const results = []
    for (const chunk of chunks)
      results.push(...await getTokenAccountBalances(chunk, { individual: true }))

    const data = []
    for (let i = 0; i < results.length; i = i + 2) {
      const tokenA = results[i]
      const tokenB = results[i + 1]
      data.push({ token0: tokenA.mint, token0Bal: tokenA.amount, token1: tokenB.mint, token1Bal: tokenB.amount, })
    }

    const coreTokens = await getGeckoSolTokens()
    return transformDexBalances({ chain: 'solana', data, blacklistedTokens: blacklistedTokens_default, coreTokens, })
  }

  async function _getTokenAccounts() {
    const connection = getConnection()


    const programPublicKey = new PublicKey(DEX_PROGRAM_ID)
    const programAccounts = await connection.getParsedProgramAccounts(programPublicKey);
    const tokenAccounts = []

    programAccounts.forEach((account) => {
      const tokenSwap = decodeAccount('tokenSwap', account.account);
      tokenAccounts.push(tokenSwap.tokenAccountA.toString())
      tokenAccounts.push(tokenSwap.tokenAccountB.toString())
    });

    return tokenAccounts
  }
}

async function sumTokens2({
  balances = {},
  tokensAndOwners = [],
  tokens = [],
  owners = [],
  owner,
  tokenAccounts = [],
  solOwners = [],
  blacklistedTokens = [],
  allowError = false,
}) {
  if (!tokensAndOwners.length) {
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }
  blacklistedTokens.push(...blacklistedTokens_default)

  tokensAndOwners = tokensAndOwners.filter(([token]) => !blacklistedTokens.includes(token))

  if (tokensAndOwners.length) {
    tokensAndOwners = getUnique(tokensAndOwners)
    log('total balance queries: ', tokensAndOwners.length)
    const chunks = sliceIntoChunks(tokensAndOwners, 99)
    for (const chunk of chunks) {
      await _sumTokens(chunk)
      if (chunks.length > 2) {
        log('waiting before more calls')
        await sleep(300)
      }
    }
  }

  if (tokenAccounts.length) {
    tokenAccounts = getUniqueAddresses(tokenAccounts, 'solana')
    const tokenBalances = await getTokenAccountBalances(tokenAccounts, { allowError })
    await transformBalances({ tokenBalances, balances, })
  }

  if (solOwners.length) {
    const solBalance = await getSolBalances(solOwners)
    sdk.util.sumSingleBalance(balances, 'solana:' + ADDRESSES.solana.SOL, solBalance)
  }

  blacklistedTokens.forEach(i => delete balances['solana:'+i])

  return balances

  async function _sumTokens(tokensAndAccounts) {
    const tokenBalances = await getTokenBalances(tokensAndAccounts)
    return transformBalances({ tokenBalances, balances, })
  }

  function getUnique(tokensAndOwners) {
    const set = new Set()
    tokensAndOwners.forEach(i => {
      set.add(i.join('$'))
    })
    return [...set].map(i => i.split('$'))
  }
}

async function transformBalances({ tokenBalances, balances = {}, }) {
  await transformBalancesOrig('solana', tokenBalances)
  for (const [token, balance] of Object.entries(tokenBalances))
    sdk.util.sumSingleBalance(balances, token, balance)
  return balances
}

function readBigUInt64LE(buffer, offset) {
  const first = buffer[offset];
  const last = buffer[offset + 7];
  if (first === undefined || last === undefined) {
    throw new Error();
  }
  const lo = first + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + buffer[++offset] * 2 ** 24;
  const hi = buffer[++offset] + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + last * 2 ** 24;
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
}

module.exports = {
  endpoint: endpoint(),
  getTokenSupply,
  getTokenBalance,
  getTokenAccountBalance,
  sumTokens,
  getMultipleAccountsRaw,
  getMultipleAccountBuffers,
  sumOrcaLPs,
  getSolBalance,
  sumTokensUnknown,
  exportDexTVL,
  getProvider,
  getConnection,
  sumTokens2,
  getTokenBalances,
  transformBalances,
  getSolBalances,
  getTokenDecimals,
  getGeckoSolTokens,
  getTokenAccountBalances,
  getTokenList,
  readBigUInt64LE,
  decodeAccount,
  getValidGeckoSolTokens,
};
