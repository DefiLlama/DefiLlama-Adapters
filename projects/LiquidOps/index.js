const { post } = require("../helper/http.js")
const methodologies = require('../helper/methodologies');


const endpoint = 'https://cu.ardrive.io'
const controllerId = 'SmmMv0rJwfIDVM3RvY2-P729JFYwhdGSeGo2deynbfY'
const geckoTickerTransformations = {
    'wAR': 'arweave',
    'wUSDC': 'usd-coin',
    'wUSDT': 'tether',
    'wETH': 'ethereum',
    'USDA': 'usd-coin',
    'vAR': 'arweave',
    'vUSDC': 'usd-coin',
    'vDAI': 'dai',
    'vETH': 'ethereum',
};



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


function scaleBalance(amount, denomination) {
  if (amount === "0") return 0;
  const denominationVal = parseInt(denomination);
  const len = amount.length;

  if (denominationVal >= len) {
      return parseFloat("0." + "0".repeat(denominationVal - len) + amount.replace(/0+$/, ""));
  }

  const integerPart = amount.substr(0, len - denominationVal);
  const fractionalPart = amount.substr(len - denominationVal).replace(/0+$/, "");

  if (fractionalPart === "") return parseInt(integerPart);

  return parseFloat(integerPart + "." + fractionalPart);
}


async function getTokenInfos(supportedTokens) {
  
  const tokenInfo = [];
  
  for (const balanceObject of supportedTokens) {
    const infoRes = await DryRun(balanceObject.oToken, "Info");
    await new Promise(resolve => setTimeout(resolve, 1000)); // don't overload node
    
    const tagsObject = Object.fromEntries(
      infoRes.Messages[0].Tags.map((tag) => [tag.name, tag.value])
    );
    const ticker = geckoTickerTransformations[balanceObject.ticker] || balanceObject.ticker;
    
    tokenInfo.push({
      ticker: `coingecko:${ticker}`,
      cash: scaleBalance(tagsObject['Cash'], tagsObject['Denomination']),
      totalBorrows: scaleBalance(tagsObject['Total-Borrows'], tagsObject['Denomination'])
    });
  }
  
  return tokenInfo;
}

async function tvl() {
  const supportedTokensRes = await DryRun(controllerId, "Get-Tokens");
  await new Promise(resolve => setTimeout(resolve, 1000)); // don't overload node
  const supportedTokens = JSON.parse(supportedTokensRes.Messages[0].Data);
  const tokensInfo = await getTokenInfos(supportedTokens);
  const combinedBalances = {};
  
  // Check if we already have a balance for this ticker
  tokensInfo.forEach(token => {
    if (combinedBalances[token.ticker]) {
      combinedBalances[token.ticker] += token.cash;
    } else {
      combinedBalances[token.ticker] = token.cash;
    }
  });
  
  return combinedBalances;
}


async function borrowed() {
    await new Promise(resolve => setTimeout(resolve, 5000)); // don't trigger both functions at the same time to not overload node
  const supportedTokensRes = await DryRun(controllerId, "Get-Tokens");
  const supportedTokens = JSON.parse(supportedTokensRes.Messages[0].Data);
    await new Promise(resolve => setTimeout(resolve, 1000)); // don't overload node
  const tokensInfo = await getTokenInfos(supportedTokens);
  const combinedBalances = {};
  
  tokensInfo.forEach(token => {
    // Check if we already have a balance for this ticker
    if (combinedBalances[token.ticker]) {
      combinedBalances[token.ticker] += token.totalBorrows;
    } else {
      combinedBalances[token.ticker] = token.totalBorrows;
    }
  });

  return combinedBalances
  
}


module.exports = {
  methodology: methodologies.lendingMarket,
  ao: { tvl, borrowed },
};
// node test.js projects/LiquidOps/index.js
