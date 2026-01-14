const { sumTokens2 } = require('../helper/unwrapLPs');
const { sumTokens2: sumTokensSolana } = require('../helper/solana');
const { getLogs2 } = require('../helper/cache/getLogs')

const OLP_VAULT = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';
const POOL_FACTORY = '0x0F820B9afC270d658a9fD7D16B1Bdc45b70f074C'

async function tvl({ api }) {
  const logs = await getLogs2({
    api,
    target: POOL_FACTORY,
    eventAbi: 'event PoolCreated(address indexed creatorAddress, address[] otherAddresses, uint128 indexed poolUuid, address pool, uint128 rfqUuid, uint128 parentQuoteUuid, address feePaidBy, uint256 feeAmount)',
    fromBlock: 300692000,
  })

  const pools = logs.map(log => log.pool)

  await sumTokens2({
    api,
    owners: [...pools, OLP_VAULT],
    token: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
  })
}

module.exports = {
  start: 1722470400, // Aug 2024 mainnet launch
  methodology: `TVL counts USDC held in Variational's Core OLP Vault, and pools created by the factory`,
  arbitrum: { tvl },
  solana: { tvl: async () => sumTokensSolana({ owner: '7TqJDVSiterQsyFnJ4cgEFGKMk1TCWCc9Az9UtHcK575'})},
};