const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const BigNumber = require("bignumber.js");

const constant = {
  capitalStakePool: {
    address: "0xB98eD9800fCD2982d26Cf0E4a6B53C96bbeff6A6",
  },
  stakePool: {
    address: "0x1a66f065303299d78693f122c800Ab3dEbE9c966",
  },
  buyPool: {
    address: "0x702aff99b08e8891fc70811174701fb7407b4477",
  },
  surplusPool: {
    address: "0x80e711b29e46d430ff1553eb2ada670e2a25593c",
  },
  treasuryPool: {
    address: "0xfd0D28539aeD12477dcba1575eB40fca53969440",
  },
};

async function purchase(block) {
  let weth = ADDRESSES.ethereum.WETH;
  let _purchasePool;
  const [surplus, treasury] = await Promise.all([
    sdk.api.abi.call({
      block,
      target: weth,
      abi: abi["balanceOf"],
      params: constant.surplusPool.address,
    }),

    sdk.api.abi.call({
      block,
      target: weth,
      abi: abi["balanceOf"],
      params: constant.treasuryPool.address,
    }),
  ]);

  _purchasePool = BigNumber(surplus.output).plus(BigNumber(treasury.output)).toFixed();

  return { [weth]: _purchasePool };

}

async function underwriting(block) {
  let nsure = '0x20945ca1df56d237fd40036d47e866c7dccd2114';
  let balanceOf;
  balanceOf = await sdk.api.abi.call({
    block,
    target: nsure,
    abi: abi["balanceOf"],
    params: constant.stakePool.address,
  });
  balanceOf = balanceOf.output

  return { [nsure]: balanceOf }
}

async function startEth(block) {
  let capitalAddr = '0xa6b658Ce4b1CDb4E7d8f97dFFB549B8688CAFb84'
  let ethAddr = ADDRESSES.null
  let trueBalance = 0;
  let _ethBalance = await sdk.api.eth.getBalance({ target: capitalAddr, block: block });

  let _totalSupply = await sdk.api.abi.call({
    block,
    target: capitalAddr,
    abi: abi["totalSupply"],
  });
  let _poolBalance = await sdk.api.abi.call({
    block,
    target: capitalAddr,
    abi: abi["balanceOf"],
    params: constant.capitalStakePool.address
  });
  _totalSupply = BigNumber(_totalSupply.output);
  _ethBalance = BigNumber(_ethBalance.output);
  _poolBalance = BigNumber(_poolBalance.output);
  trueBalance = _ethBalance.times(_poolBalance).div(_totalSupply).toFixed();


  return { [ethAddr]: trueBalance }
}

async function tvl(timestamp, block) {
  let ethPool = await startEth(block);
  let underwritingPool = await underwriting(block);
  let purchasePool = await purchase(block);
  let balances = {
    ...purchasePool,
    ...underwritingPool,
    ...ethPool
  }

  return balances;
}

module.exports = {
  start: '2021-04-22', // Thu Apr 22 2021 16:46:35
  ethereum: { tvl }
};

