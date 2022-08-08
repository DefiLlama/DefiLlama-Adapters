const sdk = require('@defillama/sdk');
const { getChainTransform } = require("../helper/portedTokens");
const { default: BigNumber } = require("bignumber.js");

const transformKey = 'bsc:0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab';

const chainToAddresses = {
  bsc: {
    SKILL_TOKEN_CONTRACT: '0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab',
    SKILL_STAKING_OLD: '0x895BF27C99822Ef5ba88A3E6764F6247e13f0dfA',
    SKILL_STAKING_CONTRACT_30: '0xd6b2D8f59Bf30cfE7009fB4fC00a7b13Ca836A2c',
    SKILL_STAKING_CONTRACT_90: '0xc42dF5397B3C0B45DeDaCB83F7aDb1F30B73097d',
    SKILL_STAKING_CONTRACT_180: '0x3C06533B42A802f3Ac0E770CCBBeA9fa7Cae9572',
    GAME_CONTRACT: '0x39Bea96e13453Ed52A734B6ACEeD4c41F57B2271',
    TREASURY_CONTRACT: '0x812Fa2f7d89e5d837450702bd51120920dccaA99'
  },
  heco: {
    SKILL_TOKEN_CONTRACT: '0x27d4DfDB3fDf58e198bA4dbc23B2F82c0b8e3405',
    SKILL_STAKING_OLD: '0x9810A3f2D59772f04846acA2Ba0F01caE6f43B9c',
    SKILL_STAKING_CONTRACT_30: '0x6109A500e5b9CE40FFe075Ea3A6beA6e93c23BcF',
    GAME_CONTRACT: '0x29869EDb088466a49f75654d8F04edd16Bf60e75',
    TREASURY_CONTRACT: '0x7843Bd2aDdE5E54bD6e61C28fA89009240a48C08'
  },
  okexchain: {
    SKILL_TOKEN_CONTRACT: '0xcC137b0713E0DC63b1fA136272014F2A54Dd7aCB',
    SKILL_STAKING_OLD: '0xC5707a6a16CCe1963Ec3E6cdEE0A91e4876Be395',
    SKILL_STAKING_CONTRACT_30: '0x105A0Aa801080A89465bA1f8b6696971FD5F3a6D',
    GAME_CONTRACT: '0x98145a2fEBac238280bbdEDc2757dC162318b16e',
    TREASURY_CONTRACT: '0xcBEfF02841370997054AdfF624dC490C8cB20406'
  },
  polygon: {
    SKILL_TOKEN_CONTRACT: '0x863D6074aFaF02D9D41A5f8Ea83278DF7089aA86',
    SKILL_STAKING_OLD: '0xE34e7cA8e64884E3b5Cd48991ba229d8302E85da',
    SKILL_STAKING_CONTRACT_30: '0x96a5448BB59aD9Cccc3a4112c2c57a420768b499',
    GAME_CONTRACT: '0x070b1A95898B927A900A1F9F42b114154648E51A',
    TREASURY_CONTRACT: '0x216AC39765D920D7f86162Daf9BE1f045f321A8D'
  },
  avax: {
    SKILL_TOKEN_CONTRACT: '0x483416eB3aFA601B9C6385f63CeC0C82B6aBf1fb',
    SKILL_STAKING_OLD: '0x96438Debb1419bF0B53119Edae6e664c931504CA',
    SKILL_STAKING_CONTRACT_30: '0xE8f14F0a5a5f059ae060664e0f165B7e5A52e4e5',
    GAME_CONTRACT: '0x46419526a59ec1d73b72620ae16da091bE8486bd',
    TREASURY_CONTRACT: '0x5B1cCb62D2F9c8523abBa89A56432005cef03b99'
  },
  aurora: {
    SKILL_TOKEN_CONTRACT: '0xE723111a6Ac865EB6E2d62e87432bdC6e2c4a86E',
    SKILL_STAKING_OLD: '0x5F6E97612482095C0c2C02BC495C0171e61017d7',
    SKILL_STAKING_CONTRACT_30: '0x07f8aA038CD6a3B5FDC6ed58F608Eb33d98b299e',
    GAME_CONTRACT: '0x3F715995647fe44Db45411bb9e81b7A1aD5A8387',
    TREASURY_CONTRACT: '0x483416eB3aFA601B9C6385f63CeC0C82B6aBf1fb'
  },
  kava: {
    SKILL_TOKEN_CONTRACT: '0xC28a73FCb6248Cb1718A50a9EC9cBC361dee3ea1',
    SKILL_STAKING_OLD: '0xA0D3F71E7CbCac550bb3f71C27f91a436A02dEC5',
    SKILL_STAKING_CONTRACT_30: '0xCb850EEd27fF37B591c88967b5E7bC63De121FBd',
    GAME_CONTRACT: '0x912252d3f7DaD807d122F7DBAd3D8245fc364C3d',
    TREASURY_CONTRACT: '0x26B4DCb50e07323AC875c071b4F0a1E77b259d29'
  }
}

