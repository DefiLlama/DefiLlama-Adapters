const { getLogs } = require('../helper/cache/getLogs')

// Active and legacy Factor leverage vaults; each emits PositionCreated for strategy contracts.
const vaults = [
  '0xa7e8aa5fee85c7513a7288e720292ba49695b6be',
  '0xcB3104Ee2D1132346E137DdFC7CE68da9dFAD28f',
  '0x4194d29bc1d0218fceea12f9083feefd248d8d90',
  '0x623609f442F70c95bFa9353512eC586C8A547501',
  '0x33bcB801064aBE854ff088dBbc668f91d8Fcbfc1',
  '0xc7efd8f79C37Dae34489065dDD3b07eDdDd76954',
  '0xB8Ca355735a634f6211945394207853e73fDF3F5',
  '0xbC5Fb84d954b391ebC2c61F5fBdA2216195D0702',
  '0xfA6657c9883329A241a46f8Fbfb83Ba23b296db5',
  '0x0ACFF63dcC2e1B3B1E052bD82309939A4e622bb3',
  '0x22bf089585CD3d1f56BDA140EE17CE747E296a04',
  '0x6f21B8c319BB91513059B9212D100B23E2ec08f2',
  '0xdFB18E893f319D516e5338eF2664920218d4D32A',
  '0x37f2EE52ea0C1C05776c2205850980148E38150F',
  '0xa8E897f149120A562f3B9e22FD82537D02dfE983',
  '0x9875eE9aC0C1638a970Dc243CB49dEF307B4Aa3F',
  '0x444C3807C0A17F1b53847238fDe6cC419317198F',
  '0x0A27210eEB46ed035792685A711e81c4Ba3fE646',
  '0xC5fe81114901AaCDE5083e5731425e0261d17cF1',
  '0x63C72D0Ac067ad909622B39DF4983e5C121558Ae',
  '0x0ad520c0db5fa9a4a211e9af4af4ba86c68e4b6f',
  '0x3EE65aB97Df3dbBFC5Ba77faAC3887FA83c3a251',
  '0x14883b1815c01ab3b05bac776978145c299D64cf',
  '0x63366059869CCe869cFdd853c36145cd9c44b085',
  '0x94E699308537CbF2dc3613f1F627B6e9b4035Dd6',
  '0x5E401F53411f21c1552767E82310Ed732D071aff',
]

function negate(balance) {
  if (!balance || balance.toString() === '0') return 0
  return `-${balance.toString()}`
}

async function tvl(api) {
  const logs = (await Promise.all(vaults.map(target => getLogs({
    api,
    target,
    fromBlock: 112324705,
    eventAbi: 'event PositionCreated(uint256 indexed id, address indexed vault)',
    onlyArgs: true,
  })))).flat()
  const positions = logs.map(log => log.vault)

  if (!positions.length) return

  const [assetTokens, assetBalances, debtTokens, debtBalances] = await Promise.all([
    api.multiCall({ abi: 'address:asset', calls: positions }),
    api.multiCall({ abi: 'uint256:assetBalance', calls: positions }),
    api.multiCall({ abi: 'address:debtToken', calls: positions }),
    api.multiCall({ abi: 'uint256:debtBalance', calls: positions }),
  ])

  positions.forEach((_, index) => {
    api.add(assetTokens[index], assetBalances[index])
    api.add(debtTokens[index], negate(debtBalances[index]))
  })
}

module.exports = {
  doublecounted: true,
  arbitrum: { tvl }
}
