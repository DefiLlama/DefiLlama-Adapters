const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')

const fidenzavault = '0xfCEed70c8E9f38A0c3A0062D40d0Ab06493063a1' 
const rockvault = '0x185B6B13Be7cEfa99262AF1F78ae87213E4DDD3d' 
const baycvault2 = '0x417c53C3B63a03aeb614b7b625ae84Cfc7eecD1c'
const squigglevault = '0x5D40A087cec071cd3b8A7AF4B45b3D56D6c3f952'
const penguvault = '0x8facab18b9f4cd1a9f90876290c9bfa238cd4e45'
const miladyvault = '0x861ff455dcd810895cb4050460e4b6a47fec3304'
const insrtVaults = [ fidenzavault, rockvault, baycvault2, squigglevault, penguvault, miladyvault ]
const vaulttokens = [nullAddress, '0xa3f5998047579334607c47a6a2889bf87a17fc02', '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d', '0xbd3531da5cf5857e7cfaa92426877b022e612cf8', '0x524cab2ec69124574082676e6f654a18df49a048', '0x062e691c2054de82f28008a8ccc6d7a1c8ce060d', '0x5Af0D9827E0c53E4799BB226655A1de152A425a5' ]

async function tvl(api) {
  await vaultTvl(api, [punkvault, baycvault, ])
  return sumTokens2({ api, owners: insrtVaults , tokens: vaulttokens, resolveArtBlocks: true, })
}

// ERC721 Vaults
const punkvault = "0x70993a6dfe0ef2d5253d6498c18d815a6c139163"
const baycvault = "0x6d0c967b6e24ae33c015595aaa2303001af4055d"

async function vaultTvl(api, vaults) {
  const colls = await api.multiCall({  abi: 'address:collection', calls: vaults}) 
  const ids = await api.multiCall({  abi: 'uint256[]:ownedTokenIds', calls: vaults}) 
  api.addTokens(colls,ids.map(i=> i.length))
}

module.exports = {
  methodology: `Value of all the NFTs held by the insrt finance's vaults`,
  ethereum: { tvl }
}