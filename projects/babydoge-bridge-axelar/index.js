const BSC_BRIDGE = "0x9F0d4f965F8d7503046093F1BdA6052eFE6948b8";
const BSC_TOKEN = "0xc748673057861a797275CD8A068AbB95A902e8de"; // BabyDoge

const BASE_BRIDGE = "0x7d77aC40BF16fF72DF9f48266F8e115aA1Bc30F7";
const BASE_TOKEN = "0x58ecEF26335Af7b04A998105a6603B0Dc475aF33"; // BabyDoge

async function bscTvl(api) {
  const vault = await api.call({ abi: "address:vault", target: BSC_BRIDGE });
  return api.sumTokens({ owners: [vault], tokens: [BSC_TOKEN] });
}

async function baseTvl(api) {
  const vault = await api.call({ abi: "address:vault", target: BASE_BRIDGE });
  const balance = await api.call({ abi: "erc20:balanceOf", target: BASE_TOKEN, params: [vault] });
  // Map to BSC token for pricing (same token, different chain)
  api.add(`bsc:${BSC_TOKEN}`, balance, { skipChain: true });
}

module.exports = {
  methodology: "Tracks BabyDoge tokens locked in BSC-Base Axelar bridge vaults",
  bsc: { tvl: bscTvl },
  base: { tvl: baseTvl },
};

