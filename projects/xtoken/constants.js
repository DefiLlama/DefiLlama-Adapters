const ADDRESSES = require('../helper/coreAssets.json')
const DEC_18 = 10 ** 18;
const xaaveaAddr = "0x80DC468671316E50D4E9023D3db38D3105c1C146";
const xaavebAddr = "0x704De5696dF237c5B9ba0De9ba7e0C63dA8eA0Df";
const xalphaaAddr = "0xA23992a1F8a7412BD646487faC9dbFB8f31D6a85";
const xinchaAddr = "0x8F6A193C8B3c949E1046f1547C3A3f0836944E4b";
const xinchbAddr = "0x6B33f15360cedBFB8F60539ec828ef52910acA9b";
const xkncaAddr = "0x0bfEc35a1A3550Deed3F6fC76Dde7FC412729a91";
const xkncbAddr = "0x06890D4c65A4cB75be73D7CCb4a8ee7962819E81";
const xsnxaAddr = "0x1Cf0f3AaBE4D12106B27Ab44df5473974279C524";
const xsnxaAdminAddr = "0x7Cd5E2d0056a7A7F09CBb86e540Ef4f6dCcc97dd";
const xsnxaTradeAccountingAddr = "0x6461E964D687E7ca3082bECC595D079C6c775Ac8";
const xu3lpaAddr = "0xDa4d2152B2230e33c80b0A88b7C28b1C464EE3c2";
const xu3lpbAddr = "0x420CF01fdC7e3c42c3D89ae8799bACCBfFa9ceAA";
const xu3lpcAddr = "0x74e87FBA6C4bCd17fe5f14D73f590eD3C13E821B";
const xu3lpdAddr = "0xdd699eae49a3504a28aeb9bd76a3f0369fa08471";
const xu3lpeAddr = "0x828EC6E678A40c251f1F37DA389db0f820Af6f9D";
const xu3lpfAddr = "0x4296d40183356A770Fd8cA3Ba0592f0163BE9CA3";
const xu3lpgAddr = "0x28ce95124FB0d5Febe6Ab258072848f5fe1010eC";
const xu3lphAddr = "0x9ed880b7F75a220C0450E4884521ba8d500eb4bb";
const ethrsi6040Addr = "0x93E01899c10532d76C0E864537a1D26433dBbDdB";
const sUsdAddr = ADDRESSES.ethereum.sUSD_OLD;
const xbntaAddr = "0x6949f1118FB09aD2567fF675f96DbB3B6985ACd0";
const alphaAddr = "0xa1faa113cbe53436df28ff0aee54275c13b40975";
const bntAddr = "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C";
const kncAddr = "0xdd974d5c2e2928dea5f71b9825b8b646686bd200";
const snxAddr = "0xDC01020857afbaE65224CfCeDb265d1216064c59";
const wbtcAddr = ADDRESSES.ethereum.WBTC;
const wethAddr = ADDRESSES.ethereum.WETH;
const snxTokenAddr = ADDRESSES.ethereum.SNX;
const inchAddr = "0x111111111117dc0aa78b770fa6a738034120c302";
const usdcAddr = ADDRESSES.ethereum.USDC;
const aaveAddr = ADDRESSES.ethereum.AAVE;
const xtkAddress = "0x7F3EDcdD180Dbe4819Bd98FeE8929b5cEdB3AdEB";

const xu3lpaAddrArbitrum = "0x9F8cFc08f781e1576A05d4d3669b3E6FF22913FF";
const xu3lpbAddrArbitrum = "0x216D135926f5EC9E5924564A342580B0b5A3bdc6";
const xbtc3xAddrArbitrum = "0x93B135416A1796707b273ad709099d47ADDA18D6";
const xeth3xAddrArbitrum = "0xc4C251c7d7c2F1165176e3BF503276fB0df05daa";
const wbtcAddrArbitrum = ADDRESSES.arbitrum.WBTC;
const wethAddrArbitrum = ADDRESSES.arbitrum.WETH;

const X_ETH_3X = "xETH3x"
const X_BTC_3X = "xBTC3x"
const WBTC = "wbtc";
const WETH = "weth";
const QUOTER_ADDRESS = '0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6'
const usdcAddress = ADDRESSES.arbitrum.USDC
const wethAddress = ADDRESSES.arbitrum.WETH
const usdtAddress = ADDRESSES.ethereum.USDT;
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/coins';
const urls = {
    "mainnet": "https://api.thegraph.com/subgraphs/name/xtokenmarket/terminal-mainnet",
    "arbitrum": "https://api.thegraph.com/subgraphs/name/xtokenmarket/terminal-arbitrum",
    "optimism": "https://api.thegraph.com/subgraphs/name/xtokenmarket/terminal-optimism",
    "polygon": "https://api.thegraph.com/subgraphs/name/xtokenmarket/terminal-polygon",
};
const networks = {
    "mainnet": "ethereum",
    "homestead": "ethereum",
    "optimism": "optimistic-ethereum",
    "arbitrum": "arbitrum-one",
    "polygon": "polygon-pos",
};

module.exports = {
  DEC_18,
  kncAddr,
  xaaveaAddr,
  xaavebAddr,
  xalphaaAddr,
  alphaAddr,
  xbntaAddr,
  bntAddr,
  xinchaAddr,
  xinchbAddr,
  xkncaAddr,
  xkncbAddr,
  xsnxaAddr,
  xsnxaAdminAddr,
  xsnxaTradeAccountingAddr,
  xu3lpaAddr,
  xu3lpbAddr,
  xu3lpcAddr,
  xu3lpdAddr,
  xu3lpeAddr,
  xu3lpfAddr,
  xu3lpgAddr,
  xu3lphAddr,
  ethrsi6040Addr,
  snxAddr,
  sUsdAddr,
  wbtcAddr,
  wethAddr,
  snxTokenAddr,
  inchAddr,
  usdcAddr,
  aaveAddr,
  xu3lpaAddrArbitrum,
  xu3lpbAddrArbitrum,
  xbtc3xAddrArbitrum,
  xeth3xAddrArbitrum,
  wbtcAddrArbitrum,
  wethAddrArbitrum,
  X_ETH_3X,
  X_BTC_3X,
  WBTC,
  WETH,
  QUOTER_ADDRESS,
  usdcAddress,
  wethAddress,
  usdtAddress,
  COINGECKO_API_URL,
  urls,
  networks,
  xtkAddress
};
