const sdk = require("@defillama/sdk");
const utils = require("../helper/utils");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const abiNXMVault = require("./abiNXMVault.json");

const POOL_BUYCOVER_ACTION = "0xcafea35cE5a2fc4CED4464DA4349f81A122fd12b";
const NXM_VAULT = "0x1337DEF1FC06783D4b03CB8C1Bf3EBf7D0593FC4";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";
const NXM = "0xd7c49cee7e9188cca6ad8ff264c1da2e69d4cf3b";
const stETH = "0xae7ab96520de3a18e5e111b5eaab095312d7fe84";

async function ethAddr() {
  return (addr) => {
    return addr;
  };
}

// --- It only provides current, so better grab the addresses and use sdk ---
const endpointFarms = "https://armorfi.info/api/apy";

const ethTvl = async (timestamp, ethBlock) => {
  let balances = {};
  // --- Grab the tokens bal which are being deposited in pool via buyCover ---
  const ethBalPool = (
    await sdk.api.eth.getBalance({
      target: POOL_BUYCOVER_ACTION,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "0x0000000000000000000000000000000000000000",
    ethBalPool
  );

  /*
     Apparently certain portion of the ETH deposited for buying covers are used to be swapped for stETH
     likely for yield
  */
  const stETHBal = (
    await sdk.api.erc20.balanceOf({
      target: stETH,
      owner: POOL_BUYCOVER_ACTION,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, stETH, stETHBal);

  const daiBalPool = (
    await sdk.api.erc20.balanceOf({
      target: DAI,
      owner: POOL_BUYCOVER_ACTION,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, DAI, daiBalPool);

  // --- AUM by the arNXM vault (wNXM bal + stake deposit) ---
  const aum = (
    await sdk.api.abi.call({
      abi: abiNXMVault.aum,
      target: NXM_VAULT,
      block: ethBlock,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, NXM, aum);

  /*
     FarmController(0x0Bdb7976c34aB05E5a9031F258B8956f68ee29cf) does not have a method to catch the lenght of farms so we used API
  */
  let farmsInfo = (await utils.fetchURL(endpointFarms)).data.dailyapys.map(
    (farm) => ({
      contract_address: farm.contract_address,
      token_address: farm.token_address,
    })
  );

  let lpPositions = [];

  const lpReserves = (
    await sdk.api.abi.multiCall({
      block: ethBlock,
      abi: {
        constant: true,
        inputs: [],
        name: "getReserves",
        outputs: [
          { internalType: "uint112", name: "_reserve0", type: "uint112" },
          { internalType: "uint112", name: "_reserve1", type: "uint112" },
          {
            internalType: "uint32",
            name: "_blockTimestampLast",
            type: "uint32",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
      calls: farmsInfo.map((farm) => ({ target: farm.token_address })),
    })
  ).output.map((token) => token.output);

  const nonNull = lpReserves
    .map((el, idx) => {
      if (el != null) return idx;
    })
    .filter((el) => el != null);

  for (let i = 0; i < farmsInfo.length; i++) {
    const bal = (
      await sdk.api.erc20.balanceOf({
        target: farmsInfo[i].token_address,
        owner: farmsInfo[i].contract_address,
        block: ethBlock,
      })
    ).output;

    /*
        Filter out temp the portions which are from 1inch & Balancer, otherwise will trigger errors in 
        unwrapUniswapLPs fnc, built workaround later on
    */
    if (nonNull.includes(i)) {
      lpPositions.push({
        balance: bal,
        token: farmsInfo[i].token_address,
      });
    }
  }

  const transformAdress = await ethAddr();

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    ethBlock,
    "ethereum",
    transformAdress
  );

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};
