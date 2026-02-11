const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require("../helper/cache");

const sanitizeAndValidateEvmAddresses = (addresses) => {
  return addresses
    .map((address) => address.replace(/_$/, ""))
    .filter((address) => /^0x[a-fA-F0-9]{40}$/.test(address));
};

const vaults = [
  '0x52E4d8989fa8b3E1C06696e7b16DEf5d7707A0d1', // bobaETH
  '0xA8A3A5013104e093245164eA56588DBE10a3Eb48', // ssETH
  '0x6C587402dC88Ef187670F744dFB9d6a09Ff7fd76', // FETH
  '0x5d82Ac302C64B229dC94f866FD10EC6CcF8d47A2', // rariETH
  '0x66E47E6957B85Cf62564610B76dD206BB04d831a', // earnBTC
  '0x9Ed15383940CC380fAEF0a75edacE507cC775f22', // earnETH
  '0x196ead472583bc1e9af7a05f860d9857e1bd3dcc', // unifiETH
  '0x19e099B7aEd41FA52718D780dDA74678113C0b32', // tETH
  '0x9fAaEA2CDd810b21594E54309DC847842Ae301Ce', // seiyanETH
  '0xa5f78b2a0ab85429d2dfbf8b60abc70f4cec066c', // nCREDIT
  '0x593cCcA4c4bf58b7526a4C164cEEf4003C6388db', // nALPHA
  '0x64ab176c545bb85eca75d53c3ffcb361deafb855', // inALPHA
  '0xe3BEFC4eAA73803774F4d878417fa5e09193a75A', // opnALPHA
  '0x11113Ff3a60C2450F4b22515cB760417259eE94B', // nBASIS
  '0x1caad1a4028f80e2f142dbae46e6af5bb78e7d98', // opnBASIS
  '0xe72fe64840f4ef80e3ec73a1c749491b5c938cb9', // nTBILL
  '0xa6CBB3544621152c7002795067Ae8F2F5A18afcf', // opnTBILL
  '0xbfc5770631641719cd1cf809d8325b146aed19de', // nINSTO
  '0xb52b090837a035f93a84487e5a7d3719c32aa8a9', // nPAYFI
  '0xdeA736937d464d288eC80138bcd1a2E109A200e3', // nETF
  '0xDEa149f84859d1eC50480c209b71bFFa482b0530', // inTBILL
  '0x9fbc367b9bb966a2a537989817a088afcaffdc4c', // nELIXIR
  '0xd3bfd6e6187444170a1674c494e55171587b5641', // inELIXIR
  '0x82c40e07277eBb92935f79cE92268F80dDc7caB4', // unifiUSD
  '0x170d847a8320f3b6a77ee15b0cae430e3ec933a0', // unifiBTC
  ADDRESSES.plume_mainnet.pUSD, // pUSD
]

const tvl = async (api, chainId) => {
  const tokens = await getConfig(`nucleus-tokens-${chainId}`, `https://backend.nucleusearn.io/v1/protocol/tokens?chain_id=${chainId}`)
  const sanitizeTokens = sanitizeAndValidateEvmAddresses(tokens)

  const [symbols, decimals] = await Promise.all([
    api.multiCall({ calls: sanitizeTokens, abi: 'erc20:symbol', permitFailure: true }),
    api.multiCall({ calls: sanitizeTokens, abi: 'erc20:decimals', permitFailure: true })
  ])

  const erc20Tokens = sanitizeTokens.map((token, index) => {
    const symbol = symbols[index]
    const decimal = decimals[index]
    if (!symbol || !decimal) return null;
    return token
  }).filter(Boolean)

  return api.sumTokens({ owners: vaults, tokens: erc20Tokens })
}

module.exports = {
  hallmarks: [
    ["2025-12-19", "Nucleus protocol deprecated"]
  ],
  deadFrom: "2025-12-19",
  ethereum: { tvl: (api) => tvl(api, 1) },
  plume_mainnet: { tvl: (api) => tvl(api, 98866) },
  arbitrum: { tvl: (api) => tvl(api, 42161) },
  swellchain: { tvl: (api) => tvl(api, 1923) },
}