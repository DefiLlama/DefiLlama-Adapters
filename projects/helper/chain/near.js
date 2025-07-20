const ADDRESSES = require('../coreAssets.json')
const axios = require("axios")
const { default: BigNumber } = require("bignumber.js")
const sdk = require('@defillama/sdk')

// Add success status codes
const successCodes = [200, 201, 202, 203, 204];

// Add error formatter function
function formAxiosError(url, error, options = {}) {
  const { method = 'GET' } = options;
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    throw new Error(`Error ${method}ing ${url}: ${error.response.status} ${error.response.statusText} - ${JSON.stringify(error.response.data)}`);
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error(`Error ${method}ing ${url}: No response received`);
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new Error(`Error ${method}ing ${url}: ${error.message}`);
  }
}

function transformAddress(addr) {
  const bridgedAssetIdentifier = ".factory.bridge.near";
  if (addr.endsWith(bridgedAssetIdentifier))
    return `0x${addr.slice(0, addr.length - bridgedAssetIdentifier.length)}`;
  if (addr.endsWith('.near'))
    return `near:${addr}`
  return addr
}

// const endpoint = "https://rpc.mainnet.near.org"
// const endpoint = "https://near.lava.build"
const endpoint = "https://free.rpc.fastnear.com"

const tokenMapping = {
  'wrap.near': { name: 'near', decimals: 24, },
  'meta-pool.near': { name: 'staked-near', decimals: 24, },
  [ADDRESSES.near.LINA]: { name: 'linear-protocol', decimals: 24, },
  "storage.herewallet.near": { name: 'here-staking', decimals: 24, },
  'usn': { name: 'usn', decimals: 18, },
  'aurora': { name: 'ethereum', decimals: 18, },
  'token.skyward.near': { name: 'skyward-finance', decimals: 18, },
  'dbio.near': { name: 'debio-network', decimals: 18, },
  // 'hak.tkn.near': { name: '', }, // Hakuna matata
  'meta-token.near': { name: 'meta-near', decimals: 24 },
  'v3.oin_finance.near': { name: 'oin-finance', decimals: 8, },
  'usdt.tether-token.near': { name: 'tether', decimals: 6, },
  // 'gems.l2e.near': { name: '', }, // https://www.landtoempire.com/
  // 'nd.tkn.near': { name: '', },   // nearDog
  // 'gold.l2e.near': { name: '', }, // https://www.landtoempire.com/
  'token.v2.ref-finance.near': { name: 'ref-finance', decimals: 18, },
  // 'myriadcore.near': { name: '', },  // Myria
  // '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near': { name: 'dai', decimals: 18 },
  'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': { name: 'usd-coin', decimals: 6 },
  // 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': { name: 'tether', decimals: 6 },
  '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near': { name: 'wrapped-bitcoin', decimals: 8 },
  // 'aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near': { name: 'aurora-near', decimals: 18 },
  [ADDRESSES.near.BURROW]: { name: 'burrow', decimals: 18 },
  [ADDRESSES.near.PARAS]: { name: 'paras', decimals: 18 },
  [ADDRESSES.near.PEMBROCK]: { name: 'pembrock', decimals: 18 },
  'token.sweat': { name: 'sweatcoin', decimals: 18 },
  'v2-nearx.stader-labs.near': { name: 'stader-nearx', decimals: 24 },
  '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': { name: 'usd-coin', decimals: 6 },
  'edge-fast.near': { name: 'edge-video-ai', decimals: 24 },
  '802d89b6e511b335f05024a65161bce7efc3f311.factory.bridge.near': { name: 'linear-protocol-lnr', decimals: 18 },
  'ftv2.nekotoken.near': { name: 'neko', decimals: 24 },
  'token.lonkingnearbackto2024.near': { name: 'lonk-on-near', decimals: 8 },
  'blackdragon.tkn.near': { name: 'black-dragon', decimals: 24 },
  'gear.enleap.near': { name: 'near-tinker-union-gear', decimals: 18 },
  'token.0xshitzu.near': { name: 'shitzu', decimals: 18 },
  'purge-558.meme-cooking.near': { name: 'forgive-me-father', decimals: 18 },
  'mpdao-token.near': { name: 'meta-pool-dao', decimals: 6 },
  'kat.token0.near': { name: 'nearkat', decimals: 18 },
    // NEAR Intnets
  'sol.omft.near': { name: 'solana', decimals: 9 },
  'eth.omft.near': { name: 'ethereum', decimals: 18 },
  'btc.omft.near': { name: 'bitcoin', decimals: 8 },
  'eth-0xdac17f958d2ee523a2206206994597c13d831ec7.omft.near': { name: 'tether', decimals: 6 },
  'eth-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.omft.near': { name: 'usd-coin', decimals: 6 },
  'zec.omft.near': { name: 'zcash', decimals: 8 },
  'sol-5ce3bf3a31af18be40ba30f721101b4341690186.omft.near': { name: 'usd-coin', decimals: 6 },
  'tron-d28a265909efecdcee7c5028585214ea0b96f015.omft.near': { name: 'tether', decimals: 6 },
  'doge.omft.near': { name: 'dogecoin', decimals: 8 },
  'xrp.omft.near': { name: 'xrp', decimals: 6 },
  'eth-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf.omft.near': { name: 'coinbase-wrapped-btc', decimals: 8 },
  'sol-c800a4bd850783ccb82c2b2c7e84175443606352.omft.near': { name: 'tether', decimals: 6 },
  'base-0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf.omft.near': { name: 'coinbase-wrapped-btc', decimals: 8 },
  'arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near': { name: 'usd-coin', decimals: 6 },
  'bera.omft.near': { name: 'berachain-bera', decimals: 18 },
  'eth-0xaaaaaa20d9e0e2461697782ef11675f668207961.omft.near': { name: 'aurora-near', decimals: 18 },
  'gnosis.omft.near': { name: 'xdai', decimals: 18 },
  'base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near': { name: 'usd-coin', decimals: 6 },
  'arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near': { name: 'tether', decimals: 6 },
  'gnosis-0x4d18815d14fe5c3304e87b3fa18318baa5c23820.omft.near': { name: 'safe', decimals: 18 },
  'gnosis-0x177127622c4a00f3d409b75571e12cb3c8973d3c.omft.near': { name: 'cow-protocol', decimals: 18},
  'gnosis-0x9c58bacc331c9aa871afd802db6379a98e80cedb.omft.near': { name: 'gnosis', decimals: 18},
  'eth-0xa35923162c49cf95e6bf26623385eb431ad920d3.omft.near': { name: 'turbo', decimals: 18},
  'arb.omft.near': { name: 'ethereum', decimals: 18},
  'base.omft.near': { name: 'ethereum', decimals: 18},
  'tron.omft.near': { name: 'tron', decimals: 6},
  'gnosis-0x2a22f9c3b484c3629090feed35f17ff8f88f76f0.omft.near': { name: 'usd-coin', decimals:6},
  'bsc.omft.near': { name: 'binancecoin', decimals: 18},
  'pol.omft.near': { name: 'polkadot', decimals: 18},
  'base-0x98d0baa52b2d063e780de12f615f963fe8537553.omft.near': { name: 'kaito', decimals: 18},
  'gnosis-0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1.omft.near': { name: 'weth', decimals: 18},
  'eth.bridge.near': { name: 'ethereum', decimals: 18},
  '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near': { name: 'frax', decimals: 18},
  'arb-0x912ce59144191c1204e64559fe8253a0e49e6548.omft.near' : { name: 'arbitrum', decimals: 18},
  'eth-0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202.omft.near': { name: 'kyber-network-crystal', decimals: 18},
  'eth-0xa35923162c49cf95e6bf26623385eb431ad920d3.omft.near': { name: 'turbo', decimals: 18},
  'sol-b9c68f94ec8fd160137af8cdfe5e61cd68e2afba.omft.near': { name: 'dogwifcoin', decimals: 6},
  'sol-57d087fd8c460f612f8701f5499ad8b2eec5ab68.omft.near': {name: 'book-of-meme', decimals: 6},
  'sol-c58e6539c2f2e097c251f8edf11f9c03e581f8d4.omft.near': {name: 'trump', decimals: 6},
  'sol-d600e625449a4d9380eaf5e3265e54c90d34e260.omft.near': {name: 'melania', decimals: 6},
  'sol-bb27241c87aa401cc963c360c175dd7ca7035873.omft.near': {name: 'loud', decimals: 6},
  'eth-0x6b175474e89094c44da98b954eedeac495271d0f.omft.near': {name: 'dai', decimals: 18},
  'base-0x532f27101965dd16442e59d40670faf5ebb142e4.omft.near': {name: 'brett', decimals: 18},
  'arb-0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a.omft.near': {name: 'gmx', decimals: 18},
  'eth-0xaaee1a9723aadb7afa2810263653a34ba2c21c7a.omft.near': {name: 'mog-coin', decimals: 18},
  'eth-0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9.omft.near': {name: 'aave', decimals: 18},
  'eth-0x1f9840a85d5af5bf1d1762f925bdaddc4201f984.omft.near': {name: 'uniswap', decimals: 18},
  'eth-0x514910771af9ca656af840dff83e8264ecf986ca.omft.near': {name: 'chainlink', decimals: 18},
  'eth-0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce.omft.near': {name: 'shiba-inu', decimals: 18},
  'eth-0x6982508145454ce325ddbe47a25d4ec3d2311933.omft.near': {name: 'pepe', decimals: 18},
  'nbtc.bridge.near': {name: 'bitcoin', decimals: 8},
  'sol-91914f13d3b54f8126a2824d71632d4b078d7403.omft.near': {name: 'okx-wrapped-btc', decimals: 8},
  'a35923162c49cf95e6bf26623385eb431ad920d3.factory.bridge.near': {name: 'turbo', decimals: 18},
  'sol-df27d7abcc1c656d4ac3b1399bbfbba1994e6d8c.omft.near': {name: 'turbo', decimals: 8},
  'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near': {name: 'hapi', decimals: 18},
  'base-0xa5c67d8d37b88c2d88647814da5578128e2c93b2.omft.near': {name: 'fms', decimals: 18},
  'pol-0x3c499c542cef5e3811e1192ce70d8cc03d5c3359.omft.near': {name: 'usd-coin', decimals: 6},
  'bsc-0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d.omft.near': {name: 'usd-coin', decimals: 18},
  'bsc-0x55d398326f99059ff775485246999027b3197955.omft.near': {name: 'tether', decimals: 18},
  'eth-0xfa2b947eec368f42195f24f36d2af29f7c24cec2.omft.near': {name: 'usdf', decimals: 18},
  'eth-0x8d0d000ee44948fc98c9b98a4fa4921476f08b0d.omft.near': {name: 'usd1', decimals: 18}

}

