const { queryContractStore, sumSingleBalance, TOKEN_LIST, getBalance, query, } = require('../helper/terra')

const REWARD_POOL = 'terra1vvj874nwtmxk0u0spj83d364xyhqk2e652jrck'
const aUST_VAULT = 'terra13nk2cjepdzzwfqy740pxzpe3x75pd6g0grxm2z'
const ANCHOR_LIQUIDATION_CONTRACT = 'terra1e25zllgag7j9xsun3me4stnye2pcg66234je3u'
const POOL2_CONTRACTS = [
  'terra1zkyrfyq7x9v5vqnnrznn3kvj35az4f6jxftrl2',
  'terra1hlq6ye6km5sq2pcnmrvlf784gs9zygt0akwvsu',
  'terra1l60336rkawujnwk7lgfq5u0s684r99p3y8hx65',
  'terra13f87x4c87ct5545t3j4mqw4k6jmgds5609z92c',
  'terra1wh2jqjkagzyd3yl4sddlapy45ry808xe80fchh'
]

const STAKING_TOKENS = [
  TOKEN_LIST.KIJU,
  TOKEN_LIST.sKIJU,
]

const COLLATETAL_TOKENS = [
  TOKEN_LIST['bonded-luna'],
  TOKEN_LIST['anchor-beth-token'],
  // TOKEN_LIST['avalanche-2'],
]

async function addAnchorBids(balances, bid_slot, collateral_token, block) {
  const queryParam = {
    bid_pool: {
      bidder: aUST_VAULT,
      collateral_token,
      bid_slot
    }
  }

  const {
    total_bid_amount
  } = await queryContractStore({ contract: ANCHOR_LIQUIDATION_CONTRACT, block, queryParam })

  await sumSingleBalance(balances, TOKEN_LIST.terrausd, total_bid_amount)
  return balances
}

async function staking(timestamp, block) {
  const balances = {}

  const { assets } = await queryContractStore({
    contract: REWARD_POOL,
    queryParam: {
      assets: {}
    },
    block
  })

  const pAssets = assets.map(({ balance, denom: { cw20, native }, price }) => {
    const token = cw20 || native
    if (!STAKING_TOKENS.includes(token)) return;
    return sumSingleBalance(balances, token, balance, price)
  })

  await Promise.all(pAssets)
  return balances
}

async function tvl(timestamp, block) {
  const balances = {}

  // Fetch all assets except native tokens and add it
  const { assets } = await queryContractStore({
    contract: REWARD_POOL,
    queryParam: {
      assets: {}
    },
    block
  })

  const pAssets = assets.map(({ balance, denom: { cw20, native }, price, }) => {
    const token = cw20 || native
    if (STAKING_TOKENS.includes(token)) return;
    return sumSingleBalance(balances, token, balance, price)
  })

  await Promise.all(pAssets)

  // Add aUST tokens in the vault
  const vault_aUST_Balance = await getBalance(TOKEN_LIST.anchorust, aUST_VAULT, block)
  await sumSingleBalance(balances, TOKEN_LIST.anchorust, vault_aUST_Balance)

  // Query Anchor liquidation contract for bids placed by Orca
  for (let bidSlot = 1; bidSlot < 31; bidSlot++)
    await Promise.all(COLLATETAL_TOKENS.map(token => addAnchorBids(balances, bidSlot, token, block)))

  return balances
}

async function pool2(timestamp, block) {
  const balances = {}

  const { assets } = await queryContractStore({
    contract: REWARD_POOL,
    queryParam: {
      assets: {}
    },
    block
  })

  const kijuPrice = assets.find(({ denom: { cw20, }, }) => cw20 === TOKEN_LIST.KIJU).price

  await Promise.all(POOL2_CONTRACTS.map(addPool))

  async function addPool(contract) {

    const { assets } = await queryContractStore({
      contract,
      queryParam: {
        pool: {}
      },
      block
    })

    const pAssets = assets.map(({ amount, info: { token, native_token }, }) => {
      if (token) token = token.contract_addr
      else token = native_token.denom
      const price = [TOKEN_LIST.KIJU, TOKEN_LIST.sKIJU] ? kijuPrice : 0
      return sumSingleBalance(balances, token, amount, price)
    })

    return Promise.all(pAssets)
  }

  return balances
}

module.exports = {
  terra: {
    tvl,
    pool2,
    staking,
  }
}