async function bscStaking(timestamp, block, chainBlocks) {
  return await getStaking('bsc', timestamp, block, chainBlocks);
}

async function hecoStaking(timestamp, block, chainBlocks) {
  return await getStaking('heco', timestamp, block, chainBlocks);
}

async function okexchainStaking(timestamp, block, chainBlocks) {
  return await getStaking('okexchain', timestamp, block, chainBlocks);
}

async function polygonStaking(timestamp, block, chainBlocks) {
  return await getStaking('polygon', timestamp, block, chainBlocks);
}

async function avaxStaking(timestamp, block, chainBlocks) {
  return await getStaking('avax', timestamp, block, chainBlocks);
}

async function auroraStaking(timestamp, block, chainBlocks) {
  return await getStaking('aurora', timestamp, block, chainBlocks);
}

async function kavaStaking(timestamp, block, chainBlocks) {
  return await getStaking('kava', timestamp, block, chainBlocks);
}

async function bscCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('bsc', timestamp, block, chainBlocks);
}

async function hecoCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('heco', timestamp, block, chainBlocks);
}

async function okexchainCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('okexchain', timestamp, block, chainBlocks);
}

async function polygonCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('polygon', timestamp, block, chainBlocks);
}

async function avaxCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('avax', timestamp, block, chainBlocks);
}

async function auroraCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('aurora', timestamp, block, chainBlocks);
}

async function kavaCoffer(timestamp, block, chainBlocks) {
  return await getGameCoffer('kava', timestamp, block, chainBlocks);
}

async function bscTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('bsc', timestamp, block, chainBlocks);
}

async function hecoTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('heco', timestamp, block, chainBlocks);
}

async function okexchainTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('okexchain', timestamp, block, chainBlocks);
}

async function polygonTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('polygon', timestamp, block, chainBlocks);
}

async function avaxTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('avax', timestamp, block, chainBlocks);
}

async function auroraTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('aurora', timestamp, block, chainBlocks);
}

async function kavaTreasury(timestamp, block, chainBlocks) {
  return await getTreasury('kava', timestamp, block, chainBlocks);
}

async function bscTvl(timestamp, block, chainBlocks) {
  return await getTvl('bsc', timestamp, block, chainBlocks);
}

async function hecoTvl(timestamp, block, chainBlocks) {
  return await getTvl('heco', timestamp, block, chainBlocks);
}

async function okexchainTvl(timestamp, block, chainBlocks) {
  return await getTvl('okexchain', timestamp, block, chainBlocks);
}

async function polygonTvl(timestamp, block, chainBlocks) {
  return await getTvl('polygon', timestamp, block, chainBlocks);
}

async function avaxTvl(timestamp, block, chainBlocks) {
  return await getTvl('avax', timestamp, block, chainBlocks);
}

async function auroraTvl(timestamp, block, chainBlocks) {
  return await getTvl('aurora', timestamp, block, chainBlocks);
}

async function kavaTvl(timestamp, block, chainBlocks) {
  return await getTvl('kava', timestamp, block, chainBlocks);
}

