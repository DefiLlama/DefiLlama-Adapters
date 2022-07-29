const {
  PublicKey,
} = require("@solana/web3.js");
const { Program, web3, utils } = require("@project-serum/anchor");
const DualIdl = require("./idl.json");
const axios = require("axios");
const { MintLayout } = require("@solana/spl-token")
const { toUSDTBalances } = require("../helper/balances");
const { getConnection, getProvider, } = require("../helper/solana");

async function getPriceWithTokenAddress(mintAddress) {
  const { data } = await axios.post("https://coins.llama.fi/prices", {
    coins: mintAddress.map((a) => `solana:${a}`),
  });
  return data.coins;
}

function toBytes(x) {
  let y = Math.floor(x / 2 ** 32);
  return Uint8Array.from(
    [y, y << 8, y << 16, y << 24, x, x << 8, x << 16, x << 24].map(
      (z) => z >>> 24
    )
  );
}

async function tvl() {
  const connection =  getConnection();
  const anchorProvider = getProvider();
  const dualProgramID = new PublicKey(
    "DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki"
  );
  const VAULT_MINT_ADDRESS_SEED = "vault-mint";
  const program = new Program(DualIdl, dualProgramID, anchorProvider);

  const prices = await getPriceWithTokenAddress([
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // BTC
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // ETH
    "So11111111111111111111111111111111111111112", // SOL
  ]);

  let programAccounts = await program.account.priceAndExpiration.all();

  let mints = [];
  let mintToSplToken = {};
  for (const account of programAccounts) {
    // Expired vaults do not count for tvl
    if (account.account.expiration * 1000 < Date.now()) {
      continue;
    }

    const [vaultTokenMint, _vaultMintBump] =
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode(VAULT_MINT_ADDRESS_SEED)),
          toBytes(Number(account.account.strikePrice)),
          toBytes(Number(account.account.expiration)),
          account.account.splMint.toBuffer(),
        ],
        dualProgramID
      );
    mintToSplToken[vaultTokenMint] = account.account.splMint;
    mints.push(vaultTokenMint);
  }

  let tvl = 0.0;

  // Each vault token is redeemable for one locked token of that type.
  const mintInfos = await getMultipleMintInfo(connection, mints);
  for (const mintInfo of mintInfos) {
    const key = mintInfo.key;
    const supply = mintInfo.data.supply;
    const tokenName = mintToSplToken[key];
    const vaultTvl =
      (Number(supply) / 10 ** 6) *
      prices[`solana:${tokenName.toBase58()}`].price;
    if (vaultTvl) {
      tvl += vaultTvl;
    }
  }

  return toUSDTBalances(tvl);
}

const getMultipleMintInfo = async (connection, pubKeys) => {
  const info = await connection.getMultipleAccountsInfo(pubKeys);
  if (info === null) {
    throw new Error("Failed to find mint account");
  }

  return info.map((v) => {
    if (v != null) {
      const data = Buffer.from(v.data);
      return {
        key: pubKeys[info.indexOf(v)].toBase58(),
        data: deserializeMint(data),
      };
    }
    return null;
  });
};

const deserializeMint = (data) => {
  if (data.length !== MintLayout.span) {
    throw new Error("Not a valid Mint");
  }

  const mintInfo = MintLayout.decode(data);

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null;
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority);
  }

  mintInfo.isInitialized = mintInfo.isInitialized !== 0;

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null;
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority);
  }

  return mintInfo;
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
