const ADDRESSES = require('../helper/coreAssets.json')
const { pool2 } = require("../helper/pool2");
const { staking } = require("../helper/staking");

const epsLPStaking = "0x5b74c99aa2356b4eaa7b85dc486843edff8dfdbe";
const proxy = "0xd4d01c4367ed2d4ab5c2f734d640f7ffe558e8a8";
function getFactoryType(factory, token) {
  if (!factory) return 'unknown'

  if (token.toLowerCase() === "0xaf4de8e872131ae328ce21d909c74705d3aaf452")
    return 'unknown'

  if (token.toLowerCase() === "0x5b5bd8913d766d005859ce002533d4838b0ebbb5")
    return 'unknown'

  if ([
    "0x8433533c5B67C4E18FA06935f73891B28a10932b".toLowerCase(),
    "0x9f494C121A932F9Ed575c6c96F885E51Ec6B367b".toLowerCase()
  ].includes(factory.toLowerCase())
  ) return 'type2'

  if ([
    "0xa5d748a3234A81120Df7f23c9Ea665587dc8d871".toLowerCase(),
    "0x41871A4c63d8Fae4855848cd1790ed237454A5C4".toLowerCase(),
    "0xf65BEd27e96a367c61e0E06C54e14B16b84a5870".toLowerCase()
  ].includes(factory.toLowerCase())
  ) return 'type4'
  return 'unknown'
}
async function tvl(api) {
  let addresses = (await api.fetchList({ target: epsLPStaking, itemAbi: abis.registeredTokens, lengthAbi: abis.poolLength })).map(i => i.toLowerCase());
  // const minters = await api.multiCall({ abi: abis.minter, calls: addresses, permitFailure: true, });
  // const factories1 = await api.multiCall({ abi: abis.factory, calls: addresses, permitFailure: true, });
  // const factories2 = await api.multiCall({ abi: abis.factory2, calls: addresses, permitFailure: true, });
  const calls = addresses.map(i => ({ params: [i, proxy] }));
  const bals = await api.multiCall({ target: epsLPStaking, abi: abis.userInfo, calls, });
  api.add(addresses, bals.map(i => i.depositAmount))
  await fix3Stable(api);
  // await fixVal3EPS(api);
  return;
 /*  const totalSupplies = await api.multiCall({ calls: addresses, abi: "erc20:totalSupply" });
  const ratios = totalSupplies.map((supply, i) => +bals[i].depositAmount ? bals[i].depositAmount / supply : 0);
  const epsCalls = addresses.map((token, i) => ({
    ratio: ratios[i],
    token,
    minter: minters[i],
    factory: factories1[i] || factories2[i],
    factoryType: getFactoryType(factories1[i] || factories2[i], token),
    tokenBalance: bals[i].depositAmount
  }))

  epsCalls.filter(i => i.factoryType === 'unknown').forEach(resolveEpsLPUnkwonFactory)
  await resolveEpsLP(api, epsCalls.filter(i => i.factoryType === 'type2'))
  await resolveEpsLP(api, epsCalls.filter(i => i.factoryType === 'type4'))

  function resolveEpsLPUnkwonFactory({ token, ratio, tokenBalance, factory, minter, }) {
    if (+ratio === 0 || !ratio) return;
    if (token.toLowerCase() === "0xaf4de8e872131ae328ce21d909c74705d3aaf452") {
      api.add(ADDRESSES.bsc.BUSD, tokenBalance); // store 3EPS as BUSD
      return;
    }
    if (token.toLowerCase() === "0x5b5bd8913d766d005859ce002533d4838b0ebbb5") {
      api.add("0x5b5bd8913d766d005859ce002533d4838b0ebbb5", tokenBalance);
      return;
    }
    const blacklist = [
      "0xf71a0bcc3ef8a8c5a28fc1bc245e394a8ce124ec",
      "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452"
    ].map(i => i.toLowerCase());
    if (blacklist.includes(token.toLowerCase())) return;
    if (ratio === 0 || isNaN(ratio)) return;
    if (!minter || !factory) return;
  } */
}

async function fix3Stable(api) {
  const stable3 = '0x318aa2a0cb415675b991ec4a9484315dfa6b3886'
  const bal = api.getBalances()['bsc:' + stable3]
  if (!bal) return;
  api.removeTokenBalance(stable3)
  const supply = await api.call({
    target: stable3,
    abi: 'erc20:totalSupply',
  });
  const ratio = bal / supply
  const tokens = await api.multiCall({  abi: 'function coins(uint256) view returns (address)', calls: [0,1,2], target: '0x592b78C69a728b03C02dE9aC5Ed2BCb69E276023'})
  const balances = await api.multiCall({  abi: 'function balances(uint256) view returns (uint256)', calls: [0,1,2], target: '0x592b78C69a728b03C02dE9aC5Ed2BCb69E276023'})
  balances.forEach((balance, i) => {
    api.add(tokens[i], balance * ratio)
  })
}

async function fixVal3EPS(api) {
  const val3EPSKey = "0x5b5bd8913d766d005859ce002533d4838b0ebbb5";
  const balance = api.getBalances()['bsc:' + val3EPSKey];
  api.removeTokenBalance(val3EPSKey)
  const supply = await api.call({
    target: "0x5b5bd8913d766d005859ce002533d4838b0ebbb5",
    abi: "erc20:totalSupply",
  });
  const ratio = balance / supply;
  const params = "0x19EC9e3F7B21dd27598E7ad5aAe7dC0Db00A806d"; // minter
  const calls = [
    { params, target: ADDRESSES.bsc.valBUSD },
    { params, target: ADDRESSES.bsc.valUSDC },
    { params, target: ADDRESSES.bsc.valUSDT }
  ]
  const output = await api.multiCall({ abi: "erc20:balanceOf", calls, });
  output.forEach((v, i) => {
    api.add(calls[i].target, i * ratio);
  });
}

async function resolveEpsLP(api, calls) {
  calls = calls.filter(({ token, ratio, factory, minter, }) => {
    if (+ratio === 0 || !ratio) return false;
    const blacklist = [
      "0xf71a0bcc3ef8a8c5a28fc1bc245e394a8ce124ec",
      "0xaF4dE8E872131AE328Ce21D909C74705d3Aaf452"
    ].map(i => i.toLowerCase());
    if (blacklist.includes(token.toLowerCase())) return false;
    if (!minter || !factory) return false;
    return true;
  })
  if (!calls.length) return;
  const factoryType = calls[0].factoryType;
  const coinsAbi = `function get_coins(address _pool) view returns (address[${factoryType === 'type2' ? 2 : 4}])`;
  const balancesAbi = `function get_balances(address _pool) view returns (uint256[${factoryType === 'type2' ? 2 : 4}])`;
  const minters = calls.map(i => ({ target: i.factory, params: [i.minter] }));
  const coins = await api.multiCall({ abi: coinsAbi, calls: minters })
  const balances = await api.multiCall({ abi: balancesAbi, calls: minters })
  calls.forEach(({ ratio, }) => {
    coins.forEach((coin, i) => {
      balances[i].forEach((val, j) =>
        api.add(coin[j].toLowerCase(), val * ratio)
      );
    });
  })
}



module.exports = {
  bsc: {
    tvl,
    pool2: pool2(
      "0xe8bcccb79b66e49e7f95d576049cf4b23fdbc256",
      "0xc19956eca8a3333671490ef6d6d4329df049dddd",
    ),
    staking: staking(
      "0x51133c54b7bb6cc89dac86b73c75b1bf98070e0d",
      "0x84c97300a190676a19D1E13115629A11f8482Bd1",
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
