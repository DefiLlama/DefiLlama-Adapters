  const sdk = require('@defillama/sdk');
  const _ = require('underscore');
  const BigNumber = require("bignumber.js");
  const abi = require('../helper/abis/aave.json');
const { addBalanceOfTokensAndLPs } = require('../helper/unwrapLPs');
const {getV2Reserves, getV2Tvl, aaveChainTvl} = require('../helper/aave')

  const aaveLendingPoolCore = "0x3dfd23A6c5E8BbcFc9581d2E864a68feb6a076d3";
  const aaveLendingPool = "0x398eC7346DcD622eDc5ae82352F02bE94C62d119";
  let aaveReserves = []

  const uniswapLendingPoolCore = "0x1012cfF81A1582ddD0616517eFB97D02c5c17E25";
  const uniswapLendingPool = "0x2F60C3EB259D63dcCa81fDE7Eaa216D9983D7C60";
  let uniswapReserves = []

  const aaveStakingContract = "0x4da27a545c0c5b758a6ba100e3a049001de870f5";
  const aaveBalancerContractImp = "0xC697051d1C6296C24aE3bceF39acA743861D9A81";
  const aaveTokenAddress = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9";
  const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const eth = "0x0000000000000000000000000000000000000000"

  const addressesProviderRegistryETH = "0x52D306e36E3B6B02c153d0266ff0f85d18BCD413";

  async function _stakingTvl(block) {
    return (
      await sdk.api.abi.call({
        target: aaveTokenAddress,
        params: aaveStakingContract,
        abi: "erc20:balanceOf",
        block
      })
    ).output;
  }

  async function _stakingBalancerTvl(block) {
    const aaveBal = (
      await sdk.api.abi.call({
        target: aaveTokenAddress,
        params: aaveBalancerContractImp,
        abi: "erc20:balanceOf",
        block,
      })
    ).output;

    const wethBal = (
      await sdk.api.abi.call({
        target: wethTokenAddress,
        params: aaveBalancerContractImp,
        abi: "erc20:balanceOf",
        block,
      })
    ).output;

    return {
      [aaveTokenAddress]: aaveBal,
      [wethTokenAddress]: wethBal,
    };
  }

  async function _getV1Assets(lendingPoolCore, block) {
    const reserves = (
      await sdk.api.abi.call({
        target: lendingPoolCore,
        abi: abi["getReserves"],
        block
      })
    ).output;

    const decimalsOfReserve = (
      await sdk.api.abi.multiCall({
      calls: _.map(reserves, (reserve) => ({
        target: reserve
      })),
      abi: "erc20:decimals"
    })
    ).output;

    const symbolsOfReserve = (
      await sdk.api.abi.multiCall({
      calls: _.map(reserves, reserve => ({
        target: reserve
      })),
      abi: "erc20:symbol"
    })
    ).output;

    let assets = []

    reserves.map((reserve, i) => {
      if (reserve === '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') return;

      let symbol;
      switch(reserve) {
        case "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2": // MKR doesn't include symbol in contract 🤷‍♂️
          symbol = { output: 'MKR' }; break
        default:
          symbol = symbolsOfReserve[i]
      }

      const decimals = decimalsOfReserve[i]
      if (decimals.success) {
        assets.push({ address: reserve, symbol: symbol.output, decimals: decimals.output })
      }else {
        throw new Error("Call failed")
      }
    })

    return assets
  }

  async function _multiMarketV1Tvl(lendingPoolCore, reserves, block) {
    let balances = {
      "0x0000000000000000000000000000000000000000": (
        await sdk.api.eth.getBalance({ target: lendingPoolCore, block })
      ).output,
    };

    const balanceOfResults = await sdk.api.abi.multiCall({
      block,
      calls: _.map(reserves, (reserve) => ({
        target: reserve.address,
        params: lendingPoolCore,
      })),
      abi: "erc20:balanceOf",
    });

    sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true);

    return balances;
  }

  async function getV1Reserves(block) {
    if (aaveReserves.length === 0) {
      aaveReserves = await _getV1Assets(aaveLendingPoolCore, block);
    }

    if (uniswapReserves.length === 0) {
      // Does not take into account Uniswap LP assets (not yet supported on DeFiPulse)
      uniswapReserves = await _getV1Assets(uniswapLendingPoolCore, block);
    }
  }



  async function ammMarket(balances, block){
    const lendingPool = "0x7937D4799803FbBe595ed57278Bc4cA21f3bFfCB"
    const reservesList = (await sdk.api.abi.call({
      target: lendingPool,
      abi: abi.getReservesList,
      block
    })).output
    const reservesData = await sdk.api.abi.multiCall({
      abi: abi.getAMMReserveData,
      calls: reservesList.map(r=>({
        target: lendingPool,
        params: r
      })),
      block
    })
    const [balanceOfTokens, balancerTokens] = await Promise.all([
      sdk.api.abi.multiCall({
        abi: "erc20:balanceOf",
        calls: reservesData.output.map((r, idx)=>({
          target: reservesList[idx],
          params: r.output.aTokenAddress
        })),
        block
      }),
      sdk.api.abi.multiCall({
        abi: abi.getCurrentTokens,
        calls: reservesData.output.map((r, idx)=>({
          target: reservesList[idx],
        })),
        block
      }),
    ])
    const balanceOfTokensWithoutBalancerPairs = (await Promise.all(balanceOfTokens.output.map(async (balanceOf, idx)=>{
      if(!balancerTokens.output[idx].success){
        return balanceOf
      }
      const [amountsOnPair, totalSupply] = await Promise.all([
        sdk.api.abi.multiCall({
          abi: "erc20:balanceOf",
          calls: balancerTokens.output[idx].output.map((r)=>({
            target: r,
            params: balanceOf.input.target
          })),
          block
        }),
        sdk.api.erc20.totalSupply({
          target: balanceOf.input.target,
          block
        })
      ]);
      balancerTokens.output[idx].output.forEach((token, ydx)=>{
        const tokenBalance = BigNumber(amountsOnPair.output[ydx].output).times(balanceOf.output).div(totalSupply.output)
        sdk.util.sumSingleBalance(balances, token, tokenBalance.toFixed(0))
      })

      return null
    }))).filter(b=>b!==null)
    await addBalanceOfTokensAndLPs(balances, {
      output: balanceOfTokensWithoutBalancerPairs
    }, block)
  }

  async function ethereum(timestamp, block) {
    // V1 TVLs
    await getV1Reserves(block)
    let balances = await _multiMarketV1Tvl(aaveLendingPoolCore, aaveReserves, block);

    const uniswapMarketTvlBalances = await _multiMarketV1Tvl(
      uniswapLendingPoolCore,
      uniswapReserves,
      block
    );

    const uniswapv1Calls = Object.keys(uniswapMarketTvlBalances).map(t=>({target:t}));
    const [uniswapV1Tokens, uniswapV1EthBalance, uniswapV1Supplies] = await Promise.all([
      sdk.api.abi.multiCall({
        abi: {"name": "tokenAddress", "outputs": [{"type": "address", "name": "out"}], "inputs": [], "constant": true, "payable": false, "type": "function", "gas": 1413},
        calls:uniswapv1Calls,
        block
      }),
      sdk.api.eth.getBalances({
        targets: Object.keys(uniswapMarketTvlBalances),
        block
      }),
      sdk.api.abi.multiCall({
        abi: 'erc20:totalSupply',
        calls:uniswapv1Calls,
        block
      }),
    ])

    const uniswapV1TokenBalance = await sdk.api.abi.multiCall({
      abi: 'erc20:balanceOf',
      calls: uniswapV1Tokens.output.map(t=>({
        target: t.output,
        params: t.input.target
      })),
      block
    })

    // ...add v1 uniswap market TVL
    Object.keys(uniswapMarketTvlBalances).forEach((address, idx) => {
      const balance = uniswapMarketTvlBalances[address];
      if(uniswapV1Tokens.output[idx].success === false){
        sdk.util.sumSingleBalance(balances, address, balance)
      } else {
        const tokenBalance = BigNumber(uniswapV1TokenBalance.output[idx].output).times(balance).div(uniswapV1Supplies.output[idx].output)
        const ethBalance = BigNumber(uniswapV1EthBalance.output[idx].balance).times(balance).div(uniswapV1Supplies.output[idx].output)
        const token = uniswapV1Tokens.output[idx].output
        sdk.util.sumSingleBalance(balances, token, tokenBalance.toFixed(0))
        sdk.util.sumSingleBalance(balances, eth, ethBalance.toFixed(0))
      }
    });

    // V2 TVLs
    if (block >= 11360925) {
      let v2Atokens = [];
      let v2ReserveTokens = [];
      let addressSymbolMapping = {};
      [v2Atokens, v2ReserveTokens, addressSymbolMapping] = await getV2Reserves(block, addressesProviderRegistryETH, 'ethereum', v2Atokens, v2ReserveTokens, addressSymbolMapping)
      const v2Tvl = await getV2Tvl(block, 'ethereum', v2Atokens, v2ReserveTokens, addressSymbolMapping);
      v2Tvl.map(data => {
        if (balances[data.underlying]) {
          balances[data.underlying] = BigNumber(balances[data.underlying])
            .plus(data.balance)
            .toFixed();
        } else {
          balances[data.underlying] = data.balance;
        }
      })
    }

    if(block >= 11998773){
      await ammMarket(balances, block)
    }

    return balances;
  }

  const polygon = aaveChainTvl("polygon", "0x3ac4e9aa29940770aeC38fe853a4bbabb2dA9C19");

  const avax = aaveChainTvl("avax", "0x4235E22d9C3f28DCDA82b58276cb6370B01265C2")

  async function staking(timestamp, block){
    const balances = {}
        // Staking TVLs
        if (block >= 10926829) {
          const stakedAaveAmount = await _stakingTvl(block);
          balances[aaveTokenAddress] = balances[aaveTokenAddress]
            ? BigNumber(balances[aaveTokenAddress]).plus(stakedAaveAmount).toFixed()
            : BigNumber(stakedAaveAmount).toFixed()
    
          const stakedBalancerAmounts = await _stakingBalancerTvl(block);
          Object.keys(stakedBalancerAmounts).forEach((address) => {
            balances[address] = balances[address]
              ? BigNumber(balances[address])
                  .plus(stakedBalancerAmounts[address])
                  .toFixed()
              : BigNumber(stakedBalancerAmounts[address]).toFixed();
          });
        }
    return balances;
  }

  module.exports = {
    timetravel: true,
    methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
    ethereum:{
      staking,
      tvl: ethereum
    },
    avalanche:{
      tvl: avax
    },
    polygon:{
      tvl: polygon
    },
    staking:{
      tvl: staking
    },
    tvl: sdk.util.sumChainTvls([ethereum, polygon, avax])
  };
