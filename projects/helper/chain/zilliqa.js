const { post } = require('../http')
const BigNumber = require('bignumber.js')

const ZILLIQA_API = 'https://api.zilliqa.com/' // Mainnet API

async function call(query) {
  return post(ZILLIQA_API, query)
}

function formQuery(args) {
  if (Array.isArray(args)) return args.map(formQuery)

  let {
    id,
    jsonrpc = '2.0',
    method = 'GetSmartContractSubState',
    params
  } = args

  if (!id) id = `${params[1]}-${params[0]}`

  return { id, jsonrpc, method, params, }
}

async function getContractState(contract, method, args = []) {
  if (contract.startsWith('0x')) contract = contract.slice(2)
  return call({
    params: [contract, method, ...args]
  })
}

async function getBalance(token, address) {
  if (token.startsWith('0x')) token = token.slice(2)
  const {
      result: {
        balances
      }
  } = await call(formQuery({
    params: [
      token,
      'balances',
      [address]
    ]
  }))
  return balances[address]
}

async function getZilliqaBalance(address) {
  if (address.startsWith('0x')) address = address.slice(2)
  const {
      result: {
        balance
      }
  } = await call(formQuery({ method: 'GetBalance', params: [address] }))
  return BigNumber(balance).shiftedBy(-1 * 12)
}

async function getBalances(tokens, addresses, balances = {}) {
  if (!Array.isArray(tokens)) tokens = [tokens]
  if (!Array.isArray(addresses)) addresses = [addresses]

  const query = tokens
    .map(token =>
      addresses.map(addr => formQuery({
        id: `${token}-${addr}`,
        params: [
          token.startsWith('0x') ? token.slice(2) : token,
          'balances',
          [addr]
        ]
      })
      )).flat()

  const data = await call(query)

  data.forEach((response) => {
    const { id, result } = response
    if (!result) return
    let token = id.split('-')[0]
    const tokenRef = TOKENS[token]
    let decimals = 0

    if (tokenRef && tokenRef.decimals)
      decimals = tokenRef.decimals

    if (tokenRef && tokenRef.coingeckoId)
      token = tokenRef.coingeckoId
    else
      token = `zilliqa:${token}`

    if (!balances[token])
      balances[token] = BigNumber(0)

    const balancesSum = Object.values(result.balances)
      .reduce((sum, i) => sum.plus(BigNumber(i).shiftedBy(decimals * -1)), BigNumber(0))

    balances[token] = balances[token].plus(balancesSum)
  })

  return balances
}

async function sumTokens({ owners, }) {
  const balances = await Promise.all(owners.map(getZilliqaBalance))
  return {
    zilliqa: balances.reduce((a, i) => a + +i, 0),
  }
}

