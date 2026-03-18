const { post } = require('../helper/http')

function parseClarityInt(hexString) {
  let hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  let numberHex = hex.slice(4);
  let bigIntValue = BigInt("0x" + numberHex);
  if (bigIntValue > BigInt("0x7ffffffffffffffffffffffffffffffff")) {
    bigIntValue = bigIntValue - BigInt("0x100000000000000000000000000000000");
  }
  return bigIntValue.toString();
}

async function makeReadOnlyContractCall({ contract, function_name }) {
  const [contract_address, contract_name] = contract.split('.');
  const response = await post(
    `https://api.mainnet.hiro.so/v2/contracts/call-read/${contract_address}/${contract_name}/${function_name}`,
    { sender: contract_address, arguments: [] }
  );
  return Number(parseClarityInt(response.result));
}

module.exports = { makeReadOnlyContractCall }
