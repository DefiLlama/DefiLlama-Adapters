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

async function tvl(_, _1, _2, { api }) {
  const { chain } = api
  let marketsArray = [];

  for (const [marketContract, lockedToken] of Object.entries(marketsJSON[chain]))
    marketsArray.push([lockedToken, marketContract]);


  const calls = bentoBoxAddresses[chain].map(bentoBoxAddress => marketsArray.map((market) => ({
    target: bentoBoxAddress,
    params: market
  }))).flat()
  const tokens = bentoBoxAddresses[chain].map(_ => marketsArray.map(market => market[0])).flat()
  let bals = await api.multiCall({ calls, abi: abi.balanceOf, })
  api.addTokens(tokens, bals)
  return api.getBalances()
}

const chains = ['arbitrum', 'avax', 'bsc', 'ethereum', 'fantom', 'kava', 'optimism'];
chains.forEach(chain => module.exports[chain] = { tvl })
