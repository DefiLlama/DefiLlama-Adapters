const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

// Nexion protocol addresses
const contracts = {
  NEONStaking: "0x00149EF1A0a41083bC3996d026a7c0f32fc5cb73",
  NEONStakingV2: "0xB4f064f8c0CB1118d1326Df6E74b05D6B12d0b2B",
  NEON: "0xF2Da3942616880E52e841E5C504B5A9Fba23FFF0",
  NEONFarm: "0xdF6ec9b93fa473Cb6772dc47326338ecBa374D39",
  OLDNEONFarm: "0x80020303898695b3Ab8017869B6158B49cD5B6CC",
};

const COLLATERALS = {
  DAI: ADDRESSES.pulse.DAI,
  WPLS: ADDRESSES.pulse.WPLS,
  DAIPLS_LP: "0xE56043671df55dE5CDf8459710433C10324DE0aE"
};

// Gearbox-style lending: ContractsRegister holds all pools on-chain
const CONTRACTS_REGISTER = "0x07763c4e51b458d2eA5f5506a22Ae11F9cF985dd";

/**
 * Fetches total supplied (expectedLiquidity) across all lending pools
 * plus farm deposits. This is the supply-side TVL.
 */
async function tvl(api) {
  // 1. Lending pool supply TVL
  const pools = await api.call({
    abi: 'address[]:getPools',
    target: CONTRACTS_REGISTER,
  });

  const [liquidity, underlyings] = await Promise.all([
    api.multiCall({ abi: 'uint256:expectedLiquidity', calls: pools }),
    api.multiCall({ abi: 'address:underlyingToken', calls: pools }),
  ]);

  liquidity.forEach((liq, i) => {
    if (liq && liq !== '0') {
      api.add(underlyings[i], liq);
    }
  });

  // 2. Farm deposits (LP tokens in NEONFarm contracts)
  const farmOwners = [contracts.NEONFarm, contracts.OLDNEONFarm];
  const farmTokens = [COLLATERALS.DAI, COLLATERALS.WPLS, ADDRESSES.null];
  const tokensAndOwners = [];
  farmOwners.forEach(owner => {
    farmTokens.forEach(token => {
      tokensAndOwners.push([token, owner]);
    });
  });

  return sumTokens2({ api, tokensAndOwners, resolveLP: true });
}

/**
 * Fetches borrowed TVL dynamically from on-chain pool contracts.
 */
async function borrowed(api) {
  const pools = await api.call({
    abi: 'address[]:getPools',
    target: CONTRACTS_REGISTER,
  });

  const [debts, underlyings] = await Promise.all([
    api.multiCall({ abi: 'uint256:totalBorrowed', calls: pools }),
    api.multiCall({ abi: 'address:underlyingToken', calls: pools }),
  ]);

  debts.forEach((debt, i) => {
    if (debt && debt !== '0') {
      api.add(underlyings[i], debt);
    }
  });
}

module.exports = {
  methodology: "TVL is total supplied to lending pools (expectedLiquidity) plus farm deposits. Borrowed is total debt across all pools. Staking is NEON locked in the staking contract.",
  pulse: {
    tvl,
    borrowed,
    staking: async (api) => {
      return sumTokens2({
        api,
        tokensAndOwners: [
          [contracts.NEON, contracts.NEONStaking],
          [contracts.NEON, contracts.NEONStakingV2],
        ],
      });
    },
  },
};
