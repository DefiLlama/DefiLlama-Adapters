const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");

const abi = require("./abi.json");

const ENDPOINT_RABBIT_FINANCE =
  "https://api.covalenthq.com/v1/56/address/0xc18907269640D11E2A91D7204f33C5115Ce3419e/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6";

const BANK_CONTRACT = "0xc18907269640D11E2A91D7204f33C5115Ce3419e";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  let poolsInfo = (
    await utils.fetchURL(ENDPOINT_RABBIT_FINANCE)
  ).data.data.items.map((addr) => ({
    contract_address: addr.contract_address,
  }));

  for (let i = 0; i < poolsInfo.length; i++) {
    try {
      const totalTokenBalance = (
        await sdk.api.abi.call({
          abi: abi.totalToken,
          params: [poolsInfo[i].contract_address],
          target: BANK_CONTRACT,
          chain: "bsc",
          block: chainBlocks["bsc"],
        })
      ).output;

      sdk.util.sumSingleBalance(
        balances,
        `bsc:${poolsInfo[i].contract_address}`,
        totalTokenBalance
      );
    } catch (err) {
      console.error(poolsInfo[i].contract_address, i, err);
    }
  }

  /* 
    A piece of TVL is atm 405k from the Boardroom, but I think should be not counted
    as it is simply issuing their own token and deposited over there.
    Another portion is "stake", which is double counting the same token where deposited
    in vault, since on depositing they gave ibX token, then this is staked...
  */

  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
