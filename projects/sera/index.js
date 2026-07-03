const { getLogs } = require('../helper/cache/getLogs')

const VAULT = '0xC7d4Fd2638e6630C8C61329878676b88A8A24D43'
// Sera.sol, the orderbook contract that holds TRADER_ROLE on the Vault and manages the token whitelist
const SERA = '0xB5C50C5D5f038404F85970b7f5B7259C4AC0E198'
const fromBlock = 24993377

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: SERA,
    eventAbi: 'event WhitelistedTokenModified(address indexed token, bool isWhitelisted, uint256 minAmount)',
    onlyArgs: true,
    fromBlock,
  })
  const whitelistStatus = {}
  for (const { token, isWhitelisted } of logs) whitelistStatus[token] = isWhitelisted
  const tokens = Object.keys(whitelistStatus).filter(token => whitelistStatus[token])
  return api.sumTokens({ owner: VAULT, tokens })
}

module.exports = {
  methodology:
    'TVL is the balance of each ERC20 token held on-chain by the Sera Vault contract (0xC7d4Fd2638e6630C8C61329878676b88A8A24D43) on Ethereum. The token set is discovered from the Sera contract\'s WhitelistedTokenModified events (only emitted when the token whitelist is updated by an admin) and each balance is read via balanceOf.',
  start: '2026-05-02',
  ethereum: {
    tvl,
  },
}
