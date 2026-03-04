const { queryContract: queryContractCosmos } = require("../helper/chain/cosmos");
const { getConfig } = require('../helper/cache');

const URL = "https://blackpanther.fi/mainnet/api/vaults"

const tvl = async (api) => {
  const data = await getConfig('blackpanther/vaults', URL);
  const vaults = data.map((d) => d.vault_address)
  for (const vault of vaults) {
    const { asset } = await queryContractCosmos({ chain: api.chain, contract: vault, data: { total_vault: {} } });
    asset.forEach(({ info, amount }) => {
      api.add(info.native_token.denom, amount)
    })
  }
}

module.exports = {
  timetravel: false,
  injective: { tvl }
}