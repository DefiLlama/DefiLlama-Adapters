const BigNumber = require("bignumber.js");
const { request, gql } = require("graphql-request");
const sdk = require("@defillama/sdk");

// chains with staking component:

// ATOM
const stkATOMContract = "0x44017598f2AF1bD733F9D87b5017b4E7c1B28DDE";
const stkATOMContractWithoutChecksum =
  "0x44017598f2af1bd733f9d87b5017b4e7c1b28dde";
const pATOMContract = "0x446E028F972306B5a2C36E81D3d088Af260132B3";

// XPRT
const stkXPRTContract = "0x45e007750Cc74B1D2b4DD7072230278d9602C499";
const stkXPRTContractWithoutChecksum =
  "0x45e007750cc74b1d2b4dd7072230278d9602c499";
const pXPRTContract = "0x8793cD84c22B94B1fDD3800f02C4B1dcCa40D50b";
// ---

// stk contract array for Staking calculation
let stkContractArray = [
  stkATOMContractWithoutChecksum,
  stkXPRTContractWithoutChecksum,
];

let pStakeContractArray = [
  stkATOMContract,
  pATOMContract,
  stkXPRTContract,
  pXPRTContract,
];

const sushiGraphUrl =
  "https://api.thegraph.com/subgraphs/name/sushiswap/exchange";

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

  try {
    for (let index = 0; index < pStakeContractArray.length; index++) {
      let contractTotalSupply = await sdk.api.erc20.totalSupply({
        target: pStakeContractArray[index],
        block: block,
      });
      balances[pStakeContractArray[index]] = balances[
        pStakeContractArray[index]
      ]
        ? BigNumber(balances[pStakeContractArray[index]])
            .plus(BigNumber(contractTotalSupply.output))
            .toFixed(0)
        : BigNumber(contractTotalSupply.output).toFixed(0);
    }
  } catch (error) {
    console.log("Error while eth Calculation: ", error);
  }

  // console.log("balances: ", balances);
  return balances;
}

async function pool2(timestamp, block) {
  const balances = {};

  try {
    for (let index = 0; index < stkContractArray.length; index++) {
      const { pairs } = await request(sushiGraphUrl, sushiGraphQuery, {
        stkContract: stkContractArray[index],
        block: block,
      });
      let reserve0BN = BigNumber(pairs[0].reserve0);
      let decimals = Number(pairs[0].token0.decimals);
      reserve0BN = reserve0BN.shiftedBy(decimals);
      balances[stkContractArray[index]] = balances[stkContractArray[index]]
        ? BigNumber(balances[stkContractArray[index]])
            .plus(reserve0BN)
            .toFixed(0)
        : reserve0BN.toFixed(0);
    }
  } catch (error) {
    console.log("Error while Pool2 Calculation: ", error);
  }

  // console.log("balances: ", balances);

  return balances;
}

module.exports = {
  methodology: `We get the totalSupply of the constituent token contracts (like stkATOM, pATOM, stkXPRT, pXPRT etc.) and then we multiply it with the USD market value of the constituent token`,
  ethereum: {
    tvl: eth,
  },
  pool2: {
    tvl: pool2,
  },
  tvl: sdk.util.sumChainTvls([eth]),
};
