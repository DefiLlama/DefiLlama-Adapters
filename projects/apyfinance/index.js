const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BigNumber = require('bignumber.js')

const liquidityContracts = [
  // DAI Liquidity
  "0x75CE0E501e2E6776FcAAa514f394a88a772A8970",
  // USDC Liquidity
  "0xe18b0365D5D09F394f84eE56ed29DD2d8D6Fba5f",
  // USDT Liquidity
  "0xeA9c5a2717D5Ab75afaAC340151e73a7e37d99A7",
];

const ethTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const underlyers = (
    await sdk.api.abi.multiCall({
      abi: abi.underlyer,
      calls: liquidityContracts.map((lc) => ({
        target: lc,
      })),
      block: ethBlock,
    })
  ).output.map((underlyer) => underlyer.output);

  const balance = (
    await sdk.api.abi.multiCall({
      abi: abi.getPoolTotalValue,
      calls: underlyers.map((nd, idx) => ({
        target: liquidityContracts[idx],
      })),
      block: ethBlock,
    })
  ).output.map((bal) => bal.output);

  for (let index = 0; index < underlyers.length; index++) {
    sdk.util.sumSingleBalance(balances, `${underlyers[1]}`, BigNumber(balance[index]).div(10**2).toFixed(0));
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  methodology: `The TVL for APY.Finance can be found in three contract addresses. Each address corresponds to the type of token that can be deposited, DAI, USDC, and USDT. After having the balance for each address, they are simply added together to get the total TVL.`
};
