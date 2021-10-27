const sdk = require('@defillama/sdk');
const abi = require('./abi.json');

const CHAIN_HECO = "heco"
const CHAIN_BSC = "bsc"
const CHAIN_POLYGON = "polygon"
const CHAIN_OEC = "okexchain"

const VAULT_HECO = "0x1cF73836aE625005897a1aF831479237B6d1e4D2"
const VAULT_BSC = "0x7033A512639119C759A51b250BfA461AE100894b"
const VAULT_POLYGON = "0xE95876787B055f1b9E4cfd5d3e32BDe302BF789d"
const VAULT_OEC = "0xa8AF3199aCE72E47c1DEb56E58BEA1CD41C37c22"

const USDT_HECO = "0xa71EdC38d189767582C38A3145b5873052c3e47a"
const USDT_BSC = "0x55d398326f99059fF775485246999027B3197955"
const USDT_POLYGON = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F"
const USDT_OEC = "0x382bB369d343125BfB2117af9c149795C6C65C50"

const tvlHeco = async (timestamp, blockETH, chainBlocks) => {
    let block = chainBlocks[CHAIN_HECO];
    if (block === undefined) {
        block = (await sdk.api.util.lookupBlock(timestamp, { chain: CHAIN_HECO })).block;
    }
    const statistics = (await sdk.api.abi.call({ target: VAULT_HECO, abi: abi["getGlobalStatistics"], block: block, chain: CHAIN_HECO })).output;
    const balances = {}
    balances[CHAIN_HECO + ":" + USDT_HECO] = statistics[0]
    return balances;
};

const tvlBsc = async (timestamp, blockETH, chainBlocks) => {
    let block = chainBlocks[CHAIN_BSC];
    if (block === undefined) {
        block = (await sdk.api.util.lookupBlock(timestamp, { chain: CHAIN_BSC })).block;
    }
    const statistics = (await sdk.api.abi.call({ target: VAULT_BSC, abi: abi["getGlobalStatistics"], block: block, chain: CHAIN_BSC })).output;
    const balances = {}
    balances[CHAIN_BSC + ":" + USDT_BSC] = statistics[0]
    return balances;
};

module.exports = {
    heco: {
        tvl: tvlHeco
    },
    bsc: {
        tvl: tvlBsc
    }
};
