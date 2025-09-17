const sui = require("../helper/chain/sui");
const suiSdk = require('@mysten/sui/transactions')
const client = require('@mysten/sui/client')
const bcs = require('@mysten/bcs')
const BigNumber = require('bignumber.js')
const axios = require('axios')

const PACKAGE_ID = "0xc83d5406fd355f34d3ce87b35ab2c0b099af9d309ba96c17e40309502a49976f";

async function suiTvl(api) {
    const vaults = (await axios.get(`https://vaults.api.sui-prod.bluefin.io/api/v1/vaults/info`)).data.Vaults;
    for (const vault of Object.values(vaults)) {
        const vaultTvl = await getVaultTvl(vault.ObjectId, vault.DepositCoinType, vault.ReceiptCoinType)
        api.add(vault.DepositCoinType, vaultTvl)
    }
}

async function getVaultTvl(vaultId, depositCoinType, receiptCoinType) {
    const suiClient = new client.SuiClient({
        url: sui.endpoint,
    })
    const txb = new suiSdk.Transaction();
    txb.moveCall({
        target: `${PACKAGE_ID}::vault::get_vault_tvl`,
        arguments: [
            txb.object(
                vaultId
            )
        ],
        typeArguments: [
            depositCoinType, // T
            receiptCoinType // R
        ]
    });
    const result = (
        await suiClient.devInspectTransactionBlock({
            transactionBlock: txb,
            sender: "0xbaef681eafe323b507b76bdaf397731c26f46a311e5f3520ebb1bde091fff295"
        })
    ).results[0].returnValues.map(([bytes, _]) =>
        new BigNumber(bcs.bcs.u64().parse(Uint8Array.from(bytes)))
    );
    return result
}


module.exports = {
  sui: {
    tvl: suiTvl
  },
}
