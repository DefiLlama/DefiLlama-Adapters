const sdk = require("@defillama/sdk");
const tokenMasterABI = require('./abis/TokenMaster.json')
const {unwrapUniswapLPs, unwrapCrv} = require('../helper/unwrapLPs')
const vaultABI = require('./abis/Vault.json')

// const config = require('./config.json')

const tokenMaster = '0xfF4446E9dF1c8281CE1d42610c3bC0342f93E4d7'
const aldsETH = '0xB17d98c36d2238Ffcb27bF797cA9967B3Cc9Aa07'
const aldcrvRenWBTC = '0x4EE014060F4816ad294857d29C22fe62B0e9580B'
const ald3CRV = '0x5C8dC3a18761e4F22F7B8D41228970477168d9e2'
const aldSLPETHWBTC = '0x1C7ed66abE1BA029c8EFceecfBfc4056B8C4bbfc'
const unilpALDETH = '0xED6c2F053AF48Cba6cBC0958124671376f01A903'
const unilpALDUSDC = '0xaAa2bB0212Ec7190dC7142cD730173b0A788eC31'
const crvRenWBTC = '0x49849C98ae39Fff122806C06791Fa73784FB3675'
const SETH = '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c'
const threeCRV = '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490'
const slpETHWBTC = '0xceff51756c56ceffca006cd410b03ffc46dd3a58'

const pools = [aldcrvRenWBTC, aldsETH, ald3CRV, aldSLPETHWBTC, unilpALDETH, unilpALDUSDC]
const aldVaults = [aldcrvRenWBTC, aldsETH, ald3CRV, aldSLPETHWBTC]
const aldVaultUnderlyingTokens = [crvRenWBTC, SETH, threeCRV, slpETHWBTC];

async function tvl(timestamp, block) {
  let balances = {}
  const lockedTokens = await sdk.api.abi.multiCall({
    abi: 'erc20:balanceOf',
    calls: pools.map(p => ({
      target: p,
      params: tokenMaster
    })),
    block
  });

  // whether it's in vaults or in staking, it belongs to aladdin's tvl
  const aldUnderlyingTokenBalances = (await sdk.api.abi.multiCall({
    abi: vaultABI['balance'],
    calls: aldVaults.map(p => ({
      target: p,
      params: [],
    })),
    block
  })).output.map(x => x.output);

  const lpPositions = [];
  const crvBalances = [];

  lockedTokens.output.forEach((call, index) => {
    const token = pools[index];
    const balance= call.output;
    if (index === 4 || index === 5) {
      lpPositions.push({balance, token})
    } else if (index === 0 || index == 1 || index == 2 ) {
      crvBalances.push(aldUnderlyingTokenBalances[index])
    } else if (index === 3) {
      lpPositions.push({balance: aldUnderlyingTokenBalances[index], token: aldVaultUnderlyingTokens[index]})
    }
  })
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
  );

  await unwrapCrv(balances, aldVaultUnderlyingTokens[0], crvBalances[0]);
  await unwrapCrv(balances, aldVaultUnderlyingTokens[1], crvBalances[1]);
  await unwrapCrv(balances, aldVaultUnderlyingTokens[2], crvBalances[2]);

  return balances
}


module.exports = {
  ethereum:{
    tvl,
  },
  tvl
}
