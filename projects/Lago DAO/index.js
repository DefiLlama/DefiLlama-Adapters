const fetch = require('node-fetch');

const { fetchLocal, mkMeta } = require("../helper/pact");

const creationTime = () => Math.round(new Date().getTime() / 1000) - 10;

let net = `https://api.chainweb.com/chainweb/0.0/mainnet01/chain/1/pact`

async function tvl_kadena() {
    
    let usd2supply;
    let kwUSDCsupply;
    let wBTCSupply;
    let kadenaPrice;
    let bitcoinPrice;

    await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=usd', {

          }).then(response => response.json()
        )
        .then(data => {
          kadenaPrice = data.kadena.usd
        })
        .catch(error => console.error(error))

    await fetch('https://api.coingecko.com/api/v3/simple/price?ids=kadena&vs_currencies=btc', {

        }).then(response => response.json()
      )
      .then(data => {
        bitcoinPrice = data.kadena.btc
      })
      .catch(error => console.error(error))

    let data = await fetchLocal({
        pactCode: `(lago.USD2-wrapper.return-supply "lago.USD2") `,
        meta: mkMeta("", "1" ,0.01,100000000, 28800, creationTime()),
    }, net)
    if (data.result.status === "success"){
        usd2supply = parseFloat(data.result.data) / kadenaPrice
    } 

    let data2 = await fetchLocal({
        pactCode: `(lago.bridge.get-supply "lago.kwUSDC") `,
        meta: mkMeta("", "1" ,0.01,100000000, 28800, creationTime()),
    }, net)

    if (data2.result.status === "success"){
        kwUSDCsupply = parseFloat(data2.result.data.amount) / kadenaPrice
    } 

    let data3 = await fetchLocal({
        pactCode: `(lago.bridge.get-supply "lago.kwBTC") `,
        meta: mkMeta("", "1" ,0.01,100000000, 28800, creationTime()),
    }, net)

    if (data3.result.status === "success"){
        wBTCSupply = parseFloat(data3.result.data.amount) / bitcoinPrice
    }


    return {
        kadena: usd2supply + kwUSDCsupply + wBTCSupply
    }
};

module.exports = {
    timetravel: false,
    misrepresentedTokens: true,
    methodology: "Tracks funds locked in Lago Finance",
    kadena: {
        tvl: tvl_kadena
    }
};