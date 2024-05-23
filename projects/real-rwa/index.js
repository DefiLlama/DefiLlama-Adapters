const ADDRESSES = require('../helper/coreAssets.json')
const RWAToken = ADDRESSES.real.RWA

module.exports = {
  misrepresentedTokens: true,
  methodology: 'counts the number of RWA tokens in the voting escrow contract. Then multiplies it by RWA price.',
  real: { tvl }
}
  
async function tvl(api) {
  const votingEscrow = '0xa7B4E29BdFf073641991b44B283FD77be9D7c0F4'.toLowerCase()
  const lockedRWA = await api.call({ abi: 'erc20:balanceOf', target: RWAToken, params: votingEscrow })
  api.addCGToken(RWAToken, lockedRWA)
}