const { sumTokensExport } = require('../helper/unwrapLPs');

const GANG_TOKEN = '0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF';

module.exports = {
  cronos: {
    tvl: sumTokensExport({
      owners: [
        '0x2099ad49329909FDb620714D01F5A74D57CDeE0C',
        '0xe546C82f0CedE3341dC402626923A6D4b95234Ee',
      ],
      tokens: [GANG_TOKEN],
    }),
  },
  methodology: 'TVL counts GANG tokens locked in Cronos Gangsters staking and competition contracts.',
};
