const { getLogs } = require('../helper/cache/getLogs')

const VAULT = '0xC7d4Fd2638e6630C8C61329878676b88A8A24D43'
const fromBlock = 24993377

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: VAULT,
    eventAbi: 'event Deposited(address indexed token, address indexed user, uint256 amount)',
    onlyArgs: true,
    fromBlock,
  })
  const tokens = logs.map(l => l.token)
  return api.sumTokens({ owner: VAULT, tokens })
}

module.exports = {
  methodology:
    'TVL is the balance of each ERC20 token held on-chain by the Sera Vault contract (0xC7d4Fd2638e6630C8C61329878676b88A8A24D43) on Ethereum. The token set is discovered from the Vault\'s Deposited events and each balance is read via balanceOf.',
  start: '2026-05-02',
  ethereum: {
    tvl,
  },
}
