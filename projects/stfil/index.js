const ADDRESSES = require('../helper/coreAssets.json')
const {sumTokens2} = require('../helper/unwrapLPs');
const {utils} = require("ethers");
const {get} = require('../helper/http');

const poolAddr = '0xC8E4EF1148D11F8C557f677eE3C73901CD796Bf6' // pool address
const tokens = [
    ADDRESSES.null, // FIL
]

const getActiveMinersFromRPC = async () => {
    const resp = await get('https://api.stfil.io/v1/node?delegate=1')
    return resp.data.map(({node}) => {
        let bytes = Buffer.alloc(20);
        bytes.writeUint8(0xff, 0);
        bytes.writeBigUint64BE(BigInt(node), 12);
        return utils.getAddress('0x' + bytes.toString('hex'));
    });
}

module.exports = {
    filecoin: {
        tvl: async (_, _1, _2, {api}) => {

            let balances = {};
            await sumTokens2({balances, owner: poolAddr, tokens, api, });

            let minerAddrs = await getActiveMinersFromRPC();
            await sumTokens2({balances, owners: minerAddrs, tokens, api, });

            return balances;
        }
    }
}

