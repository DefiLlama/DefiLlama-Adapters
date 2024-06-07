const { sumTokens2 } = require('../helper/unwrapLPs')
const { getConfig } = require('../helper/cache')

const v1Vaults = [
  '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e',
  '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c',
  '0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a',
  '0xACd43E627e64355f1861cEC6d3a6688B31a6F952',
  '0x2f08119C6f07c006695E079AAFc638b8789FAf18',
  '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1',
  '0x2994529C0652D127b7842094103715ec5299bBed',
  '0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6',
  '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
  '0x9cA85572E6A3EbF24dEDd195623F188735A5179f',
  '0xec0d8D3ED5477106c6D4ea27D90a60e594693C90',
  '0x629c759D1E83eFbF63d84eb3868B564d9521C129',
  '0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF',
  '0xcC7E70A958917cCe67B4B87a8C30E6297451aE98',
  '0x98B058b2CBacF5E99bC7012DF757ea7CFEbd35BC',
  '0xE0db48B4F71752C4bEf16De1DBD042B82976b8C7',
  '0x5334e150B938dd2b6bd040D9c4a03Cff0cED3765',
  '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3',
  '0xF6C9E9AF314982A4b38366f4AbfAa00595C5A6fC',
  '0xA8B1Cb4ed612ee179BDeA16CCa6Ba596321AE52D',
  '0x46AFc2dfBd1ea0c0760CAD8262A5838e803A37e5',
  '0x5533ed0a3b83F70c3c4a1f69Ef5546D3D4713E44',
  '0x8e6741b456a074F0Bc45B8b82A755d4aF7E965dF',
  '0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab',
  '0xE625F5923303f1CE7A43ACFEFd11fd12f30DbcA4',
  '0xBacB69571323575C6a5A3b4F9EEde1DC7D31FBc1',
  '0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75',
  '0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6',
]
const blacklist = [
  '0xbD17B1ce622d73bD438b9E658acA5996dc394b0d',
  '0xc5bDdf9843308380375a611c18B50Fb9341f502A',
  '0x07FB4756f67bD46B748b16119E802F1f880fb2CC',
  '0x7F83935EcFe4729c4Ea592Ab2bC1A32588409797',
  '0x123964EbE096A920dae00Fb795FFBfA0c9Ff4675',
  '0x39546945695DCb1c037C836925B355262f551f55',
    ...v1Vaults,
]

async function tvl(api) {
  if(api.chain==="polygon"){
    const data = await getConfig('yearn/' + api.chain, `https://ydaemon.yearn.finance/vaults/all?chainids=137&limit=100000`)
    await api.erc4626Sum({ calls: data.filter(v=>v.kind==="Multi Strategy").map(v=>v.address),  balanceAbi: 'totalAssets', tokenAbi: "asset" })
  } else {
    const data = await getConfig('yearn/' + api.chain, `https://api.yearn.finance/v1/chains/${api.chainId}/vaults/all`)
    const vaults = data.map(i => i.address).filter(i => !blacklist.includes(i))
    await api.erc4626Sum({ calls: vaults,  balanceAbi: 'totalAssets', })
  }
  if (api.chain === 'ethereum') {
    const tokens = await api.multiCall({ abi: 'address:token', calls: v1Vaults })
    let bals = await api.multiCall({ abi: 'erc20:totalSupply', calls: v1Vaults })
    const ratio = await api.multiCall({ abi: 'uint256:getPricePerFullShare', calls: v1Vaults })
    bals = bals.map((bal, i) => bal * ratio[i] / 1e18)
    api.addTokens(tokens, bals)
  }
  return sumTokens2({ api, resolveLP: true,})
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  timetravel: false,
  fantom: { tvl },
  ethereum: { tvl },
  arbitrum: { tvl },
  optimism: { tvl },
  base: { tvl },
  polygon: { tvl },
  hallmarks: [
    [1594944000, "YFI token Launch"],
  ]
};

