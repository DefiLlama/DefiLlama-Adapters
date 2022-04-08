const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { transformBscAddress } = require("../helper/portedTokens");
const { sumTokensAndLPsSharedOwners } = require("../helper/unwrapLPs");

const rabbitStaking = "0x0586Cd1032FF9f882E29f9E8a6008d097F87D71b";
const RS = "0xc25b7244e192d531495c400c64ea914a77e730a2";

const treasuryContractAddress = "0xD055fE3b8De27A730E3b57BF108648EE01C96055";
const RABBIT = "0x95a1199eba84ac5f19546519e287d43d2f0e1b41";
const BUSD_RABBIT_MDEX_LP = "0x0025D20D85788C2cAE2FEB9C298bdaFc93bF08Ce";
const WBNB_RABBIT_Cake_LP = "0x04b56A5B3f45CFeaFbfDCFc999c14be5434f2146";
const RS_RABBIT_Cake_LP = "0xf2D5987793a904601C7aE80a62eEE3F25B4898A4";

const ENDPOINT_RABBIT_FINANCE =
  "https://api.covalenthq.com/v1/56/address/0xc18907269640D11E2A91D7204f33C5115Ce3419e/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6";

const BANK_CONTRACT = "0xc18907269640D11E2A91D7204f33C5115Ce3419e";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  /*** Rabbit Farm TVL Portion ***/
  let poolsInfo = (
    await utils.fetchURL(ENDPOINT_RABBIT_FINANCE)
  ).data.data.items.map((addr) => addr.contract_address);

  for (let i = 0; i < poolsInfo.length; i++) {
    try {
      const totalTokenBalance = (
        await sdk.api.abi.call({
          abi: abi.totalToken,
          params: [poolsInfo[i]],
          target: BANK_CONTRACT,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;

      sdk.util.sumSingleBalance(
        balances,
        `bsc:${poolsInfo[i]}`,
        totalTokenBalance
      );
    } catch (err) {
      console.error(poolsInfo[i], i, err);
    }
  }

  /*** Rabbit DAO TVL Portion: Olympus fork ***/
  let transformAddress = await transformBscAddress();
  await sumTokensAndLPsSharedOwners(
    balances,
    [
      [RABBIT, false],
      [BUSD_RABBIT_MDEX_LP, true],
      [WBNB_RABBIT_Cake_LP, true],
      [RS_RABBIT_Cake_LP, true],
    ],
    [treasuryContractAddress],
    chainBlocks["bsc"],
    "bsc",
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
  misrepresentedTokens: true,
  bsc: {
    staking: staking(rabbitStaking, RS, "bsc"),
    tvl: bscTvl,
  },
  methodology: "Counts TVL on all the Farms through Bank Contract; and the Treasury portion on the Rabbit DAO product",
};
