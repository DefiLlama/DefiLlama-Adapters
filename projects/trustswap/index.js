const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
  "token": "address:token",
  "currentTotalStake": "uint256:currentTotalStake"
}

const staking_contract = "0x5A753021CE28CBC5A7c51f732ba83873D673d8cC";

const assets = [
  // other tokens which probably for some reason was sent to the contract accidentally
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.UNI,
];

const stakingTvl = async (api) => {
  const token = await api.call({  abi: abi.token, target: staking_contract})
  const bal = await api.call({  abi: abi.currentTotalStake, target: staking_contract})
  api.add(token, bal)
};

async function ethTvl(api) {
  return api.sumTokens({ owner: staking_contract, tokens: assets })
}


module.exports = {
  methodology: `Counts SWAP tokens locked int the staking contract(0x5A753021CE28CBC5A7c51f732ba83873D673d8cC). Regular TVL counts UNI, USDT, and USDC that are also in the staking contract(these tokens may have been sent to the contract by accident).`,
  ethereum: {
    tvl: ethTvl,
    staking: stakingTvl
  },
};
