const { aaveExports } = require("../helper/aave");

module.exports = {
  clv: aaveExports('clv', '0x070CaAeac85CCaA7E8DCd88421904C2259Abed34', undefined, ['0x49617386d6aAaA6aE23c0E7799B5c4F79f33f1B1']),
  oasis: aaveExports('oasis', '0xBB4dfd53BA393DCD1AD1e30809C9527e9a00d522', undefined, ['0x2b8DD6DE52F20EfA309BC56454b7A929B7a1E66D']),
};
