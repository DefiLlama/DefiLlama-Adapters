/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  _.flatMap = _.compose(_.flatten, _.map);

/*==================================================
  Settings
  ==================================================*/

  // balances: int128 -> uint256 ; underlying_coins: uint128 -> address
  const swapsA = [
    // dfi (DAI/USDC/USDT)
    { address: '0xD2aDa263C156E5a5096Ee7387a4BE9C00F1b20FB',
      coinNums: 3,
    },
    // dForce (DAI/USDC/USDT/USDx)
    { address: '0xD0d3AB41c5f29eDa2eac3d2D65B26bfd77369225',
      coinNums: 4
    }
  ]

  // balances: uint256 -> uint256 ; coins: uint256 -> address
  const swapsB = [
    // 5pool (DAI/USDC/USDT/TUSD/PAX)
    { address: '0x3ba734D5E4E78801Ab22CF55C5760e121E1C2C42',
      coinNums: 5
    },
    // qian (QUSD/USD5)
    { address: '0x6E7a0bf2EeC3A4b2B4a7bbBD372238bF68f1174c',
      coinNums: 2
    },
    // gate (USDG/USD5)
    { address: '0xF3B8CC654eA571df3682E2B4800fE22886Ae4976',
      coinNums: 2
    },
    // binance (BUSD/USD5)
    { address: '0xb759B7a071942425301Cf398d7f892B5ae9eC5Af',
      coinNums: 2
    },
    // basis (BAC/DAI)
    { address: '0xd626C03cAE9696E702828c0Ed4DEed5c33D30DD7',
      coinNums: 2
    }
  ]

/*==================================================
  TVL
  ==================================================*/

  async function tvl(timestamp, block) {
    let balances = {};

    let swaps = [...swapsA, ...swapsB]

    let balancesCalls = _.flatMap(swaps, (swap, i) => {
      return Array.from(Array(swap.coinNums), (e, idx) =>({target: swap.address, params: idx}))
    })

    const swapsA_coinSum = _.reduce(swapsA, (memo, num) => memo + num.coinNums, 0);
    const swapsB_coinSum = _.reduce(swapsB, (memo, num) => memo + num.coinNums, 0);

    let balancesResultsA = await sdk.api.abi.multiCall({
      block,
      calls: balancesCalls.slice(0, swapsA_coinSum),
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

    let balancesResultsB = await sdk.api.abi.multiCall({
      block,
      calls: balancesCalls.slice(-swapsB_coinSum),
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

    let balancesResults = [...balancesResultsA.output, ...balancesResultsB.output]

    let coinsCalls = _.flatMap(swaps, (swap, i) => {
      return Array.from(Array(swap.coinNums), (e, idx) =>({target: swap.address, params: idx}))
    })

    let coinsResultsA = await sdk.api.abi.multiCall({
      block,
      calls: coinsCalls.slice(0, swapsA_coinSum),
      abi: {
        "name": "underlying_coins",
        "outputs": [{
          "type": "address",
          "name": "out"
        }],
        "inputs": [{
          "type": "int128",
          "name": "arg0"
        }],
        "constant": true,
        "payable": false,
        "type": "function",
        "gas": 2190
      }
    })

    let coinsResultsB = await sdk.api.abi.multiCall({
      block,
      calls: coinsCalls.slice(-swapsB_coinSum),
      abi: {
        "name": "coins",
        "outputs": [{
          "type": "address",
          "name": ""
        }],
        "inputs": [{
          "type": "uint256",
          "name": "arg0"
        }],
        "stateMutability": "view",
        "type": "function",
        "gas": 2250
      }
    })

    let coinsResults = [...coinsResultsA.output, ...coinsResultsB.output]

    for(let [i, balance] of balancesResults.entries()) {
      if(!balance || !balance.output) continue;
      // coin address
      const out = coinsResults[i].output;
      // init
      if(balances[out] == null) balances[out] = 0;
      // update
      balances[out] = String(parseFloat(balances[out]) + parseFloat(balance.output));
    }

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    // #1 susdv2 pool started
    // start: 1600758000, // 09/22/2020 @ 03:00:00pm +UTC
    // #2 dfi pool started
    // start: 1602345600, // 10/10/2020 @ 04:00:00pm +UTC
    start: 1602374400, // 10/11/2020 @ 00:00:00am +UTC
    tvl
  }
