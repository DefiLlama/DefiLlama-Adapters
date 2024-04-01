const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')
const getAllPositionsByIdsABI = "function getAllPositionsByIds(address vaultAddress, uint256[] positionIds) view returns (tuple(address worker, uint256 positionId, uint256 positionDebtAmount, uint256 positionHealth, uint256[] positionIngredients, uint16 positionKillFactorBps)[] positionInfos)"

module.exports = {
  timetravel: false,
  era: {
    async tvl(api) {
      const _data = await getConfig('vivaleva', "https://sbb.sooho.io/api/v1/external/vivaleva/defiLlama")

      const data = {
        ..._data,
        pancakeSwapV3Worker: [
          {
            name: "USDC-WETH PancakeSwapV3 Farm Worker",
            address: "0x9ac1CD6f35934bAeD9986711b9D983260C8F38C4",
            lpTokenAddress: "0x291d9F9764c72C9BA6fF47b451a9f7885Ebf9977",
            farmingTokenAddress: ADDRESSES.era.USDC,
            baseTokenAddress: ADDRESSES.era.WETH,
          },
          {
            name: "ETH-USDC PancakeswapV3 Farm",
            address: "0x9ca8aD7290079BF5dbE42CCB917474379Aa167e5",
            farmingTokenAddress: ADDRESSES.era.WETH,
            baseTokenAddress: ADDRESSES.era.USDC,
            lpToken: "0x291d9F9764c72C9BA6fF47b451a9f7885Ebf9977",
          },
          {
            name: "USDT-USDC PancakeswapV3 Farm",
            address: "0xDa3518E5F2972e0Edc1401336b94E257c58eeb18",
            farmingTokenAddress: ADDRESSES.era.USDT,
            baseTokenAddress: ADDRESSES.era.USDC,
            lpToken: "0x3832fB996C49792e71018f948f5bDdd987778424",
          }
        ],
        commonCalculator: "0x4Ca7a070b0e62F71C46AB8B2fB4bd21e5B2B9Ac6",
      }
      const vaults = data.vaults;
      const syncswapWorkers = data.syncSwapWorkers;
      const vaultBalances = await api.multiCall({ abi: "uint256:vaultBalance", calls: vaults.map((v) => v.address), });
      const positionLengths = await api.multiCall({ abi: "uint256:positionsLength", calls: vaults.map((v) => v.address), });
      vaults.forEach((v, i) => {
        api.add(v.baseTokenAddress, vaultBalances[i]);
      });

      // from pancakeSwapV3Worker
      const pancakeSwapV3Workers = data.pancakeSwapV3Worker;
      const commonCalculator = data.commonCalculator;
      for (const [i, v] of vaults.entries()) {
        const positionLength = positionLengths[i];
        const positions = Array.from(Array(Number(positionLength)).keys());
        const positionIngredients = await api.call({ abi: getAllPositionsByIdsABI, params: [v.address, positions], target: commonCalculator });
        for (const cur of positionIngredients) {
          const poolAddress = cur.worker.toLowerCase();
          const baseAmount = cur.positionIngredients[0];
          const farmAmount = cur.positionIngredients[1];
          const pancakeSwapV3Worker = pancakeSwapV3Workers.find((v) => v.address.toLowerCase() === poolAddress);
          if (!pancakeSwapV3Worker) {
            continue;
          }
          api.add(pancakeSwapV3Worker.baseTokenAddress, baseAmount);
          api.add(pancakeSwapV3Worker.farmingTokenAddress, farmAmount);
        }
      }

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
