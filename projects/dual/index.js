const { PublicKey } = require("@solana/web3.js");
const anchor = require("@project-serum/anchor");
const { getConnection, sumTokens2, readBigUInt64LE, } = require("../helper/solana");


async function tvl() {
  const connection = getConnection();
  const dualProgramID = new PublicKey("DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki");
  let programAccounts = await connection.getProgramAccounts(dualProgramID, {
    filters: [{
      dataSize: 260
    }]
  });

  const dipTokenAccounts = programAccounts
    .map(i => parseDipState(i.account.data))
    .map(i => [i.vaultSpl, i.vaultUsdc])
    .flat()

  const stakingOptionsProgramID = new PublicKey("4yx1NJ4Vqf2zT1oVLk4SySBhhDJXmXFt88ncm4gPxtL7");
  let stakingOptionsAccounts = await connection.getProgramAccounts(stakingOptionsProgramID, {
    filters: [{
      dataSize: 1150
    }]
  });

  const soTokenAccounts = stakingOptionsAccounts
    .map(i => parseSoState(i.account.data))
    .map(i => [i.vault, i.reverseVault])
    .flat()

  const gsoProgramID = new PublicKey("DuALd6fooWzVDkaTsQzDAxPGYCnLrnWamdNNTNxicdX8");
  let gsoAccounts = await connection.getProgramAccounts(gsoProgramID, {
    filters: [{
      dataSize: 1000
    }]
  });
  const gsoTokenAccounts = gsoAccounts
    .map(i => gsoVault(i.pubkey))

  const tokenAccounts = dipTokenAccounts.concat(soTokenAccounts).concat(gsoTokenAccounts);

  const DUAL = 'DUALa4FC2yREwZ59PHeu1un4wis36vHRv5hWVBmzykCJ'
  return sumTokens2({ tokenAccounts, allowError: true,  blacklistedTokens: [DUAL]})
}

async function staking() {
  const connection = getConnection();
  const dualProgramID = new PublicKey("DiPbvUUJkDhV9jFtQsDFnMEMRJyjW5iS6NMwoySiW8ki");
  let programAccounts = await connection.getProgramAccounts(dualProgramID, {
    filters: [{
      dataSize: 260
    }]
  });

  const dipTokenAccounts = programAccounts
    .map(i => parseDipState(i.account.data))
    .map(i => [i.vaultSpl, i.vaultUsdc])
    .flat()

  const stakingOptionsProgramID = new PublicKey("4yx1NJ4Vqf2zT1oVLk4SySBhhDJXmXFt88ncm4gPxtL7");
  let stakingOptionsAccounts = await connection.getProgramAccounts(stakingOptionsProgramID, {
    filters: [{
      dataSize: 1150
    }]
  });

  const soTokenAccounts = stakingOptionsAccounts
    .map(i => parseSoState(i.account.data))
    .map(i => [i.vault, i.reverseVault])
    .flat()

  const gsoProgramID = new PublicKey("DuALd6fooWzVDkaTsQzDAxPGYCnLrnWamdNNTNxicdX8");
  let gsoAccounts = await connection.getProgramAccounts(gsoProgramID, {
    filters: [{
      dataSize: 1000
    }]
  });
  const gsoTokenAccounts = gsoAccounts
    .map(i => gsoVault(i.pubkey))

  const tokenAccounts = dipTokenAccounts.concat(soTokenAccounts).concat(gsoTokenAccounts);

  return sumTokens2({ tokenAccounts, allowError: true, })
}

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

function parseSoState(buf) {
  const numNameBytes = Number(buf.readUInt8(8));
  // Prefix is 4 bytes
  const soName = String.fromCharCode.apply(String, buf.slice(8 + 4, 8 + 4 + numNameBytes));
  const offset = 26 + 32 + 8 + 4 + numNameBytes;
  const baseMint = new PublicKey(buf.slice(offset, offset + 32));

  const vault = PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("so-vault")),
      Buffer.from(anchor.utils.bytes.utf8.encode(soName)),
      baseMint.toBuffer(),
    ],
    new PublicKey("4yx1NJ4Vqf2zT1oVLk4SySBhhDJXmXFt88ncm4gPxtL7")
  )[0].toBase58();

  // TODO: If the reverse vault does not exist, do not include.
  const reverseVault = PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("so-reverse-vault")),
      Buffer.from(anchor.utils.bytes.utf8.encode(soName)),
      baseMint.toBuffer(),
    ],
    new PublicKey("4yx1NJ4Vqf2zT1oVLk4SySBhhDJXmXFt88ncm4gPxtL7")
  )[0].toBase58();

  return {
    soName,
    baseMint,
    vault,
    reverseVault,
  };
}

function gsoVault(pubkey) {
  const vault = PublicKey.findProgramAddressSync(
    [
      Buffer.from(anchor.utils.bytes.utf8.encode("base-vault")),
      (new PublicKey(pubkey)).toBuffer(),
    ],
    new PublicKey("DuALd6fooWzVDkaTsQzDAxPGYCnLrnWamdNNTNxicdX8")
  )[0].toBase58();
  return vault;
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  solana: {
    tvl,
    staking,
  },
};
