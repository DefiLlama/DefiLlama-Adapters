const { transformTokens } = require('../helper/portedTokens');

// Mapping of Terminal share tokens to their underlying assets.
// Each share token represents a 1:1 wrapper over the real deposited token.
const shareTokens = {
  // tUSDe → USDe (Ethena USD)
  '0xA01227A26A7710bc75071286539E47AdB6DEa417': '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',

  // tETH → WETH (Wrapped Ether)
  '0xa1150cd4A014e06F5E0A6ec9453fE0208dA5adAb': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',

  // tBTC → WBTC (Wrapped Bitcoin)
  '0x6b6b870C7f449266a9F40F94eCa5A6fF9b0857E4': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
};

module.exports = {
  methodology:
    'TVL is calculated as the totalSupply of Terminal’s share tokens: tUSDe, tETH, and tBTC, each representing 1:1 value of USDe, WETH, and WBTC deposited.',
  ethereum: {
    tvl: async function tvl(_, _b, _cb, { api }) {

      const supplies = await api.multiCall({
        abi: 'erc20:totalSupply',
        calls: Object.keys(shareTokens),
      });

      Object.keys(shareTokens).forEach((token, i) => {
        let supply = supplies[i];

        // Adjust for tBTC decimals difference (18 -> 8)
        if (token.toLowerCase() === '0x6b6b870c7f449266a9f40f94eca5a6ff9b0857e4') {
          supply = supply / 1e10; // divide by 10^10 to match WBTC decimals
        }

        api.add(shareTokens[token], supply);
      });

      return api.getBalances();
    },
  }
}