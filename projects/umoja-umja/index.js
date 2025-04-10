const Arbitrum = {
  token: "0x16A500Aec6c37F84447ef04E66c57cfC6254cF92",
  umo_governance: "0x256F7b822594a1Bc5cB5a68f0A7d97C8F3F2711C",
};

module.exports = {
  arbitrum: {
      tvl: () => ({}),
      staking: async (api) => {
          const lockedUmoGov = await api.call({ abi: 'erc20:balanceOf', target: Arbitrum.token, params: Arbitrum.umo_governance })
          api.add(Arbitrum.token, lockedUmoGov)
      },
  },
}