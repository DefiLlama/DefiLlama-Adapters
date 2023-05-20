const ADDRESSES = require('../helper/coreAssets.json')
const ZERO_ADDRESS = ADDRESSES.null

const ADDRESS_PROVIDER_ADDRESS = "0x5a0ad8337E5C6895b3893E80c8333859DAcf7c01"
const KGL_ADDRESS = ADDRESSES.astar.KGL
const VOTING_ESCROW_ADDRESS = "0x432c8199F548425F7d5746416D98126E521e8174"

const transformTokenAddress = (address) => TOKENS[address.toLowerCase()]

const TOKEN_INFO = {
  ausd: { key: "acala-dollar", decimals: 12 },
  muKGL: { address: "0x5eaAe8435B178d4677904430BAc5079e73aFa56e" },
  muLAY: { address: "0xDDF2ad1d9bFA208228166311FC22e76Ea7a4C44D" },
  astar: { address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" },
};

const TOKENS = {
  // KGL
  [KGL_ADDRESS]: "kagla-finance",
  // muKGL: staked KGL by Muuu Finance
  [TOKEN_INFO.muKGL.address.toLowerCase()]: "kagla-finance",
  // USDC
  [ADDRESSES.moonbeam.USDC]: ADDRESSES.ethereum.USDC,
  // Starlay lUSDC -> USDC
  [ADDRESSES.astar.lUSDC]: ADDRESSES.ethereum.USDC,
  // USDT
  [ADDRESSES.astar.USDT]: ADDRESSES.ethereum.USDT,
  // Starlay lUSDT -> USDT
  [ADDRESSES.astar.lUSDT]: ADDRESSES.ethereum.USDT,
  // DAI
  [ADDRESSES.astar.DAI]: ADDRESSES.ethereum.DAI,
  // Starlay lDAI -> DAI
  [ADDRESSES.astar.lDAI]: ADDRESSES.ethereum.DAI,
  // BUSD
  [ADDRESSES.oasis.ceUSDT]: "binance-usd",
  // BAI
  [ADDRESSES.astar.BAI]: "bai-stablecoin",
  // aUSD
  [ADDRESSES.astar.aUSD]: TOKEN_INFO.ausd.key,
  // ASTR
  [TOKEN_INFO.astar.address.toLowerCase()]: "astar",
  // nASTR: staked ASTR by Algem
  [ADDRESSES.astar.nASTR]: "astar",
  // LAY
  [ADDRESSES.astar.LAY]: "starlay-finance",
  // muLAY: staked LAY by Muuu Finance
  [TOKEN_INFO.muLAY.address.toLowerCase()]: "starlay-finance",
};


module.exports = {
  ZERO_ADDRESS,
  ADDRESS_PROVIDER_ADDRESS,
  VOTING_ESCROW_ADDRESS,
  KGL_ADDRESS,
  TOKEN_INFO,
  transformTokenAddress
}
