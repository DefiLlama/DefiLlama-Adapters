const { sumTokensExport } = require('../helper/solana');

const contractAddress = '3Q3pE1izgCeAtTR23eufZy5vCEGtpWLBQcGD2HGd1cbU';

module.exports = {
  solana: {
    tvl: sumTokensExport({ owners: [contractAddress], blacklistedTokens: ['8twuNzMszqWeFbDErwtf4gw13E6MUS4Hsdx5mi3aqXAM'] }),
    staking: sumTokensExport({ owners: [contractAddress], tokens: ['8twuNzMszqWeFbDErwtf4gw13E6MUS4Hsdx5mi3aqXAM'] }),
  },
};