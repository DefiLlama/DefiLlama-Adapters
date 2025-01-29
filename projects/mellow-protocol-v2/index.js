const config = {
  ethereum: {
    mellowLrtVaults: [
      '0xc65433845ecD16688eda196497FA9130d6C47Bd8',
      '0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26',
      '0x5E362eb2c0706Bd1d134689eC75176018385430B',
      '0x7F43fDe12A40dE708d908Fb3b9BFB8540d9Ce444',
      '0x3a828C183b3F382d030136C824844Ea30145b4c7',
      '0x64047dD3288276d70A4F8B5Df54668c8403f877F',
    ],
    simpleLrtVaults: [
      '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
      '0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a',
      '0x5fD13359Ba15A84B76f7F87568309040176167cd',
      '0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811',
      '0x7b31F008c48EFb65da78eA0f255EE424af855249',
      '0x49cd586dd9BA227Be9654C735A659a1dB08232a9',
      '0x82dc3260f599f4fC4307209A1122B6eAa007163b',
      '0xd6E09a5e6D719d1c881579C9C8670a210437931b',
      '0x4f3Cc6359364004b245ad5bE36E6ad4e805dC961',
      '0x375A8eE22280076610cA2B4348d37cB1bEEBeba0',
      '0xcC36e5272c422BEE9A8144cD2493Ac472082eBaD',
      '0x7a4EffD87C2f3C55CA251080b1343b605f327E3a',
      '0xE4357bDAE017726eE5E83Db3443bcd269BbF125d',
      '0x24183535a24CF0272841B05047A26e200fFAB696',
      '0xB908c9FE885369643adB5FBA4407d52bD726c72d',
    ]
  },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  const { mellowLrtVaults, simpleLrtVaults } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const mellowLrtTvl = await api.multiCall({ abi: 'function underlyingTvl() public view returns (address[] tokens, uint256[] values)', calls: mellowLrtVaults, permitFailure: true })
      mellowLrtTvl.forEach((i) => {
        if (!i) return;
        const { tokens, values } = i
        api.add(tokens, values)
      })
      await api.erc4626Sum({ calls: simpleLrtVaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true });
    }
  }
})