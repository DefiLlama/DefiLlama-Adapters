const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const FUNDRAISING_CONTRACT = '0xf435A133D6cDCb81061F18a4763560f9931DB57D';
const COMING_SOON_STAGE = 0;
const OPENED_STAGE = 1;
const CANCELED_STAGE = 2;
const PREFUNDED_STAGE = 3;
const FUNDED_STAGE = 4;
const REPAID_STAGE = 5;
const BASE_USDC = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // Base USDC token address

async function tvl(api) {
    // Get the total number of projects
    const count = await api.call({
        abi: abi.projectCount,
        target: FUNDRAISING_CONTRACT,
    });
    // Get all projects data using multiCall
    const projectsData = await api.multiCall({
        abi: abi.projects,
        calls: Array.from({ length: count }, (_, i) => ({
            target: FUNDRAISING_CONTRACT,
            params: i
        })),
    });
    // Filter only projects that are in OPENED, PREFUNDED, or FUNDED stages
    // These are actively fundraising or have been funded
    const filtered = projectsData.filter(project => {
        const stage = Number(project.innerStruct.stage);
        return stage === OPENED_STAGE || stage === PREFUNDED_STAGE || stage === FUNDED_STAGE;
    });

    // Map to totalInvested values
    const investedList = filtered.map(project => BigInt(project.totalInvested));
    // Sum all totalInvested values to get the total TVL
    const totalInvested = investedList.reduce((total, amount) => total + amount, BigInt(0));
    console.log(`Total Invested: ${totalInvested.toString()}`);
    api.add(BASE_USDC, totalInvested);
}

module.exports = {
    methodology: 'Counts total funded loans amount for all active projects.',
    start: 26601312,
    base: { tvl }
};