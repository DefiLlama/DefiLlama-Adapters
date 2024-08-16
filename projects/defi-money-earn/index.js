const abi = {
  stakeToken: "function STAKE_TOKEN() view returns (address)",
};

const config = {
  optimism: {
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

const getLPTokens = async (api, stakingContracts) => {
  const stakeTokens = await api.multiCall({
    calls: stakingContracts.map((address) => ({ target: address })),
    abi: abi.stakeToken,
  });
  return stakingContracts.map((contract, index) => ({ contract, token: stakeTokens[index],
  }));
};

const getLPBalances = async (api, stakingLPs) => {
  const calls = stakingLPs.map(({ contract }) => ({ target: contract }));
  const totalSupplies = await api.multiCall({ calls, abi: "erc20:totalSupply" });
  stakingLPs.forEach(({ token }, index) => {
    const totalSupply = totalSupplies[index];
    api.add(token, totalSupply);
  });
};

const getTvl = async (api, stakingLPs, MONEY) => {
  const stakingWithLP = await getLPTokens(api, stakingLPs);
  await getLPBalances(api, stakingWithLP);
  api.removeTokenBalance(MONEY);
};

Object.keys(config).forEach((chain) => {
  const { stakeLPs, MONEY } = config[chain];
  module.exports[chain] = {
    doublecounted: true,
    methodology: "TVL corresponds to the LPs staked in the protocol to earn yield.",
    tvl: (api) => getTvl(api, stakeLPs, MONEY),
  };
});
