const { getLogs } = require("../helper/cache/getLogs");
const BigNumber = require('bignumber.js');
const addresses = require('../helper/coreAssets.json')

const startBlockNumber = 19944102;
const contractAddress = "0xb51803e6fb0f0c68cc72236cc8da985483a6e0d3";
async function tvl(api) {
    let tvl = {}

    let ethTVL = new BigNumber(0);
    const ethLogs = await getLogs({
        api,
        target: contractAddress,
        topic: "event WormholeETHDepositEvent(address,uint256,uint16,bytes32,uint64)",
        fromBlock: startBlockNumber,
        eventAbi: "event WormholeETHDepositEvent(address user, uint256 amount, uint16 targetChain, bytes32 forwarder, uint64 messageSequence)",
        onlyArgs: true,
        extraKey: "WormholeETHDepositEvent"
    });
    ethLogs.forEach(ethLog => {
        ethTVL = ethTVL.plus(ethLog[1]);
    });
    tvl[`ethereum:${addresses.null}`] = ethTVL;

    const erc20TVL = {}
    const erc20Logs = await getLogs({
        api,
        target: contractAddress,
        topic: "event WormholeERC20DepositEvent(address,address,uint256,uint16,bytes32,uint64)",
        fromBlock: startBlockNumber,
        eventAbi: "event WormholeERC20DepositEvent(address user, address token, uint256 amount, uint16 targetChain, bytes32 forwarder, uint64 messageSequence)",
        onlyArgs: true,
        extraKey: "WormholeERC20DepositEvent"
    });
    erc20Logs.forEach(erc20Log => {
        const tokenKey = `ethereum:${erc20Log[1].toLowerCase()}`;
        erc20TVL[tokenKey] = erc20TVL[tokenKey] === undefined ? new BigNumber(erc20Log[2]) : erc20TVL[tokenKey].plus(erc20Log[2]);
    });
    tvl = {...tvl, ...erc20TVL};

    return tvl;
}

module.exports = {
    start: startBlockNumber,
    ethereum: {
        tvl
    }
};