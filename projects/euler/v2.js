const { ethereum } = require('.')
const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const EULER_FACTORY = "0x29a56a1b8214D9Cf7c5561811750D5cBDb45CC8e"
module.exports = {
    methodology: `TVL is supply balance minus borrows the euler contract.`,
    ethereum: {
        tvl,
        borrowed
    }
};

async function tvl(api) {
    const logs = await getLogs({
        api,
        target: EULER_FACTORY,
        fromBlock: 20529225,
        eventAbi: "event ProxyCreated(address indexed proxy, bool upgradeable, address implementation, bytes trailingData)",
        onlyArgs: true
    });

    const vaults = logs.map(log => log.proxy);
    const underlyingAssets = await api.multiCall({ abi: "address:asset", calls: vaults})
    const tokensAndOwners = underlyingAssets.map((underlying, i) => [underlying, vaults[i]]);

    return sumTokens2({ api, tokensAndOwners });
}

async function borrowed(api) {
    const logs = await getLogs({
        api,
        target: EULER_FACTORY,
        fromBlock: 20529225,
        eventAbi: "event ProxyCreated(address indexed proxy, bool upgradeable, address implementation, bytes trailingData)",
        onlyArgs: true
    });

    const vaults = logs.map(log => log.proxy);
    const underlyingAssets = await api.multiCall({ abi: "address:asset", calls: vaults})
    const borrows = await api.multiCall({ abi: "uint256:totalBorrows", calls: vaults})

    api.addTokens(underlyingAssets, borrows);
    return api.getBalances();
}