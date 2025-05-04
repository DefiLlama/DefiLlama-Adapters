const VAULT_CONTRACT = "0xb68e430c56ed9e548e864a68a60f9d41f993b32c";


async function tvl(api) {
  const [_, tokens]= await api.call({  abi: 'function getInputToken() view returns (address[], address[])', target: VAULT_CONTRACT})
  const uTokens = await api.call({  abi: 'address[]:getUTokens', target: VAULT_CONTRACT})
  return api.sumTokens({ owner: VAULT_CONTRACT, tokens: uTokens.concat(tokens) })
}

module.exports = {
  methodology:  'value of tokens in the vault',
  ethereum: {
    tvl,
  },
};
