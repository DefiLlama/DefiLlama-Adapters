const { getBalance2 } = require('../helper/chain/cosmos');

// Sai USDC: minted on Nibiru against USDC held in the Teller hub on Base
const SAI_USDC = '0x357c97796aA8e2A6b5A64b1Fc19d5baB9668E190';
const SAI_USDC_DENOM = `erc20/${SAI_USDC}`;

const SAI_EVM = '0x25589C8071fa10B7a8c62CdCA7035c539242A774';
// Wasm precompile address on Nibiru
const WASM_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000000802';

async function tvl(api) {
  const perp = await api.call({
    target: SAI_EVM,
    abi: 'function perpContractAddress() view returns (string)',
  });

  // the reserves query is only used to discover the configured USDC vaults
  const reservesBytes = await api.call({
    target: WASM_PRECOMPILE_ADDRESS,
    abi: 'function query(string contractAddr, bytes req) view returns (bytes)',
    params: [perp, `0x${Buffer.from(JSON.stringify({ get_sai_reserves: {} })).toString('hex')}`],
  });
  const { vaults } = JSON.parse(Buffer.from(reservesBytes.slice(2), 'hex').toString('utf8'));

  const owners = [perp, ...vaults.map(vault => vault.slp_addr)];
  for (const owner of owners) {
    const balances = await getBalance2({ owner, tokens: [SAI_USDC_DENOM], chain: api.chain });
    api.add(SAI_USDC, balances[SAI_USDC_DENOM.replaceAll('/', ':')] ?? 0);
  }
}

module.exports = {
  methodology: 'Counts the Sai USDC held by the Perp contract and its configured USDC vaults on Nibiru.',
  nibiru: { tvl },
};
