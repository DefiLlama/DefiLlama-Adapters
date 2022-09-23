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

function readBigUInt64LE(buffer, offset) {
  const first = buffer[offset];
  const last = buffer[offset + 7];
  if (first === undefined || last === undefined) {
    throw new Error();
  }
  const lo = first + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + buffer[++offset] * 2 ** 24;
  const hi = buffer[++offset] + buffer[++offset] * 2 ** 8 + buffer[++offset] * 2 ** 16 + last * 2 ** 24;
  return BigInt(lo) + (BigInt(hi) << BigInt(32));
}

async function tvl() {
  const connection =  getConnection();
  const anchorProvider = getProvider();
  const dualProgramID = new PublicKey(
    "DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki"
  );
  const usdcMintPk = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

  const VAULT_MINT_ADDRESS_SEED = "vault-mint";

  const prices = await getPriceWithTokenAddress([
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E", // BTC
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", // ETH
    "So11111111111111111111111111111111111111112", // SOL
  ]);


  let programAccounts = await connection.getProgramAccounts(dualProgramID);

  let mints = [];
  let mintToSplToken = {};
  for (const account of programAccounts) {
    if (account.account.data.length !== 260) {
      continue;
    }

    const dipState = parseDipState(account.account.data);
    const { strike, expiration, splMint } = dipState;

    // Expired vaults do not count for tvl
    if (expiration * 1000 < Date.now()) {
      continue;
    }

    const [vaultTokenMint, _vaultMintBump] =
      await web3.PublicKey.findProgramAddress(
        [
          Buffer.from(utils.bytes.utf8.encode(VAULT_MINT_ADDRESS_SEED)),
          toBytes(Number(strike)),
          toBytes(Number(expiration)),
          splMint.toBuffer(),
          usdcMintPk.toBuffer(),
        ],
        dualProgramID
      );
    mintToSplToken[vaultTokenMint] = splMint;
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

function parseDipState(buf) {
  const strike = Number(readBigUInt64LE(buf, 8));
  const expiration = Number(readBigUInt64LE(buf, 16));
  const splMint = new PublicKey(buf.slice(24, 56));
  const vaultMint = new PublicKey(buf.slice(56, 88));
  const vaultMintBump = Number(buf.readUInt8(88));
  const vaultSpl = new PublicKey(buf.slice(89, 121));
  const vaultSplBump = Number(buf.readUInt8(121));
  const optionMint = new PublicKey(buf.slice(122, 154));
  const optionBump = Number(buf.readUInt8(154));
  const vaultUsdc = new PublicKey(buf.slice(155, 187));
  const vaultUsdcBump = Number(buf.readUInt8(187));
  const usdcMint = new PublicKey(buf.slice(188, 220));
  return {
    strike,
    expiration,
    splMint,
    vaultMint,
    vaultMintBump,
    vaultSpl,
    vaultSplBump,
    optionMint,
    optionBump,
    vaultUsdc,
    vaultUsdcBump,
    usdcMint,
  };
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  solana: {
    tvl,
  },
};