// taken from https://swap.xcadnetwork.com/_next/data/E6YkkwWJMYjzQhGDTm38j/pool-overview.json
const TOKENS = {
  '0x153feaddc48871108e286de3304b9597c817b456': {
    name: 'XCAD Token',
    symbol: 'XCAD',
    decimals: 18,
    contractAddress: '0x153feaddc48871108e286de3304b9597c817b456',
    coingeckoId: 'xcad-network'
  },
  '0x327082dd216ff625748b13e156b9d1a5d3dd41f2': {
    name: 'dXCAD Token',
    symbol: 'dXCAD',
    decimals: 18,
    contractAddress: '0x327082dd216ff625748b13e156b9d1a5d3dd41f2'
  },
  '0x818ca2e217e060ad17b7bd0124a483a1f66930a9': {
    name: 'Zilliqa-bridged USDT token',
    symbol: 'zUSDT',
    decimals: 6,
    contractAddress: '0x818ca2e217e060ad17b7bd0124a483a1f66930a9',
    coingeckoId: 'tether'
  },
  '0x201C44B426D85fB2c382563483140825Fd81b9b5': {
    name: 'Opulous',
    symbol: 'zOPUL',
    decimals: 18,
    contractAddress: '0x201C44B426D85fB2c382563483140825Fd81b9b5',
    coingeckoId: 'opulous'
  },
  '0x31bFa2054B7199F936733f9054DBCE259a3c335a': {
    name: 'Lunr Token',
    symbol: 'Lunr',
    decimals: 4,
    contractAddress: '0x31bFa2054B7199F936733f9054DBCE259a3c335a',
    coingeckoId: 'lunr-token',
  },
  '0x9945a0da3dc74e364da4ea96946c99336013eeb5': {
    name: 'Heroes Of Lowhelm',
    symbol: 'HOL',
    decimals: 5,
    contractAddress: '0x9945a0da3dc74e364da4ea96946c99336013eeb5'
  },
  '0xbf79e16872fad92c16810ddd2a7b9b6858c7b756': {
    name: 'CARBON Token',
    symbol: 'CARB',
    decimals: 8,
    contractAddress: '0xbf79e16872fad92c16810ddd2a7b9b6858c7b756',
    coingeckoId: 'carbon-labs'
  },
  '0x3a683fdc022b26d755c70e9ed7cfcc446658018b': {
    name: 'PackagePortal Token',
    symbol: 'PORT',
    decimals: 4,
    contractAddress: '0x3a683fdc022b26d755c70e9ed7cfcc446658018b',
    coingeckoId: 'packageportal',
  },
  '0x91228A48AEA4E4071B9C6444Eb08B021399CfF7c': {
    name: 'Unifees Token',
    symbol: 'FEES',
    decimals: 4,
    contractAddress: '0x91228A48AEA4E4071B9C6444Eb08B021399CfF7c',
    coingeckoId: 'unifees'
  },
  '0xa3eAFd5021F6B9c36fD02Ed58aa1d015F2238791': {
    name: 'ZILStream Token',
    symbol: 'STREAM',
    decimals: 8,
    contractAddress: '0xa3eAFd5021F6B9c36fD02Ed58aa1d015F2238791',
    coingeckoId: 'zilstream'
  },
  '0xa845C1034CD077bD8D32be0447239c7E4be6cb21': {
    name: 'Governance ZIL',
    symbol: 'gZIL',
    decimals: 15,
    contractAddress: '0xa845C1034CD077bD8D32be0447239c7E4be6cb21',
    coingeckoId: 'governance-zil'
  },
  '0xb393C898b3d261C362a4987CaE5a833232AA666E': {
    name: 'Score',
    symbol: 'SCO',
    decimals: 4,
    contractAddress: '0xb393C898b3d261C362a4987CaE5a833232AA666E',
    coingeckoId: 'score-token',
  },
  '0x173Ca6770Aa56EB00511Dac8e6E13B3D7f16a5a5': {
    name: 'XSGD',
    symbol: 'XSGD',
    decimals: 6,
    contractAddress: '0x173Ca6770Aa56EB00511Dac8e6E13B3D7f16a5a5',
    coingeckoId: 'xsgd',
  },
  '0xaCb721d989c095c64A24d16DfD23b08D738e2552': {
    name: 'REDChillies Token',
    symbol: 'REDC',
    decimals: 9,
    contractAddress: '0xaCb721d989c095c64A24d16DfD23b08D738e2552',
    coingeckoId: 'redchillies',
  },
  '0x75fA7D8BA6BEd4a68774c758A5e43Cfb6633D9d6': {
    name: 'Wrapped Bitcoin',
    symbol: 'zWBTC',
    decimals: 8,
    contractAddress: '0x75fA7D8BA6BEd4a68774c758A5e43Cfb6633D9d6',
    coingeckoId: 'bitcoin',
  },
  '0x2cA315F4329654614d1E8321f9C252921192c5f2': {
    name: 'Ethereum',
    symbol: 'zETH',
    decimals: 18,
    contractAddress: '0x2cA315F4329654614d1E8321f9C252921192c5f2',
    coingeckoId: 'ethereum'
  },
  '0x4268C34dA6Ad41a4cDeAa25cdEF6531Ed0c9a1A2': {
    name: 'BLOX',
    symbol: 'BLOX',
    decimals: 2,
    contractAddress: '0x4268C34dA6Ad41a4cDeAa25cdEF6531Ed0c9a1A2',
    coingeckoId: 'blox-token'
  },
  '0x2fc7167c3Baff89E2805Aef72636ccD98eE6Bbb2': {
    name: 'DeMons',
    symbol: 'DMZ',
    decimals: 18,
    contractAddress: '0x2fc7167c3Baff89E2805Aef72636ccD98eE6Bbb2'
  },
  '0x32339fa037f7ae1DfFF25e13c6451a80289D61F4': {
    name: 'Brokoli',
    symbol: 'zBRKL',
    decimals: 18,
    contractAddress: '0x32339fa037f7ae1DfFF25e13c6451a80289D61F4',
    coingeckoId: 'brokoli',
  },
  '0xC6Bb661eDA683BdC792b3e456A206a92cc3cB92e': {
    name: 'DUCKDUCK',
    symbol: 'DUCK',
    decimals: 2,
    contractAddress: '0xC6Bb661eDA683BdC792b3e456A206a92cc3cB92e',
    coingeckoId: 'duckduck-token',
  },
  '0x9bd504b1445fdb8f4a643453ec1459bb9a2f988a': {
    name: 'XIDR',
    symbol: 'XIDR',
    decimals: 6,
    contractAddress: '0x9bd504b1445fdb8f4a643453ec1459bb9a2f988a'
  },
  '0x54aE64e2092749fb8d25470ffc1d4D6A19c6f2Ab': {
    name: 'Okipad',
    symbol: 'Oki',
    decimals: 5,
    contractAddress: '0x54aE64e2092749fb8d25470ffc1d4D6A19c6f2Ab'
  },
  '0x083196549637fAf95C91EcCD157E60430e69E1A7': {
    name: 'Sparda Wallet',
    symbol: 'SPW',
    decimals: 4,
    contractAddress: '0x083196549637fAf95C91EcCD157E60430e69E1A7',
    coingeckoId: 'sparda-wallet',
  },
  '0x4306f921c982766810cf342775fd79aa2d0d0e24': {
    name: 'Wrapped ZIL',
    symbol: 'wZIL',
    decimals: 12,
    contractAddress: '0x4306f921c982766810cf342775fd79aa2d0d0e24',
    coingeckoId: 'zilliqa',
  },
}


module.exports = {
  call,
  formQuery,
  getContractState,
  getBalance,
  getZilliqaBalance,
  getBalances,
  sumTokens,
}