const vaultsBlast = [
  '0xe922bccf90d74f02a9d4203b377399314e008e41',
  '0xdccde9c6800bea86e2e91cf54a870ba3ff6faf9f',
  '0x0667ac28015ed7146f19b2d218f81218abf32951',
  '0x9c3d4e6f96d2c3ddd8afee3891b955283a920889',
  '0xd58826d2c0babf1a60d8b508160b52e9c19aff07',
  '0x7458ac85593472ba501ee361449638ed180a7ee7',
  '0xdb5e7d5ac4e09206fed80efd7abd9976357e1c03',
  '0x567103a40c408b2b8f766016c57a092a180397a1',
  '0xc66fc517c8bf1c34ae48529df53dd84469e21daa',
  '0x3500e1d4e93c9f45aa8198efda16842cb73fa1bc',
  '0xb4e96a45699b4cfc08bb6dd71eb1276bfe4e26e7',
  '0x3db2bd838c2bed431dcfa012c3419b7e94d78456',
  '0xf56dab7b7b2954aa86a591f164205e6cdd33797e',
  '0x83eaed4393328f77d0e402018a369b8b82e501a4',
  '0x4f3da57dbfb2b85c96e3556c5f1859ef88f5d6b1',
  '0x9cc62ef691e869c05fd2ec41839889d4e74c3a3f',
  '0xc9434fbee4ec9e0bad7d067b35d2329e5f1d8915',
  '0x18e22f3f9a9652ee3a667d78911bac55bc2249af',
  '0x6654cddf2a14a06307af6a8d7731dd4e059962a1',
  '0x4caec64454893c7912e6beb1e19b4714dd353748',
  '0x24e72c2c7be9b07942f6f8d3cdce995df699514d',
]

const vaultsArbitrum = [
  '0x320cd9d00961fb45857a043efea77dc6b9db5d95',
  '0x6f0acbaac51f3c72ddaa4edc6e20fc388d20adbc',
  '0x951c846aa10cc3da45defed784c3802605f71769',
]

const dexes = [
  '0xe9041d3483a760c7d5f8762ad407ac526fbe144f',
  '0xbfb18eda8961ee33e38678caf2bceb2d23aedfea',
  '0xe472ccb182a51c589034957cd6291d0b64eaaab2',
  '0x370498c028564de4491b8aa2df437fb772a39ec5',
  '0xc95317e48451a97602e3ae09c237d1dd8ee83cd0',
  '0x66e1bea0a5a934b96e2d7d54eddd6580c485521b',
]

async function tvlBlast(api) {
  const token0s = await api.multiCall({  abi: 'address:token0', calls: dexes})
  const token1s = await api.multiCall({  abi: 'address:token1', calls: dexes})
  const positionData = await api.multiCall({  abi: 'function getPositionAmounts() view returns (uint256 amount0, uint256 amount1)', calls: dexes})
  const ownerTokens = []
  dexes.forEach((dex, idx) => {
    const token0 = token0s[idx]
    const token1 = token1s[idx]
    const { amount0, amount1 } = positionData[idx]
    api.add(token0, amount0)
    api.add(token1, amount1)
    ownerTokens.push([[token0, token1], dex])
  })

  await api.sumTokens({ ownerTokens })
  return api.erc4626Sum2({ calls: vaultsBlast });
}

async function tvlArbitrum(api) {
  return api.erc4626Sum2({ calls: vaultsArbitrum });
}

module.exports = {
  doublecounted: true,
  methodology: "We calculate TVL based on the Total Supply of our proxy contracts through which users interact with vault's contracts",
  blast: { tvl: tvlBlast },
  arbitrum: { tvl: tvlArbitrum },
};
