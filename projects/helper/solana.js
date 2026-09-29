const ADDRESSES = require('./coreAssets.json')
const http = require('./http')
const { transformBalances: transformBalancesOrig, transformDexBalances, } = require('./portedTokens.js')
const { getUniqueAddresses } = require('./tokenMapping')
const { Connection, PublicKey, Keypair, } = require("@solana/web3.js")
const { AnchorProvider: Provider, Wallet, } = require("@project-serum/anchor");
const { sleep, sliceIntoChunks, log, } = require('./utils')
const { decodeAccount } = require('./utils/solana/layout')
const { queryAllium } = require('./allium');

const sdk = require('@defillama/sdk');
const { svm, rpc: sdkRpc } = sdk.chains
const { endpointMap, endpoint } = require('./svmChainConfig.js')
// const { addRaydiumPositions } = require('../krystal/solana.js')

/** Address of the SPL Token program */
const TOKEN_PROGRAM_ID = new PublicKey(svm.TOKEN_PROGRAM_ID)

/** Address of the SPL Token 2022 program */
const TOKEN_2022_PROGRAM_ID = new PublicKey(svm.TOKEN_2022_PROGRAM_ID)

/** Address of the SPL Associated Token Account program */
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(svm.ASSOCIATED_TOKEN_PROGRAM_ID)

const blacklistedTokens_default = [
  'CowKesoLUaHSbAMaUxJUj7eodHHsaLsS65cy8NFyRDGP',
  '674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7', // $WOOD
  'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd', // SNS
  'A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g', // ZION
  '2HeykdKjzHKGm2LKHw8pDYwjKPiFEoXAz74dirhUgQvq', // SAO
  'EP2aYBDD4WvdhnwWLUMyqU69g1ePtEjgYK6qyEAFCHTx', //KRILL
  'C5xtJBKm24WTt3JiXrvguv7vHCe7CknDB7PNabp4eYX6', //TINY
  '5fTwKZP2AK39LtFN9Ayppu6hdCVKfMGVm79F2EgHCtsi', //WHEY
  'EtQE3GREPyFBCU3yUXc5nWs3wRtLYuMmtKAFAvXD1yuR', // BITCOIN CAT
  '7SaitRVfcP3b3KVSGHfamhznJornMXAefXByXstYhTys', // SASHA CAT
]

const whitelistedTokens = {
  solana: [
    ...(Object.values(ADDRESSES.solana)),
    '72puLt71H93Z9CzHuBRTwFpL4TG3WZUhnoCC7p8gxigu', // USDGO
  ]
}

const trustedTokensCache = {}

async function getTrustedTokenSet(chain) {
  if (!trustedTokensCache[chain]) {
    trustedTokensCache[chain] = _getTrustedTokenSet(chain).catch(e => {
      delete trustedTokensCache[chain]
      throw e
    })
  }
  return trustedTokensCache[chain]

  async function _getTrustedTokenSet(chain) {
    const data = await sdk.cache.readExpiringJsonCache(`trustedTokens-${chain}`)
    if (data) return new Set((data || []).concat(whitelistedTokens[chain] || []))
    const urls = {
      solana: 'https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json',
    }
    if (!urls[chain]) {
      return new Set(whitelistedTokens[chain] || [])
    }
    const trustedTokens = await http.get(urls[chain]).then(async res => {
      const cgTokens = await http.get('https://api.coingecko.com/api/v3/coins/list?include_platform=true')
      const cgChainTokens = cgTokens.filter(i => i.platforms?.[chain]).map(i => i.platforms[chain]).filter(i => i)
      await sdk.cache.writeCache(`trustedTokens/res-${chain}`, { tokenList: res.tokens, cgChainTokens }, { skipCompression: true, })

      const tokens = res.tokens.map(i => i.address).concat(cgChainTokens).concat(whitelistedTokens[chain] || [])
      await sdk.cache.writeExpiringJsonCache(`trustedTokens-${chain}`, tokens, {}) // 1 day by default
      return tokens
    })
    return new Set(trustedTokens)
  }
}

let connection = {}
let provider = {}


function getConnection(chain = 'solana') {
  if (!connection[chain]) connection[chain] = new Connection(endpointMap[chain](true))
  return connection[chain]
}

