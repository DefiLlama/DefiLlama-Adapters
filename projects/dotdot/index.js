const { pool2 } = require('../helper/pool2')
const { staking } = require('../helper/staking')
const { transformBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const chain = 'bsc'

const epsLPStaking = '0x5b74c99aa2356b4eaa7b85dc486843edff8dfdbe'
const proxy = '0xd4d01c4367ed2d4ab5c2f734d640f7ffe558e8a8'
async function tvl(_, _b, { bsc: block }) {
  let addresses = (await sdk.api2.abi.fetchList({ withMetadata: true, target: epsLPStaking, chain, block, itemAbi: abis.registeredTokens, lengthAbi: abis.poolLength })).map(i => i.output)
  const calls = addresses.map(i => ({ params: [i, proxy] }))
  const { output: bals } = await sdk.api.abi.multiCall({
    target: epsLPStaking,
    abi: abis.userInfo,
    calls, chain, block,
  })
  const { output: totalSupplies } = await sdk.api.abi.multiCall({ chain, block, calls: addresses.map(i => ({ target: i })), abi: 'erc20:totalSupply' })
  const ratios = totalSupplies.map((supply, i) => +bals[i].output.depositAmount ? bals[i].output.depositAmount / supply.output : 0)
  const balances = {}
  await Promise.all(addresses.map((token, i) => resolveEpsLP({ ratio: ratios[i], token, block, balances, tokenBalance: bals[i].output.depositAmount, totalSupply: totalSupplies[i].output})))
  await fixVal3EPS(block, balances)
  return transformBalances(chain, balances)
}

async function fixVal3EPS(block, balances) {
  const val3EPSKey = '0x5b5bd8913d766d005859ce002533d4838b0ebbb5'
  const balance = balances[val3EPSKey]
  delete balances[val3EPSKey]
  const { output: supply } = await sdk.api.abi.call({
    target: '0x5b5bd8913d766d005859ce002533d4838b0ebbb5',
    abi: 'erc20:totalSupply',
    chain, block,
  })
  const ratio = balance/supply
  const params = '0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d' // minter
  const { output } = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: [
      {params, target: '0xaed19dab3cd68e4267aec7b2479b1ed2144ad77f'},
      {params, target: '0xa6fdea1655910c504e974f7f1b520b74be21857b'},
      {params, target: '0x5f7f6cb266737b89f7af86b30f03ae94334b83e9'},
    ],
    chain, block,
  })
  output.forEach(i => {
    sdk.util.sumSingleBalance(balances,i.input.target,i.output * ratio)
  })
}

async function resolveEpsLP({ block, balances, token, ratio, tokenBalance, totalSupply }) {
  if (token.toLowerCase() === '0xaf4de8e872131ae328ce21d909c74705d3aaf452') {
    sdk.util.sumSingleBalance(balances,'0xe9e7cea3dedca5984780bafc599bd69add087d56',tokenBalance) // store 3EPS as BUSD
    return
  }
  if (token.toLowerCase() === '0x5b5bd8913d766d005859ce002533d4838b0ebbb5') {
    sdk.util.sumSingleBalance(balances,'0x5b5bd8913d766d005859ce002533d4838b0ebbb5',tokenBalance)
    return
  }
  const blacklist = ['0xf71a0bcc3ef8a8c5a28fc1bc245e394a8ce124ec', '0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452'].map(i => i.toLowerCase())
  if (blacklist.includes(token.toLowerCase())) return;
  if (ratio === 0 || isNaN(ratio)) return;
  try {
    const [
      { output: factory },
      { output: minter },
    ] = await Promise.all([
      sdk.api.abi.call({ target: token, abi: abis.factory, chain, block, }),
      sdk.api.abi.call({ target: token, abi: abis.minter, chain, block, }),
    ])
    if (['0x8433533c5B67C4E18FA06935f73891B28a10932b'.toLowerCase(), '0x9f494C121A932F9Ed575c6c96F885E51Ec6B367b'.toLowerCase()].includes(factory.toLowerCase())) {
      const { output: coins } = await sdk.api.abi.call({
        target: factory,
        abi: { "stateMutability": "view", "type": "function", "name": "get_coins", "inputs": [{ "name": "_pool", "type": "address" }], "outputs": [{ "name": "", "type": "address[2]" }] },
        chain, block,
        params: minter,
      })
      const { output: bal } = await sdk.api.abi.call({
        target: factory,
        abi: { "stateMutability": "view", "type": "function", "name": "get_balances", "inputs": [{ "name": "_pool", "type": "address" }], "outputs": [{ "name": "", "type": "uint256[2]" }] },
        chain, block,
        params: minter,
      })
      bal.forEach((val, i) => sdk.util.sumSingleBalance(balances, coins[i].toLowerCase(), val * ratio))
      return;
    }
    if (['0xa5d748a3234A81120Df7f23c9Ea665587dc8d871'.toLowerCase(), '0x41871A4c63d8Fae4855848cd1790ed237454A5C4'.toLowerCase(), '0xf65BEd27e96a367c61e0E06C54e14B16b84a5870'.toLowerCase()].includes(factory.toLowerCase())) {
      const { output: coins } = await sdk.api.abi.call({
        target: factory,
        abi: { "stateMutability": "view", "type": "function", "name": "get_coins", "inputs": [{ "name": "_pool", "type": "address" }], "outputs": [{ "name": "", "type": "address[4]" }] },
        chain, block,
        params: minter,
      })
      const { output: bal } = await sdk.api.abi.call({
        target: factory,
        abi: { "stateMutability": "view", "type": "function", "name": "get_balances", "inputs": [{ "name": "_pool", "type": "address" }], "outputs": [{ "name": "", "type": "uint256[4]" }] },
        chain, block,
        params: minter,
      })
      bal.forEach((val, i) => sdk.util.sumSingleBalance(balances, coins[i].toLowerCase(), val * ratio))
      return;
    }
    throw new Error('Token not resolved '+token)

  } catch (e) { console.error(e) }
}

module.exports = {
  bsc: {
    tvl,
    pool2: pool2('0xe8bcccb79b66e49e7f95d576049cf4b23fdbc256', '0xc19956eca8a3333671490ef6d6d4329df049dddd', chain),
    staking: staking('0x51133c54b7bb6cc89dac86b73c75b1bf98070e0d', '0x84c97300a190676a19D1E13115629A11f8482Bd1', chain),
  }
}

const abis = {
  poolLength: { "inputs": [], "name": "poolLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  registeredTokens: { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "registeredTokens", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  factory: { "inputs": [], "name": "factory", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  minter: { "inputs": [], "name": "minter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
  getNCoins: { "stateMutability": "view", "type": "function", "name": "get_n_coins", "inputs": [{ "name": "_pool", "type": "address" }], "outputs": [{ "name": "", "type": "uint256" }], "gas": 2894 },
  userInfo: { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "userInfo", "outputs": [{ "internalType": "uint256", "name": "depositAmount", "type": "uint256" }, { "internalType": "uint256", "name": "adjustedAmount", "type": "uint256" }, { "internalType": "uint256", "name": "rewardDebt", "type": "uint256" }, { "internalType": "uint256", "name": "claimable", "type": "uint256" }], "stateMutability": "view", "type": "function" },
  getLpToken: { "stateMutability": "view", "type": "function", "name": "get_lp_token", "inputs": [{ "name": "arg0", "type": "address" }], "outputs": [{ "name": "", "type": "address" }], "gas": 4058 },
}