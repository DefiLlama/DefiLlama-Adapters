const { compoundExports } = require('../helper/compound')

module.exports = {
  bsc: compoundExports('0xc001c415b7e78ea4a3edf165d8f44b70391f8c3c', 'bsc'),
  hallmarks: [
    [Math.floor(new Date('2022-02-14')/1e3), 'Project abandoned'],
  ],
};
