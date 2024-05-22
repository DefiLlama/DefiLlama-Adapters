const ADDRESSES = require('../helper/coreAssets.json');
const { sumTokensExport } = require('../helper/unknownTokens');

module.exports = {
  methodology: 'Counts liquidty on the staking',
  scroll: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.null, '0x8F53fA7928305Fd4f78c12BA9d9DE6B2420A2188'],
        [
          '0x5300000000000000000000000000000000000004',
          '0x88844c8f2b895792532AaE2a0F877208248F3585',
        ],
        [
          '0xf55BEC9cafDbE8730f096Aa55dad6D22d44099Df',
          '0xC72a7a21e3E12594c75Bc6418224E812e16a027E',
        ],
        [
          '0x06eFdBFf2a14a7c8E15944D1F4A48F9F95F663A4',
          '0xDc1FCFe40A5Cf9745cef0B75428eE28E81D7cC56',
        ],
        [
          '0x80137510979822322193FC997d400D5A6C747bf7',
          '0x20DE0435e5674Ef15E78adA570159984524B9E8F',
        ],
        [
          '0xc4d46E8402F476F269c379677C99F18E22Ea030e',
          '0x0C530882C0900b13FC6E8312B52c26e7a5b8e505',
        ],
        [
          '0xa25b25548B4C98B0c7d3d27dcA5D5ca743d68b7F',
          '0x27D2B6cEcd759D289B0227966cC6Fe69Cc2b0424',
        ],
      ],
    }),
  },
};
