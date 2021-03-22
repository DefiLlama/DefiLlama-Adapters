/*==================================================
  Modules
==================================================*/

  const sdk = require('@defillama/sdk');
  const BigNumber = require('bignumber.js');
  const _ = require('underscore');
  const abi = require('./abi');
  const utils = require('../helper/utils')
  const Web3 = require('web3');
  const env = require('dotenv').config()
  const web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${env.parsed.INFURA_KEY}`));

/*==================================================
  Main
==================================================*/

  async function tvl (timestamp, block) {
    const balances = {};

    const pairs = (await utils.fetchURL(
      `https://api.kyber.network/currencies`
    )).data.data;

    const balanceOfCalls = [];
    const tokenWalletCalls = [];
    const reserves = new Set();
    pairs.forEach(pair=>{
      const pairReserves = new Set(pair.reserves_src?.concat(pair.reserves_dest))
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

    return balances;
  }

/*==================================================
  Exports
==================================================*/

  module.exports = {
    name: 'Kyber',
    token: 'KNC',
    category: 'DEXes',
    start: 1546515458,  // Jan-03-2019 11:37:38 AM +UTC
    tvl,
  };
