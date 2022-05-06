const { unwrapTroves, sumTokens } = require("../helper/unwrapLPs.js");
const BigNumber = require("bignumber.js");
const sdk = require("@defillama/sdk");

const chain = "ethereum";

const eth = {
  ethMahaSLP: "0xB73160F333b563f0B8a0bcf1a25ac7578A10DE96",
  ethMahaSLP2: "0xC0897d6Ba893E31F42F658eeAD777AA15B8f824d",
  ethMahaSushiStaking: "0x20257283d7B8Aa42FC00bcc3567e756De1E7BF5a",
  maha: "0xb4d930279552397bba2ee473229f89ec245bc365",
  weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  frax: "0x853d955acef822db058eb8505911ed77f175b99e",
  arth: "0x8CC0F052fff7eaD7f2EdCCcaC895502E884a8a71",
  "arth.usd": "0x973F054eDBECD287209c36A2651094fA52F99a71",
  frxArthLP: "0x5a59fd6018186471727faaeae4e57890abc49b08",
  frxArthStaking: "0x7B2F31Fe97f32760c5d6A4021eeA132d44D22039",
};

Object.keys(eth).forEach((k) => (eth[k] = eth[k].toLowerCase()));

async function pool2(_, block) {
  const balances = {};
  const tokensAndOwners = [[eth.ethMahaSLP, eth.ethMahaSushiStaking]];
  const fraxArthbalances = {};
  const fraxArthTokensAndOwners = [
    [eth.frxArthLP, eth.frxArthStaking],
    [eth.frax, eth.frxArthLP],
    // [eth["arth.usd"], eth.frxArthLP,],
  ];

  await sumTokens(balances, tokensAndOwners, block, chain, undefined, {
    resolveLP: true,
  });
  await sumTokens(
    fraxArthbalances,
    fraxArthTokensAndOwners,
    block,
    chain,
    undefined
  );

  const { output: totalSupply } = await sdk.api.erc20.totalSupply({
    target: eth.frxArthLP,
    block,
  });

  const stakedRatio = BigNumber(fraxArthbalances[eth.frxArthLP]).dividedBy(
    totalSupply
  );

  sdk.util.sumSingleBalance(
    balances,
    eth.frax,
    stakedRatio
      .multipliedBy(2)
      .multipliedBy(fraxArthbalances[eth.frax])
      .toFixed(0)
  );

  return balances;
}

async function tvl(_, block) {
  const balances = {};
  const troves = [
    "0x4a47a8EB52c6213963727BF93baaa1CF66CBdF38", // FRAX Trove
  ];
  await unwrapTroves({ balances, chain, block, troves });
  return balances;
}

module.exports = {
  pool2,
  tvl,
};
