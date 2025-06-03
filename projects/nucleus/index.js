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
]

const tvl = async (api) => {
  // const vaults = Object.keys(await getConfig('nucleus-vaults', "https://backend.nucleusearn.io/v1/protocol/markets"))
  const tokens = await getConfig('nucleus-tokens', "https://backend.nucleusearn.io/v1/protocol/tokens")
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
  ethereum: { tvl }
}