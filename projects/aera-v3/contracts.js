const { ethers } = require("ethers");

const topics = {
    MultiDepositorVault_VaultCreated: ethers.id("VaultCreated(address,address,address,(string,string),(address,address,address),address,string)"),
    SingleDepositorVault_VaultCreated: ethers.id("VaultCreated(address,address,address,(string,string),(address,address,address),address,string)"),
}
const eventAbis = {
    MultiDepositorVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address hooks, (string name, string symbol) erc20Params, (address feeCalculator, address feeToken, address feeRecipient) feeVaultParams, address beforeTransferHook, string description)',
    SingleDepositorVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address submitHooks, address feeToken, address feeCalculator, address feeRecipient, string description)',
}

module.exports = {
    ethereum: {
      fromBlock: 22583788,
      multiDepositorVaultFactory: {
        address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
        fromBlock: 22583788,
        eventAbi: eventAbis.MultiDepositorVault_VaultCreated,
        topics: [topics.MultiDepositorVault_VaultCreated]
      },
      singleDepositorVaultFactory: {
        address: '0x8f1FdB45160234d6E7e3653F5Af8e09A2Ce25AEb',
        fromBlock: 22584116,
        eventAbi: eventAbis.SingleDepositorVault_VaultCreated,
        topics: [topics.SingleDepositorVault_VaultCreated]
      },
    },
    base: {
      fromBlock: 30834355,
      multiDepositorVaultFactory: {
        address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
        fromBlock: 30834355,
        eventAbi: eventAbis.MultiDepositorVault_VaultCreated,
        topics: [topics.MultiDepositorVault_VaultCreated]
      },
      singleDepositorVaultFactory: {
        address: '0x8f1FdB45160234d6E7e3653F5Af8e09A2Ce25AEb',
        fromBlock: 30834356,
        eventAbi: eventAbis.SingleDepositorVault_VaultCreated,
        topics: [topics.SingleDepositorVault_VaultCreated]
      },
    },
  };