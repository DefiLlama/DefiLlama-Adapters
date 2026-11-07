const sdk = require('@defillama/sdk')
const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const BOTBOUNTY_ESCROW = '0x909661b453bBe13Ee247551754b35370557A9aA2'

const GET_BOUNTY_COUNT_ABI = 'uint256:getBountyCount'
const GET_BOUNTIES_ABI =
  'function getBounties(uint256 offset, uint256 limit) view returns ((bytes32 bountyId, address maintainer, address solver, address settlementToken, uint256 amount, uint256 createdAt, uint256 deadline, uint256 submittedAt, uint256 reviewPeriod, uint8 status, string issueUrl, string prUrl, bytes32 solutionCommitment)[] items, uint256 total)'

/**
 * Computes Total Value Locked (TVL) in the BotBountyEscrow smart contract on BOT Chain Mainnet.
 * Resolves the historical block before reading native $BOT balance (mapped 1:1 to WBOT)
 * and sums all active ERC-20 settlement token balances held in escrow.
 *
 * @param {import('@defillama/sdk').ChainApi} api - DeFiLlama ChainApi instance for BOT Chain (`bot`)
 * @returns {Promise<object>} Token balances locked in `BotBountyEscrow`
 */
async function tvl(api) {
  const block = await api.getBlock()

  // Price native $BOT 1:1 via WBOT (bot:0x000...000 is not yet indexed in coins.llama.fi)
  const nativeBalance = await sdk.api.eth.getBalance({
    target: BOTBOUNTY_ESCROW,
    block,
    chain: api.chain,
  })
  api.add(ADDRESSES.bot.WBOT, nativeBalance.output)

  const erc20Tokens = new Set([ADDRESSES.bot.USDT])

  const count = Number(
    await api.call({
      target: BOTBOUNTY_ESCROW,
      abi: GET_BOUNTY_COUNT_ABI,
    })
  )

  const pageSize = 100
  for (let offset = 0; offset < count; offset += pageSize) {
    const res = await api.call({
      target: BOTBOUNTY_ESCROW,
      abi: GET_BOUNTIES_ABI,
      params: [offset, pageSize],
    })
    const items = res.items || res[0] || []
    for (const bounty of items) {
      if (
        bounty.settlementToken &&
        bounty.settlementToken.toLowerCase() !== ADDRESSES.null
      ) {
        erc20Tokens.add(bounty.settlementToken)
      }
    }
  }

  return sumTokens2({
    api,
    owner: BOTBOUNTY_ESCROW,
    tokens: Array.from(erc20Tokens),
  })
}

module.exports = {
  methodology:
    'Counts native $BOT and supported ERC-20 tokens locked in the non-custodial BotBountyEscrow smart contract on BOT Chain Mainnet.',
  start: '2026-11-06', // Block 29300545 (2026-11-06T10:10:48Z)
  bot: {
    tvl,
  },
}
