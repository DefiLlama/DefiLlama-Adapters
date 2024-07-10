const RWAToken = '0x4644066f535Ead0cde82D209dF78d94572fCbf14'.toLowerCase()
const veRWA = '0xa7B4E29BdFf073641991b44B283FD77be9D7c0F4'.toLowerCase()

module.exports = {
  misrepresentedTokens: true,
  real: { tvl }
}
  
async function tvl(api) {
  const locked = await api.call({ abi: 'erc20:balanceOf', target: RWAToken, params: veRWA })
  api.addCGToken('re-al', locked/1e18)
}