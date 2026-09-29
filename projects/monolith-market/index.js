const { getLogs2 } = require("../helper/cache/getLogs");
const ADDRESSES = require("../helper/coreAssets.json");

const FACTORY = {
  ethereum: { factory: '0x6D961c9DCF1AD73566822BA4B087892e3839B849', fromBlock: 24949282 },
}

const CREATE_DEPLOYMENT_EVENT =
  'event Deployed(address indexed lender, address indexed coin, address indexed vault)';

async function tvl(api) {
  const { factory, fromBlock } = FACTORY[api.chain]
  const logs = await getLogs2({ api, factory, fromBlock, eventAbi: CREATE_DEPLOYMENT_EVENT })
  const lenders = logs.map(l => l.lender)

  const [collaterals, psmVaults] = await Promise.all([
    api.multiCall({ abi: 'address:collateral', calls: lenders }),
    api.multiCall({ abi: 'address:psmVault', calls: lenders, permitFailure: true }),
  ])

  const tokensAndOwners = collaterals.map((c, i) => [c, lenders[i]])
  psmVaults.forEach((v, i) => {
    if (v && v !== ADDRESSES.null) tokensAndOwners.push([v, lenders[i]])
  })

  return api.sumTokens({ tokensAndOwners })
}

module.exports = {
  methodology: 'TVL is the sum of collateral token balances held by each Monolith Market lender, plus PSM reserve balances.',
  ethereum: { tvl },
}