function getProvider(chain = 'solana') {
  if (!provider[chain]) {
    const dummy_keypair = Keypair.generate();
    const wallet = new Wallet(dummy_keypair);

    provider[chain] = new Provider(getConnection(chain), wallet)
  }
  return provider[chain]
}

// PublicKey | string -> base58 string
const toAddress = (i) => typeof i === 'string' ? i : i.toString()

// sdk `getAccounts` (base64 payload) -> web3.js AccountInfo shape so `decodeAccount(layout, info)` and
// `info.data.readBigUInt64LE(...)` callers keep working
function toWeb3AccountInfo(info) {
  if (!info) return null
  let data = info.data
  if (Array.isArray(data)) data = data[1] === 'base58' ? Buffer.from(svm.base58Decode(data[0])) : Buffer.from(data[0], 'base64')
  else if (typeof data === 'string') data = Buffer.from(data, 'base64')
  return {
    data,
    owner: new PublicKey(info.owner),
    lamports: info.lamports,
    executable: info.executable,
    rentEpoch: info.rentEpoch,
    space: info.space ?? data?.length,
  }
}

function getAssociatedTokenAddress(mint, owner, programId = TOKEN_PROGRAM_ID, associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID) {
  return svm.getAssociatedTokenAddress({
    mint: toAddress(mint),
    owner: toAddress(owner),
    programId: toAddress(programId),
    associatedTokenProgramId: toAddress(associatedTokenProgramId),
  })
}


async function getTokenSupplies(tokens, { api } = {}) {
  const sleepTime = 200
  tokens = tokens.map(toAddress)
  const supplies = await svm.getTokenSupplies({ chain: 'solana', tokens, chunkSize: 99, concurrency: 1, sleepTime, allowError: true })
  const response = {}
  supplies.forEach((data, idx) => {
    if (!data) {
      sdk.log(`Invalid account: ${tokens[idx]}`)
      return;
    }
    response[tokens[idx]] = data.amount
    if (api) api.add(tokens[idx], data.amount)
  })
  return response
}

async function getTokenAccountBalances(tokenAccounts, { individual = false, allowError = false, chain = 'solana' } = {}) {
  const sleepTime = 200
  log('total token accounts: ', tokenAccounts.length, 'sleepTime: ', sleepTime)
  tokenAccounts = tokenAccounts.map(toAddress)
  const res = await svm.getTokenAccountBalances({ chain, tokenAccounts, individual, allowError, chunkSize: 99, concurrency: 1, sleepTime })
  if (individual) return res.map(({ mint, amount }) => ({ mint, amount }))
  const balances = {}
  Object.entries(res).forEach(([mint, amount]) => sdk.util.sumSingleBalance(balances, mint, amount))
  return balances
}

async function getMultipleAccounts(accountsArray, { api } = {}) {
  const chain = api?.chain ?? 'solana'
  if (!accountsArray.length) return []
  const accounts = accountsArray.map(toAddress)
  const infos = await svm.getAccounts({ chain, accounts, chunkSize: 99, concurrency: 1 })
  return infos.map(toWeb3AccountInfo)
}

function exportDexTVL(DEX_PROGRAM_ID, getTokenAccounts, chain = 'solana', { coreTokens } = {}) {
  return async () => {
    if (!getTokenAccounts) getTokenAccounts = _getTokenAccounts

    const tokenAccounts = await getTokenAccounts(chain)

    const chunks = sliceIntoChunks(tokenAccounts, 99)
    const results = []
    for (const chunk of chunks)
      results.push(...await getTokenAccountBalances(chunk, { individual: true, chain, allowError: true, }))

    const data = []
    for (let i = 0; i < results.length; i = i + 2) {
      const tokenA = results[i]
      const tokenB = results[i + 1]
      data.push({ token0: tokenA.mint, token0Bal: tokenA.amount, token1: tokenB.mint, token1Bal: tokenB.amount, })
    }

    return transformDexBalances({ chain, data, blacklistedTokens: blacklistedTokens_default, coreTokens })
  }

  async function _getTokenAccounts() {
    const connection = getConnection()

    const programPublicKey = new PublicKey(DEX_PROGRAM_ID)
    const programAccounts = await connection.getParsedProgramAccounts(programPublicKey);
    const tokenAccounts = []

    programAccounts.forEach((account) => {
      if (DEX_PROGRAM_ID === '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP' && account.account.space < 324) {
        return;
      }
      const tokenSwap = decodeAccount('tokenSwap', account.account);
      tokenAccounts.push(tokenSwap.tokenAccountA.toString())
      tokenAccounts.push(tokenSwap.tokenAccountB.toString())
    });

    return tokenAccounts
  }
}

