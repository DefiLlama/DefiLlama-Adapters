const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const contracts = {
  cvxCRVLegacyHolder: "0x83507cc8c8b67ed48badd1f59f684d5d02884c81",
  cvxCRVHolder: "0x4ebad8dbd4edbd74db0278714fbd67ebc76b89b7",
  cvxCRV: "0x62b9c7356a2dc64a1969e19c23e4f579f9810aa7",
  cvxFXSHolder: "0xf964b0e3ffdea659c44a5a52bc0b82a24b89ce0e",
  cvxFXS: "0xFEEf77d3f69374f66429C91d732A244f074bdf74",
  cvxFXSPool: "0xd658A338613198204DCa1143Ac3F01A722b5d94A",
  cvxFXScvxLpToken: "0xF3A43307DcAFa93275993862Aae628fCB50dC768",
  FXS: "0x3432b6a60d23ca0dfca7761b7ab56459d9c964d0",
  pxCvxHolder: "0x8659fc767cad6005de79af65dafe4249c57927af",
  CVX: "0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b",
  pxCvxOracle: "0xf3456e8061461e144b3f252e69dcd5b6070fdee0",
  auraBalHolder: "0x8c4eb0fc6805ee7337ac126f89a807271a88dd67",
  auraBal: "0x616e8BfA43F920657B3497DBf40D6b1A02D4608d",
};

async function getCvxCrvTvl(balances, block) {
  // Contract for Convex legacy's cvxCRV staking
  const cvxCrvLegacy = (
    await sdk.api.abi.call({
      target: contracts.cvxCRVLegacyHolder,
      abi: abi.totalUnderlying,
      block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, contracts.cvxCRV, cvxCrvLegacy);

  // Contract for new Convex cvxCRV staking w/ 2 reward streams
  const cvxCrv = (
    await sdk.api.abi.call({
      target: contracts.cvxCRVHolder,
      abi: abi.totalUnderlying,
      block,
    })
  ).output;
  sdk.util.sumSingleBalance(balances, contracts.cvxCRV, cvxCrv);
}

async function getCvxTvl(balances, block) {
  const pxCvx = (
    await sdk.api.abi.call({
      target: contracts.pxCvxHolder,
      abi: abi.totalAssets,
      block,
    })
  ).output;

  const ratio = (
    await sdk.api.abi.call({
      target: contracts.pxCvxOracle,
      abi: abi.priceOracle,
      block,
    })
  ).output;

  balances[contracts.CVX] = pxCvx * ratio * 10 ** -18;
}

async function getAuraBalTvl(balances, block) {
  const auraBal = (
    await sdk.api.abi.call({
      target: contracts.auraBalHolder,
      abi: abi.totalUnderlying,
      block,
    })
  ).output;

  balances[contracts.auraBal] = auraBal;
}

async function getFxsTvl(balances, block) {
  // Underlying is in cvxFxs/Fxs LP balance
  const cvxFXSLpBalance = (
    await sdk.api.abi.call({
      target: contracts.cvxFXSHolder,
      abi: abi.totalUnderlying,
      block,
    })
  ).output;

  const oracle = (
    await sdk.api.abi.call({
      target: contracts.cvxFXSPool,
      abi: abi.priceOracle,
      block,
    })
  ).output;

  const totalLpSupply = (
    await sdk.api.abi.call({
      target: contracts.cvxFXScvxLpToken,
      abi: abi.totalSupply,
      block,
    })
  ).output;

  const poolBalances = (
    await sdk.api.abi.multiCall({
      block,
      abi: abi.balances,
      calls: [0, 1].map((token) => ({
        target: contracts.cvxFXSPool,
        params: token,
      })),
    })
  ).output.map((el) => el.output);

  const poolShare = cvxFXSLpBalance / totalLpSupply;
  const fxsDenominatedTvl =
    poolBalances[1] * oracle * 10 ** -18 + Number(poolBalances[0]);
  balances[contracts.FXS] = fxsDenominatedTvl * poolShare;
}

async function tvl(time, block) {
  const balances = {};

  await Promise.all([
    getCvxCrvTvl(balances, block),
    getCvxTvl(balances, block),
    getFxsTvl(balances, block),
    getAuraBalTvl(balances, block),
  ]);
  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
};
