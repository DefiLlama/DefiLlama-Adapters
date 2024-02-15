const config = {
  bsc: {
    vaults: {
      amm: [
        {
          vault: "0xEEea7dD3c998aFd9f298C041E4AA8A3c41b02A6C",
          v3Pool: "0x92b7807bF19b7DDdf89b706143896d05228f3121", // Pancake V3 Pool Usdt/Usdc
        },
      ],
      stargate: [
        {
          vault: "0xfAcd8A564Db63A984Cc7E98B04388E297bB29CF2",
        },
      ],
    },
  },

  linea: {
    vaults: {
      amm: [
        {
          vault: "0xEEea7dD3c998aFd9f298C041E4AA8A3c41b02A6C",
          v3Pool: "0x6a72F4F191720c411Cd1fF6A5EA8DeDEC3A64771", // Pancake V3 Pool Usdce/Usdt
          type: "amm",
        },
      ],
    },
  },
};

const getStargateVaultsValues = async (api, vaults) => {
  if (vaults.length === 0) return;

  const vaultAddresses = vaults.map((v) => v.vault);
  const tokens = await api.multiCall({
    calls: vaultAddresses,
    abi: "address:depositToken",
  });
  const balances = await api.multiCall({
    calls: vaultAddresses,
    abi: "uint256:totalTokens",
  });

  api.addTokens(tokens, balances);
};

const getAmmVaultsValues = async (api, vaults) => {
  if (vaults.length === 0) return;

  const vaultAddresses = [];
  const v3Pools = [];
  vaults.map(({ vault, v3Pool }) => {
    vaultAddresses.push(vault);
    v3Pools.push(v3Pool);
  });

  const tokens0 = await api.multiCall({
    calls: v3Pools,
    abi: "address:token0",
  });
  const tokens1 = await api.multiCall({
    calls: v3Pools,
    abi: "address:token1",
  });

  const totalAmounts = await api.multiCall({
    calls: vaultAddresses,
    abi: "function getTotalAmounts() public view returns (uint256 total0, uint256 total1, uint128 liquidity)",
  });

  const tokens = [];
  const balances = [];

  for (let i = 0; i < vaults.length; i++) {
    const token0 = tokens0[i];
    const token1 = tokens1[i];
    const [amount0, amount1] = totalAmounts[i];

    tokens.push(token0, token1);
    balances.push(amount0, amount1);
  }

  api.addTokens(tokens, balances);
};

const aggregateVaultsTvl = async (api) => {
  const { vaults } = config[api.chain];

  await Promise.all(
    Object.keys(vaults).map(async (type) => {
      switch (type) {
        case "amm":
          await getAmmVaultsValues(api, vaults[type]);
          break;
        case "stargate":
          await getStargateVaultsValues(api, vaults[type]);
          break;
        default:
          break;
      }
    })
  );
};

const tvl = async (_, _b, _cb, { api }) => {
  await aggregateVaultsTvl(api);
  return api.getBalances();
};

module.exports = {
  methodology:
    "Clip Finance TVL is achieved by summing total values of assets deposited in other protocols through our vaults and vaults balances.",
  doublecounted: true,
  start: 1697627757, // (Oct-18-2023 11:15:57 AM +UTC) deployed on the BSC network
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl,
  };
});
