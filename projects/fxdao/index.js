const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  methodology: `Takes the total amount of XLMs locked in the Vaults contract, the XLMs are the collateral of the issued assets by the protocol.`,
	...getExports("fxdao", ['stellar'])
};
