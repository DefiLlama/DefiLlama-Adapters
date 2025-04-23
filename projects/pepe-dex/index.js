const sdk = require("@defillama/sdk");

const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");
const { scriptEvaluate, assetBalance, sumTokens } = require("../helper/chain/waves");

// DEX actually doesn't store WAVES on its account
// but stakes it to our WAVES staking contract
// so TVL calculation is based on product of SWAVES/WAVES rate with SWAVES balance
async function wavesTVL(api) {
  const WAVES_VAULT_CONTRACT = "3PCSFoiiY4eUcLJNzSfMLy5jHEMtcHduT3M";
  const SWAVES_STAKING_CONTRACT = "3PDPzZVLhN1EuzGy4xAxjjTVkawKDLEaHiV";
  const SWAVES_ASSET_ID = "YiNbofFzC17jEHHCMwrRcpy9MrrjabMMLZxg8g5xmf7";
  const SWAVES_RATE_DECIMALS = 1e12;

  const balanceResp = await assetBalance(
    WAVES_VAULT_CONTRACT,
    SWAVES_ASSET_ID
  );

  const sWavesBalance = balanceResp.balance;
  const evaluateResp = await scriptEvaluate(
    SWAVES_STAKING_CONTRACT,
    "getRate()"
  );

  const rawSWavesRate = evaluateResp.result["value"]["_2"]["value"];
  const sWavesRate = parseInt(rawSWavesRate) / SWAVES_RATE_DECIMALS;
  const balanceInWaves = Math.floor(sWavesBalance * sWavesRate);
  const balances = await sumTokens({ owners: [WAVES_VAULT_CONTRACT], api })

  // replace sWAVES balance (see swaves.pepe.team - liquid staking protocol)
  return { ...balances, [`waves:${SWAVES_ASSET_ID}`]: balanceInWaves };
}

const config = {
  ethereum: {
    ownerTokens: [
      [
        [
          nullAddress,
          ADDRESSES.ethereum.USDT,
          ADDRESSES.ethereum.WBTC,
          ADDRESSES.ethereum.WAVES
        ],
        "0xE1afEd6A61a169638F3a895E0F0506A5218e2Bf5"
      ]
    ],
  },
  bsc: {
    ownerTokens: [
      [
        [
          nullAddress,
          ADDRESSES.bsc.USDT
        ],
        "0xE239B640Aa534b1313012fAfF581C868f3207854"
      ]
    ]
  },
  polygon: {
    ownerTokens: [
      [
        [
          nullAddress,
          ADDRESSES.polygon.USDT
        ],
        "0xEA27B6337cE7462B791977b0180acA8FB2cAbBBF"
      ]
    ]
  },
};

module.exports = {
  methodology: "All tokens locked in PepeTeam DEX vaults",
  timetravel: false,
  waves: {
    tvl: wavesTVL,
  }
}

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ownerTokens: config[chain].ownerTokens, logCalls: true, transformAddress: config[chain].transformAddress }),
  };
});
