const { getConfig } = require('../helper/cache')

module.exports = {
  timetravel: false,
  era: {
    async tvl(_, _1, _2, { api }) {
      const data = await getConfig('vivaleva', "https://sbb.sooho.io/api/v1/external/vivaleva/defiLlama")
      const vaults = data.vaults;
      const syncswapWorkers = data.syncSwapWorkers;
      const vaultBalances = await api.multiCall({ abi: "uint256:vaultBalance", calls: vaults.map((v) => v.address), });

      vaults.forEach((v, i) => {
        api.add(v.baseTokenAddress, vaultBalances[i]);
      });

      const [
        syncswapWorkerBalances,
        syncswapReserves,
        syncswapLpTotalSupplies,
        token0s,
        token1s,
      ] = await Promise.all([
        api.multiCall({ abi: "uint256:totalStakedLpBalance", calls: syncswapWorkers.map((v) => v.address), }),
        api.multiCall({ abi: "function getReserves() view returns (uint256, uint256)", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
        api.multiCall({ abi: "uint256:totalSupply", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
        api.multiCall({ abi: "address:token0", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
        api.multiCall({ abi: "address:token1", calls: syncswapWorkers.map((v) => v.lpTokenAddress), }),
      ]);

      syncswapWorkers.forEach((w, i) => {
        const token0 = token0s[i]
        const token1 = token1s[i]
        const lpBalance = BigInt(syncswapWorkerBalances[i])
        const totalSupply = BigInt(syncswapLpTotalSupplies[i])
        const [r0, r1] = syncswapReserves[i].map(BigInt);
        const underlying0 = String(lpBalance * r0 / totalSupply);
        const underlying1 = String(lpBalance * r1 / totalSupply);
        api.add(token0, underlying0);
        api.add(token1, underlying1);
      });
    },
  },
};
