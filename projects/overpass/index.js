const { PublicKey } = require("@solana/web3.js");
const bs58 = require("bs58");
const { getConnection } = require("../helper/solana");

const OVERPASS_PROGRAM_ID = new PublicKey("WRAPdXmxrH37RKUbH1QMnYrKdNe8w4Kz44t1cXmYeum");
const LULO_PROGRAM_ID = new PublicKey("FL3X2pRsQ9zHENpZSKDRREtccwJuei8yg9fwDu9UN69Q");
const LULO_REFERRER = new PublicKey("UserevMsvU5K9u6iW7DT9XJVyVLpmfDCEAfXixBbE7R");

const WRAPPER_VAULT_SIZE = 558;
const WRAPPER_VAULT_DISCRIMINATOR = Buffer.from([103, 101, 152, 26, 112, 217, 184, 219]);
const WRAPPER_VAULT_DISC_BASE58 = (bs58.default ?? bs58).encode(WRAPPER_VAULT_DISCRIMINATOR);
const KVAULT_VAULT_STATE_DISCRIMINATOR = Buffer.from([228, 196, 82, 165, 98, 210, 235, 152]);

const PROTOCOL_KVAULT = 0;
const PROTOCOL_KLEND = 1;
const PROTOCOL_SAVE = 2;
const PROTOCOL_LULO = 3;
const PROTOCOL_MARGINFI = 4;

const FRACTION_SHIFT = 60n;
const WAD = 1_000_000_000_000_000_000n;
const I80F48_SHIFT = 48n;
const U64_MAX = (1n << 64n) - 1n;
const I128_MAX = (1n << 127n) - 1n;

const ZERO = PublicKey.default.toBase58();

function readPubkey(data, offset) {
  return new PublicKey(data.subarray(offset, offset + 32));
}

function readU8(data, offset) {
  return data.readUInt8(offset);
}

function readU16(data, offset) {
  return data.readUInt16LE(offset);
}

function readU64(data, offset) {
  return data.readBigUInt64LE(offset);
}

function readU128(data, offset) {
  let value = 0n;
  for (let i = 15; i >= 0; i--) value = (value << 8n) | BigInt(data[offset + i]);
  return value;
}

function readI80F48(data, offset) {
  let value = readU128(data, offset);
  if (value > I128_MAX) value -= 1n << 128n;
  return value;
}

function floorI80F48(value) {
  if (value <= 0n) return 0n;
  return value >> I80F48_SHIFT;
}

function mulI80F48(a, b) {
  return (a * b) >> I80F48_SHIFT;
}

function addCap(a, b) {
  return a + b > U64_MAX ? U64_MAX : a + b;
}

function decodeWrapper(data) {
  return {
    protocol: readU8(data, 11),
    underlyingMint: readPubkey(data, 84),
    sourcePool: readPubkey(data, 116),
    sourcePositionPda: readPubkey(data, 148),
    intermediateHeld: readU128(data, 182),
    freeUnderlyingHeld: readU64(data, 198),
    wrapperSupply: readU64(data, 222),
  };
}

function decodeKlendReserve(data) {
  return {
    totalAvailableAmount: readU64(data, 224),
    borrowedAmountSf: readU128(data, 232),
    collateralMintTotalSupply: readU64(data, 2592),
    accumulatedProtocolFeesSf: readU128(data, 344),
    accumulatedReferrerFeesSf: readU128(data, 360),
    pendingReferrerFeesSf: readU128(data, 376),
  };
}

function klendTotalSupplySf(reserve) {
  const availableSf = reserve.totalAvailableAmount << FRACTION_SHIFT;
  const fees =
    reserve.accumulatedProtocolFeesSf +
    reserve.accumulatedReferrerFeesSf +
    reserve.pendingReferrerFeesSf;
  const gross = availableSf + reserve.borrowedAmountSf;
  return gross > fees ? gross - fees : 0n;
}

function klendCollateralToUnderlying(collateralAmount, reserve) {
  const collateralSupply = reserve.collateralMintTotalSupply;
  const totalSupplySf = klendTotalSupplySf(reserve);
  if (collateralAmount === 0n) return 0n;
  if (collateralSupply === 0n || totalSupplySf === 0n) return collateralAmount;
  return (collateralAmount * totalSupplySf / collateralSupply) >> FRACTION_SHIFT;
}

function decodeSaveReserve(data) {
  return {
    availableAmount: readU64(data, 171),
    borrowedAmountWads: readU128(data, 179),
    collateralMintTotalSupply: readU64(data, 259),
    accumulatedProtocolFeesWads: readU128(data, 373),
  };
}

