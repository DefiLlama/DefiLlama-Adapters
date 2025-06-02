const { sumTokens } = require("../helper/chain/cosmos");
const { getConfig } = require("../helper/cache");
const { queryContract, queryV1Beta1 } = require("../helper/chain/cosmos");

async function tvl(api) {
  const contracts = await getConfig(
    "kujira/contracts",
    "https://raw.githubusercontent.com/Team-Kujira/kujira.js/master/src/resources/contracts.json"
  );
  const orcaContracts = contracts["kaiyo-1"].orca;
  for (const contract of orcaContracts) {
    const denom = contract.config.bid_denom;
    const { balance } = await queryV1Beta1({
      chain: "kujira",
      url: `/bank/v1beta1/balances/${
        contract.address
      }/by_denom?denom=${encodeURIComponent(denom)}`,
    });
    const vault = denom.match(/factory\/([a-z0-9]+)\/urcpt/)?.at(1);
    if (vault) {
      const { denom } = await queryContract({
        contract: vault,
        chain: "kujira",
        data: { config: {} },
      });
      const { deposit_redemption_ratio } = await queryContract({
        contract: vault,
        chain: "kujira",
        data: { status: {} },
      });

      api.add(denom, balance.amount * deposit_redemption_ratio);
    } else {
      api.add(denom, balance.amount);
    }
  }
  return api.getBalances();
}

module.exports = {
  hallmarks: [
    [1673740800, "TVL separated into products"]
  ],
  kujira: {
    tvl,
  },
}
