const {XdrWriter} = require("./serialization/xdr-writer");
const {decodeCheck} = require("./strkey");

const SCV_ADDRESS = 18;
const scAddressTypeContract = 1;

function scvAddressToXDR(contractAddress) {
    return Buffer.concat([intToXDR(SCV_ADDRESS), scAddressToXDR(contractAddress)]);
}

function scAddressToXDR(contractAddress) {
    return Buffer.concat([intToXDR(scAddressTypeContract), decodeCheck('contract', contractAddress)]);
}

function intToXDR(value) {
    const writer = new XdrWriter();
    writer.writeInt32BE(value);
    return writer.finalize();
}

module.exports = {
    intToXDR,
    scvAddressToXDR,
    scAddressToXDR,
}
