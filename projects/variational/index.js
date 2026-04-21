const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { sumTokens2: sumTokensSolana } = require('../helper/solana');
const { getLogs2 } = require('../helper/cache/getLogs')

const OLP_VAULT = '0x74bbbb0e7f0bad6938509dd4b556a39a4db1f2cd';
const POOL_FACTORY = '0x0F820B9afC270d658a9fD7D16B1Bdc45b70f074C';

const SVM_OLP_HEDGING = '7TqJDVSiterQsyFnJ4cgEFGKMk1TCWCc9Az9UtHcK575';
const EVM_OLP_HEDGING = '0x327Aea20163F61421D85B8147781b8676763b467';

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
    owners: [OLP_VAULT, EVM_OLP_HEDGING],
    token: ADDRESSES.null,
  })

  await sumTokens2({
    api,
    owners: [...pools, OLP_VAULT, EVM_OLP_HEDGING],
    token: ADDRESSES.arbitrum.USDC_CIRCLE,
  })
};

module.exports = {
  start: 1738198213, // Jan 30 2025 Mainnet Private Beta Launch
  methodology: `TVL counts tokens held in Variational's Core OLP Vault, Settlement Pools, and OLP hedging wallets`,
  arbitrum: { tvl },
  solana: { tvl: () => sumTokensSolana({ owner: SVM_OLP_HEDGING, solOwners: [SVM_OLP_HEDGING] }) },
};