const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking");
const { transformBalances } = require("../helper/portedTokens");
const sdk = require("@defillama/sdk");
const chain = "bsc";

const epsLPStaking = "0x5b74c99aa2356b4eaa7b85dc486843edff8dfdbe";
const proxy = "0xd4d01c4367ed2d4ab5c2f734d640f7ffe558e8a8";
async function tvl(_, _b, { bsc: block }) {
  let addresses = (await sdk.api2.abi.fetchList({
    withMetadata: true,
    target: epsLPStaking,
    chain,
    block,
    itemAbi: abis.registeredTokens,
    lengthAbi: abis.poolLength
  })).map(i => i.output);
  const calls = addresses.map(i => ({ params: [i, proxy] }));
  const { output: bals } = await sdk.api.abi.multiCall({
    target: epsLPStaking,
    abi: abis.userInfo,
    calls,
    chain,
    block
  });
  const { output: totalSupplies } = await sdk.api.abi.multiCall({
    chain,
    block,
    calls: addresses.map(i => ({ target: i })),
    abi: "erc20:totalSupply"
  });
  const ratios = totalSupplies.map(
    (supply, i) =>
      +bals[i].output.depositAmount
        ? bals[i].output.depositAmount / supply.output
        : 0
  );
  const balances = {};
  await Promise.all(
    addresses.map((token, i) =>
      resolveEpsLP({
        ratio: ratios[i],
        token,
        block,
        balances,
        tokenBalance: bals[i].output.depositAmount
      })
    )
  );
  await fixVal3EPS(block, balances);
  return transformBalances(chain, balances);
}

async function fixVal3EPS(block, balances) {
  const val3EPSKey = "0x5b5bd8913d766d005859ce002533d4838b0ebbb5";
  const balance = balances[val3EPSKey];
  delete balances[val3EPSKey];
  const { output: supply } = await sdk.api.abi.call({
    target: "0x5b5bd8913d766d005859ce002533d4838b0ebbb5",
    abi: "erc20:totalSupply",
    chain,
    block
  });
  const ratio = balance / supply;
  const params = "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d"; // minter
  const { output } = await sdk.api.abi.multiCall({
    abi: "erc20:balanceOf",
    calls: [
      { params, target: ADDRESSES.bsc.valBUSD },
      { params, target: ADDRESSES.bsc.valUSDC },
      { params, target: ADDRESSES.bsc.valUSDT }
    ],
    chain,
    block
  });
  output.forEach(i => {
    sdk.util.sumSingleBalance(balances, i.input.target, i.output * ratio);
  });
}

async function resolveEpsLP({
  block,
  balances,
  token,
  ratio,
  tokenBalance
}) {
  if (token.toLowerCase() === "0xaf4de8e872131ae328ce21d909c74705d3aaf452") {
    sdk.util.sumSingleBalance(
      balances,
      ADDRESSES.bsc.BUSD,
      tokenBalance
    ); // store 3EPS as BUSD
    return;
  }
  if (token.toLowerCase() === "0x5b5bd8913d766d005859ce002533d4838b0ebbb5") {
    sdk.util.sumSingleBalance(
      balances,
      "0x5b5bd8913d766d005859ce002533d4838b0ebbb5",
      tokenBalance
    );
    return;
  }
  const blacklist = [
    "0xf71a0bcc3ef8a8c5a28fc1bc245e394a8ce124ec",
    "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452"
  ].map(i => i.toLowerCase());
  if (blacklist.includes(token.toLowerCase())) return;
  if (ratio === 0 || isNaN(ratio)) return;
  let factory;
  let minter;
  try {
    factory = (await sdk.api.abi.call({ target: token, abi: abis.factory, chain, block })).output
  } catch {
    factory = (await sdk.api.abi.call({ target: token, abi: abis.factory2, chain, block })).output
  }
  try {
    minter = (await sdk.api.abi.call({ target: token, abi: abis.minter, chain, block })).output
  } catch {
    return
  }
 // node test.js projects/dotdot/index.js
  if (
    [
      "0x8433533c5B67C4E18FA06935f73891B28a10932b".toLowerCase(),
      "0x9f494C121A932F9Ed575c6c96F885E51Ec6B367b".toLowerCase()
    ].includes(factory.toLowerCase())
  ) {
    const { output: coins } = await sdk.api.abi.call({
      target: factory,
      abi: 'function get_coins(address _pool) view returns (address[2])',
      chain,
      block,
      params: minter
    });
    const { output: bal } = await sdk.api.abi.call({
      target: factory,
      abi: 'function get_balances(address _pool) view returns (uint256[2])',
      chain,
      block,
      params: minter
    });
    bal.forEach((val, i) =>
      sdk.util.sumSingleBalance(balances, coins[i].toLowerCase(), val * ratio)
    );
    return;
  }
  if (
    [
      "0xa5d748a3234A81120Df7f23c9Ea665587dc8d871".toLowerCase(),
      "0x41871A4c63d8Fae4855848cd1790ed237454A5C4".toLowerCase(),
      "0xf65BEd27e96a367c61e0E06C54e14B16b84a5870".toLowerCase()
    ].includes(factory.toLowerCase())
  ) {
    const { output: coins } = await sdk.api.abi.call({
      target: factory,
      abi: 'function get_coins(address _pool) view returns (address[4])',
      chain,
      block,
      params: minter
    });
    const { output: bal } = await sdk.api.abi.call({
      target: factory,
      abi: 'function get_balances(address _pool) view returns (uint256[4])',
      chain,
      block,
      params: minter
    });
    bal.forEach((val, i) =>
      sdk.util.sumSingleBalance(balances, coins[i].toLowerCase(), val * ratio)
    );
  }
}

module.exports = {
  bsc: {
    tvl,
    pool2: pool2(
      "0xe8bcccb79b66e49e7f95d576049cf4b23fdbc256",
      "0xc19956eca8a3333671490ef6d6d4329df049dddd",
      chain
    ),
    staking: staking(
      "0x51133c54b7bb6cc89dac86b73c75b1bf98070e0d",
      "0x84c97300a190676a19D1E13115629A11f8482Bd1",
      chain
    )
  }
};

const abis = {
  poolLength: "uint256:poolLength",
  registeredTokens: "function registeredTokens(uint256) view returns (address)",
  factory: "address:factory",
  factory2: "address:factory",
  minter: "address:minter",
  getNCoins: "function get_n_coins(address _pool) view returns (uint256)",
  userInfo: "function userInfo(address, address) view returns (uint256 depositAmount, uint256 adjustedAmount, uint256 rewardDebt, uint256 claimable)",
  getLpToken: "function get_lp_token(address arg0) view returns (address)",
}
