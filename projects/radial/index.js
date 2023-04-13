const {
    standardPoolInfoAbi,
    getPoolInfo,
    getSymbolsAndBalances,
    isLP,
    isYV,
  } = require("../helper/masterchef");
  const sdk = require("@defillama/sdk");
  const { default: BigNumber } = require("bignumber.js");
  const { handleYearnTokens } = require("../creditum/helper.js");
  const { transformFantomAddress } = require("../helper/portedTokens");
  const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
  
  const tokenAbi = 'address:token'
  const token0Abi = 'address:token0'
  const token1Abi = 'address:token1'
  const getReservesAbi = 'function getReserves() view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)'
  const shareValue = "uint256:getShareValue";
  const xSCREAM = "0xe3D17C7e840ec140a7A51ACA351a482231760824";
  const xCREDIT = "0xd9e28749e80D867d5d14217416BFf0e668C10645";
  const shareTarot = 'function shareValuedAsUnderlying(uint256 _share) returns (uint256 underlyingAmount_)';
  const xTAROT = "0x74D1D2A851e339B8cB953716445Be7E8aBdf92F4";
  const fBEET = "0xfcef8a994209d6916EB2C86cDD2AFD60Aa6F54b1";
  const masterChef = "0x6f536B36d02F362CfF4278190f922582d59E7e08";
  const chain = "fantom";
  const tokenIsOnCoingecko = true;
  const includeYVTokens = true;
  const stakingToken = "0xf04d7f53933becbf51ddf1f637fe7ecaf3d4ff94";
  
  async function tvl(timestamp, ethBlock, {[chain]: block}) {
    const transform = await transformFantomAddress();
  
    const poolInfo = await getPoolInfo(
      masterChef,
      block,
      chain,
      standardPoolInfoAbi
    );
    const [symbols, tokenBalances] = await getSymbolsAndBalances(
      masterChef,
      block,
      chain,
      poolInfo
    );
  
    const balances = {};
  
    const lpPositions = [];
  
    await Promise.all(
      symbols.output.map(async (symbol, idx) => {
        const balance = tokenBalances.output[idx].output;
        const token = symbol.input.target.toLowerCase();
        if (token === stakingToken) {
          return;
        } else if (isLP(symbol.output, token, chain)) {
          lpPositions.push({
            balance,
            token,
          });
        } else if (includeYVTokens && isYV(symbol.output)) {
          let underlyingToken = (
            await sdk.api.abi.call({
              target: token,
              abi: tokenAbi,
              block,
              chain,
            })
          ).output;
          sdk.util.sumSingleBalance(
            balances,
            transform(underlyingToken),
            balance
          );
        } else {
          sdk.util.sumSingleBalance(balances, transform(token), balance);
        }
      })
    );
  
    const [token0, token1] = await Promise.all([
      sdk.api.abi.multiCall({
        calls: lpPositions.map((p) => ({
          target: p.token,
        })),
        abi: token0Abi,
        block,
        chain,
      }),
      sdk.api.abi.multiCall({
        calls: lpPositions.map((p) => ({
          target: p.token,
        })),
        abi: token1Abi,
        block,
        chain,
      }),
    ]);
  
    const pool2LpPositions = [];
    const outsideLpPositions = [];
    lpPositions.forEach((position, idx) => {
      if (
        token0.output[idx].output.toLowerCase() === stakingToken ||
        token1.output[idx].output.toLowerCase() === stakingToken
      ) {
        pool2LpPositions.push(position);
      } else {
        outsideLpPositions.push(position);
      }
    });
    await unwrapUniswapLPs(balances, outsideLpPositions, block, chain, transform);
  
    if (!tokenIsOnCoingecko) {
      const maxPool2ByToken = (
        await sdk.api.abi.multiCall({
          calls: pool2LpPositions.map((p) => ({
            target: stakingToken,
            params: [p.token],
          })),
          abi: "erc20:balanceOf",
          block,
          chain,
        })
      ).output.reduce((max, curr) => {
        if (BigNumber(curr.output).gt(max.output)) {
          return curr;
        }
        return max;
      });
      const poolAddress = maxPool2ByToken.input.params[0].toLowerCase();
      const poolReserves = await sdk.api.abi.call({
        block,
        chain,
        abi: getReservesAbi,
        target: poolAddress,
      });
      const posToken0 = token0.output.find(
        (t) => t.input.target.toLowerCase() === poolAddress
      ).output;
      const posToken1 = token1.output.find(
        (t) => t.input.target.toLowerCase() === poolAddress
      ).output;
      let price, otherToken;
      if (posToken0.toLowerCase() === stakingToken) {
        price = poolReserves.output[1] / poolReserves.output[0];
        otherToken = transform(posToken1);
      } else {
        price = poolReserves.output[0] / poolReserves.output[1];
        otherToken = transform(posToken0);
      }
      const transformedStakingToken = transform(stakingToken);
      Object.values(balances).forEach((balance) => {
        Object.entries(balance).forEach(([addr, bal]) => {
          if (addr.toLowerCase() === transformedStakingToken) {
            balance[otherToken] = BigNumber(bal).times(price).toFixed(0);
            delete balance[addr];
          }
        });
      });
    }
    const calldata = {
      chain,
      block,
    };
  
    await handleYearnTokens(
      balances,
      [
        "0x637ec617c86d24e421328e6caea1d92114892439",
        "0xef0210eb96c7eb36af8ed1c20306462764935607",
        "0x0dec85e74a92c52b7f708c4b10207d9560cefaf0",
        "0x0A0b23D9786963DE69CB2447dC125c49929419d8",
        "0xCe2Fc0bDc18BD6a4d9A725791A3DEe33F3a23BB7",
        "0x2C850cceD00ce2b14AA9D658b7Cad5dF659493Db",
        "0xd817A100AB8A29fE3DBd925c2EB489D67F758DA9",
      ],
      "0x6f536B36d02F362CfF4278190f922582d59E7e08",
      block,
      chain,
      transform
    );
  
    const screamShare = await sdk.api.abi.call({
      ...calldata,
      target: xSCREAM,
      abi: shareValue,
    });
  
    sdk.util.sumSingleBalance(
      balances,
      transform("0xe0654C8e6fd4D733349ac7E09f6f23DA256bF475"),
      BigNumber(screamShare.output)
        .times(balances['fantom:0xe3d17c7e840ec140a7a51aca351a482231760824'])
        .div(1e18)
        .toFixed(0)
    );
    delete balances[transform(xSCREAM)];
    // node test.js projects/radial/index.js
    const creditShare = await sdk.api.abi.call({
      ...calldata,
      target: xCREDIT,
      abi: shareValue,
    });
    sdk.util.sumSingleBalance(
      balances,
      transform("0x77128dfdd0ac859b33f44050c6fa272f34872b5e"),
      BigNumber(creditShare.output)
        .times(balances['fantom:0xd9e28749e80d867d5d14217416bff0e668c10645'])
        .div(1e18)
        .toFixed(0)
    );
    delete balances[transform(xCREDIT)];
  
    const tarotShare = await sdk.api.abi.call({
      ...calldata,
      target: xTAROT,
      abi: shareTarot,
      params: balances['fantom:0x74d1d2a851e339b8cb953716445be7e8abdf92f4'],
    });
    sdk.util.sumSingleBalance(
      balances,
      transform("0xc5e2b037d30a390e62180970b3aa4e91868764cd"),
      tarotShare.output
    );
    delete balances[transform(xTAROT)];
  
    sdk.util.sumSingleBalance(
      balances,
      transform("0xf24bcf4d1e507740041c9cfd2dddb29585adce1e"),
      balances['fantom:0xfcef8a994209d6916eb2c86cdd2afd60aa6f54b1']
    );
    delete balances[transform(fBEET)];
    return balances;
  }
  
  module.exports = {
    fantom: {
      tvl,
    },
  };
  
  // node test.js projects/radial/index.js
  