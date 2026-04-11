```javascript
const { sumTokens2 } = require('../helper/unwrapLPs');

const METAMORPHO_VAULT = '0x82dEbC0F22f137dE41d26398CCE90C4100f1CFBE';
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

async function arbitrum(api) {
  await sumTokens2({
    api,
    owner: METAMORPHO_VAULT,
    tokens: [USDC],
  });
}

module.exports = {
  methodology: 'Counts USDC deposited in the Trinity Protocol MetaMorpho vault on Morpho Blue. The vault routes USDC into gold-collateralized (GVLT), hydrogen credit (HYDRO), and sovereign bond (TBUND) lending markets.',
  arbitrum: {
    tvl: arbitrum,
  },
};
