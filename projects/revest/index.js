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
const { utils } = require("@project-serum/anchor");

const HOLDERS = {
  ethereum: "0xA81bd16Aa6F6B25e66965A2f842e9C806c0AA11F",
  polygon: "0x3cCc20d960e185E863885913596b54ea666b2fe7",
  fantom: "0x3923E7EdBcb3D0cE78087ac58273E732ffFb82cf",
  avax: "0x955a88c27709a1EEf4ACa0df0712c67B48240919",
};

const MIN_BLOCK = {
  ethereum: 0,
  polygon: 0,
  fantom: 32894036,
  avax: 0,
};

const eventLog_addresses = {
  fantom: ["0xb80f5a586BC247D993E6dbaCD8ADD211ec6b0cA5"],
};

const tokenAddresses = {
  fantom: { LQDR: "0x10b620b2dbAC4Faa7D7FFD71Da486f5D44cd86f9" },
};

const providers = {
  fantom: "https://rpc.ftm.tools/",
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

  for (var x = 0; x < eventLog_addresses["fantom"].length; x++) {
    let event_balance = await parse_event_logs_for_balance(
      "fantom",
      eventLog_addresses["fantom"][x]
    );

    //TBH i'm not sure this is the intended solution but i'm rolling with it anyways
    balances["fantom:" + eventLog_addresses["fantom"][x]] = ethers.utils
      .parseEther(event_balance.toString())
      .toString();

    console.log(balances);
  }

  return balances;
}

async function parse_event_logs_for_balance(
  network,
  deposit_address,
  token = null
) {
  const provider = new ethers.providers.JsonRpcProvider(providers[network]);

  let abi = [
    "event DepositERC20OutputReceiver(address indexed mintTo, address indexed token, uint amountTokens, uint indexed fnftId, bytes extraData)",
    "event WithdrawERC20OutputReceiver(address indexed caller, address indexed token, uint amountTokens, uint indexed fnftId, bytes extraData)",
  ];

  let balance = 0;

  let deposit_contract = new ethers.Contract(deposit_address, abi, provider);

  let DepositFilter = deposit_contract.filters.DepositERC20OutputReceiver(
    null,
    token,
    null,
    null,
    null
  );
  let WithdrawFilter = deposit_contract.filters.WithdrawERC20OutputReceiver(
    null,
    token,
    null,
    null,
    null
  );

  DepositFilter.fromBlock = WithdrawFilter.fromBlock = MIN_BLOCK["fantom"];
  DepositFilter.toBlock = WithdrawFilter.toBlock = "latest";

  let deposits = await provider.getLogs(DepositFilter);
  let withdrawals = await provider.getLogs(WithdrawFilter);

  let events = deposits.map((log) => deposit_contract.interface.parseLog(log));

  for (let i in events) {
    let txn = events[i];
    balance += Number(ethers.utils.formatEther(txn.args.amountTokens));
  }

  events = withdrawals.map((log) => deposit_contract.interface.parseLog(log));
  for (let i in events) {
    let txn = events[i];
    balance -= Number(ethers.utils.formatEther(txn.args.amountTokens));
  }

  console.log("TOTAL BALANCE: ", balance);

  return balance;
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
