const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");

// chains with staking component:

let stkTokensObject = {
  stkATOM: "0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE",
  stkXPRT: "0x45e007750Cc74B1D2b4DD7072230278d9602C499",
};

let pTokensObject = {
  pATOM: "0x446E028F972306B5a2C36E81D3d088Af260132B3",
  pXPRT: "0x8793cD84c22B94B1fDD3800f02C4B1dcCa40D50b",
};

const sushiGraphUrl =
  "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

// graphQL query to only get the Staking Contract section of the TVL (pool2)
const sushiGraphQuery = gql`
  query pstakePairs($stkContract: String, $block: Int) {
    pairs(where: { token0: $stkContract }, block: { number: $block }) {
      reserve0
      token0 {
        decimals
      }
    }
  }
`;

async function eth(timestamp, block) {
  let balances = {};

  // get the total supply of each stkToken
  const stkTokenTotalSupplyValues = await sdk.api.abi.multiCall({
    abi: "erc20:totalSupply",
    calls: Object.keys(stkTokensObject).map((t) => ({
      target: stkTokensObject[t],
    })),
    block,
  });

  // get the total supply of each pToken
  const pTokenTotalSupplyValues = await sdk.api.abi.multiCall({
    abi: "erc20:totalSupply",
    calls: Object.keys(pTokensObject).map((t) => ({
      target: pTokensObject[t],
    })),
    block,
  });

  // add the total supply values individually to the balances object
  // stkTokenTotalSupplyValues.output.forEach((call, index) => {
  for (
    let index = 0;
    index < stkTokenTotalSupplyValues.output.length;
    index++
  ) {
    // ADD THE VALUES OF STKTOKENS
    const underlyingStkToken =
      stkTokenTotalSupplyValues.output[index].input.target;
    const underlyingStkTokenBalance =
      stkTokenTotalSupplyValues.output[index].output;
    // sumSingleBalance is used to allocate only number of tokens and token address and it is
    // supposed to pull the price directly from the usd price in the various pools in defilama
    sdk.util.sumSingleBalance(
      balances,
      underlyingStkToken,
      underlyingStkTokenBalance
    );

    // ADD THE VALUES OF PTOKENS AS WELL
    // const underlyingPToken = pTokenTotalSupplyValues[index].input.target;
    const underlyingPTokenBalance =
      pTokenTotalSupplyValues.output[index].output;
    // sumSingleBalance is used to allocate only number of tokens and token address and it is
    // supposed to pull the price directly from the usd price in the various pools in defilama
    sdk.util.sumSingleBalance(
      balances,
      underlyingStkToken,
      underlyingPTokenBalance
    );
  }

  return balances;
}

async function pool2(timestamp, block) {
  let balances = {};

  for (let index = 0; index < Object.values(stkTokensObject).length; index++) {
    const { pairs } = await request(sushiGraphUrl, sushiGraphQuery, {
      stkContract: Object.values(stkTokensObject)
        [index].toString()
        .toLocaleLowerCase(),
      block: block,
    });

    let reserve0BN = BigNumber(pairs[0].reserve0);
    let decimals = Number(pairs[0].token0.decimals);

    const underlyingToken = Object.values(stkTokensObject)[index];
    const underlyingTokenBalance = reserve0BN.shiftedBy(decimals).toString();
    sdk.util.sumSingleBalance(
      balances,
      underlyingToken,
      underlyingTokenBalance
    );
  }

  return balances;
}

module.exports = {
  methodology: `We get the totalSupply of the constituent token contracts (like stkATOM, pATOM, stkXPRT, pXPRT etc.) and then we multiply it with the USD market value of the constituent token`,
  ethereum: {
    tvl: eth,
    pool2: pool2,
  },
};
