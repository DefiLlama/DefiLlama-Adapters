const { staking } = require("./helper/staking.js");
const { aaveExports } = require('./helper/aave.js');
const sdk = require('@defillama/sdk');
const methodologies = require("./helper/methodologies.js");

// Staking TVLs
const agaveTokenAddress = '0x3a97704a1b25F08aa230ae53B352e2e72ef52843'
const agaveStakingContract = '0x610525b415c1BFAeAB1a3fc3d85D87b92f048221'

const addressesProviderRegistryXDAI = "0x4BaacD04B13523D5e81f398510238E7444E11744"
const protocolDataHelper = '0x24dCbd376Db23e4771375092344f5CbEA3541FC0'

const addressesProviderRegistryXDAI_old = "0xa5E80AEAa020Ae41b1cBEe75dE7826297F7D803E"
const protocolDataHelper_old = '0xa874f66342a04c24b213BF0715dFf18818D24014'
const exportsV1 = aaveExports('', addressesProviderRegistryXDAI, undefined, [protocolDataHelper])
const exportsV2 = aaveExports('', addressesProviderRegistryXDAI_old, undefined, [protocolDataHelper_old])

module.exports = {
  // hallmarks: [
  //   [1647302400, "Reentrancy attack"]
  // ],
  methodology: methodologies.lendingMarket,
  xdai: {
    tvl: sdk.util.sumChainTvls([exportsV1.tvl, exportsV2.tvl,]),
    borrowed: sdk.util.sumChainTvls([exportsV1.borrowed,]),
    staking: staking(agaveStakingContract, agaveTokenAddress)
  }
}
