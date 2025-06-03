const { compoundExports2 } = require('../helper/compound')

module.exports = {
  meter: compoundExports2({
    comptroller: '0xcB4cdDA50C1B6B0E33F544c98420722093B7Aa88',
    blacklistedTokens: [
      '0x755A39999FE536Ec327Cb84110383BFc30fd0F4D', // suUSD
      '0x21c4123f62CA28c9ceF3dDd1c8ae71EE9a5003aE', // suETH
    ]
  }),
  base: compoundExports2({
    comptroller: '0x611375907733D9576907E125Fb29704712F0BAfA', 
    blacklistedTokens: [
      '0xa1aD8481e83a5b279D97ab371bCcd5AE3b446EA6', // suUSD
      '0x56048C88309CAF13A942d688bfB9654432910d6e', // suETH
    ]
  }),
  arbitrum: compoundExports2({
    comptroller: '0xBfb69860C91A22A2287df1Ff3Cdf0476c5aab24A',
    blacklistedTokens: [
      '0xe4B55045ed14815c7c42eeeF8EE431b89422c389', // suUSD
      '0x9C93423939C4e3D48d99baD147AD808BE89B2043', // suETH
      '0xAc6bAF36B28d19EA10959102158Beb3d933C1fbf', // suBTC
    ]
  }),
  ethereum: compoundExports2({
    comptroller: '0x60A4570bE892fb41280eDFE9DB75e1a62C70456F',
    blacklistedTokens: [
      '0x2509bd3B69440D39238b464d09f9F04A61fd62C6', // suUSD
      '0x4342e9bf67F89dea0Cf3c906F5113Dd8b588aC6F', // suETH
      '0x77CcA710E21A94B94a26A98eA23027D64e36B9d4', // suBTC
    ]
  }),
  zklink: compoundExports2({
    comptroller: '0xe6099D924efEf37845867D45E3362731EaF8A98D',
    blacklistedTokens: [
      '0x0Cf1cC35e296931061c263826B5f62DC04ac1C6B', // suBTC
    ]
  }),
  bsquared: compoundExports2({
    comptroller: '0xdD9C863197df28f47721107f94eb031b548B5e48',
    blacklistedTokens: [
      '0x8C38b023Afe895296e2598AE111752223185b35c', // suUSD
      '0xb1FdC3f660b0953253141B2509c43014d5d3d733', // suBTC
    ]
  }),
  core: compoundExports2({
    comptroller: '0x7f5a7aE2688A7ba6a9B36141335044c058a08b3E',
    blacklistedTokens: [
      '0xaAC83D5E45A2f67f2bFd1B804776EFa7DAF6cbF6', // suUSD
      '0xaE6388F58b5b35D5B2eEC828C9633E7D245FEf62', // suBTC
    ]
  }),
  bsc: compoundExports2({
    comptroller: '0x15B5220024c3242F7D61177D6ff715cfac4909eD',
    blacklistedTokens: []
  }),
  berachain: compoundExports2({
    comptroller: '0x16C7d1F9EA48F7DE5E8bc3165A04E8340Da574fA',
    blacklistedTokens: [
      '0x163cEbBD83A4e2821fF06C9b0707A8A64FEc0AbC', // suUSD
      '0xA6ae238D9CaF65DFA67670FDE3156EFeE9334488', // suBTC
    ]
  }),
  hemi: compoundExports2({
    comptroller: '0xB2fF02eEF85DC4eaE95Ab32AA887E0cC69DF8d8E',
    blacklistedTokens: [
      '0x8C38b023Afe895296e2598AE111752223185b35c', // suUSD
      '0xb1FdC3f660b0953253141B2509c43014d5d3d733', // suETH
      '0xc7fFEAa5949d50A408bD92DdB0D1EAcef3F8a3Bc', // suBTC
    ]
  })
}