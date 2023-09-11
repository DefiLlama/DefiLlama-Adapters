const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')
const loanCoreAddress = '0x89bc08BA00f135d608bc335f6B33D7a9ABCC98aF'

const endpoint = 'https://api.arcade.xyz/api/v2/loans?state=Active'

async function tvl(_, _b, _cb, { api, }) {
  const data = await getConfig('arcade-xyz/v3', endpoint)
  const tokensAndOwners = data
  .filter(i => i.protocolVersion === '3' && i.collateralKind === 'VAULT')
  .map(({ collateral: i, vaultAddress }) => i.filter(i => i.kind === 'ERC721').map(i => [i.collectionAddress, vaultAddress]))
  .flat()

  await sumTokens2({api, tokensAndOwners, blacklistedOwners: [loanCoreAddress], permitFailure: true, })
  return sumTokens2({ owner: loanCoreAddress, resolveNFTs: true, api})

}


module.exports = {
  ethereum: { tvl, },
}