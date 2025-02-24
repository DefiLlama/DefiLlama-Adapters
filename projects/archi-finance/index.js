const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const CONFIG = {
    vaultInfo: "0x73956FF7375476EBFD5e82d80Ea9065a5bCc3d2b",
    collateralPoolAddress: "0xbd198617aD1dc75B0f7A0A67BbE31993919Cd716",
    fsGlpAddress: ADDRESSES.arbitrum.fsGLP,
    fsGlpHolders: ["0x65C59eE732BD249224718607Ee0EC0e293309923", "0x49EE14e37Cb47bff8c512B3A0d672302A3446eb1"],
    vaults: [
      "0x7674Ccf6cAE51F20d376644C42cd69EC7d4324f4", // weth pool
      "0x179bD8d1d654DB8aa1603f232E284FF8d53a0688", // usdt pool
      "0xa7490e0828Ed39DF886b9032ebBF98851193D79c", // usdc.e pool
      "0xee54A31e9759B0F7FDbF48221b72CD9F3aEA00AB", // wbtc pool
      "0x61Ea41f0BffeE903BB90c69b69d4A833c7fb9d8a", // wstETH pool
      "0xe0eD03E13C6b92D7555c560123Cb48aBE60713fE", // rETH pool
    ]
  }

const abis = {
  underlyingToken: "address:underlyingToken",
  borrowedBalance: "function borrowedBalance(address[] _vaults) view returns (address[], uint256[])"
}

const tvl = async (api) => {
  const { vaults, fsGlpHolders, fsGlpAddress } = CONFIG
  const tokens = await api.multiCall({  abi: abis.underlyingToken, calls: vaults })
  const tokensAndOwners = tokens.map((v, i) => [v, vaults[i]])
  fsGlpHolders.forEach(i => tokensAndOwners.push([fsGlpAddress, i]))
  return sumTokens2({ api, tokensAndOwners})
}

async function borrowed(api) {
  const { vaultInfo, vaults } = CONFIG
  const borrowedBalance = await api.call({ target: vaultInfo, abi: abis.borrowedBalance, params: [vaults], permitFailure: true });
  if (!borrowedBalance) return;
  api.addTokens(borrowedBalance[0], borrowedBalance[1]);
}

module.exports = {
  methodology: "The TVL (Total Value Locked) of ArchiFinance is calculated by adding the total liquidity and borrowing amount.",
  arbitrum: { tvl, borrowed }
}