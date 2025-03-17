define('lsc-questing-dcl', ['exports', '~system/Runtime', '@dcl/sdk/players', '@dcl/sdk/ecs', '@dcl/sdk/math'], (function (exports, Runtime, players, ecs, math) { 'use strict';

	function getAugmentedNamespace(n) {
		if (n.__esModule) return n;
		var a = Object.defineProperty({}, '__esModule', {value: true});
		Object.keys(n).forEach(function (k) {
			var d = Object.getOwnPropertyDescriptor(n, k);
			Object.defineProperty(a, k, d.get ? d : {
				enumerable: true,
				get: function () {
					return n[k];
				}
			});
		});
		return a;
	}

	var lib = {};

	//
	// Polyfills for legacy environments
	//
	/*
	 * Support Android 4.4.x
	 */
	if (!ArrayBuffer.isView) {
	    ArrayBuffer.isView = (a) => {
	        return a !== null && typeof (a) === 'object' && a.buffer instanceof ArrayBuffer;
	    };
	}
	// Define globalThis if not available.
	// https://github.com/colyseus/colyseus.js/issues/86
	if (typeof (globalThis) === "undefined" &&
	    typeof (window) !== "undefined") {
	    // @ts-ignore
	    window['globalThis'] = window;
	}

	var Client$1 = {};

	var ServerError = {};

	(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.ServerError = exports.CloseCode = void 0;
	(function (CloseCode) {
	    CloseCode[CloseCode["CONSENTED"] = 4000] = "CONSENTED";
	    CloseCode[CloseCode["DEVMODE_RESTART"] = 4010] = "DEVMODE_RESTART";
	})(exports.CloseCode || (exports.CloseCode = {}));
	class ServerError extends Error {
	    constructor(code, message) {
	        super(message);
	        this.name = "ServerError";
	        this.code = code;
	    }
	}
	exports.ServerError = ServerError;

	}(ServerError));

	var Room$1 = {};

	var msgpack$1 = {};

	/**
	 * Copyright (c) 2014 Ion Drive Software Ltd.
	 * https://github.com/darrachequesne/notepack/
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy
	 * of this software and associated documentation files (the "Software"), to deal
	 * in the Software without restriction, including without limitation the rights
	 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	 * copies of the Software, and to permit persons to whom the Software is
	 * furnished to do so, subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	 * SOFTWARE.
	 */
	Object.defineProperty(msgpack$1, "__esModule", { value: true });
	msgpack$1.decode = msgpack$1.encode = void 0;
	/**
	 * Patch for Colyseus:
	 * -------------------
	 * notepack.io@3.0.1
	 *
	 * added `offset` on Decoder constructor, for messages arriving with a code
	 * before actual msgpack data
	 */
	//
	// DECODER
	//
	function Decoder(buffer, offset) {
	    this._offset = offset;
	    if (buffer instanceof ArrayBuffer) {
	        this._buffer = buffer;
	        this._view = new DataView(this._buffer);
	    }
	    else if (ArrayBuffer.isView(buffer)) {
	        this._buffer = buffer.buffer;
	        this._view = new DataView(this._buffer, buffer.byteOffset, buffer.byteLength);
	    }
	    else {
	        throw new Error('Invalid argument');
	    }
	}
	function utf8Read(view, offset, length) {
	    var string = '', chr = 0;
	    for (var i = offset, end = offset + length; i < end; i++) {
	        var byte = view.getUint8(i);
	        if ((byte & 0x80) === 0x00) {
	            string += String.fromCharCode(byte);
	            continue;
	        }
	        if ((byte & 0xe0) === 0xc0) {
	            string += String.fromCharCode(((byte & 0x1f) << 6) |
	                (view.getUint8(++i) & 0x3f));
	            continue;
	        }
	        if ((byte & 0xf0) === 0xe0) {
	            string += String.fromCharCode(((byte & 0x0f) << 12) |
	                ((view.getUint8(++i) & 0x3f) << 6) |
	                ((view.getUint8(++i) & 0x3f) << 0));
	            continue;
	        }
	        if ((byte & 0xf8) === 0xf0) {
	            chr = ((byte & 0x07) << 18) |
	                ((view.getUint8(++i) & 0x3f) << 12) |
	                ((view.getUint8(++i) & 0x3f) << 6) |
	                ((view.getUint8(++i) & 0x3f) << 0);
	            if (chr >= 0x010000) { // surrogate pair
	                chr -= 0x010000;
	                string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
	            }
	            else {
	                string += String.fromCharCode(chr);
	            }
	            continue;
	        }
	        throw new Error('Invalid byte ' + byte.toString(16));
	    }
	    return string;
	}
	Decoder.prototype._array = function (length) {
	    var value = new Array(length);
	    for (var i = 0; i < length; i++) {
	        value[i] = this._parse();
	    }
	    return value;
	};
	Decoder.prototype._map = function (length) {
	    var key = '', value = {};
	    for (var i = 0; i < length; i++) {
	        key = this._parse();
	        value[key] = this._parse();
	    }
	    return value;
	};
	Decoder.prototype._str = function (length) {
	    var value = utf8Read(this._view, this._offset, length);
	    this._offset += length;
	    return value;
	};
	Decoder.prototype._bin = function (length) {
	    var value = this._buffer.slice(this._offset, this._offset + length);
	    this._offset += length;
	    return value;
	};
	Decoder.prototype._parse = function () {
	    var prefix = this._view.getUint8(this._offset++);
	    var value, length = 0, type = 0, hi = 0, lo = 0;
	    if (prefix < 0xc0) {
	        // positive fixint
	        if (prefix < 0x80) {
	            return prefix;
	        }
	        // fixmap
	        if (prefix < 0x90) {
	            return this._map(prefix & 0x0f);
	        }
	        // fixarray
	        if (prefix < 0xa0) {
	            return this._array(prefix & 0x0f);
	        }
	        // fixstr
	        return this._str(prefix & 0x1f);
	    }
	    // negative fixint
	    if (prefix > 0xdf) {
	        return (0xff - prefix + 1) * -1;
	    }
	    switch (prefix) {
	        // nil
	        case 0xc0:
	            return null;
	        // false
	        case 0xc2:
	            return false;
	        // true
	        case 0xc3:
	            return true;
	        // bin
	        case 0xc4:
	            length = this._view.getUint8(this._offset);
	            this._offset += 1;
	            return this._bin(length);
	        case 0xc5:
	            length = this._view.getUint16(this._offset);
	            this._offset += 2;
	            return this._bin(length);
	        case 0xc6:
	            length = this._view.getUint32(this._offset);
	            this._offset += 4;
	            return this._bin(length);
	        // ext
	        case 0xc7:
	            length = this._view.getUint8(this._offset);
	            type = this._view.getInt8(this._offset + 1);
	            this._offset += 2;
	            if (type === -1) {
	                // timestamp 96
	                var ns = this._view.getUint32(this._offset);
	                hi = this._view.getInt32(this._offset + 4);
	                lo = this._view.getUint32(this._offset + 8);
	                this._offset += 12;
	                return new Date((hi * 0x100000000 + lo) * 1e3 + ns / 1e6);
	            }
	            return [type, this._bin(length)];
	        case 0xc8:
	            length = this._view.getUint16(this._offset);
	            type = this._view.getInt8(this._offset + 2);
	            this._offset += 3;
	            return [type, this._bin(length)];
	        case 0xc9:
	            length = this._view.getUint32(this._offset);
	            type = this._view.getInt8(this._offset + 4);
	            this._offset += 5;
	            return [type, this._bin(length)];
	        // float
	        case 0xca:
	            value = this._view.getFloat32(this._offset);
	            this._offset += 4;
	            return value;
	        case 0xcb:
	            value = this._view.getFloat64(this._offset);
	            this._offset += 8;
	            return value;
	        // uint
	        case 0xcc:
	            value = this._view.getUint8(this._offset);
	            this._offset += 1;
	            return value;
	        case 0xcd:
	            value = this._view.getUint16(this._offset);
	            this._offset += 2;
	            return value;
	        case 0xce:
	            value = this._view.getUint32(this._offset);
	            this._offset += 4;
	            return value;
	        case 0xcf:
	            hi = this._view.getUint32(this._offset) * Math.pow(2, 32);
	            lo = this._view.getUint32(this._offset + 4);
	            this._offset += 8;
	            return hi + lo;
	        // int
	        case 0xd0:
	            value = this._view.getInt8(this._offset);
	            this._offset += 1;
	            return value;
	        case 0xd1:
	            value = this._view.getInt16(this._offset);
	            this._offset += 2;
	            return value;
	        case 0xd2:
	            value = this._view.getInt32(this._offset);
	            this._offset += 4;
	            return value;
	        case 0xd3:
	            hi = this._view.getInt32(this._offset) * Math.pow(2, 32);
	            lo = this._view.getUint32(this._offset + 4);
	            this._offset += 8;
	            return hi + lo;
	        // fixext
	        case 0xd4:
	            type = this._view.getInt8(this._offset);
	            this._offset += 1;
	            if (type === 0x00) {
	                // custom encoding for 'undefined' (kept for backward-compatibility)
	                this._offset += 1;
	                return void 0;
	            }
	            return [type, this._bin(1)];
	        case 0xd5:
	            type = this._view.getInt8(this._offset);
	            this._offset += 1;
	            return [type, this._bin(2)];
	        case 0xd6:
	            type = this._view.getInt8(this._offset);
	            this._offset += 1;
	            if (type === -1) {
	                // timestamp 32
	                value = this._view.getUint32(this._offset);
	                this._offset += 4;
	                return new Date(value * 1e3);
	            }
	            return [type, this._bin(4)];
	        case 0xd7:
	            type = this._view.getInt8(this._offset);
	            this._offset += 1;
	            if (type === 0x00) {
	                // custom date encoding (kept for backward-compatibility)
	                hi = this._view.getInt32(this._offset) * Math.pow(2, 32);
	                lo = this._view.getUint32(this._offset + 4);
	                this._offset += 8;
	                return new Date(hi + lo);
	            }
	            if (type === -1) {
	                // timestamp 64
	                hi = this._view.getUint32(this._offset);
	                lo = this._view.getUint32(this._offset + 4);
	                this._offset += 8;
	                var s = (hi & 0x3) * 0x100000000 + lo;
	                return new Date(s * 1e3 + (hi >>> 2) / 1e6);
	            }
	            return [type, this._bin(8)];
	        case 0xd8:
	            type = this._view.getInt8(this._offset);
	            this._offset += 1;
	            return [type, this._bin(16)];
	        // str
	        case 0xd9:
	            length = this._view.getUint8(this._offset);
	            this._offset += 1;
	            return this._str(length);
	        case 0xda:
	            length = this._view.getUint16(this._offset);
	            this._offset += 2;
	            return this._str(length);
	        case 0xdb:
	            length = this._view.getUint32(this._offset);
	            this._offset += 4;
	            return this._str(length);
	        // array
	        case 0xdc:
	            length = this._view.getUint16(this._offset);
	            this._offset += 2;
	            return this._array(length);
	        case 0xdd:
	            length = this._view.getUint32(this._offset);
	            this._offset += 4;
	            return this._array(length);
	        // map
	        case 0xde:
	            length = this._view.getUint16(this._offset);
	            this._offset += 2;
	            return this._map(length);
	        case 0xdf:
	            length = this._view.getUint32(this._offset);
	            this._offset += 4;
	            return this._map(length);
	    }
	    throw new Error('Could not parse');
	};
	function decode$1(buffer, offset = 0) {
	    var decoder = new Decoder(buffer, offset);
	    var value = decoder._parse();
	    if (decoder._offset !== buffer.byteLength) {
	        throw new Error((buffer.byteLength - decoder._offset) + ' trailing bytes');
	    }
	    return value;
	}
	msgpack$1.decode = decode$1;
	//
	// ENCODER
	//
	var TIMESTAMP32_MAX_SEC = 0x100000000 - 1; // 32-bit unsigned int
	var TIMESTAMP64_MAX_SEC = 0x400000000 - 1; // 34-bit unsigned int
	function utf8Write(view, offset, str) {
	    var c = 0;
	    for (var i = 0, l = str.length; i < l; i++) {
	        c = str.charCodeAt(i);
	        if (c < 0x80) {
	            view.setUint8(offset++, c);
	        }
	        else if (c < 0x800) {
	            view.setUint8(offset++, 0xc0 | (c >> 6));
	            view.setUint8(offset++, 0x80 | (c & 0x3f));
	        }
	        else if (c < 0xd800 || c >= 0xe000) {
	            view.setUint8(offset++, 0xe0 | (c >> 12));
	            view.setUint8(offset++, 0x80 | (c >> 6) & 0x3f);
	            view.setUint8(offset++, 0x80 | (c & 0x3f));
	        }
	        else {
	            i++;
	            c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
	            view.setUint8(offset++, 0xf0 | (c >> 18));
	            view.setUint8(offset++, 0x80 | (c >> 12) & 0x3f);
	            view.setUint8(offset++, 0x80 | (c >> 6) & 0x3f);
	            view.setUint8(offset++, 0x80 | (c & 0x3f));
	        }
	    }
	}
	function utf8Length(str) {
	    var c = 0, length = 0;
	    for (var i = 0, l = str.length; i < l; i++) {
	        c = str.charCodeAt(i);
	        if (c < 0x80) {
	            length += 1;
	        }
	        else if (c < 0x800) {
	            length += 2;
	        }
	        else if (c < 0xd800 || c >= 0xe000) {
	            length += 3;
	        }
	        else {
	            i++;
	            length += 4;
	        }
	    }
	    return length;
	}
	function _encode(bytes, defers, value) {
	    var type = typeof value, i = 0, l = 0, hi = 0, lo = 0, length = 0, size = 0;
	    if (type === 'string') {
	        length = utf8Length(value);
	        // fixstr
	        if (length < 0x20) {
	            bytes.push(length | 0xa0);
	            size = 1;
	        }
	        // str 8
	        else if (length < 0x100) {
	            bytes.push(0xd9, length);
	            size = 2;
	        }
	        // str 16
	        else if (length < 0x10000) {
	            bytes.push(0xda, length >> 8, length);
	            size = 3;
	        }
	        // str 32
	        else if (length < 0x100000000) {
	            bytes.push(0xdb, length >> 24, length >> 16, length >> 8, length);
	            size = 5;
	        }
	        else {
	            throw new Error('String too long');
	        }
	        defers.push({ _str: value, _length: length, _offset: bytes.length });
	        return size + length;
	    }
	    if (type === 'number') {
	        // TODO: encode to float 32?
	        // float 64
	        if (Math.floor(value) !== value || !isFinite(value)) {
	            bytes.push(0xcb);
	            defers.push({ _float: value, _length: 8, _offset: bytes.length });
	            return 9;
	        }
	        if (value >= 0) {
	            // positive fixnum
	            if (value < 0x80) {
	                bytes.push(value);
	                return 1;
	            }
	            // uint 8
	            if (value < 0x100) {
	                bytes.push(0xcc, value);
	                return 2;
	            }
	            // uint 16
	            if (value < 0x10000) {
	                bytes.push(0xcd, value >> 8, value);
	                return 3;
	            }
	            // uint 32
	            if (value < 0x100000000) {
	                bytes.push(0xce, value >> 24, value >> 16, value >> 8, value);
	                return 5;
	            }
	            // uint 64
	            hi = (value / Math.pow(2, 32)) >> 0;
	            lo = value >>> 0;
	            bytes.push(0xcf, hi >> 24, hi >> 16, hi >> 8, hi, lo >> 24, lo >> 16, lo >> 8, lo);
	            return 9;
	        }
	        else {
	            // negative fixnum
	            if (value >= -0x20) {
	                bytes.push(value);
	                return 1;
	            }
	            // int 8
	            if (value >= -0x80) {
	                bytes.push(0xd0, value);
	                return 2;
	            }
	            // int 16
	            if (value >= -0x8000) {
	                bytes.push(0xd1, value >> 8, value);
	                return 3;
	            }
	            // int 32
	            if (value >= -0x80000000) {
	                bytes.push(0xd2, value >> 24, value >> 16, value >> 8, value);
	                return 5;
	            }
	            // int 64
	            hi = Math.floor(value / Math.pow(2, 32));
	            lo = value >>> 0;
	            bytes.push(0xd3, hi >> 24, hi >> 16, hi >> 8, hi, lo >> 24, lo >> 16, lo >> 8, lo);
	            return 9;
	        }
	    }
	    if (type === 'object') {
	        // nil
	        if (value === null) {
	            bytes.push(0xc0);
	            return 1;
	        }
	        if (Array.isArray(value)) {
	            length = value.length;
	            // fixarray
	            if (length < 0x10) {
	                bytes.push(length | 0x90);
	                size = 1;
	            }
	            // array 16
	            else if (length < 0x10000) {
	                bytes.push(0xdc, length >> 8, length);
	                size = 3;
	            }
	            // array 32
	            else if (length < 0x100000000) {
	                bytes.push(0xdd, length >> 24, length >> 16, length >> 8, length);
	                size = 5;
	            }
	            else {
	                throw new Error('Array too large');
	            }
	            for (i = 0; i < length; i++) {
	                size += _encode(bytes, defers, value[i]);
	            }
	            return size;
	        }
	        if (value instanceof Date) {
	            var ms = value.getTime();
	            var s = Math.floor(ms / 1e3);
	            var ns = (ms - s * 1e3) * 1e6;
	            if (s >= 0 && ns >= 0 && s <= TIMESTAMP64_MAX_SEC) {
	                if (ns === 0 && s <= TIMESTAMP32_MAX_SEC) {
	                    // timestamp 32
	                    bytes.push(0xd6, 0xff, s >> 24, s >> 16, s >> 8, s);
	                    return 6;
	                }
	                else {
	                    // timestamp 64
	                    hi = s / 0x100000000;
	                    lo = s & 0xffffffff;
	                    bytes.push(0xd7, 0xff, ns >> 22, ns >> 14, ns >> 6, hi, lo >> 24, lo >> 16, lo >> 8, lo);
	                    return 10;
	                }
	            }
	            else {
	                // timestamp 96
	                hi = Math.floor(s / 0x100000000);
	                lo = s >>> 0;
	                bytes.push(0xc7, 0x0c, 0xff, ns >> 24, ns >> 16, ns >> 8, ns, hi >> 24, hi >> 16, hi >> 8, hi, lo >> 24, lo >> 16, lo >> 8, lo);
	                return 15;
	            }
	        }
	        if (value instanceof ArrayBuffer) {
	            length = value.byteLength;
	            // bin 8
	            if (length < 0x100) {
	                bytes.push(0xc4, length);
	                size = 2;
	            }
	            else 
	            // bin 16
	            if (length < 0x10000) {
	                bytes.push(0xc5, length >> 8, length);
	                size = 3;
	            }
	            else 
	            // bin 32
	            if (length < 0x100000000) {
	                bytes.push(0xc6, length >> 24, length >> 16, length >> 8, length);
	                size = 5;
	            }
	            else {
	                throw new Error('Buffer too large');
	            }
	            defers.push({ _bin: value, _length: length, _offset: bytes.length });
	            return size + length;
	        }
	        if (typeof value.toJSON === 'function') {
	            return _encode(bytes, defers, value.toJSON());
	        }
	        var keys = [], key = '';
	        var allKeys = Object.keys(value);
	        for (i = 0, l = allKeys.length; i < l; i++) {
	            key = allKeys[i];
	            if (value[key] !== undefined && typeof value[key] !== 'function') {
	                keys.push(key);
	            }
	        }
	        length = keys.length;
	        // fixmap
	        if (length < 0x10) {
	            bytes.push(length | 0x80);
	            size = 1;
	        }
	        // map 16
	        else if (length < 0x10000) {
	            bytes.push(0xde, length >> 8, length);
	            size = 3;
	        }
	        // map 32
	        else if (length < 0x100000000) {
	            bytes.push(0xdf, length >> 24, length >> 16, length >> 8, length);
	            size = 5;
	        }
	        else {
	            throw new Error('Object too large');
	        }
	        for (i = 0; i < length; i++) {
	            key = keys[i];
	            size += _encode(bytes, defers, key);
	            size += _encode(bytes, defers, value[key]);
	        }
	        return size;
	    }
	    // false/true
	    if (type === 'boolean') {
	        bytes.push(value ? 0xc3 : 0xc2);
	        return 1;
	    }
	    if (type === 'undefined') {
	        bytes.push(0xc0);
	        return 1;
	    }
	    // custom types like BigInt (typeof value === 'bigint')
	    if (typeof value.toJSON === 'function') {
	        return _encode(bytes, defers, value.toJSON());
	    }
	    throw new Error('Could not encode');
	}
	function encode$1(value) {
	    var bytes = [];
	    var defers = [];
	    var size = _encode(bytes, defers, value);
	    var buf = new ArrayBuffer(size);
	    var view = new DataView(buf);
	    var deferIndex = 0;
	    var deferWritten = 0;
	    var nextOffset = -1;
	    if (defers.length > 0) {
	        nextOffset = defers[0]._offset;
	    }
	    var defer, deferLength = 0, offset = 0;
	    for (var i = 0, l = bytes.length; i < l; i++) {
	        view.setUint8(deferWritten + i, bytes[i]);
	        if (i + 1 !== nextOffset) {
	            continue;
	        }
	        defer = defers[deferIndex];
	        deferLength = defer._length;
	        offset = deferWritten + nextOffset;
	        if (defer._bin) {
	            var bin = new Uint8Array(defer._bin);
	            for (var j = 0; j < deferLength; j++) {
	                view.setUint8(offset + j, bin[j]);
	            }
	        }
	        else if (defer._str) {
	            utf8Write(view, offset, defer._str);
	        }
	        else if (defer._float !== undefined) {
	            view.setFloat64(offset, defer._float);
	        }
	        deferIndex++;
	        deferWritten += deferLength;
	        if (defers[deferIndex]) {
	            nextOffset = defers[deferIndex]._offset;
	        }
	    }
	    return buf;
	}
	msgpack$1.encode = encode$1;

	var Connection$1 = {};

	var WebSocketTransport$1 = {};

	var browser = function () {
	  throw new Error(
	    'ws does not work in the browser. Browser clients must use the native ' +
	      'WebSocket object'
	  );
	};

	var __importDefault = (globalThis && globalThis.__importDefault) || function (mod) {
	    return (mod && mod.__esModule) ? mod : { "default": mod };
	};
	Object.defineProperty(WebSocketTransport$1, "__esModule", { value: true });
	WebSocketTransport$1.WebSocketTransport = void 0;
	const ws_1 = __importDefault(browser);
	const WebSocket = globalThis.WebSocket || ws_1.default;
	class WebSocketTransport {
	    constructor(events) {
	        this.events = events;
	    }
	    send(data) {
	        if (data instanceof ArrayBuffer) {
	            this.ws.send(data);
	        }
	        else if (Array.isArray(data)) {
	            this.ws.send((new Uint8Array(data)).buffer);
	        }
	    }
	    connect(url) {
	        this.ws = new WebSocket(url, this.protocols);
	        this.ws.binaryType = 'arraybuffer';
	        this.ws.onopen = this.events.onopen;
	        this.ws.onmessage = this.events.onmessage;
	        this.ws.onclose = this.events.onclose;
	        this.ws.onerror = this.events.onerror;
	    }
	    close(code, reason) {
	        this.ws.close(code, reason);
	    }
	    get isOpen() {
	        return this.ws.readyState === WebSocket.OPEN;
	    }
	}
	WebSocketTransport$1.WebSocketTransport = WebSocketTransport;

	Object.defineProperty(Connection$1, "__esModule", { value: true });
	Connection$1.Connection = void 0;
	const WebSocketTransport_1 = WebSocketTransport$1;
	class Connection {
	    constructor() {
	        this.events = {};
	        this.transport = new WebSocketTransport_1.WebSocketTransport(this.events);
	    }
	    send(data) {
	        this.transport.send(data);
	    }
	    connect(url) {
	        this.transport.connect(url);
	    }
	    close(code, reason) {
	        this.transport.close(code, reason);
	    }
	    get isOpen() {
	        return this.transport.isOpen;
	    }
	}
	Connection$1.Connection = Connection;

	var Protocol = {};

	(function (exports) {
	// Use codes between 0~127 for lesser throughput (1 byte)
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.utf8Length = exports.utf8Read = exports.ErrorCode = exports.Protocol = void 0;
	(function (Protocol) {
	    // Room-related (10~19)
	    Protocol[Protocol["HANDSHAKE"] = 9] = "HANDSHAKE";
	    Protocol[Protocol["JOIN_ROOM"] = 10] = "JOIN_ROOM";
	    Protocol[Protocol["ERROR"] = 11] = "ERROR";
	    Protocol[Protocol["LEAVE_ROOM"] = 12] = "LEAVE_ROOM";
	    Protocol[Protocol["ROOM_DATA"] = 13] = "ROOM_DATA";
	    Protocol[Protocol["ROOM_STATE"] = 14] = "ROOM_STATE";
	    Protocol[Protocol["ROOM_STATE_PATCH"] = 15] = "ROOM_STATE_PATCH";
	    Protocol[Protocol["ROOM_DATA_SCHEMA"] = 16] = "ROOM_DATA_SCHEMA";
	    Protocol[Protocol["ROOM_DATA_BYTES"] = 17] = "ROOM_DATA_BYTES";
	})(exports.Protocol || (exports.Protocol = {}));
	(function (ErrorCode) {
	    ErrorCode[ErrorCode["MATCHMAKE_NO_HANDLER"] = 4210] = "MATCHMAKE_NO_HANDLER";
	    ErrorCode[ErrorCode["MATCHMAKE_INVALID_CRITERIA"] = 4211] = "MATCHMAKE_INVALID_CRITERIA";
	    ErrorCode[ErrorCode["MATCHMAKE_INVALID_ROOM_ID"] = 4212] = "MATCHMAKE_INVALID_ROOM_ID";
	    ErrorCode[ErrorCode["MATCHMAKE_UNHANDLED"] = 4213] = "MATCHMAKE_UNHANDLED";
	    ErrorCode[ErrorCode["MATCHMAKE_EXPIRED"] = 4214] = "MATCHMAKE_EXPIRED";
	    ErrorCode[ErrorCode["AUTH_FAILED"] = 4215] = "AUTH_FAILED";
	    ErrorCode[ErrorCode["APPLICATION_ERROR"] = 4216] = "APPLICATION_ERROR";
	})(exports.ErrorCode || (exports.ErrorCode = {}));
	function utf8Read(view, offset) {
	    const length = view[offset++];
	    var string = '', chr = 0;
	    for (var i = offset, end = offset + length; i < end; i++) {
	        var byte = view[i];
	        if ((byte & 0x80) === 0x00) {
	            string += String.fromCharCode(byte);
	            continue;
	        }
	        if ((byte & 0xe0) === 0xc0) {
	            string += String.fromCharCode(((byte & 0x1f) << 6) |
	                (view[++i] & 0x3f));
	            continue;
	        }
	        if ((byte & 0xf0) === 0xe0) {
	            string += String.fromCharCode(((byte & 0x0f) << 12) |
	                ((view[++i] & 0x3f) << 6) |
	                ((view[++i] & 0x3f) << 0));
	            continue;
	        }
	        if ((byte & 0xf8) === 0xf0) {
	            chr = ((byte & 0x07) << 18) |
	                ((view[++i] & 0x3f) << 12) |
	                ((view[++i] & 0x3f) << 6) |
	                ((view[++i] & 0x3f) << 0);
	            if (chr >= 0x010000) { // surrogate pair
	                chr -= 0x010000;
	                string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
	            }
	            else {
	                string += String.fromCharCode(chr);
	            }
	            continue;
	        }
	        throw new Error('Invalid byte ' + byte.toString(16));
	    }
	    return string;
	}
	exports.utf8Read = utf8Read;
	// Faster for short strings than Buffer.byteLength
	function utf8Length(str = '') {
	    let c = 0;
	    let length = 0;
	    for (let i = 0, l = str.length; i < l; i++) {
	        c = str.charCodeAt(i);
	        if (c < 0x80) {
	            length += 1;
	        }
	        else if (c < 0x800) {
	            length += 2;
	        }
	        else if (c < 0xd800 || c >= 0xe000) {
	            length += 3;
	        }
	        else {
	            i++;
	            length += 4;
	        }
	    }
	    return length + 1;
	}
	exports.utf8Length = utf8Length;

	}(Protocol));

	var Serializer = {};

	Object.defineProperty(Serializer, "__esModule", { value: true });
	Serializer.getSerializer = Serializer.registerSerializer = void 0;
	const serializers = {};
	function registerSerializer(id, serializer) {
	    serializers[id] = serializer;
	}
	Serializer.registerSerializer = registerSerializer;
	function getSerializer(id) {
	    const serializer = serializers[id];
	    if (!serializer) {
	        throw new Error("missing serializer: " + id);
	    }
	    return serializer;
	}
	Serializer.getSerializer = getSerializer;

	var nanoevents = {};

	/**
	 * The MIT License (MIT)
	 *
	 * Copyright 2016 Andrey Sitnik <andrey@sitnik.ru>
	 *
	 * Permission is hereby granted, free of charge, to any person obtaining a copy of
	 * this software and associated documentation files (the "Software"), to deal in
	 * the Software without restriction, including without limitation the rights to
	 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
	 * the Software, and to permit persons to whom the Software is furnished to do so,
	 * subject to the following conditions:
	 *
	 * The above copyright notice and this permission notice shall be included in all
	 * copies or substantial portions of the Software.
	 *
	 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
	 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
	 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
	 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
	 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	 */
	Object.defineProperty(nanoevents, "__esModule", { value: true });
	nanoevents.createNanoEvents = void 0;
	const createNanoEvents = () => ({
	    emit(event, ...args) {
	        let callbacks = this.events[event] || [];
	        for (let i = 0, length = callbacks.length; i < length; i++) {
	            callbacks[i](...args);
	        }
	    },
	    events: {},
	    on(event, cb) {
	        var _a;
	        ((_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.push(cb)) || (this.events[event] = [cb]);
	        return () => {
	            var _a;
	            this.events[event] = (_a = this.events[event]) === null || _a === void 0 ? void 0 : _a.filter(i => cb !== i);
	        };
	    }
	});
	nanoevents.createNanoEvents = createNanoEvents;

	var signal = {};

	Object.defineProperty(signal, "__esModule", { value: true });
	signal.createSignal = signal.EventEmitter = void 0;
	class EventEmitter {
	    constructor() {
	        this.handlers = [];
	    }
	    register(cb, once = false) {
	        this.handlers.push(cb);
	        return this;
	    }
	    invoke(...args) {
	        this.handlers.forEach((handler) => handler.apply(this, args));
	    }
	    invokeAsync(...args) {
	        return Promise.all(this.handlers.map((handler) => handler.apply(this, args)));
	    }
	    remove(cb) {
	        const index = this.handlers.indexOf(cb);
	        this.handlers[index] = this.handlers[this.handlers.length - 1];
	        this.handlers.pop();
	    }
	    clear() {
	        this.handlers = [];
	    }
	}
	signal.EventEmitter = EventEmitter;
	function createSignal() {
	    const emitter = new EventEmitter();
	    function register(cb) {
	        return emitter.register(cb, this === null);
	    }
	    register.once = (cb) => {
	        const callback = function (...args) {
	            cb.apply(this, args);
	            emitter.remove(callback);
	        };
	        emitter.register(callback);
	    };
	    register.remove = (cb) => emitter.remove(cb);
	    register.invoke = (...args) => emitter.invoke(...args);
	    register.invokeAsync = (...args) => emitter.invokeAsync(...args);
	    register.clear = () => emitter.clear();
	    return register;
	}
	signal.createSignal = createSignal;

	var umd = {exports: {}};

	(function (module, exports) {
	(function (global, factory) {
	    factory(exports) ;
	})(this, (function (exports) {
	    /******************************************************************************
	    Copyright (c) Microsoft Corporation.

	    Permission to use, copy, modify, and/or distribute this software for any
	    purpose with or without fee is hereby granted.

	    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
	    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
	    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
	    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
	    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
	    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
	    PERFORMANCE OF THIS SOFTWARE.
	    ***************************************************************************** */
	    /* global Reflect, Promise, SuppressedError, Symbol */

	    var extendStatics = function(d, b) {
	        extendStatics = Object.setPrototypeOf ||
	            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
	            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
	        return extendStatics(d, b);
	    };

	    function __extends(d, b) {
	        if (typeof b !== "function" && b !== null)
	            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
	        extendStatics(d, b);
	        function __() { this.constructor = d; }
	        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    }

	    function __decorate(decorators, target, key, desc) {
	        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
	        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
	        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
	        return c > 3 && r && Object.defineProperty(target, key, r), r;
	    }

	    function __spreadArray(to, from, pack) {
	        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
	            if (ar || !(i in from)) {
	                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
	                ar[i] = from[i];
	            }
	        }
	        return to.concat(ar || Array.prototype.slice.call(from));
	    }

	    typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
	        var e = new Error(message);
	        return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
	    };

	    // export const SWITCH_TO_STRUCTURE = 193; (easily collides with DELETE_AND_ADD + fieldIndex = 2)
	    var SWITCH_TO_STRUCTURE = 255; // (decoding collides with DELETE_AND_ADD + fieldIndex = 63)
	    var TYPE_ID = 213;
	    /**
	     * Encoding Schema field operations.
	     */
	    exports.OPERATION = void 0;
	    (function (OPERATION) {
	        // add new structure/primitive
	        OPERATION[OPERATION["ADD"] = 128] = "ADD";
	        // replace structure/primitive
	        OPERATION[OPERATION["REPLACE"] = 0] = "REPLACE";
	        // delete field
	        OPERATION[OPERATION["DELETE"] = 64] = "DELETE";
	        // DELETE field, followed by an ADD
	        OPERATION[OPERATION["DELETE_AND_ADD"] = 192] = "DELETE_AND_ADD";
	        // TOUCH is used to determine hierarchy of nested Schema structures during serialization.
	        // touches are NOT encoded.
	        OPERATION[OPERATION["TOUCH"] = 1] = "TOUCH";
	        // MapSchema Operations
	        OPERATION[OPERATION["CLEAR"] = 10] = "CLEAR";
	    })(exports.OPERATION || (exports.OPERATION = {}));
	    // export enum OPERATION {
	    //     // add new structure/primitive
	    //     // (128)
	    //     ADD = 128, // 10000000,
	    //     // replace structure/primitive
	    //     REPLACE = 1,// 00000001
	    //     // delete field
	    //     DELETE = 192, // 11000000
	    //     // DELETE field, followed by an ADD
	    //     DELETE_AND_ADD = 224, // 11100000
	    //     // TOUCH is used to determine hierarchy of nested Schema structures during serialization.
	    //     // touches are NOT encoded.
	    //     TOUCH = 0, // 00000000
	    //     // MapSchema Operations
	    //     CLEAR = 10,
	    // }

	    var ChangeTree = /** @class */ (function () {
	        function ChangeTree(ref, parent, root) {
	            this.changed = false;
	            this.changes = new Map();
	            this.allChanges = new Set();
	            // cached indexes for filtering
	            this.caches = {};
	            this.currentCustomOperation = 0;
	            this.ref = ref;
	            this.setParent(parent, root);
	        }
	        ChangeTree.prototype.setParent = function (parent, root, parentIndex) {
	            var _this = this;
	            if (!this.indexes) {
	                this.indexes = (this.ref instanceof Schema)
	                    ? this.ref['_definition'].indexes
	                    : {};
	            }
	            this.parent = parent;
	            this.parentIndex = parentIndex;
	            // avoid setting parents with empty `root`
	            if (!root) {
	                return;
	            }
	            this.root = root;
	            //
	            // assign same parent on child structures
	            //
	            if (this.ref instanceof Schema) {
	                var definition = this.ref['_definition'];
	                for (var field in definition.schema) {
	                    var value = this.ref[field];
	                    if (value && value['$changes']) {
	                        var parentIndex_1 = definition.indexes[field];
	                        value['$changes'].setParent(this.ref, root, parentIndex_1);
	                    }
	                }
	            }
	            else if (typeof (this.ref) === "object") {
	                this.ref.forEach(function (value, key) {
	                    if (value instanceof Schema) {
	                        var changeTreee = value['$changes'];
	                        var parentIndex_2 = _this.ref['$changes'].indexes[key];
	                        changeTreee.setParent(_this.ref, _this.root, parentIndex_2);
	                    }
	                });
	            }
	        };
	        ChangeTree.prototype.operation = function (op) {
	            this.changes.set(--this.currentCustomOperation, op);
	        };
	        ChangeTree.prototype.change = function (fieldName, operation) {
	            if (operation === void 0) { operation = exports.OPERATION.ADD; }
	            var index = (typeof (fieldName) === "number")
	                ? fieldName
	                : this.indexes[fieldName];
	            this.assertValidIndex(index, fieldName);
	            var previousChange = this.changes.get(index);
	            if (!previousChange ||
	                previousChange.op === exports.OPERATION.DELETE ||
	                previousChange.op === exports.OPERATION.TOUCH // (mazmorra.io's BattleAction issue)
	            ) {
	                this.changes.set(index, {
	                    op: (!previousChange)
	                        ? operation
	                        : (previousChange.op === exports.OPERATION.DELETE)
	                            ? exports.OPERATION.DELETE_AND_ADD
	                            : operation,
	                    // : OPERATION.REPLACE,
	                    index: index
	                });
	            }
	            this.allChanges.add(index);
	            this.changed = true;
	            this.touchParents();
	        };
	        ChangeTree.prototype.touch = function (fieldName) {
	            var index = (typeof (fieldName) === "number")
	                ? fieldName
	                : this.indexes[fieldName];
	            this.assertValidIndex(index, fieldName);
	            if (!this.changes.has(index)) {
	                this.changes.set(index, { op: exports.OPERATION.TOUCH, index: index });
	            }
	            this.allChanges.add(index);
	            // ensure touch is placed until the $root is found.
	            this.touchParents();
	        };
	        ChangeTree.prototype.touchParents = function () {
	            if (this.parent) {
	                this.parent['$changes'].touch(this.parentIndex);
	            }
	        };
	        ChangeTree.prototype.getType = function (index) {
	            if (this.ref['_definition']) {
	                var definition = this.ref['_definition'];
	                return definition.schema[definition.fieldsByIndex[index]];
	            }
	            else {
	                var definition = this.parent['_definition'];
	                var parentType = definition.schema[definition.fieldsByIndex[this.parentIndex]];
	                //
	                // Get the child type from parent structure.
	                // - ["string"] => "string"
	                // - { map: "string" } => "string"
	                // - { set: "string" } => "string"
	                //
	                return Object.values(parentType)[0];
	            }
	        };
	        ChangeTree.prototype.getChildrenFilter = function () {
	            var childFilters = this.parent['_definition'].childFilters;
	            return childFilters && childFilters[this.parentIndex];
	        };
	        //
	        // used during `.encode()`
	        //
	        ChangeTree.prototype.getValue = function (index) {
	            return this.ref['getByIndex'](index);
	        };
	        ChangeTree.prototype.delete = function (fieldName) {
	            var index = (typeof (fieldName) === "number")
	                ? fieldName
	                : this.indexes[fieldName];
	            if (index === undefined) {
	                console.warn("@colyseus/schema ".concat(this.ref.constructor.name, ": trying to delete non-existing index: ").concat(fieldName, " (").concat(index, ")"));
	                return;
	            }
	            var previousValue = this.getValue(index);
	            // console.log("$changes.delete =>", { fieldName, index, previousValue });
	            this.changes.set(index, { op: exports.OPERATION.DELETE, index: index });
	            this.allChanges.delete(index);
	            // delete cache
	            delete this.caches[index];
	            // remove `root` reference
	            if (previousValue && previousValue['$changes']) {
	                previousValue['$changes'].parent = undefined;
	            }
	            this.changed = true;
	            this.touchParents();
	        };
	        ChangeTree.prototype.discard = function (changed, discardAll) {
	            var _this = this;
	            if (changed === void 0) { changed = false; }
	            if (discardAll === void 0) { discardAll = false; }
	            //
	            // Map, Array, etc:
	            // Remove cached key to ensure ADD operations is unsed instead of
	            // REPLACE in case same key is used on next patches.
	            //
	            // TODO: refactor this. this is not relevant for Collection and Set.
	            //
	            if (!(this.ref instanceof Schema)) {
	                this.changes.forEach(function (change) {
	                    if (change.op === exports.OPERATION.DELETE) {
	                        var index = _this.ref['getIndex'](change.index);
	                        delete _this.indexes[index];
	                    }
	                });
	            }
	            this.changes.clear();
	            this.changed = changed;
	            if (discardAll) {
	                this.allChanges.clear();
	            }
	            // re-set `currentCustomOperation`
	            this.currentCustomOperation = 0;
	        };
	        /**
	         * Recursively discard all changes from this, and child structures.
	         */
	        ChangeTree.prototype.discardAll = function () {
	            var _this = this;
	            this.changes.forEach(function (change) {
	                var value = _this.getValue(change.index);
	                if (value && value['$changes']) {
	                    value['$changes'].discardAll();
	                }
	            });
	            this.discard();
	        };
	        // cache(field: number, beginIndex: number, endIndex: number) {
	        ChangeTree.prototype.cache = function (field, cachedBytes) {
	            this.caches[field] = cachedBytes;
	        };
	        ChangeTree.prototype.clone = function () {
	            return new ChangeTree(this.ref, this.parent, this.root);
	        };
	        ChangeTree.prototype.ensureRefId = function () {
	            // skip if refId is already set.
	            if (this.refId !== undefined) {
	                return;
	            }
	            this.refId = this.root.getNextUniqueId();
	        };
	        ChangeTree.prototype.assertValidIndex = function (index, fieldName) {
	            if (index === undefined) {
	                throw new Error("ChangeTree: missing index for field \"".concat(fieldName, "\""));
	            }
	        };
	        return ChangeTree;
	    }());

	    function addCallback($callbacks, op, callback, existing) {
	        // initialize list of callbacks
	        if (!$callbacks[op]) {
	            $callbacks[op] = [];
	        }
	        $callbacks[op].push(callback);
	        //
	        // Trigger callback for existing elements
	        // - OPERATION.ADD
	        // - OPERATION.REPLACE
	        //
	        existing === null || existing === void 0 ? void 0 : existing.forEach(function (item, key) { return callback(item, key); });
	        return function () { return spliceOne($callbacks[op], $callbacks[op].indexOf(callback)); };
	    }
	    function removeChildRefs(changes) {
	        var _this = this;
	        var needRemoveRef = (typeof (this.$changes.getType()) !== "string");
	        this.$items.forEach(function (item, key) {
	            changes.push({
	                refId: _this.$changes.refId,
	                op: exports.OPERATION.DELETE,
	                field: key,
	                value: undefined,
	                previousValue: item
	            });
	            if (needRemoveRef) {
	                _this.$changes.root.removeRef(item['$changes'].refId);
	            }
	        });
	    }
	    function spliceOne(arr, index) {
	        // manually splice an array
	        if (index === -1 || index >= arr.length) {
	            return false;
	        }
	        var len = arr.length - 1;
	        for (var i = index; i < len; i++) {
	            arr[i] = arr[i + 1];
	        }
	        arr.length = len;
	        return true;
	    }

	    var DEFAULT_SORT = function (a, b) {
	        var A = a.toString();
	        var B = b.toString();
	        if (A < B)
	            return -1;
	        else if (A > B)
	            return 1;
	        else
	            return 0;
	    };
	    function getArrayProxy(value) {
	        value['$proxy'] = true;
	        //
	        // compatibility with @colyseus/schema 0.5.x
	        // - allow `map["key"]`
	        // - allow `map["key"] = "xxx"`
	        // - allow `delete map["key"]`
	        //
	        value = new Proxy(value, {
	            get: function (obj, prop) {
	                if (typeof (prop) !== "symbol" &&
	                    !isNaN(prop) // https://stackoverflow.com/a/175787/892698
	                ) {
	                    return obj.at(prop);
	                }
	                else {
	                    return obj[prop];
	                }
	            },
	            set: function (obj, prop, setValue) {
	                if (typeof (prop) !== "symbol" &&
	                    !isNaN(prop)) {
	                    var indexes = Array.from(obj['$items'].keys());
	                    var key = parseInt(indexes[prop] || prop);
	                    if (setValue === undefined || setValue === null) {
	                        obj.deleteAt(key);
	                    }
	                    else {
	                        obj.setAt(key, setValue);
	                    }
	                }
	                else {
	                    obj[prop] = setValue;
	                }
	                return true;
	            },
	            deleteProperty: function (obj, prop) {
	                if (typeof (prop) === "number") {
	                    obj.deleteAt(prop);
	                }
	                else {
	                    delete obj[prop];
	                }
	                return true;
	            },
	            has: function (obj, key) {
	                if (typeof (key) !== "symbol" &&
	                    !isNaN(Number(key))) {
	                    return obj['$items'].has(Number(key));
	                }
	                return Reflect.has(obj, key);
	            }
	        });
	        return value;
	    }
	    var ArraySchema = /** @class */ (function () {
	        function ArraySchema() {
	            var items = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                items[_i] = arguments[_i];
	            }
	            this.$changes = new ChangeTree(this);
	            this.$items = new Map();
	            this.$indexes = new Map();
	            this.$refId = 0;
	            this.push.apply(this, items);
	        }
	        ArraySchema.prototype.onAdd = function (callback, triggerAll) {
	            if (triggerAll === void 0) { triggerAll = true; }
	            return addCallback((this.$callbacks || (this.$callbacks = {})), exports.OPERATION.ADD, callback, (triggerAll)
	                ? this.$items
	                : undefined);
	        };
	        ArraySchema.prototype.onRemove = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), exports.OPERATION.DELETE, callback); };
	        ArraySchema.prototype.onChange = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), exports.OPERATION.REPLACE, callback); };
	        ArraySchema.is = function (type) {
	            return (
	            // type format: ["string"]
	            Array.isArray(type) ||
	                // type format: { array: "string" }
	                (type['array'] !== undefined));
	        };
	        Object.defineProperty(ArraySchema.prototype, "length", {
	            get: function () {
	                return this.$items.size;
	            },
	            set: function (value) {
	                if (value === 0) {
	                    this.clear();
	                }
	                else {
	                    this.splice(value, this.length - value);
	                }
	            },
	            enumerable: false,
	            configurable: true
	        });
	        ArraySchema.prototype.push = function () {
	            var _this = this;
	            var values = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                values[_i] = arguments[_i];
	            }
	            var lastIndex;
	            values.forEach(function (value) {
	                // set "index" for reference.
	                lastIndex = _this.$refId++;
	                _this.setAt(lastIndex, value);
	            });
	            return lastIndex;
	        };
	        /**
	         * Removes the last element from an array and returns it.
	         */
	        ArraySchema.prototype.pop = function () {
	            var key = Array.from(this.$indexes.values()).pop();
	            if (key === undefined) {
	                return undefined;
	            }
	            this.$changes.delete(key);
	            this.$indexes.delete(key);
	            var value = this.$items.get(key);
	            this.$items.delete(key);
	            return value;
	        };
	        ArraySchema.prototype.at = function (index) {
	            //
	            // FIXME: this should be O(1)
	            //
	            index = Math.trunc(index) || 0;
	            // Allow negative indexing from the end
	            if (index < 0)
	                index += this.length;
	            // OOB access is guaranteed to return undefined
	            if (index < 0 || index >= this.length)
	                return undefined;
	            var key = Array.from(this.$items.keys())[index];
	            return this.$items.get(key);
	        };
	        ArraySchema.prototype.setAt = function (index, value) {
	            var _a, _b;
	            if (value === undefined || value === null) {
	                console.error("ArraySchema items cannot be null nor undefined; Use `deleteAt(index)` instead.");
	                return;
	            }
	            // skip if the value is the same as cached.
	            if (this.$items.get(index) === value) {
	                return;
	            }
	            if (value['$changes'] !== undefined) {
	                value['$changes'].setParent(this, this.$changes.root, index);
	            }
	            var operation = (_b = (_a = this.$changes.indexes[index]) === null || _a === void 0 ? void 0 : _a.op) !== null && _b !== void 0 ? _b : exports.OPERATION.ADD;
	            this.$changes.indexes[index] = index;
	            this.$indexes.set(index, index);
	            this.$items.set(index, value);
	            this.$changes.change(index, operation);
	        };
	        ArraySchema.prototype.deleteAt = function (index) {
	            var key = Array.from(this.$items.keys())[index];
	            if (key === undefined) {
	                return false;
	            }
	            return this.$deleteAt(key);
	        };
	        ArraySchema.prototype.$deleteAt = function (index) {
	            // delete at internal index
	            this.$changes.delete(index);
	            this.$indexes.delete(index);
	            return this.$items.delete(index);
	        };
	        ArraySchema.prototype.clear = function (changes) {
	            // discard previous operations.
	            this.$changes.discard(true, true);
	            this.$changes.indexes = {};
	            // clear previous indexes
	            this.$indexes.clear();
	            //
	            // When decoding:
	            // - enqueue items for DELETE callback.
	            // - flag child items for garbage collection.
	            //
	            if (changes) {
	                removeChildRefs.call(this, changes);
	            }
	            // clear items
	            this.$items.clear();
	            this.$changes.operation({ index: 0, op: exports.OPERATION.CLEAR });
	            // touch all structures until reach root
	            this.$changes.touchParents();
	        };
	        /**
	         * Combines two or more arrays.
	         * @param items Additional items to add to the end of array1.
	         */
	        // @ts-ignore
	        ArraySchema.prototype.concat = function () {
	            var _a;
	            var items = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                items[_i] = arguments[_i];
	            }
	            return new (ArraySchema.bind.apply(ArraySchema, __spreadArray([void 0], (_a = Array.from(this.$items.values())).concat.apply(_a, items), false)))();
	        };
	        /**
	         * Adds all the elements of an array separated by the specified separator string.
	         * @param separator A string used to separate one element of an array from the next in the resulting String. If omitted, the array elements are separated with a comma.
	         */
	        ArraySchema.prototype.join = function (separator) {
	            return Array.from(this.$items.values()).join(separator);
	        };
	        /**
	         * Reverses the elements in an Array.
	         */
	        // @ts-ignore
	        ArraySchema.prototype.reverse = function () {
	            var _this = this;
	            var indexes = Array.from(this.$items.keys());
	            var reversedItems = Array.from(this.$items.values()).reverse();
	            reversedItems.forEach(function (item, i) {
	                _this.setAt(indexes[i], item);
	            });
	            return this;
	        };
	        /**
	         * Removes the first element from an array and returns it.
	         */
	        ArraySchema.prototype.shift = function () {
	            var indexes = Array.from(this.$items.keys());
	            var shiftAt = indexes.shift();
	            if (shiftAt === undefined) {
	                return undefined;
	            }
	            var value = this.$items.get(shiftAt);
	            this.$deleteAt(shiftAt);
	            return value;
	        };
	        /**
	         * Returns a section of an array.
	         * @param start The beginning of the specified portion of the array.
	         * @param end The end of the specified portion of the array. This is exclusive of the element at the index 'end'.
	         */
	        ArraySchema.prototype.slice = function (start, end) {
	            var sliced = new ArraySchema();
	            sliced.push.apply(sliced, Array.from(this.$items.values()).slice(start, end));
	            return sliced;
	        };
	        /**
	         * Sorts an array.
	         * @param compareFn Function used to determine the order of the elements. It is expected to return
	         * a negative value if first argument is less than second argument, zero if they're equal and a positive
	         * value otherwise. If omitted, the elements are sorted in ascending, ASCII character order.
	         * ```ts
	         * [11,2,22,1].sort((a, b) => a - b)
	         * ```
	         */
	        ArraySchema.prototype.sort = function (compareFn) {
	            var _this = this;
	            if (compareFn === void 0) { compareFn = DEFAULT_SORT; }
	            var indexes = Array.from(this.$items.keys());
	            var sortedItems = Array.from(this.$items.values()).sort(compareFn);
	            sortedItems.forEach(function (item, i) {
	                _this.setAt(indexes[i], item);
	            });
	            return this;
	        };
	        /**
	         * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
	         * @param start The zero-based location in the array from which to start removing elements.
	         * @param deleteCount The number of elements to remove.
	         * @param items Elements to insert into the array in place of the deleted elements.
	         */
	        ArraySchema.prototype.splice = function (start, deleteCount) {
	            if (deleteCount === void 0) { deleteCount = this.length - start; }
	            var items = [];
	            for (var _i = 2; _i < arguments.length; _i++) {
	                items[_i - 2] = arguments[_i];
	            }
	            var indexes = Array.from(this.$items.keys());
	            var removedItems = [];
	            for (var i = start; i < start + deleteCount; i++) {
	                removedItems.push(this.$items.get(indexes[i]));
	                this.$deleteAt(indexes[i]);
	            }
	            for (var i = 0; i < items.length; i++) {
	                this.setAt(start + i, items[i]);
	            }
	            return removedItems;
	        };
	        /**
	         * Inserts new elements at the start of an array.
	         * @param items  Elements to insert at the start of the Array.
	         */
	        ArraySchema.prototype.unshift = function () {
	            var _this = this;
	            var items = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                items[_i] = arguments[_i];
	            }
	            var length = this.length;
	            var addedLength = items.length;
	            // const indexes = Array.from(this.$items.keys());
	            var previousValues = Array.from(this.$items.values());
	            items.forEach(function (item, i) {
	                _this.setAt(i, item);
	            });
	            previousValues.forEach(function (previousValue, i) {
	                _this.setAt(addedLength + i, previousValue);
	            });
	            return length + addedLength;
	        };
	        /**
	         * Returns the index of the first occurrence of a value in an array.
	         * @param searchElement The value to locate in the array.
	         * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0.
	         */
	        ArraySchema.prototype.indexOf = function (searchElement, fromIndex) {
	            return Array.from(this.$items.values()).indexOf(searchElement, fromIndex);
	        };
	        /**
	         * Returns the index of the last occurrence of a specified value in an array.
	         * @param searchElement The value to locate in the array.
	         * @param fromIndex The array index at which to begin the search. If fromIndex is omitted, the search starts at the last index in the array.
	         */
	        ArraySchema.prototype.lastIndexOf = function (searchElement, fromIndex) {
	            if (fromIndex === void 0) { fromIndex = this.length - 1; }
	            return Array.from(this.$items.values()).lastIndexOf(searchElement, fromIndex);
	        };
	        /**
	         * Determines whether all the members of an array satisfy the specified test.
	         * @param callbackfn A function that accepts up to three arguments. The every method calls
	         * the callbackfn function for each element in the array until the callbackfn returns a value
	         * which is coercible to the Boolean value false, or until the end of the array.
	         * @param thisArg An object to which the this keyword can refer in the callbackfn function.
	         * If thisArg is omitted, undefined is used as the this value.
	         */
	        ArraySchema.prototype.every = function (callbackfn, thisArg) {
	            return Array.from(this.$items.values()).every(callbackfn, thisArg);
	        };
	        /**
	         * Determines whether the specified callback function returns true for any element of an array.
	         * @param callbackfn A function that accepts up to three arguments. The some method calls
	         * the callbackfn function for each element in the array until the callbackfn returns a value
	         * which is coercible to the Boolean value true, or until the end of the array.
	         * @param thisArg An object to which the this keyword can refer in the callbackfn function.
	         * If thisArg is omitted, undefined is used as the this value.
	         */
	        ArraySchema.prototype.some = function (callbackfn, thisArg) {
	            return Array.from(this.$items.values()).some(callbackfn, thisArg);
	        };
	        /**
	         * Performs the specified action for each element in an array.
	         * @param callbackfn  A function that accepts up to three arguments. forEach calls the callbackfn function one time for each element in the array.
	         * @param thisArg  An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	         */
	        ArraySchema.prototype.forEach = function (callbackfn, thisArg) {
	            Array.from(this.$items.values()).forEach(callbackfn, thisArg);
	        };
	        /**
	         * Calls a defined callback function on each element of an array, and returns an array that contains the results.
	         * @param callbackfn A function that accepts up to three arguments. The map method calls the callbackfn function one time for each element in the array.
	         * @param thisArg An object to which the this keyword can refer in the callbackfn function. If thisArg is omitted, undefined is used as the this value.
	         */
	        ArraySchema.prototype.map = function (callbackfn, thisArg) {
	            return Array.from(this.$items.values()).map(callbackfn, thisArg);
	        };
	        ArraySchema.prototype.filter = function (callbackfn, thisArg) {
	            return Array.from(this.$items.values()).filter(callbackfn, thisArg);
	        };
	        /**
	         * Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	         * @param callbackfn A function that accepts up to four arguments. The reduce method calls the callbackfn function one time for each element in the array.
	         * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	         */
	        ArraySchema.prototype.reduce = function (callbackfn, initialValue) {
	            return Array.prototype.reduce.apply(Array.from(this.$items.values()), arguments);
	        };
	        /**
	         * Calls the specified callback function for all the elements in an array, in descending order. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function.
	         * @param callbackfn A function that accepts up to four arguments. The reduceRight method calls the callbackfn function one time for each element in the array.
	         * @param initialValue If initialValue is specified, it is used as the initial value to start the accumulation. The first call to the callbackfn function provides this value as an argument instead of an array value.
	         */
	        ArraySchema.prototype.reduceRight = function (callbackfn, initialValue) {
	            return Array.prototype.reduceRight.apply(Array.from(this.$items.values()), arguments);
	        };
	        /**
	         * Returns the value of the first element in the array where predicate is true, and undefined
	         * otherwise.
	         * @param predicate find calls predicate once for each element of the array, in ascending
	         * order, until it finds one where predicate returns true. If such an element is found, find
	         * immediately returns that element value. Otherwise, find returns undefined.
	         * @param thisArg If provided, it will be used as the this value for each invocation of
	         * predicate. If it is not provided, undefined is used instead.
	         */
	        ArraySchema.prototype.find = function (predicate, thisArg) {
	            return Array.from(this.$items.values()).find(predicate, thisArg);
	        };
	        /**
	         * Returns the index of the first element in the array where predicate is true, and -1
	         * otherwise.
	         * @param predicate find calls predicate once for each element of the array, in ascending
	         * order, until it finds one where predicate returns true. If such an element is found,
	         * findIndex immediately returns that element index. Otherwise, findIndex returns -1.
	         * @param thisArg If provided, it will be used as the this value for each invocation of
	         * predicate. If it is not provided, undefined is used instead.
	         */
	        ArraySchema.prototype.findIndex = function (predicate, thisArg) {
	            return Array.from(this.$items.values()).findIndex(predicate, thisArg);
	        };
	        /**
	         * Returns the this object after filling the section identified by start and end with value
	         * @param value value to fill array section with
	         * @param start index to start filling the array at. If start is negative, it is treated as
	         * length+start where length is the length of the array.
	         * @param end index to stop filling the array at. If end is negative, it is treated as
	         * length+end.
	         */
	        ArraySchema.prototype.fill = function (value, start, end) {
	            //
	            // TODO
	            //
	            throw new Error("ArraySchema#fill() not implemented");
	        };
	        /**
	         * Returns the this object after copying a section of the array identified by start and end
	         * to the same array starting at position target
	         * @param target If target is negative, it is treated as length+target where length is the
	         * length of the array.
	         * @param start If start is negative, it is treated as length+start. If end is negative, it
	         * is treated as length+end.
	         * @param end If not specified, length of the this object is used as its default value.
	         */
	        ArraySchema.prototype.copyWithin = function (target, start, end) {
	            //
	            // TODO
	            //
	            throw new Error("ArraySchema#copyWithin() not implemented");
	        };
	        /**
	         * Returns a string representation of an array.
	         */
	        ArraySchema.prototype.toString = function () { return this.$items.toString(); };
	        /**
	         * Returns a string representation of an array. The elements are converted to string using their toLocalString methods.
	         */
	        ArraySchema.prototype.toLocaleString = function () { return this.$items.toLocaleString(); };
	        /** Iterator */
	        ArraySchema.prototype[Symbol.iterator] = function () {
	            return Array.from(this.$items.values())[Symbol.iterator]();
	        };
	        Object.defineProperty(ArraySchema, Symbol.species, {
	            get: function () {
	                return ArraySchema;
	            },
	            enumerable: false,
	            configurable: true
	        });
	        /**
	         * Returns an iterable of key, value pairs for every entry in the array
	         */
	        ArraySchema.prototype.entries = function () { return this.$items.entries(); };
	        /**
	         * Returns an iterable of keys in the array
	         */
	        ArraySchema.prototype.keys = function () { return this.$items.keys(); };
	        /**
	         * Returns an iterable of values in the array
	         */
	        ArraySchema.prototype.values = function () { return this.$items.values(); };
	        /**
	         * Determines whether an array includes a certain element, returning true or false as appropriate.
	         * @param searchElement The element to search for.
	         * @param fromIndex The position in this array at which to begin searching for searchElement.
	         */
	        ArraySchema.prototype.includes = function (searchElement, fromIndex) {
	            return Array.from(this.$items.values()).includes(searchElement, fromIndex);
	        };
	        //
	        // ES2022
	        //
	        /**
	         * Calls a defined callback function on each element of an array. Then, flattens the result into
	         * a new array.
	         * This is identical to a map followed by flat with depth 1.
	         *
	         * @param callback A function that accepts up to three arguments. The flatMap method calls the
	         * callback function one time for each element in the array.
	         * @param thisArg An object to which the this keyword can refer in the callback function. If
	         * thisArg is omitted, undefined is used as the this value.
	         */
	        // @ts-ignore
	        ArraySchema.prototype.flatMap = function (callback, thisArg) {
	            // @ts-ignore
	            throw new Error("ArraySchema#flatMap() is not supported.");
	        };
	        /**
	         * Returns a new array with all sub-array elements concatenated into it recursively up to the
	         * specified depth.
	         *
	         * @param depth The maximum recursion depth
	         */
	        // @ts-ignore
	        ArraySchema.prototype.flat = function (depth) {
	            throw new Error("ArraySchema#flat() is not supported.");
	        };
	        ArraySchema.prototype.findLast = function () {
	            var arr = Array.from(this.$items.values());
	            // @ts-ignore
	            return arr.findLast.apply(arr, arguments);
	        };
	        ArraySchema.prototype.findLastIndex = function () {
	            var arr = Array.from(this.$items.values());
	            // @ts-ignore
	            return arr.findLastIndex.apply(arr, arguments);
	        };
	        //
	        // ES2023
	        //
	        ArraySchema.prototype.with = function (index, value) {
	            var copy = Array.from(this.$items.values());
	            copy[index] = value;
	            return new (ArraySchema.bind.apply(ArraySchema, __spreadArray([void 0], copy, false)))();
	        };
	        ArraySchema.prototype.toReversed = function () {
	            return Array.from(this.$items.values()).reverse();
	        };
	        ArraySchema.prototype.toSorted = function (compareFn) {
	            return Array.from(this.$items.values()).sort(compareFn);
	        };
	        // @ts-ignore
	        ArraySchema.prototype.toSpliced = function (start, deleteCount) {
	            var copy = Array.from(this.$items.values());
	            // @ts-ignore
	            return copy.toSpliced.apply(copy, arguments);
	        };
	        ArraySchema.prototype.setIndex = function (index, key) {
	            this.$indexes.set(index, key);
	        };
	        ArraySchema.prototype.getIndex = function (index) {
	            return this.$indexes.get(index);
	        };
	        ArraySchema.prototype.getByIndex = function (index) {
	            return this.$items.get(this.$indexes.get(index));
	        };
	        ArraySchema.prototype.deleteByIndex = function (index) {
	            var key = this.$indexes.get(index);
	            this.$items.delete(key);
	            this.$indexes.delete(index);
	        };
	        ArraySchema.prototype.toArray = function () {
	            return Array.from(this.$items.values());
	        };
	        ArraySchema.prototype.toJSON = function () {
	            return this.toArray().map(function (value) {
	                return (typeof (value['toJSON']) === "function")
	                    ? value['toJSON']()
	                    : value;
	            });
	        };
	        //
	        // Decoding utilities
	        //
	        ArraySchema.prototype.clone = function (isDecoding) {
	            var cloned;
	            if (isDecoding) {
	                cloned = new (ArraySchema.bind.apply(ArraySchema, __spreadArray([void 0], Array.from(this.$items.values()), false)))();
	            }
	            else {
	                cloned = new (ArraySchema.bind.apply(ArraySchema, __spreadArray([void 0], this.map(function (item) { return ((item['$changes'])
	                    ? item.clone()
	                    : item); }), false)))();
	            }
	            return cloned;
	        };
	        return ArraySchema;
	    }());

	    function getMapProxy(value) {
	        value['$proxy'] = true;
	        value = new Proxy(value, {
	            get: function (obj, prop) {
	                if (typeof (prop) !== "symbol" && // accessing properties
	                    typeof (obj[prop]) === "undefined") {
	                    return obj.get(prop);
	                }
	                else {
	                    return obj[prop];
	                }
	            },
	            set: function (obj, prop, setValue) {
	                if (typeof (prop) !== "symbol" &&
	                    (prop.indexOf("$") === -1 &&
	                        prop !== "onAdd" &&
	                        prop !== "onRemove" &&
	                        prop !== "onChange")) {
	                    obj.set(prop, setValue);
	                }
	                else {
	                    obj[prop] = setValue;
	                }
	                return true;
	            },
	            deleteProperty: function (obj, prop) {
	                obj.delete(prop);
	                return true;
	            },
	        });
	        return value;
	    }
	    var MapSchema = /** @class */ (function () {
	        function MapSchema(initialValues) {
	            var _this = this;
	            this.$changes = new ChangeTree(this);
	            this.$items = new Map();
	            this.$indexes = new Map();
	            this.$refId = 0;
	            if (initialValues) {
	                if (initialValues instanceof Map ||
	                    initialValues instanceof MapSchema) {
	                    initialValues.forEach(function (v, k) { return _this.set(k, v); });
	                }
	                else {
	                    for (var k in initialValues) {
	                        this.set(k, initialValues[k]);
	                    }
	                }
	            }
	        }
	        MapSchema.prototype.onAdd = function (callback, triggerAll) {
	            if (triggerAll === void 0) { triggerAll = true; }
	            return addCallback((this.$callbacks || (this.$callbacks = {})), exports.OPERATION.ADD, callback, (triggerAll)
	                ? this.$items
	                : undefined);
	        };
	        MapSchema.prototype.onRemove = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), exports.OPERATION.DELETE, callback); };
	        MapSchema.prototype.onChange = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = {}), exports.OPERATION.REPLACE, callback); };
	        MapSchema.is = function (type) {
	            return type['map'] !== undefined;
	        };
	        /** Iterator */
	        MapSchema.prototype[Symbol.iterator] = function () { return this.$items[Symbol.iterator](); };
	        Object.defineProperty(MapSchema.prototype, Symbol.toStringTag, {
	            get: function () { return this.$items[Symbol.toStringTag]; },
	            enumerable: false,
	            configurable: true
	        });
	        Object.defineProperty(MapSchema, Symbol.species, {
	            get: function () {
	                return MapSchema;
	            },
	            enumerable: false,
	            configurable: true
	        });
	        MapSchema.prototype.set = function (key, value) {
	            if (value === undefined || value === null) {
	                throw new Error("MapSchema#set('".concat(key, "', ").concat(value, "): trying to set ").concat(value, " value on '").concat(key, "'."));
	            }
	            // Force "key" as string
	            // See: https://github.com/colyseus/colyseus/issues/561#issuecomment-1646733468
	            key = key.toString();
	            // get "index" for this value.
	            var hasIndex = typeof (this.$changes.indexes[key]) !== "undefined";
	            var index = (hasIndex)
	                ? this.$changes.indexes[key]
	                : this.$refId++;
	            var operation = (hasIndex)
	                ? exports.OPERATION.REPLACE
	                : exports.OPERATION.ADD;
	            var isRef = (value['$changes']) !== undefined;
	            if (isRef) {
	                value['$changes'].setParent(this, this.$changes.root, index);
	            }
	            //
	            // (encoding)
	            // set a unique id to relate directly with this key/value.
	            //
	            if (!hasIndex) {
	                this.$changes.indexes[key] = index;
	                this.$indexes.set(index, key);
	            }
	            else if (!isRef &&
	                this.$items.get(key) === value) {
	                // if value is the same, avoid re-encoding it.
	                return;
	            }
	            else if (isRef && // if is schema, force ADD operation if value differ from previous one.
	                this.$items.get(key) !== value) {
	                operation = exports.OPERATION.ADD;
	            }
	            this.$items.set(key, value);
	            this.$changes.change(key, operation);
	            return this;
	        };
	        MapSchema.prototype.get = function (key) {
	            return this.$items.get(key);
	        };
	        MapSchema.prototype.delete = function (key) {
	            //
	            // TODO: add a "purge" method after .encode() runs, to cleanup removed `$indexes`
	            //
	            // We don't remove $indexes to allow setting the same key in the same patch
	            // (See "should allow to remove and set an item in the same place" test)
	            //
	            // // const index = this.$changes.indexes[key];
	            // // this.$indexes.delete(index);
	            this.$changes.delete(key.toString());
	            return this.$items.delete(key);
	        };
	        MapSchema.prototype.clear = function (changes) {
	            // discard previous operations.
	            this.$changes.discard(true, true);
	            this.$changes.indexes = {};
	            // clear previous indexes
	            this.$indexes.clear();
	            //
	            // When decoding:
	            // - enqueue items for DELETE callback.
	            // - flag child items for garbage collection.
	            //
	            if (changes) {
	                removeChildRefs.call(this, changes);
	            }
	            // clear items
	            this.$items.clear();
	            this.$changes.operation({ index: 0, op: exports.OPERATION.CLEAR });
	            // touch all structures until reach root
	            this.$changes.touchParents();
	        };
	        MapSchema.prototype.has = function (key) {
	            return this.$items.has(key);
	        };
	        MapSchema.prototype.forEach = function (callbackfn) {
	            this.$items.forEach(callbackfn);
	        };
	        MapSchema.prototype.entries = function () {
	            return this.$items.entries();
	        };
	        MapSchema.prototype.keys = function () {
	            return this.$items.keys();
	        };
	        MapSchema.prototype.values = function () {
	            return this.$items.values();
	        };
	        Object.defineProperty(MapSchema.prototype, "size", {
	            get: function () {
	                return this.$items.size;
	            },
	            enumerable: false,
	            configurable: true
	        });
	        MapSchema.prototype.setIndex = function (index, key) {
	            this.$indexes.set(index, key);
	        };
	        MapSchema.prototype.getIndex = function (index) {
	            return this.$indexes.get(index);
	        };
	        MapSchema.prototype.getByIndex = function (index) {
	            return this.$items.get(this.$indexes.get(index));
	        };
	        MapSchema.prototype.deleteByIndex = function (index) {
	            var key = this.$indexes.get(index);
	            this.$items.delete(key);
	            this.$indexes.delete(index);
	        };
	        MapSchema.prototype.toJSON = function () {
	            var map = {};
	            this.forEach(function (value, key) {
	                map[key] = (typeof (value['toJSON']) === "function")
	                    ? value['toJSON']()
	                    : value;
	            });
	            return map;
	        };
	        //
	        // Decoding utilities
	        //
	        MapSchema.prototype.clone = function (isDecoding) {
	            var cloned;
	            if (isDecoding) {
	                // client-side
	                cloned = Object.assign(new MapSchema(), this);
	            }
	            else {
	                // server-side
	                cloned = new MapSchema();
	                this.forEach(function (value, key) {
	                    if (value['$changes']) {
	                        cloned.set(key, value['clone']());
	                    }
	                    else {
	                        cloned.set(key, value);
	                    }
	                });
	            }
	            return cloned;
	        };
	        return MapSchema;
	    }());

	    var registeredTypes = {};
	    function registerType(identifier, definition) {
	        registeredTypes[identifier] = definition;
	    }
	    function getType(identifier) {
	        return registeredTypes[identifier];
	    }

	    var SchemaDefinition = /** @class */ (function () {
	        function SchemaDefinition() {
	            //
	            // TODO: use a "field" structure combining all these properties per-field.
	            //
	            this.indexes = {};
	            this.fieldsByIndex = {};
	            this.deprecated = {};
	            this.descriptors = {};
	        }
	        SchemaDefinition.create = function (parent) {
	            var definition = new SchemaDefinition();
	            // support inheritance
	            definition.schema = Object.assign({}, parent && parent.schema || {});
	            definition.indexes = Object.assign({}, parent && parent.indexes || {});
	            definition.fieldsByIndex = Object.assign({}, parent && parent.fieldsByIndex || {});
	            definition.descriptors = Object.assign({}, parent && parent.descriptors || {});
	            definition.deprecated = Object.assign({}, parent && parent.deprecated || {});
	            return definition;
	        };
	        SchemaDefinition.prototype.addField = function (field, type) {
	            var index = this.getNextFieldIndex();
	            this.fieldsByIndex[index] = field;
	            this.indexes[field] = index;
	            this.schema[field] = (Array.isArray(type))
	                ? { array: type[0] }
	                : type;
	        };
	        SchemaDefinition.prototype.hasField = function (field) {
	            return this.indexes[field] !== undefined;
	        };
	        SchemaDefinition.prototype.addFilter = function (field, cb) {
	            if (!this.filters) {
	                this.filters = {};
	                this.indexesWithFilters = [];
	            }
	            this.filters[this.indexes[field]] = cb;
	            this.indexesWithFilters.push(this.indexes[field]);
	            return true;
	        };
	        SchemaDefinition.prototype.addChildrenFilter = function (field, cb) {
	            var index = this.indexes[field];
	            var type = this.schema[field];
	            if (getType(Object.keys(type)[0])) {
	                if (!this.childFilters) {
	                    this.childFilters = {};
	                }
	                this.childFilters[index] = cb;
	                return true;
	            }
	            else {
	                console.warn("@filterChildren: field '".concat(field, "' can't have children. Ignoring filter."));
	            }
	        };
	        SchemaDefinition.prototype.getChildrenFilter = function (field) {
	            return this.childFilters && this.childFilters[this.indexes[field]];
	        };
	        SchemaDefinition.prototype.getNextFieldIndex = function () {
	            return Object.keys(this.schema || {}).length;
	        };
	        return SchemaDefinition;
	    }());
	    function hasFilter(klass) {
	        return klass._context && klass._context.useFilters;
	    }
	    var Context = /** @class */ (function () {
	        function Context() {
	            this.types = {};
	            this.schemas = new Map();
	            this.useFilters = false;
	        }
	        Context.prototype.has = function (schema) {
	            return this.schemas.has(schema);
	        };
	        Context.prototype.get = function (typeid) {
	            return this.types[typeid];
	        };
	        Context.prototype.add = function (schema, typeid) {
	            if (typeid === void 0) { typeid = this.schemas.size; }
	            // FIXME: move this to somewhere else?
	            // support inheritance
	            schema._definition = SchemaDefinition.create(schema._definition);
	            schema._typeid = typeid;
	            this.types[typeid] = schema;
	            this.schemas.set(schema, typeid);
	        };
	        Context.create = function (options) {
	            if (options === void 0) { options = {}; }
	            return function (definition) {
	                if (!options.context) {
	                    options.context = new Context();
	                }
	                return type(definition, options);
	            };
	        };
	        return Context;
	    }());
	    var globalContext = new Context();
	    /**
	     * [See documentation](https://docs.colyseus.io/state/schema/)
	     *
	     * Annotate a Schema property to be serializeable.
	     * \@type()'d fields are automatically flagged as "dirty" for the next patch.
	     *
	     * @example Standard usage, with automatic change tracking.
	     * ```
	     * \@type("string") propertyName: string;
	     * ```
	     *
	     * @example You can provide the "manual" option if you'd like to manually control your patches via .setDirty().
	     * ```
	     * \@type("string", { manual: true })
	     * ```
	     */
	    function type(type, options) {
	        if (options === void 0) { options = {}; }
	        return function (target, field) {
	            var context = options.context || globalContext;
	            var constructor = target.constructor;
	            constructor._context = context;
	            if (!type) {
	                throw new Error("".concat(constructor.name, ": @type() reference provided for \"").concat(field, "\" is undefined. Make sure you don't have any circular dependencies."));
	            }
	            /*
	             * static schema
	             */
	            if (!context.has(constructor)) {
	                context.add(constructor);
	            }
	            var definition = constructor._definition;
	            definition.addField(field, type);
	            /**
	             * skip if descriptor already exists for this field (`@deprecated()`)
	             */
	            if (definition.descriptors[field]) {
	                if (definition.deprecated[field]) {
	                    // do not create accessors for deprecated properties.
	                    return;
	                }
	                else {
	                    // trying to define same property multiple times across inheritance.
	                    // https://github.com/colyseus/colyseus-unity3d/issues/131#issuecomment-814308572
	                    try {
	                        throw new Error("@colyseus/schema: Duplicate '".concat(field, "' definition on '").concat(constructor.name, "'.\nCheck @type() annotation"));
	                    }
	                    catch (e) {
	                        var definitionAtLine = e.stack.split("\n")[4].trim();
	                        throw new Error("".concat(e.message, " ").concat(definitionAtLine));
	                    }
	                }
	            }
	            var isArray = ArraySchema.is(type);
	            var isMap = !isArray && MapSchema.is(type);
	            // TODO: refactor me.
	            // Allow abstract intermediary classes with no fields to be serialized
	            // (See "should support an inheritance with a Schema type without fields" test)
	            if (typeof (type) !== "string" && !Schema.is(type)) {
	                var childType = Object.values(type)[0];
	                if (typeof (childType) !== "string" && !context.has(childType)) {
	                    context.add(childType);
	                }
	            }
	            if (options.manual) {
	                // do not declare getter/setter descriptor
	                definition.descriptors[field] = {
	                    enumerable: true,
	                    configurable: true,
	                    writable: true,
	                };
	                return;
	            }
	            var fieldCached = "_".concat(field);
	            definition.descriptors[fieldCached] = {
	                enumerable: false,
	                configurable: false,
	                writable: true,
	            };
	            definition.descriptors[field] = {
	                get: function () {
	                    return this[fieldCached];
	                },
	                set: function (value) {
	                    /**
	                     * Create Proxy for array or map items
	                     */
	                    // skip if value is the same as cached.
	                    if (value === this[fieldCached]) {
	                        return;
	                    }
	                    if (value !== undefined &&
	                        value !== null) {
	                        // automaticallty transform Array into ArraySchema
	                        if (isArray && !(value instanceof ArraySchema)) {
	                            value = new (ArraySchema.bind.apply(ArraySchema, __spreadArray([void 0], value, false)))();
	                        }
	                        // automaticallty transform Map into MapSchema
	                        if (isMap && !(value instanceof MapSchema)) {
	                            value = new MapSchema(value);
	                        }
	                        // try to turn provided structure into a Proxy
	                        if (value['$proxy'] === undefined) {
	                            if (isMap) {
	                                value = getMapProxy(value);
	                            }
	                            else if (isArray) {
	                                value = getArrayProxy(value);
	                            }
	                        }
	                        // flag the change for encoding.
	                        this.$changes.change(field);
	                        //
	                        // call setParent() recursively for this and its child
	                        // structures.
	                        //
	                        if (value['$changes']) {
	                            value['$changes'].setParent(this, this.$changes.root, this._definition.indexes[field]);
	                        }
	                    }
	                    else if (this[fieldCached]) {
	                        //
	                        // Setting a field to `null` or `undefined` will delete it.
	                        //
	                        this.$changes.delete(field);
	                    }
	                    this[fieldCached] = value;
	                },
	                enumerable: true,
	                configurable: true
	            };
	        };
	    }
	    /**
	     * `@filter()` decorator for defining data filters per client
	     */
	    function filter(cb) {
	        return function (target, field) {
	            var constructor = target.constructor;
	            var definition = constructor._definition;
	            if (definition.addFilter(field, cb)) {
	                constructor._context.useFilters = true;
	            }
	        };
	    }
	    function filterChildren(cb) {
	        return function (target, field) {
	            var constructor = target.constructor;
	            var definition = constructor._definition;
	            if (definition.addChildrenFilter(field, cb)) {
	                constructor._context.useFilters = true;
	            }
	        };
	    }
	    /**
	     * `@deprecated()` flag a field as deprecated.
	     * The previous `@type()` annotation should remain along with this one.
	     */
	    function deprecated(throws) {
	        if (throws === void 0) { throws = true; }
	        return function (target, field) {
	            var constructor = target.constructor;
	            var definition = constructor._definition;
	            definition.deprecated[field] = true;
	            if (throws) {
	                definition.descriptors[field] = {
	                    get: function () { throw new Error("".concat(field, " is deprecated.")); },
	                    set: function (value) { },
	                    enumerable: false,
	                    configurable: true
	                };
	            }
	        };
	    }
	    function defineTypes(target, fields, options) {
	        if (options === void 0) { options = {}; }
	        if (!options.context) {
	            options.context = target._context || options.context || globalContext;
	        }
	        for (var field in fields) {
	            type(fields[field], options)(target.prototype, field);
	        }
	        return target;
	    }

	    /**
	     * Copyright (c) 2018 Endel Dreyer
	     * Copyright (c) 2014 Ion Drive Software Ltd.
	     *
	     * Permission is hereby granted, free of charge, to any person obtaining a copy
	     * of this software and associated documentation files (the "Software"), to deal
	     * in the Software without restriction, including without limitation the rights
	     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	     * copies of the Software, and to permit persons to whom the Software is
	     * furnished to do so, subject to the following conditions:
	     *
	     * The above copyright notice and this permission notice shall be included in all
	     * copies or substantial portions of the Software.
	     *
	     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	     * SOFTWARE
	     */
	    /**
	     * msgpack implementation highly based on notepack.io
	     * https://github.com/darrachequesne/notepack
	     */
	    function utf8Length(str) {
	        var c = 0, length = 0;
	        for (var i = 0, l = str.length; i < l; i++) {
	            c = str.charCodeAt(i);
	            if (c < 0x80) {
	                length += 1;
	            }
	            else if (c < 0x800) {
	                length += 2;
	            }
	            else if (c < 0xd800 || c >= 0xe000) {
	                length += 3;
	            }
	            else {
	                i++;
	                length += 4;
	            }
	        }
	        return length;
	    }
	    function utf8Write(view, offset, str) {
	        var c = 0;
	        for (var i = 0, l = str.length; i < l; i++) {
	            c = str.charCodeAt(i);
	            if (c < 0x80) {
	                view[offset++] = c;
	            }
	            else if (c < 0x800) {
	                view[offset++] = 0xc0 | (c >> 6);
	                view[offset++] = 0x80 | (c & 0x3f);
	            }
	            else if (c < 0xd800 || c >= 0xe000) {
	                view[offset++] = 0xe0 | (c >> 12);
	                view[offset++] = 0x80 | (c >> 6 & 0x3f);
	                view[offset++] = 0x80 | (c & 0x3f);
	            }
	            else {
	                i++;
	                c = 0x10000 + (((c & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
	                view[offset++] = 0xf0 | (c >> 18);
	                view[offset++] = 0x80 | (c >> 12 & 0x3f);
	                view[offset++] = 0x80 | (c >> 6 & 0x3f);
	                view[offset++] = 0x80 | (c & 0x3f);
	            }
	        }
	    }
	    function int8$1(bytes, value) {
	        bytes.push(value & 255);
	    }
	    function uint8$1(bytes, value) {
	        bytes.push(value & 255);
	    }
	    function int16$1(bytes, value) {
	        bytes.push(value & 255);
	        bytes.push((value >> 8) & 255);
	    }
	    function uint16$1(bytes, value) {
	        bytes.push(value & 255);
	        bytes.push((value >> 8) & 255);
	    }
	    function int32$1(bytes, value) {
	        bytes.push(value & 255);
	        bytes.push((value >> 8) & 255);
	        bytes.push((value >> 16) & 255);
	        bytes.push((value >> 24) & 255);
	    }
	    function uint32$1(bytes, value) {
	        var b4 = value >> 24;
	        var b3 = value >> 16;
	        var b2 = value >> 8;
	        var b1 = value;
	        bytes.push(b1 & 255);
	        bytes.push(b2 & 255);
	        bytes.push(b3 & 255);
	        bytes.push(b4 & 255);
	    }
	    function int64$1(bytes, value) {
	        var high = Math.floor(value / Math.pow(2, 32));
	        var low = value >>> 0;
	        uint32$1(bytes, low);
	        uint32$1(bytes, high);
	    }
	    function uint64$1(bytes, value) {
	        var high = (value / Math.pow(2, 32)) >> 0;
	        var low = value >>> 0;
	        uint32$1(bytes, low);
	        uint32$1(bytes, high);
	    }
	    function float32$1(bytes, value) {
	        writeFloat32(bytes, value);
	    }
	    function float64$1(bytes, value) {
	        writeFloat64(bytes, value);
	    }
	    var _int32$1 = new Int32Array(2);
	    var _float32$1 = new Float32Array(_int32$1.buffer);
	    var _float64$1 = new Float64Array(_int32$1.buffer);
	    function writeFloat32(bytes, value) {
	        _float32$1[0] = value;
	        int32$1(bytes, _int32$1[0]);
	    }
	    function writeFloat64(bytes, value) {
	        _float64$1[0] = value;
	        int32$1(bytes, _int32$1[0 ]);
	        int32$1(bytes, _int32$1[1 ]);
	    }
	    function boolean$1(bytes, value) {
	        return uint8$1(bytes, value ? 1 : 0);
	    }
	    function string$1(bytes, value) {
	        // encode `null` strings as empty.
	        if (!value) {
	            value = "";
	        }
	        var length = utf8Length(value);
	        var size = 0;
	        // fixstr
	        if (length < 0x20) {
	            bytes.push(length | 0xa0);
	            size = 1;
	        }
	        // str 8
	        else if (length < 0x100) {
	            bytes.push(0xd9);
	            uint8$1(bytes, length);
	            size = 2;
	        }
	        // str 16
	        else if (length < 0x10000) {
	            bytes.push(0xda);
	            uint16$1(bytes, length);
	            size = 3;
	        }
	        // str 32
	        else if (length < 0x100000000) {
	            bytes.push(0xdb);
	            uint32$1(bytes, length);
	            size = 5;
	        }
	        else {
	            throw new Error('String too long');
	        }
	        utf8Write(bytes, bytes.length, value);
	        return size + length;
	    }
	    function number$1(bytes, value) {
	        if (isNaN(value)) {
	            return number$1(bytes, 0);
	        }
	        else if (!isFinite(value)) {
	            return number$1(bytes, (value > 0) ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER);
	        }
	        else if (value !== (value | 0)) {
	            bytes.push(0xcb);
	            writeFloat64(bytes, value);
	            return 9;
	            // TODO: encode float 32?
	            // is it possible to differentiate between float32 / float64 here?
	            // // float 32
	            // bytes.push(0xca);
	            // writeFloat32(bytes, value);
	            // return 5;
	        }
	        if (value >= 0) {
	            // positive fixnum
	            if (value < 0x80) {
	                uint8$1(bytes, value);
	                return 1;
	            }
	            // uint 8
	            if (value < 0x100) {
	                bytes.push(0xcc);
	                uint8$1(bytes, value);
	                return 2;
	            }
	            // uint 16
	            if (value < 0x10000) {
	                bytes.push(0xcd);
	                uint16$1(bytes, value);
	                return 3;
	            }
	            // uint 32
	            if (value < 0x100000000) {
	                bytes.push(0xce);
	                uint32$1(bytes, value);
	                return 5;
	            }
	            // uint 64
	            bytes.push(0xcf);
	            uint64$1(bytes, value);
	            return 9;
	        }
	        else {
	            // negative fixnum
	            if (value >= -0x20) {
	                bytes.push(0xe0 | (value + 0x20));
	                return 1;
	            }
	            // int 8
	            if (value >= -0x80) {
	                bytes.push(0xd0);
	                int8$1(bytes, value);
	                return 2;
	            }
	            // int 16
	            if (value >= -0x8000) {
	                bytes.push(0xd1);
	                int16$1(bytes, value);
	                return 3;
	            }
	            // int 32
	            if (value >= -0x80000000) {
	                bytes.push(0xd2);
	                int32$1(bytes, value);
	                return 5;
	            }
	            // int 64
	            bytes.push(0xd3);
	            int64$1(bytes, value);
	            return 9;
	        }
	    }

	    var encode = /*#__PURE__*/Object.freeze({
	        __proto__: null,
	        boolean: boolean$1,
	        float32: float32$1,
	        float64: float64$1,
	        int16: int16$1,
	        int32: int32$1,
	        int64: int64$1,
	        int8: int8$1,
	        number: number$1,
	        string: string$1,
	        uint16: uint16$1,
	        uint32: uint32$1,
	        uint64: uint64$1,
	        uint8: uint8$1,
	        utf8Write: utf8Write,
	        writeFloat32: writeFloat32,
	        writeFloat64: writeFloat64
	    });

	    /**
	     * Copyright (c) 2018 Endel Dreyer
	     * Copyright (c) 2014 Ion Drive Software Ltd.
	     *
	     * Permission is hereby granted, free of charge, to any person obtaining a copy
	     * of this software and associated documentation files (the "Software"), to deal
	     * in the Software without restriction, including without limitation the rights
	     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	     * copies of the Software, and to permit persons to whom the Software is
	     * furnished to do so, subject to the following conditions:
	     *
	     * The above copyright notice and this permission notice shall be included in all
	     * copies or substantial portions of the Software.
	     *
	     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	     * SOFTWARE
	     */
	    function utf8Read(bytes, offset, length) {
	        var string = '', chr = 0;
	        for (var i = offset, end = offset + length; i < end; i++) {
	            var byte = bytes[i];
	            if ((byte & 0x80) === 0x00) {
	                string += String.fromCharCode(byte);
	                continue;
	            }
	            if ((byte & 0xe0) === 0xc0) {
	                string += String.fromCharCode(((byte & 0x1f) << 6) |
	                    (bytes[++i] & 0x3f));
	                continue;
	            }
	            if ((byte & 0xf0) === 0xe0) {
	                string += String.fromCharCode(((byte & 0x0f) << 12) |
	                    ((bytes[++i] & 0x3f) << 6) |
	                    ((bytes[++i] & 0x3f) << 0));
	                continue;
	            }
	            if ((byte & 0xf8) === 0xf0) {
	                chr = ((byte & 0x07) << 18) |
	                    ((bytes[++i] & 0x3f) << 12) |
	                    ((bytes[++i] & 0x3f) << 6) |
	                    ((bytes[++i] & 0x3f) << 0);
	                if (chr >= 0x010000) { // surrogate pair
	                    chr -= 0x010000;
	                    string += String.fromCharCode((chr >>> 10) + 0xD800, (chr & 0x3FF) + 0xDC00);
	                }
	                else {
	                    string += String.fromCharCode(chr);
	                }
	                continue;
	            }
	            console.error('Invalid byte ' + byte.toString(16));
	            // (do not throw error to avoid server/client from crashing due to hack attemps)
	            // throw new Error('Invalid byte ' + byte.toString(16));
	        }
	        return string;
	    }
	    function int8(bytes, it) {
	        return uint8(bytes, it) << 24 >> 24;
	    }
	    function uint8(bytes, it) {
	        return bytes[it.offset++];
	    }
	    function int16(bytes, it) {
	        return uint16(bytes, it) << 16 >> 16;
	    }
	    function uint16(bytes, it) {
	        return bytes[it.offset++] | bytes[it.offset++] << 8;
	    }
	    function int32(bytes, it) {
	        return bytes[it.offset++] | bytes[it.offset++] << 8 | bytes[it.offset++] << 16 | bytes[it.offset++] << 24;
	    }
	    function uint32(bytes, it) {
	        return int32(bytes, it) >>> 0;
	    }
	    function float32(bytes, it) {
	        return readFloat32(bytes, it);
	    }
	    function float64(bytes, it) {
	        return readFloat64(bytes, it);
	    }
	    function int64(bytes, it) {
	        var low = uint32(bytes, it);
	        var high = int32(bytes, it) * Math.pow(2, 32);
	        return high + low;
	    }
	    function uint64(bytes, it) {
	        var low = uint32(bytes, it);
	        var high = uint32(bytes, it) * Math.pow(2, 32);
	        return high + low;
	    }
	    var _int32 = new Int32Array(2);
	    var _float32 = new Float32Array(_int32.buffer);
	    var _float64 = new Float64Array(_int32.buffer);
	    function readFloat32(bytes, it) {
	        _int32[0] = int32(bytes, it);
	        return _float32[0];
	    }
	    function readFloat64(bytes, it) {
	        _int32[0 ] = int32(bytes, it);
	        _int32[1 ] = int32(bytes, it);
	        return _float64[0];
	    }
	    function boolean(bytes, it) {
	        return uint8(bytes, it) > 0;
	    }
	    function string(bytes, it) {
	        var prefix = bytes[it.offset++];
	        var length;
	        if (prefix < 0xc0) {
	            // fixstr
	            length = prefix & 0x1f;
	        }
	        else if (prefix === 0xd9) {
	            length = uint8(bytes, it);
	        }
	        else if (prefix === 0xda) {
	            length = uint16(bytes, it);
	        }
	        else if (prefix === 0xdb) {
	            length = uint32(bytes, it);
	        }
	        var value = utf8Read(bytes, it.offset, length);
	        it.offset += length;
	        return value;
	    }
	    function stringCheck(bytes, it) {
	        var prefix = bytes[it.offset];
	        return (
	        // fixstr
	        (prefix < 0xc0 && prefix > 0xa0) ||
	            // str 8
	            prefix === 0xd9 ||
	            // str 16
	            prefix === 0xda ||
	            // str 32
	            prefix === 0xdb);
	    }
	    function number(bytes, it) {
	        var prefix = bytes[it.offset++];
	        if (prefix < 0x80) {
	            // positive fixint
	            return prefix;
	        }
	        else if (prefix === 0xca) {
	            // float 32
	            return readFloat32(bytes, it);
	        }
	        else if (prefix === 0xcb) {
	            // float 64
	            return readFloat64(bytes, it);
	        }
	        else if (prefix === 0xcc) {
	            // uint 8
	            return uint8(bytes, it);
	        }
	        else if (prefix === 0xcd) {
	            // uint 16
	            return uint16(bytes, it);
	        }
	        else if (prefix === 0xce) {
	            // uint 32
	            return uint32(bytes, it);
	        }
	        else if (prefix === 0xcf) {
	            // uint 64
	            return uint64(bytes, it);
	        }
	        else if (prefix === 0xd0) {
	            // int 8
	            return int8(bytes, it);
	        }
	        else if (prefix === 0xd1) {
	            // int 16
	            return int16(bytes, it);
	        }
	        else if (prefix === 0xd2) {
	            // int 32
	            return int32(bytes, it);
	        }
	        else if (prefix === 0xd3) {
	            // int 64
	            return int64(bytes, it);
	        }
	        else if (prefix > 0xdf) {
	            // negative fixint
	            return (0xff - prefix + 1) * -1;
	        }
	    }
	    function numberCheck(bytes, it) {
	        var prefix = bytes[it.offset];
	        // positive fixint - 0x00 - 0x7f
	        // float 32        - 0xca
	        // float 64        - 0xcb
	        // uint 8          - 0xcc
	        // uint 16         - 0xcd
	        // uint 32         - 0xce
	        // uint 64         - 0xcf
	        // int 8           - 0xd0
	        // int 16          - 0xd1
	        // int 32          - 0xd2
	        // int 64          - 0xd3
	        return (prefix < 0x80 ||
	            (prefix >= 0xca && prefix <= 0xd3));
	    }
	    function arrayCheck(bytes, it) {
	        return bytes[it.offset] < 0xa0;
	        // const prefix = bytes[it.offset] ;
	        // if (prefix < 0xa0) {
	        //   return prefix;
	        // // array
	        // } else if (prefix === 0xdc) {
	        //   it.offset += 2;
	        // } else if (0xdd) {
	        //   it.offset += 4;
	        // }
	        // return prefix;
	    }
	    function switchStructureCheck(bytes, it) {
	        return (
	        // previous byte should be `SWITCH_TO_STRUCTURE`
	        bytes[it.offset - 1] === SWITCH_TO_STRUCTURE &&
	            // next byte should be a number
	            (bytes[it.offset] < 0x80 || (bytes[it.offset] >= 0xca && bytes[it.offset] <= 0xd3)));
	    }

	    var decode = /*#__PURE__*/Object.freeze({
	        __proto__: null,
	        arrayCheck: arrayCheck,
	        boolean: boolean,
	        float32: float32,
	        float64: float64,
	        int16: int16,
	        int32: int32,
	        int64: int64,
	        int8: int8,
	        number: number,
	        numberCheck: numberCheck,
	        readFloat32: readFloat32,
	        readFloat64: readFloat64,
	        string: string,
	        stringCheck: stringCheck,
	        switchStructureCheck: switchStructureCheck,
	        uint16: uint16,
	        uint32: uint32,
	        uint64: uint64,
	        uint8: uint8
	    });

	    var CollectionSchema = /** @class */ (function () {
	        function CollectionSchema(initialValues) {
	            var _this = this;
	            this.$changes = new ChangeTree(this);
	            this.$items = new Map();
	            this.$indexes = new Map();
	            this.$refId = 0;
	            if (initialValues) {
	                initialValues.forEach(function (v) { return _this.add(v); });
	            }
	        }
	        CollectionSchema.prototype.onAdd = function (callback, triggerAll) {
	            if (triggerAll === void 0) { triggerAll = true; }
	            return addCallback((this.$callbacks || (this.$callbacks = [])), exports.OPERATION.ADD, callback, (triggerAll)
	                ? this.$items
	                : undefined);
	        };
	        CollectionSchema.prototype.onRemove = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = []), exports.OPERATION.DELETE, callback); };
	        CollectionSchema.prototype.onChange = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = []), exports.OPERATION.REPLACE, callback); };
	        CollectionSchema.is = function (type) {
	            return type['collection'] !== undefined;
	        };
	        CollectionSchema.prototype.add = function (value) {
	            // set "index" for reference.
	            var index = this.$refId++;
	            var isRef = (value['$changes']) !== undefined;
	            if (isRef) {
	                value['$changes'].setParent(this, this.$changes.root, index);
	            }
	            this.$changes.indexes[index] = index;
	            this.$indexes.set(index, index);
	            this.$items.set(index, value);
	            this.$changes.change(index);
	            return index;
	        };
	        CollectionSchema.prototype.at = function (index) {
	            var key = Array.from(this.$items.keys())[index];
	            return this.$items.get(key);
	        };
	        CollectionSchema.prototype.entries = function () {
	            return this.$items.entries();
	        };
	        CollectionSchema.prototype.delete = function (item) {
	            var entries = this.$items.entries();
	            var index;
	            var entry;
	            while (entry = entries.next()) {
	                if (entry.done) {
	                    break;
	                }
	                if (item === entry.value[1]) {
	                    index = entry.value[0];
	                    break;
	                }
	            }
	            if (index === undefined) {
	                return false;
	            }
	            this.$changes.delete(index);
	            this.$indexes.delete(index);
	            return this.$items.delete(index);
	        };
	        CollectionSchema.prototype.clear = function (changes) {
	            // discard previous operations.
	            this.$changes.discard(true, true);
	            this.$changes.indexes = {};
	            // clear previous indexes
	            this.$indexes.clear();
	            //
	            // When decoding:
	            // - enqueue items for DELETE callback.
	            // - flag child items for garbage collection.
	            //
	            if (changes) {
	                removeChildRefs.call(this, changes);
	            }
	            // clear items
	            this.$items.clear();
	            this.$changes.operation({ index: 0, op: exports.OPERATION.CLEAR });
	            // touch all structures until reach root
	            this.$changes.touchParents();
	        };
	        CollectionSchema.prototype.has = function (value) {
	            return Array.from(this.$items.values()).some(function (v) { return v === value; });
	        };
	        CollectionSchema.prototype.forEach = function (callbackfn) {
	            var _this = this;
	            this.$items.forEach(function (value, key, _) { return callbackfn(value, key, _this); });
	        };
	        CollectionSchema.prototype.values = function () {
	            return this.$items.values();
	        };
	        Object.defineProperty(CollectionSchema.prototype, "size", {
	            get: function () {
	                return this.$items.size;
	            },
	            enumerable: false,
	            configurable: true
	        });
	        CollectionSchema.prototype.setIndex = function (index, key) {
	            this.$indexes.set(index, key);
	        };
	        CollectionSchema.prototype.getIndex = function (index) {
	            return this.$indexes.get(index);
	        };
	        CollectionSchema.prototype.getByIndex = function (index) {
	            return this.$items.get(this.$indexes.get(index));
	        };
	        CollectionSchema.prototype.deleteByIndex = function (index) {
	            var key = this.$indexes.get(index);
	            this.$items.delete(key);
	            this.$indexes.delete(index);
	        };
	        CollectionSchema.prototype.toArray = function () {
	            return Array.from(this.$items.values());
	        };
	        CollectionSchema.prototype.toJSON = function () {
	            var values = [];
	            this.forEach(function (value, key) {
	                values.push((typeof (value['toJSON']) === "function")
	                    ? value['toJSON']()
	                    : value);
	            });
	            return values;
	        };
	        //
	        // Decoding utilities
	        //
	        CollectionSchema.prototype.clone = function (isDecoding) {
	            var cloned;
	            if (isDecoding) {
	                // client-side
	                cloned = Object.assign(new CollectionSchema(), this);
	            }
	            else {
	                // server-side
	                cloned = new CollectionSchema();
	                this.forEach(function (value) {
	                    if (value['$changes']) {
	                        cloned.add(value['clone']());
	                    }
	                    else {
	                        cloned.add(value);
	                    }
	                });
	            }
	            return cloned;
	        };
	        return CollectionSchema;
	    }());

	    var SetSchema = /** @class */ (function () {
	        function SetSchema(initialValues) {
	            var _this = this;
	            this.$changes = new ChangeTree(this);
	            this.$items = new Map();
	            this.$indexes = new Map();
	            this.$refId = 0;
	            if (initialValues) {
	                initialValues.forEach(function (v) { return _this.add(v); });
	            }
	        }
	        SetSchema.prototype.onAdd = function (callback, triggerAll) {
	            if (triggerAll === void 0) { triggerAll = true; }
	            return addCallback((this.$callbacks || (this.$callbacks = [])), exports.OPERATION.ADD, callback, (triggerAll)
	                ? this.$items
	                : undefined);
	        };
	        SetSchema.prototype.onRemove = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = []), exports.OPERATION.DELETE, callback); };
	        SetSchema.prototype.onChange = function (callback) { return addCallback(this.$callbacks || (this.$callbacks = []), exports.OPERATION.REPLACE, callback); };
	        SetSchema.is = function (type) {
	            return type['set'] !== undefined;
	        };
	        SetSchema.prototype.add = function (value) {
	            var _a, _b;
	            // immediatelly return false if value already added.
	            if (this.has(value)) {
	                return false;
	            }
	            // set "index" for reference.
	            var index = this.$refId++;
	            if ((value['$changes']) !== undefined) {
	                value['$changes'].setParent(this, this.$changes.root, index);
	            }
	            var operation = (_b = (_a = this.$changes.indexes[index]) === null || _a === void 0 ? void 0 : _a.op) !== null && _b !== void 0 ? _b : exports.OPERATION.ADD;
	            this.$changes.indexes[index] = index;
	            this.$indexes.set(index, index);
	            this.$items.set(index, value);
	            this.$changes.change(index, operation);
	            return index;
	        };
	        SetSchema.prototype.entries = function () {
	            return this.$items.entries();
	        };
	        SetSchema.prototype.delete = function (item) {
	            var entries = this.$items.entries();
	            var index;
	            var entry;
	            while (entry = entries.next()) {
	                if (entry.done) {
	                    break;
	                }
	                if (item === entry.value[1]) {
	                    index = entry.value[0];
	                    break;
	                }
	            }
	            if (index === undefined) {
	                return false;
	            }
	            this.$changes.delete(index);
	            this.$indexes.delete(index);
	            return this.$items.delete(index);
	        };
	        SetSchema.prototype.clear = function (changes) {
	            // discard previous operations.
	            this.$changes.discard(true, true);
	            this.$changes.indexes = {};
	            // clear previous indexes
	            this.$indexes.clear();
	            //
	            // When decoding:
	            // - enqueue items for DELETE callback.
	            // - flag child items for garbage collection.
	            //
	            if (changes) {
	                removeChildRefs.call(this, changes);
	            }
	            // clear items
	            this.$items.clear();
	            this.$changes.operation({ index: 0, op: exports.OPERATION.CLEAR });
	            // touch all structures until reach root
	            this.$changes.touchParents();
	        };
	        SetSchema.prototype.has = function (value) {
	            var values = this.$items.values();
	            var has = false;
	            var entry;
	            while (entry = values.next()) {
	                if (entry.done) {
	                    break;
	                }
	                if (value === entry.value) {
	                    has = true;
	                    break;
	                }
	            }
	            return has;
	        };
	        SetSchema.prototype.forEach = function (callbackfn) {
	            var _this = this;
	            this.$items.forEach(function (value, key, _) { return callbackfn(value, key, _this); });
	        };
	        SetSchema.prototype.values = function () {
	            return this.$items.values();
	        };
	        Object.defineProperty(SetSchema.prototype, "size", {
	            get: function () {
	                return this.$items.size;
	            },
	            enumerable: false,
	            configurable: true
	        });
	        SetSchema.prototype.setIndex = function (index, key) {
	            this.$indexes.set(index, key);
	        };
	        SetSchema.prototype.getIndex = function (index) {
	            return this.$indexes.get(index);
	        };
	        SetSchema.prototype.getByIndex = function (index) {
	            return this.$items.get(this.$indexes.get(index));
	        };
	        SetSchema.prototype.deleteByIndex = function (index) {
	            var key = this.$indexes.get(index);
	            this.$items.delete(key);
	            this.$indexes.delete(index);
	        };
	        SetSchema.prototype.toArray = function () {
	            return Array.from(this.$items.values());
	        };
	        SetSchema.prototype.toJSON = function () {
	            var values = [];
	            this.forEach(function (value, key) {
	                values.push((typeof (value['toJSON']) === "function")
	                    ? value['toJSON']()
	                    : value);
	            });
	            return values;
	        };
	        //
	        // Decoding utilities
	        //
	        SetSchema.prototype.clone = function (isDecoding) {
	            var cloned;
	            if (isDecoding) {
	                // client-side
	                cloned = Object.assign(new SetSchema(), this);
	            }
	            else {
	                // server-side
	                cloned = new SetSchema();
	                this.forEach(function (value) {
	                    if (value['$changes']) {
	                        cloned.add(value['clone']());
	                    }
	                    else {
	                        cloned.add(value);
	                    }
	                });
	            }
	            return cloned;
	        };
	        return SetSchema;
	    }());

	    var ClientState = /** @class */ (function () {
	        function ClientState() {
	            this.refIds = new WeakSet();
	            this.containerIndexes = new WeakMap();
	        }
	        // containerIndexes = new Map<ChangeTree, Set<number>>();
	        ClientState.prototype.addRefId = function (changeTree) {
	            if (!this.refIds.has(changeTree)) {
	                this.refIds.add(changeTree);
	                this.containerIndexes.set(changeTree, new Set());
	            }
	        };
	        ClientState.get = function (client) {
	            if (client.$filterState === undefined) {
	                client.$filterState = new ClientState();
	            }
	            return client.$filterState;
	        };
	        return ClientState;
	    }());

	    var ReferenceTracker = /** @class */ (function () {
	        function ReferenceTracker() {
	            //
	            // Relation of refId => Schema structure
	            // For direct access of structures during decoding time.
	            //
	            this.refs = new Map();
	            this.refCounts = {};
	            this.deletedRefs = new Set();
	            this.nextUniqueId = 0;
	        }
	        ReferenceTracker.prototype.getNextUniqueId = function () {
	            return this.nextUniqueId++;
	        };
	        // for decoding
	        ReferenceTracker.prototype.addRef = function (refId, ref, incrementCount) {
	            if (incrementCount === void 0) { incrementCount = true; }
	            this.refs.set(refId, ref);
	            if (incrementCount) {
	                this.refCounts[refId] = (this.refCounts[refId] || 0) + 1;
	            }
	        };
	        // for decoding
	        ReferenceTracker.prototype.removeRef = function (refId) {
	            var refCount = this.refCounts[refId];
	            if (refCount === undefined) {
	                console.warn("trying to remove reference ".concat(refId, " that doesn't exist"));
	                return;
	            }
	            if (refCount === 0) {
	                console.warn("trying to remove reference ".concat(refId, " with 0 refCount"));
	                return;
	            }
	            this.refCounts[refId] = refCount - 1;
	            this.deletedRefs.add(refId);
	        };
	        ReferenceTracker.prototype.clearRefs = function () {
	            this.refs.clear();
	            this.deletedRefs.clear();
	            this.refCounts = {};
	        };
	        // for decoding
	        ReferenceTracker.prototype.garbageCollectDeletedRefs = function () {
	            var _this = this;
	            this.deletedRefs.forEach(function (refId) {
	                //
	                // Skip active references.
	                //
	                if (_this.refCounts[refId] > 0) {
	                    return;
	                }
	                var ref = _this.refs.get(refId);
	                //
	                // Ensure child schema instances have their references removed as well.
	                //
	                if (ref instanceof Schema) {
	                    for (var fieldName in ref['_definition'].schema) {
	                        if (typeof (ref['_definition'].schema[fieldName]) !== "string" &&
	                            ref[fieldName] &&
	                            ref[fieldName]['$changes']) {
	                            _this.removeRef(ref[fieldName]['$changes'].refId);
	                        }
	                    }
	                }
	                else {
	                    var definition = ref['$changes'].parent._definition;
	                    var type = definition.schema[definition.fieldsByIndex[ref['$changes'].parentIndex]];
	                    if (typeof (Object.values(type)[0]) === "function") {
	                        Array.from(ref.values())
	                            .forEach(function (child) { return _this.removeRef(child['$changes'].refId); });
	                    }
	                }
	                _this.refs.delete(refId);
	                delete _this.refCounts[refId];
	            });
	            // clear deleted refs.
	            this.deletedRefs.clear();
	        };
	        return ReferenceTracker;
	    }());

	    var EncodeSchemaError = /** @class */ (function (_super) {
	        __extends(EncodeSchemaError, _super);
	        function EncodeSchemaError() {
	            return _super !== null && _super.apply(this, arguments) || this;
	        }
	        return EncodeSchemaError;
	    }(Error));
	    function assertType(value, type, klass, field) {
	        var typeofTarget;
	        var allowNull = false;
	        switch (type) {
	            case "number":
	            case "int8":
	            case "uint8":
	            case "int16":
	            case "uint16":
	            case "int32":
	            case "uint32":
	            case "int64":
	            case "uint64":
	            case "float32":
	            case "float64":
	                typeofTarget = "number";
	                if (isNaN(value)) {
	                    console.log("trying to encode \"NaN\" in ".concat(klass.constructor.name, "#").concat(field));
	                }
	                break;
	            case "string":
	                typeofTarget = "string";
	                allowNull = true;
	                break;
	            case "boolean":
	                // boolean is always encoded as true/false based on truthiness
	                return;
	        }
	        if (typeof (value) !== typeofTarget && (!allowNull || (allowNull && value !== null))) {
	            var foundValue = "'".concat(JSON.stringify(value), "'").concat((value && value.constructor && " (".concat(value.constructor.name, ")")) || '');
	            throw new EncodeSchemaError("a '".concat(typeofTarget, "' was expected, but ").concat(foundValue, " was provided in ").concat(klass.constructor.name, "#").concat(field));
	        }
	    }
	    function assertInstanceType(value, type, klass, field) {
	        if (!(value instanceof type)) {
	            throw new EncodeSchemaError("a '".concat(type.name, "' was expected, but '").concat(value.constructor.name, "' was provided in ").concat(klass.constructor.name, "#").concat(field));
	        }
	    }
	    function encodePrimitiveType(type, bytes, value, klass, field) {
	        assertType(value, type, klass, field);
	        var encodeFunc = encode[type];
	        if (encodeFunc) {
	            encodeFunc(bytes, value);
	        }
	        else {
	            throw new EncodeSchemaError("a '".concat(type, "' was expected, but ").concat(value, " was provided in ").concat(klass.constructor.name, "#").concat(field));
	        }
	    }
	    function decodePrimitiveType(type, bytes, it) {
	        return decode[type](bytes, it);
	    }
	    /**
	     * Schema encoder / decoder
	     */
	    var Schema = /** @class */ (function () {
	        // allow inherited classes to have a constructor
	        function Schema() {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i] = arguments[_i];
	            }
	            // fix enumerability of fields for end-user
	            Object.defineProperties(this, {
	                $changes: {
	                    value: new ChangeTree(this, undefined, new ReferenceTracker()),
	                    enumerable: false,
	                    writable: true
	                },
	                // $listeners: {
	                //     value: undefined,
	                //     enumerable: false,
	                //     writable: true
	                // },
	                $callbacks: {
	                    value: undefined,
	                    enumerable: false,
	                    writable: true
	                },
	            });
	            var descriptors = this._definition.descriptors;
	            if (descriptors) {
	                Object.defineProperties(this, descriptors);
	            }
	            //
	            // Assign initial values
	            //
	            if (args[0]) {
	                this.assign(args[0]);
	            }
	        }
	        Schema.onError = function (e) {
	            console.error(e);
	        };
	        Schema.is = function (type) {
	            return (type['_definition'] &&
	                type['_definition'].schema !== undefined);
	        };
	        Schema.prototype.onChange = function (callback) {
	            return addCallback((this.$callbacks || (this.$callbacks = {})), exports.OPERATION.REPLACE, callback);
	        };
	        Schema.prototype.onRemove = function (callback) {
	            return addCallback((this.$callbacks || (this.$callbacks = {})), exports.OPERATION.DELETE, callback);
	        };
	        Schema.prototype.assign = function (props) {
	            Object.assign(this, props);
	            return this;
	        };
	        Object.defineProperty(Schema.prototype, "_definition", {
	            get: function () { return this.constructor._definition; },
	            enumerable: false,
	            configurable: true
	        });
	        /**
	         * (Server-side): Flag a property to be encoded for the next patch.
	         * @param instance Schema instance
	         * @param property string representing the property name, or number representing the index of the property.
	         * @param operation OPERATION to perform (detected automatically)
	         */
	        Schema.prototype.setDirty = function (property, operation) {
	            this.$changes.change(property, operation);
	        };
	        /**
	         * Client-side: listen for changes on property.
	         * @param prop the property name
	         * @param callback callback to be triggered on property change
	         * @param immediate trigger immediatelly if property has been already set.
	         */
	        Schema.prototype.listen = function (prop, callback, immediate) {
	            var _this = this;
	            if (immediate === void 0) { immediate = true; }
	            if (!this.$callbacks) {
	                this.$callbacks = {};
	            }
	            if (!this.$callbacks[prop]) {
	                this.$callbacks[prop] = [];
	            }
	            this.$callbacks[prop].push(callback);
	            if (immediate && this[prop] !== undefined) {
	                callback(this[prop], undefined);
	            }
	            // return un-register callback.
	            return function () { return spliceOne(_this.$callbacks[prop], _this.$callbacks[prop].indexOf(callback)); };
	        };
	        Schema.prototype.decode = function (bytes, it, ref) {
	            if (it === void 0) { it = { offset: 0 }; }
	            if (ref === void 0) { ref = this; }
	            var allChanges = [];
	            var $root = this.$changes.root;
	            var totalBytes = bytes.length;
	            var refId = 0;
	            $root.refs.set(refId, this);
	            while (it.offset < totalBytes) {
	                var byte = bytes[it.offset++];
	                if (byte == SWITCH_TO_STRUCTURE) {
	                    refId = number(bytes, it);
	                    var nextRef = $root.refs.get(refId);
	                    //
	                    // Trying to access a reference that haven't been decoded yet.
	                    //
	                    if (!nextRef) {
	                        throw new Error("\"refId\" not found: ".concat(refId));
	                    }
	                    ref = nextRef;
	                    continue;
	                }
	                var changeTree = ref['$changes'];
	                var isSchema = (ref['_definition'] !== undefined);
	                var operation = (isSchema)
	                    ? (byte >> 6) << 6 // "compressed" index + operation
	                    : byte; // "uncompressed" index + operation (array/map items)
	                if (operation === exports.OPERATION.CLEAR) {
	                    //
	                    // TODO: refactor me!
	                    // The `.clear()` method is calling `$root.removeRef(refId)` for
	                    // each item inside this collection
	                    //
	                    ref.clear(allChanges);
	                    continue;
	                }
	                var fieldIndex = (isSchema)
	                    ? byte % (operation || 255) // if "REPLACE" operation (0), use 255
	                    : number(bytes, it);
	                var fieldName = (isSchema)
	                    ? (ref['_definition'].fieldsByIndex[fieldIndex])
	                    : "";
	                var type = changeTree.getType(fieldIndex);
	                var value = void 0;
	                var previousValue = void 0;
	                var dynamicIndex = void 0;
	                if (!isSchema) {
	                    previousValue = ref['getByIndex'](fieldIndex);
	                    if ((operation & exports.OPERATION.ADD) === exports.OPERATION.ADD) { // ADD or DELETE_AND_ADD
	                        dynamicIndex = (ref instanceof MapSchema)
	                            ? string(bytes, it)
	                            : fieldIndex;
	                        ref['setIndex'](fieldIndex, dynamicIndex);
	                    }
	                    else {
	                        // here
	                        dynamicIndex = ref['getIndex'](fieldIndex);
	                    }
	                }
	                else {
	                    previousValue = ref["_".concat(fieldName)];
	                }
	                //
	                // Delete operations
	                //
	                if ((operation & exports.OPERATION.DELETE) === exports.OPERATION.DELETE) {
	                    if (operation !== exports.OPERATION.DELETE_AND_ADD) {
	                        ref['deleteByIndex'](fieldIndex);
	                    }
	                    // Flag `refId` for garbage collection.
	                    if (previousValue && previousValue['$changes']) {
	                        $root.removeRef(previousValue['$changes'].refId);
	                    }
	                    value = null;
	                }
	                if (fieldName === undefined) {
	                    console.warn("@colyseus/schema: definition mismatch");
	                    //
	                    // keep skipping next bytes until reaches a known structure
	                    // by local decoder.
	                    //
	                    var nextIterator = { offset: it.offset };
	                    while (it.offset < totalBytes) {
	                        if (switchStructureCheck(bytes, it)) {
	                            nextIterator.offset = it.offset + 1;
	                            if ($root.refs.has(number(bytes, nextIterator))) {
	                                break;
	                            }
	                        }
	                        it.offset++;
	                    }
	                    continue;
	                }
	                else if (operation === exports.OPERATION.DELETE) ;
	                else if (Schema.is(type)) {
	                    var refId_1 = number(bytes, it);
	                    value = $root.refs.get(refId_1);
	                    if (operation !== exports.OPERATION.REPLACE) {
	                        var childType = this.getSchemaType(bytes, it, type);
	                        if (!value) {
	                            value = this.createTypeInstance(childType);
	                            value.$changes.refId = refId_1;
	                            if (previousValue) {
	                                value.$callbacks = previousValue.$callbacks;
	                                // value.$listeners = previousValue.$listeners;
	                                if (previousValue['$changes'].refId &&
	                                    refId_1 !== previousValue['$changes'].refId) {
	                                    $root.removeRef(previousValue['$changes'].refId);
	                                }
	                            }
	                        }
	                        $root.addRef(refId_1, value, (value !== previousValue));
	                    }
	                }
	                else if (typeof (type) === "string") {
	                    //
	                    // primitive value (number, string, boolean, etc)
	                    //
	                    value = decodePrimitiveType(type, bytes, it);
	                }
	                else {
	                    var typeDef = getType(Object.keys(type)[0]);
	                    var refId_2 = number(bytes, it);
	                    var valueRef = ($root.refs.has(refId_2))
	                        ? previousValue || $root.refs.get(refId_2)
	                        : new typeDef.constructor();
	                    value = valueRef.clone(true);
	                    value.$changes.refId = refId_2;
	                    // preserve schema callbacks
	                    if (previousValue) {
	                        value['$callbacks'] = previousValue['$callbacks'];
	                        if (previousValue['$changes'].refId &&
	                            refId_2 !== previousValue['$changes'].refId) {
	                            $root.removeRef(previousValue['$changes'].refId);
	                            //
	                            // Trigger onRemove if structure has been replaced.
	                            //
	                            var entries = previousValue.entries();
	                            var iter = void 0;
	                            while ((iter = entries.next()) && !iter.done) {
	                                var _a = iter.value, key = _a[0], value_1 = _a[1];
	                                allChanges.push({
	                                    refId: refId_2,
	                                    op: exports.OPERATION.DELETE,
	                                    field: key,
	                                    value: undefined,
	                                    previousValue: value_1,
	                                });
	                            }
	                        }
	                    }
	                    $root.addRef(refId_2, value, (valueRef !== previousValue));
	                }
	                if (value !== null &&
	                    value !== undefined) {
	                    if (value['$changes']) {
	                        value['$changes'].setParent(changeTree.ref, changeTree.root, fieldIndex);
	                    }
	                    if (ref instanceof Schema) {
	                        ref[fieldName] = value;
	                        // ref[`_${fieldName}`] = value;
	                    }
	                    else if (ref instanceof MapSchema) {
	                        // const key = ref['$indexes'].get(field);
	                        var key = dynamicIndex;
	                        // ref.set(key, value);
	                        ref['$items'].set(key, value);
	                        ref['$changes'].allChanges.add(fieldIndex);
	                    }
	                    else if (ref instanceof ArraySchema) {
	                        // const key = ref['$indexes'][field];
	                        // console.log("SETTING FOR ArraySchema =>", { field, key, value });
	                        // ref[key] = value;
	                        ref.setAt(fieldIndex, value);
	                    }
	                    else if (ref instanceof CollectionSchema) {
	                        var index = ref.add(value);
	                        ref['setIndex'](fieldIndex, index);
	                    }
	                    else if (ref instanceof SetSchema) {
	                        var index = ref.add(value);
	                        if (index !== false) {
	                            ref['setIndex'](fieldIndex, index);
	                        }
	                    }
	                }
	                if (previousValue !== value) {
	                    allChanges.push({
	                        refId: refId,
	                        op: operation,
	                        field: fieldName,
	                        dynamicIndex: dynamicIndex,
	                        value: value,
	                        previousValue: previousValue,
	                    });
	                }
	            }
	            this._triggerChanges(allChanges);
	            // drop references of unused schemas
	            $root.garbageCollectDeletedRefs();
	            return allChanges;
	        };
	        Schema.prototype.encode = function (encodeAll, bytes, useFilters) {
	            if (encodeAll === void 0) { encodeAll = false; }
	            if (bytes === void 0) { bytes = []; }
	            if (useFilters === void 0) { useFilters = false; }
	            var rootChangeTree = this.$changes;
	            var refIdsVisited = new WeakSet();
	            var changeTrees = [rootChangeTree];
	            var numChangeTrees = 1;
	            for (var i = 0; i < numChangeTrees; i++) {
	                var changeTree = changeTrees[i];
	                var ref = changeTree.ref;
	                var isSchema = (ref instanceof Schema);
	                // Generate unique refId for the ChangeTree.
	                changeTree.ensureRefId();
	                // mark this ChangeTree as visited.
	                refIdsVisited.add(changeTree);
	                // root `refId` is skipped.
	                if (changeTree !== rootChangeTree &&
	                    (changeTree.changed || encodeAll)) {
	                    uint8$1(bytes, SWITCH_TO_STRUCTURE);
	                    number$1(bytes, changeTree.refId);
	                }
	                var changes = (encodeAll)
	                    ? Array.from(changeTree.allChanges)
	                    : Array.from(changeTree.changes.values());
	                for (var j = 0, cl = changes.length; j < cl; j++) {
	                    var operation = (encodeAll)
	                        ? { op: exports.OPERATION.ADD, index: changes[j] }
	                        : changes[j];
	                    var fieldIndex = operation.index;
	                    var field = (isSchema)
	                        ? ref['_definition'].fieldsByIndex && ref['_definition'].fieldsByIndex[fieldIndex]
	                        : fieldIndex;
	                    // cache begin index if `useFilters`
	                    var beginIndex = bytes.length;
	                    // encode field index + operation
	                    if (operation.op !== exports.OPERATION.TOUCH) {
	                        if (isSchema) {
	                            //
	                            // Compress `fieldIndex` + `operation` into a single byte.
	                            // This adds a limitaion of 64 fields per Schema structure
	                            //
	                            uint8$1(bytes, (fieldIndex | operation.op));
	                        }
	                        else {
	                            uint8$1(bytes, operation.op);
	                            // custom operations
	                            if (operation.op === exports.OPERATION.CLEAR) {
	                                continue;
	                            }
	                            // indexed operations
	                            number$1(bytes, fieldIndex);
	                        }
	                    }
	                    //
	                    // encode "alias" for dynamic fields (maps)
	                    //
	                    if (!isSchema &&
	                        (operation.op & exports.OPERATION.ADD) == exports.OPERATION.ADD // ADD or DELETE_AND_ADD
	                    ) {
	                        if (ref instanceof MapSchema) {
	                            //
	                            // MapSchema dynamic key
	                            //
	                            var dynamicIndex = changeTree.ref['$indexes'].get(fieldIndex);
	                            string$1(bytes, dynamicIndex);
	                        }
	                    }
	                    if (operation.op === exports.OPERATION.DELETE) {
	                        //
	                        // TODO: delete from filter cache data.
	                        //
	                        // if (useFilters) {
	                        //     delete changeTree.caches[fieldIndex];
	                        // }
	                        continue;
	                    }
	                    // const type = changeTree.childType || ref._schema[field];
	                    var type = changeTree.getType(fieldIndex);
	                    // const type = changeTree.getType(fieldIndex);
	                    var value = changeTree.getValue(fieldIndex);
	                    // Enqueue ChangeTree to be visited
	                    if (value &&
	                        value['$changes'] &&
	                        !refIdsVisited.has(value['$changes'])) {
	                        changeTrees.push(value['$changes']);
	                        value['$changes'].ensureRefId();
	                        numChangeTrees++;
	                    }
	                    if (operation.op === exports.OPERATION.TOUCH) {
	                        continue;
	                    }
	                    if (Schema.is(type)) {
	                        assertInstanceType(value, type, ref, field);
	                        //
	                        // Encode refId for this instance.
	                        // The actual instance is going to be encoded on next `changeTree` iteration.
	                        //
	                        number$1(bytes, value.$changes.refId);
	                        // Try to encode inherited TYPE_ID if it's an ADD operation.
	                        if ((operation.op & exports.OPERATION.ADD) === exports.OPERATION.ADD) {
	                            this.tryEncodeTypeId(bytes, type, value.constructor);
	                        }
	                    }
	                    else if (typeof (type) === "string") {
	                        //
	                        // Primitive values
	                        //
	                        encodePrimitiveType(type, bytes, value, ref, field);
	                    }
	                    else {
	                        //
	                        // Custom type (MapSchema, ArraySchema, etc)
	                        //
	                        var definition = getType(Object.keys(type)[0]);
	                        //
	                        // ensure a ArraySchema has been provided
	                        //
	                        assertInstanceType(ref["_".concat(field)], definition.constructor, ref, field);
	                        //
	                        // Encode refId for this instance.
	                        // The actual instance is going to be encoded on next `changeTree` iteration.
	                        //
	                        number$1(bytes, value.$changes.refId);
	                    }
	                    if (useFilters) {
	                        // cache begin / end index
	                        changeTree.cache(fieldIndex, bytes.slice(beginIndex));
	                    }
	                }
	                if (!encodeAll && !useFilters) {
	                    changeTree.discard();
	                }
	            }
	            return bytes;
	        };
	        Schema.prototype.encodeAll = function (useFilters) {
	            return this.encode(true, [], useFilters);
	        };
	        Schema.prototype.applyFilters = function (client, encodeAll) {
	            var _a, _b;
	            if (encodeAll === void 0) { encodeAll = false; }
	            var root = this;
	            var refIdsDissallowed = new Set();
	            var $filterState = ClientState.get(client);
	            var changeTrees = [this.$changes];
	            var numChangeTrees = 1;
	            var filteredBytes = [];
	            var _loop_1 = function (i) {
	                var changeTree = changeTrees[i];
	                if (refIdsDissallowed.has(changeTree.refId)) {
	                    return "continue";
	                }
	                var ref = changeTree.ref;
	                var isSchema = ref instanceof Schema;
	                uint8$1(filteredBytes, SWITCH_TO_STRUCTURE);
	                number$1(filteredBytes, changeTree.refId);
	                var clientHasRefId = $filterState.refIds.has(changeTree);
	                var isEncodeAll = (encodeAll || !clientHasRefId);
	                // console.log("REF:", ref.constructor.name);
	                // console.log("Encode all?", isEncodeAll);
	                //
	                // include `changeTree` on list of known refIds by this client.
	                //
	                $filterState.addRefId(changeTree);
	                var containerIndexes = $filterState.containerIndexes.get(changeTree);
	                var changes = (isEncodeAll)
	                    ? Array.from(changeTree.allChanges)
	                    : Array.from(changeTree.changes.values());
	                //
	                // WORKAROUND: tries to re-evaluate previously not included @filter() attributes
	                // - see "DELETE a field of Schema" test case.
	                //
	                if (!encodeAll &&
	                    isSchema &&
	                    ref._definition.indexesWithFilters) {
	                    var indexesWithFilters = ref._definition.indexesWithFilters;
	                    indexesWithFilters.forEach(function (indexWithFilter) {
	                        if (!containerIndexes.has(indexWithFilter) &&
	                            changeTree.allChanges.has(indexWithFilter)) {
	                            if (isEncodeAll) {
	                                changes.push(indexWithFilter);
	                            }
	                            else {
	                                changes.push({ op: exports.OPERATION.ADD, index: indexWithFilter, });
	                            }
	                        }
	                    });
	                }
	                for (var j = 0, cl = changes.length; j < cl; j++) {
	                    var change = (isEncodeAll)
	                        ? { op: exports.OPERATION.ADD, index: changes[j] }
	                        : changes[j];
	                    // custom operations
	                    if (change.op === exports.OPERATION.CLEAR) {
	                        uint8$1(filteredBytes, change.op);
	                        continue;
	                    }
	                    var fieldIndex = change.index;
	                    //
	                    // Deleting fields: encode the operation + field index
	                    //
	                    if (change.op === exports.OPERATION.DELETE) {
	                        //
	                        // DELETE operations also need to go through filtering.
	                        //
	                        // TODO: cache the previous value so we can access the value (primitive or `refId`)
	                        // (check against `$filterState.refIds`)
	                        //
	                        if (isSchema) {
	                            uint8$1(filteredBytes, change.op | fieldIndex);
	                        }
	                        else {
	                            uint8$1(filteredBytes, change.op);
	                            number$1(filteredBytes, fieldIndex);
	                        }
	                        continue;
	                    }
	                    // indexed operation
	                    var value = changeTree.getValue(fieldIndex);
	                    var type = changeTree.getType(fieldIndex);
	                    if (isSchema) {
	                        // Is a Schema!
	                        var filter = (ref._definition.filters &&
	                            ref._definition.filters[fieldIndex]);
	                        if (filter && !filter.call(ref, client, value, root)) {
	                            if (value && value['$changes']) {
	                                refIdsDissallowed.add(value['$changes'].refId);
	                            }
	                            continue;
	                        }
	                    }
	                    else {
	                        // Is a collection! (map, array, etc.)
	                        var parent = changeTree.parent;
	                        var filter = changeTree.getChildrenFilter();
	                        if (filter && !filter.call(parent, client, ref['$indexes'].get(fieldIndex), value, root)) {
	                            if (value && value['$changes']) {
	                                refIdsDissallowed.add(value['$changes'].refId);
	                            }
	                            continue;
	                        }
	                    }
	                    // visit child ChangeTree on further iteration.
	                    if (value['$changes']) {
	                        changeTrees.push(value['$changes']);
	                        numChangeTrees++;
	                    }
	                    //
	                    // Copy cached bytes
	                    //
	                    if (change.op !== exports.OPERATION.TOUCH) {
	                        //
	                        // TODO: refactor me!
	                        //
	                        if (change.op === exports.OPERATION.ADD || isSchema) {
	                            //
	                            // use cached bytes directly if is from Schema type.
	                            //
	                            filteredBytes.push.apply(filteredBytes, (_a = changeTree.caches[fieldIndex]) !== null && _a !== void 0 ? _a : []);
	                            containerIndexes.add(fieldIndex);
	                        }
	                        else {
	                            if (containerIndexes.has(fieldIndex)) {
	                                //
	                                // use cached bytes if already has the field
	                                //
	                                filteredBytes.push.apply(filteredBytes, (_b = changeTree.caches[fieldIndex]) !== null && _b !== void 0 ? _b : []);
	                            }
	                            else {
	                                //
	                                // force ADD operation if field is not known by this client.
	                                //
	                                containerIndexes.add(fieldIndex);
	                                uint8$1(filteredBytes, exports.OPERATION.ADD);
	                                number$1(filteredBytes, fieldIndex);
	                                if (ref instanceof MapSchema) {
	                                    //
	                                    // MapSchema dynamic key
	                                    //
	                                    var dynamicIndex = changeTree.ref['$indexes'].get(fieldIndex);
	                                    string$1(filteredBytes, dynamicIndex);
	                                }
	                                if (value['$changes']) {
	                                    number$1(filteredBytes, value['$changes'].refId);
	                                }
	                                else {
	                                    // "encodePrimitiveType" without type checking.
	                                    // the type checking has been done on the first .encode() call.
	                                    encode[type](filteredBytes, value);
	                                }
	                            }
	                        }
	                    }
	                    else if (value['$changes'] && !isSchema) {
	                        //
	                        // TODO:
	                        // - track ADD/REPLACE/DELETE instances on `$filterState`
	                        // - do NOT always encode dynamicIndex for MapSchema.
	                        //   (If client already has that key, only the first index is necessary.)
	                        //
	                        uint8$1(filteredBytes, exports.OPERATION.ADD);
	                        number$1(filteredBytes, fieldIndex);
	                        if (ref instanceof MapSchema) {
	                            //
	                            // MapSchema dynamic key
	                            //
	                            var dynamicIndex = changeTree.ref['$indexes'].get(fieldIndex);
	                            string$1(filteredBytes, dynamicIndex);
	                        }
	                        number$1(filteredBytes, value['$changes'].refId);
	                    }
	                }
	            };
	            for (var i = 0; i < numChangeTrees; i++) {
	                _loop_1(i);
	            }
	            return filteredBytes;
	        };
	        Schema.prototype.clone = function () {
	            var _a;
	            var cloned = new (this.constructor);
	            var schema = this._definition.schema;
	            for (var field in schema) {
	                if (typeof (this[field]) === "object" &&
	                    typeof ((_a = this[field]) === null || _a === void 0 ? void 0 : _a.clone) === "function") {
	                    // deep clone
	                    cloned[field] = this[field].clone();
	                }
	                else {
	                    // primitive values
	                    cloned[field] = this[field];
	                }
	            }
	            return cloned;
	        };
	        Schema.prototype.toJSON = function () {
	            var schema = this._definition.schema;
	            var deprecated = this._definition.deprecated;
	            var obj = {};
	            for (var field in schema) {
	                if (!deprecated[field] && this[field] !== null && typeof (this[field]) !== "undefined") {
	                    obj[field] = (typeof (this[field]['toJSON']) === "function")
	                        ? this[field]['toJSON']()
	                        : this["_".concat(field)];
	                }
	            }
	            return obj;
	        };
	        Schema.prototype.discardAllChanges = function () {
	            this.$changes.discardAll();
	        };
	        Schema.prototype.getByIndex = function (index) {
	            return this[this._definition.fieldsByIndex[index]];
	        };
	        Schema.prototype.deleteByIndex = function (index) {
	            this[this._definition.fieldsByIndex[index]] = undefined;
	        };
	        Schema.prototype.tryEncodeTypeId = function (bytes, type, targetType) {
	            if (type._typeid !== targetType._typeid) {
	                uint8$1(bytes, TYPE_ID);
	                number$1(bytes, targetType._typeid);
	            }
	        };
	        Schema.prototype.getSchemaType = function (bytes, it, defaultType) {
	            var type;
	            if (bytes[it.offset] === TYPE_ID) {
	                it.offset++;
	                type = this.constructor._context.get(number(bytes, it));
	            }
	            return type || defaultType;
	        };
	        Schema.prototype.createTypeInstance = function (type) {
	            var instance = new type();
	            // assign root on $changes
	            instance.$changes.root = this.$changes.root;
	            return instance;
	        };
	        Schema.prototype._triggerChanges = function (changes) {
	            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
	            var uniqueRefIds = new Set();
	            var $refs = this.$changes.root.refs;
	            var _loop_2 = function (i) {
	                var change = changes[i];
	                var refId = change.refId;
	                var ref = $refs.get(refId);
	                var $callbacks = ref['$callbacks'];
	                //
	                // trigger onRemove on child structure.
	                //
	                if ((change.op & exports.OPERATION.DELETE) === exports.OPERATION.DELETE &&
	                    change.previousValue instanceof Schema) {
	                    (_b = (_a = change.previousValue['$callbacks']) === null || _a === void 0 ? void 0 : _a[exports.OPERATION.DELETE]) === null || _b === void 0 ? void 0 : _b.forEach(function (callback) { return callback(); });
	                }
	                // no callbacks defined, skip this structure!
	                if (!$callbacks) {
	                    return "continue";
	                }
	                if (ref instanceof Schema) {
	                    if (!uniqueRefIds.has(refId)) {
	                        try {
	                            // trigger onChange
	                            (_c = $callbacks === null || $callbacks === void 0 ? void 0 : $callbacks[exports.OPERATION.REPLACE]) === null || _c === void 0 ? void 0 : _c.forEach(function (callback) {
	                                return callback();
	                            });
	                        }
	                        catch (e) {
	                            Schema.onError(e);
	                        }
	                    }
	                    try {
	                        if ($callbacks.hasOwnProperty(change.field)) {
	                            (_d = $callbacks[change.field]) === null || _d === void 0 ? void 0 : _d.forEach(function (callback) {
	                                return callback(change.value, change.previousValue);
	                            });
	                        }
	                    }
	                    catch (e) {
	                        Schema.onError(e);
	                    }
	                }
	                else {
	                    // is a collection of items
	                    if (change.op === exports.OPERATION.ADD && change.previousValue === undefined) {
	                        // triger onAdd
	                        (_e = $callbacks[exports.OPERATION.ADD]) === null || _e === void 0 ? void 0 : _e.forEach(function (callback) { var _a; return callback(change.value, (_a = change.dynamicIndex) !== null && _a !== void 0 ? _a : change.field); });
	                    }
	                    else if (change.op === exports.OPERATION.DELETE) {
	                        //
	                        // FIXME: `previousValue` should always be available.
	                        // ADD + DELETE operations are still encoding DELETE operation.
	                        //
	                        if (change.previousValue !== undefined) {
	                            // triger onRemove
	                            (_f = $callbacks[exports.OPERATION.DELETE]) === null || _f === void 0 ? void 0 : _f.forEach(function (callback) { var _a; return callback(change.previousValue, (_a = change.dynamicIndex) !== null && _a !== void 0 ? _a : change.field); });
	                        }
	                    }
	                    else if (change.op === exports.OPERATION.DELETE_AND_ADD) {
	                        // triger onRemove
	                        if (change.previousValue !== undefined) {
	                            (_g = $callbacks[exports.OPERATION.DELETE]) === null || _g === void 0 ? void 0 : _g.forEach(function (callback) { var _a; return callback(change.previousValue, (_a = change.dynamicIndex) !== null && _a !== void 0 ? _a : change.field); });
	                        }
	                        // triger onAdd
	                        (_h = $callbacks[exports.OPERATION.ADD]) === null || _h === void 0 ? void 0 : _h.forEach(function (callback) { var _a; return callback(change.value, (_a = change.dynamicIndex) !== null && _a !== void 0 ? _a : change.field); });
	                    }
	                    // trigger onChange
	                    if (change.value !== change.previousValue) {
	                        (_j = $callbacks[exports.OPERATION.REPLACE]) === null || _j === void 0 ? void 0 : _j.forEach(function (callback) { var _a; return callback(change.value, (_a = change.dynamicIndex) !== null && _a !== void 0 ? _a : change.field); });
	                    }
	                }
	                uniqueRefIds.add(refId);
	            };
	            for (var i = 0; i < changes.length; i++) {
	                _loop_2(i);
	            }
	        };
	        Schema._definition = SchemaDefinition.create();
	        return Schema;
	    }());

	    function dumpChanges(schema) {
	        var changeTrees = [schema['$changes']];
	        var numChangeTrees = 1;
	        var dump = {};
	        var currentStructure = dump;
	        var _loop_1 = function (i) {
	            var changeTree = changeTrees[i];
	            changeTree.changes.forEach(function (change) {
	                var ref = changeTree.ref;
	                var fieldIndex = change.index;
	                var field = (ref['_definition'])
	                    ? ref['_definition'].fieldsByIndex[fieldIndex]
	                    : ref['$indexes'].get(fieldIndex);
	                currentStructure[field] = changeTree.getValue(fieldIndex);
	            });
	        };
	        for (var i = 0; i < numChangeTrees; i++) {
	            _loop_1(i);
	        }
	        return dump;
	    }

	    var reflectionContext = { context: new Context() };
	    /**
	     * Reflection
	     */
	    var ReflectionField = /** @class */ (function (_super) {
	        __extends(ReflectionField, _super);
	        function ReflectionField() {
	            return _super !== null && _super.apply(this, arguments) || this;
	        }
	        __decorate([
	            type("string", reflectionContext)
	        ], ReflectionField.prototype, "name", void 0);
	        __decorate([
	            type("string", reflectionContext)
	        ], ReflectionField.prototype, "type", void 0);
	        __decorate([
	            type("number", reflectionContext)
	        ], ReflectionField.prototype, "referencedType", void 0);
	        return ReflectionField;
	    }(Schema));
	    var ReflectionType = /** @class */ (function (_super) {
	        __extends(ReflectionType, _super);
	        function ReflectionType() {
	            var _this = _super !== null && _super.apply(this, arguments) || this;
	            _this.fields = new ArraySchema();
	            return _this;
	        }
	        __decorate([
	            type("number", reflectionContext)
	        ], ReflectionType.prototype, "id", void 0);
	        __decorate([
	            type([ReflectionField], reflectionContext)
	        ], ReflectionType.prototype, "fields", void 0);
	        return ReflectionType;
	    }(Schema));
	    var Reflection = /** @class */ (function (_super) {
	        __extends(Reflection, _super);
	        function Reflection() {
	            var _this = _super !== null && _super.apply(this, arguments) || this;
	            _this.types = new ArraySchema();
	            return _this;
	        }
	        Reflection.encode = function (instance) {
	            var _a;
	            var rootSchemaType = instance.constructor;
	            var reflection = new Reflection();
	            reflection.rootType = rootSchemaType._typeid;
	            var buildType = function (currentType, schema) {
	                for (var fieldName in schema) {
	                    var field = new ReflectionField();
	                    field.name = fieldName;
	                    var fieldType = void 0;
	                    if (typeof (schema[fieldName]) === "string") {
	                        fieldType = schema[fieldName];
	                    }
	                    else {
	                        var type_1 = schema[fieldName];
	                        var childTypeSchema = void 0;
	                        //
	                        // TODO: refactor below.
	                        //
	                        if (Schema.is(type_1)) {
	                            fieldType = "ref";
	                            childTypeSchema = schema[fieldName];
	                        }
	                        else {
	                            fieldType = Object.keys(type_1)[0];
	                            if (typeof (type_1[fieldType]) === "string") {
	                                fieldType += ":" + type_1[fieldType]; // array:string
	                            }
	                            else {
	                                childTypeSchema = type_1[fieldType];
	                            }
	                        }
	                        field.referencedType = (childTypeSchema)
	                            ? childTypeSchema._typeid
	                            : -1;
	                    }
	                    field.type = fieldType;
	                    currentType.fields.push(field);
	                }
	                reflection.types.push(currentType);
	            };
	            var types = (_a = rootSchemaType._context) === null || _a === void 0 ? void 0 : _a.types;
	            for (var typeid in types) {
	                var type_2 = new ReflectionType();
	                type_2.id = Number(typeid);
	                buildType(type_2, types[typeid]._definition.schema);
	            }
	            return reflection.encodeAll();
	        };
	        Reflection.decode = function (bytes, it) {
	            var context = new Context();
	            var reflection = new Reflection();
	            reflection.decode(bytes, it);
	            var schemaTypes = reflection.types.reduce(function (types, reflectionType) {
	                var schema = /** @class */ (function (_super) {
	                    __extends(_, _super);
	                    function _() {
	                        return _super !== null && _super.apply(this, arguments) || this;
	                    }
	                    return _;
	                }(Schema));
	                var typeid = reflectionType.id;
	                types[typeid] = schema;
	                context.add(schema, typeid);
	                return types;
	            }, {});
	            reflection.types.forEach(function (reflectionType) {
	                var schemaType = schemaTypes[reflectionType.id];
	                reflectionType.fields.forEach(function (field) {
	                    var _a;
	                    if (field.referencedType !== undefined) {
	                        var fieldType = field.type;
	                        var refType = schemaTypes[field.referencedType];
	                        // map or array of primitive type (-1)
	                        if (!refType) {
	                            var typeInfo = field.type.split(":");
	                            fieldType = typeInfo[0];
	                            refType = typeInfo[1];
	                        }
	                        if (fieldType === "ref") {
	                            type(refType, { context: context })(schemaType.prototype, field.name);
	                        }
	                        else {
	                            type((_a = {}, _a[fieldType] = refType, _a), { context: context })(schemaType.prototype, field.name);
	                        }
	                    }
	                    else {
	                        type(field.type, { context: context })(schemaType.prototype, field.name);
	                    }
	                });
	            });
	            var rootType = schemaTypes[reflection.rootType];
	            var rootInstance = new rootType();
	            /**
	             * auto-initialize referenced types on root type
	             * to allow registering listeners immediatelly on client-side
	             */
	            for (var fieldName in rootType._definition.schema) {
	                var fieldType = rootType._definition.schema[fieldName];
	                if (typeof (fieldType) !== "string") {
	                    rootInstance[fieldName] = (typeof (fieldType) === "function")
	                        ? new fieldType() // is a schema reference
	                        : new (getType(Object.keys(fieldType)[0])).constructor(); // is a "collection"
	                }
	            }
	            return rootInstance;
	        };
	        __decorate([
	            type([ReflectionType], reflectionContext)
	        ], Reflection.prototype, "types", void 0);
	        __decorate([
	            type("number", reflectionContext)
	        ], Reflection.prototype, "rootType", void 0);
	        return Reflection;
	    }(Schema));

	    registerType("map", { constructor: MapSchema });
	    registerType("array", { constructor: ArraySchema });
	    registerType("set", { constructor: SetSchema });
	    registerType("collection", { constructor: CollectionSchema, });

	    exports.ArraySchema = ArraySchema;
	    exports.CollectionSchema = CollectionSchema;
	    exports.Context = Context;
	    exports.MapSchema = MapSchema;
	    exports.Reflection = Reflection;
	    exports.ReflectionField = ReflectionField;
	    exports.ReflectionType = ReflectionType;
	    exports.Schema = Schema;
	    exports.SchemaDefinition = SchemaDefinition;
	    exports.SetSchema = SetSchema;
	    exports.decode = decode;
	    exports.defineTypes = defineTypes;
	    exports.deprecated = deprecated;
	    exports.dumpChanges = dumpChanges;
	    exports.encode = encode;
	    exports.filter = filter;
	    exports.filterChildren = filterChildren;
	    exports.hasFilter = hasFilter;
	    exports.registerType = registerType;
	    exports.type = type;

	}));
	}(umd, umd.exports));

	var __createBinding$1 = (globalThis && globalThis.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault$1 = (globalThis && globalThis.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar$1 = (globalThis && globalThis.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
	    __setModuleDefault$1(result, mod);
	    return result;
	};
	Object.defineProperty(Room$1, "__esModule", { value: true });
	Room$1.Room = void 0;
	const msgpack = __importStar$1(msgpack$1);
	const Connection_1 = Connection$1;
	const Protocol_1 = Protocol;
	const Serializer_1 = Serializer;
	// The unused imports here are important for better `.d.ts` file generation
	// (Later merged with `dts-bundle-generator`)
	const nanoevents_1$1 = nanoevents;
	const signal_1 = signal;
	const schema_1$1 = umd.exports;
	const ServerError_1$2 = ServerError;
	class Room {
	    constructor(name, rootSchema) {
	        // Public signals
	        this.onStateChange = (0, signal_1.createSignal)();
	        this.onError = (0, signal_1.createSignal)();
	        this.onLeave = (0, signal_1.createSignal)();
	        this.onJoin = (0, signal_1.createSignal)();
	        this.hasJoined = false;
	        this.onMessageHandlers = (0, nanoevents_1$1.createNanoEvents)();
	        this.roomId = null;
	        this.name = name;
	        if (rootSchema) {
	            this.serializer = new ((0, Serializer_1.getSerializer)("schema"));
	            this.rootSchema = rootSchema;
	            this.serializer.state = new rootSchema();
	        }
	        this.onError((code, message) => { var _a; return (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `colyseus.js - onError => (${code}) ${message}`); });
	        this.onLeave(() => this.removeAllListeners());
	    }
	    // TODO: deprecate me on version 1.0
	    get id() { return this.roomId; }
	    connect(endpoint, devModeCloseCallback, room = this // when reconnecting on devMode, re-use previous room intance for handling events.
	    ) {
	        const connection = new Connection_1.Connection();
	        room.connection = connection;
	        connection.events.onmessage = Room.prototype.onMessageCallback.bind(room);
	        connection.events.onclose = function (e) {
	            var _a;
	            if (!room.hasJoined) {
	                (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `Room connection was closed unexpectedly (${e.code}): ${e.reason}`);
	                room.onError.invoke(e.code, e.reason);
	                return;
	            }
	            if (e.code === ServerError_1$2.CloseCode.DEVMODE_RESTART && devModeCloseCallback) {
	                devModeCloseCallback();
	            }
	            else {
	                room.onLeave.invoke(e.code, e.reason);
	                room.destroy();
	            }
	        };
	        connection.events.onerror = function (e) {
	            var _a;
	            (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `Room, onError (${e.code}): ${e.reason}`);
	            room.onError.invoke(e.code, e.reason);
	        };
	        connection.connect(endpoint);
	    }
	    leave(consented = true) {
	        return new Promise((resolve) => {
	            this.onLeave((code) => resolve(code));
	            if (this.connection) {
	                if (consented) {
	                    this.connection.send([Protocol_1.Protocol.LEAVE_ROOM]);
	                }
	                else {
	                    this.connection.close();
	                }
	            }
	            else {
	                this.onLeave.invoke(ServerError_1$2.CloseCode.CONSENTED);
	            }
	        });
	    }
	    onMessage(type, callback) {
	        return this.onMessageHandlers.on(this.getMessageHandlerKey(type), callback);
	    }
	    send(type, message) {
	        const initialBytes = [Protocol_1.Protocol.ROOM_DATA];
	        if (typeof (type) === "string") {
	            schema_1$1.encode.string(initialBytes, type);
	        }
	        else {
	            schema_1$1.encode.number(initialBytes, type);
	        }
	        let arr;
	        if (message !== undefined) {
	            const encoded = msgpack.encode(message);
	            arr = new Uint8Array(initialBytes.length + encoded.byteLength);
	            arr.set(new Uint8Array(initialBytes), 0);
	            arr.set(new Uint8Array(encoded), initialBytes.length);
	        }
	        else {
	            arr = new Uint8Array(initialBytes);
	        }
	        this.connection.send(arr.buffer);
	    }
	    sendBytes(type, bytes) {
	        const initialBytes = [Protocol_1.Protocol.ROOM_DATA_BYTES];
	        if (typeof (type) === "string") {
	            schema_1$1.encode.string(initialBytes, type);
	        }
	        else {
	            schema_1$1.encode.number(initialBytes, type);
	        }
	        let arr;
	        arr = new Uint8Array(initialBytes.length + (bytes.byteLength || bytes.length));
	        arr.set(new Uint8Array(initialBytes), 0);
	        arr.set(new Uint8Array(bytes), initialBytes.length);
	        this.connection.send(arr.buffer);
	    }
	    get state() {
	        return this.serializer.getState();
	    }
	    removeAllListeners() {
	        this.onJoin.clear();
	        this.onStateChange.clear();
	        this.onError.clear();
	        this.onLeave.clear();
	        this.onMessageHandlers.events = {};
	    }
	    onMessageCallback(event) {
	        const bytes = Array.from(new Uint8Array(event.data));
	        const code = bytes[0];
	        if (code === Protocol_1.Protocol.JOIN_ROOM) {
	            let offset = 1;
	            const reconnectionToken = (0, Protocol_1.utf8Read)(bytes, offset);
	            offset += (0, Protocol_1.utf8Length)(reconnectionToken);
	            this.serializerId = (0, Protocol_1.utf8Read)(bytes, offset);
	            offset += (0, Protocol_1.utf8Length)(this.serializerId);
	            // Instantiate serializer if not locally available.
	            if (!this.serializer) {
	                const serializer = (0, Serializer_1.getSerializer)(this.serializerId);
	                this.serializer = new serializer();
	            }
	            if (bytes.length > offset && this.serializer.handshake) {
	                this.serializer.handshake(bytes, { offset });
	            }
	            this.reconnectionToken = `${this.roomId}:${reconnectionToken}`;
	            this.hasJoined = true;
	            this.onJoin.invoke();
	            // acknowledge successfull JOIN_ROOM
	            this.connection.send([Protocol_1.Protocol.JOIN_ROOM]);
	        }
	        else if (code === Protocol_1.Protocol.ERROR) {
	            const it = { offset: 1 };
	            const code = schema_1$1.decode.number(bytes, it);
	            const message = schema_1$1.decode.string(bytes, it);
	            this.onError.invoke(code, message);
	        }
	        else if (code === Protocol_1.Protocol.LEAVE_ROOM) {
	            this.leave();
	        }
	        else if (code === Protocol_1.Protocol.ROOM_DATA_SCHEMA) {
	            const it = { offset: 1 };
	            const context = this.serializer.getState().constructor._context;
	            const type = context.get(schema_1$1.decode.number(bytes, it));
	            const message = new type();
	            message.decode(bytes, it);
	            this.dispatchMessage(type, message);
	        }
	        else if (code === Protocol_1.Protocol.ROOM_STATE) {
	            bytes.shift(); // drop `code` byte
	            this.setState(bytes);
	        }
	        else if (code === Protocol_1.Protocol.ROOM_STATE_PATCH) {
	            bytes.shift(); // drop `code` byte
	            this.patch(bytes);
	        }
	        else if (code === Protocol_1.Protocol.ROOM_DATA) {
	            const it = { offset: 1 };
	            const type = (schema_1$1.decode.stringCheck(bytes, it))
	                ? schema_1$1.decode.string(bytes, it)
	                : schema_1$1.decode.number(bytes, it);
	            const message = (bytes.length > it.offset)
	                ? msgpack.decode(event.data, it.offset)
	                : undefined;
	            this.dispatchMessage(type, message);
	        }
	        else if (code === Protocol_1.Protocol.ROOM_DATA_BYTES) {
	            const it = { offset: 1 };
	            const type = (schema_1$1.decode.stringCheck(bytes, it))
	                ? schema_1$1.decode.string(bytes, it)
	                : schema_1$1.decode.number(bytes, it);
	            this.dispatchMessage(type, new Uint8Array(bytes.slice(it.offset)));
	        }
	    }
	    setState(encodedState) {
	        this.serializer.setState(encodedState);
	        this.onStateChange.invoke(this.serializer.getState());
	    }
	    patch(binaryPatch) {
	        this.serializer.patch(binaryPatch);
	        this.onStateChange.invoke(this.serializer.getState());
	    }
	    dispatchMessage(type, message) {
	        var _a;
	        const messageType = this.getMessageHandlerKey(type);
	        if (this.onMessageHandlers.events[messageType]) {
	            this.onMessageHandlers.emit(messageType, message);
	        }
	        else if (this.onMessageHandlers.events['*']) {
	            this.onMessageHandlers.emit('*', type, message);
	        }
	        else {
	            (_a = console.warn) === null || _a === void 0 ? void 0 : _a.call(console, `colyseus.js: onMessage() not registered for type '${type}'.`);
	        }
	    }
	    destroy() {
	        if (this.serializer) {
	            this.serializer.teardown();
	        }
	    }
	    getMessageHandlerKey(type) {
	        switch (typeof (type)) {
	            // typeof Schema
	            case "function": return `$${type._typeid}`;
	            // string
	            case "string": return type;
	            // number
	            case "number": return `i${type}`;
	            default: throw new Error("invalid message type.");
	        }
	    }
	}
	Room$1.Room = Room;

	var HTTP$1 = {};

	function apply(src, tar) {
		tar.headers = src.headers || {};
		tar.statusMessage = src.statusText;
		tar.statusCode = src.status;
		tar.data = src.response;
	}

	function send(method, uri, opts) {
		return new Promise(function (res, rej) {
			opts = opts || {};
			var req = new XMLHttpRequest;
			var k, tmp, arr, str=opts.body;
			var headers = opts.headers || {};

			// IE compatible
			if (opts.timeout) req.timeout = opts.timeout;
			req.ontimeout = req.onerror = function (err) {
				err.timeout = err.type == 'timeout';
				rej(err);
			};

			req.open(method, uri.href || uri);

			req.onload = function () {
				arr = req.getAllResponseHeaders().trim().split(/[\r\n]+/);
				apply(req, req); //=> req.headers

				while (tmp = arr.shift()) {
					tmp = tmp.split(': ');
					req.headers[tmp.shift().toLowerCase()] = tmp.join(': ');
				}

				tmp = req.headers['content-type'];
				if (tmp && !!~tmp.indexOf('application/json')) {
					try {
						req.data = JSON.parse(req.data, opts.reviver);
					} catch (err) {
						apply(req, err);
						return rej(err);
					}
				}

				(req.status >= 400 ? rej : res)(req);
			};

			if (typeof FormData < 'u' && str instanceof FormData) ; else if (str && typeof str == 'object') {
				headers['content-type'] = 'application/json';
				str = JSON.stringify(str);
			}

			req.withCredentials = !!opts.withCredentials;

			for (k in headers) {
				req.setRequestHeader(k, headers[k]);
			}

			req.send(str);
		});
	}

	var get$1 = /*#__PURE__*/ send.bind(send, 'GET');
	var post = /*#__PURE__*/ send.bind(send, 'POST');
	var patch = /*#__PURE__*/ send.bind(send, 'PATCH');
	var del = /*#__PURE__*/ send.bind(send, 'DELETE');
	var put = /*#__PURE__*/ send.bind(send, 'PUT');

	var xhr = /*#__PURE__*/Object.freeze({
		__proto__: null,
		send: send,
		get: get$1,
		post: post,
		patch: patch,
		del: del,
		put: put
	});

	var require$$1 = /*@__PURE__*/getAugmentedNamespace(xhr);

	var __createBinding = (globalThis && globalThis.__createBinding) || (Object.create ? (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    var desc = Object.getOwnPropertyDescriptor(m, k);
	    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
	      desc = { enumerable: true, get: function() { return m[k]; } };
	    }
	    Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
	    if (k2 === undefined) k2 = k;
	    o[k2] = m[k];
	}));
	var __setModuleDefault = (globalThis && globalThis.__setModuleDefault) || (Object.create ? (function(o, v) {
	    Object.defineProperty(o, "default", { enumerable: true, value: v });
	}) : function(o, v) {
	    o["default"] = v;
	});
	var __importStar = (globalThis && globalThis.__importStar) || function (mod) {
	    if (mod && mod.__esModule) return mod;
	    var result = {};
	    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
	    __setModuleDefault(result, mod);
	    return result;
	};
	Object.defineProperty(HTTP$1, "__esModule", { value: true });
	HTTP$1.HTTP = void 0;
	const ServerError_1$1 = ServerError;
	const httpie = __importStar(require$$1);
	class HTTP {
	    constructor(client) {
	        this.client = client;
	    }
	    get(path, options = {}) {
	        return this.request("get", path, options);
	    }
	    post(path, options = {}) {
	        return this.request("post", path, options);
	    }
	    del(path, options = {}) {
	        return this.request("del", path, options);
	    }
	    put(path, options = {}) {
	        return this.request("put", path, options);
	    }
	    request(method, path, options = {}) {
	        return httpie[method](this.client['getHttpEndpoint'](path), this.getOptions(options)).catch((e) => {
	            var _a;
	            const status = e.statusCode; //  || -1
	            const message = ((_a = e.data) === null || _a === void 0 ? void 0 : _a.error) || e.statusMessage || e.message; //  || "offline"
	            if (!status && !message) {
	                throw e;
	            }
	            throw new ServerError_1$1.ServerError(status, message);
	        });
	    }
	    getOptions(options) {
	        if (this.authToken) {
	            if (!options.headers) {
	                options.headers = {};
	            }
	            options.headers['Authorization'] = `Bearer ${this.authToken}`;
	        }
	        if (typeof (cc) !== 'undefined' && cc.sys && cc.sys.isNative) ;
	        else {
	            // always include credentials
	            options.withCredentials = true;
	        }
	        return options;
	    }
	}
	HTTP$1.HTTP = HTTP;

	var Auth$1 = {};

	var Storage = {};

	/// <reference path="../typings/cocos-creator.d.ts" />
	Object.defineProperty(Storage, "__esModule", { value: true });
	Storage.getItem = Storage.removeItem = Storage.setItem = void 0;
	/**
	 * We do not assign 'storage' to window.localStorage immediatelly for React
	 * Native compatibility. window.localStorage is not present when this module is
	 * loaded.
	 */
	let storage;
	function getStorage() {
	    if (!storage) {
	        try {
	            storage = (typeof (cc) !== 'undefined' && cc.sys && cc.sys.localStorage)
	                ? cc.sys.localStorage // compatibility with cocos creator
	                : window.localStorage; // RN does have window object at this point, but localStorage is not defined
	        }
	        catch (e) {
	            // ignore error
	        }
	    }
	    if (!storage) {
	        // mock localStorage if not available (Node.js or RN environment)
	        storage = {
	            cache: {},
	            setItem: function (key, value) { this.cache[key] = value; },
	            getItem: function (key) { this.cache[key]; },
	            removeItem: function (key) { delete this.cache[key]; },
	        };
	    }
	    return storage;
	}
	function setItem(key, value) {
	    getStorage().setItem(key, value);
	}
	Storage.setItem = setItem;
	function removeItem(key) {
	    getStorage().removeItem(key);
	}
	Storage.removeItem = removeItem;
	function getItem(key, callback) {
	    const value = getStorage().getItem(key);
	    if (typeof (Promise) === 'undefined' || // old browsers
	        !(value instanceof Promise)) {
	        // browser has synchronous return
	        callback(value);
	    }
	    else {
	        // react-native is asynchronous
	        value.then((id) => callback(id));
	    }
	}
	Storage.getItem = getItem;

	var __awaiter$1 = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var __classPrivateFieldGet = (globalThis && globalThis.__classPrivateFieldGet) || function (receiver, state, kind, f) {
	    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
	    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
	    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
	};
	var __classPrivateFieldSet = (globalThis && globalThis.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
	    if (kind === "m") throw new TypeError("Private method is not writable");
	    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
	    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
	    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
	};
	var _Auth__initialized, _Auth__initializationPromise, _Auth__signInWindow, _Auth__events;
	Object.defineProperty(Auth$1, "__esModule", { value: true });
	Auth$1.Auth = void 0;
	const Storage_1 = Storage;
	const nanoevents_1 = nanoevents;
	class Auth {
	    constructor(http) {
	        this.http = http;
	        this.settings = {
	            path: "/auth",
	            key: "colyseus-auth-token",
	        };
	        _Auth__initialized.set(this, false);
	        _Auth__initializationPromise.set(this, void 0);
	        _Auth__signInWindow.set(this, undefined);
	        _Auth__events.set(this, (0, nanoevents_1.createNanoEvents)());
	        (0, Storage_1.getItem)(this.settings.key, (token) => this.token = token);
	    }
	    set token(token) {
	        this.http.authToken = token;
	    }
	    get token() {
	        return this.http.authToken;
	    }
	    onChange(callback) {
	        const unbindChange = __classPrivateFieldGet(this, _Auth__events, "f").on("change", callback);
	        if (!__classPrivateFieldGet(this, _Auth__initialized, "f")) {
	            __classPrivateFieldSet(this, _Auth__initializationPromise, new Promise((resolve, reject) => {
	                this.getUserData().then((userData) => {
	                    this.emitChange(Object.assign(Object.assign({}, userData), { token: this.token }));
	                }).catch((e) => {
	                    // user is not logged in, or service is down
	                    this.emitChange({ user: null, token: undefined });
	                }).finally(() => {
	                    resolve();
	                });
	            }), "f");
	        }
	        __classPrivateFieldSet(this, _Auth__initialized, true, "f");
	        return unbindChange;
	    }
	    getUserData() {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            if (this.token) {
	                return (yield this.http.get(`${this.settings.path}/userdata`)).data;
	            }
	            else {
	                throw new Error("missing auth.token");
	            }
	        });
	    }
	    registerWithEmailAndPassword(email, password, options) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const data = (yield this.http.post(`${this.settings.path}/register`, {
	                body: { email, password, options, },
	            })).data;
	            this.emitChange(data);
	            return data;
	        });
	    }
	    signInWithEmailAndPassword(email, password) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const data = (yield this.http.post(`${this.settings.path}/login`, {
	                body: { email, password, },
	            })).data;
	            this.emitChange(data);
	            return data;
	        });
	    }
	    signInAnonymously(options) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            const data = (yield this.http.post(`${this.settings.path}/anonymous`, {
	                body: { options, }
	            })).data;
	            this.emitChange(data);
	            return data;
	        });
	    }
	    sendPasswordResetEmail(email) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            return (yield this.http.post(`${this.settings.path}/forgot-password`, {
	                body: { email, }
	            })).data;
	        });
	    }
	    signInWithProvider(providerName, settings = {}) {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            return new Promise((resolve, reject) => {
	                const w = settings.width || 480;
	                const h = settings.height || 768;
	                // forward existing token for upgrading
	                const upgradingToken = this.token ? `?token=${this.token}` : "";
	                // Capitalize first letter of providerName
	                const title = `Login with ${(providerName[0].toUpperCase() + providerName.substring(1))}`;
	                const url = this.http['client']['getHttpEndpoint'](`${(settings.prefix || `${this.settings.path}/provider`)}/${providerName}${upgradingToken}`);
	                const left = (screen.width / 2) - (w / 2);
	                const top = (screen.height / 2) - (h / 2);
	                __classPrivateFieldSet(this, _Auth__signInWindow, window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left), "f");
	                const onMessage = (event) => {
	                    // TODO: it is a good idea to check if event.origin can be trusted!
	                    // if (event.origin.indexOf(window.location.hostname) === -1) { return; }
	                    // require 'user' and 'token' inside received data.
	                    if (event.data.user === undefined && event.data.token === undefined) {
	                        return;
	                    }
	                    clearInterval(rejectionChecker);
	                    __classPrivateFieldGet(this, _Auth__signInWindow, "f").close();
	                    __classPrivateFieldSet(this, _Auth__signInWindow, undefined, "f");
	                    window.removeEventListener("message", onMessage);
	                    if (event.data.error !== undefined) {
	                        reject(event.data.error);
	                    }
	                    else {
	                        resolve(event.data);
	                        this.emitChange(event.data);
	                    }
	                };
	                const rejectionChecker = setInterval(() => {
	                    if (!__classPrivateFieldGet(this, _Auth__signInWindow, "f") || __classPrivateFieldGet(this, _Auth__signInWindow, "f").closed) {
	                        __classPrivateFieldSet(this, _Auth__signInWindow, undefined, "f");
	                        reject("cancelled");
	                        window.removeEventListener("message", onMessage);
	                    }
	                }, 200);
	                window.addEventListener("message", onMessage);
	            });
	        });
	    }
	    signOut() {
	        return __awaiter$1(this, void 0, void 0, function* () {
	            this.emitChange({ user: null, token: null });
	        });
	    }
	    emitChange(authData) {
	        if (authData.token !== undefined) {
	            this.token = authData.token;
	            if (authData.token === null) {
	                (0, Storage_1.removeItem)(this.settings.key);
	            }
	            else {
	                // store key in localStorage
	                (0, Storage_1.setItem)(this.settings.key, authData.token);
	            }
	        }
	        __classPrivateFieldGet(this, _Auth__events, "f").emit("change", authData);
	    }
	}
	Auth$1.Auth = Auth;
	_Auth__initialized = new WeakMap(), _Auth__initializationPromise = new WeakMap(), _Auth__signInWindow = new WeakMap(), _Auth__events = new WeakMap();

	var discord = {};

	Object.defineProperty(discord, "__esModule", { value: true });
	discord.discordURLBuilder = void 0;
	/**
	 * Discord Embedded App SDK
	 * https://github.com/colyseus/colyseus/issues/707
	 *
	 * All URLs must go through the local proxy from
	 * https://<app_id>.discordsays.com/.proxy/<mapped_url>/...
	 *
	 * URL Mapping Examples:
	 *
	 * 1. Using Colyseus Cloud:
	 *   - /colyseus/{subdomain} -> {subdomain}.colyseus.cloud
	 *
	 *   Example:
	 *     const client = new Client("https://xxxx.colyseus.cloud");
	 *
	 * -------------------------------------------------------------
	 *
	 * 2. Using `cloudflared` tunnel:
	 *   - /colyseus/ -> <your-cloudflared-url>.trycloudflare.com
	 *
	 *   Example:
	 *     const client = new Client("https://<your-cloudflared-url>.trycloudflare.com");
	 *
	 * -------------------------------------------------------------
	 *
	 * 3. Providing a manual /.proxy/your-mapping:
	 *   - /your-mapping/ -> your-endpoint.com
	 *
	 *   Example:
	 *     const client = new Client("/.proxy/your-mapping");
	 *
	 */
	function discordURLBuilder(url) {
	    var _a;
	    const localHostname = ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) || "localhost";
	    const remoteHostnameSplitted = url.hostname.split('.');
	    const subdomain = (!url.hostname.includes("trycloudflare.com") && // ignore cloudflared subdomains
	        !url.hostname.includes("discordsays.com") && // ignore discordsays.com subdomains
	        remoteHostnameSplitted.length > 2)
	        ? `/${remoteHostnameSplitted[0]}`
	        : '';
	    return (url.pathname.startsWith("/.proxy"))
	        ? `${url.protocol}//${localHostname}${subdomain}${url.pathname}${url.search}`
	        : `${url.protocol}//${localHostname}/.proxy/colyseus${subdomain}${url.pathname}${url.search}`;
	}
	discord.discordURLBuilder = discordURLBuilder;

	var __awaiter = (globalThis && globalThis.__awaiter) || function (thisArg, _arguments, P, generator) {
	    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	    return new (P || (P = Promise))(function (resolve, reject) {
	        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
	        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
	        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
	        step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	};
	var _a;
	Object.defineProperty(Client$1, "__esModule", { value: true });
	Client$1.Client = Client$1.MatchMakeError = void 0;
	const ServerError_1 = ServerError;
	const Room_1 = Room$1;
	const HTTP_1 = HTTP$1;
	const Auth_1 = Auth$1;
	const discord_1 = discord;
	class MatchMakeError extends Error {
	    constructor(message, code) {
	        super(message);
	        this.code = code;
	        Object.setPrototypeOf(this, MatchMakeError.prototype);
	    }
	}
	Client$1.MatchMakeError = MatchMakeError;
	// - React Native does not provide `window.location`
	// - Cocos Creator (Native) does not provide `window.location.hostname`
	const DEFAULT_ENDPOINT = (typeof (window) !== "undefined" && typeof ((_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) !== "undefined")
	    ? `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}${(window.location.port && `:${window.location.port}`)}`
	    : "ws://127.0.0.1:2567";
	class Client {
	    constructor(settings = DEFAULT_ENDPOINT, customURLBuilder) {
	        var _a, _b;
	        if (typeof (settings) === "string") {
	            //
	            // endpoint by url
	            //
	            const url = (settings.startsWith("/"))
	                ? new URL(settings, DEFAULT_ENDPOINT)
	                : new URL(settings);
	            const secure = (url.protocol === "https:" || url.protocol === "wss:");
	            const port = Number(url.port || (secure ? 443 : 80));
	            this.settings = {
	                hostname: url.hostname,
	                pathname: url.pathname,
	                port,
	                secure
	            };
	        }
	        else {
	            //
	            // endpoint by settings
	            //
	            if (settings.port === undefined) {
	                settings.port = (settings.secure) ? 443 : 80;
	            }
	            if (settings.pathname === undefined) {
	                settings.pathname = "";
	            }
	            this.settings = settings;
	        }
	        // make sure pathname does not end with "/"
	        if (this.settings.pathname.endsWith("/")) {
	            this.settings.pathname = this.settings.pathname.slice(0, -1);
	        }
	        this.http = new HTTP_1.HTTP(this);
	        this.auth = new Auth_1.Auth(this.http);
	        this.urlBuilder = customURLBuilder;
	        //
	        // Discord Embedded SDK requires a custom URL builder
	        //
	        if (!this.urlBuilder &&
	            typeof (window) !== "undefined" &&
	            ((_b = (_a = window === null || window === void 0 ? void 0 : window.location) === null || _a === void 0 ? void 0 : _a.hostname) === null || _b === void 0 ? void 0 : _b.includes("discordsays.com"))) {
	            this.urlBuilder = discord_1.discordURLBuilder;
	            console.log("Colyseus SDK: Discord Embedded SDK detected. Using custom URL builder.");
	        }
	    }
	    joinOrCreate(roomName, options = {}, rootSchema) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return yield this.createMatchMakeRequest('joinOrCreate', roomName, options, rootSchema);
	        });
	    }
	    create(roomName, options = {}, rootSchema) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return yield this.createMatchMakeRequest('create', roomName, options, rootSchema);
	        });
	    }
	    join(roomName, options = {}, rootSchema) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return yield this.createMatchMakeRequest('join', roomName, options, rootSchema);
	        });
	    }
	    joinById(roomId, options = {}, rootSchema) {
	        return __awaiter(this, void 0, void 0, function* () {
	            return yield this.createMatchMakeRequest('joinById', roomId, options, rootSchema);
	        });
	    }
	    /**
	     * Re-establish connection with a room this client was previously connected to.
	     *
	     * @param reconnectionToken The `room.reconnectionToken` from previously connected room.
	     * @param rootSchema (optional) Concrete root schema definition
	     * @returns Promise<Room>
	     */
	    reconnect(reconnectionToken, rootSchema) {
	        return __awaiter(this, void 0, void 0, function* () {
	            if (typeof (reconnectionToken) === "string" && typeof (rootSchema) === "string") {
	                throw new Error("DEPRECATED: .reconnect() now only accepts 'reconnectionToken' as argument.\nYou can get this token from previously connected `room.reconnectionToken`");
	            }
	            const [roomId, token] = reconnectionToken.split(":");
	            if (!roomId || !token) {
	                throw new Error("Invalid reconnection token format.\nThe format should be roomId:reconnectionToken");
	            }
	            return yield this.createMatchMakeRequest('reconnect', roomId, { reconnectionToken: token }, rootSchema);
	        });
	    }
	    getAvailableRooms(roomName = "") {
	        return __awaiter(this, void 0, void 0, function* () {
	            return (yield this.http.get(`matchmake/${roomName}`, {
	                headers: {
	                    'Accept': 'application/json'
	                }
	            })).data;
	        });
	    }
	    consumeSeatReservation(response, rootSchema, reuseRoomInstance // used in devMode
	    ) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const room = this.createRoom(response.room.name, rootSchema);
	            room.roomId = response.room.roomId;
	            room.sessionId = response.sessionId;
	            const options = { sessionId: room.sessionId };
	            // forward "reconnection token" in case of reconnection.
	            if (response.reconnectionToken) {
	                options.reconnectionToken = response.reconnectionToken;
	            }
	            const targetRoom = reuseRoomInstance || room;
	            room.connect(this.buildEndpoint(response.room, options), response.devMode && (() => __awaiter(this, void 0, void 0, function* () {
	                console.info(`[Colyseus devMode]: ${String.fromCodePoint(0x1F504)} Re-establishing connection with room id '${room.roomId}'...`); // 🔄
	                let retryCount = 0;
	                let retryMaxRetries = 8;
	                const retryReconnection = () => __awaiter(this, void 0, void 0, function* () {
	                    retryCount++;
	                    try {
	                        yield this.consumeSeatReservation(response, rootSchema, targetRoom);
	                        console.info(`[Colyseus devMode]: ${String.fromCodePoint(0x2705)} Successfully re-established connection with room '${room.roomId}'`); // ✅
	                    }
	                    catch (e) {
	                        if (retryCount < retryMaxRetries) {
	                            console.info(`[Colyseus devMode]: ${String.fromCodePoint(0x1F504)} retrying... (${retryCount} out of ${retryMaxRetries})`); // 🔄
	                            setTimeout(retryReconnection, 2000);
	                        }
	                        else {
	                            console.info(`[Colyseus devMode]: ${String.fromCodePoint(0x274C)} Failed to reconnect. Is your server running? Please check server logs.`); // ❌
	                        }
	                    }
	                });
	                setTimeout(retryReconnection, 2000);
	            })), targetRoom);
	            return new Promise((resolve, reject) => {
	                const onError = (code, message) => reject(new ServerError_1.ServerError(code, message));
	                targetRoom.onError.once(onError);
	                targetRoom['onJoin'].once(() => {
	                    targetRoom.onError.remove(onError);
	                    resolve(targetRoom);
	                });
	            });
	        });
	    }
	    createMatchMakeRequest(method, roomName, options = {}, rootSchema, reuseRoomInstance) {
	        return __awaiter(this, void 0, void 0, function* () {
	            const response = (yield this.http.post(`matchmake/${method}/${roomName}`, {
	                headers: {
	                    'Accept': 'application/json',
	                    'Content-Type': 'application/json'
	                },
	                body: JSON.stringify(options)
	            })).data;
	            // FIXME: HTTP class is already handling this as ServerError.
	            if (response.error) {
	                throw new MatchMakeError(response.error, response.code);
	            }
	            // forward reconnection token during "reconnect" methods.
	            if (method === "reconnect") {
	                response.reconnectionToken = options.reconnectionToken;
	            }
	            return yield this.consumeSeatReservation(response, rootSchema, reuseRoomInstance);
	        });
	    }
	    createRoom(roomName, rootSchema) {
	        return new Room_1.Room(roomName, rootSchema);
	    }
	    buildEndpoint(room, options = {}) {
	        const params = [];
	        // append provided options
	        for (const name in options) {
	            if (!options.hasOwnProperty(name)) {
	                continue;
	            }
	            params.push(`${name}=${options[name]}`);
	        }
	        let endpoint = (this.settings.secure)
	            ? "wss://"
	            : "ws://";
	        if (room.publicAddress) {
	            endpoint += `${room.publicAddress}`;
	        }
	        else {
	            endpoint += `${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}`;
	        }
	        const endpointURL = `${endpoint}/${room.processId}/${room.roomId}?${params.join('&')}`;
	        return (this.urlBuilder)
	            ? this.urlBuilder(new URL(endpointURL))
	            : endpointURL;
	    }
	    getHttpEndpoint(segments = '') {
	        const path = segments.startsWith("/") ? segments : `/${segments}`;
	        const endpointURL = `${(this.settings.secure) ? "https" : "http"}://${this.settings.hostname}${this.getEndpointPort()}${this.settings.pathname}${path}`;
	        return (this.urlBuilder)
	            ? this.urlBuilder(new URL(endpointURL))
	            : endpointURL;
	    }
	    getEndpointPort() {
	        return (this.settings.port !== 80 && this.settings.port !== 443)
	            ? `:${this.settings.port}`
	            : "";
	    }
	}
	Client$1.Client = Client;

	var SchemaSerializer$1 = {};

	Object.defineProperty(SchemaSerializer$1, "__esModule", { value: true });
	SchemaSerializer$1.SchemaSerializer = void 0;
	const schema_1 = umd.exports;
	class SchemaSerializer {
	    setState(rawState) {
	        return this.state.decode(rawState);
	    }
	    getState() {
	        return this.state;
	    }
	    patch(patches) {
	        return this.state.decode(patches);
	    }
	    teardown() {
	        var _a, _b;
	        (_b = (_a = this.state) === null || _a === void 0 ? void 0 : _a['$changes']) === null || _b === void 0 ? void 0 : _b.root.clearRefs();
	    }
	    handshake(bytes, it) {
	        if (this.state) {
	            // TODO: validate client/server definitinos
	            const reflection = new schema_1.Reflection();
	            reflection.decode(bytes, it);
	        }
	        else {
	            // initialize reflected state from server
	            this.state = schema_1.Reflection.decode(bytes, it);
	        }
	    }
	}
	SchemaSerializer$1.SchemaSerializer = SchemaSerializer;

	var NoneSerializer$1 = {};

	Object.defineProperty(NoneSerializer$1, "__esModule", { value: true });
	NoneSerializer$1.NoneSerializer = void 0;
	class NoneSerializer {
	    setState(rawState) { }
	    getState() { return null; }
	    patch(patches) { }
	    teardown() { }
	    handshake(bytes) { }
	}
	NoneSerializer$1.NoneSerializer = NoneSerializer;

	(function (exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.SchemaSerializer = exports.registerSerializer = exports.Auth = exports.Room = exports.ErrorCode = exports.Protocol = exports.Client = void 0;

	var Client_1 = Client$1;
	Object.defineProperty(exports, "Client", { enumerable: true, get: function () { return Client_1.Client; } });
	var Protocol_1 = Protocol;
	Object.defineProperty(exports, "Protocol", { enumerable: true, get: function () { return Protocol_1.Protocol; } });
	Object.defineProperty(exports, "ErrorCode", { enumerable: true, get: function () { return Protocol_1.ErrorCode; } });
	var Room_1 = Room$1;
	Object.defineProperty(exports, "Room", { enumerable: true, get: function () { return Room_1.Room; } });
	var Auth_1 = Auth$1;
	Object.defineProperty(exports, "Auth", { enumerable: true, get: function () { return Auth_1.Auth; } });
	/*
	 * Serializers
	 */
	const SchemaSerializer_1 = SchemaSerializer$1;
	Object.defineProperty(exports, "SchemaSerializer", { enumerable: true, get: function () { return SchemaSerializer_1.SchemaSerializer; } });
	const NoneSerializer_1 = NoneSerializer$1;
	const Serializer_1 = Serializer;
	Object.defineProperty(exports, "registerSerializer", { enumerable: true, get: function () { return Serializer_1.registerSerializer; } });
	(0, Serializer_1.registerSerializer)('schema', SchemaSerializer_1.SchemaSerializer);
	(0, Serializer_1.registerSerializer)('none', NoneSerializer_1.NoneSerializer);

	}(lib));

	function mitt(n){return {all:n=n||new Map,on:function(t,e){var i=n.get(t);i?i.push(e):n.set(t,[e]);},off:function(t,e){var i=n.get(t);i&&(e?i.splice(i.indexOf(e)>>>0,1):n.set(t,[]));},emit:function(t,e){var i=n.get(t);i&&i.slice().map(function(n){n(e);}),(i=n.get("*"))&&i.slice().map(function(n){n(t,e);});}}}

	var fails$e = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	var fails$d = fails$e;

	var functionBindNative = !fails$d(function () {
	  // eslint-disable-next-line es/no-function-prototype-bind -- safe
	  var test = (function () { /* empty */ }).bind();
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return typeof test != 'function' || test.hasOwnProperty('prototype');
	});

	var NATIVE_BIND$2 = functionBindNative;

	var FunctionPrototype$1 = Function.prototype;
	var call$b = FunctionPrototype$1.call;
	// eslint-disable-next-line es/no-function-prototype-bind -- safe
	var uncurryThisWithBind = NATIVE_BIND$2 && FunctionPrototype$1.bind.bind(call$b, call$b);

	var functionUncurryThis = NATIVE_BIND$2 ? uncurryThisWithBind : function (fn) {
	  return function () {
	    return call$b.apply(fn, arguments);
	  };
	};

	var uncurryThis$m = functionUncurryThis;

	var toString$8 = uncurryThis$m({}.toString);
	var stringSlice$4 = uncurryThis$m(''.slice);

	var classofRaw$2 = function (it) {
	  return stringSlice$4(toString$8(it), 8, -1);
	};

	var uncurryThis$l = functionUncurryThis;
	var fails$c = fails$e;
	var classof$5 = classofRaw$2;

	var $Object$4 = Object;
	var split$3 = uncurryThis$l(''.split);

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails$c(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins -- safe
	  return !$Object$4('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classof$5(it) === 'String' ? split$3(it, '') : $Object$4(it);
	} : $Object$4;

	// we can't use just `it == null` since of `document.all` special case
	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot-aec
	var isNullOrUndefined$3 = function (it) {
	  return it === null || it === undefined;
	};

	var isNullOrUndefined$2 = isNullOrUndefined$3;

	var $TypeError$9 = TypeError;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible$4 = function (it) {
	  if (isNullOrUndefined$2(it)) throw new $TypeError$9("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings
	var IndexedObject$1 = indexedObject;
	var requireObjectCoercible$3 = requireObjectCoercible$4;

	var toIndexedObject$5 = function (it) {
	  return IndexedObject$1(requireObjectCoercible$3(it));
	};

	var check = function (it) {
	  return it && it.Math === Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var globalThis_1 =
	  // eslint-disable-next-line es/no-global-this -- safe
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  // eslint-disable-next-line no-restricted-globals -- safe
	  check(typeof self == 'object' && self) ||
	  check(typeof global == 'object' && global) ||
	  check(typeof globalThis == 'object' && globalThis) ||
	  // eslint-disable-next-line no-new-func -- fallback
	  (function () { return this; })() || Function('return this')();

	var sharedStore = {exports: {}};

	var isPure = false;

	var globalThis$f = globalThis_1;

	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$6 = Object.defineProperty;

	var defineGlobalProperty$3 = function (key, value) {
	  try {
	    defineProperty$6(globalThis$f, key, { value: value, configurable: true, writable: true });
	  } catch (error) {
	    globalThis$f[key] = value;
	  } return value;
	};

	var globalThis$e = globalThis_1;
	var defineGlobalProperty$2 = defineGlobalProperty$3;

	var SHARED = '__core-js_shared__';
	var store$3 = sharedStore.exports = globalThis$e[SHARED] || defineGlobalProperty$2(SHARED, {});

	(store$3.versions || (store$3.versions = [])).push({
	  version: '3.41.0',
	  mode: 'global',
	  copyright: '© 2014-2025 Denis Pushkarev (zloirock.ru)',
	  license: 'https://github.com/zloirock/core-js/blob/v3.41.0/LICENSE',
	  source: 'https://github.com/zloirock/core-js'
	});

	var store$2 = sharedStore.exports;

	var shared$3 = function (key, value) {
	  return store$2[key] || (store$2[key] = value || {});
	};

	var requireObjectCoercible$2 = requireObjectCoercible$4;

	var $Object$3 = Object;

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject$4 = function (argument) {
	  return $Object$3(requireObjectCoercible$2(argument));
	};

	var uncurryThis$k = functionUncurryThis;
	var toObject$3 = toObject$4;

	var hasOwnProperty = uncurryThis$k({}.hasOwnProperty);

	// `HasOwnProperty` abstract operation
	// https://tc39.es/ecma262/#sec-hasownproperty
	// eslint-disable-next-line es/no-object-hasown -- safe
	var hasOwnProperty_1 = Object.hasOwn || function hasOwn(it, key) {
	  return hasOwnProperty(toObject$3(it), key);
	};

	var uncurryThis$j = functionUncurryThis;

	var id = 0;
	var postfix = Math.random();
	var toString$7 = uncurryThis$j(1.0.toString);

	var uid$2 = function (key) {
	  return 'Symbol(' + (key === undefined ? '' : key) + ')_' + toString$7(++id + postfix, 36);
	};

	var globalThis$d = globalThis_1;

	var navigator = globalThis$d.navigator;
	var userAgent$1 = navigator && navigator.userAgent;

	var environmentUserAgent = userAgent$1 ? String(userAgent$1) : '';

	var globalThis$c = globalThis_1;
	var userAgent = environmentUserAgent;

	var process = globalThis$c.process;
	var Deno = globalThis$c.Deno;
	var versions = process && process.versions || Deno && Deno.version;
	var v8 = versions && versions.v8;
	var match, version;

	if (v8) {
	  match = v8.split('.');
	  // in old Chrome, versions of V8 isn't V8 = Chrome / 10
	  // but their correct versions are not interesting for us
	  version = match[0] > 0 && match[0] < 4 ? 1 : +(match[0] + match[1]);
	}

	// BrowserFS NodeJS `process` polyfill incorrectly set `.v8` to `0.0`
	// so check `userAgent` even if `.v8` exists, but 0
	if (!version && userAgent) {
	  match = userAgent.match(/Edge\/(\d+)/);
	  if (!match || match[1] >= 74) {
	    match = userAgent.match(/Chrome\/(\d+)/);
	    if (match) version = +match[1];
	  }
	}

	var environmentV8Version = version;

	/* eslint-disable es/no-symbol -- required for testing */
	var V8_VERSION = environmentV8Version;
	var fails$b = fails$e;
	var globalThis$b = globalThis_1;

	var $String$5 = globalThis$b.String;

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- required for testing
	var symbolConstructorDetection = !!Object.getOwnPropertySymbols && !fails$b(function () {
	  var symbol = Symbol('symbol detection');
	  // Chrome 38 Symbol has incorrect toString conversion
	  // `get-own-property-symbols` polyfill symbols converted to object are not Symbol instances
	  // nb: Do not call `String` directly to avoid this being optimized out to `symbol+''` which will,
	  // of course, fail.
	  return !$String$5(symbol) || !(Object(symbol) instanceof Symbol) ||
	    // Chrome 38-40 symbols are not inherited from DOM collections prototypes to instances
	    !Symbol.sham && V8_VERSION && V8_VERSION < 41;
	});

	/* eslint-disable es/no-symbol -- required for testing */
	var NATIVE_SYMBOL$1 = symbolConstructorDetection;

	var useSymbolAsUid = NATIVE_SYMBOL$1 &&
	  !Symbol.sham &&
	  typeof Symbol.iterator == 'symbol';

	var globalThis$a = globalThis_1;
	var shared$2 = shared$3;
	var hasOwn$a = hasOwnProperty_1;
	var uid$1 = uid$2;
	var NATIVE_SYMBOL = symbolConstructorDetection;
	var USE_SYMBOL_AS_UID$1 = useSymbolAsUid;

	var Symbol$1 = globalThis$a.Symbol;
	var WellKnownSymbolsStore = shared$2('wks');
	var createWellKnownSymbol = USE_SYMBOL_AS_UID$1 ? Symbol$1['for'] || Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid$1;

	var wellKnownSymbol$b = function (name) {
	  if (!hasOwn$a(WellKnownSymbolsStore, name)) {
	    WellKnownSymbolsStore[name] = NATIVE_SYMBOL && hasOwn$a(Symbol$1, name)
	      ? Symbol$1[name]
	      : createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	// https://tc39.es/ecma262/#sec-IsHTMLDDA-internal-slot
	var documentAll = typeof document == 'object' && document.all;

	// `IsCallable` abstract operation
	// https://tc39.es/ecma262/#sec-iscallable
	// eslint-disable-next-line unicorn/no-typeof-undefined -- required for testing
	var isCallable$g = typeof documentAll == 'undefined' && documentAll !== undefined ? function (argument) {
	  return typeof argument == 'function' || argument === documentAll;
	} : function (argument) {
	  return typeof argument == 'function';
	};

	var isCallable$f = isCallable$g;

	var isObject$9 = function (it) {
	  return typeof it == 'object' ? it !== null : isCallable$f(it);
	};

	var isObject$8 = isObject$9;

	var $String$4 = String;
	var $TypeError$8 = TypeError;

	// `Assert: Type(argument) is Object`
	var anObject$8 = function (argument) {
	  if (isObject$8(argument)) return argument;
	  throw new $TypeError$8($String$4(argument) + ' is not an object');
	};

	var objectDefineProperties = {};

	var fails$a = fails$e;

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails$a(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] !== 7;
	});

	var DESCRIPTORS$f = descriptors;
	var fails$9 = fails$e;

	// V8 ~ Chrome 36-
	// https://bugs.chromium.org/p/v8/issues/detail?id=3334
	var v8PrototypeDefineBug = DESCRIPTORS$f && fails$9(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(function () { /* empty */ }, 'prototype', {
	    value: 42,
	    writable: false
	  }).prototype !== 42;
	});

	var objectDefineProperty = {};

	var globalThis$9 = globalThis_1;
	var isObject$7 = isObject$9;

	var document$1 = globalThis$9.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS$1 = isObject$7(document$1) && isObject$7(document$1.createElement);

	var documentCreateElement$1 = function (it) {
	  return EXISTS$1 ? document$1.createElement(it) : {};
	};

	var DESCRIPTORS$e = descriptors;
	var fails$8 = fails$e;
	var createElement = documentCreateElement$1;

	// Thanks to IE8 for its funny defineProperty
	var ie8DomDefine = !DESCRIPTORS$e && !fails$8(function () {
	  // eslint-disable-next-line es/no-object-defineproperty -- required for testing
	  return Object.defineProperty(createElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a !== 7;
	});

	var NATIVE_BIND$1 = functionBindNative;

	var call$a = Function.prototype.call;
	// eslint-disable-next-line es/no-function-prototype-bind -- safe
	var functionCall = NATIVE_BIND$1 ? call$a.bind(call$a) : function () {
	  return call$a.apply(call$a, arguments);
	};

	var globalThis$8 = globalThis_1;
	var isCallable$e = isCallable$g;

	var aFunction = function (argument) {
	  return isCallable$e(argument) ? argument : undefined;
	};

	var getBuiltIn$7 = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(globalThis$8[namespace]) : globalThis$8[namespace] && globalThis$8[namespace][method];
	};

	var uncurryThis$i = functionUncurryThis;

	var objectIsPrototypeOf = uncurryThis$i({}.isPrototypeOf);

	var getBuiltIn$6 = getBuiltIn$7;
	var isCallable$d = isCallable$g;
	var isPrototypeOf$1 = objectIsPrototypeOf;
	var USE_SYMBOL_AS_UID = useSymbolAsUid;

	var $Object$2 = Object;

	var isSymbol$2 = USE_SYMBOL_AS_UID ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  var $Symbol = getBuiltIn$6('Symbol');
	  return isCallable$d($Symbol) && isPrototypeOf$1($Symbol.prototype, $Object$2(it));
	};

	var $String$3 = String;

	var tryToString$2 = function (argument) {
	  try {
	    return $String$3(argument);
	  } catch (error) {
	    return 'Object';
	  }
	};

	var isCallable$c = isCallable$g;
	var tryToString$1 = tryToString$2;

	var $TypeError$7 = TypeError;

	// `Assert: IsCallable(argument) is true`
	var aCallable$4 = function (argument) {
	  if (isCallable$c(argument)) return argument;
	  throw new $TypeError$7(tryToString$1(argument) + ' is not a function');
	};

	var aCallable$3 = aCallable$4;
	var isNullOrUndefined$1 = isNullOrUndefined$3;

	// `GetMethod` abstract operation
	// https://tc39.es/ecma262/#sec-getmethod
	var getMethod$3 = function (V, P) {
	  var func = V[P];
	  return isNullOrUndefined$1(func) ? undefined : aCallable$3(func);
	};

	var call$9 = functionCall;
	var isCallable$b = isCallable$g;
	var isObject$6 = isObject$9;

	var $TypeError$6 = TypeError;

	// `OrdinaryToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-ordinarytoprimitive
	var ordinaryToPrimitive$1 = function (input, pref) {
	  var fn, val;
	  if (pref === 'string' && isCallable$b(fn = input.toString) && !isObject$6(val = call$9(fn, input))) return val;
	  if (isCallable$b(fn = input.valueOf) && !isObject$6(val = call$9(fn, input))) return val;
	  if (pref !== 'string' && isCallable$b(fn = input.toString) && !isObject$6(val = call$9(fn, input))) return val;
	  throw new $TypeError$6("Can't convert object to primitive value");
	};

	var call$8 = functionCall;
	var isObject$5 = isObject$9;
	var isSymbol$1 = isSymbol$2;
	var getMethod$2 = getMethod$3;
	var ordinaryToPrimitive = ordinaryToPrimitive$1;
	var wellKnownSymbol$a = wellKnownSymbol$b;

	var $TypeError$5 = TypeError;
	var TO_PRIMITIVE = wellKnownSymbol$a('toPrimitive');

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	var toPrimitive$1 = function (input, pref) {
	  if (!isObject$5(input) || isSymbol$1(input)) return input;
	  var exoticToPrim = getMethod$2(input, TO_PRIMITIVE);
	  var result;
	  if (exoticToPrim) {
	    if (pref === undefined) pref = 'default';
	    result = call$8(exoticToPrim, input, pref);
	    if (!isObject$5(result) || isSymbol$1(result)) return result;
	    throw new $TypeError$5("Can't convert object to primitive value");
	  }
	  if (pref === undefined) pref = 'number';
	  return ordinaryToPrimitive(input, pref);
	};

	var toPrimitive = toPrimitive$1;
	var isSymbol = isSymbol$2;

	// `ToPropertyKey` abstract operation
	// https://tc39.es/ecma262/#sec-topropertykey
	var toPropertyKey$2 = function (argument) {
	  var key = toPrimitive(argument, 'string');
	  return isSymbol(key) ? key : key + '';
	};

	var DESCRIPTORS$d = descriptors;
	var IE8_DOM_DEFINE$1 = ie8DomDefine;
	var V8_PROTOTYPE_DEFINE_BUG$1 = v8PrototypeDefineBug;
	var anObject$7 = anObject$8;
	var toPropertyKey$1 = toPropertyKey$2;

	var $TypeError$4 = TypeError;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var $defineProperty = Object.defineProperty;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor$1 = Object.getOwnPropertyDescriptor;
	var ENUMERABLE = 'enumerable';
	var CONFIGURABLE$1 = 'configurable';
	var WRITABLE = 'writable';

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	objectDefineProperty.f = DESCRIPTORS$d ? V8_PROTOTYPE_DEFINE_BUG$1 ? function defineProperty(O, P, Attributes) {
	  anObject$7(O);
	  P = toPropertyKey$1(P);
	  anObject$7(Attributes);
	  if (typeof O === 'function' && P === 'prototype' && 'value' in Attributes && WRITABLE in Attributes && !Attributes[WRITABLE]) {
	    var current = $getOwnPropertyDescriptor$1(O, P);
	    if (current && current[WRITABLE]) {
	      O[P] = Attributes.value;
	      Attributes = {
	        configurable: CONFIGURABLE$1 in Attributes ? Attributes[CONFIGURABLE$1] : current[CONFIGURABLE$1],
	        enumerable: ENUMERABLE in Attributes ? Attributes[ENUMERABLE] : current[ENUMERABLE],
	        writable: false
	      };
	    }
	  } return $defineProperty(O, P, Attributes);
	} : $defineProperty : function defineProperty(O, P, Attributes) {
	  anObject$7(O);
	  P = toPropertyKey$1(P);
	  anObject$7(Attributes);
	  if (IE8_DOM_DEFINE$1) try {
	    return $defineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw new $TypeError$4('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var ceil = Math.ceil;
	var floor$3 = Math.floor;

	// `Math.trunc` method
	// https://tc39.es/ecma262/#sec-math.trunc
	// eslint-disable-next-line es/no-math-trunc -- safe
	var mathTrunc = Math.trunc || function trunc(x) {
	  var n = +x;
	  return (n > 0 ? floor$3 : ceil)(n);
	};

	var trunc = mathTrunc;

	// `ToIntegerOrInfinity` abstract operation
	// https://tc39.es/ecma262/#sec-tointegerorinfinity
	var toIntegerOrInfinity$3 = function (argument) {
	  var number = +argument;
	  // eslint-disable-next-line no-self-compare -- NaN check
	  return number !== number || number === 0 ? 0 : trunc(number);
	};

	var toIntegerOrInfinity$2 = toIntegerOrInfinity$3;

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex$2 = function (index, length) {
	  var integer = toIntegerOrInfinity$2(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	var toIntegerOrInfinity$1 = toIntegerOrInfinity$3;

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength$1 = function (argument) {
	  var len = toIntegerOrInfinity$1(argument);
	  return len > 0 ? min(len, 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var toLength = toLength$1;

	// `LengthOfArrayLike` abstract operation
	// https://tc39.es/ecma262/#sec-lengthofarraylike
	var lengthOfArrayLike$2 = function (obj) {
	  return toLength(obj.length);
	};

	var toIndexedObject$4 = toIndexedObject$5;
	var toAbsoluteIndex$1 = toAbsoluteIndex$2;
	var lengthOfArrayLike$1 = lengthOfArrayLike$2;

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod$1 = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject$4($this);
	    var length = lengthOfArrayLike$1(O);
	    if (length === 0) return !IS_INCLUDES && -1;
	    var index = toAbsoluteIndex$1(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare -- NaN check
	    if (IS_INCLUDES && el !== el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (value !== value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod$1(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod$1(false)
	};

	var hiddenKeys$4 = {};

	var uncurryThis$h = functionUncurryThis;
	var hasOwn$9 = hasOwnProperty_1;
	var toIndexedObject$3 = toIndexedObject$5;
	var indexOf = arrayIncludes.indexOf;
	var hiddenKeys$3 = hiddenKeys$4;

	var push$4 = uncurryThis$h([].push);

	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject$3(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !hasOwn$9(hiddenKeys$3, key) && hasOwn$9(O, key) && push$4(result, key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (hasOwn$9(O, key = names[i++])) {
	    ~indexOf(result, key) || push$4(result, key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys$3 = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var internalObjectKeys$1 = objectKeysInternal;
	var enumBugKeys$2 = enumBugKeys$3;

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	// eslint-disable-next-line es/no-object-keys -- safe
	var objectKeys$2 = Object.keys || function keys(O) {
	  return internalObjectKeys$1(O, enumBugKeys$2);
	};

	var DESCRIPTORS$c = descriptors;
	var V8_PROTOTYPE_DEFINE_BUG = v8PrototypeDefineBug;
	var definePropertyModule$4 = objectDefineProperty;
	var anObject$6 = anObject$8;
	var toIndexedObject$2 = toIndexedObject$5;
	var objectKeys$1 = objectKeys$2;

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	// eslint-disable-next-line es/no-object-defineproperties -- safe
	objectDefineProperties.f = DESCRIPTORS$c && !V8_PROTOTYPE_DEFINE_BUG ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject$6(O);
	  var props = toIndexedObject$2(Properties);
	  var keys = objectKeys$1(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) definePropertyModule$4.f(O, key = keys[index++], props[key]);
	  return O;
	};

	var getBuiltIn$5 = getBuiltIn$7;

	var html$1 = getBuiltIn$5('document', 'documentElement');

	var shared$1 = shared$3;
	var uid = uid$2;

	var keys = shared$1('keys');

	var sharedKey$3 = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	/* global ActiveXObject -- old IE, WSH */
	var anObject$5 = anObject$8;
	var definePropertiesModule = objectDefineProperties;
	var enumBugKeys$1 = enumBugKeys$3;
	var hiddenKeys$2 = hiddenKeys$4;
	var html = html$1;
	var documentCreateElement = documentCreateElement$1;
	var sharedKey$2 = sharedKey$3;

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO$1 = sharedKey$2('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  // eslint-disable-next-line no-useless-assignment -- avoid memory leak
	  activeXDocument = null;
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    activeXDocument = new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = typeof document != 'undefined'
	    ? document.domain && activeXDocument
	      ? NullProtoObjectViaActiveX(activeXDocument) // old IE
	      : NullProtoObjectViaIFrame()
	    : NullProtoObjectViaActiveX(activeXDocument); // WSH
	  var length = enumBugKeys$1.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys$1[length]];
	  return NullProtoObject();
	};

	hiddenKeys$2[IE_PROTO$1] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	// eslint-disable-next-line es/no-object-create -- safe
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject$5(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : definePropertiesModule.f(result, Properties);
	};

	var wellKnownSymbol$9 = wellKnownSymbol$b;
	var create$2 = objectCreate;
	var defineProperty$5 = objectDefineProperty.f;

	var UNSCOPABLES = wellKnownSymbol$9('unscopables');
	var ArrayPrototype$1 = Array.prototype;

	// Array.prototype[@@unscopables]
	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	if (ArrayPrototype$1[UNSCOPABLES] === undefined) {
	  defineProperty$5(ArrayPrototype$1, UNSCOPABLES, {
	    configurable: true,
	    value: create$2(null)
	  });
	}

	// add a key to Array.prototype[@@unscopables]
	var addToUnscopables$1 = function (key) {
	  ArrayPrototype$1[UNSCOPABLES][key] = true;
	};

	var iterators = {};

	var globalThis$7 = globalThis_1;
	var isCallable$a = isCallable$g;

	var WeakMap$2 = globalThis$7.WeakMap;

	var weakMapBasicDetection = isCallable$a(WeakMap$2) && /native code/.test(String(WeakMap$2));

	var createPropertyDescriptor$5 = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var DESCRIPTORS$b = descriptors;
	var definePropertyModule$3 = objectDefineProperty;
	var createPropertyDescriptor$4 = createPropertyDescriptor$5;

	var createNonEnumerableProperty$3 = DESCRIPTORS$b ? function (object, key, value) {
	  return definePropertyModule$3.f(object, key, createPropertyDescriptor$4(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var NATIVE_WEAK_MAP = weakMapBasicDetection;
	var globalThis$6 = globalThis_1;
	var isObject$4 = isObject$9;
	var createNonEnumerableProperty$2 = createNonEnumerableProperty$3;
	var hasOwn$8 = hasOwnProperty_1;
	var shared = sharedStore.exports;
	var sharedKey$1 = sharedKey$3;
	var hiddenKeys$1 = hiddenKeys$4;

	var OBJECT_ALREADY_INITIALIZED = 'Object already initialized';
	var TypeError$3 = globalThis$6.TypeError;
	var WeakMap$1 = globalThis$6.WeakMap;
	var set, get, has;

	var enforce = function (it) {
	  return has(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject$4(it) || (state = get(it)).type !== TYPE) {
	      throw new TypeError$3('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (NATIVE_WEAK_MAP || shared.state) {
	  var store$1 = shared.state || (shared.state = new WeakMap$1());
	  /* eslint-disable no-self-assign -- prototype methods protection */
	  store$1.get = store$1.get;
	  store$1.has = store$1.has;
	  store$1.set = store$1.set;
	  /* eslint-enable no-self-assign -- prototype methods protection */
	  set = function (it, metadata) {
	    if (store$1.has(it)) throw new TypeError$3(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    store$1.set(it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return store$1.get(it) || {};
	  };
	  has = function (it) {
	    return store$1.has(it);
	  };
	} else {
	  var STATE = sharedKey$1('state');
	  hiddenKeys$1[STATE] = true;
	  set = function (it, metadata) {
	    if (hasOwn$8(it, STATE)) throw new TypeError$3(OBJECT_ALREADY_INITIALIZED);
	    metadata.facade = it;
	    createNonEnumerableProperty$2(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return hasOwn$8(it, STATE) ? it[STATE] : {};
	  };
	  has = function (it) {
	    return hasOwn$8(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var objectGetOwnPropertyDescriptor = {};

	var objectPropertyIsEnumerable = {};

	var $propertyIsEnumerable = {}.propertyIsEnumerable;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor$2 = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor$2 && !$propertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	objectPropertyIsEnumerable.f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor$2(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : $propertyIsEnumerable;

	var DESCRIPTORS$a = descriptors;
	var call$7 = functionCall;
	var propertyIsEnumerableModule$1 = objectPropertyIsEnumerable;
	var createPropertyDescriptor$3 = createPropertyDescriptor$5;
	var toIndexedObject$1 = toIndexedObject$5;
	var toPropertyKey = toPropertyKey$2;
	var hasOwn$7 = hasOwnProperty_1;
	var IE8_DOM_DEFINE = ie8DomDefine;

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var $getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	objectGetOwnPropertyDescriptor.f = DESCRIPTORS$a ? $getOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject$1(O);
	  P = toPropertyKey(P);
	  if (IE8_DOM_DEFINE) try {
	    return $getOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (hasOwn$7(O, P)) return createPropertyDescriptor$3(!call$7(propertyIsEnumerableModule$1.f, O, P), O[P]);
	};

	var makeBuiltIn$3 = {exports: {}};

	var DESCRIPTORS$9 = descriptors;
	var hasOwn$6 = hasOwnProperty_1;

	var FunctionPrototype = Function.prototype;
	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getDescriptor = DESCRIPTORS$9 && Object.getOwnPropertyDescriptor;

	var EXISTS = hasOwn$6(FunctionPrototype, 'name');
	// additional protection from minified / mangled / dropped function names
	var PROPER = EXISTS && (function something() { /* empty */ }).name === 'something';
	var CONFIGURABLE = EXISTS && (!DESCRIPTORS$9 || (DESCRIPTORS$9 && getDescriptor(FunctionPrototype, 'name').configurable));

	var functionName = {
	  EXISTS: EXISTS,
	  PROPER: PROPER,
	  CONFIGURABLE: CONFIGURABLE
	};

	var uncurryThis$g = functionUncurryThis;
	var isCallable$9 = isCallable$g;
	var store = sharedStore.exports;

	var functionToString = uncurryThis$g(Function.toString);

	// this helper broken in `core-js@3.4.1-3.4.4`, so we can't use `shared` helper
	if (!isCallable$9(store.inspectSource)) {
	  store.inspectSource = function (it) {
	    return functionToString(it);
	  };
	}

	var inspectSource$2 = store.inspectSource;

	var uncurryThis$f = functionUncurryThis;
	var fails$7 = fails$e;
	var isCallable$8 = isCallable$g;
	var hasOwn$5 = hasOwnProperty_1;
	var DESCRIPTORS$8 = descriptors;
	var CONFIGURABLE_FUNCTION_NAME$1 = functionName.CONFIGURABLE;
	var inspectSource$1 = inspectSource$2;
	var InternalStateModule$4 = internalState;

	var enforceInternalState = InternalStateModule$4.enforce;
	var getInternalState$2 = InternalStateModule$4.get;
	var $String$2 = String;
	// eslint-disable-next-line es/no-object-defineproperty -- safe
	var defineProperty$4 = Object.defineProperty;
	var stringSlice$3 = uncurryThis$f(''.slice);
	var replace$3 = uncurryThis$f(''.replace);
	var join$4 = uncurryThis$f([].join);

	var CONFIGURABLE_LENGTH = DESCRIPTORS$8 && !fails$7(function () {
	  return defineProperty$4(function () { /* empty */ }, 'length', { value: 8 }).length !== 8;
	});

	var TEMPLATE = String(String).split('String');

	var makeBuiltIn$2 = makeBuiltIn$3.exports = function (value, name, options) {
	  if (stringSlice$3($String$2(name), 0, 7) === 'Symbol(') {
	    name = '[' + replace$3($String$2(name), /^Symbol\(([^)]*)\).*$/, '$1') + ']';
	  }
	  if (options && options.getter) name = 'get ' + name;
	  if (options && options.setter) name = 'set ' + name;
	  if (!hasOwn$5(value, 'name') || (CONFIGURABLE_FUNCTION_NAME$1 && value.name !== name)) {
	    if (DESCRIPTORS$8) defineProperty$4(value, 'name', { value: name, configurable: true });
	    else value.name = name;
	  }
	  if (CONFIGURABLE_LENGTH && options && hasOwn$5(options, 'arity') && value.length !== options.arity) {
	    defineProperty$4(value, 'length', { value: options.arity });
	  }
	  try {
	    if (options && hasOwn$5(options, 'constructor') && options.constructor) {
	      if (DESCRIPTORS$8) defineProperty$4(value, 'prototype', { writable: false });
	    // in V8 ~ Chrome 53, prototypes of some methods, like `Array.prototype.values`, are non-writable
	    } else if (value.prototype) value.prototype = undefined;
	  } catch (error) { /* empty */ }
	  var state = enforceInternalState(value);
	  if (!hasOwn$5(state, 'source')) {
	    state.source = join$4(TEMPLATE, typeof name == 'string' ? name : '');
	  } return value;
	};

	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	// eslint-disable-next-line no-extend-native -- required
	Function.prototype.toString = makeBuiltIn$2(function toString() {
	  return isCallable$8(this) && getInternalState$2(this).source || inspectSource$1(this);
	}, 'toString');

	var isCallable$7 = isCallable$g;
	var definePropertyModule$2 = objectDefineProperty;
	var makeBuiltIn$1 = makeBuiltIn$3.exports;
	var defineGlobalProperty$1 = defineGlobalProperty$3;

	var defineBuiltIn$8 = function (O, key, value, options) {
	  if (!options) options = {};
	  var simple = options.enumerable;
	  var name = options.name !== undefined ? options.name : key;
	  if (isCallable$7(value)) makeBuiltIn$1(value, name, options);
	  if (options.global) {
	    if (simple) O[key] = value;
	    else defineGlobalProperty$1(key, value);
	  } else {
	    try {
	      if (!options.unsafe) delete O[key];
	      else if (O[key]) simple = true;
	    } catch (error) { /* empty */ }
	    if (simple) O[key] = value;
	    else definePropertyModule$2.f(O, key, {
	      value: value,
	      enumerable: false,
	      configurable: !options.nonConfigurable,
	      writable: !options.nonWritable
	    });
	  } return O;
	};

	var objectGetOwnPropertyNames = {};

	var internalObjectKeys = objectKeysInternal;
	var enumBugKeys = enumBugKeys$3;

	var hiddenKeys = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	// eslint-disable-next-line es/no-object-getownpropertynames -- safe
	objectGetOwnPropertyNames.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return internalObjectKeys(O, hiddenKeys);
	};

	var objectGetOwnPropertySymbols = {};

	// eslint-disable-next-line es/no-object-getownpropertysymbols -- safe
	objectGetOwnPropertySymbols.f = Object.getOwnPropertySymbols;

	var getBuiltIn$4 = getBuiltIn$7;
	var uncurryThis$e = functionUncurryThis;
	var getOwnPropertyNamesModule = objectGetOwnPropertyNames;
	var getOwnPropertySymbolsModule$1 = objectGetOwnPropertySymbols;
	var anObject$4 = anObject$8;

	var concat$1 = uncurryThis$e([].concat);

	// all object keys, includes non-enumerable and symbols
	var ownKeys$1 = getBuiltIn$4('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = getOwnPropertyNamesModule.f(anObject$4(it));
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule$1.f;
	  return getOwnPropertySymbols ? concat$1(keys, getOwnPropertySymbols(it)) : keys;
	};

	var hasOwn$4 = hasOwnProperty_1;
	var ownKeys = ownKeys$1;
	var getOwnPropertyDescriptorModule = objectGetOwnPropertyDescriptor;
	var definePropertyModule$1 = objectDefineProperty;

	var copyConstructorProperties$1 = function (target, source, exceptions) {
	  var keys = ownKeys(source);
	  var defineProperty = definePropertyModule$1.f;
	  var getOwnPropertyDescriptor = getOwnPropertyDescriptorModule.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!hasOwn$4(target, key) && !(exceptions && hasOwn$4(exceptions, key))) {
	      defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	    }
	  }
	};

	var fails$6 = fails$e;
	var isCallable$6 = isCallable$g;

	var replacement = /#|\.prototype\./;

	var isForced$1 = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value === POLYFILL ? true
	    : value === NATIVE ? false
	    : isCallable$6(detection) ? fails$6(detection)
	    : !!detection;
	};

	var normalize = isForced$1.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced$1.data = {};
	var NATIVE = isForced$1.NATIVE = 'N';
	var POLYFILL = isForced$1.POLYFILL = 'P';

	var isForced_1 = isForced$1;

	var globalThis$5 = globalThis_1;
	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;
	var createNonEnumerableProperty$1 = createNonEnumerableProperty$3;
	var defineBuiltIn$7 = defineBuiltIn$8;
	var defineGlobalProperty = defineGlobalProperty$3;
	var copyConstructorProperties = copyConstructorProperties$1;
	var isForced = isForced_1;

	/*
	  options.target         - name of the target object
	  options.global         - target is the global object
	  options.stat           - export as static methods of target
	  options.proto          - export as prototype methods of target
	  options.real           - real prototype method for the `pure` version
	  options.forced         - export even if the native feature is available
	  options.bind           - bind methods to the target, required for the `pure` version
	  options.wrap           - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe         - use the simple assignment of property instead of delete + defineProperty
	  options.sham           - add a flag to not completely full polyfills
	  options.enumerable     - export as enumerable property
	  options.dontCallGetSet - prevent calling a getter on target
	  options.name           - the .name of the function if it does not match the key
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = globalThis$5;
	  } else if (STATIC) {
	    target = globalThis$5[TARGET] || defineGlobalProperty(TARGET, {});
	  } else {
	    target = globalThis$5[TARGET] && globalThis$5[TARGET].prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.dontCallGetSet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty == typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty$1(sourceProperty, 'sham', true);
	    }
	    defineBuiltIn$7(target, key, sourceProperty, options);
	  }
	};

	var fails$5 = fails$e;

	var correctPrototypeGetter = !fails$5(function () {
	  function F() { /* empty */ }
	  F.prototype.constructor = null;
	  // eslint-disable-next-line es/no-object-getprototypeof -- required for testing
	  return Object.getPrototypeOf(new F()) !== F.prototype;
	});

	var hasOwn$3 = hasOwnProperty_1;
	var isCallable$5 = isCallable$g;
	var toObject$2 = toObject$4;
	var sharedKey = sharedKey$3;
	var CORRECT_PROTOTYPE_GETTER = correctPrototypeGetter;

	var IE_PROTO = sharedKey('IE_PROTO');
	var $Object$1 = Object;
	var ObjectPrototype = $Object$1.prototype;

	// `Object.getPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.getprototypeof
	// eslint-disable-next-line es/no-object-getprototypeof -- safe
	var objectGetPrototypeOf = CORRECT_PROTOTYPE_GETTER ? $Object$1.getPrototypeOf : function (O) {
	  var object = toObject$2(O);
	  if (hasOwn$3(object, IE_PROTO)) return object[IE_PROTO];
	  var constructor = object.constructor;
	  if (isCallable$5(constructor) && object instanceof constructor) {
	    return constructor.prototype;
	  } return object instanceof $Object$1 ? ObjectPrototype : null;
	};

	var fails$4 = fails$e;
	var isCallable$4 = isCallable$g;
	var isObject$3 = isObject$9;
	var getPrototypeOf$1 = objectGetPrototypeOf;
	var defineBuiltIn$6 = defineBuiltIn$8;
	var wellKnownSymbol$8 = wellKnownSymbol$b;

	var ITERATOR$5 = wellKnownSymbol$8('iterator');
	var BUGGY_SAFARI_ITERATORS$1 = false;

	// `%IteratorPrototype%` object
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-object
	var IteratorPrototype$2, PrototypeOfArrayIteratorPrototype, arrayIterator;

	/* eslint-disable es/no-array-prototype-keys -- safe */
	if ([].keys) {
	  arrayIterator = [].keys();
	  // Safari 8 has buggy iterators w/o `next`
	  if (!('next' in arrayIterator)) BUGGY_SAFARI_ITERATORS$1 = true;
	  else {
	    PrototypeOfArrayIteratorPrototype = getPrototypeOf$1(getPrototypeOf$1(arrayIterator));
	    if (PrototypeOfArrayIteratorPrototype !== Object.prototype) IteratorPrototype$2 = PrototypeOfArrayIteratorPrototype;
	  }
	}

	var NEW_ITERATOR_PROTOTYPE = !isObject$3(IteratorPrototype$2) || fails$4(function () {
	  var test = {};
	  // FF44- legacy iterators case
	  return IteratorPrototype$2[ITERATOR$5].call(test) !== test;
	});

	if (NEW_ITERATOR_PROTOTYPE) IteratorPrototype$2 = {};

	// `%IteratorPrototype%[@@iterator]()` method
	// https://tc39.es/ecma262/#sec-%iteratorprototype%-@@iterator
	if (!isCallable$4(IteratorPrototype$2[ITERATOR$5])) {
	  defineBuiltIn$6(IteratorPrototype$2, ITERATOR$5, function () {
	    return this;
	  });
	}

	var iteratorsCore = {
	  IteratorPrototype: IteratorPrototype$2,
	  BUGGY_SAFARI_ITERATORS: BUGGY_SAFARI_ITERATORS$1
	};

	var defineProperty$3 = objectDefineProperty.f;
	var hasOwn$2 = hasOwnProperty_1;
	var wellKnownSymbol$7 = wellKnownSymbol$b;

	var TO_STRING_TAG$2 = wellKnownSymbol$7('toStringTag');

	var setToStringTag$4 = function (target, TAG, STATIC) {
	  if (target && !STATIC) target = target.prototype;
	  if (target && !hasOwn$2(target, TO_STRING_TAG$2)) {
	    defineProperty$3(target, TO_STRING_TAG$2, { configurable: true, value: TAG });
	  }
	};

	var IteratorPrototype$1 = iteratorsCore.IteratorPrototype;
	var create$1 = objectCreate;
	var createPropertyDescriptor$2 = createPropertyDescriptor$5;
	var setToStringTag$3 = setToStringTag$4;
	var Iterators$4 = iterators;

	var returnThis$1 = function () { return this; };

	var iteratorCreateConstructor = function (IteratorConstructor, NAME, next, ENUMERABLE_NEXT) {
	  var TO_STRING_TAG = NAME + ' Iterator';
	  IteratorConstructor.prototype = create$1(IteratorPrototype$1, { next: createPropertyDescriptor$2(+!ENUMERABLE_NEXT, next) });
	  setToStringTag$3(IteratorConstructor, TO_STRING_TAG, false);
	  Iterators$4[TO_STRING_TAG] = returnThis$1;
	  return IteratorConstructor;
	};

	var uncurryThis$d = functionUncurryThis;
	var aCallable$2 = aCallable$4;

	var functionUncurryThisAccessor = function (object, key, method) {
	  try {
	    // eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	    return uncurryThis$d(aCallable$2(Object.getOwnPropertyDescriptor(object, key)[method]));
	  } catch (error) { /* empty */ }
	};

	var isObject$2 = isObject$9;

	var isPossiblePrototype$1 = function (argument) {
	  return isObject$2(argument) || argument === null;
	};

	var isPossiblePrototype = isPossiblePrototype$1;

	var $String$1 = String;
	var $TypeError$3 = TypeError;

	var aPossiblePrototype$1 = function (argument) {
	  if (isPossiblePrototype(argument)) return argument;
	  throw new $TypeError$3("Can't set " + $String$1(argument) + ' as a prototype');
	};

	/* eslint-disable no-proto -- safe */
	var uncurryThisAccessor = functionUncurryThisAccessor;
	var isObject$1 = isObject$9;
	var requireObjectCoercible$1 = requireObjectCoercible$4;
	var aPossiblePrototype = aPossiblePrototype$1;

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	// eslint-disable-next-line es/no-object-setprototypeof -- safe
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = uncurryThisAccessor(Object.prototype, '__proto__', 'set');
	    setter(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    requireObjectCoercible$1(O);
	    aPossiblePrototype(proto);
	    if (!isObject$1(O)) return O;
	    if (CORRECT_SETTER) setter(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	var $$6 = _export;
	var call$6 = functionCall;
	var FunctionName = functionName;
	var isCallable$3 = isCallable$g;
	var createIteratorConstructor$1 = iteratorCreateConstructor;
	var getPrototypeOf = objectGetPrototypeOf;
	var setPrototypeOf = objectSetPrototypeOf;
	var setToStringTag$2 = setToStringTag$4;
	var createNonEnumerableProperty = createNonEnumerableProperty$3;
	var defineBuiltIn$5 = defineBuiltIn$8;
	var wellKnownSymbol$6 = wellKnownSymbol$b;
	var Iterators$3 = iterators;
	var IteratorsCore = iteratorsCore;

	var PROPER_FUNCTION_NAME = FunctionName.PROPER;
	var CONFIGURABLE_FUNCTION_NAME = FunctionName.CONFIGURABLE;
	var IteratorPrototype = IteratorsCore.IteratorPrototype;
	var BUGGY_SAFARI_ITERATORS = IteratorsCore.BUGGY_SAFARI_ITERATORS;
	var ITERATOR$4 = wellKnownSymbol$6('iterator');
	var KEYS = 'keys';
	var VALUES = 'values';
	var ENTRIES = 'entries';

	var returnThis = function () { return this; };

	var iteratorDefine = function (Iterable, NAME, IteratorConstructor, next, DEFAULT, IS_SET, FORCED) {
	  createIteratorConstructor$1(IteratorConstructor, NAME, next);

	  var getIterationMethod = function (KIND) {
	    if (KIND === DEFAULT && defaultIterator) return defaultIterator;
	    if (!BUGGY_SAFARI_ITERATORS && KIND && KIND in IterablePrototype) return IterablePrototype[KIND];

	    switch (KIND) {
	      case KEYS: return function keys() { return new IteratorConstructor(this, KIND); };
	      case VALUES: return function values() { return new IteratorConstructor(this, KIND); };
	      case ENTRIES: return function entries() { return new IteratorConstructor(this, KIND); };
	    }

	    return function () { return new IteratorConstructor(this); };
	  };

	  var TO_STRING_TAG = NAME + ' Iterator';
	  var INCORRECT_VALUES_NAME = false;
	  var IterablePrototype = Iterable.prototype;
	  var nativeIterator = IterablePrototype[ITERATOR$4]
	    || IterablePrototype['@@iterator']
	    || DEFAULT && IterablePrototype[DEFAULT];
	  var defaultIterator = !BUGGY_SAFARI_ITERATORS && nativeIterator || getIterationMethod(DEFAULT);
	  var anyNativeIterator = NAME === 'Array' ? IterablePrototype.entries || nativeIterator : nativeIterator;
	  var CurrentIteratorPrototype, methods, KEY;

	  // fix native
	  if (anyNativeIterator) {
	    CurrentIteratorPrototype = getPrototypeOf(anyNativeIterator.call(new Iterable()));
	    if (CurrentIteratorPrototype !== Object.prototype && CurrentIteratorPrototype.next) {
	      if (getPrototypeOf(CurrentIteratorPrototype) !== IteratorPrototype) {
	        if (setPrototypeOf) {
	          setPrototypeOf(CurrentIteratorPrototype, IteratorPrototype);
	        } else if (!isCallable$3(CurrentIteratorPrototype[ITERATOR$4])) {
	          defineBuiltIn$5(CurrentIteratorPrototype, ITERATOR$4, returnThis);
	        }
	      }
	      // Set @@toStringTag to native iterators
	      setToStringTag$2(CurrentIteratorPrototype, TO_STRING_TAG, true);
	    }
	  }

	  // fix Array.prototype.{ values, @@iterator }.name in V8 / FF
	  if (PROPER_FUNCTION_NAME && DEFAULT === VALUES && nativeIterator && nativeIterator.name !== VALUES) {
	    if (CONFIGURABLE_FUNCTION_NAME) {
	      createNonEnumerableProperty(IterablePrototype, 'name', VALUES);
	    } else {
	      INCORRECT_VALUES_NAME = true;
	      defaultIterator = function values() { return call$6(nativeIterator, this); };
	    }
	  }

	  // export additional methods
	  if (DEFAULT) {
	    methods = {
	      values: getIterationMethod(VALUES),
	      keys: IS_SET ? defaultIterator : getIterationMethod(KEYS),
	      entries: getIterationMethod(ENTRIES)
	    };
	    if (FORCED) for (KEY in methods) {
	      if (BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME || !(KEY in IterablePrototype)) {
	        defineBuiltIn$5(IterablePrototype, KEY, methods[KEY]);
	      }
	    } else $$6({ target: NAME, proto: true, forced: BUGGY_SAFARI_ITERATORS || INCORRECT_VALUES_NAME }, methods);
	  }

	  // define iterator
	  if (IterablePrototype[ITERATOR$4] !== defaultIterator) {
	    defineBuiltIn$5(IterablePrototype, ITERATOR$4, defaultIterator, { name: DEFAULT });
	  }
	  Iterators$3[NAME] = defaultIterator;

	  return methods;
	};

	// `CreateIterResultObject` abstract operation
	// https://tc39.es/ecma262/#sec-createiterresultobject
	var createIterResultObject$3 = function (value, done) {
	  return { value: value, done: done };
	};

	var toIndexedObject = toIndexedObject$5;
	var addToUnscopables = addToUnscopables$1;
	var Iterators$2 = iterators;
	var InternalStateModule$3 = internalState;
	var defineProperty$2 = objectDefineProperty.f;
	var defineIterator$1 = iteratorDefine;
	var createIterResultObject$2 = createIterResultObject$3;
	var DESCRIPTORS$7 = descriptors;

	var ARRAY_ITERATOR = 'Array Iterator';
	var setInternalState$3 = InternalStateModule$3.set;
	var getInternalState$1 = InternalStateModule$3.getterFor(ARRAY_ITERATOR);

	// `Array.prototype.entries` method
	// https://tc39.es/ecma262/#sec-array.prototype.entries
	// `Array.prototype.keys` method
	// https://tc39.es/ecma262/#sec-array.prototype.keys
	// `Array.prototype.values` method
	// https://tc39.es/ecma262/#sec-array.prototype.values
	// `Array.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-array.prototype-@@iterator
	// `CreateArrayIterator` internal method
	// https://tc39.es/ecma262/#sec-createarrayiterator
	defineIterator$1(Array, 'Array', function (iterated, kind) {
	  setInternalState$3(this, {
	    type: ARRAY_ITERATOR,
	    target: toIndexedObject(iterated), // target
	    index: 0,                          // next index
	    kind: kind                         // kind
	  });
	// `%ArrayIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%arrayiteratorprototype%.next
	}, function () {
	  var state = getInternalState$1(this);
	  var target = state.target;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = null;
	    return createIterResultObject$2(undefined, true);
	  }
	  switch (state.kind) {
	    case 'keys': return createIterResultObject$2(index, false);
	    case 'values': return createIterResultObject$2(target[index], false);
	  } return createIterResultObject$2([index, target[index]], false);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values%
	// https://tc39.es/ecma262/#sec-createunmappedargumentsobject
	// https://tc39.es/ecma262/#sec-createmappedargumentsobject
	var values = Iterators$2.Arguments = Iterators$2.Array;

	// https://tc39.es/ecma262/#sec-array.prototype-@@unscopables
	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');

	// V8 ~ Chrome 45- bug
	if (DESCRIPTORS$7 && values.name !== 'values') try {
	  defineProperty$2(values, 'name', { value: 'values' });
	} catch (error) { /* empty */ }

	var $$5 = _export;
	var uncurryThis$c = functionUncurryThis;
	var toAbsoluteIndex = toAbsoluteIndex$2;

	var $RangeError$1 = RangeError;
	var fromCharCode$2 = String.fromCharCode;
	// eslint-disable-next-line es/no-string-fromcodepoint -- required for testing
	var $fromCodePoint = String.fromCodePoint;
	var join$3 = uncurryThis$c([].join);

	// length should be 1, old FF problem
	var INCORRECT_LENGTH = !!$fromCodePoint && $fromCodePoint.length !== 1;

	// `String.fromCodePoint` method
	// https://tc39.es/ecma262/#sec-string.fromcodepoint
	$$5({ target: 'String', stat: true, arity: 1, forced: INCORRECT_LENGTH }, {
	  // eslint-disable-next-line no-unused-vars -- required for `.length`
	  fromCodePoint: function fromCodePoint(x) {
	    var elements = [];
	    var length = arguments.length;
	    var i = 0;
	    var code;
	    while (length > i) {
	      code = +arguments[i++];
	      if (toAbsoluteIndex(code, 0x10FFFF) !== code) throw new $RangeError$1(code + ' is not a valid code point');
	      elements[i] = code < 0x10000
	        ? fromCharCode$2(code)
	        : fromCharCode$2(((code -= 0x10000) >> 10) + 0xD800, code % 0x400 + 0xDC00);
	    } return join$3(elements, '');
	  }
	});

	var globalThis$4 = globalThis_1;
	var DESCRIPTORS$6 = descriptors;

	// eslint-disable-next-line es/no-object-getownpropertydescriptor -- safe
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Avoid NodeJS experimental warning
	var safeGetBuiltIn$1 = function (name) {
	  if (!DESCRIPTORS$6) return globalThis$4[name];
	  var descriptor = getOwnPropertyDescriptor(globalThis$4, name);
	  return descriptor && descriptor.value;
	};

	var fails$3 = fails$e;
	var wellKnownSymbol$5 = wellKnownSymbol$b;
	var DESCRIPTORS$5 = descriptors;
	var IS_PURE = isPure;

	var ITERATOR$3 = wellKnownSymbol$5('iterator');

	var urlConstructorDetection = !fails$3(function () {
	  // eslint-disable-next-line unicorn/relative-url-style -- required for testing
	  var url = new URL('b?a=1&b=2&c=3', 'https://a');
	  var params = url.searchParams;
	  var params2 = new URLSearchParams('a=1&a=2&b=3');
	  var result = '';
	  url.pathname = 'c%20d';
	  params.forEach(function (value, key) {
	    params['delete']('b');
	    result += key + value;
	  });
	  params2['delete']('a', 2);
	  // `undefined` case is a Chromium 117 bug
	  // https://bugs.chromium.org/p/v8/issues/detail?id=14222
	  params2['delete']('b', undefined);
	  return (IS_PURE && (!url.toJSON || !params2.has('a', 1) || params2.has('a', 2) || !params2.has('a', undefined) || params2.has('b')))
	    || (!params.size && (IS_PURE || !DESCRIPTORS$5))
	    || !params.sort
	    || url.href !== 'https://a/c%20d?a=1&c=3'
	    || params.get('c') !== '3'
	    || String(new URLSearchParams('?a=1')) !== 'a=1'
	    || !params[ITERATOR$3]
	    // throws in Edge
	    || new URL('https://a@b').username !== 'a'
	    || new URLSearchParams(new URLSearchParams('a=b')).get('a') !== 'b'
	    // not punycoded in Edge
	    || new URL('https://тест').host !== 'xn--e1aybc'
	    // not escaped in Chrome 62-
	    || new URL('https://a#б').hash !== '#%D0%B1'
	    // fails in Chrome 66-
	    || result !== 'a1c3'
	    // throws in Safari
	    || new URL('https://x', undefined).host !== 'x';
	});

	var makeBuiltIn = makeBuiltIn$3.exports;
	var defineProperty$1 = objectDefineProperty;

	var defineBuiltInAccessor$3 = function (target, name, descriptor) {
	  if (descriptor.get) makeBuiltIn(descriptor.get, name, { getter: true });
	  if (descriptor.set) makeBuiltIn(descriptor.set, name, { setter: true });
	  return defineProperty$1.f(target, name, descriptor);
	};

	var defineBuiltIn$4 = defineBuiltIn$8;

	var defineBuiltIns$1 = function (target, src, options) {
	  for (var key in src) defineBuiltIn$4(target, key, src[key], options);
	  return target;
	};

	var isPrototypeOf = objectIsPrototypeOf;

	var $TypeError$2 = TypeError;

	var anInstance$2 = function (it, Prototype) {
	  if (isPrototypeOf(Prototype, it)) return it;
	  throw new $TypeError$2('Incorrect invocation');
	};

	var classofRaw$1 = classofRaw$2;
	var uncurryThis$b = functionUncurryThis;

	var functionUncurryThisClause = function (fn) {
	  // Nashorn bug:
	  //   https://github.com/zloirock/core-js/issues/1128
	  //   https://github.com/zloirock/core-js/issues/1130
	  if (classofRaw$1(fn) === 'Function') return uncurryThis$b(fn);
	};

	var uncurryThis$a = functionUncurryThisClause;
	var aCallable$1 = aCallable$4;
	var NATIVE_BIND = functionBindNative;

	var bind$3 = uncurryThis$a(uncurryThis$a.bind);

	// optional / simple context binding
	var functionBindContext = function (fn, that) {
	  aCallable$1(fn);
	  return that === undefined ? fn : NATIVE_BIND ? bind$3(fn, that) : function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var wellKnownSymbol$4 = wellKnownSymbol$b;

	var TO_STRING_TAG$1 = wellKnownSymbol$4('toStringTag');
	var test = {};

	test[TO_STRING_TAG$1] = 'z';

	var toStringTagSupport = String(test) === '[object z]';

	var TO_STRING_TAG_SUPPORT = toStringTagSupport;
	var isCallable$2 = isCallable$g;
	var classofRaw = classofRaw$2;
	var wellKnownSymbol$3 = wellKnownSymbol$b;

	var TO_STRING_TAG = wellKnownSymbol$3('toStringTag');
	var $Object = Object;

	// ES3 wrong here
	var CORRECT_ARGUMENTS = classofRaw(function () { return arguments; }()) === 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (error) { /* empty */ }
	};

	// getting tag from ES6+ `Object.prototype.toString`
	var classof$4 = TO_STRING_TAG_SUPPORT ? classofRaw : function (it) {
	  var O, tag, result;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (tag = tryGet(O = $Object(it), TO_STRING_TAG)) == 'string' ? tag
	    // builtinTag case
	    : CORRECT_ARGUMENTS ? classofRaw(O)
	    // ES3 arguments fallback
	    : (result = classofRaw(O)) === 'Object' && isCallable$2(O.callee) ? 'Arguments' : result;
	};

	var classof$3 = classof$4;

	var $String = String;

	var toString$6 = function (argument) {
	  if (classof$3(argument) === 'Symbol') throw new TypeError('Cannot convert a Symbol value to a string');
	  return $String(argument);
	};

	var classof$2 = classof$4;
	var getMethod$1 = getMethod$3;
	var isNullOrUndefined = isNullOrUndefined$3;
	var Iterators$1 = iterators;
	var wellKnownSymbol$2 = wellKnownSymbol$b;

	var ITERATOR$2 = wellKnownSymbol$2('iterator');

	var getIteratorMethod$3 = function (it) {
	  if (!isNullOrUndefined(it)) return getMethod$1(it, ITERATOR$2)
	    || getMethod$1(it, '@@iterator')
	    || Iterators$1[classof$2(it)];
	};

	var call$5 = functionCall;
	var aCallable = aCallable$4;
	var anObject$3 = anObject$8;
	var tryToString = tryToString$2;
	var getIteratorMethod$2 = getIteratorMethod$3;

	var $TypeError$1 = TypeError;

	var getIterator$2 = function (argument, usingIterator) {
	  var iteratorMethod = arguments.length < 2 ? getIteratorMethod$2(argument) : usingIterator;
	  if (aCallable(iteratorMethod)) return anObject$3(call$5(iteratorMethod, argument));
	  throw new $TypeError$1(tryToString(argument) + ' is not iterable');
	};

	var $TypeError = TypeError;

	var validateArgumentsLength$6 = function (passed, required) {
	  if (passed < required) throw new $TypeError('Not enough arguments');
	  return passed;
	};

	var uncurryThis$9 = functionUncurryThis;

	var arraySlice$2 = uncurryThis$9([].slice);

	var arraySlice$1 = arraySlice$2;

	var floor$2 = Math.floor;

	var sort = function (array, comparefn) {
	  var length = array.length;

	  if (length < 8) {
	    // insertion sort
	    var i = 1;
	    var element, j;

	    while (i < length) {
	      j = i;
	      element = array[i];
	      while (j && comparefn(array[j - 1], element) > 0) {
	        array[j] = array[--j];
	      }
	      if (j !== i++) array[j] = element;
	    }
	  } else {
	    // merge sort
	    var middle = floor$2(length / 2);
	    var left = sort(arraySlice$1(array, 0, middle), comparefn);
	    var right = sort(arraySlice$1(array, middle), comparefn);
	    var llength = left.length;
	    var rlength = right.length;
	    var lindex = 0;
	    var rindex = 0;

	    while (lindex < llength || rindex < rlength) {
	      array[lindex + rindex] = (lindex < llength && rindex < rlength)
	        ? comparefn(left[lindex], right[rindex]) <= 0 ? left[lindex++] : right[rindex++]
	        : lindex < llength ? left[lindex++] : right[rindex++];
	    }
	  }

	  return array;
	};

	var arraySort$1 = sort;

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`


	var $$4 = _export;
	var globalThis$3 = globalThis_1;
	var safeGetBuiltIn = safeGetBuiltIn$1;
	var getBuiltIn$3 = getBuiltIn$7;
	var call$4 = functionCall;
	var uncurryThis$8 = functionUncurryThis;
	var DESCRIPTORS$4 = descriptors;
	var USE_NATIVE_URL$3 = urlConstructorDetection;
	var defineBuiltIn$3 = defineBuiltIn$8;
	var defineBuiltInAccessor$2 = defineBuiltInAccessor$3;
	var defineBuiltIns = defineBuiltIns$1;
	var setToStringTag$1 = setToStringTag$4;
	var createIteratorConstructor = iteratorCreateConstructor;
	var InternalStateModule$2 = internalState;
	var anInstance$1 = anInstance$2;
	var isCallable$1 = isCallable$g;
	var hasOwn$1 = hasOwnProperty_1;
	var bind$2 = functionBindContext;
	var classof$1 = classof$4;
	var anObject$2 = anObject$8;
	var isObject = isObject$9;
	var $toString$1 = toString$6;
	var create = objectCreate;
	var createPropertyDescriptor$1 = createPropertyDescriptor$5;
	var getIterator$1 = getIterator$2;
	var getIteratorMethod$1 = getIteratorMethod$3;
	var createIterResultObject$1 = createIterResultObject$3;
	var validateArgumentsLength$5 = validateArgumentsLength$6;
	var wellKnownSymbol$1 = wellKnownSymbol$b;
	var arraySort = arraySort$1;

	var ITERATOR$1 = wellKnownSymbol$1('iterator');
	var URL_SEARCH_PARAMS = 'URLSearchParams';
	var URL_SEARCH_PARAMS_ITERATOR = URL_SEARCH_PARAMS + 'Iterator';
	var setInternalState$2 = InternalStateModule$2.set;
	var getInternalParamsState = InternalStateModule$2.getterFor(URL_SEARCH_PARAMS);
	var getInternalIteratorState = InternalStateModule$2.getterFor(URL_SEARCH_PARAMS_ITERATOR);

	var nativeFetch = safeGetBuiltIn('fetch');
	var NativeRequest = safeGetBuiltIn('Request');
	var Headers = safeGetBuiltIn('Headers');
	var RequestPrototype = NativeRequest && NativeRequest.prototype;
	var HeadersPrototype = Headers && Headers.prototype;
	var TypeError$2 = globalThis$3.TypeError;
	var encodeURIComponent$1 = globalThis$3.encodeURIComponent;
	var fromCharCode$1 = String.fromCharCode;
	var fromCodePoint = getBuiltIn$3('String', 'fromCodePoint');
	var $parseInt = parseInt;
	var charAt$3 = uncurryThis$8(''.charAt);
	var join$2 = uncurryThis$8([].join);
	var push$3 = uncurryThis$8([].push);
	var replace$2 = uncurryThis$8(''.replace);
	var shift$1 = uncurryThis$8([].shift);
	var splice = uncurryThis$8([].splice);
	var split$2 = uncurryThis$8(''.split);
	var stringSlice$2 = uncurryThis$8(''.slice);
	var exec$3 = uncurryThis$8(/./.exec);

	var plus = /\+/g;
	var FALLBACK_REPLACER = '\uFFFD';
	var VALID_HEX = /^[0-9a-f]+$/i;

	var parseHexOctet = function (string, start) {
	  var substr = stringSlice$2(string, start, start + 2);
	  if (!exec$3(VALID_HEX, substr)) return NaN;

	  return $parseInt(substr, 16);
	};

	var getLeadingOnes = function (octet) {
	  var count = 0;
	  for (var mask = 0x80; mask > 0 && (octet & mask) !== 0; mask >>= 1) {
	    count++;
	  }
	  return count;
	};

	var utf8Decode = function (octets) {
	  var codePoint = null;

	  switch (octets.length) {
	    case 1:
	      codePoint = octets[0];
	      break;
	    case 2:
	      codePoint = (octets[0] & 0x1F) << 6 | (octets[1] & 0x3F);
	      break;
	    case 3:
	      codePoint = (octets[0] & 0x0F) << 12 | (octets[1] & 0x3F) << 6 | (octets[2] & 0x3F);
	      break;
	    case 4:
	      codePoint = (octets[0] & 0x07) << 18 | (octets[1] & 0x3F) << 12 | (octets[2] & 0x3F) << 6 | (octets[3] & 0x3F);
	      break;
	  }

	  return codePoint > 0x10FFFF ? null : codePoint;
	};

	var decode = function (input) {
	  input = replace$2(input, plus, ' ');
	  var length = input.length;
	  var result = '';
	  var i = 0;

	  while (i < length) {
	    var decodedChar = charAt$3(input, i);

	    if (decodedChar === '%') {
	      if (charAt$3(input, i + 1) === '%' || i + 3 > length) {
	        result += '%';
	        i++;
	        continue;
	      }

	      var octet = parseHexOctet(input, i + 1);

	      // eslint-disable-next-line no-self-compare -- NaN check
	      if (octet !== octet) {
	        result += decodedChar;
	        i++;
	        continue;
	      }

	      i += 2;
	      var byteSequenceLength = getLeadingOnes(octet);

	      if (byteSequenceLength === 0) {
	        decodedChar = fromCharCode$1(octet);
	      } else {
	        if (byteSequenceLength === 1 || byteSequenceLength > 4) {
	          result += FALLBACK_REPLACER;
	          i++;
	          continue;
	        }

	        var octets = [octet];
	        var sequenceIndex = 1;

	        while (sequenceIndex < byteSequenceLength) {
	          i++;
	          if (i + 3 > length || charAt$3(input, i) !== '%') break;

	          var nextByte = parseHexOctet(input, i + 1);

	          // eslint-disable-next-line no-self-compare -- NaN check
	          if (nextByte !== nextByte) {
	            i += 3;
	            break;
	          }
	          if (nextByte > 191 || nextByte < 128) break;

	          push$3(octets, nextByte);
	          i += 2;
	          sequenceIndex++;
	        }

	        if (octets.length !== byteSequenceLength) {
	          result += FALLBACK_REPLACER;
	          continue;
	        }

	        var codePoint = utf8Decode(octets);
	        if (codePoint === null) {
	          result += FALLBACK_REPLACER;
	        } else {
	          decodedChar = fromCodePoint(codePoint);
	        }
	      }
	    }

	    result += decodedChar;
	    i++;
	  }

	  return result;
	};

	var find = /[!'()~]|%20/g;

	var replacements = {
	  '!': '%21',
	  "'": '%27',
	  '(': '%28',
	  ')': '%29',
	  '~': '%7E',
	  '%20': '+'
	};

	var replacer = function (match) {
	  return replacements[match];
	};

	var serialize = function (it) {
	  return replace$2(encodeURIComponent$1(it), find, replacer);
	};

	var URLSearchParamsIterator = createIteratorConstructor(function Iterator(params, kind) {
	  setInternalState$2(this, {
	    type: URL_SEARCH_PARAMS_ITERATOR,
	    target: getInternalParamsState(params).entries,
	    index: 0,
	    kind: kind
	  });
	}, URL_SEARCH_PARAMS, function next() {
	  var state = getInternalIteratorState(this);
	  var target = state.target;
	  var index = state.index++;
	  if (!target || index >= target.length) {
	    state.target = null;
	    return createIterResultObject$1(undefined, true);
	  }
	  var entry = target[index];
	  switch (state.kind) {
	    case 'keys': return createIterResultObject$1(entry.key, false);
	    case 'values': return createIterResultObject$1(entry.value, false);
	  } return createIterResultObject$1([entry.key, entry.value], false);
	}, true);

	var URLSearchParamsState = function (init) {
	  this.entries = [];
	  this.url = null;

	  if (init !== undefined) {
	    if (isObject(init)) this.parseObject(init);
	    else this.parseQuery(typeof init == 'string' ? charAt$3(init, 0) === '?' ? stringSlice$2(init, 1) : init : $toString$1(init));
	  }
	};

	URLSearchParamsState.prototype = {
	  type: URL_SEARCH_PARAMS,
	  bindURL: function (url) {
	    this.url = url;
	    this.update();
	  },
	  parseObject: function (object) {
	    var entries = this.entries;
	    var iteratorMethod = getIteratorMethod$1(object);
	    var iterator, next, step, entryIterator, entryNext, first, second;

	    if (iteratorMethod) {
	      iterator = getIterator$1(object, iteratorMethod);
	      next = iterator.next;
	      while (!(step = call$4(next, iterator)).done) {
	        entryIterator = getIterator$1(anObject$2(step.value));
	        entryNext = entryIterator.next;
	        if (
	          (first = call$4(entryNext, entryIterator)).done ||
	          (second = call$4(entryNext, entryIterator)).done ||
	          !call$4(entryNext, entryIterator).done
	        ) throw new TypeError$2('Expected sequence with length 2');
	        push$3(entries, { key: $toString$1(first.value), value: $toString$1(second.value) });
	      }
	    } else for (var key in object) if (hasOwn$1(object, key)) {
	      push$3(entries, { key: key, value: $toString$1(object[key]) });
	    }
	  },
	  parseQuery: function (query) {
	    if (query) {
	      var entries = this.entries;
	      var attributes = split$2(query, '&');
	      var index = 0;
	      var attribute, entry;
	      while (index < attributes.length) {
	        attribute = attributes[index++];
	        if (attribute.length) {
	          entry = split$2(attribute, '=');
	          push$3(entries, {
	            key: decode(shift$1(entry)),
	            value: decode(join$2(entry, '='))
	          });
	        }
	      }
	    }
	  },
	  serialize: function () {
	    var entries = this.entries;
	    var result = [];
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      push$3(result, serialize(entry.key) + '=' + serialize(entry.value));
	    } return join$2(result, '&');
	  },
	  update: function () {
	    this.entries.length = 0;
	    this.parseQuery(this.url.query);
	  },
	  updateURL: function () {
	    if (this.url) this.url.update();
	  }
	};

	// `URLSearchParams` constructor
	// https://url.spec.whatwg.org/#interface-urlsearchparams
	var URLSearchParamsConstructor = function URLSearchParams(/* init */) {
	  anInstance$1(this, URLSearchParamsPrototype$3);
	  var init = arguments.length > 0 ? arguments[0] : undefined;
	  var state = setInternalState$2(this, new URLSearchParamsState(init));
	  if (!DESCRIPTORS$4) this.size = state.entries.length;
	};

	var URLSearchParamsPrototype$3 = URLSearchParamsConstructor.prototype;

	defineBuiltIns(URLSearchParamsPrototype$3, {
	  // `URLSearchParams.prototype.append` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-append
	  append: function append(name, value) {
	    var state = getInternalParamsState(this);
	    validateArgumentsLength$5(arguments.length, 2);
	    push$3(state.entries, { key: $toString$1(name), value: $toString$1(value) });
	    if (!DESCRIPTORS$4) this.length++;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.delete` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-delete
	  'delete': function (name /* , value */) {
	    var state = getInternalParamsState(this);
	    var length = validateArgumentsLength$5(arguments.length, 1);
	    var entries = state.entries;
	    var key = $toString$1(name);
	    var $value = length < 2 ? undefined : arguments[1];
	    var value = $value === undefined ? $value : $toString$1($value);
	    var index = 0;
	    while (index < entries.length) {
	      var entry = entries[index];
	      if (entry.key === key && (value === undefined || entry.value === value)) {
	        splice(entries, index, 1);
	        if (value !== undefined) break;
	      } else index++;
	    }
	    if (!DESCRIPTORS$4) this.size = entries.length;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.get` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-get
	  get: function get(name) {
	    var entries = getInternalParamsState(this).entries;
	    validateArgumentsLength$5(arguments.length, 1);
	    var key = $toString$1(name);
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) return entries[index].value;
	    }
	    return null;
	  },
	  // `URLSearchParams.prototype.getAll` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-getall
	  getAll: function getAll(name) {
	    var entries = getInternalParamsState(this).entries;
	    validateArgumentsLength$5(arguments.length, 1);
	    var key = $toString$1(name);
	    var result = [];
	    var index = 0;
	    for (; index < entries.length; index++) {
	      if (entries[index].key === key) push$3(result, entries[index].value);
	    }
	    return result;
	  },
	  // `URLSearchParams.prototype.has` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-has
	  has: function has(name /* , value */) {
	    var entries = getInternalParamsState(this).entries;
	    var length = validateArgumentsLength$5(arguments.length, 1);
	    var key = $toString$1(name);
	    var $value = length < 2 ? undefined : arguments[1];
	    var value = $value === undefined ? $value : $toString$1($value);
	    var index = 0;
	    while (index < entries.length) {
	      var entry = entries[index++];
	      if (entry.key === key && (value === undefined || entry.value === value)) return true;
	    }
	    return false;
	  },
	  // `URLSearchParams.prototype.set` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-set
	  set: function set(name, value) {
	    var state = getInternalParamsState(this);
	    validateArgumentsLength$5(arguments.length, 1);
	    var entries = state.entries;
	    var found = false;
	    var key = $toString$1(name);
	    var val = $toString$1(value);
	    var index = 0;
	    var entry;
	    for (; index < entries.length; index++) {
	      entry = entries[index];
	      if (entry.key === key) {
	        if (found) splice(entries, index--, 1);
	        else {
	          found = true;
	          entry.value = val;
	        }
	      }
	    }
	    if (!found) push$3(entries, { key: key, value: val });
	    if (!DESCRIPTORS$4) this.size = entries.length;
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.sort` method
	  // https://url.spec.whatwg.org/#dom-urlsearchparams-sort
	  sort: function sort() {
	    var state = getInternalParamsState(this);
	    arraySort(state.entries, function (a, b) {
	      return a.key > b.key ? 1 : -1;
	    });
	    state.updateURL();
	  },
	  // `URLSearchParams.prototype.forEach` method
	  forEach: function forEach(callback /* , thisArg */) {
	    var entries = getInternalParamsState(this).entries;
	    var boundFunction = bind$2(callback, arguments.length > 1 ? arguments[1] : undefined);
	    var index = 0;
	    var entry;
	    while (index < entries.length) {
	      entry = entries[index++];
	      boundFunction(entry.value, entry.key, this);
	    }
	  },
	  // `URLSearchParams.prototype.keys` method
	  keys: function keys() {
	    return new URLSearchParamsIterator(this, 'keys');
	  },
	  // `URLSearchParams.prototype.values` method
	  values: function values() {
	    return new URLSearchParamsIterator(this, 'values');
	  },
	  // `URLSearchParams.prototype.entries` method
	  entries: function entries() {
	    return new URLSearchParamsIterator(this, 'entries');
	  }
	}, { enumerable: true });

	// `URLSearchParams.prototype[@@iterator]` method
	defineBuiltIn$3(URLSearchParamsPrototype$3, ITERATOR$1, URLSearchParamsPrototype$3.entries, { name: 'entries' });

	// `URLSearchParams.prototype.toString` method
	// https://url.spec.whatwg.org/#urlsearchparams-stringification-behavior
	defineBuiltIn$3(URLSearchParamsPrototype$3, 'toString', function toString() {
	  return getInternalParamsState(this).serialize();
	}, { enumerable: true });

	// `URLSearchParams.prototype.size` getter
	// https://github.com/whatwg/url/pull/734
	if (DESCRIPTORS$4) defineBuiltInAccessor$2(URLSearchParamsPrototype$3, 'size', {
	  get: function size() {
	    return getInternalParamsState(this).entries.length;
	  },
	  configurable: true,
	  enumerable: true
	});

	setToStringTag$1(URLSearchParamsConstructor, URL_SEARCH_PARAMS);

	$$4({ global: true, constructor: true, forced: !USE_NATIVE_URL$3 }, {
	  URLSearchParams: URLSearchParamsConstructor
	});

	// Wrap `fetch` and `Request` for correct work with polyfilled `URLSearchParams`
	if (!USE_NATIVE_URL$3 && isCallable$1(Headers)) {
	  var headersHas = uncurryThis$8(HeadersPrototype.has);
	  var headersSet = uncurryThis$8(HeadersPrototype.set);

	  var wrapRequestOptions = function (init) {
	    if (isObject(init)) {
	      var body = init.body;
	      var headers;
	      if (classof$1(body) === URL_SEARCH_PARAMS) {
	        headers = init.headers ? new Headers(init.headers) : new Headers();
	        if (!headersHas(headers, 'content-type')) {
	          headersSet(headers, 'content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
	        }
	        return create(init, {
	          body: createPropertyDescriptor$1(0, $toString$1(body)),
	          headers: createPropertyDescriptor$1(0, headers)
	        });
	      }
	    } return init;
	  };

	  if (isCallable$1(nativeFetch)) {
	    $$4({ global: true, enumerable: true, dontCallGetSet: true, forced: true }, {
	      fetch: function fetch(input /* , init */) {
	        return nativeFetch(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
	      }
	    });
	  }

	  if (isCallable$1(NativeRequest)) {
	    var RequestConstructor = function Request(input /* , init */) {
	      anInstance$1(this, RequestPrototype);
	      return new NativeRequest(input, arguments.length > 1 ? wrapRequestOptions(arguments[1]) : {});
	    };

	    RequestPrototype.constructor = RequestConstructor;
	    RequestConstructor.prototype = RequestPrototype;

	    $$4({ global: true, constructor: true, dontCallGetSet: true, forced: true }, {
	      Request: RequestConstructor
	    });
	  }
	}

	var web_urlSearchParams_constructor = {
	  URLSearchParams: URLSearchParamsConstructor,
	  getState: getInternalParamsState
	};

	var defineBuiltIn$2 = defineBuiltIn$8;
	var uncurryThis$7 = functionUncurryThis;
	var toString$5 = toString$6;
	var validateArgumentsLength$4 = validateArgumentsLength$6;

	var $URLSearchParams$1 = URLSearchParams;
	var URLSearchParamsPrototype$2 = $URLSearchParams$1.prototype;
	var append = uncurryThis$7(URLSearchParamsPrototype$2.append);
	var $delete = uncurryThis$7(URLSearchParamsPrototype$2['delete']);
	var forEach$1 = uncurryThis$7(URLSearchParamsPrototype$2.forEach);
	var push$2 = uncurryThis$7([].push);
	var params$1 = new $URLSearchParams$1('a=1&a=2&b=3');

	params$1['delete']('a', 1);
	// `undefined` case is a Chromium 117 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=14222
	params$1['delete']('b', undefined);

	if (params$1 + '' !== 'a=2') {
	  defineBuiltIn$2(URLSearchParamsPrototype$2, 'delete', function (name /* , value */) {
	    var length = arguments.length;
	    var $value = length < 2 ? undefined : arguments[1];
	    if (length && $value === undefined) return $delete(this, name);
	    var entries = [];
	    forEach$1(this, function (v, k) { // also validates `this`
	      push$2(entries, { key: k, value: v });
	    });
	    validateArgumentsLength$4(length, 1);
	    var key = toString$5(name);
	    var value = toString$5($value);
	    var index = 0;
	    var dindex = 0;
	    var found = false;
	    var entriesLength = entries.length;
	    var entry;
	    while (index < entriesLength) {
	      entry = entries[index++];
	      if (found || entry.key === key) {
	        found = true;
	        $delete(this, entry.key);
	      } else dindex++;
	    }
	    while (dindex < entriesLength) {
	      entry = entries[dindex++];
	      if (!(entry.key === key && entry.value === value)) append(this, entry.key, entry.value);
	    }
	  }, { enumerable: true, unsafe: true });
	}

	var defineBuiltIn$1 = defineBuiltIn$8;
	var uncurryThis$6 = functionUncurryThis;
	var toString$4 = toString$6;
	var validateArgumentsLength$3 = validateArgumentsLength$6;

	var $URLSearchParams = URLSearchParams;
	var URLSearchParamsPrototype$1 = $URLSearchParams.prototype;
	var getAll = uncurryThis$6(URLSearchParamsPrototype$1.getAll);
	var $has = uncurryThis$6(URLSearchParamsPrototype$1.has);
	var params = new $URLSearchParams('a=1');

	// `undefined` case is a Chromium 117 bug
	// https://bugs.chromium.org/p/v8/issues/detail?id=14222
	if (params.has('a', 2) || !params.has('a', undefined)) {
	  defineBuiltIn$1(URLSearchParamsPrototype$1, 'has', function has(name /* , value */) {
	    var length = arguments.length;
	    var $value = length < 2 ? undefined : arguments[1];
	    if (length && $value === undefined) return $has(this, name);
	    var values = getAll(this, name); // also validates `this`
	    validateArgumentsLength$3(length, 1);
	    var value = toString$4($value);
	    var index = 0;
	    while (index < values.length) {
	      if (values[index++] === value) return true;
	    } return false;
	  }, { enumerable: true, unsafe: true });
	}

	var DESCRIPTORS$3 = descriptors;
	var uncurryThis$5 = functionUncurryThis;
	var defineBuiltInAccessor$1 = defineBuiltInAccessor$3;

	var URLSearchParamsPrototype = URLSearchParams.prototype;
	var forEach = uncurryThis$5(URLSearchParamsPrototype.forEach);

	// `URLSearchParams.prototype.size` getter
	// https://github.com/whatwg/url/pull/734
	if (DESCRIPTORS$3 && !('size' in URLSearchParamsPrototype)) {
	  defineBuiltInAccessor$1(URLSearchParamsPrototype, 'size', {
	    get: function size() {
	      var count = 0;
	      forEach(this, function () { count++; });
	      return count;
	    },
	    configurable: true,
	    enumerable: true
	  });
	}

	var globalThis$2 = globalThis_1;

	var path$2 = globalThis$2;

	var path$1 = path$2;

	path$1.URLSearchParams;

	var uncurryThis$4 = functionUncurryThis;
	var toIntegerOrInfinity = toIntegerOrInfinity$3;
	var toString$3 = toString$6;
	var requireObjectCoercible = requireObjectCoercible$4;

	var charAt$2 = uncurryThis$4(''.charAt);
	var charCodeAt$1 = uncurryThis$4(''.charCodeAt);
	var stringSlice$1 = uncurryThis$4(''.slice);

	var createMethod = function (CONVERT_TO_STRING) {
	  return function ($this, pos) {
	    var S = toString$3(requireObjectCoercible($this));
	    var position = toIntegerOrInfinity(pos);
	    var size = S.length;
	    var first, second;
	    if (position < 0 || position >= size) return CONVERT_TO_STRING ? '' : undefined;
	    first = charCodeAt$1(S, position);
	    return first < 0xD800 || first > 0xDBFF || position + 1 === size
	      || (second = charCodeAt$1(S, position + 1)) < 0xDC00 || second > 0xDFFF
	        ? CONVERT_TO_STRING
	          ? charAt$2(S, position)
	          : first
	        : CONVERT_TO_STRING
	          ? stringSlice$1(S, position, position + 2)
	          : (first - 0xD800 << 10) + (second - 0xDC00) + 0x10000;
	  };
	};

	var stringMultibyte = {
	  // `String.prototype.codePointAt` method
	  // https://tc39.es/ecma262/#sec-string.prototype.codepointat
	  codeAt: createMethod(false),
	  // `String.prototype.at` method
	  // https://github.com/mathiasbynens/String.prototype.at
	  charAt: createMethod(true)
	};

	var charAt$1 = stringMultibyte.charAt;
	var toString$2 = toString$6;
	var InternalStateModule$1 = internalState;
	var defineIterator = iteratorDefine;
	var createIterResultObject = createIterResultObject$3;

	var STRING_ITERATOR = 'String Iterator';
	var setInternalState$1 = InternalStateModule$1.set;
	var getInternalState = InternalStateModule$1.getterFor(STRING_ITERATOR);

	// `String.prototype[@@iterator]` method
	// https://tc39.es/ecma262/#sec-string.prototype-@@iterator
	defineIterator(String, 'String', function (iterated) {
	  setInternalState$1(this, {
	    type: STRING_ITERATOR,
	    string: toString$2(iterated),
	    index: 0
	  });
	// `%StringIteratorPrototype%.next` method
	// https://tc39.es/ecma262/#sec-%stringiteratorprototype%.next
	}, function next() {
	  var state = getInternalState(this);
	  var string = state.string;
	  var index = state.index;
	  var point;
	  if (index >= string.length) return createIterResultObject(undefined, true);
	  point = charAt$1(string, index);
	  state.index += point.length;
	  return createIterResultObject(point, false);
	});

	var DESCRIPTORS$2 = descriptors;
	var uncurryThis$3 = functionUncurryThis;
	var call$3 = functionCall;
	var fails$2 = fails$e;
	var objectKeys = objectKeys$2;
	var getOwnPropertySymbolsModule = objectGetOwnPropertySymbols;
	var propertyIsEnumerableModule = objectPropertyIsEnumerable;
	var toObject$1 = toObject$4;
	var IndexedObject = indexedObject;

	// eslint-disable-next-line es/no-object-assign -- safe
	var $assign = Object.assign;
	// eslint-disable-next-line es/no-object-defineproperty -- required for testing
	var defineProperty = Object.defineProperty;
	var concat = uncurryThis$3([].concat);

	// `Object.assign` method
	// https://tc39.es/ecma262/#sec-object.assign
	var objectAssign = !$assign || fails$2(function () {
	  // should have correct order of operations (Edge bug)
	  if (DESCRIPTORS$2 && $assign({ b: 1 }, $assign(defineProperty({}, 'a', {
	    enumerable: true,
	    get: function () {
	      defineProperty(this, 'b', {
	        value: 3,
	        enumerable: false
	      });
	    }
	  }), { b: 2 })).b !== 1) return true;
	  // should work with symbols and should have deterministic property order (V8 bug)
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line es/no-symbol -- safe
	  var symbol = Symbol('assign detection');
	  var alphabet = 'abcdefghijklmnopqrst';
	  A[symbol] = 7;
	  // eslint-disable-next-line es/no-array-prototype-foreach -- safe
	  alphabet.split('').forEach(function (chr) { B[chr] = chr; });
	  return $assign({}, A)[symbol] !== 7 || objectKeys($assign({}, B)).join('') !== alphabet;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars -- required for `.length`
	  var T = toObject$1(target);
	  var argumentsLength = arguments.length;
	  var index = 1;
	  var getOwnPropertySymbols = getOwnPropertySymbolsModule.f;
	  var propertyIsEnumerable = propertyIsEnumerableModule.f;
	  while (argumentsLength > index) {
	    var S = IndexedObject(arguments[index++]);
	    var keys = getOwnPropertySymbols ? concat(objectKeys(S), getOwnPropertySymbols(S)) : objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!DESCRIPTORS$2 || call$3(propertyIsEnumerable, S, key)) T[key] = S[key];
	    }
	  } return T;
	} : $assign;

	var call$2 = functionCall;
	var anObject$1 = anObject$8;
	var getMethod = getMethod$3;

	var iteratorClose$1 = function (iterator, kind, value) {
	  var innerResult, innerError;
	  anObject$1(iterator);
	  try {
	    innerResult = getMethod(iterator, 'return');
	    if (!innerResult) {
	      if (kind === 'throw') throw value;
	      return value;
	    }
	    innerResult = call$2(innerResult, iterator);
	  } catch (error) {
	    innerError = true;
	    innerResult = error;
	  }
	  if (kind === 'throw') throw value;
	  if (innerError) throw innerResult;
	  anObject$1(innerResult);
	  return value;
	};

	var anObject = anObject$8;
	var iteratorClose = iteratorClose$1;

	// call something on iterator step with safe closing on error
	var callWithSafeIterationClosing$1 = function (iterator, fn, value, ENTRIES) {
	  try {
	    return ENTRIES ? fn(anObject(value)[0], value[1]) : fn(value);
	  } catch (error) {
	    iteratorClose(iterator, 'throw', error);
	  }
	};

	var wellKnownSymbol = wellKnownSymbol$b;
	var Iterators = iterators;

	var ITERATOR = wellKnownSymbol('iterator');
	var ArrayPrototype = Array.prototype;

	// check on default Array iterator
	var isArrayIteratorMethod$1 = function (it) {
	  return it !== undefined && (Iterators.Array === it || ArrayPrototype[ITERATOR] === it);
	};

	var uncurryThis$2 = functionUncurryThis;
	var fails$1 = fails$e;
	var isCallable = isCallable$g;
	var classof = classof$4;
	var getBuiltIn$2 = getBuiltIn$7;
	var inspectSource = inspectSource$2;

	var noop = function () { /* empty */ };
	var construct = getBuiltIn$2('Reflect', 'construct');
	var constructorRegExp = /^\s*(?:class|function)\b/;
	var exec$2 = uncurryThis$2(constructorRegExp.exec);
	var INCORRECT_TO_STRING = !constructorRegExp.test(noop);

	var isConstructorModern = function isConstructor(argument) {
	  if (!isCallable(argument)) return false;
	  try {
	    construct(noop, [], argument);
	    return true;
	  } catch (error) {
	    return false;
	  }
	};

	var isConstructorLegacy = function isConstructor(argument) {
	  if (!isCallable(argument)) return false;
	  switch (classof(argument)) {
	    case 'AsyncFunction':
	    case 'GeneratorFunction':
	    case 'AsyncGeneratorFunction': return false;
	  }
	  try {
	    // we can't check .prototype since constructors produced by .bind haven't it
	    // `Function#toString` throws on some built-it function in some legacy engines
	    // (for example, `DOMQuad` and similar in FF41-)
	    return INCORRECT_TO_STRING || !!exec$2(constructorRegExp, inspectSource(argument));
	  } catch (error) {
	    return true;
	  }
	};

	isConstructorLegacy.sham = true;

	// `IsConstructor` abstract operation
	// https://tc39.es/ecma262/#sec-isconstructor
	var isConstructor$1 = !construct || fails$1(function () {
	  var called;
	  return isConstructorModern(isConstructorModern.call)
	    || !isConstructorModern(Object)
	    || !isConstructorModern(function () { called = true; })
	    || called;
	}) ? isConstructorLegacy : isConstructorModern;

	var DESCRIPTORS$1 = descriptors;
	var definePropertyModule = objectDefineProperty;
	var createPropertyDescriptor = createPropertyDescriptor$5;

	var createProperty$1 = function (object, key, value) {
	  if (DESCRIPTORS$1) definePropertyModule.f(object, key, createPropertyDescriptor(0, value));
	  else object[key] = value;
	};

	var bind$1 = functionBindContext;
	var call$1 = functionCall;
	var toObject = toObject$4;
	var callWithSafeIterationClosing = callWithSafeIterationClosing$1;
	var isArrayIteratorMethod = isArrayIteratorMethod$1;
	var isConstructor = isConstructor$1;
	var lengthOfArrayLike = lengthOfArrayLike$2;
	var createProperty = createProperty$1;
	var getIterator = getIterator$2;
	var getIteratorMethod = getIteratorMethod$3;

	var $Array = Array;

	// `Array.from` method implementation
	// https://tc39.es/ecma262/#sec-array.from
	var arrayFrom$1 = function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
	  var O = toObject(arrayLike);
	  var IS_CONSTRUCTOR = isConstructor(this);
	  var argumentsLength = arguments.length;
	  var mapfn = argumentsLength > 1 ? arguments[1] : undefined;
	  var mapping = mapfn !== undefined;
	  if (mapping) mapfn = bind$1(mapfn, argumentsLength > 2 ? arguments[2] : undefined);
	  var iteratorMethod = getIteratorMethod(O);
	  var index = 0;
	  var length, result, step, iterator, next, value;
	  // if the target is not iterable or it's an array with the default iterator - use a simple case
	  if (iteratorMethod && !(this === $Array && isArrayIteratorMethod(iteratorMethod))) {
	    result = IS_CONSTRUCTOR ? new this() : [];
	    iterator = getIterator(O, iteratorMethod);
	    next = iterator.next;
	    for (;!(step = call$1(next, iterator)).done; index++) {
	      value = mapping ? callWithSafeIterationClosing(iterator, mapfn, [step.value, index], true) : step.value;
	      createProperty(result, index, value);
	    }
	  } else {
	    length = lengthOfArrayLike(O);
	    result = IS_CONSTRUCTOR ? new this(length) : $Array(length);
	    for (;length > index; index++) {
	      value = mapping ? mapfn(O[index], index) : O[index];
	      createProperty(result, index, value);
	    }
	  }
	  result.length = index;
	  return result;
	};

	// based on https://github.com/bestiejs/punycode.js/blob/master/punycode.js
	var uncurryThis$1 = functionUncurryThis;

	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\0-\u007E]/; // non-ASCII chars
	var regexSeparators = /[.\u3002\uFF0E\uFF61]/g; // RFC 3490 separators
	var OVERFLOW_ERROR = 'Overflow: input needs wider integers to process';
	var baseMinusTMin = base - tMin;

	var $RangeError = RangeError;
	var exec$1 = uncurryThis$1(regexSeparators.exec);
	var floor$1 = Math.floor;
	var fromCharCode = String.fromCharCode;
	var charCodeAt = uncurryThis$1(''.charCodeAt);
	var join$1 = uncurryThis$1([].join);
	var push$1 = uncurryThis$1([].push);
	var replace$1 = uncurryThis$1(''.replace);
	var split$1 = uncurryThis$1(''.split);
	var toLowerCase$1 = uncurryThis$1(''.toLowerCase);

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 */
	var ucs2decode = function (string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  while (counter < length) {
	    var value = charCodeAt(string, counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // It's a high surrogate, and there is a next character.
	      var extra = charCodeAt(string, counter++);
	      if ((extra & 0xFC00) === 0xDC00) { // Low surrogate.
	        push$1(output, ((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // It's an unmatched surrogate; only append this code unit, in case the
	        // next code unit is the high surrogate of a surrogate pair.
	        push$1(output, value);
	        counter--;
	      }
	    } else {
	      push$1(output, value);
	    }
	  }
	  return output;
	};

	/**
	 * Converts a digit/integer into a basic code point.
	 */
	var digitToBasic = function (digit) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26);
	};

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 */
	var adapt = function (delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
	  delta += floor$1(delta / numPoints);
	  while (delta > baseMinusTMin * tMax >> 1) {
	    delta = floor$1(delta / baseMinusTMin);
	    k += base;
	  }
	  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
	};

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 */
	var encode = function (input) {
	  var output = [];

	  // Convert the input in UCS-2 to an array of Unicode code points.
	  input = ucs2decode(input);

	  // Cache the length.
	  var inputLength = input.length;

	  // Initialize the state.
	  var n = initialN;
	  var delta = 0;
	  var bias = initialBias;
	  var i, currentValue;

	  // Handle the basic code points.
	  for (i = 0; i < input.length; i++) {
	    currentValue = input[i];
	    if (currentValue < 0x80) {
	      push$1(output, fromCharCode(currentValue));
	    }
	  }

	  var basicLength = output.length; // number of basic code points.
	  var handledCPCount = basicLength; // number of code points that have been handled;

	  // Finish the basic string with a delimiter unless it's empty.
	  if (basicLength) {
	    push$1(output, delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {
	    // All non-basic code points < n have been handled already. Find the next larger one:
	    var m = maxInt;
	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>, but guard against overflow.
	    var handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
	      throw new $RangeError(OVERFLOW_ERROR);
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (i = 0; i < input.length; i++) {
	      currentValue = input[i];
	      if (currentValue < n && ++delta > maxInt) {
	        throw new $RangeError(OVERFLOW_ERROR);
	      }
	      if (currentValue === n) {
	        // Represent delta as a generalized variable-length integer.
	        var q = delta;
	        var k = base;
	        while (true) {
	          var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
	          if (q < t) break;
	          var qMinusT = q - t;
	          var baseMinusT = base - t;
	          push$1(output, fromCharCode(digitToBasic(t + qMinusT % baseMinusT)));
	          q = floor$1(qMinusT / baseMinusT);
	          k += base;
	        }

	        push$1(output, fromCharCode(digitToBasic(q)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount === basicLength);
	        delta = 0;
	        handledCPCount++;
	      }
	    }

	    delta++;
	    n++;
	  }
	  return join$1(output, '');
	};

	var stringPunycodeToAscii = function (input) {
	  var encoded = [];
	  var labels = split$1(replace$1(toLowerCase$1(input), regexSeparators, '\u002E'), '.');
	  var i, label;
	  for (i = 0; i < labels.length; i++) {
	    label = labels[i];
	    push$1(encoded, exec$1(regexNonASCII, label) ? 'xn--' + encode(label) : label);
	  }
	  return join$1(encoded, '.');
	};

	// TODO: in core-js@4, move /modules/ dependencies to public entries for better optimization by tools like `preset-env`

	var $$3 = _export;
	var DESCRIPTORS = descriptors;
	var USE_NATIVE_URL$2 = urlConstructorDetection;
	var globalThis$1 = globalThis_1;
	var bind = functionBindContext;
	var uncurryThis = functionUncurryThis;
	var defineBuiltIn = defineBuiltIn$8;
	var defineBuiltInAccessor = defineBuiltInAccessor$3;
	var anInstance = anInstance$2;
	var hasOwn = hasOwnProperty_1;
	var assign = objectAssign;
	var arrayFrom = arrayFrom$1;
	var arraySlice = arraySlice$2;
	var codeAt = stringMultibyte.codeAt;
	var toASCII = stringPunycodeToAscii;
	var $toString = toString$6;
	var setToStringTag = setToStringTag$4;
	var validateArgumentsLength$2 = validateArgumentsLength$6;
	var URLSearchParamsModule = web_urlSearchParams_constructor;
	var InternalStateModule = internalState;

	var setInternalState = InternalStateModule.set;
	var getInternalURLState = InternalStateModule.getterFor('URL');
	var URLSearchParams$1 = URLSearchParamsModule.URLSearchParams;
	var getInternalSearchParamsState = URLSearchParamsModule.getState;

	var NativeURL = globalThis$1.URL;
	var TypeError$1 = globalThis$1.TypeError;
	var parseInt$1 = globalThis$1.parseInt;
	var floor = Math.floor;
	var pow = Math.pow;
	var charAt = uncurryThis(''.charAt);
	var exec = uncurryThis(/./.exec);
	var join = uncurryThis([].join);
	var numberToString = uncurryThis(1.0.toString);
	var pop = uncurryThis([].pop);
	var push = uncurryThis([].push);
	var replace = uncurryThis(''.replace);
	var shift = uncurryThis([].shift);
	var split = uncurryThis(''.split);
	var stringSlice = uncurryThis(''.slice);
	var toLowerCase = uncurryThis(''.toLowerCase);
	var unshift = uncurryThis([].unshift);

	var INVALID_AUTHORITY = 'Invalid authority';
	var INVALID_SCHEME = 'Invalid scheme';
	var INVALID_HOST = 'Invalid host';
	var INVALID_PORT = 'Invalid port';

	var ALPHA = /[a-z]/i;
	// eslint-disable-next-line regexp/no-obscure-range -- safe
	var ALPHANUMERIC = /[\d+-.a-z]/i;
	var DIGIT = /\d/;
	var HEX_START = /^0x/i;
	var OCT = /^[0-7]+$/;
	var DEC = /^\d+$/;
	var HEX = /^[\da-f]+$/i;
	/* eslint-disable regexp/no-control-character -- safe */
	var FORBIDDEN_HOST_CODE_POINT = /[\0\t\n\r #%/:<>?@[\\\]^|]/;
	var FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT = /[\0\t\n\r #/:<>?@[\\\]^|]/;
	var LEADING_C0_CONTROL_OR_SPACE = /^[\u0000-\u0020]+/;
	var TRAILING_C0_CONTROL_OR_SPACE = /(^|[^\u0000-\u0020])[\u0000-\u0020]+$/;
	var TAB_AND_NEW_LINE = /[\t\n\r]/g;
	/* eslint-enable regexp/no-control-character -- safe */
	var EOF;

	// https://url.spec.whatwg.org/#ipv4-number-parser
	var parseIPv4 = function (input) {
	  var parts = split(input, '.');
	  var partsLength, numbers, index, part, radix, number, ipv4;
	  if (parts.length && parts[parts.length - 1] === '') {
	    parts.length--;
	  }
	  partsLength = parts.length;
	  if (partsLength > 4) return input;
	  numbers = [];
	  for (index = 0; index < partsLength; index++) {
	    part = parts[index];
	    if (part === '') return input;
	    radix = 10;
	    if (part.length > 1 && charAt(part, 0) === '0') {
	      radix = exec(HEX_START, part) ? 16 : 8;
	      part = stringSlice(part, radix === 8 ? 1 : 2);
	    }
	    if (part === '') {
	      number = 0;
	    } else {
	      if (!exec(radix === 10 ? DEC : radix === 8 ? OCT : HEX, part)) return input;
	      number = parseInt$1(part, radix);
	    }
	    push(numbers, number);
	  }
	  for (index = 0; index < partsLength; index++) {
	    number = numbers[index];
	    if (index === partsLength - 1) {
	      if (number >= pow(256, 5 - partsLength)) return null;
	    } else if (number > 255) return null;
	  }
	  ipv4 = pop(numbers);
	  for (index = 0; index < numbers.length; index++) {
	    ipv4 += numbers[index] * pow(256, 3 - index);
	  }
	  return ipv4;
	};

	// https://url.spec.whatwg.org/#concept-ipv6-parser
	// eslint-disable-next-line max-statements -- TODO
	var parseIPv6 = function (input) {
	  var address = [0, 0, 0, 0, 0, 0, 0, 0];
	  var pieceIndex = 0;
	  var compress = null;
	  var pointer = 0;
	  var value, length, numbersSeen, ipv4Piece, number, swaps, swap;

	  var chr = function () {
	    return charAt(input, pointer);
	  };

	  if (chr() === ':') {
	    if (charAt(input, 1) !== ':') return;
	    pointer += 2;
	    pieceIndex++;
	    compress = pieceIndex;
	  }
	  while (chr()) {
	    if (pieceIndex === 8) return;
	    if (chr() === ':') {
	      if (compress !== null) return;
	      pointer++;
	      pieceIndex++;
	      compress = pieceIndex;
	      continue;
	    }
	    value = length = 0;
	    while (length < 4 && exec(HEX, chr())) {
	      value = value * 16 + parseInt$1(chr(), 16);
	      pointer++;
	      length++;
	    }
	    if (chr() === '.') {
	      if (length === 0) return;
	      pointer -= length;
	      if (pieceIndex > 6) return;
	      numbersSeen = 0;
	      while (chr()) {
	        ipv4Piece = null;
	        if (numbersSeen > 0) {
	          if (chr() === '.' && numbersSeen < 4) pointer++;
	          else return;
	        }
	        if (!exec(DIGIT, chr())) return;
	        while (exec(DIGIT, chr())) {
	          number = parseInt$1(chr(), 10);
	          if (ipv4Piece === null) ipv4Piece = number;
	          else if (ipv4Piece === 0) return;
	          else ipv4Piece = ipv4Piece * 10 + number;
	          if (ipv4Piece > 255) return;
	          pointer++;
	        }
	        address[pieceIndex] = address[pieceIndex] * 256 + ipv4Piece;
	        numbersSeen++;
	        if (numbersSeen === 2 || numbersSeen === 4) pieceIndex++;
	      }
	      if (numbersSeen !== 4) return;
	      break;
	    } else if (chr() === ':') {
	      pointer++;
	      if (!chr()) return;
	    } else if (chr()) return;
	    address[pieceIndex++] = value;
	  }
	  if (compress !== null) {
	    swaps = pieceIndex - compress;
	    pieceIndex = 7;
	    while (pieceIndex !== 0 && swaps > 0) {
	      swap = address[pieceIndex];
	      address[pieceIndex--] = address[compress + swaps - 1];
	      address[compress + --swaps] = swap;
	    }
	  } else if (pieceIndex !== 8) return;
	  return address;
	};

	var findLongestZeroSequence = function (ipv6) {
	  var maxIndex = null;
	  var maxLength = 1;
	  var currStart = null;
	  var currLength = 0;
	  var index = 0;
	  for (; index < 8; index++) {
	    if (ipv6[index] !== 0) {
	      if (currLength > maxLength) {
	        maxIndex = currStart;
	        maxLength = currLength;
	      }
	      currStart = null;
	      currLength = 0;
	    } else {
	      if (currStart === null) currStart = index;
	      ++currLength;
	    }
	  }
	  return currLength > maxLength ? currStart : maxIndex;
	};

	// https://url.spec.whatwg.org/#host-serializing
	var serializeHost = function (host) {
	  var result, index, compress, ignore0;

	  // ipv4
	  if (typeof host == 'number') {
	    result = [];
	    for (index = 0; index < 4; index++) {
	      unshift(result, host % 256);
	      host = floor(host / 256);
	    }
	    return join(result, '.');
	  }

	  // ipv6
	  if (typeof host == 'object') {
	    result = '';
	    compress = findLongestZeroSequence(host);
	    for (index = 0; index < 8; index++) {
	      if (ignore0 && host[index] === 0) continue;
	      if (ignore0) ignore0 = false;
	      if (compress === index) {
	        result += index ? ':' : '::';
	        ignore0 = true;
	      } else {
	        result += numberToString(host[index], 16);
	        if (index < 7) result += ':';
	      }
	    }
	    return '[' + result + ']';
	  }

	  return host;
	};

	var C0ControlPercentEncodeSet = {};
	var fragmentPercentEncodeSet = assign({}, C0ControlPercentEncodeSet, {
	  ' ': 1, '"': 1, '<': 1, '>': 1, '`': 1
	});
	var pathPercentEncodeSet = assign({}, fragmentPercentEncodeSet, {
	  '#': 1, '?': 1, '{': 1, '}': 1
	});
	var userinfoPercentEncodeSet = assign({}, pathPercentEncodeSet, {
	  '/': 1, ':': 1, ';': 1, '=': 1, '@': 1, '[': 1, '\\': 1, ']': 1, '^': 1, '|': 1
	});

	var percentEncode = function (chr, set) {
	  var code = codeAt(chr, 0);
	  return code > 0x20 && code < 0x7F && !hasOwn(set, chr) ? chr : encodeURIComponent(chr);
	};

	// https://url.spec.whatwg.org/#special-scheme
	var specialSchemes = {
	  ftp: 21,
	  file: null,
	  http: 80,
	  https: 443,
	  ws: 80,
	  wss: 443
	};

	// https://url.spec.whatwg.org/#windows-drive-letter
	var isWindowsDriveLetter = function (string, normalized) {
	  var second;
	  return string.length === 2 && exec(ALPHA, charAt(string, 0))
	    && ((second = charAt(string, 1)) === ':' || (!normalized && second === '|'));
	};

	// https://url.spec.whatwg.org/#start-with-a-windows-drive-letter
	var startsWithWindowsDriveLetter = function (string) {
	  var third;
	  return string.length > 1 && isWindowsDriveLetter(stringSlice(string, 0, 2)) && (
	    string.length === 2 ||
	    ((third = charAt(string, 2)) === '/' || third === '\\' || third === '?' || third === '#')
	  );
	};

	// https://url.spec.whatwg.org/#single-dot-path-segment
	var isSingleDot = function (segment) {
	  return segment === '.' || toLowerCase(segment) === '%2e';
	};

	// https://url.spec.whatwg.org/#double-dot-path-segment
	var isDoubleDot = function (segment) {
	  segment = toLowerCase(segment);
	  return segment === '..' || segment === '%2e.' || segment === '.%2e' || segment === '%2e%2e';
	};

	// States:
	var SCHEME_START = {};
	var SCHEME = {};
	var NO_SCHEME = {};
	var SPECIAL_RELATIVE_OR_AUTHORITY = {};
	var PATH_OR_AUTHORITY = {};
	var RELATIVE = {};
	var RELATIVE_SLASH = {};
	var SPECIAL_AUTHORITY_SLASHES = {};
	var SPECIAL_AUTHORITY_IGNORE_SLASHES = {};
	var AUTHORITY = {};
	var HOST = {};
	var HOSTNAME = {};
	var PORT = {};
	var FILE = {};
	var FILE_SLASH = {};
	var FILE_HOST = {};
	var PATH_START = {};
	var PATH = {};
	var CANNOT_BE_A_BASE_URL_PATH = {};
	var QUERY = {};
	var FRAGMENT = {};

	var URLState = function (url, isBase, base) {
	  var urlString = $toString(url);
	  var baseState, failure, searchParams;
	  if (isBase) {
	    failure = this.parse(urlString);
	    if (failure) throw new TypeError$1(failure);
	    this.searchParams = null;
	  } else {
	    if (base !== undefined) baseState = new URLState(base, true);
	    failure = this.parse(urlString, null, baseState);
	    if (failure) throw new TypeError$1(failure);
	    searchParams = getInternalSearchParamsState(new URLSearchParams$1());
	    searchParams.bindURL(this);
	    this.searchParams = searchParams;
	  }
	};

	URLState.prototype = {
	  type: 'URL',
	  // https://url.spec.whatwg.org/#url-parsing
	  // eslint-disable-next-line max-statements -- TODO
	  parse: function (input, stateOverride, base) {
	    var url = this;
	    var state = stateOverride || SCHEME_START;
	    var pointer = 0;
	    var buffer = '';
	    var seenAt = false;
	    var seenBracket = false;
	    var seenPasswordToken = false;
	    var codePoints, chr, bufferCodePoints, failure;

	    input = $toString(input);

	    if (!stateOverride) {
	      url.scheme = '';
	      url.username = '';
	      url.password = '';
	      url.host = null;
	      url.port = null;
	      url.path = [];
	      url.query = null;
	      url.fragment = null;
	      url.cannotBeABaseURL = false;
	      input = replace(input, LEADING_C0_CONTROL_OR_SPACE, '');
	      input = replace(input, TRAILING_C0_CONTROL_OR_SPACE, '$1');
	    }

	    input = replace(input, TAB_AND_NEW_LINE, '');

	    codePoints = arrayFrom(input);

	    while (pointer <= codePoints.length) {
	      chr = codePoints[pointer];
	      switch (state) {
	        case SCHEME_START:
	          if (chr && exec(ALPHA, chr)) {
	            buffer += toLowerCase(chr);
	            state = SCHEME;
	          } else if (!stateOverride) {
	            state = NO_SCHEME;
	            continue;
	          } else return INVALID_SCHEME;
	          break;

	        case SCHEME:
	          if (chr && (exec(ALPHANUMERIC, chr) || chr === '+' || chr === '-' || chr === '.')) {
	            buffer += toLowerCase(chr);
	          } else if (chr === ':') {
	            if (stateOverride && (
	              (url.isSpecial() !== hasOwn(specialSchemes, buffer)) ||
	              (buffer === 'file' && (url.includesCredentials() || url.port !== null)) ||
	              (url.scheme === 'file' && !url.host)
	            )) return;
	            url.scheme = buffer;
	            if (stateOverride) {
	              if (url.isSpecial() && specialSchemes[url.scheme] === url.port) url.port = null;
	              return;
	            }
	            buffer = '';
	            if (url.scheme === 'file') {
	              state = FILE;
	            } else if (url.isSpecial() && base && base.scheme === url.scheme) {
	              state = SPECIAL_RELATIVE_OR_AUTHORITY;
	            } else if (url.isSpecial()) {
	              state = SPECIAL_AUTHORITY_SLASHES;
	            } else if (codePoints[pointer + 1] === '/') {
	              state = PATH_OR_AUTHORITY;
	              pointer++;
	            } else {
	              url.cannotBeABaseURL = true;
	              push(url.path, '');
	              state = CANNOT_BE_A_BASE_URL_PATH;
	            }
	          } else if (!stateOverride) {
	            buffer = '';
	            state = NO_SCHEME;
	            pointer = 0;
	            continue;
	          } else return INVALID_SCHEME;
	          break;

	        case NO_SCHEME:
	          if (!base || (base.cannotBeABaseURL && chr !== '#')) return INVALID_SCHEME;
	          if (base.cannotBeABaseURL && chr === '#') {
	            url.scheme = base.scheme;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	            url.fragment = '';
	            url.cannotBeABaseURL = true;
	            state = FRAGMENT;
	            break;
	          }
	          state = base.scheme === 'file' ? FILE : RELATIVE;
	          continue;

	        case SPECIAL_RELATIVE_OR_AUTHORITY:
	          if (chr === '/' && codePoints[pointer + 1] === '/') {
	            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	            pointer++;
	          } else {
	            state = RELATIVE;
	            continue;
	          } break;

	        case PATH_OR_AUTHORITY:
	          if (chr === '/') {
	            state = AUTHORITY;
	            break;
	          } else {
	            state = PATH;
	            continue;
	          }

	        case RELATIVE:
	          url.scheme = base.scheme;
	          if (chr === EOF) {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	          } else if (chr === '/' || (chr === '\\' && url.isSpecial())) {
	            state = RELATIVE_SLASH;
	          } else if (chr === '?') {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = '';
	            state = QUERY;
	          } else if (chr === '#') {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.query = base.query;
	            url.fragment = '';
	            state = FRAGMENT;
	          } else {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            url.path = arraySlice(base.path);
	            url.path.length--;
	            state = PATH;
	            continue;
	          } break;

	        case RELATIVE_SLASH:
	          if (url.isSpecial() && (chr === '/' || chr === '\\')) {
	            state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          } else if (chr === '/') {
	            state = AUTHORITY;
	          } else {
	            url.username = base.username;
	            url.password = base.password;
	            url.host = base.host;
	            url.port = base.port;
	            state = PATH;
	            continue;
	          } break;

	        case SPECIAL_AUTHORITY_SLASHES:
	          state = SPECIAL_AUTHORITY_IGNORE_SLASHES;
	          if (chr !== '/' || charAt(buffer, pointer + 1) !== '/') continue;
	          pointer++;
	          break;

	        case SPECIAL_AUTHORITY_IGNORE_SLASHES:
	          if (chr !== '/' && chr !== '\\') {
	            state = AUTHORITY;
	            continue;
	          } break;

	        case AUTHORITY:
	          if (chr === '@') {
	            if (seenAt) buffer = '%40' + buffer;
	            seenAt = true;
	            bufferCodePoints = arrayFrom(buffer);
	            for (var i = 0; i < bufferCodePoints.length; i++) {
	              var codePoint = bufferCodePoints[i];
	              if (codePoint === ':' && !seenPasswordToken) {
	                seenPasswordToken = true;
	                continue;
	              }
	              var encodedCodePoints = percentEncode(codePoint, userinfoPercentEncodeSet);
	              if (seenPasswordToken) url.password += encodedCodePoints;
	              else url.username += encodedCodePoints;
	            }
	            buffer = '';
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial())
	          ) {
	            if (seenAt && buffer === '') return INVALID_AUTHORITY;
	            pointer -= arrayFrom(buffer).length + 1;
	            buffer = '';
	            state = HOST;
	          } else buffer += chr;
	          break;

	        case HOST:
	        case HOSTNAME:
	          if (stateOverride && url.scheme === 'file') {
	            state = FILE_HOST;
	            continue;
	          } else if (chr === ':' && !seenBracket) {
	            if (buffer === '') return INVALID_HOST;
	            failure = url.parseHost(buffer);
	            if (failure) return failure;
	            buffer = '';
	            state = PORT;
	            if (stateOverride === HOSTNAME) return;
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial())
	          ) {
	            if (url.isSpecial() && buffer === '') return INVALID_HOST;
	            if (stateOverride && buffer === '' && (url.includesCredentials() || url.port !== null)) return;
	            failure = url.parseHost(buffer);
	            if (failure) return failure;
	            buffer = '';
	            state = PATH_START;
	            if (stateOverride) return;
	            continue;
	          } else {
	            if (chr === '[') seenBracket = true;
	            else if (chr === ']') seenBracket = false;
	            buffer += chr;
	          } break;

	        case PORT:
	          if (exec(DIGIT, chr)) {
	            buffer += chr;
	          } else if (
	            chr === EOF || chr === '/' || chr === '?' || chr === '#' ||
	            (chr === '\\' && url.isSpecial()) ||
	            stateOverride
	          ) {
	            if (buffer !== '') {
	              var port = parseInt$1(buffer, 10);
	              if (port > 0xFFFF) return INVALID_PORT;
	              url.port = (url.isSpecial() && port === specialSchemes[url.scheme]) ? null : port;
	              buffer = '';
	            }
	            if (stateOverride) return;
	            state = PATH_START;
	            continue;
	          } else return INVALID_PORT;
	          break;

	        case FILE:
	          url.scheme = 'file';
	          if (chr === '/' || chr === '\\') state = FILE_SLASH;
	          else if (base && base.scheme === 'file') {
	            switch (chr) {
	              case EOF:
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = base.query;
	                break;
	              case '?':
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = '';
	                state = QUERY;
	                break;
	              case '#':
	                url.host = base.host;
	                url.path = arraySlice(base.path);
	                url.query = base.query;
	                url.fragment = '';
	                state = FRAGMENT;
	                break;
	              default:
	                if (!startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
	                  url.host = base.host;
	                  url.path = arraySlice(base.path);
	                  url.shortenPath();
	                }
	                state = PATH;
	                continue;
	            }
	          } else {
	            state = PATH;
	            continue;
	          } break;

	        case FILE_SLASH:
	          if (chr === '/' || chr === '\\') {
	            state = FILE_HOST;
	            break;
	          }
	          if (base && base.scheme === 'file' && !startsWithWindowsDriveLetter(join(arraySlice(codePoints, pointer), ''))) {
	            if (isWindowsDriveLetter(base.path[0], true)) push(url.path, base.path[0]);
	            else url.host = base.host;
	          }
	          state = PATH;
	          continue;

	        case FILE_HOST:
	          if (chr === EOF || chr === '/' || chr === '\\' || chr === '?' || chr === '#') {
	            if (!stateOverride && isWindowsDriveLetter(buffer)) {
	              state = PATH;
	            } else if (buffer === '') {
	              url.host = '';
	              if (stateOverride) return;
	              state = PATH_START;
	            } else {
	              failure = url.parseHost(buffer);
	              if (failure) return failure;
	              if (url.host === 'localhost') url.host = '';
	              if (stateOverride) return;
	              buffer = '';
	              state = PATH_START;
	            } continue;
	          } else buffer += chr;
	          break;

	        case PATH_START:
	          if (url.isSpecial()) {
	            state = PATH;
	            if (chr !== '/' && chr !== '\\') continue;
	          } else if (!stateOverride && chr === '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (!stateOverride && chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            state = PATH;
	            if (chr !== '/') continue;
	          } break;

	        case PATH:
	          if (
	            chr === EOF || chr === '/' ||
	            (chr === '\\' && url.isSpecial()) ||
	            (!stateOverride && (chr === '?' || chr === '#'))
	          ) {
	            if (isDoubleDot(buffer)) {
	              url.shortenPath();
	              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
	                push(url.path, '');
	              }
	            } else if (isSingleDot(buffer)) {
	              if (chr !== '/' && !(chr === '\\' && url.isSpecial())) {
	                push(url.path, '');
	              }
	            } else {
	              if (url.scheme === 'file' && !url.path.length && isWindowsDriveLetter(buffer)) {
	                if (url.host) url.host = '';
	                buffer = charAt(buffer, 0) + ':'; // normalize windows drive letter
	              }
	              push(url.path, buffer);
	            }
	            buffer = '';
	            if (url.scheme === 'file' && (chr === EOF || chr === '?' || chr === '#')) {
	              while (url.path.length > 1 && url.path[0] === '') {
	                shift(url.path);
	              }
	            }
	            if (chr === '?') {
	              url.query = '';
	              state = QUERY;
	            } else if (chr === '#') {
	              url.fragment = '';
	              state = FRAGMENT;
	            }
	          } else {
	            buffer += percentEncode(chr, pathPercentEncodeSet);
	          } break;

	        case CANNOT_BE_A_BASE_URL_PATH:
	          if (chr === '?') {
	            url.query = '';
	            state = QUERY;
	          } else if (chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            url.path[0] += percentEncode(chr, C0ControlPercentEncodeSet);
	          } break;

	        case QUERY:
	          if (!stateOverride && chr === '#') {
	            url.fragment = '';
	            state = FRAGMENT;
	          } else if (chr !== EOF) {
	            if (chr === "'" && url.isSpecial()) url.query += '%27';
	            else if (chr === '#') url.query += '%23';
	            else url.query += percentEncode(chr, C0ControlPercentEncodeSet);
	          } break;

	        case FRAGMENT:
	          if (chr !== EOF) url.fragment += percentEncode(chr, fragmentPercentEncodeSet);
	          break;
	      }

	      pointer++;
	    }
	  },
	  // https://url.spec.whatwg.org/#host-parsing
	  parseHost: function (input) {
	    var result, codePoints, index;
	    if (charAt(input, 0) === '[') {
	      if (charAt(input, input.length - 1) !== ']') return INVALID_HOST;
	      result = parseIPv6(stringSlice(input, 1, -1));
	      if (!result) return INVALID_HOST;
	      this.host = result;
	    // opaque host
	    } else if (!this.isSpecial()) {
	      if (exec(FORBIDDEN_HOST_CODE_POINT_EXCLUDING_PERCENT, input)) return INVALID_HOST;
	      result = '';
	      codePoints = arrayFrom(input);
	      for (index = 0; index < codePoints.length; index++) {
	        result += percentEncode(codePoints[index], C0ControlPercentEncodeSet);
	      }
	      this.host = result;
	    } else {
	      input = toASCII(input);
	      if (exec(FORBIDDEN_HOST_CODE_POINT, input)) return INVALID_HOST;
	      result = parseIPv4(input);
	      if (result === null) return INVALID_HOST;
	      this.host = result;
	    }
	  },
	  // https://url.spec.whatwg.org/#cannot-have-a-username-password-port
	  cannotHaveUsernamePasswordPort: function () {
	    return !this.host || this.cannotBeABaseURL || this.scheme === 'file';
	  },
	  // https://url.spec.whatwg.org/#include-credentials
	  includesCredentials: function () {
	    return this.username !== '' || this.password !== '';
	  },
	  // https://url.spec.whatwg.org/#is-special
	  isSpecial: function () {
	    return hasOwn(specialSchemes, this.scheme);
	  },
	  // https://url.spec.whatwg.org/#shorten-a-urls-path
	  shortenPath: function () {
	    var path = this.path;
	    var pathSize = path.length;
	    if (pathSize && (this.scheme !== 'file' || pathSize !== 1 || !isWindowsDriveLetter(path[0], true))) {
	      path.length--;
	    }
	  },
	  // https://url.spec.whatwg.org/#concept-url-serializer
	  serialize: function () {
	    var url = this;
	    var scheme = url.scheme;
	    var username = url.username;
	    var password = url.password;
	    var host = url.host;
	    var port = url.port;
	    var path = url.path;
	    var query = url.query;
	    var fragment = url.fragment;
	    var output = scheme + ':';
	    if (host !== null) {
	      output += '//';
	      if (url.includesCredentials()) {
	        output += username + (password ? ':' + password : '') + '@';
	      }
	      output += serializeHost(host);
	      if (port !== null) output += ':' + port;
	    } else if (scheme === 'file') output += '//';
	    output += url.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
	    if (query !== null) output += '?' + query;
	    if (fragment !== null) output += '#' + fragment;
	    return output;
	  },
	  // https://url.spec.whatwg.org/#dom-url-href
	  setHref: function (href) {
	    var failure = this.parse(href);
	    if (failure) throw new TypeError$1(failure);
	    this.searchParams.update();
	  },
	  // https://url.spec.whatwg.org/#dom-url-origin
	  getOrigin: function () {
	    var scheme = this.scheme;
	    var port = this.port;
	    if (scheme === 'blob') try {
	      return new URLConstructor(scheme.path[0]).origin;
	    } catch (error) {
	      return 'null';
	    }
	    if (scheme === 'file' || !this.isSpecial()) return 'null';
	    return scheme + '://' + serializeHost(this.host) + (port !== null ? ':' + port : '');
	  },
	  // https://url.spec.whatwg.org/#dom-url-protocol
	  getProtocol: function () {
	    return this.scheme + ':';
	  },
	  setProtocol: function (protocol) {
	    this.parse($toString(protocol) + ':', SCHEME_START);
	  },
	  // https://url.spec.whatwg.org/#dom-url-username
	  getUsername: function () {
	    return this.username;
	  },
	  setUsername: function (username) {
	    var codePoints = arrayFrom($toString(username));
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    this.username = '';
	    for (var i = 0; i < codePoints.length; i++) {
	      this.username += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	    }
	  },
	  // https://url.spec.whatwg.org/#dom-url-password
	  getPassword: function () {
	    return this.password;
	  },
	  setPassword: function (password) {
	    var codePoints = arrayFrom($toString(password));
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    this.password = '';
	    for (var i = 0; i < codePoints.length; i++) {
	      this.password += percentEncode(codePoints[i], userinfoPercentEncodeSet);
	    }
	  },
	  // https://url.spec.whatwg.org/#dom-url-host
	  getHost: function () {
	    var host = this.host;
	    var port = this.port;
	    return host === null ? ''
	      : port === null ? serializeHost(host)
	      : serializeHost(host) + ':' + port;
	  },
	  setHost: function (host) {
	    if (this.cannotBeABaseURL) return;
	    this.parse(host, HOST);
	  },
	  // https://url.spec.whatwg.org/#dom-url-hostname
	  getHostname: function () {
	    var host = this.host;
	    return host === null ? '' : serializeHost(host);
	  },
	  setHostname: function (hostname) {
	    if (this.cannotBeABaseURL) return;
	    this.parse(hostname, HOSTNAME);
	  },
	  // https://url.spec.whatwg.org/#dom-url-port
	  getPort: function () {
	    var port = this.port;
	    return port === null ? '' : $toString(port);
	  },
	  setPort: function (port) {
	    if (this.cannotHaveUsernamePasswordPort()) return;
	    port = $toString(port);
	    if (port === '') this.port = null;
	    else this.parse(port, PORT);
	  },
	  // https://url.spec.whatwg.org/#dom-url-pathname
	  getPathname: function () {
	    var path = this.path;
	    return this.cannotBeABaseURL ? path[0] : path.length ? '/' + join(path, '/') : '';
	  },
	  setPathname: function (pathname) {
	    if (this.cannotBeABaseURL) return;
	    this.path = [];
	    this.parse(pathname, PATH_START);
	  },
	  // https://url.spec.whatwg.org/#dom-url-search
	  getSearch: function () {
	    var query = this.query;
	    return query ? '?' + query : '';
	  },
	  setSearch: function (search) {
	    search = $toString(search);
	    if (search === '') {
	      this.query = null;
	    } else {
	      if (charAt(search, 0) === '?') search = stringSlice(search, 1);
	      this.query = '';
	      this.parse(search, QUERY);
	    }
	    this.searchParams.update();
	  },
	  // https://url.spec.whatwg.org/#dom-url-searchparams
	  getSearchParams: function () {
	    return this.searchParams.facade;
	  },
	  // https://url.spec.whatwg.org/#dom-url-hash
	  getHash: function () {
	    var fragment = this.fragment;
	    return fragment ? '#' + fragment : '';
	  },
	  setHash: function (hash) {
	    hash = $toString(hash);
	    if (hash === '') {
	      this.fragment = null;
	      return;
	    }
	    if (charAt(hash, 0) === '#') hash = stringSlice(hash, 1);
	    this.fragment = '';
	    this.parse(hash, FRAGMENT);
	  },
	  update: function () {
	    this.query = this.searchParams.serialize() || null;
	  }
	};

	// `URL` constructor
	// https://url.spec.whatwg.org/#url-class
	var URLConstructor = function URL(url /* , base */) {
	  var that = anInstance(this, URLPrototype);
	  var base = validateArgumentsLength$2(arguments.length, 1) > 1 ? arguments[1] : undefined;
	  var state = setInternalState(that, new URLState(url, false, base));
	  if (!DESCRIPTORS) {
	    that.href = state.serialize();
	    that.origin = state.getOrigin();
	    that.protocol = state.getProtocol();
	    that.username = state.getUsername();
	    that.password = state.getPassword();
	    that.host = state.getHost();
	    that.hostname = state.getHostname();
	    that.port = state.getPort();
	    that.pathname = state.getPathname();
	    that.search = state.getSearch();
	    that.searchParams = state.getSearchParams();
	    that.hash = state.getHash();
	  }
	};

	var URLPrototype = URLConstructor.prototype;

	var accessorDescriptor = function (getter, setter) {
	  return {
	    get: function () {
	      return getInternalURLState(this)[getter]();
	    },
	    set: setter && function (value) {
	      return getInternalURLState(this)[setter](value);
	    },
	    configurable: true,
	    enumerable: true
	  };
	};

	if (DESCRIPTORS) {
	  // `URL.prototype.href` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-href
	  defineBuiltInAccessor(URLPrototype, 'href', accessorDescriptor('serialize', 'setHref'));
	  // `URL.prototype.origin` getter
	  // https://url.spec.whatwg.org/#dom-url-origin
	  defineBuiltInAccessor(URLPrototype, 'origin', accessorDescriptor('getOrigin'));
	  // `URL.prototype.protocol` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-protocol
	  defineBuiltInAccessor(URLPrototype, 'protocol', accessorDescriptor('getProtocol', 'setProtocol'));
	  // `URL.prototype.username` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-username
	  defineBuiltInAccessor(URLPrototype, 'username', accessorDescriptor('getUsername', 'setUsername'));
	  // `URL.prototype.password` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-password
	  defineBuiltInAccessor(URLPrototype, 'password', accessorDescriptor('getPassword', 'setPassword'));
	  // `URL.prototype.host` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-host
	  defineBuiltInAccessor(URLPrototype, 'host', accessorDescriptor('getHost', 'setHost'));
	  // `URL.prototype.hostname` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-hostname
	  defineBuiltInAccessor(URLPrototype, 'hostname', accessorDescriptor('getHostname', 'setHostname'));
	  // `URL.prototype.port` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-port
	  defineBuiltInAccessor(URLPrototype, 'port', accessorDescriptor('getPort', 'setPort'));
	  // `URL.prototype.pathname` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-pathname
	  defineBuiltInAccessor(URLPrototype, 'pathname', accessorDescriptor('getPathname', 'setPathname'));
	  // `URL.prototype.search` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-search
	  defineBuiltInAccessor(URLPrototype, 'search', accessorDescriptor('getSearch', 'setSearch'));
	  // `URL.prototype.searchParams` getter
	  // https://url.spec.whatwg.org/#dom-url-searchparams
	  defineBuiltInAccessor(URLPrototype, 'searchParams', accessorDescriptor('getSearchParams'));
	  // `URL.prototype.hash` accessors pair
	  // https://url.spec.whatwg.org/#dom-url-hash
	  defineBuiltInAccessor(URLPrototype, 'hash', accessorDescriptor('getHash', 'setHash'));
	}

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	defineBuiltIn(URLPrototype, 'toJSON', function toJSON() {
	  return getInternalURLState(this).serialize();
	}, { enumerable: true });

	// `URL.prototype.toString` method
	// https://url.spec.whatwg.org/#URL-stringification-behavior
	defineBuiltIn(URLPrototype, 'toString', function toString() {
	  return getInternalURLState(this).serialize();
	}, { enumerable: true });

	if (NativeURL) {
	  var nativeCreateObjectURL = NativeURL.createObjectURL;
	  var nativeRevokeObjectURL = NativeURL.revokeObjectURL;
	  // `URL.createObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
	  if (nativeCreateObjectURL) defineBuiltIn(URLConstructor, 'createObjectURL', bind(nativeCreateObjectURL, NativeURL));
	  // `URL.revokeObjectURL` method
	  // https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL
	  if (nativeRevokeObjectURL) defineBuiltIn(URLConstructor, 'revokeObjectURL', bind(nativeRevokeObjectURL, NativeURL));
	}

	setToStringTag(URLConstructor, 'URL');

	$$3({ global: true, constructor: true, forced: !USE_NATIVE_URL$2, sham: !DESCRIPTORS }, {
	  URL: URLConstructor
	});

	var $$2 = _export;
	var getBuiltIn$1 = getBuiltIn$7;
	var fails = fails$e;
	var validateArgumentsLength$1 = validateArgumentsLength$6;
	var toString$1 = toString$6;
	var USE_NATIVE_URL$1 = urlConstructorDetection;

	var URL$2 = getBuiltIn$1('URL');

	// https://github.com/nodejs/node/issues/47505
	// https://github.com/denoland/deno/issues/18893
	var THROWS_WITHOUT_ARGUMENTS = USE_NATIVE_URL$1 && fails(function () {
	  URL$2.canParse();
	});

	// Bun ~ 1.0.30 bug
	// https://github.com/oven-sh/bun/issues/9250
	var WRONG_ARITY = fails(function () {
	  return URL$2.canParse.length !== 1;
	});

	// `URL.canParse` method
	// https://url.spec.whatwg.org/#dom-url-canparse
	$$2({ target: 'URL', stat: true, forced: !THROWS_WITHOUT_ARGUMENTS || WRONG_ARITY }, {
	  canParse: function canParse(url) {
	    var length = validateArgumentsLength$1(arguments.length, 1);
	    var urlString = toString$1(url);
	    var base = length < 2 || arguments[1] === undefined ? undefined : toString$1(arguments[1]);
	    try {
	      return !!new URL$2(urlString, base);
	    } catch (error) {
	      return false;
	    }
	  }
	});

	var $$1 = _export;
	var getBuiltIn = getBuiltIn$7;
	var validateArgumentsLength = validateArgumentsLength$6;
	var toString = toString$6;
	var USE_NATIVE_URL = urlConstructorDetection;

	var URL$1 = getBuiltIn('URL');

	// `URL.parse` method
	// https://url.spec.whatwg.org/#dom-url-canparse
	$$1({ target: 'URL', stat: true, forced: !USE_NATIVE_URL }, {
	  parse: function parse(url) {
	    var length = validateArgumentsLength(arguments.length, 1);
	    var urlString = toString(url);
	    var base = length < 2 || arguments[1] === undefined ? undefined : toString(arguments[1]);
	    try {
	      return new URL$1(urlString, base);
	    } catch (error) {
	      return null;
	    }
	  }
	});

	var $ = _export;
	var call = functionCall;

	// `URL.prototype.toJSON` method
	// https://url.spec.whatwg.org/#dom-url-tojson
	$({ target: 'URL', proto: true, enumerable: true }, {
	  toJSON: function toJSON() {
	    return call(URL.prototype.toString, this);
	  }
	});

	var path = path$2;

	path.URL;

	function getWorldPosition(entity) {
	    let transform = ecs.Transform.getOrNull(entity);
	    if (!transform)
	        return math.Vector3.Zero();
	    let parent = transform.parent;
	    if (!parent) {
	        return transform.position;
	    }
	    else {
	        ecs.Transform.get(parent).rotation;
	        return math.Vector3.add(getWorldPosition(parent), math.Vector3.rotate(transform.position, getWorldRotation(parent)));
	    }
	}
	function getWorldRotation(entity) {
	    let transform = ecs.Transform.getOrNull(entity);
	    if (!transform)
	        return math.Quaternion.Identity();
	    let parent = transform.parent;
	    if (!parent) {
	        return transform.rotation;
	    }
	    else {
	        return math.Quaternion.multiply(transform.rotation, getWorldRotation(parent));
	    }
	}
	var InterpolationType;
	(function (InterpolationType) {
	    InterpolationType["LINEAR"] = "linear";
	    InterpolationType["EASEINQUAD"] = "easeinquad";
	    InterpolationType["EASEOUTQUAD"] = "easeoutquad";
	    InterpolationType["EASEQUAD"] = "easequad";
	    InterpolationType["EASEINSINE"] = "easeinsine";
	    InterpolationType["EASEOUTSINE"] = "easeoutsine";
	    InterpolationType["EASESINE"] = "easeinoutsine";
	    InterpolationType["EASEINEXPO"] = "easeinexpo";
	    InterpolationType["EASEOUTEXPO"] = "easeoutexpo";
	    InterpolationType["EASEEXPO"] = "easeinoutexpo";
	    InterpolationType["EASEINELASTIC"] = "easeinelastic";
	    InterpolationType["EASEOUTELASTIC"] = "easeoutelastic";
	    InterpolationType["EASEELASTIC"] = "easeinoutelastic";
	    InterpolationType["EASEINBOUNCE"] = "easeinbounce";
	    InterpolationType["EASEOUTEBOUNCE"] = "easeoutbounce";
	    InterpolationType["EASEBOUNCE"] = "easeinoutbounce";
	})(InterpolationType || (InterpolationType = {}));
	function createCatmullRomSpline(points, nbPoints, closed) {
	    const catmullRom = new Array();
	    const step = 1.0 / nbPoints;
	    let amount = 0.0;
	    if (closed) {
	        const pointsCount = points.length;
	        for (let i = 0; i < pointsCount; i++) {
	            amount = 0;
	            for (let c = 0; c < nbPoints; c++) {
	                catmullRom.push(math.Vector3.catmullRom(points[i % pointsCount], points[(i + 1) % pointsCount], points[(i + 2) % pointsCount], points[(i + 3) % pointsCount], amount));
	                amount += step;
	            }
	        }
	        catmullRom.push(catmullRom[0]);
	    }
	    else {
	        const totalPoints = new Array();
	        totalPoints.push(math.Vector3.clone(points[0]));
	        Array.prototype.push.apply(totalPoints, points);
	        totalPoints.push(math.Vector3.clone(points[points.length - 1]));
	        let i = 0;
	        for (; i < totalPoints.length - 3; i++) {
	            amount = 0;
	            for (let c = 0; c < nbPoints; c++) {
	                catmullRom.push(math.Vector3.catmullRom(totalPoints[i], totalPoints[i + 1], totalPoints[i + 2], totalPoints[i + 3], amount));
	                amount += step;
	            }
	        }
	        i--;
	        catmullRom.push(math.Vector3.catmullRom(totalPoints[i], totalPoints[i + 1], totalPoints[i + 2], totalPoints[i + 3], amount));
	    }
	    return catmullRom;
	}
	function areAABBIntersecting(aMin, aMax, bMin, bMax) {
	    return (aMin.x <= bMax.x &&
	        aMax.x >= bMin.x &&
	        aMin.y <= bMax.y &&
	        aMax.y >= bMin.y &&
	        aMin.z <= bMax.z &&
	        aMax.z >= bMin.z);
	}
	function areSpheresIntersecting(aPos, aRadius, bPos, bRadius) {
	    const sqDist = math.Vector3.distanceSquared(aPos, bPos);
	    const radiusSum = aRadius + bRadius;
	    return sqDist < radiusSum * radiusSum;
	}
	function areAABBSphereIntersecting(boxMin, boxMax, spherePos, sphereRadius) {
	    let dmin = 0;
	    if (spherePos.x < boxMin.x)
	        dmin += (boxMin.x - spherePos.x) * (boxMin.x - spherePos.x);
	    if (spherePos.x > boxMax.x)
	        dmin += (spherePos.x - boxMax.x) * (spherePos.x - boxMax.x);
	    if (spherePos.y < boxMin.y)
	        dmin += (boxMin.y - spherePos.y) * (boxMin.y - spherePos.y);
	    if (spherePos.y > boxMax.y)
	        dmin += (spherePos.y - boxMax.y) * (spherePos.y - boxMax.y);
	    if (spherePos.z < boxMin.z)
	        dmin += (boxMin.z - spherePos.z) * (boxMin.z - spherePos.z);
	    if (spherePos.z > boxMax.z)
	        dmin += (spherePos.z - boxMax.z) * (spherePos.z - boxMax.z);
	    return dmin < sphereRadius * sphereRadius;
	}

	const REGULAR_PRIORITY = 100e3;
	var priority;
	(function (priority) {
	    priority.TimerSystemPriority = REGULAR_PRIORITY + 256;
	    priority.TweenSystemPriority = REGULAR_PRIORITY + 192;
	    priority.PerpetualMotionSystemPriority = REGULAR_PRIORITY + 192;
	    priority.PathSystemPriority = REGULAR_PRIORITY + 192;
	    priority.TriggerSystemPriority = REGULAR_PRIORITY + 128;
	    priority.ActionSystemPriority = REGULAR_PRIORITY + 64;
	})(priority || (priority = {}));

	function createTimers(targetEngine) {
	    const timers = new Map();
	    let timerIdCounter = 0;
	    function system(dt) {
	        let deadTimers = [];
	        let callbacks = [];
	        for (let [timerId, timerData] of timers) {
	            timerData.accumulatedTime += 1000 * dt;
	            if (timerData.accumulatedTime < timerData.interval)
	                continue;
	            callbacks.push(timerData.callback);
	            if (timerData.recurrent) {
	                timerData.accumulatedTime -= Math.floor(timerData.accumulatedTime / timerData.interval) * timerData.interval;
	            }
	            else {
	                deadTimers.push(timerId);
	            }
	        }
	        for (let timerId of deadTimers)
	            timers.delete(timerId);
	        for (let callback of callbacks)
	            callback();
	    }
	    targetEngine.addSystem(system, priority.TimerSystemPriority);
	    return {
	        setTimeout(callback, milliseconds) {
	            let timerId = timerIdCounter++;
	            timers.set(timerId, { callback: callback, interval: milliseconds, recurrent: false, accumulatedTime: 0 });
	            return timerId;
	        },
	        clearTimeout(timer) {
	            timers.delete(timer);
	        },
	        setInterval(callback, milliseconds) {
	            let timerId = timerIdCounter++;
	            timers.set(timerId, { callback: callback, interval: milliseconds, recurrent: true, accumulatedTime: 0 });
	            return timerId;
	        },
	        clearInterval(timer) {
	            timers.delete(timer);
	        }
	    };
	}
	const timers = createTimers(ecs.engine);

	var ToggleState;
	(function (ToggleState) {
	    ToggleState[ToggleState["Off"] = 0] = "Off";
	    ToggleState[ToggleState["On"] = 1] = "On";
	})(ToggleState || (ToggleState = {}));
	function createToggles(targetEngine, timers) {
	    const Toggle = targetEngine.defineComponent('dcl.utils.Toggle', {
	        state: ecs.Schemas.EnumNumber(ToggleState, ToggleState.Off)
	    });
	    let toggles = new Map();
	    timers.setInterval(function () {
	        for (const entity of toggles.keys()) {
	            if (targetEngine.getEntityState(entity) == ecs.EntityState.Removed || !Toggle.has(entity)) {
	                toggles.delete(entity);
	            }
	        }
	    }, 5000);
	    return {
	        addToggle(entity, state, callback) {
	            toggles.set(entity, callback);
	            Toggle.createOrReplace(entity, { state: state });
	        },
	        removeToggle(entity) {
	            toggles.delete(entity);
	            Toggle.deleteFrom(entity);
	        },
	        setCallback(entity, callback) {
	            toggles.set(entity, callback);
	        },
	        set(entity, state) {
	            const oldState = Toggle.get(entity).state;
	            if (oldState != state) {
	                Toggle.getMutable(entity).state = state;
	                const callback = toggles.get(entity);
	                if (callback)
	                    callback(state);
	            }
	        },
	        flip(entity) {
	            this.set(entity, 1 - Toggle.get(entity).state);
	        },
	        isOn(entity) {
	            return Toggle.get(entity).state == ToggleState.On;
	        }
	    };
	}
	createToggles(ecs.engine, timers);

	function getEasingFunctionFromInterpolation(type) {
	    switch (type) {
	        case InterpolationType.LINEAR:
	            return 0;
	        case InterpolationType.EASEINQUAD:
	            return 1;
	        case InterpolationType.EASEOUTQUAD:
	            return 2;
	        case InterpolationType.EASEQUAD:
	            return 3;
	        case InterpolationType.EASEINSINE:
	            return 4;
	        case InterpolationType.EASEOUTSINE:
	            return 5;
	        case InterpolationType.EASESINE:
	            return 6;
	        case InterpolationType.EASEINEXPO:
	            return 7;
	        case InterpolationType.EASEOUTEXPO:
	            return 8;
	        case InterpolationType.EASEEXPO:
	            return 9;
	        case InterpolationType.EASEINELASTIC:
	            return 10;
	        case InterpolationType.EASEOUTELASTIC:
	            return 11;
	        case InterpolationType.EASEELASTIC:
	            return 12;
	        case InterpolationType.EASEINBOUNCE:
	            return 13;
	        case InterpolationType.EASEOUTEBOUNCE:
	            return 14;
	        case InterpolationType.EASEBOUNCE:
	            return 15;
	        default:
	            return 0;
	    }
	}

	function createTweens(targetEngine) {
	    const tweenMap = new Map();
	    function makeSystem(dt) {
	        const deadTweens = [];
	        for (const [entity, tweenData] of tweenMap.entries()) {
	            if (targetEngine.getEntityState(entity) == ecs.EntityState.Removed ||
	                !ecs.Tween.has(entity)) {
	                tweenMap.delete(entity);
	                continue;
	            }
	            const tween = ecs.Tween.get(entity);
	            tweenData.normalizedTime += dt * 1000;
	            if (tweenData.normalizedTime >= tween.duration) {
	                deadTweens.push(entity);
	            }
	        }
	        for (const entity of deadTweens) {
	            const callback = tweenMap.get(entity)?.callback;
	            ecs.Tween.deleteFrom(entity);
	            tweenMap.delete(entity);
	            if (callback)
	                callback();
	        }
	    }
	    function makeStop(entity) {
	        ecs.Tween.deleteFrom(entity);
	        tweenMap.delete(entity);
	    }
	    function makeStart(mode) {
	        return function (entity, start, end, duration, interpolationType = InterpolationType.LINEAR, onFinish) {
	            const currentTime = duration === 0 ? 1 : 0;
	            tweenMap.set(entity, { normalizedTime: currentTime, callback: onFinish });
	            ecs.Tween.createOrReplace(entity, {
	                duration: duration * 1000,
	                easingFunction: getEasingFunctionFromInterpolation(interpolationType),
	                currentTime,
	                mode: ecs.Tween.Mode[mode]({ start: start, end: end }),
	            });
	        };
	    }
	    function makeGetOnFinishCallback(entity) {
	        if (!tweenMap.has(entity)) {
	            throw new Error(`Entity ${entity} is not registered with tweens system`);
	        }
	        return tweenMap.get(entity);
	    }
	    targetEngine.addSystem(makeSystem, priority.TweenSystemPriority);
	    return {
	        startTranslation: makeStart("Move"),
	        stopTranslation: makeStop,
	        startRotation: makeStart("Rotate"),
	        stopRotation: makeStop,
	        startScaling: makeStart("Scale"),
	        stopScaling: makeStop,
	        getTranslationOnFinishCallback: makeGetOnFinishCallback,
	        getRotationOnFinishCallback: makeGetOnFinishCallback,
	        getScalingOnFinishCallback: makeGetOnFinishCallback,
	    };
	}
	createTweens(ecs.engine);

	var AXIS;
	(function (AXIS) {
	    AXIS["X"] = "x";
	    AXIS["Y"] = "y";
	    AXIS["Z"] = "z";
	})(AXIS || (AXIS = {}));
	function createPerpetualMotions(targetEngine) {
	    const PerpetualRotation = targetEngine.defineComponent('dcl.utils.PerpetualRotation', {
	        velocity: ecs.Schemas.Quaternion
	    });
	    function system(dt) {
	        for (const [entity, rotation] of targetEngine.getEntitiesWith(PerpetualRotation, ecs.Transform)) {
	            const rotationDelta = math.Quaternion.slerp(math.Quaternion.Identity(), rotation.velocity, dt);
	            const transform = ecs.Transform.getMutable(entity);
	            transform.rotation = math.Quaternion.normalize(math.Quaternion.multiply(transform.rotation, rotationDelta));
	        }
	    }
	    targetEngine.addSystem(system, priority.PerpetualMotionSystemPriority);
	    return {
	        startRotation(entity, velocity) {
	            PerpetualRotation.createOrReplace(entity, { velocity: velocity });
	        },
	        stopRotation(entity) {
	            if (ecs.Tween.has(entity)) {
	                ecs.Tween.deleteFrom(entity);
	            }
	            if (ecs.TweenSequence.has(entity)) {
	                ecs.TweenSequence.deleteFrom(entity);
	            }
	            if (PerpetualRotation.has(entity)) {
	                PerpetualRotation.deleteFrom(entity);
	            }
	        },
	        smoothRotation(entity, duration, axis) {
	            let firstEnd = math.Quaternion.fromEulerDegrees(0, 180, 0);
	            let secondEnd = math.Quaternion.fromEulerDegrees(0, 360, 0);
	            switch (axis) {
	                case AXIS.X:
	                    firstEnd = math.Quaternion.fromEulerDegrees(180, 0, 0);
	                    secondEnd = math.Quaternion.fromEulerDegrees(360, 0, 0);
	                    break;
	                case AXIS.Y:
	                    firstEnd = math.Quaternion.fromEulerDegrees(0, 180, 0);
	                    secondEnd = math.Quaternion.fromEulerDegrees(0, 360, 0);
	                    break;
	                case AXIS.Z:
	                    firstEnd = math.Quaternion.fromEulerDegrees(0, 0, 180);
	                    secondEnd = math.Quaternion.fromEulerDegrees(0, 0, 360);
	                    break;
	            }
	            ecs.Tween.createOrReplace(entity, {
	                mode: ecs.Tween.Mode.Rotate({
	                    start: math.Quaternion.fromEulerDegrees(0, 0, 0),
	                    end: firstEnd
	                }),
	                duration: duration / 2,
	                easingFunction: 0
	            });
	            ecs.TweenSequence.create(entity, {
	                loop: 0,
	                sequence: [
	                    {
	                        mode: ecs.Tween.Mode.Rotate({
	                            start: firstEnd,
	                            end: secondEnd
	                        }),
	                        duration: duration / 2,
	                        easingFunction: 0
	                    }
	                ]
	            });
	        }
	    };
	}
	createPerpetualMotions(ecs.engine);

	function createPaths(targetEngine) {
	    const FollowPath = targetEngine.defineComponent('dcl.utils.FollowPath', {
	        points: ecs.Schemas.Array(ecs.Schemas.Vector3),
	        faceDirection: ecs.Schemas.Boolean,
	        speed: ecs.Schemas.Number,
	        normalizedTime: ecs.Schemas.Number,
	        currentIndex: ecs.Schemas.Number,
	        segmentTimes: ecs.Schemas.Array(ecs.Schemas.Number),
	        curveSegmentCount: ecs.Schemas.Number
	    });
	    const finishCbs = new Map();
	    const pointReachedCbs = new Map();
	    function unregisterEntity(entity) {
	        finishCbs.delete(entity);
	        pointReachedCbs.delete(entity);
	        FollowPath.deleteFrom(entity);
	    }
	    function system(dt) {
	        const deadPaths = [];
	        const pointReachedPaths = [];
	        for (const entity of finishCbs.keys()) {
	            if (targetEngine.getEntityState(entity) == ecs.EntityState.Removed || !FollowPath.has(entity)) {
	                unregisterEntity(entity);
	                continue;
	            }
	            const transform = ecs.Transform.getMutable(entity);
	            const path = FollowPath.getMutable(entity);
	            path.normalizedTime = math.Scalar.clamp(path.normalizedTime + dt * path.speed, 0, 1);
	            if (path.normalizedTime >= 1)
	                deadPaths.push(entity);
	            while (path.normalizedTime >= path.segmentTimes[path.currentIndex] &&
	                path.currentIndex < path.points.length - 1) {
	                if (path.faceDirection) {
	                    const direction = math.Vector3.subtract(path.points[path.currentIndex + 1], path.points[path.currentIndex]);
	                    transform.rotation = math.Quaternion.lookRotation(direction);
	                }
	                if (path.currentIndex > 0 && path.currentIndex % path.curveSegmentCount == 0) {
	                    const pointIndex = path.currentIndex / path.curveSegmentCount;
	                    const pointCoords = path.points[path.currentIndex];
	                    const nextPointCoords = path.points[path.currentIndex + path.curveSegmentCount];
	                    pointReachedPaths.push({ entity: entity, index: pointIndex, coords: pointCoords, nextCoords: nextPointCoords });
	                }
	                path.currentIndex += 1;
	            }
	            const timeDiff = path.segmentTimes[path.currentIndex] - path.segmentTimes[path.currentIndex - 1];
	            const coef = (path.segmentTimes[path.currentIndex] - path.normalizedTime) / timeDiff;
	            transform.position = math.Vector3.lerp(path.points[path.currentIndex], path.points[path.currentIndex - 1], coef);
	        }
	        for (const pointReached of pointReachedPaths) {
	            const callback = pointReachedCbs.get(pointReached.entity);
	            if (callback) {
	                callback(pointReached.index, pointReached.coords, pointReached.nextCoords);
	            }
	        }
	        for (const entity of deadPaths) {
	            const callback = finishCbs.get(entity);
	            unregisterEntity(entity);
	            if (callback)
	                callback();
	        }
	    }
	    targetEngine.addSystem(system, priority.PathSystemPriority);
	    function startPath(entity, points, duration, faceDirection, curveSegmentCount, onFinishCallback, onPointReachedCallback) {
	        if (points.length < 2)
	            throw new Error('At least 2 points are required to form a path.');
	        if (duration == 0)
	            throw new Error('Path duration must not be zero');
	        if (curveSegmentCount) {
	            const loop = math.Vector3.equals(points[0], points[points.length - 1]);
	            if (loop) {
	                points.pop();
	                points.unshift(points.pop());
	            }
	            points = createCatmullRomSpline(points, curveSegmentCount, loop);
	        }
	        else {
	            curveSegmentCount = 1;
	        }
	        finishCbs.set(entity, onFinishCallback);
	        pointReachedCbs.set(entity, onPointReachedCallback);
	        let totalLength = 0;
	        const segmentLengths = [];
	        for (let i = 0; i < points.length - 1; i++) {
	            let sqDist = math.Vector3.distance(points[i], points[i + 1]);
	            totalLength += sqDist;
	            segmentLengths.push(sqDist);
	        }
	        const segmentTimes = [0];
	        for (let i = 0; i < segmentLengths.length; i++) {
	            segmentTimes.push(segmentLengths[i] / totalLength + segmentTimes[i]);
	        }
	        FollowPath.createOrReplace(entity, {
	            points: points,
	            segmentTimes: segmentTimes,
	            curveSegmentCount: curveSegmentCount,
	            speed: 1 / duration,
	            normalizedTime: 0,
	            currentIndex: 0,
	            faceDirection: faceDirection
	        });
	    }
	    return {
	        startStraightPath(entity, points, duration, faceDirection, onFinishCallback, onPointReachedCallback) {
	            return startPath(entity, points, duration, faceDirection, 0, onFinishCallback, onPointReachedCallback);
	        },
	        startSmoothPath(entity, points, duration, segmentCount, faceDirection, onFinishCallback, onPointReachedCallback) {
	            if (segmentCount < 2 || !Number.isInteger(segmentCount))
	                throw new Error(`segmentCount must be an integer that is greater than 2, got: ${segmentCount}`);
	            return startPath(entity, points, duration, faceDirection, segmentCount, onFinishCallback, onPointReachedCallback);
	        },
	        stopPath(entity) {
	            unregisterEntity(entity);
	        },
	        getOnFinishCallback(entity) {
	            if (!finishCbs.has(entity))
	                throw new Error(`Entity ${entity} is not registered in triggers system`);
	            return finishCbs.get(entity);
	        }
	    };
	}
	createPaths(ecs.engine);

	const LAYER_1 = 1;
	const ALL_LAYERS = 255;
	const NO_LAYERS = 0;
	let PLAYER_LAYER_ID = LAYER_1;
	function createTriggers(targetEngine) {
	    const Trigger = ecs.engine.defineComponent('dcl.utils.Trigger', {
	        active: ecs.Schemas.Boolean,
	        layerMask: ecs.Schemas.Int,
	        triggeredByMask: ecs.Schemas.Int,
	        areas: ecs.Schemas.Array(ecs.Schemas.OneOf({
	            box: ecs.Schemas.Map({
	                position: ecs.Schemas.Vector3,
	                scale: ecs.Schemas.Vector3
	            }),
	            sphere: ecs.Schemas.Map({
	                position: ecs.Schemas.Vector3,
	                radius: ecs.Schemas.Number
	            })
	        })),
	        debugColor: ecs.Schemas.Color3
	    });
	    const triggerEnterCbs = new Map();
	    const triggerExitCbs = new Map();
	    let debugDraw = false;
	    const activeCollisions = new Map();
	    const debugEntities = new Map();
	    function updateDebugDraw(enabled) {
	        if (!enabled)
	            return;
	        for (const [entity, trigger] of targetEngine.getEntitiesWith(Trigger, ecs.Transform)) {
	            let shapes = debugEntities.get(entity);
	            const areaCount = trigger.areas.length;
	            while (shapes.length > areaCount) {
	                targetEngine.removeEntity(shapes.pop());
	            }
	            while (shapes.length < areaCount) {
	                shapes.push(targetEngine.addEntity());
	            }
	            const worldPosition = getWorldPosition(entity);
	            const worldRotation = getWorldRotation(entity);
	            for (let i = 0; i < areaCount; ++i) {
	                const shapeSpec = trigger.areas[i];
	                const shape = shapes[i];
	                let scale;
	                if (shapeSpec.$case == 'box') {
	                    scale = shapeSpec.value.scale;
	                    ecs.MeshRenderer.setBox(shape);
	                }
	                else {
	                    const radius = shapeSpec.value.radius;
	                    scale = { x: radius, y: radius, z: radius };
	                    ecs.MeshRenderer.setSphere(shape);
	                }
	                ecs.Transform.createOrReplace(shape, {
	                    position: math.Vector3.add(worldPosition, math.Vector3.rotate(shapeSpec.value.position, worldRotation)),
	                    scale: scale
	                });
	                const color = trigger.active ? trigger.debugColor : math.Color3.Black();
	                ecs.Material.setPbrMaterial(shape, { albedoColor: math.Color4.fromInts(255 * color.r, 255 * color.g, 255 * color.b, 75) });
	            }
	        }
	    }
	    function areTriggersIntersecting(shapeWorldPos0, t0, shapeWorldPos1, t1) {
	        for (let i = 0; i < t0.areas.length; ++i) {
	            const t0World = shapeWorldPos0[i];
	            const t0Area = t0.areas[i];
	            if (t0Area.$case == 'box') {
	                const t0Box = t0Area.value;
	                const t0Min = math.Vector3.subtract(t0World, math.Vector3.scale(t0Box.scale, 0.5));
	                const t0Max = math.Vector3.add(t0Min, t0Box.scale);
	                for (let j = 0; j < t1.areas.length; ++j) {
	                    const t1World = shapeWorldPos1[j];
	                    const t1Area = t1.areas[j];
	                    if (t1Area.$case == 'box') {
	                        const t1Box = t1Area.value;
	                        const t1Min = math.Vector3.subtract(t1World, math.Vector3.scale(t1Box.scale, 0.5));
	                        const t1Max = math.Vector3.add(t1Min, t1Box.scale);
	                        if (areAABBIntersecting(t0Min, t0Max, t1Min, t1Max))
	                            return true;
	                    }
	                    else {
	                        if (areAABBSphereIntersecting(t0Min, t0Max, t1World, t1Area.value.radius))
	                            return true;
	                    }
	                }
	            }
	            else {
	                const t0Radius = t0Area.value.radius;
	                for (let j = 0; j < t1.areas.length; ++j) {
	                    const t1World = shapeWorldPos1[j];
	                    const t1Area = t1.areas[j];
	                    if (t1Area.$case == 'box') {
	                        const t1Box = t1Area.value;
	                        const t1Min = math.Vector3.subtract(t1World, math.Vector3.scale(t1Box.scale, 0.5));
	                        const t1Max = math.Vector3.add(t1Min, t1Box.scale);
	                        if (areAABBSphereIntersecting(t1Min, t1Max, t0World, t0Radius))
	                            return true;
	                    }
	                    else {
	                        if (areSpheresIntersecting(t0World, t0Radius, t1World, t1Area.value.radius))
	                            return true;
	                    }
	                }
	            }
	        }
	        return false;
	    }
	    function computeCollisions(entity, shapeWorldPos) {
	        let collisions = EMPTY_IMMUTABLE_SET;
	        const trigger = Trigger.get(entity);
	        if (!trigger.active)
	            return collisions;
	        if (trigger.triggeredByMask == PLAYER_LAYER_ID) {
	            const playerEntity = targetEngine.PlayerEntity;
	            const playerTrigger = Trigger.get(targetEngine.PlayerEntity);
	            if (playerEntity == entity)
	                return collisions;
	            if (!playerTrigger.active)
	                return collisions;
	            if (!(trigger.triggeredByMask & playerTrigger.layerMask))
	                return collisions;
	            const intersecting = areTriggersIntersecting(shapeWorldPos.get(entity), trigger, shapeWorldPos.get(playerEntity), playerTrigger);
	            if (intersecting) {
	                if (collisions === EMPTY_IMMUTABLE_SET)
	                    collisions = new Set();
	                collisions.add(playerEntity);
	            }
	        }
	        else {
	            for (const [otherEntity, otherTrigger] of targetEngine.getEntitiesWith(Trigger, ecs.Transform)) {
	                if (otherEntity == entity)
	                    continue;
	                if (!otherTrigger.active)
	                    continue;
	                if (!(trigger.triggeredByMask & otherTrigger.layerMask))
	                    continue;
	                const intersecting = areTriggersIntersecting(shapeWorldPos.get(entity), trigger, shapeWorldPos.get(otherEntity), otherTrigger);
	                if (intersecting) {
	                    if (collisions === EMPTY_IMMUTABLE_SET)
	                        collisions = new Set();
	                    collisions.add(otherEntity);
	                }
	            }
	        }
	        return collisions;
	    }
	    function updateCollisions() {
	        const collisionsStarted = [];
	        const collisionsEnded = [];
	        const shapeWorldPositions = new Map();
	        for (const entity of activeCollisions.keys()) {
	            if (targetEngine.getEntityState(entity) == ecs.EntityState.Removed || !Trigger.has(entity)) {
	                for (const debugEntity of debugEntities.get(entity))
	                    targetEngine.removeEntity(debugEntity);
	                for (const collisions of activeCollisions.values()) {
	                    if (collisions.has(entity))
	                        collisions.delete(entity);
	                }
	                debugEntities.delete(entity);
	                activeCollisions.delete(entity);
	                triggerEnterCbs.delete(entity);
	                triggerExitCbs.delete(entity);
	                continue;
	            }
	            const positions = [];
	            const entityWorldPosition = getWorldPosition(entity);
	            const entityWorldRotation = getWorldRotation(entity);
	            const trigger = Trigger.get(entity);
	            for (const shape of trigger.areas) {
	                positions.push(math.Vector3.add(entityWorldPosition, math.Vector3.rotate(shape.value.position, entityWorldRotation)));
	            }
	            shapeWorldPositions.set(entity, positions);
	        }
	        for (const entity of activeCollisions.keys()) {
	            const newCollisions = computeCollisions(entity, shapeWorldPositions);
	            const oldCollisions = activeCollisions.get(entity);
	            for (const oldCollision of oldCollisions) {
	                if (!newCollisions.has(oldCollision))
	                    collisionsEnded.push([entity, oldCollision]);
	            }
	            for (const newCollision of newCollisions) {
	                if (!oldCollisions.has(newCollision))
	                    collisionsStarted.push([entity, newCollision]);
	            }
	            activeCollisions.set(entity, newCollisions);
	        }
	        for (const [entity, collision] of collisionsStarted) {
	            const callback = triggerEnterCbs.get(entity);
	            if (callback)
	                callback(collision);
	        }
	        for (const [entity, collision] of collisionsEnded) {
	            const callback = triggerExitCbs.get(entity);
	            if (callback)
	                callback(collision);
	        }
	    }
	    function system(dt) {
	        updateCollisions();
	        updateDebugDraw(debugDraw);
	    }
	    targetEngine.addSystem(system, priority.TriggerSystemPriority);
	    function triggerAreasFromSpec(areas) {
	        if (!areas)
	            areas = [{ type: 'box' }];
	        const triggerAreas = [];
	        for (const area of areas) {
	            if (area.type == 'box') {
	                triggerAreas.push({
	                    $case: 'box',
	                    value: {
	                        position: area.position ? area.position : math.Vector3.Zero(),
	                        scale: area.scale ? area.scale : math.Vector3.One()
	                    }
	                });
	            }
	            else {
	                triggerAreas.push({
	                    $case: 'sphere',
	                    value: {
	                        position: area.position ? area.position : math.Vector3.Zero(),
	                        radius: area.radius ? area.radius : 1
	                    }
	                });
	            }
	        }
	        return triggerAreas;
	    }
	    const triggersInterface = {
	        addTrigger(entity, layerMask = NO_LAYERS, triggeredByMask = NO_LAYERS, areas, onEnterCallback, onExitCallback, debugColor) {
	            if (layerMask < 0 || layerMask > ALL_LAYERS || !Number.isInteger(layerMask))
	                throw new Error(`Bad layerMask: ${layerMask}. Expected a non-negative integer no greater than ${ALL_LAYERS}`);
	            if (triggeredByMask < 0 || triggeredByMask > ALL_LAYERS || !Number.isInteger(triggeredByMask))
	                throw new Error(`Bad triggeredByMask: ${triggeredByMask}. Expected a non-negative integer no greater than ${ALL_LAYERS}`);
	            debugEntities.set(entity, []);
	            activeCollisions.set(entity, new Set());
	            triggerEnterCbs.set(entity, onEnterCallback);
	            triggerExitCbs.set(entity, onExitCallback);
	            Trigger.createOrReplace(entity, {
	                active: true,
	                layerMask: layerMask,
	                triggeredByMask: triggeredByMask,
	                areas: triggerAreasFromSpec(areas),
	                debugColor: debugColor ? debugColor : math.Color3.Red()
	            });
	        },
	        removeTrigger(entity) {
	            const collisions = activeCollisions.get(entity);
	            const callback = triggerExitCbs.get(entity);
	            for (const debugEntity of debugEntities.get(entity))
	                targetEngine.removeEntity(debugEntity);
	            debugEntities.delete(entity);
	            activeCollisions.delete(entity);
	            triggerEnterCbs.delete(entity);
	            triggerExitCbs.delete(entity);
	            Trigger.deleteFrom(entity);
	            const collidingEntities = [];
	            for (const [otherEntity, otherEntityCollisions] of activeCollisions) {
	                if (otherEntityCollisions.has(entity)) {
	                    otherEntityCollisions.delete(entity);
	                    collidingEntities.push(otherEntity);
	                }
	            }
	            if (callback) {
	                for (const collision of collisions)
	                    callback(collision);
	            }
	            for (const otherEntity of collidingEntities) {
	                const callback = triggerExitCbs.get(otherEntity);
	                if (callback)
	                    callback(entity);
	            }
	        },
	        oneTimeTrigger(entity, layerMask = NO_LAYERS, triggeredByMask = NO_LAYERS, areas, onEnterCallback, debugColor) {
	            this.addTrigger(entity, layerMask, triggeredByMask, areas, function (e) {
	                triggers.removeTrigger(entity);
	                if (onEnterCallback)
	                    onEnterCallback(e);
	            }, undefined, debugColor);
	        },
	        enableTrigger(entity, enabled) {
	            Trigger.getMutable(entity).active = enabled;
	        },
	        isTriggerEnabled(entity) {
	            return Trigger.get(entity).active;
	        },
	        getLayerMask(entity) {
	            return Trigger.get(entity).layerMask;
	        },
	        setLayerMask(entity, mask) {
	            if (mask < 0 || mask > ALL_LAYERS || !Number.isInteger(mask))
	                throw new Error(`Bad layerMask: ${mask}. Expected a non-negative integer no greater than ${ALL_LAYERS}`);
	            Trigger.getMutable(entity).layerMask = mask;
	        },
	        getTriggeredByMask(entity) {
	            return Trigger.get(entity).triggeredByMask;
	        },
	        setTriggeredByMask(entity, mask) {
	            if (mask < 0 || mask > ALL_LAYERS || !Number.isInteger(mask))
	                throw new Error(`Bad layerMask: ${mask}. Expected a non-negative integer no greater than ${ALL_LAYERS}`);
	            Trigger.getMutable(entity).triggeredByMask = mask;
	        },
	        getAreas(entity) {
	            return Trigger.get(entity).areas;
	        },
	        setAreas(entity, areas) {
	            Trigger.getMutable(entity).areas = triggerAreasFromSpec(areas);
	        },
	        setOnEnterCallback(entity, callback) {
	            triggerEnterCbs.set(entity, callback);
	        },
	        setOnExitCallback(entity, callback) {
	            triggerExitCbs.set(entity, callback);
	        },
	        enableDebugDraw(enabled) {
	            debugDraw = enabled;
	            if (!enabled) {
	                for (const shapes of debugEntities.values()) {
	                    for (const shape of shapes)
	                        targetEngine.removeEntity(shape);
	                    shapes.length = 0;
	                }
	            }
	        },
	        isDebugDrawEnabled() {
	            return debugDraw;
	        }
	    };
	    triggersInterface.addTrigger(targetEngine.PlayerEntity, PLAYER_LAYER_ID, NO_LAYERS, [{
	            type: 'box',
	            scale: { x: 0.65, y: 1.92, z: 0.65 },
	            position: { x: 0, y: (1.92 / 2), z: 0 }
	        }], undefined, undefined, math.Color3.Green());
	    return triggersInterface;
	}
	const triggers = createTriggers(ecs.engine);
	const EMPTY_IMMUTABLE_SET = new Set();
	EMPTY_IMMUTABLE_SET.add = (entity) => { debugger; throw new Error("EMPTY_SET is read only"); };
	EMPTY_IMMUTABLE_SET.delete = (entity) => { throw new Error("EMPTY_SET is read only"); };
	EMPTY_IMMUTABLE_SET.has = (entity) => { return false; };

	var actions;
	(function (actions) {
	    class SequenceRunner {
	        constructor(targetEngine, sequenceBuilt, onFinishCallback) {
	            this.beginSequenceNode = null;
	            this.currentSequenceNode = null;
	            this.running = false;
	            this.started = false;
	            this.engine = targetEngine;
	            this.systemFn = (dt) => { this.update(dt); };
	            this.engine.addSystem(this.systemFn, priority.ActionSystemPriority);
	            if (sequenceBuilt) {
	                this.startSequence(sequenceBuilt);
	            }
	            if (onFinishCallback)
	                this.setOnFinishCallback(onFinishCallback);
	        }
	        startSequence(sequenceBuilt) {
	            this.beginSequenceNode = sequenceBuilt.beginSequenceNode;
	            this.currentSequenceNode = this.beginSequenceNode;
	            this.running = true;
	            this.started = false;
	        }
	        destroy() {
	            this.engine.removeSystem(this.systemFn);
	        }
	        setOnFinishCallback(onFinishCallback) {
	            this.onFinishCallback = onFinishCallback;
	        }
	        isRunning() {
	            return this.running;
	        }
	        stop() {
	            this.running = false;
	        }
	        resume() {
	            if (this.beginSequenceNode != null)
	                this.running = true;
	        }
	        reset() {
	            this.currentSequenceNode = this.beginSequenceNode;
	            this.running = true;
	            this.started = false;
	        }
	        getRunningAction() {
	            let currentNode = this.currentSequenceNode;
	            if (this.currentSequenceNode instanceof SubSequenceNode) {
	                do {
	                    currentNode = currentNode.currentInnerSequence;
	                } while (currentNode instanceof SubSequenceNode);
	            }
	            return currentNode.action;
	        }
	        update(dt) {
	            if (!this.running)
	                return;
	            if (!this.started) {
	                this.currentSequenceNode.onStart();
	                this.started = true;
	                return;
	            }
	            if (!this.currentSequenceNode.hasFinish()) {
	                this.currentSequenceNode.update(dt);
	                return;
	            }
	            this.currentSequenceNode.onFinish();
	            this.currentSequenceNode = this.currentSequenceNode.next;
	            if (this.currentSequenceNode) {
	                this.currentSequenceNode.onStart();
	            }
	            else {
	                this.running = false;
	                if (this.onFinishCallback)
	                    this.onFinishCallback();
	            }
	        }
	    }
	    actions.SequenceRunner = SequenceRunner;
	    class SequenceBuilder {
	        constructor() {
	            this.currentSequenceNode = null;
	            this.beginSequenceNode = null;
	            this.whileNodeStack = [];
	        }
	        then(action) {
	            if (this.currentSequenceNode == null) {
	                this.currentSequenceNode = new SequenceNode();
	                this.currentSequenceNode.action = action;
	                this.beginSequenceNode = this.currentSequenceNode;
	            }
	            else {
	                let next = new SequenceNode();
	                next.action = action;
	                this.currentSequenceNode = this.currentSequenceNode.then(next);
	            }
	            return this;
	        }
	        if(condition) {
	            let ifSeq = new IfSequenceNode(condition);
	            if (this.currentSequenceNode == null) {
	                this.currentSequenceNode = ifSeq;
	                this.beginSequenceNode = ifSeq;
	            }
	            else {
	                this.currentSequenceNode = this.currentSequenceNode.then(ifSeq);
	            }
	            return this;
	        }
	        else() {
	            let seq = this.currentSequenceNode.getSequence();
	            if (seq instanceof IfSequenceNode) {
	                seq.closed = true;
	                let elseSeq = new ElseSequenceNode(seq);
	                this.currentSequenceNode = this
	                    .currentSequenceNode.then(elseSeq);
	            }
	            else {
	                throw new Error('IF statement is needed to be called before ELSE statement.');
	            }
	            return this;
	        }
	        endIf() {
	            let seq = this.currentSequenceNode.getSequence();
	            if (seq instanceof IfSequenceNode || seq instanceof ElseSequenceNode) {
	                seq.closed = true;
	            }
	            else {
	                throw new Error('IF statement is needed to be called before ENDIF statement.');
	            }
	            return this;
	        }
	        while(condition) {
	            let whileSeq = new WhileSequenceNode(condition);
	            if (this.currentSequenceNode == null) {
	                this.currentSequenceNode = whileSeq;
	                this.beginSequenceNode = whileSeq;
	            }
	            else {
	                this.currentSequenceNode = this.currentSequenceNode.then(whileSeq);
	            }
	            this.whileNodeStack.push(whileSeq);
	            return this;
	        }
	        endWhile() {
	            let seq = this.currentSequenceNode.getSequence();
	            if (seq instanceof WhileSequenceNode) {
	                seq.closed = true;
	                if (this.whileNodeStack.length > 0) {
	                    this.whileNodeStack.splice(this.whileNodeStack.length - 1, 1);
	                }
	            }
	            else {
	                throw new Error('WHILE statement is needed to be called before ENDWHILE statement.');
	            }
	            return this;
	        }
	        breakWhile() {
	            if (this.whileNodeStack.length > 0) {
	                this.currentSequenceNode = this
	                    .currentSequenceNode.then(new BreakWhileSequenceNode(this.whileNodeStack[this.whileNodeStack.length - 1]));
	            }
	            else {
	                throw new Error('WHILE statement is needed to be called before BREAKWHILE statement.');
	            }
	            return this;
	        }
	    }
	    actions.SequenceBuilder = SequenceBuilder;
	    class SequenceNode {
	        constructor() {
	            this.action = null;
	            this.next = null;
	        }
	        then(next) {
	            this.next = next;
	            return next;
	        }
	        onStart() {
	            if (this.action)
	                this.action.onStart();
	        }
	        update(dt) {
	            if (this.action)
	                this.action.update(dt);
	        }
	        onFinish() {
	            if (this.action)
	                this.action.onFinish();
	        }
	        hasFinish() {
	            if (this.action)
	                return this.action.hasFinished;
	            else
	                return true;
	        }
	        getSequence() {
	            return this;
	        }
	    }
	    actions.SequenceNode = SequenceNode;
	    class SubSequenceNode extends SequenceNode {
	        constructor() {
	            super(...arguments);
	            this.currentInnerSequence = null;
	            this.startingInnerSequence = null;
	            this.closed = false;
	        }
	        then(next) {
	            if (this.currentInnerSequence == null) {
	                this.currentInnerSequence = next;
	                this.startingInnerSequence = next;
	            }
	            else {
	                if (this.closed) {
	                    this.next = next;
	                    return next;
	                }
	                else {
	                    this.currentInnerSequence = this.currentInnerSequence.then(next);
	                }
	            }
	            return this;
	        }
	        onStart() {
	            this.currentInnerSequence = this.startingInnerSequence;
	            if (this.currentInnerSequence)
	                this.currentInnerSequence.onStart();
	        }
	        update(dt) {
	            if (this.currentInnerSequence) {
	                if (!this.currentInnerSequence.hasFinish()) {
	                    this.currentInnerSequence.update(dt);
	                }
	                else {
	                    this.currentInnerSequence.onFinish();
	                    this.currentInnerSequence = this.currentInnerSequence.next;
	                    if (this.currentInnerSequence)
	                        this.currentInnerSequence.onStart();
	                }
	            }
	        }
	        onFinish() {
	            if (this.currentInnerSequence)
	                this.currentInnerSequence.onFinish();
	        }
	        hasFinish() {
	            return this.currentInnerSequence == null;
	        }
	        getSequence() {
	            if (this.currentInnerSequence) {
	                let innerSeq = this.currentInnerSequence.getSequence();
	                if (innerSeq instanceof SubSequenceNode) {
	                    if (!innerSeq.closed) {
	                        return innerSeq;
	                    }
	                }
	            }
	            return this;
	        }
	    }
	    class IfSequenceNode extends SubSequenceNode {
	        constructor(condition) {
	            super();
	            this.result = false;
	            this.condition = condition;
	        }
	        onStart() {
	            this.result = this.condition();
	            if (this.result)
	                super.onStart();
	            else
	                this.currentInnerSequence = null;
	        }
	    }
	    class ElseSequenceNode extends SubSequenceNode {
	        constructor(ifSequence) {
	            super();
	            this.ifSequence = null;
	            this.ifSequence = ifSequence;
	        }
	        onStart() {
	            if (this.ifSequence && !this.ifSequence.result)
	                super.onStart();
	            else
	                this.currentInnerSequence = null;
	        }
	    }
	    class WhileSequenceNode extends SubSequenceNode {
	        constructor(condition) {
	            super();
	            this.breakWhile = false;
	            this.condition = condition;
	        }
	        onStart() {
	            this.breakWhile = false;
	            if (this.condition())
	                super.onStart();
	            else
	                this.currentInnerSequence = null;
	        }
	        update(dt) {
	            if (this.currentInnerSequence) {
	                if (!this.currentInnerSequence.hasFinish()) {
	                    this.currentInnerSequence.update(dt);
	                }
	                else {
	                    this.currentInnerSequence.onFinish();
	                    this.currentInnerSequence = this.currentInnerSequence.next;
	                    if (this.currentInnerSequence == null)
	                        this.currentInnerSequence = this.startingInnerSequence;
	                    if (this.currentInnerSequence)
	                        this.currentInnerSequence.onStart();
	                }
	            }
	        }
	        hasFinish() {
	            return this.breakWhile || !this.condition();
	        }
	    }
	    class BreakWhileSequenceNode extends SequenceNode {
	        constructor(whileNode) {
	            super();
	            this.whileNode = whileNode;
	        }
	        onStart() {
	            this.whileNode.breakWhile = true;
	        }
	    }
	})(actions || (actions = {}));

	const CLASSNAME = "XMLHttpRequest";
	class XMLHttpRequest$1 {
	    constructor() {
	        this.requestHeaders = {};
	        const METHOD_NAME = "constructor";
	        console.log(CLASSNAME, METHOD_NAME, "ENTRY");
	    }
	    getAllResponseHeaders() {
	        return this.responseHeadersRaw;
	    }
	    setRequestHeader(key, val) {
	        const METHOD_NAME = "setRequestHeader";
	        console.log(CLASSNAME, METHOD_NAME, "ENTRY", key, val);
	        this.requestHeaders[key] = val;
	    }
	    open(method, url) {
	        const METHOD_NAME = "open";
	        console.log(CLASSNAME, METHOD_NAME, "ENTRY", method, url);
	        this.method = method;
	        this.url = url;
	    }
	    send(data) {
	        const METHOD_NAME = "send";
	        console.log(CLASSNAME, METHOD_NAME, "ENTRY", data);
	        if (!this.url) {
	            throw new Error("url is required");
	        }
	        if (!this.method) {
	            throw new Error("method is required");
	        }
	        fetch(this.url, {
	            method: this.method,
	            headers: this.requestHeaders,
	            body: data,
	            timeout: this.timeout
	        }).then(async (val) => {
	            console.log(CLASSNAME, METHOD_NAME, "PROMISE.ENTRY", val);
	            this.status = val.status;
	            this.statusText = val.statusText;
	            this.response = await val.text();
	            this.responseHeadersRaw = "";
	            val.headers.forEach((value, key) => {
	                this.responseHeadersRaw += key + ": " + value + "\r\n";
	            });
	            console.log(CLASSNAME, METHOD_NAME, "PROMISE.RESULT", "this.status", this.status, "this.responseHeadersRaw", this.responseHeadersRaw);
	            if (this.onload)
	                this.onload();
	        }).catch((reason) => {
	            console.log('catching reason', reason);
	            if (reason.code && (reason.code == 20 || reason.code == 23))
	                reason.type = 'timeout';
	            if (this.onerror) {
	                this.onerror(reason);
	                console.log("on error reason", reason);
	            }
	        });
	    }
	}

	Object.assign(globalThis, {
	    FormData: class FormData {
	    },
	    clearTimeout: timers.clearTimeout,
	    setTimeout: timers.setTimeout,
	    XMLHttpRequest: XMLHttpRequest$1,
	});
	if (console != null && !console.warn)
	    console.warn = (...args) => console.log('WARNING', ...args);

	let player;
	let pendingQuestConnections = [];
	const lscQuestEvent = mitt();
	exports.LSCQUEST_EVENTS = void 0;
	(function (LSCQUEST_EVENTS) {
	    LSCQUEST_EVENTS["QUEST_ERROR"] = "QUEST_ERROR";
	    LSCQUEST_EVENTS["QUEST_DATA"] = "QUEST_DATA";
	    LSCQUEST_EVENTS["QUEST_STARTED"] = "QUEST_STARTED";
	    LSCQUEST_EVENTS["QUEST_COMPLETE"] = "QUEST_COMPLETE";
	    LSCQUEST_EVENTS["QUEST_END"] = "QUEST_END";
	    LSCQUEST_EVENTS["QUEST_UPDATE"] = "QUEST_UPDATE";
	    LSCQUEST_EVENTS["QUEST_DISCONNECT"] = "QUEST_DISCONNECT";
	    LSCQUEST_EVENTS["QUEST_ACTION"] = "QUEST_ACTION";
	    LSCQUEST_EVENTS["QUEST_START"] = "QUEST_START";
	    LSCQUEST_EVENTS["QUEST_STEP_COMPLETE"] = "STEP_COMPLETE";
	    LSCQUEST_EVENTS["QUEST_TASK_COMPLETE"] = "TASK_COMPLETE";
	})(exports.LSCQUEST_EVENTS || (exports.LSCQUEST_EVENTS = {}));
	const lscQuestConnections = new Map();
	const lscQuestUserData = new Map();
	async function LSCQuestConnect(questId) {
	    ecs.engine.addSystem(CheckPlayerSystem);
	    ecs.engine.addSystem(ConnectQuestSystem);
	    if (lscQuestConnections.has(questId))
	        return;
	    pendingQuestConnections.push(questId);
	}
	function LSCQuestStart(questId) {
	    let questConnection = lscQuestConnections.get(questId);
	    if (!questConnection)
	        return;
	    try {
	        questConnection.send(exports.LSCQUEST_EVENTS.QUEST_START, { questId });
	    }
	    catch (e) {
	        console.log('error sending quest action', e);
	    }
	}
	function LSCQuestAction(questId, stepId, taskId) {
	    let questConnection = lscQuestConnections.get(questId);
	    if (!questConnection)
	        return;
	    try {
	        questConnection.send(exports.LSCQUEST_EVENTS.QUEST_ACTION, { questId, stepId, taskId, metaverse: "DECENTRALAND" });
	    }
	    catch (e) {
	        console.log('error sending quest action', e);
	    }
	}
	function setLSCQuestListeners(room, userId) {
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_ERROR, (info) => {
	        console.log('quest error ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_ERROR, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_DATA, (info) => {
	        console.log('user quest data ', info);
	        lscQuestUserData.set(userId, info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_DATA, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_STARTED, (info) => {
	        console.log('started quest ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_STARTED, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_COMPLETE, (info) => {
	        console.log('complete quest ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_COMPLETE, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_END, (info) => {
	        console.log('ended quest ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_END, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_UPDATE, (info) => {
	        console.log('update quest ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_UPDATE, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_STEP_COMPLETE, (info) => {
	        console.log('step complete quest ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_UPDATE, info);
	    });
	    room.onMessage(exports.LSCQUEST_EVENTS.QUEST_TASK_COMPLETE, (info) => {
	        console.log('task complete quest ', info);
	        lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_UPDATE, info);
	    });
	}
	let time = 0;
	function CheckPlayerSystem(dt) {
	    if (time > 0) {
	        time -= dt;
	    }
	    else {
	        player = players.getPlayer();
	        if (!player) {
	            time = 1;
	        }
	        else {
	            ecs.engine.removeSystem(CheckPlayerSystem);
	        }
	    }
	}
	function ConnectQuestSystem() {
	    if (!player)
	        return;
	    if (pendingQuestConnections.length > 0) {
	        let pendingQuestId = "" + pendingQuestConnections.shift();
	        makeQuestConnection(pendingQuestId);
	    }
	}
	async function makeQuestConnection(questId) {
	    const realm = await Runtime.getRealm({});
	    const options = {
	        userId: player.userId,
	        name: player.name,
	        realm: realm.realmInfo?.baseUrl,
	        questId: questId,
	    };
	    let client = new lib.Client("http://localhost:5335");
	    try {
	        const room = await client.joinOrCreate('angzaar_questing', options);
	        lscQuestConnections.set(questId, room);
	        setLSCQuestListeners(room, player.userId);
	        room.onLeave((code, reason) => {
	            lscQuestEvent.emit(exports.LSCQUEST_EVENTS.QUEST_DISCONNECT, questId);
	        });
	        return room;
	    }
	    catch (error) {
	        console.error('Error connecting to LSC Quest System', error);
	        throw error;
	    }
	}

	exports.LSCQuestAction = LSCQuestAction;
	exports.LSCQuestConnect = LSCQuestConnect;
	exports.LSCQuestStart = LSCQuestStart;
	exports.lscQuestConnections = lscQuestConnections;
	exports.lscQuestEvent = lscQuestEvent;
	exports.lscQuestUserData = lscQuestUserData;

	Object.defineProperty(exports, '__esModule', { value: true });

}));
