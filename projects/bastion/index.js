const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const abi = require("./abi.json");
const { compoundExports } = require("../helper/compound");
const { bigNumberify } = require("../mobiusfinance/utilities/utilities");

/*//////////////////////////////////////////////////////////////
                              LENDING
//////////////////////////////////////////////////////////////*/
const mainHubExport = compoundExports(
  "0x6De54724e128274520606f038591A00C5E94a1F6",
  "aurora",
  "0x4E8fE8fd314cFC09BDb0942c5adCC37431abDCD0",
  "0xc9bdeed33cd01541e1eed10f90519d2c06fe3feb"
);

const auroraRealmExport = compoundExports(
  "0xA195b3d7AA34E47Fb2D2e5A682DF2d9EFA2daF06",
  "aurora"
);

const multiChainRealmExport = compoundExports(
  "0xe1cf09BDa2e089c63330F0Ffe3F6D6b790835973",
  "aurora"
);

const stakedNearRealmExport = compoundExports(
  "0xE550A886716241AFB7ee276e647207D7667e1E79",
  "aurora"
);

const bastion = [
  mainHubExport,
  auroraRealmExport,
  multiChainRealmExport,
  stakedNearRealmExport,
];

/*//////////////////////////////////////////////////////////////
                            STABLESWAP
//////////////////////////////////////////////////////////////*/
/*** Fantom Addresses ***/
const stablePoolAddress = "0x6287e912a9Ccd4D5874aE15d3c89556b2a05f080";
const cUSDC = "0xe5308dc623101508952948b141fD9eaBd3337D99";
const cUSDT = "0x845E15A441CFC1871B7AC610b0E922019BaD9826";

const ctokens = {
  [cUSDC]: [stablePoolAddress],
  [cUSDT]: [stablePoolAddress],
};

const ctokenUnderlying = {
  [cUSDC]: "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802",
  [cUSDT]: "0x4988a896b1227218e4A686fdE5EabdcAbd91571f",
};

async function tvlStableSwap(timestamp, block) {
  let balances = {};
  let calls = [];

  for (const ctoken in ctokens) {
    for (const poolAddress of ctokens[ctoken])
      calls.push({
        target: ctoken,
        params: poolAddress,
      });
  }

  // Pool Balances
  let balanceOfResults = await sdk.api.abi.multiCall({
    block,
    calls: calls,
    abi: abi["balanceOfUnderlying"],
    chain: "aurora",
  });

  // Compute Balances
  balanceOfResults.output.forEach((balanceOfUnderlying, idx) => {
    let address = balanceOfUnderlying.input.target;
    let amount = balanceOfUnderlying.output;
    let underlying = `aurora:${ctokenUnderlying[address]}`;
    balances[underlying] = BigNumber(balances[underlying] || 0)
      .plus(amount)
      .toFixed();
  });

  return balances;
}

module.exports = {
  timetravel: true,
  aurora: {
    tvl: async (...args) => {
      let balances = {};
      for (const realm of bastion) {
        const realmBalances = await realm.tvl(...args);
        for (const underlyingAddress of Object.keys(realmBalances)) {
          if (underlyingAddress in balances) {
            balances[underlyingAddress] = bigNumberify(
              balances[underlyingAddress]
            )
              .add(bigNumberify(realmBalances[underlyingAddress]))
              .toString();
          } else {
            balances[underlyingAddress] = realmBalances[underlyingAddress];
          }
        }
      }

      const stableSwapBalances = await tvlStableSwap(...args);
      for (const underlyingAddress of Object.keys(stableSwapBalances)) {
        if (underlyingAddress in balances) {
          balances[underlyingAddress] = bigNumberify(
            balances[underlyingAddress]
          )
            .add(bigNumberify(stableSwapBalances[underlyingAddress]))
            .toString();
        } else {
          balances[underlyingAddress] = stableSwapBalances[underlyingAddress];
        }
      }

      return balances;
    },
    borrowed: async (...args) => {
      let balances = {};
      for (const realm of bastion) {
        const realmBalances = await realm.borrowed(...args);
        for (const underlyingAddress of Object.keys(realmBalances)) {
          if (underlyingAddress in balances) {
            balances[underlyingAddress] = bigNumberify(
              balances[underlyingAddress]
            )
              .add(bigNumberify(realmBalances[underlyingAddress]))
              .toString();
          } else {
            balances[underlyingAddress] = realmBalances[underlyingAddress];
          }
        }
      }
      return balances;
    },
  },
};
