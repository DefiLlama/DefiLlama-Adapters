const abi = {
  markets: "function get_all_markets() view returns (address[] memory)",
  coll: "function get_all_collaterals() view returns (address[] memory)",
  state: `function get_market_states(address[] markets) view returns (
    (uint256 total_debt, uint256 total_coll, uint256 debt_ceiling, uint256 remaining_mintable, uint256 oracle_price, uint256 current_rate, uint256 pending_rate)[]
)`,
};

const config = {
  optimism: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    viewer: "0x4459FF9D7FE90FD550c0b9d39E00b4f18b13A0Ab",
  },
  arbitrum: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    viewer: "0x45D92BF29f1b5B0e7eb0640D6230Fae488311845",
  },
};

const getVaults = async (api, controller) => {
  const [colls, markets] = await Promise.all([
    api.call({ target: controller, abi: abi.coll }),
    api.call({ target: controller, abi: abi.markets }),
  ]);

  return colls.map((coll, index) => {
    const market = markets[index];
    return { coll, market };
  });
};

const getVaultsBalances = async (api, viewer, vaults) => {
  const markets = vaults.map(({ market }) => market);
  const states = await api.call({ target: viewer, params: [markets], abi: abi.state});
  vaults.forEach(({ coll }, index) => {
    const totalSupply = states[index].total_coll;
    api.add(coll, totalSupply);
  });
};

const getTvl = async (api, controller, viewer) => {
  const vaults = await getVaults(api, controller);
  await getVaultsBalances(api, viewer, vaults);
};

Object.keys(config).forEach((chain) => {
  const { controller, viewer } = config[chain];
  module.exports[chain] = {
    methodology: "TVL corresponds to the collateral deposited in the markets",
    tvl: (api) => getTvl(api, controller, viewer),
  };
});
