const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const ABI = require('./abi.json')

const vaults = {
  USDC: '0x6b416C9727fb248C3097b5c1D10c39a7EBDFf239',
  USDT: '0x8b002cf7380403329627149aA3D730E633BF1D33',
  DAI: '0xdC4c8Bfbf326d5F87fCB58D1a6E5B6E23992E61d',
  WETH: '0xE8FEB169cc9ffbF3873EbfD31e34144672D9D7D0',
  WBTC: '0xd5687bfa0b5EBc020dc726282cFD94086701DF94',
}

async function tvl(_, _b, _cb, { api, }) {
  const balances = {}
    
  for (let token in vaults) {
    const response = await api.call({ target: vaults[token], abi: 
ABI.totalAssets });
    await sdk.util.sumSingleBalance(balances, ADDRESSES.arbitrum[token], 
response, 'arbitrum');
  }

  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology: 'We calculate the TVL as the sum of (deposits + loans + locked profits - losses) for each vault available',
  start: 119401838,
  hallmarks: [
    [1691649008 , "private mainnet launch"]
  ],
  arbitrum: { tvl }
}

