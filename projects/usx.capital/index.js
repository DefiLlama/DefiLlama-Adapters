module.exports = {
  scroll: { tvl: async (api) =>  await api.erc4626Sum({ calls: ['0xcB14BcdF6cD483665D10dfD6f87d908996C7F922'], tokenAbi: 'address:asset', balanceAbi: 'uint256:totalAssets' }) }  
}
