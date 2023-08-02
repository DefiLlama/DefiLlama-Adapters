async function tvl(_, _b, _cb, { api, }) {
  const ggAVAX = '0xA25EaF2906FA1a3a13EdAc9B9657108Af7B703e3'
  const token = await api.call({  abi: 'address:asset', target: ggAVAX })
  const bal= await api.call({  abi: 'uint256:totalAssets', target: ggAVAX })
  api.add(token, bal)
}

module.exports = {
  avax: {
    tvl,
  }
}