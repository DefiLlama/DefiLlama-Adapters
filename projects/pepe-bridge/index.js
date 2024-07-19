const sdk = require("@defillama/sdk");

const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, sumTokensExport } = require("../helper/unwrapLPs");
const { scriptEvaluate, assetBalance } = require("../helper/chain/waves");

// Bridge actually doesn't store WAVES on its account
// but stakes it to our WAVES staking contract
// so TVL calculation is based on product of SWAVES/WAVES rate with SWAVES balance
async function wavesTVL() {
  const WAVES_COIN_BRIDGE_CONTRACT = "3PFPuctNkdbwGKKUNymWw816jGPexHzGXW5";
  const SWAVES_STAKING_CONTRACT = "3PDPzZVLhN1EuzGy4xAxjjTVkawKDLEaHiV";
  const SWAVES_ASSET_ID = "YiNbofFzC17jEHHCMwrRcpy9MrrjabMMLZxg8g5xmf7";
  const SWAVES_DECIMALS = 1e8;
  const SWAVES_RATE_DECIMALS = 1e12;

  const balanceResp = await assetBalance(
    WAVES_COIN_BRIDGE_CONTRACT,
    SWAVES_ASSET_ID
  );

  const sWavesBalance = balanceResp.balance / SWAVES_DECIMALS;

  const evaluateResp = await scriptEvaluate(
    SWAVES_STAKING_CONTRACT,
    "getRate()"
  );

  /**
   * Response example:
   * {
   *   "result": {
   *     "type": "Tuple",
   *     "value": {
   *       "_1": {
   *         "type": "Array",
   *         "value": []
   *       },
   *       "_2": {
   *         "type": "String",
   *         "value": "1110637703184"
   *       }
   *     }
   *   },
   *   "complexity": 257,
   *   "stateChanges": { .. }
   * }
   */
  const rawSWavesRate = evaluateResp.result["value"]["_2"]["value"];
  const sWavesRate = parseInt(rawSWavesRate) / SWAVES_RATE_DECIMALS;
  const balanceInWaves = sWavesBalance * sWavesRate;

  const balances = {};
  sdk.util.sumSingleBalance(balances, "waves", balanceInWaves);
  return balances;
}

const config = {
  ethereum: [
    [[nullAddress], "0x882260324AD5A87bF5007904B4A8EF87023c856A"],
    [
      [
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.WBTC,
        ADDRESSES.ethereum.CRV,
        ADDRESSES.ethereum.UNI,
        ADDRESSES.ethereum.MKR,
        ADDRESSES.ethereum.LINK,
        ADDRESSES.ethereum.CRVUSD,
      ],
      "0x0de7b091A21BD439bdB2DfbB63146D9cEa21Ea83",
    ],
  ],
  bsc: [
    [[nullAddress], "0xF1632012f6679Fcf464721433AFAAe9c11ad9e03"],
    [
      [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC, ADDRESSES.bsc.BTCB],
      "0x8DF12786EC0E34e60D4c52f9052ba4e536e9367a",
    ],
  ],
  polygon: [
    [[nullAddress], "0xEa3cc73165748AD1Ca76b4d1bA9ebC43fb399018"],
    [
      [ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC],
      "0xF57dB884606a0ed589c06320d9004FBeD4f81e4A",
    ],
  ],
  tron: [
    [[nullAddress], "TMsm33cUm8HuxyRqwG7xhV46cmx5NVPPGB"],
    [
      [ADDRESSES.tron.USDT, ADDRESSES.tron.USDC],
      "TNN42f7dXYksBsh8hjVo8XD8aYSKcSEhJF",
    ],
  ],
};

Object.keys(config).forEach((chain) => {
  module.exports[chain] = {
    tvl: sumTokensExport({ ownerTokens: config[chain], logCalls: true }),
  };
});
module.exports.waves = { tvl: wavesTVL };

module.exports.timetravel = false; // Waves blockchain
module.exports.methodology = "All tokens locked in PepeTeam Bridge.";
