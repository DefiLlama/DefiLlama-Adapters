const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const contracts = require("./contracts.json");
const { staking } = require("../helper/staking");

async function vaultTvl(balances, block, abi, target, coin) {
  const ftmStaked = ((await sdk.api.abi.call({
    chain: 'fantom',
    block,
    target,
    abi,
  })).output);

  sdk.util.sumSingleBalance(balances, coin, ftmStaked);
}
async function tvl(timestamp, block, chainBlocks) {
  const balances = {};

  await vaultTvl(
    balances, 
    chainBlocks.fantom, 
    abi.see_s1ftm_circ, 
    contracts.ftmVault, 
    contracts.FTM
    );
  await vaultTvl(
    balances, 
    chainBlocks.fantom, 
    abi.see_s1ftm_circ, 
    contracts.ethVault, 
    contracts.WETH
    );
  await vaultTvl(
    balances, 
    chainBlocks.fantom, 
    abi.see_s1tomb_circ, 
    contracts.avaxVault, 
    contracts.AVAX
    );
  await vaultTvl(
    balances, 
    chainBlocks.fantom, 
    abi.see_s1tomb_circ, 
    contracts.tombVault, 
    contracts.TOMB
    );

  const daiBalances = (await sdk.api.abi.multiCall({
    chain: 'fantom',
    block: chainBlocks.fantom,
    calls: [
        contracts.ftmVault, 
        contracts.ethVault, 
        contracts.avaxVault, 
        contracts.tombVault
      ].map((v) => ({
        target: contracts.Collateral,
        params: [v],
    })),
    abi: 'erc20:balanceOf'
  })).output
  .map(b => b.output)
  .reduce((acc, el) => Number(acc) + Number(el), 0);

  sdk.util.sumSingleBalance(balances, contracts.DAI, daiBalances);

  return balances;
}

module.exports = {
  fantom: {
    tvl,
    // hitting pool2 staking contract twice while stake1 isnt on coingecko
    pool2: staking(
      [contracts.pool2, contracts.pool2], 
      [contracts.daiPool2, contracts.ftmPool2], 
      'fantom'
      )
  }
}; // node test.js projects/stake1/index.js
