const { sumTokens2 } = require('../helper/unwrapLPs')

const TOKEN_ADMIN_REGISTRY = {
  ethereum: '0xb22764f98dD05c789929716D677382Df22C05Cb6',
  bsc: '0x736Fd8660c443547a85e4Eaf70A49C1b7Bb008fc',
  polygon: '0x00F027eA6D0fb03256A15E9182B2B9227A4931d8',
  arbitrum: '0x39AE1032cF4B334a1Ed41cdD0833bdD7c7E7751E',
  avax: '0xc8df5D618c6a59Cc6A311E96a39450381001464F',
  base: '0x6f6C373d09C07425BaAE72317863d7F6bb731e37',
  '0g': '0x051665f2455116e929b9972c36d23070F5054Ce0',
  optimism: '0x657c42abE4CD8aa731Aec322f871B5b90cf6274F',
  linea: '0xBc933cEE67d2b1c08490ee8C51E2dF653a713534',
  era: '0x100a47C9DB342884E3314B91cec076BbAC8e619c',
  wc: '0x02Fe6ab4fb0943F58D9D925d1d2cbA9474997Ed0',
  hsk: '0x4b238f757f842280FeA88A1c2B4186b71eF8BC5E',
  sonic: '0x2961Cb47b5111F38d75f415c21ceB4120ddd1b69',
  ronin: '0x90e83d532A4aD13940139c8ACE0B93b0DdbD323a',
  shibarium: '0x995d2Aa233aBeaCA2a64Edf898AE9F4e01bE15B9',
  pharos: '0xB79791184973589c38e114D43Eb8E4588C283A18',
  bob: '0xa57d04119AFf4884F8602213E58d8AaAD18229cb',
  astar: '0xB98eEd70e3cE8E342B0f770589769E3A6bc20A09',

// BurnMint only
//   tempo: '0x60A97bd9ACf755954Ff0fE85837224f2920a57F3',
//   xdc: '0xEC1276CA704c612A28cb2C873dEdCEba97F65cED',
//   tac: '0xd31dB306E5D79F0018Ac92e08492284201493EA1',
//   op_bnb: '0xEfF5D2147F9cAcdedF80C2ee1F5320B01C664bE5',
//   katana: '0x048B911A1AE5dD4f0aEE5241A30d3DEDa3501D54',
//   hyperliquid: '0xcE44363496ABc3a9e53B3F404a740F992D977bDF',
//   megaeth: '0xf4a170A36D4C656F614d44453f73308Bdb275196',
//   hemi: '0x81e81F9B2C0B79C00F38357068AE049090F2DaDE',
//   apechain: '0xD3ED6fC9fd22412764ac2Ef64fB664b9393dF9F2',
//   plume_mainnet: '0x01E5B2fAC7156c54f034E1767f2799fDd41B8285',
//   klaytn: '0x75b48579Fb886C04E54b53038970a2BA19B75e09',
//   abstract: '0x7EEdf2DBC74924Cb1f23fC8845CD35bF18b697de',
//   berachain: '0x0944C3Fb1dB7D165336569221995B31cBE6c8A55',
//   ink: '0xEb062d21c713A3d940BB0FaECFdC387d6Ea23697',
//   sei: '0x910a46cA93E8086BF1d7D65190eE6AEe5256Bd61',
//   xdai: '0x73BC11423CBF14914998C23B0aFC9BE0cb5B2229',
//   soneium: '0x5ba21F6824400B91F232952CA6d7c8875C1755a4',
//   plasma: '0xc23071a8AE83671f37bdA1DaDBC745a9780f632A',
//   metis: '0x3af897541eB03927c7431bF68884A6C2C23b683f',
//   mantle: '0x000A744940eB5D857c0d61d97015DFc83107404F',
//   mode: '0xB4b40c010A547dff6A22d94bC2C1c1e745b62aB2',
//   scroll: '0x846dEA1c1706FC35b4aa78B32d31F1599DAA47b4',
//   btnx: '0x3eD4752266fF42FECe47dB8BA1249fF3978f3E5E',
//   xlayer: '0xeCf1eAEE01E82F3388dECD7f4C3792374f3f72F3',
//   unichain: '0xAB3Ee2e897cf23c10e76d26aB4674fEFA376bc0d',
//   taiko: '0x308a2A7d13B12ba26649F381C53F7e7C60d0D9c6',
//   monad: '0x11ACd984DD680363117B310f6ebdf78fD6c0195f',
//   zircuit: '0x47d2D93EEDb694bf445E7F6458f17669459612c7',
//   celo: '0xf19e0555fAA9051e277eeD5A0DcdB13CDaca39a9',
//   cronos: '0x32c4634338f1386fdD18E0bD6dF51Ca2Fa56f762',
//   cronos_zkevm: '0x94Fa8b263dEb66fA3e160D408Cd200be8b030609',
//   fraxtal: '0x6724621d8A560A84E4B6012c4bAA0eA6fF47B9DF',
//   core: '0x4D2B43c60f3e476Ee94637C4e3be844FC9a70012',
//   corn: '0xCd51e57cD26b9B5eecbfe3d96DAabF3d12A663DA',
//   stable: '0x3c23e6FB09064e9A64829Fa8FEe27Ad19A27Bfa9',
//   zora: '0x791BA3010A5BFeA773d2cfD6Ea4D0Ce9627856eB',
//   hedera: '0xC9efBD4f73C37aE1573806030A4146e1E72EADc1',
//   neox: '0x344FCBb30EC9ECf58c8399EDe0430592E6703BC1',
//   rsk: '0xad71ac82aCFCbDD27BBd3F3eD2fA24E26E49CBE2',
//   wemix: '0xE993e046AC50659800a91Bab0bd2daBF59CbD171',
//   lens: '0xdD98482Ec0cfEFfe14EAb750A9c484F9D5d07380',
//   lisk: '0x98acD723D0E9C13d09Df4619Abec729F3434a10a',
//   morph: '0xEfd5fEFEdE55B5C41B8fa0d171a79ba5BeadD2Aa',
//   merlin: '0xA51Cdb9154bB0c9Bc3CE25dBf7DE3331B3A1C8E7',
//   bsquared: '0x2e1543255119CfB9D3501E32d7f5B244E59A06F4',
//   bittensor_evm: '0xe72d25aDd538E8ef9CeF85622eA8912a6CB98Be6',
//   btr:   '0xd999758aEB04BDa755Ae78344FFF5534947620CD',
}

