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

async function addBidsOnAnchor(collateral_token, balances = {}, block) {
  let bidsExist
  let max_idx = 0
  let pageNo = 0
  do {

    const { bids } = await fetchBids(collateral_token, max_idx, 99, block)
    bidsExist = !!bids.length
    max_idx = bids.reduce((agg, { idx }) => +idx > agg ? +idx : agg, max_idx)  // max_idx is the pagination pointer, needs to be updated to highest value of each result to fetch next page
    bids.forEach(({ amount }) => sumSingleBalance(balances, TOKEN_LIST.terrausd, amount))

  } while (bidsExist)

  return balances

  async function fetchBids(collateral_token, max_idx = 0, limit = 99, block) {
    const queryParam = {
      bids_by_user: {
        bidder: aUST_VAULT,
        collateral_token,
        start_after: `${max_idx}`,
        limit,
        block,
      }
    }
  
    return queryContractStore({ contract: ANCHOR_LIQUIDATION_CONTRACT, block, queryParam })
  }
}


async function staking(timestamp, ethBlock, { terra: block }) {
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
    console.log(token, balance, price)
    return sumSingleBalance(balances, token, balance, price)
  })

  await Promise.all(pAssets)
  return balances
}

async function tvl(timestamp, ethBlock, { terra: block }) {
  const balances = {}

  // Fetch all assets except native tokens and add it
  const { assets } = await queryContractStore({
    contract: REWARD_POOL,
    queryParam: {
      assets: {}
    },
    block
  })

  assets.map(({ balance, denom: { cw20, native }, price, }) => {
    const token = cw20 || native
    if (STAKING_TOKENS.includes(token)) return;
    sumSingleBalance(balances, token, balance, price)
  })

  // Add aUST tokens in the vault
  const vault_aUST_Balance = await getBalance(TOKEN_LIST.anchorust, aUST_VAULT, block)
  sumSingleBalance(balances, TOKEN_LIST.anchorust, vault_aUST_Balance)

  // Query Anchor liquidation contract for bids placed by Orca
  await Promise.all(COLLATETAL_TOKENS.map(token => addBidsOnAnchor(token, balances, block)))

  return balances
}

async function pool2(timestamp, ethBlock, { terra: block }) {
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

    assets.map(({ amount, info: { token, native_token }, }) => {
      if (token) token = token.contract_addr
      else token = native_token.denom
      const price = [TOKEN_LIST.KIJU, TOKEN_LIST.sKIJU] ? kijuPrice : 0
      return sumSingleBalance(balances, token, amount, price)
    })
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