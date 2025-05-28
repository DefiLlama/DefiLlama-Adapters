const ADDRESSES = require('../helper/coreAssets.json')
const { getConfig } = require('../helper/cache')
const { sumTokensExport } = require('../helper/sumTokens')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { sumTokensExport: tonExport } = require('../helper/chain/ton')
const { nullAddress } = require('../helper/tokenMapping');

const ABI = {
  wantLockedTotal: "uint256:wantLockedTotal",
  farms: "function farms(address) view returns (address)"
}

const vaults = {
  bsc: '0x89c527764f03BCb7dC469707B23b79C1D7Beb780',
  celo: '0x979cD0826C2bf62703Ef62221a4feA1f23da3777',
  ethereum: '0x1bf68a9d1eaee7826b3593c20a0ca93293cb489a',
  heco: '0x38C92A7C2B358e2F2b91723e5c4Fc7aa8b4d279F',
  klaytn: '0x9abc3f6c11dbd83234d6e6b2c373dfc1893f648d',
  polygon: '0x506DC4c6408813948470a06ef6e4a1DaF228dbd5',
  meta: '0x292A00F3b99e3CB9b324EdbaA92258C3C61b55ab',
  wemix: '0x445F863df0090f423A6D7005581e30d5841e4D6d',
  silicon_zk: '0x5aAAcf28ECDd691b4a657684135d8848d38236Bb'
}

const SILICON_RECOVERY = '0xac6b4b573df32f31e933c2c8a58d5e334690e0ee'

// tokens on silicon bridged from ethereum
const SILICON_TOKENS = [
  ADDRESSES.null,// ETH
  ADDRESSES.astarzk.DAI, // DAI
  ADDRESSES.astarzk.USDC, // USDC
  ADDRESSES.astarzk.USDT, // USDT
  ADDRESSES.astarzk.WBTC // WBTC
]

const farms = {
  bsc: [
    ADDRESSES.null,// BNB
    ADDRESSES.bsc.USDT,// USDT-B
    ADDRESSES.bsc.BUSD,// BUSD
    '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',// CAKE
  ],
  ethereum: [
    ADDRESSES.null,// ETH
    ADDRESSES.ethereum.USDT,// USDT
    ADDRESSES.ethereum.DAI,// DAI
    ADDRESSES.ethereum.USDC,// USDC
    ADDRESSES.ethereum.WBTC,// WBTC
  ]
}

let tokenData

async function tvl(api) {
  const chain = api.chain

  if (chain === 'meta') return {} // rpc issues with meta

  const vault = vaults[chain]
  let targetChain = chain
  if (chain === 'ethereum') targetChain = 'eth'
  if (chain === 'polygon') targetChain = 'matic'
  if (chain === 'silicon_zk') targetChain = 'silicon'

  const tokenListURL = 'https://bridge.orbitchain.io/open/v1/api/monitor/rawTokenList'
  tokenData = tokenData || getConfig('orbit-bridge', tokenListURL)
  const data = await tokenData

  let tokenList = data.origins.filter(x => x.chain === targetChain && !x.is_nft).map(x => x.address)
  tokenList.push(nullAddress)
  await sumTokens2({
    api,
    owner: vault, tokens: tokenList, blacklistedTokens: [
      '0x662b67d00a13faf93254714dd601f5ed49ef2f51' // ORC, blacklist project's own token
      // reason for skipping, most of the tvl comes from this transaction which is about 25% of ORU supply on ETH
      // https://etherscan.io/tx/0x0a556fcef2a867421ec3941251ad3c10ae1402a23ddd9ad4b1097b686ced89f7
    ]
  })

  if (farms[chain]) {
    const calls = farms[chain]
    const farmData = await api.multiCall({ target: vault, abi: ABI.farms, calls, })
    const farmBalance = await api.multiCall({ abi: ABI.wantLockedTotal, calls: farmData, })
    api.add(farms[chain], farmBalance)
  }

  if (chain === 'silicon_zk') {
    await sumTokens2({
      api,
      owner: SILICON_RECOVERY, tokens: SILICON_TOKENS
    })
  }
}

module.exports = {
  methodology: 'Tokens locked in Orbit Bridge contract are counted as TVL',
  timetravel: false,
  bsc: { tvl },
  celo: { tvl },
  heco: { tvl },
  ethereum: { tvl },
  klaytn: { tvl },
  polygon: { tvl },
  meta: { tvl },
  wemix: { tvl },
  silicon_zk: { tvl },
  ripple: {
    tvl: sumTokensExport({ owner: 'rJTEBWu7u1NcJAiMQ9iEa1dbsuPyhTiW23' })
  },
  ton: {
    tvl: tonExport({ owner: "EQDXbWI3jClPS510by25zTA8SUKMa4XSD2K7DbZb0jincPGw", tokens: [ADDRESSES.null], onlyWhitelistedTokens: true }),
  },
}