const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
// const { covalentGetTokens } = require("../helper/http");
const { getChainTransform } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const rabbitStaking = "0x0586Cd1032FF9f882E29f9E8a6008d097F87D71b";
const RS = "0xc25b7244e192d531495c400c64ea914a77e730a2";

const treasuryContractAddress = "0xD055fE3b8De27A730E3b57BF108648EE01C96055";
const RABBIT = "0x95a1199eba84ac5f19546519e287d43d2f0e1b41";
const BUSD_RABBIT_MDEX_LP = "0x0025D20D85788C2cAE2FEB9C298bdaFc93bF08Ce";
const WBNB_RABBIT_Cake_LP = "0x04b56A5B3f45CFeaFbfDCFc999c14be5434f2146";
const RS_RABBIT_Cake_LP = "0xf2D5987793a904601C7aE80a62eEE3F25B4898A4";

const BANK_CONTRACT = "0xc18907269640D11E2A91D7204f33C5115Ce3419e";
const chain = 'bsc'

const bscTvl = async (timestamp, ethBlock, { [chain]: block }) => {
  const balances = {};

  const transformAddress = await getChainTransform(chain)
  /*** Rabbit Farm TVL Portion ***/
  // let poolsInfo = (
  //   await covalentGetTokens(BANK_CONTRACT, chain)
  // ).map((addr) => addr.contract_address);

  const poolsInfo = [
    ADDRESSES.bsc.USDT,
    ADDRESSES.bsc.BUSD,
    ADDRESSES.bsc.ETH,
    ADDRESSES.bsc.BTCB,
    '0x95a1199eba84ac5f19546519e287d43d2f0e1b41',
    '0x3ee2200efb3400fabb9aacf31297cbdd1d435d47',
    '0x9c65ab58d8d978db963e63f2bfb7121627e3a739',
    '0x7083609fce4d1d8dc0c979aab8c869ea2c873402',
    '0xcf6bb5389c92bdda8a3747ddb454cb7a64626c63',
    '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',
    '0xbf5140a22578168fd562dccf235e5d43a02ce9b1',
    '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',
    '0x0d8ce2a99bb6e3b7db580ed848240e4a0f9ae153',
    '0x4338665cbb7b2485a8855a139b75d5e34ab0db94',
  ]
  const calls = poolsInfo.map(i => ({ params: [i] }))
  const { output: tokens } = await sdk.api.abi.multiCall({
    target: BANK_CONTRACT,
    abi: abi.totalToken,
    calls,
    chain, block,
  })

  tokens.forEach(({ output }, i) => {
    if (!output) return;
    sdk.util.sumSingleBalance(balances, transformAddress(poolsInfo[i]), output)
  })
  /*** Rabbit DAO TVL Portion: Olympus fork ***/
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [RABBIT, false],
      [BUSD_RABBIT_MDEX_LP, true],
      [WBNB_RABBIT_Cake_LP, true],
      [RS_RABBIT_Cake_LP, true],
    ],
    [treasuryContractAddress],
    block,
    chain,
    transformAddress
  );

  /* 
    A piece of TVL is atm 405k from the Boardroom, but I think should be not counted
    as it is simply issuing their own token and deposited over there.
    Another portion is "stake", which is double counting the same token where deposited
    in vault, since on depositing they gave ibX token, then this is staked...
  */

  return balances;
};

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  bsc: {
    staking: staking(rabbitStaking, RS, "bsc"),
    tvl: bscTvl,
  },
  methodology: "Counts TVL on all the Farms through Bank Contract; and the Treasury portion on the Rabbit DAO product",
};
