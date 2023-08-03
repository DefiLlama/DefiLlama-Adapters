const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = "uint256:getTVLInUsd";
const axios = require("axios");
const usdc = ADDRESSES.ethereum.USDC;
const prxy = "0xab3d689c22a2bb821f50a4ff0f21a7980dcb8591";
const prxyTransformed = `polygon:${prxy}`;
const wbtc = ADDRESSES.ethereum.WBTC;
const btcpx = "0x9C32185b81766a051E08dE671207b34466DD1021";
const farmProxy = "0x256116a8Ea8bAd13897462117d88082C464B68e1";

async function getPrograms() {
  const programList = await axios.get("https://api.btcpx.io/api/v1/prxy-staking/list/0/10", {
        headers: {
          "x-signature":
            "f104e31bbc788b25c12ad65f4063bea9c9a731004212002f3f7c773f9d72f7a1",
          origin: "https://app.prxy.fi",
        },
      })
  return programList.data.txs;
}

function tvl(chain) {
return async (timestamp, _, {[chain]: block}) => {
  let balances = {};  

  const programs = await getPrograms();
  for (const program of programs) {
    if (program.chain.toLowerCase() == chain) {
      const staked = (
        await sdk.api.abi.call({
          target: program.stakingContractAddress,
          abi,
          block,
          chain,
        })
      ).output;
      sdk.util.sumSingleBalance(balances, usdc, staked);
    }
  }

  balances[wbtc] = (
    await sdk.api.erc20.totalSupply({
      block,
      target: btcpx,
      chain,
    })
  ).output;

  
delete balances[prxyTransformed];
return balances;
  
};
}


async function prxyStaking(timestamp, ethBlock, chainBlocks){
  let balances = {}

    
  balances[prxyTransformed] = (
  await sdk.api.erc20.balanceOf({
    target: prxy,
    owner: "0x015CEe3aB6d03267B1B2c05D2Ac9e2250AF5268d",
    block: chainBlocks.polygon,
    chain: "polygon",
  })
  ).output;

  return {[prxyTransformed]: prxyTransformed in balances ? balances[prxyTransformed] : 0};
  }

async function farmPrxyStaking(timestamp, ethBlock, chainBlocks){

  let farmStaking = (
    await sdk.api.abi.call({
    target: farmProxy,
    abi,
    chain: "polygon"
  })).output;

return {[ADDRESSES.ethereum.USDC]: farmStaking} 
}


module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: tvl("polygon"),
    staking: sdk.util.sumChainTvls([ farmPrxyStaking, prxyStaking]),
  },
  ethereum: {
    tvl: tvl("ethereum"),
  },
  methodology: `BTC Proxy offers a unique institutional-grade wrapped Bitcoin solution that leverages Polygon technology to bring Bitcoin to DeFi 2.0 with no gas and no slippage and insured custody. BTC Proxy features (3,3) Staking and Bonding via the PRXY Governance token`,
};
