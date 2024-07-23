const { onChainTvl } = require('../helper/balancer')

const config = {
  vault: "0xFB43069f6d0473B85686a85F4Ce4Fc1FD8F00875",
  startingBlock: 81_247_457,
};

module.exports = {
  sei: {
    tvl: onChainTvl(config.vault, config.startingBlock, {
      preLogTokens: [
        '0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1',
        '0xB75D0B03c06A926e488e2659DF1A861F860bD3d1',
        '0x5f0E07dFeE5832Faa00c63F2D33A0D79150E8598',
        '0x5Cf6826140C1C56Ff49C808A1A75407Cd1DF9423',
      ]
    }),
  }
}
