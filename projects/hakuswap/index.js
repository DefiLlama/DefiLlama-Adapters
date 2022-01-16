const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl");

const FACTORY_ADDRESS = "0x2Db46fEB38C57a6621BCa4d97820e1fc1de40f41";
const HAKU_TOKEN_ADDRESS = "0x695Fa794d59106cEbd40ab5f5cA19F458c723829";
const XHAKU_ADDRESS = "0xa95C238B5a72f481f6Abd50f951F01891130b441";

async function avalancheTvl(timestamp, block, chainBlocks) {
  let balances = await calculateUniTvl(
    (addr) => `avax:${addr}`,
    chainBlocks.avax,
    "avax",
    FACTORY_ADDRESS,
    0,
    true
  );
  return balances;
}

function staking(xhaku, token, chain) {
  return async (_timestamp, _block, chainBlocks) => {
    let balances = {};
    let balance = (
      await sdk.api.erc20.balanceOf({
        target: token,
        owner: xhaku,
        block: chainBlocks[chain],
        chain,
      })
    ).output;
    sdk.util.sumSingleBalance(balances, `avax:${HAKU_TOKEN_ADDRESS}`, balance);
    return balances;
  };
}

module.exports = {
  avalanche: {
    tvl: avalancheTvl,
    staking: staking(XHAKU_ADDRESS, HAKU_TOKEN_ADDRESS, "avax"),
  },
  tvl: avalancheTvl,
  methodology: "TVL comes from the DEX liquidity pools, staking TVL is accounted as the haku on xHAKU pool(0xa95C238B5a72f481f6Abd50f951F01891130b441)",
};