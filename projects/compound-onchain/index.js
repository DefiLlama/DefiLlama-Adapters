const { lendingMarket } = require('../helper/methodologies');
const { compoundExports2 } = require('../helper/compound');

module.exports = {
  hallmarks: [
    // [1632873600, "Comptroller vulnerability exploit"],
    [1592226000, "COMP distribution begins"]
  ],
  ethereum: compoundExports2({ comptroller: '0x3d9819210A31b4961b30EF54bE2aeD79B9c9Cd3B', cether: '0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5' }),
  methodology: `${lendingMarket}. TVL is calculated by getting the market addresses from comptroller and calling the getCash() on-chain method to get the amount of tokens locked in each of these addresses, then we get the price of each token from coingecko.`,
};