function sumTokensExport({ tokenAccounts, owner, owners, tokens, solOwners, blacklistedTokens, allowError, tokensAndOwners, onlyTrustedTokens, ...rest }) {
  return (api) => sumTokens2({ api, chain: api.chain, tokenAccounts, owner, owners, tokens, solOwners, blacklistedTokens, allowError, tokensAndOwners, onlyTrustedTokens, ...rest })
}

function getEndpoint(chain) {
  return endpointMap[chain]()
}

const getUniqStartOfTodayTimestamp = (date = new Date()) => {
  var date_utc = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
  var startOfDay = new Date(date_utc);
  var timestamp = startOfDay.getTime() / 1000;
  return Math.floor(timestamp / 86400) * 86400;
};

async function sumTokens2({
  api,
  balances,
  tokensAndOwners = [],
  tokens = [],
  owners = [],
  owner,
  tokenAccounts = [],
  solOwners = [],
  blacklistedTokens = [],
  allowError = false,
  computeTokenAccount = false,
  includeStakedSol = false,
  chain = 'solana',
  onlyTrustedTokens = false,
}) {

  if (api) chain = api.chain

  // Route to Allium-based historical path when api.timestamp is before today (UTC)
  if (api && api.timestamp && (chain === 'solana' || !chain) && api.timestamp < getUniqStartOfTodayTimestamp()) {
    return sumTokens2_historical({
      api, balances, tokensAndOwners, tokens, owners, owner,
      tokenAccounts, solOwners, blacklistedTokens, allowError,
      computeTokenAccount, includeStakedSol, chain, onlyTrustedTokens,
    });
  }

  if (!balances) {
    if (api) balances = api.getBalances()
    else balances = {}
  }

  if (includeStakedSol) {
    let stakeOwners = solOwners.length ? solOwners : owners.length ? owners : owner ? [owner] : []
    stakeOwners = getUniqueAddresses(stakeOwners, chain)
    for (const so of stakeOwners) {
      const staked = await getStakedSol(so)
      await sleep(2000)
      sdk.util.sumSingleBalance(balances, `solana:${ADDRESSES.solana.SOL}`, staked)
    }
  }

  const endpoints = svm.getEndpoints({ chain })
  blacklistedTokens.push(...blacklistedTokens_default)
  if (!tokensAndOwners.length) {
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }
  if (!tokensAndOwners.length) {
    const _owners = getUniqueAddresses([...owners, owner].filter(i => i), chain)

    if (_owners.length) {

      let filter = () => true
      if (onlyTrustedTokens) {
        const trustedTokenSet = await getTrustedTokenSet(chain)
        filter = ({ mint }) => trustedTokenSet.has(mint)
      }

      const data = await getOwnerAllAccounts(_owners)
      const tokenBalances = {}
      for (const item of data) {
        if (blacklistedTokens.includes(item.mint) || +item.amount < 1e6 || !filter(item)) continue;
        sdk.util.sumSingleBalance(tokenBalances, item.mint, item.amount)
      }
      transformBalances({ tokenBalances, balances, chain, })
    }
  }

  tokensAndOwners = tokensAndOwners.filter(([token]) => !blacklistedTokens.includes(token))
  //

  if (computeTokenAccount) {
    const computedTokenAccounts = computeTokenAccounts(tokensAndOwners)
    tokenAccounts.push(...computedTokenAccounts)
  } else if (tokensAndOwners.length) {
    tokensAndOwners = getUnique(tokensAndOwners)
    log('total balance queries: ', tokensAndOwners.length)
    await runInChunks(tokensAndOwners, async (chunk) => {
      const tokenBalances = await getTokenBalances(chunk)
      transformBalances({ tokenBalances, balances, chain, })
    }, { sleepTime: 400 })
  }

  if (tokenAccounts.length) {
    tokenAccounts = getUniqueAddresses(tokenAccounts, chain)

    const tokenBalances = await getTokenAccountBalances(tokenAccounts, { allowError, chain })
    transformBalances({ tokenBalances, balances, chain, })
  }

  if (solOwners.length) {
    const solBalance = await getSolBalances(solOwners)
    sdk.util.sumSingleBalance(balances, `${chain}:` + ADDRESSES.solana.SOL, solBalance)
  }

  blacklistedTokens.forEach(i => delete balances[`${chain}:` + i])

  return balances

  function getUnique(tokensAndOwners) {
    const set = new Set()
    tokensAndOwners.forEach(i => {
      set.add(i.join('$'))
    })
    return [...set].map(i => i.split('$'))
  }

  // one JSON-RPC batch per chunk of owners, both the Token and Token-2022 programs are queried
  // (USDTb and other newer tokens use Token-2022)
  async function getOwnerAllAccounts(owners) {
    sdk.log('fetching sol token balances for', owners.length, 'owners', chain,)
    return runInChunks(owners, async (chunk) => {
      const calls = chunk.flatMap(owner => [
        formOwnerBalanceQuery(owner, svm.TOKEN_PROGRAM_ID),
        formOwnerBalanceQuery(owner, svm.TOKEN_2022_PROGRAM_ID),
      ])
      const results = await sdkRpc.jsonRpcBatch(calls, { chain, endpoints, permitFailure: true })
      return results.map(i => i?.value ?? []).flat().map(i => ({
        account: i.pubkey,
        mint: i.account.data.parsed.info.mint,
        amount: i.account.data.parsed.info.tokenAmount.amount,
        uiAmount: i.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: i.account.data.parsed.info.tokenAmount.decimals,
      }))
    })
  }

  function formOwnerBalanceQuery(owner, programId) {
    return {
      method: "getTokenAccountsByOwner",
      params: [
        toAddress(owner),
        { programId: String(programId) },
        { encoding: "jsonParsed", },
      ],
    }
  }

  async function getSolBalances(accounts) {
    const lamports = await svm.getBalances({ chain, accounts: accounts.map(toAddress) })
    return lamports.reduce((a, b) => a + +b, 0)
  }

  function computeTokenAccounts(tokensAndOwners) {
    return tokensAndOwners.map(([mint, owner]) => getAssociatedTokenAddress(mint, owner))
  }

  async function getTokenBalances(tokensAndAccounts) {
    const calls = tokensAndAccounts.map(([token, account]) => formTokenBalanceQuery(token, account))
    const results = await sdkRpc.jsonRpcBatch(calls, { chain, endpoints, permitFailure: true })
    const balances = {}
    results.forEach((res) => {
      const value = res?.value
      if (!value) return;
      value.forEach(({ account: { data: { parsed: { info: { mint, tokenAmount: { amount } } } } } }) => {
        sdk.util.sumSingleBalance(balances, mint, amount)
      })
    })
    return balances

    function formTokenBalanceQuery(token, account) {
      return {
        method: "getTokenAccountsByOwner",
        params: [
          toAddress(account),
          { mint: toAddress(token), },
          { encoding: "jsonParsed", },
        ],
      }
    }
  }
}

