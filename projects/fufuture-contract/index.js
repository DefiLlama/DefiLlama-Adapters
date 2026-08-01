const {getLogs2, getAddress,} = require('../helper/cache/getLogs');
const {sumTokens2} = require('../helper/unwrapLPs');
const { ethers } = require("ethers");


async function tvl(api) {
    const {factory, fromBlock} = config[api.chain]
    const privateLogs = await getLogs2({
        api,
        factory,
        fromBlock,
        extraKey: 'private-pool',
        topics: ['0xe34d8fa001b04475d221b96a007a245b5ce7381c8fa9a9bf4b8fb5ffecbca93e']
    })

    const logs = privateLogs
    const ownerTokens = []
    const allTokens = []
    const ABI=[{
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "creator",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "settle",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "perpetual",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "privatePool",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "orderBook",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "tradeAgent",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "tradeStation",
                "type": "address"
            }
        ],
        "name": "createTradePool",
        "type": "event"
    }]
    const iface = new ethers.Interface(ABI);
    logs.forEach((log) => {
        const decoded = iface.parseLog({
            topics: log.topics,
            data: log.data
        });
        const token = decoded.args[1]
        const pool = decoded.args[3]
        ownerTokens.push([[token], pool])
        allTokens.push(token)
    })
    ownerTokens.push([allTokens, factory])
    return sumTokens2({api, ownerTokens, permitFailure: true})
}

module.exports = {
    methodology: "The world's first decentralized currency standard Perpetual options Transaction agreement",
};

const config = {
    bsc: {
        factory: '0x2eA66eF91bF4CeBf05BbfaF0A4d623d70774a95B',
        fromBlock: 58947886,
    },
    base: {
        factory: '0x252d96aF69670968Ed130A3FFe1Eb7E05721eb49',
        fromBlock: 34704963,
    },
    conflux:{
        factory: '0xb3C0F0330A06dB0587eF4A6A283A1f117203871c',
        fromBlock: 129317505,
    },
    eni:{
        factory: '0x09cD4951c43D609Ce01E8A05816537bB17eb1788',
        fromBlock: 10830841,
    },
    xlayer:{
         factory: '0x09cD4951c43D609Ce01E8A05816537bB17eb1788',
         fromBlock: 42950554,
    }
    // pharos:{
    //     factory: '0x625D25bc601d92F77e321848f4e937c19F79f6c9',
    //     fromBlock: 3078868,
    // }
}

Object.keys(config).forEach(chain => {
    module.exports[chain] = {tvl}
})
