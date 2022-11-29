const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl");

const bscFactory = "0x0eb58E5c8aA63314ff5547289185cC4583DfCBD5";
const polygonFactory = "0x668ad0ed2622C62E24f0d5ab6B6Ac1b9D2cD4AC7";
const fantomFactory = "0xf6488205957f0b4497053d6422F49e27944eE3Dd";

const WINGS_TOKEN_BSC = "0x0487b824c8261462f88940f97053e65bdb498446";
const WINGS_TOKEN_POLYGON = "0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25";
const WINGS_TOKEN_FANTOM = "0x3D8f1ACCEe8e263F837138829B6C4517473d0688";

const MASTER_BSC = "0x63d6EC1cDef04464287e2af710FFef9780B6f9F5";
const MASTER_POLYGON = "0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85";
const MASTER_FANTOM = "0x9180583C1ab03587b545629dd60D2be0bf1DF4f2";

async function bscTvl(timestamp, block, chainBlocks) {
  let balances = await calculateUniTvl(
    (addr) => `bsc:${addr}`,
    chainBlocks.bsc,
    "bsc",
    bscFactory,
    0,
    true
  );
  return balances;
}

async function polygonTvl(timestamp, block, chainBlocks) {
  let balances = calculateUniTvl(
    (addr) => `polygon:${addr}`,
    chainBlocks.polygon,
    "polygon",
    polygonFactory,
    0,
    true
  );
  return balances;
}

async function fantomTvl(timestamp, block, chainBlocks) {
  let balances = calculateUniTvl(
    (addr) => `fantom:${addr}`,
    chainBlocks.fantom,
    "fantom",
    fantomFactory,
    0,
    true
  );
  return balances;
}

function staking(masterchef, token, chain) {
  return async (_timestamp, _block, chainBlocks) => {
    let balances = {};
    let balance = (
      await sdk.api.erc20.balanceOf({
        target: token,
        owner: masterchef,
        block: chainBlocks[chain],
        chain,
      })
    ).output;
    sdk.util.sumSingleBalance(balances, `bsc:${WINGS_TOKEN_BSC}`, balance);
    return balances;
  };
}

module.exports = {
  bsc: {
    tvl: bscTvl,
    staking: staking(MASTER_BSC, WINGS_TOKEN_BSC, "bsc"),
  },
  polygon: {
    tvl: polygonTvl,
    staking: staking(MASTER_POLYGON, WINGS_TOKEN_POLYGON, "polygon"),
  },
  fantom: {
    tvl: fantomTvl,
    staking: staking(MASTER_FANTOM, WINGS_TOKEN_FANTOM, "fantom"),
  },
};
