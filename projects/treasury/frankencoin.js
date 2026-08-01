const { treasuryExports } = require('../helper/treasury');

const equity = '0x1bA26788dfDe592fec8bcB0Eaff472a42BE341B2'; // Equity contract address from ChainAddressMap.ethereum.equity
const frankencoin = '0xB58E61C3098d85632Df34EecfB899A1Ed80921cB'; // Frankencoin token address from ChainAddressMap.ethereum.frankencoin

module.exports = treasuryExports({
  ethereum: {
    owners: [equity],
    ownTokens: [frankencoin],
  },
});

module.exports.methodology = 'Treasury is the Frankencoin held in the equity contract, which may include both protocol equity and minter reserves.'; 
