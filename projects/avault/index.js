const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const { getConfig } = require('../helper/cache')

const { vaultsBase } = require("./avault-vault-utils");
const url = "https://www.avault.network/media/get-vaults.json";
async function tvl(_, _b, chainBlocks) {
  const balances = {};
  const vaultsInfo = (await getConfig('avault', url))
  const chainArr = Object.keys(vaultsInfo);
  const chain = "astar";
  const chainLocal = chain;
  const fixBalances = await getFixBalances(chainLocal);
  const vaultAddressArr = Object.values(vaultsInfo[chainLocal]);
  const transformAddress = await getChainTransform(chainLocal);
  const { wantedLocked, wantedAddresses, vaultName } = await vaultsBase(
    chainLocal,
    vaultAddressArr,
    chainBlocks[chain]
  );

  const lpPositions = [];
  for (let k = 0; k < wantedLocked.length; k++) {
    if (vaultName[k].toLowerCase().endsWith(" lp")) {
      lpPositions.push({
        token: wantedAddresses[k],
        balance: wantedLocked[k],
      });
    } else {
      sdk.util.sumSingleBalance(
        balances,
        `${chainLocal}:${wantedAddresses[k]}`,
        wantedLocked[k]
      );
    }
  }
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks[chainLocal],
    chainLocal,
    transformAddress
  );
  fixBalances(balances);

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "Avault - The Best Yield Aggregator on ASTR Network",
  astar: {
    tvl,
  },
};
