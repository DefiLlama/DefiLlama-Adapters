const { sumTokens2 } = require("../helper/unwrapLPs");

const tower = "0xB0Afc8363b8F36E0ccE5D54251e20720FfaeaeE7";
const viewer = "0xA3A8cDA21f50b6737385E46FC9495a9998B05Ff0";
const CVG = "0x97efFB790f2fbB701D88f89DB4521348A2B77be8";

const stkCVGETH = "0x4b3Bd8906083bDE267A79E4131AF7a6f723960c8";
const stkCVGCVGSDT = "0x865E59EBc3EE9EdD5656cD79b382f5153E466545";
const cvgCVX = "0x2191DF768ad71140F9F3E96c1e4407A4aA31d082";

const abi = {
  getSdtStakings: `function getSdtStakings(uint256 _cursorStart, uint256 _lengthDesired) view returns (tuple(address stakingContract, string stakingName)[])`,
  getGlobalViewCvgSdtStaking:
    "function getGlobalViewCvgSdtStaking(address _stakingContract) view returns (tuple(address cvgSdt, address stakingAddress, uint256 cvgCycle, uint256 previousTotal, uint256 actualTotal, uint256 nextTotal) globalViewCvgSdtStaking)",
  staking_token: "function staking_token() view returns (address)",
  token: "function token() view returns (address)",
};

const getSdtStakingsAddresses = async (api, tower, limit) => {
  const addresses = await api.call({
    target: tower,
    params: [0, limit],
    abi: abi.getSdtStakings,
  });

  return addresses.map(({ stakingContract }) => stakingContract);
};

const getsdtStakingViews = async (api, viewer, sdtStakings) => {
  const stakingdatasRes = await api.multiCall({
    target: viewer,
    calls: sdtStakings,
    abi: abi.getGlobalViewCvgSdtStaking,
  });

  const stakingDatas = stakingdatasRes.map(({ cvgSdt, actualTotal }) => ({
    staking: cvgSdt,
    balance: actualTotal,
  }));

  const stakingTokens = await api.multiCall({
    calls: stakingDatas.map(({ staking }) => ({ target: staking })),
    abi: abi.staking_token,
  });


  const deeperUnwrapTokens = await api.multiCall({
    calls: stakingTokens,
    abi: abi.token,
    permitFailure: true,
  });

  return deeperUnwrapTokens.map((deeperToken, index) => {
    const token = deeperToken ?? stakingTokens[index];
    const balance = stakingDatas[index].balance;
    api.add(token, balance);
  });
};

const tvl = async (api) => {
  const getSdtStakings = await getSdtStakingsAddresses(api, tower, 1000);
  await getsdtStakingViews(api, viewer, getSdtStakings);
  api.removeTokenBalance(CVG);
  return sumTokens2({ api, resolveLP: true });
};

const staking = async (api) => {
  return api.sumTokens({
    token: CVG,
    owners: [stkCVGETH, stkCVGCVGSDT, cvgCVX],
  });
};

module.exports = {
  doublecounted: true,
  methodology:
    "TVL represents the values deposited in each of the StakeDao and Convex strategies",
  ethereum: {
    tvl,
    staking,
  },
};
