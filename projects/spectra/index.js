const { getLogs } = require("../helper/cache/getLogs");
const sdk = require("@defillama/sdk");

const abi = {
  markets: {
    balances:
      "function balances(uint256 index) external view returns (uint256)",
  },
  pt: {
    getIBT: "function getIBT() external view override returns (address)",
    balanceOf:
      "function balanceOf(address account) external view returns (uint256)",
  },
  vault: {
    convertToAsset:
      "function convertToAssets(uint256 shares) external view returns (uint256 assets)",
    asset: "function asset() external view returns (address assetTokenAddress)",
  },
};

const config = {
  ethereum: {
    factory: "0xae4d5d5199265512B2a77Ad675107735B891aBc8",
    fromBlock: 19727256,
  },
  arbitrum: {
    factory: "0x51100574E1CF11ee9fcC96D70ED146250b0Fdb60",
    fromBlock: 204418891,
  },
};

module.exports = {
  methodology: `All deposited underlying in Spectra Principal Tokens and all underlying supplied as liquidity in Spectra Markets`,
};

Object.keys(config).forEach((chain) => {
  const { factory, fromBlock } = config[chain];
  module.exports[chain] = {
    tvl: async (api) => {
      const marketData = await getMarkets(api);
      const ibtsInMarket = await api.batchCall(
        marketData.map((market) => {
          return {
            target: market[0],
            params: 0,
            abi: abi.markets.balances,
          };
        })
      );
      const marketsIbtsWithBalance = marketData.map((market, i) => [
        market[1],
        ibtsInMarket[i],
      ]);

      const poolIBTBalances = marketsIbtsWithBalance.reduce(
        (acc, [ibt, balance]) => {
          if (acc[ibt] === undefined) {
            acc[ibt] = BigInt(0);
          }
          acc[ibt] += sdk.util.convertToBigInt(balance);
          return acc;
        },
        {}
      );

      const pts = await getPTs(api);
      const ptIbts = await api.batchCall(
        pts.map((pt) => {
          return {
            target: pt,
            abi: abi.pt.getIBT,
          };
        })
      );
      const ibtBalances = await api.batchCall(
        pts.map((pt, i) => {
          return {
            target: ptIbts[i],
            params: pt,
            abi: abi.pt.balanceOf,
          };
        })
      );
      const ptsIbtsWithBalances = ibtBalances.map((balance, i) => [
        ptIbts[i],
        balance,
      ]);
      const ptIBTBalances = ptsIbtsWithBalances.reduce(
        (acc, [ibt, balance]) => {
          if (acc[ibt] === undefined) {
            acc[ibt] = BigInt(0);
          }
          acc[ibt] += sdk.util.convertToBigInt(balance);
          return acc;
        },
        {}
      );

      const allIBTBalances = Object.entries({
        ...poolIBTBalances,
        ...ptIBTBalances,
      }).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: (poolIBTBalances[key] || 0n) + (ptIBTBalances[key] || 0n),
        }),
        {}
      );

      const Assets = await api.batchCall(
        Object.entries(allIBTBalances).map(([ibt, balance]) => {
          return {
            target: ibt,
            abi: abi.vault.asset,
          };
        })
      );
      const AssetsBalances = await api.batchCall(
        Object.entries(allIBTBalances).map(([ibt, balance], i) => {
          return {
            target: ibt,
            params: balance,
            abi: abi.vault.convertToAsset,
          };
        })
      );
      const assetsWithBalances = Assets.map((asset, i) => [
        asset,
        sdk.util.convertToBigInt(AssetsBalances[i]),
      ]);
      assetsWithBalances.forEach(([asset, balance]) => {
        api.add(asset, balance);
      });
      let balances = api.getBalances();
      return balances;
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
      skipCache: true,
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
      skipCache: true,
    });
    return logs.map((i) => i.pt);
  }
});
