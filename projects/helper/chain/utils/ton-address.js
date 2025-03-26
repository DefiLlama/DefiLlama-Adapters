const bounceable_tag = 0x11;
const non_bounceable_tag = 0x51;
const test_flag = 0x80;

function crc16(data) {
	const poly = 0x1021;
	let reg = 0;
	const message = Buffer.alloc(data.length + 2);
	message.set(data);
	for (let byte of message) {
		let mask = 0x80;
		while (mask > 0) {
			reg <<= 1;
			if (byte & mask) {
				reg += 1;
			}
			mask >>= 1;
			if (reg > 0xffff) {
				reg &= 0xffff;
				reg ^= poly;
			}
		}
	}
	return Buffer.from([Math.floor(reg / 256), reg % 256]);
}

function parseFriendlyAddress(src) {
	if (typeof src === "string" && !Address.isFriendly(src)) {
		throw new Error("Unknown address type");
	}
	const data = Buffer.isBuffer(src) ? src : Buffer.from(src, "base64");
	// 1byte tag + 1byte workchain + 32 bytes hash + 2 byte crc
	if (data.length !== 36) {
		throw new Error("Unknown address type: byte length is not equal to 36");
	}
	// Prepare data
	const addr = data.subarray(0, 34);
	const crc = data.subarray(34, 36);
	const calcedCrc = (0, crc16)(addr);
	if (!(calcedCrc[0] === crc[0] && calcedCrc[1] === crc[1])) {
		throw new Error("Invalid checksum: " + src);
	}
	// Parse tag
	let tag = addr[0];
	let isTestOnly = false;
	let isBounceable = false;
	if (tag & test_flag) {
		isTestOnly = true;
		tag = tag ^ test_flag;
	}
	if (tag !== bounceable_tag && tag !== non_bounceable_tag)
		throw "Unknown address tag";
	isBounceable = tag === bounceable_tag;
	let workchain = null;
	if (addr[1] === 0xff) {
		// TODO we should read signed integer here
		workchain = -1;
	} else {
		workchain = addr[1];
	}
	const hashPart = addr.subarray(2, 34);
	return { isTestOnly, isBounceable, workchain, hashPart };
}
class Address {
	static isAddress(src) {
		return src instanceof Address;
	}
	static isFriendly(source) {
		// Check length
		if (source.length !== 48) {
			return false;
		}
		// Check if address is valid base64
		if (!/[A-Za-z0-9+/_-]+/.test(source)) {
			return false;
		}
		return true;
	}
	static isRaw(source) {
		// Check if has delimiter
		if (source.indexOf(":") === -1) {
			return false;
		}
		let [wc, hash] = source.split(":");
		// wc is not valid
		if (!Number.isInteger(parseFloat(wc))) {
			return false;
		}
		// hash is not valid
		if (!/[a-f0-9]+/.test(hash.toLowerCase())) {
			return false;
		}
		// has is not correct
		if (hash.length !== 64) {
			return false;
		}
		return true;
	}
	static normalize(source) {
		if (typeof source === "string") {
			return Address.parse(source).toString();
		} else {
			return source.toString();
		}
	}
	static parse(source) {
		if (Address.isFriendly(source)) {
			return this.parseFriendly(source).address;
		} else if (Address.isRaw(source)) {
			return this.parseRaw(source);
		} else {
			throw new Error("Unknown address type: " + source);
		}
	}
	static parseRaw(source) {
		let workChain = parseInt(source.split(":")[0]);
		let hash = Buffer.from(source.split(":")[1], "hex");
		return new Address(workChain, hash);
	}
	static parseFriendly(source) {
		if (Buffer.isBuffer(source)) {
			let r = parseFriendlyAddress(source);
			return {
				isBounceable: r.isBounceable,
				isTestOnly: r.isTestOnly,
				address: new Address(r.workchain, r.hashPart),
			};
		} else {
			let addr = source.replace(/-/g, "+").replace(/_/g, "/"); // Convert from url-friendly to true base64
			let r = parseFriendlyAddress(addr);
			return {
				isBounceable: r.isBounceable,
				isTestOnly: r.isTestOnly,
				address: new Address(r.workchain, r.hashPart),
			};
		}
	}
	constructor(workChain, hash) {
		this.toRawString = () => {
			return this.workChain + ":" + this.hash.toString("hex");
		};
		this.toRaw = () => {
			const addressWithChecksum = Buffer.alloc(36);
			addressWithChecksum.set(this.hash);
			addressWithChecksum.set(
				[
					this.workChain,
					this.workChain,
					this.workChain,
					this.workChain,
				],
				32
			);
			return addressWithChecksum;
		};
		this.toStringBuffer = (args) => {
			let testOnly =
				args && args.testOnly !== undefined ? args.testOnly : false;
			let bounceable =
				args && args.bounceable !== undefined ? args.bounceable : true;
			let tag = bounceable ? bounceable_tag : non_bounceable_tag;
			if (testOnly) {
				tag |= test_flag;
			}
			const addr = Buffer.alloc(34);
			addr[0] = tag;
			addr[1] = this.workChain;
			addr.set(this.hash, 2);
			const addressWithChecksum = Buffer.alloc(36);
			addressWithChecksum.set(addr);
			addressWithChecksum.set((0, crc16)(addr), 34);
			return addressWithChecksum;
		};
		this.toString = (args) => {
			let urlSafe =
				args && args.urlSafe !== undefined ? args.urlSafe : true;
			let buffer = this.toStringBuffer(args);
			if (urlSafe) {
				return buffer
					.toString("base64")
					.replace(/\+/g, "-")
					.replace(/\//g, "_");
			} else {
				return buffer.toString("base64");
			}
		};
		if (hash.length !== 32) {
			throw new Error("Invalid address hash length: " + hash.length);
		}
		this.workChain = workChain;
		this.hash = hash;
		Object.freeze(this);
	}
	equals(src) {
		if (src.workChain !== this.workChain) {
			return false;
		}
		return src.hash.equals(this.hash);
	}
}

const addressToInt = (address) => {
	return BigInt(`0x${address.toRawString().replace("0:", "")}`);
};

const intTo256BitHex = (n) => {
	// Convert the BigInt to a hexadecimal string
	const hex = n.toString(16);
	// Pad with leading zeros to ensure it is 64 characters (256 bits)
	return hex.padStart(64, "0");
};

const convertIntToAddress = (uint) => {
	const addressString = `0:${intTo256BitHex(uint)}`;
	return Address.parseRaw(addressString);
};

const compareAddress = (a, b) => {
	if (!a || !b) {
		return false;
	}

	try {
		const parsedA = typeof a === "string" ? Address.parse(a) : a;
		const parsedB = typeof b === "string" ? Address.parse(b) : b;

		return parsedA.equals(parsedB);
	} catch {
		return false;
	}
};

module.exports = {
    addressToInt,
    convertIntToAddress,
    compareAddress,
};