const VEPOCH_CONTRACT_ADDRESS = "0x731a2572b1cf56cfb804c74555715c8c8b5e980b";
const ITO_CONTRACT_ADDRESS = "0x44DE78EB54EE54C4151e62834D3B5a29005Bde98";
const { staking } = require('../helper/staking');
const { sumTokensExport } = require('../helper/unwrapLPs');

const config = {
  ethereum: { EPOCH: '0x97D0CfEB4FdE54B430307c9482d6f79C761Fe9B6', },
  base: { EPOCH: '0x287f0D88e29a3D7AEb4d0c10BAE5B902dB69B17D', },
  arbitrum: { EPOCH: '0x4939ac5c1855302891c5888634b2f65cc30b9155', },
  optimism: { EPOCH: '0xd1cac46a9a77169C310c2C780A4267eE6CA884f5', },
}

module.exports = {
  start: 1700179200,
  hallmarks: [
    [1700179200, "vEPOCH Launch"],
    [1704240000, "ITO Launch"]
  ],
};

Object.keys(config).forEach(chain => {
  const { EPOCH, } = config[chain]
  module.exports[chain] = {
    tvl: sumTokensExport({ blacklistedTokens: [EPOCH], owner: ITO_CONTRACT_ADDRESS, fetchCoValentTokens: true, })
  }
})
module.exports.ethereum.pool2 = staking(VEPOCH_CONTRACT_ADDRESS, "0x82b8c7c6Fb62D09CfD004309c1F353FB1A926Edc");