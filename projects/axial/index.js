
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const AS4D = "0x2a716c4933A20Cd8B9f9D9C39Ae7196A85c24228";
const AC4D = "0x8c3c1C6F971C01481150CA7942bD2bbB9Bc27bC7";
const AXIAL_JLP_TOKEN = "0x5305A6c4DA88391F4A9045bF2ED57F4BF0cF4f62";
const AXIAL_MASTERCHEF_V3 = "0x958C0d0baA8F220846d3966742D4Fb5edc5493D3";

async function getAxialVaultBalances(balances, vaults, block) {
  await Promise.all(vaults.map(async (vault) => {
    await sdk.api.abi.multiCall({
      calls: [0, 1, 2, 3].map(num => ({
        target: vault,
        params: [num]
      })),
      abi: abi.getToken,
      block,
      chain: 'avax'
    }).then(async tokens => {
      await sdk.api.abi.multiCall({
        calls: tokens.output.filter(t => t.output != null).map(token => ({
          target: token.output,
          params: [vault]
        })),
        abi: 'erc20:balanceOf',
        block,
        chain: 'avax'
      }).then(tokenBalances => {
        const balancesToAdd = {};
        sdk.util.sumMultiBalanceOf(balancesToAdd, tokenBalances);
        Object.entries(balancesToAdd).forEach(balance => {
          sdk.util.sumSingleBalance(balances, `avax:${balance[0]}`, balance[1]);
        });
      });
    });
  }));
}

async function getAxialJLPBalance(balances, block) {
  const axialBalance = (await sdk.api.abi.call({
    target: AXIAL_JLP_TOKEN,
    params: [AXIAL_MASTERCHEF_V3],
    block,
    chain: 'avax',
    abi: 'erc20:balanceOf'
  })).output;
  await unwrapUniswapLPs(balances, [{token: AXIAL_JLP_TOKEN, balance: axialBalance}], block, 'avax', (addr) => `avax:${addr}`);
}

async function tvl(_timestamp, _ethereumBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks['avax'];
  const vaults = [AS4D, AC4D];
  await getAxialVaultBalances(balances, vaults, block);
  await getAxialJLPBalance(balances, block);
  return balances;
}

module.exports = {
  avalanche: {
      tvl,
  }
}