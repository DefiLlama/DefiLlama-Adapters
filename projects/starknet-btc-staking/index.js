const { call, parseAddress, sumTokens } = require('../helper/chain/starknet')
const ADDRESSES = require('../helper/coreAssets.json')

const STAKING_CONTRACT = '0x00ca1702e64c81d9a07b86bd2c540188d92a2c73cf5cc0e508d949015e7e84a7'

const abis = {
  get_active_tokens: {
    name: "get_active_tokens",
    type: "function",
    inputs: [],
    outputs: [{ type: "core::array::Span::<core::starknet::contract_address::ContractAddress>" }],
    state_mutability: "view"
  },
}

async function tvl(api) {
  const tokens = (await call({ target: STAKING_CONTRACT, abi: abis.get_active_tokens }))
    .map(parseAddress)
    .filter(t => t !== ADDRESSES.starknet.STRK)
  await sumTokens({ api, owner: STAKING_CONTRACT, tokens })
}

module.exports = {
  methodology: 'TVL is the sum of all BTC tokens staked in the Starknet BTC staking contract.',
  timetravel: false,
  starknet: { tvl },
}
