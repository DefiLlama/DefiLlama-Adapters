const sdk = require('@defillama/sdk');
const ethers = require('ethers')
const axios = require("axios");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const cmUmamiABI = require("./cmUmami.abi.json");
const { default: BigNumber } = require('bignumber.js');
const { sumTokens2 } = require('../helper/unwrapLPs')

async function getPools() {

  // make graph request to get pools
  const url = "https://api.thegraph.com/subgraphs/name/0xtaiga/vendor-finance";
  const request = await axios.post(url,
    {
      query: `
      {
        pools (first: 300) {
          id,
          _colToken,
          _lendToken
        }
      }
      `
    }
  );
  // extract pools
  return(request.data.data.pools);

}

async function tvl(timestamp, block, chainBlocks) {

  const transform = await transformArbitrumAddress();
  const chain = "arbitrum";

  // collateral and lend tokens
  const tokens = {
    USDC: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    MIM: "0xFEa7a6a0B346362BF88A9e4A88416B77a57D6c2A",
    FRAX: "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    WBTC: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
    DPX: "0x6c2c06790b3e3e3c38e12ee22f8183b37a13ee55",
    CRV: "0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978",
    UMAMI: "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3",
    SPELL: "0x3E6648C5a70A150A88bCE65F4aD4d506Fe15d2AF",
    CMUMAMI: "0x1922C36F3bc762Ca300b4a46bB2102F84B1684aB"
  }

  block = chainBlocks.arbitrum;
  const balances = {};
  const pools = await getPools();
  const tokensAndOwners = []

  for (const pool of pools) {

    // get collateral and lend token
    const colToken = ethers.utils.getAddress(pool._colToken);
    const lendToken = ethers.utils.getAddress(pool._lendToken);
    const poolAddress = pool.id;
    tokensAndOwners.push([lendToken, poolAddress])
    tokensAndOwners.push([colToken, poolAddress])
  }

  await sumTokens2({ tokensAndOwners, chain, block, balances, });
  const cUMAMI = 'arbitrum:0x1922c36f3bc762ca300b4a46bb2102f84b1684ab'
  if (balances[cUMAMI]) {
    // get cmUmami price per share for later
    const { output: pps} = await sdk.api.abi.call({
      abi: cmUmamiABI,
      target: tokens.CMUMAMI,
      params: [1000000000],
      chain, block
    })
    const umamiBal = balances[cUMAMI] * pps / 1e9
    delete balances[cUMAMI]
    sdk.util.sumSingleBalance(balances, transform(tokens.UMAMI), BigNumber(umamiBal).toFixed(0))
  }

  return balances
}

module.exports = {
  methodology: 'The sum of the balance of all listed collateral and lend tokens in all deployed pools.',
  start: 20274088,
  arbitrum: {
    tvl 
  }
}; 