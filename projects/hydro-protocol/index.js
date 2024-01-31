const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");

const autocompoundContract = 'inj1mjcg8a73904rj4w7t5qkgn0apua98n059nufma'
async function tvl(_, _1, _2, { api }) {
  const { total_supply } = await queryContract({ chain: api.chain, contract: "inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc", data: { token_info: {} } })
  api.add(ADDRESSES.injective.INJ, total_supply)
}

module.exports = {
  methodology: "Liquidity on hydro-protocol",
  injective: {
    tvl,
  },
};