function escapeSqlString(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/'/g, "''");
}

function sqlInList(arr) {
  return arr.map(a => `'${escapeSqlString(a)}'`).join(', ');
}

/**
 * Historical version of sumTokens2 using Allium solana.assets.balances_daily.
 * Same params as sumTokens2 plus a required `date` (YYYY-MM-DD).
 * Uses Allium for balance lookups; RPC only for includeStakedSol.
 */
async function sumTokens2_historical({
  api,
  balances,
  tokensAndOwners = [],
  tokens = [],
  owners = [],
  owner,
  tokenAccounts = [],
  solOwners = [],
  blacklistedTokens = [],
  allowError = false,
  computeTokenAccount = false,
  includeStakedSol = false,
  chain = 'solana',
  onlyTrustedTokens = false,
}) {
  const date = new Date(api.timestamp * 1000).toISOString().slice(0, 10);
  if (!date) throw new Error('sumTokens2_historical requires a date (YYYY-MM-DD)');
  sdk.log('sumTokens2: using historical Allium path for date', date);
  if (includeStakedSol) throw new Error('includeStakedSol is not supported for historical backfilling (RPC-only)');

  if (api) chain = api.chain;
  if (!balances) {
    if (api) balances = api.getBalances();
    else balances = {};
  }

  blacklistedTokens = [...blacklistedTokens, ...blacklistedTokens_default];
  const blacklistSet = new Set(blacklistedTokens);

  // Build tokensAndOwners from tokens × owner(s) if not provided
  if (!tokensAndOwners.length) {
    if (owner) tokensAndOwners = tokens.map(t => [t, owner]);
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat();
  }

  // Resolve computeTokenAccount → derive token accounts
  if (computeTokenAccount && tokensAndOwners.length) {
    const computedAccounts = tokensAndOwners.map(([mint, ownerKey]) => getAssociatedTokenAddress(mint, ownerKey));
    tokenAccounts.push(...computedAccounts);
    tokensAndOwners = [];
  }

  tokensAndOwners = tokensAndOwners.filter(([token]) => !blacklistSet.has(token));

  // Collect all addresses/token_accounts to query, then filter locally
  const allAddresses = new Set();
  const allTokenAccounts = new Set();

  // Gather addresses from owners, tokensAndOwners, solOwners
  const _owners = getUniqueAddresses([...owners, owner].filter(i => i), chain);
  _owners.forEach(a => allAddresses.add(a));

  if (tokensAndOwners.length) {
    tokensAndOwners.forEach(([, ownerAddr]) => allAddresses.add(ownerAddr));
  }

  if (solOwners.length) {
    getUniqueAddresses(solOwners, chain).forEach(a => allAddresses.add(a));
  }

  // Gather token_accounts
  if (tokenAccounts.length) {
    getUniqueAddresses(tokenAccounts, chain).forEach(a => allTokenAccounts.add(a));
  }

  const addressList = [...allAddresses];
  const tokenAccountList = [...allTokenAccounts];

  // Build a simple Allium query: fetch all rows for date + addresses/token_accounts
  // Note: Native SOL has token_account = NULL, so we filter by address for SOL
  let sql = '';
  if (addressList.length || tokenAccountList.length) {
    const dateCondition = `date = '${escapeSqlString(date)}'`;

    if (addressList.length && tokenAccountList.length) {
      // Both address (for SOL + SPL) and token_account (for SPL only)
      sql = `
        SELECT address, token_account, mint, raw_amount
        FROM solana.assets.balances_daily
        WHERE ${dateCondition}
          AND (address IN (${sqlInList(addressList)}) OR token_account IN (${sqlInList(tokenAccountList)}))
          AND raw_amount > 0`.trim();
    } else if (addressList.length) {
      // address only (covers both SOL and SPL)
      sql = `
        SELECT address, token_account, mint, raw_amount
        FROM solana.assets.balances_daily
        WHERE ${dateCondition}
          AND address IN (${sqlInList(addressList)})
          AND raw_amount > 0`.trim();
    } else if (tokenAccountList.length) {
      // token_account only (SPL tokens only; won't include SOL since SOL has NULL token_account)
      sql = `
        SELECT address, token_account, mint, raw_amount
        FROM solana.assets.balances_daily
        WHERE ${dateCondition}
          AND token_account IN (${sqlInList(tokenAccountList)})
          AND raw_amount > 0`.trim();
    }
  }

  if (sql) {
    sdk.log('sumTokens2_historical: running Allium query for date', date);
    const rows = await queryAllium(sql);

    if (!Array.isArray(rows)) {
      sdk.log('sumTokens2_historical: Allium query returned non-array result', { date, rowsType: typeof rows, rows });
    } else {
      // Prepare filters
      let trustedTokenSet = null;
      if (onlyTrustedTokens) {
        trustedTokenSet = await getTrustedTokenSet(chain);
      }

      const tokensAndOwnersMap = new Map();
      if (tokensAndOwners.length) {
        tokensAndOwners.forEach(([token, ownerAddr]) => {
          const key = `${token}|${ownerAddr}`;
          tokensAndOwnersMap.set(key, true);
        });
      }

      const ownersSet = new Set(_owners);
      const tokenAccountsSet = new Set(tokenAccountList);
      const solOwnersSet = new Set(getUniqueAddresses(solOwners, chain));

      // Helper to check if mint is native SOL (canonical: So11111..., Allium variant: Sol11111...)
      const isNativeSOL = (mint) => {
        return mint === ADDRESSES.solana.SOL || mint === ADDRESSES.solana.SOL;
      };

      const tokenBalances = {};

      for (const row of rows) {
        const mint = row.mint;
        const address = row.address;
        const tokenAccount = row.token_account;
        const amount = row.raw_amount;

        const isSol = isNativeSOL(mint);

        // Blacklist
        if (blacklistSet.has(mint)) continue;

        // onlyTrustedTokens (SOL is always trusted)
        if (trustedTokenSet && !isSol && !trustedTokenSet.has(mint)) continue;

        // Determine if this row matches our criteria
        let matched = false;

        // Path 1: owners without tokensAndOwners (all tokens for those owners)
        if (!tokensAndOwners.length && _owners.length && ownersSet.has(address)) {
          matched = true;
        }

        // Path 2: tokensAndOwners (specific mint + owner pairs)
        if (tokensAndOwners.length) {
          const key = `${mint}|${address}`;
          if (tokensAndOwnersMap.has(key)) {
            matched = true;
          }
        }

        // Path 3: tokenAccounts (SPL only; native SOL has token_account = null)
        if (tokenAccount && tokenAccountsSet.has(tokenAccount)) {
          matched = true;
        }

        // Path 4: solOwners (native SOL only)
        if (solOwnersSet.has(address) && isSol) {
          matched = true;
        }

        if (matched) {
          // Normalize SOL mint to the canonical address
          const normalizedMint = isSol ? ADDRESSES.solana.SOL : mint;
          sdk.util.sumSingleBalance(tokenBalances, normalizedMint, String(amount));
        }
      }

      transformBalances({ tokenBalances, balances, chain });
    }
  }

  blacklistedTokens.forEach(i => delete balances[`${chain}:` + i]);

  return balances;
}

