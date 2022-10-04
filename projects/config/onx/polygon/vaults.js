const createVaultModel = (poolAddress, vaultAddress) => {
  return {
    pool: poolAddress,
    vault: vaultAddress,
    chain: 'polygon',
  }
}

const vaults = [
  //dualMaticUsdc
  {
    ...createVaultModel('0x6e7a5fafcec6bb1e78bae2a1f0b612012bf14827', '0x36D14424Cc5a18893e93A0f8FdD42DC40562887E'),
  },
  //dualMaticEth
  {
    ...createVaultModel('0xadbf1854e5883eb8aa7baf50705338739e558e5b', '0xfe51dE20719d05152Ace63a069446Bb5C89511DB'),
  },
  //dualMaticUsdt
  {
    ...createVaultModel('0x604229c960e5cacf2aaeac8be68ac07ba9df81c3', '0x067E7586Eb8733bF108167C15cBAbee4c629C37A'),
  },
  //dualMaticQuick
  {
    ...createVaultModel('0x019ba0325f1988213d448b3472fa1cf8d07618d7', '0x849031F78970639F8Dc9Dc3E962e0d0079D1051c'),
  },
  //EthUsdc
  {
    ...createVaultModel('0x853ee4b2a13f8a742d64c8f088be7ba2131f670d', '0x185A1cfdb7173b224d08E61F1Cb21Fd5Fd6ee8CD'),
  },
  //wBtcEth
  {
    ...createVaultModel('0xdc9232e2df177d7a12fdff6ecbab114e2231198d', '0xf1ba3ef65262ee4058462e65a3a09a7571193400'),
  },
  //ethUsdt
  {
    ...createVaultModel('0xf6422b997c7f54d1c6a6e103bcb1499eea0a7046', '0x353856185fBB65a098b971B6d492CC3c245D9a59'),
  },
  //quickEth
  {
    ...createVaultModel('0x1bd06b96dd42ada85fdd0795f3b4a79db914add5', '0x9767218525A443AE1B04A2a84Cf2f6D646C2fA06'),
  },
  //aaveEth
  {
    ...createVaultModel('0x90bc3e68ba8393a3bf2d79309365089975341a43', '0xbB760a23924a23e5270c659349c753d16e7C1078'),
  },
  //ethDai
  {
    ...createVaultModel('0x4a35582a710e1f4b2030a3f826da20bfb6703c09', '0x0d553115D2c1E2b734d66De1Eba4BAe1a88cB175'),
  },
  //wbtcUsdc
  {
    ...createVaultModel('0xf6a637525402643b0654a54bead2cb9a83c8b498', '0x248Eecc8286A8C6484B4A87e1F32f0bc2d7971D4'),
  },
  //linkEth
  {
    ...createVaultModel('0x5ca6ca6c3709e1e6cfe74a50cf6b2b6ba2dadd67', '0x58bC3B5949C6784819A606645d616D8D2dA7594B'),
  },
  //usdcQuick
  {
    ...createVaultModel('0x1f1e4c845183ef6d50e9609f16f6f9cae43bc9cb', '0x7E9dA60002dAF64778C78Ac90dD5bdc9391acb00'),
  },
  //usdcUsdt
  {
    ...createVaultModel('0x2cf7252e74036d1da831d11089d326296e64a728', '0x1a130be9a0E9046936E5461D3e8727b6aF7d0C2C'),
  },
  //avaxMatic
  {
    ...createVaultModel('0xeb477ae74774b697b5d515ef8ca09e24fee413b5', '0x8D20fB2F4F96E897Fed7E3E50f8A403aFc59dA23'),
  },
  //solMatic
  {
    ...createVaultModel('0x898386dd8756779a4ba4f1462891b92dd76b78ef', '0x0A1EfAF7dd833F9D8EF9f2f095bf1d6C725FF110'),
  },
  //bnbUsdc
  {
    ...createVaultModel('0x40a5df3e37152d4daf279e0450289af76472b02e', '0x43bE6849BC355735D77238AcfDBcEB7bE8673f02'),
  },
  //ftmMatic
  {
    ...createVaultModel('0xd2b61a42d3790533fedc2829951a65120624034a', '0xF020de990036D5aE107860592Bde0E53892F1531'),
  },
  //daiUsdc
  {
    ...createVaultModel('0xf04adbf75cdfc5ed26eea4bbbb991db002036bdd', '0x260e6fB68C787CdA2E9ea104f9e3a3923E4119f6'),
  },
  //daiUsdt
  {
    ...createVaultModel('0x59153f27eefe07e5ece4f9304ebba1da6f53ca88', '0x32B750721Ad93f62b21402526354d53ac46953C2'),
  },
]

module.exports = {
  vaults,
}