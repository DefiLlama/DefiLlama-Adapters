const {post} = require("../../helper/http");
const {scvAddressToXDR, scAddressToXDR} = require("./xdr/xdr");

const sorobanEndpoint = 'https://mainnet.sorobanrpc.com';

async function getTokenBalance(tokenAddress, ownerAddress) {
    const tokenContractHex = scAddressToXDR(tokenAddress).toString('hex');
    const addressHex = scvAddressToXDR(ownerAddress).toString('hex');

    const ledgerKey = Buffer.from(`00000006${tokenContractHex}0000001000000001000000020000000f0000000742616c616e636500${addressHex}00000001`, 'hex');
    const body = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getLedgerEntries",
        "params": {
            "xdrFormat": "json",
            "keys": [ledgerKey.toString('base64')]
        }
    };

    const res = await post(sorobanEndpoint, body);

    const entries = res?.result?.entries;

    if (!entries || entries.length === 0) {
        return "0";
    }

    const contractDataValues = entries[0]?.dataJson?.contract_data?.val?.map || [];
    const amountEntry = contractDataValues.find(e => e?.key?.symbol === "amount");
    return parseI128(amountEntry?.val?.i128).toString();
}

function parseI128(i128) {
    if (!i128) return BigInt(0);
    return (BigInt(i128.hi) << BigInt(64)) | BigInt(i128.lo);
}

module.exports = {
    getTokenBalance
}
