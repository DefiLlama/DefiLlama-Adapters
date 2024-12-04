const ADDRESES = require("../helper/coreAssets.json");
const abi = require("../helper/abis/skaleDepositBoxERC20.json");
const sdk = require("@defillama/sdk");
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl() {
    

  const imaDepositBoxETH = '0x49F583d263e4Ef938b9E09772D3394c71605Df94';
  const imaDepositBoxERC20 = '0x8fB1A35bB6fB9c47Fb5065BE5062cB8dC1687669';

  let tokensAndOwners = [
    [ADDRESES.null, imaDepositBoxETH]
  ];

  const { output } = await sdk.api.abi.call({
    chain: "ethereum",
    abi: abi.getSchainToAllERC20Length,
    target: imaDepositBoxERC20,
    params: ["elated-tan-skat"],
  });

  const numberTokens = output;

  let tokens = [];

  for (let i = 0; i < numberTokens; i += 10) {
    let remainingTokens = numberTokens - i;
    const { output } = await sdk.api.abi.call({
      chain: "ethereum",
      abi: abi.getSchainToAllERC20,
      target: imaDepositBoxERC20,
      params: ["elated-tan-skat", i, remainingTokens >= 10 ? i + 10 : i + remainingTokens],
    });

    tokens = [...tokens, ...output]
  }

  tokens.forEach((token) => {
    tokensAndOwners.push([token, imaDepositBoxERC20]);
  });

  return await sumTokens2({
    chain: "ethereum",
    tokensAndOwners,
    fetchCoValentTokens: true,
    permitFailure: false
  })
}


module.exports = {
  start: '2021-07-19', // Mon July 19 06:38:20 PM UTC 2021
  europa: {
    tvl
  }
}
