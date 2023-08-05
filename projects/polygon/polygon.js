const ethers = require('ethers');
const sdk = require('@defillama/sdk');


// Assuming you have the ABI for both contracts
const fs = require('fs');

const primaryIssueManagerData = JSON.parse(fs.readFileSync('./PrimaryIssueManager.json', 'utf8'));
const primaryIssueManagerABI = primaryIssueManagerData.abi;
const secondaryIssueManagerData = JSON.parse(fs.readFileSync('./SecondaryIssueManager.json', 'utf8'));
const secondaryIssueManagerABI = secondaryIssueManagerData.abi;


// Define the addresses of the contracts
const contracts = {
    polygon: {
        primary: '0xDA13BC71FEe08FfD523f10458B0e2c2D8427BBD5',
        secondary: '0xbe7a3D193d91D1F735d14ec8807F20FF2058f342',
    },
};

async function tvl(timestamp, ethBlock, chainBlocks) {
    let totalTVL = ethers.BigNumber.from(0);
    const balances = {};
    const block = chainBlocks.polygon;
   // Create a provider
   const infuraProvider = new ethers.providers.JsonRpcProvider('https://polygon-mainnet.infura.io/v3/99f0091064f341beab4912b1e970a067');



    const primaryContract = new ethers.Contract(contracts.polygon.primary, primaryIssueManagerABI, infuraProvider);
    const secondaryContract = new ethers.Contract(contracts.polygon.secondary, secondaryIssueManagerABI, infuraProvider);
  
    // Fetch the 'subscription' events from the contract and calculate TVL based on those
    const primaryEvents = await primaryContract.queryFilter('subscribers');
    primaryEvents.forEach(event => {
        const cashSwapped = ethers.BigNumber.from(event.args.cashSwapped);
        totalTVL =totalTVL.add(cashSwapped);
        sdk.util.sumSingleBalance(balances, event.args.currency, cashSwapped.toString());
    });
    
   
    const secondaryEvents = await secondaryContract.queryFilter('subscribers');
    secondaryEvents.forEach(event => {
        const amount = ethers.BigNumber.from(event.args.amount);
        totalTVL = totalTVL.add(amount);
        sdk.util.sumSingleBalance(balances, event.args.currencySettled, amount.toString());
    });
    balances.totalTVL = totalTVL.toString();
    console.log('Primary events:', primaryEvents);
    console.log('Secondary events:', secondaryEvents);
    return balances;
}

module.exports = {
    tvl,
};

// Call the tvl function for testing
tvl('testTimestamp', 'testEthBlock', { polygon: 'testBlock' })
  .then(result => console.log(result))
  .catch(error => console.error(error));

