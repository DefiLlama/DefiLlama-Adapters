const vaults = [
  {
    symbol: "ibETH",
    decimals: 18,
    baseTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    address: "0x23FDd6487a17abB8360E8Da8b1B370C94ee94Cc2",
  },
  {
    symbol: "ibUSDC",
    decimals: 6,
    baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    address: "0x0755DA5D9e9A722A9e5cc4bb83742387ae2990a5",
  },
];
const syncswapWorkers = [
  {
    name: "ETH-USDC Syncswap Farm",
    address: "0x39356ed5dC2F7Ea897296e07E97b59Af9C8153Ec",
    farmingTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    lpToken: "0x80115c708E12eDd42E504c1cD52Aea96C547c05c",
  },
  {
    name: "USDC-ETH Syncswap Farm",
    address: "0x3A613EFAe4a6A6447A9D784E398730811a57af6e",
    farmingTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    baseTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    lpToken: "0x80115c708E12eDd42E504c1cD52Aea96C547c05c",
  },
  {
    name: "USDT-ETH Syncswap Farm",
    address: "0x95C78e21Beb54314fe5A4571E7361f6c6A144B2f",
    farmingTokenAddress: "0x493257fd37edb34451f62edf8d2a0c418852ba4c",
    baseTokenAddress: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    lpToken: "0xd3D91634Cf4C04aD1B76cE2c06F7385A897F54D3",
  },
  {
    name: "USDT-USDC Syncswap Farm",
    address: "0xfbF4BcD3266Af20B72dc484F6D7Dc13855885ba0",
    farmingTokenAddress: "0x493257fd37edb34451f62edf8d2a0c418852ba4c",
    baseTokenAddress: "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4",
    lpToken: "0x0E595bfcAfb552F83E25d24e8a383F88c1Ab48A4",
  },
];

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  era: {
    async tvl(_, _1, _2, { api }) {
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
        token0s,
        token1s,
      ] = await Promise.all([
        api.multiCall({ abi: "uint256:totalStakedLpBalance", calls: syncswapWorkers.map((v) => v.address), }),
        api.multiCall({ abi: "function getReserves() view returns (uint256, uint256)", calls: syncswapWorkers.map((v) => v.lpToken), }),
        api.multiCall({ abi: "uint256:totalSupply", calls: syncswapWorkers.map((v) => v.lpToken), }),
        api.multiCall({ abi: "address:token0", calls: syncswapWorkers.map((v) => v.lpToken), }),
        api.multiCall({ abi: "address:token1", calls: syncswapWorkers.map((v) => v.lpToken), }),
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