async function getStaking(chain, timestamp, block, chainBlocks) {
  const balances = {};

  let stakingOldBN = 0, staking30BN = 0, staking90BN = 0, staking180BN = 0;

  if(chainToAddresses[chain].SKILL_STAKING_OLD) {
    const stakingOld = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: chain,
      target: chainToAddresses[chain].SKILL_TOKEN_CONTRACT,
      params: [chainToAddresses[chain].SKILL_STAKING_OLD],
      block: chainBlocks[chain],
    })).output;
    stakingOldBN = new BigNumber(stakingOld);
  }

  if(chainToAddresses[chain].SKILL_STAKING_CONTRACT_30) {
    const staking30 = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: chain,
      target: chainToAddresses[chain].SKILL_TOKEN_CONTRACT,
      params: [chainToAddresses[chain].SKILL_STAKING_CONTRACT_30],
      block: chainBlocks[chain],
    })).output;
    staking30BN = new BigNumber(staking30);
  }

  if(chainToAddresses[chain].SKILL_STAKING_CONTRACT_90) {
    const staking90 = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: chain,
      target: chainToAddresses[chain].SKILL_TOKEN_CONTRACT,
      params: [chainToAddresses[chain].SKILL_STAKING_CONTRACT_90],
      block: chainBlocks[chain],
    })).output;
    staking90BN = new BigNumber(staking90);
  }

  if(chainToAddresses[chain].SKILL_STAKING_CONTRACT_180) {
    const staking180 = (await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      chain: chain,
      target: chainToAddresses[chain].SKILL_TOKEN_CONTRACT,
      params: [chainToAddresses[chain].SKILL_STAKING_CONTRACT_180],
      block: chainBlocks[chain],
    })).output;
    staking180BN = new BigNumber(staking180);
  }

  await sdk.util.sumSingleBalance(balances, transformKey, +(stakingOldBN.plus(staking30BN.plus(staking90BN).plus(staking180BN))))

  return balances;
}

async function getGameCoffer(chain, timestamp, block, chainBlocks) {
  const balances = {};

  const gameCoffer = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: chain,
    target: chainToAddresses[chain].SKILL_TOKEN_CONTRACT,
    params: [chainToAddresses[chain].GAME_CONTRACT],
    block: chainBlocks[chain],
  })).output;

  await sdk.util.sumSingleBalance(balances, transformKey, gameCoffer);

  return balances;
}

async function getTreasury(chain, timestamp, block, chainBlocks) {
  const balances = {};

  const treasury = (await sdk.api.abi.call({
    abi: 'erc20:balanceOf',
    chain: chain,
    target: chainToAddresses[chain].SKILL_TOKEN_CONTRACT,
    params: [chainToAddresses[chain].TREASURY_CONTRACT],
    block: chainBlocks[chain],
  })).output;

  await sdk.util.sumSingleBalance(balances, transformKey, treasury);

  return balances;
}

async function getTvl(chain, timestamp, block, chainBlocks) {
  const staking = await getStaking(chain, timestamp, block, chainBlocks);
  const gameCoffer = await getGameCoffer(chain, timestamp, block, chainBlocks);
  const treasury = await getTreasury(chain, timestamp, block, chainBlocks);

  return { 
    'bsc:0x154a9f9cbd3449ad22fdae23044319d6ef2a1fab': 
    +staking[transformKey] +
    +gameCoffer[transformKey] +
    +treasury[transformKey]
  }
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology: 'Counts the number of tokens locked in staking contracts, treasury contract that rewards are being claimed from constantly and game contract (ownTokens) which accumulates funds spent by players in game.',
  start: 14023095,
  bsc: {
    tvl: bscTvl,
    staking: bscStaking,
    ownTokens: bscCoffer,
    treasury: bscTreasury
  },
  heco: {
    tvl: hecoTvl,
    staking: hecoStaking,
    ownTokens: hecoCoffer,
    treasury: hecoTreasury
  },
  okexchain: {
    tvl: okexchainTvl,
    staking: okexchainStaking,
    ownTokens: okexchainCoffer,
    treasury: okexchainTreasury
  },
  polygon: {
    tvl: polygonTvl,
    staking: polygonStaking,
    ownTokens: polygonCoffer,
    treasury: polygonTreasury
  },
  avax: {
    tvl: avaxTvl,
    staking: avaxStaking,
    ownTokens: avaxCoffer,
    treasury: avaxTreasury
  },
  aurora: {
    tvl: auroraTvl,
    staking: auroraStaking,
    ownTokens: auroraCoffer,
    treasury: auroraTreasury
  },
  kava: {
    tvl: kavaTvl,
    staking: kavaStaking,
    ownTokens: kavaCoffer,
    treasury: kavaTreasury
  },
}; 