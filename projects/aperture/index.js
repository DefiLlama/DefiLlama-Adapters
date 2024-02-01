const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { default: BigNumber } = require("bignumber.js");
const { getVaults } = require("./getVaults.js");

async function avax_tvl(timestamp, _, { avax: block }) {
  const chain = "avax";
  const vaultContracts = await getVaults(chain, block);
  const calls = vaultContracts.map((i) => ({ target: i }));
  const equityETHValues = (
    await sdk.api.abi.multiCall({
      abi: abi.getEquityETHValue,
      calls,
      chain,
      block,
    })
  ).output;

  const vaultLeverage = (
    await sdk.api.abi.multiCall({
      abi: abi.getLeverage,
      calls,
      chain,
      block,
    })
  ).output;

  let balances = {};
  for (let i = 0; i < vaultContracts.length; i++) {
    const bal = (vaultLeverage[i].output * equityETHValues[i].output) / 1e22;
    sdk.util.sumSingleBalance(
      balances,
      `coingecko:avalanche-2`,
      BigNumber(bal).toFixed(0)
    );
  }

  return balances;
}

module.exports = {
  timetravel: false,
  avax: {
    tvl: avax_tvl,
  },
  terra: {
    tvl: () => ({}),
  },
  hallmarks: [[1651881600, "UST depeg"]],
};