function saveCollateralToUnderlying(collateralAmount, reserve) {
  const collateralSupply = reserve.collateralMintTotalSupply;
  if (collateralAmount === 0n) return 0n;
  if (collateralSupply === 0n) return collateralAmount;
  const gross = reserve.availableAmount * WAD + reserve.borrowedAmountWads;
  const totalSupplyWad =
    gross > reserve.accumulatedProtocolFeesWads
      ? gross - reserve.accumulatedProtocolFeesWads
      : 0n;
  if (totalSupplyWad === 0n) return collateralAmount;
  return (collateralAmount * totalSupplyWad) / (collateralSupply * WAD);
}

function decodeKvaultState(data) {
  for (let i = 0; i < 8; i++) {
    if (data[i] !== KVAULT_VAULT_STATE_DISCRIMINATOR[i]) throw new Error("bad kvault state");
  }
  const activeAllocations = [];
  const allocationBase = 8 + 304;
  const allocationSize = 2160;
  for (let i = 0; i < 25; i++) {
    const base = allocationBase + i * allocationSize;
    const reserve = readPubkey(data, base);
    if (reserve.toBase58() === ZERO) continue;
    activeAllocations.push({
      reserve,
      ctokenAllocation: readU64(data, base + 1104),
    });
  }
  return {
    tokenAvailable: readU64(data, 8 + 216),
    sharesIssued: readU64(data, 8 + 224),
    pendingFeesSf: readU128(data, 8 + 288),
    activeAllocations,
  };
}

function kvaultUnderlyingForShares(vault, reserveByAddress, shares) {
  if (shares === 0n) return 0n;
  let aum = vault.tokenAvailable;
  for (const allocation of vault.activeAllocations) {
    const reserve = reserveByAddress.get(allocation.reserve.toBase58());
    if (!reserve) continue;
    aum = addCap(aum, klendCollateralToUnderlying(allocation.ctokenAllocation, reserve));
  }
  const pendingFees = vault.pendingFeesSf >> FRACTION_SHIFT;
  if (aum > pendingFees) aum -= pendingFees;
  if (vault.sharesIssued === 0n) return 0n;
  return (aum * shares) / vault.sharesIssued;
}

function decodeMarginfiBank(data) {
  return {
    assetShareValue: readI80F48(data, 80),
  };
}

function marginfiUnderlyingForShares(bank, assetShares) {
  return floorI80F48(mulI80F48(assetShares, bank.assetShareValue));
}

function decodeLuloPool(data) {
  return {
    protectedTotalSupply: readU64(data, 8 + 48),
    protectedAmount: readU64(data, 8 + 120),
  };
}

function decodeLuloPoolUser(data) {
  const charged = readU128(data, 112);
  return {
    chargedQ60: charged,
    avgQ60: readU128(data, 96),
  };
}

function decodeLuloRefBps(data) {
  return readU16(data, 160);
}

function feeFromProfit(profitUsdc, refBps) {
  const amount = profitUsdc * BigInt(refBps);
  return amount === 0n ? 0n : (amount - 1n) / 10_000n;
}

function luloCpos(protectedAmount, protectedSupply, lpAmount, basisQ60) {
  if (protectedSupply === 0n || protectedAmount === 0n || lpAmount === 0n) return 0n;
  const q60 = 1n << 60n;
  const paQ60 = protectedAmount * q60;
  const basisPts = basisQ60 * protectedSupply;
  const gainQ60 = basisPts >= paQ60 ? 0n : paQ60 - basisPts;
  return (gainQ60 * lpAmount) / (protectedSupply * q60);
}

function luloPositionFee(protectedAmount, protectedSupply, lpAmount, chargedQ60, avgQ60, refBps) {
  const chargedProfit = luloCpos(protectedAmount, protectedSupply, lpAmount, chargedQ60);
  const avgProfit = luloCpos(protectedAmount, protectedSupply, lpAmount, avgQ60);
  return feeFromProfit(chargedProfit < avgProfit ? chargedProfit : avgProfit, refBps);
}

function luloUnderlyingForLp(pool, poolUser, refBps, lpAmount) {
  const protectedAmount = pool.protectedAmount;
  const protectedSupply = pool.protectedTotalSupply;
  if (protectedSupply === 0n || protectedAmount === 0n || lpAmount === 0n) return 0n;
  const gross = (lpAmount * protectedAmount) / protectedSupply;
  const fee = luloPositionFee(
    protectedAmount,
    protectedSupply,
    lpAmount,
    poolUser.chargedQ60,
    poolUser.avgQ60,
    refBps,
  );
  return gross > fee ? gross - fee : 0n;
}

function luloReferrerPoolUser() {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("pool_user"), Buffer.from([0]), LULO_REFERRER.toBuffer()],
    LULO_PROGRAM_ID,
  )[0];
}

