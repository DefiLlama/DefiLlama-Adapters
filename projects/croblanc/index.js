const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { unwrapUniswapLPs, } = require("../helper/unwrapLPs");
const { getChainTransform } = require('../helper/portedTokens')

const treasury = "0xb20234c33337537111f4ab6f5EcaD400134aC143";
const WCRO = "0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23";

const croblancAlpha = "0x52a87ef19e4a0E8cc70aE69D22bc8254bc6fa0F9";

const pool2Farm = "0x4c1EC4Bf75CdFAF9b172e94cc85b7a8eA647F267";
const WCRO_CROBLANC_CronaLP = ["0xac23a7de083719c0e11d5c2efbcc99db5c73bb48"].map(addr => addr.toLowerCase())

const cronosTvl = async (_, _b, chainBlocks) => {
  const chain = 'cronos'
  const balances = {}
  const block = chainBlocks[chain]
  const abis = [abi.want, abi.stakedWant]
  const transformAddress = await getChainTransform(chain)

  const farms = (
    await sdk.api.abi.call({
      abi: abi.getFarms,
      target: croblancAlpha,
      chain, block,
    })
  ).output;
  
  const calls = farms.map(t => ({ target: t }))
  const [
    want,
    stakedWant
  ] = (await Promise.all(abis.map(abi => sdk.api.abi.multiCall({
    abi, calls, chain, block,
  })))).map(i => i.output)

  const lpPositions = []
  want.forEach(({ output }, idx) => {
    if (!WCRO_CROBLANC_CronaLP.includes(output.toLowerCase()))
      lpPositions.push({ token: output, balance: stakedWant[idx].output })
  })

  await unwrapUniswapLPs(balances, lpPositions, block, chain, transformAddress);
  return balances;
};

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    treasury: staking(treasury, WCRO, "cronos"),
    pool2: pool2(pool2Farm, WCRO_CROBLANC_CronaLP[0], "cronos"),
    tvl: cronosTvl,
  },
  methodology:
    "Counts liquidity on all the Farms through CroblancAlpha Contract",
};
