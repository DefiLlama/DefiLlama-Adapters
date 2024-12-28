const { sumTokensExport, } = require("../helper/chain/cardano");

const scriptAdresses = [
  'addr1z87jq3sr5psnv5vz2s799ycawj845ny7d2d25ayq7cgywd5nc4gwrvu5dcuccayqddwpx0l492czzxp7929792qv4grql4zqxt', 
  'addr1zy7z86jxa4dyflaf3rwpt5jlnrdahkt2r4737khf7huv9q5nc4gwrvu5dcuccayqddwpx0l492czzxp7929792qv4grqnc0lf0',
  'addr1zxczgk9j5z67tjeer7ryhzgznm6zrkjqgm004m2gxymzfnvnc4gwrvu5dcuccayqddwpx0l492czzxp7929792qv4grq2d0zxe',
  'addr1zytlwd9nvg9qujwtrgmecp4kghelj258d9gwu373cn8eefvnc4gwrvu5dcuccayqddwpx0l492czzxp7929792qv4grqp3aqvs',
];

module.exports = {
  methodology: 'TVL are assets either locked as collateral, or payment on interest to be reclaimed',
  timetravel: false,
  cardano: {
    tvl: sumTokensExport({ scripts: scriptAdresses, })
  }
};