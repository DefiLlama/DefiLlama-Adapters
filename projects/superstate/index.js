const ADDRESSES = require("../helper/coreAssets.json");
const { getTokenSupplies } = require("../helper/solana");
const USTB = "0x43415eb6ff9db7e26a15b704e7a3edce97d31c4e";
const USTB_SOL = "CCz3SGVziFeLYk2xfEstkiqJfYkjaSWb2GCABYsVcjo2";

async function tvl(api) {
  const totalSupplies = await api.call({
    target: USTB,
    abi: "erc20:totalSupply",
  });
  api.add(USTB, totalSupplies);
}

async function tvl_plume(api) {
  const totalSupplies = await api.call({
    target: ADDRESSES.plume_mainnet.USTB,
    abi: "erc20:totalSupply",
  });
  api.add(ADDRESSES.plume_mainnet.USTB, totalSupplies);
}

async function tvl_solana(api) {
  const totalSupplies = await getTokenSupplies([USTB_SOL], api);
  api.addCGToken("superstate-short-duration-us-government-securities-fund-ustb", totalSupplies[USTB_SOL] / 1e6)
}

module.exports = {
  methodology: "TVL corresponds to the total amount of USTB minted onchain, does not include Superstate book-entry AUM",
  ethereum: {
    tvl: tvl
  },
  plume_mainnet: {
    tvl: tvl_plume
  },
  solana:{
    tvl: tvl_solana
  }
};