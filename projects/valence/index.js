const { queryContract, queryV1Beta1 } = require("../helper/chain/cosmos");
const { transformBalances } = require("../helper/portedTokens");
//Staked indicates if the asset is staked by the pooler.
//If so, we must query the pool address for the balance to determine the value. If not staked, we can lookup the balance directly.
const poolerAddresses = [
  {
    address: "neutron1ulaxj0nelxshdua6l5mdkcqxa5k3gvcc8ut9w5867ej7u80qjx9s5cq5yh", //stars
    staked: true,
  },
  {
    address: "neutron1quwzg6ntuy2tvvdt73rr4e8zkeetu2v5mehjfykrzszlkjavupvsn98wx9", //shade
    staked: true,
  },
  {
    address: "neutron1nqd6ge2r9ndkgkl67js35v6wln093euvvkyynr43fs4lghj7vzgsl4va57", //nolus
    staked: true,
  },
  {
    address: "neutron1yj6m02det6qd6wdugtfytfryzcmt9z9apls0sf4ww07hqq54zexqt5xgaq", //mars
    staked: false,
  },
];

async function tvl(api) {
  for (const pooler of poolerAddresses) {
    let lpBalance;
    let poolAddress;

    const lpConfig = await queryContract({
      contract: pooler.address,
      chain: "neutron",
      data: '{"lp_config":{}}',
    });

    poolAddress = lpConfig.pool_address;

    const poolInfo = await queryContract({
      contract: poolAddress,
      chain: "neutron",
      data: '{"pair":{}}',
    });

    // Get LP token balance for staked pooler
    if (pooler.staked) {
      lpBalance = await queryContract({
        contract: poolInfo.liquidity_token,
        chain: "neutron",
        data: `{"balance":{"address":"${pooler.address}"}}`,
      });

      lpBalance = lpBalance.balance || 0;
    } else {
      const balanceData = await queryV1Beta1({
        url: `bank/v1beta1/balances/${pooler.address}`,
        chain: "neutron",
      });
      lpBalance = balanceData.balances.find((balance) => balance.denom === poolInfo.liquidity_token)?.amount || 0;
    }

    const shareValue = await queryContract({
      contract: poolAddress,
      chain: "neutron",
      data: `{"share":{"amount":"${lpBalance}"}}`,
    });

    shareValue.forEach((token) => {
      const denom = token.info.native_token.denom;
      const amount = token.amount;
      api.add(denom, amount);
    });
  }

  return transformBalances("neutron", api.getBalances());
}

module.exports = {
  methodology: "Queries the Covenant Liquidity Pooler Addresses to sum up total held value.",
  neutron: {
    tvl,
  },
};
