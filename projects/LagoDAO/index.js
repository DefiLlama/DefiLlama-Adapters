const fetch = require('node-fetch');

const { fetchLocal, mkMeta } = require("../helper/pact");

const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

let net = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/1/pact`

async function tvl_kadena() {
    
    let kwUSDCsupply;
    let kadenaPrice;

    await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd', {

          }).then(response => response.json()
        )
        .then(data => {
          kadenaPrice = data.kadena.usd
        })
        .catch(error => console.error(error))

    let data2 = await fetchLocal({
        pactCode: `(lago.bridge.get-supply "lago.kwUSDC") `,
        meta: mkMeta("", "1" ,0.01,100000000, 28800, creationTime()),
    }, net)

    if (data2.result.status === "success"){
        kwUSDCsupply = parseFloat(data2.result.data.amount) / kadenaPrice
    } 



    return {
        kadena: kwUSDCsupply
    }
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Tracks the kwUSDC collateral which backs the USD2 stablecoin on Kadena.",
    kadena: {
        tvl: tvl_kadena
    }
};
