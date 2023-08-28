const sdk = require("@defillama/sdk");
const { sumTokens2 } = require("../helper/unwrapLPs.js");
const abi = require("./abi.json");

const { getV2CAs, getV1CAs } = require("./events");

const addressProvider = "0xcf64698aff7e5f27a11dff868af228653ba53be0";
//// Gearbox TVL
/// Sum of 2 Sources:
/// 1. Pool TVL                  - Derived using availableLiquidity()
/// 2. Credit Account v1 & v2    - Derived by getting balances on all open Credit Accounts

const getPoolAddrs = async (block) => {
  // Get contractsRegister from Gearbox addressProvider
  const { output: contractsRegister } = await sdk.api.abi.call({
    abi: abi["getContractsRegister"],
    target: addressProvider,
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

  let poolBalances = {};
  return { tokensAndOwners, poolBalances };
};

const getCreditManagers = async (block) => {
  // Get DataCompressor from Gearbox addressProvider
  const { output: DataCompressor } = await sdk.api.abi.call({
    abi: abi["getDataCompressor"],
    target: addressProvider,
    block,
  });
  // Get gearbox pools from the contractsRegister, and underlyingToken for each pool
  const { output: creditManagers } = await sdk.api.abi.call({
    abi: abi["getCreditManagersList"],
    target: DataCompressor,
    block,
  });

  return creditManagers;
};

const getV2TVL = async (block) => {
  // Get Current CMs
  const creditManagers = (await getCreditManagers(block)).filter(
    (cm) => cm.version != 1
  );
  // Silently throw if no V2 CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map((cm) => getV2CAs(cm.addr, block))
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
};

const getV1TVL = async (block) => {
  // Get Current CMs
  const creditManagers = (await getCreditManagers(block)).filter(
    (cm) => cm.version != 2
  );

  // Silently throw if no V2 CAs available
  if (!creditManagers[0]) return [];

  // Get all CA Balances
  const caValues = await Promise.all(
    creditManagers.map((cm) => getV1CAs(cm.addr, block))
  );

  return creditManagers.map((cm, i) => ({
    addr: cm.addr,
    token: cm.underlying,
    bal: caValues[i],
  }));
};

const tvl = async (timestamp, block) => {
  // Pool TVL (Current token balances)
  const { poolBalances, tokensAndOwners } = await getPoolAddrs(block);
  // V1 CreditAccounts TVL
  const v1Balances = await getV1TVL(block);

  // V2 CreditAccounts TVL in USD
  const v2Balances = await getV2TVL(block);

  // Merge all balances for each token
  [...v1Balances, ...v2Balances].forEach((i) => {
    sdk.util.sumSingleBalance(poolBalances, i.token, i.bal);
    tokensAndOwners.push([i.token, i.addr]);
  });

  return sumTokens2({
    balances: poolBalances,
    tokensAndOwners,
    block,
  });
};

module.exports = {
  hallmarks: [[1666569600, "LM begins"]],
  ethereum: {
    tvl,
  },
  methodology: `Retrieves the tokens in each Gearbox pool (WETH/DAI/WBTC/USDC/wstETH) & value of all Credit Accounts (V1 & V2) denominated in the underlying token.`,
  misrepresentedTokens: true,
};