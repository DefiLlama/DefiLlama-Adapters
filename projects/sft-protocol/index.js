const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs');
const { getConfig } = require('../helper/cache');

const tokens = [
    ADDRESSES.null, // FIL
]

const LENDING_POOL_ADDRESS = "0x147122D1EBdA76E4910ccdC53aEb6a58605Eb58E";

const getActiveMinersFromRPC = async () => {
    const resp = await getConfig('sft-protocol', 'https://ww8.sftproject.io/api/c/api/v1/public/dashboard/info')
    let nodes = []
    let node_i = []
    nodes = resp.data.combined
    .filter(i => i.miner && i.miner !== '')
    .map(({ miner }) => {
        let node = parseInt(miner.slice(2,))
        let bytes = Buffer.alloc(20);
        bytes.writeUint8(0xff, 0);
        bytes.writeBigUint64BE(BigInt(node), 12);
        return '0x' + bytes.toString('hex')
    });

    if (resp.data.independent !== null) {
        node_i = resp.data.independent
        .filter(i => i.miner && i.miner !== '')
        .map(({ miner }) => {
            let node = parseInt(miner.slice(2,))
            let bytes = Buffer.alloc(20);
            bytes.writeUint8(0xff, 0);
            bytes.writeBigUint64BE(BigInt(node), 12);
            return '0x' + bytes.toString('hex')
        });
    }
    nodes = nodes.concat(node_i)
    return nodes
}

module.exports = {
    filecoin: {
        tvl: async (api) => {

            let balances = await sumTokens2({ owner: LENDING_POOL_ADDRESS, tokens, api });

            let minerAddrs = await getActiveMinersFromRPC();
            await sumTokens2({ balances, owners: minerAddrs, tokens, api, });

            return balances;
        }
    }
}

