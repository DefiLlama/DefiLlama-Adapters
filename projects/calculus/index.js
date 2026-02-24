const { getLogs2 } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

const CALCULUS_CONTRACT = "0xb5e6AdA1466840096FcEDCC409528a9cB763f650";
const START_BLOCK = 66651811;
const abi = {
  "NewUser": "event NewUser(address who, address lpMananger)",
}

module.exports = {
  methodology:
    "Tvl is tokens in the calculus lp manager contracts (pcs v3 positions created by calculus users)",
  bsc: { tvl },
};


async function tvl(api) {
  const logs = await getLogs2({ api, target: CALCULUS_CONTRACT, fromBlock: START_BLOCK, eventAbi: abi.NewUser })
  const vaultOwners = logs.map(i => i.lpMananger);
  await sumTokens2({ api, owners: vaultOwners, resolveUniV3: true, })
  const tokens = Object.keys(api.getBalances()).filter(i => i.startsWith('bsc:')).map(i => i.split(':')[1])
  return api.sumTokens({ tokens, owner: CALCULUS_CONTRACT })
}