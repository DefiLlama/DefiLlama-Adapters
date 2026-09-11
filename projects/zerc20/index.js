const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

// Each zERC20 LiquidityManager custodies the underlying asset deposited when users wrap
// into the zAsset. Addresses: github.com/kbizikav/zERC20/tree/main/config/deployed/mainnet
const zETH_LM = '0xcC10b7098FEf1aB2f0FF3bE91d2A7B3230b90CF0'
const zUSDC_LM = '0x04be137Df79bE7B5F3314C4a84D1C5E0d99BD477'
const zBNB_LM = '0x39Cc069dF606c7bc8c79b0ADd0696BCaf548eFD9'
const zJPYC_LM = '0x12609C3a7A1A212953417c90472cDCF034965A1c'
const JPYC = '0xE7C3D8C9a439feDe00D2600032D5dB0Be71C3c29'

const config = {
  ethereum: [[ADDRESSES.null, zETH_LM], [ADDRESSES.ethereum.USDC, zUSDC_LM]],
  arbitrum: [[ADDRESSES.null, zETH_LM], [ADDRESSES.arbitrum.USDC_CIRCLE, zUSDC_LM]],
  base: [[ADDRESSES.null, zETH_LM], [ADDRESSES.base.USDC, zUSDC_LM]],
  bsc: [[ADDRESSES.null, zBNB_LM]],
  polygon: [[JPYC, zJPYC_LM]],
  klaytn: [[JPYC, zJPYC_LM]], // Kaia
}

module.exports = {
  methodology: 'TVL is the underlying ETH, USDC, BNB and JPYC held by the zERC20 LiquidityManager contracts, which custody the assets users deposit when wrapping into zETH, zUSDC, zBNB and zJPYC.',
}

Object.entries(config).forEach(([chain, tokensAndOwners]) => {
  module.exports[chain] = { tvl: sumTokensExport({ tokensAndOwners }) }
})