const PAGE = 500

async function tvl(api) {
  const registry = TOKEN_ADMIN_REGISTRY[api.chain]

  const tokens = []
  for (let start = 0; ; start += PAGE) {
    const page = await api.call({
      target: registry,
      abi: 'function getAllConfiguredTokens(uint64 startIndex, uint64 maxCount) view returns (address[])',
      params: [start, PAGE],
    })
    tokens.push(...page)
    if (page.length < PAGE) break
  }

  const pools = await api.call({
    target: registry,
    abi: 'function getPools(address[] tokens) view returns (address[])',
    params: [tokens],
  })

  const pairs = tokens
    .map((t, i) => [t, pools[i]])
    .filter(([, p]) => p && p !== '0x0000000000000000000000000000000000000000')

  const types = await api.multiCall({
    abi: 'function typeAndVersion() view returns (string)',
    calls: pairs.map(([, p]) => p),
    permitFailure: true,
  })

  // filter out BurnMint and BurnWithFromMint pools
  const lockReleasePairs = pairs.filter((_, i) => typeof types[i] === 'string' && types[i].includes('LockRelease'))

  return sumTokens2({ api, tokensAndOwners: lockReleasePairs })
}

module.exports = {
  methodology: 'Sums tokens locked in CCIP LockRelease TokenPools, pulled from each chain\'s TokenAdminRegistry.',
}

Object.keys(TOKEN_ADMIN_REGISTRY).forEach(chain => {
  module.exports[chain] = { tvl };
});
