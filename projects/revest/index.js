const { default: axios } = require("axios");
const {
  sumTokensAndLPsSharedOwners,
  addTokensAndLPs,
} = require("../helper/unwrapLPs");
const {
  transformFantomAddress,
  transformAvaxAddress,
  transformPolygonAddress,
} = require("../helper/portedTokens.js");

const { ethers } = require("ethers");

const HOLDERS = {
  ethereum: "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F",
  polygon: "0x3cCc20d960e185E863885913596b54ea666b2fe7",
  fantom: "0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf",
  avax: "0x955a88c27709a1EEf4ACa0df0712c67B48240919",
};

async function mainnetTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address"
  );
  const balances = {};
  await calculateTVL(tokenRes, balances, block);
  return balances;
}

async function polygonTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=137"
  );
  const balances = {};
  const transform = await transformPolygonAddress();
  await calculateTVL(tokenRes, balances, block, "polygon", transform);
  return balances;
}

async function fantomTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=250"
  );

  const balances = {};
  const transform = await transformFantomAddress();
  await calculateTVL(tokenRes, balances, block, "fantom", transform);

  console.log(balances);

  const provider = new ethers.providers.JsonRpcProvider(process.env.FANTOM_RPC);

  tokenAddress = process.env.TOKENADDRESS; //requires .env file updates

  abi = [
    "event DepositERC20OutputReceiver(address caller, address token, uint256 amountTokens, uint256 fnftId, bytes extraData)",
    "event WithdrawERC20OutputReceiver(address mintTo,  address token, uint256 amountTokens, uint256 fnftId, bytes extraData)",
  ];

  deposit_contract = new ethers.Contract(tokenAddress, abi, provider);

  const deposit_event =
    deposit_contract.interface.events.DepositERC20OutputReceiver;
  const withdraw_event =
    deposit_contract.interface.events.WithdrawERC20OutputReceiver;

  //Acquire logs from tokenAddress based on event signature
  const logs = await provider.getLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: tokenAddress,
    topic: [deposit_event, withdraw_event],
  });

  deposit_balance = 0;
  withdrawal_balance = 0;

  logs.forEach((element) => {
    if (
      element["topics"][0] ==
      "0x5bed1f834b92cc21cec09497afa47d36952b8a037e988eca6e9ecffeb497b227"
    ) {
      tokenVal = parseInt(element["data"].substring(2, 66), 16) / 10 ** 18; //convert to whole-tokens
      deposit_balance += tokenVal;
    }

    //withdrawal-topic-signature
    else if (
      element["topics"][0] ==
      "0xf2b6e7f64080f438239b56473f2cd92b33165c88688fd898e1d99082bd0eb954"
    ) {
      tokenVal = parseInt(element["data"].substring(2, 66), 16) / 10 ** 18; //convert to whole-tokens
      withdrawal_balance += tokenVal;
    }
  });

  tvl = Number(deposit_balance - withdrawal_balance).toString();
  balance = ethers.BigNumber.from(
    Math.ceil(deposit_balance - withdrawal_balance)
  ).toString();

  //TBH i'm not sure this is the intended solution but i'm rolling with it anyways
  balances["fantom:" + tokenAddress] = balance;

  console.log(balances);

  return balances;
}

async function avaxTVL(time, block) {
  const tokenRes = await axios.get(
    "https://defi-llama-feed.vercel.app/api/address?chainId=43114"
  );
  const balances = {};
  const transform = await transformAvaxAddress();
  await calculateTVL(tokenRes, balances, block, "avax", transform);
  return balances;
}

function sumTvl(tvlList = []) {
  return async (...args) => {
    const results = await Promise.all(tvlList.map((fn) => fn(...args)));
    return results.reduce((a, c) => Object.assign(a, c), {});
  };
}

async function calculateTVL(
  tokenRes,
  balances,
  block,
  network = "ethereum",
  transform = (id) => id
) {
  let amountPrim = {};
  let holder = HOLDERS[network];
  await sumTokensAndLPsSharedOwners(
    amountPrim,
    tokenRes.data.body.map((t) => [t, false]),
    [holder],
    block[network],
    network,
    transform
  );
  amountPrim = Object.entries(amountPrim);
  const amounts = {
    output: amountPrim.map((element) => {
      return { output: element[1] };
    }),
  };
  const tokens = {
    output: tokenRes.data.body.map((element) => {
      return { output: element };
    }),
  };
  await addTokensAndLPs(
    balances,
    tokens,
    amounts,
    block[network],
    network,
    transform
  );
}

module.exports = {
  methodology: "We list all tokens in our vault and sum them together",

  ethereum: {
    tvl: mainnetTVL,
  },
  polygon: {
    tvl: polygonTVL,
  },
  fantom: {
    tvl: fantomTVL,
  },
  avalanche: {
    tvl: avaxTVL,
  },
  tvl: sumTvl([mainnetTVL, polygonTVL, fantomTVL, avaxTVL]),
};
