const { get } = require('../helper/http')
module.exports = {
  misrepresentedTokens: true,
  radixdlt: { tvl },
  timetravel: false,
}

async function tvl(api) {
  const { tvl_usd } = await get('https://api.justlock.io/tvl_by_types')
  api.addUSDValue(tvl_usd["FungibleResource-NativePoolUnit"])
  api.addUSDValue(tvl_usd["NonFungibleResource-PrecisionPool"])
  api.addUSDValue(tvl_usd["NonFungibleResource-QuantaSwap"])
}