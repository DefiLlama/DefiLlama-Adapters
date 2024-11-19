const ADDRESSES = require('./coreAssets.json')
const http = require('./http')
const { getEnv } = require('./env')
const { transformBalances: transformBalancesOrig, transformDexBalances, } = require('./portedTokens.js')
const { getUniqueAddresses } = require('./tokenMapping')
const { Connection, PublicKey, Keypair, StakeProgram, } = require("@solana/web3.js")
const { AnchorProvider: Provider, Wallet, } = require("@project-serum/anchor");
const { sleep, sliceIntoChunks, log, } = require('./utils')
const { decodeAccount } = require('./utils/solana/layout')

const sdk = require('@defillama/sdk');

/** Address of the SPL Token program */
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')

/** Address of the SPL Token 2022 program */
const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb')

/** Address of the SPL Associated Token Account program */
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')

const blacklistedTokens_default = [
  'CowKesoLUaHSbAMaUxJUj7eodHHsaLsS65cy8NFyRDGP',
  '674PmuiDtgKx3uKuJ1B16f9m5L84eFvNwj3xDMvHcbo7', // $WOOD
  'SNSNkV9zfG5ZKWQs6x4hxvBRV6s8SqMfSGCtECDvdMd', // SNS
  'A7rqejP8LKN8syXMr4tvcKjs2iJ4WtZjXNs1e6qP3m9g', // ZION
  '2HeykdKjzHKGm2LKHw8pDYwjKPiFEoXAz74dirhUgQvq', // SAO
  'EP2aYBDD4WvdhnwWLUMyqU69g1ePtEjgYK6qyEAFCHTx', //KRILL
  'C5xtJBKm24WTt3JiXrvguv7vHCe7CknDB7PNabp4eYX6', //TINY
  '5fTwKZP2AK39LtFN9Ayppu6hdCVKfMGVm79F2EgHCtsi', //WHEY
]

let connection = {}
let provider = {}

const endpoint = (isClient) => {
  if (isClient) return getEnv('SOLANA_RPC_CLIENT') ?? getEnv('SOLANA_RPC')
  return getEnv('SOLANA_RPC')
}

const renecEndpoint = () => getEnv('RENEC_RPC')
const eclipseEndpoint = () => getEnv('ECLIPSE_RPC')

const endpointMap = {
  solana: endpoint,
  renec: renecEndpoint,
  eclipse: eclipseEndpoint,
}

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

async function getTokenSupplies(tokens, { api } = {}) {
  const sleepTime = tokens.length > 2000 ? 2000 : 200
  const connection = getConnection()
  tokens = tokens.map(i => typeof i === 'string' ? new PublicKey(i) : i)
  const res = await runInChunks(tokens, chunk => connection.getMultipleAccountsInfo(chunk), { sleepTime })
  const response = {}
  res.forEach((data, idx) => {
    if (!data) {
      sdk.log(`Invalid account: ${tokens[idx]}`)
      return;
    }
    try {
      data = decodeAccount('mint', data)
      response[tokens[idx].toString()] = data.supply.toString()
      if (api) api.add(tokens[idx].toString(), data.supply.toString())
    } catch (e) {
      sdk.log(`Error decoding account: ${tokens[idx]}`)
    }
  })
  return response
}

async function getTokenAccountBalances(tokenAccounts, { individual = false, allowError = false, chain = 'solana' } = {}) {
  const sleepTime = tokenAccounts.length > 2000 ? 2000 : 200
  log('total token accounts: ', tokenAccounts.length, 'sleepTime: ', sleepTime)
  tokenAccounts.forEach((val, i) => {
    if (typeof val === 'string') tokenAccounts[i] = new PublicKey(val)
  })
  const connection = getConnection(chain)
  const balancesIndividual = []
  const balances = {}
  const res = await runInChunks(tokenAccounts, chunk => connection.getMultipleAccountsInfo(chunk), { sleepTime })
  res.forEach((data, idx) => {

    if (!data) {
      sdk.log(`Invalid account: ${tokenAccounts[idx]}`)
      if (allowError) return;
      else throw new Error(`Invalid account: ${tokenAccounts[idx]}`)
    }

    try {

      data = decodeAccount('tokenAccount', data)
      const mint = data.mint.toString()
      const amount = data.amount.toString()
      if (individual)
        balancesIndividual.push({ mint, amount })
      else
        sdk.util.sumSingleBalance(balances, mint, amount)

    } catch (e) {
      if (individual)
        balancesIndividual.push({ mint: 'error', amount: 0 })

      sdk.log(`Error decoding account: ${tokenAccounts[idx]}`)
      if (allowError) return;
      else throw new Error(`Error decoding account: ${tokenAccounts[idx]}`)
    }

  })

  return individual ? balancesIndividual : balances
}

