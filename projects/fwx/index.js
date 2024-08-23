const { getLogs2 } = require('../helper/cache/getLogs')
const { getConfig } = require('../helper/cache')

const xliplessDex = "0x82E90fB94fd9a5C19Bf38648DD2C9639Bde67c74"

module.exports = {
  avax: {
    tvl,
  },
}

async function tvl(api) {
  const { assets } = await getConfig('fwx/'+api.chain, "https://app.fwx.finance/api/v2/assets?chain_id=43114")

  let tokensAndOwners = [];
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i]
    tokensAndOwners.push(
      [asset.token_address, asset.pool_address],
      [asset.token_address, asset.core_address],
      [asset.token_address, xliplessDex],
    );
  }

  const FACTORY_SUB_MODULE_PROXY = '0x54b048eB204B7CbBb469901fdb5BbfB80d0F0CD1'
  const logs = await getLogs2({
    api,
    factory: FACTORY_SUB_MODULE_PROXY,
    eventAbi: "event CreateMarket(address indexed creator, address core, address collateralPool, address collateralToken, address underlyingPool, address underlyingToken, bytes32 pairbytes)",
    fromBlock: 46125548,
  })
  logs.forEach(i => {
    tokensAndOwners.push([i.collateralToken, i.collateralPool])
    tokensAndOwners.push([i.underlyingToken, i.underlyingPool])
  })
  return api.sumTokens({ tokensAndOwners })
}
