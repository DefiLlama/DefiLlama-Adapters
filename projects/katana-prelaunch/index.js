const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  const vaults = [
    '0xF470EB50B4a60c9b069F7Fd6032532B8F5cC014d',
    '0xA5DaB32DbE68E6fa784e1e50e4f620a0477D3896',
    '0xe1Ac97e2616Ad80f69f705ff007A4bbb3655544a',
    '0x77570CfEcf83bc6bB08E2cD9e8537aeA9F97eA2F',
  ];

  await api.erc4626Sum({ api, calls: vaults, tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets', permitFailure: true })
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
  },
  hallmarks: [
    [1751324400, "vbAssets migration to Katana mainnet"]
  ]
}
