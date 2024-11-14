const { sumTokensExport} = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json');

module.exports = {
    timetravel: false,
    misrepresentedTokens:false,
   
        tvl: sumTokensExport({ 
          tokensAndOwners: [
            [ADDRESSES.tron, 'TFvHNqDqttkXSS8ZTdC4c4W7q97SFW3iKq']
          ],
        }),
    }
};
