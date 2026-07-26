/**
 * Retired pools are skipped only after eth_getCode confirms empty bytecode.
 * Generic decode / "no data" RPC errors must not be treated as retired.
 */

async function hasEmptyBytecode(api, address) {
  const target = String(address);

  if (typeof api.getBytecode === 'function') {
    const code = await api.getBytecode(target);
    return code === '0x';
  }

  const provider = api.provider ?? api.api?.provider;
  if (provider && typeof provider.getCode === 'function') {
    const code = await provider.getCode(target);
    return code === '0x';
  }

  return false;
}

module.exports = {
  hasEmptyBytecode,
};
