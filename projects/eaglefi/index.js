const { queryKey, getAddresssDataStoreKeys, bytesToStr, bytesToBigInt } = require('../helper/chain/massa.js');
const { sumTokens2 } = require('../helper/unwrapLPs.js');


const registryAddress = "AS1NYihs2Wy4D4P68JGY2hYSDDaqZ5YxhM2nDRsJVFZUykEEdSAW";


async function getAllPoolsAddresses(registryAddress) {

  const registryKeys = await getAddresssDataStoreKeys(registryAddress, "", true);
  const poolsAddresses = [];

  const transform = val => {
    const arg = new Uint8Array(val);

    const start_offset = 4;
    let end_offset = start_offset + 62;
    const p = arg.slice(start_offset, end_offset);
    let poolAddressPlus = bytesToStr(p);
    poolAddressPlus = "AS" + poolAddressPlus.split("AS")[1];
    const poolAddress = poolAddressPlus.slice(0, poolAddressPlus.length - 1);

    return poolAddress;
  }

  for (const serializedKey of registryKeys) {
    const key = bytesToStr(serializedKey);

    if (!key.startsWith("pools")) {
      continue;
    }

    // Query that key to get the pools address
    let poolAddress = await queryKey([registryAddress], key, transform);
    poolsAddresses.push(poolAddress.toString());
  }


  return poolsAddresses;
}


async function tvl(
  api
) {
  const poolsAddresses = await getAllPoolsAddresses(registryAddress);


  for (const poolAddress of poolsAddresses) {
    const aReserve = await queryKey([poolAddress], "aTokenReserve", val => bytesToBigInt(val));
    const bReserve = await queryKey([poolAddress], "bTokenReserve", val => bytesToBigInt(val));

    const aToken = await queryKey([poolAddress], "tokenA");
    const bToken = await queryKey([poolAddress], "tokenB");

    api.add(aToken, aReserve)
    api.add(bToken, bReserve)
  }

  return sumTokens2({ api })
}

module.exports = {
  timetravel: false,
  massa: { tvl, }
};