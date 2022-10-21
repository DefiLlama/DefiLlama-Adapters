const sdk = require('@defillama/sdk');
const ethers = require('ethers')
const axios = require("axios");
const { transformArbitrumAddress } = require("../helper/portedTokens");
const cmUmamiABI = require("./cmUmami.abi.json");
const { default: BigNumber } = require('bignumber.js');

async function getPools() {

  // make graph request to get pools
  const url = "https://api.thegraph.com/subgraphs/name/0xtaiga/vendor-finance";
  const request = await axios.post(url,
    {
      query: `
      {
        pools {
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

  // create list of calls to make
  let calls = [];
  for (const pool of pools) {

    // get collateral and lend token
    const colToken = ethers.utils.getAddress(pool._colToken);
    const lendToken = ethers.utils.getAddress(pool._lendToken);
    const poolAddress = pool.id;

    // add collateral and lend token balanceOf calls to list
    calls.push({
      target: colToken,
      params: [poolAddress]
    });
    calls.push({
      target: lendToken,
      params: [poolAddress]
    });

  }

  // execute calls
  const { output } = await sdk.api.abi.multiCall({
    calls, 
    block, 
    chain,
    abi: 'erc20:balanceOf',
  });

  // get cmUmami price per share for later
  const pps = (await sdk.api.abi.call({
    abi: cmUmamiABI,
    target: tokens.CMUMAMI,
    params: [1000000000],
    chain,
    block
  })).output;

  let umamiPerCmUmami = new BigNumber("0");

  output.forEach(({ input: { target  }, output }) => {

    // use UMAMI PPS (price per share) to get the number of UMAMI tokens per CMUMAMI tokens
    if (target === tokens.CMUMAMI) { 
      let newOutput = new BigNumber(output).multipliedBy(pps).div(Math.pow(10, 9));
      umamiPerCmUmami = umamiPerCmUmami.plus(newOutput);
    }

    sdk.util.sumSingleBalance(balances, transform(target), output)

  })

  // add UMAMI tokens per CMUMAMI to final UMAMI balance
  const extraUmami = new BigNumber(balances[transform(tokens.UMAMI)]).plus(umamiPerCmUmami);
  balances[transform(tokens.UMAMI)] = extraUmami.toString();

  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'The sum of the balance of all listed collateral and lend tokens in all deployed pools.',
  start: 20274088,
  arbitrum: {
    tvl 
  }
}; 