const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unknownTokens');

module.exports = {
  methodology: 'Counts liquidty on the staking',
  scroll: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x8F53fA7928305Fd4f78c12BA9d9DE6B2420A2188'],
        [ADDRESSES.scroll.WETH, '0x88844c8f2b895792532AaE2a0F877208248F3585'],
        [ADDRESSES.scroll.USDT, '0xC72a7a21e3E12594c75Bc6418224E812e16a027E'],
        [ADDRESSES.scroll.USDC, '0xDc1FCFe40A5Cf9745cef0B75428eE28E81D7cC56'],
        [ADDRESSES.scroll.STONE, '0x20DE0435e5674Ef15E78adA570159984524B9E8F'],
        [
          '0xc4d46E8402F476F269c379677C99F18E22Ea030e',
          '0x0C530882C0900b13FC6E8312B52c26e7a5b8e505',
        ], // pufETH
        [
          '0xa25b25548B4C98B0c7d3d27dcA5D5ca743d68b7F',
          '0x27D2B6cEcd759D289B0227966cC6Fe69Cc2b0424',
        ], // wrsETH
        [
          '0xf610A9dfB7C89644979b4A0f27063E9e7d7Cda32',
          '0x96cB437706111548c3D2e1Dc21E5Ab69E5dA057a',
        ], // wstETH
        [
          '0xcA0bFd5f735924e34Cc567146989e467fFbbCe1a',
          '0x25D710AC957A54bdD6578b5DC8187a355c805edb',
        ], // weETH (Scroll Bridged)
        [
          ADDRESSES.scroll.WBTC,
          '0x1C04CedF3Aac5fE35A7811689Ac6Da25b01BDc81',
        ], // WBTC
        [
          '0x01f0a31698c4d065659b9bdc21b3610292a1c506',
          '0x016d036ec56eed17b5f9dfa212e27f8e260cc7d0',
        ], // weETH (Stargate Bridged)
        [
          '0x3ba89d490ab1c0c9cc2313385b30710e838370a4',
          '0xde12ec22c5c4eeeeaf8afdc4ec735d75cf9d15a5',
        ], // SolvBTC.b
      ],
    }),
  },
};
