const {getLogs} = require("../helper/cache/getLogs");
const {sumTokens} = require("../helper/chain/bitcoin");
const {convertToBigInt} = require("@defillama/sdk/build/generalUtil");
const btcTxHashLockApi = 'https://api.b14g.xyz/restake/marketplace/defillama/btc-tx-hash'

function reserveBytes(txHashTemp) {
    let txHash = ''
    if (txHashTemp.length % 2 === 1) {
        txHashTemp = '0' + txHashTemp
    }
    txHashTemp = txHashTemp.split('').reverse().join('')
    for (let i = 0; i < txHashTemp.length - 1; i += 2) {
        txHash += txHashTemp[i + 1] + txHashTemp[i]
    }
    return txHash
}

module.exports = {
    core: {
        tvl: async function tvl(api) {
            const logs = await getLogs({
                api,
                target: "0x04EA61C431F7934d51fEd2aCb2c5F942213f8967",
                topics: ['0xd2b1d5b132f5d4708209ccf5c5901620429f83988ea4d678603d1f2d57e2400f'],
                eventAbi: 'event CreateRewardReceiver(address indexed from, address indexed rewardReceiver, uint256 portion, uint256 time)',
                onlyArgs: true,
                fromBlock: 19942300,
            })
            const receiverRewards = logs.map(i => i[1])


            const coreStakeAmounts = (await api.multiCall({
                abi: 'function totalCoreStake() external view returns (uint256)',
                calls: receiverRewards
            })).flat()


            const totalCoreStake = coreStakeAmounts.reduce((acc, cur) => convertToBigInt(cur) + acc, BigInt(0))
            const response = await fetch(btcTxHashLockApi)
            const listTxHash = await response.json();
            let listAddressLock = [];
            for (let txHash of listTxHash.data.result) {
                let response = await fetch(`https://mempool.space/api/tx/${reserveBytes(txHash.txHash.slice(2))}`)
                let tx = await response.json()
                let vinAddress = tx.vin.map(el => el.prevout.scriptpubkey_address);
                tx.vout.forEach(el => {
                    if (el.scriptpubkey_type !== "op_return" && !vinAddress.includes(el.scriptpubkey_address)) {
                        listAddressLock.push(el.scriptpubkey_address)
                    }
                })
            }
            let amountBTC = await sumTokens({balances: {}, owners: listAddressLock, timestamp: Date.now()})
            api.addGasToken(totalCoreStake)
            api.addCGToken('bitcoin', amountBTC.bitcoin)
        }
    },
}


