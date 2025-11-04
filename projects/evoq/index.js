const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const evoq = '0xF9C74A65B04C73B911879DB0131616C556A626bE'
const lens = '0x5576207849D570bfE1acB6004595561851813198'

const tokens = [
    "0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B", // vBTC
    "0xfD5840Cd36d94D7229439859C0112a4185BC0255", // vUSDT
    "0xA07c5b74C9B40447a954e1466938b865b6BBea36", // vBNB
    "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8", // vUSDC
    "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba", // vFDUSD
    "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8", // vETH
    "0x0C1DA220D301155b87318B90692Da8dc43B67340", // vUSD1
]

async function borrowed(api) {
  const abi = "function getTotalMarketBorrow(address _poolToken) view returns (uint256 p2pBorrowAmount, uint256 poolBorrowAmount)"
  const borrowDatas = await api.multiCall({ abi, calls: tokens, target: lens })
  await Promise.all(borrowDatas.map(async (v, i) => {
    let underlyingToken;
    if(tokens[i] === "0xA07c5b74C9B40447a954e1466938b865b6BBea36") {
      underlyingToken = ADDRESSES.null
    } else {
      underlyingToken = await api.call({ abi: 'address:underlying', target: tokens[i] })
    }
    await api.add(underlyingToken, Number(v[0]) + Number(v[1]))
  }))
}

module.exports['bsc'] = {
  tvl: async (api) => {
    return sumTokens2({ api, tokensAndOwners: tokens.map((token) => ([token, evoq])) })
  },
  borrowed: () => ({}), // dont think people will repay
}
