const abi = {
  "getPools": "address[]:getPools",
  "tokensWithAllocation": "address[]:tokensWithAllocation",
  "supply": "function supply(address _token) view returns (uint256)",
  "getVault": "address:getVault",
  "getPoolId": "function getPoolId() view returns (bytes32)",
  "getPoolTokens": "function getPoolTokens(bytes32 poolId) view returns (address[] tokens, uint256[] balances, uint256 lastChangeBlock)"
}
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');

const summit = "0x0ddb88e14494546d07fcd94c3f0ef6d3296b1cd7";
const everest = "0xc687806cfd11b5330d7c3ae6f18b18dc71e1083e";
const cartoasis = "0x8047c5bed363fe1bf458ec3e20e93a3c28a07b8d";
const cartplains = "0x1805922e7f82fc9dbad8e2435c146ba605c4a25d";
const cartmesa = "0x64f8a1dbc20f132159605ad8d7111e75ea702358";
const cartsummit = "0x93af6a3882aaf4112fc404e30277b39452f44cf6";

async function getCarttvl(api, cart) {
  const tokens = await api.call({ abi: abi.getPools, target: cart })
  const bals = await api.multiCall({ abi: abi.supply, calls: tokens, target: cart })
  api.add(tokens, bals)
}

async function tvl(api) {
  await getCarttvl(api, cartoasis)
  await getCarttvl(api, cartplains)
  await getCarttvl(api, cartmesa)
  await getCarttvl(api, cartsummit)
  await sumTokens2({ api, resolveLP: true})
  api.removeTokenBalance(summit)
  api.removeTokenBalance(everest)
}


module.exports = {
  methodology: "TVL is from deposits into the cartographer contracts. Staking TVL is from SUMMIT deposited into EVEREST contract",
  fantom: {
    misrepresentedTokens: true,
    tvl,
    staking: staking(everest, summit)
  }
}