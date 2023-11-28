const marketsJSON = require('./market.json');
const abi = require('./abi.json');

// --------------------------
// cvx3pool & yvcrvIB tokens
// are not being unwrapped
// on eth (~$169M tvl)
// --------------------------
const bentoBoxAddresses = {
  "arbitrum": ["0x74c764D41B77DBbb4fe771daB1939B00b146894A", "0x7c8fef8ea9b1fe46a7689bfb8149341c90431d38"],
  "avax": ["0xf4F46382C2bE1603Dc817551Ff9A7b333Ed1D18f", "0x1fC83f75499b7620d53757f0b01E2ae626aAE530"],
  "bsc": ["0x090185f2135308BaD17527004364eBcC2D37e5F6"],
  "ethereum": ["0xF5BCE5077908a1b7370B9ae04AdC565EBd643966", "0xd96f48665a1410C0cd669A88898ecA36B9Fc2cce"],
  "fantom": ["0xF5BCE5077908a1b7370B9ae04AdC565EBd643966", "0x74A0BcA2eeEdf8883cb91E37e9ff49430f20a616"],
  "kava": ["0x630fc1758de85c566bdec1d75a894794e1819d7e"],
  "optimism": ["0xa93c81f564579381116ee3e007c9fcfd2eba1723"],
};

const underlyingTokens = {
  arbitrum: {
    "0x3477Df28ce70Cecf61fFfa7a95be4BEC3B3c7e75": "0x5402B5F40310bDED796c7D0F3FF6683f5C0cFfdf",
  },
  avax: {},
  bsc: {},
  ethereum: {
    "0x5958A8DB7dfE0CC49382209069b00F54e17929C2": "0x903C9974aAA431A765e60bC07aF45f0A1B3b61fb",
    "0x3Ba207c25A278524e1cC7FaAea950753049072A4": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
    "0xd92494CB921E5C0d3A39eA88d0147bbd82E51008": "0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490",
  },
  fantom: {},
  kava: {},
  optimism: {},
};

async function tvl(_, _1, _2, { api }) {
  const { chain } = api
  const marketsArray = [];

  for (const [marketContract, lockedToken] of Object.entries(marketsJSON[chain]))
    marketsArray.push([lockedToken, marketContract]);


  const calls = bentoBoxAddresses[chain].map(bentoBoxAddress => marketsArray.map((market) => ({
    target: bentoBoxAddress,
    params: market
  }))).flat()
  const tokens = bentoBoxAddresses[chain].map(_ =>
    marketsArray.map(([lockedToken]) => underlyingTokens[chain][lockedToken] ?? lockedToken)
  ).flat()
  const bals = await api.multiCall({ calls, abi: abi.balanceOf, })
  api.addTokens(tokens, bals)
  return api.getBalances()
}

const chains = ['arbitrum', 'avax', 'bsc', 'ethereum', 'fantom', 'kava', 'optimism'];
chains.forEach(chain => module.exports[chain] = { tvl }),
module.exports.hallmarks = [
  [1651881600, "UST depeg"],
  [1643245200, "0xSifu revealed as QuadrigaCX founder"],
  [1667826000, "FTX collapse, Alameda repays FTT loans"],
]
