const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const vaults = [
    '0xcc6a16Be713f6a714f68b0E1f4914fD3db15fBeF',
    '0x92C82f5F771F6A44CfA09357DD0575B81BF5F728',
    '0x7B5A0182E400b241b317e781a4e9dEdFc1429822',
    '0x48c03B6FfD0008460F8657Db1037C7e09dEedfcb',
  ];

  await api.erc4626Sum({api, calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true })
  await sumTokens2({
    api,
    owner: '0x69d210d3b60E939BFA6E87cCcC4fAb7e8F44C16B',
    tokens: [
      ADDRESSES.ethereum.WEETH,
      ADDRESSES.ethereum.EETH,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.STETH,
      ADDRESSES.ethereum.WSTETH,
    ],
  })
  return await sumTokens2({
    api,
    owner: '0x75231079973C23e9eB6180fa3D2fc21334565aB5',
    tokens: [
      ADDRESSES.ethereum.LBTC
    ],
  })
}

module.exports = {
  ethereum: { 
    doublecounted: true,
    tvl: tvl,
  }
}
