const { queryContract, } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");

const hinj = "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc"
const autoCompound = "inj1mjcg8a73904rj4w7t5qkgn0apua98n059nufma"
const xhdro = "inj1qc2tw477wwuvkad0h3g78xqgwx4k8knat6vz0h"

async function staking(api) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: xhdro, data: { token_info: {} } })

  return {
    'hydro-protocol-2': total_supply / 1e6
  }
}

async function tvl(api) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: hinj, data: { token_info: {} } })
  const { total_bonded } = await queryContract({ chain: api.chain, contract: autoCompound, data: { state: {} } })

  api.add(
    ADDRESSES.injective.INJ, +total_supply + +total_bonded
  )
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
    staking,
  },
};