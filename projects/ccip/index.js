const ADDRESSES = require('../helper/coreAssets.json')
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
    .filter(([, p]) => p && p !== ADDRESSES.null)

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
