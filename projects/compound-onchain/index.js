const ADDRESSES = require('../helper/coreAssets.json')

const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const BigNumber = require('bignumber.js');
const { lendingMarket } = require('../helper/methodologies')

// cache some data
const markets = [
  {
    underlying: ADDRESSES.ethereum.BAT,
    symbol: 'BAT',
    decimals: 18,
    cToken: '0x6C8c6b02E7b2BE14d4fA6022Dfd6d75921D90E4E',
  },
  {
    underlying: ADDRESSES.ethereum.DAI,
    symbol: 'DAI',
    decimals: 18,
    cToken: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643',
  },
  {
    underlying: ADDRESSES.ethereum.WETH,
    symbol: 'WETH',
    decimals: 18,
    cToken: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5',
  }, //cETH => WETH
  {
    underlying: '0x1985365e9f78359a9B6AD760e32412f4a445E862',
    symbol: 'REP',
    decimals: 18,
    cToken: '0x158079Ee67Fce2f58472A96584A73C7Ab9AC95c1',
  },
  {
    underlying: ADDRESSES.ethereum.USDC,
    symbol: 'USDC',
    decimals: 6,
    cToken: '0x39AA39c021dfbaE8faC545936693aC917d5E7563',
  },
  {
    underlying: ADDRESSES.ethereum.USDT,
    symbol: 'USDT',
    decimals: 6,
    cToken: '0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9',
  },
  {
    underlying: ADDRESSES.ethereum.WBTC,
    symbol: 'WBTC',
    decimals: 8,
    cToken: '0xC11b1268C1A384e55C48c2391d8d480264A3A7F4',//cWBTC - legacy
  },
  {
    underlying: '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
    symbol: 'ZRX',
    decimals: 18,
    cToken: '0xB3319f5D18Bc0D84dD1b4825Dcde5d5f7266d407',
  },
  {
    underlying: ADDRESSES.ethereum.SAI,
    symbol: 'SAI',
    decimals: 18,
    cToken: '0xF5DCe57282A584D2746FaF1593d3121Fcac444dC',
  },
];

// ask comptroller for all markets array
async function getAllCTokens(block) {
  return (await sdk.api.abi.call({
    block,
    target: '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b',
    params: [],
    abi: abi['getAllMarkets'],
  })).output;
}

const CTOKEN_WETH = '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5'.toLowerCase()

// returns {[underlying]: {cToken, decimals, symbol}}
async function getMarkets(block) {
  if (block < 10271924) {
    // the allMarkets getter was only added in this block.
    return markets;
  } else {
    const markets = [{
      cToken: CTOKEN_WETH,
      underlying: ADDRESSES.ethereum.WETH, //cETH => WETH
    }]

    const allCTokens = await getAllCTokens(block)
    const calls = allCTokens.filter(i => i.toLowerCase() !== CTOKEN_WETH).map(i => ({ target: i }))
    const { output } = await sdk.api.abi.multiCall({
      abi: abi['underlying'], calls, block,
    })
    output.forEach(({ input: { target: cToken }, output: underlying}) => markets.push({ cToken, underlying, }))
    return markets;
  }
}

async function v2Tvl(balances, block, borrowed) {
  let markets = await getMarkets(block);

  // Get V2 tokens locked
  let v2Locked = await sdk.api.abi.multiCall({
    block,
    calls: markets.map((market) => ({
      target: market.cToken,
    })),
    abi: borrowed ? abi.totalBorrows : abi['getCash'],
  });

  markets.forEach((market) => {
    let getCash = v2Locked.output.find((result) => result.input.target === market.cToken);
    balances[market.underlying] = BigNumber(balances[market.underlying] || 0)
      .plus(getCash.output)
      .toFixed();
  });
  return balances;
}

async function borrowed(timestamp, block) {
  const balances = {};
  await v2Tvl(balances, block, true)
  return balances
}

async function tvl(timestamp, block) {
  let balances = {};

  await v2Tvl(balances, block, false)
  return balances;
}

module.exports = {
  hallmarks: [
    [1632873600, "Comptroller vulnerability exploit"],
    [1592226000, "COMP distribution begins"]
  ],
    ethereum: {
    tvl,
    borrowed
  },
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
};
