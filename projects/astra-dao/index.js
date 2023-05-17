const sdk = require('@defillama/sdk');
const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const positionManagerABI = require('./nftABI.json')
const Web3 = require('web3');
const web3 = new Web3('https://nodes.mewapi.io/rpc/eth');
const ethers = require('ethers');
const { graphql, buildSchema } = require('graphql');
const dotenv = require('dotenv');
dotenv.config();
const { ApolloClient, InMemoryCache, gql } = require('@apollo/client');
const ASTRA_TOKEN_CONTRACT = '0x7E9c15C43f0D6C4a12E6bdfF7c7D55D0f80e3E23';
const ASTRA_STAKING_CONTRACT = '0xDFE672C671943411fc16197fb8E328662B57CE2C';
const positionManagerAddress = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';




async function tvl(_, _1, _2, { api }) {
  const balances = {};

  //Use Moralis to fetch all holdings in Index contract : 0x17b9B197E422820b3e28629a2BB101949EE7D12B
  await Moralis.start({
    apiKey: "7VCvlfy60vUVgYNCYPQHPNG3K0IKQjBVEht94e1WwTVZoWrPiLCnUKDJNwI9ea8Q",//Add a Moralis_API_KEY here to fetch data
    // ...and any other configuration
  });

  let address = "0x17b9B197E422820b3e28629a2BB101949EE7D12B"; // Index contract address

  const APIURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3'; //Subgraph Uniswap

  const tokensQuery = `
    query($positionId: String) {
      position(id: $positionId) {
        depositedToken0
        depositedToken1
        token0 {
          id
        }
        token1 {
          id
        }
        id
      }
    }
  `

  const client = new ApolloClient({
    uri: APIURL,
    cache: new InMemoryCache(),
  })
  

  const chain = EvmChain.ETHEREUM;

  const response = await Moralis.EvmApi.token.getWalletTokenBalances({
    address,
    chain,
  });
   const result = response.toJSON();

  //Add index holdings to TVL
  for(let i = 0; i <result.length; i++ ) {
    const tokenBalance = result[i];
    //console.log(tokenBalance);
    await sdk.util.sumSingleBalance(balances, tokenBalance.token_address, tokenBalance.balance, api.chain)
  }

  //Fetch total Astra staked in Astra Staking contract: 0xDFE672C671943411fc16197fb8E328662B57CE2C
  const astraStaked = await api.call({
    abi: 'function poolInfo(uint256) returns(address, uint256, uint256, uint256, uint256, uint256)',
    target: ASTRA_STAKING_CONTRACT,
    params: [0],
  });

  //Add Astra Staked ito TVL
  await sdk.util.sumSingleBalance(balances, ASTRA_TOKEN_CONTRACT, astraStaked[4], api.chain)


  //Fetch ASTRA LM pairs staked on platform
  const nft = new web3.eth.Contract(positionManagerABI,positionManagerAddress);
  let balance = await nft.methods.balanceOf(ASTRA_STAKING_CONTRACT).call();

  //Calaculate WETH balance of LM pairs
  let balanceWETH = 0;
  for(let i=0; i< parseInt(balance); i++){
      let positionId = await nft.methods.tokenOfOwnerByIndex(ASTRA_STAKING_CONTRACT,i).call();
      //console.log("Position id ", positionId);
      
      
      const data = await client.query({
          query: gql(tokensQuery),
          variables: {
            positionId: positionId ,
          },
        })

      balanceWETH = balanceWETH +  Number(data.data.position.depositedToken1);
  }

  await sdk.util.sumSingleBalance(balances, WETH, balanceWETH * (10**18), api.chain)


  return balances;
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'counts the total TVL in ASTRA DAO',
  start: 17243078,
  ethereum: {
    tvl,
  }
}; 