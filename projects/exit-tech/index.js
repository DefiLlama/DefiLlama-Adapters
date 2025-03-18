const { getLogs2 } = require('../helper/cache/getLogs')

async function tvl(api) {
  const logs = await getLogs2({ api, factory:'0xA1506e8f078225C4F9a20Cf1f9e3660D9dA691CA', eventAbi: 'event ExitVaultDeployed (uint256 vaultId, address indexed vault, address indexed owner, uint256 donationGmx, uint256 donationGlp, uint256 nonce, string indexed refcode)', fromBlock: 306470740, })
  const vaults = logs.map(log => log.vault)
  return api.sumTokens({ owners: vaults, tokens: ['0xf42Ae1D54fd613C9bb14810b0588FaAa09a426cA']})
}


module.exports = {
  arbitrum: { tvl }
}