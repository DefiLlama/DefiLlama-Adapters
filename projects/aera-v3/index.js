const { ethers } = require("ethers");

const topics = {
    MultiDepositorVault_VaultCreated: ethers.id("VaultCreated(address,address,address,(string,string),(address,address,address),address,string)"),
    SingleDepositorVault_VaultCreated: ethers.id("VaultCreated(address,address,address,(string,string),(address,address,address),address,string)"),
}
const eventAbis = {
    MultiDepositorVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address hooks, (string name, string symbol) erc20Params, (address feeCalculator, address feeToken, address feeRecipient) feeVaultParams, address beforeTransferHook, string description)',
    SingleDepositorVault_VaultCreated: 'event VaultCreated(address indexed vault, address indexed owner, address submitHooks, address feeToken, address feeCalculator, address feeRecipient, string description)',
}
const contracts = {
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
const { getLogs } = require('../helper/cache/getLogs')

async function getMultiDepositorVaults(api) {
    const vaults = [];
    const factory = contracts[api.chain].multiDepositorVaultFactory;
    const logs = await getLogs({
        api,
        target: factory.address,
        topic: factory.topic,
        topics: factory.topics,
        eventAbi: factory.eventAbi,
        fromBlock: factory.fromBlock,
        onlyArgs: true,
    });
    vaults.push(...logs.map(x => x.vault))
    return vaults;
}

async function tvl(api) {
    const multiDepositorVaults = await getMultiDepositorVaults(api);

    // Compute TVL for multi depositor vaults
    // TODO: Add single depositor vaults
    await Promise.all(multiDepositorVaults.map(async (vault) => {
        const [totalSupply, feeCalculator, decimals ] = await Promise.all([
            api.call({
                abi: 'function totalSupply() view returns (uint256)',
                target: vault,
            }),
            api.call({
                abi: 'function feeCalculator() view returns (address)',
                target: vault,
            }),
            api.call({
                abi: 'function decimals() view returns (uint8)',
                target: vault,
            }),
        ])

        const [numeraireToken, vaultState] = await Promise.all([
            api.call({
                abi: 'function NUMERAIRE() view returns (address)',
                target: feeCalculator,
            }),
            api.call({
                abi: 'function getVaultState(address vault) external view returns ((bool paused, uint8 maxPriceAge, uint16 minUpdateIntervalMinutes, uint16 maxPriceToleranceRatio, uint16 minPriceToleranceRatio, uint8 maxUpdateDelayDays, uint32 timestamp, uint24 accrualLag, uint128 unitPrice, uint128 highestPrice, uint128 lastTotalSupply))',
                target: feeCalculator,
                params: [vault],
            }),
        ])

        const unitPrice = vaultState[8];
        const numeraireBalance = totalSupply * unitPrice / 10 ** decimals;

        api.add(numeraireToken, numeraireBalance);
    }));
}

module.exports = {
  methodology: 'Counts tokens held directly in Aera vaults, as well as all managed DeFi positions.',
  start: 1748414859,
  base: { tvl },
  ethereum: { tvl },
};
