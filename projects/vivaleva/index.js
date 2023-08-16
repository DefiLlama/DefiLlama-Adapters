const axios = require('axios');


async function fetch() {
  const url = "https://sbb.sooho.io/api/v1/external/vivaleva/defiLlama";
  var response = (await axios.get(url)).data;
  return response;
}

module.exports = {
  timetravel: false,
  era: {
    async tvl(_, _1, _2, { api }) {
      const data = await fetch();
      const vaults = data.vaults;
      const syncswapWorkers = data.syncswapWorkers;
      const vaultBalances = await api.multiCall({
        abi: "uint256:vaultBalance",
        calls: vaults.map((v) => v.address),
      });

      vaults.forEach((v, i) => {
        api.add(v.baseTokenAddress, vaultBalances[i]);
      });

      const [
        syncswapWorkerBalances,
        syncswapReserves,
        syncswapLpTotalSupplies,
      ] = await Promise.all([
        api.multiCall({
          abi: "uint256:totalStakedLpBalance",
          calls: syncswapWorkers.map((v) => v.address),
        }),
        api.multiCall({
          abi: "function getReserves() view returns (uint256, uint256)",
          calls: syncswapWorkers.map((v) => v.lpToken),
        }),
        api.multiCall({
          abi: "uint256:totalSupply",
          calls: syncswapWorkers.map((v) => v.lpToken),
        }),
      ]);

      syncswapWorkers.forEach((w, i) => {
        const [token0, token1] =
          w.baseTokenAddress.toLowerCase() < w.farmingTokenAddress.toLowerCase()
            ? [w.baseTokenAddress, w.farmingTokenAddress]
            : [w.farmingTokenAddress, w.baseTokenAddress];
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
