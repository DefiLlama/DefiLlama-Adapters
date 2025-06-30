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
      '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
      '0x35fa164735182de50811e8e2e824cfb9b6118ac2',
      '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
      '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    ],
  })
  return await sumTokens2({
    api,
    owner: '0x75231079973C23e9eB6180fa3D2fc21334565aB5',
    tokens: [
      '0x8236a87084f8b84306f72007f36f2618a5634494'
    ],
  })
}

module.exports = {
  ethereum: { 
    doublecounted: true,
    tvl: tvl,
  }
}
