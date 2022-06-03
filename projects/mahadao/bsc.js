const { sumTokens } = require("../helper/unwrapLPs.js");
const { unwrapTroves } = require("../helper/unwrapLPs");

const bscTokens = require("./bscTokens.json");
Object.keys(bscTokens).forEach(
  (key) => (bscTokens[key] = bscTokens[key].toLowerCase())
);

const chain = "bsc";

async function pool2(_timestamp, _ethBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks[chain];
  const tokensAndOwners = [
    [bscTokens.ARTHBUSDLP, bscTokens.ARTHBUSDBasicStaking],
    [bscTokens.ARTHMAHAApeLP, bscTokens.ARTHMAHAApeLPStaking],
    [bscTokens.ARTHMAHALP, bscTokens.ARTHMAHABasicStaking],
    [bscTokens.ARTHuval3PS, bscTokens.ARTHuval3PSBasicStaking],
    [bscTokens.ARTHuval3PS, bscTokens.ARTHu3PXBasicStakingV2], // ellipsis masterchef, tvl belongs to them? SE: contains ARTH our stablecoin; we pay bribes for this tvl
    [bscTokens.ARTHu3PS, bscTokens.ARTHu3PSBasicStakingV2],
    [bscTokens.ARTHuval3PS, bscTokens.ARTHuval3PSDotBasicStaking], // ellipsis masterchef? SE: contains ARTH our stablecoin
  ];

  return sumTokens(balances, tokensAndOwners, block, chain, undefined, {
    resolveLP: true,
  });
}

async function tvl(ts, _block, chainBlocks) {
  const balances = {};
  const chain = "bsc";
  const block = chainBlocks[chain];
  const troves = [
    // troves
    "0x8F2C37D2F8AE7Bce07aa79c768CC03AB0E5ae9aE", // wbnb
    "0x1Beb8b4911365EabEC68459ecfe9172f174BF0DB", // busd
    "0xD31AC58374D4a0b3C58dFF36f2F59A22348159DB", // maha
    "0x0f7e695770e1bc16a9a899580828e22b16d93314", // BUSDUSDC-APE-LP
    "0x7A535496c5a0eF6A9B014A01e1aB9d7493F503ea", // BUSDUSDT-APE-LP
    "0x3a00861B7040386b580A4168Db9eD5D4D9dDa7BF", // BUSDUSDC-APE-LP-S
    "0x45Bc65D7Bb6d26676D12aC4646c8cC344DCe4e60", // BUSDUSDT-APE-LP-S
    "0x7cce62085AdEFa3fE9572546fD77fF1aA1088BEc", // BUSD-A
  ];
  await unwrapTroves({ balances, troves, chain, block });
  return balances;
}

module.exports = {
  pool2,
  tvl,
};
