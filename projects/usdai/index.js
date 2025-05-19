const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const USDAI_CONTRACT = "0x0A1a1A107E45b7Ced86833863f482BC5f4ed82EF";
const STAKED_USDAI_CONTRACT = "0x0B2b2B2076d95dda7817e785989fE353fe955ef9";
const PROTOCOL_CONTRACTS = [USDAI_CONTRACT, STAKED_USDAI_CONTRACT];
const WRAPPED_M_CONTRACT = "0x437cc33344a0B27A429f795ff6B469C72698B291";
const MAX_UINT_128 = "0xffffffffffffffffffffffffffffffff";

async function tvl(api) {
  // Get all pools engaged by the protocol
  const pools = await api.call({
    target: STAKED_USDAI_CONTRACT,
    abi: abi.pools,
  });
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools });
  const ct = await api.multiCall({ abi: abi.collateralToken, calls: pools });

  // Pool deposit tokens and collateral tokens
  const ownerTokens = pools.map((pool, i) => [[tokens[i], ct[i]], pool]);
  ownerTokens.push(...PROTOCOL_CONTRACTS.map(contract => [[WRAPPED_M_CONTRACT], contract]));
  await sumTokens2({ api, ownerTokens, permitFailure: true });

  // Immediately claimable wrapped M tokens
  const claimableWrappedM = await api.call({
    target: STAKED_USDAI_CONTRACT,
    abi: abi.claimableBaseYield // return value is scaled up by 10^12
  }) / 10 ** 12; // scale down by 10^12 to match the decimals of the wrapped M token

  // Add claimable USDai
  api.add(WRAPPED_M_CONTRACT, claimableWrappedM)
}

async function borrowed(api) {
  // Get all pools engaged by the protocol
  const pools = await api.call({
    target: STAKED_USDAI_CONTRACT,
    abi: abi.pools,
  });
  const tokens = await api.multiCall({ abi: abi.currencyToken, calls: pools });
  const tokenDecimals = await api.multiCall({
    abi: "erc20:decimals",
    calls: tokens.map((token) => ({ target: token })),
  });

  // Get the decimals of each token
  const decimalsMap = {};
  tokens.forEach((token, index) => {
    decimalsMap[token] = tokenDecimals[index];
  });

  // Get the borrowed value of each pool
  const poolsBorrowedValue = (
    await api.multiCall({
      abi: abi.liquidityNodes,
      calls: pools.map((pool) => ({
        target: pool,
        params: [0, MAX_UINT_128],
      })),
    })
  ).map((liquidityNodes, poolIndex) => {
    const token = tokens[poolIndex];
    const decimals = decimalsMap[token];
    const scalingFactor = 10 ** (18 - decimals);

    return liquidityNodes.reduce((partialSum, node) => {
      const scaledValue = (+node.value - +node.available) / scalingFactor;
      return partialSum + scaledValue;
    }, 0);
  });

  // Add the borrowed value of each pool
  api.addTokens(tokens, poolsBorrowedValue);
}

module.exports = {
  arbitrum: {
    tvl,
    borrowed,
  },
  methodology:
    "TVL is calculated by summing the value of tokens held by the protocol and outstanding immediately claimable yield.",
};
