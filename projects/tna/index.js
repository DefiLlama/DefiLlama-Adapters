const { getLogs } = require('../helper/cache/getLogs')
const ADDRESSES = require('../helper/coreAssets.json')

const tapname = "0x048d86f26952aB5e1F601f897BC9512A1E7fA675"

async function tvl(api) {
    const logs = await getLogs({
        api,
        target: tapname,
        topic: "Register(address,uint256,uint256,uint256,bytes)",
        fromBlock: 1132105,
        eventAbi: "event Register(address indexed owner,uint256 indexed rootId,uint256 indexed tokenId,uint256 fee,bytes fullName)",
    });

    // decimals 18
    let totalBTC = logs.map(log => log.args.fee).reduce((acc, cur) => acc + cur);

    // convert to decimals 8
    let balances = {};
    balances[ADDRESSES.ethereum.WBTC] = totalBTC / 10000000000n;
    return balances;
}

module.exports = {
    btr: {
        tvl,
    },
};