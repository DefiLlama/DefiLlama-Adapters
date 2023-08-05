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
    goerli: {
        primary: '0x63D95635938857Ad202f0684dfd91dc71C9d111e',
        secondary: '0xe1f45e7104069F998b919C26435c4aaBAeD68fEd',
    },
};

async function tvl(timestamp, ethBlock, chainBlocks) {
    const balances = {};
    const block = chainBlocks.goerli;
   // Create a provider
   const infuraProvider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/324d7d968bb245e39b4edcda5a16c7a4');


    const primaryContract = new ethers.Contract(contracts.goerli.primary, primaryIssueManagerABI, infuraProvider);
    const secondaryContract = new ethers.Contract(contracts.goerli.secondary, secondaryIssueManagerABI, infuraProvider);
  
    // Fetch the 'subscription' events from the contract and calculate TVL based on those
    // Note: Replace 'eventName' with the correct event name
    const primaryEvents = await primaryContract.queryFilter('subscribers');
    primaryEvents.forEach(event => {
        const cashSwapped = event.args.cashSwapped.toString();
        sdk.util.sumSingleBalance(balances, event.args.currency, cashSwapped);
    });
    console.log('Primary events:', primaryEvents);
   
    const secondaryEvents = await secondaryContract.queryFilter('subscribers');
    secondaryEvents.forEach(event => {
        const amount = event.args.amount.toString();
        sdk.util.sumSingleBalance(balances, event.args.currencySettled, amount);
    });
    console.log('Secondary events:', secondaryEvents);
    return balances;
}

module.exports = {
    tvl,
};

// Call the tvl function for testing
tvl('testTimestamp', 'testEthBlock', { goerli: 'testBlock' })
  .then(result => console.log(result))
  .catch(error => console.error(error));

