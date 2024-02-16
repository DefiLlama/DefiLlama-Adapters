const { ethers } = require("ethers");
const abis = require("./abis");

const vaultTypes = {
  amm: 1,
  stargate: 2,
};

const typesDataInterfaces = {
  any: ["uint256"], // has only vaultType
  [vaultTypes.amm]: ["uint256", "address"], // vaultType, v3 pool address
  [vaultTypes.stargate]: ["uint256"], // vaultType
};

const getVaults = async (api, vaultRegistry) => {
  const vaultsInfo = await api.call({
    target: vaultRegistry,
    abi: abis.getVaults,
  });

  const vaults = {
    [vaultTypes.amm]: [],
    [vaultTypes.stargate]: [],
  };

  const decoder = ethers.AbiCoder.defaultAbiCoder();

  vaultsInfo.map((vault) => {
    const [vaultTypeBN] = decoder.decode(typesDataInterfaces.any, vault.data);
    const vaultType = Number(vaultTypeBN.toString());

    switch (vaultType) {
      case vaultTypes.amm:
        const [, v3Pool] = decoder.decode(
          typesDataInterfaces[vaultType],
          vault.data
        );

        vaults[vaultType].push({
          vault: vault.vault,
          v3Pool,
        });
        break;
      case vaultTypes.stargate:
        vaults[vaultType].push({
          vault: vault.vault,
        });
        break;
      default:
        break;
    }
  });

  return vaults;
};

const getStargateVaultsValues = async (api, vaults) => {
  if (vaults.length === 0) return;

  const vaultAddresses = vaults.map((v) => v.vault);
  const tokens = await api.multiCall({
    calls: vaultAddresses,
    abi: abis.depositToken,
  });
  const balances = await api.multiCall({
    calls: vaultAddresses,
    abi: abis.totalTokens,
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
    abi: abis.token0,
  });
  const tokens1 = await api.multiCall({
    calls: v3Pools,
    abi: abis.token1,
  });

  const totalAmounts = await api.multiCall({
    calls: vaultAddresses,
    abi: abis.getTotalAmounts,
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

module.exports = {
  getVaults,
  getAmmVaultsValues,
  getStargateVaultsValues,
  vaultTypes,
  typesDataInterfaces,
};
