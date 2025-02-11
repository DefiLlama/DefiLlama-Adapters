function processTVMSliceReadAddress(base64String) {
  let buffer = decodeBase64(base64String);
  let { offset, root, index, cellData } = parseBoc(buffer);
  let { wc, addressHash } = parseAddress(buffer, offset);
  return serializeAddress(wc, addressHash);
}

function decodeBase64(base64String) {
  const buffer = Buffer.from(base64String, 'base64');
  return buffer;
}

function parseBoc(buffer) {
  if (buffer.length < 4) {
      throw new Error("Buffer is too short to contain magic bytes");
  }

  const magic = buffer.readUInt32BE(0);
  if (magic !== 0xb5ee9c72) {
      throw new Error("Invalid magic");
  }

  let offset = 4; 

  let hasIdx = (buffer[offset] >> 7) & 1;
  let hasCrc32c = (buffer[offset] >> 6) & 1;
  let hasCacheBits = (buffer[offset] >> 5) & 1;
  let flags = (buffer[offset] >> 3) & 0b11; // 2 bits
  let size = buffer[offset] & 0b111; // 3 bits
  offset++;

  let offBytes = buffer.readUInt8(offset);
  offset++;

  let cells = buffer.readUIntBE(offset, size);
  offset += size;

  let roots = buffer.readUIntBE(offset, size);
  offset += size;

  let absent = buffer.readUIntBE(offset, size);
  offset += size;

  let totalCellSize = buffer.readUIntBE(offset, offBytes);
  offset += offBytes;

  let root = [];
  for (let i = 0; i < roots; i++) {
      root.push(buffer.readUIntBE(offset, size));
      offset += size;
  }

  let index = null;
  if (hasIdx) {
      index = buffer.slice(offset, offset + cells * offBytes);
      offset += cells * offBytes;
  }

  let cellData = buffer.slice(offset, offset + totalCellSize);
  offset += totalCellSize;

  return { offset, root, index, cellData };
}

function parseAddress(buffer, offset) {
  const wcByteOffset = 13;
  const wcBitsOffset = 3;
  let reader = new BitReader(buffer, wcByteOffset, wcBitsOffset); 

  let wc = (reader.readBits(5) << 3) | (reader.readBits(3)); 
  let addressHash = reader.readBytes(32); 

  return { wc, addressHash, offset: reader.byteOffset }; 
}

function serializeAddress(wc, addressHash) {
  const bounceableTag = 0x11;
  let fullAddress = Buffer.alloc(36);
  fullAddress[0] = bounceableTag;
  fullAddress[1] = wc;
  addressHash.copy(fullAddress, 2);

  let crc16 = computeCRC16(fullAddress.slice(0, 34));
  fullAddress.writeUInt16BE(crc16, 34);

  return fullAddress.toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
}

function computeCRC16(buffer) {
  let crc = 0x0000;
  let polynomial = 0x1021;

  for (let i = 0; i < buffer.length; i++) {
      crc ^= buffer[i] << 8;
      for (let j = 0; j < 8; j++) {
          if (crc & 0x8000) {
              crc = (crc << 1) ^ polynomial;
          } else {
              crc <<= 1;
          }
      }
      crc &= 0xFFFF;
  }
  return crc;
}

class BitReader {
  constructor(buffer, startByte = 0, startBit = 0) {
      this.buffer = buffer;
      this.byteOffset = startByte;
      this.bitOffset = startBit;
  }

  readBits(n) {
      let value = 0;

      for (let i = 0; i < n; i++) {
          if (this.byteOffset >= this.buffer.length) {
              throw new Error("Buffer overflow while reading bits");
          }

          let bit = (this.buffer[this.byteOffset] >> (7 - this.bitOffset)) & 1;
          value = (value << 1) | bit;

          this.bitOffset++;
          if (this.bitOffset === 8) {
              this.bitOffset = 0;
              this.byteOffset++;
          }
      }
      return value;
  }

  readBytes(n) {
      let bytes = Buffer.alloc(n);
      for (let i = 0; i < n; i++) {
          bytes[i] = this.readBits(8);
      }
      return bytes;
  }
}

module.exports = { processTVMSliceReadAddress }