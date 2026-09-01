const ADDRESSES = require('../helper/coreAssets.json')
const { multiCall, sumTokens, call } = require('../helper/chain/starknet')
const market_ = [
    {
      "name": "get_total_debt_for_token",
      "type": "function",
      "inputs": [
        {
          "name": "token",
          "type": "felt"
        }
      ],
      "outputs": [
        {
          "name": "debt",
          "type": "felt"
        }
      ],
      "stateMutability": "view",
      "customInput": "address"
    },
]
const marketAbi = {}
market_.forEach(i => marketAbi[i.name] = i)
const staking_ = [
    {
      name: "core::integer::u256",
      type: "struct",
      members: [
        {
          name: "low",
          type: "core::integer::u128",
        },
        {
          name: "high",
          type: "core::integer::u128",
        },
      ],
    },
    {
      "type": "function",
      "name": "get_total_staked_amount",
      "inputs": [],
      "outputs": [
        {
          "type": "core::integer::u256"
        }
      ],
      "state_mutability": "view"
    },
]
const stakingAbi = {}
staking_.forEach(i => stakingAbi[i.name] = i)

const market = '0x4c0a5193d58f74fbace4b74dcf65481e734ed1714121bdc571da345540efa05'
const stakingContract = '0x0212c219a68c8fe38f37951123d1ec877570dfa891de270aa4f8634c5e60bc23'

const assets = [
  ADDRESSES.starknet.WBTC,
  ADDRESSES.starknet.ETH,
  ADDRESSES.starknet.USDC,
  ADDRESSES.starknet.DAI,
  ADDRESSES.starknet.DAI_1,
  ADDRESSES.starknet.USDT,
  ADDRESSES.starknet.WSTETH,
  ADDRESSES.starknet.STRK
]

async function tvl(api) {
  return sumTokens({ api, owner: market, tokens: assets })
}

async function staking(api) {
  const amountStakedAtStakingContract = await call({ target: stakingContract, abi: stakingAbi.get_total_staked_amount })
  api.add(ADDRESSES.starknet.ZEND, amountStakedAtStakingContract)
  return sumTokens({ api, owner: market, tokens: [ADDRESSES.starknet.ZEND] })
}

/*async function borrowed(api) {
  let data = await multiCall({ calls: assets, target: market, abi: marketAbi.get_total_debt_for_token });
  data = data.map(i => +i)
  api.addTokens(assets, data)
}*/

module.exports = {
  methodology: 'Value of user supplied asset on zkLend is considered as TVL',
  // hallmarks: [
  //   ['2025-02-11', "Empty Market Exploit"]
  // ],
  starknet: {
    tvl,
    borrowed: ()=>({}), // hacked, it's all bad debt
    staking,
  },
}
