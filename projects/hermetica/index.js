const ADDRESSES = require('../helper/coreAssets.json')
const { get, post } = require('../helper/http');

const USDhContract = ADDRESSES.stacks.USDh;

function parseClarityInt(hexString) {
  // call-read returns `(response uint128 ...)`: 0x07 (ok wrapper) + 0x01 (uint128 type) + 16 bytes value.
  let hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  let numberHex = hex.slice(4);
  let bigIntValue = BigInt("0x" + numberHex);
  if (bigIntValue > BigInt("0x7ffffffffffffffffffffffffffffffff")) {
    bigIntValue = bigIntValue - BigInt("0x100000000000000000000000000000000");
  }
  return bigIntValue.toString();
}

function clarityResult(response, label) {
  if (!response.okay) throw new Error(`Hiro call-read failed for ${label}: ${response.cause}`);
  return response.result;
}

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks.',
  timetravel: false,
  stacks: {
    tvl: async () => {
      const [contract_address, contract_name] = USDhContract.split('.');

      const supplyResponse = await post(`https://api.mainnet.hiro.so/v2/contracts/call-read/${contract_address}/${contract_name}/get-total-supply`,
        { 
          sender: contract_address,
          arguments: []
        }
      );

      const supplyOnStacksuUsdh = Number(parseClarityInt(clarityResult(supplyResponse, 'usdh get-total-supply')));

      return { 'hermetica-usdh': Number(supplyOnStacksuUsdh) / (10 ** 8) }
    }
  },
  misrepresentedTokens: true
}
