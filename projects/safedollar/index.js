const sdk = require('@defillama/sdk');
const farmUtils = require('./farm-utils');
const BigNumber = require('bignumber.js');
const url = "https://api.safedollar.fi/api/public/getAllCollateral";
const utils = require('../helper/utils');;
/**
 * calculate collateral locked in safedollar 
 */
const Contracts = {
  SafeAssets: [{
    collateralAddress: "0x736Fb0CbB5F55941ecF6A811be4926c2cFa4dD4b",
    address: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"
  }],

  boardRoom: "0x46C6a9b8E3243FB0dfB069119D5Fc6a75EEc8604",
  sds: "0xAB72EE159Ff70b64beEcBbB0FbBE58b372391C54"
}
const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  // --- Sections of boardroom ---
  const stakeboardroom$ = sdk
    .api.abi.call({
      target: Contracts.sds,
      abi: 'erc20:balanceOf',
      chain: 'polygon',
      block: chainBlocks['polygon'],
      params: [Contracts.boardRoom],
    }).then(x => x.output)

  const [farmTvl, sdsStaked] = await Promise.all([

    farmUtils.polygonFarmLocked(chainBlocks['polygon']),
    stakeboardroom$
  ])
  const balances = {
    [`polygon:${Contracts.sds}`]: sdsStaked,
  };
  // --- Sections of Safe Assets ---
  let SafeAssets = (await utils.fetchURL(url)).data.data;
  const promises$ = SafeAssets.map((item) => {
    return sdk
      .api.abi.call({
        target: item.address,
        abi: 'erc20:balanceOf',
        chain: 'polygon',
        block: chainBlocks['polygon'],
        params: [item.collateralAddress],
      }).then(x => {
        balances[`polygon:${item.address}`] = new BigNumber(balances[`polygon:${item.address}`] || 0)
          .plus(x.output || 0)
          .toFixed(0);
      })
  });
  const collateralBalance = await Promise.all(promises$)
  for (const [token, balance] of Object.entries(farmTvl)) {
    sdk.util.sumSingleBalance(balances, token, balance)
  }
  return balances
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
  tvl: polygonTvl
};