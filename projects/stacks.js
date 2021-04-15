const {Configuration, SmartContractsApi, InfoApi} = require('@stacks/blockchain-api-client');
const {cvToHex, cvToString, hexToCV, uintCV} = require('@stacks/transactions');
const retry = require('async-retry')
const fetcher = require('cross-fetch');

const config = new Configuration({
    fetchApi: fetcher,
    basePath: 'https://stacks-node-api.mainnet.stacks.co',
});

const principal = 'SP000000000000000000002Q6VF78.pox';

const contractsApi = new SmartContractsApi(config);
const infoApi = new InfoApi(config);

function uStxToStx(microStx) {
    return Number(Number(microStx) / Math.pow(10, 6));
}

async function getStxPrice() {
    const res = await fetcher('https://api.coingecko.com/api/v3/simple/price?ids=blockstack&vs_currencies=usd');
    const data = await res.json();
    return data.blockstack.usd;
}

async function getTotalStacked() {
    const [contractAddress, contractName] = principal.split('.');
    const info = await infoApi.getPoxInfo()
    const data = await contractsApi.callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-total-ustx-stacked',
        readOnlyFunctionArgs: {
            sender: contractAddress,
            arguments: [cvToHex(uintCV(info.reward_cycle_id))],
        },
    });
    if (data.okay) {
        const total_stacked = parseInt(cvToString(hexToCV(data.result)).replace('u', ''), 10);
        return uStxToStx(total_stacked)
    }
}


async function fetch() {
    const usd = await retry(async bail => getStxPrice());
    const stx = await retry(async bail => getTotalStacked());
    return (stx * usd).toFixed(2);
}

module.exports = {
    fetch
}
