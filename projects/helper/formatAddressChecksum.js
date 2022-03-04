/**
 * @dev This function will format an address string according to the avilability of EIP-1191 on the network.
 *      This EIP determines the way the address checksum is being calculated.
 *      For example, on RSK (which implemented EIP-1191) any js/ts call to the blockchain for getting/connecting to a contract
 *      will have to be done with a low case address, while on a non EIP-1191 netwrok it has to remain mix-case.
 *      For more information please read: https://developers.rsk.co/rsk/architecture/account-based/
 */
function formatAddressChecksum(address, netwrokName) {
  // Add here more EIP-1191 networks as needed
  return ["rsk"].includes(netwrokName?.toLowerCase())
    ? address.toLowerCase()
    : address;
}

module.exports = {
  formatAddressChecksum,
};
