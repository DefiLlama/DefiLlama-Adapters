const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/solana");
const L1_EZ_ETH_ADDRESS = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";
const L2_EZ_ETH_ADDRESS = ADDRESSES.blast.ezETH;
const L1_LOCKBOX_ADDRESS = "0xC8140dA31E6bCa19b287cC35531c2212763C2059";
const L1_PZ_ETH_ADDRESS = "0x8c9532a60E0E7C6BbD2B2c1303F63aCE1c3E9811";
const SEI_EZ_ETH_ADDRESS = "0x6DCfbF4729890043DFd34A93A2694E5303BA2703";

async function L2Tvl(api) {
  const targetAddress = api.chain === "sei" ? SEI_EZ_ETH_ADDRESS : L2_EZ_ETH_ADDRESS;
  const supply = await api.call({ target: targetAddress, abi: "erc20:totalSupply" });
  return { [L1_EZ_ETH_ADDRESS]: supply };
}

async function ethTvl(api) {
  const totalTvl = await api.call({ target: L1_EZ_ETH_ADDRESS, abi: "erc20:totalSupply" });
  const lockBoxBalance = await api.call({ target: L1_EZ_ETH_ADDRESS, abi: "erc20:balanceOf", params: [L1_LOCKBOX_ADDRESS] })
  const pzEthBalance = await api.call({target: L1_PZ_ETH_ADDRESS, abi: "erc20:totalSupply"});
  api.add(L1_EZ_ETH_ADDRESS, totalTvl - lockBoxBalance);
  api.add(L1_PZ_ETH_ADDRESS, pzEthBalance);
}

async function solanaTvl() {
  return sumTokens2(
    {
      tokenAccounts: [
        "9VBi7unB9Sz5eBNUdvQH2xzUENXvNsaiEkP9p2Cabvsy"
      ]
    }
  )
}

const chains = ["mode", "blast", "bsc", "linea", "arbitrum", "base", "optimism", "fraxtal","zircuit","sei" ]

module.exports = {
  doublecounted: true,
  ethereum: {
    tvl: ethTvl
  },
  solana: {
    tvl: solanaTvl
  }
}

chains.forEach(chain => {
  module.exports[chain] = { tvl: L2Tvl }
})

