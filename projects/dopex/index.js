const SSOVS = [
  // Monthlies
  // DPX Monthly CALL SSOV
  "0x05E7ACeD3b7727f9129E6d302B488cd8a1e0C817",

  // rDPX Monthly CALL SSOV
  "0xd74c61ca8917Be73377D74A007E6f002c25Efb4e",
  // stETH Monthly CALL SSOV
  "0x475a5a712B741b9Ab992E6Af0B9E5adEE3d1851B",
  // ARB Monthly CALL SSOV
  "0xDF3d96299275E2Fb40124b8Ad9d270acFDcc6148",
  // Weeklies
  // DPX Weekly CALL SSOV
  "0x10FD85ec522C245a63239b9FC64434F58520bd1f",
  // rDPX Weekly CALL SSOV
  "0xCdaACF37726Bf1017821b5169e22EB34734B28A8",
  // stETH Weekly CALL SSOV
  "0xFca61E79F38a7a82c62f469f55A9df54CB8dF678",
  // DPX Weekly PUT SSOV
  "0xf71b2B6fE3c1d94863e751d6B455f750E714163C",
  // rDPX Weekly PUT SSOV
  "0xb4ec6B4eC9e42A42B0b8cdD3D6df8867546Cf11d",
  // ETH Weekly PUT SSOV
  "0x32449DF9c617C59f576dfC461D03f261F617aD5a",
];

async function tvl(api) {
  const tokens = await api.multiCall({  abi: 'address:collateralToken', calls: SSOVS})
  return api.sumTokens({ tokensAndOwners2: [tokens, SSOVS]})
}

module.exports = {
  ethereum: { tvl: () => ({}) },
  bsc: { tvl: () => ({}) },
  avax: { tvl: () => ({}) },
  arbitrum: { tvl, },
};
