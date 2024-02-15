const { call } = require("../helper/chain/stacks-api");

const BITFLOW_ADDRESS = "SPQC38PW542EQJ5M11CR25P7BS1CA6QT4TBXGB3M";

const PAIRS = {
  "stx-ststx-v1": {
    target: `${BITFLOW_ADDRESS}.stableswap-stx-ststx-v-1-1`,
    lpToken: `${BITFLOW_ADDRESS}.stx-ststx-lp-token-v-1-1`,
    tokenX: "",
    tokenY: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token",
    scaleFactor: 1e6,
  },
  "stx-ststx-v2": {
    target: `${BITFLOW_ADDRESS}.stableswap-stx-ststx-v-1-2`,
    lpToken: `${BITFLOW_ADDRESS}.stx-ststx-lp-token-v-1-2`,
    tokenX: "",
    tokenY: "SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token",
    scaleFactor: 1e6,
  },
  "usda-susdt-v2": {
    target: `${BITFLOW_ADDRESS}.stableswap-usda-susdt-v-1-2`,
    lpToken: `${BITFLOW_ADDRESS}.usda-susdt-lp-token-v-1-2`,
    tokenX: `SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token`,
    tokenY: `SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-susdt`,
    scaleFactor: 1e8,
  },
  "abtc-xbtc-v2": {
    target: `${BITFLOW_ADDRESS}.stableswap-abtc-xbtc-v-1-2`,
    lpToken: `${BITFLOW_ADDRESS}.abtc-xbtc-lp-token-v-1-2`,
    tokenX: "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-abtc",
    tokenY: "SP3DX3H4FEYZJZ586MFBS25ZW3HZDMEW92260R2PR.Wrapped-Bitcoin",
    scaleFactor: 1e8,
  },
};

async function tvl() {
  const pairNames = Object.keys(PAIRS);

  let promises = [];

  Object.values(PAIRS).map(({ target, tokenX, tokenY, lpToken }, index) => {
    const inputArgs = pairNames[index].startsWith("stx")
      ? [
          {
            type: "principal",
            value: tokenY,
          },
          {
            type: "principal",
            value: lpToken,
          },
        ]
      : [
          {
            type: "principal",
            value: tokenX,
          },
          {
            type: "principal",
            value: tokenY,
          },
          {
            type: "principal",
            value: lpToken,
          },
        ];

    const result = call({
      target,
      abi: "get-pair-data",
      inputArgs,
    });

    promises.push(result);
  });

  const tvlArray = (await Promise.all(promises)).map(
    (response) => response.value["total-shares"].value
  );

  const blockstack = tvlArray[0] / 1e6 + tvlArray[1] / 1e6;
  const tether = tvlArray[2] / 1e8;
  const bitcoin = tvlArray[3] / 1e8;

  return { blockstack, bitcoin, tether };
}

// node test.js projects/bitflow/index.js
module.exports = {
  stacks: {
    tvl,
  },
  methodology: "Total Liquidity Added to DEX Trading Pools",
};
