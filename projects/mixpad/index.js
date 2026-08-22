const { getLogs2 } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const WETH = ADDRESSES.robinhood.WETH
const USDG = ADDRESSES.robinhood.USDG

const LENS = '0xC67c0374F56a0a6aDAC1A7CCF3f31a8b5e8383Bf'

const TOKEN_LAUNCHED = 'event TokenLaunched(address indexed token, address indexed deployer, bytes32 indexed poolId, uint256 positionId, uint256 initialBuyAmount, uint16 buybackBurnBps)'

// Each factory has its own fromBlock (the block it was deployed at)
const FACTORIES = [
  { address: '0x819d0ADB0F60Cf5C2BCE503a7b1674Df04b0894c', fromBlock: 36572084 }, // MixpadFactory
  { address: '0x448Ab965ee15f899b73D078717E632aC3D74ac65', fromBlock: 33613000 }, // LaunchFactory v1 (legacy)
  { address: '0x27c9089140da7d24a1cd977e080d69b62cc53f4f', fromBlock: 36572084 }, // RwaFactory
]

const LENS_ABI = 'function getTvl(address[] mixpadTokens, address[] launchTokens, address[] rwaTokens) view returns (uint256 totalWeth, uint256 totalUsdg)'

async function tvl(api) {
  const tokenLists = await Promise.all(
    FACTORIES.map(async ({ address, fromBlock }) => {
      const logs = await getLogs2({ api, target: address, eventAbi: TOKEN_LAUNCHED, fromBlock })
      return logs.map(l => l.token)
    })
  )
  const [mixpadTokens, launchTokens, rwaTokens] = tokenLists

  const result = await api.call({
    abi: LENS_ABI,
    target: LENS,
    params: [mixpadTokens, launchTokens, rwaTokens],
  })

  api.add(WETH, result.totalWeth)
  api.add(USDG, result.totalUsdg)
}

module.exports = {
  methodology: 'TVL is the net quote-token liquidity locked across all Mixpad token pools on Robinhood Chain, measured via netPoolQuote on each factory (MixpadFactory, LaunchFactory v1, RwaFactory). Pools use Uniswap V4 with burned LP NFTs.',
  robinhood: { tvl },
}
