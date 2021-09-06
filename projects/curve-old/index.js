
  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  _.flatMap = _.compose(_.flatten, _.map);

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    if(block > 11218787){
      throw new Error("This only works for old blocks")
    }
    let balances = {};

    let swaps = [
      '0xe5FdBab9Ad428bBB469Dee4CB6608C0a8895CbA5',
      '0x2e60CF74d81ac34eB21eEff58Db4D385920ef419',
      '0xA2B47E3D5c44877cca798226B7B8118F9BFb7A56',
      '0x52EA46506B9CC5Ef470C5bf89f17Dc28bB35D85C',
      '0x45F783CCE6B7FF23B2ab2D70e416cdb7D6055f51',
      '0x79a8C46DeA5aDa233ABaFFD40F3A0A2B1e5A4F27',
      '0xeDf54bC005bc2Df0Cc6A675596e843D28b16A966',
      '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
      '0x06364f10B501e868329afBc005b3492902d6C763',
      '0x93054188d876f558f4a66B2EF1d97d16eDf0895B',
      '0x7fC77b5c7614E1533320Ea6DDc2Eb61fa00A9714',
      '0x4CA9b3063Ec5866A4B82E437059D2C43d1be596F',
      '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
      '0x4f062658EaAF2C1ccf8C8e36D6824CDf41167956',
      '0x3eF6A01A0f81D6046290f3e2A8c5b843e738E604',
      '0x8474DdbE98F5aA3179B3B3F5942D724aFcdec9f6',
      '0xC18cC39da8b11dA8c3541C598eE022258F9744da',
      '0xC25099792E9349C7DD09759744ea681C7de2cb66',
      '0x3E01dD8a5E1fb3481F0F589056b428Fc308AF0Fb',
      '0x0f9cb53Ebe405d49A0bbdBD291A65Ff571bC83e1',
      '0x8038C01A0390a8c547446a0b2c18fc9aEFEcc10c'
    ]

    let coins = [2, 2, 2, 3, 4, 4, 2, 4, 4, 2, 3, 2, 3, 2, 2, 2, 2, 2, 2, 2, 2]

    let balancesCalls = _.flatMap(swaps, (token, i) => {
      return Array.from(Array(coins[i]), (e, idx) =>({target: token, params: idx}))
    })
    balancesCalls = balancesCalls.filter(call => !(call.target == '0xeDf54bC005bc2Df0Cc6A675596e843D28b16A966' && call.params == 1))

    let balancesResults = await sdk.api.abi.multiCall({
      block,
      calls: balancesCalls.slice(0, balancesCalls.length-21),
      abi: {
        "name": "balances",
        "outputs": [
         {
          "type": "uint256",
          "name": "out"
         }
        ],
        "inputs": [
         {
          "type": "int128",
          "name": "arg0"
         }
        ],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 2250
      },
    })

    let balancesResults2 = await sdk.api.abi.multiCall({
      block,
      calls: balancesCalls.slice(-21),
      abi: {
        "name": "balances",
        "outputs": [
         {
          "type": "uint256",
          "name": "out"
         }
        ],
        "inputs": [
         {
          "type": "uint256",
          "name": "arg0"
         }
        ],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 2250
      },
    })

    let coinsCalls = _.flatMap(swaps, (token, i) => {
      return Array.from(Array(coins[i]), (e, idx) =>({target: token, params: idx}))
    })
    coinsCalls = coinsCalls.filter(call => !(call.target == '0xeDf54bC005bc2Df0Cc6A675596e843D28b16A966' && call.params == 1))

    let coinsResults = await sdk.api.abi.multiCall({
      block,
      calls: coinsCalls.slice(0, coinsCalls.length-21),
      abi:  {
        "name": "coins",
        "outputs": [
         {
          "type": "address",
          "name": "out"
         }
        ],
        "inputs": [
         {
          "type": "int128",
          "name": "arg0"
         }
        ],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 2190
      },
    })

    let coinsResults2 = await sdk.api.abi.multiCall({
      block,
      calls: coinsCalls.slice(-21),
      abi:  {
        "name": "coins",
        "outputs": [
         {
          "type": "address",
          "name": "out"
         }
        ],
        "inputs": [
         {
          "type": "uint256",
          "name": "arg0"
         }
        ],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 2190
      },
    })

    for(let [i, balance] of balancesResults.output.entries()) {
      if(!balance || !balance.output) continue;
      // Balance doesn't exist yet
      const out = coinsResults.output[i].output;
      if(!balances[out]) balances[out] = "0";
      // Update balance
      sdk.util.sumSingleBalance(balances, out, balance.output)
      //balances[out] = String(parseFloat(balances[out]) + parseFloat(balance.output));
    }

    for(let [i, balance] of balancesResults2.output.entries()) {
      if(!balance || !balance.output) continue;
      // Balance doesn't exist yet
      const out = coinsResults2.output[i].output;
      if(!balances[out]) balances[out] = "0";
      // Update balance
      sdk.util.sumSingleBalance(balances, out, balance.output)
      //balances[out] = String(parseFloat(balances[out]) + parseFloat(balance.output));
    }

    delete balances['0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490'];
    delete balances['0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3'];

    const yTokens = [
      { symbol: 'ySUSD', underlying: 'SUSD', contract: '0x57ab1ec28d129707052df4df418d58a2d46d5f51' },
      { symbol: 'yUSDC', underlying: 'USDC', contract: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
      { symbol: 'ycDAI', underlying: 'cDAI' },
      { symbol: 'yUSDT', underlying: 'USDT', contract: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
      { symbol: 'ycUSDC', underlying: 'cUSDC' },
      { symbol: 'ycUSDT', underlying: 'cUSDT' },
      { symbol: 'yBUSD', underlying: 'BUSD', contract: '0x4fabb145d64652a948d72533023f6e7a623c7c53' },
      { symbol: 'yDAI', underlying: 'DAI', contract: '0x6b175474e89094c44da98b954eedeac495271d0f' },
      { symbol: 'yTUSD', underlying: 'TUSD', contract: '0x0000000000085d4780b73119b644ae5ecd22b376' },
    ]

  //balances["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"] = balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"]
  //delete balances["0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"]

  return balances
}

module.exports = {
  start: 1581138000, // 03/01/2020 @ 5:54pm UTC
  ethereum:{
    tvl
  },
  tvl,
};