async function view_account(account_id) {
  const result = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "query",
    "params": {
      "request_type": "view_account",
      "finality": "final",
      "account_id": account_id
    }
  });
  if (result.data.error) {
    throw new Error(`${result.data.error.message}: ${result.data.error.data}`)
  }
  return result.data.result;
}

async function call(contract, method, args = {}) {
  const result = await axios.post(endpoint, {
    "jsonrpc": "2.0",
    "id": "1",
    "method": "query",
    "params": {
      "request_type": "call_function",
      "finality": "final",
      "account_id": contract,
      "method_name": method,
      "args_base64": Buffer.from(JSON.stringify(args)).toString("base64")
    }
  });
  if (result.data.error) {
    throw new Error(`${result.data.error.message}: ${result.data.error.data}`)
  }
  return JSON.parse(Buffer.from(result.data.result.result).toString())
}

async function getTokenBalance(token, account) {
  return call(token, "ft_balance_of", { account_id: account })
}

async function addTokenBalances(tokens, account, balances = {}) {
  if (!Array.isArray(tokens)) tokens = [tokens]
  const fetchBalances = tokens.map(token => addAsset(token, account, balances))
  await Promise.all(fetchBalances)
  return balances
}

async function addAsset(token, account, balances = {}) {
  let balance = await getTokenBalance(token, account)
  return sumSingleBalance(balances, token, balance)
}

