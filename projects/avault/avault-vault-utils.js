const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const vaultsBase = async (chainLocal, vaultAddressArr, block) => {
  const wantedLockedCall = [];
  for (let j = 0; j < vaultAddressArr.length; j++) {
    const vaultAddress = vaultAddressArr[j];
    wantedLockedCall.push({
      target: vaultAddress,
    });
  }

  const [_wantedLocked, _wantedAddresses, _vaultName] = await Promise.all([
    sdk.api.abi.multiCall({
      block: block,
      calls: wantedLockedCall,
      abi: abi.wantLockedTotal,
      chain: chainLocal,
    }),
    sdk.api.abi.multiCall({
      block: block,
      calls: wantedLockedCall,
      abi: abi.wantAddress,
      chain: chainLocal,
    }),
    sdk.api.abi.multiCall({
      block: block,
      calls: wantedLockedCall,
      abi: abi.name,
      chain: chainLocal,
    }),
  ]);
  const wantedLocked = _wantedLocked.output.map((v) => v.output);
  const wantedAddresses = _wantedAddresses.output.map((v) => v.output);
  const vaultName = _vaultName.output.map((v) => v.output);
  return {
    wantedLocked,
    wantedAddresses,
    vaultName,
  };
};

module.exports = {
  vaultsBase,
};
