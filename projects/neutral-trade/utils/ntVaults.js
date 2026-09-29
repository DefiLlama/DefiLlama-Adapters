const { getProvider } = require('../../helper/solana');
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { NT_VAULT_PROGRAM_ID } = require("../constants");

const V2_BUNDLE_PROGRAM_ID = "BUNDeH5A4c47bcEoAjBhN3sCjLgYnRsmt9ibMztqVkC9";

// Convert Anchor IDL v2 (new format with address/metadata/discriminators)
// to v1 format (compatible with @project-serum/anchor)
function convertIdlV2ToV1(idlV2) {
  const types = {};
  for (const t of idlV2.types || []) types[t.name] = t;
  const accounts = [];
  for (const acc of idlV2.accounts || []) {
    const typeDef = types[acc.name];
    if (!typeDef) continue;
    accounts.push({ name: acc.name, type: convertStructType(typeDef.type) });
  }
  return {
    version: idlV2.metadata?.version || "0.1.0",
    name: idlV2.metadata?.name || "unknown",
    instructions: [],
    accounts,
    events: [],
    errors: [],
  };
}

function convertStructType(type) {
  if (type.kind !== "struct") return type;
  return {
    kind: "struct",
    fields: type.fields.map((f) => ({
      name: f.name.replace(/_([a-z])/g, (_, c) => c.toUpperCase()),
      type: convertFieldType(f.type),
    })),
  };
}

function convertFieldType(type) {
  if (type === "pubkey") return "publicKey";
  if (typeof type === "object") {
    if (type.vec) return { vec: convertFieldType(type.vec) };
    if (type.array) return { array: [convertFieldType(type.array[0]), type.array[1]] };
    if (type.option) return { option: convertFieldType(type.option) };
    if (type.defined) return { defined: type.defined.name || type.defined };
  }
  return type;
}

let idlV2Converted;
function getProgram(programId) {
  const pid = programId ?? NT_VAULT_PROGRAM_ID;
  const pk = new PublicKey(pid);
  const provider = getProvider();
  if (pid === V2_BUNDLE_PROGRAM_ID) {
    if (!idlV2Converted) {
      idlV2Converted = convertIdlV2ToV1(require('../idl/ntbundlev2.json'));
    }
    return new Program(idlV2Converted, pk, provider);
  }
  const idl = require('../idl/ntbundle.json');
  return new Program(idl, pk, provider);
}

function deriveOraclePDA(vaultPDA, programId) {
  const pk = new PublicKey(programId ?? NT_VAULT_PROGRAM_ID);
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from("ORACLE"), vaultPDA.toBuffer()],
    pk,
  );
  return pda;
}

async function _fetchTvl(vaultAddress, programId) {
  const program = getProgram(programId);
  const ntVaultPDA = new PublicKey(vaultAddress);
  const ntVault = await program.account.bundle.fetch(ntVaultPDA);
  const ntOracle = await program.account.oracleData.fetch(deriveOraclePDA(ntVaultPDA, programId));
  // v1 IDL uses camelCase, v2 IDL uses snake_case
  const balance = ntVault.bundleUnderlyingBalance ?? ntVault.bundle_underlying_balance;
  const equity = ntOracle.averageExternalEquity ?? ntOracle.average_external_equity;
  return balance.toNumber() + equity.toNumber();
}

async function getTvl(vaultAddress, programId) {
  const pid = programId ?? NT_VAULT_PROGRAM_ID;
  try {
    return await _fetchTvl(vaultAddress, pid);
  } catch (e) {
    // If default program fails, try v2 program as fallback
    if (pid === NT_VAULT_PROGRAM_ID) {
      return await _fetchTvl(vaultAddress, V2_BUNDLE_PROGRAM_ID);
    }
    throw e;
  }
}

module.exports = {
  getTvl
};
