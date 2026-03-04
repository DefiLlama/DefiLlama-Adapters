const contracts = require('./contracts');
const { getLogs } = require('../helper/cache/getLogs')

async function getMultiDepositorVaults(api) {
    const vaults = [];
    const factory = contracts[api.chain].multiDepositorVaultFactory;
    const logs = await getLogs({
        api,
        target: factory.address,
        topic: factory.topic,
        topics: factory.topics,
        eventAbi: factory.eventAbi,
        fromBlock: factory.fromBlock,
        onlyArgs: true,
    });
    vaults.push(...logs.map(x => x.vault))
    return vaults;
}

module.exports = {
    getMultiDepositorVaults,
};