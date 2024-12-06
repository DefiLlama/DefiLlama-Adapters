const vaults = [
  '0xc9434fbee4ec9e0bad7d067b35d2329e5f1d8915',
  '0xf56dab7b7b2954aa86a591f164205e6cdd33797e',
  '0x4caec64454893c7912e6beb1e19b4714dd353748',
  '0xb4e96a45699b4cfc08bb6dd71eb1276bfe4e26e7',
  '0x9c3d4e6f96d2c3ddd8afee3891b955283a920889',
  '0x4f3da57dbfb2b85c96e3556c5f1859ef88f5d6b1',
  '0x7458ac85593472ba501ee361449638ed180a7ee7',
  '0x83eaed4393328f77d0e402018a369b8b82e501a4',
  '0x18e22f3f9a9652ee3a667d78911bac55bc2249af',
  '0xd58826d2c0babf1a60d8b508160b52e9c19aff07',
  '0x567103a40c408b2b8f766016c57a092a180397a1',
  '0xe922bccf90d74f02a9d4203b377399314e008e41',
  '0x0667ac28015ed7146f19b2d218f81218abf32951',
  '0xdccde9c6800bea86e2e91cf54a870ba3ff6faf9f',
  '0x9cc62ef691e869c05fd2ec41839889d4e74c3a3f',
  '0x3500e1d4e93c9f45aa8198efda16842cb73fa1bc',
  '0x6654cddf2a14a06307af6a8d7731dd4e059962a1',
  '0xdb5e7d5ac4e09206fed80efd7abd9976357e1c03',
  '0x3db2bd838c2bed431dcfa012c3419b7e94d78456',
]

async function tvl(api) {
  return api.erc4626Sum2({ calls: vaults })
}

module.exports = {
  doublecounted: true,
  methodology: "We calculate TVL based on the Total Supply of our proxy contracts through which users interact with vault's contracts",
  blast: { tvl },
};
