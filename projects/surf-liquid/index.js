const V2_FACTORY = "0x1D283b668F947E03E8ac8ce8DA5505020434ea0E";
const V3_FACTORY = "0xf1d64dee9f8e109362309a4bfbb523c8e54fa1aa";
const SURF_STAKING = "0xB0fDFc081310A5914c2d2c97e7582F4De12FA9d6";
const SURF_TOKEN = "0xcdca2eaae4a8a6b83d7a3589946c2301040dafbf";
const USDC = "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913";
const WETH = "0x4200000000000000000000000000000000000006";
const CBBTC = "0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf";
const ASSETS = [USDC, WETH, CBBTC];
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

async function tvl(api) {
  const tokensAndOwners = [];

  // V2 Vaults: enumerate via factory, read Morpho ERC-4626 positions
  const totalV2 = await api.call({ abi: "uint256:getTotalVaults", target: V2_FACTORY });
  const v2Infos = await api.multiCall({
    abi: "function getVaultInfo(uint256) view returns (address, address, address, uint256, bytes32, uint256)",
    calls: [...Array(Number(totalV2)).keys()].map((i) => ({ target: V2_FACTORY, params: [i] })),
  });
  const v2Owners = v2Infos.map((info) => info[0]);
  const v2MorphoVaults = await api.multiCall({
    abi: "address:currentVault",
    calls: v2Owners.map((target) => ({ target })),
  });
  for (let i = 0; i < v2Owners.length; i++) {
    if (v2MorphoVaults[i] !== ZERO_ADDR) {
      tokensAndOwners.push([v2MorphoVaults[i], v2Owners[i]]);
    }
  }

  // V3 Vaults: discover via event logs, read Morpho ERC-4626 positions per asset
  const currentBlock = api.block || await api.getBlock();
  const v3Logs = await api.getLogs({
    target: V3_FACTORY,
    eventAbi: "event VaultDeployed(address indexed vaultAddress, address indexed owner, address indexed pool, bytes32 marketId, uint256 chainId)",
    onlyArgs: true,
    fromBlock: 38856207,
    toBlock: currentBlock,
  });
  const v3Vaults = v3Logs.map((l) => l.vaultAddress);

  for (const asset of ASSETS) {
    const morphoVaults = await api.multiCall({
      abi: "function assetToVault(address) view returns (address)",
      calls: v3Vaults.map((vault) => ({ target: vault, params: [asset] })),
    });
    for (let i = 0; i < v3Vaults.length; i++) {
      if (morphoVaults[i] && morphoVaults[i] !== ZERO_ADDR) {
        tokensAndOwners.push([morphoVaults[i], v3Vaults[i]]);
      }
    }
  }

  await api.sumTokens({ tokensAndOwners });

  // SURF staking contract
  const totalStaked = await api.call({ abi: "uint256:totalStaked", target: SURF_STAKING });
  api.add(SURF_TOKEN, totalStaked);

  // CreatorBid SURF subscriptions (SURF locked in the token contract)
  const subscribed = await api.call({
    abi: "function balanceOf(address) view returns (uint256)",
    target: SURF_TOKEN,
    params: [SURF_TOKEN],
  });
  api.add(SURF_TOKEN, subscribed);
}

module.exports = {
  methodology: "TVL counts Morpho vault deposits across V2 and V3 Surf Liquid vaults, SURF staked, and CreatorBid SURF subscriptions.",
  base: {
    tvl,
  },
};
