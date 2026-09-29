// ton-core style `Address` (friendly / raw parsing, crc16) lives in @defillama/sdk (`sdk.chains.ton`)
const { ton } = require('@defillama/sdk').chains

function address(src) {
  return ton.Address.parse(src);
}

module.exports = {
  address,
  Address: ton.Address,
}
