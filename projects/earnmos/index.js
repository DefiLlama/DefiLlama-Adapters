const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");

const { getChainTransform, getFixBalances } = require("../helper/portedTokens");
const { unwrapLPsAuto } = require("../helper/unwrapLPs");
const { fetchURL } = require("../helper/utils");

const abi = require("../agora/abi.json");

const chain = "evmos";

module.exports = {
  evmos: {
    tvl: async (ts, _block, { evmos: block }) => {
      const balances = {};
      const transform = await getChainTransform(chain);

      const res = await fetchURL("https://app.earnmos.fi/api/defi-config.json");

      const vaults = res?.data?.vaults || [];
      const stakeVaults = res?.data?.stakeVaults || [];

      const vaultsCalls = vaults.map(i => ({ target: i }));
      const stakeVaultCalls = stakeVaults.map(({address}) => ({ target: address }));
      const stakeVaultMap = stakeVaults.reduce((agg, {address, vaultAddress}) => ({...agg, [address]: vaultAddress}), {});

      const calls = [...vaultsCalls, ...stakeVaultCalls];
      let { output: sharePrice } = await sdk.api.abi.multiCall({ calls, abi: abi.balance, block, chain });

      let { output: underlying } = await sdk.api.abi.multiCall({ calls: vaultsCalls, abi: abi.want, block, chain });

      const turnToMap = (agg, { input, output }) => ({ ...agg, [input.target]: output });
      sharePrice = sharePrice.reduce(turnToMap, {});
      underlying = underlying.reduce(turnToMap, {});

      Object.keys(sharePrice).forEach(key => {
        const balance = BigNumber(sharePrice[key]).toFixed(0);
        sdk.util.sumSingleBalance(balances, transform(underlying[key] || underlying[stakeVaultMap[key]]), balance);
      });
      await unwrapLPsAuto({ balances, block, chain });
      const fixBalances = await getFixBalances(chain);
      fixBalances(balances);
      return balances;
    }
  }
}
