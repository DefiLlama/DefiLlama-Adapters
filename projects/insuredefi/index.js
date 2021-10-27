const abi = require("./abi");
const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const AssetAddress = "0xF4b2aa60Cd469717857a8A4129C3dB9108f54D74";


async function tvl(timestamp, block) {
  let balances = {};
  let tokens = await _tokens();

  for (let i in tokens) {
    let token = tokens[i];
    let output = (
      await sdk.api.abi.call({
        block,
        target: AssetAddress,
        params: token,
        abi: abi.asset.balances,
      })
    ).output;
    balances[token] = balances[token]
      ? balances[token].plus(output)
      : new BigNumber(output);
  }
  return balances;
}

module.exports = {
  name: "inSure DeFi",
  token: "SURE",
  category: "Insurance",
  start: 1513566671, // 2020/10/21 6:34:47 (+UTC)
  tvl,
};

