const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require('../helper/chain/stacks-api')

const USDhContract = ADDRESSES.stacks.USDh;

export function parseClarityInt(hexString) {
  // Remove "0x" prefix
  let hex = hexString.startsWith("0x") ? hexString.slice(2) : hexString;

  // Skip the first two bytes (Clarity type and metadata)
  let numberHex = hex.slice(4); // Remove first 2 bytes (4 hex characters)

  // Convert hex to BigInt
  let bigIntValue = BigInt("0x" + numberHex);

  // Handle two’s complement for negative numbers
  if (bigIntValue > BigInt("0x7ffffffffffffffffffffffffffffffff")) {
      bigIntValue = bigIntValue - BigInt("0x100000000000000000000000000000000");
  }

  return bigIntValue.toString(); // Return as a readable decimal string
}

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks.',
  timetravel: false,
  bitcoin: {
    tvl: async () => {
      const [contract_address, contract_name] = USDhContract.split('.');

      const [supply, supplyResponse] = await Promise.all([
        get('https://app.hermetica.fi/api/v1/usdh/supply'),
        post(`https://api.mainnet.hiro.so/v2/contracts/call-read/${contract_address}/${contract_name}/get-total-supply`,
          {
            sender: contract_address,
            arguments: []
          }
        )
      ]);

      const uUSDhSupplyStacks = Number(parseClarityInt(supplyResponse.result));

      const cleanUsdhSupply = supply.result.replace(/[^\d.]/g, '');
      const totaluUSDhSupply = Number(cleanUsdhSupply) * (10 ** 8);
      const sUSDhSupplyRunes = totaluUSDhSupply - Number(uUSDhSupplyStacks);

      return { 'hermetica-usdh': sUSDhSupplyRunes / (10 ** 8) }
    }
  },
  stacks: {
    tvl: async () => {
      const [contract_address, contract_name] = USDhContract.split('.');

      const supplyResponse = await post(`https://api.mainnet.hiro.so/v2/contracts/call-read/${contract_address}/${contract_name}/get-total-supply`,
        { 
          sender: contract_address,
          arguments: []
        }
      );

      const supplyOnStacksuUsdh = Number(parseClarityInt(supplyResponse.result));

      return { 'hermetica-usdh': Number(supplyOnStacksuUsdh) / (10 ** 8) }
    }
  },
  misrepresentedTokens: true
}
