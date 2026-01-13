module.exports = {
    ethereum: {
      tvl: async (api) => {
        await api.sumTokens({
          owners: [
            "0x69aB55146Bc52A0b31F74dBDc527b8B7e9c7C27c", //ETH Bridge
            "0x5625d2a46fc582b3e6dE5288D9C5690B20EBdb8D", //ERC20 Gateway
          ],
          tokens: [
            "0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1", // ARB
            "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
            "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT
          ],
        });
      },
    },
  };