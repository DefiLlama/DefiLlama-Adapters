const sdk = require("@defillama/sdk");
const abiCellarAave = require("./cellar-aave.json");

const CELLAR_AAVE = "0x7bad5df5e11151dc5ee1a648800057c5c934c0d5";
const chain = "ethereum";

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  // TVL for the AAVE Cellar is the sum of:
  // totalAssets (assets invested into aave)
  // totalHoldings (assets deposited into the strategy but uninvested)
  // maxLocked (yield waiting to be distributed and reinvested)
  const totalAssets = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.totalAssets,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  const totalHoldings = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.totalHoldings,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  const maxLocked = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.maxLocked,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  // Asset is the underlying ERC20 the cellar is invested in and is accepted for deposit
  // This can change as the cellar chases the AAVE pool with the highest yield
  const assetAddress = (
    await sdk.api.abi.call({
      chain,
      abi: abiCellarAave.asset,
      target: CELLAR_AAVE,
      block: chainBlocks[chain],
    })
  ).output;

  // Sum up total assets, holdings, and locked yield
  sdk.util.sumSingleBalance(balances, `${chain}:${assetAddress}`, totalAssets);
  sdk.util.sumSingleBalance(
    balances,
    `${chain}:${assetAddress}`,
    totalHoldings
  );
  sdk.util.sumSingleBalance(balances, `${chain}:${assetAddress}`, maxLocked);

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "TVL is calculated as the sum of deposits invested into the strategy, deposits waiting to be invested, and yield waiting to be reinvested or redistributed.",
  start: 1656652494,
  [chain]: { tvl },
};
