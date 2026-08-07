const ADDRESSES = require('../helper/coreAssets.json')

const VAULT = '0x6981021fe4A69b14488b9f9f86d06c17297a8fBF' // VaultMintCurve (VMINT)
const DAI = ADDRESSES.ethereum.DAI

async function tvl(api) {
  const daiBalance = await api.call({
    target: DAI,
    abi: 'erc20:balanceOf',
    params: [VAULT],
  })
  api.add(DAI, daiBalance)
}

module.exports = {
  methodology: 'TVL is the DAI held in the VaultMintCurve contract backing the bonding curve.',
  ethereum: { tvl },
}
