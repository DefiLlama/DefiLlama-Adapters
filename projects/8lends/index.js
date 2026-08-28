const { sumTokens2 } = require("../helper/unwrapLPs");
const sdk = require("@defillama/sdk");

const FUNDRAISING_CONTRACT = "0xf435A133D6cDCb81061F18a4763560f9931DB57D";
const dataAbi = "function projects(uint256) view returns (uint256 hardCap, uint256 softCap, uint256 totalInvested, uint256 startAt, uint256 preFundDuration, uint256 investorInterestRate, uint256 openStageEndAt, (uint256 platformInterestRate, uint256 totalRepaid, address borrower, uint256 fundedTime, address loanToken, uint8 stage) innerStruct)";

const STAGES = {
  COMING_SOON: 0,
  OPENED: 1,
  CANCELED: 2,
  PREFUNDED: 3,
  FUNDED: 4,
  REPAID: 5,
};

const ACTIVE_STAGES = new Set([STAGES.OPENED, STAGES.PREFUNDED, STAGES.FUNDED]);

async function getTokens (api) {
  const projects = await api.fetchList({ target: FUNDRAISING_CONTRACT, lengthAbi: "projectCount", itemAbi: dataAbi });
  return { projects, tokens: projects.map(project => project.innerStruct.loanToken) }
}

async function tvl(api) {
  const { tokens } = await getTokens(api)
  return sumTokens2({ api, owner: FUNDRAISING_CONTRACT, tokens });
}

async function borrowed(api) {
  const { projects, tokens } = await getTokens(api)
  projects.forEach((project) => {
    const stage = Number(project?.innerStruct?.stage ?? -1);
    if (ACTIVE_STAGES.has(stage)) api.add(project.innerStruct.loanToken, project.totalInvested)
  })

  const tvlApi = new sdk.ChainApi({ chain: api.chain, block: api.block });
  await sumTokens2({ api: tvlApi, owner: FUNDRAISING_CONTRACT, tokens });
  api.getBalancesV2().subtract(tvlApi.getBalances());
}

module.exports = {
  methodology: "Funds still held in the fundraising contract are counted as TVL; the remainder of invested funds is counted as borrowed.",
  base: { tvl, borrowed },
};
