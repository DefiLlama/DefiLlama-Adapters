const { NexaAggregatorAbi } = require("./abi");

const BSUMETU = "0x955DCE287cE4687C622dA1Cd91477968689a0EEc"
const BoseraUSDMMF = '0xE121e4081053060004ef1c3bEFeAc12e9af63659'

async function tvl(api) {
  const price = await api.call({
    target: BSUMETU,
    abi: NexaAggregatorAbi.latestAnswer,
  });
  const priceDecimals = await api.call({
    target: BSUMETU,
    abi: NexaAggregatorAbi.decimals,
  });
  const supply = await api.call({
    target: BoseraUSDMMF,
    abi: 'erc20:totalSupply',
  });
  const tokenDecimals = await api.call({
    target: BoseraUSDMMF,
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