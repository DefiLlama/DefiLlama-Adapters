const ADDRESSES = require('./coreAssets.json')
const { sumTokensExport, nullAddress } = require('./sumTokens')
const { ankrChainMapping } = require('./token')
const { defaultTokens } = require('./cex')
const { getUniqueAddresses } = require('./utils')
const sdk = require('@defillama/sdk')
const { sumTokensDebank } = require('./debank')

const ARB = ADDRESSES.arbitrum.ARB;

function treasuryExports(config) {
  const { isComplex, complexOwners = [], ...chains } = config;

  const exportObj = {};

  Object.keys(chains).forEach(chain => {
    let { ownTokenOwners = [], ownTokens = [], owners = [], tokens = [], blacklistedTokens = [] } = config[chain]
    const tvlConfig = { permitFailure: true, ...config[chain] };

    if (chain === 'solana') {
      tvlConfig.solOwners = owners;
    } else if (config[chain].fetchCoValentTokens !== false) {
      if (ankrChainMapping[chain]) {
        tvlConfig.fetchCoValentTokens = true;
        if (!tvlConfig.tokenConfig) tvlConfig.tokenConfig = { onlyWhitelisted: false };
      } else if (defaultTokens[chain]) {
        tvlConfig.tokens = [tokens, defaultTokens[chain]].flat();
      }
    }

    tvlConfig.blacklistedTokens = [...ownTokens, ...blacklistedTokens];

    if (chain === 'arbitrum') tvlConfig.tokens = [...tokens, ARB];
    if (!Array.isArray(tvlConfig.tokens)) tvlConfig.tokens = [];

    const baseExport = { tvl: sumTokensExport(tvlConfig) };

    const complexExport = isComplex ? {
      [chain]: {
        tvl: async (api) => {
          if (!complexOwners.length) return api.getBalances();
          const bl = getUniqueAddresses([...ownTokens, ...blacklistedTokens], false)
          await sumTokensDebank(api, complexOwners, { blacklistedTokens: bl, stripPoolTokens: true })
          return api.getBalances();
        }
      }
    } : null;

    if (isComplex) {
      exportObj[chain] = {
        tvl: sdk.util.sumChainTvls([baseExport.tvl, complexExport[chain].tvl])
      };
    } else {
      exportObj[chain] = baseExport;
    }

    if (ownTokens.length > 0) {
      const { solOwners, ...other } = config[chain];
      const opts = {
        ...other,
        owners: [...owners, ...ownTokenOwners],
        tokens: ownTokens,
        chain,
        uniV3WhitelistedTokens: ownTokens,
      };
      exportObj[chain].ownTokens = sumTokensExport(opts);
    }
  });

  return exportObj;
}

function ohmStaking(exports) {
  const dummyTvl = () => ({})
  const newExports = {}
  Object.entries(exports).forEach(([chain, value]) => {
    if (typeof value === 'object' && typeof value.tvl === 'function') {
      newExports[chain] = { ...value, tvl: dummyTvl }
    } else {
      newExports[chain] = value
    }
  })
  return newExports
}

function ohmTreasury(exports) {
  const dummyTvl = () => ({})
  const newExports = {}
  Object.entries(exports).forEach(([chain, value]) => {
    if (typeof value === 'object' && typeof value.staking === 'function') {
      newExports[chain] = { ...value, }
      delete newExports[chain].staking
    } else {
      newExports[chain] = value
    }
  })
  return newExports
}

module.exports = {
  nullAddress,
  treasuryExports,
  ohmTreasury,
  ohmStaking,
}
