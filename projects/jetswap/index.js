const { staking } = require("../helper/staking");
const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const {uniTvlExport} = require('../helper/calculateUniTvl')

const chainTvls = getChainTvl({
  fantom: "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-fantom",
  polygon: "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph-polygon",
  bsc: "https://api.thegraph.com/subgraphs/name/smartcookie0501/jetswap-subgraph"
})

const WINGS_TOKEN_BSC = "0x0487b824c8261462f88940f97053e65bdb498446";
const WINGS_TOKEN_POLYGON = "0x845E76A8691423fbc4ECb8Dd77556Cb61c09eE25";
const WINGS_TOKEN_FANTOM = "0x3D8f1ACCEe8e263F837138829B6C4517473d0688";

const MASTER_BSC = "0x63d6EC1cDef04464287e2af710FFef9780B6f9F5";
const MASTER_POLYGON = "0x4e22399070aD5aD7f7BEb7d3A7b543e8EcBf1d85";
const MASTER_FANTOM = "0x9180583C1ab03587b545629dd60D2be0bf1DF4f2";

const COINGECKO_WINGS_TOKEN = "bsc:0x0487b824c8261462f88940f97053e65bdb498446"

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    staking: staking(MASTER_BSC, WINGS_TOKEN_BSC,"bsc", COINGECKO_WINGS_TOKEN),
    tvl: chainTvls('bsc'),
  },
  polygon: {
    staking: staking(MASTER_POLYGON, WINGS_TOKEN_POLYGON,"polygon", COINGECKO_WINGS_TOKEN),
    tvl: uniTvlExport('0x668ad0ed2622c62e24f0d5ab6b6ac1b9d2cd4ac7','polygon'),
  },
  fantom: {
    staking: staking(MASTER_FANTOM, WINGS_TOKEN_FANTOM,"fantom", COINGECKO_WINGS_TOKEN),
    tvl: chainTvls('fantom'),
  },
};
