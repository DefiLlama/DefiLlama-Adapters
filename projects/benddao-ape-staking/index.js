const abi = require("../benddao/helper/abis");
const address = require("../benddao/helper/address");
const sdk = require("@defillama/sdk");

module.exports = {
  ethereum: {
    tvl: async (_, _b, _cb, { api }) => {
      const balances = {};

      const addressMap = address[api.chain];

      const nftList = [addressMap.BAYC, addressMap.MAYC, addressMap.BAKC];

      const [stakedTotal, apeCoinBalance, nftBalance] = await Promise.all([
        api.multiCall({
          calls: [
            // v1
            addressMap.BoundBAYC,
            addressMap.BoundMAYC,
            addressMap.BoundBAKC,
            // v2
            addressMap.BendStakeManager,
            addressMap.NftVault,
          ],
          target: addressMap.ApeCoinStaking,
          abi: abi.ApeCoinStaking.stakedTotal,
        }),
        api.multiCall({
          calls: [
            // v1
            addressMap.BoundBAYC,
            addressMap.BoundMAYC,
            addressMap.BoundBAKC,
            // v2
            addressMap.BendCoinPool,
            addressMap.BendNftPool,
          ],
          target: addressMap.ApeCoin,
          abi: "erc20:balanceOf",
        }),
        api.multiCall({
          calls: nftList.map((nft) => ({
            target: nft,
            params: [addressMap.NftVault],
          })),
          abi: abi.ERC721.balanceOf,
        }),
      ]);

      stakedTotal.forEach((d) =>
        sdk.util.sumSingleBalance(balances, addressMap.ApeCoin, d, api.chain)
      );

      apeCoinBalance.forEach((d) =>
        sdk.util.sumSingleBalance(balances, addressMap.ApeCoin, d, api.chain)
      );

      nftBalance.forEach((d, i) => {
        sdk.util.sumSingleBalance(balances, nftList[i], d, api.chain);
      });

      return balances;
    },
  },
};
