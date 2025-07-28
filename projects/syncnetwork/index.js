const { pool2 } = require("../helper/pool2");

const syncToken = "0xB6ff96B8A8d214544Ca0dBc9B33f7AD6503eFD32" // SYNC
const uniPair = "0xFb2F545A9AD62F38fe600E24f75ecD790d30a7Ba"; // SYNC-ETH PAIR
const cBond = "0xC6c11F32D3ccC3BEaac68793bC3BFBe82838ca9F"; // CBOND contract

async function staking(api) {
  let lockedSync = await api.call({    target: cBond,    abi: "uint256:totalSYNCLocked"  });
  api.add(syncToken, lockedSync);
}

module.exports = {
  methodology:"Pool2 is the SYNC-ETH pair on UNI and staking according to their FAQ are SYNC tokens locked into CBOND contracts",
  ethereum:{
    pool2: pool2('0xc6c11f32d3ccc3beaac68793bc3bfbe82838ca9f', uniPair),
    staking,
    tvl: async () => ({}),
  }
};
