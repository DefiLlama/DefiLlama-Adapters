const ADDRESSES = require('../helper/coreAssets.json')
const { post } = require('../helper/http');

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

const hBTCContract = ADDRESSES.stacks.hBTC;
const hBTCStateContract = 'SP1S1HSFH0SQQGWKB69EYFNY0B1MHRMGXR3J1FH4D.state-hbtc-v1';

module.exports = {
  methodology: 'TVL is calculated as total hBTC minted on Stacks multiplied by the current share price, expressed in BTC.',
  timetravel: false,
  stacks: {
    tvl: async () => {
      const [hbtc_contract_address, hbtc_contract_name] = hBTCContract.split('.');
      const [state_contract_address, state_contract_name] = hBTCStateContract.split('.');

      const [microhBTCSupplyStacks, microSharePrice] = await Promise.all([
        post(`https://api.mainnet.hiro.so/v2/contracts/call-read/${hbtc_contract_address}/${hbtc_contract_name}/get-total-supply`,
          {
            sender: hbtc_contract_address,
            arguments: []
          }
        ),
        post(`https://api.mainnet.hiro.so/v2/contracts/call-read/${state_contract_address}/${state_contract_name}/get-share-price`,
          {
            sender: state_contract_address,
            arguments: []
          }
        )
      ]);

      const sharePrice = Number(parseClarityInt(clarityResult(microSharePrice, 'state-hbtc-v1 get-share-price'))) / (10 ** 8);
      const hBTCSupplyStacks = Number(parseClarityInt(clarityResult(microhBTCSupplyStacks, 'token-hbtc get-total-supply'))) / (10 ** 8);

      return { bitcoin: hBTCSupplyStacks * sharePrice };
    }
  },
  misrepresentedTokens: false
}
