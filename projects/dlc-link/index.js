const sdk = require('@defillama/sdk')
async function tvl({ timestamp }) {
  const api = new sdk.ChainApi({ chain: 'arbitrum', timestamp })
  await api.getBlock()
  const dlcBTC = '0x050C24dBf1eEc17babE5fc585F06116A259CC77A'
  api.add(dlcBTC, await api.call({ target: dlcBTC, abi: 'erc20:totalSupply' }))
  return api.getBalances()
}

module.exports = {
  bitcoin: { tvl },
  methodology: `TVL for dlcBTC consists of the total supply of dlcBTC tokens minted.`,
};
