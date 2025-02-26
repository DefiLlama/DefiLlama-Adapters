const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const vaults = [
  // "0x74E852a4f88bfbEff01275bB95d5ed77f2967d12",
  // "0x78F87aA41a4C32a619467d5B36e0319F3EAf2DA2",
  "0xd62fB1785dc26514657a165BE71e4f8b14A74a44",
  "0x9335B678179D433588a16065C4016133E3c2f523",
  "0x26666a82cfE70E1aD048939708cA3ACc4982cF9F",
  "0x77A0F11926FaaeBe041D723F5B20069FCB4C4c4A",
  "0xBdCD947782cCeBa1CD95430Cd6e403E898342962",
  "0x3A6E624C162133D318476863A5f28E50bcedc9c3",
  "0x8dcb18B561CE7E7b309A2d172bdc2633266dfc85",
  "0x2B9371E53b5301B517c772E117616a5c165081F2",
  "0x9b6Cf6Ab16C409B3a2c796211c274c8a8da28D1d",
  "0x9cE81bC708d6F846E4fA64891982f069941DF0C7",
  "0xC9Dd6792768d1a72Dc75891549B0301e18F702aa",
  "0x583Cc8a82B55A96a9dED97f5353397c85ee8b60E",
  "0xeC5CB1b6849258eEab0613139DFf7698ae256997",
  "0x86a9DcbBf816A99e0422143A8E4A326F6811Fb01",
  "0xC6cFF91faE96Ac93De25A735D2877614522cbC02",
  "0xdf3F6ABbA9Cb5bA375ffeC89bF246800b4Aed3eC",
  "0x849232E2144BD5118B5e4A070FE15035cC07b388",
]

const beraBorrowWberaToken = '0x9158d1b0c9cc4ec7640eaef0522f710dadee9a1b'

const PSMs = [
  '0xCaB847887a2d516Dfa690fa346638429415c089b',
  '0x5623554eCe4E1fd78e8a4ce13D588A8e0053825D',
]

const getAllCollateralsAndDenManagersAbi = "function getAllCollateralsAndDenManagers() view returns ((address collateral, address[] denManagers)[])"

async function tvl(api) {
  const tokens = await api.multiCall({ abi: 'address:asset', calls: vaults })
  const beraTokens = await api.multiCall({ abi: 'address:collVault', calls: vaults })
  const pTokens = await api.multiCall({ abi: 'address:stable', calls: PSMs })
  const denInfos = await api.call({ abi: getAllCollateralsAndDenManagersAbi, target: '0xFA7908287c1f1B256831c812c7194cb95BB440e6' })
  const tokensAndOwners = tokens.map((t, i) => [t, vaults[i]])

  pTokens.forEach((t, i) => tokensAndOwners.push([t, PSMs[i]]))
  denInfos.forEach(({ collateral, denManagers }) => {
    denManagers.forEach(d => tokensAndOwners.push([collateral, d]))
  })

  const infraredLogs = await getLogs2({ api, factory: '0xb71b3DaEA39012Fb0f2B14D2a9C86da9292fC126', eventAbi: 'event NewVault (address _sender, address indexed _asset, address indexed _vault)', fromBlock: 562092, })
  const infraAssets = infraredLogs.map(log => log._asset)
  const names = await api.multiCall({ abi: 'string:name', calls: infraAssets, permitFailure: true, })
  const bbInfraWrappers = infraAssets.filter((a, i) => names[i] && names[i].startsWith('Beraborrow: '))
  const bbInfraWrapperUnderlyings = await api.multiCall({ abi: 'address:underlying', calls: bbInfraWrappers })
  beraTokens.push(beraBorrowWberaToken, ...bbInfraWrappers)
  bbInfraWrapperUnderlyings.forEach((u, i) => tokensAndOwners.push([u, bbInfraWrappers[i]]))
  return api.sumTokens({ tokensAndOwners, blacklistedTokens: beraTokens })
}

module.exports = {
  berachain: { tvl }
}