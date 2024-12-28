/*==================================================
  Modules
  ==================================================*/

  const sdk = require('@defillama/sdk');


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

    let balancesCalls = swaps.map((swap, i) => {
      return Array.from(Array(swap.coinNums), (e, idx) =>({target: swap.address, params: idx}))
    }).flat()

    const swapsA_coinSum = swapsA.reduce((memo, num) => memo + num.coinNums, 0);
    const swapsB_coinSum = swapsB.reduce((memo, num) => memo + num.coinNums, 0);

    let balancesResultsA = await sdk.api.abi.multiCall({
      block,
      calls: balancesCalls.slice(0, swapsA_coinSum),
      abi: 'function balances(int128 arg0) view returns (uint256 out)',
    })

    let balancesResultsB = await sdk.api.abi.multiCall({
      block,
      calls: balancesCalls.slice(-swapsB_coinSum),
      abi: 'function balances(uint256 arg0) view returns (uint256 out)',
    })

    let balancesResults = [...balancesResultsA.output, ...balancesResultsB.output]

    let coinsCalls = swaps.map((swap, i) => {
      return Array.from(Array(swap.coinNums), (e, idx) =>({target: swap.address, params: idx}))
    }).flat()

    let coinsResultsA = await sdk.api.abi.multiCall({
      block,
      calls: coinsCalls.slice(0, swapsA_coinSum),
      abi: 'function underlying_coins(int128 arg0) view returns (address out)'
    })

    let coinsResultsB = await sdk.api.abi.multiCall({
      block,
      calls: coinsCalls.slice(-swapsB_coinSum),
      abi: 'function coins(uint256 arg0) view returns (address out)'
    })

    let coinsResults = [...coinsResultsA.output, ...coinsResultsB.output]

    for(let [i, balance] of balancesResults.entries()) {
      if(!balance || !balance.output) continue;
      // coin address
      const out = coinsResults[i].output;
      sdk.util.sumSingleBalance(balances, out, balance.output)
    }

    return balances;
  }

/*==================================================
  Exports
  ==================================================*/

  module.exports = {
    // #1 susdv2 pool started
    // start: '2020-09-22', // 09/22/2020 @ 03:00:00pm +UTC
    // #2 dfi pool started
    // start: '2020-10-10', // 10/10/2020 @ 04:00:00pm +UTC
    start: '2020-10-11', // 10/11/2020 @ 00:00:00am +UTC
    ethereum: {
      tvl
    }
  }
