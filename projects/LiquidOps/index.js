const { post } = require("../helper/http.js")


const endpoint = 'https://cu.ao-testnet.xyz'
const controllerId = 'SmmMv0rJwfIDVM3RvY2-P729JFYwhdGSeGo2deynbfY'
const tickerTransformations = {
    'qAR': 'AR',
    'wUSDC': 'USDC',
  };
  

async function tvl() {

    const supportedTokensRes = await DryRun(controllerId, "Get-Tokens")
    const supportedTokens = JSON.parse(supportedTokensRes.Messages[0].Data)

    const balancesArray = await Promise.all(
        supportedTokens.map(async balanceObject => {
          const infoRes = await DryRun(balanceObject.oToken, "Info");
          const tagsObject = Object.fromEntries(
            infoRes.Messages[0].Tags.map((tag) => [tag.name, tag.value]),
          );
          const ticker = tickerTransformations[balanceObject.ticker] || balanceObject.ticker;
          return { ticker, balance: tagsObject['Cash'], denomination: tagsObject['Denomination'] };
        })
      );

      console.log(balancesArray)



    // How to get USD valances for balancesArray?
    // response: 
    // const balancesArray = [
    //   { ticker: 'USDC', balance: '11138876965', denomination: '6' },
    //   { ticker: 'AR', balance: '792019358040000', denomination: '12' }
    // ]

}



// Access AO on chain data via the node endpoint
async function DryRun(target, action) {
    const response = await post(`${endpoint}/dry-run?process-id=${target}`, { 
        Id: "1234", Target: target, Owner: "1234", Anchor: "0", Data: "1234",
        Tags: [
            ["Target", target],
            ["Action", action],
            ["Data-Protocol", "ao"],
            ["Type", "Message"],
            ["Variant", "ao.TN.1"]
        ].map(([name, value]) => ({ name, value }))
    });
    return response
}


module.exports = {
  methodology: "TVL is calculated by getting all supported token pools on LiquidOps, then the lent token balances from the pools and adding up all token USD values provided by CoinGecko.",
  LiquidOps: { tvl },
};


// TODO: remove later after testing
tvl()
  .then(() => console.log('TVL calculation completed'))
  .catch(error => console.error('Error calculating TVL:', error));