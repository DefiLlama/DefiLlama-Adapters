const abi = {
  latestRoundData: 'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  decimals: 'function decimals() view returns (uint8)',
};

// Tenbin RWA tokens on Ethereum mainnet.
// Each token is minted/redeemed against a real-world asset. Its USD value is
// (on-chain total supply) x (Chainlink oracle price).
const assets = [
  {
    // tBRL - Brazilian Real
    token: '0x4C1b46adb8877E389171EC6Ef67b385094C0afaD',
    priceFeed: '0x3126E7F38D5f60f4E2B6ec3511C7bdbD79317Df1', // BRL/USD
  },
  {
    // tGLD - Gold
    token: '0x6a547b25534234bb79CE6961a23Db13DE154b6F4',
    priceFeed: '0x369C67E8b026CC4Ef98350f332D7Dd52b85b7674', // tGLD/USD
  },
  {
    // tMXN - Mexican Peso
    token: '0x8d015aFcb6F437010653352EB1E58152c4e23734',
    priceFeed: '0xdb4881Ab0ad6b8423f76dd8C9d65542749a1dB77', // MXN/USD
  },
];

async function tvl(api) {
  const tokens = assets.map((a) => a.token);
  const feeds = assets.map((a) => a.priceFeed);

  const supplies = await api.multiCall({ abi: 'erc20:totalSupply', calls: tokens });
  const tokenDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens });
  const roundData = await api.multiCall({ abi: abi.latestRoundData, calls: feeds });
  const feedDecimals = await api.multiCall({ abi: abi.decimals, calls: feeds });

  assets.forEach((_, i) => {
    const supply = supplies[i] / 10 ** tokenDecimals[i];
    const price = roundData[i].answer / 10 ** feedDecimals[i];
    api.addUSDValue(supply * price);
  });

  return api.getBalances();
}

module.exports = {
  methodology:
    'TVL is the total value of the three Tenbin RWA tokens (tBRL, tGLD, tMXN). For each token, the on-chain total supply is multiplied by its price from the corresponding Chainlink oracle (BRL/USD, tGLD/USD, MXN/USD).',
  ethereum: { tvl },
};
