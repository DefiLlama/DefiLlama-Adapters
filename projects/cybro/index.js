const vaults = [
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
]

const dexes = [
  { address: '0xe9041d3483a760c7d5f8762ad407ac526fbe144f', tokenType: 'WETH' },
  { address: '0xbfb18eda8961ee33e38678caf2bceb2d23aedfea', tokenType: 'WETH' },
  { address: '0xe472ccb182a51c589034957cd6291d0b64eaaab2', tokenType: 'WETH' },
  { address: '0x370498c028564de4491b8aa2df437fb772a39ec5', tokenType: 'BLAST' },
  { address: '0xc95317e48451a97602e3ae09c237d1dd8ee83cd0', tokenType: 'WETH' },
  { address: '0x66e1bea0a5a934b96e2d7d54eddd6580c485521b', tokenType: 'WETH' },
]

async function tvl(api) {
  const weth_address = "0x4300000000000000000000000000000000000004"
  const blast_address = "0xb1a5700fA2358173Fe465e6eA4Ff52E36e88E2ad"

  let totalTVL = {
    weth_address: 0,
    blast_address: 0
  }

  const vaultTVL = await api.erc4626Sum2({ calls: vaults });
  totalTVL[weth_address] += vaultTVL;

  for (const dex of dexes) {
    const totalSupply = await api.call({
      target: dex.address,
      params: [],
      abi: 'function totalSupply() view returns (uint256)'
    });

    if (dex.tokenType === 'WETH') {
      totalTVL[weth_address] += totalSupply;
    } else if (dex.tokenType === 'BLAST') {
      totalTVL[blast_address] += totalSupply;
    }
  }

  return totalTVL;
}

module.exports = {
  doublecounted: true,
  methodology: "We calculate TVL based on the Total Supply of our proxy contracts through which users interact with vault's contracts",
  blast: { tvl },
};
