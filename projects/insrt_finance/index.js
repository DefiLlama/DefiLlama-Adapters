const { sumTokens2 } = require('../helper/unwrapLPs')

const fidenzavault = '0xfCEed70c8E9f38A0c3A0062D40d0Ab06493063a1' 
const rockvault = '0x185B6B13Be7cEfa99262AF1F78ae87213E4DDD3d' 
const baycvault2 = '0x417c53C3B63a03aeb614b7b625ae84Cfc7eecD1c'
const squigglevault = '0x5D40A087cec071cd3b8A7AF4B45b3D56D6c3f952'
const insrtVaults = [ fidenzavault, rockvault, baycvault2, squigglevault ]

async function tvl(_, _b, _cb, { api, }) {
  await vaultTvl(api, [punkvault, baycvault, ])
  return sumTokens2({ api, owners: insrtVaults , tokens: ['0xa3f5998047579334607c47a6a2889bf87a17fc02'], resolveArtBlocks: true, })
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