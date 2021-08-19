const sdk = require("@defillama/sdk");


async function tvl(_timestamp, ethBlock) {
  const eth = (await sdk.api.eth.getBalance({
    target:'0x878f15ffc8b894a1ba7647c7176e4c01f74e140b',
    block:ethBlock,
  })).output;
  const btc = (await sdk.api.erc20.balanceOf({
    target:'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    owner: '0x20DD9e22d22dd0a6ef74a520cb08303B5faD5dE7',
    block:ethBlock,
  })).output;

  return {
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599':btc,
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2':eth,
  };
};


module.exports = {
  tvl,
  methodology: `TVL for Hegic is calculated using the Eth and WBTC deposited for liquidity`
}