async function getMultipleAccounts(accountsArray) {
  const connection = getConnection()
  if (!accountsArray.length) return []
  accountsArray.forEach((val, i) => {
    if (typeof val === 'string') accountsArray[i] = new PublicKey(val)
  })
  return runInChunks(accountsArray, chunk => connection.getMultipleAccountsInfo(chunk))
}

function exportDexTVL(DEX_PROGRAM_ID, getTokenAccounts, chain = 'solana') {
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

    return transformDexBalances({ chain, data, blacklistedTokens: blacklistedTokens_default, })
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

function sumTokensExport({ tokenAccounts, owner, owners, tokens, solOwners, blacklistedTokens, allowError, tokensAndOwners, ...rest }) {
  return (api) => sumTokens2({ api, chain: api.chain, tokenAccounts, owner, owners, tokens, solOwners, blacklistedTokens, allowError, tokensAndOwners, ...rest })
}

function getEndpoint(chain) {
  return endpointMap[chain]()
}

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
  chain = 'solana',
}) {

  if (api) chain = api.chain
  if (!balances) {
    if (api) balances = api.getBalances()
    else balances = {}
  }

  const endpoint = getEndpoint(chain)
  blacklistedTokens.push(...blacklistedTokens_default)
  if (!tokensAndOwners.length) {
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }
  if (!tokensAndOwners.length) {
    const _owners = getUniqueAddresses([...owners, owner].filter(i => i), 'solana')

    if (_owners.length) {
      const data = await getOwnerAllAccounts(_owners)
      const tokenBalances = {}
      for (const item of data) {
        if (blacklistedTokens.includes(item.mint) || +item.amount < 1e6) continue;
        sdk.util.sumSingleBalance(tokenBalances,item.mint, item.amount)
      }
      await transformBalances({ tokenBalances, balances, chain, })
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
      const tokenBalances = await getTokenBalances(chunk, chain)
      transformBalances({ tokenBalances, balances, chain, })
    }, { sleepTime: 400 })
  }

  if (tokenAccounts.length) {
    tokenAccounts = getUniqueAddresses(tokenAccounts, 'solana')

    const tokenBalances = await getTokenAccountBalances(tokenAccounts, { allowError, chain })
    await transformBalances({ tokenBalances, balances, chain, })
  }

  if (solOwners.length) {
    const solBalance = await getSolBalances(solOwners, { chain })
    sdk.util.sumSingleBalance(balances, 'solana:' + ADDRESSES.solana.SOL, solBalance)
  }

  blacklistedTokens.forEach(i => delete balances['solana:' + i])

  return balances

  function getUnique(tokensAndOwners) {
    const set = new Set()
    tokensAndOwners.forEach(i => {
      set.add(i.join('$'))
    })
    return [...set].map(i => i.split('$'))
  }

  async function getOwnerAllAccounts(owners) {
    sdk.log('fetching sol token balances for', owners.length, 'owners', chain,)
    return runInChunks(owners, async (chunk) => {
      const body = chunk.map(i => formOwnerBalanceQuery(i))
      const tokenBalances = await http.post(endpoint, body)
      return tokenBalances.map(i => i.result.value).flat().map(i => ({
        account: i.pubkey,
        mint: i.account.data.parsed.info.mint,
        amount: i.account.data.parsed.info.tokenAmount.amount,
        uiAmount: i.account.data.parsed.info.tokenAmount.uiAmount,
        decimals: i.account.data.parsed.info.tokenAmount.decimals,
      }))

    })
  }

  function formOwnerBalanceQuery(owner, programId = TOKEN_PROGRAM_ID) {
    return {
      jsonrpc: "2.0",
      id: 1,
      method: "getTokenAccountsByOwner",
      params: [
        owner,
        { programId: String(programId) },
        { encoding: "jsonParsed", },
      ],
    }
  }

  async function getSolBalances(accounts, { chain} = {}) {
    const connection = getConnection(chain)

    const balances = await runInChunks(accounts, async (chunk) => {
      chunk = chunk.map(i => typeof i === 'string' ? new PublicKey(i) : i)
      const accountInfos = await connection.getMultipleAccountsInfo(chunk)
      return accountInfos.map(account => account?.lamports ?? 0)
    })
    return balances.reduce((a, b) => a + +b, 0)
  }

  function computeTokenAccounts(tokensAndOwners) {
    tokensAndOwners.forEach(([token, account], i) => {
      if (typeof token === 'string') tokensAndOwners[i][0] = new PublicKey(token)
      if (typeof account === 'string') tokensAndOwners[i][1] = new PublicKey(account)
    })
    const programBuffer = TOKEN_PROGRAM_ID.toBuffer()
    return tokensAndOwners.map(([mint, owner]) => {
      return PublicKey.findProgramAddressSync(
        [owner.toBuffer(), programBuffer, mint.toBuffer(),],
        ASSOCIATED_TOKEN_PROGRAM_ID
      )[0]
    })
  }

  async function getTokenBalances(tokensAndAccounts, chain) {
    const endpoint = getEndpoint(chain)
    const body = tokensAndAccounts.map(([token, account], i) => formTokenBalanceQuery(token, account, i))
    const tokenBalances = await http.post(endpoint, body);
    const balances = {}
    tokenBalances.forEach(({ result: { value } = {} } = {}) => {
      if (!value) return;
      value.forEach(({ account: { data: { parsed: { info: { mint, tokenAmount: { amount } } } } } }) => {
        sdk.util.sumSingleBalance(balances, mint, amount)
      })
    })
    return balances

    function formTokenBalanceQuery(token, account, id = 1) {
      return {
        jsonrpc: "2.0",
        id,
        method: "getTokenAccountsByOwner",
        params: [
          account,
          { mint: token, },
          { encoding: "jsonParsed", },
        ],
      }
    }
  }
}

