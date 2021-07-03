const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');
  const _ = require('underscore');
  const abi = require('./abi');
  const utils = require('../helper/utils')
  const web3 = require('../config/web3.js');
  const {getBlock} = require('../helper/getBlock')
const {request, gql } = require('graphql-request')


  const usdtAddress = '0xdac17f958d2ee523a2206206994597c13d831ec7'
  const egraphUrl = 'https://api.thegraph.com/subgraphs/name/dynamic-amm/dynamic-amm'
const egraphQuery = gql`
query get_tvl($block: Int) {
  dmmFactory(
    id: "0x833e4083b7ae46cea85695c4f7ed25cdad8886de",
    block: { number: $block }
  ) {
    totalVolumeUSD
    totalLiquidityUSD
  }
}
`;

  async function ethTvl (timestamp, block) {
    const balances = {};

    const pairs = (await utils.fetchURL(
      `https://api.kyber.network/currencies`
    )).data.data;

    const balanceOfCalls = [];
    const tokenWalletCalls = [];
    const reserves = new Set();
    pairs.forEach(pair=>{
      if(pair.reserves_src){
        const pairReserves = new Set(pair.reserves_src.concat(pair.reserves_dest))
        pairReserves.forEach(reserveAddress=>{
          reserves.add(reserveAddress)
          tokenWalletCalls.push({
            target: reserveAddress,
            params: [pair.address]
          })
          balanceOfCalls.push({
            target: pair.address,
            params: [reserveAddress]
          })
        })
      }
    })
    const tokenWallets = (await sdk.api.abi.multiCall({
      block,
      calls: tokenWalletCalls,
      abi: abi.getTokenWallet,
    })).output;
    const repeatedTokenWallets = {}
    await Promise.all(tokenWallets.map(async result=>{
      if(result.success && !reserves.has(result.output)){
        const token = result.input.params[0];
        const tokenWallet = result.output

        if(repeatedTokenWallets[token+tokenWallet] !== undefined){
          return;
        }
        repeatedTokenWallets[token+tokenWallet]=true;
        if((await web3.eth.getCode(tokenWallet)) === '0x'){ // Ignore if EOA
          return
        }

        balanceOfCalls.push({
          target: result.input.params[0],
          params: [result.output]
        })
      }
    }))

    const ethBalances = sdk.api.eth.getBalances({
      targets: Array.from(reserves),
      block
    })
    const balanceOfResult = await sdk.api.abi.multiCall({
      block,
      calls: balanceOfCalls,
      abi: 'erc20:balanceOf',
    });
    const ethBalance = BigNumber.sum(...(await ethBalances).output.map(result=>result.balance))
    balances['0x0000000000000000000000000000000000000000'] = ethBalance.toFixed()

    /* combine token volumes on multiple markets */
    _.forEach(balanceOfResult.output, (result) => {
      let balance = new BigNumber(result.output || 0);
      if (balance <= 0) return;

      let asset = result.input.target;
      let total = balances[asset];

      if (total) {
        balances[asset] = balance.plus(total).toFixed();
      } else {
        balances[asset] = balance.toFixed();
      }
    });
    const {dmmFactory} = await request(
      egraphUrl,
      egraphQuery,
      {
        block,
      }
      
    );
    if(dmmFactory !== null){ // Has been created
      const ethTVL = (Number(dmmFactory.totalLiquidityUSD)* 1e6).toFixed(0)
      sdk.util.sumSingleBalance(balances, usdtAddress, ethTVL)
    }

    return balances;
  }

  //fetch polygon chain DMM TVL 

  async function polygonTvl(timestamp, block, chainBlocks){
    block = await getBlock(timestamp, 'polygon', chainBlocks)
    var polygonEndpoint ='https://api.thegraph.com/subgraphs/name/piavgh/dmm-exchange-matic';
      var query = gql`
      query get_tvl($block: Int) {
        dmmFactory(
          id: "0x5F1fe642060B5B9658C15721Ea22E982643c095c",
          block: {number: $block}
        ) {
          totalVolumeUSD
          totalLiquidityUSD
        }
      }
      `;
      const {results} = await request(
        polygonEndpoint,
        query,
        {
          block,
        }
        
      );
    console.log(results)
    return {
      [usdtAddress]: BigNumber(results.dmmFactories[0].totalLiquidityUSD)
      .multipliedBy(10 ** 6)
      .toFixed(0),
    }

  }
/*==================================================
  Exports
==================================================*/

  module.exports = {

    ethereum: {
      tvl: ethTvl,
    },
    polygon: {
      tvl: polygonTvl
    },
    tvl:sdk.util.sumChainTvls([ethTvl,polygonTvl])
  };
