const sdk = require('@defillama/sdk')
const { Provider, Contract } = require('fuels')


let provider
async function getProvider() {
  if (!provider) provider = new Provider(process.env.FUEL_CUSTOM_RPC ?? 'https://mainnet.fuel.network/v1/graphql')
  return provider
}

async function query1({ contractId, abi, method, params = [] }) {

  const contract = new Contract(contractId, abi, await getProvider())
  const { value } = await contract.functions[method](...params).get()
  return value
}

async function main() {

  const api = new sdk.ChainApi({ chain: 'fuel' })
  const balances = await require('../../../o2/api').fuel.tvl(api, query1)

  await sdk.elastic.writeLog('custom-scripts', {
    metadata: {
      type: 'tvl',
    },
    chain: 'fuel',
    project: 'o2',
    balances,
    timestamp: Math.floor(Date.now() / 1000),
  });
}

main().catch((err) => {
  console.error("Error computing o2 TVL:", err);
  process.exit(1);
}).then(() => process.exit(0));