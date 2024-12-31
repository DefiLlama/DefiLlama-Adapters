const { get } = require('../helper/http')
const { endPoints, } = require('../helper/chain/cosmos');
const { concat } = require("ethers");

const endpoint = endPoints["pryzm"]
const amm_vault_address = "pryzm1y7d08j5uy7kgurnv4pwag8h34m2cgptcwe75wn";
const refractor_vault_address = "pryzm1xtnrr4e6553hap0zuveautjstc3w2sxmf2zph3";

async function tvl(api) {
  const [{ balances: amm_balances }, { balances: refractor_balances }] =
      await Promise.all([
        await get(`${endpoint}/cosmos/bank/v1beta1/balances/${amm_vault_address}?pagination.limit=1000`),
        await get(`${endpoint}/cosmos/bank/v1beta1/balances/${refractor_vault_address}?pagination.limit=1000`)
      ]);

  let all_balances = amm_balances.concat(refractor_balances);
  for (const { denom, amount } of all_balances) {
    if (denom.startsWith("p:") ||
      denom.startsWith("y:") ||
      denom.startsWith("lp:")
    ) {
      continue
    }
    if (denom === 'ibc/B8AF5D92165F35AB31F3FC7C7B444B9D240760FA5D406C49D24862BD0284E395')
      api.addCGToken('terra-luna-2', amount/1e6)
    else
      api.add(denom, amount);
  }
}

module.exports = {
  methodology: "Counts the liquidity on the refractor module and all AMM pools",
  pryzm: {
    tvl
  },
};
