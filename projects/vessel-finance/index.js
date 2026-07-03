module.exports = {
  scroll: {
    tvl: async (api) => {
      const owner = '0x6126E927627b8d9eb9aDb9faadC47B76F94B6bA2'; // Vessel VaultProxy
      const tokens = [
        '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df', // USDT (Scroll bridged)
        '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4', // USDC (Scroll bridged)
        '0x3C1BCa5a656e69edCD0D4E36BEbb3FcDAcA60Cf1', // WBTC (Scroll bridged)
        '0x0000000000000000000000000000000000000000', // native ETH
      ];
      return api.sumTokens({ owner, tokens });
    },
  },
  methodology: 'TVL is the sum of ETH, USDT, USDC and WBTC balances held in the Vessel Finance VaultProxy contract on Scroll.',
};