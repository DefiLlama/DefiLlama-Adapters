const ADDRESSES = require('../helper/coreAssets.json')
const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const MCD_VAT = '0x35d1b3f3d7966a1dfe207aa4514c12a259a0492b'
const VAT_topic = '0x65fae35e00000000000000000000000000000000000000000000000000000000'
const START_VAT_BLOCK = 8928152

const MCD_DOG = '0x135954d155898d42c90d2a57824c690e0c7bef1b'
const DOG_topic = '0x4ff2caaa972a7c6629ea01fae9c93d73cc307d13ea4c369f9bbbb7f9b7e9461d'
const START_DOG_BLOCK = 12317310

// PSM USDC STABLECOIN
const extraUSDCWallet = '0x37305b1cd40574e4c5ce33f8e8306be057fd7341'.toLowerCase()
const USDC = ADDRESSES.ethereum.USDC

const abi = {
  ilk: "function ilk() view returns (bytes32)",
  gem: "address:gem",
  Pie: "uint256:Pie",
  dog: "address:dog",
}

const getJoins = async (api) => {
  const logs = (await getLogs2({ api, target: MCD_VAT, fromBlock: START_VAT_BLOCK, topics: [VAT_topic] })).map(log => {
    return '0x' + log.topics[1].slice(-40);
  })

  const ilks = await api.multiCall({ abi: abi.ilk, calls: logs, permitFailure: true })
  
  return logs.map((auth, i) => {
    const ilk = ilks[i];
    if (!ilk) return null
    return auth.toLowerCase();
  }).filter(Boolean);
}

const tvl = async (api) => {
  const [joins] = await Promise.all([
    getJoins(api),
  ])

  const tokens = await api.multiCall({ abi: abi.gem, calls: joins, permitFailure: true })

  let toas = joins.map((join, i) => {
    const token = tokens[i];
    if (!token) return null
    return [token, join]
  }).filter(Boolean)

  toas = toas.filter(i => i[0].toLowerCase() !== ADDRESSES.ethereum.SAI.toLowerCase())

  const symbols = await api.multiCall({ abi: 'erc20:symbol', calls: toas.map(([token]) => token) })

  const gUNIToa = toas.filter((_, i) => symbols[i] === 'G-UNI')
  toas = toas.filter((_, i) => symbols[i] !== 'G-UNI' && !symbols[i].startsWith('RWA'))

  // Add extra USDC balance
  toas.push([USDC, extraUSDCWallet])

  await unwrapGunis({ api, toa: gUNIToa })

  return sumTokens2({ api, tokensAndOwners: toas, resolveLP: true })
}

async function unwrapGunis({ api, toa, }) {
  const lps = toa.map(i => i[0])
  const balanceOfCalls = toa.map(t => ({ params: t[1], target: t[0] }))
  const [
    token0s, token1s, supplies, uBalances, tokenBalances
  ] = await Promise.all([
    api.multiCall({ abi: 'address:token0', calls: lps }),
    api.multiCall({ abi: 'address:token1', calls: lps }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: lps }),
    api.multiCall({ abi: 'function getUnderlyingBalances() view returns (uint256 token0Bal, uint256 token1Bal)', calls: lps }),
    api.multiCall({ abi: 'erc20:balanceOf', calls: balanceOfCalls }),
  ])

  tokenBalances.forEach((bal, i) => {
    const ratio = bal / supplies[i]
    const token0Bal = uBalances[i][0] * ratio
    const token1Bal = uBalances[i][1] * ratio
    api.add(token0s[i], token0Bal)
    api.add(token1s[i], token1Bal)
  })

  api.removeTokenBalance(ADDRESSES.ethereum.DAI) // remove dai balances
}

module.exports = {
  methodology: `Counts all the tokens being used as collateral of CDPs. On the technical level, we get all the collateral tokens by fetching events, get the amounts locked by calling balanceOf() directly, unwrap any uniswap LP tokens and then get the price of each token from coingecko. Also includes PSM USDC balance.`,
  start: '2017-12-18', // 12/18/2017 @ 12:00am (UTC)
  ethereum: {
    tvl
  },
};
