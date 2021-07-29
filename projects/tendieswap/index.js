const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { transformBscAddress } = require("../helper/portedTokens");
const web3 = require("web3");
const MASTERCHEF_CONTRACT = "0x6dDb25ca46656767f8f2385D653992dC1cdb4470";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  let tendie;
  let total=0;
  let tokenAddress;
  const poolLength = (
    await sdk.api.abi.call({
      abi: abi.poolLength,
      target: MASTERCHEF_CONTRACT,
      chain: "bsc",
      block: chainBlocks["bsc"],
    })
  ).output;


  const lpPositions = [];

  for (let index = 0; index < poolLength; index++) {
    const token = (
      await sdk.api.abi.call({
        abi: abi.poolInfo,
        target: MASTERCHEF_CONTRACT,
        params: index,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output[0];
    const token_bal = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: token,
        params: MASTERCHEF_CONTRACT,
        chain: "bsc",
        block: chainBlocks["bsc"],
      })
    ).output;
    if (index == 0) {
      tendie = token_bal;
      tokenAddress = token;
      continue;
    }

    lpPositions.push({
      token,
      balance: token_bal,
    });
  }

  const transformAddress = await transformBscAddress();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );
  sdk.util.sumSingleBalance(balances, `bsc:${tokenAddress}`, tendie);
  for (const [key, value] of Object.entries(balances)) {

    if (
      String(key).toLowerCase() ==
      "bsc:0x9853A30C69474BeD37595F9B149ad634b5c323d9".toLowerCase()
    ) {
      let val = web3.utils.fromWei(String(value));
      val = parseFloat(val);
      total += val;
    }
  }
  balances["bsc:0x9853a30c69474bed37595f9b149ad634b5c323d9"] = web3.utils.toWei(
    String(total)
  );
  delete balances["bsc:0x9853A30C69474BeD37595F9B149ad634b5c323d9"];
  
  return balances;
};

module.exports = {
  bsc: {
    tvl: bscTvl,
  },
  tvl: sdk.util.sumChainTvls([bscTvl]),
};
