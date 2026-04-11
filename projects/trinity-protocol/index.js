const { sumTokens2 } = require('../helper/unwrapLPs');

const METAMORPHO_VAULT = '0x82dEbC0F22f137dE41d26398CCE90C4100f1CFBE';
const USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';

async function arbitrum(api) {
  const totalAssets = await api.call({
    target: METAMORPHO_VAULT,
    abi: 'uint256:totalAssets',
  });
  api.add(USDC, totalAssets);
}

module.exports = {
  methodology: 'Tracks USDC in the Trinity Protocol MetaMorpho vault on Morpho Blue via totalAssets(). The vault routes USDC into gold-collateralized (GVLT), hydrogen credit (HYDRO), and sovereign bond (TBUND) lending markets.',
  doublecounted: true,
  arbitrum: {
    tvl: arbitrum,
  },
};
