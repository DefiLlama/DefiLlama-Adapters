# Prism DEX

Prism DEX is a Uniswap V3 fork deployed on MegaETH.

## Deployed Contracts

- **Factory**: `0xef349aa6cc5e87559e716ac293845a48cadf30d5`
- **Chain**: MegaETH (Chain ID: 4326)
- **Position Manager**: `0x9feaf944c518164d5d0c45f28255758acff8e987`
- **Swap Router**: `0x07f0ba43eaa9cdbc1572260f6157a8e89a90fea2`

## Notes

This adapter uses the standard Uniswap V3 helper to calculate TVL from all pools deployed via the factory contract.

MegaETH chain configuration will need to be added to the DefiLlama SDK for full functionality.
