const { getMultipleAccounts, decodeAccount } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");

async function staking(api) {
  const programId = new PublicKey('6HW8dXjtiTGkD4jzXs7igdFmZExPpmwUrRN5195xGup')
  const accountKey = getKey(programId);
  const [account] = await getMultipleAccounts([accountKey]);
  const decoded = decodeAccount('access', account);
  api.add(decoded.tokenMint.toBase58(), decoded.totalStaked);
}

const getKey = (address) => {
  return PublicKey.findProgramAddressSync([address.toBuffer()], address)[0].toBase58();
}

module.exports = {
  timetravel: false,
  methodology:
    "Uses the Access Protocol SDK to fetch the total supply of staked ACS tokens",
  solana: {
    tvl: async () => ({}),
    staking,
  },
};
