const { staking } = require('../helper/staking')
const { nullAddress } = require('../helper/tokenMapping')

const SWING = '0x89Cf5C1b3bc04ea54795B37A85258F1dfC9c31dF'
const HOLDER_VAULT = '0x2e6970112417dd28341976Cb5E1Fc479dd5d2F58'

const ETH_OWNERS = [
  '0xa22aB327373EF932239FF0AEC7E0BB746eD00Da2', // ETHSettlementVault
  HOLDER_VAULT,
  '0x538177Ab16B34Ff5ce95BebFdeA5f0A2A16313D3', // FeeKeep
]

async function tvl(api) {
  return api.sumTokens({ owners: ETH_OWNERS, tokens: [nullAddress] })
}

module.exports = {
  methodology:
    'TVL counts ETH held by the ETH Settlement Vault, Holder Vault, and FeeKeep. Staked Swing is reported separately. The protocol-native Swing settlement reserve and the official Uniswap v4 pool are excluded.',
  ethereum: {
    tvl,
    staking: staking(HOLDER_VAULT, SWING),
  },
}
