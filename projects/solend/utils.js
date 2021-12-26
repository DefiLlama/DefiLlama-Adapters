const BufferLayout = require("buffer-layout");
const { PublicKey } = require("@solana/web3.js");
const BN = require("bn.js");

const publicKey = (property = "publicKey") => {
  const publicKeyLayout = BufferLayout.blob(32, property);

  const _decode = publicKeyLayout.decode.bind(publicKeyLayout);
  const _encode = publicKeyLayout.encode.bind(publicKeyLayout);

  publicKeyLayout.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return new PublicKey(data);
  };

  publicKeyLayout.encode = (key, buffer, offset) =>
    _encode(key.toBuffer(), buffer, offset);

  return publicKeyLayout;
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  const layout = BufferLayout.blob(8, property);

  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return new BN(
      [...data]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  };

  layout.encode = (num, buffer, offset) => {
    const a = num.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 8) {
      const zeroPad = Buffer.alloc(8);
      b.copy(zeroPad);
      b = zeroPad;
    }
    return _encode(b, buffer, offset);
  };

  return layout;
};

const uint128 = (property = "uint128") => {
  const layout = BufferLayout.blob(16, property);

  const _decode = layout.decode.bind(layout);
  const _encode = layout.encode.bind(layout);

  layout.decode = (buffer, offset) => {
    const data = _decode(buffer, offset);
    return new BN(
      [...data]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  };

  layout.encode = (num, buffer, offset) => {
    const a = num.toArray().reverse();
    let b = Buffer.from(a);
    if (b.length !== 16) {
      const zeroPad = Buffer.alloc(16);
      b.copy(zeroPad);
      b = zeroPad;
    }

    return _encode(b, buffer, offset);
  };

  return layout;
};
const LastUpdateLayout = BufferLayout.struct(
  [uint64("slot"), BufferLayout.u8("stale")],
  "lastUpdate"
);

const ReserveLayout = BufferLayout.struct([
  BufferLayout.u8("version"),

  LastUpdateLayout,

  publicKey("lendingMarket"),

  BufferLayout.struct(
    [
      publicKey("mintPubkey"),
      BufferLayout.u8("mintDecimals"),
      publicKey("supplyPubkey"),
      // @FIXME: oracle option
      // TODO: replace u32 option with generic equivalent
      // BufferLayout.u32('oracleOption'),
      publicKey("pythOracle"),
      publicKey("switchboardOracle"),
      uint64("availableAmount"),
      uint128("borrowedAmountWads"),
      uint128("cumulativeBorrowRateWads"),
      uint128("marketPrice"),
    ],
    "liquidity"
  ),

  BufferLayout.struct(
    [
      publicKey("mintPubkey"),
      uint64("mintTotalSupply"),
      publicKey("supplyPubkey"),
    ],
    "collateral"
  ),

  BufferLayout.struct(
    [
      BufferLayout.u8("optimalUtilizationRate"),
      BufferLayout.u8("loanToValueRatio"),
      BufferLayout.u8("liquidationBonus"),
      BufferLayout.u8("liquidationThreshold"),
      BufferLayout.u8("minBorrowRate"),
      BufferLayout.u8("optimalBorrowRate"),
      BufferLayout.u8("maxBorrowRate"),
      BufferLayout.struct(
        [
          uint64("borrowFeeWad"),
          uint64("flashLoanFeeWad"),
          BufferLayout.u8("hostFeePercentage"),
        ],
        "fees"
      ),
      uint64("depositLimit"),
      uint64("borrowLimit"),
      publicKey("feeReceiver"),
    ],
    "config"
  ),

  BufferLayout.blob(256, "padding"),
]);

const parseReserve = (pubkey, info) => {
  const { data } = info;
  const buffer = Buffer.from(data);
  const reserve = ReserveLayout.decode(buffer);

  if (reserve.lastUpdate.slot.isZero()) {
    return null;
  }

  const details = {
    pubkey,
    account: {
      ...info,
    },
    info: reserve,
  };

  return details;
};
module.exports = {
  parseReserve,
};
