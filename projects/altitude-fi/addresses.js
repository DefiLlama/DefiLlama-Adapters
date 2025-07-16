const vaults = [
  {
    name: 'wstethUsdc v1',
    address: '0x1f7d589e90e4E4FC1B15B3143a5c60F743C759b9',
    supplyToken:'0x874566FfA8d837934aE85Db2209839F5Fb4E6b1d',
    underlyingSupplyToken:'0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
    debtToken:'0xd130a916dDbF1612C2F2FAAb6897210f056Ab29b',
    underlyingBorrowToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  },
  {
    name: 'wstethUsdc v2',
    address: '0xaf6062222d00ac63477ad084ebd22a7821e5ee8d',
    supplyToken:'0x5c58dffc753ba61e07a73a021f70366ab69c1f06',
    underlyingSupplyToken:'0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0', // wstETH
    debtToken:'0x5717f3f1b566cf2f7113979fcd78d9416f5b0056',
    underlyingBorrowToken:'0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  },
  {
    name: 'cbbtcUsdc v2',
    address: '0x550F8a1FFC921b9179267F9e7909FC68CE496A6b',
    supplyToken: '0x2Ddd6d576615E6AFa823adeDDe8DC67198333169',
    underlyingSupplyToken: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf', // cbBTC
    debtToken: '0xDF612bf20C2A68730cEDC5056a1F1A90c6827e66',
    underlyingBorrowToken: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  }
]

module.exports = {
  vaults
}