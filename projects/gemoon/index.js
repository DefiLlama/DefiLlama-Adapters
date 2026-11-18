const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs2 } = require('../helper/cache/getLogs')

// Gemoon (gmoon.trade) — meme token launchpad on Uniswap V4, Robinhood Chain.
// Pool liquidity itself sits in the Uniswap V4 PoolManager and is already counted by the
// uniswap-v4 adapter, so only the protocol's own contracts are counted here.
const CONTROLLER = '0x1d05Da4495E57C764229Ec355FCEC1298C6A4AeD' // creates memes (TokenCreated)
const VAULT = '0x1fd8082AC782444EcD013803A18BAD383BFAc0F8' // staked memes, USDG fees, reward assets
const FROM_BLOCK = 104517510 // Controller deployment

async function tvl(api) {
  const logs = await getLogs2({
    api, target: CONTROLLER, fromBlock: FROM_BLOCK,
    eventAbi: 'event TokenCreated(address indexed tokenAddress, address indexed creatorAdmin, uint256 indexed positionId, address creatorRewardRecipient, string name, string symbol)',
  })
  const memes = logs.map(l => l.tokenAddress)
  const usdg = await api.call({ target: VAULT, abi: 'address:usdg' })
  const rewardAssets = await api.call({ target: VAULT, abi: 'address[]:allowedAssets' })

  return sumTokens2({
    api,
    owner: VAULT,
    tokens: [...memes, usdg, ...rewardAssets],
  })
}

module.exports = {
  methodology: 'Counts assets held by the Gemoon protocol contracts: the Vault (meme tokens staked by users, USDG swap fees pending distribution, converted reward assets). The Referrals contract is not counted. Liquidity in the Uniswap V4 pools of the memes is held by the PoolManager and is counted by the Uniswap V4 adapter, not here.',
  start: '2026-11-03',
  robinhood: { tvl },
}
