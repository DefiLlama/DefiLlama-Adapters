const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unknownTokens.js");

// Nexion protocol addresses
const contracts = {
  NEONStaking: "0x00149EF1A0a41083bC3996d026a7c0f32fc5cb73",
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
 * Fetches borrowed TVL dynamically from on-chain pool contracts.
 * Reads all pools from ContractsRegister, then queries totalBorrowed
 * and underlyingToken for each pool via multiCall.
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
  methodology: "Nexion lending: borrowed is the total debt across all Gearbox-style lending pools read on-chain. TVL includes farm deposits. Staking is NEON locked in the staking contract.",
  pulse: {
    borrowed,
    tvl: sumTokensExport({
      owners: [contracts.NEONFarm, contracts.OLDNEONFarm],
      tokens: [COLLATERALS.DAI, COLLATERALS.WPLS, ADDRESSES.null],
      useDefaultCoreAssets: true,
      lps: [COLLATERALS.DAIPLS_LP]
    }),
    staking: sumTokensExport({
      owners: [contracts.NEONStaking],
      tokens: [contracts.NEON],
      useDefaultCoreAssets: true,
      lps: ['0xEd15552508E5200f0A2A693B05dDd3edEF59e624']
    }),
  },
};
