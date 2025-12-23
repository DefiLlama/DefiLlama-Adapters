const sdk = require("@defillama/sdk");

module.exports = {
  arbitrum: {
    tvl: async (api) => {
      const tokenAddress = "0x3e62fED35c97145e6B445704B8CE74B2544776A9";
      const ownerAddress = "0xA9F4ee72439afC704db48dc049CbFb7E914aD300";

      const balance = await api.call({
        target: tokenAddress,
        abi: 'erc20:balanceOf',
        params: [ownerAddress]
      });

      console.log("Raw Balance:", balance);
      console.log("Human Readable Balance:", Number(balance) / 1e18);
      
      // The api.addCGToken already handles decimals automatically
      // But if it's not working, you can divide manually:
      const normalizedBalance = BigInt(balance) / BigInt(1e18);
      
      api.addCGToken("earnm", normalizedBalance.toString());
      
      return api.getBalances();
    },
  },
};