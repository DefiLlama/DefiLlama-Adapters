
const sdk = require('@defillama/sdk');
const abi = require('./abi.json');
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
// node test.js projects/axial/index.js
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

async function getAxialJLPBalance(_timestamp, _ethereumBlock, chainBlocks) {
  const balances = {}
  const block = chainBlocks['avax'];
  const axialBalance = (await sdk.api.abi.call({
    target: AXIAL_JLP_TOKEN,
    params: [AXIAL_MASTERCHEF_V3],
    block,
    chain: 'avax',
    abi: 'erc20:balanceOf'
  })).output;
  await unwrapUniswapLPs(balances, [{token: AXIAL_JLP_TOKEN, balance: axialBalance}], block, 'avax', (addr) => `avax:${addr}`);
  return balances;
}

async function getAxialPools() {
  let vaults = [];
  const poolLength = (await sdk.api.abi.call({
    target: AXIAL_MASTERCHEF_V3,
    abi: abi.poolLength,
    chain: 'avax'
  })).output;
  await sdk.api.abi.multiCall({
    calls: [...Array(Number(poolLength)).keys()].map(num => ({
      target: AXIAL_MASTERCHEF_V3,
      params: num
    })),
    chain: 'avax',
    abi: abi.poolInfo
  }).then(async pools => {
    await sdk.api.abi.multiCall({
      calls: pools.output.map(pool => ({
        target: pool.output.lpToken
      })),
      chain: 'avax',
      abi: abi.owner
    }).then(owners => {
      vaults = owners.output.filter(e => e.output).map(e => e.output);
    });
  });
  return vaults;
}

async function tvl(_timestamp, _ethereumBlock, chainBlocks) {
  const balances = {};
  const block = chainBlocks['avax'];
  const vaults = await getAxialPools();

  await getAxialVaultBalances(balances, vaults, block);
  return balances;
}


module.exports = {
  methodology: "Our TVL is the value of the tokens within the Axial pools, and the Axial LP tokens within our rewards pools MasterChef",
  avalanche: {
    tvl,
    pool2: getAxialJLPBalance
  }
}
