const abi = {
  markets: "function get_all_markets() view returns (address[] memory)",
  coll: "function get_all_collaterals() view returns (address[] memory)",
  stakeToken: "function STAKE_TOKEN() view returns (address)",
  state: `function get_market_states(address[] markets) view returns (
    (uint256 total_debt, uint256 total_coll, uint256 debt_ceiling, uint256 remaining_mintable, uint256 oracle_price, uint256 current_rate, uint256 pending_rate)[]
)`,
};

const config = {
  optimism: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    viewer: "0x4459FF9D7FE90FD550c0b9d39E00b4f18b13A0Ab",
    MONEY: "0x7e803F4edd6528caFBf5C5d03Cc106b04379C24b",
    stakeLPs: [
      "0x7e803F4edd6528caFBf5C5d03Cc106b04379C24b", // MONEY
      "0xE8f00491afa68B4A653C77e5f92DBA0F8df3a185", // crvUSD/MONEY
      "0xa398a48C2738fd6c79F5654823Fb93456B0fDaF6", // USDT/MONEY
      "0x36afCD1083eE9186A2b984E10d75C1E14b99B75e", // USDC/MONEY
      "0xcf38a66DeD7825cfEF66046c256Aa0EDbd41BEf5", // DAI/MONEY
      "0x73C3eC2b8e00929824a529e60fb6ed8aF193c7cc", // FRAX/MONEY
    ],
  },
  arbitrum: {
    controller: "0x1337F001E280420EcCe9E7B934Fa07D67fdb62CD",
    viewer: "0x45D92BF29f1b5B0e7eb0640D6230Fae488311845",
    MONEY: "0xEbE54BEE7A397919C53850bA68E126b0A6b295ed",
    stakeLPs: [
      "0xEbE54BEE7A397919C53850bA68E126b0A6b295ed", // MONEY
      "0xF2852d7e810d3EC7094bFE1D7DDCa5044c259c25", // crvUSD/MONEY
      "0x6e59b326984fC132F16a977cd20E38641A9043De", // USDT/MONEY
      "0xdE718A791226c93B53C77D60E5D4693C05a31422", // USDC/MONEY
      "0xE3763d545707F435e21eeBbe75070495c806B744", // DAI/MONEY
      "0x07aDF588508b923B8eA0389d27b61b9CB8a197Cb", // FRAX/MONEY
    ],
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
  const states = await api.call({ target: viewer, params: [markets], abi: abi.state });
  vaults.forEach(({ coll }, index) => {
    const totalSupply = states[index].total_coll;
    api.add(coll, totalSupply);
  });
};

const getLPTokens = async (api, stakingContracts) => {
  const stakeTokens = await api.multiCall({ calls: stakingContracts.map((address) => ({ target: address })), abi: abi.stakeToken });
  return stakingContracts.map((contract, index) => ({ contract, token: stakeTokens[index] }));
};

const getLPBalances = async (api, stakingWithTokens) => {
  const calls = stakingWithTokens.map(({ contract }) => ({ target: contract }));
  const totalSupplies = await api.multiCall({ calls, abi: "erc20:totalSupply" });
  stakingWithTokens.forEach(({ token }, index) => {
    const totalSupply = totalSupplies[index];
    api.add(token, totalSupply);
  });
};

const getTvl = async (api, controller, viewer, stakingContracts, MONEY) => {
  const vaults = await getVaults(api, controller);
  await getVaultsBalances(api, viewer, vaults);

  const stakingWithTokens = await getLPTokens(api, stakingContracts);
  await getLPBalances(api, stakingWithTokens);
  api.removeTokenBalance(MONEY);
};

Object.keys(config).forEach((chain) => {
  const { controller, viewer, stakeLPs, MONEY } = config[chain];
  module.exports[chain] = {
    methodology:
      "TVL corresponds to the collateral deposited in the markets and the LPs used for yield",
    tvl: (api) => getTvl(api, controller, viewer, stakeLPs, MONEY),
  };
});
