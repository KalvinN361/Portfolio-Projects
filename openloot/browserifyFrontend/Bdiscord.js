(function () {
	function r(e, n, t) {
		function o(i, f) {
			if (!n[i]) {
				if (!e[i]) {
					var c = "function" == typeof require && require;
					if (!f && c) return c(i, !0);
					if (u) return u(i, !0);
					var a = new Error("Cannot find module '" + i + "'");
					throw ((a.code = "MODULE_NOT_FOUND"), a);
				}
				var p = (n[i] = { exports: {} });
				e[i][0].call(
					p.exports,
					function (r) {
						var n = e[i][1][r];
						return o(n || r);
					},
					p,
					p.exports,
					r,
					e,
					n,
					t
				);
			}
			return n[i].exports;
		}
		for (
			var u = "function" == typeof require && require, i = 0;
			i < t.length;
			i++
		)
			o(t[i]);
		return o;
	}
	return r;
})()(
	{
		1: [
			function (require, module, exports) {
				"use strict";

				exports.byteLength = byteLength;
				exports.toByteArray = toByteArray;
				exports.fromByteArray = fromByteArray;

				var lookup = [];
				var revLookup = [];
				var Arr = typeof Uint8Array !== "undefined" ? Uint8Array : Array;

				var code =
					"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
				for (var i = 0, len = code.length; i < len; ++i) {
					lookup[i] = code[i];
					revLookup[code.charCodeAt(i)] = i;
				}

				// Support decoding URL-safe base64 strings, as Node.js does.
				// See: https://en.wikipedia.org/wiki/Base64#URL_applications
				revLookup["-".charCodeAt(0)] = 62;
				revLookup["_".charCodeAt(0)] = 63;

				function getLens(b64) {
					var len = b64.length;

					if (len % 4 > 0) {
						throw new Error("Invalid string. Length must be a multiple of 4");
					}

					// Trim off extra bytes after placeholder bytes are found
					// See: https://github.com/beatgammit/base64-js/issues/42
					var validLen = b64.indexOf("=");
					if (validLen === -1) validLen = len;

					var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

					return [validLen, placeHoldersLen];
				}

				// base64 is 4/3 + up to two characters of the original data
				function byteLength(b64) {
					var lens = getLens(b64);
					var validLen = lens[0];
					var placeHoldersLen = lens[1];
					return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
				}

				function _byteLength(b64, validLen, placeHoldersLen) {
					return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
				}

				function toByteArray(b64) {
					var tmp;
					var lens = getLens(b64);
					var validLen = lens[0];
					var placeHoldersLen = lens[1];

					var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

					var curByte = 0;

					// if there are placeholders, only get up to the last complete 4 chars
					var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

					var i;
					for (i = 0; i < len; i += 4) {
						tmp =
							(revLookup[b64.charCodeAt(i)] << 18) |
							(revLookup[b64.charCodeAt(i + 1)] << 12) |
							(revLookup[b64.charCodeAt(i + 2)] << 6) |
							revLookup[b64.charCodeAt(i + 3)];
						arr[curByte++] = (tmp >> 16) & 0xff;
						arr[curByte++] = (tmp >> 8) & 0xff;
						arr[curByte++] = tmp & 0xff;
					}

					if (placeHoldersLen === 2) {
						tmp =
							(revLookup[b64.charCodeAt(i)] << 2) |
							(revLookup[b64.charCodeAt(i + 1)] >> 4);
						arr[curByte++] = tmp & 0xff;
					}

					if (placeHoldersLen === 1) {
						tmp =
							(revLookup[b64.charCodeAt(i)] << 10) |
							(revLookup[b64.charCodeAt(i + 1)] << 4) |
							(revLookup[b64.charCodeAt(i + 2)] >> 2);
						arr[curByte++] = (tmp >> 8) & 0xff;
						arr[curByte++] = tmp & 0xff;
					}

					return arr;
				}

				function tripletToBase64(num) {
					return (
						lookup[(num >> 18) & 0x3f] +
						lookup[(num >> 12) & 0x3f] +
						lookup[(num >> 6) & 0x3f] +
						lookup[num & 0x3f]
					);
				}

				function encodeChunk(uint8, start, end) {
					var tmp;
					var output = [];
					for (var i = start; i < end; i += 3) {
						tmp =
							((uint8[i] << 16) & 0xff0000) +
							((uint8[i + 1] << 8) & 0xff00) +
							(uint8[i + 2] & 0xff);
						output.push(tripletToBase64(tmp));
					}
					return output.join("");
				}

				function fromByteArray(uint8) {
					var tmp;
					var len = uint8.length;
					var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
					var parts = [];
					var maxChunkLength = 16383; // must be multiple of 3

					// go through the array every three bytes, we'll deal with trailing stuff later
					for (
						var i = 0, len2 = len - extraBytes;
						i < len2;
						i += maxChunkLength
					) {
						parts.push(
							encodeChunk(
								uint8,
								i,
								i + maxChunkLength > len2 ? len2 : i + maxChunkLength
							)
						);
					}

					// pad the end with zeros, but make sure to not forget the extra bytes
					if (extraBytes === 1) {
						tmp = uint8[len - 1];
						parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + "==");
					} else if (extraBytes === 2) {
						tmp = (uint8[len - 2] << 8) + uint8[len - 1];
						parts.push(
							lookup[tmp >> 10] +
								lookup[(tmp >> 4) & 0x3f] +
								lookup[(tmp << 2) & 0x3f] +
								"="
						);
					}

					return parts.join("");
				}
			},
			{},
		],
		2: [
			function (require, module, exports) {
				(function (Buffer) {
					(function () {
						/*!
						 * The buffer module from node.js, for the browser.
						 *
						 * @author   Feross Aboukhadijeh <https://feross.org>
						 * @license  MIT
						 */
						/* eslint-disable no-proto */

						"use strict";

						var base64 = require("base64-js");
						var ieee754 = require("ieee754");

						exports.Buffer = Buffer;
						exports.SlowBuffer = SlowBuffer;
						exports.INSPECT_MAX_BYTES = 50;

						var K_MAX_LENGTH = 0x7fffffff;
						exports.kMaxLength = K_MAX_LENGTH;

						/**
						 * If `Buffer.TYPED_ARRAY_SUPPORT`:
						 *   === true    Use Uint8Array implementation (fastest)
						 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
						 *               implementation (most compatible, even IE6)
						 *
						 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
						 * Opera 11.6+, iOS 4.2+.
						 *
						 * We report that the browser does not support typed arrays if the are not subclassable
						 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
						 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
						 * for __proto__ and has a buggy typed array implementation.
						 */
						Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

						if (
							!Buffer.TYPED_ARRAY_SUPPORT &&
							typeof console !== "undefined" &&
							typeof console.error === "function"
						) {
							console.error(
								"This browser lacks typed array (Uint8Array) support which is required by " +
									"`buffer` v5.x. Use `buffer` v4.x if you require old browser support."
							);
						}

						function typedArraySupport() {
							// Can typed array instances can be augmented?
							try {
								var arr = new Uint8Array(1);
								arr.__proto__ = {
									__proto__: Uint8Array.prototype,
									foo: function () {
										return 42;
									},
								};
								return arr.foo() === 42;
							} catch (e) {
								return false;
							}
						}

						Object.defineProperty(Buffer.prototype, "parent", {
							enumerable: true,
							get: function () {
								if (!Buffer.isBuffer(this)) return undefined;
								return this.buffer;
							},
						});

						Object.defineProperty(Buffer.prototype, "offset", {
							enumerable: true,
							get: function () {
								if (!Buffer.isBuffer(this)) return undefined;
								return this.byteOffset;
							},
						});

						function createBuffer(length) {
							if (length > K_MAX_LENGTH) {
								throw new RangeError(
									'The value "' + length + '" is invalid for option "size"'
								);
							}
							// Return an augmented `Uint8Array` instance
							var buf = new Uint8Array(length);
							buf.__proto__ = Buffer.prototype;
							return buf;
						}

						/**
						 * The Buffer constructor returns instances of `Uint8Array` that have their
						 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
						 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
						 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
						 * returns a single octet.
						 *
						 * The `Uint8Array` prototype remains unmodified.
						 */

						function Buffer(arg, encodingOrOffset, length) {
							// Common case.
							if (typeof arg === "number") {
								if (typeof encodingOrOffset === "string") {
									throw new TypeError(
										'The "string" argument must be of type string. Received type number'
									);
								}
								return allocUnsafe(arg);
							}
							return from(arg, encodingOrOffset, length);
						}

						// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
						if (
							typeof Symbol !== "undefined" &&
							Symbol.species != null &&
							Buffer[Symbol.species] === Buffer
						) {
							Object.defineProperty(Buffer, Symbol.species, {
								value: null,
								configurable: true,
								enumerable: false,
								writable: false,
							});
						}

						Buffer.poolSize = 8192; // not used by this implementation

						function from(value, encodingOrOffset, length) {
							if (typeof value === "string") {
								return fromString(value, encodingOrOffset);
							}

							if (ArrayBuffer.isView(value)) {
								return fromArrayLike(value);
							}

							if (value == null) {
								throw TypeError(
									"The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
										"or Array-like Object. Received type " +
										typeof value
								);
							}

							if (
								isInstance(value, ArrayBuffer) ||
								(value && isInstance(value.buffer, ArrayBuffer))
							) {
								return fromArrayBuffer(value, encodingOrOffset, length);
							}

							if (typeof value === "number") {
								throw new TypeError(
									'The "value" argument must not be of type number. Received type number'
								);
							}

							var valueOf = value.valueOf && value.valueOf();
							if (valueOf != null && valueOf !== value) {
								return Buffer.from(valueOf, encodingOrOffset, length);
							}

							var b = fromObject(value);
							if (b) return b;

							if (
								typeof Symbol !== "undefined" &&
								Symbol.toPrimitive != null &&
								typeof value[Symbol.toPrimitive] === "function"
							) {
								return Buffer.from(
									value[Symbol.toPrimitive]("string"),
									encodingOrOffset,
									length
								);
							}

							throw new TypeError(
								"The first argument must be one of type string, Buffer, ArrayBuffer, Array, " +
									"or Array-like Object. Received type " +
									typeof value
							);
						}

						/**
						 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
						 * if value is a number.
						 * Buffer.from(str[, encoding])
						 * Buffer.from(array)
						 * Buffer.from(buffer)
						 * Buffer.from(arrayBuffer[, byteOffset[, length]])
						 **/
						Buffer.from = function (value, encodingOrOffset, length) {
							return from(value, encodingOrOffset, length);
						};

						// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
						// https://github.com/feross/buffer/pull/148
						Buffer.prototype.__proto__ = Uint8Array.prototype;
						Buffer.__proto__ = Uint8Array;

						function assertSize(size) {
							if (typeof size !== "number") {
								throw new TypeError('"size" argument must be of type number');
							} else if (size < 0) {
								throw new RangeError(
									'The value "' + size + '" is invalid for option "size"'
								);
							}
						}

						function alloc(size, fill, encoding) {
							assertSize(size);
							if (size <= 0) {
								return createBuffer(size);
							}
							if (fill !== undefined) {
								// Only pay attention to encoding if it's a string. This
								// prevents accidentally sending in a number that would
								// be interpretted as a start offset.
								return typeof encoding === "string"
									? createBuffer(size).fill(fill, encoding)
									: createBuffer(size).fill(fill);
							}
							return createBuffer(size);
						}

						/**
						 * Creates a new filled Buffer instance.
						 * alloc(size[, fill[, encoding]])
						 **/
						Buffer.alloc = function (size, fill, encoding) {
							return alloc(size, fill, encoding);
						};

						function allocUnsafe(size) {
							assertSize(size);
							return createBuffer(size < 0 ? 0 : checked(size) | 0);
						}

						/**
						 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
						 * */
						Buffer.allocUnsafe = function (size) {
							return allocUnsafe(size);
						};
						/**
						 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
						 */
						Buffer.allocUnsafeSlow = function (size) {
							return allocUnsafe(size);
						};

						function fromString(string, encoding) {
							if (typeof encoding !== "string" || encoding === "") {
								encoding = "utf8";
							}

							if (!Buffer.isEncoding(encoding)) {
								throw new TypeError("Unknown encoding: " + encoding);
							}

							var length = byteLength(string, encoding) | 0;
							var buf = createBuffer(length);

							var actual = buf.write(string, encoding);

							if (actual !== length) {
								// Writing a hex string, for example, that contains invalid characters will
								// cause everything after the first invalid character to be ignored. (e.g.
								// 'abxxcd' will be treated as 'ab')
								buf = buf.slice(0, actual);
							}

							return buf;
						}

						function fromArrayLike(array) {
							var length = array.length < 0 ? 0 : checked(array.length) | 0;
							var buf = createBuffer(length);
							for (var i = 0; i < length; i += 1) {
								buf[i] = array[i] & 255;
							}
							return buf;
						}

						function fromArrayBuffer(array, byteOffset, length) {
							if (byteOffset < 0 || array.byteLength < byteOffset) {
								throw new RangeError('"offset" is outside of buffer bounds');
							}

							if (array.byteLength < byteOffset + (length || 0)) {
								throw new RangeError('"length" is outside of buffer bounds');
							}

							var buf;
							if (byteOffset === undefined && length === undefined) {
								buf = new Uint8Array(array);
							} else if (length === undefined) {
								buf = new Uint8Array(array, byteOffset);
							} else {
								buf = new Uint8Array(array, byteOffset, length);
							}

							// Return an augmented `Uint8Array` instance
							buf.__proto__ = Buffer.prototype;
							return buf;
						}

						function fromObject(obj) {
							if (Buffer.isBuffer(obj)) {
								var len = checked(obj.length) | 0;
								var buf = createBuffer(len);

								if (buf.length === 0) {
									return buf;
								}

								obj.copy(buf, 0, 0, len);
								return buf;
							}

							if (obj.length !== undefined) {
								if (typeof obj.length !== "number" || numberIsNaN(obj.length)) {
									return createBuffer(0);
								}
								return fromArrayLike(obj);
							}

							if (obj.type === "Buffer" && Array.isArray(obj.data)) {
								return fromArrayLike(obj.data);
							}
						}

						function checked(length) {
							// Note: cannot use `length < K_MAX_LENGTH` here because that fails when
							// length is NaN (which is otherwise coerced to zero.)
							if (length >= K_MAX_LENGTH) {
								throw new RangeError(
									"Attempt to allocate Buffer larger than maximum " +
										"size: 0x" +
										K_MAX_LENGTH.toString(16) +
										" bytes"
								);
							}
							return length | 0;
						}

						function SlowBuffer(length) {
							if (+length != length) {
								// eslint-disable-line eqeqeq
								length = 0;
							}
							return Buffer.alloc(+length);
						}

						Buffer.isBuffer = function isBuffer(b) {
							return (
								b != null && b._isBuffer === true && b !== Buffer.prototype
							); // so Buffer.isBuffer(Buffer.prototype) will be false
						};

						Buffer.compare = function compare(a, b) {
							if (isInstance(a, Uint8Array))
								a = Buffer.from(a, a.offset, a.byteLength);
							if (isInstance(b, Uint8Array))
								b = Buffer.from(b, b.offset, b.byteLength);
							if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
								throw new TypeError(
									'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
								);
							}

							if (a === b) return 0;

							var x = a.length;
							var y = b.length;

							for (var i = 0, len = Math.min(x, y); i < len; ++i) {
								if (a[i] !== b[i]) {
									x = a[i];
									y = b[i];
									break;
								}
							}

							if (x < y) return -1;
							if (y < x) return 1;
							return 0;
						};

						Buffer.isEncoding = function isEncoding(encoding) {
							switch (String(encoding).toLowerCase()) {
								case "hex":
								case "utf8":
								case "utf-8":
								case "ascii":
								case "latin1":
								case "binary":
								case "base64":
								case "ucs2":
								case "ucs-2":
								case "utf16le":
								case "utf-16le":
									return true;
								default:
									return false;
							}
						};

						Buffer.concat = function concat(list, length) {
							if (!Array.isArray(list)) {
								throw new TypeError(
									'"list" argument must be an Array of Buffers'
								);
							}

							if (list.length === 0) {
								return Buffer.alloc(0);
							}

							var i;
							if (length === undefined) {
								length = 0;
								for (i = 0; i < list.length; ++i) {
									length += list[i].length;
								}
							}

							var buffer = Buffer.allocUnsafe(length);
							var pos = 0;
							for (i = 0; i < list.length; ++i) {
								var buf = list[i];
								if (isInstance(buf, Uint8Array)) {
									buf = Buffer.from(buf);
								}
								if (!Buffer.isBuffer(buf)) {
									throw new TypeError(
										'"list" argument must be an Array of Buffers'
									);
								}
								buf.copy(buffer, pos);
								pos += buf.length;
							}
							return buffer;
						};

						function byteLength(string, encoding) {
							if (Buffer.isBuffer(string)) {
								return string.length;
							}
							if (
								ArrayBuffer.isView(string) ||
								isInstance(string, ArrayBuffer)
							) {
								return string.byteLength;
							}
							if (typeof string !== "string") {
								throw new TypeError(
									'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
										"Received type " +
										typeof string
								);
							}

							var len = string.length;
							var mustMatch = arguments.length > 2 && arguments[2] === true;
							if (!mustMatch && len === 0) return 0;

							// Use a for loop to avoid recursion
							var loweredCase = false;
							for (;;) {
								switch (encoding) {
									case "ascii":
									case "latin1":
									case "binary":
										return len;
									case "utf8":
									case "utf-8":
										return utf8ToBytes(string).length;
									case "ucs2":
									case "ucs-2":
									case "utf16le":
									case "utf-16le":
										return len * 2;
									case "hex":
										return len >>> 1;
									case "base64":
										return base64ToBytes(string).length;
									default:
										if (loweredCase) {
											return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
										}
										encoding = ("" + encoding).toLowerCase();
										loweredCase = true;
								}
							}
						}
						Buffer.byteLength = byteLength;

						function slowToString(encoding, start, end) {
							var loweredCase = false;

							// No need to verify that "this.length <= MAX_UINT32" since it's a read-only
							// property of a typed array.

							// This behaves neither like String nor Uint8Array in that we set start/end
							// to their upper/lower bounds if the value passed is out of range.
							// undefined is handled specially as per ECMA-262 6th Edition,
							// Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
							if (start === undefined || start < 0) {
								start = 0;
							}
							// Return early if start > this.length. Done here to prevent potential uint32
							// coercion fail below.
							if (start > this.length) {
								return "";
							}

							if (end === undefined || end > this.length) {
								end = this.length;
							}

							if (end <= 0) {
								return "";
							}

							// Force coersion to uint32. This will also coerce falsey/NaN values to 0.
							end >>>= 0;
							start >>>= 0;

							if (end <= start) {
								return "";
							}

							if (!encoding) encoding = "utf8";

							while (true) {
								switch (encoding) {
									case "hex":
										return hexSlice(this, start, end);

									case "utf8":
									case "utf-8":
										return utf8Slice(this, start, end);

									case "ascii":
										return asciiSlice(this, start, end);

									case "latin1":
									case "binary":
										return latin1Slice(this, start, end);

									case "base64":
										return base64Slice(this, start, end);

									case "ucs2":
									case "ucs-2":
									case "utf16le":
									case "utf-16le":
										return utf16leSlice(this, start, end);

									default:
										if (loweredCase)
											throw new TypeError("Unknown encoding: " + encoding);
										encoding = (encoding + "").toLowerCase();
										loweredCase = true;
								}
							}
						}

						// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
						// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
						// reliably in a browserify context because there could be multiple different
						// copies of the 'buffer' package in use. This method works even for Buffer
						// instances that were created from another copy of the `buffer` package.
						// See: https://github.com/feross/buffer/issues/154
						Buffer.prototype._isBuffer = true;

						function swap(b, n, m) {
							var i = b[n];
							b[n] = b[m];
							b[m] = i;
						}

						Buffer.prototype.swap16 = function swap16() {
							var len = this.length;
							if (len % 2 !== 0) {
								throw new RangeError(
									"Buffer size must be a multiple of 16-bits"
								);
							}
							for (var i = 0; i < len; i += 2) {
								swap(this, i, i + 1);
							}
							return this;
						};

						Buffer.prototype.swap32 = function swap32() {
							var len = this.length;
							if (len % 4 !== 0) {
								throw new RangeError(
									"Buffer size must be a multiple of 32-bits"
								);
							}
							for (var i = 0; i < len; i += 4) {
								swap(this, i, i + 3);
								swap(this, i + 1, i + 2);
							}
							return this;
						};

						Buffer.prototype.swap64 = function swap64() {
							var len = this.length;
							if (len % 8 !== 0) {
								throw new RangeError(
									"Buffer size must be a multiple of 64-bits"
								);
							}
							for (var i = 0; i < len; i += 8) {
								swap(this, i, i + 7);
								swap(this, i + 1, i + 6);
								swap(this, i + 2, i + 5);
								swap(this, i + 3, i + 4);
							}
							return this;
						};

						Buffer.prototype.toString = function toString() {
							var length = this.length;
							if (length === 0) return "";
							if (arguments.length === 0) return utf8Slice(this, 0, length);
							return slowToString.apply(this, arguments);
						};

						Buffer.prototype.toLocaleString = Buffer.prototype.toString;

						Buffer.prototype.equals = function equals(b) {
							if (!Buffer.isBuffer(b))
								throw new TypeError("Argument must be a Buffer");
							if (this === b) return true;
							return Buffer.compare(this, b) === 0;
						};

						Buffer.prototype.inspect = function inspect() {
							var str = "";
							var max = exports.INSPECT_MAX_BYTES;
							str = this.toString("hex", 0, max)
								.replace(/(.{2})/g, "$1 ")
								.trim();
							if (this.length > max) str += " ... ";
							return "<Buffer " + str + ">";
						};

						Buffer.prototype.compare = function compare(
							target,
							start,
							end,
							thisStart,
							thisEnd
						) {
							if (isInstance(target, Uint8Array)) {
								target = Buffer.from(target, target.offset, target.byteLength);
							}
							if (!Buffer.isBuffer(target)) {
								throw new TypeError(
									'The "target" argument must be one of type Buffer or Uint8Array. ' +
										"Received type " +
										typeof target
								);
							}

							if (start === undefined) {
								start = 0;
							}
							if (end === undefined) {
								end = target ? target.length : 0;
							}
							if (thisStart === undefined) {
								thisStart = 0;
							}
							if (thisEnd === undefined) {
								thisEnd = this.length;
							}

							if (
								start < 0 ||
								end > target.length ||
								thisStart < 0 ||
								thisEnd > this.length
							) {
								throw new RangeError("out of range index");
							}

							if (thisStart >= thisEnd && start >= end) {
								return 0;
							}
							if (thisStart >= thisEnd) {
								return -1;
							}
							if (start >= end) {
								return 1;
							}

							start >>>= 0;
							end >>>= 0;
							thisStart >>>= 0;
							thisEnd >>>= 0;

							if (this === target) return 0;

							var x = thisEnd - thisStart;
							var y = end - start;
							var len = Math.min(x, y);

							var thisCopy = this.slice(thisStart, thisEnd);
							var targetCopy = target.slice(start, end);

							for (var i = 0; i < len; ++i) {
								if (thisCopy[i] !== targetCopy[i]) {
									x = thisCopy[i];
									y = targetCopy[i];
									break;
								}
							}

							if (x < y) return -1;
							if (y < x) return 1;
							return 0;
						};

						// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
						// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
						//
						// Arguments:
						// - buffer - a Buffer to search
						// - val - a string, Buffer, or number
						// - byteOffset - an index into `buffer`; will be clamped to an int32
						// - encoding - an optional encoding, relevant is val is a string
						// - dir - true for indexOf, false for lastIndexOf
						function bidirectionalIndexOf(
							buffer,
							val,
							byteOffset,
							encoding,
							dir
						) {
							// Empty buffer means no match
							if (buffer.length === 0) return -1;

							// Normalize byteOffset
							if (typeof byteOffset === "string") {
								encoding = byteOffset;
								byteOffset = 0;
							} else if (byteOffset > 0x7fffffff) {
								byteOffset = 0x7fffffff;
							} else if (byteOffset < -0x80000000) {
								byteOffset = -0x80000000;
							}
							byteOffset = +byteOffset; // Coerce to Number.
							if (numberIsNaN(byteOffset)) {
								// byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
								byteOffset = dir ? 0 : buffer.length - 1;
							}

							// Normalize byteOffset: negative offsets start from the end of the buffer
							if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
							if (byteOffset >= buffer.length) {
								if (dir) return -1;
								else byteOffset = buffer.length - 1;
							} else if (byteOffset < 0) {
								if (dir) byteOffset = 0;
								else return -1;
							}

							// Normalize val
							if (typeof val === "string") {
								val = Buffer.from(val, encoding);
							}

							// Finally, search either indexOf (if dir is true) or lastIndexOf
							if (Buffer.isBuffer(val)) {
								// Special case: looking for empty string/buffer always fails
								if (val.length === 0) {
									return -1;
								}
								return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
							} else if (typeof val === "number") {
								val = val & 0xff; // Search for a byte value [0-255]
								if (typeof Uint8Array.prototype.indexOf === "function") {
									if (dir) {
										return Uint8Array.prototype.indexOf.call(
											buffer,
											val,
											byteOffset
										);
									} else {
										return Uint8Array.prototype.lastIndexOf.call(
											buffer,
											val,
											byteOffset
										);
									}
								}
								return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
							}

							throw new TypeError("val must be string, number or Buffer");
						}

						function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
							var indexSize = 1;
							var arrLength = arr.length;
							var valLength = val.length;

							if (encoding !== undefined) {
								encoding = String(encoding).toLowerCase();
								if (
									encoding === "ucs2" ||
									encoding === "ucs-2" ||
									encoding === "utf16le" ||
									encoding === "utf-16le"
								) {
									if (arr.length < 2 || val.length < 2) {
										return -1;
									}
									indexSize = 2;
									arrLength /= 2;
									valLength /= 2;
									byteOffset /= 2;
								}
							}

							function read(buf, i) {
								if (indexSize === 1) {
									return buf[i];
								} else {
									return buf.readUInt16BE(i * indexSize);
								}
							}

							var i;
							if (dir) {
								var foundIndex = -1;
								for (i = byteOffset; i < arrLength; i++) {
									if (
										read(arr, i) ===
										read(val, foundIndex === -1 ? 0 : i - foundIndex)
									) {
										if (foundIndex === -1) foundIndex = i;
										if (i - foundIndex + 1 === valLength)
											return foundIndex * indexSize;
									} else {
										if (foundIndex !== -1) i -= i - foundIndex;
										foundIndex = -1;
									}
								}
							} else {
								if (byteOffset + valLength > arrLength)
									byteOffset = arrLength - valLength;
								for (i = byteOffset; i >= 0; i--) {
									var found = true;
									for (var j = 0; j < valLength; j++) {
										if (read(arr, i + j) !== read(val, j)) {
											found = false;
											break;
										}
									}
									if (found) return i;
								}
							}

							return -1;
						}

						Buffer.prototype.includes = function includes(
							val,
							byteOffset,
							encoding
						) {
							return this.indexOf(val, byteOffset, encoding) !== -1;
						};

						Buffer.prototype.indexOf = function indexOf(
							val,
							byteOffset,
							encoding
						) {
							return bidirectionalIndexOf(
								this,
								val,
								byteOffset,
								encoding,
								true
							);
						};

						Buffer.prototype.lastIndexOf = function lastIndexOf(
							val,
							byteOffset,
							encoding
						) {
							return bidirectionalIndexOf(
								this,
								val,
								byteOffset,
								encoding,
								false
							);
						};

						function hexWrite(buf, string, offset, length) {
							offset = Number(offset) || 0;
							var remaining = buf.length - offset;
							if (!length) {
								length = remaining;
							} else {
								length = Number(length);
								if (length > remaining) {
									length = remaining;
								}
							}

							var strLen = string.length;

							if (length > strLen / 2) {
								length = strLen / 2;
							}
							for (var i = 0; i < length; ++i) {
								var parsed = parseInt(string.substr(i * 2, 2), 16);
								if (numberIsNaN(parsed)) return i;
								buf[offset + i] = parsed;
							}
							return i;
						}

						function utf8Write(buf, string, offset, length) {
							return blitBuffer(
								utf8ToBytes(string, buf.length - offset),
								buf,
								offset,
								length
							);
						}

						function asciiWrite(buf, string, offset, length) {
							return blitBuffer(asciiToBytes(string), buf, offset, length);
						}

						function latin1Write(buf, string, offset, length) {
							return asciiWrite(buf, string, offset, length);
						}

						function base64Write(buf, string, offset, length) {
							return blitBuffer(base64ToBytes(string), buf, offset, length);
						}

						function ucs2Write(buf, string, offset, length) {
							return blitBuffer(
								utf16leToBytes(string, buf.length - offset),
								buf,
								offset,
								length
							);
						}

						Buffer.prototype.write = function write(
							string,
							offset,
							length,
							encoding
						) {
							// Buffer#write(string)
							if (offset === undefined) {
								encoding = "utf8";
								length = this.length;
								offset = 0;
								// Buffer#write(string, encoding)
							} else if (length === undefined && typeof offset === "string") {
								encoding = offset;
								length = this.length;
								offset = 0;
								// Buffer#write(string, offset[, length][, encoding])
							} else if (isFinite(offset)) {
								offset = offset >>> 0;
								if (isFinite(length)) {
									length = length >>> 0;
									if (encoding === undefined) encoding = "utf8";
								} else {
									encoding = length;
									length = undefined;
								}
							} else {
								throw new Error(
									"Buffer.write(string, encoding, offset[, length]) is no longer supported"
								);
							}

							var remaining = this.length - offset;
							if (length === undefined || length > remaining)
								length = remaining;

							if (
								(string.length > 0 && (length < 0 || offset < 0)) ||
								offset > this.length
							) {
								throw new RangeError("Attempt to write outside buffer bounds");
							}

							if (!encoding) encoding = "utf8";

							var loweredCase = false;
							for (;;) {
								switch (encoding) {
									case "hex":
										return hexWrite(this, string, offset, length);

									case "utf8":
									case "utf-8":
										return utf8Write(this, string, offset, length);

									case "ascii":
										return asciiWrite(this, string, offset, length);

									case "latin1":
									case "binary":
										return latin1Write(this, string, offset, length);

									case "base64":
										// Warning: maxLength not taken into account in base64Write
										return base64Write(this, string, offset, length);

									case "ucs2":
									case "ucs-2":
									case "utf16le":
									case "utf-16le":
										return ucs2Write(this, string, offset, length);

									default:
										if (loweredCase)
											throw new TypeError("Unknown encoding: " + encoding);
										encoding = ("" + encoding).toLowerCase();
										loweredCase = true;
								}
							}
						};

						Buffer.prototype.toJSON = function toJSON() {
							return {
								type: "Buffer",
								data: Array.prototype.slice.call(this._arr || this, 0),
							};
						};

						function base64Slice(buf, start, end) {
							if (start === 0 && end === buf.length) {
								return base64.fromByteArray(buf);
							} else {
								return base64.fromByteArray(buf.slice(start, end));
							}
						}

						function utf8Slice(buf, start, end) {
							end = Math.min(buf.length, end);
							var res = [];

							var i = start;
							while (i < end) {
								var firstByte = buf[i];
								var codePoint = null;
								var bytesPerSequence =
									firstByte > 0xef
										? 4
										: firstByte > 0xdf
										? 3
										: firstByte > 0xbf
										? 2
										: 1;

								if (i + bytesPerSequence <= end) {
									var secondByte, thirdByte, fourthByte, tempCodePoint;

									switch (bytesPerSequence) {
										case 1:
											if (firstByte < 0x80) {
												codePoint = firstByte;
											}
											break;
										case 2:
											secondByte = buf[i + 1];
											if ((secondByte & 0xc0) === 0x80) {
												tempCodePoint =
													((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
												if (tempCodePoint > 0x7f) {
													codePoint = tempCodePoint;
												}
											}
											break;
										case 3:
											secondByte = buf[i + 1];
											thirdByte = buf[i + 2];
											if (
												(secondByte & 0xc0) === 0x80 &&
												(thirdByte & 0xc0) === 0x80
											) {
												tempCodePoint =
													((firstByte & 0xf) << 0xc) |
													((secondByte & 0x3f) << 0x6) |
													(thirdByte & 0x3f);
												if (
													tempCodePoint > 0x7ff &&
													(tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)
												) {
													codePoint = tempCodePoint;
												}
											}
											break;
										case 4:
											secondByte = buf[i + 1];
											thirdByte = buf[i + 2];
											fourthByte = buf[i + 3];
											if (
												(secondByte & 0xc0) === 0x80 &&
												(thirdByte & 0xc0) === 0x80 &&
												(fourthByte & 0xc0) === 0x80
											) {
												tempCodePoint =
													((firstByte & 0xf) << 0x12) |
													((secondByte & 0x3f) << 0xc) |
													((thirdByte & 0x3f) << 0x6) |
													(fourthByte & 0x3f);
												if (
													tempCodePoint > 0xffff &&
													tempCodePoint < 0x110000
												) {
													codePoint = tempCodePoint;
												}
											}
									}
								}

								if (codePoint === null) {
									// we did not generate a valid codePoint so insert a
									// replacement char (U+FFFD) and advance only 1 byte
									codePoint = 0xfffd;
									bytesPerSequence = 1;
								} else if (codePoint > 0xffff) {
									// encode to utf16 (surrogate pair dance)
									codePoint -= 0x10000;
									res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
									codePoint = 0xdc00 | (codePoint & 0x3ff);
								}

								res.push(codePoint);
								i += bytesPerSequence;
							}

							return decodeCodePointsArray(res);
						}

						// Based on http://stackoverflow.com/a/22747272/680742, the browser with
						// the lowest limit is Chrome, with 0x10000 args.
						// We go 1 magnitude less, for safety
						var MAX_ARGUMENTS_LENGTH = 0x1000;

						function decodeCodePointsArray(codePoints) {
							var len = codePoints.length;
							if (len <= MAX_ARGUMENTS_LENGTH) {
								return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
							}

							// Decode in chunks to avoid "call stack size exceeded".
							var res = "";
							var i = 0;
							while (i < len) {
								res += String.fromCharCode.apply(
									String,
									codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
								);
							}
							return res;
						}

						function asciiSlice(buf, start, end) {
							var ret = "";
							end = Math.min(buf.length, end);

							for (var i = start; i < end; ++i) {
								ret += String.fromCharCode(buf[i] & 0x7f);
							}
							return ret;
						}

						function latin1Slice(buf, start, end) {
							var ret = "";
							end = Math.min(buf.length, end);

							for (var i = start; i < end; ++i) {
								ret += String.fromCharCode(buf[i]);
							}
							return ret;
						}

						function hexSlice(buf, start, end) {
							var len = buf.length;

							if (!start || start < 0) start = 0;
							if (!end || end < 0 || end > len) end = len;

							var out = "";
							for (var i = start; i < end; ++i) {
								out += toHex(buf[i]);
							}
							return out;
						}

						function utf16leSlice(buf, start, end) {
							var bytes = buf.slice(start, end);
							var res = "";
							for (var i = 0; i < bytes.length; i += 2) {
								res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
							}
							return res;
						}

						Buffer.prototype.slice = function slice(start, end) {
							var len = this.length;
							start = ~~start;
							end = end === undefined ? len : ~~end;

							if (start < 0) {
								start += len;
								if (start < 0) start = 0;
							} else if (start > len) {
								start = len;
							}

							if (end < 0) {
								end += len;
								if (end < 0) end = 0;
							} else if (end > len) {
								end = len;
							}

							if (end < start) end = start;

							var newBuf = this.subarray(start, end);
							// Return an augmented `Uint8Array` instance
							newBuf.__proto__ = Buffer.prototype;
							return newBuf;
						};

						/*
						 * Need to make sure that buffer isn't trying to write out of bounds.
						 */
						function checkOffset(offset, ext, length) {
							if (offset % 1 !== 0 || offset < 0)
								throw new RangeError("offset is not uint");
							if (offset + ext > length)
								throw new RangeError("Trying to access beyond buffer length");
						}

						Buffer.prototype.readUIntLE = function readUIntLE(
							offset,
							byteLength,
							noAssert
						) {
							offset = offset >>> 0;
							byteLength = byteLength >>> 0;
							if (!noAssert) checkOffset(offset, byteLength, this.length);

							var val = this[offset];
							var mul = 1;
							var i = 0;
							while (++i < byteLength && (mul *= 0x100)) {
								val += this[offset + i] * mul;
							}

							return val;
						};

						Buffer.prototype.readUIntBE = function readUIntBE(
							offset,
							byteLength,
							noAssert
						) {
							offset = offset >>> 0;
							byteLength = byteLength >>> 0;
							if (!noAssert) {
								checkOffset(offset, byteLength, this.length);
							}

							var val = this[offset + --byteLength];
							var mul = 1;
							while (byteLength > 0 && (mul *= 0x100)) {
								val += this[offset + --byteLength] * mul;
							}

							return val;
						};

						Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 1, this.length);
							return this[offset];
						};

						Buffer.prototype.readUInt16LE = function readUInt16LE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 2, this.length);
							return this[offset] | (this[offset + 1] << 8);
						};

						Buffer.prototype.readUInt16BE = function readUInt16BE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 2, this.length);
							return (this[offset] << 8) | this[offset + 1];
						};

						Buffer.prototype.readUInt32LE = function readUInt32LE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 4, this.length);

							return (
								(this[offset] |
									(this[offset + 1] << 8) |
									(this[offset + 2] << 16)) +
								this[offset + 3] * 0x1000000
							);
						};

						Buffer.prototype.readUInt32BE = function readUInt32BE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 4, this.length);

							return (
								this[offset] * 0x1000000 +
								((this[offset + 1] << 16) |
									(this[offset + 2] << 8) |
									this[offset + 3])
							);
						};

						Buffer.prototype.readIntLE = function readIntLE(
							offset,
							byteLength,
							noAssert
						) {
							offset = offset >>> 0;
							byteLength = byteLength >>> 0;
							if (!noAssert) checkOffset(offset, byteLength, this.length);

							var val = this[offset];
							var mul = 1;
							var i = 0;
							while (++i < byteLength && (mul *= 0x100)) {
								val += this[offset + i] * mul;
							}
							mul *= 0x80;

							if (val >= mul) val -= Math.pow(2, 8 * byteLength);

							return val;
						};

						Buffer.prototype.readIntBE = function readIntBE(
							offset,
							byteLength,
							noAssert
						) {
							offset = offset >>> 0;
							byteLength = byteLength >>> 0;
							if (!noAssert) checkOffset(offset, byteLength, this.length);

							var i = byteLength;
							var mul = 1;
							var val = this[offset + --i];
							while (i > 0 && (mul *= 0x100)) {
								val += this[offset + --i] * mul;
							}
							mul *= 0x80;

							if (val >= mul) val -= Math.pow(2, 8 * byteLength);

							return val;
						};

						Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 1, this.length);
							if (!(this[offset] & 0x80)) return this[offset];
							return (0xff - this[offset] + 1) * -1;
						};

						Buffer.prototype.readInt16LE = function readInt16LE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 2, this.length);
							var val = this[offset] | (this[offset + 1] << 8);
							return val & 0x8000 ? val | 0xffff0000 : val;
						};

						Buffer.prototype.readInt16BE = function readInt16BE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 2, this.length);
							var val = this[offset + 1] | (this[offset] << 8);
							return val & 0x8000 ? val | 0xffff0000 : val;
						};

						Buffer.prototype.readInt32LE = function readInt32LE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 4, this.length);

							return (
								this[offset] |
								(this[offset + 1] << 8) |
								(this[offset + 2] << 16) |
								(this[offset + 3] << 24)
							);
						};

						Buffer.prototype.readInt32BE = function readInt32BE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 4, this.length);

							return (
								(this[offset] << 24) |
								(this[offset + 1] << 16) |
								(this[offset + 2] << 8) |
								this[offset + 3]
							);
						};

						Buffer.prototype.readFloatLE = function readFloatLE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 4, this.length);
							return ieee754.read(this, offset, true, 23, 4);
						};

						Buffer.prototype.readFloatBE = function readFloatBE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 4, this.length);
							return ieee754.read(this, offset, false, 23, 4);
						};

						Buffer.prototype.readDoubleLE = function readDoubleLE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 8, this.length);
							return ieee754.read(this, offset, true, 52, 8);
						};

						Buffer.prototype.readDoubleBE = function readDoubleBE(
							offset,
							noAssert
						) {
							offset = offset >>> 0;
							if (!noAssert) checkOffset(offset, 8, this.length);
							return ieee754.read(this, offset, false, 52, 8);
						};

						function checkInt(buf, value, offset, ext, max, min) {
							if (!Buffer.isBuffer(buf))
								throw new TypeError(
									'"buffer" argument must be a Buffer instance'
								);
							if (value > max || value < min)
								throw new RangeError('"value" argument is out of bounds');
							if (offset + ext > buf.length)
								throw new RangeError("Index out of range");
						}

						Buffer.prototype.writeUIntLE = function writeUIntLE(
							value,
							offset,
							byteLength,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							byteLength = byteLength >>> 0;
							if (!noAssert) {
								var maxBytes = Math.pow(2, 8 * byteLength) - 1;
								checkInt(this, value, offset, byteLength, maxBytes, 0);
							}

							var mul = 1;
							var i = 0;
							this[offset] = value & 0xff;
							while (++i < byteLength && (mul *= 0x100)) {
								this[offset + i] = (value / mul) & 0xff;
							}

							return offset + byteLength;
						};

						Buffer.prototype.writeUIntBE = function writeUIntBE(
							value,
							offset,
							byteLength,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							byteLength = byteLength >>> 0;
							if (!noAssert) {
								var maxBytes = Math.pow(2, 8 * byteLength) - 1;
								checkInt(this, value, offset, byteLength, maxBytes, 0);
							}

							var i = byteLength - 1;
							var mul = 1;
							this[offset + i] = value & 0xff;
							while (--i >= 0 && (mul *= 0x100)) {
								this[offset + i] = (value / mul) & 0xff;
							}

							return offset + byteLength;
						};

						Buffer.prototype.writeUInt8 = function writeUInt8(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
							this[offset] = value & 0xff;
							return offset + 1;
						};

						Buffer.prototype.writeUInt16LE = function writeUInt16LE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
							this[offset] = value & 0xff;
							this[offset + 1] = value >>> 8;
							return offset + 2;
						};

						Buffer.prototype.writeUInt16BE = function writeUInt16BE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
							this[offset] = value >>> 8;
							this[offset + 1] = value & 0xff;
							return offset + 2;
						};

						Buffer.prototype.writeUInt32LE = function writeUInt32LE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
							this[offset + 3] = value >>> 24;
							this[offset + 2] = value >>> 16;
							this[offset + 1] = value >>> 8;
							this[offset] = value & 0xff;
							return offset + 4;
						};

						Buffer.prototype.writeUInt32BE = function writeUInt32BE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
							this[offset] = value >>> 24;
							this[offset + 1] = value >>> 16;
							this[offset + 2] = value >>> 8;
							this[offset + 3] = value & 0xff;
							return offset + 4;
						};

						Buffer.prototype.writeIntLE = function writeIntLE(
							value,
							offset,
							byteLength,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) {
								var limit = Math.pow(2, 8 * byteLength - 1);

								checkInt(this, value, offset, byteLength, limit - 1, -limit);
							}

							var i = 0;
							var mul = 1;
							var sub = 0;
							this[offset] = value & 0xff;
							while (++i < byteLength && (mul *= 0x100)) {
								if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
									sub = 1;
								}
								this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
							}

							return offset + byteLength;
						};

						Buffer.prototype.writeIntBE = function writeIntBE(
							value,
							offset,
							byteLength,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) {
								var limit = Math.pow(2, 8 * byteLength - 1);

								checkInt(this, value, offset, byteLength, limit - 1, -limit);
							}

							var i = byteLength - 1;
							var mul = 1;
							var sub = 0;
							this[offset + i] = value & 0xff;
							while (--i >= 0 && (mul *= 0x100)) {
								if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
									sub = 1;
								}
								this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
							}

							return offset + byteLength;
						};

						Buffer.prototype.writeInt8 = function writeInt8(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
							if (value < 0) value = 0xff + value + 1;
							this[offset] = value & 0xff;
							return offset + 1;
						};

						Buffer.prototype.writeInt16LE = function writeInt16LE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
							this[offset] = value & 0xff;
							this[offset + 1] = value >>> 8;
							return offset + 2;
						};

						Buffer.prototype.writeInt16BE = function writeInt16BE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
							this[offset] = value >>> 8;
							this[offset + 1] = value & 0xff;
							return offset + 2;
						};

						Buffer.prototype.writeInt32LE = function writeInt32LE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert)
								checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
							this[offset] = value & 0xff;
							this[offset + 1] = value >>> 8;
							this[offset + 2] = value >>> 16;
							this[offset + 3] = value >>> 24;
							return offset + 4;
						};

						Buffer.prototype.writeInt32BE = function writeInt32BE(
							value,
							offset,
							noAssert
						) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert)
								checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
							if (value < 0) value = 0xffffffff + value + 1;
							this[offset] = value >>> 24;
							this[offset + 1] = value >>> 16;
							this[offset + 2] = value >>> 8;
							this[offset + 3] = value & 0xff;
							return offset + 4;
						};

						function checkIEEE754(buf, value, offset, ext, max, min) {
							if (offset + ext > buf.length)
								throw new RangeError("Index out of range");
							if (offset < 0) throw new RangeError("Index out of range");
						}

						function writeFloat(buf, value, offset, littleEndian, noAssert) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) {
								checkIEEE754(
									buf,
									value,
									offset,
									4,
									3.4028234663852886e38,
									-3.4028234663852886e38
								);
							}
							ieee754.write(buf, value, offset, littleEndian, 23, 4);
							return offset + 4;
						}

						Buffer.prototype.writeFloatLE = function writeFloatLE(
							value,
							offset,
							noAssert
						) {
							return writeFloat(this, value, offset, true, noAssert);
						};

						Buffer.prototype.writeFloatBE = function writeFloatBE(
							value,
							offset,
							noAssert
						) {
							return writeFloat(this, value, offset, false, noAssert);
						};

						function writeDouble(buf, value, offset, littleEndian, noAssert) {
							value = +value;
							offset = offset >>> 0;
							if (!noAssert) {
								checkIEEE754(
									buf,
									value,
									offset,
									8,
									1.7976931348623157e308,
									-1.7976931348623157e308
								);
							}
							ieee754.write(buf, value, offset, littleEndian, 52, 8);
							return offset + 8;
						}

						Buffer.prototype.writeDoubleLE = function writeDoubleLE(
							value,
							offset,
							noAssert
						) {
							return writeDouble(this, value, offset, true, noAssert);
						};

						Buffer.prototype.writeDoubleBE = function writeDoubleBE(
							value,
							offset,
							noAssert
						) {
							return writeDouble(this, value, offset, false, noAssert);
						};

						// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
						Buffer.prototype.copy = function copy(
							target,
							targetStart,
							start,
							end
						) {
							if (!Buffer.isBuffer(target))
								throw new TypeError("argument should be a Buffer");
							if (!start) start = 0;
							if (!end && end !== 0) end = this.length;
							if (targetStart >= target.length) targetStart = target.length;
							if (!targetStart) targetStart = 0;
							if (end > 0 && end < start) end = start;

							// Copy 0 bytes; we're done
							if (end === start) return 0;
							if (target.length === 0 || this.length === 0) return 0;

							// Fatal error conditions
							if (targetStart < 0) {
								throw new RangeError("targetStart out of bounds");
							}
							if (start < 0 || start >= this.length)
								throw new RangeError("Index out of range");
							if (end < 0) throw new RangeError("sourceEnd out of bounds");

							// Are we oob?
							if (end > this.length) end = this.length;
							if (target.length - targetStart < end - start) {
								end = target.length - targetStart + start;
							}

							var len = end - start;

							if (
								this === target &&
								typeof Uint8Array.prototype.copyWithin === "function"
							) {
								// Use built-in when available, missing from IE11
								this.copyWithin(targetStart, start, end);
							} else if (
								this === target &&
								start < targetStart &&
								targetStart < end
							) {
								// descending copy from end
								for (var i = len - 1; i >= 0; --i) {
									target[i + targetStart] = this[i + start];
								}
							} else {
								Uint8Array.prototype.set.call(
									target,
									this.subarray(start, end),
									targetStart
								);
							}

							return len;
						};

						// Usage:
						//    buffer.fill(number[, offset[, end]])
						//    buffer.fill(buffer[, offset[, end]])
						//    buffer.fill(string[, offset[, end]][, encoding])
						Buffer.prototype.fill = function fill(val, start, end, encoding) {
							// Handle string cases:
							if (typeof val === "string") {
								if (typeof start === "string") {
									encoding = start;
									start = 0;
									end = this.length;
								} else if (typeof end === "string") {
									encoding = end;
									end = this.length;
								}
								if (encoding !== undefined && typeof encoding !== "string") {
									throw new TypeError("encoding must be a string");
								}
								if (
									typeof encoding === "string" &&
									!Buffer.isEncoding(encoding)
								) {
									throw new TypeError("Unknown encoding: " + encoding);
								}
								if (val.length === 1) {
									var code = val.charCodeAt(0);
									if (
										(encoding === "utf8" && code < 128) ||
										encoding === "latin1"
									) {
										// Fast path: If `val` fits into a single byte, use that numeric value.
										val = code;
									}
								}
							} else if (typeof val === "number") {
								val = val & 255;
							}

							// Invalid ranges are not set to a default, so can range check early.
							if (start < 0 || this.length < start || this.length < end) {
								throw new RangeError("Out of range index");
							}

							if (end <= start) {
								return this;
							}

							start = start >>> 0;
							end = end === undefined ? this.length : end >>> 0;

							if (!val) val = 0;

							var i;
							if (typeof val === "number") {
								for (i = start; i < end; ++i) {
									this[i] = val;
								}
							} else {
								var bytes = Buffer.isBuffer(val)
									? val
									: Buffer.from(val, encoding);
								var len = bytes.length;
								if (len === 0) {
									throw new TypeError(
										'The value "' + val + '" is invalid for argument "value"'
									);
								}
								for (i = 0; i < end - start; ++i) {
									this[i + start] = bytes[i % len];
								}
							}

							return this;
						};

						// HELPER FUNCTIONS
						// ================

						var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

						function base64clean(str) {
							// Node takes equal signs as end of the Base64 encoding
							str = str.split("=")[0];
							// Node strips out invalid characters like \n and \t from the string, base64-js does not
							str = str.trim().replace(INVALID_BASE64_RE, "");
							// Node converts strings with length < 2 to ''
							if (str.length < 2) return "";
							// Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
							while (str.length % 4 !== 0) {
								str = str + "=";
							}
							return str;
						}

						function toHex(n) {
							if (n < 16) return "0" + n.toString(16);
							return n.toString(16);
						}

						function utf8ToBytes(string, units) {
							units = units || Infinity;
							var codePoint;
							var length = string.length;
							var leadSurrogate = null;
							var bytes = [];

							for (var i = 0; i < length; ++i) {
								codePoint = string.charCodeAt(i);

								// is surrogate component
								if (codePoint > 0xd7ff && codePoint < 0xe000) {
									// last char was a lead
									if (!leadSurrogate) {
										// no lead yet
										if (codePoint > 0xdbff) {
											// unexpected trail
											if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
											continue;
										} else if (i + 1 === length) {
											// unpaired lead
											if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
											continue;
										}

										// valid lead
										leadSurrogate = codePoint;

										continue;
									}

									// 2 leads in a row
									if (codePoint < 0xdc00) {
										if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
										leadSurrogate = codePoint;
										continue;
									}

									// valid surrogate pair
									codePoint =
										(((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) +
										0x10000;
								} else if (leadSurrogate) {
									// valid bmp char, but last char was a lead
									if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
								}

								leadSurrogate = null;

								// encode utf8
								if (codePoint < 0x80) {
									if ((units -= 1) < 0) break;
									bytes.push(codePoint);
								} else if (codePoint < 0x800) {
									if ((units -= 2) < 0) break;
									bytes.push(
										(codePoint >> 0x6) | 0xc0,
										(codePoint & 0x3f) | 0x80
									);
								} else if (codePoint < 0x10000) {
									if ((units -= 3) < 0) break;
									bytes.push(
										(codePoint >> 0xc) | 0xe0,
										((codePoint >> 0x6) & 0x3f) | 0x80,
										(codePoint & 0x3f) | 0x80
									);
								} else if (codePoint < 0x110000) {
									if ((units -= 4) < 0) break;
									bytes.push(
										(codePoint >> 0x12) | 0xf0,
										((codePoint >> 0xc) & 0x3f) | 0x80,
										((codePoint >> 0x6) & 0x3f) | 0x80,
										(codePoint & 0x3f) | 0x80
									);
								} else {
									throw new Error("Invalid code point");
								}
							}

							return bytes;
						}

						function asciiToBytes(str) {
							var byteArray = [];
							for (var i = 0; i < str.length; ++i) {
								// Node's code seems to be doing this and not & 0x7F..
								byteArray.push(str.charCodeAt(i) & 0xff);
							}
							return byteArray;
						}

						function utf16leToBytes(str, units) {
							var c, hi, lo;
							var byteArray = [];
							for (var i = 0; i < str.length; ++i) {
								if ((units -= 2) < 0) break;

								c = str.charCodeAt(i);
								hi = c >> 8;
								lo = c % 256;
								byteArray.push(lo);
								byteArray.push(hi);
							}

							return byteArray;
						}

						function base64ToBytes(str) {
							return base64.toByteArray(base64clean(str));
						}

						function blitBuffer(src, dst, offset, length) {
							for (var i = 0; i < length; ++i) {
								if (i + offset >= dst.length || i >= src.length) break;
								dst[i + offset] = src[i];
							}
							return i;
						}

						// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
						// the `instanceof` check but they should be treated as of that type.
						// See: https://github.com/feross/buffer/issues/166
						function isInstance(obj, type) {
							return (
								obj instanceof type ||
								(obj != null &&
									obj.constructor != null &&
									obj.constructor.name != null &&
									obj.constructor.name === type.name)
							);
						}
						function numberIsNaN(obj) {
							// For IE11 support
							return obj !== obj; // eslint-disable-line no-self-compare
						}
					}.call(this));
				}.call(this, require("buffer").Buffer));
			},
			{ "base64-js": 1, buffer: 2, ieee754: 3 },
		],
		3: [
			function (require, module, exports) {
				/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
				exports.read = function (buffer, offset, isLE, mLen, nBytes) {
					var e, m;
					var eLen = nBytes * 8 - mLen - 1;
					var eMax = (1 << eLen) - 1;
					var eBias = eMax >> 1;
					var nBits = -7;
					var i = isLE ? nBytes - 1 : 0;
					var d = isLE ? -1 : 1;
					var s = buffer[offset + i];

					i += d;

					e = s & ((1 << -nBits) - 1);
					s >>= -nBits;
					nBits += eLen;
					for (
						;
						nBits > 0;
						e = e * 256 + buffer[offset + i], i += d, nBits -= 8
					) {}

					m = e & ((1 << -nBits) - 1);
					e >>= -nBits;
					nBits += mLen;
					for (
						;
						nBits > 0;
						m = m * 256 + buffer[offset + i], i += d, nBits -= 8
					) {}

					if (e === 0) {
						e = 1 - eBias;
					} else if (e === eMax) {
						return m ? NaN : (s ? -1 : 1) * Infinity;
					} else {
						m = m + Math.pow(2, mLen);
						e = e - eBias;
					}
					return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
				};

				exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
					var e, m, c;
					var eLen = nBytes * 8 - mLen - 1;
					var eMax = (1 << eLen) - 1;
					var eBias = eMax >> 1;
					var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
					var i = isLE ? 0 : nBytes - 1;
					var d = isLE ? 1 : -1;
					var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

					value = Math.abs(value);

					if (isNaN(value) || value === Infinity) {
						m = isNaN(value) ? 1 : 0;
						e = eMax;
					} else {
						e = Math.floor(Math.log(value) / Math.LN2);
						if (value * (c = Math.pow(2, -e)) < 1) {
							e--;
							c *= 2;
						}
						if (e + eBias >= 1) {
							value += rt / c;
						} else {
							value += rt * Math.pow(2, 1 - eBias);
						}
						if (value * c >= 2) {
							e++;
							c /= 2;
						}

						if (e + eBias >= eMax) {
							m = 0;
							e = eMax;
						} else if (e + eBias >= 1) {
							m = (value * c - 1) * Math.pow(2, mLen);
							e = e + eBias;
						} else {
							m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
							e = 0;
						}
					}

					for (
						;
						mLen >= 8;
						buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8
					) {}

					e = (e << mLen) | m;
					eLen += mLen;
					for (
						;
						eLen > 0;
						buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8
					) {}

					buffer[offset + i - d] |= s * 128;
				};
			},
			{},
		],
		4: [
			function (require, module, exports) {
				// shim for using process in browser
				var process = (module.exports = {});

				// cached from whatever global is present so that test runners that stub it
				// don't break things.  But we need to wrap it in a try catch in case it is
				// wrapped in strict mode code which doesn't define any globals.  It's inside a
				// function because try/catches deoptimize in certain engines.

				var cachedSetTimeout;
				var cachedClearTimeout;

				function defaultSetTimout() {
					throw new Error("setTimeout has not been defined");
				}
				function defaultClearTimeout() {
					throw new Error("clearTimeout has not been defined");
				}
				(function () {
					try {
						if (typeof setTimeout === "function") {
							cachedSetTimeout = setTimeout;
						} else {
							cachedSetTimeout = defaultSetTimout;
						}
					} catch (e) {
						cachedSetTimeout = defaultSetTimout;
					}
					try {
						if (typeof clearTimeout === "function") {
							cachedClearTimeout = clearTimeout;
						} else {
							cachedClearTimeout = defaultClearTimeout;
						}
					} catch (e) {
						cachedClearTimeout = defaultClearTimeout;
					}
				})();
				function runTimeout(fun) {
					if (cachedSetTimeout === setTimeout) {
						//normal enviroments in sane situations
						return setTimeout(fun, 0);
					}
					// if setTimeout wasn't available but was latter defined
					if (
						(cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) &&
						setTimeout
					) {
						cachedSetTimeout = setTimeout;
						return setTimeout(fun, 0);
					}
					try {
						// when when somebody has screwed with setTimeout but no I.E. maddness
						return cachedSetTimeout(fun, 0);
					} catch (e) {
						try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
							return cachedSetTimeout.call(null, fun, 0);
						} catch (e) {
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
							return cachedSetTimeout.call(this, fun, 0);
						}
					}
				}
				function runClearTimeout(marker) {
					if (cachedClearTimeout === clearTimeout) {
						//normal enviroments in sane situations
						return clearTimeout(marker);
					}
					// if clearTimeout wasn't available but was latter defined
					if (
						(cachedClearTimeout === defaultClearTimeout ||
							!cachedClearTimeout) &&
						clearTimeout
					) {
						cachedClearTimeout = clearTimeout;
						return clearTimeout(marker);
					}
					try {
						// when when somebody has screwed with setTimeout but no I.E. maddness
						return cachedClearTimeout(marker);
					} catch (e) {
						try {
							// When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
							return cachedClearTimeout.call(null, marker);
						} catch (e) {
							// same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
							// Some versions of I.E. have different rules for clearTimeout vs setTimeout
							return cachedClearTimeout.call(this, marker);
						}
					}
				}
				var queue = [];
				var draining = false;
				var currentQueue;
				var queueIndex = -1;

				function cleanUpNextTick() {
					if (!draining || !currentQueue) {
						return;
					}
					draining = false;
					if (currentQueue.length) {
						queue = currentQueue.concat(queue);
					} else {
						queueIndex = -1;
					}
					if (queue.length) {
						drainQueue();
					}
				}

				function drainQueue() {
					if (draining) {
						return;
					}
					var timeout = runTimeout(cleanUpNextTick);
					draining = true;

					var len = queue.length;
					while (len) {
						currentQueue = queue;
						queue = [];
						while (++queueIndex < len) {
							if (currentQueue) {
								currentQueue[queueIndex].run();
							}
						}
						queueIndex = -1;
						len = queue.length;
					}
					currentQueue = null;
					draining = false;
					runClearTimeout(timeout);
				}

				process.nextTick = function (fun) {
					var args = new Array(arguments.length - 1);
					if (arguments.length > 1) {
						for (var i = 1; i < arguments.length; i++) {
							args[i - 1] = arguments[i];
						}
					}
					queue.push(new Item(fun, args));
					if (queue.length === 1 && !draining) {
						runTimeout(drainQueue);
					}
				};

				// v8 likes predictible objects
				function Item(fun, array) {
					this.fun = fun;
					this.array = array;
				}
				Item.prototype.run = function () {
					this.fun.apply(null, this.array);
				};
				process.title = "browser";
				process.browser = true;
				process.env = {};
				process.argv = [];
				process.version = ""; // empty string to avoid regexp issues
				process.versions = {};

				function noop() {}

				process.on = noop;
				process.addListener = noop;
				process.once = noop;
				process.off = noop;
				process.removeListener = noop;
				process.removeAllListeners = noop;
				process.emit = noop;
				process.prependListener = noop;
				process.prependOnceListener = noop;

				process.listeners = function (name) {
					return [];
				};

				process.binding = function (name) {
					throw new Error("process.binding is not supported");
				};

				process.cwd = function () {
					return "/";
				};
				process.chdir = function (dir) {
					throw new Error("process.chdir is not supported");
				};
				process.umask = function () {
					return 0;
				};
			},
			{},
		],
		5: [
			function (require, module, exports) {
				// const axios = require("axios");
				const axios = require("axios");
				// import supabase from "supabase";
				const { createClient } = require("@supabase/supabase-js");

				const DATABASE_URL = "https://ihboqqomxmcwyjbxrlpj.supabase.co";
				const SUPABASE_SERVICE_API_KEY =
					"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImloYm9xcW9teG1jd3lqYnhybHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MDI2NDc4OCwiZXhwIjoxOTg1ODQwNzg4fQ.7GEz9VZimvl44MZnelNMyXjmSEPXDnme6-9YX9d2z8g";
				const supabase = createClient(DATABASE_URL, SUPABASE_SERVICE_API_KEY);

				async function discordAuth() {
					const csrfState = Math.random().toString(36).substring(2);
					const clientId = "1009523640901058632";
					const redirectUri = "https://ambassador.openloot.com/discord-auth";
					const scopes = "activities.read,email,identify,guilds";
					const authUrl = `https://discord.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&state=${csrfState}&scope=email%20identify%20guilds&redirect_uri=${redirectUri}&prompt=consent`;

					// HERE we will be redirecting the user to twitch authorization page for oAuth
					window.location.href = authUrl;
				}
				async function sendCode() {
					// Get the user responseId from localstorage
					let userresponseId = localStorage.getItem("responseId");
					if (typeof window !== "undefined") {
						var url_string = window.location.href;
						var url = new URL(url_string);
						var code = url.searchParams.get("code");
						// HERE we make a post request to our backend running on cloud run with the code we got from twitch
						await axios.post("https://server-e4bkq5wbca-uc.a.run.app/discord", {
							code: `${code}`,
							responseId: `${userresponseId}`,
						});
					}
				}
				// Event listener for the discord button
				document.addEventListener("click", function (evnt) {
					if (evnt.target.id === "submitDiscord") {
						discordAuth();
					}
				});
				// Event listener for the discord button No
				document.addEventListener("click", function (evnt) {
					if (evnt.target.id === "submitDiscordNo") {
						window.location.href =
							"https://ambassador.openloot.com/tiktok-auth";
					}
				});
				// Checks the url for "code" and if it exists it will run the sendCode function and then redirect to the next page
				window.onload = function () {
					if (window.location.href.indexOf("code") > -1) {
						sendCode();
						window.location.href =
							"https://ambassador.openloot.com/tiktok-auth";
					}
				};
			},
			{ "@supabase/supabase-js": 47, axios: 54 },
		],
		6: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								var desc = Object.getOwnPropertyDescriptor(m, k);
								if (
									!desc ||
									("get" in desc
										? !m.__esModule
										: desc.writable || desc.configurable)
								) {
									desc = {
										enumerable: true,
										get: function () {
											return m[k];
										},
									};
								}
								Object.defineProperty(o, k2, desc);
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __setModuleDefault =
					(this && this.__setModuleDefault) ||
					(Object.create
						? function (o, v) {
								Object.defineProperty(o, "default", {
									enumerable: true,
									value: v,
								});
						  }
						: function (o, v) {
								o["default"] = v;
						  });
				var __importStar =
					(this && this.__importStar) ||
					function (mod) {
						if (mod && mod.__esModule) return mod;
						var result = {};
						if (mod != null)
							for (var k in mod)
								if (
									k !== "default" &&
									Object.prototype.hasOwnProperty.call(mod, k)
								)
									__createBinding(result, mod, k);
						__setModuleDefault(result, mod);
						return result;
					};
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.resolveFetch = void 0;
				const resolveFetch = (customFetch) => {
					let _fetch;
					if (customFetch) {
						_fetch = customFetch;
					} else if (typeof fetch === "undefined") {
						_fetch = (...args) =>
							__awaiter(void 0, void 0, void 0, function* () {
								return yield (yield Promise.resolve().then(() =>
									__importStar(require("cross-fetch"))
								)).fetch(...args);
							});
					} else {
						_fetch = fetch;
					}
					return (...args) => _fetch(...args);
				};
				exports.resolveFetch = resolveFetch;
			},
			{ "cross-fetch": 86 },
		],
		7: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.FunctionsClient = void 0;
				const helper_1 = require("./helper");
				class FunctionsClient {
					constructor(url, { headers = {}, customFetch } = {}) {
						this.url = url;
						this.headers = headers;
						this.fetch = (0, helper_1.resolveFetch)(customFetch);
					}
					/**
					 * Updates the authorization header
					 * @params token - the new jwt token sent in the authorisation header
					 */
					setAuth(token) {
						this.headers.Authorization = `Bearer ${token}`;
					}
					/**
					 * Invokes a function
					 * @param functionName - the name of the function to invoke
					 * @param invokeOptions - object with the following properties
					 * `headers`: object representing the headers to send with the request
					 * `body`: the body of the request
					 * `responseType`: how the response should be parsed. The default is `json`
					 */
					invoke(functionName, invokeOptions) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const { headers, body } =
									invokeOptions !== null && invokeOptions !== void 0
										? invokeOptions
										: {};
								const response = yield this.fetch(
									`${this.url}/${functionName}`,
									{
										method: "POST",
										headers: Object.assign({}, this.headers, headers),
										body,
									}
								);
								const isRelayError = response.headers.get("x-relay-error");
								if (isRelayError && isRelayError === "true") {
									return {
										data: null,
										error: new Error(yield response.text()),
									};
								}
								let data;
								const { responseType } =
									invokeOptions !== null && invokeOptions !== void 0
										? invokeOptions
										: {};
								if (!responseType || responseType === "json") {
									data = yield response.json();
								} else if (responseType === "arrayBuffer") {
									data = yield response.arrayBuffer();
								} else if (responseType === "blob") {
									data = yield response.blob();
								} else {
									data = yield response.text();
								}
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
				}
				exports.FunctionsClient = FunctionsClient;
			},
			{ "./helper": 6 },
		],
		8: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const fetch_1 = require("./lib/fetch");
				const constants_1 = require("./lib/constants");
				const cookies_1 = require("./lib/cookies");
				const helpers_1 = require("./lib/helpers");
				class GoTrueApi {
					constructor({ url = "", headers = {}, cookieOptions, fetch }) {
						this.url = url;
						this.headers = headers;
						this.cookieOptions = Object.assign(
							Object.assign({}, constants_1.COOKIE_OPTIONS),
							cookieOptions
						);
						this.fetch = (0, helpers_1.resolveFetch)(fetch);
					}
					/**
					 * Create a temporary object with all configured headers and
					 * adds the Authorization token to be used on request methods
					 * @param jwt A valid, logged-in JWT.
					 */
					_createRequestHeaders(jwt) {
						const headers = Object.assign({}, this.headers);
						headers["Authorization"] = `Bearer ${jwt}`;
						return headers;
					}
					cookieName() {
						var _a;
						return (_a = this.cookieOptions.name) !== null && _a !== void 0
							? _a
							: "";
					}
					/**
					 * Generates the relevant login URL for a third-party provider.
					 * @param provider One of the providers supported by GoTrue.
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 * @param scopes A space-separated list of scopes granted to the OAuth application.
					 */
					getUrlForProvider(provider, options) {
						const urlParams = [`provider=${encodeURIComponent(provider)}`];
						if (
							options === null || options === void 0
								? void 0
								: options.redirectTo
						) {
							urlParams.push(
								`redirect_to=${encodeURIComponent(options.redirectTo)}`
							);
						}
						if (
							options === null || options === void 0 ? void 0 : options.scopes
						) {
							urlParams.push(`scopes=${encodeURIComponent(options.scopes)}`);
						}
						if (
							options === null || options === void 0
								? void 0
								: options.queryParams
						) {
							const query = new URLSearchParams(options.queryParams);
							urlParams.push(`${query}`);
						}
						return `${this.url}/authorize?${urlParams.join("&")}`;
					}
					/**
					 * Creates a new user using their email address.
					 * @param email The email address of the user.
					 * @param password The password of the user.
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 * @param data Optional user metadata.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 *
					 * @returns A logged-in session if the server has "autoconfirm" ON
					 * @returns A user if the server has "autoconfirm" OFF
					 */
					signUpWithEmail(email, password, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								let queryString = "";
								if (options.redirectTo) {
									queryString =
										"?redirect_to=" + encodeURIComponent(options.redirectTo);
								}
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/signup${queryString}`,
									{
										email,
										password,
										data: options.data,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Logs in an existing user using their email address.
					 * @param email The email address of the user.
					 * @param password The password of the user.
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 */
					signInWithEmail(email, password, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								let queryString = "?grant_type=password";
								if (options.redirectTo) {
									queryString +=
										"&redirect_to=" + encodeURIComponent(options.redirectTo);
								}
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/token${queryString}`,
									{
										email,
										password,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Signs up a new user using their phone number and a password.
					 * @param phone The phone number of the user.
					 * @param password The password of the user.
					 * @param data Optional user metadata.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 */
					signUpWithPhone(phone, password, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/signup`,
									{
										phone,
										password,
										data: options.data,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Logs in an existing user using their phone number and password.
					 * @param phone The phone number of the user.
					 * @param password The password of the user.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 */
					signInWithPhone(phone, password, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								const queryString = "?grant_type=password";
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/token${queryString}`,
									{
										phone,
										password,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Logs in an OpenID Connect user using their id_token.
					 * @param id_token The IDToken of the user.
					 * @param nonce The nonce of the user. The nonce is a random value generated by the developer (= yourself) before the initial grant is started. You should check the OpenID Connect specification for details. https://openid.net/developers/specs/
					 * @param provider The provider of the user.
					 * @param client_id The clientID of the user.
					 * @param issuer The issuer of the user.
					 */
					signInWithOpenIDConnect({
						id_token,
						nonce,
						client_id,
						issuer,
						provider,
					}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								const queryString = "?grant_type=id_token";
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/token${queryString}`,
									{ id_token, nonce, client_id, issuer, provider },
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Sends a magic login link to an email address.
					 * @param email The email address of the user.
					 * @param shouldCreateUser A boolean flag to indicate whether to automatically create a user on magiclink / otp sign-ins if the user doesn't exist. Defaults to true.
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 */
					sendMagicLinkEmail(email, options = {}) {
						var _a;
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								let queryString = "";
								if (options.redirectTo) {
									queryString +=
										"?redirect_to=" + encodeURIComponent(options.redirectTo);
								}
								const shouldCreateUser =
									(_a = options.shouldCreateUser) !== null && _a !== void 0
										? _a
										: true;
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/otp${queryString}`,
									{
										email,
										create_user: shouldCreateUser,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								return { data, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Sends a mobile OTP via SMS. Will register the account if it doesn't already exist
					 * @param phone The user's phone number WITH international prefix
					 * @param shouldCreateUser A boolean flag to indicate whether to automatically create a user on magiclink / otp sign-ins if the user doesn't exist. Defaults to true.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 */
					sendMobileOTP(phone, options = {}) {
						var _a;
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const shouldCreateUser =
									(_a = options.shouldCreateUser) !== null && _a !== void 0
										? _a
										: true;
								const headers = Object.assign({}, this.headers);
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/otp`,
									{
										phone,
										create_user: shouldCreateUser,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								return { data, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Removes a logged-in session.
					 * @param jwt A valid, logged-in JWT.
					 */
					signOut(jwt) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								yield (0,
								fetch_1.post)(this.fetch, `${this.url}/logout`, {}, { headers: this._createRequestHeaders(jwt), noResolveJson: true });
								return { error: null };
							} catch (e) {
								return { error: e };
							}
						});
					}
					/**
					 * @deprecated Use `verifyOTP` instead!
					 * @param phone The user's phone number WITH international prefix
					 * @param token token that user was sent to their mobile phone
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 */
					verifyMobileOTP(phone, token, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/verify`,
									{
										phone,
										token,
										type: "sms",
										redirect_to: options.redirectTo,
									},
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Send User supplied Email / Mobile OTP to be verified
					 * @param email The user's email address
					 * @param phone The user's phone number WITH international prefix
					 * @param token token that user was sent to their mobile phone
					 * @param type verification type that the otp is generated for
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 */
					verifyOTP({ email, phone, token, type = "sms" }, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/verify`,
									{
										email,
										phone,
										token,
										type,
										redirect_to: options.redirectTo,
									},
									{ headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Sends an invite link to an email address.
					 * @param email The email address of the user.
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 * @param data Optional user metadata
					 */
					inviteUserByEmail(email, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								let queryString = "";
								if (options.redirectTo) {
									queryString +=
										"?redirect_to=" + encodeURIComponent(options.redirectTo);
								}
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/invite${queryString}`,
									{ email, data: options.data },
									{ headers }
								);
								return { data, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Sends a reset request to an email address.
					 * @param email The email address of the user.
					 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
					 * @param captchaToken Verification token received when the user completes the captcha on your site.
					 */
					resetPasswordForEmail(email, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const headers = Object.assign({}, this.headers);
								let queryString = "";
								if (options.redirectTo) {
									queryString +=
										"?redirect_to=" + encodeURIComponent(options.redirectTo);
								}
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/recover${queryString}`,
									{
										email,
										gotrue_meta_security: {
											captcha_token: options.captchaToken,
										},
									},
									{ headers }
								);
								return { data, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Generates a new JWT.
					 * @param refreshToken A valid refresh token that was returned on login.
					 */
					refreshAccessToken(refreshToken) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/token?grant_type=refresh_token`,
									{ refresh_token: refreshToken },
									{ headers: this.headers }
								);
								const session = Object.assign({}, data);
								if (session.expires_in)
									session.expires_at = (0, helpers_1.expiresAt)(
										data.expires_in
									);
								return { data: session, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Set/delete the auth cookie based on the AuthChangeEvent.
					 * Works for Next.js & Express (requires cookie-parser middleware).
					 * @param req The request object.
					 * @param res The response object.
					 */
					setAuthCookie(req, res) {
						if (req.method !== "POST") {
							res.setHeader("Allow", "POST");
							res.status(405).end("Method Not Allowed");
						}
						const { event, session } = req.body;
						if (!event) throw new Error("Auth event missing!");
						if (event === "SIGNED_IN") {
							if (!session) throw new Error("Auth session missing!");
							(0, cookies_1.setCookies)(
								req,
								res,
								[
									{ key: "access-token", value: session.access_token },
									{ key: "refresh-token", value: session.refresh_token },
								].map((token) => {
									var _a;
									return {
										name: `${this.cookieName()}-${token.key}`,
										value: token.value,
										domain: this.cookieOptions.domain,
										maxAge:
											(_a = this.cookieOptions.lifetime) !== null &&
											_a !== void 0
												? _a
												: 0,
										path: this.cookieOptions.path,
										sameSite: this.cookieOptions.sameSite,
									};
								})
							);
						}
						if (event === "SIGNED_OUT") {
							(0, cookies_1.setCookies)(
								req,
								res,
								["access-token", "refresh-token"].map((key) => ({
									name: `${this.cookieName()}-${key}`,
									value: "",
									maxAge: -1,
								}))
							);
						}
						res.status(200).json({});
					}
					/**
					 * Deletes the Auth Cookies and redirects to the
					 * @param req The request object.
					 * @param res The response object.
					 * @param options Optionally specify a `redirectTo` URL in the options.
					 */
					deleteAuthCookie(req, res, { redirectTo = "/" }) {
						(0, cookies_1.setCookies)(
							req,
							res,
							["access-token", "refresh-token"].map((key) => ({
								name: `${this.cookieName()}-${key}`,
								value: "",
								maxAge: -1,
							}))
						);
						return res.redirect(307, redirectTo);
					}
					/**
					 * Helper method to generate the Auth Cookie string for you in case you can't use `setAuthCookie`.
					 * @param req The request object.
					 * @param res The response object.
					 * @returns The Cookie string that needs to be set as the value for the `Set-Cookie` header.
					 */
					getAuthCookieString(req, res) {
						if (req.method !== "POST") {
							res.setHeader("Allow", "POST");
							res.status(405).end("Method Not Allowed");
						}
						const { event, session } = req.body;
						if (!event) throw new Error("Auth event missing!");
						if (event === "SIGNED_IN") {
							if (!session) throw new Error("Auth session missing!");
							return (0, cookies_1.getCookieString)(
								req,
								res,
								[
									{ key: "access-token", value: session.access_token },
									{ key: "refresh-token", value: session.refresh_token },
								].map((token) => {
									var _a;
									return {
										name: `${this.cookieName()}-${token.key}`,
										value: token.value,
										domain: this.cookieOptions.domain,
										maxAge:
											(_a = this.cookieOptions.lifetime) !== null &&
											_a !== void 0
												? _a
												: 0,
										path: this.cookieOptions.path,
										sameSite: this.cookieOptions.sameSite,
									};
								})
							);
						}
						if (event === "SIGNED_OUT") {
							return (0, cookies_1.getCookieString)(
								req,
								res,
								["access-token", "refresh-token"].map((key) => ({
									name: `${this.cookieName()}-${key}`,
									value: "",
									maxAge: -1,
								}))
							);
						}
						return res.getHeader("Set-Cookie");
					}
					/**
					 * Generates links to be sent via email or other.
					 * @param type The link type ("signup" or "magiclink" or "recovery" or "invite").
					 * @param email The user's email.
					 * @param password User password. For signup only.
					 * @param data Optional user metadata. For signup only.
					 * @param redirectTo The link type ("signup" or "magiclink" or "recovery" or "invite").
					 */
					generateLink(type, email, options = {}) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/admin/generate_link`,
									{
										type,
										email,
										password: options.password,
										data: options.data,
										redirect_to: options.redirectTo,
									},
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					// User Admin API
					/**
					 * Creates a new user.
					 *
					 * This function should only be called on a server. Never expose your `service_role` key in the browser.
					 *
					 * @param attributes The data you want to create the user with.
					 */
					createUser(attributes) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.post)(
									this.fetch,
									`${this.url}/admin/users`,
									attributes,
									{
										headers: this.headers,
									}
								);
								return { user: data, data, error: null };
							} catch (e) {
								return { user: null, data: null, error: e };
							}
						});
					}
					/**
					 * Get a list of users.
					 *
					 * This function should only be called on a server. Never expose your `service_role` key in the browser.
					 */
					listUsers() {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.get)(
									this.fetch,
									`${this.url}/admin/users`,
									{
										headers: this.headers,
									}
								);
								return { data: data.users, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Get user by id.
					 *
					 * @param uid The user's unique identifier
					 *
					 * This function should only be called on a server. Never expose your `service_role` key in the browser.
					 */
					getUserById(uid) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.get)(
									this.fetch,
									`${this.url}/admin/users/${uid}`,
									{
										headers: this.headers,
									}
								);
								return { data, error: null };
							} catch (e) {
								return { data: null, error: e };
							}
						});
					}
					/**
					 * Get user by reading the cookie from the request.
					 * Works for Next.js & Express (requires cookie-parser middleware).
					 */
					getUserByCookie(req, res) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								if (!req.cookies) {
									throw new Error(
										"Not able to parse cookies! When using Express make sure the cookie-parser middleware is in use!"
									);
								}
								const access_token =
									req.cookies[`${this.cookieName()}-access-token`];
								const refresh_token =
									req.cookies[`${this.cookieName()}-refresh-token`];
								if (!access_token) {
									throw new Error("No cookie found!");
								}
								const { user, error: getUserError } = yield this.getUser(
									access_token
								);
								if (getUserError) {
									if (!refresh_token)
										throw new Error("No refresh_token cookie found!");
									if (!res)
										throw new Error(
											"You need to pass the res object to automatically refresh the session!"
										);
									const { data, error } = yield this.refreshAccessToken(
										refresh_token
									);
									if (error) {
										throw error;
									} else if (data) {
										(0, cookies_1.setCookies)(
											req,
											res,
											[
												{ key: "access-token", value: data.access_token },
												{ key: "refresh-token", value: data.refresh_token },
											].map((token) => {
												var _a;
												return {
													name: `${this.cookieName()}-${token.key}`,
													value: token.value,
													domain: this.cookieOptions.domain,
													maxAge:
														(_a = this.cookieOptions.lifetime) !== null &&
														_a !== void 0
															? _a
															: 0,
													path: this.cookieOptions.path,
													sameSite: this.cookieOptions.sameSite,
												};
											})
										);
										return {
											token: data.access_token,
											user: data.user,
											data: data.user,
											error: null,
										};
									}
								}
								return {
									token: access_token,
									user: user,
									data: user,
									error: null,
								};
							} catch (e) {
								return { token: null, user: null, data: null, error: e };
							}
						});
					}
					/**
					 * Updates the user data.
					 *
					 * @param attributes The data you want to update.
					 *
					 * This function should only be called on a server. Never expose your `service_role` key in the browser.
					 */
					updateUserById(uid, attributes) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								this; //
								const data = yield (0, fetch_1.put)(
									this.fetch,
									`${this.url}/admin/users/${uid}`,
									attributes,
									{
										headers: this.headers,
									}
								);
								return { user: data, data, error: null };
							} catch (e) {
								return { user: null, data: null, error: e };
							}
						});
					}
					/**
					 * Delete a user. Requires a `service_role` key.
					 *
					 * This function should only be called on a server. Never expose your `service_role` key in the browser.
					 *
					 * @param uid The user uid you want to remove.
					 */
					deleteUser(uid) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.remove)(
									this.fetch,
									`${this.url}/admin/users/${uid}`,
									{},
									{
										headers: this.headers,
									}
								);
								return { user: data, data, error: null };
							} catch (e) {
								return { user: null, data: null, error: e };
							}
						});
					}
					/**
					 * Gets the current user details.
					 *
					 * This method is called by the GoTrueClient `update` where
					 * the jwt is set to this.currentSession.access_token
					 * and therefore, acts like getting the currently authenticated user
					 *
					 * @param jwt A valid, logged-in JWT. Typically, the access_token for the currentSession
					 */
					getUser(jwt) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.get)(
									this.fetch,
									`${this.url}/user`,
									{
										headers: this._createRequestHeaders(jwt),
									}
								);
								return { user: data, data, error: null };
							} catch (e) {
								return { user: null, data: null, error: e };
							}
						});
					}
					/**
					 * Updates the user data.
					 * @param jwt A valid, logged-in JWT.
					 * @param attributes The data you want to update.
					 */
					updateUser(jwt, attributes) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield (0, fetch_1.put)(
									this.fetch,
									`${this.url}/user`,
									attributes,
									{
										headers: this._createRequestHeaders(jwt),
									}
								);
								return { user: data, data, error: null };
							} catch (e) {
								return { user: null, data: null, error: e };
							}
						});
					}
				}
				exports.default = GoTrueApi;
			},
			{
				"./lib/constants": 11,
				"./lib/cookies": 12,
				"./lib/fetch": 13,
				"./lib/helpers": 14,
			},
		],
		9: [
			function (require, module, exports) {
				(function (Buffer) {
					(function () {
						"use strict";
						var __awaiter =
							(this && this.__awaiter) ||
							function (thisArg, _arguments, P, generator) {
								function adopt(value) {
									return value instanceof P
										? value
										: new P(function (resolve) {
												resolve(value);
										  });
								}
								return new (P || (P = Promise))(function (resolve, reject) {
									function fulfilled(value) {
										try {
											step(generator.next(value));
										} catch (e) {
											reject(e);
										}
									}
									function rejected(value) {
										try {
											step(generator["throw"](value));
										} catch (e) {
											reject(e);
										}
									}
									function step(result) {
										result.done
											? resolve(result.value)
											: adopt(result.value).then(fulfilled, rejected);
									}
									step(
										(generator = generator.apply(
											thisArg,
											_arguments || []
										)).next()
									);
								});
							};
						var __importDefault =
							(this && this.__importDefault) ||
							function (mod) {
								return mod && mod.__esModule ? mod : { default: mod };
							};
						Object.defineProperty(exports, "__esModule", { value: true });
						const GoTrueApi_1 = __importDefault(require("./GoTrueApi"));
						const helpers_1 = require("./lib/helpers");
						const constants_1 = require("./lib/constants");
						const polyfills_1 = require("./lib/polyfills");
						(0, polyfills_1.polyfillGlobalThis)(); // Make "globalThis" available
						const DEFAULT_OPTIONS = {
							url: constants_1.GOTRUE_URL,
							autoRefreshToken: true,
							persistSession: true,
							detectSessionInUrl: true,
							multiTab: true,
							headers: constants_1.DEFAULT_HEADERS,
						};
						const decodeBase64URL = (value) => {
							try {
								// atob is present in all browsers and nodejs >= 16
								// but if it is not it will throw a ReferenceError in which case we can try to use Buffer
								// replace are here to convert the Base64-URL into Base64 which is what atob supports
								// replace with //g regex acts like replaceAll
								return atob(value.replace(/[-]/g, "+").replace(/[_]/g, "/"));
							} catch (e) {
								if (e instanceof ReferenceError) {
									// running on nodejs < 16
									// Buffer supports Base64-URL transparently
									return Buffer.from(value, "base64").toString("utf-8");
								} else {
									throw e;
								}
							}
						};
						class GoTrueClient {
							/**
							 * Create a new client for use in the browser.
							 * @param options.url The URL of the GoTrue server.
							 * @param options.headers Any additional headers to send to the GoTrue server.
							 * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
							 * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
							 * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
							 * @param options.localStorage Provide your own local storage implementation to use instead of the browser's local storage.
							 * @param options.multiTab Set to "false" if you want to disable multi-tab/window events.
							 * @param options.cookieOptions
							 * @param options.fetch A custom fetch implementation.
							 */
							constructor(options) {
								this.stateChangeEmitters = new Map();
								this.networkRetries = 0;
								const settings = Object.assign(
									Object.assign({}, DEFAULT_OPTIONS),
									options
								);
								this.currentUser = null;
								this.currentSession = null;
								this.autoRefreshToken = settings.autoRefreshToken;
								this.persistSession = settings.persistSession;
								this.multiTab = settings.multiTab;
								this.localStorage =
									settings.localStorage || globalThis.localStorage;
								this.api = new GoTrueApi_1.default({
									url: settings.url,
									headers: settings.headers,
									cookieOptions: settings.cookieOptions,
									fetch: settings.fetch,
								});
								this._recoverSession();
								this._recoverAndRefresh();
								this._listenForMultiTabEvents();
								this._handleVisibilityChange();
								if (
									settings.detectSessionInUrl &&
									(0, helpers_1.isBrowser)() &&
									!!(0, helpers_1.getParameterByName)("access_token")
								) {
									// Handle the OAuth redirect
									this.getSessionFromUrl({ storeSession: true }).then(
										({ error }) => {
											if (error) {
												throw new Error("Error getting session from URL.");
											}
										}
									);
								}
							}
							/**
							 * Creates a new user.
							 * @type UserCredentials
							 * @param email The user's email address.
							 * @param password The user's password.
							 * @param phone The user's phone number.
							 * @param redirectTo The redirect URL attached to the signup confirmation link. Does not redirect the user if it's a mobile signup.
							 * @param data Optional user metadata.
							 */
							signUp({ email, password, phone }, options = {}) {
								return __awaiter(this, void 0, void 0, function* () {
									try {
										this._removeSession();
										const { data, error } =
											phone && password
												? yield this.api.signUpWithPhone(phone, password, {
														data: options.data,
														captchaToken: options.captchaToken,
												  })
												: yield this.api.signUpWithEmail(email, password, {
														redirectTo: options.redirectTo,
														data: options.data,
														captchaToken: options.captchaToken,
												  });
										if (error) {
											throw error;
										}
										if (!data) {
											throw "An error occurred on sign up.";
										}
										let session = null;
										let user = null;
										if (data.access_token) {
											session = data;
											user = session.user;
											this._saveSession(session);
											this._notifyAllSubscribers("SIGNED_IN");
										}
										if (data.id) {
											user = data;
										}
										return { user, session, error: null };
									} catch (e) {
										return { user: null, session: null, error: e };
									}
								});
							}
							/**
							 * Log in an existing user, or login via a third-party provider.
							 * @type UserCredentials
							 * @param email The user's email address.
							 * @param phone The user's phone number.
							 * @param password The user's password.
							 * @param refreshToken A valid refresh token that was returned on login.
							 * @param provider One of the providers supported by GoTrue.
							 * @param redirectTo A URL to send the user to after they are confirmed (OAuth logins only).
							 * @param shouldCreateUser A boolean flag to indicate whether to automatically create a user on magiclink / otp sign-ins if the user doesn't exist. Defaults to true.
							 * @param scopes A space-separated list of scopes granted to the OAuth application.
							 */
							signIn(
								{ email, phone, password, refreshToken, provider, oidc },
								options = {}
							) {
								return __awaiter(this, void 0, void 0, function* () {
									try {
										this._removeSession();
										if (email && !password) {
											const { error } = yield this.api.sendMagicLinkEmail(
												email,
												{
													redirectTo: options.redirectTo,
													shouldCreateUser: options.shouldCreateUser,
													captchaToken: options.captchaToken,
												}
											);
											return { user: null, session: null, error };
										}
										if (email && password) {
											return this._handleEmailSignIn(email, password, {
												redirectTo: options.redirectTo,
												captchaToken: options.captchaToken,
											});
										}
										if (phone && !password) {
											const { error } = yield this.api.sendMobileOTP(phone, {
												shouldCreateUser: options.shouldCreateUser,
												captchaToken: options.captchaToken,
											});
											return { user: null, session: null, error };
										}
										if (phone && password) {
											return this._handlePhoneSignIn(phone, password);
										}
										if (refreshToken) {
											// currentSession and currentUser will be updated to latest on _callRefreshToken using the passed refreshToken
											const { error } = yield this._callRefreshToken(
												refreshToken
											);
											if (error) throw error;
											return {
												user: this.currentUser,
												session: this.currentSession,
												error: null,
											};
										}
										if (provider) {
											return this._handleProviderSignIn(provider, {
												redirectTo: options.redirectTo,
												scopes: options.scopes,
												queryParams: options.queryParams,
											});
										}
										if (oidc) {
											return this._handleOpenIDConnectSignIn(oidc);
										}
										throw new Error(
											`You must provide either an email, phone number, a third-party provider or OpenID Connect.`
										);
									} catch (e) {
										return { user: null, session: null, error: e };
									}
								});
							}
							/**
							 * Log in a user given a User supplied OTP received via mobile.
							 * @param email The user's email address.
							 * @param phone The user's phone number.
							 * @param token The user's password.
							 * @param type The user's verification type.
							 * @param redirectTo A URL or mobile address to send the user to after they are confirmed.
							 */
							verifyOTP(params, options = {}) {
								return __awaiter(this, void 0, void 0, function* () {
									try {
										this._removeSession();
										const { data, error } = yield this.api.verifyOTP(
											params,
											options
										);
										if (error) {
											throw error;
										}
										if (!data) {
											throw "An error occurred on token verification.";
										}
										let session = null;
										let user = null;
										if (data.access_token) {
											session = data;
											user = session.user;
											this._saveSession(session);
											this._notifyAllSubscribers("SIGNED_IN");
										}
										if (data.id) {
											user = data;
										}
										return { user, session, error: null };
									} catch (e) {
										return { user: null, session: null, error: e };
									}
								});
							}
							/**
							 * Inside a browser context, `user()` will return the user data, if there is a logged in user.
							 *
							 * For server-side management, you can get a user through `auth.api.getUserByCookie()`
							 */
							user() {
								return this.currentUser;
							}
							/**
							 * Returns the session data, if there is an active session.
							 */
							session() {
								return this.currentSession;
							}
							/**
							 * Force refreshes the session including the user data in case it was updated in a different session.
							 */
							refreshSession() {
								var _a;
								return __awaiter(this, void 0, void 0, function* () {
									try {
										if (
											!((_a = this.currentSession) === null || _a === void 0
												? void 0
												: _a.access_token)
										)
											throw new Error("Not logged in.");
										// currentSession and currentUser will be updated to latest on _callRefreshToken
										const { error } = yield this._callRefreshToken();
										if (error) throw error;
										return {
											data: this.currentSession,
											user: this.currentUser,
											error: null,
										};
									} catch (e) {
										return { data: null, user: null, error: e };
									}
								});
							}
							/**
							 * Updates user data, if there is a logged in user.
							 */
							update(attributes) {
								var _a;
								return __awaiter(this, void 0, void 0, function* () {
									try {
										if (
											!((_a = this.currentSession) === null || _a === void 0
												? void 0
												: _a.access_token)
										)
											throw new Error("Not logged in.");
										const { user, error } = yield this.api.updateUser(
											this.currentSession.access_token,
											attributes
										);
										if (error) throw error;
										if (!user) throw Error("Invalid user data.");
										const session = Object.assign(
											Object.assign({}, this.currentSession),
											{ user }
										);
										this._saveSession(session);
										this._notifyAllSubscribers("USER_UPDATED");
										return { data: user, user, error: null };
									} catch (e) {
										return { data: null, user: null, error: e };
									}
								});
							}
							setSession(arg0) {
								return __awaiter(this, void 0, void 0, function* () {
									let session;
									if (typeof arg0 === "string") {
										// using the refresh_token string API
										const refresh_token = arg0;
										const { data, error } = yield this.api.refreshAccessToken(
											refresh_token
										);
										if (error) {
											return { session: null, error: error };
										}
										session = data;
									} else {
										// using the object parameter API
										const timeNow = Math.round(Date.now() / 1000);
										let { refresh_token, access_token } = arg0;
										let expires_at = 0;
										let expires_in = 0;
										const tokenParts = access_token.split(".");
										if (tokenParts.length !== 3)
											throw new Error("access_token is not a proper JWT");
										const bodyJSON = decodeBase64URL(tokenParts[1]);
										let parsed = undefined;
										try {
											parsed = JSON.parse(bodyJSON);
										} catch (e) {
											throw new Error(
												"access_token is not a proper JWT, invalid JSON in body"
											);
										}
										if (
											typeof parsed === "object" &&
											parsed &&
											typeof parsed.exp === "number"
										) {
											expires_at = parsed.exp;
											expires_in = timeNow - parsed.exp;
										} else {
											throw new Error(
												"access_token is not a proper JWT, missing exp claim"
											);
										}
										if (timeNow > expires_at) {
											const { data, error } = yield this.api.refreshAccessToken(
												refresh_token
											);
											if (error) {
												return { session: null, error: error };
											}
											session = data;
										} else {
											const { user, error } = yield this.api.getUser(
												access_token
											);
											if (error) throw error;
											session = {
												access_token,
												expires_in,
												expires_at,
												refresh_token,
												token_type: "bearer",
												user: user,
											};
										}
									}
									try {
										this._saveSession(session);
										this._notifyAllSubscribers("SIGNED_IN");
										return { session, error: null };
									} catch (e) {
										return { error: e, session: null };
									}
								});
							}
							/**
							 * Overrides the JWT on the current client. The JWT will then be sent in all subsequent network requests.
							 * @param access_token a jwt access token
							 */
							setAuth(access_token) {
								this.currentSession = Object.assign(
									Object.assign({}, this.currentSession),
									{ access_token, token_type: "bearer", user: this.user() }
								);
								this._notifyAllSubscribers("TOKEN_REFRESHED");
								return this.currentSession;
							}
							/**
							 * Gets the session data from a URL string
							 * @param options.storeSession Optionally store the session in the browser
							 */
							getSessionFromUrl(options) {
								return __awaiter(this, void 0, void 0, function* () {
									try {
										if (!(0, helpers_1.isBrowser)())
											throw new Error("No browser detected.");
										const error_description = (0, helpers_1.getParameterByName)(
											"error_description"
										);
										if (error_description) throw new Error(error_description);
										const provider_token = (0, helpers_1.getParameterByName)(
											"provider_token"
										);
										const provider_refresh_token = (0,
										helpers_1.getParameterByName)("provider_refresh_token");
										const access_token = (0, helpers_1.getParameterByName)(
											"access_token"
										);
										if (!access_token)
											throw new Error("No access_token detected.");
										const expires_in = (0, helpers_1.getParameterByName)(
											"expires_in"
										);
										if (!expires_in) throw new Error("No expires_in detected.");
										const refresh_token = (0, helpers_1.getParameterByName)(
											"refresh_token"
										);
										if (!refresh_token)
											throw new Error("No refresh_token detected.");
										const token_type = (0, helpers_1.getParameterByName)(
											"token_type"
										);
										if (!token_type) throw new Error("No token_type detected.");
										const timeNow = Math.round(Date.now() / 1000);
										const expires_at = timeNow + parseInt(expires_in);
										const { user, error } = yield this.api.getUser(
											access_token
										);
										if (error) throw error;
										const session = {
											provider_token,
											provider_refresh_token,
											access_token,
											expires_in: parseInt(expires_in),
											expires_at,
											refresh_token,
											token_type,
											user: user,
										};
										if (
											options === null || options === void 0
												? void 0
												: options.storeSession
										) {
											this._saveSession(session);
											const recoveryMode = (0, helpers_1.getParameterByName)(
												"type"
											);
											this._notifyAllSubscribers("SIGNED_IN");
											if (recoveryMode === "recovery") {
												this._notifyAllSubscribers("PASSWORD_RECOVERY");
											}
										}
										// Remove tokens from URL
										window.location.hash = "";
										return { data: session, error: null };
									} catch (e) {
										return { data: null, error: e };
									}
								});
							}
							/**
							 * Inside a browser context, `signOut()` will remove the logged in user from the browser session
							 * and log them out - removing all items from localstorage and then trigger a "SIGNED_OUT" event.
							 *
							 * For server-side management, you can revoke all refresh tokens for a user by passing a user's JWT through to `auth.api.signOut(JWT: string)`. There is no way to revoke a user's session JWT before it automatically expires
							 */
							signOut() {
								var _a;
								return __awaiter(this, void 0, void 0, function* () {
									const accessToken =
										(_a = this.currentSession) === null || _a === void 0
											? void 0
											: _a.access_token;
									this._removeSession();
									this._notifyAllSubscribers("SIGNED_OUT");
									if (accessToken) {
										const { error } = yield this.api.signOut(accessToken);
										if (error) return { error };
									}
									return { error: null };
								});
							}
							/**
							 * Receive a notification every time an auth event happens.
							 * @returns {Subscription} A subscription object which can be used to unsubscribe itself.
							 */
							onAuthStateChange(callback) {
								try {
									const id = (0, helpers_1.uuid)();
									const subscription = {
										id,
										callback,
										unsubscribe: () => {
											this.stateChangeEmitters.delete(id);
										},
									};
									this.stateChangeEmitters.set(id, subscription);
									return { data: subscription, error: null };
								} catch (e) {
									return { data: null, error: e };
								}
							}
							_handleEmailSignIn(email, password, options = {}) {
								var _a, _b;
								return __awaiter(this, void 0, void 0, function* () {
									try {
										const { data, error } = yield this.api.signInWithEmail(
											email,
											password,
											{
												redirectTo: options.redirectTo,
												captchaToken: options.captchaToken,
											}
										);
										if (error || !data)
											return { data: null, user: null, session: null, error };
										if (
											((_a =
												data === null || data === void 0
													? void 0
													: data.user) === null || _a === void 0
												? void 0
												: _a.confirmed_at) ||
											((_b =
												data === null || data === void 0
													? void 0
													: data.user) === null || _b === void 0
												? void 0
												: _b.email_confirmed_at)
										) {
											this._saveSession(data);
											this._notifyAllSubscribers("SIGNED_IN");
										}
										return {
											data,
											user: data.user,
											session: data,
											error: null,
										};
									} catch (e) {
										return { data: null, user: null, session: null, error: e };
									}
								});
							}
							_handlePhoneSignIn(phone, password, options = {}) {
								var _a;
								return __awaiter(this, void 0, void 0, function* () {
									try {
										const { data, error } = yield this.api.signInWithPhone(
											phone,
											password,
											options
										);
										if (error || !data)
											return { data: null, user: null, session: null, error };
										if (
											(_a =
												data === null || data === void 0
													? void 0
													: data.user) === null || _a === void 0
												? void 0
												: _a.phone_confirmed_at
										) {
											this._saveSession(data);
											this._notifyAllSubscribers("SIGNED_IN");
										}
										return {
											data,
											user: data.user,
											session: data,
											error: null,
										};
									} catch (e) {
										return { data: null, user: null, session: null, error: e };
									}
								});
							}
							_handleProviderSignIn(provider, options = {}) {
								const url = this.api.getUrlForProvider(provider, {
									redirectTo: options.redirectTo,
									scopes: options.scopes,
									queryParams: options.queryParams,
								});
								try {
									// try to open on the browser
									if ((0, helpers_1.isBrowser)()) {
										window.location.href = url;
									}
									return {
										provider,
										url,
										data: null,
										session: null,
										user: null,
										error: null,
									};
								} catch (e) {
									// fallback to returning the URL
									if (url)
										return {
											provider,
											url,
											data: null,
											session: null,
											user: null,
											error: null,
										};
									return { data: null, user: null, session: null, error: e };
								}
							}
							_handleOpenIDConnectSignIn({
								id_token,
								nonce,
								client_id,
								issuer,
								provider,
							}) {
								return __awaiter(this, void 0, void 0, function* () {
									if (
										id_token &&
										nonce &&
										((client_id && issuer) || provider)
									) {
										try {
											const { data, error } =
												yield this.api.signInWithOpenIDConnect({
													id_token,
													nonce,
													client_id,
													issuer,
													provider,
												});
											if (error || !data)
												return { user: null, session: null, error };
											this._saveSession(data);
											this._notifyAllSubscribers("SIGNED_IN");
											return { user: data.user, session: data, error: null };
										} catch (e) {
											return { user: null, session: null, error: e };
										}
									}
									throw new Error(
										`You must provide a OpenID Connect provider with your id token and nonce.`
									);
								});
							}
							/**
							 * Attempts to get the session from LocalStorage
							 * Note: this should never be async (even for React Native), as we need it to return immediately in the constructor.
							 */
							_recoverSession() {
								try {
									const data = (0, helpers_1.getItemSynchronously)(
										this.localStorage,
										constants_1.STORAGE_KEY
									);
									if (!data) return null;
									const { currentSession, expiresAt } = data;
									const timeNow = Math.round(Date.now() / 1000);
									if (
										expiresAt >= timeNow + constants_1.EXPIRY_MARGIN &&
										(currentSession === null || currentSession === void 0
											? void 0
											: currentSession.user)
									) {
										this._saveSession(currentSession);
										this._notifyAllSubscribers("SIGNED_IN");
									}
								} catch (error) {
									console.log("error", error);
								}
							}
							/**
							 * Recovers the session from LocalStorage and refreshes
							 * Note: this method is async to accommodate for AsyncStorage e.g. in React native.
							 */
							_recoverAndRefresh() {
								return __awaiter(this, void 0, void 0, function* () {
									try {
										const data = yield (0, helpers_1.getItemAsync)(
											this.localStorage,
											constants_1.STORAGE_KEY
										);
										if (!data) return null;
										const { currentSession, expiresAt } = data;
										const timeNow = Math.round(Date.now() / 1000);
										if (expiresAt < timeNow + constants_1.EXPIRY_MARGIN) {
											if (
												this.autoRefreshToken &&
												currentSession.refresh_token
											) {
												this.networkRetries++;
												const { error } = yield this._callRefreshToken(
													currentSession.refresh_token
												);
												if (error) {
													console.log(error.message);
													if (
														error.message ===
															constants_1.NETWORK_FAILURE.ERROR_MESSAGE &&
														this.networkRetries <
															constants_1.NETWORK_FAILURE.MAX_RETRIES
													) {
														if (this.refreshTokenTimer)
															clearTimeout(this.refreshTokenTimer);
														this.refreshTokenTimer = setTimeout(
															() => this._recoverAndRefresh(),
															Math.pow(
																constants_1.NETWORK_FAILURE.RETRY_INTERVAL,
																this.networkRetries
															) * 100 // exponential backoff
														);
														return;
													}
													yield this._removeSession();
												}
												this.networkRetries = 0;
											} else {
												this._removeSession();
											}
										} else if (!currentSession) {
											console.log("Current session is missing data.");
											this._removeSession();
										} else {
											// should be handled on _recoverSession method already
											// But we still need the code here to accommodate for AsyncStorage e.g. in React native
											this._saveSession(currentSession);
											this._notifyAllSubscribers("SIGNED_IN");
										}
									} catch (err) {
										console.error(err);
										return null;
									}
								});
							}
							_callRefreshToken(refresh_token) {
								var _a;
								if (refresh_token === void 0) {
									refresh_token =
										(_a = this.currentSession) === null || _a === void 0
											? void 0
											: _a.refresh_token;
								}
								return __awaiter(this, void 0, void 0, function* () {
									try {
										if (!refresh_token) {
											throw new Error("No current session.");
										}
										const { data, error } = yield this.api.refreshAccessToken(
											refresh_token
										);
										if (error) throw error;
										if (!data) throw Error("Invalid session data.");
										this._saveSession(data);
										this._notifyAllSubscribers("TOKEN_REFRESHED");
										this._notifyAllSubscribers("SIGNED_IN");
										return { data, error: null };
									} catch (e) {
										return { data: null, error: e };
									}
								});
							}
							_notifyAllSubscribers(event) {
								this.stateChangeEmitters.forEach((x) =>
									x.callback(event, this.currentSession)
								);
							}
							/**
							 * set currentSession and currentUser
							 * process to _startAutoRefreshToken if possible
							 */
							_saveSession(session) {
								this.currentSession = session;
								this.currentUser = session.user;
								const expiresAt = session.expires_at;
								if (expiresAt) {
									const timeNow = Math.round(Date.now() / 1000);
									const expiresIn = expiresAt - timeNow;
									const refreshDurationBeforeExpires =
										expiresIn > constants_1.EXPIRY_MARGIN
											? constants_1.EXPIRY_MARGIN
											: 0.5;
									this._startAutoRefreshToken(
										(expiresIn - refreshDurationBeforeExpires) * 1000
									);
								}
								// Do we need any extra check before persist session
								// access_token or user ?
								if (this.persistSession && session.expires_at) {
									this._persistSession(this.currentSession);
								}
							}
							_persistSession(currentSession) {
								const data = {
									currentSession,
									expiresAt: currentSession.expires_at,
								};
								(0, helpers_1.setItemAsync)(
									this.localStorage,
									constants_1.STORAGE_KEY,
									data
								);
							}
							_removeSession() {
								return __awaiter(this, void 0, void 0, function* () {
									this.currentSession = null;
									this.currentUser = null;
									if (this.refreshTokenTimer)
										clearTimeout(this.refreshTokenTimer);
									(0,
									helpers_1.removeItemAsync)(this.localStorage, constants_1.STORAGE_KEY);
								});
							}
							/**
							 * Clear and re-create refresh token timer
							 * @param value time intervals in milliseconds
							 */
							_startAutoRefreshToken(value) {
								if (this.refreshTokenTimer)
									clearTimeout(this.refreshTokenTimer);
								if (value <= 0 || !this.autoRefreshToken) return;
								this.refreshTokenTimer = setTimeout(
									() =>
										__awaiter(this, void 0, void 0, function* () {
											this.networkRetries++;
											const { error } = yield this._callRefreshToken();
											if (!error) this.networkRetries = 0;
											if (
												(error === null || error === void 0
													? void 0
													: error.message) ===
													constants_1.NETWORK_FAILURE.ERROR_MESSAGE &&
												this.networkRetries <
													constants_1.NETWORK_FAILURE.MAX_RETRIES
											)
												this._startAutoRefreshToken(
													Math.pow(
														constants_1.NETWORK_FAILURE.RETRY_INTERVAL,
														this.networkRetries
													) * 100
												); // exponential backoff
										}),
									value
								);
								if (typeof this.refreshTokenTimer.unref === "function")
									this.refreshTokenTimer.unref();
							}
							/**
							 * Listens for changes to LocalStorage and updates the current session.
							 */
							_listenForMultiTabEvents() {
								if (
									!this.multiTab ||
									!(0, helpers_1.isBrowser)() ||
									!(window === null || window === void 0
										? void 0
										: window.addEventListener)
								) {
									return false;
								}
								try {
									window === null || window === void 0
										? void 0
										: window.addEventListener("storage", (e) => {
												var _a;
												if (e.key === constants_1.STORAGE_KEY) {
													const newSession = JSON.parse(String(e.newValue));
													if (
														(_a =
															newSession === null || newSession === void 0
																? void 0
																: newSession.currentSession) === null ||
														_a === void 0
															? void 0
															: _a.access_token
													) {
														this._saveSession(newSession.currentSession);
														this._notifyAllSubscribers("SIGNED_IN");
													} else {
														this._removeSession();
														this._notifyAllSubscribers("SIGNED_OUT");
													}
												}
										  });
								} catch (error) {
									console.error("_listenForMultiTabEvents", error);
								}
							}
							_handleVisibilityChange() {
								if (
									!this.multiTab ||
									!(0, helpers_1.isBrowser)() ||
									!(window === null || window === void 0
										? void 0
										: window.addEventListener)
								) {
									return false;
								}
								try {
									window === null || window === void 0
										? void 0
										: window.addEventListener("visibilitychange", () => {
												if (document.visibilityState === "visible") {
													this._recoverAndRefresh();
												}
										  });
								} catch (error) {
									console.error("_handleVisibilityChange", error);
								}
							}
						}
						exports.default = GoTrueClient;
					}.call(this));
				}.call(this, require("buffer").Buffer));
			},
			{
				"./GoTrueApi": 8,
				"./lib/constants": 11,
				"./lib/helpers": 14,
				"./lib/polyfills": 15,
				buffer: 2,
			},
		],
		10: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __exportStar =
					(this && this.__exportStar) ||
					function (m, exports) {
						for (var p in m)
							if (
								p !== "default" &&
								!Object.prototype.hasOwnProperty.call(exports, p)
							)
								__createBinding(exports, m, p);
					};
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.GoTrueClient = exports.GoTrueApi = void 0;
				const GoTrueApi_1 = __importDefault(require("./GoTrueApi"));
				exports.GoTrueApi = GoTrueApi_1.default;
				const GoTrueClient_1 = __importDefault(require("./GoTrueClient"));
				exports.GoTrueClient = GoTrueClient_1.default;
				__exportStar(require("./lib/types"), exports);
			},
			{ "./GoTrueApi": 8, "./GoTrueClient": 9, "./lib/types": 16 },
		],
		11: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.COOKIE_OPTIONS =
					exports.STORAGE_KEY =
					exports.NETWORK_FAILURE =
					exports.EXPIRY_MARGIN =
					exports.DEFAULT_HEADERS =
					exports.AUDIENCE =
					exports.GOTRUE_URL =
						void 0;
				const version_1 = require("./version");
				exports.GOTRUE_URL = "http://localhost:9999";
				exports.AUDIENCE = "";
				exports.DEFAULT_HEADERS = {
					"X-Client-Info": `gotrue-js/${version_1.version}`,
				};
				exports.EXPIRY_MARGIN = 10; // in seconds
				exports.NETWORK_FAILURE = {
					ERROR_MESSAGE: "Request Failed",
					MAX_RETRIES: 10,
					RETRY_INTERVAL: 2, // in deciseconds
				};
				exports.STORAGE_KEY = "supabase.auth.token";
				exports.COOKIE_OPTIONS = {
					name: "sb",
					lifetime: 60 * 60 * 8,
					domain: "",
					path: "/",
					sameSite: "lax",
				};
			},
			{ "./version": 17 },
		],
		12: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.deleteCookie =
					exports.setCookie =
					exports.setCookies =
					exports.getCookieString =
						void 0;
				/**
				 * Serialize data into a cookie header.
				 */
				function serialize(name, val, options) {
					const opt = options || {};
					const enc = encodeURIComponent;
					/* eslint-disable-next-line no-control-regex */
					const fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
					if (typeof enc !== "function") {
						throw new TypeError("option encode is invalid");
					}
					if (!fieldContentRegExp.test(name)) {
						throw new TypeError("argument name is invalid");
					}
					const value = enc(val);
					if (value && !fieldContentRegExp.test(value)) {
						throw new TypeError("argument val is invalid");
					}
					let str = name + "=" + value;
					if (null != opt.maxAge) {
						const maxAge = opt.maxAge - 0;
						if (isNaN(maxAge) || !isFinite(maxAge)) {
							throw new TypeError("option maxAge is invalid");
						}
						str += "; Max-Age=" + Math.floor(maxAge);
					}
					if (opt.domain) {
						if (!fieldContentRegExp.test(opt.domain)) {
							throw new TypeError("option domain is invalid");
						}
						str += "; Domain=" + opt.domain;
					}
					if (opt.path) {
						if (!fieldContentRegExp.test(opt.path)) {
							throw new TypeError("option path is invalid");
						}
						str += "; Path=" + opt.path;
					}
					if (opt.expires) {
						if (typeof opt.expires.toUTCString !== "function") {
							throw new TypeError("option expires is invalid");
						}
						str += "; Expires=" + opt.expires.toUTCString();
					}
					if (opt.httpOnly) {
						str += "; HttpOnly";
					}
					if (opt.secure) {
						str += "; Secure";
					}
					if (opt.sameSite) {
						const sameSite =
							typeof opt.sameSite === "string"
								? opt.sameSite.toLowerCase()
								: opt.sameSite;
						switch (sameSite) {
							case "lax":
								str += "; SameSite=Lax";
								break;
							case "strict":
								str += "; SameSite=Strict";
								break;
							case "none":
								str += "; SameSite=None";
								break;
							default:
								throw new TypeError("option sameSite is invalid");
						}
					}
					return str;
				}
				/**
				 * Based on the environment and the request we know if a secure cookie can be set.
				 */
				function isSecureEnvironment(req) {
					if (!req || !req.headers || !req.headers.host) {
						throw new Error('The "host" request header is not available');
					}
					const host =
						(req.headers.host.indexOf(":") > -1 &&
							req.headers.host.split(":")[0]) ||
						req.headers.host;
					if (
						["localhost", "127.0.0.1"].indexOf(host) > -1 ||
						host.endsWith(".local")
					) {
						return false;
					}
					return true;
				}
				/**
				 * Serialize a cookie to a string.
				 */
				function serializeCookie(cookie, secure) {
					var _a, _b, _c;
					return serialize(cookie.name, cookie.value, {
						maxAge: cookie.maxAge,
						expires: new Date(Date.now() + cookie.maxAge * 1000),
						httpOnly: true,
						secure,
						path: (_a = cookie.path) !== null && _a !== void 0 ? _a : "/",
						domain: (_b = cookie.domain) !== null && _b !== void 0 ? _b : "",
						sameSite:
							(_c = cookie.sameSite) !== null && _c !== void 0 ? _c : "lax",
					});
				}
				/**
				 * Get Cookie Header strings.
				 */
				function getCookieString(req, res, cookies) {
					const strCookies = cookies.map((c) =>
						serializeCookie(c, isSecureEnvironment(req))
					);
					const previousCookies = res.getHeader("Set-Cookie");
					if (previousCookies) {
						if (previousCookies instanceof Array) {
							Array.prototype.push.apply(strCookies, previousCookies);
						} else if (typeof previousCookies === "string") {
							strCookies.push(previousCookies);
						}
					}
					return strCookies;
				}
				exports.getCookieString = getCookieString;
				/**
				 * Set one or more cookies.
				 */
				function setCookies(req, res, cookies) {
					res.setHeader("Set-Cookie", getCookieString(req, res, cookies));
				}
				exports.setCookies = setCookies;
				/**
				 * Set one or more cookies.
				 */
				function setCookie(req, res, cookie) {
					setCookies(req, res, [cookie]);
				}
				exports.setCookie = setCookie;
				function deleteCookie(req, res, name) {
					setCookie(req, res, {
						name,
						value: "",
						maxAge: -1,
					});
				}
				exports.deleteCookie = deleteCookie;
			},
			{},
		],
		13: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.remove = exports.put = exports.post = exports.get = void 0;
				const constants_1 = require("./constants");
				const _getErrorMessage = (err) =>
					err.msg ||
					err.message ||
					err.error_description ||
					err.error ||
					JSON.stringify(err);
				const handleError = (error, reject) => {
					if (!(error === null || error === void 0 ? void 0 : error.status)) {
						return reject({
							message: constants_1.NETWORK_FAILURE.ERROR_MESSAGE,
						});
					}
					if (typeof error.json !== "function") {
						return reject(error);
					}
					error.json().then((err) => {
						return reject({
							message: _getErrorMessage(err),
							status:
								(error === null || error === void 0 ? void 0 : error.status) ||
								500,
						});
					});
				};
				const _getRequestParams = (method, options, body) => {
					const params = {
						method,
						headers:
							(options === null || options === void 0
								? void 0
								: options.headers) || {},
					};
					if (method === "GET") {
						return params;
					}
					params.headers = Object.assign(
						{ "Content-Type": "application/json;charset=UTF-8" },
						options === null || options === void 0 ? void 0 : options.headers
					);
					params.body = JSON.stringify(body);
					return params;
				};
				function _handleRequest(fetcher, method, url, options, body) {
					return __awaiter(this, void 0, void 0, function* () {
						return new Promise((resolve, reject) => {
							fetcher(url, _getRequestParams(method, options, body))
								.then((result) => {
									if (!result.ok) throw result;
									if (
										options === null || options === void 0
											? void 0
											: options.noResolveJson
									)
										return resolve;
									return result.json();
								})
								.then((data) => resolve(data))
								.catch((error) => handleError(error, reject));
						});
					});
				}
				function get(fetcher, url, options) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(fetcher, "GET", url, options);
					});
				}
				exports.get = get;
				function post(fetcher, url, body, options) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(fetcher, "POST", url, options, body);
					});
				}
				exports.post = post;
				function put(fetcher, url, body, options) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(fetcher, "PUT", url, options, body);
					});
				}
				exports.put = put;
				function remove(fetcher, url, body, options) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(fetcher, "DELETE", url, options, body);
					});
				}
				exports.remove = remove;
			},
			{ "./constants": 11 },
		],
		14: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __setModuleDefault =
					(this && this.__setModuleDefault) ||
					(Object.create
						? function (o, v) {
								Object.defineProperty(o, "default", {
									enumerable: true,
									value: v,
								});
						  }
						: function (o, v) {
								o["default"] = v;
						  });
				var __importStar =
					(this && this.__importStar) ||
					function (mod) {
						if (mod && mod.__esModule) return mod;
						var result = {};
						if (mod != null)
							for (var k in mod)
								if (
									k !== "default" &&
									Object.prototype.hasOwnProperty.call(mod, k)
								)
									__createBinding(result, mod, k);
						__setModuleDefault(result, mod);
						return result;
					};
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.removeItemAsync =
					exports.getItemSynchronously =
					exports.getItemAsync =
					exports.setItemAsync =
					exports.resolveFetch =
					exports.getParameterByName =
					exports.isBrowser =
					exports.uuid =
					exports.expiresAt =
						void 0;
				function expiresAt(expiresIn) {
					const timeNow = Math.round(Date.now() / 1000);
					return timeNow + expiresIn;
				}
				exports.expiresAt = expiresAt;
				function uuid() {
					return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
						/[xy]/g,
						function (c) {
							const r = (Math.random() * 16) | 0,
								v = c == "x" ? r : (r & 0x3) | 0x8;
							return v.toString(16);
						}
					);
				}
				exports.uuid = uuid;
				const isBrowser = () => typeof window !== "undefined";
				exports.isBrowser = isBrowser;
				function getParameterByName(name, url) {
					var _a;
					if (!url)
						url =
							((_a =
								window === null || window === void 0
									? void 0
									: window.location) === null || _a === void 0
								? void 0
								: _a.href) || "";
					// eslint-disable-next-line no-useless-escape
					name = name.replace(/[\[\]]/g, "\\$&");
					const regex = new RegExp("[?&#]" + name + "(=([^&#]*)|&|#|$)"),
						results = regex.exec(url);
					if (!results) return null;
					if (!results[2]) return "";
					return decodeURIComponent(results[2].replace(/\+/g, " "));
				}
				exports.getParameterByName = getParameterByName;
				const resolveFetch = (customFetch) => {
					let _fetch;
					if (customFetch) {
						_fetch = customFetch;
					} else if (typeof fetch === "undefined") {
						_fetch = (...args) =>
							__awaiter(void 0, void 0, void 0, function* () {
								return yield (yield Promise.resolve().then(() =>
									__importStar(require("cross-fetch"))
								)).fetch(...args);
							});
					} else {
						_fetch = fetch;
					}
					return (...args) => _fetch(...args);
				};
				exports.resolveFetch = resolveFetch;
				// LocalStorage helpers
				const setItemAsync = (storage, key, data) =>
					__awaiter(void 0, void 0, void 0, function* () {
						(0, exports.isBrowser)() &&
							(yield storage === null || storage === void 0
								? void 0
								: storage.setItem(key, JSON.stringify(data)));
					});
				exports.setItemAsync = setItemAsync;
				const getItemAsync = (storage, key) =>
					__awaiter(void 0, void 0, void 0, function* () {
						const value =
							(0, exports.isBrowser)() &&
							(yield storage === null || storage === void 0
								? void 0
								: storage.getItem(key));
						if (!value) return null;
						try {
							return JSON.parse(value);
						} catch (_a) {
							return value;
						}
					});
				exports.getItemAsync = getItemAsync;
				const getItemSynchronously = (storage, key) => {
					const value =
						(0, exports.isBrowser)() &&
						(storage === null || storage === void 0
							? void 0
							: storage.getItem(key));
					if (!value || typeof value !== "string") {
						return null;
					}
					try {
						return JSON.parse(value);
					} catch (_a) {
						return value;
					}
				};
				exports.getItemSynchronously = getItemSynchronously;
				const removeItemAsync = (storage, key) =>
					__awaiter(void 0, void 0, void 0, function* () {
						(0, exports.isBrowser)() &&
							(yield storage === null || storage === void 0
								? void 0
								: storage.removeItem(key));
					});
				exports.removeItemAsync = removeItemAsync;
			},
			{ "cross-fetch": 86 },
		],
		15: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.polyfillGlobalThis = void 0;
				/**
				 * https://mathiasbynens.be/notes/globalthis
				 */
				function polyfillGlobalThis() {
					if (typeof globalThis === "object") return;
					try {
						Object.defineProperty(Object.prototype, "__magic__", {
							get: function () {
								return this;
							},
							configurable: true,
						});
						// @ts-expect-error 'Allow access to magic'
						__magic__.globalThis = __magic__;
						// @ts-expect-error 'Allow access to magic'
						delete Object.prototype.__magic__;
					} catch (e) {
						if (typeof self !== "undefined") {
							// @ts-expect-error 'Allow access to globals'
							self.globalThis = self;
						}
					}
				}
				exports.polyfillGlobalThis = polyfillGlobalThis;
			},
			{},
		],
		16: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
			},
			{},
		],
		17: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.version = void 0;
				// generated by genversion
				exports.version = "1.24.0";
			},
			{},
		],
		18: [
			function (require, module, exports) {
				"use strict";
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const PostgrestQueryBuilder_1 = __importDefault(
					require("./lib/PostgrestQueryBuilder")
				);
				const PostgrestRpcBuilder_1 = __importDefault(
					require("./lib/PostgrestRpcBuilder")
				);
				const constants_1 = require("./lib/constants");
				class PostgrestClient {
					/**
					 * Creates a PostgREST client.
					 *
					 * @param url  URL of the PostgREST endpoint.
					 * @param headers  Custom headers.
					 * @param schema  Postgres schema to switch to.
					 */
					constructor(url, { headers = {}, schema, fetch, throwOnError } = {}) {
						this.url = url;
						this.headers = Object.assign(
							Object.assign({}, constants_1.DEFAULT_HEADERS),
							headers
						);
						this.schema = schema;
						this.fetch = fetch;
						this.shouldThrowOnError = throwOnError;
					}
					/**
					 * Authenticates the request with JWT.
					 *
					 * @param token  The JWT token to use.
					 */
					auth(token) {
						this.headers["Authorization"] = `Bearer ${token}`;
						return this;
					}
					/**
					 * Perform a table operation.
					 *
					 * @param table  The table name to operate on.
					 */
					from(table) {
						const url = `${this.url}/${table}`;
						return new PostgrestQueryBuilder_1.default(url, {
							headers: this.headers,
							schema: this.schema,
							fetch: this.fetch,
							shouldThrowOnError: this.shouldThrowOnError,
						});
					}
					/**
					 * Perform a function call.
					 *
					 * @param fn  The function name to call.
					 * @param params  The parameters to pass to the function call.
					 * @param head  When set to true, no data will be returned.
					 * @param count  Count algorithm to use to count rows in a table.
					 */
					rpc(fn, params, { head = false, count = null } = {}) {
						const url = `${this.url}/rpc/${fn}`;
						return new PostgrestRpcBuilder_1.default(url, {
							headers: this.headers,
							schema: this.schema,
							fetch: this.fetch,
							shouldThrowOnError: this.shouldThrowOnError,
						}).rpc(params, { head, count });
					}
				}
				exports.default = PostgrestClient;
			},
			{
				"./lib/PostgrestQueryBuilder": 21,
				"./lib/PostgrestRpcBuilder": 22,
				"./lib/constants": 24,
			},
		],
		19: [
			function (require, module, exports) {
				"use strict";
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.PostgrestFilterBuilder =
					exports.PostgrestQueryBuilder =
					exports.PostgrestBuilder =
					exports.PostgrestClient =
						void 0;
				const PostgrestClient_1 = __importDefault(require("./PostgrestClient"));
				exports.PostgrestClient = PostgrestClient_1.default;
				const PostgrestFilterBuilder_1 = __importDefault(
					require("./lib/PostgrestFilterBuilder")
				);
				exports.PostgrestFilterBuilder = PostgrestFilterBuilder_1.default;
				const PostgrestQueryBuilder_1 = __importDefault(
					require("./lib/PostgrestQueryBuilder")
				);
				exports.PostgrestQueryBuilder = PostgrestQueryBuilder_1.default;
				const types_1 = require("./lib/types");
				Object.defineProperty(exports, "PostgrestBuilder", {
					enumerable: true,
					get: function () {
						return types_1.PostgrestBuilder;
					},
				});
			},
			{
				"./PostgrestClient": 18,
				"./lib/PostgrestFilterBuilder": 20,
				"./lib/PostgrestQueryBuilder": 21,
				"./lib/types": 25,
			},
		],
		20: [
			function (require, module, exports) {
				"use strict";
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const PostgrestTransformBuilder_1 = __importDefault(
					require("./PostgrestTransformBuilder")
				);
				class PostgrestFilterBuilder extends PostgrestTransformBuilder_1.default {
					constructor() {
						super(...arguments);
						/** @deprecated Use `contains()` instead. */
						this.cs = this.contains;
						/** @deprecated Use `containedBy()` instead. */
						this.cd = this.containedBy;
						/** @deprecated Use `rangeLt()` instead. */
						this.sl = this.rangeLt;
						/** @deprecated Use `rangeGt()` instead. */
						this.sr = this.rangeGt;
						/** @deprecated Use `rangeGte()` instead. */
						this.nxl = this.rangeGte;
						/** @deprecated Use `rangeLte()` instead. */
						this.nxr = this.rangeLte;
						/** @deprecated Use `rangeAdjacent()` instead. */
						this.adj = this.rangeAdjacent;
						/** @deprecated Use `overlaps()` instead. */
						this.ov = this.overlaps;
					}
					/**
					 * Finds all rows which doesn't satisfy the filter.
					 *
					 * @param column  The column to filter on.
					 * @param operator  The operator to filter with.
					 * @param value  The value to filter with.
					 */
					not(column, operator, value) {
						this.url.searchParams.append(
							`${column}`,
							`not.${operator}.${value}`
						);
						return this;
					}
					/**
					 * Finds all rows satisfying at least one of the filters.
					 *
					 * @param filters  The filters to use, separated by commas.
					 * @param foreignTable  The foreign table to use (if `column` is a foreign column).
					 */
					or(filters, { foreignTable } = {}) {
						const key =
							typeof foreignTable === "undefined" ? "or" : `${foreignTable}.or`;
						this.url.searchParams.append(key, `(${filters})`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` exactly matches the
					 * specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					eq(column, value) {
						this.url.searchParams.append(`${column}`, `eq.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` doesn't match the
					 * specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					neq(column, value) {
						this.url.searchParams.append(`${column}`, `neq.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` is greater than the
					 * specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					gt(column, value) {
						this.url.searchParams.append(`${column}`, `gt.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` is greater than or
					 * equal to the specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					gte(column, value) {
						this.url.searchParams.append(`${column}`, `gte.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` is less than the
					 * specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					lt(column, value) {
						this.url.searchParams.append(`${column}`, `lt.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` is less than or equal
					 * to the specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					lte(column, value) {
						this.url.searchParams.append(`${column}`, `lte.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value in the stated `column` matches the supplied
					 * `pattern` (case sensitive).
					 *
					 * @param column  The column to filter on.
					 * @param pattern  The pattern to filter with.
					 */
					like(column, pattern) {
						this.url.searchParams.append(`${column}`, `like.${pattern}`);
						return this;
					}
					/**
					 * Finds all rows whose value in the stated `column` matches the supplied
					 * `pattern` (case insensitive).
					 *
					 * @param column  The column to filter on.
					 * @param pattern  The pattern to filter with.
					 */
					ilike(column, pattern) {
						this.url.searchParams.append(`${column}`, `ilike.${pattern}`);
						return this;
					}
					/**
					 * A check for exact equality (null, true, false), finds all rows whose
					 * value on the stated `column` exactly match the specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					is(column, value) {
						this.url.searchParams.append(`${column}`, `is.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose value on the stated `column` is found on the
					 * specified `values`.
					 *
					 * @param column  The column to filter on.
					 * @param values  The values to filter with.
					 */
					in(column, values) {
						const cleanedValues = values
							.map((s) => {
								// handle postgrest reserved characters
								// https://postgrest.org/en/v7.0.0/api.html#reserved-characters
								if (typeof s === "string" && new RegExp("[,()]").test(s))
									return `"${s}"`;
								else return `${s}`;
							})
							.join(",");
						this.url.searchParams.append(`${column}`, `in.(${cleanedValues})`);
						return this;
					}
					/**
					 * Finds all rows whose json, array, or range value on the stated `column`
					 * contains the values specified in `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					contains(column, value) {
						if (typeof value === "string") {
							// range types can be inclusive '[', ']' or exclusive '(', ')' so just
							// keep it simple and accept a string
							this.url.searchParams.append(`${column}`, `cs.${value}`);
						} else if (Array.isArray(value)) {
							// array
							this.url.searchParams.append(
								`${column}`,
								`cs.{${value.join(",")}}`
							);
						} else {
							// json
							this.url.searchParams.append(
								`${column}`,
								`cs.${JSON.stringify(value)}`
							);
						}
						return this;
					}
					/**
					 * Finds all rows whose json, array, or range value on the stated `column` is
					 * contained by the specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					containedBy(column, value) {
						if (typeof value === "string") {
							// range
							this.url.searchParams.append(`${column}`, `cd.${value}`);
						} else if (Array.isArray(value)) {
							// array
							this.url.searchParams.append(
								`${column}`,
								`cd.{${value.join(",")}}`
							);
						} else {
							// json
							this.url.searchParams.append(
								`${column}`,
								`cd.${JSON.stringify(value)}`
							);
						}
						return this;
					}
					/**
					 * Finds all rows whose range value on the stated `column` is strictly to the
					 * left of the specified `range`.
					 *
					 * @param column  The column to filter on.
					 * @param range  The range to filter with.
					 */
					rangeLt(column, range) {
						this.url.searchParams.append(`${column}`, `sl.${range}`);
						return this;
					}
					/**
					 * Finds all rows whose range value on the stated `column` is strictly to
					 * the right of the specified `range`.
					 *
					 * @param column  The column to filter on.
					 * @param range  The range to filter with.
					 */
					rangeGt(column, range) {
						this.url.searchParams.append(`${column}`, `sr.${range}`);
						return this;
					}
					/**
					 * Finds all rows whose range value on the stated `column` does not extend
					 * to the left of the specified `range`.
					 *
					 * @param column  The column to filter on.
					 * @param range  The range to filter with.
					 */
					rangeGte(column, range) {
						this.url.searchParams.append(`${column}`, `nxl.${range}`);
						return this;
					}
					/**
					 * Finds all rows whose range value on the stated `column` does not extend
					 * to the right of the specified `range`.
					 *
					 * @param column  The column to filter on.
					 * @param range  The range to filter with.
					 */
					rangeLte(column, range) {
						this.url.searchParams.append(`${column}`, `nxr.${range}`);
						return this;
					}
					/**
					 * Finds all rows whose range value on the stated `column` is adjacent to
					 * the specified `range`.
					 *
					 * @param column  The column to filter on.
					 * @param range  The range to filter with.
					 */
					rangeAdjacent(column, range) {
						this.url.searchParams.append(`${column}`, `adj.${range}`);
						return this;
					}
					/**
					 * Finds all rows whose array or range value on the stated `column` overlaps
					 * (has a value in common) with the specified `value`.
					 *
					 * @param column  The column to filter on.
					 * @param value  The value to filter with.
					 */
					overlaps(column, value) {
						if (typeof value === "string") {
							// range
							this.url.searchParams.append(`${column}`, `ov.${value}`);
						} else {
							// array
							this.url.searchParams.append(
								`${column}`,
								`ov.{${value.join(",")}}`
							);
						}
						return this;
					}
					/**
					 * Finds all rows whose text or tsvector value on the stated `column` matches
					 * the tsquery in `query`.
					 *
					 * @param column  The column to filter on.
					 * @param query  The Postgres tsquery string to filter with.
					 * @param config  The text search configuration to use.
					 * @param type  The type of tsquery conversion to use on `query`.
					 */
					textSearch(column, query, { config, type = null } = {}) {
						let typePart = "";
						if (type === "plain") {
							typePart = "pl";
						} else if (type === "phrase") {
							typePart = "ph";
						} else if (type === "websearch") {
							typePart = "w";
						}
						const configPart = config === undefined ? "" : `(${config})`;
						this.url.searchParams.append(
							`${column}`,
							`${typePart}fts${configPart}.${query}`
						);
						return this;
					}
					/**
					 * Finds all rows whose tsvector value on the stated `column` matches
					 * to_tsquery(`query`).
					 *
					 * @param column  The column to filter on.
					 * @param query  The Postgres tsquery string to filter with.
					 * @param config  The text search configuration to use.
					 *
					 * @deprecated Use `textSearch()` instead.
					 */
					fts(column, query, { config } = {}) {
						const configPart =
							typeof config === "undefined" ? "" : `(${config})`;
						this.url.searchParams.append(
							`${column}`,
							`fts${configPart}.${query}`
						);
						return this;
					}
					/**
					 * Finds all rows whose tsvector value on the stated `column` matches
					 * plainto_tsquery(`query`).
					 *
					 * @param column  The column to filter on.
					 * @param query  The Postgres tsquery string to filter with.
					 * @param config  The text search configuration to use.
					 *
					 * @deprecated Use `textSearch()` with `type: 'plain'` instead.
					 */
					plfts(column, query, { config } = {}) {
						const configPart =
							typeof config === "undefined" ? "" : `(${config})`;
						this.url.searchParams.append(
							`${column}`,
							`plfts${configPart}.${query}`
						);
						return this;
					}
					/**
					 * Finds all rows whose tsvector value on the stated `column` matches
					 * phraseto_tsquery(`query`).
					 *
					 * @param column  The column to filter on.
					 * @param query  The Postgres tsquery string to filter with.
					 * @param config  The text search configuration to use.
					 *
					 * @deprecated Use `textSearch()` with `type: 'phrase'` instead.
					 */
					phfts(column, query, { config } = {}) {
						const configPart =
							typeof config === "undefined" ? "" : `(${config})`;
						this.url.searchParams.append(
							`${column}`,
							`phfts${configPart}.${query}`
						);
						return this;
					}
					/**
					 * Finds all rows whose tsvector value on the stated `column` matches
					 * websearch_to_tsquery(`query`).
					 *
					 * @param column  The column to filter on.
					 * @param query  The Postgres tsquery string to filter with.
					 * @param config  The text search configuration to use.
					 *
					 * @deprecated Use `textSearch()` with `type: 'websearch'` instead.
					 */
					wfts(column, query, { config } = {}) {
						const configPart =
							typeof config === "undefined" ? "" : `(${config})`;
						this.url.searchParams.append(
							`${column}`,
							`wfts${configPart}.${query}`
						);
						return this;
					}
					/**
					 * Finds all rows whose `column` satisfies the filter.
					 *
					 * @param column  The column to filter on.
					 * @param operator  The operator to filter with.
					 * @param value  The value to filter with.
					 */
					filter(column, operator, value) {
						this.url.searchParams.append(`${column}`, `${operator}.${value}`);
						return this;
					}
					/**
					 * Finds all rows whose columns match the specified `query` object.
					 *
					 * @param query  The object to filter with, with column names as keys mapped
					 *               to their filter values.
					 */
					match(query) {
						Object.keys(query).forEach((key) => {
							this.url.searchParams.append(`${key}`, `eq.${query[key]}`);
						});
						return this;
					}
				}
				exports.default = PostgrestFilterBuilder;
			},
			{ "./PostgrestTransformBuilder": 23 },
		],
		21: [
			function (require, module, exports) {
				"use strict";
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const types_1 = require("./types");
				const PostgrestFilterBuilder_1 = __importDefault(
					require("./PostgrestFilterBuilder")
				);
				class PostgrestQueryBuilder extends types_1.PostgrestBuilder {
					constructor(
						url,
						{ headers = {}, schema, fetch, shouldThrowOnError } = {}
					) {
						super({ fetch, shouldThrowOnError });
						this.url = new URL(url);
						this.headers = Object.assign({}, headers);
						this.schema = schema;
					}
					/**
					 * Performs vertical filtering with SELECT.
					 *
					 * @param columns  The columns to retrieve, separated by commas.
					 * @param head  When set to true, select will void data.
					 * @param count  Count algorithm to use to count rows in a table.
					 */
					select(columns = "*", { head = false, count = null } = {}) {
						this.method = "GET";
						// Remove whitespaces except when quoted
						let quoted = false;
						const cleanedColumns = columns
							.split("")
							.map((c) => {
								if (/\s/.test(c) && !quoted) {
									return "";
								}
								if (c === '"') {
									quoted = !quoted;
								}
								return c;
							})
							.join("");
						this.url.searchParams.set("select", cleanedColumns);
						if (count) {
							this.headers["Prefer"] = `count=${count}`;
						}
						if (head) {
							this.method = "HEAD";
						}
						return new PostgrestFilterBuilder_1.default(this);
					}
					insert(
						values,
						{
							upsert = false,
							onConflict,
							returning = "representation",
							count = null,
						} = {}
					) {
						this.method = "POST";
						const prefersHeaders = [`return=${returning}`];
						if (upsert) prefersHeaders.push("resolution=merge-duplicates");
						if (upsert && onConflict !== undefined)
							this.url.searchParams.set("on_conflict", onConflict);
						this.body = values;
						if (count) {
							prefersHeaders.push(`count=${count}`);
						}
						if (this.headers["Prefer"]) {
							prefersHeaders.unshift(this.headers["Prefer"]);
						}
						this.headers["Prefer"] = prefersHeaders.join(",");
						if (Array.isArray(values)) {
							const columns = values.reduce(
								(acc, x) => acc.concat(Object.keys(x)),
								[]
							);
							if (columns.length > 0) {
								const uniqueColumns = [...new Set(columns)].map(
									(column) => `"${column}"`
								);
								this.url.searchParams.set("columns", uniqueColumns.join(","));
							}
						}
						return new PostgrestFilterBuilder_1.default(this);
					}
					/**
					 * Performs an UPSERT into the table.
					 *
					 * @param values  The values to insert.
					 * @param onConflict  By specifying the `on_conflict` query parameter, you can make UPSERT work on a column(s) that has a UNIQUE constraint.
					 * @param returning  By default the new record is returned. Set this to 'minimal' if you don't need this value.
					 * @param count  Count algorithm to use to count rows in a table.
					 * @param ignoreDuplicates  Specifies if duplicate rows should be ignored and not inserted.
					 */
					upsert(
						values,
						{
							onConflict,
							returning = "representation",
							count = null,
							ignoreDuplicates = false,
						} = {}
					) {
						this.method = "POST";
						const prefersHeaders = [
							`resolution=${ignoreDuplicates ? "ignore" : "merge"}-duplicates`,
							`return=${returning}`,
						];
						if (onConflict !== undefined)
							this.url.searchParams.set("on_conflict", onConflict);
						this.body = values;
						if (count) {
							prefersHeaders.push(`count=${count}`);
						}
						if (this.headers["Prefer"]) {
							prefersHeaders.unshift(this.headers["Prefer"]);
						}
						this.headers["Prefer"] = prefersHeaders.join(",");
						return new PostgrestFilterBuilder_1.default(this);
					}
					/**
					 * Performs an UPDATE on the table.
					 *
					 * @param values  The values to update.
					 * @param returning  By default the updated record is returned. Set this to 'minimal' if you don't need this value.
					 * @param count  Count algorithm to use to count rows in a table.
					 */
					update(values, { returning = "representation", count = null } = {}) {
						this.method = "PATCH";
						const prefersHeaders = [`return=${returning}`];
						this.body = values;
						if (count) {
							prefersHeaders.push(`count=${count}`);
						}
						if (this.headers["Prefer"]) {
							prefersHeaders.unshift(this.headers["Prefer"]);
						}
						this.headers["Prefer"] = prefersHeaders.join(",");
						return new PostgrestFilterBuilder_1.default(this);
					}
					/**
					 * Performs a DELETE on the table.
					 *
					 * @param returning  If `true`, return the deleted row(s) in the response.
					 * @param count  Count algorithm to use to count rows in a table.
					 */
					delete({ returning = "representation", count = null } = {}) {
						this.method = "DELETE";
						const prefersHeaders = [`return=${returning}`];
						if (count) {
							prefersHeaders.push(`count=${count}`);
						}
						if (this.headers["Prefer"]) {
							prefersHeaders.unshift(this.headers["Prefer"]);
						}
						this.headers["Prefer"] = prefersHeaders.join(",");
						return new PostgrestFilterBuilder_1.default(this);
					}
				}
				exports.default = PostgrestQueryBuilder;
			},
			{ "./PostgrestFilterBuilder": 20, "./types": 25 },
		],
		22: [
			function (require, module, exports) {
				"use strict";
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const types_1 = require("./types");
				const PostgrestFilterBuilder_1 = __importDefault(
					require("./PostgrestFilterBuilder")
				);
				class PostgrestRpcBuilder extends types_1.PostgrestBuilder {
					constructor(
						url,
						{ headers = {}, schema, fetch, shouldThrowOnError } = {}
					) {
						super({ fetch, shouldThrowOnError });
						this.url = new URL(url);
						this.headers = Object.assign({}, headers);
						this.schema = schema;
					}
					/**
					 * Perform a function call.
					 */
					rpc(params, { head = false, count = null } = {}) {
						if (head) {
							this.method = "HEAD";
							if (params) {
								Object.entries(params).forEach(([name, value]) => {
									this.url.searchParams.append(name, value);
								});
							}
						} else {
							this.method = "POST";
							this.body = params;
						}
						if (count) {
							if (this.headers["Prefer"] !== undefined)
								this.headers["Prefer"] += `,count=${count}`;
							else this.headers["Prefer"] = `count=${count}`;
						}
						return new PostgrestFilterBuilder_1.default(this);
					}
				}
				exports.default = PostgrestRpcBuilder;
			},
			{ "./PostgrestFilterBuilder": 20, "./types": 25 },
		],
		23: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				const types_1 = require("./types");
				/**
				 * Post-filters (transforms)
				 */
				class PostgrestTransformBuilder extends types_1.PostgrestBuilder {
					/**
					 * Performs vertical filtering with SELECT.
					 *
					 * @param columns  The columns to retrieve, separated by commas.
					 */
					select(columns = "*") {
						// Remove whitespaces except when quoted
						let quoted = false;
						const cleanedColumns = columns
							.split("")
							.map((c) => {
								if (/\s/.test(c) && !quoted) {
									return "";
								}
								if (c === '"') {
									quoted = !quoted;
								}
								return c;
							})
							.join("");
						this.url.searchParams.set("select", cleanedColumns);
						return this;
					}
					/**
					 * Orders the result with the specified `column`.
					 *
					 * @param column  The column to order on.
					 * @param ascending  If `true`, the result will be in ascending order.
					 * @param nullsFirst  If `true`, `null`s appear first.
					 * @param foreignTable  The foreign table to use (if `column` is a foreign column).
					 */
					order(
						column,
						{ ascending = true, nullsFirst = false, foreignTable } = {}
					) {
						const key =
							typeof foreignTable === "undefined"
								? "order"
								: `${foreignTable}.order`;
						const existingOrder = this.url.searchParams.get(key);
						this.url.searchParams.set(
							key,
							`${existingOrder ? `${existingOrder},` : ""}${column}.${
								ascending ? "asc" : "desc"
							}.${nullsFirst ? "nullsfirst" : "nullslast"}`
						);
						return this;
					}
					/**
					 * Limits the result with the specified `count`.
					 *
					 * @param count  The maximum no. of rows to limit to.
					 * @param foreignTable  The foreign table to use (for foreign columns).
					 */
					limit(count, { foreignTable } = {}) {
						const key =
							typeof foreignTable === "undefined"
								? "limit"
								: `${foreignTable}.limit`;
						this.url.searchParams.set(key, `${count}`);
						return this;
					}
					/**
					 * Limits the result to rows within the specified range, inclusive.
					 *
					 * @param from  The starting index from which to limit the result, inclusive.
					 * @param to  The last index to which to limit the result, inclusive.
					 * @param foreignTable  The foreign table to use (for foreign columns).
					 */
					range(from, to, { foreignTable } = {}) {
						const keyOffset =
							typeof foreignTable === "undefined"
								? "offset"
								: `${foreignTable}.offset`;
						const keyLimit =
							typeof foreignTable === "undefined"
								? "limit"
								: `${foreignTable}.limit`;
						this.url.searchParams.set(keyOffset, `${from}`);
						// Range is inclusive, so add 1
						this.url.searchParams.set(keyLimit, `${to - from + 1}`);
						return this;
					}
					/**
					 * Sets the AbortSignal for the fetch request.
					 */
					abortSignal(signal) {
						this.signal = signal;
						return this;
					}
					/**
					 * Retrieves only one row from the result. Result must be one row (e.g. using
					 * `limit`), otherwise this will result in an error.
					 */
					single() {
						this.headers["Accept"] = "application/vnd.pgrst.object+json";
						return this;
					}
					/**
					 * Retrieves at most one row from the result. Result must be at most one row
					 * (e.g. using `eq` on a UNIQUE column), otherwise this will result in an
					 * error.
					 */
					maybeSingle() {
						this.headers["Accept"] = "application/vnd.pgrst.object+json";
						this.allowEmpty = true;
						return this;
					}
					/**
					 * Set the response type to CSV.
					 */
					csv() {
						this.headers["Accept"] = "text/csv";
						return this;
					}
				}
				exports.default = PostgrestTransformBuilder;
			},
			{ "./types": 25 },
		],
		24: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.DEFAULT_HEADERS = void 0;
				const version_1 = require("./version");
				exports.DEFAULT_HEADERS = {
					"X-Client-Info": `postgrest-js/${version_1.version}`,
				};
			},
			{ "./version": 26 },
		],
		25: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __setModuleDefault =
					(this && this.__setModuleDefault) ||
					(Object.create
						? function (o, v) {
								Object.defineProperty(o, "default", {
									enumerable: true,
									value: v,
								});
						  }
						: function (o, v) {
								o["default"] = v;
						  });
				var __importStar =
					(this && this.__importStar) ||
					function (mod) {
						if (mod && mod.__esModule) return mod;
						var result = {};
						if (mod != null)
							for (var k in mod)
								if (
									k !== "default" &&
									Object.prototype.hasOwnProperty.call(mod, k)
								)
									__createBinding(result, mod, k);
						__setModuleDefault(result, mod);
						return result;
					};
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.PostgrestBuilder = void 0;
				class PostgrestBuilder {
					constructor(builder) {
						Object.assign(this, builder);
						let _fetch;
						if (builder.fetch) {
							_fetch = builder.fetch;
						} else if (typeof fetch === "undefined") {
							_fetch = (...args) =>
								__awaiter(this, void 0, void 0, function* () {
									return yield (yield Promise.resolve().then(() =>
										__importStar(require("cross-fetch"))
									)).fetch(...args);
								});
						} else {
							_fetch = fetch;
						}
						this.fetch = (...args) => _fetch(...args);
						this.shouldThrowOnError = builder.shouldThrowOnError || false;
						this.allowEmpty = builder.allowEmpty || false;
					}
					/**
					 * If there's an error with the query, throwOnError will reject the promise by
					 * throwing the error instead of returning it as part of a successful response.
					 *
					 * {@link https://github.com/supabase/supabase-js/issues/92}
					 */
					throwOnError(throwOnError) {
						if (throwOnError === null || throwOnError === undefined) {
							throwOnError = true;
						}
						this.shouldThrowOnError = throwOnError;
						return this;
					}
					then(onfulfilled, onrejected) {
						// https://postgrest.org/en/stable/api.html#switching-schemas
						if (typeof this.schema === "undefined") {
							// skip
						} else if (["GET", "HEAD"].includes(this.method)) {
							this.headers["Accept-Profile"] = this.schema;
						} else {
							this.headers["Content-Profile"] = this.schema;
						}
						if (this.method !== "GET" && this.method !== "HEAD") {
							this.headers["Content-Type"] = "application/json";
						}
						let res = this.fetch(this.url.toString(), {
							method: this.method,
							headers: this.headers,
							body: JSON.stringify(this.body),
							signal: this.signal,
						}).then((res) =>
							__awaiter(this, void 0, void 0, function* () {
								var _a, _b, _c, _d;
								let error = null;
								let data = null;
								let count = null;
								let status = res.status;
								let statusText = res.statusText;
								if (res.ok) {
									const isReturnMinimal =
										(_a = this.headers["Prefer"]) === null || _a === void 0
											? void 0
											: _a.split(",").includes("return=minimal");
									if (this.method !== "HEAD" && !isReturnMinimal) {
										const text = yield res.text();
										if (!text) {
											// discard `text`
										} else if (this.headers["Accept"] === "text/csv") {
											data = text;
										} else {
											data = JSON.parse(text);
										}
									}
									const countHeader =
										(_b = this.headers["Prefer"]) === null || _b === void 0
											? void 0
											: _b.match(/count=(exact|planned|estimated)/);
									const contentRange =
										(_c = res.headers.get("content-range")) === null ||
										_c === void 0
											? void 0
											: _c.split("/");
									if (countHeader && contentRange && contentRange.length > 1) {
										count = parseInt(contentRange[1]);
									}
								} else {
									const body = yield res.text();
									try {
										error = JSON.parse(body);
									} catch (_e) {
										error = {
											message: body,
										};
									}
									if (
										error &&
										this.allowEmpty &&
										((_d =
											error === null || error === void 0
												? void 0
												: error.details) === null || _d === void 0
											? void 0
											: _d.includes("Results contain 0 rows"))
									) {
										error = null;
										status = 200;
										statusText = "OK";
									}
									if (error && this.shouldThrowOnError) {
										throw error;
									}
								}
								const postgrestResponse = {
									error,
									data,
									count,
									status,
									statusText,
									body: data,
								};
								return postgrestResponse;
							})
						);
						if (!this.shouldThrowOnError) {
							res = res.catch((fetchError) => ({
								error: {
									message: `FetchError: ${fetchError.message}`,
									details: "",
									hint: "",
									code: fetchError.code || "",
								},
								data: null,
								body: null,
								count: null,
								status: 400,
								statusText: "Bad Request",
							}));
						}
						return res.then(onfulfilled, onrejected);
					}
				}
				exports.PostgrestBuilder = PostgrestBuilder;
			},
			{ "cross-fetch": 86 },
		],
		26: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.version = void 0;
				// generated by genversion
				exports.version = "0.37.4";
			},
			{},
		],
		27: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const websocket_1 = require("websocket");
				const constants_1 = require("./lib/constants");
				const timer_1 = __importDefault(require("./lib/timer"));
				const serializer_1 = __importDefault(require("./lib/serializer"));
				const RealtimeSubscription_1 = __importDefault(
					require("./RealtimeSubscription")
				);
				const noop = () => {};
				class RealtimeClient {
					/**
					 * Initializes the Socket.
					 *
					 * @param endPoint The string WebSocket endpoint, ie, "ws://example.com/socket", "wss://example.com", "/socket" (inherited host & protocol)
					 * @param options.transport The Websocket Transport, for example WebSocket.
					 * @param options.timeout The default timeout in milliseconds to trigger push timeouts.
					 * @param options.params The optional params to pass when connecting.
					 * @param options.headers The optional headers to pass when connecting.
					 * @param options.heartbeatIntervalMs The millisec interval to send a heartbeat message.
					 * @param options.logger The optional function for specialized logging, ie: logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
					 * @param options.encode The function to encode outgoing messages. Defaults to JSON: (payload, callback) => callback(JSON.stringify(payload))
					 * @param options.decode The function to decode incoming messages. Defaults to Serializer's decode.
					 * @param options.longpollerTimeout The maximum timeout of a long poll AJAX request. Defaults to 20s (double the server long poll timer).
					 * @param options.reconnectAfterMs he optional function that returns the millsec reconnect interval. Defaults to stepped backoff off.
					 */
					constructor(endPoint, options) {
						this.accessToken = null;
						this.channels = [];
						this.endPoint = "";
						this.headers = constants_1.DEFAULT_HEADERS;
						this.params = {};
						this.timeout = constants_1.DEFAULT_TIMEOUT;
						this.transport = websocket_1.w3cwebsocket;
						this.heartbeatIntervalMs = 30000;
						this.longpollerTimeout = 20000;
						this.heartbeatTimer = undefined;
						this.pendingHeartbeatRef = null;
						this.ref = 0;
						this.logger = noop;
						this.conn = null;
						this.sendBuffer = [];
						this.serializer = new serializer_1.default();
						this.stateChangeCallbacks = {
							open: [],
							close: [],
							error: [],
							message: [],
						};
						this.endPoint = `${endPoint}/${constants_1.TRANSPORTS.websocket}`;
						if (
							options === null || options === void 0 ? void 0 : options.params
						)
							this.params = options.params;
						if (
							options === null || options === void 0 ? void 0 : options.headers
						)
							this.headers = Object.assign(
								Object.assign({}, this.headers),
								options.headers
							);
						if (
							options === null || options === void 0 ? void 0 : options.timeout
						)
							this.timeout = options.timeout;
						if (
							options === null || options === void 0 ? void 0 : options.logger
						)
							this.logger = options.logger;
						if (
							options === null || options === void 0
								? void 0
								: options.transport
						)
							this.transport = options.transport;
						if (
							options === null || options === void 0
								? void 0
								: options.heartbeatIntervalMs
						)
							this.heartbeatIntervalMs = options.heartbeatIntervalMs;
						if (
							options === null || options === void 0
								? void 0
								: options.longpollerTimeout
						)
							this.longpollerTimeout = options.longpollerTimeout;
						this.reconnectAfterMs = (
							options === null || options === void 0
								? void 0
								: options.reconnectAfterMs
						)
							? options.reconnectAfterMs
							: (tries) => {
									return [1000, 2000, 5000, 10000][tries - 1] || 10000;
							  };
						this.encode = (
							options === null || options === void 0 ? void 0 : options.encode
						)
							? options.encode
							: (payload, callback) => {
									return callback(JSON.stringify(payload));
							  };
						this.decode = (
							options === null || options === void 0 ? void 0 : options.decode
						)
							? options.decode
							: this.serializer.decode.bind(this.serializer);
						this.reconnectTimer = new timer_1.default(
							() =>
								__awaiter(this, void 0, void 0, function* () {
									yield this.disconnect();
									this.connect();
								}),
							this.reconnectAfterMs
						);
					}
					/**
					 * Connects the socket, unless already connected.
					 */
					connect() {
						if (this.conn) {
							return;
						}
						this.conn = new this.transport(
							this.endPointURL(),
							[],
							null,
							this.headers
						);
						if (this.conn) {
							// this.conn.timeout = this.longpollerTimeout // TYPE ERROR
							this.conn.binaryType = "arraybuffer";
							this.conn.onopen = () => this._onConnOpen();
							this.conn.onerror = (error) => this._onConnError(error);
							this.conn.onmessage = (event) => this.onConnMessage(event);
							this.conn.onclose = (event) => this._onConnClose(event);
						}
					}
					/**
					 * Disconnects the socket.
					 *
					 * @param code A numeric status code to send on disconnect.
					 * @param reason A custom reason for the disconnect.
					 */
					disconnect(code, reason) {
						return new Promise((resolve, _reject) => {
							try {
								if (this.conn) {
									this.conn.onclose = function () {}; // noop
									if (code) {
										this.conn.close(code, reason || "");
									} else {
										this.conn.close();
									}
									this.conn = null;
									// remove open handles
									this.heartbeatTimer && clearInterval(this.heartbeatTimer);
									this.reconnectTimer.reset();
								}
								resolve({ error: null, data: true });
							} catch (error) {
								resolve({ error: error, data: false });
							}
						});
					}
					/**
					 * Logs the message.
					 *
					 * For customized logging, `this.logger` can be overriden.
					 */
					log(kind, msg, data) {
						this.logger(kind, msg, data);
					}
					/**
					 * Registers a callback for connection state change event.
					 *
					 * @param callback A function to be called when the event occurs.
					 *
					 * @example
					 *    socket.onOpen(() => console.log("Socket opened."))
					 */
					onOpen(callback) {
						this.stateChangeCallbacks.open.push(callback);
					}
					/**
					 * Registers a callback for connection state change events.
					 *
					 * @param callback A function to be called when the event occurs.
					 *
					 * @example
					 *    socket.onOpen(() => console.log("Socket closed."))
					 */
					onClose(callback) {
						this.stateChangeCallbacks.close.push(callback);
					}
					/**
					 * Registers a callback for connection state change events.
					 *
					 * @param callback A function to be called when the event occurs.
					 *
					 * @example
					 *    socket.onOpen((error) => console.log("An error occurred"))
					 */
					onError(callback) {
						this.stateChangeCallbacks.error.push(callback);
					}
					/**
					 * Calls a function any time a message is received.
					 *
					 * @param callback A function to be called when the event occurs.
					 *
					 * @example
					 *    socket.onMessage((message) => console.log(message))
					 */
					onMessage(callback) {
						this.stateChangeCallbacks.message.push(callback);
					}
					/**
					 * Returns the current state of the socket.
					 */
					connectionState() {
						switch (this.conn && this.conn.readyState) {
							case constants_1.SOCKET_STATES.connecting:
								return constants_1.CONNECTION_STATE.Connecting;
							case constants_1.SOCKET_STATES.open:
								return constants_1.CONNECTION_STATE.Open;
							case constants_1.SOCKET_STATES.closing:
								return constants_1.CONNECTION_STATE.Closing;
							default:
								return constants_1.CONNECTION_STATE.Closed;
						}
					}
					/**
					 * Retuns `true` is the connection is open.
					 */
					isConnected() {
						return this.connectionState() === constants_1.CONNECTION_STATE.Open;
					}
					/**
					 * Removes a subscription from the socket.
					 *
					 * @param channel An open subscription.
					 */
					remove(channel) {
						this.channels = this.channels.filter(
							(c) => c.joinRef() !== channel.joinRef()
						);
					}
					channel(topic, chanParams = {}) {
						const chan = new RealtimeSubscription_1.default(
							topic,
							chanParams,
							this
						);
						this.channels.push(chan);
						return chan;
					}
					/**
					 * Push out a message if the socket is connected.
					 *
					 * If the socket is not connected, the message gets enqueued within a local buffer, and sent out when a connection is next established.
					 */
					push(data) {
						const { topic, event, payload, ref } = data;
						let callback = () => {
							this.encode(data, (result) => {
								var _a;
								(_a = this.conn) === null || _a === void 0
									? void 0
									: _a.send(result);
							});
						};
						this.log("push", `${topic} ${event} (${ref})`, payload);
						if (this.isConnected()) {
							callback();
						} else {
							this.sendBuffer.push(callback);
						}
					}
					onConnMessage(rawMessage) {
						this.decode(rawMessage.data, (msg) => {
							let { topic, event, payload, ref } = msg;
							if (
								(ref && ref === this.pendingHeartbeatRef) ||
								event ===
									(payload === null || payload === void 0
										? void 0
										: payload.type)
							) {
								this.pendingHeartbeatRef = null;
							}
							this.log(
								"receive",
								`${payload.status || ""} ${topic} ${event} ${
									(ref && "(" + ref + ")") || ""
								}`,
								payload
							);
							this.channels
								.filter((channel) => channel.isMember(topic))
								.forEach((channel) => channel.trigger(event, payload, ref));
							this.stateChangeCallbacks.message.forEach((callback) =>
								callback(msg)
							);
						});
					}
					/**
					 * Returns the URL of the websocket.
					 */
					endPointURL() {
						return this._appendParams(
							this.endPoint,
							Object.assign({}, this.params, { vsn: constants_1.VSN })
						);
					}
					/**
					 * Return the next message ref, accounting for overflows
					 */
					makeRef() {
						let newRef = this.ref + 1;
						if (newRef === this.ref) {
							this.ref = 0;
						} else {
							this.ref = newRef;
						}
						return this.ref.toString();
					}
					/**
					 * Sets the JWT access token used for channel subscription authorization and Realtime RLS.
					 *
					 * @param token A JWT string.
					 */
					setAuth(token) {
						this.accessToken = token;
						this.channels.forEach((channel) => {
							token && channel.updateJoinPayload({ user_token: token });
							if (channel.joinedOnce && channel.isJoined()) {
								channel.push(constants_1.CHANNEL_EVENTS.access_token, {
									access_token: token,
								});
							}
						});
					}
					/**
					 * Unsubscribe from channels with the specified topic.
					 */
					leaveOpenTopic(topic) {
						let dupChannel = this.channels.find(
							(c) => c.topic === topic && (c.isJoined() || c.isJoining())
						);
						if (dupChannel) {
							this.log("transport", `leaving duplicate topic "${topic}"`);
							dupChannel.unsubscribe();
						}
					}
					_onConnOpen() {
						this.log("transport", `connected to ${this.endPointURL()}`);
						this._flushSendBuffer();
						this.reconnectTimer.reset();
						this.heartbeatTimer && clearInterval(this.heartbeatTimer);
						this.heartbeatTimer = setInterval(
							() => this._sendHeartbeat(),
							this.heartbeatIntervalMs
						);
						this.stateChangeCallbacks.open.forEach((callback) => callback());
					}
					_onConnClose(event) {
						this.log("transport", "close", event);
						this._triggerChanError();
						this.heartbeatTimer && clearInterval(this.heartbeatTimer);
						this.reconnectTimer.scheduleTimeout();
						this.stateChangeCallbacks.close.forEach((callback) =>
							callback(event)
						);
					}
					_onConnError(error) {
						this.log("transport", error.message);
						this._triggerChanError();
						this.stateChangeCallbacks.error.forEach((callback) =>
							callback(error)
						);
					}
					_triggerChanError() {
						this.channels.forEach((channel) =>
							channel.trigger(constants_1.CHANNEL_EVENTS.error)
						);
					}
					_appendParams(url, params) {
						if (Object.keys(params).length === 0) {
							return url;
						}
						const prefix = url.match(/\?/) ? "&" : "?";
						const query = new URLSearchParams(params);
						return `${url}${prefix}${query}`;
					}
					_flushSendBuffer() {
						if (this.isConnected() && this.sendBuffer.length > 0) {
							this.sendBuffer.forEach((callback) => callback());
							this.sendBuffer = [];
						}
					}
					_sendHeartbeat() {
						var _a;
						if (!this.isConnected()) {
							return;
						}
						if (this.pendingHeartbeatRef) {
							this.pendingHeartbeatRef = null;
							this.log(
								"transport",
								"heartbeat timeout. Attempting to re-establish connection"
							);
							(_a = this.conn) === null || _a === void 0
								? void 0
								: _a.close(constants_1.WS_CLOSE_NORMAL, "hearbeat timeout");
							return;
						}
						this.pendingHeartbeatRef = this.makeRef();
						this.push({
							topic: "phoenix",
							event: "heartbeat",
							payload: {},
							ref: this.pendingHeartbeatRef,
						});
						this.setAuth(this.accessToken);
					}
				}
				exports.default = RealtimeClient;
			},
			{
				"./RealtimeSubscription": 28,
				"./lib/constants": 30,
				"./lib/serializer": 32,
				"./lib/timer": 33,
				websocket: 88,
			},
		],
		28: [
			function (require, module, exports) {
				"use strict";
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const constants_1 = require("./lib/constants");
				const push_1 = __importDefault(require("./lib/push"));
				const timer_1 = __importDefault(require("./lib/timer"));
				class RealtimeSubscription {
					constructor(topic, params = {}, socket) {
						this.topic = topic;
						this.params = params;
						this.socket = socket;
						this.bindings = [];
						this.state = constants_1.CHANNEL_STATES.closed;
						this.joinedOnce = false;
						this.pushBuffer = [];
						this.timeout = this.socket.timeout;
						this.joinPush = new push_1.default(
							this,
							constants_1.CHANNEL_EVENTS.join,
							this.params,
							this.timeout
						);
						this.rejoinTimer = new timer_1.default(
							() => this.rejoinUntilConnected(),
							this.socket.reconnectAfterMs
						);
						this.joinPush.receive("ok", () => {
							this.state = constants_1.CHANNEL_STATES.joined;
							this.rejoinTimer.reset();
							this.pushBuffer.forEach((pushEvent) => pushEvent.send());
							this.pushBuffer = [];
						});
						this.onClose(() => {
							this.rejoinTimer.reset();
							this.socket.log(
								"channel",
								`close ${this.topic} ${this.joinRef()}`
							);
							this.state = constants_1.CHANNEL_STATES.closed;
							this.socket.remove(this);
						});
						this.onError((reason) => {
							if (this.isLeaving() || this.isClosed()) {
								return;
							}
							this.socket.log("channel", `error ${this.topic}`, reason);
							this.state = constants_1.CHANNEL_STATES.errored;
							this.rejoinTimer.scheduleTimeout();
						});
						this.joinPush.receive("timeout", () => {
							if (!this.isJoining()) {
								return;
							}
							this.socket.log(
								"channel",
								`timeout ${this.topic}`,
								this.joinPush.timeout
							);
							this.state = constants_1.CHANNEL_STATES.errored;
							this.rejoinTimer.scheduleTimeout();
						});
						this.on(constants_1.CHANNEL_EVENTS.reply, (payload, ref) => {
							this.trigger(this.replyEventName(ref), payload);
						});
					}
					rejoinUntilConnected() {
						this.rejoinTimer.scheduleTimeout();
						if (this.socket.isConnected()) {
							this.rejoin();
						}
					}
					subscribe(timeout = this.timeout) {
						if (this.joinedOnce) {
							throw `tried to subscribe multiple times. 'subscribe' can only be called a single time per channel instance`;
						} else {
							this.joinedOnce = true;
							this.rejoin(timeout);
							return this.joinPush;
						}
					}
					onClose(callback) {
						this.on(constants_1.CHANNEL_EVENTS.close, callback);
					}
					onError(callback) {
						this.on(constants_1.CHANNEL_EVENTS.error, (reason) =>
							callback(reason)
						);
					}
					on(event, callback) {
						this.bindings.push({ event, callback });
					}
					off(event) {
						this.bindings = this.bindings.filter(
							(bind) => bind.event !== event
						);
					}
					canPush() {
						return this.socket.isConnected() && this.isJoined();
					}
					push(event, payload, timeout = this.timeout) {
						if (!this.joinedOnce) {
							throw `tried to push '${event}' to '${this.topic}' before joining. Use channel.subscribe() before pushing events`;
						}
						let pushEvent = new push_1.default(this, event, payload, timeout);
						if (this.canPush()) {
							pushEvent.send();
						} else {
							pushEvent.startTimeout();
							this.pushBuffer.push(pushEvent);
						}
						return pushEvent;
					}
					updateJoinPayload(payload) {
						this.joinPush.updatePayload(payload);
					}
					/**
					 * Leaves the channel
					 *
					 * Unsubscribes from server events, and instructs channel to terminate on server.
					 * Triggers onClose() hooks.
					 *
					 * To receive leave acknowledgements, use the a `receive` hook to bind to the server ack, ie:
					 * channel.unsubscribe().receive("ok", () => alert("left!") )
					 */
					unsubscribe(timeout = this.timeout) {
						this.state = constants_1.CHANNEL_STATES.leaving;
						let onClose = () => {
							this.socket.log("channel", `leave ${this.topic}`);
							this.trigger(
								constants_1.CHANNEL_EVENTS.close,
								"leave",
								this.joinRef()
							);
						};
						// Destroy joinPush to avoid connection timeouts during unscription phase
						this.joinPush.destroy();
						let leavePush = new push_1.default(
							this,
							constants_1.CHANNEL_EVENTS.leave,
							{},
							timeout
						);
						leavePush
							.receive("ok", () => onClose())
							.receive("timeout", () => onClose());
						leavePush.send();
						if (!this.canPush()) {
							leavePush.trigger("ok", {});
						}
						return leavePush;
					}
					/**
					 * Overridable message hook
					 *
					 * Receives all events for specialized message handling before dispatching to the channel callbacks.
					 * Must return the payload, modified or unmodified.
					 */
					onMessage(event, payload, ref) {
						return payload;
					}
					isMember(topic) {
						return this.topic === topic;
					}
					joinRef() {
						return this.joinPush.ref;
					}
					rejoin(timeout = this.timeout) {
						if (this.isLeaving()) {
							return;
						}
						this.socket.leaveOpenTopic(this.topic);
						this.state = constants_1.CHANNEL_STATES.joining;
						this.joinPush.resend(timeout);
					}
					trigger(event, payload, ref) {
						let { close, error, leave, join } = constants_1.CHANNEL_EVENTS;
						let events = [close, error, leave, join];
						if (ref && events.indexOf(event) >= 0 && ref !== this.joinRef()) {
							return;
						}
						let handledPayload = this.onMessage(event, payload, ref);
						if (payload && !handledPayload) {
							throw "channel onMessage callbacks must return the payload, modified or unmodified";
						}
						this.bindings
							.filter((bind) => {
								// Bind all events if the user specifies a wildcard.
								if (bind.event === "*") {
									return (
										event ===
										(payload === null || payload === void 0
											? void 0
											: payload.type)
									);
								} else {
									return bind.event === event;
								}
							})
							.map((bind) => bind.callback(handledPayload, ref));
					}
					replyEventName(ref) {
						return `chan_reply_${ref}`;
					}
					isClosed() {
						return this.state === constants_1.CHANNEL_STATES.closed;
					}
					isErrored() {
						return this.state === constants_1.CHANNEL_STATES.errored;
					}
					isJoined() {
						return this.state === constants_1.CHANNEL_STATES.joined;
					}
					isJoining() {
						return this.state === constants_1.CHANNEL_STATES.joining;
					}
					isLeaving() {
						return this.state === constants_1.CHANNEL_STATES.leaving;
					}
				}
				exports.default = RealtimeSubscription;
			},
			{ "./lib/constants": 30, "./lib/push": 31, "./lib/timer": 33 },
		],
		29: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __setModuleDefault =
					(this && this.__setModuleDefault) ||
					(Object.create
						? function (o, v) {
								Object.defineProperty(o, "default", {
									enumerable: true,
									value: v,
								});
						  }
						: function (o, v) {
								o["default"] = v;
						  });
				var __importStar =
					(this && this.__importStar) ||
					function (mod) {
						if (mod && mod.__esModule) return mod;
						var result = {};
						if (mod != null)
							for (var k in mod)
								if (
									k !== "default" &&
									Object.prototype.hasOwnProperty.call(mod, k)
								)
									__createBinding(result, mod, k);
						__setModuleDefault(result, mod);
						return result;
					};
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.Transformers =
					exports.RealtimeSubscription =
					exports.RealtimeClient =
						void 0;
				const Transformers = __importStar(require("./lib/transformers"));
				exports.Transformers = Transformers;
				const RealtimeClient_1 = __importDefault(require("./RealtimeClient"));
				exports.RealtimeClient = RealtimeClient_1.default;
				const RealtimeSubscription_1 = __importDefault(
					require("./RealtimeSubscription")
				);
				exports.RealtimeSubscription = RealtimeSubscription_1.default;
			},
			{
				"./RealtimeClient": 27,
				"./RealtimeSubscription": 28,
				"./lib/transformers": 34,
			},
		],
		30: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.CONNECTION_STATE =
					exports.TRANSPORTS =
					exports.CHANNEL_EVENTS =
					exports.CHANNEL_STATES =
					exports.SOCKET_STATES =
					exports.WS_CLOSE_NORMAL =
					exports.DEFAULT_TIMEOUT =
					exports.VSN =
					exports.DEFAULT_HEADERS =
						void 0;
				const version_1 = require("./version");
				exports.DEFAULT_HEADERS = {
					"X-Client-Info": `realtime-js/${version_1.version}`,
				};
				exports.VSN = "1.0.0";
				exports.DEFAULT_TIMEOUT = 10000;
				exports.WS_CLOSE_NORMAL = 1000;
				var SOCKET_STATES;
				(function (SOCKET_STATES) {
					SOCKET_STATES[(SOCKET_STATES["connecting"] = 0)] = "connecting";
					SOCKET_STATES[(SOCKET_STATES["open"] = 1)] = "open";
					SOCKET_STATES[(SOCKET_STATES["closing"] = 2)] = "closing";
					SOCKET_STATES[(SOCKET_STATES["closed"] = 3)] = "closed";
				})(
					(SOCKET_STATES =
						exports.SOCKET_STATES || (exports.SOCKET_STATES = {}))
				);
				var CHANNEL_STATES;
				(function (CHANNEL_STATES) {
					CHANNEL_STATES["closed"] = "closed";
					CHANNEL_STATES["errored"] = "errored";
					CHANNEL_STATES["joined"] = "joined";
					CHANNEL_STATES["joining"] = "joining";
					CHANNEL_STATES["leaving"] = "leaving";
				})(
					(CHANNEL_STATES =
						exports.CHANNEL_STATES || (exports.CHANNEL_STATES = {}))
				);
				var CHANNEL_EVENTS;
				(function (CHANNEL_EVENTS) {
					CHANNEL_EVENTS["close"] = "phx_close";
					CHANNEL_EVENTS["error"] = "phx_error";
					CHANNEL_EVENTS["join"] = "phx_join";
					CHANNEL_EVENTS["reply"] = "phx_reply";
					CHANNEL_EVENTS["leave"] = "phx_leave";
					CHANNEL_EVENTS["access_token"] = "access_token";
				})(
					(CHANNEL_EVENTS =
						exports.CHANNEL_EVENTS || (exports.CHANNEL_EVENTS = {}))
				);
				var TRANSPORTS;
				(function (TRANSPORTS) {
					TRANSPORTS["websocket"] = "websocket";
				})((TRANSPORTS = exports.TRANSPORTS || (exports.TRANSPORTS = {})));
				var CONNECTION_STATE;
				(function (CONNECTION_STATE) {
					CONNECTION_STATE["Connecting"] = "connecting";
					CONNECTION_STATE["Open"] = "open";
					CONNECTION_STATE["Closing"] = "closing";
					CONNECTION_STATE["Closed"] = "closed";
				})(
					(CONNECTION_STATE =
						exports.CONNECTION_STATE || (exports.CONNECTION_STATE = {}))
				);
			},
			{ "./version": 35 },
		],
		31: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				const constants_1 = require("../lib/constants");
				class Push {
					/**
					 * Initializes the Push
					 *
					 * @param channel The Channel
					 * @param event The event, for example `"phx_join"`
					 * @param payload The payload, for example `{user_id: 123}`
					 * @param timeout The push timeout in milliseconds
					 */
					constructor(
						channel,
						event,
						payload = {},
						timeout = constants_1.DEFAULT_TIMEOUT
					) {
						this.channel = channel;
						this.event = event;
						this.payload = payload;
						this.timeout = timeout;
						this.sent = false;
						this.timeoutTimer = undefined;
						this.ref = "";
						this.receivedResp = null;
						this.recHooks = [];
						this.refEvent = null;
					}
					resend(timeout) {
						this.timeout = timeout;
						this._cancelRefEvent();
						this.ref = "";
						this.refEvent = null;
						this.receivedResp = null;
						this.sent = false;
						this.send();
					}
					send() {
						if (this._hasReceived("timeout")) {
							return;
						}
						this.startTimeout();
						this.sent = true;
						this.channel.socket.push({
							topic: this.channel.topic,
							event: this.event,
							payload: this.payload,
							ref: this.ref,
							join_ref: this.channel.joinRef(),
						});
					}
					updatePayload(payload) {
						this.payload = Object.assign(
							Object.assign({}, this.payload),
							payload
						);
					}
					receive(status, callback) {
						var _a;
						if (this._hasReceived(status)) {
							callback(
								(_a = this.receivedResp) === null || _a === void 0
									? void 0
									: _a.response
							);
						}
						this.recHooks.push({ status, callback });
						return this;
					}
					startTimeout() {
						if (this.timeoutTimer) {
							return;
						}
						this.ref = this.channel.socket.makeRef();
						this.refEvent = this.channel.replyEventName(this.ref);
						const callback = (payload) => {
							this._cancelRefEvent();
							this._cancelTimeout();
							this.receivedResp = payload;
							this._matchReceive(payload);
						};
						this.channel.on(this.refEvent, callback);
						this.timeoutTimer = setTimeout(() => {
							this.trigger("timeout", {});
						}, this.timeout);
					}
					trigger(status, response) {
						if (this.refEvent)
							this.channel.trigger(this.refEvent, { status, response });
					}
					destroy() {
						this._cancelRefEvent();
						this._cancelTimeout();
					}
					_cancelRefEvent() {
						if (!this.refEvent) {
							return;
						}
						this.channel.off(this.refEvent);
					}
					_cancelTimeout() {
						clearTimeout(this.timeoutTimer);
						this.timeoutTimer = undefined;
					}
					_matchReceive({ status, response }) {
						this.recHooks
							.filter((h) => h.status === status)
							.forEach((h) => h.callback(response));
					}
					_hasReceived(status) {
						return this.receivedResp && this.receivedResp.status === status;
					}
				}
				exports.default = Push;
			},
			{ "../lib/constants": 30 },
		],
		32: [
			function (require, module, exports) {
				"use strict";
				// This file draws heavily from https://github.com/phoenixframework/phoenix/commit/cf098e9cf7a44ee6479d31d911a97d3c7430c6fe
				// License: https://github.com/phoenixframework/phoenix/blob/master/LICENSE.md
				Object.defineProperty(exports, "__esModule", { value: true });
				class Serializer {
					constructor() {
						this.HEADER_LENGTH = 1;
					}
					decode(rawPayload, callback) {
						if (rawPayload.constructor === ArrayBuffer) {
							return callback(this._binaryDecode(rawPayload));
						}
						if (typeof rawPayload === "string") {
							return callback(JSON.parse(rawPayload));
						}
						return callback({});
					}
					_binaryDecode(buffer) {
						const view = new DataView(buffer);
						const decoder = new TextDecoder();
						return this._decodeBroadcast(buffer, view, decoder);
					}
					_decodeBroadcast(buffer, view, decoder) {
						const topicSize = view.getUint8(1);
						const eventSize = view.getUint8(2);
						let offset = this.HEADER_LENGTH + 2;
						const topic = decoder.decode(
							buffer.slice(offset, offset + topicSize)
						);
						offset = offset + topicSize;
						const event = decoder.decode(
							buffer.slice(offset, offset + eventSize)
						);
						offset = offset + eventSize;
						const data = JSON.parse(
							decoder.decode(buffer.slice(offset, buffer.byteLength))
						);
						return { ref: null, topic: topic, event: event, payload: data };
					}
				}
				exports.default = Serializer;
			},
			{},
		],
		33: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				/**
				 * Creates a timer that accepts a `timerCalc` function to perform calculated timeout retries, such as exponential backoff.
				 *
				 * @example
				 *    let reconnectTimer = new Timer(() => this.connect(), function(tries){
				 *      return [1000, 5000, 10000][tries - 1] || 10000
				 *    })
				 *    reconnectTimer.scheduleTimeout() // fires after 1000
				 *    reconnectTimer.scheduleTimeout() // fires after 5000
				 *    reconnectTimer.reset()
				 *    reconnectTimer.scheduleTimeout() // fires after 1000
				 */
				class Timer {
					constructor(callback, timerCalc) {
						this.callback = callback;
						this.timerCalc = timerCalc;
						this.timer = undefined;
						this.tries = 0;
						this.callback = callback;
						this.timerCalc = timerCalc;
					}
					reset() {
						this.tries = 0;
						clearTimeout(this.timer);
					}
					// Cancels any previous scheduleTimeout and schedules callback
					scheduleTimeout() {
						clearTimeout(this.timer);
						this.timer = setTimeout(() => {
							this.tries = this.tries + 1;
							this.callback();
						}, this.timerCalc(this.tries + 1));
					}
				}
				exports.default = Timer;
			},
			{},
		],
		34: [
			function (require, module, exports) {
				"use strict";
				/**
				 * Helpers to convert the change Payload into native JS types.
				 */
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.toTimestampString =
					exports.toArray =
					exports.toJson =
					exports.toNumber =
					exports.toBoolean =
					exports.convertCell =
					exports.convertColumn =
					exports.convertChangeData =
					exports.PostgresTypes =
						void 0;
				// Adapted from epgsql (src/epgsql_binary.erl), this module licensed under
				// 3-clause BSD found here: https://raw.githubusercontent.com/epgsql/epgsql/devel/LICENSE
				var PostgresTypes;
				(function (PostgresTypes) {
					PostgresTypes["abstime"] = "abstime";
					PostgresTypes["bool"] = "bool";
					PostgresTypes["date"] = "date";
					PostgresTypes["daterange"] = "daterange";
					PostgresTypes["float4"] = "float4";
					PostgresTypes["float8"] = "float8";
					PostgresTypes["int2"] = "int2";
					PostgresTypes["int4"] = "int4";
					PostgresTypes["int4range"] = "int4range";
					PostgresTypes["int8"] = "int8";
					PostgresTypes["int8range"] = "int8range";
					PostgresTypes["json"] = "json";
					PostgresTypes["jsonb"] = "jsonb";
					PostgresTypes["money"] = "money";
					PostgresTypes["numeric"] = "numeric";
					PostgresTypes["oid"] = "oid";
					PostgresTypes["reltime"] = "reltime";
					PostgresTypes["text"] = "text";
					PostgresTypes["time"] = "time";
					PostgresTypes["timestamp"] = "timestamp";
					PostgresTypes["timestamptz"] = "timestamptz";
					PostgresTypes["timetz"] = "timetz";
					PostgresTypes["tsrange"] = "tsrange";
					PostgresTypes["tstzrange"] = "tstzrange";
				})(
					(PostgresTypes =
						exports.PostgresTypes || (exports.PostgresTypes = {}))
				);
				/**
				 * Takes an array of columns and an object of string values then converts each string value
				 * to its mapped type.
				 *
				 * @param {{name: String, type: String}[]} columns
				 * @param {Object} record
				 * @param {Object} options The map of various options that can be applied to the mapper
				 * @param {Array} options.skipTypes The array of types that should not be converted
				 *
				 * @example convertChangeData([{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age:'33'}, {})
				 * //=>{ first_name: 'Paul', age: 33 }
				 */
				exports.convertChangeData = (columns, record, options = {}) => {
					var _a;
					const skipTypes =
						(_a = options.skipTypes) !== null && _a !== void 0 ? _a : [];
					return Object.keys(record).reduce((acc, rec_key) => {
						acc[rec_key] = exports.convertColumn(
							rec_key,
							columns,
							record,
							skipTypes
						);
						return acc;
					}, {});
				};
				/**
				 * Converts the value of an individual column.
				 *
				 * @param {String} columnName The column that you want to convert
				 * @param {{name: String, type: String}[]} columns All of the columns
				 * @param {Object} record The map of string values
				 * @param {Array} skipTypes An array of types that should not be converted
				 * @return {object} Useless information
				 *
				 * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, [])
				 * //=> 33
				 * @example convertColumn('age', [{name: 'first_name', type: 'text'}, {name: 'age', type: 'int4'}], {first_name: 'Paul', age: '33'}, ['int4'])
				 * //=> "33"
				 */
				exports.convertColumn = (columnName, columns, record, skipTypes) => {
					const column = columns.find((x) => x.name === columnName);
					const colType =
						column === null || column === void 0 ? void 0 : column.type;
					const value = record[columnName];
					if (colType && !skipTypes.includes(colType)) {
						return exports.convertCell(colType, value);
					}
					return noop(value);
				};
				/**
				 * If the value of the cell is `null`, returns null.
				 * Otherwise converts the string value to the correct type.
				 * @param {String} type A postgres column type
				 * @param {String} stringValue The cell value
				 *
				 * @example convertCell('bool', 't')
				 * //=> true
				 * @example convertCell('int8', '10')
				 * //=> 10
				 * @example convertCell('_int4', '{1,2,3,4}')
				 * //=> [1,2,3,4]
				 */
				exports.convertCell = (type, value) => {
					// if data type is an array
					if (type.charAt(0) === "_") {
						const dataType = type.slice(1, type.length);
						return exports.toArray(value, dataType);
					}
					// If not null, convert to correct type.
					switch (type) {
						case PostgresTypes.bool:
							return exports.toBoolean(value);
						case PostgresTypes.float4:
						case PostgresTypes.float8:
						case PostgresTypes.int2:
						case PostgresTypes.int4:
						case PostgresTypes.int8:
						case PostgresTypes.numeric:
						case PostgresTypes.oid:
							return exports.toNumber(value);
						case PostgresTypes.json:
						case PostgresTypes.jsonb:
							return exports.toJson(value);
						case PostgresTypes.timestamp:
							return exports.toTimestampString(value); // Format to be consistent with PostgREST
						case PostgresTypes.abstime: // To allow users to cast it based on Timezone
						case PostgresTypes.date: // To allow users to cast it based on Timezone
						case PostgresTypes.daterange:
						case PostgresTypes.int4range:
						case PostgresTypes.int8range:
						case PostgresTypes.money:
						case PostgresTypes.reltime: // To allow users to cast it based on Timezone
						case PostgresTypes.text:
						case PostgresTypes.time: // To allow users to cast it based on Timezone
						case PostgresTypes.timestamptz: // To allow users to cast it based on Timezone
						case PostgresTypes.timetz: // To allow users to cast it based on Timezone
						case PostgresTypes.tsrange:
						case PostgresTypes.tstzrange:
							return noop(value);
						default:
							// Return the value for remaining types
							return noop(value);
					}
				};
				const noop = (value) => {
					return value;
				};
				exports.toBoolean = (value) => {
					switch (value) {
						case "t":
							return true;
						case "f":
							return false;
						default:
							return value;
					}
				};
				exports.toNumber = (value) => {
					if (typeof value === "string") {
						const parsedValue = parseFloat(value);
						if (!Number.isNaN(parsedValue)) {
							return parsedValue;
						}
					}
					return value;
				};
				exports.toJson = (value) => {
					if (typeof value === "string") {
						try {
							return JSON.parse(value);
						} catch (error) {
							console.log(`JSON parse error: ${error}`);
							return value;
						}
					}
					return value;
				};
				/**
				 * Converts a Postgres Array into a native JS array
				 *
				 * @example toArray('{}', 'int4')
				 * //=> []
				 * @example toArray('{"[2021-01-01,2021-12-31)","(2021-01-01,2021-12-32]"}', 'daterange')
				 * //=> ['[2021-01-01,2021-12-31)', '(2021-01-01,2021-12-32]']
				 * @example toArray([1,2,3,4], 'int4')
				 * //=> [1,2,3,4]
				 */
				exports.toArray = (value, type) => {
					if (typeof value !== "string") {
						return value;
					}
					const lastIdx = value.length - 1;
					const closeBrace = value[lastIdx];
					const openBrace = value[0];
					// Confirm value is a Postgres array by checking curly brackets
					if (openBrace === "{" && closeBrace === "}") {
						let arr;
						const valTrim = value.slice(1, lastIdx);
						// TODO: find a better solution to separate Postgres array data
						try {
							arr = JSON.parse("[" + valTrim + "]");
						} catch (_) {
							// WARNING: splitting on comma does not cover all edge cases
							arr = valTrim ? valTrim.split(",") : [];
						}
						return arr.map((val) => exports.convertCell(type, val));
					}
					return value;
				};
				/**
				 * Fixes timestamp to be ISO-8601. Swaps the space between the date and time for a 'T'
				 * See https://github.com/supabase/supabase/issues/18
				 *
				 * @example toTimestampString('2019-09-10 00:00:00')
				 * //=> '2019-09-10T00:00:00'
				 */
				exports.toTimestampString = (value) => {
					if (typeof value === "string") {
						return value.replace(" ", "T");
					}
					return value;
				};
			},
			{},
		],
		35: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.version = void 0;
				exports.version = "1.7.5";
			},
			{},
		],
		36: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.StorageClient = void 0;
				const lib_1 = require("./lib");
				class StorageClient extends lib_1.StorageBucketApi {
					constructor(url, headers = {}, fetch) {
						super(url, headers, fetch);
					}
					/**
					 * Perform file operation in a bucket.
					 *
					 * @param id The bucket id to operate on.
					 */
					from(id) {
						return new lib_1.StorageFileApi(
							this.url,
							this.headers,
							id,
							this.fetch
						);
					}
				}
				exports.StorageClient = StorageClient;
			},
			{ "./lib": 43 },
		],
		37: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __exportStar =
					(this && this.__exportStar) ||
					function (m, exports) {
						for (var p in m)
							if (
								p !== "default" &&
								!Object.prototype.hasOwnProperty.call(exports, p)
							)
								__createBinding(exports, m, p);
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.SupabaseStorageClient = exports.StorageClient = void 0;
				var StorageClient_1 = require("./StorageClient");
				Object.defineProperty(exports, "StorageClient", {
					enumerable: true,
					get: function () {
						return StorageClient_1.StorageClient;
					},
				});
				Object.defineProperty(exports, "SupabaseStorageClient", {
					enumerable: true,
					get: function () {
						return StorageClient_1.StorageClient;
					},
				});
				__exportStar(require("./lib/types"), exports);
			},
			{ "./StorageClient": 36, "./lib/types": 44 },
		],
		38: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.StorageBucketApi = void 0;
				const constants_1 = require("./constants");
				const fetch_1 = require("./fetch");
				const helpers_1 = require("./helpers");
				class StorageBucketApi {
					constructor(url, headers = {}, fetch) {
						this.url = url;
						this.headers = Object.assign(
							Object.assign({}, constants_1.DEFAULT_HEADERS),
							headers
						);
						this.fetch = helpers_1.resolveFetch(fetch);
					}
					/**
					 * Retrieves the details of all Storage buckets within an existing project.
					 */
					listBuckets() {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.get(
									this.fetch,
									`${this.url}/bucket`,
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Retrieves the details of an existing Storage bucket.
					 *
					 * @param id The unique identifier of the bucket you would like to retrieve.
					 */
					getBucket(id) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.get(
									this.fetch,
									`${this.url}/bucket/${id}`,
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Creates a new Storage bucket
					 *
					 * @param id A unique identifier for the bucket you are creating.
					 * @returns newly created bucket id
					 */
					createBucket(id, options = { public: false }) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.post(
									this.fetch,
									`${this.url}/bucket`,
									{ id, name: id, public: options.public },
									{ headers: this.headers }
								);
								return { data: data.name, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Updates a new Storage bucket
					 *
					 * @param id A unique identifier for the bucket you are updating.
					 */
					updateBucket(id, options) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.put(
									this.fetch,
									`${this.url}/bucket/${id}`,
									{ id, name: id, public: options.public },
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Removes all objects inside a single bucket.
					 *
					 * @param id The unique identifier of the bucket you would like to empty.
					 */
					emptyBucket(id) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.post(
									this.fetch,
									`${this.url}/bucket/${id}/empty`,
									{},
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Deletes an existing bucket. A bucket can't be deleted with existing objects inside it.
					 * You must first `empty()` the bucket.
					 *
					 * @param id The unique identifier of the bucket you would like to delete.
					 */
					deleteBucket(id) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.remove(
									this.fetch,
									`${this.url}/bucket/${id}`,
									{},
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
				}
				exports.StorageBucketApi = StorageBucketApi;
			},
			{ "./constants": 40, "./fetch": 41, "./helpers": 42 },
		],
		39: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.StorageFileApi = void 0;
				const fetch_1 = require("./fetch");
				const helpers_1 = require("./helpers");
				const DEFAULT_SEARCH_OPTIONS = {
					limit: 100,
					offset: 0,
					sortBy: {
						column: "name",
						order: "asc",
					},
				};
				const DEFAULT_FILE_OPTIONS = {
					cacheControl: "3600",
					contentType: "text/plain;charset=UTF-8",
					upsert: false,
				};
				class StorageFileApi {
					constructor(url, headers = {}, bucketId, fetch) {
						this.url = url;
						this.headers = headers;
						this.bucketId = bucketId;
						this.fetch = helpers_1.resolveFetch(fetch);
					}
					/**
					 * Uploads a file to an existing bucket or replaces an existing file at the specified path with a new one.
					 *
					 * @param method HTTP method.
					 * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
					 * @param fileBody The body of the file to be stored in the bucket.
					 * @param fileOptions HTTP headers.
					 * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
					 * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
					 * `upsert`: boolean, whether to perform an upsert.
					 */
					uploadOrUpdate(method, path, fileBody, fileOptions) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								let body;
								const options = Object.assign(
									Object.assign({}, DEFAULT_FILE_OPTIONS),
									fileOptions
								);
								const headers = Object.assign(
									Object.assign({}, this.headers),
									method === "POST" && { "x-upsert": String(options.upsert) }
								);
								if (typeof Blob !== "undefined" && fileBody instanceof Blob) {
									body = new FormData();
									body.append("cacheControl", options.cacheControl);
									body.append("", fileBody);
								} else if (
									typeof FormData !== "undefined" &&
									fileBody instanceof FormData
								) {
									body = fileBody;
									body.append("cacheControl", options.cacheControl);
								} else {
									body = fileBody;
									headers["cache-control"] = `max-age=${options.cacheControl}`;
									headers["content-type"] = options.contentType;
								}
								const cleanPath = this._removeEmptyFolders(path);
								const _path = this._getFinalPath(cleanPath);
								const res = yield this.fetch(`${this.url}/object/${_path}`, {
									method,
									body: body,
									headers,
								});
								if (res.ok) {
									// const data = await res.json()
									// temporary fix till backend is updated to the latest storage-api version
									return { data: { Key: _path }, error: null };
								} else {
									const error = yield res.json();
									return { data: null, error };
								}
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Uploads a file to an existing bucket.
					 *
					 * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
					 * @param fileBody The body of the file to be stored in the bucket.
					 * @param fileOptions HTTP headers.
					 * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
					 * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
					 * `upsert`: boolean, whether to perform an upsert.
					 */
					upload(path, fileBody, fileOptions) {
						return __awaiter(this, void 0, void 0, function* () {
							return this.uploadOrUpdate("POST", path, fileBody, fileOptions);
						});
					}
					/**
					 * Replaces an existing file at the specified path with a new one.
					 *
					 * @param path The relative file path. Should be of the format `folder/subfolder/filename.png`. The bucket must already exist before attempting to upload.
					 * @param fileBody The body of the file to be stored in the bucket.
					 * @param fileOptions HTTP headers.
					 * `cacheControl`: string, the `Cache-Control: max-age=<seconds>` seconds value.
					 * `contentType`: string, the `Content-Type` header value. Should be specified if using a `fileBody` that is neither `Blob` nor `File` nor `FormData`, otherwise will default to `text/plain;charset=UTF-8`.
					 * `upsert`: boolean, whether to perform an upsert.
					 */
					update(path, fileBody, fileOptions) {
						return __awaiter(this, void 0, void 0, function* () {
							return this.uploadOrUpdate("PUT", path, fileBody, fileOptions);
						});
					}
					/**
					 * Moves an existing file.
					 *
					 * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
					 * @param toPath The new file path, including the new file name. For example `folder/image-new.png`.
					 */
					move(fromPath, toPath) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.post(
									this.fetch,
									`${this.url}/object/move`,
									{
										bucketId: this.bucketId,
										sourceKey: fromPath,
										destinationKey: toPath,
									},
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Copies an existing file.
					 *
					 * @param fromPath The original file path, including the current file name. For example `folder/image.png`.
					 * @param toPath The new file path, including the new file name. For example `folder/image-copy.png`.
					 */
					copy(fromPath, toPath) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.post(
									this.fetch,
									`${this.url}/object/copy`,
									{
										bucketId: this.bucketId,
										sourceKey: fromPath,
										destinationKey: toPath,
									},
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Create signed URL to download file without requiring permissions. This URL can be valid for a set number of seconds.
					 *
					 * @param path The file path to be downloaded, including the current file name. For example `folder/image.png`.
					 * @param expiresIn The number of seconds until the signed URL expires. For example, `60` for a URL which is valid for one minute.
					 */
					createSignedUrl(path, expiresIn) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const _path = this._getFinalPath(path);
								let data = yield fetch_1.post(
									this.fetch,
									`${this.url}/object/sign/${_path}`,
									{ expiresIn },
									{ headers: this.headers }
								);
								const signedURL = `${this.url}${data.signedURL}`;
								data = { signedURL };
								return { data, error: null, signedURL };
							} catch (error) {
								return { data: null, error, signedURL: null };
							}
						});
					}
					/**
					 * Create signed URLs to download files without requiring permissions. These URLs can be valid for a set number of seconds.
					 *
					 * @param paths The file paths to be downloaded, including the current file names. For example `['folder/image.png', 'folder2/image2.png']`.
					 * @param expiresIn The number of seconds until the signed URLs expire. For example, `60` for URLs which are valid for one minute.
					 */
					createSignedUrls(paths, expiresIn) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.post(
									this.fetch,
									`${this.url}/object/sign/${this.bucketId}`,
									{ expiresIn, paths },
									{ headers: this.headers }
								);
								return {
									data: data.map((datum) =>
										Object.assign(Object.assign({}, datum), {
											signedURL: datum.signedURL
												? `${this.url}${datum.signedURL}`
												: null,
										})
									),
									error: null,
								};
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Downloads a file.
					 *
					 * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
					 */
					download(path) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const _path = this._getFinalPath(path);
								const res = yield fetch_1.get(
									this.fetch,
									`${this.url}/object/${_path}`,
									{
										headers: this.headers,
										noResolveJson: true,
									}
								);
								const data = yield res.blob();
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Retrieve URLs for assets in public buckets
					 *
					 * @param path The file path to be downloaded, including the path and file name. For example `folder/image.png`.
					 */
					getPublicUrl(path) {
						try {
							const _path = this._getFinalPath(path);
							const publicURL = `${this.url}/object/public/${_path}`;
							const data = { publicURL };
							return { data, error: null, publicURL };
						} catch (error) {
							return { data: null, error, publicURL: null };
						}
					}
					/**
					 * Deletes files within the same bucket
					 *
					 * @param paths An array of files to be deleted, including the path and file name. For example [`folder/image.png`].
					 */
					remove(paths) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const data = yield fetch_1.remove(
									this.fetch,
									`${this.url}/object/${this.bucketId}`,
									{ prefixes: paths },
									{ headers: this.headers }
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					/**
					 * Get file metadata
					 * @param id the file id to retrieve metadata
					 */
					// async getMetadata(id: string): Promise<{ data: Metadata | null; error: Error | null }> {
					//   try {
					//     const data = await get(`${this.url}/metadata/${id}`, { headers: this.headers })
					//     return { data, error: null }
					//   } catch (error) {
					//     return { data: null, error }
					//   }
					// }
					/**
					 * Update file metadata
					 * @param id the file id to update metadata
					 * @param meta the new file metadata
					 */
					// async updateMetadata(
					//   id: string,
					//   meta: Metadata
					// ): Promise<{ data: Metadata | null; error: Error | null }> {
					//   try {
					//     const data = await post(`${this.url}/metadata/${id}`, { ...meta }, { headers: this.headers })
					//     return { data, error: null }
					//   } catch (error) {
					//     return { data: null, error }
					//   }
					// }
					/**
					 * Lists all the files within a bucket.
					 * @param path The folder path.
					 * @param options Search options, including `limit`, `offset`, `sortBy`, and `search`.
					 * @param parameters Fetch parameters, currently only supports `signal`, which is an AbortController's signal
					 */
					list(path, options, parameters) {
						return __awaiter(this, void 0, void 0, function* () {
							try {
								const body = Object.assign(
									Object.assign(
										Object.assign({}, DEFAULT_SEARCH_OPTIONS),
										options
									),
									{ prefix: path || "" }
								);
								const data = yield fetch_1.post(
									this.fetch,
									`${this.url}/object/list/${this.bucketId}`,
									body,
									{ headers: this.headers },
									parameters
								);
								return { data, error: null };
							} catch (error) {
								return { data: null, error };
							}
						});
					}
					_getFinalPath(path) {
						return `${this.bucketId}/${path}`;
					}
					_removeEmptyFolders(path) {
						return path.replace(/^\/|\/$/g, "").replace(/\/+/g, "/");
					}
				}
				exports.StorageFileApi = StorageFileApi;
			},
			{ "./fetch": 41, "./helpers": 42 },
		],
		40: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.DEFAULT_HEADERS = void 0;
				const version_1 = require("./version");
				exports.DEFAULT_HEADERS = {
					"X-Client-Info": `storage-js/${version_1.version}`,
				};
			},
			{ "./version": 45 },
		],
		41: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.remove = exports.put = exports.post = exports.get = void 0;
				const _getErrorMessage = (err) =>
					err.msg ||
					err.message ||
					err.error_description ||
					err.error ||
					JSON.stringify(err);
				const handleError = (error, reject) => {
					if (typeof error.json !== "function") {
						return reject(error);
					}
					error.json().then((err) => {
						return reject({
							message: _getErrorMessage(err),
							status:
								(error === null || error === void 0 ? void 0 : error.status) ||
								500,
						});
					});
				};
				const _getRequestParams = (method, options, parameters, body) => {
					const params = {
						method,
						headers:
							(options === null || options === void 0
								? void 0
								: options.headers) || {},
					};
					if (method === "GET") {
						return params;
					}
					params.headers = Object.assign(
						{ "Content-Type": "application/json" },
						options === null || options === void 0 ? void 0 : options.headers
					);
					params.body = JSON.stringify(body);
					return Object.assign(Object.assign({}, params), parameters);
				};
				function _handleRequest(
					fetcher,
					method,
					url,
					options,
					parameters,
					body
				) {
					return __awaiter(this, void 0, void 0, function* () {
						return new Promise((resolve, reject) => {
							fetcher(url, _getRequestParams(method, options, parameters, body))
								.then((result) => {
									if (!result.ok) throw result;
									if (
										options === null || options === void 0
											? void 0
											: options.noResolveJson
									)
										return resolve(result);
									return result.json();
								})
								.then((data) => resolve(data))
								.catch((error) => handleError(error, reject));
						});
					});
				}
				function get(fetcher, url, options, parameters) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(fetcher, "GET", url, options, parameters);
					});
				}
				exports.get = get;
				function post(fetcher, url, body, options, parameters) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(
							fetcher,
							"POST",
							url,
							options,
							parameters,
							body
						);
					});
				}
				exports.post = post;
				function put(fetcher, url, body, options, parameters) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(
							fetcher,
							"PUT",
							url,
							options,
							parameters,
							body
						);
					});
				}
				exports.put = put;
				function remove(fetcher, url, body, options, parameters) {
					return __awaiter(this, void 0, void 0, function* () {
						return _handleRequest(
							fetcher,
							"DELETE",
							url,
							options,
							parameters,
							body
						);
					});
				}
				exports.remove = remove;
			},
			{},
		],
		42: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __setModuleDefault =
					(this && this.__setModuleDefault) ||
					(Object.create
						? function (o, v) {
								Object.defineProperty(o, "default", {
									enumerable: true,
									value: v,
								});
						  }
						: function (o, v) {
								o["default"] = v;
						  });
				var __importStar =
					(this && this.__importStar) ||
					function (mod) {
						if (mod && mod.__esModule) return mod;
						var result = {};
						if (mod != null)
							for (var k in mod)
								if (
									k !== "default" &&
									Object.prototype.hasOwnProperty.call(mod, k)
								)
									__createBinding(result, mod, k);
						__setModuleDefault(result, mod);
						return result;
					};
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.resolveFetch = void 0;
				exports.resolveFetch = (customFetch) => {
					let _fetch;
					if (customFetch) {
						_fetch = customFetch;
					} else if (typeof fetch === "undefined") {
						_fetch = (...args) =>
							__awaiter(void 0, void 0, void 0, function* () {
								return yield (yield Promise.resolve().then(() =>
									__importStar(require("cross-fetch"))
								)).fetch(...args);
							});
					} else {
						_fetch = fetch;
					}
					return (...args) => _fetch(...args);
				};
			},
			{ "cross-fetch": 86 },
		],
		43: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								Object.defineProperty(o, k2, {
									enumerable: true,
									get: function () {
										return m[k];
									},
								});
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __exportStar =
					(this && this.__exportStar) ||
					function (m, exports) {
						for (var p in m)
							if (
								p !== "default" &&
								!Object.prototype.hasOwnProperty.call(exports, p)
							)
								__createBinding(exports, m, p);
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				__exportStar(require("./StorageBucketApi"), exports);
				__exportStar(require("./StorageFileApi"), exports);
				__exportStar(require("./types"), exports);
				__exportStar(require("./constants"), exports);
			},
			{
				"./StorageBucketApi": 38,
				"./StorageFileApi": 39,
				"./constants": 40,
				"./types": 44,
			},
		],
		44: [
			function (require, module, exports) {
				arguments[4][16][0].apply(exports, arguments);
			},
			{ dup: 16 },
		],
		45: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.version = void 0;
				// generated by genversion
				exports.version = "1.7.3";
			},
			{},
		],
		46: [
			function (require, module, exports) {
				"use strict";
				var __awaiter =
					(this && this.__awaiter) ||
					function (thisArg, _arguments, P, generator) {
						function adopt(value) {
							return value instanceof P
								? value
								: new P(function (resolve) {
										resolve(value);
								  });
						}
						return new (P || (P = Promise))(function (resolve, reject) {
							function fulfilled(value) {
								try {
									step(generator.next(value));
								} catch (e) {
									reject(e);
								}
							}
							function rejected(value) {
								try {
									step(generator["throw"](value));
								} catch (e) {
									reject(e);
								}
							}
							function step(result) {
								result.done
									? resolve(result.value)
									: adopt(result.value).then(fulfilled, rejected);
							}
							step(
								(generator = generator.apply(thisArg, _arguments || [])).next()
							);
						});
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				const constants_1 = require("./lib/constants");
				const helpers_1 = require("./lib/helpers");
				const SupabaseAuthClient_1 = require("./lib/SupabaseAuthClient");
				const SupabaseQueryBuilder_1 = require("./lib/SupabaseQueryBuilder");
				const storage_js_1 = require("@supabase/storage-js");
				const functions_js_1 = require("@supabase/functions-js");
				const postgrest_js_1 = require("@supabase/postgrest-js");
				const realtime_js_1 = require("@supabase/realtime-js");
				const DEFAULT_OPTIONS = {
					schema: "public",
					autoRefreshToken: true,
					persistSession: true,
					detectSessionInUrl: true,
					multiTab: true,
					headers: constants_1.DEFAULT_HEADERS,
				};
				/**
				 * Supabase Client.
				 *
				 * An isomorphic Javascript client for interacting with Postgres.
				 */
				class SupabaseClient {
					/**
					 * Create a new client for use in the browser.
					 * @param supabaseUrl The unique Supabase URL which is supplied when you create a new project in your project dashboard.
					 * @param supabaseKey The unique Supabase Key which is supplied when you create a new project in your project dashboard.
					 * @param options.schema You can switch in between schemas. The schema needs to be on the list of exposed schemas inside Supabase.
					 * @param options.autoRefreshToken Set to "true" if you want to automatically refresh the token before expiring.
					 * @param options.persistSession Set to "true" if you want to automatically save the user session into local storage.
					 * @param options.detectSessionInUrl Set to "true" if you want to automatically detects OAuth grants in the URL and signs in the user.
					 * @param options.headers Any additional headers to send with each network request.
					 * @param options.realtime Options passed along to realtime-js constructor.
					 * @param options.multiTab Set to "false" if you want to disable multi-tab/window events.
					 * @param options.fetch A custom fetch implementation.
					 */
					constructor(supabaseUrl, supabaseKey, options) {
						this.supabaseUrl = supabaseUrl;
						this.supabaseKey = supabaseKey;
						if (!supabaseUrl) throw new Error("supabaseUrl is required.");
						if (!supabaseKey) throw new Error("supabaseKey is required.");
						const _supabaseUrl = (0, helpers_1.stripTrailingSlash)(supabaseUrl);
						const settings = Object.assign(
							Object.assign({}, DEFAULT_OPTIONS),
							options
						);
						this.restUrl = `${_supabaseUrl}/rest/v1`;
						this.realtimeUrl = `${_supabaseUrl}/realtime/v1`.replace(
							"http",
							"ws"
						);
						this.authUrl = `${_supabaseUrl}/auth/v1`;
						this.storageUrl = `${_supabaseUrl}/storage/v1`;
						const isPlatform = _supabaseUrl.match(
							/(supabase\.co)|(supabase\.in)/
						);
						if (isPlatform) {
							const urlParts = _supabaseUrl.split(".");
							this.functionsUrl = `${urlParts[0]}.functions.${urlParts[1]}.${urlParts[2]}`;
						} else {
							this.functionsUrl = `${_supabaseUrl}/functions/v1`;
						}
						this.schema = settings.schema;
						this.multiTab = settings.multiTab;
						this.fetch = settings.fetch;
						this.headers = Object.assign(
							Object.assign({}, constants_1.DEFAULT_HEADERS),
							options === null || options === void 0 ? void 0 : options.headers
						);
						this.shouldThrowOnError = settings.shouldThrowOnError || false;
						this.auth = this._initSupabaseAuthClient(settings);
						this.realtime = this._initRealtimeClient(
							Object.assign({ headers: this.headers }, settings.realtime)
						);
						this._listenForAuthEvents();
						this._listenForMultiTabEvents();
						// In the future we might allow the user to pass in a logger to receive these events.
						// this.realtime.onOpen(() => console.log('OPEN'))
						// this.realtime.onClose(() => console.log('CLOSED'))
						// this.realtime.onError((e: Error) => console.log('Socket error', e))
					}
					/**
					 * Supabase Functions allows you to deploy and invoke edge functions.
					 */
					get functions() {
						return new functions_js_1.FunctionsClient(this.functionsUrl, {
							headers: this._getAuthHeaders(),
							customFetch: this.fetch,
						});
					}
					/**
					 * Supabase Storage allows you to manage user-generated content, such as photos or videos.
					 */
					get storage() {
						return new storage_js_1.SupabaseStorageClient(
							this.storageUrl,
							this._getAuthHeaders(),
							this.fetch
						);
					}
					/**
					 * Perform a table operation.
					 *
					 * @param table The table name to operate on.
					 */
					from(table) {
						const url = `${this.restUrl}/${table}`;
						return new SupabaseQueryBuilder_1.SupabaseQueryBuilder(url, {
							headers: this._getAuthHeaders(),
							schema: this.schema,
							realtime: this.realtime,
							table,
							fetch: this.fetch,
							shouldThrowOnError: this.shouldThrowOnError,
						});
					}
					/**
					 * Perform a function call.
					 *
					 * @param fn  The function name to call.
					 * @param params  The parameters to pass to the function call.
					 * @param head   When set to true, no data will be returned.
					 * @param count  Count algorithm to use to count rows in a table.
					 *
					 */
					rpc(fn, params, { head = false, count = null } = {}) {
						const rest = this._initPostgRESTClient();
						return rest.rpc(fn, params, { head, count });
					}
					/**
					 * Closes and removes all subscriptions and returns a list of removed
					 * subscriptions and their errors.
					 */
					removeAllSubscriptions() {
						return __awaiter(this, void 0, void 0, function* () {
							const allSubs = this.getSubscriptions().slice();
							const allSubPromises = allSubs.map((sub) =>
								this.removeSubscription(sub)
							);
							const allRemovedSubs = yield Promise.all(allSubPromises);
							return allRemovedSubs.map(({ error }, i) => {
								return {
									data: { subscription: allSubs[i] },
									error,
								};
							});
						});
					}
					/**
					 * Closes and removes a subscription and returns the number of open subscriptions.
					 *
					 * @param subscription The subscription you want to close and remove.
					 */
					removeSubscription(subscription) {
						return __awaiter(this, void 0, void 0, function* () {
							const { error } = yield this._closeSubscription(subscription);
							const allSubs = this.getSubscriptions();
							const openSubCount = allSubs.filter((chan) =>
								chan.isJoined()
							).length;
							if (allSubs.length === 0) yield this.realtime.disconnect();
							return { data: { openSubscriptions: openSubCount }, error };
						});
					}
					_closeSubscription(subscription) {
						return __awaiter(this, void 0, void 0, function* () {
							let error = null;
							if (!subscription.isClosed()) {
								const { error: unsubError } =
									yield this._unsubscribeSubscription(subscription);
								error = unsubError;
							}
							this.realtime.remove(subscription);
							return { error };
						});
					}
					_unsubscribeSubscription(subscription) {
						return new Promise((resolve) => {
							subscription
								.unsubscribe()
								.receive("ok", () => resolve({ error: null }))
								.receive("error", (error) => resolve({ error }))
								.receive("timeout", () =>
									resolve({ error: new Error("timed out") })
								);
						});
					}
					/**
					 * Returns an array of all your subscriptions.
					 */
					getSubscriptions() {
						return this.realtime.channels;
					}
					_initSupabaseAuthClient({
						autoRefreshToken,
						persistSession,
						detectSessionInUrl,
						localStorage,
						headers,
						fetch,
						cookieOptions,
						multiTab,
					}) {
						const authHeaders = {
							Authorization: `Bearer ${this.supabaseKey}`,
							apikey: `${this.supabaseKey}`,
						};
						return new SupabaseAuthClient_1.SupabaseAuthClient({
							url: this.authUrl,
							headers: Object.assign(Object.assign({}, headers), authHeaders),
							autoRefreshToken,
							persistSession,
							detectSessionInUrl,
							localStorage,
							fetch,
							cookieOptions,
							multiTab,
						});
					}
					_initRealtimeClient(options) {
						return new realtime_js_1.RealtimeClient(
							this.realtimeUrl,
							Object.assign(Object.assign({}, options), {
								params: Object.assign(
									Object.assign(
										{},
										options === null || options === void 0
											? void 0
											: options.params
									),
									{ apikey: this.supabaseKey }
								),
							})
						);
					}
					_initPostgRESTClient() {
						return new postgrest_js_1.PostgrestClient(this.restUrl, {
							headers: this._getAuthHeaders(),
							schema: this.schema,
							fetch: this.fetch,
							throwOnError: this.shouldThrowOnError,
						});
					}
					_getAuthHeaders() {
						var _a, _b;
						const headers = Object.assign({}, this.headers);
						const authBearer =
							(_b =
								(_a = this.auth.session()) === null || _a === void 0
									? void 0
									: _a.access_token) !== null && _b !== void 0
								? _b
								: this.supabaseKey;
						headers["apikey"] = this.supabaseKey;
						headers["Authorization"] =
							headers["Authorization"] || `Bearer ${authBearer}`;
						return headers;
					}
					_listenForMultiTabEvents() {
						if (
							!this.multiTab ||
							!(0, helpers_1.isBrowser)() ||
							!(window === null || window === void 0
								? void 0
								: window.addEventListener)
						) {
							return null;
						}
						try {
							return window === null || window === void 0
								? void 0
								: window.addEventListener("storage", (e) => {
										var _a, _b, _c;
										if (e.key === constants_1.STORAGE_KEY) {
											const newSession = JSON.parse(String(e.newValue));
											const accessToken =
												(_b =
													(_a =
														newSession === null || newSession === void 0
															? void 0
															: newSession.currentSession) === null ||
													_a === void 0
														? void 0
														: _a.access_token) !== null && _b !== void 0
													? _b
													: undefined;
											const previousAccessToken =
												(_c = this.auth.session()) === null || _c === void 0
													? void 0
													: _c.access_token;
											if (!accessToken) {
												this._handleTokenChanged(
													"SIGNED_OUT",
													accessToken,
													"STORAGE"
												);
											} else if (!previousAccessToken && accessToken) {
												this._handleTokenChanged(
													"SIGNED_IN",
													accessToken,
													"STORAGE"
												);
											} else if (previousAccessToken !== accessToken) {
												this._handleTokenChanged(
													"TOKEN_REFRESHED",
													accessToken,
													"STORAGE"
												);
											}
										}
								  });
						} catch (error) {
							console.error("_listenForMultiTabEvents", error);
							return null;
						}
					}
					_listenForAuthEvents() {
						let { data } = this.auth.onAuthStateChange((event, session) => {
							this._handleTokenChanged(
								event,
								session === null || session === void 0
									? void 0
									: session.access_token,
								"CLIENT"
							);
						});
						return data;
					}
					_handleTokenChanged(event, token, source) {
						if (
							(event === "TOKEN_REFRESHED" || event === "SIGNED_IN") &&
							this.changedAccessToken !== token
						) {
							// Token has changed
							this.realtime.setAuth(token);
							// Ideally we should call this.auth.recoverSession() - need to make public
							// to trigger a "SIGNED_IN" event on this client.
							if (source == "STORAGE") this.auth.setAuth(token);
							this.changedAccessToken = token;
						} else if (event === "SIGNED_OUT" || event === "USER_DELETED") {
							// Token is removed
							this.realtime.setAuth(this.supabaseKey);
							if (source == "STORAGE") this.auth.signOut();
						}
					}
				}
				exports.default = SupabaseClient;
			},
			{
				"./lib/SupabaseAuthClient": 48,
				"./lib/SupabaseQueryBuilder": 49,
				"./lib/constants": 51,
				"./lib/helpers": 52,
				"@supabase/functions-js": 7,
				"@supabase/postgrest-js": 19,
				"@supabase/realtime-js": 29,
				"@supabase/storage-js": 37,
			},
		],
		47: [
			function (require, module, exports) {
				"use strict";
				var __createBinding =
					(this && this.__createBinding) ||
					(Object.create
						? function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								var desc = Object.getOwnPropertyDescriptor(m, k);
								if (
									!desc ||
									("get" in desc
										? !m.__esModule
										: desc.writable || desc.configurable)
								) {
									desc = {
										enumerable: true,
										get: function () {
											return m[k];
										},
									};
								}
								Object.defineProperty(o, k2, desc);
						  }
						: function (o, m, k, k2) {
								if (k2 === undefined) k2 = k;
								o[k2] = m[k];
						  });
				var __exportStar =
					(this && this.__exportStar) ||
					function (m, exports) {
						for (var p in m)
							if (
								p !== "default" &&
								!Object.prototype.hasOwnProperty.call(exports, p)
							)
								__createBinding(exports, m, p);
					};
				var __importDefault =
					(this && this.__importDefault) ||
					function (mod) {
						return mod && mod.__esModule ? mod : { default: mod };
					};
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.SupabaseClient = exports.createClient = void 0;
				const SupabaseClient_1 = __importDefault(require("./SupabaseClient"));
				exports.SupabaseClient = SupabaseClient_1.default;
				__exportStar(require("@supabase/gotrue-js"), exports);
				__exportStar(require("@supabase/realtime-js"), exports);
				/**
				 * Creates a new Supabase Client.
				 */
				const createClient = (supabaseUrl, supabaseKey, options) => {
					return new SupabaseClient_1.default(
						supabaseUrl,
						supabaseKey,
						options
					);
				};
				exports.createClient = createClient;
			},
			{
				"./SupabaseClient": 46,
				"@supabase/gotrue-js": 10,
				"@supabase/realtime-js": 29,
			},
		],
		48: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.SupabaseAuthClient = void 0;
				const gotrue_js_1 = require("@supabase/gotrue-js");
				class SupabaseAuthClient extends gotrue_js_1.GoTrueClient {
					constructor(options) {
						super(options);
					}
				}
				exports.SupabaseAuthClient = SupabaseAuthClient;
			},
			{ "@supabase/gotrue-js": 10 },
		],
		49: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.SupabaseQueryBuilder = void 0;
				const postgrest_js_1 = require("@supabase/postgrest-js");
				const SupabaseRealtimeClient_1 = require("./SupabaseRealtimeClient");
				class SupabaseQueryBuilder extends postgrest_js_1.PostgrestQueryBuilder {
					constructor(
						url,
						{ headers = {}, schema, realtime, table, fetch, shouldThrowOnError }
					) {
						super(url, { headers, schema, fetch, shouldThrowOnError });
						this._subscription = null;
						this._realtime = realtime;
						this._headers = headers;
						this._schema = schema;
						this._table = table;
					}
					/**
					 * Subscribe to realtime changes in your database.
					 * @param event The database event which you would like to receive updates for, or you can use the special wildcard `*` to listen to all changes.
					 * @param callback A callback that will handle the payload that is sent whenever your database changes.
					 */
					on(event, callback) {
						if (!this._realtime.isConnected()) {
							this._realtime.connect();
						}
						if (!this._subscription) {
							this._subscription =
								new SupabaseRealtimeClient_1.SupabaseRealtimeClient(
									this._realtime,
									this._headers,
									this._schema,
									this._table
								);
						}
						return this._subscription.on(event, callback);
					}
				}
				exports.SupabaseQueryBuilder = SupabaseQueryBuilder;
			},
			{ "./SupabaseRealtimeClient": 50, "@supabase/postgrest-js": 19 },
		],
		50: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.SupabaseRealtimeClient = void 0;
				const realtime_js_1 = require("@supabase/realtime-js");
				class SupabaseRealtimeClient {
					constructor(socket, headers, schema, tableName) {
						const chanParams = {};
						const topic =
							tableName === "*"
								? `realtime:${schema}`
								: `realtime:${schema}:${tableName}`;
						const userToken = headers["Authorization"].split(" ")[1];
						if (userToken) {
							chanParams["user_token"] = userToken;
						}
						this.subscription = socket.channel(topic, chanParams);
					}
					getPayloadRecords(payload) {
						const records = {
							new: {},
							old: {},
						};
						if (payload.type === "INSERT" || payload.type === "UPDATE") {
							records.new = realtime_js_1.Transformers.convertChangeData(
								payload.columns,
								payload.record
							);
						}
						if (payload.type === "UPDATE" || payload.type === "DELETE") {
							records.old = realtime_js_1.Transformers.convertChangeData(
								payload.columns,
								payload.old_record
							);
						}
						return records;
					}
					/**
					 * The event you want to listen to.
					 *
					 * @param event The event
					 * @param callback A callback function that is called whenever the event occurs.
					 */
					on(event, callback) {
						this.subscription.on(event, (payload) => {
							let enrichedPayload = {
								schema: payload.schema,
								table: payload.table,
								commit_timestamp: payload.commit_timestamp,
								eventType: payload.type,
								new: {},
								old: {},
								errors: payload.errors,
							};
							enrichedPayload = Object.assign(
								Object.assign({}, enrichedPayload),
								this.getPayloadRecords(payload)
							);
							callback(enrichedPayload);
						});
						return this;
					}
					/**
					 * Enables the subscription.
					 */
					subscribe(callback = () => {}) {
						this.subscription.onError((e) => callback("SUBSCRIPTION_ERROR", e));
						this.subscription.onClose(() => callback("CLOSED"));
						this.subscription
							.subscribe()
							.receive("ok", () => callback("SUBSCRIBED"))
							.receive("error", (e) => callback("SUBSCRIPTION_ERROR", e))
							.receive("timeout", () => callback("RETRYING_AFTER_TIMEOUT"));
						return this.subscription;
					}
				}
				exports.SupabaseRealtimeClient = SupabaseRealtimeClient;
			},
			{ "@supabase/realtime-js": 29 },
		],
		51: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.STORAGE_KEY = exports.DEFAULT_HEADERS = void 0;
				// constants.ts
				const version_1 = require("./version");
				exports.DEFAULT_HEADERS = {
					"X-Client-Info": `supabase-js/${version_1.version}`,
				};
				exports.STORAGE_KEY = "supabase.auth.token";
			},
			{ "./version": 53 },
		],
		52: [
			function (require, module, exports) {
				"use strict";
				// helpers.ts
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.isBrowser = exports.stripTrailingSlash = exports.uuid = void 0;
				function uuid() {
					return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
						/[xy]/g,
						function (c) {
							var r = (Math.random() * 16) | 0,
								v = c == "x" ? r : (r & 0x3) | 0x8;
							return v.toString(16);
						}
					);
				}
				exports.uuid = uuid;
				function stripTrailingSlash(url) {
					return url.replace(/\/$/, "");
				}
				exports.stripTrailingSlash = stripTrailingSlash;
				const isBrowser = () => typeof window !== "undefined";
				exports.isBrowser = isBrowser;
			},
			{},
		],
		53: [
			function (require, module, exports) {
				"use strict";
				Object.defineProperty(exports, "__esModule", { value: true });
				exports.version = void 0;
				exports.version = "1.35.7";
			},
			{},
		],
		54: [
			function (require, module, exports) {
				module.exports = require("./lib/axios");
			},
			{ "./lib/axios": 56 },
		],
		55: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");
				var settle = require("./../core/settle");
				var cookies = require("./../helpers/cookies");
				var buildURL = require("./../helpers/buildURL");
				var buildFullPath = require("../core/buildFullPath");
				var parseHeaders = require("./../helpers/parseHeaders");
				var isURLSameOrigin = require("./../helpers/isURLSameOrigin");
				var transitionalDefaults = require("../defaults/transitional");
				var AxiosError = require("../core/AxiosError");
				var CanceledError = require("../cancel/CanceledError");
				var parseProtocol = require("../helpers/parseProtocol");

				module.exports = function xhrAdapter(config) {
					return new Promise(function dispatchXhrRequest(resolve, reject) {
						var requestData = config.data;
						var requestHeaders = config.headers;
						var responseType = config.responseType;
						var onCanceled;
						function done() {
							if (config.cancelToken) {
								config.cancelToken.unsubscribe(onCanceled);
							}

							if (config.signal) {
								config.signal.removeEventListener("abort", onCanceled);
							}
						}

						if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
							delete requestHeaders["Content-Type"]; // Let the browser set it
						}

						var request = new XMLHttpRequest();

						// HTTP basic authentication
						if (config.auth) {
							var username = config.auth.username || "";
							var password = config.auth.password
								? unescape(encodeURIComponent(config.auth.password))
								: "";
							requestHeaders.Authorization =
								"Basic " + btoa(username + ":" + password);
						}

						var fullPath = buildFullPath(config.baseURL, config.url);

						request.open(
							config.method.toUpperCase(),
							buildURL(fullPath, config.params, config.paramsSerializer),
							true
						);

						// Set the request timeout in MS
						request.timeout = config.timeout;

						function onloadend() {
							if (!request) {
								return;
							}
							// Prepare the response
							var responseHeaders =
								"getAllResponseHeaders" in request
									? parseHeaders(request.getAllResponseHeaders())
									: null;
							var responseData =
								!responseType ||
								responseType === "text" ||
								responseType === "json"
									? request.responseText
									: request.response;
							var response = {
								data: responseData,
								status: request.status,
								statusText: request.statusText,
								headers: responseHeaders,
								config: config,
								request: request,
							};

							settle(
								function _resolve(value) {
									resolve(value);
									done();
								},
								function _reject(err) {
									reject(err);
									done();
								},
								response
							);

							// Clean up request
							request = null;
						}

						if ("onloadend" in request) {
							// Use onloadend if available
							request.onloadend = onloadend;
						} else {
							// Listen for ready state to emulate onloadend
							request.onreadystatechange = function handleLoad() {
								if (!request || request.readyState !== 4) {
									return;
								}

								// The request errored out and we didn't get a response, this will be
								// handled by onerror instead
								// With one exception: request that using file: protocol, most browsers
								// will return status as 0 even though it's a successful request
								if (
									request.status === 0 &&
									!(
										request.responseURL &&
										request.responseURL.indexOf("file:") === 0
									)
								) {
									return;
								}
								// readystate handler is calling before onerror or ontimeout handlers,
								// so we should call onloadend on the next 'tick'
								setTimeout(onloadend);
							};
						}

						// Handle browser request cancellation (as opposed to a manual cancellation)
						request.onabort = function handleAbort() {
							if (!request) {
								return;
							}

							reject(
								new AxiosError(
									"Request aborted",
									AxiosError.ECONNABORTED,
									config,
									request
								)
							);

							// Clean up request
							request = null;
						};

						// Handle low level network errors
						request.onerror = function handleError() {
							// Real errors are hidden from us by the browser
							// onerror should only fire if it's a network error
							reject(
								new AxiosError(
									"Network Error",
									AxiosError.ERR_NETWORK,
									config,
									request,
									request
								)
							);

							// Clean up request
							request = null;
						};

						// Handle timeout
						request.ontimeout = function handleTimeout() {
							var timeoutErrorMessage = config.timeout
								? "timeout of " + config.timeout + "ms exceeded"
								: "timeout exceeded";
							var transitional = config.transitional || transitionalDefaults;
							if (config.timeoutErrorMessage) {
								timeoutErrorMessage = config.timeoutErrorMessage;
							}
							reject(
								new AxiosError(
									timeoutErrorMessage,
									transitional.clarifyTimeoutError
										? AxiosError.ETIMEDOUT
										: AxiosError.ECONNABORTED,
									config,
									request
								)
							);

							// Clean up request
							request = null;
						};

						// Add xsrf header
						// This is only done if running in a standard browser environment.
						// Specifically not if we're in a web worker, or react-native.
						if (utils.isStandardBrowserEnv()) {
							// Add xsrf header
							var xsrfValue =
								(config.withCredentials || isURLSameOrigin(fullPath)) &&
								config.xsrfCookieName
									? cookies.read(config.xsrfCookieName)
									: undefined;

							if (xsrfValue) {
								requestHeaders[config.xsrfHeaderName] = xsrfValue;
							}
						}

						// Add headers to the request
						if ("setRequestHeader" in request) {
							utils.forEach(
								requestHeaders,
								function setRequestHeader(val, key) {
									if (
										typeof requestData === "undefined" &&
										key.toLowerCase() === "content-type"
									) {
										// Remove Content-Type if data is undefined
										delete requestHeaders[key];
									} else {
										// Otherwise add header to the request
										request.setRequestHeader(key, val);
									}
								}
							);
						}

						// Add withCredentials to request if needed
						if (!utils.isUndefined(config.withCredentials)) {
							request.withCredentials = !!config.withCredentials;
						}

						// Add responseType to request if needed
						if (responseType && responseType !== "json") {
							request.responseType = config.responseType;
						}

						// Handle progress if needed
						if (typeof config.onDownloadProgress === "function") {
							request.addEventListener("progress", config.onDownloadProgress);
						}

						// Not all browsers support upload events
						if (
							typeof config.onUploadProgress === "function" &&
							request.upload
						) {
							request.upload.addEventListener(
								"progress",
								config.onUploadProgress
							);
						}

						if (config.cancelToken || config.signal) {
							// Handle cancellation
							// eslint-disable-next-line func-names
							onCanceled = function (cancel) {
								if (!request) {
									return;
								}
								reject(
									!cancel || (cancel && cancel.type)
										? new CanceledError()
										: cancel
								);
								request.abort();
								request = null;
							};

							config.cancelToken && config.cancelToken.subscribe(onCanceled);
							if (config.signal) {
								config.signal.aborted
									? onCanceled()
									: config.signal.addEventListener("abort", onCanceled);
							}
						}

						if (!requestData) {
							requestData = null;
						}

						var protocol = parseProtocol(fullPath);

						if (
							protocol &&
							["http", "https", "file"].indexOf(protocol) === -1
						) {
							reject(
								new AxiosError(
									"Unsupported protocol " + protocol + ":",
									AxiosError.ERR_BAD_REQUEST,
									config
								)
							);
							return;
						}

						// Send the request
						request.send(requestData);
					});
				};
			},
			{
				"../cancel/CanceledError": 58,
				"../core/AxiosError": 61,
				"../core/buildFullPath": 63,
				"../defaults/transitional": 69,
				"../helpers/parseProtocol": 81,
				"./../core/settle": 66,
				"./../helpers/buildURL": 72,
				"./../helpers/cookies": 74,
				"./../helpers/isURLSameOrigin": 77,
				"./../helpers/parseHeaders": 80,
				"./../utils": 85,
			},
		],
		56: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./utils");
				var bind = require("./helpers/bind");
				var Axios = require("./core/Axios");
				var mergeConfig = require("./core/mergeConfig");
				var defaults = require("./defaults");

				/**
				 * Create an instance of Axios
				 *
				 * @param {Object} defaultConfig The default config for the instance
				 * @return {Axios} A new instance of Axios
				 */
				function createInstance(defaultConfig) {
					var context = new Axios(defaultConfig);
					var instance = bind(Axios.prototype.request, context);

					// Copy axios.prototype to instance
					utils.extend(instance, Axios.prototype, context);

					// Copy context to instance
					utils.extend(instance, context);

					// Factory for creating new instances
					instance.create = function create(instanceConfig) {
						return createInstance(mergeConfig(defaultConfig, instanceConfig));
					};

					return instance;
				}

				// Create the default instance to be exported
				var axios = createInstance(defaults);

				// Expose Axios class to allow class inheritance
				axios.Axios = Axios;

				// Expose Cancel & CancelToken
				axios.CanceledError = require("./cancel/CanceledError");
				axios.CancelToken = require("./cancel/CancelToken");
				axios.isCancel = require("./cancel/isCancel");
				axios.VERSION = require("./env/data").version;
				axios.toFormData = require("./helpers/toFormData");

				// Expose AxiosError class
				axios.AxiosError = require("../lib/core/AxiosError");

				// alias for CanceledError for backward compatibility
				axios.Cancel = axios.CanceledError;

				// Expose all/spread
				axios.all = function all(promises) {
					return Promise.all(promises);
				};
				axios.spread = require("./helpers/spread");

				// Expose isAxiosError
				axios.isAxiosError = require("./helpers/isAxiosError");

				module.exports = axios;

				// Allow use of default import syntax in TypeScript
				module.exports.default = axios;
			},
			{
				"../lib/core/AxiosError": 61,
				"./cancel/CancelToken": 57,
				"./cancel/CanceledError": 58,
				"./cancel/isCancel": 59,
				"./core/Axios": 60,
				"./core/mergeConfig": 65,
				"./defaults": 68,
				"./env/data": 70,
				"./helpers/bind": 71,
				"./helpers/isAxiosError": 76,
				"./helpers/spread": 82,
				"./helpers/toFormData": 83,
				"./utils": 85,
			},
		],
		57: [
			function (require, module, exports) {
				"use strict";

				var CanceledError = require("./CanceledError");

				/**
				 * A `CancelToken` is an object that can be used to request cancellation of an operation.
				 *
				 * @class
				 * @param {Function} executor The executor function.
				 */
				function CancelToken(executor) {
					if (typeof executor !== "function") {
						throw new TypeError("executor must be a function.");
					}

					var resolvePromise;

					this.promise = new Promise(function promiseExecutor(resolve) {
						resolvePromise = resolve;
					});

					var token = this;

					// eslint-disable-next-line func-names
					this.promise.then(function (cancel) {
						if (!token._listeners) return;

						var i;
						var l = token._listeners.length;

						for (i = 0; i < l; i++) {
							token._listeners[i](cancel);
						}
						token._listeners = null;
					});

					// eslint-disable-next-line func-names
					this.promise.then = function (onfulfilled) {
						var _resolve;
						// eslint-disable-next-line func-names
						var promise = new Promise(function (resolve) {
							token.subscribe(resolve);
							_resolve = resolve;
						}).then(onfulfilled);

						promise.cancel = function reject() {
							token.unsubscribe(_resolve);
						};

						return promise;
					};

					executor(function cancel(message) {
						if (token.reason) {
							// Cancellation has already been requested
							return;
						}

						token.reason = new CanceledError(message);
						resolvePromise(token.reason);
					});
				}

				/**
				 * Throws a `CanceledError` if cancellation has been requested.
				 */
				CancelToken.prototype.throwIfRequested = function throwIfRequested() {
					if (this.reason) {
						throw this.reason;
					}
				};

				/**
				 * Subscribe to the cancel signal
				 */

				CancelToken.prototype.subscribe = function subscribe(listener) {
					if (this.reason) {
						listener(this.reason);
						return;
					}

					if (this._listeners) {
						this._listeners.push(listener);
					} else {
						this._listeners = [listener];
					}
				};

				/**
				 * Unsubscribe from the cancel signal
				 */

				CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
					if (!this._listeners) {
						return;
					}
					var index = this._listeners.indexOf(listener);
					if (index !== -1) {
						this._listeners.splice(index, 1);
					}
				};

				/**
				 * Returns an object that contains a new `CancelToken` and a function that, when called,
				 * cancels the `CancelToken`.
				 */
				CancelToken.source = function source() {
					var cancel;
					var token = new CancelToken(function executor(c) {
						cancel = c;
					});
					return {
						token: token,
						cancel: cancel,
					};
				};

				module.exports = CancelToken;
			},
			{ "./CanceledError": 58 },
		],
		58: [
			function (require, module, exports) {
				"use strict";

				var AxiosError = require("../core/AxiosError");
				var utils = require("../utils");

				/**
				 * A `CanceledError` is an object that is thrown when an operation is canceled.
				 *
				 * @class
				 * @param {string=} message The message.
				 */
				function CanceledError(message) {
					// eslint-disable-next-line no-eq-null,eqeqeq
					AxiosError.call(
						this,
						message == null ? "canceled" : message,
						AxiosError.ERR_CANCELED
					);
					this.name = "CanceledError";
				}

				utils.inherits(CanceledError, AxiosError, {
					__CANCEL__: true,
				});

				module.exports = CanceledError;
			},
			{ "../core/AxiosError": 61, "../utils": 85 },
		],
		59: [
			function (require, module, exports) {
				"use strict";

				module.exports = function isCancel(value) {
					return !!(value && value.__CANCEL__);
				};
			},
			{},
		],
		60: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");
				var buildURL = require("../helpers/buildURL");
				var InterceptorManager = require("./InterceptorManager");
				var dispatchRequest = require("./dispatchRequest");
				var mergeConfig = require("./mergeConfig");
				var buildFullPath = require("./buildFullPath");
				var validator = require("../helpers/validator");

				var validators = validator.validators;
				/**
				 * Create a new instance of Axios
				 *
				 * @param {Object} instanceConfig The default config for the instance
				 */
				function Axios(instanceConfig) {
					this.defaults = instanceConfig;
					this.interceptors = {
						request: new InterceptorManager(),
						response: new InterceptorManager(),
					};
				}

				/**
				 * Dispatch a request
				 *
				 * @param {Object} config The config specific for this request (merged with this.defaults)
				 */
				Axios.prototype.request = function request(configOrUrl, config) {
					/*eslint no-param-reassign:0*/
					// Allow for axios('example/url'[, config]) a la fetch API
					if (typeof configOrUrl === "string") {
						config = config || {};
						config.url = configOrUrl;
					} else {
						config = configOrUrl || {};
					}

					config = mergeConfig(this.defaults, config);

					// Set config.method
					if (config.method) {
						config.method = config.method.toLowerCase();
					} else if (this.defaults.method) {
						config.method = this.defaults.method.toLowerCase();
					} else {
						config.method = "get";
					}

					var transitional = config.transitional;

					if (transitional !== undefined) {
						validator.assertOptions(
							transitional,
							{
								silentJSONParsing: validators.transitional(validators.boolean),
								forcedJSONParsing: validators.transitional(validators.boolean),
								clarifyTimeoutError: validators.transitional(
									validators.boolean
								),
							},
							false
						);
					}

					// filter out skipped interceptors
					var requestInterceptorChain = [];
					var synchronousRequestInterceptors = true;
					this.interceptors.request.forEach(function unshiftRequestInterceptors(
						interceptor
					) {
						if (
							typeof interceptor.runWhen === "function" &&
							interceptor.runWhen(config) === false
						) {
							return;
						}

						synchronousRequestInterceptors =
							synchronousRequestInterceptors && interceptor.synchronous;

						requestInterceptorChain.unshift(
							interceptor.fulfilled,
							interceptor.rejected
						);
					});

					var responseInterceptorChain = [];
					this.interceptors.response.forEach(function pushResponseInterceptors(
						interceptor
					) {
						responseInterceptorChain.push(
							interceptor.fulfilled,
							interceptor.rejected
						);
					});

					var promise;

					if (!synchronousRequestInterceptors) {
						var chain = [dispatchRequest, undefined];

						Array.prototype.unshift.apply(chain, requestInterceptorChain);
						chain = chain.concat(responseInterceptorChain);

						promise = Promise.resolve(config);
						while (chain.length) {
							promise = promise.then(chain.shift(), chain.shift());
						}

						return promise;
					}

					var newConfig = config;
					while (requestInterceptorChain.length) {
						var onFulfilled = requestInterceptorChain.shift();
						var onRejected = requestInterceptorChain.shift();
						try {
							newConfig = onFulfilled(newConfig);
						} catch (error) {
							onRejected(error);
							break;
						}
					}

					try {
						promise = dispatchRequest(newConfig);
					} catch (error) {
						return Promise.reject(error);
					}

					while (responseInterceptorChain.length) {
						promise = promise.then(
							responseInterceptorChain.shift(),
							responseInterceptorChain.shift()
						);
					}

					return promise;
				};

				Axios.prototype.getUri = function getUri(config) {
					config = mergeConfig(this.defaults, config);
					var fullPath = buildFullPath(config.baseURL, config.url);
					return buildURL(fullPath, config.params, config.paramsSerializer);
				};

				// Provide aliases for supported request methods
				utils.forEach(
					["delete", "get", "head", "options"],
					function forEachMethodNoData(method) {
						/*eslint func-names:0*/
						Axios.prototype[method] = function (url, config) {
							return this.request(
								mergeConfig(config || {}, {
									method: method,
									url: url,
									data: (config || {}).data,
								})
							);
						};
					}
				);

				utils.forEach(
					["post", "put", "patch"],
					function forEachMethodWithData(method) {
						/*eslint func-names:0*/

						function generateHTTPMethod(isForm) {
							return function httpMethod(url, data, config) {
								return this.request(
									mergeConfig(config || {}, {
										method: method,
										headers: isForm
											? {
													"Content-Type": "multipart/form-data",
											  }
											: {},
										url: url,
										data: data,
									})
								);
							};
						}

						Axios.prototype[method] = generateHTTPMethod();

						Axios.prototype[method + "Form"] = generateHTTPMethod(true);
					}
				);

				module.exports = Axios;
			},
			{
				"../helpers/buildURL": 72,
				"../helpers/validator": 84,
				"./../utils": 85,
				"./InterceptorManager": 62,
				"./buildFullPath": 63,
				"./dispatchRequest": 64,
				"./mergeConfig": 65,
			},
		],
		61: [
			function (require, module, exports) {
				"use strict";

				var utils = require("../utils");

				/**
				 * Create an Error with the specified message, config, error code, request and response.
				 *
				 * @param {string} message The error message.
				 * @param {string} [code] The error code (for example, 'ECONNABORTED').
				 * @param {Object} [config] The config.
				 * @param {Object} [request] The request.
				 * @param {Object} [response] The response.
				 * @returns {Error} The created error.
				 */
				function AxiosError(message, code, config, request, response) {
					Error.call(this);
					this.message = message;
					this.name = "AxiosError";
					code && (this.code = code);
					config && (this.config = config);
					request && (this.request = request);
					response && (this.response = response);
				}

				utils.inherits(AxiosError, Error, {
					toJSON: function toJSON() {
						return {
							// Standard
							message: this.message,
							name: this.name,
							// Microsoft
							description: this.description,
							number: this.number,
							// Mozilla
							fileName: this.fileName,
							lineNumber: this.lineNumber,
							columnNumber: this.columnNumber,
							stack: this.stack,
							// Axios
							config: this.config,
							code: this.code,
							status:
								this.response && this.response.status
									? this.response.status
									: null,
						};
					},
				});

				var prototype = AxiosError.prototype;
				var descriptors = {};

				[
					"ERR_BAD_OPTION_VALUE",
					"ERR_BAD_OPTION",
					"ECONNABORTED",
					"ETIMEDOUT",
					"ERR_NETWORK",
					"ERR_FR_TOO_MANY_REDIRECTS",
					"ERR_DEPRECATED",
					"ERR_BAD_RESPONSE",
					"ERR_BAD_REQUEST",
					"ERR_CANCELED",
					// eslint-disable-next-line func-names
				].forEach(function (code) {
					descriptors[code] = { value: code };
				});

				Object.defineProperties(AxiosError, descriptors);
				Object.defineProperty(prototype, "isAxiosError", { value: true });

				// eslint-disable-next-line func-names
				AxiosError.from = function (
					error,
					code,
					config,
					request,
					response,
					customProps
				) {
					var axiosError = Object.create(prototype);

					utils.toFlatObject(error, axiosError, function filter(obj) {
						return obj !== Error.prototype;
					});

					AxiosError.call(
						axiosError,
						error.message,
						code,
						config,
						request,
						response
					);

					axiosError.name = error.name;

					customProps && Object.assign(axiosError, customProps);

					return axiosError;
				};

				module.exports = AxiosError;
			},
			{ "../utils": 85 },
		],
		62: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");

				function InterceptorManager() {
					this.handlers = [];
				}

				/**
				 * Add a new interceptor to the stack
				 *
				 * @param {Function} fulfilled The function to handle `then` for a `Promise`
				 * @param {Function} rejected The function to handle `reject` for a `Promise`
				 *
				 * @return {Number} An ID used to remove interceptor later
				 */
				InterceptorManager.prototype.use = function use(
					fulfilled,
					rejected,
					options
				) {
					this.handlers.push({
						fulfilled: fulfilled,
						rejected: rejected,
						synchronous: options ? options.synchronous : false,
						runWhen: options ? options.runWhen : null,
					});
					return this.handlers.length - 1;
				};

				/**
				 * Remove an interceptor from the stack
				 *
				 * @param {Number} id The ID that was returned by `use`
				 */
				InterceptorManager.prototype.eject = function eject(id) {
					if (this.handlers[id]) {
						this.handlers[id] = null;
					}
				};

				/**
				 * Iterate over all the registered interceptors
				 *
				 * This method is particularly useful for skipping over any
				 * interceptors that may have become `null` calling `eject`.
				 *
				 * @param {Function} fn The function to call for each interceptor
				 */
				InterceptorManager.prototype.forEach = function forEach(fn) {
					utils.forEach(this.handlers, function forEachHandler(h) {
						if (h !== null) {
							fn(h);
						}
					});
				};

				module.exports = InterceptorManager;
			},
			{ "./../utils": 85 },
		],
		63: [
			function (require, module, exports) {
				"use strict";

				var isAbsoluteURL = require("../helpers/isAbsoluteURL");
				var combineURLs = require("../helpers/combineURLs");

				/**
				 * Creates a new URL by combining the baseURL with the requestedURL,
				 * only when the requestedURL is not already an absolute URL.
				 * If the requestURL is absolute, this function returns the requestedURL untouched.
				 *
				 * @param {string} baseURL The base URL
				 * @param {string} requestedURL Absolute or relative URL to combine
				 * @returns {string} The combined full path
				 */
				module.exports = function buildFullPath(baseURL, requestedURL) {
					if (baseURL && !isAbsoluteURL(requestedURL)) {
						return combineURLs(baseURL, requestedURL);
					}
					return requestedURL;
				};
			},
			{ "../helpers/combineURLs": 73, "../helpers/isAbsoluteURL": 75 },
		],
		64: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");
				var transformData = require("./transformData");
				var isCancel = require("../cancel/isCancel");
				var defaults = require("../defaults");
				var CanceledError = require("../cancel/CanceledError");

				/**
				 * Throws a `CanceledError` if cancellation has been requested.
				 */
				function throwIfCancellationRequested(config) {
					if (config.cancelToken) {
						config.cancelToken.throwIfRequested();
					}

					if (config.signal && config.signal.aborted) {
						throw new CanceledError();
					}
				}

				/**
				 * Dispatch a request to the server using the configured adapter.
				 *
				 * @param {object} config The config that is to be used for the request
				 * @returns {Promise} The Promise to be fulfilled
				 */
				module.exports = function dispatchRequest(config) {
					throwIfCancellationRequested(config);

					// Ensure headers exist
					config.headers = config.headers || {};

					// Transform request data
					config.data = transformData.call(
						config,
						config.data,
						config.headers,
						config.transformRequest
					);

					// Flatten headers
					config.headers = utils.merge(
						config.headers.common || {},
						config.headers[config.method] || {},
						config.headers
					);

					utils.forEach(
						["delete", "get", "head", "post", "put", "patch", "common"],
						function cleanHeaderConfig(method) {
							delete config.headers[method];
						}
					);

					var adapter = config.adapter || defaults.adapter;

					return adapter(config).then(
						function onAdapterResolution(response) {
							throwIfCancellationRequested(config);

							// Transform response data
							response.data = transformData.call(
								config,
								response.data,
								response.headers,
								config.transformResponse
							);

							return response;
						},
						function onAdapterRejection(reason) {
							if (!isCancel(reason)) {
								throwIfCancellationRequested(config);

								// Transform response data
								if (reason && reason.response) {
									reason.response.data = transformData.call(
										config,
										reason.response.data,
										reason.response.headers,
										config.transformResponse
									);
								}
							}

							return Promise.reject(reason);
						}
					);
				};
			},
			{
				"../cancel/CanceledError": 58,
				"../cancel/isCancel": 59,
				"../defaults": 68,
				"./../utils": 85,
				"./transformData": 67,
			},
		],
		65: [
			function (require, module, exports) {
				"use strict";

				var utils = require("../utils");

				/**
				 * Config-specific merge-function which creates a new config-object
				 * by merging two configuration objects together.
				 *
				 * @param {Object} config1
				 * @param {Object} config2
				 * @returns {Object} New object resulting from merging config2 to config1
				 */
				module.exports = function mergeConfig(config1, config2) {
					// eslint-disable-next-line no-param-reassign
					config2 = config2 || {};
					var config = {};

					function getMergedValue(target, source) {
						if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
							return utils.merge(target, source);
						} else if (utils.isPlainObject(source)) {
							return utils.merge({}, source);
						} else if (utils.isArray(source)) {
							return source.slice();
						}
						return source;
					}

					// eslint-disable-next-line consistent-return
					function mergeDeepProperties(prop) {
						if (!utils.isUndefined(config2[prop])) {
							return getMergedValue(config1[prop], config2[prop]);
						} else if (!utils.isUndefined(config1[prop])) {
							return getMergedValue(undefined, config1[prop]);
						}
					}

					// eslint-disable-next-line consistent-return
					function valueFromConfig2(prop) {
						if (!utils.isUndefined(config2[prop])) {
							return getMergedValue(undefined, config2[prop]);
						}
					}

					// eslint-disable-next-line consistent-return
					function defaultToConfig2(prop) {
						if (!utils.isUndefined(config2[prop])) {
							return getMergedValue(undefined, config2[prop]);
						} else if (!utils.isUndefined(config1[prop])) {
							return getMergedValue(undefined, config1[prop]);
						}
					}

					// eslint-disable-next-line consistent-return
					function mergeDirectKeys(prop) {
						if (prop in config2) {
							return getMergedValue(config1[prop], config2[prop]);
						} else if (prop in config1) {
							return getMergedValue(undefined, config1[prop]);
						}
					}

					var mergeMap = {
						url: valueFromConfig2,
						method: valueFromConfig2,
						data: valueFromConfig2,
						baseURL: defaultToConfig2,
						transformRequest: defaultToConfig2,
						transformResponse: defaultToConfig2,
						paramsSerializer: defaultToConfig2,
						timeout: defaultToConfig2,
						timeoutMessage: defaultToConfig2,
						withCredentials: defaultToConfig2,
						adapter: defaultToConfig2,
						responseType: defaultToConfig2,
						xsrfCookieName: defaultToConfig2,
						xsrfHeaderName: defaultToConfig2,
						onUploadProgress: defaultToConfig2,
						onDownloadProgress: defaultToConfig2,
						decompress: defaultToConfig2,
						maxContentLength: defaultToConfig2,
						maxBodyLength: defaultToConfig2,
						beforeRedirect: defaultToConfig2,
						transport: defaultToConfig2,
						httpAgent: defaultToConfig2,
						httpsAgent: defaultToConfig2,
						cancelToken: defaultToConfig2,
						socketPath: defaultToConfig2,
						responseEncoding: defaultToConfig2,
						validateStatus: mergeDirectKeys,
					};

					utils.forEach(
						Object.keys(config1).concat(Object.keys(config2)),
						function computeConfigValue(prop) {
							var merge = mergeMap[prop] || mergeDeepProperties;
							var configValue = merge(prop);
							(utils.isUndefined(configValue) && merge !== mergeDirectKeys) ||
								(config[prop] = configValue);
						}
					);

					return config;
				};
			},
			{ "../utils": 85 },
		],
		66: [
			function (require, module, exports) {
				"use strict";

				var AxiosError = require("./AxiosError");

				/**
				 * Resolve or reject a Promise based on response status.
				 *
				 * @param {Function} resolve A function that resolves the promise.
				 * @param {Function} reject A function that rejects the promise.
				 * @param {object} response The response.
				 */
				module.exports = function settle(resolve, reject, response) {
					var validateStatus = response.config.validateStatus;
					if (
						!response.status ||
						!validateStatus ||
						validateStatus(response.status)
					) {
						resolve(response);
					} else {
						reject(
							new AxiosError(
								"Request failed with status code " + response.status,
								[AxiosError.ERR_BAD_REQUEST, AxiosError.ERR_BAD_RESPONSE][
									Math.floor(response.status / 100) - 4
								],
								response.config,
								response.request,
								response
							)
						);
					}
				};
			},
			{ "./AxiosError": 61 },
		],
		67: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");
				var defaults = require("../defaults");

				/**
				 * Transform the data for a request or a response
				 *
				 * @param {Object|String} data The data to be transformed
				 * @param {Array} headers The headers for the request or response
				 * @param {Array|Function} fns A single function or Array of functions
				 * @returns {*} The resulting transformed data
				 */
				module.exports = function transformData(data, headers, fns) {
					var context = this || defaults;
					/*eslint no-param-reassign:0*/
					utils.forEach(fns, function transform(fn) {
						data = fn.call(context, data, headers);
					});

					return data;
				};
			},
			{ "../defaults": 68, "./../utils": 85 },
		],
		68: [
			function (require, module, exports) {
				(function (process) {
					(function () {
						"use strict";

						var utils = require("../utils");
						var normalizeHeaderName = require("../helpers/normalizeHeaderName");
						var AxiosError = require("../core/AxiosError");
						var transitionalDefaults = require("./transitional");
						var toFormData = require("../helpers/toFormData");

						var DEFAULT_CONTENT_TYPE = {
							"Content-Type": "application/x-www-form-urlencoded",
						};

						function setContentTypeIfUnset(headers, value) {
							if (
								!utils.isUndefined(headers) &&
								utils.isUndefined(headers["Content-Type"])
							) {
								headers["Content-Type"] = value;
							}
						}

						function getDefaultAdapter() {
							var adapter;
							if (typeof XMLHttpRequest !== "undefined") {
								// For browsers use XHR adapter
								adapter = require("../adapters/xhr");
							} else if (
								typeof process !== "undefined" &&
								Object.prototype.toString.call(process) === "[object process]"
							) {
								// For node use HTTP adapter
								adapter = require("../adapters/http");
							}
							return adapter;
						}

						function stringifySafely(rawValue, parser, encoder) {
							if (utils.isString(rawValue)) {
								try {
									(parser || JSON.parse)(rawValue);
									return utils.trim(rawValue);
								} catch (e) {
									if (e.name !== "SyntaxError") {
										throw e;
									}
								}
							}

							return (encoder || JSON.stringify)(rawValue);
						}

						var defaults = {
							transitional: transitionalDefaults,

							adapter: getDefaultAdapter(),

							transformRequest: [
								function transformRequest(data, headers) {
									normalizeHeaderName(headers, "Accept");
									normalizeHeaderName(headers, "Content-Type");

									if (
										utils.isFormData(data) ||
										utils.isArrayBuffer(data) ||
										utils.isBuffer(data) ||
										utils.isStream(data) ||
										utils.isFile(data) ||
										utils.isBlob(data)
									) {
										return data;
									}
									if (utils.isArrayBufferView(data)) {
										return data.buffer;
									}
									if (utils.isURLSearchParams(data)) {
										setContentTypeIfUnset(
											headers,
											"application/x-www-form-urlencoded;charset=utf-8"
										);
										return data.toString();
									}

									var isObjectPayload = utils.isObject(data);
									var contentType = headers && headers["Content-Type"];

									var isFileList;

									if (
										(isFileList = utils.isFileList(data)) ||
										(isObjectPayload && contentType === "multipart/form-data")
									) {
										var _FormData = this.env && this.env.FormData;
										return toFormData(
											isFileList ? { "files[]": data } : data,
											_FormData && new _FormData()
										);
									} else if (
										isObjectPayload ||
										contentType === "application/json"
									) {
										setContentTypeIfUnset(headers, "application/json");
										return stringifySafely(data);
									}

									return data;
								},
							],

							transformResponse: [
								function transformResponse(data) {
									var transitional = this.transitional || defaults.transitional;
									var silentJSONParsing =
										transitional && transitional.silentJSONParsing;
									var forcedJSONParsing =
										transitional && transitional.forcedJSONParsing;
									var strictJSONParsing =
										!silentJSONParsing && this.responseType === "json";

									if (
										strictJSONParsing ||
										(forcedJSONParsing && utils.isString(data) && data.length)
									) {
										try {
											return JSON.parse(data);
										} catch (e) {
											if (strictJSONParsing) {
												if (e.name === "SyntaxError") {
													throw AxiosError.from(
														e,
														AxiosError.ERR_BAD_RESPONSE,
														this,
														null,
														this.response
													);
												}
												throw e;
											}
										}
									}

									return data;
								},
							],

							/**
							 * A timeout in milliseconds to abort a request. If set to 0 (default) a
							 * timeout is not created.
							 */
							timeout: 0,

							xsrfCookieName: "XSRF-TOKEN",
							xsrfHeaderName: "X-XSRF-TOKEN",

							maxContentLength: -1,
							maxBodyLength: -1,

							env: {
								FormData: require("./env/FormData"),
							},

							validateStatus: function validateStatus(status) {
								return status >= 200 && status < 300;
							},

							headers: {
								common: {
									Accept: "application/json, text/plain, */*",
								},
							},
						};

						utils.forEach(
							["delete", "get", "head"],
							function forEachMethodNoData(method) {
								defaults.headers[method] = {};
							}
						);

						utils.forEach(
							["post", "put", "patch"],
							function forEachMethodWithData(method) {
								defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
							}
						);

						module.exports = defaults;
					}.call(this));
				}.call(this, require("_process")));
			},
			{
				"../adapters/http": 55,
				"../adapters/xhr": 55,
				"../core/AxiosError": 61,
				"../helpers/normalizeHeaderName": 78,
				"../helpers/toFormData": 83,
				"../utils": 85,
				"./env/FormData": 79,
				"./transitional": 69,
				_process: 4,
			},
		],
		69: [
			function (require, module, exports) {
				"use strict";

				module.exports = {
					silentJSONParsing: true,
					forcedJSONParsing: true,
					clarifyTimeoutError: false,
				};
			},
			{},
		],
		70: [
			function (require, module, exports) {
				module.exports = {
					version: "0.27.2",
				};
			},
			{},
		],
		71: [
			function (require, module, exports) {
				"use strict";

				module.exports = function bind(fn, thisArg) {
					return function wrap() {
						var args = new Array(arguments.length);
						for (var i = 0; i < args.length; i++) {
							args[i] = arguments[i];
						}
						return fn.apply(thisArg, args);
					};
				};
			},
			{},
		],
		72: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");

				function encode(val) {
					return encodeURIComponent(val)
						.replace(/%3A/gi, ":")
						.replace(/%24/g, "$")
						.replace(/%2C/gi, ",")
						.replace(/%20/g, "+")
						.replace(/%5B/gi, "[")
						.replace(/%5D/gi, "]");
				}

				/**
				 * Build a URL by appending params to the end
				 *
				 * @param {string} url The base of the url (e.g., http://www.google.com)
				 * @param {object} [params] The params to be appended
				 * @returns {string} The formatted url
				 */
				module.exports = function buildURL(url, params, paramsSerializer) {
					/*eslint no-param-reassign:0*/
					if (!params) {
						return url;
					}

					var serializedParams;
					if (paramsSerializer) {
						serializedParams = paramsSerializer(params);
					} else if (utils.isURLSearchParams(params)) {
						serializedParams = params.toString();
					} else {
						var parts = [];

						utils.forEach(params, function serialize(val, key) {
							if (val === null || typeof val === "undefined") {
								return;
							}

							if (utils.isArray(val)) {
								key = key + "[]";
							} else {
								val = [val];
							}

							utils.forEach(val, function parseValue(v) {
								if (utils.isDate(v)) {
									v = v.toISOString();
								} else if (utils.isObject(v)) {
									v = JSON.stringify(v);
								}
								parts.push(encode(key) + "=" + encode(v));
							});
						});

						serializedParams = parts.join("&");
					}

					if (serializedParams) {
						var hashmarkIndex = url.indexOf("#");
						if (hashmarkIndex !== -1) {
							url = url.slice(0, hashmarkIndex);
						}

						url += (url.indexOf("?") === -1 ? "?" : "&") + serializedParams;
					}

					return url;
				};
			},
			{ "./../utils": 85 },
		],
		73: [
			function (require, module, exports) {
				"use strict";

				/**
				 * Creates a new URL by combining the specified URLs
				 *
				 * @param {string} baseURL The base URL
				 * @param {string} relativeURL The relative URL
				 * @returns {string} The combined URL
				 */
				module.exports = function combineURLs(baseURL, relativeURL) {
					return relativeURL
						? baseURL.replace(/\/+$/, "") +
								"/" +
								relativeURL.replace(/^\/+/, "")
						: baseURL;
				};
			},
			{},
		],
		74: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");

				module.exports = utils.isStandardBrowserEnv()
					? // Standard browser envs support document.cookie
					  (function standardBrowserEnv() {
							return {
								write: function write(
									name,
									value,
									expires,
									path,
									domain,
									secure
								) {
									var cookie = [];
									cookie.push(name + "=" + encodeURIComponent(value));

									if (utils.isNumber(expires)) {
										cookie.push("expires=" + new Date(expires).toGMTString());
									}

									if (utils.isString(path)) {
										cookie.push("path=" + path);
									}

									if (utils.isString(domain)) {
										cookie.push("domain=" + domain);
									}

									if (secure === true) {
										cookie.push("secure");
									}

									document.cookie = cookie.join("; ");
								},

								read: function read(name) {
									var match = document.cookie.match(
										new RegExp("(^|;\\s*)(" + name + ")=([^;]*)")
									);
									return match ? decodeURIComponent(match[3]) : null;
								},

								remove: function remove(name) {
									this.write(name, "", Date.now() - 86400000);
								},
							};
					  })()
					: // Non standard browser env (web workers, react-native) lack needed support.
					  (function nonStandardBrowserEnv() {
							return {
								write: function write() {},
								read: function read() {
									return null;
								},
								remove: function remove() {},
							};
					  })();
			},
			{ "./../utils": 85 },
		],
		75: [
			function (require, module, exports) {
				"use strict";

				/**
				 * Determines whether the specified URL is absolute
				 *
				 * @param {string} url The URL to test
				 * @returns {boolean} True if the specified URL is absolute, otherwise false
				 */
				module.exports = function isAbsoluteURL(url) {
					// A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
					// RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
					// by any combination of letters, digits, plus, period, or hyphen.
					return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
				};
			},
			{},
		],
		76: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");

				/**
				 * Determines whether the payload is an error thrown by Axios
				 *
				 * @param {*} payload The value to test
				 * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
				 */
				module.exports = function isAxiosError(payload) {
					return utils.isObject(payload) && payload.isAxiosError === true;
				};
			},
			{ "./../utils": 85 },
		],
		77: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");

				module.exports = utils.isStandardBrowserEnv()
					? // Standard browser envs have full support of the APIs needed to test
					  // whether the request URL is of the same origin as current location.
					  (function standardBrowserEnv() {
							var msie = /(msie|trident)/i.test(navigator.userAgent);
							var urlParsingNode = document.createElement("a");
							var originURL;

							/**
							 * Parse a URL to discover it's components
							 *
							 * @param {String} url The URL to be parsed
							 * @returns {Object}
							 */
							function resolveURL(url) {
								var href = url;

								if (msie) {
									// IE needs attribute set twice to normalize properties
									urlParsingNode.setAttribute("href", href);
									href = urlParsingNode.href;
								}

								urlParsingNode.setAttribute("href", href);

								// urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
								return {
									href: urlParsingNode.href,
									protocol: urlParsingNode.protocol
										? urlParsingNode.protocol.replace(/:$/, "")
										: "",
									host: urlParsingNode.host,
									search: urlParsingNode.search
										? urlParsingNode.search.replace(/^\?/, "")
										: "",
									hash: urlParsingNode.hash
										? urlParsingNode.hash.replace(/^#/, "")
										: "",
									hostname: urlParsingNode.hostname,
									port: urlParsingNode.port,
									pathname:
										urlParsingNode.pathname.charAt(0) === "/"
											? urlParsingNode.pathname
											: "/" + urlParsingNode.pathname,
								};
							}

							originURL = resolveURL(window.location.href);

							/**
							 * Determine if a URL shares the same origin as the current location
							 *
							 * @param {String} requestURL The URL to test
							 * @returns {boolean} True if URL shares the same origin, otherwise false
							 */
							return function isURLSameOrigin(requestURL) {
								var parsed = utils.isString(requestURL)
									? resolveURL(requestURL)
									: requestURL;
								return (
									parsed.protocol === originURL.protocol &&
									parsed.host === originURL.host
								);
							};
					  })()
					: // Non standard browser envs (web workers, react-native) lack needed support.
					  (function nonStandardBrowserEnv() {
							return function isURLSameOrigin() {
								return true;
							};
					  })();
			},
			{ "./../utils": 85 },
		],
		78: [
			function (require, module, exports) {
				"use strict";

				var utils = require("../utils");

				module.exports = function normalizeHeaderName(headers, normalizedName) {
					utils.forEach(headers, function processHeader(value, name) {
						if (
							name !== normalizedName &&
							name.toUpperCase() === normalizedName.toUpperCase()
						) {
							headers[normalizedName] = value;
							delete headers[name];
						}
					});
				};
			},
			{ "../utils": 85 },
		],
		79: [
			function (require, module, exports) {
				// eslint-disable-next-line strict
				module.exports = null;
			},
			{},
		],
		80: [
			function (require, module, exports) {
				"use strict";

				var utils = require("./../utils");

				// Headers whose duplicates are ignored by node
				// c.f. https://nodejs.org/api/http.html#http_message_headers
				var ignoreDuplicateOf = [
					"age",
					"authorization",
					"content-length",
					"content-type",
					"etag",
					"expires",
					"from",
					"host",
					"if-modified-since",
					"if-unmodified-since",
					"last-modified",
					"location",
					"max-forwards",
					"proxy-authorization",
					"referer",
					"retry-after",
					"user-agent",
				];

				/**
				 * Parse headers into an object
				 *
				 * ```
				 * Date: Wed, 27 Aug 2014 08:58:49 GMT
				 * Content-Type: application/json
				 * Connection: keep-alive
				 * Transfer-Encoding: chunked
				 * ```
				 *
				 * @param {String} headers Headers needing to be parsed
				 * @returns {Object} Headers parsed into an object
				 */
				module.exports = function parseHeaders(headers) {
					var parsed = {};
					var key;
					var val;
					var i;

					if (!headers) {
						return parsed;
					}

					utils.forEach(headers.split("\n"), function parser(line) {
						i = line.indexOf(":");
						key = utils.trim(line.substr(0, i)).toLowerCase();
						val = utils.trim(line.substr(i + 1));

						if (key) {
							if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
								return;
							}
							if (key === "set-cookie") {
								parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
							} else {
								parsed[key] = parsed[key] ? parsed[key] + ", " + val : val;
							}
						}
					});

					return parsed;
				};
			},
			{ "./../utils": 85 },
		],
		81: [
			function (require, module, exports) {
				"use strict";

				module.exports = function parseProtocol(url) {
					var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
					return (match && match[1]) || "";
				};
			},
			{},
		],
		82: [
			function (require, module, exports) {
				"use strict";

				/**
				 * Syntactic sugar for invoking a function and expanding an array for arguments.
				 *
				 * Common use case would be to use `Function.prototype.apply`.
				 *
				 *  ```js
				 *  function f(x, y, z) {}
				 *  var args = [1, 2, 3];
				 *  f.apply(null, args);
				 *  ```
				 *
				 * With `spread` this example can be re-written.
				 *
				 *  ```js
				 *  spread(function(x, y, z) {})([1, 2, 3]);
				 *  ```
				 *
				 * @param {Function} callback
				 * @returns {Function}
				 */
				module.exports = function spread(callback) {
					return function wrap(arr) {
						return callback.apply(null, arr);
					};
				};
			},
			{},
		],
		83: [
			function (require, module, exports) {
				(function (Buffer) {
					(function () {
						"use strict";

						var utils = require("../utils");

						/**
						 * Convert a data object to FormData
						 * @param {Object} obj
						 * @param {?Object} [formData]
						 * @returns {Object}
						 **/

						function toFormData(obj, formData) {
							// eslint-disable-next-line no-param-reassign
							formData = formData || new FormData();

							var stack = [];

							function convertValue(value) {
								if (value === null) return "";

								if (utils.isDate(value)) {
									return value.toISOString();
								}

								if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
									return typeof Blob === "function"
										? new Blob([value])
										: Buffer.from(value);
								}

								return value;
							}

							function build(data, parentKey) {
								if (utils.isPlainObject(data) || utils.isArray(data)) {
									if (stack.indexOf(data) !== -1) {
										throw Error("Circular reference detected in " + parentKey);
									}

									stack.push(data);

									utils.forEach(data, function each(value, key) {
										if (utils.isUndefined(value)) return;
										var fullKey = parentKey ? parentKey + "." + key : key;
										var arr;

										if (value && !parentKey && typeof value === "object") {
											if (utils.endsWith(key, "{}")) {
												// eslint-disable-next-line no-param-reassign
												value = JSON.stringify(value);
											} else if (
												utils.endsWith(key, "[]") &&
												(arr = utils.toArray(value))
											) {
												// eslint-disable-next-line func-names
												arr.forEach(function (el) {
													!utils.isUndefined(el) &&
														formData.append(fullKey, convertValue(el));
												});
												return;
											}
										}

										build(value, fullKey);
									});

									stack.pop();
								} else {
									formData.append(parentKey, convertValue(data));
								}
							}

							build(obj);

							return formData;
						}

						module.exports = toFormData;
					}.call(this));
				}.call(this, require("buffer").Buffer));
			},
			{ "../utils": 85, buffer: 2 },
		],
		84: [
			function (require, module, exports) {
				"use strict";

				var VERSION = require("../env/data").version;
				var AxiosError = require("../core/AxiosError");

				var validators = {};

				// eslint-disable-next-line func-names
				["object", "boolean", "number", "function", "string", "symbol"].forEach(
					function (type, i) {
						validators[type] = function validator(thing) {
							return typeof thing === type || "a" + (i < 1 ? "n " : " ") + type;
						};
					}
				);

				var deprecatedWarnings = {};

				/**
				 * Transitional option validator
				 * @param {function|boolean?} validator - set to false if the transitional option has been removed
				 * @param {string?} version - deprecated version / removed since version
				 * @param {string?} message - some message with additional info
				 * @returns {function}
				 */
				validators.transitional = function transitional(
					validator,
					version,
					message
				) {
					function formatMessage(opt, desc) {
						return (
							"[Axios v" +
							VERSION +
							"] Transitional option '" +
							opt +
							"'" +
							desc +
							(message ? ". " + message : "")
						);
					}

					// eslint-disable-next-line func-names
					return function (value, opt, opts) {
						if (validator === false) {
							throw new AxiosError(
								formatMessage(
									opt,
									" has been removed" + (version ? " in " + version : "")
								),
								AxiosError.ERR_DEPRECATED
							);
						}

						if (version && !deprecatedWarnings[opt]) {
							deprecatedWarnings[opt] = true;
							// eslint-disable-next-line no-console
							console.warn(
								formatMessage(
									opt,
									" has been deprecated since v" +
										version +
										" and will be removed in the near future"
								)
							);
						}

						return validator ? validator(value, opt, opts) : true;
					};
				};

				/**
				 * Assert object's properties type
				 * @param {object} options
				 * @param {object} schema
				 * @param {boolean?} allowUnknown
				 */

				function assertOptions(options, schema, allowUnknown) {
					if (typeof options !== "object") {
						throw new AxiosError(
							"options must be an object",
							AxiosError.ERR_BAD_OPTION_VALUE
						);
					}
					var keys = Object.keys(options);
					var i = keys.length;
					while (i-- > 0) {
						var opt = keys[i];
						var validator = schema[opt];
						if (validator) {
							var value = options[opt];
							var result =
								value === undefined || validator(value, opt, options);
							if (result !== true) {
								throw new AxiosError(
									"option " + opt + " must be " + result,
									AxiosError.ERR_BAD_OPTION_VALUE
								);
							}
							continue;
						}
						if (allowUnknown !== true) {
							throw new AxiosError(
								"Unknown option " + opt,
								AxiosError.ERR_BAD_OPTION
							);
						}
					}
				}

				module.exports = {
					assertOptions: assertOptions,
					validators: validators,
				};
			},
			{ "../core/AxiosError": 61, "../env/data": 70 },
		],
		85: [
			function (require, module, exports) {
				"use strict";

				var bind = require("./helpers/bind");

				// utils is a library of generic helper functions non-specific to axios

				var toString = Object.prototype.toString;

				// eslint-disable-next-line func-names
				var kindOf = (function (cache) {
					// eslint-disable-next-line func-names
					return function (thing) {
						var str = toString.call(thing);
						return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
					};
				})(Object.create(null));

				function kindOfTest(type) {
					type = type.toLowerCase();
					return function isKindOf(thing) {
						return kindOf(thing) === type;
					};
				}

				/**
				 * Determine if a value is an Array
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is an Array, otherwise false
				 */
				function isArray(val) {
					return Array.isArray(val);
				}

				/**
				 * Determine if a value is undefined
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if the value is undefined, otherwise false
				 */
				function isUndefined(val) {
					return typeof val === "undefined";
				}

				/**
				 * Determine if a value is a Buffer
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a Buffer, otherwise false
				 */
				function isBuffer(val) {
					return (
						val !== null &&
						!isUndefined(val) &&
						val.constructor !== null &&
						!isUndefined(val.constructor) &&
						typeof val.constructor.isBuffer === "function" &&
						val.constructor.isBuffer(val)
					);
				}

				/**
				 * Determine if a value is an ArrayBuffer
				 *
				 * @function
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
				 */
				var isArrayBuffer = kindOfTest("ArrayBuffer");

				/**
				 * Determine if a value is a view on an ArrayBuffer
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
				 */
				function isArrayBufferView(val) {
					var result;
					if (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView) {
						result = ArrayBuffer.isView(val);
					} else {
						result = val && val.buffer && isArrayBuffer(val.buffer);
					}
					return result;
				}

				/**
				 * Determine if a value is a String
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a String, otherwise false
				 */
				function isString(val) {
					return typeof val === "string";
				}

				/**
				 * Determine if a value is a Number
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a Number, otherwise false
				 */
				function isNumber(val) {
					return typeof val === "number";
				}

				/**
				 * Determine if a value is an Object
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is an Object, otherwise false
				 */
				function isObject(val) {
					return val !== null && typeof val === "object";
				}

				/**
				 * Determine if a value is a plain Object
				 *
				 * @param {Object} val The value to test
				 * @return {boolean} True if value is a plain Object, otherwise false
				 */
				function isPlainObject(val) {
					if (kindOf(val) !== "object") {
						return false;
					}

					var prototype = Object.getPrototypeOf(val);
					return prototype === null || prototype === Object.prototype;
				}

				/**
				 * Determine if a value is a Date
				 *
				 * @function
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a Date, otherwise false
				 */
				var isDate = kindOfTest("Date");

				/**
				 * Determine if a value is a File
				 *
				 * @function
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a File, otherwise false
				 */
				var isFile = kindOfTest("File");

				/**
				 * Determine if a value is a Blob
				 *
				 * @function
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a Blob, otherwise false
				 */
				var isBlob = kindOfTest("Blob");

				/**
				 * Determine if a value is a FileList
				 *
				 * @function
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a File, otherwise false
				 */
				var isFileList = kindOfTest("FileList");

				/**
				 * Determine if a value is a Function
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a Function, otherwise false
				 */
				function isFunction(val) {
					return toString.call(val) === "[object Function]";
				}

				/**
				 * Determine if a value is a Stream
				 *
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a Stream, otherwise false
				 */
				function isStream(val) {
					return isObject(val) && isFunction(val.pipe);
				}

				/**
				 * Determine if a value is a FormData
				 *
				 * @param {Object} thing The value to test
				 * @returns {boolean} True if value is an FormData, otherwise false
				 */
				function isFormData(thing) {
					var pattern = "[object FormData]";
					return (
						thing &&
						((typeof FormData === "function" && thing instanceof FormData) ||
							toString.call(thing) === pattern ||
							(isFunction(thing.toString) && thing.toString() === pattern))
					);
				}

				/**
				 * Determine if a value is a URLSearchParams object
				 * @function
				 * @param {Object} val The value to test
				 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
				 */
				var isURLSearchParams = kindOfTest("URLSearchParams");

				/**
				 * Trim excess whitespace off the beginning and end of a string
				 *
				 * @param {String} str The String to trim
				 * @returns {String} The String freed of excess whitespace
				 */
				function trim(str) {
					return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
				}

				/**
				 * Determine if we're running in a standard browser environment
				 *
				 * This allows axios to run in a web worker, and react-native.
				 * Both environments support XMLHttpRequest, but not fully standard globals.
				 *
				 * web workers:
				 *  typeof window -> undefined
				 *  typeof document -> undefined
				 *
				 * react-native:
				 *  navigator.product -> 'ReactNative'
				 * nativescript
				 *  navigator.product -> 'NativeScript' or 'NS'
				 */
				function isStandardBrowserEnv() {
					if (
						typeof navigator !== "undefined" &&
						(navigator.product === "ReactNative" ||
							navigator.product === "NativeScript" ||
							navigator.product === "NS")
					) {
						return false;
					}
					return (
						typeof window !== "undefined" && typeof document !== "undefined"
					);
				}

				/**
				 * Iterate over an Array or an Object invoking a function for each item.
				 *
				 * If `obj` is an Array callback will be called passing
				 * the value, index, and complete array for each item.
				 *
				 * If 'obj' is an Object callback will be called passing
				 * the value, key, and complete object for each property.
				 *
				 * @param {Object|Array} obj The object to iterate
				 * @param {Function} fn The callback to invoke for each item
				 */
				function forEach(obj, fn) {
					// Don't bother if no value provided
					if (obj === null || typeof obj === "undefined") {
						return;
					}

					// Force an array if not already something iterable
					if (typeof obj !== "object") {
						/*eslint no-param-reassign:0*/
						obj = [obj];
					}

					if (isArray(obj)) {
						// Iterate over array values
						for (var i = 0, l = obj.length; i < l; i++) {
							fn.call(null, obj[i], i, obj);
						}
					} else {
						// Iterate over object keys
						for (var key in obj) {
							if (Object.prototype.hasOwnProperty.call(obj, key)) {
								fn.call(null, obj[key], key, obj);
							}
						}
					}
				}

				/**
				 * Accepts varargs expecting each argument to be an object, then
				 * immutably merges the properties of each object and returns result.
				 *
				 * When multiple objects contain the same key the later object in
				 * the arguments list will take precedence.
				 *
				 * Example:
				 *
				 * ```js
				 * var result = merge({foo: 123}, {foo: 456});
				 * console.log(result.foo); // outputs 456
				 * ```
				 *
				 * @param {Object} obj1 Object to merge
				 * @returns {Object} Result of all merge properties
				 */
				function merge(/* obj1, obj2, obj3, ... */) {
					var result = {};
					function assignValue(val, key) {
						if (isPlainObject(result[key]) && isPlainObject(val)) {
							result[key] = merge(result[key], val);
						} else if (isPlainObject(val)) {
							result[key] = merge({}, val);
						} else if (isArray(val)) {
							result[key] = val.slice();
						} else {
							result[key] = val;
						}
					}

					for (var i = 0, l = arguments.length; i < l; i++) {
						forEach(arguments[i], assignValue);
					}
					return result;
				}

				/**
				 * Extends object a by mutably adding to it the properties of object b.
				 *
				 * @param {Object} a The object to be extended
				 * @param {Object} b The object to copy properties from
				 * @param {Object} thisArg The object to bind function to
				 * @return {Object} The resulting value of object a
				 */
				function extend(a, b, thisArg) {
					forEach(b, function assignValue(val, key) {
						if (thisArg && typeof val === "function") {
							a[key] = bind(val, thisArg);
						} else {
							a[key] = val;
						}
					});
					return a;
				}

				/**
				 * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
				 *
				 * @param {string} content with BOM
				 * @return {string} content value without BOM
				 */
				function stripBOM(content) {
					if (content.charCodeAt(0) === 0xfeff) {
						content = content.slice(1);
					}
					return content;
				}

				/**
				 * Inherit the prototype methods from one constructor into another
				 * @param {function} constructor
				 * @param {function} superConstructor
				 * @param {object} [props]
				 * @param {object} [descriptors]
				 */

				function inherits(constructor, superConstructor, props, descriptors) {
					constructor.prototype = Object.create(
						superConstructor.prototype,
						descriptors
					);
					constructor.prototype.constructor = constructor;
					props && Object.assign(constructor.prototype, props);
				}

				/**
				 * Resolve object with deep prototype chain to a flat object
				 * @param {Object} sourceObj source object
				 * @param {Object} [destObj]
				 * @param {Function} [filter]
				 * @returns {Object}
				 */

				function toFlatObject(sourceObj, destObj, filter) {
					var props;
					var i;
					var prop;
					var merged = {};

					destObj = destObj || {};

					do {
						props = Object.getOwnPropertyNames(sourceObj);
						i = props.length;
						while (i-- > 0) {
							prop = props[i];
							if (!merged[prop]) {
								destObj[prop] = sourceObj[prop];
								merged[prop] = true;
							}
						}
						sourceObj = Object.getPrototypeOf(sourceObj);
					} while (
						sourceObj &&
						(!filter || filter(sourceObj, destObj)) &&
						sourceObj !== Object.prototype
					);

					return destObj;
				}

				/*
				 * determines whether a string ends with the characters of a specified string
				 * @param {String} str
				 * @param {String} searchString
				 * @param {Number} [position= 0]
				 * @returns {boolean}
				 */
				function endsWith(str, searchString, position) {
					str = String(str);
					if (position === undefined || position > str.length) {
						position = str.length;
					}
					position -= searchString.length;
					var lastIndex = str.indexOf(searchString, position);
					return lastIndex !== -1 && lastIndex === position;
				}

				/**
				 * Returns new array from array like object
				 * @param {*} [thing]
				 * @returns {Array}
				 */
				function toArray(thing) {
					if (!thing) return null;
					var i = thing.length;
					if (isUndefined(i)) return null;
					var arr = new Array(i);
					while (i-- > 0) {
						arr[i] = thing[i];
					}
					return arr;
				}

				// eslint-disable-next-line func-names
				var isTypedArray = (function (TypedArray) {
					// eslint-disable-next-line func-names
					return function (thing) {
						return TypedArray && thing instanceof TypedArray;
					};
				})(
					typeof Uint8Array !== "undefined" && Object.getPrototypeOf(Uint8Array)
				);

				module.exports = {
					isArray: isArray,
					isArrayBuffer: isArrayBuffer,
					isBuffer: isBuffer,
					isFormData: isFormData,
					isArrayBufferView: isArrayBufferView,
					isString: isString,
					isNumber: isNumber,
					isObject: isObject,
					isPlainObject: isPlainObject,
					isUndefined: isUndefined,
					isDate: isDate,
					isFile: isFile,
					isBlob: isBlob,
					isFunction: isFunction,
					isStream: isStream,
					isURLSearchParams: isURLSearchParams,
					isStandardBrowserEnv: isStandardBrowserEnv,
					forEach: forEach,
					merge: merge,
					extend: extend,
					trim: trim,
					stripBOM: stripBOM,
					inherits: inherits,
					toFlatObject: toFlatObject,
					kindOf: kindOf,
					kindOfTest: kindOfTest,
					endsWith: endsWith,
					toArray: toArray,
					isTypedArray: isTypedArray,
					isFileList: isFileList,
				};
			},
			{ "./helpers/bind": 71 },
		],
		86: [
			function (require, module, exports) {
				var global = typeof self !== "undefined" ? self : this;
				var __self__ = (function () {
					function F() {
						this.fetch = false;
						this.DOMException = global.DOMException;
					}
					F.prototype = global;
					return new F();
				})();
				(function (self) {
					var irrelevant = (function (exports) {
						var support = {
							searchParams: "URLSearchParams" in self,
							iterable: "Symbol" in self && "iterator" in Symbol,
							blob:
								"FileReader" in self &&
								"Blob" in self &&
								(function () {
									try {
										new Blob();
										return true;
									} catch (e) {
										return false;
									}
								})(),
							formData: "FormData" in self,
							arrayBuffer: "ArrayBuffer" in self,
						};

						function isDataView(obj) {
							return obj && DataView.prototype.isPrototypeOf(obj);
						}

						if (support.arrayBuffer) {
							var viewClasses = [
								"[object Int8Array]",
								"[object Uint8Array]",
								"[object Uint8ClampedArray]",
								"[object Int16Array]",
								"[object Uint16Array]",
								"[object Int32Array]",
								"[object Uint32Array]",
								"[object Float32Array]",
								"[object Float64Array]",
							];

							var isArrayBufferView =
								ArrayBuffer.isView ||
								function (obj) {
									return (
										obj &&
										viewClasses.indexOf(Object.prototype.toString.call(obj)) >
											-1
									);
								};
						}

						function normalizeName(name) {
							if (typeof name !== "string") {
								name = String(name);
							}
							if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
								throw new TypeError("Invalid character in header field name");
							}
							return name.toLowerCase();
						}

						function normalizeValue(value) {
							if (typeof value !== "string") {
								value = String(value);
							}
							return value;
						}

						// Build a destructive iterator for the value list
						function iteratorFor(items) {
							var iterator = {
								next: function () {
									var value = items.shift();
									return { done: value === undefined, value: value };
								},
							};

							if (support.iterable) {
								iterator[Symbol.iterator] = function () {
									return iterator;
								};
							}

							return iterator;
						}

						function Headers(headers) {
							this.map = {};

							if (headers instanceof Headers) {
								headers.forEach(function (value, name) {
									this.append(name, value);
								}, this);
							} else if (Array.isArray(headers)) {
								headers.forEach(function (header) {
									this.append(header[0], header[1]);
								}, this);
							} else if (headers) {
								Object.getOwnPropertyNames(headers).forEach(function (name) {
									this.append(name, headers[name]);
								}, this);
							}
						}

						Headers.prototype.append = function (name, value) {
							name = normalizeName(name);
							value = normalizeValue(value);
							var oldValue = this.map[name];
							this.map[name] = oldValue ? oldValue + ", " + value : value;
						};

						Headers.prototype["delete"] = function (name) {
							delete this.map[normalizeName(name)];
						};

						Headers.prototype.get = function (name) {
							name = normalizeName(name);
							return this.has(name) ? this.map[name] : null;
						};

						Headers.prototype.has = function (name) {
							return this.map.hasOwnProperty(normalizeName(name));
						};

						Headers.prototype.set = function (name, value) {
							this.map[normalizeName(name)] = normalizeValue(value);
						};

						Headers.prototype.forEach = function (callback, thisArg) {
							for (var name in this.map) {
								if (this.map.hasOwnProperty(name)) {
									callback.call(thisArg, this.map[name], name, this);
								}
							}
						};

						Headers.prototype.keys = function () {
							var items = [];
							this.forEach(function (value, name) {
								items.push(name);
							});
							return iteratorFor(items);
						};

						Headers.prototype.values = function () {
							var items = [];
							this.forEach(function (value) {
								items.push(value);
							});
							return iteratorFor(items);
						};

						Headers.prototype.entries = function () {
							var items = [];
							this.forEach(function (value, name) {
								items.push([name, value]);
							});
							return iteratorFor(items);
						};

						if (support.iterable) {
							Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
						}

						function consumed(body) {
							if (body.bodyUsed) {
								return Promise.reject(new TypeError("Already read"));
							}
							body.bodyUsed = true;
						}

						function fileReaderReady(reader) {
							return new Promise(function (resolve, reject) {
								reader.onload = function () {
									resolve(reader.result);
								};
								reader.onerror = function () {
									reject(reader.error);
								};
							});
						}

						function readBlobAsArrayBuffer(blob) {
							var reader = new FileReader();
							var promise = fileReaderReady(reader);
							reader.readAsArrayBuffer(blob);
							return promise;
						}

						function readBlobAsText(blob) {
							var reader = new FileReader();
							var promise = fileReaderReady(reader);
							reader.readAsText(blob);
							return promise;
						}

						function readArrayBufferAsText(buf) {
							var view = new Uint8Array(buf);
							var chars = new Array(view.length);

							for (var i = 0; i < view.length; i++) {
								chars[i] = String.fromCharCode(view[i]);
							}
							return chars.join("");
						}

						function bufferClone(buf) {
							if (buf.slice) {
								return buf.slice(0);
							} else {
								var view = new Uint8Array(buf.byteLength);
								view.set(new Uint8Array(buf));
								return view.buffer;
							}
						}

						function Body() {
							this.bodyUsed = false;

							this._initBody = function (body) {
								this._bodyInit = body;
								if (!body) {
									this._bodyText = "";
								} else if (typeof body === "string") {
									this._bodyText = body;
								} else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
									this._bodyBlob = body;
								} else if (
									support.formData &&
									FormData.prototype.isPrototypeOf(body)
								) {
									this._bodyFormData = body;
								} else if (
									support.searchParams &&
									URLSearchParams.prototype.isPrototypeOf(body)
								) {
									this._bodyText = body.toString();
								} else if (
									support.arrayBuffer &&
									support.blob &&
									isDataView(body)
								) {
									this._bodyArrayBuffer = bufferClone(body.buffer);
									// IE 10-11 can't handle a DataView body.
									this._bodyInit = new Blob([this._bodyArrayBuffer]);
								} else if (
									support.arrayBuffer &&
									(ArrayBuffer.prototype.isPrototypeOf(body) ||
										isArrayBufferView(body))
								) {
									this._bodyArrayBuffer = bufferClone(body);
								} else {
									this._bodyText = body = Object.prototype.toString.call(body);
								}

								if (!this.headers.get("content-type")) {
									if (typeof body === "string") {
										this.headers.set(
											"content-type",
											"text/plain;charset=UTF-8"
										);
									} else if (this._bodyBlob && this._bodyBlob.type) {
										this.headers.set("content-type", this._bodyBlob.type);
									} else if (
										support.searchParams &&
										URLSearchParams.prototype.isPrototypeOf(body)
									) {
										this.headers.set(
											"content-type",
											"application/x-www-form-urlencoded;charset=UTF-8"
										);
									}
								}
							};

							if (support.blob) {
								this.blob = function () {
									var rejected = consumed(this);
									if (rejected) {
										return rejected;
									}

									if (this._bodyBlob) {
										return Promise.resolve(this._bodyBlob);
									} else if (this._bodyArrayBuffer) {
										return Promise.resolve(new Blob([this._bodyArrayBuffer]));
									} else if (this._bodyFormData) {
										throw new Error("could not read FormData body as blob");
									} else {
										return Promise.resolve(new Blob([this._bodyText]));
									}
								};

								this.arrayBuffer = function () {
									if (this._bodyArrayBuffer) {
										return (
											consumed(this) || Promise.resolve(this._bodyArrayBuffer)
										);
									} else {
										return this.blob().then(readBlobAsArrayBuffer);
									}
								};
							}

							this.text = function () {
								var rejected = consumed(this);
								if (rejected) {
									return rejected;
								}

								if (this._bodyBlob) {
									return readBlobAsText(this._bodyBlob);
								} else if (this._bodyArrayBuffer) {
									return Promise.resolve(
										readArrayBufferAsText(this._bodyArrayBuffer)
									);
								} else if (this._bodyFormData) {
									throw new Error("could not read FormData body as text");
								} else {
									return Promise.resolve(this._bodyText);
								}
							};

							if (support.formData) {
								this.formData = function () {
									return this.text().then(decode);
								};
							}

							this.json = function () {
								return this.text().then(JSON.parse);
							};

							return this;
						}

						// HTTP methods whose capitalization should be normalized
						var methods = ["DELETE", "GET", "HEAD", "OPTIONS", "POST", "PUT"];

						function normalizeMethod(method) {
							var upcased = method.toUpperCase();
							return methods.indexOf(upcased) > -1 ? upcased : method;
						}

						function Request(input, options) {
							options = options || {};
							var body = options.body;

							if (input instanceof Request) {
								if (input.bodyUsed) {
									throw new TypeError("Already read");
								}
								this.url = input.url;
								this.credentials = input.credentials;
								if (!options.headers) {
									this.headers = new Headers(input.headers);
								}
								this.method = input.method;
								this.mode = input.mode;
								this.signal = input.signal;
								if (!body && input._bodyInit != null) {
									body = input._bodyInit;
									input.bodyUsed = true;
								}
							} else {
								this.url = String(input);
							}

							this.credentials =
								options.credentials || this.credentials || "same-origin";
							if (options.headers || !this.headers) {
								this.headers = new Headers(options.headers);
							}
							this.method = normalizeMethod(
								options.method || this.method || "GET"
							);
							this.mode = options.mode || this.mode || null;
							this.signal = options.signal || this.signal;
							this.referrer = null;

							if ((this.method === "GET" || this.method === "HEAD") && body) {
								throw new TypeError(
									"Body not allowed for GET or HEAD requests"
								);
							}
							this._initBody(body);
						}

						Request.prototype.clone = function () {
							return new Request(this, { body: this._bodyInit });
						};

						function decode(body) {
							var form = new FormData();
							body
								.trim()
								.split("&")
								.forEach(function (bytes) {
									if (bytes) {
										var split = bytes.split("=");
										var name = split.shift().replace(/\+/g, " ");
										var value = split.join("=").replace(/\+/g, " ");
										form.append(
											decodeURIComponent(name),
											decodeURIComponent(value)
										);
									}
								});
							return form;
						}

						function parseHeaders(rawHeaders) {
							var headers = new Headers();
							// Replace instances of \r\n and \n followed by at least one space or horizontal tab with a space
							// https://tools.ietf.org/html/rfc7230#section-3.2
							var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, " ");
							preProcessedHeaders.split(/\r?\n/).forEach(function (line) {
								var parts = line.split(":");
								var key = parts.shift().trim();
								if (key) {
									var value = parts.join(":").trim();
									headers.append(key, value);
								}
							});
							return headers;
						}

						Body.call(Request.prototype);

						function Response(bodyInit, options) {
							if (!options) {
								options = {};
							}

							this.type = "default";
							this.status = options.status === undefined ? 200 : options.status;
							this.ok = this.status >= 200 && this.status < 300;
							this.statusText =
								"statusText" in options ? options.statusText : "OK";
							this.headers = new Headers(options.headers);
							this.url = options.url || "";
							this._initBody(bodyInit);
						}

						Body.call(Response.prototype);

						Response.prototype.clone = function () {
							return new Response(this._bodyInit, {
								status: this.status,
								statusText: this.statusText,
								headers: new Headers(this.headers),
								url: this.url,
							});
						};

						Response.error = function () {
							var response = new Response(null, { status: 0, statusText: "" });
							response.type = "error";
							return response;
						};

						var redirectStatuses = [301, 302, 303, 307, 308];

						Response.redirect = function (url, status) {
							if (redirectStatuses.indexOf(status) === -1) {
								throw new RangeError("Invalid status code");
							}

							return new Response(null, {
								status: status,
								headers: { location: url },
							});
						};

						exports.DOMException = self.DOMException;
						try {
							new exports.DOMException();
						} catch (err) {
							exports.DOMException = function (message, name) {
								this.message = message;
								this.name = name;
								var error = Error(message);
								this.stack = error.stack;
							};
							exports.DOMException.prototype = Object.create(Error.prototype);
							exports.DOMException.prototype.constructor = exports.DOMException;
						}

						function fetch(input, init) {
							return new Promise(function (resolve, reject) {
								var request = new Request(input, init);

								if (request.signal && request.signal.aborted) {
									return reject(
										new exports.DOMException("Aborted", "AbortError")
									);
								}

								var xhr = new XMLHttpRequest();

								function abortXhr() {
									xhr.abort();
								}

								xhr.onload = function () {
									var options = {
										status: xhr.status,
										statusText: xhr.statusText,
										headers: parseHeaders(xhr.getAllResponseHeaders() || ""),
									};
									options.url =
										"responseURL" in xhr
											? xhr.responseURL
											: options.headers.get("X-Request-URL");
									var body =
										"response" in xhr ? xhr.response : xhr.responseText;
									resolve(new Response(body, options));
								};

								xhr.onerror = function () {
									reject(new TypeError("Network request failed"));
								};

								xhr.ontimeout = function () {
									reject(new TypeError("Network request failed"));
								};

								xhr.onabort = function () {
									reject(new exports.DOMException("Aborted", "AbortError"));
								};

								xhr.open(request.method, request.url, true);

								if (request.credentials === "include") {
									xhr.withCredentials = true;
								} else if (request.credentials === "omit") {
									xhr.withCredentials = false;
								}

								if ("responseType" in xhr && support.blob) {
									xhr.responseType = "blob";
								}

								request.headers.forEach(function (value, name) {
									xhr.setRequestHeader(name, value);
								});

								if (request.signal) {
									request.signal.addEventListener("abort", abortXhr);

									xhr.onreadystatechange = function () {
										// DONE (success or failure)
										if (xhr.readyState === 4) {
											request.signal.removeEventListener("abort", abortXhr);
										}
									};
								}

								xhr.send(
									typeof request._bodyInit === "undefined"
										? null
										: request._bodyInit
								);
							});
						}

						fetch.polyfill = true;

						if (!self.fetch) {
							self.fetch = fetch;
							self.Headers = Headers;
							self.Request = Request;
							self.Response = Response;
						}

						exports.Headers = Headers;
						exports.Request = Request;
						exports.Response = Response;
						exports.fetch = fetch;

						Object.defineProperty(exports, "__esModule", { value: true });

						return exports;
					})({});
				})(__self__);
				__self__.fetch.ponyfill = true;
				// Remove "polyfill" property added by whatwg-fetch
				delete __self__.fetch.polyfill;
				// Choose between native implementation (global) or custom implementation (__self__)
				// var ctx = global.fetch ? global : __self__;
				var ctx = __self__; // this line disable service worker support temporarily
				exports = ctx.fetch; // To enable: import fetch from 'cross-fetch'
				exports.default = ctx.fetch; // For TypeScript consumers without esModuleInterop.
				exports.fetch = ctx.fetch; // To enable: import {fetch} from 'cross-fetch'
				exports.Headers = ctx.Headers;
				exports.Request = ctx.Request;
				exports.Response = ctx.Response;
				module.exports = exports;
			},
			{},
		],
		87: [
			function (require, module, exports) {
				var naiveFallback = function () {
					if (typeof self === "object" && self) return self;
					if (typeof window === "object" && window) return window;
					throw new Error("Unable to resolve global `this`");
				};

				module.exports = (function () {
					if (this) return this;

					// Unexpected strict mode (may happen if e.g. bundled into ESM module)

					// Fallback to standard globalThis if available
					if (typeof globalThis === "object" && globalThis) return globalThis;

					// Thanks @mathiasbynens -> https://mathiasbynens.be/notes/globalthis
					// In all ES5+ engines global object inherits from Object.prototype
					// (if you approached one that doesn't please report)
					try {
						Object.defineProperty(Object.prototype, "__global__", {
							get: function () {
								return this;
							},
							configurable: true,
						});
					} catch (error) {
						// Unfortunate case of updates to Object.prototype being restricted
						// via preventExtensions, seal or freeze
						return naiveFallback();
					}
					try {
						// Safari case (window.__global__ works, but __global__ does not)
						if (!__global__) return naiveFallback();
						return __global__;
					} finally {
						delete Object.prototype.__global__;
					}
				})();
			},
			{},
		],
		88: [
			function (require, module, exports) {
				var _globalThis;
				if (typeof globalThis === "object") {
					_globalThis = globalThis;
				} else {
					try {
						_globalThis = require("es5-ext/global");
					} catch (error) {
					} finally {
						if (!_globalThis && typeof window !== "undefined") {
							_globalThis = window;
						}
						if (!_globalThis) {
							throw new Error("Could not determine global this");
						}
					}
				}

				var NativeWebSocket = _globalThis.WebSocket || _globalThis.MozWebSocket;
				var websocket_version = require("./version");

				/**
				 * Expose a W3C WebSocket class with just one or two arguments.
				 */
				function W3CWebSocket(uri, protocols) {
					var native_instance;

					if (protocols) {
						native_instance = new NativeWebSocket(uri, protocols);
					} else {
						native_instance = new NativeWebSocket(uri);
					}

					/**
					 * 'native_instance' is an instance of nativeWebSocket (the browser's WebSocket
					 * class). Since it is an Object it will be returned as it is when creating an
					 * instance of W3CWebSocket via 'new W3CWebSocket()'.
					 *
					 * ECMAScript 5: http://bclary.com/2004/11/07/#a-13.2.2
					 */
					return native_instance;
				}
				if (NativeWebSocket) {
					["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (prop) {
						Object.defineProperty(W3CWebSocket, prop, {
							get: function () {
								return NativeWebSocket[prop];
							},
						});
					});
				}

				/**
				 * Module exports.
				 */
				module.exports = {
					w3cwebsocket: NativeWebSocket ? W3CWebSocket : null,
					version: websocket_version,
				};
			},
			{ "./version": 89, "es5-ext/global": 87 },
		],
		89: [
			function (require, module, exports) {
				module.exports = require("../package.json").version;
			},
			{ "../package.json": 90 },
		],
		90: [
			function (require, module, exports) {
				module.exports = {
					name: "websocket",
					description:
						"Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.",
					keywords: [
						"websocket",
						"websockets",
						"socket",
						"networking",
						"comet",
						"push",
						"RFC-6455",
						"realtime",
						"server",
						"client",
					],
					author:
						"Brian McKelvey <theturtle32@gmail.com> (https://github.com/theturtle32)",
					contributors: [
						"Iñaki Baz Castillo <ibc@aliax.net> (http://dev.sipdoc.net)",
					],
					version: "1.0.34",
					repository: {
						type: "git",
						url: "https://github.com/theturtle32/WebSocket-Node.git",
					},
					homepage: "https://github.com/theturtle32/WebSocket-Node",
					engines: {
						node: ">=4.0.0",
					},
					dependencies: {
						bufferutil: "^4.0.1",
						debug: "^2.2.0",
						"es5-ext": "^0.10.50",
						"typedarray-to-buffer": "^3.1.5",
						"utf-8-validate": "^5.0.2",
						yaeti: "^0.0.6",
					},
					devDependencies: {
						"buffer-equal": "^1.0.0",
						gulp: "^4.0.2",
						"gulp-jshint": "^2.0.4",
						"jshint-stylish": "^2.2.1",
						jshint: "^2.0.0",
						tape: "^4.9.1",
					},
					config: {
						verbose: false,
					},
					scripts: {
						test: "tape test/unit/*.js",
						gulp: "gulp",
					},
					main: "index",
					directories: {
						lib: "./lib",
					},
					browser: "lib/browser.js",
					license: "Apache-2.0",
				};
			},
			{},
		],
	},
	{},
	[5]
);
