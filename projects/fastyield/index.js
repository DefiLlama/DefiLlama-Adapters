const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { stakings, staking } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformFantomAddress } = require("../helper/portedTokens");
// node test.js projects/fastyield/index.js
const NATIVE_CONTRACT = "0xe5AFC91CEA5df74748A2b07e1d48E4e01aacF52B";

const fantomTvl = async (timestamp, block, chainBlocks) => {
  const balances = {};

  const poolLenth = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: NATIVE_CONTRACT,
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  const lpPositions = [];

  for (let index = 2; index < poolLenth; index++) {
    const poolInfo = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: NATIVE_CONTRACT,
        params: index,
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    const wantBalance = (
      await sdk.api.abi.call({
        abi: abi.wantLockedTotal,
        target: poolInfo[4],
        chain: "fantom",
        block: chainBlocks["fantom"],
      })
    ).output;

    try {
      const symbol = (
        await sdk.api.abi.call({
          abi: abi.symbol,
          target: poolInfo[0],
          chain: "fantom",
          block: chainBlocks["fantom"],
        })
      ).output;

      if (symbol == "fWINGS-LP" || symbol == "spLP" || symbol == "SPIRIT-LP" || symbol == "dKnight-LP") {
        lpPositions.push({
          token: poolInfo[0],
          balance: wantBalance,
        });
      } else {
        sdk.util.sumSingleBalance(balances, `fantom:${poolInfo[0]}`, wantBalance);
      }
    } catch (err) {
      console.error(err);
    }
  }

  const transformAddress = await transformFantomAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["fantom"],
    "fantom",
    transformAddress
  );

  return balances;
};

async function pool2(timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformFantomAddress();

  const lpBalance = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: '0xe836997c9f3665986580fe98f79999fa876fc271',
      params: '0xc0c84eFeB8290BA5Ac6bed682Cfdf2896cf26566',
      chain: "fantom",
      block: chainBlocks["fantom"],
    })
  ).output;

  await unwrapUniswapLPs(
    balances,
    [{balance: lpBalance, token: '0xe836997c9f3665986580fe98f79999fa876fc271' }],
    chainBlocks["fantom"],
    "fantom",
    transform
  );

  balances['0x4e15361fd6b4bb609fa63c81a2be19d873717870'] *= 2;
  delete balances['fantom:0x0299461ee055bbb6de11fafe5a0636a0c3bd5e8d'];
  return balances;
};
module.exports = {
  fantom: {
    tvl: fantomTvl,
    staking: stakings(['0x1Fb33cB822bD554890242F4765505FA6340B1Fb9'], '0x0299461ee055bbb6de11fafe5a0636a0c3bd5e8d', 'fantom'),
    pool2
  },
};
