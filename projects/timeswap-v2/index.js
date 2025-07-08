const { getLogs, getAddress } = require("../helper/cache/getLogs");
const { sumTokens2 } = require("../helper/unwrapLPs");

async function tvl(api) {
    const {
        factory,
        oldFactory,
        fromBlock,
        newFactory,
        oldEthFactory,
        factory__2_5,
        factory__2_5_block,
    } = config[api.chain];
    let logs;
    let ownerTokens = [];
    if (factory) {
        logs = await getLogs({
            api,
            target: factory,
            topics: [
                "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
            ],
            fromBlock,
        });

        ownerTokens.push(
            ...logs.map((i) => {
                return [
                    [getAddress(i.topics[2]), getAddress(i.topics[3])],
                    getAddress(i.data),
                ];
            })
        );
    }
    if (factory__2_5) {
        const Logs = await getLogs({
            api,
            target: factory__2_5,
            topics: [
                "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
            ],
            fromBlock: factory__2_5_block,
        });
        const _OwnerTokens = Logs.map((i) => {
            return [
                [getAddress(i.topics[2]), getAddress(i.topics[3])],
                getAddress(i.data),
            ];
        });
        ownerTokens = [...ownerTokens, ..._OwnerTokens];
    }
    if (newFactory) {
        const newLogs = await getLogs({
            api,
            target: newFactory,
            topics: [
                "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
            ],
            fromBlock,
        });
        const newOwnerTokens = newLogs.map((i) => {
            return [
                [getAddress(i.topics[2]), getAddress(i.topics[3])],
                getAddress(i.data),
            ];
        });
        ownerTokens = [...ownerTokens, ...newOwnerTokens];
    }
    if (oldFactory) {
        let oldOwnerTokens;
        const oldLogs = await getLogs({
            api,
            target: oldFactory,
            topics: [
                "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
            ],
            fromBlock,
        });
        oldOwnerTokens = oldLogs.map((i) => {
            const token0 = getAddress(i.data.slice(64, 64 * 2 + 2));
            const token1 = getAddress(i.data.slice(64 * 2, 64 * 3 + 2));
            const pool = getAddress(i.data.slice(64 * 3, 64 * 4 + 2));
            return [[token0, token1], pool];
        });
        ownerTokens = [...ownerTokens, ...oldOwnerTokens];
    }
    if (oldEthFactory) {
        let oldEthOwnerTokens;
        let oldEthLogs = await getLogs({
            api,
            target: oldEthFactory,
            topics: [
                "0x68ff1cfcdcf76864161555fc0de1878d8f83ec6949bf351df74d8a4a1a2679ab",
            ],
            fromBlock: 0x1000476,
            toBlock: 0x103f839,
        });

        oldEthOwnerTokens = oldEthLogs.map((i) => {
            return [
                [getAddress(i.topics[2]), getAddress(i.topics[3])],
                getAddress(i.data),
            ];
        });
        ownerTokens = [...ownerTokens, ...oldEthOwnerTokens];
    }

    return sumTokens2({
        api,
        ownerTokens,
        permitFailure: true,
    });
}

const config = {
    polygon: {
        oldFactory: "0xcAB2E5Ba8b3A8d8Bf8B50F0eec12884D0255fB4A",
        factory: "0xcf0aca5c5b7e1bF63514D362243b6c50d5761FE8",
        newFactory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 52205905,
        fromBlock: 39476334,
    },
    ethereum: {
        oldEthFactory: "0xcf0aca5c5b7e1bF63514D362243b6c50d5761FE8",
        factory: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        fromBlock: 17037368,
    },
    arbitrum: {
        factory: "0xcf0aca5c5b7e1bF63514D362243b6c50d5761FE8",
        newFactory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 168977872,
        fromBlock: 70785970,
    },
    mantle: {
        factory: "0xf8F5e4B7825d484FBDFDC36fc915E79f30b02f9E",
        newFactory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 43190605,
        fromBlock: 3563,
    },
    polygon_zkevm: {
        factory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 9133903,
        fromBlock: 1787343,
    },
    base: {
        factory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 9045635,
        fromBlock: 2493999,
    },
    optimism: {
        factory: "0x406d3Dfcbe20b642c2262b29b960822975371502",
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 114721107,
        fromBlock: 112818437,
    },
    inevm: {
        factory__2_5: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        factory__2_5_block: 118420,
    },
    xlayer: {
        factory: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        fromBlock: 682246,
    },
    hyperliquid: {
        factory: "0x17385e95cb74A20150E4fA092Aa72D57330896C4",
        fromBlock: 200467,
    }
};

Object.keys(config).forEach((chain) => {
    module.exports[chain] = { tvl };
    module.exports.hallmarks = [
        [1676851200, "Timeswap V2 launch"],
        [1697760000, "Premine of $TIME"],
    ];
});
