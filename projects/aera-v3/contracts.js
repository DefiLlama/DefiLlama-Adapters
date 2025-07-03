const { ethers } = require("ethers");

const topics = {
    MultiDepositorVault_VaultCreated: ethers.id("VaultCreated(address,address,address,(string,string),(address,address,address),address,string)"),
    BaseVault_VaultCreated: ethers.id("VaultCreated(address,address,address,string)"),
    SingleDepositorVault_VaultCreated: ethers.id("VaultCreated(address,address,address,(string,string),(address,address,address),address,string)"),
    MetaMorpho_CreateMetaMorpho: ethers.id("CreateMetaMorpho(address indexed,address indexed,address,uint256,address indexed,string,string,bytes32)"),
}
const eventAbis = {
    MultiDepositorVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address hooks, (string name, string symbol) erc20Params, (address feeCalculator, address feeToken, address feeRecipient) feeVaultParams, address beforeTransferHook, string description)',
    BaseVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address submitHooks, string description)',
    SingleDepositorVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address submitHooks, address feeToken, address feeCalculator, address feeRecipient, string description)',
    MetaMorpho_CreateMetaMorpho: 'event CreateMetaMorpho(address indexed metaMorpho, address indexed caller, address initialOwner, uint256 initialTimelock, address indexed asset, string name, string symbol, bytes32 salt)',
}

module.exports = {
    ethereum: {
      fromBlock: 22583788,
      morphoBlue: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
      metaMorphoFactories: [
        {
          address: '0x1897A8997241C1cD4bD0698647e4EB7213535c24',
          fromBlock: 21439510,
          eventAbi: eventAbis.MetaMorpho_CreateMetaMorpho,
          topic: topics.MetaMorpho_CreateMetaMorpho
        },
        {
          address: '0xa9c3d3a366466fa809d1ae982fb2c46e5fc41101',
          fromBlock: 18925584,
          eventAbi: eventAbis.MetaMorpho_CreateMetaMorpho,
          topic: topics.MetaMorpho_CreateMetaMorpho
        }
      ],
      vaultFactories: {
          multiDepositorVaultFactory: {
              address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
              fromBlock: 22583788,
              eventAbi: eventAbis.MultiDepositorVault_VaultCreated,
              topics: [topics.MultiDepositorVault_VaultCreated]
          },
          baseVaultFactory: {
              address: '0x1A8E10A9503e747Aeb81DA5941bCDa6C6a9741B9',
              fromBlock: 22583788,
              eventAbi: eventAbis.BaseVault_VaultCreated,
              topics: [topics.BaseVault_VaultCreated]
            },
          singleDepositorVaultFactory: {
              address: '0x8f1FdB45160234d6E7e3653F5Af8e09A2Ce25AEb',
              fromBlock: 22584116,
              eventAbi: eventAbis.SingleDepositorVault_VaultCreated,
              topics: [topics.SingleDepositorVault_VaultCreated]
          },
      },    
    },
    base: {
      fromBlock: 30834355,
      morphoBlue: '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb',
      metaMorphoFactories: [
        {
          address: '0xFf62A7c278C62eD665133147129245053Bbf5918',
          fromBlock: 23928808,
          eventAbi: eventAbis.MetaMorpho_CreateMetaMorpho,
          topic: topics.MetaMorpho_CreateMetaMorpho
        },
        {
          address: '0xA9c3D3a366466Fa809d1Ae982Fb2c46E5fC41101',
          fromBlock: 13978134,
          eventAbi: eventAbis.MetaMorpho_CreateMetaMorpho,
          topic: topics.MetaMorpho_CreateMetaMorpho
        }
      ],
      vaultFactories: {
          multiDepositorVaultFactory: {
              address: '0x29722cC9a1cACff4a15914F9bC274B46F3b90B4F',
              fromBlock: 30834355,
              eventAbi: eventAbis.MultiDepositorVault_VaultCreated,
              topics: [topics.MultiDepositorVault_VaultCreated]
            },
          baseVaultFactory: {
              address: '0x1A8E10A9503e747Aeb81DA5941bCDa6C6a9741B9',
              fromBlock: 30834356,
              eventAbi: eventAbis.BaseVault_VaultCreated,
              topics: [topics.BaseVault_VaultCreated]
          },
          singleDepositorVaultFactory: {
              address: '0x8f1FdB45160234d6E7e3653F5Af8e09A2Ce25AEb',
              fromBlock: 30834356,
              eventAbi: eventAbis.SingleDepositorVault_VaultCreated,
              topics: [topics.SingleDepositorVault_VaultCreated]  
          },
      },
    },
  };