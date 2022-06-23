/*==================================================
  Modules
  ==================================================*/

const sdk = require("@defillama/sdk");

const BigNumber = require("bignumber.js");

/*==================================================
    Settings
 ==================================================*/

const contracts = [
  "0xe9749a786c77A89fd45dAd3A6Ad1022eEa897F97",
  "0xaaBaB0FB0840DFfFc93dbeed364FB46b1ffD92EE",
];

const tokens = [
  "0x69D17C151EF62421ec338a0c92ca1c1202A427EC", // fantom SNT token
  "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // fantom USDC
];

/*==================================================
  TVL
  ==================================================*/

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  let balanceOfCalls = [];
  contracts.forEach((contract) => {
    balanceOfCalls = [
      ...balanceOfCalls,
      ...tokens.map((token) => ({
        target: token,
        params: contract,
      })),
    ];
  });

  const balanceOfResult = (
    await sdk.api.abi.multiCall({
      block: chainBlocks.fantom,
      calls: balanceOfCalls,
      abi: "erc20:balanceOf",
      chain: "fantom",
    })
  ).output;

  /* combine token volumes on multiple contracts */
  balanceOfResult.forEach((result) => {
    let balance = new BigNumber(result.output || 0);
    if (balance <= 0) return;

    let asset = result.input.target;
    let total = balances[asset];

    if (total) {
      balances[asset] = balance.plus(total).toFixed();
    } else {
      balances[asset] = balance.toFixed();
    }
  });

  return balances;
}

/*==================================================
  Exports
  ==================================================*/

module.exports = {
  fantom: { tvl },
};
