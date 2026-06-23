const ADDRESSES = require('../helper/coreAssets.json')
const { fraxlendExports } = require('../helper/fraxlend');

const registry_config = {
  fraxtal: { blacklistedTokens: [ADDRESSES.fraxtal.FRAX], registry: '0x8c22EBc8f9B96cEac97EA21c53F3B27ef2F45e57', },
  ethereum: { blacklistedTokens: [ADDRESSES.ethereum.FRAX], registry: '0xD6E9D27C75Afd88ad24Cd5EdccdC76fd2fc3A751', },
  arbitrum: { blacklistedTokens: [ADDRESSES.arbitrum.FRAX], registry: '0x0bD2fFBcB0A17De2d5a543ec2D47C772eeaD316d' },
}

module.exports = fraxlendExports(registry_config)