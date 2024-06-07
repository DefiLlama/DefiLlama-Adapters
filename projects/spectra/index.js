const { getLogs } = require("../helper/cache/getLogs");
const abi = require("./abi.json");
const config = require("./config.json");
const sdk = require("@defillama/sdk");

module.exports = {
  methodology: `All deposited underlying in Spectra Principal Tokens and all underlying supplied as liquidity in Spectra Markets`,
};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const marketData = await getMarkets(api);
      const marketBatchCalls = marketData.map((market) => ({
        target: market[0],
        params: 0,
        abi: abi.markets.balances,
      }));

      const pts = await getPTs(api);
      const ptIBTCalls = pts.map((pt) => ({
        target: pt,
        abi: abi.pt.getIBT,
      }));

      const [ibtsInMarket, ptIbts] = await Promise.all([
        api.batchCall(marketBatchCalls),
        api.batchCall(ptIBTCalls),
      ]);

      const ptIBTBalanceCalls = ptIbts.map((ibt, i) => ({
        target: ibt,
        params: pts[i],
        abi: abi.pt.balanceOf,
      }));
      const ibtBalances = await api.batchCall(ptIBTBalanceCalls);

      const poolIBTBalances = marketData.reduce((acc, market, i) => {
        const ibt = market[1];
        const balance = sdk.util.convertToBigInt(ibtsInMarket[i]);
        acc[ibt] = (acc[ibt] || 0n) + balance;
        return acc;
      }, {});

      const ptIBTBalances = ptIbts.reduce((acc, ibt, i) => {
        const balance = sdk.util.convertToBigInt(ibtBalances[i]);
        acc[ibt] = (acc[ibt] || 0n) + balance;
        return acc;
      }, {});

      const allIBTBalances = { ...poolIBTBalances };
      for (const [ibt, balance] of Object.entries(ptIBTBalances)) {
        allIBTBalances[ibt] = (allIBTBalances[ibt] || 0n) + balance;
      }

      const assetCalls = Object.keys(allIBTBalances).map((ibt) => ({
        target: ibt,
        abi: abi.vault.asset,
      }));

      const assetBalanceCalls = Object.entries(allIBTBalances).map(
        ([ibt, balance]) => ({
          target: ibt,
          params: balance,
          abi: abi.vault.convertToAsset,
        })
      );

      const [assets, assetBalances] = await Promise.all([
        api.batchCall(assetCalls),
        api.batchCall(assetBalanceCalls),
      ]);

      const assetsWithBalances = assets.map((asset, i) => [
        asset,
        sdk.util.convertToBigInt(assetBalances[i]),
      ]);

      assetsWithBalances.forEach(([asset, balance]) => {
        api.add(asset, balance);
      });

      return api.getBalances();
    },
  };

  async function getMarkets(api) {
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi:
        "event CurvePoolDeployed(address indexed poolAddress, address indexed ibt, address indexed pt)",
      onlyArgs: true,
      fromBlock: fromBlock,
    });
    return logs.map((i) => [i.poolAddress, i.ibt]);
  }

  async function getPTs(api) {
    const logs = await getLogs({
      api,
      target: factory,
      eventAbi:
        "event PTDeployed(address indexed pt, address indexed poolCreator)",
      onlyArgs: true,
      fromBlock: fromBlock,
    });
    return logs.map((i) => i.pt);
  }
});
