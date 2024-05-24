const superform_chains = ["ethereum", "polygon", "bsc", "avax", "arbitrum", "optimism", "base", "fantom"];
const factory_contract = "0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC";
const fantom_factory_contract = "0xbc85043544CC2b3Fd095d54b6431822979BBB62A";

async function tvl(api) {
  const forms = await api.fetchList({ lengthAbi: 'getSuperformCount', itemAbi: "function superforms(uint256) external view returns(uint256)", target: api.chainId === 250 ? fantom_factory_contract : factory_contract })
  const getSuperformRes = await api.multiCall({ abi: "function getSuperform(uint256) external view returns(address, uint32, uint64)", calls: forms, target: api.chainId === 250 ? fantom_factory_contract : factory_contract })
  const super4626 = getSuperformRes.map(v => v[0])
  const vaults = await api.multiCall({ abi: 'address:vault', calls: super4626 })
  const assets = await api.multiCall({ abi: 'address:asset', calls: super4626 })
  const vBals = await api.multiCall({ abi: "erc20:balanceOf", calls: vaults.map((v, i) => ({ target: v, params: super4626[i] })) })
  const bals = await api.multiCall({ abi: "function previewRedeemFrom(uint256) external view returns(uint256)", calls: super4626.map((v, i) => ({ target: v, params: vBals[i] })), permitFailure: true })
  bals.forEach((bal, i) => {
    if (bal) api.add(assets[i], bal)
  })
}

module.exports = {
  methodology: "counts the TVL of each superform across all the supported networks",
};

superform_chains.forEach(chain => module.exports[chain] = { tvl })