const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');
  const _ = require('underscore');
  const abi = require('./abi');
  const utils = require('../helper/utils')
  const web3 = require('../config/web3.js');
  const bsc_factory = "0x878dFE971d44e9122048308301F540910Bbd934c";
  const poly_factory = "0x5F1fe642060B5B9658C15721Ea22E982643c095c";
  const eth_factory = "0x833e4083B7ae46CeA85695c4f7ed25CDAd8886dE";

  async function ethTvl (timestamp, block) {
    const balances = {};
  // tracking TVL for Kybernetwork
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
  // tracking TVL for KyberDMM ethereum
      const poolLength = Number(
        (
          await sdk.api.abi.call({
            target: eth_factory,
            abi: abi.allPoolsLength,
            block: block,
          })
        ).output
      );
    
      const allPoolNums = Array.from(Array(poolLength).keys());
    
      const poolAddresses = (
        await sdk.api.abi.multiCall({
          abi: abi.allPools,
          calls: allPoolNums.map((num) => ({
            target: eth_factory,
            params: [num],
          })),
          block: block,
        })
      ).output.map((el) => el.output);
    
      for (let i = 0; i < poolAddresses.length; i++) {
        const token0 = (
          await sdk.api.abi.call({
            target: poolAddresses[i],
            abi: abi.token0,
            block: block,
          })
        ).output;
    
        const token1 = (
          await sdk.api.abi.call({
            target: poolAddresses[i],
            abi: abi.token1,
            block: block,
          })
        ).output;
    
        const getReserves = (
          await sdk.api.abi.call({
            target: poolAddresses[i],
            abi: abi.getReserves,
            block: block,
          })
        ).output;
    
        sdk.util.sumSingleBalance(balances, token0, getReserves[0]);
    
        sdk.util.sumSingleBalance(balances, token1, getReserves[1]);
      }
    
    
    return balances;
  }
  // tracking TVL for KyberDMM polygon
  const polyTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
  
    const poolLength = Number(
      (
        await sdk.api.abi.call({
          target: poly_factory,
          abi: abi.allPoolsLength,
          chain: "polygon",
          block: chainBlocks["polygon"],
        })
      ).output
    );
  
    const allPoolNums = Array.from(Array(poolLength).keys());
  
    const poolAddresses = (
      await sdk.api.abi.multiCall({
        abi: abi.allPools,
        calls: allPoolNums.map((num) => ({
          target: poly_factory,
          params: [num],
        })),
        block: chainBlocks["polygon"],
        chain: "polygon"
      })
    ).output.map((el) => el.output);
  
    for (let i = 0; i < poolAddresses.length; i++) {
      const token0 = (
        await sdk.api.abi.call({
          target: poolAddresses[i],
          abi: abi.token0,
          chain: "polygon",
          block: chainBlocks["polygon"],
        })
      ).output;
  
      const token1 = (
        await sdk.api.abi.call({
          target: poolAddresses[i],
          abi: abi.token1,
          chain: "polygon",
          block: chainBlocks["polygon"],
        })
      ).output;
  
      const getReserves = (
        await sdk.api.abi.call({
          target: poolAddresses[i],
          abi: abi.getReserves,
          chain: "polygon",
          block: chainBlocks["polygon"],
        })
      ).output;
  
      sdk.util.sumSingleBalance(balances, 'polygon:'+token0, getReserves[0]);
  
      sdk.util.sumSingleBalance(balances, 'polygon:'+token1, getReserves[1]);
    }
  
    return balances;
  };
    // tracking TVL for KyberDMM BSC
  function getBSCAddress(address) {
    return `bsc:${address}`
  }
  const KNC = "0xfe56d5892BDffC7BF58f2E84BE1b2C32D21C308b";
  const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};
   
    const poolLength = Number(
      (
        await sdk.api.abi.call({
          target: bsc_factory,
          abi: abi.allPoolsLength,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output
    );
  
    const allPoolNums = Array.from(Array(poolLength).keys());
  
    const poolAddresses = (
      await sdk.api.abi.multiCall({
        abi: abi.allPools,
        calls: allPoolNums.map((num) => ({
          target: bsc_factory,
          params: [num],
        })),
        block: chainBlocks["bsc"],
        chain: "bsc"
      })
    ).output.map((el) => el.output);
  
    for (let i = 0; i < poolAddresses.length; i++) {
      const token0 = (
        await sdk.api.abi.call({
          target: poolAddresses[i],
          abi: abi.token0,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;
  
      const token1 = (
        await sdk.api.abi.call({
          target: poolAddresses[i],
          abi: abi.token1,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;
      const getReserves = (
        await sdk.api.abi.call({
          target: poolAddresses[i],
          abi: abi.getReserves,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;
  
      sdk.util.sumSingleBalance(balances, getBSCAddress(token0), getReserves[0]);
  
      sdk.util.sumSingleBalance(balances, getBSCAddress(token1), getReserves[1]);
    }
  
    return balances;
  };
  
/*==================================================
  Exports
==================================================*/

  module.exports = {
    misrepresentedTokens: true,
    ethereum: {
      tvl: ethTvl,
    },
    polygon: {
      tvl: polyTvl,
   },
    bsc: {
      tvl: bscTvl,
   },
  tvl: sdk.util.sumChainTvls([ethTvl, bscTvl, polyTvl])
  };
