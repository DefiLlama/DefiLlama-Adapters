const TronWeb = require('tronweb')

const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    headers: { "TRON-PRO-API-KEY": '66410e19-c0f6-449c-aae3-78f2581a1a0b' },
})
tronWeb.setAddress('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');

async function unverifiedCall(contract, functionSelector, parameter) {
    var options = {};
    transaction = await tronWeb.transactionBuilder.triggerConstantContract(contract, functionSelector, options, parameter);
    return tronWeb.BigNumber("0x" + transaction['constant_result'][0]);
}

function getUnverifiedTokenBalance(token, account) {
    return unverifiedCall(token, 'balanceOf(address)', [
        {
            type: 'address',
            value: account
        }
    ])
}

async function getTokenBalance(token, account) {
    const contract = await tronWeb.contract().at(token);
    const [balance, decimals] = await Promise.all([
        contract.balanceOf ? contract.balanceOf(account).call() : getUnverifiedTokenBalance(token, account),
        contract.decimals ? contract.decimals().call() : unverifiedCall(token, 'decimals()', [])
    ]);
    return Number(balance.toString()) / (10 ** decimals)
}

function getTrxBalance(account) {
    return tronWeb.trx.getAccount(
        account,
    ).then(response => response.balance);
}

module.exports = {
    getTokenBalance,
    getTrxBalance,
    getUnverifiedTokenBalance,
    unverifiedCall
}
