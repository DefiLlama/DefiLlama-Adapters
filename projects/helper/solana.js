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
const { TOKEN_PROGRAM_ID } = require('@project-serum/anchor/dist/cjs/utils/token');

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

let connection, provider

const endpoint = (isClient) => {
  if (isClient) return getEnv('SOLANA_RPC_CLIENT') ?? getEnv('SOLANA_RPC')
  return getEnv('SOLANA_RPC')
}

const renecEndpoint = () => getEnv('RENEC_RPC')
const endpointMap = {
  solana: endpoint,
  renec: renecEndpoint,
}

function getConnection(chain = 'solana') {
  if (!connection) connection = new Connection(endpointMap[chain](true))
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



async function getTokenSupply(token) {
  const tokenSupply = await http.post(endpoint(), {
    jsonrpc: "2.0",
    id: 1,
    method: "getTokenSupply",
    params: [token],
  });
  return tokenSupply.result.value.uiAmount;
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
async function getTokenBalance(token, account) {
  const tokenBalance = await http.post(endpoint(), formTokenBalanceQuery(token, account));
  return tokenBalance.result.value.reduce(
    (total, account) =>
      total + account.account.data.parsed?.info.tokenAmount.uiAmount ?? 0,
    0
  );
}

async function getTokenBalances(tokensAndAccounts) {
  const body = tokensAndAccounts.map(([token, account], i) => formTokenBalanceQuery(token, account, i))
  const tokenBalances = await http.post(endpoint(), body);
  const balances = {}
  // if (!tokenBalances) {
  //   sdk.log('missing response', tokenBalances, tokensAndAccounts)
  //   return balances
  // }
  // tokenBalances.forEach((v, i )=> {
  //   if (!v.result) sdk.log('missing response', v, tokensAndAccounts[i])
  // } )
  tokenBalances.forEach(({ result: { value } = {} } = {}) => {
    if (!value) return;
    value.forEach(({ account: { data: { parsed: { info: { mint, tokenAmount: { amount } } } } } }) => {
      sdk.util.sumSingleBalance(balances, mint, amount)
    })
  })
  return balances
}

async function getTokenAccountBalances(tokenAccounts, { individual = false, chunkSize = 99, allowError = false, chain = 'solana' } = {}) {
  log('total token accounts: ', tokenAccounts.length)
  const formBody = account => ({ method: "getAccountInfo", jsonrpc: "2.0", params: [account, { encoding: "jsonParsed", commitment: "confirmed" }], id: account })
  const balancesIndividual = []
  const balances = {}
  const chunks = sliceIntoChunks(tokenAccounts, chunkSize)
  for (const chunk of chunks) {
    const body = chunk.map(formBody)
    const data = await http.post(endpointMap[chain](), body);
    if (data.length !== chunk.length) {
      throw new Error(`Mismatched returned for getTokenAccountBalances()`)
    }
    data.forEach(({ result: { value } }, i) => {
      if (!value || !value.data?.parsed) {
        if (tokenAccounts[i].toString() === '11111111111111111111111111111111') {
          log('Null account: skipping it')
          return;
        }
        if (allowError) return;
        else throw new Error(`Invalid account: ${tokenAccounts[i]}`)
      }
      const { data: { parsed: { info: { mint, tokenAmount: { amount } } } } } = value
      sdk.util.sumSingleBalance(balances, mint, amount)
      balancesIndividual.push({ mint, amount })
    })
    if (chunks.length > 4) {
      // log('waiting before more calls')
      await sleep(400)
    }
  }
  if (individual) return balancesIndividual
  return balances
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
    const accountsInfo = await http.post(endpoint(), {
      jsonrpc: "2.0",
      id: 1,
      method: "getMultipleAccounts",
      params: [chunk],
    })
    res.push(...accountsInfo.result.value)
  }

  return res;
}

function exportDexTVL(DEX_PROGRAM_ID, getTokenAccounts, chain = 'solana') {
  return async () => {
    if (!getTokenAccounts) getTokenAccounts = _getTokenAccounts

    const tokenAccounts = await getTokenAccounts(chain)

    const chunks = sliceIntoChunks(tokenAccounts, 99)
    const results = []
    for (const chunk of chunks)
      results.push(...await getTokenAccountBalances(chunk, { individual: true, chain, }))

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
  getAllTokenAccounts = false,
}) {
  blacklistedTokens.push(...blacklistedTokens_default)
  if (!tokensAndOwners.length) {
    if (owner) tokensAndOwners = tokens.map(t => [t, owner])
    if (owners.length) tokensAndOwners = tokens.map(t => owners.map(o => [t, o])).flat()
  }
  if (!tokensAndOwners.length && !tokens.length && (owner || owners.length > 0) && getAllTokenAccounts) {
    const _owners = getUniqueAddresses([...owners, owner].filter(i => i), 'solana')
    for (const _owner of _owners) {
      const data = await getOwnerAllAccount(_owner)
      for (const item of data) {
        if (blacklistedTokens.includes(item.mint) || +item.amount < 1e6) continue;
        sdk.util.sumSingleBalance(balances, 'solana:' + item.mint, item.amount)
      }
    }
  }

  tokensAndOwners = tokensAndOwners.filter(([token]) => !blacklistedTokens.includes(token))

  if (tokensAndOwners.length) {
    tokensAndOwners = getUnique(tokensAndOwners)
    log('total balance queries: ', tokensAndOwners.length)
    const chunks = sliceIntoChunks(tokensAndOwners, 99)
    for (const chunk of chunks) {
      await _sumTokens(chunk)
      if (chunks.length > 2) {
        // log('waiting before more calls')
        await sleep(400)
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

  blacklistedTokens.forEach(i => delete balances['solana:' + i])

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

  async function getOwnerAllAccount(owner) {
    const tokenBalance = await http.post(endpoint(), formOwnerBalanceQuery(owner));
    return tokenBalance.result.value.map(i => ({
      account: i.pubkey,
      mint: i.account.data.parsed.info.mint,
      amount: i.account.data.parsed.info.tokenAmount.amount,
      uiAmount: i.account.data.parsed.info.tokenAmount.uiAmount,
      decimals: i.account.data.parsed.info.tokenAmount.decimals,
    }))
  }

  async function getSolBalances(accounts) {
    const formBody = key => ({ "jsonrpc": "2.0", "id": 1, "method": "getBalance", "params": [key] })
    const tokenBalances = []
    const chunks = sliceIntoChunks(accounts, 99)
    for (let chunk of chunks) {
      const bal = await http.post(endpoint(), chunk.map(formBody))
      tokenBalances.push(...bal)
    }
    return tokenBalances.reduce((a, i) => a + i.result.value, 0)
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

module.exports = {
  endpoint: endpoint(),
  getTokenSupply,
  getTokenBalance,
  getMultipleAccountsRaw,
  exportDexTVL,
  getProvider,
  getConnection,
  sumTokens2,
  transformBalances,
  readBigUInt64LE,
  decodeAccount,
  blacklistedTokens_default,
  getStakedSol,
  getSolBalanceFromStakePool,
};
