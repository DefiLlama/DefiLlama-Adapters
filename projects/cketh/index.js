const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
// const { get } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

const contract = "0xb25eA1D493B49a1DeD42aC5B1208cC618f9A9B80";

async function tvl(api) {
  // var end = api.timestamp
  // let start = end - 24 * 60 * 60;
  // const { data } = await get(`https://icrc-api.internetcomputer.org/api/v1/ledgers/xevnm-gaaaa-aaaar-qafnq-cai/total-supply?start=${start}&end=${end}&step=1`);
  // let [_, bal] = data.pop()
  // api.add(ADDRESSES.ethereum.USDC, bal/1e2)
  return sumTokens2({ tokens: [nullAddress, ADDRESSES.ethereum.USDC], owner: contract, api });
}

module.exports = {
  methodology: `We count the ETH on ${contract} as the collateral for the ckETH`,
  ethereum: {
    tvl,
  },
};