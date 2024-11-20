const { post } = require('../helper/http')

async function tvl() {
    return post('https://eos.greymass.com/v1/chain/get_table_rows', {
        json: true,
        code: "btc.xsat",
        scope: "BTC",
        table: "stat",
        limit: "1",
        reverse: false,
        show_payer: false
    }).then(response => {
        return {
            bitcoin: parseFloat(response.rows[0].supply.split(" ")[0])
        }
    })
}

module.exports = {
    methodology: `EOS ExSAT EVM TVL is achieved by querying the total available supply from the [btc.xsat] account. This supply fluctuates as users deposit and withdraw funds from the ExSAT EVM.`,
    eos: {
        tvl
    },
}
