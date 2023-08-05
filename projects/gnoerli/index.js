const ethers = require('ethers');
const sdk = require('@defillama/sdk');

// Assuming you have the ABI for both contracts
const fs = require('fs');

const primaryIssueManagerData = JSON.parse(fs.readFileSync('./PrimaryIssueManager.json', 'utf8'));
const primaryIssueManagerABI = primaryIssueManagerData.abi;
const secondaryIssueManagerData = JSON.parse(fs.readFileSync('./SecondaryIssueManager.json', 'utf8'));
const secondaryIssueManagerABI = secondaryIssueManagerData.abi;

const contracts = {
    goerli: {
        primary: '0x63D95635938857Ad202f0684dfd91dc71C9d111e',
        secondary: '0xe1f45e7104069F998b919C26435c4aaBAeD68fEd',
    },
};

async function tvl(timestamp, ethBlock, chainBlocks) {
    let totalTVL = ethers.BigNumber.from(0);
    const balances = {};
    const block = chainBlocks.goerli;
    const infuraProvider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/324d7d968bb245e39b4edcda5a16c7a4');

    const primaryContract = new ethers.Contract(contracts.goerli.primary, primaryIssueManagerABI, infuraProvider);
    const secondaryContract = new ethers.Contract(contracts.goerli.secondary, secondaryIssueManagerABI, infuraProvider);

    const filter = primaryContract.filters.subscribers();
    const startBlock = 0; 
    const endBlock = 'latest'; 

    const primaryEvents = await primaryContract.queryFilter(filter, startBlock, endBlock);
    await Promise.all(primaryEvents.map(async event => {
        const cashSwapped = ethers.BigNumber.from(event.args.cashSwapped);
        const currency = event.args.currency;
        totalTVL = totalTVL.add(cashSwapped);
        sdk.util.sumSingleBalance(balances, currency, cashSwapped.toString());
    }));

    const filterSecondary = secondaryContract.filters.subscribers();
    const secondaryEvents = await secondaryContract.queryFilter(filterSecondary, startBlock, endBlock);
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
tvl('testTimestamp', 'testEthBlock', { goerli: 'testBlock' })
  .then(result => console.log(result))
  .catch(error => console.error(error));
