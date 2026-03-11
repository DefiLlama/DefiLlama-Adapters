const { stakings } = require("../helper/staking.js");

const vaultsBlast = [
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
  '0xc66fc517c8bf1c34ae48529df53dd84469e21daa',
  '0x24e72c2c7be9b07942f6f8d3cdce995df699514d',
  '0xb3e2099b135b12139c4eb774f84a5808fb25c67d',
  '0xb81d975cc7f80ede476c1a930720378bda4092a2',
]

const cybroStakingBlast = [
  '0xD01D2b926EDB4E9DF43AbC2F97B0655845adA688',
  '0x13a2A10C5f800199d2a1B2Db4972eFFDeE3EeaA5',
  '0x03B7BEcB964ab0ebad805683d14f338504152707',
]

const vaultsArbitrum = [
  '0x951c846aa10cc3da45defed784c3802605f71769',
  '0x6f0acbaac51f3c72ddaa4edc6e20fc388d20adbc',
  '0x320cd9d00961fb45857a043efea77dc6b9db5d95',
  '0x4e433ae90f0d1be9d88bed9f7707fcff20a455ac',
  '0x1310b9de457675d65f3838c1e9d19a5ca6619440',
  '0xbDe5296eA786a12c4BFd60408063816E36A2F4b1',
]

const vaultsBase = [
  '0x459a3d995d66798b1ab114f702b8bc8655484e78',
  '0xa7517b9930d0556175a1971bd62084e16f21881f',
  '0x0655e391e0c6e0b8cbe8c2747ae15c67c37583b9',
  '0x578e7261b9d3c143700a735526bfd63713f639c5',
  '0xdd996648b02bf22d9c348e11d470938f8ae50f2b',
  '0x84FbCde24b75F3d45863e82282683DfF16C398B7',
]

const vaultsBSC = [
  '0x5351d748eb97116755b423bcc207f3613b487ade',
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

async function tvlBase(api) {
  return api.erc4626Sum2({ calls: vaultsBase });
}

async function tvlBSC(api) {
  return api.erc4626Sum2({ calls: vaultsBSC });
}

module.exports = {
  doublecounted: true,
  methodology: "We calculate TVL based on the Total Supply of our proxy contracts through which users interact with vault's contracts",
  base: { tvl: tvlBase },
  blast: { tvl: tvlBlast, staking: stakings(cybroStakingBlast, "0x963eec23618bbc8e1766661d5f263f18094ae4d5") },
  arbitrum: { tvl: tvlArbitrum },
  bsc: { tvl: tvlBSC },
};
