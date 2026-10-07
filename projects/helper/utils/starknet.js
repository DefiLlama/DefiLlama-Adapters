// Starknet codec (selectors, addresses, Cairo ABI encoding/decoding) now lives in @defillama/sdk
// (`sdk.chains.starknet`); this module keeps the historical export names.
const { starknet } = require('@defillama/sdk').chains

module.exports = {
  toBigInt: starknet.toBigInt,
  toHex: starknet.toHex,
  number: starknet.number,
  addAddressPadding: starknet.addAddressPadding,
  validateAndParseAddress: starknet.validateAndParseAddress,
  starknetKeccak: starknet.starknetKeccak,
  getSelectorFromName: starknet.getSelectorFromName,
  encodeCalldata: starknet.encodeCalldata,
  decodeOutput: starknet.decodeOutput,
}