async function getMultipleAccounts(connection, pubkeys) {
  const out = new Map();
  const unique = [...new Map(pubkeys.map((key) => [key.toBase58(), key])).values()];
  for (let i = 0; i < unique.length; i += 100) {
    const batch = unique.slice(i, i + 100);
    const accounts = await connection.getMultipleAccountsInfo(batch);
    accounts.forEach((account, index) => {
      if (account) out.set(batch[index].toBase58(), account.data);
    });
  }
  return out;
}

async function tvl(api) {
  const connection = getConnection(api.chain);
  const wrapperAccounts = await connection.getProgramAccounts(OVERPASS_PROGRAM_ID, {
    filters: [
      { dataSize: WRAPPER_VAULT_SIZE },
      { memcmp: { offset: 0, bytes: WRAPPER_VAULT_DISC_BASE58 } },
    ],
  });

  const wrappers = wrapperAccounts
    .map(({ account }) => decodeWrapper(account.data))
    .filter((wrapper) => wrapper.wrapperSupply > 0n);

  const referrerPoolUser = luloReferrerPoolUser();
  const firstPassKeys = [];
  for (const wrapper of wrappers) {
    firstPassKeys.push(wrapper.sourcePool);
    if (wrapper.protocol === PROTOCOL_LULO || wrapper.protocol === PROTOCOL_MARGINFI) {
      firstPassKeys.push(wrapper.sourcePositionPda);
    }
    if (wrapper.protocol === PROTOCOL_LULO) firstPassKeys.push(referrerPoolUser);
  }
  const firstPassAccounts = await getMultipleAccounts(connection, firstPassKeys);

  const kvaults = new Map();
  const kvaultReserveKeys = [];
  for (const wrapper of wrappers) {
    if (wrapper.protocol !== PROTOCOL_KVAULT) continue;
    const vaultData = firstPassAccounts.get(wrapper.sourcePool.toBase58());
    if (!vaultData) continue;
    const vault = decodeKvaultState(vaultData);
    kvaults.set(wrapper.sourcePool.toBase58(), vault);
    for (const allocation of vault.activeAllocations) kvaultReserveKeys.push(allocation.reserve);
  }
  const kvaultReserveAccounts = await getMultipleAccounts(connection, kvaultReserveKeys);
  const kvaultReserves = new Map();
  for (const [address, data] of kvaultReserveAccounts) {
    kvaultReserves.set(address, decodeKlendReserve(data));
  }

  let counted = 0;
  for (const wrapper of wrappers) {
    const sourceData = firstPassAccounts.get(wrapper.sourcePool.toBase58());
    if (!sourceData) continue;

    let backing = wrapper.freeUnderlyingHeld;
    if (wrapper.protocol === PROTOCOL_KLEND) {
      backing = addCap(backing, klendCollateralToUnderlying(wrapper.intermediateHeld, decodeKlendReserve(sourceData)));
    } else if (wrapper.protocol === PROTOCOL_SAVE) {
      backing = addCap(backing, saveCollateralToUnderlying(wrapper.intermediateHeld, decodeSaveReserve(sourceData)));
    } else if (wrapper.protocol === PROTOCOL_KVAULT) {
      const vault = kvaults.get(wrapper.sourcePool.toBase58());
      if (!vault) continue;
      backing = addCap(backing, kvaultUnderlyingForShares(vault, kvaultReserves, wrapper.intermediateHeld));
    } else if (wrapper.protocol === PROTOCOL_MARGINFI) {
      backing = addCap(backing, marginfiUnderlyingForShares(decodeMarginfiBank(sourceData), wrapper.intermediateHeld));
    } else if (wrapper.protocol === PROTOCOL_LULO) {
      const poolUserData = firstPassAccounts.get(wrapper.sourcePositionPda.toBase58());
      const referrerData = firstPassAccounts.get(referrerPoolUser.toBase58());
      if (!poolUserData || !referrerData) continue;
      backing = addCap(
        backing,
        luloUnderlyingForLp(
          decodeLuloPool(sourceData),
          decodeLuloPoolUser(poolUserData),
          decodeLuloRefBps(referrerData),
          wrapper.intermediateHeld,
        ),
      );
    } else {
      continue;
    }

    if (backing > 0n) {
      api.add(wrapper.underlyingMint.toBase58(), backing.toString());
      counted += 1;
    }
  }

  api.log(`Counted underlying backing for ${counted} active Overpass wrappers`);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL counts the underlying assets backing active Overpass yield-token wrappers on Solana. WrapperVault accounts are discovered from the Overpass program, then each wrapper's source protocol position is converted into its underlying mint using on-chain reserve, vault, bank, or pool state.",
  solana: {
    tvl,
  },
};