function transformBalances({ tokenBalances, balances = {}, chain = 'solana' }) {
  transformBalancesOrig(chain, tokenBalances)
  for (const [token, balance] of Object.entries(tokenBalances))
    sdk.util.sumSingleBalance(balances, token, balance)
  return balances
}

function readBigUInt64LE(buffer, offset) {
  return svm.readBigUInt64LE(buffer, offset)
}

async function getStakedSol(solAddress, api) {
  const totalStakedSol = await svm.getStakedSol({ chain: 'solana', address: toAddress(solAddress) })
  if (api) {
    api.add(ADDRESSES.solana.SOL, totalStakedSol)
    return api
  }
  return totalStakedSol
}

async function getSolBalanceFromStakePool(address, api) {
  const totalLamports = await svm.getSolBalanceFromStakePool({ chain: 'solana', address: toAddress(address) })
  return api.add(ADDRESSES.solana.SOL, +totalLamports)
}

// sequential chunked runner; results of every chunk are concatenated and flattened one level
async function runInChunks(inputs, fn, { chunkSize = 99, sleepTime } = {}) {
  const results = await sdkRpc.runInChunks(inputs, async (chunk) => (await fn(chunk)) ?? [], { chunkSize, concurrency: 1, sleepTime })
  return results.flat()
}

function i80f48ToNumber(i80f48) {
  return svm.i80f48ToNumber(i80f48)
}

module.exports = {
  endpoint: endpoint(),
  getMultipleAccounts,
  exportDexTVL,
  getProvider,
  getConnection,
  sumTokens2,
  sumTokensExport,
  transformBalances,
  readBigUInt64LE,
  decodeAccount,
  blacklistedTokens_default,
  getStakedSol,
  getSolBalanceFromStakePool,
  getTokenSupplies,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAssociatedTokenAddress,
  i80f48ToNumber,
  runInChunks,
  getTokenAccountBalances,
  // addRaydiumPositions,
};