function sumSingleBalance(balances, token, balance) {
  const { name, decimals, } = tokenMapping[token] || {}

  if (name) {
    if (decimals)
      balance = balance / (10 ** decimals)

    balances[name] = +(balances[name] || 0) + balance
    return
  }

  sdk.util.sumSingleBalance(balances, transformAddress(token), BigNumber(balance).toFixed(0))
  return balances
}

async function sumTokens({ balances = {}, owners = [], tokens = []}) {
  tokens = tokens.filter(i => i !== 'aurora')
  await Promise.all(owners.map(i => addTokenBalances(tokens, i, balances)))
  const bals = await Promise.all(owners.map(view_account))
  const nearBalance = bals.reduce((a,i) => a + (i.amount/1e24), 0)
  sdk.util.sumSingleBalance(balances,'coingecko:near',nearBalance)
  return balances
}

async function httpGet(url, options, { withMetadata = false } = {}) {
  try {
    const res = await axios.get(url, options)
    if (!successCodes.includes(res.status)) throw new Error(`Error fetching ${url}: ${res.status} ${res.statusText}`)
    if (!res.data) throw new Error(`Error fetching ${url}: no data`)
    if (withMetadata) return res
    return res.data
  } catch (error) {
    throw formAxiosError(url, error, { method: 'GET' })
  }
}

module.exports = {
  view_account,
  call,
  addTokenBalances,
  getTokenBalance,
  sumSingleBalance,
  sumTokens,
  httpGet
};
