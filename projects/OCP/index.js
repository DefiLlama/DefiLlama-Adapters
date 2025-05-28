const { compoundExports } = require('../helper/compound')

module.exports = {
  bsc: compoundExports('0xc001c415b7e78ea4a3edf165d8f44b70391f8c3c', undefined, undefined, { blacklistedTokens: ['0x3c70260eee0a2bfc4b375feb810325801f289fbd', '0x5801d0e1c7d977d78e4890880b8e579eb4943276']}),
  hallmarks: [
    ['2022-02-14', 'Project abandoned by the team'],
  ],
};
