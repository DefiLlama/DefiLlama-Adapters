const { sumTokens2 } = require("../helper/unwrapLPs")
const sdk = require('@defillama/sdk')

const FUNDRAISING_CONTRACT = '0xf435A133D6cDCb81061F18a4763560f9931DB57D';
const dataAbi = "function projects(uint256) view returns (uint256 hardCap, uint256 softCap, uint256 totalInvested, uint256 startAt, uint256 preFundDuration, uint256 investorInterestRate, uint256 openStageEndAt, (uint256 platformInterestRate, uint256 totalRepaid, address borrower, uint256 fundedTime, address loanToken, uint8 stage) innerStruct)"
const COMING_SOON_STAGE = 0;
const OPENED_STAGE = 1;
const CANCELED_STAGE = 2;
const PREFUNDED_STAGE = 3;
const FUNDED_STAGE = 4;
const REPAID_STAGE = 5;

async function tvl(api) {
    const projectsData = await api.fetchList({  lengthAbi: 'projectCount', itemAbi: dataAbi, target: FUNDRAISING_CONTRACT })
    const tokens = projectsData.map(project => project.innerStruct.loanToken)
    return sumTokens2({ api, owner: FUNDRAISING_CONTRACT, tokens, })
}

async function borrowed(api) {
    const projectsData = await api.fetchList({  lengthAbi: 'projectCount', itemAbi: dataAbi, target: FUNDRAISING_CONTRACT })
    const tokens = projectsData.map(project => project.innerStruct.loanToken)
    const tvlApi = new sdk.ChainApi({ chain: api.chain, block: api.block, })
    // Filter only projects that are in OPENED, PREFUNDED, or FUNDED stages
    // These are actively fundraising or have been funded
    const filtered = projectsData.filter(project => {
        const stage = Number(project.innerStruct.stage);
        return stage === OPENED_STAGE || stage === PREFUNDED_STAGE || stage === FUNDED_STAGE;
    })
    filtered.forEach(project =>  api.add(project.innerStruct.loanToken, project.totalInvested))
    await sumTokens2({ api: tvlApi, owner: FUNDRAISING_CONTRACT, tokens, })
    api.getBalancesV2().subtract(tvlApi.getBalancesV2())
}

module.exports = {
    methodology: 'Funds in the contract not yet withdrawn by the borrower are counted as TVL, rest of the investment is considered borrowed.',
    base: { tvl, borrowed, }
};