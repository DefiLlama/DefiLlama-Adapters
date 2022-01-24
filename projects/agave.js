const { staking } = require("./helper/staking.js");
const { aaveChainTvl} = require('./helper/aave.js'); 

// Staking TVLs
const agaveTokenAddress = '0x3a97704a1b25F08aa230ae53B352e2e72ef52843'
const agaveStakingContract = '0x610525b415c1BFAeAB1a3fc3d85D87b92f048221'

const addressesProviderRegistryXDAI = "0xa5E80AEAa020Ae41b1cBEe75dE7826297F7D803E"
const protocolDataHelper = '0xa874f66342a04c24b213BF0715dFf18818D24014'

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  xdai:{
    tvl: aaveChainTvl("xdai", addressesProviderRegistryXDAI, addr=>`xdai:${addr}`, [protocolDataHelper], false),
    borrowed: aaveChainTvl("xdai", addressesProviderRegistryXDAI, addr=>`xdai:${addr}`, [protocolDataHelper], true),
    staking: staking(agaveStakingContract, agaveTokenAddress, chain="xdai")
  }
};