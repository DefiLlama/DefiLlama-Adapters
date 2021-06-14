const sdk = require('@defillama/sdk');
const abiPolygon = require('./abi-polygon.json');
const abiBsc = require('./abi-bsc.json');
const farmUtils = require('./farm-utils');
const BigNumber = require('bignumber.js');

const Contracts = {
  bsc: {
    iron: {
      treasury: '0x59a584C62a2410aFe389278f23aB86846B20751f',
      pool: '0xFE6F0534079507De1Ed5632E3a2D4aFC2423ead2',
      vaultProxy: '0x7F978A140c92D4f6b42D725D2D09750C7a428452',
    },

    synth: {
      treasury: '0x62504d3cDBFe3d1A4C941E0179587B8d156dc7B5',
      collaterals: [
        '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
        '0x3EE2200Efb3400fAbB9AacF31297cBdD1d435D47',
        '0x7083609fCE4d1d8Dc0C979AAb8c869Ea2C873402',
      ],
    },
  },

  polygon: {
    treasury: '0x376b9e0Abbde0cA068DeFCD8919CA73369124825',
    collateral: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174'
  },
};

/**
 * calculate collateral locked in iron pool and vault
 */
const bscIronTvl = async (block) => {
  const info = (
    await sdk.api.abi.call({
      target: Contracts.bsc.iron.pool,
      abi: abiBsc.poolBusd.info,
      chain: 'bsc',
      block,
    })
  ).output;

  const collateralToken = (
    await sdk.api.abi.call({
      target: Contracts.bsc.iron.pool,
      abi: abiBsc.poolBusd.getCollateralToken,
      chain: 'bsc',
      block,
    })
  ).output;

  const vaultBalance = (
    await sdk.api.abi.call({
      target: Contracts.bsc.iron.vaultProxy,
      abi: abiBsc.vaultProxy.vaultBalance,
      chain: 'bsc',
      block,
    })
  ).output;

  return {
    [`bsc:${collateralToken}`]: new BigNumber(info[1])
      .plus(vaultBalance)
      .toFixed(0),
  };
};

const bscSynthTvl = async (block) => {
  const balances = {};

  const collateralBalance = await sdk.api.abi.multiCall({
    abi: abiBsc.dTokenTreasury.globalCollateralValue,
    calls: Contracts.bsc.synth.collaterals.map((token) => ({
      target: Contracts.bsc.synth.treasury,
      params: [token],
    })),
    block: block,
    chain: 'bsc',
  });

  collateralBalance.output.forEach((call, idx) => {
    const underlyingToken = 'bsc:' + Contracts.bsc.synth.collaterals[idx];
    const underlyingTokenBalance = call.output;
    sdk.util.sumSingleBalance(
      balances,
      underlyingToken,
      underlyingTokenBalance,
    );
  });

  return balances;
};

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const [ironTvl, synthTvl, farmTvl] = await Promise.all([
    bscIronTvl(chainBlocks['bsc']),
    bscSynthTvl(chainBlocks['bsc']),
    farmUtils.bscFarmLocked(chainBlocks['bsc'])
  ]);

  for (const [token, balance] of Object.entries(synthTvl)) {
    sdk.util.sumSingleBalance(ironTvl, token, balance);
  }

  for (const [token, balance] of Object.entries(farmTvl)) {
    sdk.util.sumSingleBalance(ironTvl, token, balance);
  }

  return ironTvl;
};

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const collateralBalance$ = sdk.api.abi.call({
    target: Contracts.polygon.treasury,
    abi: abiPolygon.treasury.globalCollateralBalance,
    chain: 'polygon',
    block: chainBlocks['polygon'],
  }).then(x => x.output)
  
  const [collateralBalance, farmTvl] = await Promise.all([
    collateralBalance$,
    farmUtils.polygonFarmLocked(chainBlocks['polygon'])
  ])

  const balances = {
    [`polygon:${Contracts.polygon.collateral}`]: collateralBalance,
  };

  for (const [token, balance] of Object.entries(farmTvl)) {
    sdk.util.sumSingleBalance(balances, token, balance)
  }

  return balances
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  polygon: {
    tvl: polygonTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl, polygonTvl]),
};
