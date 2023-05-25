const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokens2} = require('../helper/unwrapLPs');
const {utils} = require("ethers");
const {get} = require('../helper/http');

const tokens = [
    ADDRESSES.null, // FIL
]

const getActiveMinersFromRPC = async () => {
    const resp = await get('https://api.sftproject.io/api/v1/public/dashboard/info')
    let nodes = []
    let node_i = []
    nodes = resp.data.combined.map(({ miner }) => {
        let node = parseInt(miner.slice(2,))
        let bytes = Buffer.alloc(20);
        bytes.writeUint8(0xff, 0);
        bytes.writeBigUint64BE(BigInt(node), 12);
        return utils.getAddress('0x' + bytes.toString('hex'));
    });
    
    if (resp.data.independent !== null) {
        node_i = resp.data.independent.map(({ miner }) => {
            let node = parseInt(miner.slice(2,))
            let bytes = Buffer.alloc(20);
            bytes.writeUint8(0xff, 0);
            bytes.writeBigUint64BE(BigInt(node), 12);
            return utils.getAddress('0x' + bytes.toString('hex'));
        });
    }
    nodes = nodes.concat(node_i)
    return nodes
}

module.exports = {
    filecoin: {
        tvl: async (_, _1, _2, {api}) => {

            let balances = {};

            let minerAddrs = await getActiveMinersFromRPC();
            await sumTokens2({balances, owners: minerAddrs, tokens, api, });

            return balances;
        }
    }
}

