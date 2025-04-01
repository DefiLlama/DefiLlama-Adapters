const UMJA = {
  arbitrum: "0x16A500Aec6c37F84447ef04E66c57cfC6254cF92",
  base: "0x009E97a080BC7B603257C461598275Dc49B8cd0c",
};

module.exports = {
  arbitrum: {
      tvl: async (api) => {
          const supply = await api.call({ abi: 'erc20:totalSupply', target: UMJA.arbitrum })
          api.add(UMJA.arbitrum, supply)
      },
  },
  base: {
      tvl: async (api) => {
          const supply = await api.call({ abi: 'erc20:totalSupply', target: UMJA.base })
          api.add(UMJA.base, supply)
      },
  }
}