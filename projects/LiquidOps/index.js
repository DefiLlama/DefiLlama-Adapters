const { post } = require("../helper/http.js")


const endpoint = 'https://cu.ao-testnet.xyz'
const controllerId = 'SmmMv0rJwfIDVM3RvY2-P729JFYwhdGSeGo2deynbfY'
const tickerTransformations = {
    'qAR': 'AR',
    'wUSDC': 'USDC',
  };
  

async function tvl() {

    const supportedTokens = Object.values(await DryRun(controllerId, "Get-Tokens"))

    const balancesArray = await Promise.all(
        supportedTokens.map(async balanceObject => {
          const balance = await DryRun(balanceObject.id, "Balance");
          const ticker = tickerTransformations[balanceObject.ticker] || balanceObject.ticker;
          return { ticker, balance };
        })
      );

    console.log(balancesArray)

    // How to get USD valances for balancesArray?
    // response: 
    // const balancesArray = [
    //   { ticker: 'USDC', balance: 698328699 },
    //   { ticker: 'AR', balance: 1880007389099 }
    // ]

}



// Access AO on chain data via the node endpoint
async function DryRun(target, action) {
    const { Messages: [{ Data }] } = await post(`${endpoint}/dry-run?process-id=${target}`, { 
        Id: "1234", Target: target, Owner: "1234", Anchor: "0", Data: "1234",
        Tags: [
            ["Target", target],
            ["Action", action],
            ["Data-Protocol", "ao"],
            ["Type", "Message"],
            ["Variant", "ao.TN.1"]
        ].map(([name, value]) => ({ name, value }))
    });
    return JSON.parse(Data);
}


module.exports = {
  methodology: "TVL is calculated by getting all supported token pools on LiquidOps, then the lent token balances from the pools and adding up all token USD values provided by CoinGecko.",
  LiquidOps: { tvl },
};


// TODO: remove later after testing
tvl()
  .then(() => console.log('TVL calculation completed'))
  .catch(error => console.error('Error calculating TVL:', error));