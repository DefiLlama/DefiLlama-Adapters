module.exports = {
  ADDRESS_ZERO: '0x0000000000000000000000000000000000000000',
  EXPIRATION_START_FROM: 1605000000,
  NETWORK_MAINNET: {
    id: 1,
    name: 'ethereum',
    vaults: ['0xbab1e772d70300422312dff12daddcb60864bd41']
  },
  ABI_SHORT: {
    asset: {
      inputs: [],
      name: 'asset',
      outputs: [
        {
          internalType: 'contract IERC20Metadata',
          name: '',
          type: 'address'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    }
  }
}