async function transformBalances({ tokenBalances, balances = {}, chain = 'solana' }) {
  await transformBalancesOrig(chain, tokenBalances)
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

async function getStakedSol(solAddress, api) {
  const stakeAccounts = await getConnection().getProgramAccounts(StakeProgram.programId, {
    filters: [{
      memcmp: { bytes: solAddress, offset: 4 + 8 }
    }],
    dataSlice: { offset: 0, length: 1 } // we dont care about the data, just the lamports
  })
  const totalStakedSol = stakeAccounts.reduce((tvl, { account }) => { return tvl + account.lamports }, 0)
  if (api) {
    api.add(ADDRESSES.solana.SOL, totalStakedSol)
    return api
  }
  return totalStakedSol
}

async function getSolBalanceFromStakePool(address, api) {
  const connection = getConnection()
  if (typeof address === 'string') address = new PublicKey(address)
  const accountInfo = await connection.getAccountInfo(address);
  const deserializedAccountInfo = decodeAccount('stakePool', accountInfo)
  return api.add(ADDRESSES.solana.SOL, +deserializedAccountInfo.totalLamports)
}

async function runInChunks(inputs, fn, { chunkSize = 99, sleepTime } = {}) {
  const chunks = sliceIntoChunks(inputs, chunkSize)
  const results = []
  for (const chunk of chunks) {
    results.push(...(await fn(chunk) ?? []))
    if (sleepTime) await sleep(sleepTime)
  }

  return results.flat()
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
};
