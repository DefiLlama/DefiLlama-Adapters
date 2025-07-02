const { NexaAggregatorAbi } = require("./abi");

const BOHMETH = "0x40EF495dF42Fcfd1A4C33450Dfe61cfAC97Fe7dB"
const BoseraHKDMMF = '0xc7167fC4C7d95b6faa30d63509D7392474a0B955'

async function tvl(api) {
  const price = await api.call({
    target: BOHMETH,
    abi: NexaAggregatorAbi.latestAnswer,
  });
  const priceDecimals = await api.call({
    target: BOHMETH,
    abi: NexaAggregatorAbi.decimals,
  });
  const supply = await api.call({
    target: BoseraHKDMMF,
    abi: 'erc20:totalSupply',
  });
  const tokenDecimals = await api.call({
    target: BoseraHKDMMF,
    abi: 'erc20:decimals',
  });
  const scaledPrice = price / 10 ** priceDecimals;
  const scaledSupply = supply / 10 ** tokenDecimals;
  const totalValue = scaledSupply * scaledPrice;

  api.addUSDValue(totalValue);
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology: 'TVL is the total AUM based on the price of the underlying assets, price is from NexaAggregator Oracle',
  hsk: {
    tvl,
  }
}; 