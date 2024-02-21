const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const { getV2CAs, getV1CAs } = require("./events");

const addressProviderV3 = "0x9ea7b04da02a5373317d745c1571c84aad03321d";
//// Gearbox TVL
/// Sum of 2 Sources:
/// 1. Pool TVL                   - Derived using availableLiquidity()
/// 2. Credit Account v1/v2/v3    - Derived by getting balances on all open Credit Accounts

const getPoolAddrs = async (block) => {
  // Get contractsRegister from Gearbox addressProvider. This is backwards compatible v3->v2
  const { output: contractsRegister } = await sdk.api.abi.call({
    abi: abi["getContractsRegister"],
    target: addressProviderV3,
    block,
  });

  // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
  const { output: pools } = await sdk.api.abi.call({
    abi: abi["getPools"],
    target: contractsRegister,
    block,
  });

  const { output: poolsUnderlying } = await sdk.api.abi.multiCall({
    abi: abi["underlyingToken"],
    calls: pools
      .filter((p) => p != "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286") // RM wstETH pool
      .map((pool) => ({ target: pool })),
    block,
  });
  const tokensAndOwners = poolsUnderlying.map((t) => [
    t.output,
    t.input.target,
  ]);

  return { tokensAndOwners };
};

const getCreditManagersV1 = async (block) => {
  const { output: contractsRegister } = await sdk.api.abi.call({
    abi: abi["getContractsRegister"],
    target: addressProviderV3,
    block,
  });
  // Modern data compressors do not return v1 managers
  const { output: creditManagers } = await sdk.api.abi.call({
    abi: abi["getCreditManagers"],
    target: contractsRegister,
    block,
  });
  const { output: versions } = await sdk.api.abi.multiCall({
    abi: abi["version"],
    calls: creditManagers.map((target) => ({ target })),
    block,
  });
  const v1Managers = [];
  for (let i = 0; i < creditManagers.length; i++) {
    const addr = creditManagers[i];
    const version = versions[i].output;
    if (version === "1") {
      v1Managers.push({ addr });
    }
  }
  const { output: underlyings } = await sdk.api.abi.multiCall({
    abi: abi["underlyingToken"],
    calls: v1Managers.map(({ addr }) => ({ target: addr })),
    block,
  });
  for (let i = 0; i < underlyings.length; i++) {
    v1Managers[i].underlying = underlyings[i].output;
  }
  return v1Managers;
};

const getV1TVL = async (block, api) => {
  const creditManagers = await getCreditManagersV1(block);

  // Silently throw if no V2 CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map((cm) => getV1CAs(cm.addr, block, api))
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
};

const getCreditManagersV210 = async (block) => {
  // Get DataCompressor from Gearbox addressProvider
  const { output: DataCompressor210 } = await sdk.api.abi.call({
    abi: abi["getAddressOrRevert"],
    target: addressProviderV3,
    params: [
      // cast format-bytes32-string "DATA_COMPRESSOR"
      "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
      210,
    ],
    block,
  });
  // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
  const { output: creditManagers } = await sdk.api.abi.call({
    // IDataCompressorV2_10__factory.createInterface().getFunction("getCreditManagersV2List").format(ethers.utils.FormatTypes.full)
    abi: abi["getCreditManagersV2List"],
    target: DataCompressor210,
    block,
  });

  return creditManagers;
};

const getV2TVL = async (block, api) => {
  // Get Current CMs
  const creditManagers = await getCreditManagersV210(block);
  // Silently throw if no V2 CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map((cm) => getV2CAs(cm.addr, block, api))
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
};

const getCreditManagersV3 = async (block) => {
  try {
    // Get DataCompressor V3 from Gearbox addressProvider
    // Currently reverts, because DC V3 is not deployed
    const { output: DataCompressor300 } = await sdk.api.abi.call({
      abi: abi["getAddressOrRevert"],
      target: addressProviderV3,
      params: [
        // cast format-bytes32-string "DATA_COMPRESSOR"
        "0x444154415f434f4d50524553534f520000000000000000000000000000000000",
        300,
      ],
      block,
    });
    // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
    const { output: creditManagers } = await sdk.api.abi.call({
      // IDataCompressorV3_00__factory.createInterface().getFunction("getCreditManagersV3List").format(ethers.utils.FormatTypes.full)
      abi: abi["getCreditManagersV3List"],
      target: DataCompressor300,
      block,
    });

    return creditManagers;
  } catch (e) {
    // console.warn(e);
    return [];
  }
};

const getV3CAs = async (creditManager, block, api) => {
  const caAddrs = await api.call({
    abi: abi["creditAccounts"],
    target: creditManager,
  });

  if (!caAddrs) return "0"

  const totalValue = await api.multiCall({
    // ICreditManagerV3__factory.createInterface().getFunction("calcDebtAndCollateral").format(ethers.utils.FormatTypes.full)
    abi: abi["calcDebtAndCollateral"],
    target: creditManager,
    calls: caAddrs.map((addr) => ({
      target: creditManager,
      params: [addr, 3], // DEBT_COLLATERAL
    })),
    permitFailure: true,
  });

  return totalValue
    .reduce(
      (a, c) => a + BigInt(c?.totalValue ?? '0'),
      BigInt(0)
    )
    .toString();
};

const getV3TVL = async (block, api) => {
  // Get Current CMs
  const creditManagers = await getCreditManagersV3(block);
  // Silently throw if no CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map((cm) => getV3CAs(cm.addr, block, api))
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
};

const tvl = async (timestamp, block, _, { api }) => {
  // Pool TVL (Current token balances)
  const { tokensAndOwners } = await getPoolAddrs(block);

  // CreditAccounts TVL
  const v1Balances = await getV1TVL(block, api);
  const v2Balances = await getV2TVL(block, api);
  const v3Balances = await getV3TVL(block, api);

  // Merge all balances for each token
  [v1Balances, v2Balances, v3Balances].flat().forEach((i) => {
    api.add(i.token, i.bal);
    tokensAndOwners.push([i.token, i.addr]);
  });

  return api.sumTokens({ tokensAndOwners });
};

module.exports = {
  hallmarks: [[1666569600, "LM begins"]],
  ethereum: {
    tvl,
  },
  methodology: `Retrieves the tokens in each Gearbox pool (WETH/DAI/WBTC/USDC/wstETH) & value of all Credit Accounts (V1/V2/V3) denominated in the underlying token.`,
  misrepresentedTokens: true,
};
