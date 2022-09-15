const sdk = require("@defillama/sdk");
const { addFundsInMasterChef } = require("../helper/masterchef");
const BigNumber = require("bignumber.js");
const usdtAddr = "0x55d398326f99059ff775485246999027b3197955";
const busdAddr = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
const usdtBusd = "0xEF7ae734a1E522498DF44d68853E9329674d51D5";
const ethAddr = "0x2170ed0880ac9a755fd29b2688956bd959f933f8";
const wBNBAddr = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const paraChef = "0x77341bF31472E9c896f36F4a448fdf573A0D9B60";
const poolInfo = {
  "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
  "name": "poolInfo",
  "outputs": [{ "internalType": "contract IERC20", "name": "lpToken", "type": "address" }, {
    "internalType": "uint256",
    "name": "allocPoint",
    "type": "uint256"
  }, { "internalType": "uint256", "name": "lastRewardBlock", "type": "uint256" }, {
    "internalType": "uint256",
    "name": "accT42PerShare",
    "type": "uint256"
  }, { "internalType": "contract IParaTicket", "name": "ticket", "type": "address" }, {
    "internalType": "uint256",
    "name": "pooltype",
    "type": "uint256"
  }],
  "stateMutability": "view",
  "type": "function"
};

async function tvl(timestamp, block, chainBlocks) {
  let balances = {};
  //Some tokens are ignored because we modified the logic that a token can only create a pool.
  //It will only be added once below to prevent repeated calculations
  await addFundsInMasterChef(balances, paraChef, chainBlocks.bsc, "bsc", addr => `bsc:${addr}`, poolInfo, [
    usdtAddr,
    usdtBusd,
    ethAddr,
    wBNBAddr,
    busdAddr,
    "0x5976815f279D8bF22748f75072887591e1f65264",
    "0xcDD33E0A056470E281a03B1d1f3Ef05334f9dBE1",
    "0x781f5D719Dcd59B6eE01aDEE6170750DC9132247"

  ], true, false, V42);
  //add usdt pool
  let usdtBalance0 = (await sdk.api.erc20.balanceOf({
    target: usdtAddr,
    owner: paraChef,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${usdtAddr}`, usdtBalance0);
  //add usdt of usdt-busd
  let usdtBalance1 = (await sdk.api.erc20.balanceOf({
    target: usdtAddr,
    owner: usdtBusd,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${usdtAddr}`, usdtBalance1);
  //add busd of usdt-busd
  let busdBalance = (await sdk.api.erc20.balanceOf({
    target: busdAddr,
    owner: usdtBusd,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${busdAddr}`, busdBalance);
  //add eth
  let ethBalance = (await sdk.api.erc20.balanceOf({
    target: ethAddr,
    owner: paraChef,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${ethAddr}`, ethBalance);
  //add wbnb
  let wbnbBalance = (await sdk.api.erc20.balanceOf({
    target: wBNBAddr,
    owner: paraChef,
    block: chainBlocks.bsc,
    chain: "bsc"
  })).output;
  sdk.util.sumSingleBalance(balances, `bsc:${wBNBAddr}`, wbnbBalance);
  return balances;
}


const pool2Addresses = [
  //BTCB_V42
  "0x7Bdc1963CA77f22C0c4829182876EBB2478e6380",
  //BUSD_V42
  "0xdbbDF41929d65c974C13c979A87B235377897DF9",
  //BNB_V42
  "0x478d1721f6FA74124C281CB17744249F51D55BC5"
];

const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const V42 = "0xA573cD6890b50E02Dd658164882ee7B6A86C1122";

async function pool2(time, ethBlock, chainBlocks) {
  const balances = {};

  for (let idx = 0; idx < pool2Addresses.length; idx++) {
    const balances_slp = (
      await sdk.api.abi.call({
        abi: 'erc20:balanceOf',
        target: pool2Addresses[idx],
        params: paraChef,
        chain: "bsc",
        block: chainBlocks["bsc"]
      })
    ).output;

    const totalSupply_slp = (
      await sdk.api.erc20.totalSupply({
        target: pool2Addresses[idx],
        chain: "bsc",
        block: chainBlocks["bsc"]
      })
    ).output;

    const underlyingsBalance = (
      await sdk.api.abi.multiCall({
        calls: [BTCB, BUSD, WBNB, V42].map((token) => ({
          target: token,
          params: pool2Addresses[idx]
        })),
        abi: 'erc20:balanceOf',
        chain: "bsc",
        block: chainBlocks["bsc"]
      })
    ).output;

    underlyingsBalance.forEach((call) => {
      const underlyingSetBalance = BigNumber(call.output)
        .times(balances_slp)
        .div(totalSupply_slp);

      sdk.util.sumSingleBalance(
        balances,
        `bsc:${call.input.target}`,
        underlyingSetBalance.toFixed(0)
      );
    });
  }

  return balances;
}

module.exports = {
  start: 1651408734,
  bsc: {
    tvl: tvl,
    pool2: pool2
  }
};
