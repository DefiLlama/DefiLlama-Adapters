
const BufferLayout = require("buffer-layout");
const { PublicKey } = require("@solana/web3.js");
const BN = require("bn.js");
const { struct, s32, u8, u16, seq, blob, Layout, bits, u32, } = BufferLayout

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

const u64 = uint64

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
const u128 = uint128
class OptionLayout extends BufferLayout.Layout {
  constructor(layout, property) {
      super(-1, property);
      this.layout = layout;
      this.discriminator = BufferLayout.u8();
  }
  encode(src, b, offset = 0) {
      if (src === null || src === undefined) {
          return this.discriminator.encode(0, b, offset);
      }
      this.discriminator.encode(1, b, offset);
      return this.layout.encode(src, b, offset + 1) + 1;
  }
  decode(b, offset = 0) {
      const discriminator = this.discriminator.decode(b, offset);
      if (discriminator === 0) {
          return null;
      }
      else if (discriminator === 1) {
          return this.layout.decode(b, offset + 1);
      }
      throw new Error('Invalid option ' + this.property);
  }
  getSpan(b, offset = 0) {
      const discriminator = this.discriminator.decode(b, offset);
      if (discriminator === 0) {
          return 1;
      }
      else if (discriminator === 1) {
          return this.layout.getSpan(b, offset + 1) + 1;
      }
      throw new Error('Invalid option ' + this.property);
  }
}

function option(layout, property) {
  return new OptionLayout(layout, property);
}

module.exports = {
  struct, s32, u8, u16, seq, blob, Layout, bits, u32, publicKey, uint64, u64, uint128, u128, BufferLayout, option,
}