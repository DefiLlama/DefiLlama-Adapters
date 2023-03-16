
const { uniTvlExport } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const FACTORY_ADDRESS = "0x2Db46fEB38C57a6621BCa4d97820e1fc1de40f41";
const HAKU_TOKEN_ADDRESS = "0x695Fa794d59106cEbd40ab5f5cA19F458c723829";
const XHAKU_ADDRESS = "0xa95C238B5a72f481f6Abd50f951F01891130b441";

module.exports = {
  avax:{
    tvl: uniTvlExport(FACTORY_ADDRESS, 'avax'),
    staking: stakingUnknownPricedLP(XHAKU_ADDRESS, HAKU_TOKEN_ADDRESS, "avax", "0x7943Acd42c41a345841cB22Bd846794a22d8682d")
  },
  misrepresentedTokens: true,
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the haku on xHAKU pool(0xa95C238B5a72f481f6Abd50f951F01891130b441)",
};