
(function() {
'use strict';

// ── Minimal CJS module registry ───────────────────────────────────────────
var __modules = {};
var __cache   = {};

function __define(id, factory) {
  __modules[id] = factory;
}

function __require(id) {
  // Normalise: strip leading ./ or ../gen/worker/ etc
  id = id.replace(/\.js$/, '');
  if (__cache[id]) return __cache[id].exports;
  var mod = { exports: {} };
  __cache[id] = mod;
  var factory = __modules[id];
  if (!factory) {
    // Try stripping path components one at a time
    var parts = id.split('/');
    while (parts.length > 0) {
      var shortId = parts.join('/');
      if (__modules[shortId]) { factory = __modules[shortId]; break; }
      parts.shift();
    }
  }
  if (!factory) {
    // Return empty object for unknown modules (e.g. 'path', 'fs')
    return mod.exports;
  }
  factory(mod, mod.exports, __require);
  return mod.exports;
}

// ── Emscripten / worker globals expected by the builder code ──────────────
var _g = (typeof globalThis !== 'undefined') ? globalThis
       : (typeof self !== 'undefined')       ? self
       : (typeof global !== 'undefined')     ? global : {};

// Safe assign — self/window may be read-only in Workers
function _safeSet(key, val) {
  if (_g[key] === val) return;
  try { Object.defineProperty(_g, key, { value: val, writable: true, configurable: true }); }
  catch(e) {}
}
_safeSet('window', _g);
_safeSet('self',   _g);
if (!_g['location']) _safeSet('location', { href: './' });
_g['exports'] = _g['exports'] || {};



// ── /tmp/8bitworkshop/gen/common/util ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/util", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileDataCache = exports.XMLParseError = void 0;
exports.lpad = lpad;
exports.rpad = rpad;
exports.byte2signed = byte2signed;
exports.getFilenameForPath = getFilenameForPath;
exports.getFolderForPath = getFolderForPath;
exports.getFilenamePrefix = getFilenamePrefix;
exports.hex = hex;
exports.tobin = tobin;
exports.toradix = toradix;
exports.arrayCompare = arrayCompare;
exports.invertMap = invertMap;
exports.highlightDifferences = highlightDifferences;
exports.lzgmini = lzgmini;
exports.stringToByteArray = stringToByteArray;
exports.byteArrayToString = byteArrayToString;
exports.byteArrayToUTF8 = byteArrayToUTF8;
exports.removeBOM = removeBOM;
exports.isProbablyBinary = isProbablyBinary;
exports.compressLZG = compressLZG;
exports.safe_extend = safe_extend;
exports.printFlags = printFlags;
exports.rgb2bgr = rgb2bgr;
exports.RGBA = RGBA;
exports.clamp = clamp;
exports.safeident = safeident;
exports.rle_unpack = rle_unpack;
exports.getWithBinary = getWithBinary;
exports.getBasePlatform = getBasePlatform;
exports.getRootBasePlatform = getRootBasePlatform;
exports.isArray = isArray;
exports.isTypedArray = isTypedArray;
exports.convertDataToUint8Array = convertDataToUint8Array;
exports.convertDataToString = convertDataToString;
exports.byteToASCII = byteToASCII;
exports.loadScript = loadScript;
exports.decodeQueryString = decodeQueryString;
exports.parseBool = parseBool;
exports.parseXMLPoorly = parseXMLPoorly;
exports.escapeHTML = escapeHTML;
exports.findIntegerFactors = findIntegerFactors;
exports.coerceToArray = coerceToArray;
exports.replaceAll = replaceAll;
exports.getCookie = getCookie;
function lpad(s, n) {
    s += ''; // convert to string
    while (s.length < n)
        s = " " + s;
    return s;
}
function rpad(s, n) {
    s += ''; // convert to string
    while (s.length < n)
        s += " ";
    return s;
}
function byte2signed(b) {
    b &= 0xff;
    return (b < 0x80) ? b : -(256 - b);
}
function getFilenameForPath(s) {
    var toks = s.split('/');
    return toks[toks.length - 1];
}
function getFolderForPath(s) {
    return s.substring(0, s.lastIndexOf('/'));
}
function getFilenamePrefix(s) {
    var pos = s.lastIndexOf('.');
    return (pos > 0) ? s.substr(0, pos) : s;
}
function hex(v, nd) {
    if (!nd)
        nd = 2;
    if (nd == 8) {
        return hex((v >> 16) & 0xffff, 4) + hex(v & 0xffff, 4);
    }
    else {
        return toradix(v, nd, 16);
    }
}
function tobin(v, nd) {
    if (!nd)
        nd = 8;
    return toradix(v, nd, 2);
}
function toradix(v, nd, radix) {
    try {
        var s = v.toString(radix).toUpperCase();
        while (s.length < nd)
            s = "0" + s;
        return s;
    }
    catch (e) {
        return v + "";
    }
}
function arrayCompare(a, b) {
    if (a == null && b == null)
        return true;
    if (a == null)
        return false;
    if (b == null)
        return false;
    if (a.length != b.length)
        return false;
    for (var i = 0; i < a.length; i++)
        if (a[i] != b[i])
            return false;
    return true;
}
function invertMap(m) {
    var r = {};
    if (m) {
        for (var k in m)
            r[m[k]] = k;
    }
    return r;
}
function highlightDifferences(s1, s2) {
    var split1 = s1.split(/(\S+\s+)/).filter(function (n) { return n; });
    var split2 = s2.split(/(\S+\s+)/).filter(function (n) { return n; });
    var i = 0;
    var j = 0;
    var result = "";
    while (i < split1.length && j < split2.length) {
        var w1 = split1[i];
        var w2 = split2[j];
        if (w2 && w2.indexOf("\n") >= 0) {
            while (i < s1.length && split1[i].indexOf("\n") < 0)
                i++;
        }
        if (w1 != w2) {
            w2 = '<span class="hilite">' + w2 + '</span>';
        }
        result += w2;
        i++;
        j++;
    }
    while (j < split2.length) {
        result += split2[j++];
    }
    return result;
}
function lzgmini() {
    // Constants
    var LZG_HEADER_SIZE = 16;
    var LZG_METHOD_COPY = 0;
    var LZG_METHOD_LZG1 = 1;
    // LUT for decoding the copy length parameter
    var LZG_LENGTH_DECODE_LUT = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
        20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 35, 48, 72, 128];
    // Decoded data (produced by the decode() method)
    var outdata = null;
    // Calculate the checksum
    var calcChecksum = function (data) {
        var a = 1;
        var b = 0;
        var i = LZG_HEADER_SIZE;
        while (i < data.length) {
            a = (a + (data[i] & 0xff)) & 0xffff;
            b = (b + a) & 0xffff;
            i++;
        }
        return (b << 16) | a;
    };
    // Decode LZG coded data. The function returns the size of the decoded data.
    // Use any of the get* methods to retrieve the decoded data.
    this.decode = function (data) {
        // Start by clearing the decompressed array in this object
        outdata = null;
        // Check magic ID
        if ((data.length < LZG_HEADER_SIZE) || (data[0] != 76) ||
            (data[1] != 90) || (data[2] != 71)) {
            return null;
        }
        // what's the length?
        var uncomplen = data[6] | (data[5] << 8) | (data[4] << 16) | (data[3] << 24);
        // Calculate & check the checksum
        var checksum = ((data[11] & 0xff) << 24) |
            ((data[12] & 0xff) << 16) |
            ((data[13] & 0xff) << 8) |
            (data[14] & 0xff);
        if (calcChecksum(data) != checksum) {
            return null;
        }
        var dst = new Array();
        // Check which method to use
        var method = data[15] & 0xff;
        if (method == LZG_METHOD_LZG1) {
            // Get marker symbols
            var m1 = data[16] & 0xff;
            var m2 = data[17] & 0xff;
            var m3 = data[18] & 0xff;
            var m4 = data[19] & 0xff;
            // Main decompression loop
            var symbol, b, b2, b3, len, offset;
            var dstlen = 0;
            var k = LZG_HEADER_SIZE + 4;
            var datalen = data.length;
            while (k <= datalen) {
                symbol = data[k++] & 0xff;
                if ((symbol != m1) && (symbol != m2) && (symbol != m3) && (symbol != m4)) {
                    // Literal copy
                    dst[dstlen++] = symbol;
                }
                else {
                    b = data[k++] & 0xff;
                    if (b != 0) {
                        // Decode offset / length parameters
                        if (symbol == m1) {
                            // marker1 - "Distant copy"
                            len = LZG_LENGTH_DECODE_LUT[b & 0x1f];
                            b2 = data[k++] & 0xff;
                            b3 = data[k++] & 0xff;
                            offset = (((b & 0xe0) << 11) | (b2 << 8) | b3) + 2056;
                        }
                        else if (symbol == m2) {
                            // marker2 - "Medium copy"
                            len = LZG_LENGTH_DECODE_LUT[b & 0x1f];
                            b2 = data[k++] & 0xff;
                            offset = (((b & 0xe0) << 3) | b2) + 8;
                        }
                        else if (symbol == m3) {
                            // marker3 - "Short copy"
                            len = (b >> 6) + 3;
                            offset = (b & 63) + 8;
                        }
                        else {
                            // marker4 - "Near copy (incl. RLE)"
                            len = LZG_LENGTH_DECODE_LUT[b & 0x1f];
                            offset = (b >> 5) + 1;
                        }
                        // Copy the corresponding data from the history window
                        for (i = 0; i < len; i++) {
                            dst[dstlen] = dst[dstlen - offset];
                            dstlen++;
                        }
                    }
                    else {
                        // Literal copy (single occurance of a marker symbol)
                        dst[dstlen++] = symbol;
                    }
                }
            }
        }
        else if (method == LZG_METHOD_COPY) {
            // Plain copy
            var dstlen = 0;
            var datalen = data.length;
            for (var i = LZG_HEADER_SIZE; i < datalen; i++) {
                dst[dstlen++] = data[i] & 0xff;
            }
        }
        else {
            // Unknown method
            return null;
        }
        // Store the decompressed data in the lzgmini object for later retrieval
        if (dst.length < uncomplen)
            return null; // data too short
        outdata = dst.slice(0, uncomplen);
        return outdata;
    };
    // Get the decoded byte array
    this.getByteArray = function () {
        return outdata;
    };
    // Get the decoded string from a Latin 1 (or ASCII) encoded array
    this.getStringLatin1 = function () {
        return byteArrayToString(outdata);
    };
    // Get the decoded string from an UTF-8 encoded array
    this.getStringUTF8 = function () {
        return byteArrayToUTF8(outdata);
    };
}
function stringToByteArray(s) {
    var a = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++)
        a[i] = s.charCodeAt(i);
    return a;
}
function byteArrayToString(data) {
    var str = "";
    if (data != null) {
        var charLUT = new Array();
        for (var i = 0; i < 256; ++i)
            charLUT[i] = String.fromCharCode(i);
        var len = data.length;
        for (var i = 0; i < len; i++)
            str += charLUT[data[i]];
    }
    return str;
}
function byteArrayToUTF8(data) {
    var str = "";
    var charLUT = new Array();
    for (var i = 0; i < 128; ++i)
        charLUT[i] = String.fromCharCode(i);
    var c;
    var len = data.length;
    for (var i = 0; i < len;) {
        c = data[i++];
        if (c < 128) {
            str += charLUT[c];
        }
        else {
            if ((c >= 192) && (c < 224)) {
                c = ((c & 31) << 6) | (data[i++] & 63);
            }
            else {
                c = ((c & 15) << 12) | ((data[i] & 63) << 6) | (data[i + 1] & 63);
                i += 2;
                if (c == 0xfeff)
                    continue; // ignore BOM
            }
            str += String.fromCharCode(c);
        }
    }
    return str;
}
function removeBOM(s) {
    if (s.charCodeAt(0) === 0xFEFF) {
        s = s.substr(1);
    }
    return s;
}
function isProbablyBinary(path, data) {
    var score = 0;
    // check extensions
    if (path) {
        path = path.toUpperCase();
        var BINEXTS = ['.CHR', '.BIN', '.DAT', '.PAL', '.NAM', '.RLE', '.LZ4', '.NSF'];
        for (var _i = 0, BINEXTS_1 = BINEXTS; _i < BINEXTS_1.length; _i++) {
            var ext = BINEXTS_1[_i];
            if (path.endsWith(ext))
                score++;
        }
    }
    // decode as UTF-8
    for (var i = 0; i < (data ? data.length : 0);) {
        var c = data[i++];
        if ((c & 0x80) == 0) {
            // more likely binary if we see a NUL or obscure control character
            if (c < 9 || (c >= 14 && c < 26) || c == 0x7f) {
                score++;
                break;
            }
        }
        else {
            // look for invalid unicode sequences
            var nextra = 0;
            if ((c & 0xe0) == 0xc0)
                nextra = 1;
            else if ((c & 0xf0) == 0xe0)
                nextra = 2;
            else if ((c & 0xf8) == 0xf0)
                nextra = 3;
            else if (c < 0xa0)
                score++;
            else if (c == 0xff)
                score++;
            while (nextra--) {
                if (i >= data.length || (data[i++] & 0xc0) != 0x80) {
                    score++;
                    break;
                }
            }
        }
    }
    return score > 0;
}
// need to load liblzg.js first
function compressLZG(em_module, inBuffer, levelArg) {
    var level = levelArg || 9;
    var inLen = inBuffer.length;
    var inPtr = em_module._malloc(inLen + 1);
    for (var i = 0; i < inLen; i++) {
        em_module.setValue(inPtr + i, inBuffer[i], 'i8');
    }
    var maxEncSize = em_module._LZG_MaxEncodedSize(inLen);
    var outPtr = em_module._malloc(maxEncSize + 1);
    var compLen = em_module.ccall('compress_lzg', 'number', ['number', 'number', 'number', 'number', 'number'], [level, inPtr, inLen, maxEncSize, outPtr]);
    em_module._free(inPtr);
    var outBuffer = new Uint8Array(compLen);
    for (var i = 0; i < compLen; i++) {
        outBuffer[i] = em_module.getValue(outPtr + i, 'i8');
    }
    em_module._free(outPtr);
    return outBuffer;
}
// only does primitives, 1D arrays and no recursion
function safe_extend(deep, dest, src) {
    // TODO: deep ignored
    for (var key in src) {
        var val = src[key];
        var type = typeof (val);
        if (val === null || type == 'undefined') {
            dest[key] = val;
        }
        else if (type == 'function') {
            // ignore function
        }
        else if (type == 'object') {
            if (val['slice']) { // array?
                dest[key] = val.slice();
            }
            else {
                // ignore object
            }
        }
        else {
            dest[key] = val;
        }
    }
    return dest;
}
function printFlags(val, names, r2l) {
    var s = '';
    for (var i = 0; i < names.length; i++) {
        if (names[i]) {
            var bit = 1 << (r2l ? (names.length - 1 - i) : i);
            if (i > 0)
                s += " ";
            s += (val & bit) ? names[i] : "-";
        }
    }
    return s;
}
function rgb2bgr(x) {
    return ((x & 0xff) << 16) | ((x >> 16) & 0xff) | (x & 0x00ff00);
}
function RGBA(r, g, b) {
    return (r & 0xff) | ((g & 0xff) << 8) | ((b & 0xff) << 16) | 0xff000000;
}
function clamp(minv, maxv, v) {
    return (v < minv) ? minv : (v > maxv) ? maxv : v;
}
function safeident(s) {
    // if starts with non-alpha character, prefix with '_'
    if (s.length == 0)
        return '';
    if (!s.match(/^[a-zA-Z_]/))
        s = '_' + s;
    return s.replace(/\W+/g, "_");
}
function rle_unpack(src) {
    var i = 0;
    var tag = src[i++];
    var dest = [];
    var data = tag;
    while (i < src.length) {
        var ch = src[i++];
        if (ch == tag) {
            var count = src[i++];
            for (var j = 0; j < count; j++)
                dest.push(data);
            if (count == 0)
                break;
        }
        else {
            data = ch;
            dest.push(data);
        }
    }
    return new Uint8Array(dest);
}
// firefox doesn't do GET with binary files
// TODO: replace with fetch()?
function getWithBinary(url, success, datatype) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = datatype;
    oReq.onload = function (oEvent) {
        if (oReq.status == 200) {
            var data = oReq.response;
            if (data instanceof ArrayBuffer) {
                data = new Uint8Array(data);
            }
            success(data);
        }
        else if (oReq.status == 404) {
            success(null);
        }
        else {
            throw Error("Error " + oReq.status + " loading " + url);
        }
    };
    oReq.onerror = function (oEvent) {
        success(null);
    };
    oReq.ontimeout = function (oEvent) {
        throw Error("Timeout loading " + url);
    };
    oReq.send(null);
}
// get platform ID without . emulator
function getBasePlatform(platform) {
    return platform.split('.')[0];
}
// get platform ID without - specialization
function getRootPlatform(platform) {
    return platform.split('-')[0];
}
// get platform ID without emulator or specialization
function getRootBasePlatform(platform) {
    return getRootPlatform(getBasePlatform(platform));
}
function isArray(obj) {
    return obj != null && (Array.isArray(obj) || isTypedArray(obj));
}
function isTypedArray(obj) {
    return obj != null && obj['BYTES_PER_ELEMENT'];
}
function convertDataToUint8Array(data) {
    return (typeof data === 'string') ? stringToByteArray(data) : data;
}
function convertDataToString(data) {
    return (data instanceof Uint8Array) ? byteArrayToUTF8(data) : data;
}
function byteToASCII(b) {
    if (b < 32)
        return String.fromCharCode(b + 0x2400);
    else
        return String.fromCharCode(b);
}
function loadScript(scriptfn) {
    return new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.onload = resolve;
        script.onerror = reject;
        script.src = scriptfn;
        document.getElementsByTagName('head')[0].appendChild(script);
    });
}
function decodeQueryString(qs) {
    if (qs.startsWith('?'))
        qs = qs.substr(1);
    var a = qs.split('&');
    if (!a || a.length == 0)
        return {};
    var b = {};
    for (var i = 0; i < a.length; ++i) {
        var p = a[i].split('=', 2);
        if (p.length == 1)
            b[p[0]] = "";
        else
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
    }
    return b;
}
function parseBool(s) {
    if (!s)
        return false;
    if (s == 'false' || s == '0')
        return false;
    if (s == 'true' || s == '1')
        return true;
    return s ? true : false;
}
///
var XMLParseError = /** @class */ (function (_super) {
    __extends(XMLParseError, _super);
    function XMLParseError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return XMLParseError;
}(Error));
exports.XMLParseError = XMLParseError;
function escapeXML(s) {
    if (s.indexOf('&') >= 0) {
        return s.replace(/&apos;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/&gt;/g, '>')
            .replace(/&lt;/g, '<')
            .replace(/&amp;/g, '&');
    }
    else {
        return s;
    }
}
function parseXMLPoorly(s, openfn, closefn) {
    var tag_re = /[<]([/]?)([?a-z_-]+)([^>]*)[>]+|(\s*[^<]+)/gi;
    var attr_re = /\s*(\w+)="(.*?)"\s*/gi;
    var fm;
    var stack = [];
    var top;
    function closetop() {
        top = stack.pop();
        if (top == null || top.type != ident)
            throw new XMLParseError("mismatch close tag: " + ident);
        if (closefn) {
            top.obj = closefn(top);
        }
        if (stack.length == 0)
            throw new XMLParseError("close tag without open: " + ident);
        stack[stack.length - 1].children.push(top);
    }
    function parseattrs(as) {
        var am;
        var attrs = {};
        if (as != null) {
            while (am = attr_re.exec(as)) {
                attrs[am[1]] = escapeXML(am[2]);
            }
        }
        return attrs;
    }
    while (fm = tag_re.exec(s)) {
        var _m0 = fm[0], close = fm[1], ident = fm[2], attrs = fm[3], content = fm[4];
        //console.log(stack.length, close, ident, attrs, content);
        if (close) {
            closetop();
        }
        else if (ident) {
            var node = { type: ident, text: null, children: [], attrs: parseattrs(attrs), obj: null };
            stack.push(node);
            if (attrs) {
                parseattrs(attrs);
            }
            if (openfn) {
                node.obj = openfn(node);
            }
            if (attrs && attrs.endsWith('/'))
                closetop();
        }
        else if (content != null) {
            if (stack.length == 0)
                throw new XMLParseError("content without element");
            var txt = escapeXML(content).trim();
            if (txt.length)
                stack[stack.length - 1].text = txt;
        }
    }
    if (stack.length != 1)
        throw new XMLParseError("tag not closed");
    if (stack[0].type != '?xml')
        throw new XMLParseError("?xml needs to be first element");
    return top;
}
function escapeHTML(s) {
    return s.replace(/[&]/g, '&amp;').replace(/[<]/g, '&lt;').replace(/[>]/g, '&gt;');
}
// lame factorization for displaying bitmaps
// returns a > b such that a * b == x (or higher), a >= mina, b >= minb
function findIntegerFactors(x, mina, minb, aspect) {
    var a = x;
    var b = 1;
    if (minb > 1 && minb < a) {
        a = Math.ceil(x / minb);
        b = minb;
    }
    while (a > b) {
        var a2 = a;
        var b2 = b;
        if ((a & 1) == 0) {
            b2 = b * 2;
            a2 = a / 2;
        }
        if ((a % 3) == 0) {
            b2 = b * 3;
            a2 = a / 3;
        }
        if ((a % 5) == 0) {
            b2 = b * 5;
            a2 = a / 5;
        }
        if (a2 < mina)
            break;
        if (a2 < b2 * aspect)
            break;
        a = a2;
        b = b2;
    }
    return { a: a, b: b };
}
var FileDataCache = /** @class */ (function () {
    function FileDataCache() {
        this.maxSize = 8000000;
        this.reset();
    }
    FileDataCache.prototype.get = function (key) {
        return this.cache.get(key);
    };
    FileDataCache.prototype.put = function (key, value) {
        this.cache.set(key, value);
        this.size += value.length;
        if (this.size > this.maxSize) {
            console.log('cache reset', this);
            this.reset();
        }
    };
    FileDataCache.prototype.reset = function () {
        this.cache = new Map();
        this.size = 0;
    };
    return FileDataCache;
}());
exports.FileDataCache = FileDataCache;
function coerceToArray(arrobj) {
    if (Array.isArray(arrobj))
        return arrobj;
    else if (arrobj != null && typeof arrobj[Symbol.iterator] === 'function')
        return Array.from(arrobj);
    else if (typeof arrobj === 'object')
        return Array.from(Object.values(arrobj));
    else
        throw new Error("Expected array or object, got \"".concat(arrobj, "\""));
}
function replaceAll(s, search, replace) {
    if (s == '')
        return '';
    if (search == '')
        return s;
    return s.split(search).join(replace);
}
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0)
            return c.substring(nameEQ.length, c.length);
    }
    return null;
}

});


// ── platforms ──────────────────────────────────────────────────────────────────
__define("platforms", function(module, exports, __require) {
"use strict";
/*
 * Copyright (c) 2024 Steven E. Hugg
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLATFORM_PARAMS = void 0;
exports.PLATFORM_PARAMS = {
    'vcs': {
        arch: '6502',
        code_start: 0x1000,
        code_size: 0xf000,
        data_start: 0x80,
        data_size: 0x80,
        wiz_rom_ext: '.a26',
        wiz_inc_dir: '2600',
        cfgfile: 'atari2600.cfg',
        libargs: ['crt0.o', 'atari2600.lib'],
        extra_link_files: ['crt0.o', 'atari2600.cfg'],
        define: ['__ATARI2600__'],
    },
    'mw8080bw': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x2000,
        data_start: 0x2000,
        data_size: 0x400,
        stack_end: 0x2400,
    },
    'vicdual': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x4020,
        data_start: 0xe400,
        data_size: 0x400,
        stack_end: 0xe800,
    },
    'galaxian': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x4000,
        data_start: 0x4000,
        data_size: 0x400,
        stack_end: 0x4800,
    },
    'galaxian-scramble': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x5020,
        data_start: 0x4000,
        data_size: 0x400,
        stack_end: 0x4800,
    },
    'williams': {
        arch: '6809',
        code_start: 0x0,
        rom_size: 0xc000,
        data_start: 0x9800,
        data_size: 0x2800,
        stack_end: 0xc000,
        set_stack_end: 0xc000,
        extra_link_files: ['williams.scr', 'libcmoc-crt-vec.a', 'libcmoc-std-vec.a'],
        extra_link_args: ['-swilliams.scr', '-lcmoc-crt-vec', '-lcmoc-std-vec'],
        extra_compile_files: ['assert.h', 'cmoc.h', 'stdarg.h', 'stdlib.h'],
        //extra_compile_args: ['--vectrex'],
    },
    'williams-defender': {
        arch: '6809',
        code_start: 0x0,
        rom_size: 0xc000,
        data_start: 0x9800,
        data_size: 0x2800,
        stack_end: 0xc000,
    },
    'williams-z80': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x9800,
        data_start: 0x9800,
        data_size: 0x2800,
        stack_end: 0xc000,
    },
    'vector-z80color': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x8000,
        data_start: 0xe000,
        data_size: 0x2000,
        stack_end: 0x0,
    },
    'vector-ataricolor': {
        arch: '6502',
        define: ['__VECTOR__'],
        cfgfile: 'vector-color.cfg',
        libargs: ['crt0.o', 'none.lib'],
        extra_link_files: ['crt0.o', 'vector-color.cfg'],
    },
    'sound_williams-z80': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x4000,
        data_start: 0x4000,
        data_size: 0x400,
        stack_end: 0x8000,
    },
    'base_z80': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0x8000,
        data_start: 0x8000,
        data_size: 0x8000,
        stack_end: 0x0,
    },
    'coleco': {
        arch: 'z80',
        rom_start: 0x8000,
        code_start: 0x8100,
        rom_size: 0x8000,
        data_start: 0x7000,
        data_size: 0x400,
        stack_end: 0x8000,
        extra_preproc_args: ['-I', '/share/include/coleco', '-D', 'CV_CV'],
        extra_link_args: ['-k', '/share/lib/coleco', '-l', 'libcv', '-l', 'libcvu', 'crt0.rel'],
    },
    'msx': {
        arch: 'z80',
        rom_start: 0x4000,
        code_start: 0x4000,
        rom_size: 0x8000,
        data_start: 0xc000,
        data_size: 0x3000,
        stack_end: 0xffff,
        extra_link_args: ['crt0-msx.rel'],
        extra_link_files: ['crt0-msx.rel', 'crt0-msx.lst'],
        wiz_sys_type: 'z80',
        wiz_inc_dir: 'msx',
    },
    'msx-libcv': {
        arch: 'z80',
        rom_start: 0x4000,
        code_start: 0x4000,
        rom_size: 0x8000,
        data_start: 0xc000,
        data_size: 0x3000,
        stack_end: 0xffff,
        extra_preproc_args: ['-I', '.', '-D', 'CV_MSX'],
        extra_link_args: ['-k', '.', '-l', 'libcv-msx', '-l', 'libcvu-msx', 'crt0-msx.rel'],
        extra_link_files: ['libcv-msx.lib', 'libcvu-msx.lib', 'crt0-msx.rel', 'crt0-msx.lst'],
        extra_compile_files: ['cv.h', 'cv_graphics.h', 'cv_input.h', 'cv_sound.h', 'cv_support.h', 'cvu.h', 'cvu_c.h', 'cvu_compression.h', 'cvu_f.h', 'cvu_graphics.h', 'cvu_input.h', 'cvu_sound.h'],
    },
    'sms-sg1000-libcv': {
        arch: 'z80',
        rom_start: 0x0000,
        code_start: 0x0100,
        rom_size: 0xc000,
        data_start: 0xc000,
        data_size: 0x400,
        stack_end: 0xe000,
        extra_preproc_args: ['-I', '.', '-D', 'CV_SMS'],
        extra_link_args: ['-k', '.', '-l', 'libcv-sms', '-l', 'libcvu-sms', 'crt0-sms.rel'],
        extra_link_files: ['libcv-sms.lib', 'libcvu-sms.lib', 'crt0-sms.rel', 'crt0-sms.lst'],
        extra_compile_files: ['cv.h', 'cv_graphics.h', 'cv_input.h', 'cv_sound.h', 'cv_support.h', 'cvu.h', 'cvu_c.h', 'cvu_compression.h', 'cvu_f.h', 'cvu_graphics.h', 'cvu_input.h', 'cvu_sound.h'],
    },
    'nes': {
        arch: '6502',
        define: ['__NES__'],
        cfgfile: 'neslib2.cfg',
        libargs: ['crt0.o', 'nes.lib', 'neslib2.lib',
            '-D', 'NES_MAPPER=0', // NROM
            '-D', 'NES_PRG_BANKS=2', // 2 16K PRG banks
            '-D', 'NES_CHR_BANKS=1', // 1 CHR bank
            '-D', 'NES_MIRRORING=0', // horizontal mirroring
        ],
        extra_link_files: ['crt0.o', 'neslib2.lib', 'neslib2.cfg', 'nesbanked.cfg'],
        wiz_rom_ext: '.nes',
    },
    'apple2': {
        arch: '6502',
        define: ['__APPLE2__'],
        cfgfile: 'apple2.cfg',
        libargs: ['--lib-path', '/share/target/apple2/drv', 'apple2.lib'],
        __CODE_RUN__: 16384,
        code_start: 0x803,
        acmeargs: ['-f', 'apple'],
    },
    'apple2-e': {
        arch: '6502',
        define: ['__APPLE2__'],
        cfgfile: 'apple2.cfg',
        libargs: ['apple2.lib'],
        acmeargs: ['-f', 'apple'],
    },
    'atari8-800xl.disk': {
        arch: '6502',
        define: ['__ATARI__'],
        cfgfile: 'atari.cfg',
        libargs: ['atari.lib'],
        fastbasic_cfgfile: 'fastbasic-cart.cfg',
    },
    'atari8-800xl': {
        arch: '6502',
        define: ['__ATARI__'],
        cfgfile: 'atari-cart.cfg',
        libargs: ['atari.lib', '-D', '__CARTFLAGS__=4'],
        fastbasic_cfgfile: 'fastbasic-cart.cfg',
    },
    'atari8-800': {
        arch: '6502',
        define: ['__ATARI__'],
        cfgfile: 'atari-cart.cfg',
        libargs: ['atari.lib', '-D', '__CARTFLAGS__=4'],
        fastbasic_cfgfile: 'fastbasic-cart.cfg',
    },
    'atari8-5200': {
        arch: '6502',
        define: ['__ATARI5200__'],
        cfgfile: 'atari5200.cfg',
        libargs: ['atari5200.lib', '-D', '__CARTFLAGS__=255'],
        fastbasic_cfgfile: 'fastbasic-cart.cfg',
    },
    'verilog': {
        arch: 'verilog',
        extra_compile_files: ['8bitworkshop.v'],
    },
    'astrocade': {
        arch: 'z80',
        code_start: 0x2000,
        rom_size: 0x2000,
        data_start: 0x4e10,
        data_size: 0x1f0,
        stack_end: 0x5000,
    },
    'astrocade-arcade': {
        arch: 'z80',
        code_start: 0x0000,
        rom_size: 0x4000,
        data_start: 0x7de0,
        data_size: 0x220,
        stack_end: 0x8000,
    },
    'astrocade-bios': {
        arch: 'z80',
        code_start: 0x0000,
        rom_size: 0x2000,
        data_start: 0x4fce,
        data_size: 50,
        stack_end: 0x4fce,
    },
    'atari7800': {
        arch: '6502',
        define: ['__ATARI7800__'],
        cfgfile: 'atari7800.cfg',
        libargs: ['crt0.o', 'none.lib'],
        extra_link_files: ['crt0.o', 'atari7800.cfg'],
    },
    'c64': {
        arch: '6502',
        define: ['__CBM__', '__C64__'],
        cfgfile: 'c64.cfg', // SYS 2061
        libargs: ['c64.lib'],
        acmeargs: ['-f', 'cbm'],
        //extra_link_files: ['c64-cart.cfg'],
    },
    'vic20': {
        arch: '6502',
        define: ['__CBM__', '__VIC20__'],
        cfgfile: 'vic20.cfg',
        libargs: ['vic20.lib'],
        acmeargs: ['-f', 'cbm'],
        //extra_link_files: ['c64-cart.cfg'],
    },
    'kim1': {
        arch: '6502',
    },
    'vectrex': {
        arch: '6809',
        code_start: 0x0,
        rom_size: 0x8000,
        data_start: 0xc880,
        data_size: 0x380,
        stack_end: 0xcc00,
        extra_compile_files: ['assert.h', 'cmoc.h', 'stdarg.h', 'vectrex.h', 'stdlib.h', 'bios.h'],
        extra_link_files: ['vectrex.scr', 'libcmoc-crt-vec.a', 'libcmoc-std-vec.a'],
        extra_compile_args: ['--vectrex'],
        extra_link_args: ['-svectrex.scr', '-lcmoc-crt-vec', '-lcmoc-std-vec'],
    },
    'x86': {
        arch: 'x86',
    },
    'zx': {
        arch: 'z80',
        code_start: 0x5ccb,
        rom_size: 0xff58 - 0x5ccb,
        data_start: 0xf000,
        data_size: 0xfe00 - 0xf000,
        stack_end: 0xff58,
        extra_link_args: ['crt0-zx.rel'],
        extra_link_files: ['crt0-zx.rel', 'crt0-zx.lst'],
    },
    'devel-6502': {
        arch: '6502',
        cfgfile: 'devel-6502.cfg',
        libargs: ['crt0.o', 'none.lib'],
        extra_link_files: ['crt0.o', 'devel-6502.cfg'],
    },
    // https://github.com/cpcitor/cpc-dev-tool-chain
    'cpc.rslib': {
        arch: 'z80',
        code_start: 0x4000,
        rom_size: 0xb100 - 0x4000,
        data_start: 0xb100,
        data_size: 0xb100 - 0xc000,
        stack_end: 0xc000,
        extra_compile_files: ['cpcrslib.h'],
        extra_link_args: ['crt0-cpc.rel', 'cpcrslib.lib'],
        extra_link_files: ['crt0-cpc.rel', 'crt0-cpc.lst', 'cpcrslib.lib', 'cpcrslib.lst'],
    },
    // https://lronaldo.github.io/cpctelera/ (TODO)
    'cpc': {
        arch: 'z80',
        code_start: 0x4000,
        rom_size: 0xb100 - 0x4000,
        data_start: 0xb100,
        data_size: 0xb100 - 0xc000,
        stack_end: 0xc000,
        extra_compile_files: ['cpctelera.h'],
        extra_link_args: ['crt0-cpc.rel', 'cpctelera.lib'],
        extra_link_files: ['crt0-cpc.rel', 'crt0-cpc.lst', 'cpctelera.lib', 'cpctelera.lst'],
    },
    'pce': {
        arch: 'huc6280',
        define: ['__PCE__'],
        cfgfile: 'pce.cfg',
        libargs: ['pce.lib', '-D', '__CARTSIZE__=0x8000'],
    },
    'exidy': {
        define: ['__EXIDY__'],
        cfgfile: 'exidy.cfg',
        libargs: ['crt0.o', 'none.lib'],
        extra_link_files: ['crt0.o', 'exidy.cfg'],
        //extra_compile_files: ['exidy.h'],
    },
    'arm32': {
        arch: 'arm32',
        define: ['__ARM__', 'DISABLE_UNIMPLEMENTED_LIBC_APIS', 'PRINTF_ALIAS_STANDARD_FUNCTION_NAMES_SOFT'],
        extra_compile_args: ['-I./arch/arm/include', '-I./openlibm/include', '-I./openlibm/src', '-I./printf/src'],
        extra_link_files: ['crt0.c', 'libc.a'],
        extra_link_args: ['crt0.c', '-lc'],
    },
    'gb': {
        arch: 'gbz80',
        code_start: 0x0, // ROM starts @ 0x0, header @ 0x100, etc.
        codeseg_start: 0x200, // _CODE area starts here
        rom_size: 0x8000,
        data_start: 0xc0a0,
        data_size: 0x1f60,
        stack_end: 0xe000,
        extra_link_files: ['gbz80.lib', 'gb.lib'],
        extra_link_args: [
            '-l', 'gb',
            '-g', '_shadow_OAM=0xC000',
            '-g', '.STACK=0xE000',
            '-g', '.refresh_OAM=0xFF80',
        ],
        wiz_sys_type: 'gb',
        wiz_inc_dir: 'gb',
    },
    'mcr': {
        arch: 'z80',
        code_start: 0x0,
        rom_size: 0xe000 + 0x4000 + 0x8000,
        data_start: 0xe000,
        data_size: 0x800,
        stack_end: 0xe800,
        // TODO: IHX can't handle > 64 KB, so ihx2sms looks for segments in a certain order
    },
};
exports.PLATFORM_PARAMS['sms-sms-libcv'] = exports.PLATFORM_PARAMS['sms-sg1000-libcv'];
exports.PLATFORM_PARAMS['sms-gg-libcv'] = exports.PLATFORM_PARAMS['sms-sms-libcv'];

});


// ── /tmp/8bitworkshop/gen/common/basic/compiler ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/basic/compiler", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIALECTS = exports.MODERN_BASIC = exports.BASIC80 = exports.APPLESOFT_BASIC = exports.ALTAIR_BASIC41 = exports.BASICODE = exports.DEC_BASIC_PLUS = exports.DEC_BASIC_11 = exports.HP_TIMESHARED_BASIC = exports.TINY_BASIC = exports.DARTMOUTH_4TH_EDITION = exports.ECMA55_MINIMAL = exports.BASICParser = exports.TokenType = exports.CompileError = void 0;
var CompileError = /** @class */ (function (_super) {
    __extends(CompileError, _super);
    function CompileError(msg, loc) {
        var _this = _super.call(this, msg) || this;
        Object.setPrototypeOf(_this, CompileError.prototype);
        _this.$loc = loc;
        return _this;
    }
    return CompileError;
}(Error));
exports.CompileError = CompileError;
// Lexer regular expression -- each (capture group) handles a different token type
//                FLOAT                             INT       HEXOCTAL                    REMARK   IDENT           STRING   RELOP        EXP    OPERATORS             OTHER  WS
var re_toks = /([0-9.]+[E][+-]?\d+|\d+[.][E0-9]*|[.][E0-9]+)|[0]*(\d+)|&([OH][0-9A-F]+)|(['].*)|([A-Z_]\w*[$]?)|(".*?")|([<>]?[=<>#])|(\*\*)|([-+*/^,;:()\[\]\?\\])|(\S+)|(\s+)/gi;
var TokenType;
(function (TokenType) {
    TokenType[TokenType["EOL"] = 0] = "EOL";
    TokenType[TokenType["Float"] = 1] = "Float";
    TokenType[TokenType["Int"] = 2] = "Int";
    TokenType[TokenType["HexOctalInt"] = 3] = "HexOctalInt";
    TokenType[TokenType["Remark"] = 4] = "Remark";
    TokenType[TokenType["Ident"] = 5] = "Ident";
    TokenType[TokenType["String"] = 6] = "String";
    TokenType[TokenType["Relational"] = 7] = "Relational";
    TokenType[TokenType["DoubleStar"] = 8] = "DoubleStar";
    TokenType[TokenType["Operator"] = 9] = "Operator";
    TokenType[TokenType["CatchAll"] = 10] = "CatchAll";
    TokenType[TokenType["Whitespace"] = 11] = "Whitespace";
    TokenType[TokenType["_LAST"] = 12] = "_LAST";
})(TokenType || (exports.TokenType = TokenType = {}));
var Token = /** @class */ (function () {
    function Token() {
    }
    return Token;
}());
var OPERATORS = {
    'IMP': { f: 'bimp', p: 4 },
    'EQV': { f: 'beqv', p: 5 },
    'XOR': { f: 'bxor', p: 6 },
    'OR': { f: 'bor', p: 7 }, // or "lor" for logical
    'AND': { f: 'band', p: 8 }, // or "land" for logical
    '||': { f: 'lor', p: 17 }, // not used
    '&&': { f: 'land', p: 18 }, // not used
    '=': { f: 'eq', p: 50 },
    '==': { f: 'eq', p: 50 },
    '<>': { f: 'ne', p: 50 },
    '><': { f: 'ne', p: 50 },
    '!=': { f: 'ne', p: 50 },
    '#': { f: 'ne', p: 50 },
    '<': { f: 'lt', p: 50 },
    '>': { f: 'gt', p: 50 },
    '<=': { f: 'le', p: 50 },
    '>=': { f: 'ge', p: 50 },
    'MIN': { f: 'min', p: 75 },
    'MAX': { f: 'max', p: 75 },
    '+': { f: 'add', p: 100 },
    '-': { f: 'sub', p: 100 },
    '%': { f: 'mod', p: 140 },
    'MOD': { f: 'mod', p: 140 },
    '\\': { f: 'idiv', p: 150 },
    '*': { f: 'mul', p: 200 },
    '/': { f: 'div', p: 200 },
    '^': { f: 'pow', p: 300 },
    '**': { f: 'pow', p: 300 },
};
function getOperator(op) {
    return OPERATORS[op];
}
function getPrecedence(tok) {
    switch (tok.type) {
        case TokenType.Operator:
        case TokenType.DoubleStar:
        case TokenType.Relational:
        case TokenType.Ident:
            var op = getOperator(tok.str);
            if (op)
                return op.p;
    }
    return -1;
}
// is token an end of statement marker? (":" or end of line)
function isEOS(tok) {
    return tok.type == TokenType.EOL || tok.type == TokenType.Remark
        || tok.str == ':' || tok.str == 'ELSE'; // TODO: only ELSE if ifElse==true
}
function stripQuotes(s) {
    // TODO: assert
    return s.substr(1, s.length - 2);
}
function isLiteral(arg) {
    return arg.value != null;
}
function isLookup(arg) {
    return arg.name != null;
}
function isBinOp(arg) {
    return arg.op != null && arg.left != null && arg.right != null;
}
function isUnOp(arg) {
    return arg.op != null && arg.expr != null;
}
function mergeLocs(a, b) {
    return {
        line: Math.min(a.line, b.line),
        start: Math.min(a.start, b.start),
        end: Math.max(a.end, b.end),
        label: a.label || b.label,
        path: a.path || b.path,
    };
}
///// BASIC PARSER
var BASICParser = /** @class */ (function () {
    function BASICParser() {
        this.opts = exports.DIALECTS['DEFAULT'];
        this.maxlinelen = 255; // maximum line length (some like HP use 72 chars)
        this.optionCount = 0;
        this.lineno = 0;
        this.curlabel = null;
        this.stmts = [];
        this.labels = {};
        this.targets = {};
        this.errors = [];
        this.listings = {};
        this.vardefs = {};
        this.varrefs = {};
        this.fnrefs = {};
        this.scopestack = [];
        this.elseifcount = 0;
    }
    BASICParser.prototype.addError = function (msg, loc) {
        var tok = this.lasttoken || this.peekToken();
        if (!loc)
            loc = tok.$loc;
        this.errors.push({ path: loc.path, line: loc.line, label: this.curlabel, start: loc.start, end: loc.end, msg: msg });
    };
    BASICParser.prototype.compileError = function (msg, loc, loc2) {
        this.addError(msg, loc);
        //if (loc2 != null) this.addError(`...`, loc2);
        throw new CompileError(msg, loc);
    };
    BASICParser.prototype.dialectError = function (what, loc) {
        this.compileError("".concat(what, " in this dialect of BASIC (").concat(this.opts.dialectName, ")."), loc);
    };
    BASICParser.prototype.dialectErrorNoSupport = function (what, loc) {
        this.compileError("You can't use ".concat(what, " in this dialect of BASIC (").concat(this.opts.dialectName, ")."), loc); // TODO
    };
    BASICParser.prototype.consumeToken = function () {
        var tok = this.lasttoken = (this.tokens.shift() || this.eol);
        return tok;
    };
    BASICParser.prototype.expectToken = function (str, msg) {
        var tok = this.consumeToken();
        var tokstr = tok.str;
        if (str != tokstr) {
            this.compileError(msg || "There should be a \"".concat(str, "\" here."));
        }
        return tok;
    };
    BASICParser.prototype.expectTokens = function (strlist, msg) {
        var tok = this.consumeToken();
        var tokstr = tok.str;
        if (strlist.indexOf(tokstr) < 0) {
            this.compileError(msg || "There should be a ".concat(strlist.map(function (s) { return "\"".concat(s, "\""); }).join(' or '), " here."));
        }
        return tok;
    };
    BASICParser.prototype.peekToken = function (lookahead) {
        var tok = this.tokens[lookahead || 0];
        return tok ? tok : this.eol;
    };
    BASICParser.prototype.pushbackToken = function (tok) {
        this.tokens.unshift(tok);
    };
    // this parses either a line number or "label:" -- or adds a default label to a line
    BASICParser.prototype.parseOptLabel = function () {
        var tok = this.consumeToken();
        switch (tok.type) {
            case TokenType.Ident:
                if (this.opts.optionalLabels || tok.str == 'OPTION') {
                    // is it a "label :" and not a keyword like "PRINT : "
                    if (this.peekToken().str == ':' && !this.supportsCommand(tok.str)) {
                        this.consumeToken(); // eat the ":"
                        // fall through to the next case
                    }
                    else {
                        this.pushbackToken(tok); // nope
                        break;
                    }
                }
                else
                    this.dialectError("Each line must begin with a line number");
            case TokenType.Int:
                this.addLabel(tok.str);
                return;
            // label added, return from function... other cases add default label
            case TokenType.HexOctalInt:
            case TokenType.Float:
                this.compileError("Line numbers must be positive integers.");
                break;
            case TokenType.Operator:
                if (this.supportsCommand(tok.str) && this.validKeyword(tok.str)) {
                    this.pushbackToken(tok);
                    break; // "?" is allowed
                }
            default:
                if (this.opts.optionalLabels)
                    this.compileError("A line must start with a line number, command, or label.");
                else
                    this.compileError("A line must start with a line number.");
            case TokenType.Remark:
                break;
        }
        // add default label
        this.addLabel('#' + this.lineno);
    };
    BASICParser.prototype.getPC = function () {
        return this.stmts.length;
    };
    BASICParser.prototype.addStatement = function (stmt, cmdtok, endtok) {
        // set location for statement, adding offset (PC) field
        if (endtok == null)
            endtok = this.peekToken();
        stmt.$loc = { path: cmdtok.$loc.path, line: cmdtok.$loc.line, start: cmdtok.$loc.start, end: endtok.$loc.start,
            label: this.curlabel,
            offset: this.stmts.length };
        // check IF/THEN WHILE/WEND FOR/NEXT etc
        this.modifyScope(stmt);
        // add to list
        this.stmts.push(stmt);
    };
    BASICParser.prototype.addLabel = function (str, offset) {
        if (this.labels[str] != null)
            this.compileError("There's a duplicated label named \"".concat(str, "\"."));
        this.labels[str] = this.getPC() + (offset || 0);
        this.curlabel = str;
        this.tokens.forEach(function (tok) { return tok.$loc.label = str; });
    };
    BASICParser.prototype.parseFile = function (file, path) {
        var _this = this;
        this.path = path;
        var txtlines = file.split(/\n|\r\n?/);
        txtlines.forEach(function (line) { return _this.parseLine(line); });
        var program = { opts: this.opts, stmts: this.stmts, labels: this.labels };
        this.checkAll(program);
        this.listings[path] = this.generateListing(file, program);
        return program;
    };
    BASICParser.prototype.parseLine = function (line) {
        try {
            this.tokenize(line);
            this.parse();
        }
        catch (e) {
            if (!(e instanceof CompileError))
                throw e; // ignore compile errors since errors[] list captures them
        }
    };
    BASICParser.prototype._tokenize = function (line) {
        var _this = this;
        // split identifier regex (if token-crunching enabled)
        var splitre = this.opts.optionalWhitespace && new RegExp('(' + this.opts.validKeywords.map(function (s) { return "".concat(s); }).join('|') + ')');
        // iterate over each token via re_toks regex
        var lastTokType = TokenType.CatchAll;
        var m;
        while (m = re_toks.exec(line)) {
            var _loop_1 = function () {
                var s = m[i];
                if (s != null) {
                    var loc_1 = { path: this_1.path, line: this_1.lineno, start: m.index, end: m.index + s.length };
                    // maybe we don't support unicode in 1975?
                    if (this_1.opts.asciiOnly && !/^[\x00-\x7F]*$/.test(s))
                        this_1.dialectErrorNoSupport("non-ASCII characters");
                    // uppercase all identifiers, and maybe more
                    if (i == TokenType.Ident || i == TokenType.HexOctalInt || this_1.opts.uppercaseOnly) {
                        s = s.toUpperCase();
                        // DATA statement captures whitespace too
                        if (s == 'DATA')
                            lastTokType = TokenType.Whitespace;
                        // certain keywords shouldn't split for rest of line
                        if (s == 'DATA')
                            splitre = null;
                        if (s == 'OPTION')
                            splitre = null;
                        // REM means ignore rest of statement
                        if (lastTokType == TokenType.CatchAll && s.startsWith('REM')) {
                            s = 'REM';
                            lastTokType = TokenType.EOL;
                        }
                    }
                    // convert brackets
                    if (s == '[' || s == ']') {
                        if (!this_1.opts.squareBrackets)
                            this_1.dialectErrorNoSupport("square brackets");
                        if (s == '[')
                            s = '(';
                        if (s == ']')
                            s = ')';
                    }
                    // un-crunch tokens?
                    if (splitre && i == TokenType.Ident) {
                        splittoks = s.split(splitre).filter(function (s) { return s != ''; }); // only non-empties
                        if (splittoks.length > 1) {
                            splittoks.forEach(function (ss) {
                                // check to see if leftover might be integer, or identifier
                                if (/^[0-9]+$/.test(ss))
                                    i = TokenType.Int;
                                else if (/^[A-Z_]\w*[$]?$/.test(ss))
                                    i = TokenType.Ident;
                                else
                                    _this.compileError("Try adding whitespace before \"".concat(ss, "\"."));
                                _this.tokens.push({ str: ss, type: i, $loc: loc_1 });
                            });
                            s = null;
                        }
                    }
                    // add token to list
                    if (s)
                        this_1.tokens.push({ str: s, type: i, $loc: loc_1 });
                    return "break";
                }
            };
            var this_1 = this, splittoks;
            for (var i = 1; i <= lastTokType; i++) {
                var state_1 = _loop_1();
                if (state_1 === "break")
                    break;
            }
        }
    };
    BASICParser.prototype.tokenize = function (line) {
        this.lineno++;
        this.tokens = []; // can't have errors until this is set
        this.eol = { type: TokenType.EOL, str: "", $loc: { path: this.path, line: this.lineno, start: line.length } };
        if (line.length > this.maxlinelen)
            this.compileError("A line should be no more than ".concat(this.maxlinelen, " characters long."));
        this._tokenize(line);
    };
    BASICParser.prototype.parse = function () {
        // not empty line?
        if (this.tokens.length) {
            this.parseOptLabel();
            if (this.tokens.length) {
                this.parseCompoundStatement();
            }
            var next = this.peekToken();
            if (!isEOS(next))
                this.compileError("Expected end of line or ':'", next.$loc);
            this.curlabel = null;
        }
    };
    BASICParser.prototype.parseCompoundStatement = function () {
        if (this.opts.multipleStmtsPerLine) {
            this.parseList(this.parseStatement, ':');
        }
        else {
            this.parseList(this.parseStatement, '\0');
            if (this.peekToken().str == ':')
                this.dialectErrorNoSupport("multiple statements on a line");
        }
    };
    BASICParser.prototype.validKeyword = function (keyword) {
        return (this.opts.validKeywords && this.opts.validKeywords.indexOf(keyword) < 0) ? null : keyword;
    };
    BASICParser.prototype.validFunction = function (funcname) {
        return (this.opts.validFunctions && this.opts.validFunctions.indexOf(funcname) < 0) ? null : funcname;
    };
    BASICParser.prototype.supportsCommand = function (cmd) {
        if (cmd == '?')
            return this.stmt__PRINT;
        else
            return this['stmt__' + cmd];
    };
    BASICParser.prototype.parseStatement = function () {
        // eat extra ":" (should have separate property for this)
        if (this.opts.optionalWhitespace && this.peekToken().str == ':')
            return null;
        // get the command word
        var cmdtok = this.consumeToken();
        var cmd = cmdtok.str;
        var stmt;
        switch (cmdtok.type) {
            case TokenType.Remark:
                if (cmdtok.str.startsWith("'") && !this.opts.tickComments)
                    this.dialectErrorNoSupport("tick comments");
                return null;
            case TokenType.Operator:
                // "?" is alias for "PRINT" on some platforms
                if (cmd == this.validKeyword('?'))
                    cmd = 'PRINT';
            case TokenType.Ident:
                // ignore remarks
                if (cmd == 'REM')
                    return null;
                // look for "GO TO" and "GO SUB"
                if (cmd == 'GO' && this.peekToken().str == 'TO') {
                    this.consumeToken();
                    cmd = 'GOTO';
                }
                else if (cmd == 'GO' && this.peekToken().str == 'SUB') {
                    this.consumeToken();
                    cmd = 'GOSUB';
                }
                // lookup JS function for command
                var fn = this.supportsCommand(cmd);
                if (fn) {
                    if (this.validKeyword(cmd) == null)
                        this.dialectErrorNoSupport("the ".concat(cmd, " statement"));
                    stmt = fn.bind(this)();
                    break;
                }
                else if (this.peekToken().str == '=' || this.peekToken().str == '(') {
                    if (!this.opts.optionalLet)
                        this.dialectError("Assignments must have a preceding LET");
                    // 'A = expr' or 'A(X) = expr'
                    this.pushbackToken(cmdtok);
                    stmt = this.stmt__LET();
                    break;
                }
                else {
                    this.compileError("I don't understand the command \"".concat(cmd, "\"."));
                }
            case TokenType.EOL:
                if (this.opts.optionalWhitespace)
                    return null;
            default:
                this.compileError("There should be a command here.");
                return null;
        }
        // add statement to list
        if (stmt != null)
            this.addStatement(stmt, cmdtok);
        return stmt;
    };
    // check scope stuff (if compiledBlocks is true)
    BASICParser.prototype.modifyScope = function (stmt) {
        if (this.opts.compiledBlocks) {
            var cmd = stmt.command;
            if (cmd == 'FOR' || cmd == 'WHILE' || cmd == 'SUB') {
                this.scopestack.push(this.getPC()); // has to be before adding statment to list
            }
            else if (cmd == 'NEXT') {
                this.popScope(stmt, 'FOR');
            }
            else if (cmd == 'WEND') {
                this.popScope(stmt, 'WHILE');
            }
        }
    };
    BASICParser.prototype.popScope = function (close, open) {
        var popidx = this.scopestack.pop();
        var popstmt = popidx != null ? this.stmts[popidx] : null;
        if (popstmt == null)
            this.compileError("There's a ".concat(close.command, " without a matching ").concat(open, "."), close.$loc);
        else if (popstmt.command != open)
            this.compileError("There's a ".concat(close.command, " paired with ").concat(popstmt.command, ", but it should be paired with ").concat(open, "."), close.$loc, popstmt.$loc);
        else if (close.command == 'NEXT' && !this.opts.optionalNextVar
            && close.lexpr.name != popstmt.lexpr.name)
            this.compileError("This NEXT statement is matched with the wrong FOR variable (".concat(close.lexpr.name, ")."), close.$loc, popstmt.$loc);
        // set start + end locations
        close.startpc = popidx;
        popstmt.endpc = this.getPC(); // has to be before adding statment to list
    };
    BASICParser.prototype.popIfThenScope = function (nextpc) {
        var popidx = this.scopestack.pop();
        var popstmt = popidx != null ? this.stmts[popidx] : null;
        if (popstmt == null)
            this.compileError("There's an END IF without a matching IF or ELSE.");
        if (popstmt.command == 'ELSE') {
            popstmt.endpc = this.getPC();
            this.popIfThenScope(popidx + 1); // IF goes to ELSE+1
        }
        else if (popstmt.command == 'IF') {
            popstmt.endpc = nextpc != null ? nextpc : this.getPC();
        }
        else {
            this.compileError("There's an END IF paired with a ".concat(popstmt.command, ", not IF or ELSE."), this.lasttoken.$loc, popstmt.$loc);
        }
    };
    BASICParser.prototype.parseVarSubscriptOrFunc = function () {
        var tok = this.consumeToken();
        switch (tok.type) {
            case TokenType.Ident:
                var args = null;
                if (this.peekToken().str == '(') {
                    this.expectToken('(');
                    args = this.parseExprList();
                    this.expectToken(')', "There should be another expression or a \")\" here.");
                }
                var loc = mergeLocs(tok.$loc, this.lasttoken.$loc);
                var valtype = this.exprTypeForSubscript(tok.str, args, loc);
                return { valtype: valtype, name: tok.str, args: args, $loc: loc };
            default:
                this.compileError("There should be a variable name here.");
                break;
        }
    };
    BASICParser.prototype.parseLexpr = function () {
        var lexpr = this.parseVarSubscriptOrFunc();
        this.vardefs[lexpr.name] = lexpr;
        this.validateVarName(lexpr);
        return lexpr;
    };
    BASICParser.prototype.parseForNextLexpr = function () {
        var lexpr = this.parseLexpr();
        if (lexpr.args || lexpr.name.endsWith('$'))
            this.compileError("A FOR ... NEXT loop can only use numeric variables.", lexpr.$loc);
        return lexpr;
    };
    BASICParser.prototype.parseList = function (parseFunc, delim) {
        var sep;
        var list = [];
        do {
            var el = parseFunc.bind(this)(); // call parse function
            if (el != null)
                list.push(el); // add parsed element to list
            sep = this.consumeToken(); // consume seperator token
        } while (sep.str == delim);
        this.pushbackToken(sep);
        return list;
    };
    BASICParser.prototype.parseLexprList = function () {
        return this.parseList(this.parseLexpr, ',');
    };
    BASICParser.prototype.parseExprList = function () {
        return this.parseList(this.parseExpr, ',');
    };
    BASICParser.prototype.parseLabelList = function () {
        return this.parseList(this.parseLabel, ',');
    };
    BASICParser.prototype.parseLabel = function () {
        // parse full expr?
        if (this.opts.computedGoto) {
            // parse expression, but still add to list of label targets if constant
            var expr = this.parseExpr();
            if (isLiteral(expr))
                this.targets[expr.value] = this.lasttoken.$loc;
            return expr;
        }
        else {
            // parse a single number or ident label
            var tok = this.consumeToken();
            switch (tok.type) {
                case TokenType.Ident:
                    if (!this.opts.optionalLabels)
                        this.dialectError("All labels must be line numbers");
                case TokenType.Int:
                    var label = tok.str;
                    this.targets[label] = tok.$loc;
                    return { valtype: 'label', value: label };
                default:
                    var what = this.opts.optionalLabels ? "label or line number" : "line number";
                    this.compileError("There should be a ".concat(what, " here."));
            }
        }
    };
    BASICParser.prototype.parseDatumList = function () {
        return this.parseList(this.parseDatum, ',');
    };
    BASICParser.prototype.parseDatum = function () {
        var tok = this.consumeToken();
        // get rid of leading whitespace
        while (tok.type == TokenType.Whitespace)
            tok = this.consumeToken();
        if (isEOS(tok))
            this.compileError("There should be a datum here.");
        // parse constants
        if (tok.type <= TokenType.HexOctalInt) {
            return this.parseValue(tok);
        }
        if (tok.str == '-' && this.peekToken().type <= TokenType.HexOctalInt) {
            tok = this.consumeToken();
            return { valtype: 'number', value: -this.parseValue(tok).value };
        }
        if (tok.str == '+' && this.peekToken().type <= TokenType.HexOctalInt) {
            tok = this.consumeToken();
            return this.parseValue(tok);
        }
        // concat all stuff including whitespace
        // TODO: should trim whitespace only if not quoted string
        var s = '';
        while (!isEOS(tok) && tok.str != ',') {
            s += this.parseValue(tok).value;
            tok = this.consumeToken();
        }
        this.pushbackToken(tok);
        return { valtype: 'string', value: s }; // trim leading and trailing whitespace
    };
    BASICParser.prototype.parseValue = function (tok) {
        switch (tok.type) {
            case TokenType.HexOctalInt:
                if (!this.opts.hexOctalConsts)
                    this.dialectErrorNoSupport("hex/octal constants");
                var base = tok.str.startsWith('H') ? 16 : 8;
                return { valtype: 'number', value: parseInt(tok.str.substr(1), base) };
            case TokenType.Int:
            case TokenType.Float:
                return { valtype: 'number', value: this.parseNumber(tok.str) };
            case TokenType.String:
                return { valtype: 'string', value: stripQuotes(tok.str) };
            default:
                return { valtype: 'string', value: tok.str }; // only used in DATA statement
        }
    };
    BASICParser.prototype.parsePrimary = function () {
        var tok = this.consumeToken();
        switch (tok.type) {
            case TokenType.HexOctalInt:
            case TokenType.Int:
            case TokenType.Float:
            case TokenType.String:
                return this.parseValue(tok);
            case TokenType.Ident:
                if (tok.str == 'NOT') {
                    var expr = this.parsePrimary();
                    return { valtype: 'number', op: this.opts.bitwiseLogic ? 'bnot' : 'lnot', expr: expr };
                }
                else {
                    this.pushbackToken(tok);
                    return this.parseVarSubscriptOrFunc();
                }
            case TokenType.Operator:
                if (tok.str == '(') {
                    var expr = this.parseExpr();
                    this.expectToken(')', "There should be another expression or a \")\" here.");
                    return expr;
                }
                else if (tok.str == '-') {
                    var expr = this.parsePrimary(); // TODO: -2^2=-4 and -2-2=-4
                    return { valtype: 'number', op: 'neg', expr: expr };
                }
                else if (tok.str == '+') {
                    return this.parsePrimary(); // ignore unary +
                }
            default:
                this.compileError("The expression is incomplete.");
                return;
        }
    };
    BASICParser.prototype.parseNumber = function (str) {
        var n = parseFloat(str);
        if (isNaN(n))
            this.compileError("The number ".concat(str, " is not a valid floating-point number."));
        if (this.opts.checkOverflow && !isFinite(n))
            this.compileError("The number ".concat(str, " is too big to fit into a floating-point value."));
        return n;
    };
    BASICParser.prototype.parseExpr1 = function (left, minPred) {
        var look = this.peekToken();
        while (getPrecedence(look) >= minPred) {
            var op = this.consumeToken();
            if (this.opts.validOperators && this.opts.validOperators.indexOf(op.str) < 0)
                this.dialectErrorNoSupport("the \"".concat(op.str, "\" operator"));
            var right = this.parsePrimary();
            look = this.peekToken();
            while (getPrecedence(look) > getPrecedence(op)) {
                right = this.parseExpr1(right, getPrecedence(look));
                look = this.peekToken();
            }
            var opfn = getOperator(op.str).f;
            // use logical operators instead of bitwise?
            if (!this.opts.bitwiseLogic && op.str == 'AND')
                opfn = 'land';
            if (!this.opts.bitwiseLogic && op.str == 'OR')
                opfn = 'lor';
            var valtype = this.exprTypeForOp(opfn, left, right, op);
            left = { valtype: valtype, op: opfn, left: left, right: right };
        }
        return left;
    };
    BASICParser.prototype.parseExpr = function () {
        var startloc = this.peekToken().$loc;
        var expr = this.parseExpr1(this.parsePrimary(), 0);
        var endloc = this.lasttoken.$loc;
        expr.$loc = mergeLocs(startloc, endloc);
        return expr;
    };
    BASICParser.prototype.parseExprWithType = function (expecttype) {
        var expr = this.parseExpr();
        if (expr.valtype != expecttype)
            this.compileError("There should be a ".concat(expecttype, " here, but this expression evaluates to a ").concat(expr.valtype, "."), expr.$loc);
        return expr;
    };
    BASICParser.prototype.validateVarName = function (lexpr) {
        switch (this.opts.varNaming) {
            case 'A': // TINY BASIC, no strings
                if (!/^[A-Z]$/i.test(lexpr.name))
                    this.dialectErrorNoSupport("variable names other than a single letter");
                break;
            case 'A1':
                if (lexpr.args == null && !/^[A-Z][0-9]?[$]?$/i.test(lexpr.name))
                    this.dialectErrorNoSupport("variable names other than a letter followed by an optional digit");
                if (lexpr.args != null && !/^[A-Z]?[$]?$/i.test(lexpr.name))
                    this.dialectErrorNoSupport("array names other than a single letter");
                break;
            case 'A1$':
                if (!/^[A-Z][0-9]?[$]?$/i.test(lexpr.name))
                    this.dialectErrorNoSupport("variable names other than a letter followed by an optional digit");
                break;
            case 'AA':
                if (lexpr.args == null && !/^[A-Z][A-Z0-9]?[$]?$/i.test(lexpr.name))
                    this.dialectErrorNoSupport("variable names other than a letter followed by an optional letter or digit");
                break;
            case '*':
                break;
        }
    };
    BASICParser.prototype.visitExpr = function (expr, callback) {
        if (isBinOp(expr)) {
            this.visitExpr(expr.left, callback);
            this.visitExpr(expr.right, callback);
        }
        if (isUnOp(expr)) {
            this.visitExpr(expr.expr, callback);
        }
        if (isLookup(expr) && expr.args != null) {
            for (var _i = 0, _a = expr.args; _i < _a.length; _i++) {
                var arg = _a[_i];
                this.visitExpr(arg, callback);
            }
        }
        callback(expr);
    };
    // type-checking
    BASICParser.prototype.exprTypeForOp = function (fnname, left, right, optok) {
        if (left.valtype == 'string' || right.valtype == 'string') {
            if (fnname == 'add') {
                if (this.opts.stringConcat)
                    return 'string'; // concat strings
                else
                    this.dialectErrorNoSupport("the \"+\" operator to concatenate strings", optok.$loc);
            }
            else if (fnname.length != 2) // only relops are 2 chars long!
                this.compileError("You can't do math on strings until they're converted to numbers.", optok.$loc);
        }
        return 'number';
    };
    BASICParser.prototype.exprTypeForSubscript = function (fnname, args, loc) {
        args = args || [];
        // first check the built-in functions
        var defs = BUILTIN_MAP[fnname];
        if (defs != null) {
            if (!this.validFunction(fnname))
                this.dialectErrorNoSupport("the ".concat(fnname, " function"), loc);
            for (var _i = 0, defs_1 = defs; _i < defs_1.length; _i++) {
                var def = defs_1[_i];
                if (args.length == def.args.length)
                    return def.result; // TODO: check arg types
            }
            // TODO: check func arg types
            this.compileError("The ".concat(fnname, " function takes ").concat(def.args.length, " arguments, but ").concat(args.length, " are given."), loc);
        }
        // no function found, assume it's an array ref
        // TODO: validateVarName() later?
        this.varrefs[fnname] = loc;
        return fnname.endsWith('$') ? 'string' : 'number';
    };
    //// STATEMENTS
    BASICParser.prototype.stmt__LET = function () {
        var lexprs = [this.parseLexpr()];
        this.expectToken("=");
        // look for A=B=expr (TODO: doesn't work on arrays)
        while (this.opts.chainAssignments && this.peekToken().type == TokenType.Ident && this.peekToken(1).str == '=') {
            lexprs.push(this.parseLexpr());
            this.expectToken("=");
        }
        var right = this.parseExprWithType(lexprs[0].valtype);
        return { command: "LET", lexprs: lexprs, right: right };
    };
    BASICParser.prototype.stmt__PRINT = function () {
        var sep, lastsep;
        var list = [];
        do {
            sep = this.peekToken();
            if (isEOS(sep)) {
                break;
            }
            else if (sep.str == ';') {
                this.consumeToken();
                lastsep = sep;
            }
            else if (sep.str == ',') {
                this.consumeToken();
                list.push({ value: '\t' });
                lastsep = sep;
            }
            else {
                list.push(this.parseExpr());
                lastsep = null;
            }
        } while (true);
        if (!(lastsep && (lastsep.str == ';' || sep.str != ','))) {
            list.push({ value: '\n' });
        }
        return { command: "PRINT", args: list };
    };
    BASICParser.prototype.stmt__GOTO = function () {
        return this.__GO("GOTO");
    };
    BASICParser.prototype.stmt__GOSUB = function () {
        return this.__GO("GOSUB");
    };
    BASICParser.prototype.__GO = function (cmd) {
        var expr = this.parseLabel();
        // GOTO (expr) OF (labels...)
        if (this.peekToken().str == this.validKeyword('OF')) {
            this.expectToken('OF');
            var newcmd = (cmd == 'GOTO') ? 'ONGOTO' : 'ONGOSUB';
            return { command: newcmd, expr: expr, labels: this.parseLabelList() };
        }
        else {
            // regular GOTO or GOSUB
            return { command: cmd, label: expr };
        }
    };
    BASICParser.prototype.stmt__IF = function () {
        var cmdtok = this.lasttoken;
        var cond = this.parseExprWithType("number");
        var ifstmt = { command: "IF", cond: cond };
        this.addStatement(ifstmt, cmdtok);
        // we accept GOTO or THEN if line number provided (DEC accepts GO TO)
        var thengoto = this.expectTokens(['THEN', 'GOTO', 'GO']);
        if (thengoto.str == 'GO')
            this.expectToken('TO');
        // multiline IF .. THEN? push it to scope stack
        if (this.opts.multilineIfThen && isEOS(this.peekToken())) {
            this.scopestack.push(this.getPC() - 1); // we already added stmt to list, so - 1
        }
        else {
            // parse line number or statement clause
            this.parseGotoOrStatements();
            // is the next statement an ELSE?
            // gotta parse it now because it's an end-of-statement token
            if (this.peekToken().str == 'ELSE') {
                this.expectToken('ELSE');
                ifstmt.endpc = this.getPC() + 1;
                this.stmt__ELSE();
            }
            else {
                ifstmt.endpc = this.getPC();
            }
        }
    };
    BASICParser.prototype.stmt__ELSE = function () {
        var elsestmt = { command: "ELSE" };
        this.addStatement(elsestmt, this.lasttoken);
        // multiline ELSE? or ELSE IF?
        var nexttok = this.peekToken();
        if (this.opts.multilineIfThen && isEOS(nexttok)) {
            this.scopestack.push(this.getPC() - 1); // we already added stmt to list, so - 1
        }
        else if (this.opts.multilineIfThen && nexttok.str == 'IF') {
            this.scopestack.push(this.getPC() - 1); // we already added stmt to list, so - 1
            this.parseGotoOrStatements();
            this.elseifcount++;
        }
        else {
            // parse line number or statement clause
            this.parseGotoOrStatements();
            elsestmt.endpc = this.getPC();
        }
    };
    BASICParser.prototype.parseGotoOrStatements = function () {
        var lineno = this.peekToken();
        // assume GOTO if number given after THEN
        if (lineno.type == TokenType.Int) {
            this.parseLabel();
            var gotostmt = { command: 'GOTO', label: { valtype: 'label', value: lineno.str } };
            this.addStatement(gotostmt, lineno);
        }
        else {
            // parse rest of IF clause
            this.parseCompoundStatement();
        }
    };
    BASICParser.prototype.stmt__FOR = function () {
        var lexpr = this.parseForNextLexpr();
        this.expectToken('=');
        var init = this.parseExprWithType("number");
        this.expectToken('TO');
        var targ = this.parseExprWithType("number");
        if (this.peekToken().str == 'STEP') {
            this.consumeToken();
            var step = this.parseExprWithType("number");
        }
        return { command: 'FOR', lexpr: lexpr, initial: init, target: targ, step: step };
    };
    BASICParser.prototype.stmt__NEXT = function () {
        var lexpr = null;
        // NEXT var might be optional
        if (!this.opts.optionalNextVar || !isEOS(this.peekToken())) {
            lexpr = this.parseForNextLexpr();
            // convert ',' to ':' 'NEXT'
            if (this.opts.multipleNextVars && this.peekToken().str == ',') {
                this.consumeToken(); // consume ','
                this.tokens.unshift({ type: TokenType.Ident, str: 'NEXT', $loc: this.peekToken().$loc });
                this.tokens.unshift({ type: TokenType.Operator, str: ':', $loc: this.peekToken().$loc });
            }
        }
        return { command: 'NEXT', lexpr: lexpr };
    };
    BASICParser.prototype.stmt__WHILE = function () {
        var cond = this.parseExprWithType("number");
        return { command: 'WHILE', cond: cond };
    };
    BASICParser.prototype.stmt__WEND = function () {
        return { command: 'WEND' };
    };
    BASICParser.prototype.stmt__DIM = function () {
        var _this = this;
        var lexprs = this.parseLexprList();
        lexprs.forEach(function (arr) {
            if (arr.args == null || arr.args.length == 0)
                _this.compileError("An array defined by DIM must have at least one dimension.");
            else if (arr.args.length > _this.opts.maxDimensions)
                _this.dialectErrorNoSupport("arrays with more than ".concat(_this.opts.maxDimensions, " dimensionals"));
            for (var _i = 0, _a = arr.args; _i < _a.length; _i++) {
                var arrdim = _a[_i];
                if (arrdim.valtype != 'number')
                    _this.compileError("Array dimensions must be numeric.", arrdim.$loc);
                if (isLiteral(arrdim) && typeof arrdim.value === 'number' && arrdim.value < _this.opts.defaultArrayBase)
                    _this.compileError("An array dimension cannot be less than ".concat(_this.opts.defaultArrayBase, "."), arrdim.$loc);
            }
        });
        return { command: 'DIM', args: lexprs };
    };
    BASICParser.prototype.stmt__INPUT = function () {
        var prompt = this.consumeToken();
        var promptstr;
        if (prompt.type == TokenType.String) {
            this.expectTokens([';', ',']);
            promptstr = stripQuotes(prompt.str);
        }
        else {
            this.pushbackToken(prompt);
            promptstr = "";
        }
        return { command: 'INPUT', prompt: { valtype: 'string', value: promptstr }, args: this.parseLexprList() };
    };
    /* for HP BASIC only */
    BASICParser.prototype.stmt__ENTER = function () {
        var timeout = this.parseExpr();
        this.expectToken(',');
        var elapsed = this.parseLexpr(); // TODO: this has to go somewheres
        this.expectToken(',');
        return { command: 'INPUT', prompt: null, args: this.parseLexprList(), timeout: timeout, elapsed: elapsed };
    };
    // TODO: DATA statement doesn't read unquoted strings
    BASICParser.prototype.stmt__DATA = function () {
        return { command: 'DATA', datums: this.parseDatumList() };
    };
    BASICParser.prototype.stmt__READ = function () {
        return { command: 'READ', args: this.parseLexprList() };
    };
    BASICParser.prototype.stmt__RESTORE = function () {
        var label = null;
        if (this.opts.restoreWithLabel && !isEOS(this.peekToken()))
            label = this.parseLabel();
        return { command: 'RESTORE', label: label };
    };
    BASICParser.prototype.stmt__RETURN = function () {
        return { command: 'RETURN' };
    };
    BASICParser.prototype.stmt__STOP = function () {
        return { command: 'STOP' };
    };
    BASICParser.prototype.stmt__END = function () {
        if (this.opts.multilineIfThen && this.scopestack.length) {
            var endtok = this.expectTokens(['IF', 'SUB']);
            if (endtok.str == 'IF') {
                this.popIfThenScope();
                while (this.elseifcount--)
                    this.popIfThenScope(); // pop additional ELSE IF blocks?
                this.elseifcount = 0;
            }
            else if (endtok.str == 'SUB') {
                this.addStatement({ command: 'RETURN' }, endtok);
                this.popScope({ command: 'END' }, 'SUB'); // fake command to avoid null
            }
        }
        else {
            return { command: 'END' };
        }
    };
    BASICParser.prototype.stmt__ON = function () {
        var expr = this.parseExprWithType("number");
        var gotok = this.consumeToken();
        var cmd = { GOTO: 'ONGOTO', THEN: 'ONGOTO', GOSUB: 'ONGOSUB' }[gotok.str]; // THEN only for DEC basic?
        if (!cmd)
            this.compileError("There should be a GOTO or GOSUB here.");
        var labels = this.parseLabelList();
        return { command: cmd, expr: expr, labels: labels };
    };
    BASICParser.prototype.stmt__DEF = function () {
        var _this = this;
        var lexpr = this.parseVarSubscriptOrFunc(); // TODO: only allow parameter names, not exprs
        if (lexpr.args && lexpr.args.length > this.opts.maxDefArgs)
            this.compileError("There can be no more than ".concat(this.opts.maxDefArgs, " arguments to a function or subscript."), lexpr.$loc);
        if (!lexpr.name.startsWith('FN'))
            this.compileError("Functions defined with DEF must begin with the letters \"FN\".", lexpr.$loc);
        this.markVarDefs(lexpr); // local variables need to be marked as referenced (TODO: only for this scope)
        this.expectToken("=");
        var func = this.parseExpr();
        // build call graph to detect cycles
        this.visitExpr(func, function (expr) {
            if (isLookup(expr) && expr.name.startsWith('FN')) {
                if (!_this.fnrefs[lexpr.name])
                    _this.fnrefs[lexpr.name] = [];
                _this.fnrefs[lexpr.name].push(expr.name);
            }
        });
        this.checkCallGraph(lexpr.name, new Set());
        return { command: 'DEF', lexpr: lexpr, def: func };
    };
    BASICParser.prototype.stmt__SUB = function () {
        var lexpr = this.parseVarSubscriptOrFunc(); // TODO: only allow parameter names, not exprs
        this.markVarDefs(lexpr); // local variables need to be marked as referenced (TODO: only for this scope)
        this.addLabel(lexpr.name, 1); // offset +1 to skip SUB command
        return { command: 'SUB', lexpr: lexpr };
    };
    BASICParser.prototype.stmt__CALL = function () {
        return { command: 'CALL', call: this.parseVarSubscriptOrFunc() };
    };
    BASICParser.prototype.markVarDefs = function (lexpr) {
        this.vardefs[lexpr.name] = lexpr;
        if (lexpr.args != null)
            for (var _i = 0, _a = lexpr.args; _i < _a.length; _i++) {
                var arg = _a[_i];
                if (isLookup(arg) && arg.args == null)
                    this.vardefs[arg.name] = arg;
                else
                    this.compileError("A definition can only define symbols, not expressions.");
            }
    };
    // detect cycles in call graph starting at function 'name'
    BASICParser.prototype.checkCallGraph = function (name, visited) {
        if (visited.has(name))
            this.compileError("There was a cycle in the function definition graph for ".concat(name, "."));
        visited.add(name);
        var refs = this.fnrefs[name] || [];
        for (var _i = 0, refs_1 = refs; _i < refs_1.length; _i++) {
            var ref = refs_1[_i];
            this.checkCallGraph(ref, visited);
        } // recurse
        visited.delete(name);
    };
    BASICParser.prototype.stmt__POP = function () {
        return { command: 'POP' };
    };
    BASICParser.prototype.stmt__GET = function () {
        var lexpr = this.parseLexpr();
        return { command: 'GET', lexpr: lexpr };
    };
    BASICParser.prototype.stmt__CLEAR = function () {
        return { command: 'CLEAR' };
    };
    BASICParser.prototype.stmt__RANDOMIZE = function () {
        return { command: 'RANDOMIZE' };
    };
    BASICParser.prototype.stmt__CHANGE = function () {
        var src = this.parseExpr();
        this.expectToken('TO');
        var dest = this.parseLexpr();
        if (dest.valtype == src.valtype)
            this.compileError("CHANGE can only convert strings to numeric arrays, or vice-versa.", mergeLocs(src.$loc, dest.$loc));
        return { command: 'CHANGE', src: src, dest: dest };
    };
    BASICParser.prototype.stmt__CONVERT = function () {
        var src = this.parseExpr();
        this.expectToken('TO');
        var dest = this.parseLexpr();
        if (dest.valtype == src.valtype)
            this.compileError("CONVERT can only convert strings to numbers, or vice-versa.", mergeLocs(src.$loc, dest.$loc));
        return { command: 'CONVERT', src: src, dest: dest };
    };
    // TODO: CHANGE A TO A$ (4th edition, A(0) is len and A(1..) are chars)
    BASICParser.prototype.stmt__OPTION = function () {
        this.optionCount++;
        var tokname = this.consumeToken();
        var optname = tokname.str.toUpperCase();
        if (tokname.type != TokenType.Ident)
            this.compileError("There must be a name after the OPTION statement.");
        var tokarg = this.consumeToken();
        var arg = tokarg.str.toUpperCase();
        switch (optname) {
            case 'DIALECT':
                if (this.optionCount > 1)
                    this.compileError("OPTION DIALECT must be the first OPTION statement in the file.", tokname.$loc);
                var dname = arg || "";
                if (dname == "")
                    this.compileError("OPTION DIALECT requires a dialect name.", tokname.$loc);
                var dialect = exports.DIALECTS[dname.toUpperCase()];
                if (dialect)
                    this.opts = dialect;
                else
                    this.compileError("".concat(dname, " is not a valid dialect."));
                break;
            case 'BASE':
                var base = parseInt(arg);
                if (base == 0 || base == 1)
                    this.opts.defaultArrayBase = base;
                else
                    this.compileError("OPTION BASE can only be 0 or 1.");
                break;
            case 'CPUSPEED':
                if (!(this.opts.commandsPerSec = Math.min(1e7, arg == 'MAX' ? Infinity : parseFloat(arg))))
                    this.compileError("OPTION CPUSPEED takes a positive number or MAX.");
                break;
            default:
                // maybe it's one of the options?
                var propname = Object.getOwnPropertyNames(this.opts).find(function (n) { return n.toUpperCase() == optname; });
                if (propname == null)
                    this.compileError("".concat(optname, " is not a valid option."), tokname.$loc);
                if (arg == null)
                    this.compileError("OPTION ".concat(optname, " requires a parameter."));
                switch (typeof this.opts[propname]) {
                    case 'boolean':
                        this.opts[propname] = arg.toUpperCase().startsWith("T") || arg > 0;
                        return;
                    case 'number':
                        this.opts[propname] = parseFloat(arg);
                        return;
                    case 'string':
                        this.opts[propname] = arg;
                        return;
                    case 'object':
                        if (Array.isArray(this.opts[propname]) && arg == 'ALL') {
                            this.opts[propname] = null;
                            return;
                        }
                        this.compileError("OPTION ".concat(optname, " ALL is the only option supported."));
                }
                break;
        }
        return { command: 'OPTION', optname: optname, optargs: [arg] };
    };
    // for workermain
    BASICParser.prototype.generateListing = function (file, program) {
        var srclines = [];
        var laststmt;
        program.stmts.forEach(function (stmt, idx) {
            laststmt = stmt;
            srclines.push(stmt.$loc);
        });
        if (this.opts.endStmtRequired && (laststmt == null || laststmt.command != 'END'))
            this.dialectError("All programs must have a final END statement");
        return { lines: srclines };
    };
    BASICParser.prototype.getListings = function () {
        return this.listings;
    };
    // LINT STUFF
    BASICParser.prototype.checkAll = function (program) {
        this.checkLabels();
        this.checkScopes();
        this.checkVarRefs();
    };
    BASICParser.prototype.checkLabels = function () {
        for (var targ in this.targets) {
            if (this.labels[targ] == null) {
                var what = this.opts.optionalLabels && isNaN(parseInt(targ)) ? "label named" : "line number";
                this.addError("There isn't a ".concat(what, " ").concat(targ, "."), this.targets[targ]);
            }
        }
    };
    BASICParser.prototype.checkScopes = function () {
        if (this.opts.compiledBlocks && this.scopestack.length) {
            var open = this.stmts[this.scopestack.pop()];
            var close = { FOR: "NEXT", WHILE: "WEND", IF: "END IF", SUB: "END SUB" };
            this.compileError("Don't forget to add a matching ".concat(close[open.command], " statement."), open.$loc);
        }
    };
    BASICParser.prototype.checkVarRefs = function () {
        if (!this.opts.defaultValues) {
            for (var varname in this.varrefs) {
                if (this.vardefs[varname] == null)
                    this.compileError("The variable ".concat(varname, " isn't defined anywhere in the program."), this.varrefs[varname]);
            }
        }
    };
    return BASICParser;
}());
exports.BASICParser = BASICParser;
///// BASIC DIALECTS
exports.ECMA55_MINIMAL = {
    dialectName: "ECMA55",
    asciiOnly: true,
    uppercaseOnly: true,
    optionalLabels: false,
    optionalWhitespace: false,
    multipleStmtsPerLine: false,
    varNaming: "A1",
    staticArrays: true,
    sharedArrayNamespace: true,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: false,
    stringConcat: false,
    maxDimensions: 2,
    maxDefArgs: 255,
    maxStringLength: 255,
    tickComments: false,
    hexOctalConsts: false,
    validKeywords: [
        'BASE', 'DATA', 'DEF', 'DIM', 'END',
        'FOR', 'GO', 'GOSUB', 'GOTO', 'IF', 'INPUT', 'LET', 'NEXT', 'ON', 'OPTION', 'PRINT',
        'RANDOMIZE', 'READ', 'REM', 'RESTORE', 'RETURN', 'STEP', 'STOP', 'THEN', 'TO' // 'SUB'
    ],
    validFunctions: [
        'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'RND', 'SGN', 'SIN', 'SQR', 'TAB', 'TAN'
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^'
    ],
    printZoneLength: 15,
    numericPadding: true,
    checkOverflow: true,
    testInitialFor: true,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: true,
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: true,
    chainAssignments: false,
    optionalLet: false,
    compiledBlocks: true,
};
exports.DARTMOUTH_4TH_EDITION = {
    dialectName: "DARTMOUTH4",
    asciiOnly: true,
    uppercaseOnly: true,
    optionalLabels: false,
    optionalWhitespace: false,
    multipleStmtsPerLine: false,
    varNaming: "A1",
    staticArrays: true,
    sharedArrayNamespace: false,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: false,
    stringConcat: false,
    maxDimensions: 2,
    maxDefArgs: 255,
    maxStringLength: 255,
    tickComments: true,
    hexOctalConsts: false,
    validKeywords: [
        'BASE', 'DATA', 'DEF', 'DIM', 'END',
        'FOR', 'GO', 'GOSUB', 'GOTO', 'IF', 'INPUT', 'LET', 'NEXT', 'ON', 'OPTION', 'PRINT',
        'RANDOMIZE', 'READ', 'REM', 'RESTORE', 'RETURN', 'STEP', 'STOP', 'THEN', 'TO', //'SUB',
        'CHANGE', 'MAT', 'RANDOM', 'RESTORE$', 'RESTORE*',
    ],
    validFunctions: [
        'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'RND', 'SGN', 'SIN', 'SQR', 'TAB', 'TAN',
        'TRN', 'INV', 'DET', 'NUM', 'ZER', // NUM = # of strings input for MAT INPUT
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^'
    ],
    printZoneLength: 15,
    numericPadding: true,
    checkOverflow: true,
    testInitialFor: true,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: true,
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: true,
    chainAssignments: true,
    optionalLet: false,
    compiledBlocks: true,
};
// TODO: only integers supported
exports.TINY_BASIC = {
    dialectName: "TINY",
    asciiOnly: true,
    uppercaseOnly: true,
    optionalLabels: false,
    optionalWhitespace: false,
    multipleStmtsPerLine: false,
    varNaming: "A",
    staticArrays: false,
    sharedArrayNamespace: true,
    defaultArrayBase: 0,
    defaultArraySize: 0,
    defaultValues: true,
    stringConcat: false,
    maxDimensions: 0,
    maxDefArgs: 255,
    maxStringLength: 255,
    tickComments: false,
    hexOctalConsts: false,
    validKeywords: [
        'OPTION',
        'PRINT', 'IF', 'THEN', 'GOTO', 'INPUT', 'LET', 'GOSUB', 'RETURN', 'CLEAR', 'END'
    ],
    validFunctions: [],
    validOperators: [
        '=', '<>', '><', '<', '>', '<=', '>=', '+', '-', '*', '/',
    ],
    printZoneLength: 1,
    numericPadding: false,
    checkOverflow: false,
    testInitialFor: false,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: false,
    computedGoto: true,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false,
    optionalLet: false,
    compiledBlocks: false,
};
exports.HP_TIMESHARED_BASIC = {
    dialectName: "HP2000",
    asciiOnly: true,
    uppercaseOnly: true, // the terminal is usually uppercase
    optionalLabels: false,
    optionalWhitespace: false,
    multipleStmtsPerLine: true,
    varNaming: "A1$",
    staticArrays: true,
    sharedArrayNamespace: false,
    defaultArrayBase: 1,
    defaultArraySize: 11,
    defaultValues: false,
    stringConcat: false,
    maxDimensions: 2,
    maxDefArgs: 255,
    maxStringLength: 255, // 72 for literals
    tickComments: false, // TODO: HP BASIC has 'hh char constants
    hexOctalConsts: false,
    validKeywords: [
        'BASE', 'DATA', 'DEF', 'DIM', 'END',
        'FOR', 'GO', 'GOSUB', 'GOTO', 'IF', 'INPUT', 'LET', 'NEXT', 'OPTION', 'PRINT',
        'RANDOMIZE', 'READ', 'REM', 'RESTORE', 'RETURN', 'STEP', 'STOP', 'THEN', 'TO', //'SUB',
        'ENTER', 'MAT', 'CONVERT', 'OF', 'IMAGE', 'USING'
    ],
    validFunctions: [
        'ABS', 'ATN', 'BRK', 'COS', 'CTL', 'EXP', 'INT', 'LEN', 'LIN', 'LOG', 'NUM',
        'POS', 'RND', 'SGN', 'SIN', 'SPA', 'SQR', 'TAB', 'TAN', 'TIM', 'TYP', 'UPS$', // TODO: POS,
        'NFORMAT$', // non-standard, substitute for PRINT USING
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^',
        '**', '#', 'NOT', 'AND', 'OR', 'MIN', 'MAX',
    ],
    printZoneLength: 15,
    numericPadding: true,
    checkOverflow: false,
    testInitialFor: true,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: false,
    computedGoto: true, // not really, but we do parse expressions for GOTO ... OF 
    restoreWithLabel: true,
    squareBrackets: true,
    arraysContainChars: true,
    endStmtRequired: true,
    chainAssignments: true,
    optionalLet: true,
    compiledBlocks: true,
    maxArrayElements: 5000,
    // TODO: max line number
};
exports.DEC_BASIC_11 = {
    dialectName: "DEC11",
    asciiOnly: true,
    uppercaseOnly: true, // translates all lower to upper
    optionalLabels: false,
    optionalWhitespace: false,
    multipleStmtsPerLine: false, // actually "\"
    varNaming: "A1",
    staticArrays: true,
    sharedArrayNamespace: false,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: true,
    stringConcat: true, // can also use &
    maxDimensions: 2,
    maxDefArgs: 255, // ?
    maxStringLength: 255,
    tickComments: false,
    hexOctalConsts: false,
    validKeywords: [
        'OPTION',
        'DATA', 'DEF', 'DIM', 'END', 'FOR', 'STEP', 'GOSUB', 'GOTO', 'GO', 'TO',
        'IF', 'THEN', 'INPUT', 'LET', 'NEXT', 'ON', 'PRINT', 'RANDOMIZE',
        'READ', 'REM', 'RESET', 'RESTORE', 'RETURN', 'STOP',
    ],
    validFunctions: [
        'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'LOG10', 'PI', 'RND', 'SGN', 'SIN', 'SQR', 'TAB',
        'ASC', 'BIN', 'CHR$', 'CLK$', 'DAT$', 'LEN', 'OCT', 'POS', 'SEG$', 'STR$', 'TRM$', 'VAL',
        'NFORMAT$', // non-standard, substitute for PRINT USING
    ],
    validOperators: [
        '=', '<>', '><', '<', '>', '<=', '>=', '+', '-', '*', '/', '^',
    ],
    printZoneLength: 14,
    numericPadding: true,
    checkOverflow: true, // non-fatal; subst 0 and continue
    testInitialFor: true,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: true, // might continue
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false,
    optionalLet: true,
    compiledBlocks: true,
    // TODO: max line number 32767
    // TODO: \ separator, % int vars and constants, 'single' quoted
    // TODO: can't compare strings and numbers
};
exports.DEC_BASIC_PLUS = {
    dialectName: "DECPLUS",
    asciiOnly: true,
    uppercaseOnly: false,
    optionalLabels: false,
    optionalWhitespace: false,
    multipleStmtsPerLine: true,
    varNaming: "A1",
    staticArrays: true,
    sharedArrayNamespace: false,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: true,
    stringConcat: true, // can also use "&"
    maxDimensions: 2,
    maxDefArgs: 255, // ?
    maxStringLength: 255,
    tickComments: true, // actually use "!"
    hexOctalConsts: false,
    validKeywords: [
        'OPTION',
        'REM', 'LET', 'DIM', 'RANDOM', 'RANDOMIZE', 'IF', 'THEN', 'ELSE',
        'FOR', 'TO', 'STEP', 'WHILE', 'UNTIL', 'NEXT', 'DEF', 'ON', 'GOTO', 'GOSUB',
        'RETURN', 'CHANGE', 'READ', 'DATA', 'RESTORE', 'PRINT', 'USING',
        'INPUT', 'LINE', 'NAME', 'AS', 'ERROR', 'RESUME', 'CHAIN', 'STOP', 'END',
        'MAT', 'UNLESS', 'SLEEP', 'WAIT',
    ],
    validFunctions: [
        'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'LOG10', 'PI', 'RND', 'SGN', 'SIN', 'SQR', 'TAB', 'TAN',
        'POS', 'TAB', 'ASCII', 'CHR$', 'CVT%$', 'CVTF$', 'CVT$%', 'CVT$F',
        'LEFT$', 'RIGHT$', 'MID$', 'LEN', 'INSTR', 'SPACE$', 'NUM$', 'VAL', 'XLATE',
        'DATE$', 'TIME$', 'TIME', 'ERR', 'ERL', 'SWAP%', 'RAD$',
        'NFORMAT$', // non-standard, substitute for PRINT USING
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^',
        '**', '==',
        'NOT', 'AND', 'OR', 'XOR', 'IMP', 'EQV',
    ],
    printZoneLength: 14,
    numericPadding: true,
    checkOverflow: true, // non-fatal; subst 0 and continue
    testInitialFor: true,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: true, // might continue
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false, // TODO: can chain with "," not "="
    optionalLet: true,
    compiledBlocks: true,
    // TODO: max line number 32767
    // TODO: \ separator, % int vars and constants, 'single' quoted
    // TODO: can't compare strings and numbers
    // TODO: WHILE/UNTIL/FOR extra statements, etc
};
exports.BASICODE = {
    dialectName: "BASICODE",
    asciiOnly: true,
    uppercaseOnly: false,
    optionalLabels: false,
    optionalWhitespace: true,
    multipleStmtsPerLine: true,
    varNaming: "AA",
    staticArrays: true,
    sharedArrayNamespace: false,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: false,
    stringConcat: true,
    maxDimensions: 2,
    maxDefArgs: 255,
    maxStringLength: 255,
    tickComments: false,
    hexOctalConsts: false,
    validKeywords: [
        'BASE', 'DATA', 'DEF', 'DIM', 'END',
        'FOR', 'GO', 'GOSUB', 'GOTO', 'IF', 'INPUT', 'LET', 'NEXT', 'ON', 'OPTION', 'PRINT',
        'READ', 'REM', 'RESTORE', 'RETURN', 'STEP', 'STOP', 'THEN', 'TO', // 'SUB',
        'AND', 'NOT', 'OR'
    ],
    validFunctions: [
        'ABS', 'ASC', 'ATN', 'CHR$', 'COS', 'EXP', 'INT', 'LEFT$', 'LEN', 'LOG',
        'MID$', 'RIGHT$', 'SGN', 'SIN', 'SQR', 'TAB', 'TAN', 'VAL'
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^', 'AND', 'NOT', 'OR'
    ],
    printZoneLength: 15,
    numericPadding: true,
    checkOverflow: true,
    testInitialFor: true,
    optionalNextVar: false,
    multipleNextVars: false,
    bitwiseLogic: false,
    checkOnGotoIndex: true,
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false,
    optionalLet: true,
    compiledBlocks: false,
};
exports.ALTAIR_BASIC41 = {
    dialectName: "ALTAIR41",
    asciiOnly: true,
    uppercaseOnly: true,
    optionalLabels: false,
    optionalWhitespace: true,
    multipleStmtsPerLine: true,
    varNaming: "*", // or AA
    staticArrays: false,
    sharedArrayNamespace: true,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: true,
    stringConcat: true,
    maxDimensions: 128, // "as many as will fit on a single line" ... ?
    maxDefArgs: 255,
    maxStringLength: 255,
    tickComments: false,
    hexOctalConsts: false,
    validKeywords: [
        'OPTION',
        'CONSOLE', 'DATA', 'DEF', 'DEFUSR', 'DIM', 'END', 'ERASE', 'ERROR',
        'FOR', 'GOTO', 'GOSUB', 'IF', 'THEN', 'ELSE', 'INPUT', 'LET', 'LINE',
        'PRINT', 'LPRINT', 'USING', 'NEXT', 'ON', 'OUT', 'POKE',
        'READ', 'REM', 'RESTORE', 'RESUME', 'RETURN', 'STOP', 'SWAP',
        'TROFF', 'TRON', 'WAIT',
        'TO', 'STEP',
        'AND', 'NOT', 'OR', 'XOR', 'IMP', 'EQV', 'MOD',
        'RANDOMIZE' // not in Altair BASIC, but we add it anyway
    ],
    validFunctions: [
        'ABS', 'ASC', 'ATN', 'CDBL', 'CHR$', 'CINT', 'COS', 'ERL', 'ERR',
        'EXP', 'FIX', 'FRE', 'HEX$', 'INP', 'INSTR', 'INT',
        'LEFT$', 'LEN', 'LOG', 'LPOS', 'MID$',
        'OCT$', 'POS', 'RIGHT$', 'RND', 'SGN', 'SIN', 'SPACE$', 'SPC',
        'SQR', 'STR$', 'STRING$', 'TAB', 'TAN', 'USR', 'VAL', 'VARPTR'
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^', '\\',
        'AND', 'NOT', 'OR', 'XOR', 'IMP', 'EQV', 'MOD'
    ],
    printZoneLength: 15,
    numericPadding: true,
    checkOverflow: true,
    testInitialFor: false,
    optionalNextVar: true,
    multipleNextVars: true,
    bitwiseLogic: true,
    checkOnGotoIndex: false,
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false,
    optionalLet: true,
    compiledBlocks: false,
};
exports.APPLESOFT_BASIC = {
    dialectName: "APPLESOFT",
    asciiOnly: true,
    uppercaseOnly: false,
    optionalLabels: false,
    optionalWhitespace: true,
    multipleStmtsPerLine: true,
    varNaming: "*", // or AA
    staticArrays: false,
    sharedArrayNamespace: false,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: true,
    stringConcat: true,
    maxDimensions: 88,
    maxDefArgs: 1, // TODO: no string FNs
    maxStringLength: 255,
    tickComments: false,
    hexOctalConsts: false,
    validKeywords: [
        'OPTION',
        'CLEAR', 'LET', 'DIM', 'DEF', 'GOTO', 'GOSUB', 'RETURN', 'ON', 'POP',
        'FOR', 'NEXT', 'IF', 'THEN', 'END', 'STOP', 'ONERR', 'RESUME',
        'PRINT', 'INPUT', 'GET', 'HOME', 'HTAB', 'VTAB',
        'INVERSE', 'FLASH', 'NORMAL', 'TEXT',
        'GR', 'COLOR', 'PLOT', 'HLIN', 'VLIN',
        'HGR', 'HGR2', 'HPLOT', 'HCOLOR', 'AT',
        'DATA', 'READ', 'RESTORE',
        'REM', 'TRACE', 'NOTRACE',
        'TO', 'STEP',
        'AND', 'NOT', 'OR'
    ],
    validFunctions: [
        'ABS', 'ATN', 'COS', 'EXP', 'INT', 'LOG', 'RND', 'SGN', 'SIN', 'SQR', 'TAN',
        'LEN', 'LEFT$', 'MID$', 'RIGHT$', 'STR$', 'VAL', 'CHR$', 'ASC',
        'FRE', 'SCRN', 'PDL', 'PEEK', 'POS'
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^',
        'AND', 'NOT', 'OR'
    ],
    printZoneLength: 16,
    numericPadding: false,
    checkOverflow: true,
    testInitialFor: false,
    optionalNextVar: true,
    multipleNextVars: true,
    bitwiseLogic: false,
    checkOnGotoIndex: false,
    computedGoto: false,
    restoreWithLabel: false,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false,
    optionalLet: true,
    compiledBlocks: false,
};
exports.BASIC80 = {
    dialectName: "BASIC80",
    asciiOnly: true,
    uppercaseOnly: false,
    optionalLabels: false,
    optionalWhitespace: true,
    multipleStmtsPerLine: true,
    varNaming: "*",
    staticArrays: false,
    sharedArrayNamespace: true,
    defaultArrayBase: 0,
    defaultArraySize: 11,
    defaultValues: true,
    stringConcat: true,
    maxDimensions: 255,
    maxDefArgs: 255,
    maxStringLength: 255,
    //maxElements : 32767, // TODO
    tickComments: true,
    hexOctalConsts: true,
    validKeywords: [
        'OPTION',
        'CONSOLE', 'DATA', 'DEF', 'DEFUSR', 'DIM', 'END', 'ERASE', 'ERROR',
        'FOR', 'GOTO', 'GOSUB', 'IF', 'THEN', 'ELSE', 'INPUT', 'LET', 'LINE',
        'PRINT', 'LPRINT', 'USING', 'NEXT', 'ON', 'OUT', 'POKE',
        'READ', 'REM', 'RESTORE', 'RESUME', 'RETURN', 'STOP', 'SWAP',
        'TROFF', 'TRON', 'WAIT',
        'CALL', 'CHAIN', 'COMMON', 'WHILE', 'WEND', 'WRITE', 'RANDOMIZE',
        'TO', 'STEP',
        'AND', 'NOT', 'OR', 'XOR', 'IMP', 'EQV', 'MOD'
    ],
    validFunctions: [
        'ABS', 'ASC', 'ATN', 'CDBL', 'CHR$', 'CINT', 'COS', 'CSNG', 'CVI', 'CVS', 'CVD',
        'EOF', 'EXP', 'FIX', 'FRE', 'HEX$', 'INP', 'INPUT$', 'INSTR', 'INT',
        'LEFT$', 'LEN', 'LOC', 'LOG', 'LPOS', 'MID$', 'MKI$', 'MKS$', 'MKD$',
        'OCT$', 'PEEK', 'POS', 'RIGHT$', 'RND', 'SGN', 'SIN', 'SPACE$', 'SPC',
        'SQR', 'STR$', 'STRING$', 'TAB', 'TAN', 'USR', 'VAL', 'VARPTR'
    ],
    validOperators: [
        '=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '^', '\\',
        'AND', 'NOT', 'OR', 'XOR', 'IMP', 'EQV', 'MOD'
    ],
    printZoneLength: 14,
    numericPadding: true,
    checkOverflow: false, // TODO: message displayed when overflow, division by zero = ok
    testInitialFor: true,
    optionalNextVar: true,
    multipleNextVars: true,
    bitwiseLogic: true,
    checkOnGotoIndex: false,
    computedGoto: false,
    restoreWithLabel: true,
    squareBrackets: false,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: false,
    optionalLet: true,
    compiledBlocks: false,
};
exports.MODERN_BASIC = {
    dialectName: "MODERN",
    asciiOnly: false,
    uppercaseOnly: false,
    optionalLabels: true,
    optionalWhitespace: false,
    multipleStmtsPerLine: true,
    varNaming: "*",
    staticArrays: false,
    sharedArrayNamespace: false,
    defaultArrayBase: 0,
    defaultArraySize: 0, // DIM required
    defaultValues: false,
    stringConcat: true,
    maxDimensions: 255,
    maxDefArgs: 255,
    maxStringLength: 2048, // TODO?
    tickComments: true,
    hexOctalConsts: true,
    validKeywords: null, // all
    validFunctions: null, // all
    validOperators: null, // all
    printZoneLength: 16,
    numericPadding: false,
    checkOverflow: true,
    testInitialFor: true,
    optionalNextVar: true,
    multipleNextVars: true,
    bitwiseLogic: true,
    checkOnGotoIndex: true,
    computedGoto: false,
    restoreWithLabel: true,
    squareBrackets: true,
    arraysContainChars: false,
    endStmtRequired: false,
    chainAssignments: true,
    optionalLet: true,
    compiledBlocks: true,
    multilineIfThen: true,
};
var BUILTIN_DEFS = [
    ['ABS', ['number'], 'number'],
    ['ASC', ['string'], 'number'],
    ['ATN', ['number'], 'number'],
    ['CHR$', ['number'], 'string'],
    ['CINT', ['number'], 'number'],
    ['COS', ['number'], 'number'],
    ['COT', ['number'], 'number'],
    ['CTL', ['number'], 'string'],
    ['EXP', ['number'], 'number'],
    ['FIX', ['number'], 'number'],
    ['HEX$', ['number'], 'string'],
    ['INSTR', ['number', 'string', 'string'], 'number'],
    ['INSTR', ['string', 'string'], 'number'],
    ['INT', ['number'], 'number'],
    ['LEFT$', ['string', 'number'], 'string'],
    ['LEN', ['string'], 'number'],
    ['LIN', ['number'], 'string'],
    ['LOG', ['number'], 'number'],
    ['LOG10', ['number'], 'number'],
    ['MID$', ['string', 'number'], 'string'],
    ['MID$', ['string', 'number', 'number'], 'string'],
    ['OCT$', ['number'], 'string'],
    ['PI', [], 'number'],
    ['POS', ['number'], 'number'], // arg ignored
    ['POS', ['string', 'string'], 'number'], // HP POS
    ['RIGHT$', ['string', 'number'], 'string'],
    ['RND', [], 'number'],
    ['RND', ['number'], 'number'],
    ['ROUND', ['number'], 'number'],
    ['SGN', ['number'], 'number'],
    ['SIN', ['number'], 'number'],
    ['SPACE$', ['number'], 'string'],
    ['SPC', ['number'], 'string'],
    ['SQR', ['number'], 'number'],
    ['STR$', ['number'], 'string'],
    ['STRING$', ['number', 'number'], 'string'],
    ['STRING$', ['number', 'string'], 'string'],
    ['TAB', ['number'], 'string'],
    ['TAN', ['number'], 'number'],
    ['TIM', ['number'], 'number'], // only HP BASIC?
    ['TIMER', [], 'number'],
    ['UPS$', ['string'], 'string'],
    ['VAL', ['string'], 'number'],
    ['LPAD$', ['string', 'number'], 'string'],
    ['RPAD$', ['string', 'number'], 'string'],
    ['NFORMAT$', ['number', 'number'], 'string'],
];
var BUILTIN_MAP = {};
BUILTIN_DEFS.forEach(function (def, idx) {
    var name = def[0], args = def[1], result = def[2];
    if (!BUILTIN_MAP[name])
        BUILTIN_MAP[name] = [];
    BUILTIN_MAP[name].push({ args: args, result: result });
});
exports.DIALECTS = {
    "DEFAULT": exports.MODERN_BASIC,
    "DARTMOUTH": exports.DARTMOUTH_4TH_EDITION,
    "DARTMOUTH4": exports.DARTMOUTH_4TH_EDITION,
    "ALTAIR": exports.ALTAIR_BASIC41,
    "ALTAIR4": exports.ALTAIR_BASIC41,
    "ALTAIR41": exports.ALTAIR_BASIC41,
    "TINY": exports.TINY_BASIC,
    "ECMA55": exports.ECMA55_MINIMAL,
    "MINIMAL": exports.ECMA55_MINIMAL,
    "HP": exports.HP_TIMESHARED_BASIC,
    "HPB": exports.HP_TIMESHARED_BASIC,
    "HPTSB": exports.HP_TIMESHARED_BASIC,
    "HP2000": exports.HP_TIMESHARED_BASIC,
    "HPBASIC": exports.HP_TIMESHARED_BASIC,
    "HPACCESS": exports.HP_TIMESHARED_BASIC,
    "DEC11": exports.DEC_BASIC_11,
    "DEC": exports.DEC_BASIC_PLUS,
    "DECPLUS": exports.DEC_BASIC_PLUS,
    "BASICPLUS": exports.DEC_BASIC_PLUS,
    "BASICODE": exports.BASICODE,
    "APPLESOFT": exports.APPLESOFT_BASIC,
    "BASIC80": exports.BASIC80,
    "MODERN": exports.MODERN_BASIC,
};

});


// ── wasmutils ──────────────────────────────────────────────────────────────────
__define("wasmutils", function(module, exports, __require) {
"use strict";
// WebAssembly module cache
// for Emscripten-compiled functions
Object.defineProperty(exports, "__esModule", { value: true });
exports.print_fn = exports.fsMeta = exports.emglobal = void 0;
exports.getWASMMemory = getWASMMemory;
exports.getWASMBinary = getWASMBinary;
exports.moduleInstFn = moduleInstFn;
exports.execMain = execMain;
exports.loadFilesystem = loadFilesystem;
exports.load = load;
exports.loadWASMBinary = loadWASMBinary;
exports.loadWASM = loadWASM;
exports.loadNative = loadNative;
exports.setupFS = setupFS;
exports.setupStdin = setupStdin;
var builder_1 = __require("builder");
var ENVIRONMENT_IS_WEB = typeof window === 'object';
var ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
exports.emglobal = ENVIRONMENT_IS_WORKER ? self : ENVIRONMENT_IS_WEB ? window : global;
// simple CommonJS module loader
// TODO: relative paths for dependencies
if (!exports.emglobal['require']) {
    exports.emglobal['require'] = function (modpath) {
        if (modpath.endsWith('.js'))
            modpath = modpath.slice(-3);
        var modname = modpath.split('/').slice(-1)[0];
        var hasNamespace = exports.emglobal[modname] != null;
        console.log('@@@ require', modname, modpath, hasNamespace);
        if (!hasNamespace) {
            exports = {};
            importScripts("".concat(modpath, ".js"));
        }
        if (exports.emglobal[modname] == null) {
            exports.emglobal[modname] = exports; // TODO: always put in global scope?
        }
        return exports.emglobal[modname]; // TODO
    };
}
// TODO: leaks memory even when disabled...
var _WASM_module_cache = {};
var CACHE_WASM_MODULES = true; // if false, use asm.js only
// TODO: which modules need this?
var wasmMemory;
function getWASMMemory() {
    if (wasmMemory == null) {
        wasmMemory = new WebAssembly.Memory({
            'initial': 1024, // 64MB
            'maximum': 16384, // 1024MB
        });
    }
    return wasmMemory;
}
function getWASMBinary(module_id) {
    return wasmBlob[module_id];
}
function getWASMModule(module_id) {
    var module = _WASM_module_cache[module_id];
    if (!module) {
        (0, builder_1.starttime)();
        module = new WebAssembly.Module(wasmBlob[module_id]);
        if (CACHE_WASM_MODULES) {
            _WASM_module_cache[module_id] = module;
            delete wasmBlob[module_id];
        }
        (0, builder_1.endtime)("module creation " + module_id);
    }
    return module;
}
// function for use with instantiateWasm
function moduleInstFn(module_id) {
    return function (imports, ri) {
        var mod = getWASMModule(module_id);
        var inst = new WebAssembly.Instance(mod, imports);
        ri(inst);
        return inst.exports;
    };
}
function execMain(step, mod, args) {
    (0, builder_1.starttime)();
    var run = mod.callMain || mod.run; // TODO: run?
    run(args);
    (0, builder_1.endtime)(step.tool);
    console.log('exec', step.tool, args.join(' '));
}
/// asm.js / WASM / filesystem loading
exports.fsMeta = {};
var fsBlob = {};
var wasmBlob = {};
// load filesystems for CC65 and others asynchronously
function loadFilesystem(name) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.open("GET", builder_1.PWORKER + "fs/fs" + name + ".data", false); // synchronous request
    xhr.send(null);
    fsBlob[name] = xhr.response;
    xhr = new XMLHttpRequest();
    xhr.responseType = 'json';
    xhr.open("GET", builder_1.PWORKER + "fs/fs" + name + ".js.metadata", false); // synchronous request
    xhr.send(null);
    exports.fsMeta[name] = xhr.response;
    console.log("Loaded " + name + " filesystem", exports.fsMeta[name].files.length, 'files', fsBlob[name].size, 'bytes');
}
var loaded = {};
function load(modulename, debug) {
    if (!loaded[modulename]) {
        importScripts(builder_1.PWORKER + 'asmjs/' + modulename + (debug ? "." + debug + ".js" : ".js"));
        loaded[modulename] = 1;
    }
}
function loadWASMBinary(modulename) {
    if (!loaded[modulename]) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = 'arraybuffer';
        xhr.open("GET", builder_1.PWORKER + "wasm/" + modulename + ".wasm", false); // synchronous request
        xhr.send(null);
        if (xhr.response) {
            wasmBlob[modulename] = new Uint8Array(xhr.response);
            console.log("Loaded " + modulename + ".wasm (" + wasmBlob[modulename].length + " bytes)");
            loaded[modulename] = 1;
        }
        else {
            throw Error("Could not load WASM file " + modulename + ".wasm");
        }
    }
    return wasmBlob[modulename];
}
function loadWASM(modulename, debug) {
    if (!loaded[modulename]) {
        importScripts(builder_1.PWORKER + "wasm/" + modulename + (debug ? "." + debug + ".js" : ".js"));
        loadWASMBinary(modulename);
    }
}
function loadNative(modulename) {
    // detect WASM
    if (CACHE_WASM_MODULES && typeof WebAssembly === 'object') {
        loadWASM(modulename);
    }
    else {
        load(modulename);
    }
}
// mount the filesystem at /share
function setupFS(FS, name) {
    var WORKERFS = FS.filesystems['WORKERFS'];
    if (name === '65-vector')
        name = '65-none'; // TODO
    if (name === '65-atari7800')
        name = '65-none'; // TODO
    if (name === '65-devel')
        name = '65-none'; // TODO
    if (name === '65-vcs')
        name = '65-atari2600'; // TODO
    if (name === '65-exidy')
        name = '65-none'; // TODO
    if (!exports.fsMeta[name])
        throw Error("No filesystem for '" + name + "'");
    FS.mkdir('/share');
    FS.mount(WORKERFS, {
        packages: [{ metadata: exports.fsMeta[name], blob: fsBlob[name] }]
    }, '/share');
    // fix for slow Blob operations by caching typed arrays
    // https://github.com/kripken/emscripten/blob/incoming/src/library_workerfs.js
    // https://bugs.chromium.org/p/chromium/issues/detail?id=349304#c30
    var reader = WORKERFS.reader;
    var blobcache = {};
    WORKERFS.stream_ops.read = function (stream, buffer, offset, length, position) {
        if (position >= stream.node.size)
            return 0;
        var contents = blobcache[stream.path];
        if (!contents) {
            var ab = reader.readAsArrayBuffer(stream.node.contents);
            contents = blobcache[stream.path] = new Uint8Array(ab);
        }
        if (position + length > contents.length)
            length = contents.length - position;
        for (var i = 0; i < length; i++) {
            buffer[offset + i] = contents[position + i];
        }
        return length;
    };
}
var print_fn = function (s) {
    console.log(s);
    //console.log(new Error().stack);
};
exports.print_fn = print_fn;
function setupStdin(fs, code) {
    var i = 0;
    fs.init(function () { return i < code.length ? code.charCodeAt(i++) : null; });
}

});


// ── listingutils ──────────────────────────────────────────────────────────────────
__define("listingutils", function(module, exports, __require) {
"use strict";
// test.c(6) : warning 85: in function main unreferenced local variable : 'x'
// main.a (4): error: Unknown Mnemonic 'xxx'.
Object.defineProperty(exports, "__esModule", { value: true });
exports.re_lineoffset = exports.re_crlf = exports.re_msvc2 = exports.re_msvc = void 0;
exports.msvcErrorMatcher = msvcErrorMatcher;
exports.makeErrorMatcher = makeErrorMatcher;
exports.extractErrors = extractErrors;
exports.parseListing = parseListing;
exports.parseSourceLines = parseSourceLines;
// at 2: warning 190: ISO C forbids an empty source file
exports.re_msvc = /[/]*([^( ]+)\s*[(](\d+)[)]\s*:\s*(.+?):\s*(.*)/;
exports.re_msvc2 = /\s*(at)\s+(\d+)\s*(:)\s*(.*)/;
function msvcErrorMatcher(errors) {
    return function (s) {
        var matches = exports.re_msvc.exec(s) || exports.re_msvc2.exec(s);
        if (matches) {
            var errline = parseInt(matches[2]);
            errors.push({
                line: errline,
                path: matches[1],
                //type:matches[3],
                msg: matches[4]
            });
        }
        else {
            console.log(s);
        }
    };
}
function makeErrorMatcher(errors, regex, iline, imsg, mainpath, ifilename) {
    return function (s) {
        var matches = regex.exec(s);
        if (matches) {
            errors.push({
                line: parseInt(matches[iline]) || 1,
                msg: matches[imsg],
                path: ifilename ? matches[ifilename] : mainpath
            });
        }
        else {
            console.log("??? " + s);
        }
    };
}
function extractErrors(regex, strings, path, iline, imsg, ifilename) {
    var errors = [];
    var matcher = makeErrorMatcher(errors, regex, iline, imsg, path, ifilename);
    for (var i = 0; i < strings.length; i++) {
        matcher(strings[i]);
    }
    return errors;
}
exports.re_crlf = /\r?\n/;
//    1   %line 16+1 hello.asm
exports.re_lineoffset = /\s*(\d+)\s+[%]line\s+(\d+)\+(\d+)\s+(.+)/;
function parseListing(code, lineMatch, iline, ioffset, iinsns, icycles, funcMatch, segMatch) {
    var lines = [];
    var lineofs = 0;
    var segment = '';
    var func = '';
    var funcbase = 0;
    code.split(exports.re_crlf).forEach(function (line, lineindex) {
        var segm = segMatch && segMatch.exec(line);
        if (segm) {
            segment = segm[1];
        }
        var funcm = funcMatch && funcMatch.exec(line);
        if (funcm) {
            funcbase = parseInt(funcm[1], 16);
            func = funcm[2];
        }
        var linem = lineMatch.exec(line);
        if (linem && linem[1]) {
            var linenum = iline < 0 ? lineindex : parseInt(linem[iline]);
            var offset = parseInt(linem[ioffset], 16);
            var insns = linem[iinsns];
            var cycles = icycles ? parseInt(linem[icycles]) : null;
            var iscode = cycles > 0;
            if (insns) {
                lines.push({
                    line: linenum + lineofs,
                    offset: offset - funcbase,
                    insns: insns,
                    cycles: cycles,
                    iscode: iscode,
                    segment: segment,
                    func: func
                });
            }
        }
        else {
            var m = exports.re_lineoffset.exec(line);
            // TODO: check filename too
            if (m) {
                lineofs = parseInt(m[2]) - parseInt(m[1]) - parseInt(m[3]);
            }
        }
    });
    return lines;
}
function parseSourceLines(code, lineMatch, offsetMatch, funcMatch, segMatch) {
    var lines = [];
    var lastlinenum = 0;
    var segment = '';
    var func = '';
    var funcbase = 0;
    for (var _i = 0, _a = code.split(exports.re_crlf); _i < _a.length; _i++) {
        var line = _a[_i];
        var segm = segMatch && segMatch.exec(line);
        if (segm) {
            segment = segm[1];
        }
        var funcm = funcMatch && funcMatch.exec(line);
        if (funcm) {
            funcbase = parseInt(funcm[1], 16);
            func = funcm[2];
        }
        var linem = lineMatch.exec(line);
        if (linem && linem[1]) {
            lastlinenum = parseInt(linem[1]);
        }
        else if (lastlinenum) {
            var linem = offsetMatch.exec(line);
            if (linem && linem[1]) {
                var offset = parseInt(linem[1], 16);
                lines.push({
                    line: lastlinenum,
                    offset: offset - funcbase,
                    segment: segment,
                    func: func
                });
                lastlinenum = 0;
            }
        }
    }
    return lines;
}

});


// ── tools/misc ──────────────────────────────────────────────────────────────────
__define("tools/misc", function(module, exports, __require) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.translateShowdown = translateShowdown;
exports.compileInform6 = compileInform6;
exports.compileBASIC = compileBASIC;
exports.compileWiz = compileWiz;
var basic_compiler = __importStar(__require("/tmp/8bitworkshop/gen/common/basic/compiler"));
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var wasmutils_1 = __require("wasmutils");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var workermain_1 = __require("workermain");
function translateShowdown(step) {
    (0, workermain_1.setupRequireFunction)();
    (0, wasmutils_1.load)("showdown.min");
    var showdown = wasmutils_1.emglobal['showdown'];
    var converter = new showdown.Converter({
        tables: 'true',
        smoothLivePreview: 'true',
        requireSpaceBeforeHeadingText: 'true',
        emoji: 'true',
    });
    var code = (0, builder_1.getWorkFileAsString)(step.path);
    var html = converter.makeHtml(code);
    delete wasmutils_1.emglobal['require'];
    return {
        output: html
    };
}
function compileInform6(step) {
    (0, wasmutils_1.loadNative)("inform");
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.inf" });
    var objpath = step.prefix + ".z5";
    if ((0, builder_1.staleFiles)(step, [objpath])) {
        var errorMatcher = (0, listingutils_1.msvcErrorMatcher)(errors);
        var lstout = "";
        var match_fn = function (s) {
            if (s.indexOf("Error:") >= 0) {
                errorMatcher(s);
            }
            else {
                lstout += s;
                lstout += "\n";
            }
        };
        // TODO: step.path must end in '.inf' or error
        var args = ['-afjnops', '-v5', '-Cu', '-E1', '-k', '+/share/lib', step.path];
        var inform = wasmutils_1.emglobal.inform({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('inform'),
            noInitialRun: true,
            //logReadFiles:true,
            print: match_fn,
            printErr: match_fn,
        });
        var FS = inform.FS;
        (0, wasmutils_1.setupFS)(FS, 'inform');
        (0, builder_1.populateFiles)(step, FS);
        //fixParamsWithDefines(step.path, step.params);
        (0, wasmutils_1.execMain)(step, inform, args);
        if (errors.length)
            return { errors: errors };
        var objout = FS.readFile(objpath, { encoding: 'binary' });
        (0, builder_1.putWorkFile)(objpath, objout);
        if (!(0, builder_1.anyTargetChanged)(step, [objpath]))
            return;
        // parse debug XML
        var symbolmap = {};
        var segments = [];
        var entitymap = {
            // number -> string
            'object': {}, 'property': {}, 'attribute': {}, 'constant': {}, 'global-variable': {}, 'routine': {},
        };
        var dbgout = FS.readFile("gameinfo.dbg", { encoding: 'utf8' });
        var xmlroot = (0, util_1.parseXMLPoorly)(dbgout);
        //console.log(xmlroot);
        var segtype = "ram";
        xmlroot.children.forEach(function (node) {
            switch (node.type) {
                case 'global-variable':
                case 'routine':
                    var ident = node.children.find(function (c, v) { return c.type == 'identifier'; }).text;
                    var address = parseInt(node.children.find(function (c, v) { return c.type == 'address'; }).text);
                    symbolmap[ident] = address;
                    entitymap[node.type][address] = ident;
                    break;
                case 'object':
                case 'property':
                case 'attribute':
                    var ident = node.children.find(function (c, v) { return c.type == 'identifier'; }).text;
                    var value = parseInt(node.children.find(function (c, v) { return c.type == 'value'; }).text);
                    //entitymap[node.type][ident] = value;
                    entitymap[node.type][value] = ident;
                    //symbolmap[ident] = address | 0x1000000;
                    break;
                case 'story-file-section':
                    var name = node.children.find(function (c, v) { return c.type == 'type'; }).text;
                    var address = parseInt(node.children.find(function (c, v) { return c.type == 'address'; }).text);
                    var endAddress = parseInt(node.children.find(function (c, v) { return c.type == 'end-address'; }).text);
                    if (name == "grammar table")
                        segtype = "rom";
                    segments.push({ name: name, start: address, size: endAddress - address, type: segtype });
            }
        });
        // parse listing
        var listings = {};
        //    35  +00015 <*> call_vs      long_19 location long_424 -> sp 
        var lines = (0, listingutils_1.parseListing)(lstout, /\s*(\d+)\s+[+]([0-9a-f]+)\s+([<*>]*)\s*(\w+)\s+(.+)/i, -1, 2, 4);
        var lstpath = step.prefix + '.lst';
        listings[lstpath] = { lines: [], asmlines: lines, text: lstout };
        return {
            output: objout, //.slice(0),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments,
            debuginfo: entitymap,
        };
    }
}
function compileBASIC(step) {
    var jsonpath = step.path + ".json";
    (0, builder_1.gatherFiles)(step);
    if ((0, builder_1.staleFiles)(step, [jsonpath])) {
        var parser = new basic_compiler.BASICParser();
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        try {
            var ast = parser.parseFile(code, step.path);
        }
        catch (e) {
            console.log(e);
            if (parser.errors.length == 0)
                throw e;
        }
        if (parser.errors.length) {
            return { errors: parser.errors, uppercaseOnly: parser.opts.uppercaseOnly };
        }
        // put AST into JSON (sans source locations) to see if it has changed
        var json = JSON.stringify(ast, function (key, value) { return (key == '$loc' ? undefined : value); });
        (0, builder_1.putWorkFile)(jsonpath, json);
        if ((0, builder_1.anyTargetChanged)(step, [jsonpath]))
            return {
                output: ast,
                listings: parser.getListings(),
                uppercaseOnly: parser.opts.uppercaseOnly,
            };
    }
}
function compileWiz(step) {
    (0, wasmutils_1.loadNative)("wiz");
    var params = step.params;
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.wiz" });
    var destpath = step.prefix + (params.wiz_rom_ext || ".bin");
    var errors = [];
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var wiz = wasmutils_1.emglobal.wiz({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('wiz'),
            noInitialRun: true,
            print: wasmutils_1.print_fn,
            //test.wiz:2: error: expected statement, but got identifier `test`
            printErr: (0, listingutils_1.makeErrorMatcher)(errors, /(.+?):(\d+):\s*(.+)/, 2, 3, step.path, 1),
        });
        var FS = wiz.FS;
        (0, wasmutils_1.setupFS)(FS, 'wiz');
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.populateExtraFiles)(step, FS, params.extra_compile_files);
        var FWDIR = '/share/common';
        var args = [
            '-o', destpath,
            '-I', FWDIR + '/' + (params.wiz_inc_dir || (0, util_1.getRootBasePlatform)(step.platform)),
            '-s', 'wla',
            '--color=none',
            step.path
        ];
        args.push('--system', params.wiz_sys_type || params.arch);
        (0, wasmutils_1.execMain)(step, wiz, args);
        if (errors.length)
            return { errors: errors };
        var binout = FS.readFile(destpath, { encoding: 'binary' });
        (0, builder_1.putWorkFile)(destpath, binout);
        var dbgout = FS.readFile(step.prefix + '.sym', { encoding: 'utf8' });
        var symbolmap = {};
        for (var _i = 0, _a = dbgout.split("\n"); _i < _a.length; _i++) {
            var s = _a[_i];
            var toks = s.split(/ /);
            // 00:4008 header.basic_start
            if (toks && toks.length >= 2) {
                var tokrange = toks[0].split(':');
                var start = parseInt(tokrange[1], 16);
                var sym = toks[1];
                symbolmap[sym] = start;
            }
        }
        return {
            output: binout, //.slice(0),
            errors: errors,
            symbolmap: symbolmap,
        };
    }
}

});


// ── tools/cc65 ──────────────────────────────────────────────────────────────────
__define("tools/cc65", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleCA65 = assembleCA65;
exports.linkLD65 = linkLD65;
exports.compileCC65 = compileCC65;
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
/*
000000r 1               .segment        "CODE"
000000r 1               .proc	_rasterWait: near
000000r 1               ; int main() { return mul2(2); }
000000r 1                       .dbg    line, "main.c", 3
000014r 1                      	.dbg	  func, "main", "00", extern, "_main"
000000r 1  A2 00                ldx     #$00
00B700  1               BOOT2:
00B700  1  A2 01         ldx #1 ;track
00B725  1  00           IBLASTDRVN: .byte 0
00B726  1  xx xx        IBSECSZ: .res 2
00BA2F  1  2A 2B E8 2C   HEX "2A2BE82C2D2E2F303132F0F133343536"
*/
function parseCA65Listing(asmfn, code, symbols, segments, params, dbg, listings) {
    var _a;
    var segofs = 0;
    var offset = 0;
    var dbgLineMatch = /^([0-9A-F]+)([r]?)\s+(\d+)\s+[.]dbg\s+(\w+), "([^"]+)", (.+)/;
    var funcLineMatch = /"(\w+)", (\w+), "(\w+)"/;
    var insnLineMatch = /^([0-9A-F]+)([r]?)\s{1,2}(\d+)\s{1,2}([0-9A-Frx ]{11})\s+(.*)/;
    var segMatch = /[.]segment\s+"(\w+)"/i;
    var origlines = [];
    var lines = origlines;
    var linenum = 0;
    var curpath = asmfn || '';
    // TODO: only does .c functions, not all .s files
    for (var _i = 0, _b = code.split(listingutils_1.re_crlf); _i < _b.length; _i++) {
        var line = _b[_i];
        var dbgm = dbgLineMatch.exec(line);
        if (dbgm && dbgm[1]) {
            var dbgtype = dbgm[4];
            offset = parseInt(dbgm[1], 16);
            curpath = dbgm[5];
            // new file?
            if (curpath && listings) {
                var l = listings[curpath];
                if (!l)
                    l = listings[curpath] = { lines: [] };
                lines = l.lines;
            }
            if (dbgtype == 'func') {
                var funcm = funcLineMatch.exec(dbgm[6]);
                if (funcm) {
                    var funcofs = symbols[funcm[3]];
                    if (typeof funcofs === 'number') {
                        segofs = funcofs - offset;
                        //console.log(funcm[3], funcofs, '-', offset);
                    }
                }
            }
        }
        if (dbg && dbgm && dbgtype == 'line') {
            //console.log(dbgm[5], dbgm[6], offset, segofs);
            lines.push({
                path: dbgm[5],
                line: parseInt(dbgm[6]),
                offset: offset + segofs,
                insns: null
            });
        }
        var linem = insnLineMatch.exec(line);
        var topfile = linem && linem[3] == '1';
        if (topfile) {
            var insns = ((_a = linem[4]) === null || _a === void 0 ? void 0 : _a.trim()) || '';
            // skip extra insns for macro expansions
            if (!(insns != '' && linem[5] == '')) {
                linenum++;
            }
            if (linem[1]) {
                var offset = parseInt(linem[1], 16);
                if (insns.length) {
                    //console.log(dbg, curpath, linenum, offset, segofs, insns);
                    if (!dbg) {
                        lines.push({
                            path: curpath,
                            line: linenum,
                            offset: offset + segofs,
                            insns: insns,
                            iscode: true // TODO: can't really tell unless we parse it
                        });
                    }
                }
                else {
                    var sym = null;
                    var label = linem[5];
                    if (label === null || label === void 0 ? void 0 : label.endsWith(':')) {
                        sym = label.substring(0, label.length - 1);
                    }
                    else if (label === null || label === void 0 ? void 0 : label.toLowerCase().startsWith('.proc')) {
                        sym = label.split(' ')[1];
                    }
                    if (sym && !sym.startsWith('@')) {
                        var symofs = symbols[sym];
                        if (typeof symofs === 'number') {
                            segofs = symofs - offset;
                            //console.log(sym, segofs, symofs, '-', offset);
                        }
                    }
                }
            }
        }
    }
    return origlines;
}
function assembleCA65(step) {
    (0, wasmutils_1.loadNative)("ca65");
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.s" });
    var objpath = step.prefix + ".o";
    var lstpath = step.prefix + ".lst";
    if ((0, builder_1.staleFiles)(step, [objpath, lstpath])) {
        var objout, lstout;
        var CA65 = wasmutils_1.emglobal.ca65({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('ca65'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.makeErrorMatcher)(errors, /(.+?):(\d+): (.+)/, 2, 3, step.path, 1),
        });
        var FS = CA65.FS;
        (0, wasmutils_1.setupFS)(FS, '65-' + (0, util_1.getRootBasePlatform)(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.fixParamsWithDefines)(step.path, step.params);
        var args = ['-v', '-g', '-I', '/share/asminc', '-o', objpath, '-l', lstpath, step.path];
        args.unshift.apply(args, ["-D", "__8BITWORKSHOP__=1"]);
        if (step.mainfile) {
            args.unshift.apply(args, ["-D", "__MAIN__=1"]);
        }
        (0, wasmutils_1.execMain)(step, CA65, args);
        if (errors.length) {
            var listings = {};
            // TODO? change extension to .lst
            //listings[step.path] = { lines:[], text:getWorkFileAsString(step.path) };
            return { errors: errors, listings: listings };
        }
        objout = FS.readFile(objpath, { encoding: 'binary' });
        lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(objpath, objout);
        (0, builder_1.putWorkFile)(lstpath, lstout);
    }
    return {
        linktool: "ld65",
        files: [objpath, lstpath],
        args: [objpath]
    };
}
function linkLD65(step) {
    var _a, _b;
    (0, wasmutils_1.loadNative)("ld65");
    var params = step.params;
    (0, builder_1.gatherFiles)(step);
    var binpath = "main";
    if ((0, builder_1.staleFiles)(step, [binpath])) {
        var errors = [];
        var LD65 = wasmutils_1.emglobal.ld65({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('ld65'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: function (s) { errors.push({ msg: s, line: 0 }); }
        });
        var FS = LD65.FS;
        (0, wasmutils_1.setupFS)(FS, '65-' + (0, util_1.getRootBasePlatform)(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.populateExtraFiles)(step, FS, params.extra_link_files);
        // populate .cfg file, if it is a custom one
        if (builder_1.store.hasFile(params.cfgfile)) {
            (0, builder_1.populateEntry)(FS, params.cfgfile, builder_1.store.getFileEntry(params.cfgfile), null);
        }
        var libargs = params.libargs || [];
        var cfgfile = params.cfgfile;
        var args = ['--cfg-path', '/share/cfg',
            '--lib-path', '/share/lib',
            '-C', cfgfile,
            '-Ln', 'main.vice',
            //'--dbgfile', 'main.dbg', // TODO: get proper line numbers
            '-o', 'main',
            '-m', 'main.map'].concat(step.args, libargs);
        (0, wasmutils_1.execMain)(step, LD65, args);
        if (errors.length)
            return { errors: errors };
        var aout = FS.readFile("main", { encoding: 'binary' });
        var mapout = FS.readFile("main.map", { encoding: 'utf8' });
        var viceout = FS.readFile("main.vice", { encoding: 'utf8' });
        // correct binary for PCEngine
        if (step.platform == 'pce' && aout.length > 0x2000) {
            // move 8 KB from end to front
            var newrom = new Uint8Array(aout.length);
            newrom.set(aout.slice(aout.length - 0x2000), 0);
            newrom.set(aout.slice(0, aout.length - 0x2000), 0x2000);
            aout = newrom;
        }
        //var dbgout = FS.readFile("main.dbg", {encoding:'utf8'});
        (0, builder_1.putWorkFile)("main", aout);
        (0, builder_1.putWorkFile)("main.map", mapout);
        (0, builder_1.putWorkFile)("main.vice", viceout);
        // return unchanged if no files changed
        if (!(0, builder_1.anyTargetChanged)(step, ["main", "main.map", "main.vice"]))
            return;
        // parse symbol map (TODO: omit segments, constants)
        var symbolmap = {};
        for (var _i = 0, _c = viceout.split("\n"); _i < _c.length; _i++) {
            var s = _c[_i];
            var toks = s.split(" ");
            if (toks[0] == 'al') {
                var ident = toks[2].substr(1);
                if (ident.length != 5 || !ident.startsWith('L')) { // no line numbers
                    var ofs = parseInt(toks[1], 16);
                    symbolmap[ident] = ofs;
                }
            }
        }
        var segments = [];
        // TODO: CHR, banks, etc
        var re_seglist = /(\w+)\s+([0-9A-F]+)\s+([0-9A-F]+)\s+([0-9A-F]+)\s+([0-9A-F]+)/;
        var parseseglist = false;
        var m = void 0;
        for (var _d = 0, _e = mapout.split('\n'); _d < _e.length; _d++) {
            var s_1 = _e[_d];
            if (parseseglist && (m = re_seglist.exec(s_1))) {
                var seg = m[1];
                var start = parseInt(m[2], 16);
                var size = parseInt(m[4], 16);
                var type = '';
                // TODO: better id of ram/rom
                if (seg.startsWith('CODE') || seg == 'STARTUP' || seg == 'RODATA' || seg.endsWith('ROM'))
                    type = 'rom';
                else if (seg == 'ZP' || seg == 'DATA' || seg == 'BSS' || seg.endsWith('RAM'))
                    type = 'ram';
                segments.push({ name: seg, start: start, size: size, type: type });
            }
            if (s_1 == 'Segment list:')
                parseseglist = true;
            if (s_1 == '')
                parseseglist = false;
        }
        // build listings
        var listings = {};
        for (var _f = 0, _g = step.files; _f < _g.length; _f++) {
            var fn = _g[_f];
            if (fn.endsWith('.lst')) {
                var lstout = FS.readFile(fn, { encoding: 'utf8' });
                lstout = lstout.split('\n\n')[1] || lstout; // remove header
                (0, builder_1.putWorkFile)(fn, lstout);
                //const asmpath = fn.replace(/\.lst$/, '.ca65'); // TODO! could be .s
                var isECS = ((_b = (_a = step.debuginfo) === null || _a === void 0 ? void 0 : _a.systems) === null || _b === void 0 ? void 0 : _b.Init) != null; // TODO
                if (isECS) {
                    var asmlines = [];
                    var srclines = parseCA65Listing(fn, lstout, symbolmap, segments, params, true, listings);
                    listings[fn] = {
                        lines: [],
                        text: lstout
                    };
                }
                else {
                    var asmlines = parseCA65Listing(fn, lstout, symbolmap, segments, params, false);
                    var srclines = parseCA65Listing('', lstout, symbolmap, segments, params, true);
                    listings[fn] = {
                        asmlines: srclines.length ? asmlines : null,
                        lines: srclines.length ? srclines : asmlines,
                        text: lstout
                    };
                }
            }
        }
        return {
            output: aout, //.slice(0),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}
function compileCC65(step) {
    (0, wasmutils_1.loadNative)("cc65");
    var params = step.params;
    // stderr
    var re_err1 = /(.*?):(\d+): (.+)/;
    var errors = [];
    var errline = 0;
    function match_fn(s) {
        console.log(s);
        var matches = re_err1.exec(s);
        if (matches) {
            errline = parseInt(matches[2]);
            errors.push({
                line: errline,
                msg: matches[3],
                path: matches[1]
            });
        }
    }
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
    var destpath = step.prefix + '.s';
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var CC65 = wasmutils_1.emglobal.cc65({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('cc65'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: match_fn,
        });
        var FS = CC65.FS;
        (0, wasmutils_1.setupFS)(FS, '65-' + (0, util_1.getRootBasePlatform)(step.platform));
        (0, builder_1.populateFiles)(step, FS, {
            mainFilePath: step.path,
            processFn: function (path, code) {
                if (typeof code === 'string') {
                    code = (0, builder_1.processEmbedDirective)(code);
                }
                return code;
            }
        });
        (0, builder_1.fixParamsWithDefines)(step.path, params);
        var args = [
            '-I', '/share/include',
            '-I', '.',
            "-D", "__8BITWORKSHOP__",
        ];
        if (params.define) {
            params.define.forEach(function (x) { return args.push('-D' + x); });
        }
        if (step.mainfile) {
            args.unshift.apply(args, ["-D", "__MAIN__"]);
        }
        var customArgs = params.extra_compiler_args || ['-T', '-g', '-Oirs', '-Cl', '-W', '-pointer-sign,-no-effect'];
        args = args.concat(customArgs, args);
        args.push(step.path);
        (0, wasmutils_1.execMain)(step, CC65, args);
        if (errors.length)
            return { errors: errors };
        var asmout = FS.readFile(destpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(destpath, asmout);
    }
    return {
        nexttool: "ca65",
        path: destpath,
        args: [destpath],
        files: [destpath],
    };
}

});


// ── /tmp/8bitworkshop/gen/common/wasi/wasishim ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/wasi/wasishim", function(module, exports, __require) {
"use strict";
/*
 * Copyright (c) 2024 Steven E. Hugg
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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _WASIRunner_instance, _WASIRunner_memarr8, _WASIRunner_memarr32, _WASIRunner_args, _WASIRunner_envvars;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WASIRunner = exports.WASIMemoryFilesystem = exports.WASIFileDescriptor = exports.WASIErrors = exports.FDOpenFlags = exports.FDFlags = exports.FDRights = exports.FDType = void 0;
// https://dev.to/ndesmic/building-a-minimal-wasi-polyfill-for-browsers-4nel
// http://www.wasmtutor.com/webassembly-barebones-wasi
// https://github.com/emscripten-core/emscripten/blob/c017fc2d6961962ee87ae387462a099242dfbbd2/src/library_wasi.js#L451
// https://github.com/emscripten-core/emscripten/blob/c017fc2d6961962ee87ae387462a099242dfbbd2/src/library_fs.js
// https://github.com/WebAssembly/wasi-libc/blob/main/libc-bottom-half/sources/preopens.c
// https://fossies.org/linux/wasm3/source/extra/wasi_core.h
// https://wasix.org/docs/api-reference/wasi/fd_read
var use_debug = true;
var debug = use_debug ? console.log : function () { };
var warning = console.log;
var FDType;
(function (FDType) {
    FDType[FDType["UNKNOWN"] = 0] = "UNKNOWN";
    FDType[FDType["BLOCK_DEVICE"] = 1] = "BLOCK_DEVICE";
    FDType[FDType["CHARACTER_DEVICE"] = 2] = "CHARACTER_DEVICE";
    FDType[FDType["DIRECTORY"] = 3] = "DIRECTORY";
    FDType[FDType["REGULAR_FILE"] = 4] = "REGULAR_FILE";
    FDType[FDType["SOCKET_DGRAM"] = 5] = "SOCKET_DGRAM";
    FDType[FDType["SOCKET_STREAM"] = 6] = "SOCKET_STREAM";
    FDType[FDType["SYMBOLIC_LINK"] = 7] = "SYMBOLIC_LINK";
})(FDType || (exports.FDType = FDType = {}));
var FDRights;
(function (FDRights) {
    FDRights[FDRights["FD_DATASYNC"] = 1] = "FD_DATASYNC";
    FDRights[FDRights["FD_READ"] = 2] = "FD_READ";
    FDRights[FDRights["FD_SEEK"] = 4] = "FD_SEEK";
    FDRights[FDRights["FD_FDSTAT_SET_FLAGS"] = 8] = "FD_FDSTAT_SET_FLAGS";
    FDRights[FDRights["FD_SYNC"] = 16] = "FD_SYNC";
    FDRights[FDRights["FD_TELL"] = 32] = "FD_TELL";
    FDRights[FDRights["FD_WRITE"] = 64] = "FD_WRITE";
    FDRights[FDRights["FD_ADVISE"] = 128] = "FD_ADVISE";
    FDRights[FDRights["FD_ALLOCATE"] = 256] = "FD_ALLOCATE";
    FDRights[FDRights["PATH_CREATE_DIRECTORY"] = 512] = "PATH_CREATE_DIRECTORY";
    FDRights[FDRights["PATH_CREATE_FILE"] = 1024] = "PATH_CREATE_FILE";
    FDRights[FDRights["PATH_LINK_SOURCE"] = 2048] = "PATH_LINK_SOURCE";
    FDRights[FDRights["PATH_LINK_TARGET"] = 4096] = "PATH_LINK_TARGET";
    FDRights[FDRights["PATH_OPEN"] = 8192] = "PATH_OPEN";
    FDRights[FDRights["FD_READDIR"] = 16384] = "FD_READDIR";
    FDRights[FDRights["PATH_READLINK"] = 32768] = "PATH_READLINK";
    FDRights[FDRights["PATH_RENAME_SOURCE"] = 65536] = "PATH_RENAME_SOURCE";
    FDRights[FDRights["PATH_RENAME_TARGET"] = 131072] = "PATH_RENAME_TARGET";
    FDRights[FDRights["PATH_FILESTAT_GET"] = 262144] = "PATH_FILESTAT_GET";
    FDRights[FDRights["PATH_FILESTAT_SET_SIZE"] = 524288] = "PATH_FILESTAT_SET_SIZE";
    FDRights[FDRights["PATH_FILESTAT_SET_TIMES"] = 1048576] = "PATH_FILESTAT_SET_TIMES";
    FDRights[FDRights["FD_FILESTAT_GET"] = 2097152] = "FD_FILESTAT_GET";
    FDRights[FDRights["FD_FILESTAT_SET_SIZE"] = 4194304] = "FD_FILESTAT_SET_SIZE";
    FDRights[FDRights["FD_FILESTAT_SET_TIMES"] = 8388608] = "FD_FILESTAT_SET_TIMES";
    FDRights[FDRights["PATH_SYMLINK"] = 16777216] = "PATH_SYMLINK";
    FDRights[FDRights["PATH_REMOVE_DIRECTORY"] = 33554432] = "PATH_REMOVE_DIRECTORY";
    FDRights[FDRights["PATH_UNLINK_FILE"] = 67108864] = "PATH_UNLINK_FILE";
    FDRights[FDRights["POLL_FD_READWRITE"] = 134217728] = "POLL_FD_READWRITE";
    FDRights[FDRights["SOCK_SHUTDOWN"] = 268435456] = "SOCK_SHUTDOWN";
    FDRights[FDRights["FD_ALL"] = 536870911] = "FD_ALL";
})(FDRights || (exports.FDRights = FDRights = {}));
var FDFlags;
(function (FDFlags) {
    FDFlags[FDFlags["APPEND"] = 1] = "APPEND";
    FDFlags[FDFlags["DSYNC"] = 2] = "DSYNC";
    FDFlags[FDFlags["NONBLOCK"] = 4] = "NONBLOCK";
    FDFlags[FDFlags["RSYNC"] = 8] = "RSYNC";
    FDFlags[FDFlags["SYNC"] = 16] = "SYNC";
})(FDFlags || (exports.FDFlags = FDFlags = {}));
var FDOpenFlags;
(function (FDOpenFlags) {
    FDOpenFlags[FDOpenFlags["CREAT"] = 1] = "CREAT";
    FDOpenFlags[FDOpenFlags["DIRECTORY"] = 2] = "DIRECTORY";
    FDOpenFlags[FDOpenFlags["EXCL"] = 4] = "EXCL";
    FDOpenFlags[FDOpenFlags["TRUNC"] = 8] = "TRUNC";
})(FDOpenFlags || (exports.FDOpenFlags = FDOpenFlags = {}));
var WASIErrors;
(function (WASIErrors) {
    WASIErrors[WASIErrors["SUCCESS"] = 0] = "SUCCESS";
    WASIErrors[WASIErrors["TOOBIG"] = 1] = "TOOBIG";
    WASIErrors[WASIErrors["ACCES"] = 2] = "ACCES";
    WASIErrors[WASIErrors["ADDRINUSE"] = 3] = "ADDRINUSE";
    WASIErrors[WASIErrors["ADDRNOTAVAIL"] = 4] = "ADDRNOTAVAIL";
    WASIErrors[WASIErrors["AFNOSUPPORT"] = 5] = "AFNOSUPPORT";
    WASIErrors[WASIErrors["AGAIN"] = 6] = "AGAIN";
    WASIErrors[WASIErrors["ALREADY"] = 7] = "ALREADY";
    WASIErrors[WASIErrors["BADF"] = 8] = "BADF";
    WASIErrors[WASIErrors["BADMSG"] = 9] = "BADMSG";
    WASIErrors[WASIErrors["BUSY"] = 10] = "BUSY";
    WASIErrors[WASIErrors["CANCELED"] = 11] = "CANCELED";
    WASIErrors[WASIErrors["CHILD"] = 12] = "CHILD";
    WASIErrors[WASIErrors["CONNABORTED"] = 13] = "CONNABORTED";
    WASIErrors[WASIErrors["CONNREFUSED"] = 14] = "CONNREFUSED";
    WASIErrors[WASIErrors["CONNRESET"] = 15] = "CONNRESET";
    WASIErrors[WASIErrors["DEADLK"] = 16] = "DEADLK";
    WASIErrors[WASIErrors["DESTADDRREQ"] = 17] = "DESTADDRREQ";
    WASIErrors[WASIErrors["DOM"] = 18] = "DOM";
    WASIErrors[WASIErrors["DQUOT"] = 19] = "DQUOT";
    WASIErrors[WASIErrors["EXIST"] = 20] = "EXIST";
    WASIErrors[WASIErrors["FAULT"] = 21] = "FAULT";
    WASIErrors[WASIErrors["FBIG"] = 22] = "FBIG";
    WASIErrors[WASIErrors["HOSTUNREACH"] = 23] = "HOSTUNREACH";
    WASIErrors[WASIErrors["IDRM"] = 24] = "IDRM";
    WASIErrors[WASIErrors["ILSEQ"] = 25] = "ILSEQ";
    WASIErrors[WASIErrors["INPROGRESS"] = 26] = "INPROGRESS";
    WASIErrors[WASIErrors["INTR"] = 27] = "INTR";
    WASIErrors[WASIErrors["INVAL"] = 28] = "INVAL";
    WASIErrors[WASIErrors["IO"] = 29] = "IO";
    WASIErrors[WASIErrors["ISCONN"] = 30] = "ISCONN";
    WASIErrors[WASIErrors["ISDIR"] = 31] = "ISDIR";
    WASIErrors[WASIErrors["LOOP"] = 32] = "LOOP";
    WASIErrors[WASIErrors["MFILE"] = 33] = "MFILE";
    WASIErrors[WASIErrors["MLINK"] = 34] = "MLINK";
    WASIErrors[WASIErrors["MSGSIZE"] = 35] = "MSGSIZE";
    WASIErrors[WASIErrors["MULTIHOP"] = 36] = "MULTIHOP";
    WASIErrors[WASIErrors["NAMETOOLONG"] = 37] = "NAMETOOLONG";
    WASIErrors[WASIErrors["NETDOWN"] = 38] = "NETDOWN";
    WASIErrors[WASIErrors["NETRESET"] = 39] = "NETRESET";
    WASIErrors[WASIErrors["NETUNREACH"] = 40] = "NETUNREACH";
    WASIErrors[WASIErrors["NFILE"] = 41] = "NFILE";
    WASIErrors[WASIErrors["NOBUFS"] = 42] = "NOBUFS";
    WASIErrors[WASIErrors["NODEV"] = 43] = "NODEV";
    WASIErrors[WASIErrors["NOENT"] = 44] = "NOENT";
    WASIErrors[WASIErrors["NOEXEC"] = 45] = "NOEXEC";
    WASIErrors[WASIErrors["NOLCK"] = 46] = "NOLCK";
    WASIErrors[WASIErrors["NOLINK"] = 47] = "NOLINK";
    WASIErrors[WASIErrors["NOMEM"] = 48] = "NOMEM";
    WASIErrors[WASIErrors["NOMSG"] = 49] = "NOMSG";
    WASIErrors[WASIErrors["NOPROTOOPT"] = 50] = "NOPROTOOPT";
    WASIErrors[WASIErrors["NOSPC"] = 51] = "NOSPC";
    WASIErrors[WASIErrors["NOSYS"] = 52] = "NOSYS";
    WASIErrors[WASIErrors["NOTCONN"] = 53] = "NOTCONN";
    WASIErrors[WASIErrors["NOTDIR"] = 54] = "NOTDIR";
    WASIErrors[WASIErrors["NOTEMPTY"] = 55] = "NOTEMPTY";
    WASIErrors[WASIErrors["NOTRECOVERABLE"] = 56] = "NOTRECOVERABLE";
    WASIErrors[WASIErrors["NOTSOCK"] = 57] = "NOTSOCK";
    WASIErrors[WASIErrors["NOTSUP"] = 58] = "NOTSUP";
    WASIErrors[WASIErrors["NOTTY"] = 59] = "NOTTY";
    WASIErrors[WASIErrors["NXIO"] = 60] = "NXIO";
    WASIErrors[WASIErrors["OVERFLOW"] = 61] = "OVERFLOW";
    WASIErrors[WASIErrors["OWNERDEAD"] = 62] = "OWNERDEAD";
    WASIErrors[WASIErrors["PERM"] = 63] = "PERM";
    WASIErrors[WASIErrors["PIPE"] = 64] = "PIPE";
    WASIErrors[WASIErrors["PROTO"] = 65] = "PROTO";
    WASIErrors[WASIErrors["PROTONOSUPPORT"] = 66] = "PROTONOSUPPORT";
    WASIErrors[WASIErrors["PROTOTYPE"] = 67] = "PROTOTYPE";
    WASIErrors[WASIErrors["RANGE"] = 68] = "RANGE";
    WASIErrors[WASIErrors["ROFS"] = 69] = "ROFS";
    WASIErrors[WASIErrors["SPIPE"] = 70] = "SPIPE";
    WASIErrors[WASIErrors["SRCH"] = 71] = "SRCH";
    WASIErrors[WASIErrors["STALE"] = 72] = "STALE";
    WASIErrors[WASIErrors["TIMEDOUT"] = 73] = "TIMEDOUT";
    WASIErrors[WASIErrors["TXTBSY"] = 74] = "TXTBSY";
    WASIErrors[WASIErrors["XDEV"] = 75] = "XDEV";
    WASIErrors[WASIErrors["NOTCAPABLE"] = 76] = "NOTCAPABLE";
})(WASIErrors || (exports.WASIErrors = WASIErrors = {}));
var WASIFileDescriptor = /** @class */ (function () {
    function WASIFileDescriptor(name, type, rights) {
        this.name = name;
        this.type = type;
        this.rights = rights;
        this.fdindex = -1;
        this.data = new Uint8Array(16);
        this.flags = 0;
        this.size = 0;
        this.offset = 0;
        this.rights = -1; // TODO?
    }
    WASIFileDescriptor.prototype.ensureCapacity = function (size) {
        if (this.data.byteLength < size) {
            var newdata = new Uint8Array(size * 2); // TODO?
            newdata.set(this.data);
            this.data = newdata;
        }
    };
    WASIFileDescriptor.prototype.write = function (chunk) {
        this.ensureCapacity(this.offset + chunk.byteLength);
        this.data.set(chunk, this.offset);
        this.offset += chunk.byteLength;
        this.size = Math.max(this.size, this.offset);
    };
    WASIFileDescriptor.prototype.read = function (chunk) {
        var len = Math.min(chunk.byteLength, this.size - this.offset);
        chunk.set(this.data.subarray(this.offset, this.offset + len));
        this.offset += len;
        return len;
    };
    WASIFileDescriptor.prototype.truncate = function () {
        this.size = 0;
        this.offset = 0;
    };
    WASIFileDescriptor.prototype.llseek = function (offset, whence) {
        switch (whence) {
            case 0: // SEEK_SET
                this.offset = offset;
                break;
            case 1: // SEEK_CUR
                this.offset += offset;
                break;
            case 2: // SEEK_END
                this.offset = this.size + offset;
                break;
        }
        if (this.offset < 0)
            this.offset = 0;
        if (this.offset > this.size)
            this.offset = this.size;
    };
    WASIFileDescriptor.prototype.getBytes = function () {
        return this.data.subarray(0, this.size);
    };
    WASIFileDescriptor.prototype.getBytesAsString = function () {
        return new TextDecoder().decode(this.getBytes());
    };
    WASIFileDescriptor.prototype.toString = function () {
        return "FD(".concat(this.fdindex, " \"").concat(this.name, "\" 0x").concat(this.type.toString(16), " 0x").concat(this.rights.toString(16), " ").concat(this.offset, "/").concat(this.size, "/").concat(this.data.byteLength, ")");
    };
    return WASIFileDescriptor;
}());
exports.WASIFileDescriptor = WASIFileDescriptor;
var WASIStreamingFileDescriptor = /** @class */ (function (_super) {
    __extends(WASIStreamingFileDescriptor, _super);
    function WASIStreamingFileDescriptor(fdindex, name, type, rights, stream) {
        var _this = _super.call(this, name, type, rights) || this;
        _this.stream = stream;
        _this.fdindex = fdindex;
        return _this;
    }
    WASIStreamingFileDescriptor.prototype.write = function (chunk) {
        this.stream.write(chunk);
    };
    return WASIStreamingFileDescriptor;
}(WASIFileDescriptor));
var WASIMemoryFilesystem = /** @class */ (function () {
    function WASIMemoryFilesystem() {
        this.parent = null;
        this.files = new Map();
        this.dirs = new Map();
        this.putDirectory("/");
    }
    WASIMemoryFilesystem.prototype.setParent = function (parent) {
        this.parent = parent;
    };
    WASIMemoryFilesystem.prototype.putDirectory = function (name, rights) {
        if (!rights)
            rights = FDRights.PATH_OPEN | FDRights.PATH_CREATE_DIRECTORY | FDRights.PATH_CREATE_FILE;
        if (name != '/' && name.endsWith('/'))
            name = name.substring(0, name.length - 1);
        // add parent directory(s)
        var parent = name.substring(0, name.lastIndexOf('/'));
        if (parent && parent != name) {
            this.putDirectory(parent, rights);
        }
        // add directory
        var dir = new WASIFileDescriptor(name, FDType.DIRECTORY, rights);
        this.dirs.set(name, dir);
        return dir;
    };
    WASIMemoryFilesystem.prototype.putFile = function (name, data, rights) {
        if (typeof data === 'string') {
            data = new TextEncoder().encode(data);
        }
        if (!rights)
            rights = FDRights.FD_READ | FDRights.FD_WRITE;
        var file = new WASIFileDescriptor(name, FDType.REGULAR_FILE, rights);
        file.write(data);
        file.offset = 0;
        this.files.set(name, file);
        return file;
    };
    WASIMemoryFilesystem.prototype.putSymbolicLink = function (name, target, rights) {
        if (!rights)
            rights = FDRights.PATH_SYMLINK;
        var file = new WASIFileDescriptor(name, FDType.SYMBOLIC_LINK, rights);
        file.write(new TextEncoder().encode(target));
        file.offset = 0;
        this.files.set(name, file);
        return file;
    };
    WASIMemoryFilesystem.prototype.getFile = function (name) {
        var _a;
        var file = this.files.get(name);
        if (!file) {
            file = (_a = this.parent) === null || _a === void 0 ? void 0 : _a.getFile(name);
        }
        return file;
    };
    WASIMemoryFilesystem.prototype.getDirectories = function () {
        return __spreadArray([], this.dirs.values(), true);
    };
    WASIMemoryFilesystem.prototype.getFiles = function () {
        return __spreadArray([], this.files.values(), true);
    };
    return WASIMemoryFilesystem;
}());
exports.WASIMemoryFilesystem = WASIMemoryFilesystem;
var WASIRunner = /** @class */ (function () {
    function WASIRunner() {
        _WASIRunner_instance.set(this, void 0); // TODO
        _WASIRunner_memarr8.set(this, void 0);
        _WASIRunner_memarr32.set(this, void 0);
        _WASIRunner_args.set(this, []);
        _WASIRunner_envvars.set(this, []);
        this.fds = [];
        this.exited = false;
        this.errno = -1;
        this.fs = new WASIMemoryFilesystem();
        this.createStdioBrowser();
    }
    WASIRunner.prototype.exports = function () {
        return __classPrivateFieldGet(this, _WASIRunner_instance, "f").exports;
    };
    WASIRunner.prototype.createStdioNode = function () {
        this.stdin = new WASIStreamingFileDescriptor(0, '<stdin>', FDType.CHARACTER_DEVICE, FDRights.FD_READ, process.stdin);
        this.stdout = new WASIStreamingFileDescriptor(1, '<stdout>', FDType.CHARACTER_DEVICE, FDRights.FD_WRITE, process.stdout);
        this.stderr = new WASIStreamingFileDescriptor(2, '<stderr>', FDType.CHARACTER_DEVICE, FDRights.FD_WRITE, process.stderr);
        this.fds[0] = this.stdin;
        this.fds[1] = this.stdout;
        this.fds[2] = this.stderr;
    };
    WASIRunner.prototype.createStdioBrowser = function () {
        this.stdin = new WASIFileDescriptor('<stdin>', FDType.CHARACTER_DEVICE, FDRights.FD_READ);
        this.stdout = new WASIFileDescriptor('<stdout>', FDType.CHARACTER_DEVICE, FDRights.FD_WRITE);
        this.stderr = new WASIFileDescriptor('<stderr>', FDType.CHARACTER_DEVICE, FDRights.FD_WRITE);
        this.stdin.fdindex = 0;
        this.stdout.fdindex = 1;
        this.stderr.fdindex = 2;
        this.fds[0] = this.stdin;
        this.fds[1] = this.stdout;
        this.fds[2] = this.stderr;
    };
    WASIRunner.prototype.initSync = function (wasmModule) {
        __classPrivateFieldSet(this, _WASIRunner_instance, new WebAssembly.Instance(wasmModule, this.getImportObject()), "f");
    };
    WASIRunner.prototype.loadSync = function (wasmSource) {
        var wasmModule = new WebAssembly.Module(wasmSource);
        this.initSync(wasmModule);
    };
    WASIRunner.prototype.loadAsync = function (wasmSource) {
        return __awaiter(this, void 0, void 0, function () {
            var wasmModule, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, WebAssembly.compile(wasmSource)];
                    case 1:
                        wasmModule = _b.sent();
                        _a = [this, _WASIRunner_instance];
                        return [4 /*yield*/, WebAssembly.instantiate(wasmModule, this.getImportObject())];
                    case 2:
                        __classPrivateFieldSet.apply(void 0, _a.concat([_b.sent(), "f"]));
                        return [2 /*return*/];
                }
            });
        });
    };
    WASIRunner.prototype.setArgs = function (args) {
        __classPrivateFieldSet(this, _WASIRunner_args, args.map(function (arg) { return new TextEncoder().encode(arg + '\0'); }), "f");
    };
    WASIRunner.prototype.addPreopenDirectory = function (name) {
        return this.openFile(name, FDOpenFlags.DIRECTORY | FDOpenFlags.CREAT);
    };
    WASIRunner.prototype.openFile = function (path, o_flags, mode) {
        var file = this.fs.getFile(path);
        mode = typeof mode == 'undefined' ? 438 /* 0666 */ : mode;
        if (o_flags & FDOpenFlags.CREAT) {
            if (file == null) {
                if (o_flags & FDOpenFlags.DIRECTORY) {
                    file = this.fs.putDirectory(path);
                }
                else {
                    file = this.fs.putFile(path, new Uint8Array(), FDRights.FD_ALL);
                }
            }
            else {
                if (o_flags & FDOpenFlags.TRUNC) { // truncate
                    file.truncate();
                }
                else
                    return WASIErrors.INVAL;
            }
        }
        else {
            if (file == null)
                return WASIErrors.NOSYS;
            if (o_flags & FDOpenFlags.DIRECTORY) { // check type
                if (file.type !== FDType.DIRECTORY)
                    return WASIErrors.NOSYS;
            }
            if (o_flags & FDOpenFlags.EXCL)
                return WASIErrors.INVAL; // already exists
            if (o_flags & FDOpenFlags.TRUNC) { // truncate
                file.truncate();
            }
            else {
                file.llseek(0, 0); // seek to start
            }
        }
        file.fdindex = this.fds.length;
        this.fds.push(file);
        return file;
    };
    WASIRunner.prototype.mem8 = function () {
        var _a;
        if (!((_a = __classPrivateFieldGet(this, _WASIRunner_memarr8, "f")) === null || _a === void 0 ? void 0 : _a.byteLength)) {
            __classPrivateFieldSet(this, _WASIRunner_memarr8, new Uint8Array(__classPrivateFieldGet(this, _WASIRunner_instance, "f").exports.memory.buffer), "f");
        }
        return __classPrivateFieldGet(this, _WASIRunner_memarr8, "f");
    };
    WASIRunner.prototype.mem32 = function () {
        var _a;
        if (!((_a = __classPrivateFieldGet(this, _WASIRunner_memarr32, "f")) === null || _a === void 0 ? void 0 : _a.byteLength)) {
            __classPrivateFieldSet(this, _WASIRunner_memarr32, new Int32Array(__classPrivateFieldGet(this, _WASIRunner_instance, "f").exports.memory.buffer), "f");
        }
        return __classPrivateFieldGet(this, _WASIRunner_memarr32, "f");
    };
    WASIRunner.prototype.run = function () {
        try {
            __classPrivateFieldGet(this, _WASIRunner_instance, "f").exports._start();
            if (!this.exited) {
                this.exited = true;
                this.errno = 0;
            }
        }
        catch (err) {
            if (!this.exited)
                throw err;
        }
        return this.getErrno();
    };
    WASIRunner.prototype.initialize = function () {
        __classPrivateFieldGet(this, _WASIRunner_instance, "f").exports._initialize();
        return this.getErrno();
    };
    WASIRunner.prototype.getImportObject = function () {
        return {
            "wasi_snapshot_preview1": this.getWASISnapshotPreview1(),
            "env": this.getEnv(),
        };
    };
    WASIRunner.prototype.peek8 = function (ptr) {
        return this.mem8()[ptr];
    };
    WASIRunner.prototype.peek16 = function (ptr) {
        return this.mem8()[ptr] | (this.mem8()[ptr + 1] << 8);
    };
    WASIRunner.prototype.peek32 = function (ptr) {
        return this.mem32()[ptr >>> 2];
    };
    WASIRunner.prototype.poke8 = function (ptr, val) {
        this.mem8()[ptr] = val;
    };
    WASIRunner.prototype.poke16 = function (ptr, val) {
        this.mem8()[ptr] = val;
        this.mem8()[ptr + 1] = val >> 8;
    };
    WASIRunner.prototype.poke32 = function (ptr, val) {
        this.mem32()[ptr >>> 2] = val;
    };
    WASIRunner.prototype.poke64 = function (ptr, val) {
        this.mem32()[ptr >>> 2] = val;
        this.mem32()[(ptr >>> 2) + 1] = 0;
    };
    WASIRunner.prototype.pokeUTF8 = function (str, ptr, maxlen) {
        var enc = new TextEncoder();
        var bytes = enc.encode(str);
        var len = Math.min(bytes.length, maxlen);
        this.mem8().set(bytes.subarray(0, len), ptr);
        return len;
    };
    WASIRunner.prototype.peekUTF8 = function (ptr, maxlen) {
        var bytes = this.mem8().subarray(ptr, ptr + maxlen);
        var dec = new TextDecoder();
        return dec.decode(bytes);
    };
    WASIRunner.prototype.getErrno = function () {
        return this.errno;
        //let errno_ptr = this.#instance.exports.__errno_location();
        //return this.peek32(errno_ptr);
    };
    WASIRunner.prototype.poke_str_array_sizes = function (strs, count_ptr, buf_size_ptr) {
        this.poke32(count_ptr, strs.length);
        this.poke32(buf_size_ptr, strs.reduce(function (acc, arg) { return acc + arg.length; }, 0));
    };
    WASIRunner.prototype.poke_str_args = function (strs, argv_ptr, argv_buf_ptr) {
        var argv = argv_ptr;
        var argv_buf = argv_buf_ptr;
        for (var _i = 0, _a = __classPrivateFieldGet(this, _WASIRunner_args, "f"); _i < _a.length; _i++) {
            var arg = _a[_i];
            this.poke32(argv, argv_buf);
            argv += 4;
            for (var i = 0; i < arg.length; i++) {
                this.poke8(argv_buf, arg[i]);
                argv_buf++;
            }
        }
    };
    WASIRunner.prototype.args_sizes_get = function (argcount_ptr, argv_buf_size_ptr) {
        debug("args_sizes_get", argcount_ptr, argv_buf_size_ptr);
        this.poke_str_array_sizes(__classPrivateFieldGet(this, _WASIRunner_args, "f"), argcount_ptr, argv_buf_size_ptr);
        return 0;
    };
    WASIRunner.prototype.args_get = function (argv_ptr, argv_buf_ptr) {
        debug("args_get", argv_ptr, argv_buf_ptr);
        this.poke_str_args(__classPrivateFieldGet(this, _WASIRunner_args, "f"), argv_ptr, argv_buf_ptr);
        return 0;
    };
    WASIRunner.prototype.environ_sizes_get = function (environ_count_ptr, environ_buf_size_ptr) {
        debug("environ_sizes_get", environ_count_ptr, environ_buf_size_ptr);
        this.poke_str_array_sizes(__classPrivateFieldGet(this, _WASIRunner_envvars, "f"), environ_count_ptr, environ_buf_size_ptr);
        return 0;
    };
    WASIRunner.prototype.environ_get = function (environ_ptr, environ_buf_ptr) {
        debug("environ_get", environ_ptr, environ_buf_ptr);
        this.poke_str_args(__classPrivateFieldGet(this, _WASIRunner_envvars, "f"), environ_ptr, environ_buf_ptr);
        return 0;
    };
    WASIRunner.prototype.fd_write = function (fd, iovs, iovs_len, nwritten_ptr) {
        var stream = this.fds[fd];
        var iovecs = this.mem32().subarray(iovs >>> 2, (iovs + iovs_len * 8) >>> 2);
        var total = 0;
        for (var i = 0; i < iovs_len; i++) {
            var ptr = iovecs[i * 2];
            var len = iovecs[i * 2 + 1];
            var chunk = this.mem8().subarray(ptr, ptr + len);
            total += len;
            stream.write(chunk);
        }
        this.poke32(nwritten_ptr, total);
        debug("fd_write", fd, iovs, iovs_len, '->', total);
        return 0;
    };
    WASIRunner.prototype.fd_read = function (fd, iovs, iovs_len, nread_ptr) {
        var stream = this.fds[fd];
        var iovecs = this.mem32().subarray(iovs >>> 2, (iovs + iovs_len * 8) >>> 2);
        var total = 0;
        for (var i = 0; i < iovs_len; i++) {
            var ptr = iovecs[i * 2];
            var len = iovecs[i * 2 + 1];
            var chunk = this.mem8().subarray(ptr, ptr + len);
            total += stream.read(chunk);
        }
        this.poke32(nread_ptr, total);
        debug("fd_read", fd, iovs, iovs_len, '->', total);
        return WASIErrors.SUCCESS;
    };
    WASIRunner.prototype.fd_seek = function (fd, offset, whence, newoffset_ptr) {
        var file = this.fds[fd];
        if (typeof offset == 'bigint')
            offset = Number(offset);
        debug("fd_seek", fd, offset, whence, file + "");
        if (file != null) {
            file.llseek(offset, whence);
            this.poke64(newoffset_ptr, file.offset);
            return WASIErrors.SUCCESS;
        }
        return WASIErrors.BADF;
    };
    WASIRunner.prototype.fd_close = function (fd) {
        debug("fd_close", fd);
        var file = this.fds[fd];
        if (file != null) {
            this.fds[fd] = null;
            return 0;
        }
        return WASIErrors.BADF;
    };
    WASIRunner.prototype.proc_exit = function (errno) {
        debug("proc_exit", errno);
        this.errno = errno;
        this.exited = true;
    };
    WASIRunner.prototype.fd_prestat_get = function (fd, prestat_ptr) {
        var file = this.fds[fd];
        debug("fd_prestat_get", fd, prestat_ptr, file === null || file === void 0 ? void 0 : file.name, file === null || file === void 0 ? void 0 : file.type);
        if (file && file.type === FDType.DIRECTORY) {
            var enc_name = new TextEncoder().encode(file.name);
            this.poke64(prestat_ptr + 0, 0); // __WASI_PREOPENTYPE_DIR
            this.poke64(prestat_ptr + 8, enc_name.length);
            return WASIErrors.SUCCESS;
        }
        return WASIErrors.BADF;
    };
    WASIRunner.prototype.fd_fdstat_get = function (fd, fdstat_ptr) {
        var file = this.fds[fd];
        debug("fd_fdstat_get", fd, fdstat_ptr, file + "");
        if (file != null) {
            this.poke16(fdstat_ptr + 0, file.type); // fs_filetype
            this.poke16(fdstat_ptr + 2, file.flags); // fs_flags
            this.poke64(fdstat_ptr + 8, file.rights); // fs_rights_base
            this.poke64(fdstat_ptr + 16, file.rights); // fs_rights_inheriting
            return WASIErrors.SUCCESS;
        }
        return WASIErrors.BADF;
    };
    WASIRunner.prototype.fd_prestat_dir_name = function (fd, path_ptr, path_len) {
        var file = this.fds[fd];
        debug("fd_prestat_dir_name", fd, path_ptr, path_len);
        if (file != null) {
            this.pokeUTF8(file.name, path_ptr, path_len);
            return WASIErrors.SUCCESS;
        }
        return WASIErrors.INVAL;
    };
    WASIRunner.prototype.path_open = function (dirfd, dirflags, path_ptr, path_len, o_flags, fs_rights_base, fs_rights_inheriting, fd_flags, fd_ptr) {
        var dir = this.fds[dirfd];
        if (dir == null)
            return WASIErrors.BADF;
        if (dir.type !== FDType.DIRECTORY)
            return WASIErrors.NOTDIR;
        var filename = this.peekUTF8(path_ptr, path_len);
        var path = dir.name + '/' + filename;
        var fd = this.openFile(path, o_flags, fd_flags);
        debug("path_open", path, dirfd, dirflags, o_flags, //fs_rights_base, fs_rights_inheriting,
        fd_flags, fd_ptr, '->', fd + "");
        if (typeof fd === 'number')
            return fd; // error msg
        this.poke32(fd_ptr, fd.fdindex);
        return WASIErrors.SUCCESS;
    };
    WASIRunner.prototype.random_get = function (ptr, len) {
        debug("random_get", ptr, len);
        for (var i = 0; i < len; i++) {
            // TODO: don't use for crypto
            this.poke8(ptr + i, Math.floor(Math.random() * 256));
        }
        return WASIErrors.SUCCESS;
    };
    WASIRunner.prototype.path_filestat_get = function (dirfd, dirflags, path_ptr, path_len, filestat_ptr) {
        var dir = this.fds[dirfd];
        if (dir == null)
            return WASIErrors.BADF;
        if (dir.type !== FDType.DIRECTORY)
            return WASIErrors.NOTDIR;
        var filename = this.peekUTF8(path_ptr, path_len);
        var path = filename.startsWith('/') ? filename : dir.name + '/' + filename; // TODO?
        var fd = this.fs.getFile(path);
        console.log("path_filestat_get", dir + "", filename, path, filestat_ptr, '->', fd + "");
        if (!fd)
            return WASIErrors.NOENT;
        this.poke64(filestat_ptr, fd.fdindex); // dev
        this.poke64(filestat_ptr + 8, 0); // ino
        this.poke8(filestat_ptr + 16, fd.type); // filetype
        this.poke64(filestat_ptr + 24, 1); // nlink
        this.poke64(filestat_ptr + 32, fd.size); // size
        this.poke64(filestat_ptr + 40, 0); // atim
        this.poke64(filestat_ptr + 48, 0); // mtim
        this.poke64(filestat_ptr + 56, 0); // ctim
    };
    WASIRunner.prototype.path_readlink = function (dirfd, path_ptr, path_len, buf_ptr, buf_len, buf_used_ptr) {
        var dir = this.fds[dirfd];
        debug("path_readlink", dirfd, path_ptr, path_len, buf_ptr, buf_len, buf_used_ptr, dir + "");
        if (dir == null)
            return WASIErrors.BADF;
        if (dir.type !== FDType.DIRECTORY)
            return WASIErrors.NOTDIR;
        var filename = this.peekUTF8(path_ptr, path_len);
        var path = dir.name + '/' + filename;
        var fd = this.fs.getFile(path);
        debug("path_readlink", path, fd + "");
        if (!fd)
            return WASIErrors.NOENT;
        if (fd.type !== FDType.SYMBOLIC_LINK)
            return WASIErrors.INVAL;
        var target = fd.getBytesAsString();
        var len = this.pokeUTF8(target, buf_ptr, buf_len);
        this.poke32(buf_used_ptr, len);
        debug("path_readlink", path, '->', target);
        return WASIErrors.SUCCESS;
    };
    WASIRunner.prototype.path_readlinkat = function (dirfd, path_ptr, path_len, buf_ptr, buf_len, buf_used_ptr) {
        return this.path_readlink(dirfd, path_ptr, path_len, buf_ptr, buf_len, buf_used_ptr);
    };
    WASIRunner.prototype.path_unlink_file = function (dirfd, path_ptr, path_len) {
        var dir = this.fds[dirfd];
        if (dir == null)
            return WASIErrors.BADF;
        if (dir.type !== FDType.DIRECTORY)
            return WASIErrors.NOTDIR;
        var filename = this.peekUTF8(path_ptr, path_len);
        var path = dir.name + '/' + filename;
        var fd = this.fs.getFile(path);
        debug("path_unlink_file", dir + "", path, fd + "");
        if (!fd)
            return WASIErrors.NOENT;
        this.fs.getFile(path);
        return WASIErrors.SUCCESS;
    };
    WASIRunner.prototype.clock_time_get = function (clock_id, precision, time_ptr) {
        var time = Date.now();
        this.poke64(time_ptr, time);
        return WASIErrors.SUCCESS;
    };
    WASIRunner.prototype.getWASISnapshotPreview1 = function () {
        return {
            args_sizes_get: this.args_sizes_get.bind(this),
            args_get: this.args_get.bind(this),
            environ_sizes_get: this.environ_sizes_get.bind(this),
            environ_get: this.environ_get.bind(this),
            proc_exit: this.proc_exit.bind(this),
            path_open: this.path_open.bind(this),
            fd_prestat_get: this.fd_prestat_get.bind(this),
            fd_prestat_dir_name: this.fd_prestat_dir_name.bind(this),
            fd_fdstat_get: this.fd_fdstat_get.bind(this),
            fd_read: this.fd_read.bind(this),
            fd_write: this.fd_write.bind(this),
            fd_seek: this.fd_seek.bind(this),
            fd_close: this.fd_close.bind(this),
            path_filestat_get: this.path_filestat_get.bind(this),
            random_get: this.random_get.bind(this),
            path_readlink: this.path_readlink.bind(this),
            path_unlink_file: this.path_unlink_file.bind(this),
            clock_time_get: this.clock_time_get.bind(this),
            fd_fdstat_set_flags: function () { warning("TODO: fd_fdstat_set_flags"); return WASIErrors.NOTSUP; },
            fd_readdir: function () { warning("TODO: fd_readdir"); return WASIErrors.NOTSUP; },
            fd_tell: function () { warning("TODO: fd_tell"); return WASIErrors.NOTSUP; },
            path_remove_directory: function () { warning("TODO: path_remove_directory"); return 0; },
        };
    };
    WASIRunner.prototype.getEnv = function () {
        return {
            __syscall_unlinkat: function () { warning('TODO: unlink'); return WASIErrors.NOTSUP; },
            __syscall_faccessat: function () { warning("TODO: faccessat"); return WASIErrors.NOTSUP; },
            __syscall_readlinkat: this.path_readlinkat.bind(this),
            __syscall_getcwd: function () { warning("TODO: getcwd"); return WASIErrors.NOTSUP; },
            __syscall_rmdir: function () { warning("TODO: rmdir"); return WASIErrors.NOTSUP; },
            segfault: function () { warning("TODO: segfault"); return WASIErrors.NOTSUP; },
            alignfault: function () { warning("TODO: alignfault"); return WASIErrors.NOTSUP; },
            __wasilibc_cwd: new WebAssembly.Global({
                value: 'i32',
                mutable: true
            }, 0)
        };
    };
    return WASIRunner;
}());
exports.WASIRunner = WASIRunner;
_WASIRunner_instance = new WeakMap(), _WASIRunner_memarr8 = new WeakMap(), _WASIRunner_memarr32 = new WeakMap(), _WASIRunner_args = new WeakMap(), _WASIRunner_envvars = new WeakMap();

});


// ── tools/dasm ──────────────────────────────────────────────────────────────────
__define("tools/dasm", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleDASM = assembleDASM;
exports.assembleDASM2 = assembleDASM2;
var wasishim_1 = __require("/tmp/8bitworkshop/gen/common/wasi/wasishim");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
function parseDASMListing(lstpath, lsttext, listings, errors, unresolved) {
    // TODO: this gets very slow
    // TODO: macros that are on adjacent lines don't get offset addresses
    //        4  08ee		       a9 00	   start      lda	#01workermain.js:23:5
    var lineMatch = /\s*(\d+)\s+(\S+)\s+([0-9a-f]+)\s+([?0-9a-f][?0-9a-f ]+)?\s+(.+)?/i;
    var equMatch = /\bequ\b/i;
    var macroMatch = /\bMAC\s+(\S+)?/i;
    var lastline = 0;
    var macros = {};
    var lstline = 0;
    var lstlist = listings[lstpath];
    for (var _i = 0, _a = lsttext.split(listingutils_1.re_crlf); _i < _a.length; _i++) {
        var line = _a[_i];
        lstline++;
        var linem = lineMatch.exec(line + "    ");
        if (linem && linem[1] != null) {
            var linenum = parseInt(linem[1]);
            var filename = linem[2];
            var offset = parseInt(linem[3], 16);
            var insns = linem[4];
            var restline = linem[5];
            if (insns && insns.startsWith('?'))
                insns = null;
            // don't use listing yet
            if (lstlist && lstlist.lines) {
                lstlist.lines.push({
                    line: lstline,
                    offset: offset,
                    insns: insns,
                    iscode: true,
                });
            }
            // inside of a file?
            var lst = listings[filename];
            if (lst) {
                var lines = lst.lines;
                // look for MAC statement
                var macmatch = macroMatch.exec(restline);
                if (macmatch) {
                    macros[macmatch[1]] = { line: parseInt(linem[1]), file: linem[2].toLowerCase() };
                }
                else if (insns && restline && !restline.match(equMatch)) {
                    lines.push({
                        line: linenum,
                        offset: offset,
                        insns: insns,
                        iscode: restline[0] != '.'
                    });
                }
                lastline = linenum;
            }
            else {
                // inside of macro?
                var mac = macros[filename.toLowerCase()];
                // macro invocation in main file
                if (mac && linenum == 0) {
                    lines.push({
                        line: lastline + 1,
                        offset: offset,
                        insns: insns,
                        iscode: true
                    });
                }
                if (insns && mac) {
                    var maclst = listings[mac.file];
                    if (maclst && maclst.lines) {
                        maclst.lines.push({
                            path: mac.file,
                            line: mac.line + linenum,
                            offset: offset,
                            insns: insns,
                            iscode: true
                        });
                    }
                    // TODO: a listing file can't include other files
                }
                else {
                    // inside of macro or include file
                    if (insns && linem[3] && lastline > 0) {
                        lines.push({
                            line: lastline + 1,
                            offset: offset,
                            insns: null
                        });
                    }
                }
            }
            // TODO: better symbol test (word boundaries)
            // TODO: ignore IFCONST and IFNCONST usage
            for (var key in unresolved) {
                var l = restline || line;
                // find the identifier substring
                var pos = l.indexOf(key);
                if (pos >= 0) {
                    // strip the comment, if any
                    var cmt = l.indexOf(';');
                    if (cmt < 0 || cmt > pos) {
                        // make sure identifier is flanked by non-word chars
                        if (new RegExp("\\b" + key + "\\b").exec(l)) {
                            errors.push({
                                path: filename,
                                line: linenum,
                                msg: "Unresolved symbol '" + key + "'"
                            });
                        }
                    }
                }
            }
        }
        var errm = listingutils_1.re_msvc.exec(line);
        if (errm) {
            errors.push({
                path: errm[1],
                line: parseInt(errm[2]),
                msg: errm[4]
            });
        }
    }
}
var re_usl = /(\w+)\s+0000\s+[?][?][?][?]/;
function parseSymbolMap(asym) {
    var symbolmap = {};
    for (var _i = 0, _a = asym.split("\n"); _i < _a.length; _i++) {
        var s = _a[_i];
        var toks = s.split(/\s+/);
        if (toks && toks.length >= 2 && !toks[0].startsWith('-')) {
            symbolmap[toks[0]] = parseInt(toks[1], 16);
        }
    }
    return symbolmap;
}
// Determine likely origin address from listing
function getMinListingOffset(listings) {
    var minOffset;
    for (var key in listings) {
        var lst = listings[key];
        if (lst && lst.lines) {
            for (var _i = 0, _a = lst.lines; _i < _a.length; _i++) {
                var line = _a[_i];
                if (line.iscode && line.offset > 0) {
                    if (minOffset === undefined || line.offset < minOffset) {
                        minOffset = line.offset;
                    }
                }
            }
        }
    }
    return minOffset;
}
function assembleDASM(step) {
    (0, wasmutils_1.load)("dasm");
    var unresolved = {};
    var errors = [];
    var errorMatcher = (0, listingutils_1.msvcErrorMatcher)(errors);
    function match_fn(s) {
        // TODO: what if s is not string? (startsWith is not a function)
        var matches = re_usl.exec(s);
        if (matches) {
            var key = matches[1];
            if (key != 'NO_ILLEGAL_OPCODES') { // TODO
                unresolved[matches[1]] = 0;
            }
        }
        else if (s.startsWith("Warning:")) {
            errors.push({ line: 0, msg: s.substr(9) });
        }
        else if (s.startsWith("unable ")) {
            errors.push({ line: 0, msg: s });
        }
        else if (s.startsWith("segment: ")) {
            errors.push({ line: 0, msg: "Segment overflow: " + s.substring(9) });
        }
        else if (s.toLowerCase().indexOf('error:') >= 0) {
            errors.push({ line: 0, msg: s.trim() });
        }
        else {
            errorMatcher(s);
        }
    }
    var Module = wasmutils_1.emglobal.DASM({
        noInitialRun: true,
        print: match_fn
    });
    var FS = Module.FS;
    (0, builder_1.populateFiles)(step, FS, {
        mainFilePath: 'main.a'
    });
    var binpath = step.prefix + '.bin';
    var lstpath = step.prefix + '.lst';
    var sympath = step.prefix + '.sym';
    (0, wasmutils_1.execMain)(step, Module, [step.path, '-f3',
        "-l" + lstpath,
        "-o" + binpath,
        "-s" + sympath]);
    var alst = FS.readFile(lstpath, { 'encoding': 'utf8' });
    // parse main listing, get errors and listings for each file
    var listings = {};
    //listings[lstpath] = {lines:[], text:alst};
    for (var _i = 0, _a = step.files; _i < _a.length; _i++) {
        var path = _a[_i];
        listings[path] = { lines: [] };
    }
    parseDASMListing(lstpath, alst, listings, errors, unresolved);
    if (errors.length) {
        return { errors: errors };
    }
    // read binary rom output and symbols
    var aout, asym;
    aout = FS.readFile(binpath);
    try {
        asym = FS.readFile(sympath, { 'encoding': 'utf8' });
    }
    catch (e) {
        console.log(e);
        errors.push({ line: 0, msg: "No symbol table generated, maybe segment overflow?" });
        return { errors: errors };
    }
    (0, builder_1.putWorkFile)(binpath, aout);
    (0, builder_1.putWorkFile)(lstpath, alst);
    (0, builder_1.putWorkFile)(sympath, asym);
    // return unchanged if no files changed
    // TODO: what if listing or symbols change?
    if (!(0, builder_1.anyTargetChanged)(step, [binpath /*, lstpath, sympath*/]))
        return;
    var symbolmap = parseSymbolMap(asym);
    // for bataribasic (TODO)
    if (step['bblines']) {
        var lst = listings[step.path];
        if (lst) {
            lst.asmlines = lst.lines;
            lst.text = alst;
            lst.lines = [];
        }
    }
    return {
        output: aout,
        listings: listings,
        errors: errors,
        symbolmap: symbolmap,
        origin: getMinListingOffset(listings),
    };
}
var wasiModule = null;
function assembleDASM2(step) {
    var errors = [];
    if (!wasiModule) {
        wasiModule = new WebAssembly.Module((0, wasmutils_1.loadWASMBinary)("dasm-wasisdk"));
    }
    var binpath = 'a.out';
    var lstpath = step.prefix + '.lst';
    var sympath = step.prefix + '.sym';
    var wasi = new wasishim_1.WASIRunner();
    wasi.initSync(wasiModule);
    for (var _i = 0, _a = step.files; _i < _a.length; _i++) {
        var file = _a[_i];
        wasi.fs.putFile("./" + file, builder_1.store.getFileData(file));
    }
    wasi.addPreopenDirectory(".");
    wasi.setArgs(['dasm', step.path, '-f3', "-l" + lstpath, "-s" + sympath]);
    try {
        wasi.run();
    }
    catch (e) {
        errors.push(e);
    }
    var stdout = wasi.fds[1].getBytesAsString();
    //const stderr = wasi.fds[2].getBytesAsString();
    var matcher = (0, listingutils_1.msvcErrorMatcher)(errors);
    var unresolved = {};
    for (var _b = 0, _c = stdout.split("\n"); _b < _c.length; _b++) {
        var line = _c[_b];
        matcher(line);
        var m = re_usl.exec(line);
        if (m) {
            unresolved[m[1]] = 0;
        }
    }
    var alst = wasi.fs.getFile("./" + lstpath).getBytesAsString();
    var listings = {};
    for (var _d = 0, _e = step.files; _d < _e.length; _d++) {
        var path = _e[_d];
        listings[path] = { lines: [] };
    }
    parseDASMListing(lstpath, alst, listings, errors, unresolved);
    if (errors.length) {
        return { errors: errors };
    }
    var asym = wasi.fs.getFile("./" + sympath).getBytesAsString();
    var symbolmap = parseSymbolMap(asym);
    var output = wasi.fs.getFile("./" + binpath).getBytes();
    return {
        output: output,
        errors: errors,
        listings: listings,
        symbolmap: symbolmap,
        origin: getMinListingOffset(listings),
    };
}

});


// ── tools/mcpp ──────────────────────────────────────────────────────────────────
__define("tools/mcpp", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.preprocessMCPP = preprocessMCPP;
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var platforms_1 = __require("platforms");
var wasmutils_1 = __require("wasmutils");
function makeCPPSafe(s) {
    return s.replace(/[^A-Za-z0-9_]/g, '_');
}
function preprocessMCPP(step, filesys) {
    (0, wasmutils_1.load)("mcpp");
    var platform = step.platform;
    var params = platforms_1.PLATFORM_PARAMS[(0, util_1.getBasePlatform)(platform)];
    if (!params)
        throw Error("Platform not supported: " + platform);
    // <stdin>:2: error: Can't open include file "foo.h"
    var errors = [];
    var match_fn = (0, listingutils_1.makeErrorMatcher)(errors, /<stdin>:(\d+): (.+)/, 1, 2, step.path);
    var MCPP = wasmutils_1.emglobal.mcpp({
        noInitialRun: true,
        noFSInit: true,
        print: wasmutils_1.print_fn,
        printErr: match_fn,
    });
    var FS = MCPP.FS;
    if (filesys)
        (0, wasmutils_1.setupFS)(FS, filesys);
    (0, builder_1.populateFiles)(step, FS, {
        mainFilePath: step.path,
        processFn: function (path, code) {
            if (typeof code === 'string') {
                code = (0, builder_1.processEmbedDirective)(code);
            }
            return code;
        }
    });
    (0, builder_1.populateExtraFiles)(step, FS, params.extra_compile_files);
    // TODO: make configurable by other compilers
    var arch = params.arch || 'z80';
    var args = [
        "-D", "__8BITWORKSHOP__",
        "-D", "__SDCC_" + arch,
        "-D", makeCPPSafe(platform.toUpperCase()),
        "-I", "/share/include",
        "-Q",
        step.path, "main.i"
    ];
    if (step.mainfile) {
        args.unshift.apply(args, ["-D", "__MAIN__"]);
    }
    var platform_def = platform.toUpperCase().replaceAll(/[^a-zA-Z0-9]/g, '_');
    args.unshift.apply(args, ["-D", "__PLATFORM_".concat(platform_def, "__")]);
    if (params.extra_preproc_args) {
        args.push.apply(args, params.extra_preproc_args);
    }
    (0, wasmutils_1.execMain)(step, MCPP, args);
    if (errors.length)
        return { errors: errors };
    var iout = FS.readFile("main.i", { encoding: 'utf8' });
    iout = iout.replace(/^#line /gm, '\n# ');
    try {
        var errout = FS.readFile("mcpp.err", { encoding: 'utf8' });
        if (errout.length) {
            // //main.c:2: error: Can't open include file "stdiosd.h"
            var errors = (0, listingutils_1.extractErrors)(/([^:]+):(\d+): (.+)/, errout.split("\n"), step.path, 2, 3, 1);
            if (errors.length == 0) {
                errors = (0, builder_1.errorResult)(errout).errors;
            }
            return { errors: errors };
        }
    }
    catch (e) {
        //
    }
    return { code: iout };
}

});


// ── tools/sdcc ──────────────────────────────────────────────────────────────────
__define("tools/sdcc", function(module, exports, __require) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleSDASZ80 = assembleSDASZ80;
exports.assembleSDASGB = assembleSDASGB;
exports.linkSDLDZ80 = linkSDLDZ80;
exports.compileSDCC = compileSDCC;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
var mcpp_1 = __require("tools/mcpp");
function hexToArray(s, ofs) {
    var buf = new ArrayBuffer(s.length / 2);
    var arr = new Uint8Array(buf);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = parseInt(s.slice(i * 2 + ofs, i * 2 + ofs + 2), 16);
    }
    return arr;
}
function parseIHX(ihx, rom_start, rom_size, errors) {
    var output = new Uint8Array(new ArrayBuffer(rom_size));
    var high_size = 0;
    for (var _i = 0, _a = ihx.split("\n"); _i < _a.length; _i++) {
        var s = _a[_i];
        if (s[0] == ':') {
            var arr = hexToArray(s, 1);
            var count = arr[0];
            var offset = (arr[1] << 8) + arr[2] - rom_start;
            var rectype = arr[3];
            //console.log(rectype,address.toString(16),count,arr);
            if (rectype == 0) {
                if (output[offset] !== 0) {
                    errors.push({ line: 0, msg: "IHX overlap offset 0x".concat((offset).toString(16)) });
                }
                for (var i = 0; i < count; i++) {
                    var b = arr[4 + i];
                    output[i + offset] = b;
                }
                if (i + offset > high_size)
                    high_size = i + offset;
            }
            else if (rectype == 1) {
                break;
            }
            else {
                console.log(s); // unknown record type
            }
        }
    }
    // TODO: return ROM anyway?
    if (high_size > rom_size) {
        //errors.push({line:0, msg:"ROM size too large: 0x" + high_size.toString(16) + " > 0x" + rom_size.toString(16)});
    }
    return output;
}
function errorMatcherSDASZ80(path, errors) {
    //?ASxxxx-Error-<o> in line 1 of main.asm null
    //              <o> .org in REL area or directive / mnemonic error
    // ?ASxxxx-Error-<q> in line 1627 of cosmic.asm
    //    <q> missing or improper operators, terminators, or delimiters
    var match_asm_re1 = / in line (\d+) of (\S+)/; // TODO
    var match_asm_re2 = / <\w> (.+)/; // TODO
    var errline = 0;
    var errpath = path;
    var match_asm_fn = function (s) {
        var m = match_asm_re1.exec(s);
        if (m) {
            errline = parseInt(m[1]);
            errpath = m[2];
        }
        else {
            m = match_asm_re2.exec(s);
            if (m) {
                errors.push({
                    line: errline,
                    path: errpath,
                    msg: m[1]
                });
            }
        }
    };
    return match_asm_fn;
}
function assembleSDASZ80(step) {
    (0, wasmutils_1.loadNative)('sdasz80');
    var objout, lstout, symout;
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.asm" });
    var objpath = step.prefix + ".rel";
    var lstpath = step.prefix + ".lst";
    if ((0, builder_1.staleFiles)(step, [objpath, lstpath])) {
        var match_asm_fn = errorMatcherSDASZ80(step.path, errors);
        var ASZ80 = wasmutils_1.emglobal.sdasz80({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('sdasz80'),
            noInitialRun: true,
            //logReadFiles:true,
            print: match_asm_fn,
            printErr: match_asm_fn,
        });
        var FS = ASZ80.FS;
        (0, builder_1.populateFiles)(step, FS);
        (0, wasmutils_1.execMain)(step, ASZ80, ['-plosgffwy', step.path]);
        if (errors.length) {
            return { errors: errors };
        }
        objout = FS.readFile(objpath, { encoding: 'utf8' });
        lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(objpath, objout);
        (0, builder_1.putWorkFile)(lstpath, lstout);
    }
    return {
        linktool: "sdldz80",
        files: [objpath, lstpath],
        args: [objpath]
    };
    //symout = FS.readFile("main.sym", {encoding:'utf8'});
}
function assembleSDASGB(step) {
    return __awaiter(this, void 0, void 0, function () {
        var objout, lstout, symout, errors, objpath, lstpath, match_asm_fn, ASZ80, FS;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, wasmutils_1.loadNative)('sdasgb');
                    errors = [];
                    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.asm" });
                    objpath = step.prefix + ".rel";
                    lstpath = step.prefix + ".lst";
                    if (!(0, builder_1.staleFiles)(step, [objpath, lstpath])) return [3 /*break*/, 2];
                    match_asm_fn = errorMatcherSDASZ80(step.path, errors);
                    return [4 /*yield*/, wasmutils_1.emglobal.sdasgb({
                            instantiateWasm: (0, wasmutils_1.moduleInstFn)('sdasgb'),
                            noInitialRun: true,
                            //logReadFiles:true,
                            print: match_asm_fn,
                            printErr: match_asm_fn,
                        })];
                case 1:
                    ASZ80 = _a.sent();
                    FS = ASZ80.FS;
                    (0, builder_1.populateFiles)(step, FS);
                    (0, wasmutils_1.execMain)(step, ASZ80, ['-plosgffwy', step.path]);
                    if (errors.length) {
                        return [2 /*return*/, { errors: errors }];
                    }
                    objout = FS.readFile(objpath, { encoding: 'utf8' });
                    lstout = FS.readFile(lstpath, { encoding: 'utf8' });
                    (0, builder_1.putWorkFile)(objpath, objout);
                    (0, builder_1.putWorkFile)(lstpath, lstout);
                    _a.label = 2;
                case 2: return [2 /*return*/, {
                        linktool: "sdldz80",
                        files: [objpath, lstpath],
                        args: [objpath]
                    }];
            }
        });
    });
}
function linkSDLDZ80(step) {
    (0, wasmutils_1.loadNative)("sdldz80");
    var arch = step.params.arch || 'z80';
    var errors = [];
    (0, builder_1.gatherFiles)(step);
    var binpath = "main.ihx";
    if ((0, builder_1.staleFiles)(step, [binpath])) {
        //?ASlink-Warning-Undefined Global '__divsint' referenced by module 'main'
        var match_aslink_re = /\?ASlink-(\w+)-(.+)/;
        var match_aslink_fn = function (s) {
            var matches = match_aslink_re.exec(s);
            if (matches) {
                errors.push({
                    line: 0,
                    msg: matches[2]
                });
            }
        };
        var params = step.params;
        var LDZ80 = wasmutils_1.emglobal.sdldz80({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('sdldz80'),
            noInitialRun: true,
            //logReadFiles:true,
            print: match_aslink_fn,
            printErr: match_aslink_fn,
        });
        var FS = LDZ80.FS;
        (0, wasmutils_1.setupFS)(FS, 'sdcc');
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.populateExtraFiles)(step, FS, params.extra_link_files);
        // TODO: coleco hack so that -u flag works
        if (step.platform.startsWith("coleco")) {
            FS.writeFile('crt0.rel', FS.readFile('/share/lib/coleco/crt0.rel', { encoding: 'utf8' }));
            FS.writeFile('crt0.lst', '\n'); // TODO: needed so -u flag works
        }
        var args = ['-mjwxyu',
            '-i', 'main.ihx',
            '-b', '_CODE=0x' + (params.codeseg_start || params.code_start).toString(16),
            '-b', '_DATA=0x' + params.data_start.toString(16),
            '-k', arch === 'z80' ? '/share/lib/z80' : '.', // sm83.lib copied to current (.) directory
            '-l', arch];
        if (params.extra_link_args)
            args.push.apply(args, params.extra_link_args);
        args.push.apply(args, step.args);
        //console.log(args);
        (0, wasmutils_1.execMain)(step, LDZ80, args);
        if (errors.length) {
            return { errors: errors };
        }
        var hexout = FS.readFile("main.ihx", { encoding: 'utf8' });
        var noiout = FS.readFile("main.noi", { encoding: 'utf8' });
        (0, builder_1.putWorkFile)("main.ihx", hexout);
        (0, builder_1.putWorkFile)("main.noi", noiout);
        // return unchanged if no files changed
        if (!(0, builder_1.anyTargetChanged)(step, ["main.ihx", "main.noi"]))
            return;
        // parse binary file
        var binout = parseIHX(hexout, params.rom_start !== undefined ? params.rom_start : params.code_start, params.rom_size, errors);
        if (errors.length) {
            return { errors: errors };
        }
        // parse listings
        var listings = {};
        for (var _i = 0, _a = step.files; _i < _a.length; _i++) {
            var fn = _a[_i];
            if (fn.endsWith('.lst')) {
                var rstout = FS.readFile(fn.replace('.lst', '.rst'), { encoding: 'utf8' });
                //   0000 21 02 00      [10]   52 	ld	hl, #2
                var asmlines = (0, listingutils_1.parseListing)(rstout, /^\s*([0-9A-F]{4,6})\s+([0-9A-F][0-9A-F r]*[0-9A-F])\s+\[([0-9 ]+)\]?\s+(\d+) (.*)/i, 4, 1, 2, 3);
                var srclines = (0, listingutils_1.parseSourceLines)(rstout, /^\s+\d+ ;<stdin>:(\d+):/i, /^\s*([0-9A-F]{4,6})/i);
                (0, builder_1.putWorkFile)(fn, rstout);
                // TODO: you have to get rid of all source lines to get asm listing
                listings[fn] = {
                    asmlines: srclines.length ? asmlines : null,
                    lines: srclines.length ? srclines : asmlines,
                    text: rstout
                };
            }
        }
        // parse symbol map
        var symbolmap = {};
        for (var _b = 0, _c = noiout.split("\n"); _b < _c.length; _b++) {
            var s = _c[_b];
            var toks = s.split(" ");
            if (toks[0] == 'DEF' && !toks[1].startsWith("A$")) {
                symbolmap[toks[1]] = parseInt(toks[2], 16);
            }
        }
        // build segment map
        var seg_re = /^s__(\w+)$/;
        var segments = [];
        // TODO: use stack params for stack segment
        for (var ident in symbolmap) {
            var m = seg_re.exec(ident);
            if (m) {
                var seg = m[1];
                var segstart = symbolmap[ident]; // s__SEG
                var segsize = symbolmap['l__' + seg]; // l__SEG
                if (segstart >= 0 && segsize > 0) {
                    var type = null;
                    if (['INITIALIZER', 'GSINIT', 'GSFINAL'].includes(seg))
                        type = 'rom';
                    else if (seg.startsWith('CODE'))
                        type = 'rom';
                    else if (['DATA', 'INITIALIZED'].includes(seg))
                        type = 'ram';
                    if (type == 'rom' || segstart > 0) // ignore HEADER0, CABS0, etc (TODO?)
                        segments.push({ name: seg, start: segstart, size: segsize, type: type });
                }
            }
        }
        // gameboy: compute checksum
        if (step.params.arch === 'gbz80') {
            var checksum = 0;
            for (var address = 0x0134; address <= 0x014C; address++) {
                checksum = checksum - binout[address] - 1;
            }
            binout[0x14D] = checksum & 0xff;
        }
        return {
            output: binout,
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}
function compileSDCC(step) {
    (0, builder_1.gatherFiles)(step, {
        mainFilePath: "main.c" // not used
    });
    var params = step.params;
    var isGBZ80 = params.arch === 'gbz80';
    var outpath = step.prefix + ".asm";
    if ((0, builder_1.staleFiles)(step, [outpath])) {
        var errors = [];
        (0, wasmutils_1.loadNative)('sdcc');
        var SDCC = wasmutils_1.emglobal.sdcc({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('sdcc'),
            noInitialRun: true,
            noFSInit: true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.msvcErrorMatcher)(errors),
            //TOTAL_MEMORY:256*1024*1024,
        });
        var FS = SDCC.FS;
        (0, builder_1.populateFiles)(step, FS);
        // load source file and preprocess
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        var preproc = (0, mcpp_1.preprocessMCPP)(step, 'sdcc');
        if (preproc.errors) {
            return { errors: preproc.errors };
        }
        else
            code = preproc.code;
        // pipe file to stdin
        (0, wasmutils_1.setupStdin)(FS, code);
        (0, wasmutils_1.setupFS)(FS, 'sdcc');
        var machineFlags = isGBZ80 ? '-mgbz80' : '-mz80';
        var args = ['--vc', '--std-sdcc99', machineFlags, //'-Wall',
            '--c1mode',
            //'--debug',
            //'-S', 'main.c',
            //'--asm=sdasz80',
            //'--reserve-regs-iy',
            '--less-pedantic',
            ///'--fomit-frame-pointer',
            //'--opt-code-speed',
            //'--max-allocs-per-node', '1000',
            //'--cyclomatic',
            //'--nooverlay',
            //'--nogcse',
            //'--nolabelopt',
            //'--noinvariant',
            //'--noinduction',
            //'--nojtbound',
            //'--noloopreverse',
            '-o', outpath];
        // if "#pragma opt_code" found do not disable optimziations
        if (!isGBZ80 && !/^\s*#pragma\s+opt_code/m.exec(code)) {
            args.push.apply(args, [
                '--oldralloc',
                '--no-peep',
                '--nolospre'
            ]);
        }
        if (params.extra_compile_args) {
            args.push.apply(args, params.extra_compile_args);
        }
        (0, wasmutils_1.execMain)(step, SDCC, args);
        // TODO: preprocessor errors w/ correct file
        if (errors.length /* && nwarnings < msvc_errors.length*/) {
            return { errors: errors };
        }
        // massage the asm output
        var asmout = FS.readFile(outpath, { encoding: 'utf8' });
        asmout = " .area _HOME\n .area _CODE\n .area _INITIALIZER\n .area _DATA\n .area _INITIALIZED\n .area _BSEG\n .area _BSS\n .area _HEAP\n" + asmout;
        (0, builder_1.putWorkFile)(outpath, asmout);
    }
    return {
        nexttool: isGBZ80 ? 'sdasgb' : 'sdasz80',
        path: outpath,
        args: [outpath],
        files: [outpath],
    };
}

});


// ── /tmp/8bitworkshop/gen/common/hdl/hdltypes ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/hdl/hdltypes", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HDLFile = void 0;
exports.isLogicType = isLogicType;
exports.isArrayType = isArrayType;
exports.hasDataType = hasDataType;
exports.isVarDecl = isVarDecl;
exports.isConstExpr = isConstExpr;
exports.isBigConstExpr = isBigConstExpr;
exports.isVarRef = isVarRef;
exports.isUnop = isUnop;
exports.isBinop = isBinop;
exports.isTriop = isTriop;
exports.isWhileop = isWhileop;
exports.isBlock = isBlock;
exports.isFuncCall = isFuncCall;
exports.isArrayItem = isArrayItem;
function isLogicType(arg) {
    return typeof arg.left === 'number' && typeof arg.right === 'number';
}
function isArrayType(arg) {
    return arg.subtype != null && arg.low != null && arg.high != null
        && typeof arg.low.cvalue === 'number' && typeof arg.high.cvalue === 'number';
}
var HDLFile = /** @class */ (function () {
    function HDLFile() {
    }
    return HDLFile;
}());
exports.HDLFile = HDLFile;
function hasDataType(arg) {
    return typeof arg.dtype === 'object';
}
function isVarDecl(arg) {
    return typeof arg.isParam !== 'undefined';
}
function isConstExpr(arg) {
    return typeof arg.cvalue === 'number';
}
function isBigConstExpr(arg) {
    return typeof arg.bigvalue === 'bigint';
}
function isVarRef(arg) {
    return arg.refname != null;
}
function isUnop(arg) {
    return arg.op != null && arg.left != null && arg.right == null;
}
function isBinop(arg) {
    return arg.op != null && arg.left != null && arg.right != null && arg.cond == null;
}
function isTriop(arg) {
    return arg.op != null && arg.cond != null;
}
function isWhileop(arg) {
    return arg.op === 'while' && arg.loopcond != null;
}
function isBlock(arg) {
    return arg.blocktype != null;
}
function isFuncCall(arg) {
    return typeof arg.funcname === 'string';
}
function isArrayItem(arg) {
    return typeof arg.index === 'number' && arg.expr != null;
}

});


// ── /tmp/8bitworkshop/gen/common/hdl/vxmlparser ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/hdl/vxmlparser", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerilogXMLParser = exports.CompileError = void 0;
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var hdltypes_1 = __require("/tmp/8bitworkshop/gen/common/hdl/hdltypes");
/**
 * Whaa?
 *
 * Each hierarchy takes (uint32[] -> uint32[])
 * - convert to/from js object
 * - JS or WASM
 * - Fixed-size packets
 * - state is another uint32[]
 * Find optimal packing of bits
 * Find clocks
 * Find pivots (reset, state) concat them together
 * Dependency cycles
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer
 */
var CompileError = /** @class */ (function (_super) {
    __extends(CompileError, _super);
    function CompileError($loc, msg) {
        var _this = _super.call(this, msg) || this;
        _this.$loc = $loc;
        Object.setPrototypeOf(_this, CompileError.prototype);
        return _this;
    }
    return CompileError;
}(Error));
exports.CompileError = CompileError;
var VerilogXMLParser = /** @class */ (function () {
    function VerilogXMLParser() {
        this.files = {};
        this.dtypes = {};
        this.modules = {};
        this.hierarchies = {};
        this.cur_deferred = [];
        // TODO: other types?
        this.dtypes['QData'] = { left: 63, right: 0, signed: false };
        this.dtypes['IData'] = { left: 31, right: 0, signed: false };
        this.dtypes['SData'] = { left: 15, right: 0, signed: false };
        this.dtypes['CData'] = { left: 7, right: 0, signed: false };
        this.dtypes['byte'] = { left: 7, right: 0, signed: true };
        this.dtypes['shortint'] = { left: 15, right: 0, signed: true };
        this.dtypes['int'] = { left: 31, right: 0, signed: true };
        this.dtypes['integer'] = { left: 31, right: 0, signed: true };
        this.dtypes['longint'] = { left: 63, right: 0, signed: true };
        this.dtypes['time'] = { left: 63, right: 0, signed: false };
    }
    VerilogXMLParser.prototype.defer = function (fn) {
        this.cur_deferred.unshift(fn);
    };
    VerilogXMLParser.prototype.defer2 = function (fn) {
        this.cur_deferred.push(fn);
    };
    VerilogXMLParser.prototype.run_deferred = function () {
        this.cur_deferred.forEach(function (fn) { return fn(); });
        this.cur_deferred = [];
    };
    VerilogXMLParser.prototype.name2js = function (s) {
        if (s == null)
            throw new CompileError(this.cur_loc, "no name");
        return s.replace(/[^a-z0-9_]/gi, '$');
    };
    VerilogXMLParser.prototype.findChildren = function (node, type, required) {
        var arr = node.children.filter(function (n) { return n.type == type; });
        if (arr.length == 0 && required)
            throw new CompileError(this.cur_loc, "no child of type ".concat(type));
        return arr;
    };
    VerilogXMLParser.prototype.parseSourceLocation = function (node) {
        var loc = node.attrs['loc'];
        if (loc) {
            if (loc == this.cur_loc_str) {
                return this.cur_loc; // cache last parsed $loc object
            }
            else {
                var _a = loc.split(','), fileid = _a[0], line = _a[1], col = _a[2], end_line = _a[3], end_col = _a[4];
                var $loc = {
                    hdlfile: this.files[fileid],
                    path: this.files[fileid].filename,
                    line: parseInt(line),
                    start: parseInt(col) - 1,
                    end_line: parseInt(end_line),
                    end: parseInt(end_col) - 1,
                };
                this.cur_loc = $loc;
                this.cur_loc_str = loc;
                return $loc;
            }
        }
        else {
            return null;
        }
    };
    VerilogXMLParser.prototype.open_module = function (node) {
        var module = {
            $loc: this.parseSourceLocation(node),
            name: node.attrs['name'],
            origName: node.attrs['origName'],
            blocks: [],
            instances: [],
            vardefs: {},
        };
        if (this.cur_module)
            throw new CompileError(this.cur_loc, "nested modules not supported");
        this.cur_module = module;
        return module;
    };
    VerilogXMLParser.prototype.deferDataType = function (node, def) {
        var _this = this;
        var dtype_id = node.attrs['dtype_id'];
        if (dtype_id != null) {
            this.defer(function () {
                def.dtype = _this.dtypes[dtype_id];
                if (!def.dtype) {
                    throw new CompileError(_this.cur_loc, "Unknown data type ".concat(dtype_id, " for ").concat(node.type));
                }
            });
        }
    };
    VerilogXMLParser.prototype.parseConstValue = function (s) {
        var re_const = /(\d+)'([s]?)h([0-9a-f]+)/i;
        var m = re_const.exec(s);
        if (m) {
            var numstr = m[3];
            if (numstr.length <= 8)
                return parseInt(numstr, 16);
            else
                return BigInt('0x' + numstr);
        }
        else {
            throw new CompileError(this.cur_loc, "could not parse constant \"".concat(s, "\""));
        }
    };
    VerilogXMLParser.prototype.resolveVar = function (s, mod) {
        var def = mod.vardefs[s];
        if (def == null)
            throw new CompileError(this.cur_loc, "could not resolve variable \"".concat(s, "\""));
        return def;
    };
    VerilogXMLParser.prototype.resolveModule = function (s) {
        var mod = this.modules[s];
        if (mod == null)
            throw new CompileError(this.cur_loc, "could not resolve module \"".concat(s, "\""));
        return mod;
    };
    //
    VerilogXMLParser.prototype.visit_verilator_xml = function (node) {
    };
    VerilogXMLParser.prototype.visit_package = function (node) {
    };
    VerilogXMLParser.prototype.visit_module = function (node) {
        var _this = this;
        this.findChildren(node, 'var', false).forEach(function (n) {
            if ((0, hdltypes_1.isVarDecl)(n.obj)) {
                _this.cur_module.vardefs[n.obj.name] = n.obj;
            }
        });
        this.modules[this.cur_module.name] = this.cur_module;
        this.cur_module = null;
    };
    VerilogXMLParser.prototype.visit_var = function (node) {
        var name = node.attrs['name'];
        name = this.name2js(name);
        var vardef = {
            $loc: this.parseSourceLocation(node),
            name: name,
            origName: node.attrs['origName'],
            isInput: node.attrs['dir'] == 'input',
            isOutput: node.attrs['dir'] == 'output',
            isParam: node.attrs['param'] == 'true',
            dtype: null,
        };
        this.deferDataType(node, vardef);
        var const_nodes = this.findChildren(node, 'const', false);
        if (const_nodes.length) {
            vardef.constValue = const_nodes[0].obj;
        }
        var init_nodes = this.findChildren(node, 'initarray', false);
        if (init_nodes.length) {
            vardef.initValue = init_nodes[0].obj;
        }
        return vardef;
    };
    VerilogXMLParser.prototype.visit_const = function (node) {
        var name = node.attrs['name'];
        var cvalue = this.parseConstValue(name);
        var constdef = {
            $loc: this.parseSourceLocation(node),
            dtype: null,
            cvalue: typeof cvalue === 'number' ? cvalue : null,
            bigvalue: typeof cvalue === 'bigint' ? cvalue : null,
        };
        this.deferDataType(node, constdef);
        return constdef;
    };
    VerilogXMLParser.prototype.visit_varref = function (node) {
        var name = node.attrs['name'];
        name = this.name2js(name);
        var varref = {
            $loc: this.parseSourceLocation(node),
            dtype: null,
            refname: name
        };
        this.deferDataType(node, varref);
        var mod = this.cur_module;
        /*
        this.defer2(() => {
            varref.vardef = this.resolveVar(name, mod);
        });
        */
        return varref;
    };
    VerilogXMLParser.prototype.visit_sentree = function (node) {
        // TODO
    };
    VerilogXMLParser.prototype.visit_always = function (node) {
        // TODO
        var sentree;
        var expr;
        if (node.children.length == 2) {
            sentree = node.children[0].obj;
            expr = node.children[1].obj;
            // TODO: check sentree
        }
        else {
            sentree = null;
            expr = node.children[0].obj;
        }
        var always = {
            $loc: this.parseSourceLocation(node),
            blocktype: node.type,
            name: null,
            senlist: sentree,
            exprs: [expr],
        };
        this.cur_module.blocks.push(always);
        return always;
    };
    VerilogXMLParser.prototype.visit_begin = function (node) {
        var exprs = [];
        node.children.forEach(function (n) { return exprs.push(n.obj); });
        return {
            $loc: this.parseSourceLocation(node),
            blocktype: node.type,
            name: node.attrs['name'],
            exprs: exprs,
        };
    };
    VerilogXMLParser.prototype.visit_initarray = function (node) {
        return this.visit_begin(node);
    };
    VerilogXMLParser.prototype.visit_inititem = function (node) {
        this.expectChildren(node, 1, 1);
        return {
            index: parseInt(node.attrs['index']),
            expr: node.children[0].obj
        };
    };
    VerilogXMLParser.prototype.visit_cfunc = function (node) {
        if (this.cur_module == null) { // TODO?
            //console.log('no module open, skipping', node);
            return;
        }
        var block = this.visit_begin(node);
        block.exprs = [];
        node.children.forEach(function (n) { return block.exprs.push(n.obj); });
        this.cur_module.blocks.push(block);
        return block;
    };
    VerilogXMLParser.prototype.visit_cuse = function (node) {
    };
    VerilogXMLParser.prototype.visit_instance = function (node) {
        var _this = this;
        var instance = {
            $loc: this.parseSourceLocation(node),
            name: node.attrs['name'],
            origName: node.attrs['origName'],
            ports: [],
            module: null,
        };
        node.children.forEach(function (child) {
            instance.ports.push(child.obj);
        });
        this.cur_module.instances.push(instance);
        this.defer(function () {
            instance.module = _this.resolveModule(node.attrs['defName']);
        });
        return instance;
    };
    VerilogXMLParser.prototype.visit_iface = function (node) {
        throw new CompileError(this.cur_loc, "interfaces not supported");
    };
    VerilogXMLParser.prototype.visit_intfref = function (node) {
        throw new CompileError(this.cur_loc, "interfaces not supported");
    };
    VerilogXMLParser.prototype.visit_port = function (node) {
        this.expectChildren(node, 1, 1);
        var varref = {
            $loc: this.parseSourceLocation(node),
            name: node.attrs['name'],
            expr: node.children[0].obj
        };
        return varref;
    };
    VerilogXMLParser.prototype.visit_netlist = function (node) {
    };
    VerilogXMLParser.prototype.visit_files = function (node) {
    };
    VerilogXMLParser.prototype.visit_module_files = function (node) {
        var _this = this;
        node.children.forEach(function (n) {
            if (n.obj) {
                var file = _this.files[n.obj.id];
                if (file)
                    file.isModule = true;
            }
        });
    };
    VerilogXMLParser.prototype.visit_file = function (node) {
        return this.visit_file_or_module(node, false);
    };
    // TODO
    VerilogXMLParser.prototype.visit_scope = function (node) {
    };
    VerilogXMLParser.prototype.visit_topscope = function (node) {
    };
    VerilogXMLParser.prototype.visit_file_or_module = function (node, isModule) {
        var file = {
            id: node.attrs['id'],
            filename: node.attrs['filename'],
            isModule: isModule,
        };
        this.files[file.id] = file;
        return file;
    };
    VerilogXMLParser.prototype.visit_cells = function (node) {
        this.expectChildren(node, 1, 9999);
        var hier = node.children[0].obj;
        if (hier != null) {
            var hiername = hier.name;
            this.hierarchies[hiername] = hier;
        }
    };
    VerilogXMLParser.prototype.visit_cell = function (node) {
        var _this = this;
        var hier = {
            $loc: this.parseSourceLocation(node),
            name: node.attrs['name'],
            module: null,
            parent: null,
            children: node.children.map(function (n) { return n.obj; }),
        };
        if (node.children.length > 0)
            throw new CompileError(this.cur_loc, "multiple non-flattened modules not yet supported");
        node.children.forEach(function (n) { return n.obj.parent = hier; });
        this.defer(function () {
            hier.module = _this.resolveModule(node.attrs['submodname']);
        });
        return hier;
    };
    VerilogXMLParser.prototype.visit_basicdtype = function (node) {
        var id = node.attrs['id'];
        var dtype;
        var dtypename = node.attrs['name'];
        switch (dtypename) {
            case 'logic':
            case 'integer': // TODO?
            case 'bit':
                var dlogic = {
                    $loc: this.parseSourceLocation(node),
                    left: parseInt(node.attrs['left'] || "0"),
                    right: parseInt(node.attrs['right'] || "0"),
                    signed: node.attrs['signed'] == 'true'
                };
                dtype = dlogic;
                break;
            case 'string':
                var dstring = {
                    $loc: this.parseSourceLocation(node),
                    jstype: 'string'
                };
                dtype = dstring;
                break;
            default:
                dtype = this.dtypes[dtypename];
                if (dtype == null) {
                    throw new CompileError(this.cur_loc, "unknown data type ".concat(dtypename));
                }
        }
        this.dtypes[id] = dtype;
        return dtype;
    };
    VerilogXMLParser.prototype.visit_refdtype = function (node) {
    };
    VerilogXMLParser.prototype.visit_enumdtype = function (node) {
    };
    VerilogXMLParser.prototype.visit_enumitem = function (node) {
    };
    VerilogXMLParser.prototype.visit_packarraydtype = function (node) {
        // TODO: packed?
        return this.visit_unpackarraydtype(node);
    };
    VerilogXMLParser.prototype.visit_memberdtype = function (node) {
        throw new CompileError(null, "structs not supported");
    };
    VerilogXMLParser.prototype.visit_constdtype = function (node) {
        // TODO? throw new CompileError(null, `constant data types not supported`);
    };
    VerilogXMLParser.prototype.visit_paramtypedtype = function (node) {
        // TODO? throw new CompileError(null, `constant data types not supported`);
    };
    VerilogXMLParser.prototype.visit_unpackarraydtype = function (node) {
        var _this = this;
        var id = node.attrs['id'];
        var sub_dtype_id = node.attrs['sub_dtype_id'];
        var range = node.children[0].obj;
        if ((0, hdltypes_1.isConstExpr)(range.left) && (0, hdltypes_1.isConstExpr)(range.right)) {
            var dtype = {
                $loc: this.parseSourceLocation(node),
                subtype: null,
                low: range.left,
                high: range.right,
            };
            this.dtypes[id] = dtype;
            this.defer(function () {
                dtype.subtype = _this.dtypes[sub_dtype_id];
                if (!dtype.subtype)
                    throw new CompileError(_this.cur_loc, "Unknown data type ".concat(sub_dtype_id, " for array"));
            });
            return dtype;
        }
        else {
            throw new CompileError(this.cur_loc, "could not parse constant exprs in array");
        }
    };
    VerilogXMLParser.prototype.visit_senitem = function (node) {
        var edgeType = node.attrs['edgeType'];
        if (edgeType != "POS" && edgeType != "NEG")
            throw new CompileError(this.cur_loc, "POS/NEG required");
        return {
            $loc: this.parseSourceLocation(node),
            edgeType: edgeType,
            expr: node.obj
        };
    };
    VerilogXMLParser.prototype.visit_text = function (node) {
    };
    VerilogXMLParser.prototype.visit_cstmt = function (node) {
    };
    VerilogXMLParser.prototype.visit_cfile = function (node) {
    };
    VerilogXMLParser.prototype.visit_typetable = function (node) {
    };
    VerilogXMLParser.prototype.visit_constpool = function (node) {
    };
    VerilogXMLParser.prototype.visit_comment = function (node) {
    };
    VerilogXMLParser.prototype.expectChildren = function (node, low, high) {
        if (node.children.length < low || node.children.length > high)
            throw new CompileError(this.cur_loc, "expected between ".concat(low, " and ").concat(high, " children"));
    };
    VerilogXMLParser.prototype.__visit_unop = function (node) {
        this.expectChildren(node, 1, 1);
        var expr = {
            $loc: this.parseSourceLocation(node),
            op: node.type,
            dtype: null,
            left: node.children[0].obj,
        };
        this.deferDataType(node, expr);
        return expr;
    };
    VerilogXMLParser.prototype.visit_extend = function (node) {
        var unop = this.__visit_unop(node);
        unop.width = parseInt(node.attrs['width']);
        unop.widthminv = parseInt(node.attrs['widthminv']);
        if (unop.width != 32)
            throw new CompileError(this.cur_loc, "extends width ".concat(unop.width, " != 32"));
        return unop;
    };
    VerilogXMLParser.prototype.visit_extends = function (node) {
        return this.visit_extend(node);
    };
    VerilogXMLParser.prototype.__visit_binop = function (node) {
        this.expectChildren(node, 2, 2);
        var expr = {
            $loc: this.parseSourceLocation(node),
            op: node.type,
            dtype: null,
            left: node.children[0].obj,
            right: node.children[1].obj,
        };
        this.deferDataType(node, expr);
        return expr;
    };
    VerilogXMLParser.prototype.visit_if = function (node) {
        this.expectChildren(node, 2, 3);
        var expr = {
            $loc: this.parseSourceLocation(node),
            op: 'if',
            dtype: null,
            cond: node.children[0].obj,
            left: node.children[1].obj,
            right: node.children[2] && node.children[2].obj,
        };
        return expr;
    };
    // while and for loops
    VerilogXMLParser.prototype.visit_while = function (node) {
        this.expectChildren(node, 2, 4);
        var expr = {
            $loc: this.parseSourceLocation(node),
            op: 'while',
            dtype: null,
            precond: node.children[0].obj,
            loopcond: node.children[1].obj,
            body: node.children[2] && node.children[2].obj,
            inc: node.children[3] && node.children[3].obj,
        };
        return expr;
    };
    VerilogXMLParser.prototype.__visit_triop = function (node) {
        this.expectChildren(node, 3, 3);
        var expr = {
            $loc: this.parseSourceLocation(node),
            op: node.type,
            dtype: null,
            cond: node.children[0].obj,
            left: node.children[1].obj,
            right: node.children[2].obj,
        };
        this.deferDataType(node, expr);
        return expr;
    };
    VerilogXMLParser.prototype.__visit_func = function (node) {
        var expr = {
            $loc: this.parseSourceLocation(node),
            dtype: null,
            funcname: node.attrs['func'] || ('$' + node.type),
            args: node.children.map(function (n) { return n.obj; })
        };
        this.deferDataType(node, expr);
        return expr;
    };
    VerilogXMLParser.prototype.visit_not = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_negate = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_redand = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_redor = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_redxor = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_initial = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_ccast = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_creset = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_creturn = function (node) { return this.__visit_unop(node); };
    VerilogXMLParser.prototype.visit_contassign = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_assigndly = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_assignpre = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_assignpost = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_assign = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_arraysel = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_wordsel = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_eq = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_neq = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_lte = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_gte = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_lt = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_gt = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_and = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_or = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_xor = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_add = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_sub = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_concat = function (node) { return this.__visit_binop(node); }; // TODO?
    VerilogXMLParser.prototype.visit_shiftl = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_shiftr = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_shiftrs = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_mul = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_div = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_moddiv = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_muls = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_divs = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_moddivs = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_gts = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_lts = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_gtes = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_ltes = function (node) { return this.__visit_binop(node); };
    // TODO: more?
    VerilogXMLParser.prototype.visit_range = function (node) { return this.__visit_binop(node); };
    VerilogXMLParser.prototype.visit_cond = function (node) { return this.__visit_triop(node); };
    VerilogXMLParser.prototype.visit_condbound = function (node) { return this.__visit_triop(node); };
    VerilogXMLParser.prototype.visit_sel = function (node) { return this.__visit_triop(node); };
    VerilogXMLParser.prototype.visit_changedet = function (node) {
        if (node.children.length == 0)
            return null; //{ op: "changedet", dtype:null, left:null, right:null }
        else
            return this.__visit_binop(node);
    };
    VerilogXMLParser.prototype.visit_ccall = function (node) { return this.__visit_func(node); };
    VerilogXMLParser.prototype.visit_finish = function (node) { return this.__visit_func(node); };
    VerilogXMLParser.prototype.visit_stop = function (node) { return this.__visit_func(node); };
    VerilogXMLParser.prototype.visit_rand = function (node) { return this.__visit_func(node); };
    VerilogXMLParser.prototype.visit_time = function (node) { return this.__visit_func(node); };
    VerilogXMLParser.prototype.visit_display = function (node) { return null; };
    VerilogXMLParser.prototype.visit_sformatf = function (node) { return null; };
    VerilogXMLParser.prototype.visit_scopename = function (node) { return null; };
    VerilogXMLParser.prototype.visit_readmem = function (node) { return this.__visit_func(node); };
    //
    VerilogXMLParser.prototype.xml_open = function (node) {
        this.cur_node = node;
        var method = this["open_".concat(node.type)];
        if (method) {
            return method.bind(this)(node);
        }
    };
    VerilogXMLParser.prototype.xml_close = function (node) {
        this.cur_node = node;
        var method = this["visit_".concat(node.type)];
        if (method) {
            return method.bind(this)(node);
        }
        else {
            throw new CompileError(this.cur_loc, "no visitor for ".concat(node.type));
        }
    };
    VerilogXMLParser.prototype.parse = function (xmls) {
        (0, util_1.parseXMLPoorly)(xmls, this.xml_open.bind(this), this.xml_close.bind(this));
        this.cur_node = null;
        this.run_deferred();
    };
    return VerilogXMLParser;
}());
exports.VerilogXMLParser = VerilogXMLParser;

});


// ── tools/verilog ──────────────────────────────────────────────────────────────────
__define("tools/verilog", function(module, exports, __require) {
"use strict";
// TODO: must be a better way to do all this
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileJSASMStep = compileJSASMStep;
exports.compileVerilator = compileVerilator;
exports.compileYosys = compileYosys;
exports.compileSilice = compileSilice;
var assembler_1 = __require("assembler");
var vxmlparser = __importStar(__require("/tmp/8bitworkshop/gen/common/hdl/vxmlparser"));
var wasmutils_1 = __require("wasmutils");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
function detectModuleName(code) {
    var m = /^\s*module\s+(\w+_top)\b/m.exec(code)
        || /^\s*module\s+(top|t)\b/m.exec(code)
        || /^\s*module\s+(\w+)\b/m.exec(code);
    return m ? m[1] : null;
}
function detectTopModuleName(code) {
    var topmod = detectModuleName(code) || "top";
    var m = /^\s*module\s+(\w+?_top)/m.exec(code);
    if (m && m[1])
        topmod = m[1];
    return topmod;
}
// cached stuff (TODO)
var jsasm_module_top;
var jsasm_module_output;
var jsasm_module_key;
function compileJSASM(asmcode, platform, options, is_inline) {
    var asm = new assembler_1.Assembler(null);
    var includes = [];
    asm.loadJSON = function (filename) {
        var jsontext = (0, builder_1.getWorkFileAsString)(filename);
        if (!jsontext)
            throw Error("could not load " + filename);
        return JSON.parse(jsontext);
    };
    asm.loadInclude = function (filename) {
        if (!filename.startsWith('"') || !filename.endsWith('"'))
            return 'Expected filename in "double quotes"';
        filename = filename.substr(1, filename.length - 2);
        includes.push(filename);
    };
    var loaded_module = false;
    asm.loadModule = function (top_module) {
        // compile last file in list
        loaded_module = true;
        var key = top_module + '/' + includes;
        if (jsasm_module_key != key) {
            jsasm_module_key = key;
            jsasm_module_output = null;
        }
        jsasm_module_top = top_module;
        var main_filename = includes[includes.length - 1];
        // TODO: take out .asm dependency
        var voutput = compileVerilator({ platform: platform, files: includes, path: main_filename, tool: 'verilator' });
        if (voutput)
            jsasm_module_output = voutput;
        return null; // no error
    };
    var result = asm.assembleFile(asmcode);
    if (loaded_module && jsasm_module_output) {
        // errors? return them
        if (jsasm_module_output.errors && jsasm_module_output.errors.length)
            return jsasm_module_output;
        // return program ROM array
        var asmout = result.output;
        // TODO: unify
        result.output = jsasm_module_output.output;
        // TODO: typecheck this garbage
        result.output.program_rom = asmout;
        // TODO: not cpu_platform__DOT__program_rom anymore, make const
        result.output.program_rom_variable = jsasm_module_top + "$program_rom";
        result.listings = {};
        result.listings[options.path] = { lines: result.lines };
        return result;
    }
    else {
        return result;
    }
}
function compileJSASMStep(step) {
    (0, builder_1.gatherFiles)(step);
    var code = (0, builder_1.getWorkFileAsString)(step.path);
    var platform = step.platform || 'verilog';
    return compileJSASM(code, platform, step, false);
}
function compileInlineASM(code, platform, options, errors, asmlines) {
    code = code.replace(/__asm\b([\s\S]+?)\b__endasm\b/g, function (s, asmcode, index) {
        var firstline = code.substr(0, index).match(/\n/g).length;
        var asmout = compileJSASM(asmcode, platform, options, true);
        if (asmout.errors && asmout.errors.length) {
            for (var i = 0; i < asmout.errors.length; i++) {
                asmout.errors[i].line += firstline;
                errors.push(asmout.errors[i]);
            }
            return '`error "inline assembly failed"';
        }
        else if (asmout.output) {
            var s_1 = "";
            var out = asmout.output;
            for (var i = 0; i < out.length; i++) {
                if (i > 0) {
                    s_1 += ",";
                    if ((i & 0xff) == 0)
                        s_1 += "\n";
                }
                s_1 += 0 | out[i];
            }
            if (asmlines) {
                var al = asmout.lines;
                for (var i = 0; i < al.length; i++) {
                    al[i].line += firstline;
                    asmlines.push(al[i]);
                }
            }
            return s_1;
        }
    });
    return code;
}
function compileVerilator(step) {
    (0, wasmutils_1.loadNative)("verilator_bin");
    var platform = step.platform || 'verilog';
    var errors = [];
    (0, builder_1.gatherFiles)(step);
    // compile verilog if files are stale
    if ((0, builder_1.staleFiles)(step, [xmlPath])) {
        // TODO: %Error: Specified --top-module 'ALU' isn't at the top level, it's under another cell 'cpu'
        // TODO: ... Use "/* verilator lint_off BLKSEQ */" and lint_on around source to disable this message.
        var match_fn = (0, listingutils_1.makeErrorMatcher)(errors, /%(.+?): (.+?):(\d+)?[:]?\s*(.+)/i, 3, 4, step.path, 2);
        var verilator_mod = wasmutils_1.emglobal.verilator_bin({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('verilator_bin'),
            noInitialRun: true,
            noExitRuntime: true,
            print: wasmutils_1.print_fn,
            printErr: match_fn,
            wasmMemory: (0, wasmutils_1.getWASMMemory)(), // reuse memory
            //INITIAL_MEMORY:256*1024*1024,
        });
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        var topmod = detectTopModuleName(code);
        var FS = verilator_mod.FS;
        var listings = {};
        // process inline assembly, add listings where found
        (0, builder_1.populateFiles)(step, FS, {
            mainFilePath: step.path,
            processFn: function (path, code) {
                if (typeof code === 'string') {
                    var asmlines = [];
                    code = compileInlineASM(code, platform, step, errors, asmlines);
                    if (asmlines.length) {
                        listings[path] = { lines: asmlines };
                    }
                }
                return code;
            }
        });
        (0, builder_1.starttime)();
        var xmlPath = "obj_dir/V".concat(topmod, ".xml");
        try {
            var args = ["--cc", "-O3",
                "-DEXT_INLINE_ASM", "-DTOPMOD__" + topmod, "-D__8BITWORKSHOP__",
                "-Wall",
                "-Wno-DECLFILENAME", "-Wno-UNUSED", "-Wno-EOFNEWLINE", "-Wno-PROCASSWIRE",
                "--x-assign", "fast", "--noassert", "--pins-sc-biguint",
                "--debug-check", // for XML output
                "--top-module", topmod, step.path];
            (0, wasmutils_1.execMain)(step, verilator_mod, args);
        }
        catch (e) {
            console.log(e);
            errors.push({ line: 0, msg: "Compiler internal error: " + e });
        }
        (0, builder_1.endtime)("compile");
        // remove boring errors
        errors = errors.filter(function (e) { return !/Exiting due to \d+/.exec(e.msg); }, errors);
        errors = errors.filter(function (e) { return !/Use ["][/][*]/.exec(e.msg); }, errors);
        if (errors.length) {
            return { errors: errors };
        }
        (0, builder_1.starttime)();
        var xmlParser = new vxmlparser.VerilogXMLParser();
        try {
            var xmlContent = FS.readFile(xmlPath, { encoding: 'utf8' });
            var xmlScrubbed = xmlContent.replace(/ fl=".+?" loc=".+?"/g, '');
            // TODO: this squelches the .asm listing
            //listings[step.prefix + '.xml'] = {lines:[],text:xmlContent};
            (0, builder_1.putWorkFile)(xmlPath, xmlScrubbed); // don't detect changes in source position
            if (!(0, builder_1.anyTargetChanged)(step, [xmlPath]))
                return;
            xmlParser.parse(xmlContent);
        }
        catch (e) {
            console.log(e, e.stack);
            if (e.$loc != null) {
                var $loc = e.$loc;
                errors.push({ msg: "" + e, path: $loc.path, line: $loc.line });
            }
            else {
                errors.push({ line: 0, msg: "" + e });
            }
            return { errors: errors, listings: listings };
        }
        finally {
            (0, builder_1.endtime)("parse");
        }
        return {
            output: xmlParser,
            errors: errors,
            listings: listings,
        };
    }
}
// TODO: test
function compileYosys(step) {
    (0, wasmutils_1.loadNative)("yosys");
    var code = step.code;
    var errors = [];
    var match_fn = (0, listingutils_1.makeErrorMatcher)(errors, /ERROR: (.+?) in line (.+?[.]v):(\d+)[: ]+(.+)/i, 3, 4, step.path);
    (0, builder_1.starttime)();
    var yosys_mod = wasmutils_1.emglobal.yosys({
        instantiateWasm: (0, wasmutils_1.moduleInstFn)('yosys'),
        noInitialRun: true,
        print: wasmutils_1.print_fn,
        printErr: match_fn,
    });
    (0, builder_1.endtime)("create module");
    var topmod = detectTopModuleName(code);
    var FS = yosys_mod.FS;
    FS.writeFile(topmod + ".v", code);
    (0, builder_1.starttime)();
    try {
        (0, wasmutils_1.execMain)(step, yosys_mod, ["-q", "-o", topmod + ".json", "-S", topmod + ".v"]);
    }
    catch (e) {
        console.log(e);
        (0, builder_1.endtime)("compile");
        return { errors: errors };
    }
    (0, builder_1.endtime)("compile");
    //TODO: filename in errors
    if (errors.length)
        return { errors: errors };
    try {
        var json_file = FS.readFile(topmod + ".json", { encoding: 'utf8' });
        var json = JSON.parse(json_file);
        console.log(json);
        return { output: json, errors: errors }; // TODO
    }
    catch (e) {
        console.log(e);
        return { errors: errors };
    }
}
function compileSilice(step) {
    (0, wasmutils_1.loadNative)("silice");
    var params = step.params;
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.ice" });
    var destpath = step.prefix + '.v';
    var errors = [];
    var errfile;
    var errline;
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        //[preprocessor] 97]  attempt to concatenate a nil value (global 'addrW')
        var match_fn = function (s) {
            s = s.replaceAll(/\x1b\[\d+\w/g, '');
            var mf = /file:\s*(\w+)/.exec(s);
            var ml = /line:\s+(\d+)/.exec(s);
            var preproc = /\[preprocessor\] (\d+)\] (.+)/.exec(s);
            if (mf)
                errfile = mf[1];
            else if (ml)
                errline = parseInt(ml[1]);
            else if (preproc) {
                errors.push({ path: step.path, line: parseInt(preproc[1]), msg: preproc[2] });
            }
            else if (errfile && errline && s.length > 1) {
                if (s.length > 2) {
                    errors.push({ path: errfile + ".ice", line: errline, msg: s });
                }
                else {
                    errfile = null;
                    errline = null;
                }
            }
            else
                console.log(s);
        };
        var silice = wasmutils_1.emglobal.silice({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('silice'),
            noInitialRun: true,
            print: match_fn,
            printErr: match_fn,
        });
        var FS = silice.FS;
        (0, wasmutils_1.setupFS)(FS, 'Silice');
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.populateExtraFiles)(step, FS, params.extra_compile_files);
        var FWDIR = '/share/frameworks';
        var args = [
            '-D', 'NTSC=1',
            '--frameworks_dir', FWDIR,
            '-f',
            "/8bitworkshop.v",
            '-o', destpath,
            step.path
        ];
        (0, wasmutils_1.execMain)(step, silice, args);
        if (errors.length)
            return { errors: errors };
        var vout = FS.readFile(destpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(destpath, vout);
    }
    return {
        nexttool: "verilator",
        path: destpath,
        args: [destpath],
        files: [destpath],
    };
}

});


// ── tools/m6809 ──────────────────────────────────────────────────────────────────
__define("tools/m6809", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleXASM6809 = assembleXASM6809;
exports.compileCMOC = compileCMOC;
exports.assembleLWASM = assembleLWASM;
exports.linkLWLINK = linkLWLINK;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
var mcpp_1 = __require("tools/mcpp");
// http://datapipe-blackbeltsystems.com/windows/flex/asm09.html
function assembleXASM6809(step) {
    (0, wasmutils_1.load)("xasm6809");
    var alst = "";
    var lasterror = null;
    var errors = [];
    function match_fn(s) {
        alst += s;
        alst += "\n";
        if (lasterror) {
            var line = parseInt(s.slice(0, 5)) || 0;
            errors.push({
                line: line,
                msg: lasterror
            });
            lasterror = null;
        }
        else if (s.startsWith("***** ")) {
            lasterror = s.slice(6);
        }
    }
    var Module = wasmutils_1.emglobal.xasm6809({
        noInitialRun: true,
        //logReadFiles:true,
        print: match_fn,
        printErr: wasmutils_1.print_fn
    });
    var FS = Module.FS;
    //setupFS(FS);
    (0, builder_1.populateFiles)(step, FS, {
        mainFilePath: 'main.asm'
    });
    var binpath = step.prefix + '.bin';
    var lstpath = step.prefix + '.lst'; // in stdout
    (0, wasmutils_1.execMain)(step, Module, ["-c", "-l", "-s", "-y", "-o=" + binpath, step.path]);
    if (errors.length)
        return { errors: errors };
    var aout = FS.readFile(binpath, { encoding: 'binary' });
    if (aout.length == 0) {
        errors.push({ line: 0, msg: "Empty output file" });
        return { errors: errors };
    }
    (0, builder_1.putWorkFile)(binpath, aout);
    (0, builder_1.putWorkFile)(lstpath, alst);
    // TODO: symbol map
    //mond09     0000     
    var symbolmap = {};
    //00005  W 0003 [ 8] A6890011            lda   >PALETTE,x
    //00012    0011      0C0203              fcb   12,2,3
    var asmlines = (0, listingutils_1.parseListing)(alst, /^\s*([0-9]+) .+ ([0-9A-F]+)\s+\[([0-9 ]+)\]\s+([0-9A-F]+) (.*)/i, 1, 2, 4, 3);
    var listings = {};
    listings[step.prefix + '.lst'] = { lines: asmlines, text: alst };
    return {
        output: aout,
        listings: listings,
        errors: errors,
        symbolmap: symbolmap,
    };
}
function compileCMOC(step) {
    (0, wasmutils_1.loadNative)("cmoc");
    var params = step.params;
    // stderr
    var re_err1 = /^[/]*([^:]*):(\d+): (.+)$/;
    var errors = [];
    var errline = 0;
    function match_fn(s) {
        var matches = re_err1.exec(s);
        if (matches) {
            errors.push({
                line: parseInt(matches[2]),
                msg: matches[3],
                path: matches[1] || step.path
            });
        }
        else {
            console.log(s);
        }
    }
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
    var destpath = step.prefix + '.s';
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var args = ['-S', '-Werror', '-V',
            '-I/share/include',
            '-I.',
            step.path];
        var CMOC = wasmutils_1.emglobal.cmoc({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('cmoc'),
            noInitialRun: true,
            //logReadFiles:true,
            print: match_fn,
            printErr: match_fn,
        });
        // load source file and preprocess
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        var preproc = (0, mcpp_1.preprocessMCPP)(step, null);
        if (preproc.errors) {
            return { errors: preproc.errors };
        }
        else
            code = preproc.code;
        // set up filesystem
        var FS = CMOC.FS;
        //setupFS(FS, '65-'+getRootBasePlatform(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        FS.writeFile(step.path, code);
        (0, builder_1.fixParamsWithDefines)(step.path, params);
        if (params.extra_compile_args) {
            args.unshift.apply(args, params.extra_compile_args);
        }
        (0, wasmutils_1.execMain)(step, CMOC, args);
        if (errors.length)
            return { errors: errors };
        var asmout = FS.readFile(destpath, { encoding: 'utf8' });
        if (step.params.set_stack_end)
            asmout = asmout.replace('stack space in bytes', "\n lds #".concat(step.params.set_stack_end, "\n"));
        (0, builder_1.putWorkFile)(destpath, asmout);
    }
    return {
        nexttool: "lwasm",
        path: destpath,
        args: [destpath],
        files: [destpath],
    };
}
function assembleLWASM(step) {
    (0, wasmutils_1.loadNative)("lwasm");
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.s" });
    var objpath = step.prefix + ".o";
    var lstpath = step.prefix + ".lst";
    var isRaw = step.path.endsWith('.asm');
    if ((0, builder_1.staleFiles)(step, [objpath, lstpath])) {
        var objout, lstout;
        var args = ['-9', '-I/share/asminc', '-o' + objpath, '-l' + lstpath, step.path];
        args.push(isRaw ? '-r' : '--obj');
        var LWASM = wasmutils_1.emglobal.lwasm({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('lwasm'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.msvcErrorMatcher)(errors),
        });
        var FS = LWASM.FS;
        //setupFS(FS, '65-'+getRootBasePlatform(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.fixParamsWithDefines)(step.path, step.params);
        (0, wasmutils_1.execMain)(step, LWASM, args);
        if (errors.length)
            return { errors: errors };
        objout = FS.readFile(objpath, { encoding: 'binary' });
        lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(objpath, objout);
        (0, builder_1.putWorkFile)(lstpath, lstout);
        if (isRaw) {
            return {
                output: objout
            };
        }
    }
    return {
        linktool: "lwlink",
        files: [objpath, lstpath],
        args: [objpath]
    };
}
function linkLWLINK(step) {
    (0, wasmutils_1.loadNative)("lwlink");
    var params = step.params;
    (0, builder_1.gatherFiles)(step);
    var binpath = "main";
    if ((0, builder_1.staleFiles)(step, [binpath])) {
        var errors = [];
        var LWLINK = wasmutils_1.emglobal.lwlink({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('lwlink'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: function (s) {
                if (s.startsWith("Warning:"))
                    console.log(s);
                else
                    errors.push({ msg: s, line: 0 });
            }
        });
        var FS = LWLINK.FS;
        //setupFS(FS, '65-'+getRootBasePlatform(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.populateExtraFiles)(step, FS, params.extra_link_files);
        var libargs = params.extra_link_args || [];
        var args = [
            '-L.',
            '--entry=program_start',
            '--raw',
            '--output=main',
            '--map=main.map'
        ].concat(libargs, step.args);
        console.log(args);
        (0, wasmutils_1.execMain)(step, LWLINK, args);
        if (errors.length)
            return { errors: errors };
        var aout = FS.readFile("main", { encoding: 'binary' });
        var mapout = FS.readFile("main.map", { encoding: 'utf8' });
        (0, builder_1.putWorkFile)("main", aout);
        (0, builder_1.putWorkFile)("main.map", mapout);
        // return unchanged if no files changed
        if (!(0, builder_1.anyTargetChanged)(step, ["main", "main.map"]))
            return;
        // parse symbol map
        //console.log(mapout);
        var symbolmap = {};
        var segments = [];
        for (var _i = 0, _a = mapout.split("\n"); _i < _a.length; _i++) {
            var s = _a[_i];
            var toks = s.split(" ");
            // TODO: use regex
            if (toks[0] == 'Symbol:') {
                var ident = toks[1];
                var ofs = parseInt(toks[4], 16);
                if (ident && ofs >= 0
                    && !ident.startsWith("l_")
                    //&& !/^L\d+$/.test(ident)
                    && !ident.startsWith('funcsize_')
                    && !ident.startsWith('funcend_')) {
                    symbolmap[ident] = ofs;
                }
            }
            else if (toks[0] == 'Section:') {
                var seg = toks[1];
                var segstart = parseInt(toks[5], 16);
                var segsize = parseInt(toks[7], 16);
                segments.push({ name: seg, start: segstart, size: segsize });
            }
        }
        // build listings
        var re_segment = /\s*SECTION\s+(\w+)/i;
        var re_function = /\s*([0-9a-f]+).+?(\w+)\s+EQU\s+[*]/i;
        var listings = {};
        for (var _b = 0, _c = step.files; _b < _c.length; _b++) {
            var fn = _c[_b];
            if (fn.endsWith('.lst')) {
                // TODO
                var lstout = FS.readFile(fn, { encoding: 'utf8' });
                var asmlines = (0, listingutils_1.parseListing)(lstout, /^([0-9A-F]+)\s+([0-9A-F]+)\s+[(]\s*(.+?)[)]:(\d+) (.*)/i, 4, 1, 2, 3, re_function, re_segment);
                for (var _d = 0, asmlines_1 = asmlines; _d < asmlines_1.length; _d++) {
                    var l = asmlines_1[_d];
                    l.offset += symbolmap[l.func] || 0;
                }
                // * Line //threed.c:117: init of variable e
                var srclines = (0, listingutils_1.parseSourceLines)(lstout, /Line .+?:(\d+)/i, /^([0-9A-F]{4})/i, re_function, re_segment);
                for (var _e = 0, srclines_1 = srclines; _e < srclines_1.length; _e++) {
                    var l = srclines_1[_e];
                    l.offset += symbolmap[l.func] || 0;
                }
                (0, builder_1.putWorkFile)(fn, lstout);
                // strip out left margin
                lstout = lstout.split('\n').map(function (l) { return l.substring(0, 15) + l.substring(56); }).join('\n');
                // TODO: you have to get rid of all source lines to get asm listing
                listings[fn] = {
                    asmlines: srclines.length ? asmlines : null,
                    lines: srclines.length ? srclines : asmlines,
                    text: lstout
                };
            }
        }
        return {
            output: aout, //.slice(0),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}

});


// ── tools/m6502 ──────────────────────────────────────────────────────────────────
__define("tools/m6502", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleNESASM = assembleNESASM;
exports.assembleMerlin32 = assembleMerlin32;
exports.compileFastBasic = compileFastBasic;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
// http://www.nespowerpak.com/nesasm/
function assembleNESASM(step) {
    (0, wasmutils_1.loadNative)("nesasm");
    var re_filename = /\#\[(\d+)\]\s+(\S+)/;
    var re_insn = /\s+(\d+)\s+([0-9A-F]+):([0-9A-F]+)/;
    var re_error = /\s+(.+)/;
    var errors = [];
    var state = 0;
    var lineno = 0;
    var filename;
    function match_fn(s) {
        var m;
        switch (state) {
            case 0:
                m = re_filename.exec(s);
                if (m) {
                    filename = m[2];
                }
                m = re_insn.exec(s);
                if (m) {
                    lineno = parseInt(m[1]);
                    state = 1;
                }
                break;
            case 1:
                m = re_error.exec(s);
                if (m) {
                    errors.push({ path: filename, line: lineno, msg: m[1] });
                    state = 0;
                }
                break;
        }
    }
    var Module = wasmutils_1.emglobal.nesasm({
        instantiateWasm: (0, wasmutils_1.moduleInstFn)('nesasm'),
        noInitialRun: true,
        print: match_fn
    });
    var FS = Module.FS;
    (0, builder_1.populateFiles)(step, FS, {
        mainFilePath: 'main.a'
    });
    var binpath = step.prefix + '.nes';
    var lstpath = step.prefix + '.lst';
    var sympath = step.prefix + '.fns';
    (0, wasmutils_1.execMain)(step, Module, [step.path, '-s', "-l", "2"]);
    // parse main listing, get errors and listings for each file
    var listings = {};
    try {
        var alst = FS.readFile(lstpath, { 'encoding': 'utf8' });
        //   16  00:C004  8E 17 40    STX $4017    ; disable APU frame IRQ
        var asmlines = (0, listingutils_1.parseListing)(alst, /^\s*(\d+)\s+([0-9A-F]+):([0-9A-F]+)\s+([0-9A-F ]+?)  (.*)/i, 1, 3, 4);
        (0, builder_1.putWorkFile)(lstpath, alst);
        listings[lstpath] = {
            lines: asmlines,
            text: alst
        };
    }
    catch (e) {
        //
    }
    if (errors.length) {
        return { errors: errors };
    }
    // read binary rom output and symbols
    var aout, asym;
    aout = FS.readFile(binpath);
    try {
        asym = FS.readFile(sympath, { 'encoding': 'utf8' });
    }
    catch (e) {
        console.log(e);
        errors.push({ line: 0, msg: "No symbol table generated, maybe missing ENDM or segment overflow?" });
        return { errors: errors };
    }
    (0, builder_1.putWorkFile)(binpath, aout);
    (0, builder_1.putWorkFile)(sympath, asym);
    if (alst)
        (0, builder_1.putWorkFile)(lstpath, alst); // listing optional (use LIST)
    // return unchanged if no files changed
    if (!(0, builder_1.anyTargetChanged)(step, [binpath, sympath]))
        return;
    // parse symbols
    var symbolmap = {};
    for (var _i = 0, _a = asym.split("\n"); _i < _a.length; _i++) {
        var s = _a[_i];
        if (!s.startsWith(';')) {
            var m = /(\w+)\s+=\s+[$]([0-9A-F]+)/.exec(s);
            if (m) {
                symbolmap[m[1]] = parseInt(m[2], 16);
            }
        }
    }
    return {
        output: aout,
        listings: listings,
        errors: errors,
        symbolmap: symbolmap,
    };
}
/*
------+-------------------+-------------+----+---------+------+-----------------------+-------------------------------------------------------------------
Line | # File       Line | Line Type   | MX |  Reloc  | Size | Address   Object Code |  Source Code
------+-------------------+-------------+----+---------+------+-----------------------+-------------------------------------------------------------------
  1 |  1 zap.asm      1 | Unknown     | ?? |         |   -1 | 00/FFFF               |             broak
  2 |  1 zap.asm      2 | Comment     | ?? |         |   -1 | 00/FFFF               | * SPACEGAME
  
    => [Error] Impossible to decode address mode for instruction 'BNE  KABOOM!' (line 315, file 'zap.asm') : The number of element in 'KABOOM!' is even (should be value [operator value [operator value]...]).
    => [Error] Unknown line 'foo' in source file 'zap.asm' (line 315)
        => Creating Object file 'pcs.bin'
        => Creating Output file 'pcs.bin_S01__Output.txt'

*/
function assembleMerlin32(step) {
    (0, wasmutils_1.loadNative)("merlin32");
    var errors = [];
    var lstfiles = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.lnk" });
    var objpath = step.prefix + ".bin";
    if ((0, builder_1.staleFiles)(step, [objpath])) {
        var args = ['-v', step.path];
        var merlin32 = wasmutils_1.emglobal.merlin32({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('merlin32'),
            noInitialRun: true,
            print: function (s) {
                var m = /\s*=>\s*Creating Output file '(.+?)'/.exec(s);
                if (m) {
                    lstfiles.push(m[1]);
                }
                var errpos = s.indexOf('Error');
                if (errpos >= 0) {
                    s = s.slice(errpos + 6).trim();
                    var mline = /\bline (\d+)\b/.exec(s);
                    var mpath = /\bfile '(.+?)'/.exec(s);
                    errors.push({
                        line: parseInt(mline[1]) || 0,
                        msg: s,
                        path: mpath[1] || step.path,
                    });
                }
            },
            printErr: wasmutils_1.print_fn,
        });
        var FS = merlin32.FS;
        (0, builder_1.populateFiles)(step, FS);
        (0, wasmutils_1.execMain)(step, merlin32, args);
        if (errors.length)
            return { errors: errors };
        var errout = null;
        try {
            errout = FS.readFile("error_output.txt", { encoding: 'utf8' });
        }
        catch (e) {
            //
        }
        var objout = FS.readFile(objpath, { encoding: 'binary' });
        (0, builder_1.putWorkFile)(objpath, objout);
        if (!(0, builder_1.anyTargetChanged)(step, [objpath]))
            return;
        var symbolmap = {};
        var segments = [];
        var listings = {};
        lstfiles.forEach(function (lstfn) {
            var lst = FS.readFile(lstfn, { encoding: 'utf8' });
            lst.split('\n').forEach(function (line) {
                var toks = line.split(/\s*\|\s*/);
                if (toks && toks[6]) {
                    var toks2 = toks[1].split(/\s+/);
                    var toks3 = toks[6].split(/[:/]/, 4);
                    var path = toks2[1];
                    if (path && toks2[2] && toks3[1]) {
                        var lstline = {
                            line: parseInt(toks2[2]),
                            offset: parseInt(toks3[1].trim(), 16),
                            insns: toks3[2],
                            cycles: null,
                            iscode: false // TODO
                        };
                        var lst = listings[path];
                        if (!lst)
                            listings[path] = lst = { lines: [] };
                        lst.lines.push(lstline);
                        //console.log(path,toks2,toks3);
                    }
                }
            });
        });
        return {
            output: objout, //.slice(0),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}
// README.md:2:5: parse error, expected: statement or variable assignment, integer variable, variable assignment
function compileFastBasic(step) {
    // TODO: fastbasic-fp?
    (0, wasmutils_1.loadNative)("fastbasic-int");
    var params = step.params;
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.fb" });
    var destpath = step.prefix + '.s';
    var errors = [];
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var fastbasic = wasmutils_1.emglobal.fastbasic({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('fastbasic-int'),
            noInitialRun: true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.makeErrorMatcher)(errors, /(.+?):(\d+):(\d+):\s*(.+)/, 2, 4, step.path, 1),
        });
        var FS = fastbasic.FS;
        (0, builder_1.populateFiles)(step, FS);
        var libfile = 'fastbasic-int.lib';
        params.libargs = [libfile];
        params.cfgfile = params.fastbasic_cfgfile;
        //params.extra_compile_args = ["--asm-define", "NO_SMCODE"];
        params.extra_link_files = [libfile, params.cfgfile];
        //fixParamsWithDefines(step.path, params);
        var args = [step.path, destpath];
        (0, wasmutils_1.execMain)(step, fastbasic, args);
        if (errors.length)
            return { errors: errors };
        var asmout = FS.readFile(destpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(destpath, asmout);
    }
    return {
        nexttool: "ca65",
        path: destpath,
        args: [destpath],
        files: [destpath],
    };
}

});


// ── tools/z80 ──────────────────────────────────────────────────────────────────
__define("tools/z80", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleZMAC = assembleZMAC;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
function assembleZMAC(step) {
    (0, wasmutils_1.loadNative)("zmac");
    var hexout, lstout, binout;
    var errors = [];
    var params = step.params;
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.asm" });
    var lstpath = step.prefix + ".lst";
    var binpath = step.prefix + ".cim";
    if ((0, builder_1.staleFiles)(step, [binpath])) {
        /*
      error1.asm(4) : 'l18d4' Undeclared
             JP      L18D4
      
      error1.asm(11): warning: 'foobar' treated as label (instruction typo?)
          Add a colon or move to first column to stop this warning.
      1 errors (see listing if no diagnostics appeared here)
        */
        var ZMAC = wasmutils_1.emglobal.zmac({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('zmac'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.makeErrorMatcher)(errors, /([^( ]+)\s*[(](\d+)[)]\s*:\s*(.+)/, 2, 3, step.path),
        });
        var FS = ZMAC.FS;
        (0, builder_1.populateFiles)(step, FS);
        // TODO: don't know why CIM (hexary) doesn't work
        (0, wasmutils_1.execMain)(step, ZMAC, ['-z', '-c', '--oo', 'lst,cim', step.path]);
        if (errors.length) {
            return { errors: errors };
        }
        lstout = FS.readFile("zout/" + lstpath, { encoding: 'utf8' });
        binout = FS.readFile("zout/" + binpath, { encoding: 'binary' });
        (0, builder_1.putWorkFile)(binpath, binout);
        (0, builder_1.putWorkFile)(lstpath, lstout);
        if (!(0, builder_1.anyTargetChanged)(step, [binpath, lstpath]))
            return;
        //  230: 1739+7+x   017A  1600      L017A: LD      D,00h
        var lines = (0, listingutils_1.parseListing)(lstout, /\s*(\d+):\s*([0-9a-f]+)\s+([0-9a-f]+)\s+(.+)/i, 1, 2, 3);
        var listings = {};
        listings[lstpath] = { lines: lines };
        // parse symbol table
        var symbolmap = {};
        var sympos = lstout.indexOf('Symbol Table:');
        if (sympos > 0) {
            var symout = lstout.slice(sympos + 14);
            symout.split('\n').forEach(function (l) {
                var m = l.match(/(\S+)\s+([= ]*)([0-9a-f]+)/i);
                if (m) {
                    symbolmap[m[1]] = parseInt(m[3], 16);
                }
            });
        }
        return {
            output: binout,
            listings: listings,
            errors: errors,
            symbolmap: symbolmap
        };
    }
}

});


// ── tools/x86 ──────────────────────────────────────────────────────────────────
__define("tools/x86", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileSmallerC = compileSmallerC;
exports.assembleYASM = assembleYASM;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
var mcpp_1 = __require("tools/mcpp");
// http://www.techhelpmanual.com/829-program_startup___exit.html
function compileSmallerC(step) {
    (0, wasmutils_1.loadNative)("smlrc");
    var params = step.params;
    // stderr
    var re_err1 = /^Error in "[/]*(.+)" [(](\d+):(\d+)[)]/;
    var errors = [];
    var errline = 0;
    var errpath = step.path;
    function match_fn(s) {
        var matches = re_err1.exec(s);
        if (matches) {
            errline = parseInt(matches[2]);
            errpath = matches[1];
        }
        else {
            errors.push({
                line: errline,
                msg: s,
                path: errpath,
            });
        }
    }
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
    var destpath = step.prefix + '.asm';
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var args = ['-seg16',
            //'-nobss',
            '-no-externs',
            step.path, destpath];
        var smlrc = wasmutils_1.emglobal.smlrc({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('smlrc'),
            noInitialRun: true,
            //logReadFiles:true,
            print: match_fn,
            printErr: match_fn,
        });
        // load source file and preprocess
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        var preproc = (0, mcpp_1.preprocessMCPP)(step, null);
        if (preproc.errors) {
            return { errors: preproc.errors };
        }
        else
            code = preproc.code;
        // set up filesystem
        var FS = smlrc.FS;
        //setupFS(FS, '65-'+getRootBasePlatform(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        FS.writeFile(step.path, code);
        (0, builder_1.fixParamsWithDefines)(step.path, params);
        if (params.extra_compile_args) {
            args.unshift.apply(args, params.extra_compile_args);
        }
        (0, wasmutils_1.execMain)(step, smlrc, args);
        if (errors.length)
            return { errors: errors };
        var asmout = FS.readFile(destpath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(destpath, asmout);
    }
    return {
        nexttool: "yasm",
        path: destpath,
        args: [destpath],
        files: [destpath],
    };
}
function assembleYASM(step) {
    (0, wasmutils_1.loadNative)("yasm");
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.asm" });
    var objpath = step.prefix + ".exe";
    var lstpath = step.prefix + ".lst";
    var mappath = step.prefix + ".map";
    if ((0, builder_1.staleFiles)(step, [objpath])) {
        var args = ['-X', 'vc',
            '-a', 'x86', '-f', 'dosexe', '-p', 'nasm',
            '-D', 'freedos',
            //'-g', 'dwarf2',
            //'-I/share/asminc',
            '-o', objpath, '-l', lstpath, '--mapfile=' + mappath,
            step.path];
        // return yasm/*.ready*/
        var YASM = wasmutils_1.emglobal.yasm({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('yasm'),
            noInitialRun: true,
            //logReadFiles:true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.msvcErrorMatcher)(errors),
        });
        var FS = YASM.FS;
        //setupFS(FS, '65-'+getRootBasePlatform(step.platform));
        (0, builder_1.populateFiles)(step, FS);
        //fixParamsWithDefines(step.path, step.params);
        (0, wasmutils_1.execMain)(step, YASM, args);
        if (errors.length)
            return { errors: errors };
        var objout, lstout, mapout;
        objout = FS.readFile(objpath, { encoding: 'binary' });
        lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        mapout = FS.readFile(mappath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(objpath, objout);
        (0, builder_1.putWorkFile)(lstpath, lstout);
        //putWorkFile(mappath, mapout);
        if (!(0, builder_1.anyTargetChanged)(step, [objpath]))
            return;
        var symbolmap = {};
        var segments = [];
        var lines = (0, listingutils_1.parseListing)(lstout, /\s*(\d+)\s+([0-9a-f]+)\s+([0-9a-f]+)\s+(.+)/i, 1, 2, 3);
        var listings = {};
        listings[lstpath] = { lines: lines, text: lstout };
        return {
            output: objout, //.slice(0),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}

});


// ── /tmp/8bitworkshop/gen/common/binutils ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/binutils", function(module, exports, __require) {
"use strict";
/*
 * Copyright (c) 2024 Steven E. Hugg
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DWARFParser = exports.ELFParser = void 0;
function getASCII(view, offset) {
    var s = '';
    var i = offset;
    while (view.getUint8(i) !== 0) {
        s += String.fromCharCode(view.getUint8(i));
        i++;
    }
    return s;
}
// https://blog.k3170makan.com/2018/09/introduction-to-elf-format-elf-header.html
// https://chromium.googlesource.com/breakpad/breakpad/+/linux-dwarf/src/common/dwarf/dwarf2reader.cc
// https://wiki.osdev.org/DWARF
// https://dwarfstd.org/doc/dwarf-2.0.0.pdf
// https://dwarfstd.org/doc/Debugging%20using%20DWARF-2012.pdf
// https://dwarfstd.org/doc/DWARF5.pdf
var ELFParser = /** @class */ (function () {
    function ELFParser(data) {
        this.dataView = new DataView(data.buffer);
        this.sectionHeaders = [];
        this.symbolTable = [];
        var elfHeader = new DataView(this.dataView.buffer, 0, 52);
        // check magic #
        var magic = elfHeader.getInt32(0, true);
        if (magic !== 0x464c457f) {
            throw new Error('Invalid ELF header');
        }
        // only 32 bit supported
        if (elfHeader.getUint8(4) !== 1) {
            throw new Error('Only 32-bit ELF supported');
        }
        // check version = 1
        if (elfHeader.getUint8(6) !== 1) {
            throw new Error('Invalid ELF version');
        }
        // get endianness
        var endian = elfHeader.getUint8(5) === 1;
        if (!endian) {
            throw new Error('Big endian not supported');
        }
        // get entryPoint
        this.entry = elfHeader.getUint32(24, endian);
        // Parse ELF header and extract section header offset
        var sectionHeaderOffset = this.dataView.getUint32(32, endian);
        // get section header size
        var sectionHeaderSize = this.dataView.getUint16(46, endian);
        // get # of section headers
        var sectionHeaderCount = this.dataView.getUint16(48, endian);
        // get index of section with names
        var sectionNameIndex = this.dataView.getUint16(50, endian);
        // Parse section headers
        for (var i = 0; i < sectionHeaderCount; i++) {
            var offset = sectionHeaderOffset + i * sectionHeaderSize; // Each section header is 40 bytes
            //const sectionView = new DataView(this.dataView.buffer, offset, sectionHeaderSize);
            var section = new ElfSectionHeader(this.dataView, offset);
            this.sectionHeaders.push(section);
        }
        var sectionNameSection = this.sectionHeaders[sectionNameIndex];
        if (!sectionNameSection) {
            throw new Error('Invalid ELF section name table');
        }
        else {
            var sectionNameView = sectionNameSection.contents;
            for (var i = 0; i < sectionHeaderCount; i++) {
                this.sectionHeaders[i].stringView = sectionNameView;
            }
        }
        // Extract the string table
        var stringTableSection = this.getSection('.strtab', ElfSectionType.STRTAB);
        if (stringTableSection) {
            var stringView = stringTableSection.contents;
            // Find the symbol table section and string table section
            var symbolTableSection = this.getSection('.symtab', ElfSectionType.SYMTAB);
            if (symbolTableSection) {
                // Extract the symbol table
                var symbolTableOffset = symbolTableSection.offset;
                var symbolTableSize = symbolTableSection.size;
                var symbolTableEntryCount = symbolTableSize / 16;
                //const symbolTable = new DataView(this.dataView.buffer, symbolTableOffset, symbolTableSize);
                for (var i = 0; i < symbolTableEntryCount; i++) {
                    var offset = symbolTableOffset + i * 16;
                    var entry = new ElfSymbolTableEntry(this.dataView, offset, stringView);
                    this.symbolTable.push(entry);
                }
            }
        }
    }
    ELFParser.prototype.getSymbols = function () {
        return this.symbolTable;
    };
    ELFParser.prototype.getSection = function (name, type) {
        if (typeof type === 'number') {
            return this.sectionHeaders.find(function (section) { return section.name === name && section.type === type; }) || null;
        }
        else {
            return this.sectionHeaders.find(function (section) { return section.name === name; }) || null;
        }
    };
    return ELFParser;
}());
exports.ELFParser = ELFParser;
var ElfSectionType;
(function (ElfSectionType) {
    ElfSectionType[ElfSectionType["SYMTAB"] = 2] = "SYMTAB";
    ElfSectionType[ElfSectionType["STRTAB"] = 3] = "STRTAB";
})(ElfSectionType || (ElfSectionType = {}));
var ElfSectionHeader = /** @class */ (function () {
    function ElfSectionHeader(dataView, headerOffset) {
        this.dataView = dataView;
        this.headerOffset = headerOffset;
        this.stringView = null;
        this.type = this.dataView.getUint32(this.headerOffset + 0x4, true);
    }
    Object.defineProperty(ElfSectionHeader.prototype, "flags", {
        get: function () {
            return this.dataView.getUint32(this.headerOffset + 0x8, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSectionHeader.prototype, "vmaddr", {
        get: function () {
            return this.dataView.getUint32(this.headerOffset + 0xc, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSectionHeader.prototype, "offset", {
        get: function () {
            return this.dataView.getUint32(this.headerOffset + 0x10, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSectionHeader.prototype, "size", {
        get: function () {
            return this.dataView.getUint32(this.headerOffset + 0x14, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSectionHeader.prototype, "nameOffset", {
        get: function () {
            return this.dataView.getUint32(this.headerOffset + 0x0, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSectionHeader.prototype, "name", {
        get: function () {
            return getASCII(this.stringView, this.nameOffset);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSectionHeader.prototype, "contents", {
        get: function () {
            return new DataView(this.dataView.buffer, this.offset, this.size);
        },
        enumerable: false,
        configurable: true
    });
    return ElfSectionHeader;
}());
var ElfSymbolTableEntry = /** @class */ (function () {
    function ElfSymbolTableEntry(dataView, entryOffset, stringView) {
        this.dataView = dataView;
        this.entryOffset = entryOffset;
        this.stringView = stringView;
    }
    Object.defineProperty(ElfSymbolTableEntry.prototype, "nameOffset", {
        get: function () {
            return this.dataView.getUint32(this.entryOffset, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSymbolTableEntry.prototype, "name", {
        get: function () {
            return getASCII(this.stringView, this.nameOffset);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSymbolTableEntry.prototype, "value", {
        get: function () {
            return this.dataView.getUint32(this.entryOffset + 4, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSymbolTableEntry.prototype, "size", {
        get: function () {
            return this.dataView.getUint32(this.entryOffset + 8, true);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSymbolTableEntry.prototype, "info", {
        get: function () {
            return this.dataView.getUint8(this.entryOffset + 12);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ElfSymbolTableEntry.prototype, "other", {
        get: function () {
            return this.dataView.getUint8(this.entryOffset + 13);
        },
        enumerable: false,
        configurable: true
    });
    return ElfSymbolTableEntry;
}());
// Tag names and codes.
var DwarfTag;
(function (DwarfTag) {
    DwarfTag[DwarfTag["DW_TAG_padding"] = 0] = "DW_TAG_padding";
    DwarfTag[DwarfTag["DW_TAG_array_type"] = 1] = "DW_TAG_array_type";
    DwarfTag[DwarfTag["DW_TAG_class_type"] = 2] = "DW_TAG_class_type";
    DwarfTag[DwarfTag["DW_TAG_entry_point"] = 3] = "DW_TAG_entry_point";
    DwarfTag[DwarfTag["DW_TAG_enumeration_type"] = 4] = "DW_TAG_enumeration_type";
    DwarfTag[DwarfTag["DW_TAG_formal_parameter"] = 5] = "DW_TAG_formal_parameter";
    DwarfTag[DwarfTag["DW_TAG_imported_declaration"] = 8] = "DW_TAG_imported_declaration";
    DwarfTag[DwarfTag["DW_TAG_label"] = 10] = "DW_TAG_label";
    DwarfTag[DwarfTag["DW_TAG_lexical_block"] = 11] = "DW_TAG_lexical_block";
    DwarfTag[DwarfTag["DW_TAG_member"] = 13] = "DW_TAG_member";
    DwarfTag[DwarfTag["DW_TAG_pointer_type"] = 15] = "DW_TAG_pointer_type";
    DwarfTag[DwarfTag["DW_TAG_reference_type"] = 16] = "DW_TAG_reference_type";
    DwarfTag[DwarfTag["DW_TAG_compile_unit"] = 17] = "DW_TAG_compile_unit";
    DwarfTag[DwarfTag["DW_TAG_string_type"] = 18] = "DW_TAG_string_type";
    DwarfTag[DwarfTag["DW_TAG_structure_type"] = 19] = "DW_TAG_structure_type";
    DwarfTag[DwarfTag["DW_TAG_subroutine_type"] = 21] = "DW_TAG_subroutine_type";
    DwarfTag[DwarfTag["DW_TAG_typedef"] = 22] = "DW_TAG_typedef";
    DwarfTag[DwarfTag["DW_TAG_union_type"] = 23] = "DW_TAG_union_type";
    DwarfTag[DwarfTag["DW_TAG_unspecified_parameters"] = 24] = "DW_TAG_unspecified_parameters";
    DwarfTag[DwarfTag["DW_TAG_variant"] = 25] = "DW_TAG_variant";
    DwarfTag[DwarfTag["DW_TAG_common_block"] = 26] = "DW_TAG_common_block";
    DwarfTag[DwarfTag["DW_TAG_common_inclusion"] = 27] = "DW_TAG_common_inclusion";
    DwarfTag[DwarfTag["DW_TAG_inheritance"] = 28] = "DW_TAG_inheritance";
    DwarfTag[DwarfTag["DW_TAG_inlined_subroutine"] = 29] = "DW_TAG_inlined_subroutine";
    DwarfTag[DwarfTag["DW_TAG_module"] = 30] = "DW_TAG_module";
    DwarfTag[DwarfTag["DW_TAG_ptr_to_member_type"] = 31] = "DW_TAG_ptr_to_member_type";
    DwarfTag[DwarfTag["DW_TAG_set_type"] = 32] = "DW_TAG_set_type";
    DwarfTag[DwarfTag["DW_TAG_subrange_type"] = 33] = "DW_TAG_subrange_type";
    DwarfTag[DwarfTag["DW_TAG_with_stmt"] = 34] = "DW_TAG_with_stmt";
    DwarfTag[DwarfTag["DW_TAG_access_declaration"] = 35] = "DW_TAG_access_declaration";
    DwarfTag[DwarfTag["DW_TAG_base_type"] = 36] = "DW_TAG_base_type";
    DwarfTag[DwarfTag["DW_TAG_catch_block"] = 37] = "DW_TAG_catch_block";
    DwarfTag[DwarfTag["DW_TAG_const_type"] = 38] = "DW_TAG_const_type";
    DwarfTag[DwarfTag["DW_TAG_constant"] = 39] = "DW_TAG_constant";
    DwarfTag[DwarfTag["DW_TAG_enumerator"] = 40] = "DW_TAG_enumerator";
    DwarfTag[DwarfTag["DW_TAG_file_type"] = 41] = "DW_TAG_file_type";
    DwarfTag[DwarfTag["DW_TAG_friend"] = 42] = "DW_TAG_friend";
    DwarfTag[DwarfTag["DW_TAG_namelist"] = 43] = "DW_TAG_namelist";
    DwarfTag[DwarfTag["DW_TAG_namelist_item"] = 44] = "DW_TAG_namelist_item";
    DwarfTag[DwarfTag["DW_TAG_packed_type"] = 45] = "DW_TAG_packed_type";
    DwarfTag[DwarfTag["DW_TAG_subprogram"] = 46] = "DW_TAG_subprogram";
    DwarfTag[DwarfTag["DW_TAG_template_type_param"] = 47] = "DW_TAG_template_type_param";
    DwarfTag[DwarfTag["DW_TAG_template_value_param"] = 48] = "DW_TAG_template_value_param";
    DwarfTag[DwarfTag["DW_TAG_thrown_type"] = 49] = "DW_TAG_thrown_type";
    DwarfTag[DwarfTag["DW_TAG_try_block"] = 50] = "DW_TAG_try_block";
    DwarfTag[DwarfTag["DW_TAG_variant_part"] = 51] = "DW_TAG_variant_part";
    DwarfTag[DwarfTag["DW_TAG_variable"] = 52] = "DW_TAG_variable";
    DwarfTag[DwarfTag["DW_TAG_volatile_type"] = 53] = "DW_TAG_volatile_type";
    // DWARF 3.
    DwarfTag[DwarfTag["DW_TAG_dwarf_procedure"] = 54] = "DW_TAG_dwarf_procedure";
    DwarfTag[DwarfTag["DW_TAG_restrict_type"] = 55] = "DW_TAG_restrict_type";
    DwarfTag[DwarfTag["DW_TAG_interface_type"] = 56] = "DW_TAG_interface_type";
    DwarfTag[DwarfTag["DW_TAG_namespace"] = 57] = "DW_TAG_namespace";
    DwarfTag[DwarfTag["DW_TAG_imported_module"] = 58] = "DW_TAG_imported_module";
    DwarfTag[DwarfTag["DW_TAG_unspecified_type"] = 59] = "DW_TAG_unspecified_type";
    DwarfTag[DwarfTag["DW_TAG_partial_unit"] = 60] = "DW_TAG_partial_unit";
    DwarfTag[DwarfTag["DW_TAG_imported_unit"] = 61] = "DW_TAG_imported_unit";
    // SGI/MIPS Extensions.
    DwarfTag[DwarfTag["DW_TAG_MIPS_loop"] = 16513] = "DW_TAG_MIPS_loop";
    // HP extensions.  See:
    // ftp://ftp.hp.com/pub/lang/tools/WDB/wdb-4.0.tar.gz
    DwarfTag[DwarfTag["DW_TAG_HP_array_descriptor"] = 16528] = "DW_TAG_HP_array_descriptor";
    // GNU extensions.
    DwarfTag[DwarfTag["DW_TAG_format_label"] = 16641] = "DW_TAG_format_label";
    DwarfTag[DwarfTag["DW_TAG_function_template"] = 16642] = "DW_TAG_function_template";
    DwarfTag[DwarfTag["DW_TAG_class_template"] = 16643] = "DW_TAG_class_template";
    DwarfTag[DwarfTag["DW_TAG_GNU_BINCL"] = 16644] = "DW_TAG_GNU_BINCL";
    DwarfTag[DwarfTag["DW_TAG_GNU_EINCL"] = 16645] = "DW_TAG_GNU_EINCL";
    // Extensions for UPC.  See: http://upc.gwu.edu/~upc.
    DwarfTag[DwarfTag["DW_TAG_upc_shared_type"] = 34661] = "DW_TAG_upc_shared_type";
    DwarfTag[DwarfTag["DW_TAG_upc_strict_type"] = 34662] = "DW_TAG_upc_strict_type";
    DwarfTag[DwarfTag["DW_TAG_upc_relaxed_type"] = 34663] = "DW_TAG_upc_relaxed_type";
    // PGI (STMicroelectronics) extensions.  No documentation available.
    DwarfTag[DwarfTag["DW_TAG_PGI_kanji_type"] = 40960] = "DW_TAG_PGI_kanji_type";
    DwarfTag[DwarfTag["DW_TAG_PGI_interface_block"] = 40992] = "DW_TAG_PGI_interface_block";
})(DwarfTag || (DwarfTag = {}));
;
var DwarfHasChild;
(function (DwarfHasChild) {
    DwarfHasChild[DwarfHasChild["DW_children_no"] = 0] = "DW_children_no";
    DwarfHasChild[DwarfHasChild["DW_children_yes"] = 1] = "DW_children_yes";
})(DwarfHasChild || (DwarfHasChild = {}));
;
// Form names and codes.
var DwarfForm;
(function (DwarfForm) {
    DwarfForm[DwarfForm["DW_FORM_addr"] = 1] = "DW_FORM_addr";
    DwarfForm[DwarfForm["DW_FORM_block2"] = 3] = "DW_FORM_block2";
    DwarfForm[DwarfForm["DW_FORM_block4"] = 4] = "DW_FORM_block4";
    DwarfForm[DwarfForm["DW_FORM_data2"] = 5] = "DW_FORM_data2";
    DwarfForm[DwarfForm["DW_FORM_data4"] = 6] = "DW_FORM_data4";
    DwarfForm[DwarfForm["DW_FORM_data8"] = 7] = "DW_FORM_data8";
    DwarfForm[DwarfForm["DW_FORM_string"] = 8] = "DW_FORM_string";
    DwarfForm[DwarfForm["DW_FORM_block"] = 9] = "DW_FORM_block";
    DwarfForm[DwarfForm["DW_FORM_block1"] = 10] = "DW_FORM_block1";
    DwarfForm[DwarfForm["DW_FORM_data1"] = 11] = "DW_FORM_data1";
    DwarfForm[DwarfForm["DW_FORM_flag"] = 12] = "DW_FORM_flag";
    DwarfForm[DwarfForm["DW_FORM_sdata"] = 13] = "DW_FORM_sdata";
    DwarfForm[DwarfForm["DW_FORM_strp"] = 14] = "DW_FORM_strp";
    DwarfForm[DwarfForm["DW_FORM_udata"] = 15] = "DW_FORM_udata";
    DwarfForm[DwarfForm["DW_FORM_ref_addr"] = 16] = "DW_FORM_ref_addr";
    DwarfForm[DwarfForm["DW_FORM_ref1"] = 17] = "DW_FORM_ref1";
    DwarfForm[DwarfForm["DW_FORM_ref2"] = 18] = "DW_FORM_ref2";
    DwarfForm[DwarfForm["DW_FORM_ref4"] = 19] = "DW_FORM_ref4";
    DwarfForm[DwarfForm["DW_FORM_ref8"] = 20] = "DW_FORM_ref8";
    DwarfForm[DwarfForm["DW_FORM_ref_udata"] = 21] = "DW_FORM_ref_udata";
    DwarfForm[DwarfForm["DW_FORM_indirect"] = 22] = "DW_FORM_indirect";
})(DwarfForm || (DwarfForm = {}));
;
// Attribute names and codes
var DwarfAttribute;
(function (DwarfAttribute) {
    DwarfAttribute[DwarfAttribute["DW_AT_sibling"] = 1] = "DW_AT_sibling";
    DwarfAttribute[DwarfAttribute["DW_AT_location"] = 2] = "DW_AT_location";
    DwarfAttribute[DwarfAttribute["DW_AT_name"] = 3] = "DW_AT_name";
    DwarfAttribute[DwarfAttribute["DW_AT_ordering"] = 9] = "DW_AT_ordering";
    DwarfAttribute[DwarfAttribute["DW_AT_subscr_data"] = 10] = "DW_AT_subscr_data";
    DwarfAttribute[DwarfAttribute["DW_AT_byte_size"] = 11] = "DW_AT_byte_size";
    DwarfAttribute[DwarfAttribute["DW_AT_bit_offset"] = 12] = "DW_AT_bit_offset";
    DwarfAttribute[DwarfAttribute["DW_AT_bit_size"] = 13] = "DW_AT_bit_size";
    DwarfAttribute[DwarfAttribute["DW_AT_element_list"] = 15] = "DW_AT_element_list";
    DwarfAttribute[DwarfAttribute["DW_AT_stmt_list"] = 16] = "DW_AT_stmt_list";
    DwarfAttribute[DwarfAttribute["DW_AT_low_pc"] = 17] = "DW_AT_low_pc";
    DwarfAttribute[DwarfAttribute["DW_AT_high_pc"] = 18] = "DW_AT_high_pc";
    DwarfAttribute[DwarfAttribute["DW_AT_language"] = 19] = "DW_AT_language";
    DwarfAttribute[DwarfAttribute["DW_AT_member"] = 20] = "DW_AT_member";
    DwarfAttribute[DwarfAttribute["DW_AT_discr"] = 21] = "DW_AT_discr";
    DwarfAttribute[DwarfAttribute["DW_AT_discr_value"] = 22] = "DW_AT_discr_value";
    DwarfAttribute[DwarfAttribute["DW_AT_visibility"] = 23] = "DW_AT_visibility";
    DwarfAttribute[DwarfAttribute["DW_AT_import"] = 24] = "DW_AT_import";
    DwarfAttribute[DwarfAttribute["DW_AT_string_length"] = 25] = "DW_AT_string_length";
    DwarfAttribute[DwarfAttribute["DW_AT_common_reference"] = 26] = "DW_AT_common_reference";
    DwarfAttribute[DwarfAttribute["DW_AT_comp_dir"] = 27] = "DW_AT_comp_dir";
    DwarfAttribute[DwarfAttribute["DW_AT_const_value"] = 28] = "DW_AT_const_value";
    DwarfAttribute[DwarfAttribute["DW_AT_containing_type"] = 29] = "DW_AT_containing_type";
    DwarfAttribute[DwarfAttribute["DW_AT_default_value"] = 30] = "DW_AT_default_value";
    DwarfAttribute[DwarfAttribute["DW_AT_inline"] = 32] = "DW_AT_inline";
    DwarfAttribute[DwarfAttribute["DW_AT_is_optional"] = 33] = "DW_AT_is_optional";
    DwarfAttribute[DwarfAttribute["DW_AT_lower_bound"] = 34] = "DW_AT_lower_bound";
    DwarfAttribute[DwarfAttribute["DW_AT_producer"] = 37] = "DW_AT_producer";
    DwarfAttribute[DwarfAttribute["DW_AT_prototyped"] = 39] = "DW_AT_prototyped";
    DwarfAttribute[DwarfAttribute["DW_AT_return_addr"] = 42] = "DW_AT_return_addr";
    DwarfAttribute[DwarfAttribute["DW_AT_start_scope"] = 44] = "DW_AT_start_scope";
    DwarfAttribute[DwarfAttribute["DW_AT_stride_size"] = 46] = "DW_AT_stride_size";
    DwarfAttribute[DwarfAttribute["DW_AT_upper_bound"] = 47] = "DW_AT_upper_bound";
    DwarfAttribute[DwarfAttribute["DW_AT_abstract_origin"] = 49] = "DW_AT_abstract_origin";
    DwarfAttribute[DwarfAttribute["DW_AT_accessibility"] = 50] = "DW_AT_accessibility";
    DwarfAttribute[DwarfAttribute["DW_AT_address_class"] = 51] = "DW_AT_address_class";
    DwarfAttribute[DwarfAttribute["DW_AT_artificial"] = 52] = "DW_AT_artificial";
    DwarfAttribute[DwarfAttribute["DW_AT_base_types"] = 53] = "DW_AT_base_types";
    DwarfAttribute[DwarfAttribute["DW_AT_calling_convention"] = 54] = "DW_AT_calling_convention";
    DwarfAttribute[DwarfAttribute["DW_AT_count"] = 55] = "DW_AT_count";
    DwarfAttribute[DwarfAttribute["DW_AT_data_member_location"] = 56] = "DW_AT_data_member_location";
    DwarfAttribute[DwarfAttribute["DW_AT_decl_column"] = 57] = "DW_AT_decl_column";
    DwarfAttribute[DwarfAttribute["DW_AT_decl_file"] = 58] = "DW_AT_decl_file";
    DwarfAttribute[DwarfAttribute["DW_AT_decl_line"] = 59] = "DW_AT_decl_line";
    DwarfAttribute[DwarfAttribute["DW_AT_declaration"] = 60] = "DW_AT_declaration";
    DwarfAttribute[DwarfAttribute["DW_AT_discr_list"] = 61] = "DW_AT_discr_list";
    DwarfAttribute[DwarfAttribute["DW_AT_encoding"] = 62] = "DW_AT_encoding";
    DwarfAttribute[DwarfAttribute["DW_AT_external"] = 63] = "DW_AT_external";
    DwarfAttribute[DwarfAttribute["DW_AT_frame_base"] = 64] = "DW_AT_frame_base";
    DwarfAttribute[DwarfAttribute["DW_AT_friend"] = 65] = "DW_AT_friend";
    DwarfAttribute[DwarfAttribute["DW_AT_identifier_case"] = 66] = "DW_AT_identifier_case";
    DwarfAttribute[DwarfAttribute["DW_AT_macro_info"] = 67] = "DW_AT_macro_info";
    DwarfAttribute[DwarfAttribute["DW_AT_namelist_items"] = 68] = "DW_AT_namelist_items";
    DwarfAttribute[DwarfAttribute["DW_AT_priority"] = 69] = "DW_AT_priority";
    DwarfAttribute[DwarfAttribute["DW_AT_segment"] = 70] = "DW_AT_segment";
    DwarfAttribute[DwarfAttribute["DW_AT_specification"] = 71] = "DW_AT_specification";
    DwarfAttribute[DwarfAttribute["DW_AT_static_link"] = 72] = "DW_AT_static_link";
    DwarfAttribute[DwarfAttribute["DW_AT_type"] = 73] = "DW_AT_type";
    DwarfAttribute[DwarfAttribute["DW_AT_use_location"] = 74] = "DW_AT_use_location";
    DwarfAttribute[DwarfAttribute["DW_AT_variable_parameter"] = 75] = "DW_AT_variable_parameter";
    DwarfAttribute[DwarfAttribute["DW_AT_virtuality"] = 76] = "DW_AT_virtuality";
    DwarfAttribute[DwarfAttribute["DW_AT_vtable_elem_location"] = 77] = "DW_AT_vtable_elem_location";
    // DWARF 3 values.
    DwarfAttribute[DwarfAttribute["DW_AT_allocated"] = 78] = "DW_AT_allocated";
    DwarfAttribute[DwarfAttribute["DW_AT_associated"] = 79] = "DW_AT_associated";
    DwarfAttribute[DwarfAttribute["DW_AT_data_location"] = 80] = "DW_AT_data_location";
    DwarfAttribute[DwarfAttribute["DW_AT_stride"] = 81] = "DW_AT_stride";
    DwarfAttribute[DwarfAttribute["DW_AT_entry_pc"] = 82] = "DW_AT_entry_pc";
    DwarfAttribute[DwarfAttribute["DW_AT_use_UTF8"] = 83] = "DW_AT_use_UTF8";
    DwarfAttribute[DwarfAttribute["DW_AT_extension"] = 84] = "DW_AT_extension";
    DwarfAttribute[DwarfAttribute["DW_AT_ranges"] = 85] = "DW_AT_ranges";
    DwarfAttribute[DwarfAttribute["DW_AT_trampoline"] = 86] = "DW_AT_trampoline";
    DwarfAttribute[DwarfAttribute["DW_AT_call_column"] = 87] = "DW_AT_call_column";
    DwarfAttribute[DwarfAttribute["DW_AT_call_file"] = 88] = "DW_AT_call_file";
    DwarfAttribute[DwarfAttribute["DW_AT_call_line"] = 89] = "DW_AT_call_line";
    // SGI/MIPS extensions.
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_fde"] = 8193] = "DW_AT_MIPS_fde";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_loop_begin"] = 8194] = "DW_AT_MIPS_loop_begin";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_tail_loop_begin"] = 8195] = "DW_AT_MIPS_tail_loop_begin";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_epilog_begin"] = 8196] = "DW_AT_MIPS_epilog_begin";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_loop_unroll_factor"] = 8197] = "DW_AT_MIPS_loop_unroll_factor";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_software_pipeline_depth"] = 8198] = "DW_AT_MIPS_software_pipeline_depth";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_linkage_name"] = 8199] = "DW_AT_MIPS_linkage_name";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_stride"] = 8200] = "DW_AT_MIPS_stride";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_abstract_name"] = 8201] = "DW_AT_MIPS_abstract_name";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_clone_origin"] = 8202] = "DW_AT_MIPS_clone_origin";
    DwarfAttribute[DwarfAttribute["DW_AT_MIPS_has_inlines"] = 8203] = "DW_AT_MIPS_has_inlines";
    // HP extensions.
    DwarfAttribute[DwarfAttribute["DW_AT_HP_block_index"] = 8192] = "DW_AT_HP_block_index";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_unmodifiable"] = 8193] = "DW_AT_HP_unmodifiable";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_actuals_stmt_list"] = 8208] = "DW_AT_HP_actuals_stmt_list";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_proc_per_section"] = 8209] = "DW_AT_HP_proc_per_section";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_raw_data_ptr"] = 8210] = "DW_AT_HP_raw_data_ptr";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_pass_by_reference"] = 8211] = "DW_AT_HP_pass_by_reference";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_opt_level"] = 8212] = "DW_AT_HP_opt_level";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_prof_version_id"] = 8213] = "DW_AT_HP_prof_version_id";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_opt_flags"] = 8214] = "DW_AT_HP_opt_flags";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_cold_region_low_pc"] = 8215] = "DW_AT_HP_cold_region_low_pc";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_cold_region_high_pc"] = 8216] = "DW_AT_HP_cold_region_high_pc";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_all_variables_modifiable"] = 8217] = "DW_AT_HP_all_variables_modifiable";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_linkage_name"] = 8218] = "DW_AT_HP_linkage_name";
    DwarfAttribute[DwarfAttribute["DW_AT_HP_prof_flags"] = 8219] = "DW_AT_HP_prof_flags";
    // GNU extensions.
    DwarfAttribute[DwarfAttribute["DW_AT_sf_names"] = 8449] = "DW_AT_sf_names";
    DwarfAttribute[DwarfAttribute["DW_AT_src_info"] = 8450] = "DW_AT_src_info";
    DwarfAttribute[DwarfAttribute["DW_AT_mac_info"] = 8451] = "DW_AT_mac_info";
    DwarfAttribute[DwarfAttribute["DW_AT_src_coords"] = 8452] = "DW_AT_src_coords";
    DwarfAttribute[DwarfAttribute["DW_AT_body_begin"] = 8453] = "DW_AT_body_begin";
    DwarfAttribute[DwarfAttribute["DW_AT_body_end"] = 8454] = "DW_AT_body_end";
    DwarfAttribute[DwarfAttribute["DW_AT_GNU_vector"] = 8455] = "DW_AT_GNU_vector";
    // VMS extensions.
    DwarfAttribute[DwarfAttribute["DW_AT_VMS_rtnbeg_pd_address"] = 8705] = "DW_AT_VMS_rtnbeg_pd_address";
    // UPC extension.
    DwarfAttribute[DwarfAttribute["DW_AT_upc_threads_scaled"] = 12816] = "DW_AT_upc_threads_scaled";
    // PGI (STMicroelectronics) extensions.
    DwarfAttribute[DwarfAttribute["DW_AT_PGI_lbase"] = 14848] = "DW_AT_PGI_lbase";
    DwarfAttribute[DwarfAttribute["DW_AT_PGI_soffset"] = 14849] = "DW_AT_PGI_soffset";
    DwarfAttribute[DwarfAttribute["DW_AT_PGI_lstride"] = 14850] = "DW_AT_PGI_lstride";
})(DwarfAttribute || (DwarfAttribute = {}));
;
// Line number opcodes.
var DwarfLineNumberOps;
(function (DwarfLineNumberOps) {
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_extended_op"] = 0] = "DW_LNS_extended_op";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_copy"] = 1] = "DW_LNS_copy";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_advance_pc"] = 2] = "DW_LNS_advance_pc";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_advance_line"] = 3] = "DW_LNS_advance_line";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_set_file"] = 4] = "DW_LNS_set_file";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_set_column"] = 5] = "DW_LNS_set_column";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_negate_stmt"] = 6] = "DW_LNS_negate_stmt";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_set_basic_block"] = 7] = "DW_LNS_set_basic_block";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_const_add_pc"] = 8] = "DW_LNS_const_add_pc";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_fixed_advance_pc"] = 9] = "DW_LNS_fixed_advance_pc";
    // DWARF 3.
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_set_prologue_end"] = 10] = "DW_LNS_set_prologue_end";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_set_epilogue_begin"] = 11] = "DW_LNS_set_epilogue_begin";
    DwarfLineNumberOps[DwarfLineNumberOps["DW_LNS_set_isa"] = 12] = "DW_LNS_set_isa";
})(DwarfLineNumberOps || (DwarfLineNumberOps = {}));
;
// Line number extended opcodes.
var DwarfLineNumberExtendedOps;
(function (DwarfLineNumberExtendedOps) {
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_end_sequence"] = 1] = "DW_LNE_end_sequence";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_set_address"] = 2] = "DW_LNE_set_address";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_define_file"] = 3] = "DW_LNE_define_file";
    // HP extensions.
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_negate_is_UV_update"] = 17] = "DW_LNE_HP_negate_is_UV_update";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_push_context"] = 18] = "DW_LNE_HP_push_context";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_pop_context"] = 19] = "DW_LNE_HP_pop_context";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_set_file_line_column"] = 20] = "DW_LNE_HP_set_file_line_column";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_set_routine_name"] = 21] = "DW_LNE_HP_set_routine_name";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_set_sequence"] = 22] = "DW_LNE_HP_set_sequence";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_negate_post_semantics"] = 23] = "DW_LNE_HP_negate_post_semantics";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_negate_function_exit"] = 24] = "DW_LNE_HP_negate_function_exit";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_negate_front_end_logical"] = 25] = "DW_LNE_HP_negate_front_end_logical";
    DwarfLineNumberExtendedOps[DwarfLineNumberExtendedOps["DW_LNE_HP_define_proc"] = 32] = "DW_LNE_HP_define_proc";
})(DwarfLineNumberExtendedOps || (DwarfLineNumberExtendedOps = {}));
;
// Type encoding names and codes
var DwarfEncoding;
(function (DwarfEncoding) {
    DwarfEncoding[DwarfEncoding["DW_ATE_address"] = 1] = "DW_ATE_address";
    DwarfEncoding[DwarfEncoding["DW_ATE_boolean"] = 2] = "DW_ATE_boolean";
    DwarfEncoding[DwarfEncoding["DW_ATE_complex_float"] = 3] = "DW_ATE_complex_float";
    DwarfEncoding[DwarfEncoding["DW_ATE_float"] = 4] = "DW_ATE_float";
    DwarfEncoding[DwarfEncoding["DW_ATE_signed"] = 5] = "DW_ATE_signed";
    DwarfEncoding[DwarfEncoding["DW_ATE_signed_char"] = 6] = "DW_ATE_signed_char";
    DwarfEncoding[DwarfEncoding["DW_ATE_unsigned"] = 7] = "DW_ATE_unsigned";
    DwarfEncoding[DwarfEncoding["DW_ATE_unsigned_char"] = 8] = "DW_ATE_unsigned_char";
    // DWARF3/DWARF3f
    DwarfEncoding[DwarfEncoding["DW_ATE_imaginary_float"] = 9] = "DW_ATE_imaginary_float";
    DwarfEncoding[DwarfEncoding["DW_ATE_packed_decimal"] = 10] = "DW_ATE_packed_decimal";
    DwarfEncoding[DwarfEncoding["DW_ATE_numeric_string"] = 11] = "DW_ATE_numeric_string";
    DwarfEncoding[DwarfEncoding["DW_ATE_edited"] = 12] = "DW_ATE_edited";
    DwarfEncoding[DwarfEncoding["DW_ATE_signed_fixed"] = 13] = "DW_ATE_signed_fixed";
    DwarfEncoding[DwarfEncoding["DW_ATE_unsigned_fixed"] = 14] = "DW_ATE_unsigned_fixed";
    DwarfEncoding[DwarfEncoding["DW_ATE_decimal_float"] = 15] = "DW_ATE_decimal_float";
    DwarfEncoding[DwarfEncoding["DW_ATE_lo_user"] = 128] = "DW_ATE_lo_user";
    DwarfEncoding[DwarfEncoding["DW_ATE_hi_user"] = 255] = "DW_ATE_hi_user";
})(DwarfEncoding || (DwarfEncoding = {}));
;
// Location virtual machine opcodes
var DwarfOpcode;
(function (DwarfOpcode) {
    DwarfOpcode[DwarfOpcode["DW_OP_addr"] = 3] = "DW_OP_addr";
    DwarfOpcode[DwarfOpcode["DW_OP_deref"] = 6] = "DW_OP_deref";
    DwarfOpcode[DwarfOpcode["DW_OP_const1u"] = 8] = "DW_OP_const1u";
    DwarfOpcode[DwarfOpcode["DW_OP_const1s"] = 9] = "DW_OP_const1s";
    DwarfOpcode[DwarfOpcode["DW_OP_const2u"] = 10] = "DW_OP_const2u";
    DwarfOpcode[DwarfOpcode["DW_OP_const2s"] = 11] = "DW_OP_const2s";
    DwarfOpcode[DwarfOpcode["DW_OP_const4u"] = 12] = "DW_OP_const4u";
    DwarfOpcode[DwarfOpcode["DW_OP_const4s"] = 13] = "DW_OP_const4s";
    DwarfOpcode[DwarfOpcode["DW_OP_const8u"] = 14] = "DW_OP_const8u";
    DwarfOpcode[DwarfOpcode["DW_OP_const8s"] = 15] = "DW_OP_const8s";
    DwarfOpcode[DwarfOpcode["DW_OP_constu"] = 16] = "DW_OP_constu";
    DwarfOpcode[DwarfOpcode["DW_OP_consts"] = 17] = "DW_OP_consts";
    DwarfOpcode[DwarfOpcode["DW_OP_dup"] = 18] = "DW_OP_dup";
    DwarfOpcode[DwarfOpcode["DW_OP_drop"] = 19] = "DW_OP_drop";
    DwarfOpcode[DwarfOpcode["DW_OP_over"] = 20] = "DW_OP_over";
    DwarfOpcode[DwarfOpcode["DW_OP_pick"] = 21] = "DW_OP_pick";
    DwarfOpcode[DwarfOpcode["DW_OP_swap"] = 22] = "DW_OP_swap";
    DwarfOpcode[DwarfOpcode["DW_OP_rot"] = 23] = "DW_OP_rot";
    DwarfOpcode[DwarfOpcode["DW_OP_xderef"] = 24] = "DW_OP_xderef";
    DwarfOpcode[DwarfOpcode["DW_OP_abs"] = 25] = "DW_OP_abs";
    DwarfOpcode[DwarfOpcode["DW_OP_and"] = 26] = "DW_OP_and";
    DwarfOpcode[DwarfOpcode["DW_OP_div"] = 27] = "DW_OP_div";
    DwarfOpcode[DwarfOpcode["DW_OP_minus"] = 28] = "DW_OP_minus";
    DwarfOpcode[DwarfOpcode["DW_OP_mod"] = 29] = "DW_OP_mod";
    DwarfOpcode[DwarfOpcode["DW_OP_mul"] = 30] = "DW_OP_mul";
    DwarfOpcode[DwarfOpcode["DW_OP_neg"] = 31] = "DW_OP_neg";
    DwarfOpcode[DwarfOpcode["DW_OP_not"] = 32] = "DW_OP_not";
    DwarfOpcode[DwarfOpcode["DW_OP_or"] = 33] = "DW_OP_or";
    DwarfOpcode[DwarfOpcode["DW_OP_plus"] = 34] = "DW_OP_plus";
    DwarfOpcode[DwarfOpcode["DW_OP_plus_uconst"] = 35] = "DW_OP_plus_uconst";
    DwarfOpcode[DwarfOpcode["DW_OP_shl"] = 36] = "DW_OP_shl";
    DwarfOpcode[DwarfOpcode["DW_OP_shr"] = 37] = "DW_OP_shr";
    DwarfOpcode[DwarfOpcode["DW_OP_shra"] = 38] = "DW_OP_shra";
    DwarfOpcode[DwarfOpcode["DW_OP_xor"] = 39] = "DW_OP_xor";
    DwarfOpcode[DwarfOpcode["DW_OP_bra"] = 40] = "DW_OP_bra";
    DwarfOpcode[DwarfOpcode["DW_OP_eq"] = 41] = "DW_OP_eq";
    DwarfOpcode[DwarfOpcode["DW_OP_ge"] = 42] = "DW_OP_ge";
    DwarfOpcode[DwarfOpcode["DW_OP_gt"] = 43] = "DW_OP_gt";
    DwarfOpcode[DwarfOpcode["DW_OP_le"] = 44] = "DW_OP_le";
    DwarfOpcode[DwarfOpcode["DW_OP_lt"] = 45] = "DW_OP_lt";
    DwarfOpcode[DwarfOpcode["DW_OP_ne"] = 46] = "DW_OP_ne";
    DwarfOpcode[DwarfOpcode["DW_OP_skip"] = 47] = "DW_OP_skip";
    DwarfOpcode[DwarfOpcode["DW_OP_lit0"] = 48] = "DW_OP_lit0";
    DwarfOpcode[DwarfOpcode["DW_OP_lit1"] = 49] = "DW_OP_lit1";
    DwarfOpcode[DwarfOpcode["DW_OP_lit2"] = 50] = "DW_OP_lit2";
    DwarfOpcode[DwarfOpcode["DW_OP_lit3"] = 51] = "DW_OP_lit3";
    DwarfOpcode[DwarfOpcode["DW_OP_lit4"] = 52] = "DW_OP_lit4";
    DwarfOpcode[DwarfOpcode["DW_OP_lit5"] = 53] = "DW_OP_lit5";
    DwarfOpcode[DwarfOpcode["DW_OP_lit6"] = 54] = "DW_OP_lit6";
    DwarfOpcode[DwarfOpcode["DW_OP_lit7"] = 55] = "DW_OP_lit7";
    DwarfOpcode[DwarfOpcode["DW_OP_lit8"] = 56] = "DW_OP_lit8";
    DwarfOpcode[DwarfOpcode["DW_OP_lit9"] = 57] = "DW_OP_lit9";
    DwarfOpcode[DwarfOpcode["DW_OP_lit10"] = 58] = "DW_OP_lit10";
    DwarfOpcode[DwarfOpcode["DW_OP_lit11"] = 59] = "DW_OP_lit11";
    DwarfOpcode[DwarfOpcode["DW_OP_lit12"] = 60] = "DW_OP_lit12";
    DwarfOpcode[DwarfOpcode["DW_OP_lit13"] = 61] = "DW_OP_lit13";
    DwarfOpcode[DwarfOpcode["DW_OP_lit14"] = 62] = "DW_OP_lit14";
    DwarfOpcode[DwarfOpcode["DW_OP_lit15"] = 63] = "DW_OP_lit15";
    DwarfOpcode[DwarfOpcode["DW_OP_lit16"] = 64] = "DW_OP_lit16";
    DwarfOpcode[DwarfOpcode["DW_OP_lit17"] = 65] = "DW_OP_lit17";
    DwarfOpcode[DwarfOpcode["DW_OP_lit18"] = 66] = "DW_OP_lit18";
    DwarfOpcode[DwarfOpcode["DW_OP_lit19"] = 67] = "DW_OP_lit19";
    DwarfOpcode[DwarfOpcode["DW_OP_lit20"] = 68] = "DW_OP_lit20";
    DwarfOpcode[DwarfOpcode["DW_OP_lit21"] = 69] = "DW_OP_lit21";
    DwarfOpcode[DwarfOpcode["DW_OP_lit22"] = 70] = "DW_OP_lit22";
    DwarfOpcode[DwarfOpcode["DW_OP_lit23"] = 71] = "DW_OP_lit23";
    DwarfOpcode[DwarfOpcode["DW_OP_lit24"] = 72] = "DW_OP_lit24";
    DwarfOpcode[DwarfOpcode["DW_OP_lit25"] = 73] = "DW_OP_lit25";
    DwarfOpcode[DwarfOpcode["DW_OP_lit26"] = 74] = "DW_OP_lit26";
    DwarfOpcode[DwarfOpcode["DW_OP_lit27"] = 75] = "DW_OP_lit27";
    DwarfOpcode[DwarfOpcode["DW_OP_lit28"] = 76] = "DW_OP_lit28";
    DwarfOpcode[DwarfOpcode["DW_OP_lit29"] = 77] = "DW_OP_lit29";
    DwarfOpcode[DwarfOpcode["DW_OP_lit30"] = 78] = "DW_OP_lit30";
    DwarfOpcode[DwarfOpcode["DW_OP_lit31"] = 79] = "DW_OP_lit31";
    DwarfOpcode[DwarfOpcode["DW_OP_reg0"] = 80] = "DW_OP_reg0";
    DwarfOpcode[DwarfOpcode["DW_OP_reg1"] = 81] = "DW_OP_reg1";
    DwarfOpcode[DwarfOpcode["DW_OP_reg2"] = 82] = "DW_OP_reg2";
    DwarfOpcode[DwarfOpcode["DW_OP_reg3"] = 83] = "DW_OP_reg3";
    DwarfOpcode[DwarfOpcode["DW_OP_reg4"] = 84] = "DW_OP_reg4";
    DwarfOpcode[DwarfOpcode["DW_OP_reg5"] = 85] = "DW_OP_reg5";
    DwarfOpcode[DwarfOpcode["DW_OP_reg6"] = 86] = "DW_OP_reg6";
    DwarfOpcode[DwarfOpcode["DW_OP_reg7"] = 87] = "DW_OP_reg7";
    DwarfOpcode[DwarfOpcode["DW_OP_reg8"] = 88] = "DW_OP_reg8";
    DwarfOpcode[DwarfOpcode["DW_OP_reg9"] = 89] = "DW_OP_reg9";
    DwarfOpcode[DwarfOpcode["DW_OP_reg10"] = 90] = "DW_OP_reg10";
    DwarfOpcode[DwarfOpcode["DW_OP_reg11"] = 91] = "DW_OP_reg11";
    DwarfOpcode[DwarfOpcode["DW_OP_reg12"] = 92] = "DW_OP_reg12";
    DwarfOpcode[DwarfOpcode["DW_OP_reg13"] = 93] = "DW_OP_reg13";
    DwarfOpcode[DwarfOpcode["DW_OP_reg14"] = 94] = "DW_OP_reg14";
    DwarfOpcode[DwarfOpcode["DW_OP_reg15"] = 95] = "DW_OP_reg15";
    DwarfOpcode[DwarfOpcode["DW_OP_reg16"] = 96] = "DW_OP_reg16";
    DwarfOpcode[DwarfOpcode["DW_OP_reg17"] = 97] = "DW_OP_reg17";
    DwarfOpcode[DwarfOpcode["DW_OP_reg18"] = 98] = "DW_OP_reg18";
    DwarfOpcode[DwarfOpcode["DW_OP_reg19"] = 99] = "DW_OP_reg19";
    DwarfOpcode[DwarfOpcode["DW_OP_reg20"] = 100] = "DW_OP_reg20";
    DwarfOpcode[DwarfOpcode["DW_OP_reg21"] = 101] = "DW_OP_reg21";
    DwarfOpcode[DwarfOpcode["DW_OP_reg22"] = 102] = "DW_OP_reg22";
    DwarfOpcode[DwarfOpcode["DW_OP_reg23"] = 103] = "DW_OP_reg23";
    DwarfOpcode[DwarfOpcode["DW_OP_reg24"] = 104] = "DW_OP_reg24";
    DwarfOpcode[DwarfOpcode["DW_OP_reg25"] = 105] = "DW_OP_reg25";
    DwarfOpcode[DwarfOpcode["DW_OP_reg26"] = 106] = "DW_OP_reg26";
    DwarfOpcode[DwarfOpcode["DW_OP_reg27"] = 107] = "DW_OP_reg27";
    DwarfOpcode[DwarfOpcode["DW_OP_reg28"] = 108] = "DW_OP_reg28";
    DwarfOpcode[DwarfOpcode["DW_OP_reg29"] = 109] = "DW_OP_reg29";
    DwarfOpcode[DwarfOpcode["DW_OP_reg30"] = 110] = "DW_OP_reg30";
    DwarfOpcode[DwarfOpcode["DW_OP_reg31"] = 111] = "DW_OP_reg31";
    DwarfOpcode[DwarfOpcode["DW_OP_breg0"] = 112] = "DW_OP_breg0";
    DwarfOpcode[DwarfOpcode["DW_OP_breg1"] = 113] = "DW_OP_breg1";
    DwarfOpcode[DwarfOpcode["DW_OP_breg2"] = 114] = "DW_OP_breg2";
    DwarfOpcode[DwarfOpcode["DW_OP_breg3"] = 115] = "DW_OP_breg3";
    DwarfOpcode[DwarfOpcode["DW_OP_breg4"] = 116] = "DW_OP_breg4";
    DwarfOpcode[DwarfOpcode["DW_OP_breg5"] = 117] = "DW_OP_breg5";
    DwarfOpcode[DwarfOpcode["DW_OP_breg6"] = 118] = "DW_OP_breg6";
    DwarfOpcode[DwarfOpcode["DW_OP_breg7"] = 119] = "DW_OP_breg7";
    DwarfOpcode[DwarfOpcode["DW_OP_breg8"] = 120] = "DW_OP_breg8";
    DwarfOpcode[DwarfOpcode["DW_OP_breg9"] = 121] = "DW_OP_breg9";
    DwarfOpcode[DwarfOpcode["DW_OP_breg10"] = 122] = "DW_OP_breg10";
    DwarfOpcode[DwarfOpcode["DW_OP_breg11"] = 123] = "DW_OP_breg11";
    DwarfOpcode[DwarfOpcode["DW_OP_breg12"] = 124] = "DW_OP_breg12";
    DwarfOpcode[DwarfOpcode["DW_OP_breg13"] = 125] = "DW_OP_breg13";
    DwarfOpcode[DwarfOpcode["DW_OP_breg14"] = 126] = "DW_OP_breg14";
    DwarfOpcode[DwarfOpcode["DW_OP_breg15"] = 127] = "DW_OP_breg15";
    DwarfOpcode[DwarfOpcode["DW_OP_breg16"] = 128] = "DW_OP_breg16";
    DwarfOpcode[DwarfOpcode["DW_OP_breg17"] = 129] = "DW_OP_breg17";
    DwarfOpcode[DwarfOpcode["DW_OP_breg18"] = 130] = "DW_OP_breg18";
    DwarfOpcode[DwarfOpcode["DW_OP_breg19"] = 131] = "DW_OP_breg19";
    DwarfOpcode[DwarfOpcode["DW_OP_breg20"] = 132] = "DW_OP_breg20";
    DwarfOpcode[DwarfOpcode["DW_OP_breg21"] = 133] = "DW_OP_breg21";
    DwarfOpcode[DwarfOpcode["DW_OP_breg22"] = 134] = "DW_OP_breg22";
    DwarfOpcode[DwarfOpcode["DW_OP_breg23"] = 135] = "DW_OP_breg23";
    DwarfOpcode[DwarfOpcode["DW_OP_breg24"] = 136] = "DW_OP_breg24";
    DwarfOpcode[DwarfOpcode["DW_OP_breg25"] = 137] = "DW_OP_breg25";
    DwarfOpcode[DwarfOpcode["DW_OP_breg26"] = 138] = "DW_OP_breg26";
    DwarfOpcode[DwarfOpcode["DW_OP_breg27"] = 139] = "DW_OP_breg27";
    DwarfOpcode[DwarfOpcode["DW_OP_breg28"] = 140] = "DW_OP_breg28";
    DwarfOpcode[DwarfOpcode["DW_OP_breg29"] = 141] = "DW_OP_breg29";
    DwarfOpcode[DwarfOpcode["DW_OP_breg30"] = 142] = "DW_OP_breg30";
    DwarfOpcode[DwarfOpcode["DW_OP_breg31"] = 143] = "DW_OP_breg31";
    DwarfOpcode[DwarfOpcode["DW_OP_regX"] = 144] = "DW_OP_regX";
    DwarfOpcode[DwarfOpcode["DW_OP_fbreg"] = 145] = "DW_OP_fbreg";
    DwarfOpcode[DwarfOpcode["DW_OP_bregX"] = 146] = "DW_OP_bregX";
    DwarfOpcode[DwarfOpcode["DW_OP_piece"] = 147] = "DW_OP_piece";
    DwarfOpcode[DwarfOpcode["DW_OP_deref_size"] = 148] = "DW_OP_deref_size";
    DwarfOpcode[DwarfOpcode["DW_OP_xderef_size"] = 149] = "DW_OP_xderef_size";
    DwarfOpcode[DwarfOpcode["DW_OP_nop"] = 150] = "DW_OP_nop";
    // DWARF3/DWARF3f
    DwarfOpcode[DwarfOpcode["DW_OP_push_object_address"] = 151] = "DW_OP_push_object_address";
    DwarfOpcode[DwarfOpcode["DW_OP_call2"] = 152] = "DW_OP_call2";
    DwarfOpcode[DwarfOpcode["DW_OP_call4"] = 153] = "DW_OP_call4";
    DwarfOpcode[DwarfOpcode["DW_OP_call_ref"] = 154] = "DW_OP_call_ref";
    DwarfOpcode[DwarfOpcode["DW_OP_form_tls_address"] = 155] = "DW_OP_form_tls_address";
    DwarfOpcode[DwarfOpcode["DW_OP_call_frame_cfa"] = 156] = "DW_OP_call_frame_cfa";
    DwarfOpcode[DwarfOpcode["DW_OP_bit_piece"] = 157] = "DW_OP_bit_piece";
    DwarfOpcode[DwarfOpcode["DW_OP_lo_user"] = 224] = "DW_OP_lo_user";
    DwarfOpcode[DwarfOpcode["DW_OP_hi_user"] = 255] = "DW_OP_hi_user";
    // GNU extensions
    DwarfOpcode[DwarfOpcode["DW_OP_GNU_push_tls_address"] = 224] = "DW_OP_GNU_push_tls_address";
})(DwarfOpcode || (DwarfOpcode = {}));
;
// Source languages.  These are values for DW_AT_language.
var DwarfLanguage;
(function (DwarfLanguage) {
    DwarfLanguage[DwarfLanguage["DW_LANG_none"] = 0] = "DW_LANG_none";
    DwarfLanguage[DwarfLanguage["DW_LANG_C89"] = 1] = "DW_LANG_C89";
    DwarfLanguage[DwarfLanguage["DW_LANG_C"] = 2] = "DW_LANG_C";
    DwarfLanguage[DwarfLanguage["DW_LANG_Ada83"] = 3] = "DW_LANG_Ada83";
    DwarfLanguage[DwarfLanguage["DW_LANG_C_plus_plus"] = 4] = "DW_LANG_C_plus_plus";
    DwarfLanguage[DwarfLanguage["DW_LANG_Cobol74"] = 5] = "DW_LANG_Cobol74";
    DwarfLanguage[DwarfLanguage["DW_LANG_Cobol85"] = 6] = "DW_LANG_Cobol85";
    DwarfLanguage[DwarfLanguage["DW_LANG_Fortran77"] = 7] = "DW_LANG_Fortran77";
    DwarfLanguage[DwarfLanguage["DW_LANG_Fortran90"] = 8] = "DW_LANG_Fortran90";
    DwarfLanguage[DwarfLanguage["DW_LANG_Pascal83"] = 9] = "DW_LANG_Pascal83";
    DwarfLanguage[DwarfLanguage["DW_LANG_Modula2"] = 10] = "DW_LANG_Modula2";
    DwarfLanguage[DwarfLanguage["DW_LANG_Java"] = 11] = "DW_LANG_Java";
    DwarfLanguage[DwarfLanguage["DW_LANG_C99"] = 12] = "DW_LANG_C99";
    DwarfLanguage[DwarfLanguage["DW_LANG_Ada95"] = 13] = "DW_LANG_Ada95";
    DwarfLanguage[DwarfLanguage["DW_LANG_Fortran95"] = 14] = "DW_LANG_Fortran95";
    DwarfLanguage[DwarfLanguage["DW_LANG_PLI"] = 15] = "DW_LANG_PLI";
    DwarfLanguage[DwarfLanguage["DW_LANG_ObjC"] = 16] = "DW_LANG_ObjC";
    DwarfLanguage[DwarfLanguage["DW_LANG_ObjC_plus_plus"] = 17] = "DW_LANG_ObjC_plus_plus";
    DwarfLanguage[DwarfLanguage["DW_LANG_UPC"] = 18] = "DW_LANG_UPC";
    DwarfLanguage[DwarfLanguage["DW_LANG_D"] = 19] = "DW_LANG_D";
    // Implementation-defined language code range.
    DwarfLanguage[DwarfLanguage["DW_LANG_lo_user"] = 32768] = "DW_LANG_lo_user";
    DwarfLanguage[DwarfLanguage["DW_LANG_hi_user"] = 65535] = "DW_LANG_hi_user";
    // Extensions.
    // MIPS assembly language.  The GNU toolchain uses this for all
    // assembly languages, since there's no generic DW_LANG_ value for that.
    DwarfLanguage[DwarfLanguage["DW_LANG_Mips_Assembler"] = 32769] = "DW_LANG_Mips_Assembler";
    DwarfLanguage[DwarfLanguage["DW_LANG_Upc"] = 34661] = "DW_LANG_Upc"; // Unified Parallel C
})(DwarfLanguage || (DwarfLanguage = {}));
;
var ByteReader = /** @class */ (function () {
    function ByteReader(view, littleEndian) {
        this.view = view;
        this.littleEndian = littleEndian;
        this.addressSize = 4;
        this.offsetSize = 4;
        this.offset = 0;
    }
    ByteReader.prototype.isEOF = function () {
        return this.offset >= this.view.byteLength;
    };
    ByteReader.prototype.readOneByte = function () {
        var value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
    };
    ByteReader.prototype.readTwoBytes = function () {
        var value = this.view.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
    };
    ByteReader.prototype.readFourBytes = function () {
        var value = this.view.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
    };
    ByteReader.prototype.readEightBytes = function () {
        var value = this.view.getBigUint64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
    };
    ByteReader.prototype.readUnsignedLEB128 = function () {
        var result = BigInt(0);
        var shift = BigInt(0);
        while (true) {
            var byte = this.readOneByte();
            result |= BigInt(byte & 0x7f) << shift;
            if ((byte & 0x80) === 0) {
                break;
            }
            shift += BigInt(7);
        }
        return shift < 31 ? Number(result) : result;
    };
    ByteReader.prototype.readSignedLEB128 = function () {
        var result = BigInt(0);
        var shift = BigInt(0);
        var byte = 0;
        while (true) {
            byte = this.readOneByte();
            result |= BigInt(byte & 0x7f) << shift;
            shift += BigInt(7);
            if ((byte & 0x80) === 0) {
                break;
            }
        }
        if ((byte & 0x40) !== 0) {
            // Sign extend if the highest bit of the last byte is set.
            result |= -(BigInt(1) << shift);
        }
        return shift < 31 ? Number(result) : result;
    };
    ByteReader.prototype.readOffset = function () {
        if (this.offsetSize === 4) {
            var value = this.readFourBytes();
            return value;
            /*
        } else if (this.offsetSize === 8) {
            const value = this.readEightBytes();
            return value;
            */
        }
        else {
            throw new Error('Invalid offset size');
        }
    };
    ByteReader.prototype.readAddress = function () {
        if (this.addressSize === 4) {
            var value = this.readFourBytes();
            return value;
            /*
        } else if (this.addressSize === 8) {
            const value = this.readEightBytes();
            return value;
            */
        }
        else {
            throw new Error('Invalid address size');
        }
    };
    ByteReader.prototype.readInitialLength = function () {
        var initial_length = this.readFourBytes();
        // In DWARF2/3, if the initial length is all 1 bits, then the offset
        // size is 8 and we need to read the next 8 bytes for the real length.
        if (initial_length === 0xffffffff) {
            throw new Error('64-bit DWARF is not supported');
            //this.offsetSize = 8;
            //return this.readEightBytes();
        }
        else {
            this.offsetSize = 4;
            return initial_length;
        }
    };
    ByteReader.prototype.readString = function () {
        var result = '';
        while (true) {
            var byte = this.readOneByte();
            if (byte === 0) {
                break;
            }
            result += String.fromCharCode(byte);
        }
        return result;
    };
    ByteReader.prototype.slice = function (offset, length) {
        return new DataView(this.view.buffer, this.view.byteOffset + offset, length);
    };
    ByteReader.prototype.readByteArray = function (length) {
        var result = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
            result[i] = this.readOneByte();
        }
        return result;
    };
    return ByteReader;
}());
var DWARFParser = /** @class */ (function () {
    function DWARFParser(elf) {
        this.elf = elf;
        this.units = [];
        this.lineInfos = [];
        // fetch DWARF v2 sections
        //this.aranges = elf.getSection('.debug_aranges');
        // parse compilation units
        var abbrev = elf.getSection('.debug_abbrev');
        var info = elf.getSection('.debug_info');
        var debugstrs = elf.getSection('.debug_str') || elf.getSection('__debug_str');
        var infoReader = new ByteReader(info.contents, true);
        while (!infoReader.isEOF()) {
            var compilationUnit = new DWARFCompilationUnit(infoReader, debugstrs.contents);
            // must be either skip() or read()
            compilationUnit.read(abbrev.contents);
            this.units.push(compilationUnit);
            compilationUnit.dispose();
        }
        var linedata = elf.getSection('.debug_line');
        var lineReader = new ByteReader(linedata.contents, true);
        while (!lineReader.isEOF()) {
            var lineInfo = new DWARFLineInfo(lineReader);
            // must be either skip() or read()
            lineInfo.readLines();
            this.lineInfos.push(lineInfo);
            lineInfo.dispose();
        }
    }
    return DWARFParser;
}());
exports.DWARFParser = DWARFParser;
var DWARFCompilationUnit = /** @class */ (function () {
    function DWARFCompilationUnit(infoReader, debugstrs) {
        this.infoReader = infoReader;
        this.debugstrs = debugstrs;
        this.abbrevs = [];
        var baseOffset = infoReader.offset;
        var length = infoReader.readInitialLength();
        var version = infoReader.readTwoBytes();
        this.abbrevOffset = Number(infoReader.readOffset());
        var address_size = infoReader.readOneByte();
        this.headerLength = infoReader.offset - baseOffset;
        if (version != 2)
            throw new Error('DWARF version ' + version + ' not supported');
        if (address_size !== 4)
            throw new Error('Address size ' + address_size + ' not supported');
        this.contentLength = Number(length) - this.headerLength + 4;
        this.contentOffset = infoReader.offset;
        //const info = new DWARFCompilationUnit(buffer, reader.offset, address_size);
    }
    DWARFCompilationUnit.prototype.dispose = function () {
        this.infoReader = null;
        this.debugstrs = null;
        this.abbrevs = null;
    };
    DWARFCompilationUnit.prototype.skip = function () {
        this.infoReader.offset += this.contentLength;
    };
    DWARFCompilationUnit.prototype.read = function (abbrev) {
        // parse the abbreviations
        var abbrevReader = new ByteReader(abbrev, true);
        abbrevReader.offset = this.abbrevOffset;
        this.abbrevs = parseAbbrevs(abbrevReader);
        // extract slice with DIEs
        var slice = this.infoReader.slice(this.contentOffset, this.contentLength);
        this.root = this.processDIEs(new ByteReader(slice, true));
        // skip to next cu section
        this.skip();
    };
    DWARFCompilationUnit.prototype.processDIEs = function (reader) {
        var die_stack = [{ children: [] }];
        // TODO: capture tree structure
        while (!reader.isEOF()) {
            var absolute_offset = reader.offset + this.contentOffset;
            var abbrev_num = Number(reader.readUnsignedLEB128());
            //console.log('DIE', absolute_offset.toString(16), abbrev_num);
            if (abbrev_num == 0) {
                var item = die_stack.pop();
                if (!item)
                    throw new Error('DIE stack underflow @ offset ' + reader.offset);
                continue;
            }
            var abbrev = this.abbrevs[abbrev_num - 1];
            if (!abbrev)
                throw new Error('Invalid abbreviation number ' + abbrev_num);
            var obj = this.processDIE(reader, abbrev);
            var top_1 = die_stack[die_stack.length - 1];
            if (!top_1.children)
                top_1.children = [];
            top_1.children.push(obj);
            if (abbrev.has_children) {
                die_stack.push(obj);
            }
        }
        if (die_stack.length != 1)
            throw new Error('DIE stack not empty');
        return die_stack[0];
    };
    DWARFCompilationUnit.prototype.processDIE = function (reader, abbrev) {
        //console.log('processDIE', abbrev);
        var obj = { tag: DwarfTag[abbrev.tag] };
        // iterate through attributes
        for (var _i = 0, _a = abbrev.attributes; _i < _a.length; _i++) {
            var attr = _a[_i];
            var form = attr.form;
            var value = this.processAttribute(reader, form);
            obj[DwarfAttribute[attr.attr]] = value;
        }
        //console.log(obj);
        return obj;
    };
    DWARFCompilationUnit.prototype.processAttribute = function (reader, form) {
        switch (form) {
            case DwarfForm.DW_FORM_data1:
            case DwarfForm.DW_FORM_flag:
            case DwarfForm.DW_FORM_ref1:
                return reader.readOneByte();
            case DwarfForm.DW_FORM_data2:
            case DwarfForm.DW_FORM_ref2:
                return reader.readTwoBytes();
            case DwarfForm.DW_FORM_data4:
            case DwarfForm.DW_FORM_ref4:
            case DwarfForm.DW_FORM_addr:
            case DwarfForm.DW_FORM_ref_addr:
                return reader.readFourBytes();
            case DwarfForm.DW_FORM_data8:
            case DwarfForm.DW_FORM_ref8:
                return reader.readEightBytes();
            case DwarfForm.DW_FORM_string:
                return reader.readString();
            case DwarfForm.DW_FORM_udata:
            case DwarfForm.DW_FORM_ref_udata:
                return reader.readUnsignedLEB128();
            case DwarfForm.DW_FORM_sdata:
                return reader.readSignedLEB128();
            case DwarfForm.DW_FORM_strp:
                // read from strtab
                var offset = Number(reader.readOffset());
                return this.getStringFrom(this.debugstrs, offset);
            case DwarfForm.DW_FORM_block1:
                var len = reader.readOneByte();
                return reader.readByteArray(len);
            default:
                throw new Error('Unsupported form ' + form);
        }
    };
    DWARFCompilationUnit.prototype.getStringFrom = function (strtab, offset) {
        var result = '';
        while (true) {
            var byte = strtab.getUint8(offset);
            if (byte === 0) {
                break;
            }
            result += String.fromCharCode(byte);
            offset += 1;
        }
        return result;
    };
    return DWARFCompilationUnit;
}());
var CompilationUnitHeader = /** @class */ (function () {
    function CompilationUnitHeader() {
        this.length = 0;
        this.version = 0;
        this.abbrev_offset = 0;
        this.address_size = 0;
    }
    return CompilationUnitHeader;
}());
var LineStateMachine = /** @class */ (function () {
    function LineStateMachine(default_is_stmt) {
        this.Reset(default_is_stmt);
    }
    LineStateMachine.prototype.Reset = function (default_is_stmt) {
        this.file_num = 1;
        this.address = 0;
        this.line_num = 1;
        this.column_num = 0;
        this.is_stmt = default_is_stmt;
        this.basic_block = false;
        this.end_sequence = false;
    };
    return LineStateMachine;
}());
// Read a DWARF2/3 abbreviation section.
// Each abbrev consists of a abbreviation number, a tag, a byte
// specifying whether the tag has children, and a list of
// attribute/form pairs.
// The list of forms is terminated by a 0 for the attribute, and a
// zero for the form.  The entire abbreviation section is terminated
// by a zero for the code.
function parseAbbrevs(reader) {
    var abbrevs = [];
    while (!reader.isEOF()) {
        var number = Number(reader.readUnsignedLEB128());
        if (number == 0)
            break;
        var tag = Number(reader.readUnsignedLEB128());
        var has_children = reader.readOneByte() !== 0;
        var attributes = [];
        while (true) {
            var attr = Number(reader.readUnsignedLEB128());
            var form = Number(reader.readUnsignedLEB128());
            if (attr === 0 && form === 0) {
                break;
            }
            attributes.push({ attr: attr, form: form });
        }
        var abbrev = {
            number: number,
            tag: tag,
            has_children: has_children,
            attributes: attributes,
        };
        abbrevs.push(abbrev);
    }
    return abbrevs;
}
var DWARFLineInfo = /** @class */ (function () {
    function DWARFLineInfo(headerReader) {
        this.headerReader = headerReader;
        this.readHeader();
    }
    DWARFLineInfo.prototype.dispose = function () {
        this.headerReader = null;
        this.opData = null;
        this.opReader = null;
        this.lsm = null;
    };
    DWARFLineInfo.prototype.readHeader = function () {
        var length = this.headerReader.readInitialLength();
        var baseOffset1 = this.headerReader.offset;
        var version = this.headerReader.readTwoBytes();
        if (version != 2)
            throw new Error('DWARF version ' + version + ' not supported');
        var prologue_length = this.headerReader.readOffset();
        var baseOffset2 = this.headerReader.offset;
        this.min_insn_length = this.headerReader.readOneByte();
        this.default_is_stmt = this.headerReader.readOneByte() !== 0;
        this.line_base = this.headerReader.readOneByte(); // signed
        if (this.line_base >= 0x80) {
            this.line_base -= 0x100;
        }
        this.line_range = this.headerReader.readOneByte();
        var opcode_base = this.opcode_base = this.headerReader.readOneByte();
        var std_opcode_lengths = new Array(opcode_base + 1);
        for (var i = 1; i < opcode_base; i++) {
            std_opcode_lengths[i] = this.headerReader.readOneByte();
        }
        // It is legal for the directory entry table to be empty.
        this.directories = [null];
        while (true) {
            var name_1 = this.headerReader.readString();
            if (name_1 === '') {
                break;
            }
            this.directories.push(name_1);
        }
        // It is also legal for the file entry table to be empty.
        this.files = [null];
        while (true) {
            var name_2 = this.headerReader.readString();
            if (name_2 === '') {
                break;
            }
            var dir_index = Number(this.headerReader.readUnsignedLEB128());
            var mod_time = Number(this.headerReader.readUnsignedLEB128());
            var file_length = Number(this.headerReader.readUnsignedLEB128());
            this.files.push({ name: name_2, dir_index: dir_index, mod_time: mod_time, file_length: file_length, lines: [] });
        }
        this.contentOffset = baseOffset2 + Number(prologue_length);
        this.contentLength = Number(length) - (this.contentOffset - baseOffset1);
    };
    DWARFLineInfo.prototype.skip = function () {
        this.headerReader.offset = this.contentOffset + this.contentLength;
    };
    DWARFLineInfo.prototype.readLines = function () {
        this.opData = this.headerReader.slice(this.contentOffset, this.contentLength);
        this.opReader = new ByteReader(this.opData, true);
        this.lsm = new LineStateMachine(this.default_is_stmt);
        while (!this.opReader.isEOF()) {
            var add_line = this.processOneOpcode();
            if (this.lsm.end_sequence) {
                this.lsm.Reset(this.default_is_stmt);
            }
            else if (add_line) {
                var line = {
                    file: this.files[this.lsm.file_num].name,
                    line: this.lsm.line_num,
                    column: this.lsm.column_num,
                    address: this.lsm.address,
                    is_stmt: this.lsm.is_stmt,
                    basic_block: this.lsm.basic_block,
                    end_sequence: this.lsm.end_sequence,
                };
                this.files[this.lsm.file_num].lines.push(line);
                //console.log(line);
            }
        }
        this.skip();
    };
    DWARFLineInfo.prototype.processOneOpcode = function () {
        var opcode = this.opReader.readOneByte();
        // If the opcode is great than the opcode_base, it is a special
        // opcode. Most line programs consist mainly of special opcodes.
        if (opcode >= this.opcode_base) {
            opcode -= this.opcode_base;
            var advance_address = Math.floor(opcode / this.line_range) * this.min_insn_length;
            var advance_line = (opcode % this.line_range) + this.line_base;
            this.checkPassPC();
            this.lsm.address += advance_address;
            this.lsm.line_num += advance_line;
            this.lsm.basic_block = true;
            return true;
        }
        // Otherwise, we have the regular opcodes
        //console.log('opcode', opcode, this.lsm);
        switch (opcode) {
            case DwarfLineNumberOps.DW_LNS_copy: {
                this.lsm.basic_block = false;
                return true;
            }
            case DwarfLineNumberOps.DW_LNS_advance_pc: {
                var advance_address = this.opReader.readUnsignedLEB128();
                this.checkPassPC();
                this.lsm.address += this.min_insn_length * Number(advance_address);
                break;
            }
            case DwarfLineNumberOps.DW_LNS_advance_line: {
                this.lsm.line_num += Number(this.opReader.readSignedLEB128());
                break;
            }
            case DwarfLineNumberOps.DW_LNS_set_file: {
                this.lsm.file_num = Number(this.opReader.readUnsignedLEB128());
                break;
            }
            case DwarfLineNumberOps.DW_LNS_set_column: {
                this.lsm.column_num = Number(this.opReader.readUnsignedLEB128());
                break;
            }
            case DwarfLineNumberOps.DW_LNS_negate_stmt: {
                this.lsm.is_stmt = !this.lsm.is_stmt;
                break;
            }
            case DwarfLineNumberOps.DW_LNS_set_basic_block: {
                this.lsm.basic_block = true;
                break;
            }
            case DwarfLineNumberOps.DW_LNS_fixed_advance_pc: {
                var advance_address = this.opReader.readTwoBytes();
                this.checkPassPC();
                this.lsm.address += advance_address;
                break;
            }
            case DwarfLineNumberOps.DW_LNS_const_add_pc: {
                var advance_address = this.min_insn_length * ((255 - this.opcode_base) / this.line_range);
                this.checkPassPC();
                this.lsm.address += advance_address;
                break;
            }
            case DwarfLineNumberOps.DW_LNS_set_prologue_end: {
                break;
            }
            case DwarfLineNumberOps.DW_LNS_set_epilogue_begin: {
                break;
            }
            case DwarfLineNumberOps.DW_LNS_extended_op: {
                var extended_op_len = this.opReader.readUnsignedLEB128();
                var extended_op = this.opReader.readOneByte();
                switch (extended_op) {
                    case DwarfLineNumberExtendedOps.DW_LNE_end_sequence:
                        this.lsm.end_sequence = true;
                        return true;
                    case DwarfLineNumberExtendedOps.DW_LNE_set_address:
                        this.lsm.address = Number(this.opReader.readAddress());
                        break;
                    case DwarfLineNumberExtendedOps.DW_LNE_define_file:
                        // TODO
                        break;
                    default:
                        console.log('Unknown DWARF extended opcode ' + extended_op);
                        this.opReader.offset += Number(extended_op_len);
                        break;
                }
                break;
            }
            default:
                console.log('Unknown DWARF opcode ' + opcode);
                break;
        }
    };
    DWARFLineInfo.prototype.checkPassPC = function () {
        /*
        // Check if the lsm passes "pc". If so, mark it as passed.
        if (lsm_passes_pc &&
            lsm->address <= pc && pc < lsm->address + advance_address) {
        *lsm_passes_pc = true;
        }
        */
    };
    return DWARFLineInfo;
}());

});


// ── tools/arm ──────────────────────────────────────────────────────────────────
__define("tools/arm", function(module, exports, __require) {
"use strict";
/*
 * Copyright (c) 2024 Steven E. Hugg
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleARMIPS = assembleARMIPS;
exports.assembleVASMARM = assembleVASMARM;
exports.compileARMTCC = compileARMTCC;
exports.linkARMTCC = linkARMTCC;
var binutils_1 = __require("/tmp/8bitworkshop/gen/common/binutils");
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasiutils_1 = __require("wasiutils");
var wasmutils_1 = __require("wasmutils");
function assembleARMIPS(step) {
    (0, wasmutils_1.loadNative)("armips");
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.asm" });
    var objpath = "main.bin";
    var lstpath = step.prefix + ".lst";
    var sympath = step.prefix + ".sym";
    //test.armips(3) error: Parse error '.arm'
    var error_fn = (0, listingutils_1.makeErrorMatcher)(errors, /^(.+?)\((\d+)\)\s+(fatal error|error|warning):\s+(.+)/, 2, 4, step.path, 1);
    if ((0, builder_1.staleFiles)(step, [objpath])) {
        var args = [step.path, '-temp', lstpath, '-sym', sympath, '-erroronwarning'];
        var armips = wasmutils_1.emglobal.armips({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('armips'),
            noInitialRun: true,
            print: error_fn,
            printErr: error_fn,
        });
        var FS = armips.FS;
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        code = ".arm.little :: .create \"".concat(objpath, "\",0 :: ").concat(code, "\n  .close");
        (0, builder_1.putWorkFile)(step.path, code);
        (0, builder_1.populateFiles)(step, FS);
        (0, wasmutils_1.execMain)(step, armips, args);
        if (errors.length)
            return { errors: errors };
        var objout = FS.readFile(objpath, { encoding: 'binary' });
        (0, builder_1.putWorkFile)(objpath, objout);
        if (!(0, builder_1.anyTargetChanged)(step, [objpath]))
            return;
        var symbolmap = {};
        var segments = [];
        var listings = {};
        var lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        var lines = lstout.split(listingutils_1.re_crlf);
        //00000034 .word 0x11223344                                             ; /vidfill.armips line 25
        var re_asmline = /^([0-9A-F]+) (.+?); [/](.+?) line (\d+)/;
        var lastofs = -1;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var m;
            if (m = re_asmline.exec(line)) {
                var path = m[3];
                var path2 = (0, builder_1.getPrefix)(path) + '.lst'; // TODO: don't rename listing
                var lst = listings[path2];
                if (lst == null) {
                    lst = listings[path2] = { lines: [] };
                }
                var ofs = parseInt(m[1], 16);
                if (lastofs == ofs) {
                    lst.lines.pop(); // get rid of duplicate offset
                }
                else if (ofs > lastofs) {
                    var lastline = lst.lines[lst.lines.length - 1];
                    if (lastline && !lastline.insns) {
                        var insns = objout.slice(lastofs, ofs).reverse();
                        lastline.insns = Array.from(insns).map(function (b) { return (0, util_1.hex)(b, 2); }).join('');
                    }
                }
                lst.lines.push({
                    path: path,
                    line: parseInt(m[4]),
                    offset: ofs
                });
                lastofs = ofs;
            }
        }
        //listings[lstpath] = {lines:lstlines, text:lstout};
        var symout = FS.readFile(sympath, { encoding: 'utf8' });
        //0000000C loop2
        //00000034 .dbl:0004
        var re_symline = /^([0-9A-F]+)\s+(.+)/;
        for (var _a = 0, _b = symout.split(listingutils_1.re_crlf); _a < _b.length; _a++) {
            var line = _b[_a];
            var m;
            if (m = re_symline.exec(line)) {
                symbolmap[m[2]] = parseInt(m[1], 16);
            }
        }
        return {
            output: objout, //.slice(0),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}
function assembleVASMARM(step) {
    (0, wasmutils_1.loadNative)("vasmarm_std");
    /// error 2 in line 8 of "gfxtest.c": unknown mnemonic <ew>
    /// error 3007: undefined symbol <XXLOOP>
    /// TODO: match undefined symbols
    var re_err1 = /^(fatal error|error|warning)? (\d+) in line (\d+) of "(.+)": (.+)/;
    var re_err2 = /^(fatal error|error|warning)? (\d+): (.+)/;
    var re_undefsym = /symbol <(.+?)>/;
    var errors = [];
    var undefsyms = [];
    function findUndefinedSymbols(line) {
        // find undefined symbols in line
        undefsyms.forEach(function (sym) {
            if (line.indexOf(sym) >= 0) {
                errors.push({
                    path: curpath,
                    line: curline,
                    msg: "Undefined symbol: " + sym,
                });
            }
        });
    }
    function match_fn(s) {
        var matches = re_err1.exec(s);
        if (matches) {
            errors.push({
                line: parseInt(matches[3]),
                path: matches[4],
                msg: matches[5],
            });
        }
        else {
            matches = re_err2.exec(s);
            if (matches) {
                var m_1 = re_undefsym.exec(matches[3]);
                if (m_1) {
                    undefsyms.push(m_1[1]);
                }
                else {
                    errors.push({
                        line: 0,
                        msg: s,
                    });
                }
            }
            else {
                console.log(s);
            }
        }
    }
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.asm" });
    var objpath = step.prefix + ".bin";
    var lstpath = step.prefix + ".lst";
    if ((0, builder_1.staleFiles)(step, [objpath])) {
        var args = ['-Fbin', '-m7tdmi', '-x', '-wfail', step.path, '-o', objpath, '-L', lstpath];
        var vasm = wasmutils_1.emglobal.vasm({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('vasmarm_std'),
            noInitialRun: true,
            print: match_fn,
            printErr: match_fn,
        });
        var FS = vasm.FS;
        (0, builder_1.populateFiles)(step, FS);
        (0, wasmutils_1.execMain)(step, vasm, args);
        if (errors.length) {
            return { errors: errors };
        }
        if (undefsyms.length == 0) {
            var objout = FS.readFile(objpath, { encoding: 'binary' });
            (0, builder_1.putWorkFile)(objpath, objout);
            if (!(0, builder_1.anyTargetChanged)(step, [objpath]))
                return;
        }
        var lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        // 00:00000018 023020E0        	    14:  eor r3, r0, r2
        // Source: "vidfill.vasm"
        // 00: ".text" (0-40)
        // LOOP                            00:00000018
        // STACK                            S:20010000
        var symbolmap = {};
        var segments = []; // TODO
        var listings = {};
        // TODO: parse listings
        var re_asmline = /^(\d+):([0-9A-F]+)\s+([0-9A-F ]+)\s+(\d+)([:M])/;
        var re_secline = /^(\d+):\s+"(.+)"/;
        var re_nameline = /^Source:\s+"(.+)"/;
        var re_symline = /^(\w+)\s+(\d+):([0-9A-F]+)/;
        var re_emptyline = /^\s+(\d+)([:M])/;
        var curpath = step.path;
        var curline = 0;
        var sections = {};
        // map file and section indices -> names
        var lines = lstout.split(listingutils_1.re_crlf);
        // parse lines
        var lstlines = [];
        for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
            var line = lines_2[_i];
            var m;
            if (m = re_secline.exec(line)) {
                sections[m[1]] = m[2];
            }
            else if (m = re_nameline.exec(line)) {
                curpath = m[1];
            }
            else if (m = re_symline.exec(line)) {
                symbolmap[m[1]] = parseInt(m[3], 16);
            }
            else if (m = re_asmline.exec(line)) {
                if (m[5] == ':') {
                    curline = parseInt(m[4]);
                }
                else {
                    // TODO: macro line
                }
                lstlines.push({
                    path: curpath,
                    line: curline,
                    offset: parseInt(m[2], 16),
                    insns: m[3].replaceAll(' ', '')
                });
                findUndefinedSymbols(line);
            }
            else if (m = re_emptyline.exec(line)) {
                curline = parseInt(m[1]);
                findUndefinedSymbols(line);
            }
            else {
                //console.log(line);
            }
        }
        listings[lstpath] = { lines: lstlines, text: lstout };
        // catch-all if no error generated
        if (undefsyms.length && errors.length == 0) {
            errors.push({
                line: 0,
                msg: 'Undefined symbols: ' + undefsyms.join(', ')
            });
        }
        return {
            output: objout, //.slice(0x34),
            listings: listings,
            errors: errors,
            symbolmap: symbolmap,
            segments: segments
        };
    }
}
function tccErrorMatcher(errors, mainpath) {
    return (0, listingutils_1.makeErrorMatcher)(errors, /([^:]+|tcc):(\d+|\s*error): (.+)/, 2, 3, mainpath, 1);
    ;
}
var armtcc_fs = null;
function compileARMTCC(step) {
    return __awaiter(this, void 0, void 0, function () {
        var params, errors, objpath, error_fn, armtcc, args, FS_1, objout;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, wasmutils_1.loadNative)("arm-tcc");
                    params = step.params;
                    errors = [];
                    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
                    objpath = step.prefix + ".o";
                    error_fn = tccErrorMatcher(errors, step.path);
                    if (!!armtcc_fs) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, wasiutils_1.loadWASIFilesystemZip)("arm32-fs.zip")];
                case 1:
                    armtcc_fs = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(0, builder_1.staleFiles)(step, [objpath])) return [3 /*break*/, 4];
                    return [4 /*yield*/, wasmutils_1.emglobal.armtcc({
                            instantiateWasm: (0, wasmutils_1.moduleInstFn)('arm-tcc'),
                            noInitialRun: true,
                            print: error_fn,
                            printErr: error_fn,
                        })];
                case 3:
                    armtcc = _a.sent();
                    args = ['-c', '-I.', '-I./include',
                        //'-std=c11',
                        '-funsigned-char',
                        //'-Wwrite-strings',
                        '-gdwarf-2',
                        '-o', objpath];
                    if (params.define) {
                        params.define.forEach(function (x) { return args.push('-D' + x); });
                    }
                    if (params.extra_compile_args) {
                        args = args.concat(params.extra_compile_args);
                    }
                    args.push(step.path);
                    FS_1 = armtcc.FS;
                    // TODO: only should do once?
                    armtcc_fs.getDirectories().forEach(function (dir) {
                        if (dir.name != '/')
                            FS_1.mkdir(dir.name);
                    });
                    armtcc_fs.getFiles().forEach(function (file) {
                        FS_1.writeFile(file.name, file.getBytes(), { encoding: 'binary' });
                    });
                    (0, builder_1.populateExtraFiles)(step, FS_1, params.extra_compile_files);
                    (0, builder_1.populateFiles)(step, FS_1, {
                        mainFilePath: step.path,
                        processFn: function (path, code) {
                            if (typeof code === 'string') {
                                code = (0, builder_1.processEmbedDirective)(code);
                            }
                            return code;
                        }
                    });
                    (0, wasmutils_1.execMain)(step, armtcc, args);
                    if (errors.length)
                        return [2 /*return*/, { errors: errors }];
                    objout = FS_1.readFile(objpath, { encoding: 'binary' });
                    (0, builder_1.putWorkFile)(objpath, objout);
                    _a.label = 4;
                case 4: return [2 /*return*/, {
                        linktool: "armtcclink",
                        files: [objpath],
                        args: [objpath]
                    }];
            }
        });
    });
}
function linkARMTCC(step) {
    return __awaiter(this, void 0, void 0, function () {
        var params, errors, objpath, error_fn, armtcc, args, FS, objout, elfparser, maxaddr_1, rom_1, obj32, start, symbolmap_1, segments_1, listings_1, dwarf;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, wasmutils_1.loadNative)("arm-tcc");
                    params = step.params;
                    errors = [];
                    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
                    objpath = "main.elf";
                    error_fn = tccErrorMatcher(errors, step.path);
                    if (!(0, builder_1.staleFiles)(step, [objpath])) return [3 /*break*/, 2];
                    return [4 /*yield*/, wasmutils_1.emglobal.armtcc({
                            instantiateWasm: (0, wasmutils_1.moduleInstFn)('arm-tcc'),
                            noInitialRun: true,
                            print: error_fn,
                            printErr: error_fn,
                        })];
                case 1:
                    armtcc = _a.sent();
                    args = ['-L.', '-nostdlib', '-nostdinc',
                        '-Wl,--oformat=elf32-arm',
                        //'-Wl,-section-alignment=0x100000',
                        '-gdwarf-2',
                        '-o', objpath];
                    if (params.define) {
                        params.define.forEach(function (x) { return args.push('-D' + x); });
                    }
                    args = args.concat(step.files);
                    if (params.extra_link_args) {
                        args = args.concat(params.extra_link_args);
                    }
                    FS = armtcc.FS;
                    (0, builder_1.populateExtraFiles)(step, FS, params.extra_link_files);
                    (0, builder_1.populateFiles)(step, FS);
                    (0, wasmutils_1.execMain)(step, armtcc, args);
                    if (errors.length)
                        return [2 /*return*/, { errors: errors }];
                    objout = FS.readFile(objpath, { encoding: 'binary' });
                    (0, builder_1.putWorkFile)(objpath, objout);
                    if (!(0, builder_1.anyTargetChanged)(step, [objpath]))
                        return [2 /*return*/];
                    elfparser = new binutils_1.ELFParser(objout);
                    maxaddr_1 = 0;
                    elfparser.sectionHeaders.forEach(function (section, index) {
                        maxaddr_1 = Math.max(maxaddr_1, section.vmaddr + section.size);
                    });
                    rom_1 = new Uint8Array(maxaddr_1);
                    elfparser.sectionHeaders.forEach(function (section, index) {
                        if (section.flags & 0x2) {
                            var data = objout.slice(section.offset, section.offset + section.size);
                            //console.log(section.name, section.vmaddr.toString(16), data);
                            rom_1.set(data, section.vmaddr);
                        }
                    });
                    obj32 = new Uint32Array(rom_1.buffer);
                    start = elfparser.entry;
                    obj32[0] = start; // set reset vector
                    obj32[1] = start; // set undefined vector
                    obj32[2] = start; // set swi vector
                    obj32[3] = start; // set prefetch abort vector
                    obj32[4] = start; // set data abort vector
                    obj32[5] = start; // set reserved vector
                    obj32[6] = start; // set irq vector
                    obj32[7] = start; // set fiq vector
                    symbolmap_1 = {};
                    elfparser.getSymbols().forEach(function (symbol, index) {
                        symbolmap_1[symbol.name] = symbol.value;
                    });
                    segments_1 = [];
                    elfparser.sectionHeaders.forEach(function (section, index) {
                        if ((section.flags & 0x2) && section.size) {
                            segments_1.push({
                                name: section.name,
                                start: section.vmaddr,
                                size: section.size,
                                type: section.type,
                            });
                        }
                    });
                    listings_1 = {};
                    dwarf = new binutils_1.DWARFParser(elfparser);
                    dwarf.lineInfos.forEach(function (lineInfo) {
                        lineInfo.files.forEach(function (file) {
                            if (!file || !file.lines)
                                return;
                            file.lines.forEach(function (line) {
                                var filename = line.file;
                                var offset = line.address;
                                var path = (0, builder_1.getPrefix)(filename) + '.lst';
                                var linenum = line.line;
                                var lst = listings_1[path];
                                if (lst == null) {
                                    lst = listings_1[path] = { lines: [] };
                                }
                                lst.lines.push({
                                    path: path,
                                    line: linenum,
                                    offset: offset
                                });
                            });
                        });
                    });
                    //console.log(listings);
                    return [2 /*return*/, {
                            output: rom_1, //.slice(0x34),
                            listings: listings_1,
                            errors: errors,
                            symbolmap: symbolmap_1,
                            segments: segments_1,
                            debuginfo: dwarf
                        }];
                case 2: return [2 /*return*/];
            }
        });
    });
}

});


// ── /tmp/8bitworkshop/gen/common/tokenizer ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/tokenizer", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tokenizer = exports.TokenizerRuleSet = exports.TokenRule = exports.Token = exports.TokenType = exports.CompileError = void 0;
exports.mergeLocs = mergeLocs;
var CompileError = /** @class */ (function (_super) {
    __extends(CompileError, _super);
    function CompileError(msg, loc) {
        var _this = _super.call(this, msg) || this;
        Object.setPrototypeOf(_this, CompileError.prototype);
        _this.$loc = loc;
        return _this;
    }
    return CompileError;
}(Error));
exports.CompileError = CompileError;
function mergeLocs(a, b) {
    return {
        line: Math.min(a.line, b.line),
        start: Math.min(a.start, b.start),
        end: Math.max(a.end, b.end),
        label: a.label || b.label,
        path: a.path || b.path,
    };
}
var TokenType;
(function (TokenType) {
    TokenType["EOF"] = "eof";
    TokenType["EOL"] = "eol";
    TokenType["Ident"] = "ident";
    TokenType["Comment"] = "comment";
    TokenType["Ignore"] = "ignore";
    TokenType["CatchAll"] = "catch-all";
})(TokenType || (exports.TokenType = TokenType = {}));
var Token = /** @class */ (function () {
    function Token() {
    }
    return Token;
}());
exports.Token = Token;
var TokenRule = /** @class */ (function () {
    function TokenRule() {
    }
    return TokenRule;
}());
exports.TokenRule = TokenRule;
var CATCH_ALL_RULES = [
    { type: TokenType.CatchAll, regex: /.+?/ }
];
function re_escape(rule) {
    return "(".concat(rule.regex.source, ")");
}
var TokenizerRuleSet = /** @class */ (function () {
    function TokenizerRuleSet(rules) {
        this.rules = rules.concat(CATCH_ALL_RULES);
        var pattern = this.rules.map(re_escape).join('|');
        this.regex = new RegExp(pattern, "gs"); // global, dotall
    }
    return TokenizerRuleSet;
}());
exports.TokenizerRuleSet = TokenizerRuleSet;
var Tokenizer = /** @class */ (function () {
    function Tokenizer() {
        this.errorOnCatchAll = false;
        this.deferred = [];
        this.errors = [];
        this.lineno = 0;
        this.lineindex = [];
        this.tokens = [];
    }
    Tokenizer.prototype.setTokenRuleSet = function (ruleset) {
        this.ruleset = ruleset;
    };
    Tokenizer.prototype.setTokenRules = function (rules) {
        this.setTokenRuleSet(new TokenizerRuleSet(rules));
    };
    Tokenizer.prototype.tokenizeFile = function (contents, path) {
        this.path = path;
        var m;
        var re = /\n|\r\n?/g;
        this.lineindex.push(0);
        while (m = re.exec(contents)) {
            this.lineindex.push(m.index);
        }
        this._tokenize(contents);
        this.eof = { type: TokenType.EOF, str: "", eol: true, $loc: { path: this.path, line: this.lineno } };
        this.pushToken(this.eof);
    };
    Tokenizer.prototype._tokenize = function (text) {
        // iterate over each token via re_toks regex
        var m;
        this.lineno = 0;
        while (m = this.ruleset.regex.exec(text)) {
            var found = false;
            // find line #
            while (m.index >= this.lineindex[this.lineno]) {
                this.lineno++;
            }
            // find out which capture group was matched, and thus token type
            var rules = this.ruleset.rules;
            for (var i = 0; i < rules.length; i++) {
                var s = m[i + 1];
                if (s != null) {
                    found = true;
                    var col = m.index - (this.lineindex[this.lineno - 1] || -1) - 1;
                    var loc = { path: this.path, line: this.lineno, start: col, end: col + s.length };
                    var rule = rules[i];
                    // add token to list
                    switch (rule.type) {
                        case TokenType.CatchAll:
                            if (this.errorOnCatchAll) {
                                this.compileError("I didn't expect the character \"".concat(m[0], "\" here."), loc);
                            }
                        default:
                            this.pushToken({ str: s, type: rule.type, $loc: loc, eol: false });
                            break;
                        case TokenType.EOL:
                            // set EOL for last token
                            if (this.tokens.length)
                                this.tokens[this.tokens.length - 1].eol = true;
                        case TokenType.Comment:
                        case TokenType.Ignore:
                            break;
                    }
                    break;
                }
            }
            if (!found) {
                this.compileError("Could not parse token: <<".concat(m[0], ">>"));
            }
        }
    };
    Tokenizer.prototype.pushToken = function (token) {
        this.tokens.push(token);
    };
    Tokenizer.prototype.addError = function (msg, loc) {
        var tok = this.lasttoken || this.peekToken();
        if (!loc)
            loc = tok.$loc;
        this.errors.push({ path: loc.path, line: loc.line, label: this.curlabel, start: loc.start, end: loc.end, msg: msg });
    };
    Tokenizer.prototype.internalError = function () {
        return this.compileError("Internal error.");
    };
    Tokenizer.prototype.notImplementedError = function () {
        return this.compileError("Not yet implemented.");
    };
    Tokenizer.prototype.compileError = function (msg, loc, loc2) {
        this.addError(msg, loc);
        //if (loc2 != null) this.addError(`...`, loc2);
        var e = new CompileError(msg, loc);
        throw e;
        return e;
    };
    Tokenizer.prototype.peekToken = function (lookahead) {
        var tok = this.tokens[lookahead || 0];
        return tok ? tok : this.eof;
    };
    Tokenizer.prototype.consumeToken = function () {
        var tok = this.lasttoken = (this.tokens.shift() || this.eof);
        return tok;
    };
    Tokenizer.prototype.ifToken = function (match) {
        if (this.peekToken().str == match)
            return this.consumeToken();
    };
    Tokenizer.prototype.expectToken = function (str, msg) {
        var tok = this.consumeToken();
        var tokstr = tok.str;
        if (str != tokstr) {
            this.compileError(msg || "There should be a \"".concat(str, "\" here."));
        }
        return tok;
    };
    Tokenizer.prototype.expectTokens = function (strlist, msg) {
        var tok = this.consumeToken();
        var tokstr = tok.str;
        if (!strlist.includes(tokstr)) {
            this.compileError(msg || "These keywords are valid here: ".concat(strlist.join(', ')));
        }
        return tok;
    };
    Tokenizer.prototype.parseModifiers = function (modifiers) {
        var result = {};
        do {
            var tok = this.peekToken();
            if (modifiers.indexOf(tok.str) < 0)
                return result;
            this.consumeToken();
            result[tok.str] = true;
        } while (tok != null);
    };
    Tokenizer.prototype.expectIdent = function (msg) {
        var tok = this.consumeToken();
        if (tok.type != TokenType.Ident)
            this.compileError(msg || "There should be an identifier here.");
        return tok;
    };
    Tokenizer.prototype.pushbackToken = function (tok) {
        this.tokens.unshift(tok);
    };
    Tokenizer.prototype.isEOF = function () {
        return this.tokens.length == 0 || this.peekToken().type == 'eof'; // TODO?
    };
    Tokenizer.prototype.expectEOL = function (msg) {
        var tok = this.consumeToken();
        if (tok.type != TokenType.EOL)
            this.compileError(msg || "There's too much stuff on this line.");
    };
    Tokenizer.prototype.skipBlankLines = function () {
        this.skipTokenTypes(['eol']);
    };
    Tokenizer.prototype.skipTokenTypes = function (types) {
        while (types.includes(this.peekToken().type))
            this.consumeToken();
    };
    Tokenizer.prototype.expectTokenTypes = function (types, msg) {
        var tok = this.consumeToken();
        if (!types.includes(tok.type))
            this.compileError(msg || "There should be a ".concat(types.map(function (s) { return "\"".concat(s, "\""); }).join(' or '), " here. not a \"").concat(tok.type, "\"."));
        return tok;
    };
    Tokenizer.prototype.parseList = function (parseFunc, delim) {
        var sep;
        var list = [];
        do {
            var el = parseFunc.bind(this)(); // call parse function
            if (el != null)
                list.push(el); // add parsed element to list
            sep = this.consumeToken(); // consume seperator token
        } while (sep.str == delim);
        this.pushbackToken(sep);
        return list;
    };
    Tokenizer.prototype.runDeferred = function () {
        while (this.deferred.length) {
            this.deferred.shift()();
        }
    };
    return Tokenizer;
}());
exports.Tokenizer = Tokenizer;

});


// ── /tmp/8bitworkshop/gen/common/ecs/binpack ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/ecs/binpack", function(module, exports, __require) {
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Packer = exports.Bin = void 0;
var debug = false;
var BoxPlacement;
(function (BoxPlacement) {
    BoxPlacement[BoxPlacement["TopLeft"] = 0] = "TopLeft";
    BoxPlacement[BoxPlacement["TopRight"] = 1] = "TopRight";
    BoxPlacement[BoxPlacement["BottomLeft"] = 2] = "BottomLeft";
    BoxPlacement[BoxPlacement["BottomRight"] = 3] = "BottomRight";
})(BoxPlacement || (BoxPlacement = {}));
function boxesIntersect(a, b) {
    return !(b.left >= a.right || b.right <= a.left || b.top >= a.bottom || b.bottom <= a.top);
}
function boxesContain(a, b) {
    return b.left >= a.left && b.top >= a.top && b.right <= a.right && b.bottom <= a.bottom;
}
var Bin = /** @class */ (function () {
    function Bin(binbounds) {
        this.binbounds = binbounds;
        this.boxes = [];
        this.free = [];
        this.extents = { left: 0, top: 0, right: 0, bottom: 0 };
        this.free.push(binbounds);
    }
    Bin.prototype.getBoxes = function (bounds, limit, boxes) {
        var result = [];
        if (!boxes)
            boxes = this.boxes;
        for (var _i = 0, boxes_1 = boxes; _i < boxes_1.length; _i++) {
            var box = boxes_1[_i];
            //console.log(bounds, box, boxesIntersect(bounds, box))
            if (boxesIntersect(bounds, box)) {
                result.push(box);
                if (result.length >= limit)
                    break;
            }
        }
        return result;
    };
    Bin.prototype.fits = function (b) {
        if (!boxesContain(this.binbounds, b)) {
            if (debug)
                console.log('out of bounds!', b.left, b.top, b.right, b.bottom);
            return false;
        }
        if (this.getBoxes(b, 1).length > 0) {
            if (debug)
                console.log('intersect!', b.left, b.top, b.right, b.bottom);
            return false;
        }
        return true;
    };
    Bin.prototype.bestFit = function (b) {
        var bestscore = 0;
        var best = null;
        for (var _i = 0, _a = this.free; _i < _a.length; _i++) {
            var f = _a[_i];
            if (b.left != null && b.left < f.left)
                continue;
            if (b.left != null && b.left + b.width > f.right)
                continue;
            if (b.top != null && b.top < f.top)
                continue;
            if (b.top != null && b.top + b.height > f.bottom)
                continue;
            var dx = (f.right - f.left) - b.width;
            var dy = (f.bottom - f.top) - b.height;
            if (dx >= 0 && dy >= 0) {
                var score = 1 / (1 + dx + dy + f.left * 0.001);
                if (score > bestscore) {
                    best = f;
                    bestscore = score;
                    if (score == 1)
                        break;
                }
            }
        }
        return best;
    };
    Bin.prototype.anyFit = function (b) {
        var bestscore = 0;
        var best = null;
        for (var _i = 0, _a = this.free; _i < _a.length; _i++) {
            var f = _a[_i];
            var box = {
                left: b.left != null ? b.left : f.left,
                right: f.left + b.width,
                top: b.top != null ? b.top : f.top,
                bottom: f.top + b.height
            };
            if (this.fits(box)) {
                var score = 1 / (1 + box.left + box.top);
                if (score > bestscore) {
                    best = f;
                    if (score == 1)
                        break;
                }
            }
        }
        return best;
    };
    Bin.prototype.add = function (b) {
        if (debug)
            console.log('add', b.left, b.top, b.right, b.bottom);
        if (!this.fits(b)) {
            //console.log('collided with', this.getBoxes(b, 1));
            throw new Error("bad fit ".concat(b.left, " ").concat(b.top, " ").concat(b.right, " ").concat(b.bottom));
        }
        // add box to list
        this.boxes.push(b);
        this.extents.right = Math.max(this.extents.right, b.right);
        this.extents.bottom = Math.max(this.extents.bottom, b.bottom);
        // delete bin
        for (var _i = 0, _a = b.parents; _i < _a.length; _i++) {
            var p = _a[_i];
            var i = this.free.indexOf(p);
            if (i < 0)
                throw new Error('cannot find parent');
            if (debug)
                console.log('removed', p.left, p.top, p.right, p.bottom);
            this.free.splice(i, 1);
            // split into new bins
            // make long columns
            this.addFree(p.left, p.top, b.left, p.bottom);
            this.addFree(b.right, p.top, p.right, p.bottom);
            // make top caps
            this.addFree(b.left, p.top, b.right, b.top);
            this.addFree(b.left, b.bottom, b.right, p.bottom);
        }
    };
    Bin.prototype.addFree = function (left, top, right, bottom) {
        if (bottom > top && right > left) {
            var b = { left: left, top: top, right: right, bottom: bottom };
            if (debug)
                console.log('free', b.left, b.top, b.right, b.bottom);
            this.free.push(b);
        }
        // TODO: merge free boxes?
    };
    return Bin;
}());
exports.Bin = Bin;
var Packer = /** @class */ (function () {
    function Packer() {
        this.bins = [];
        this.boxes = [];
        this.defaultPlacement = BoxPlacement.TopLeft; //TODO
    }
    Packer.prototype.pack = function () {
        for (var _i = 0, _a = this.boxes; _i < _a.length; _i++) {
            var bc = _a[_i];
            var box = this.bestPlacement(bc);
            if (!box)
                return false;
            box.bin.add(box);
            bc.box = box;
        }
        return true;
    };
    Packer.prototype.bestPlacement = function (b) {
        for (var _i = 0, _a = this.bins; _i < _a.length; _i++) {
            var bin = _a[_i];
            var parent_1 = bin.bestFit(b);
            var approx = false;
            if (!parent_1) {
                parent_1 = bin.anyFit(b);
                approx = true;
                if (debug)
                    console.log('anyfit', parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.left, parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.top);
            }
            if (parent_1) {
                var place = this.defaultPlacement;
                var box = {
                    left: parent_1.left,
                    top: parent_1.top,
                    right: parent_1.left + b.width,
                    bottom: parent_1.top + b.height
                };
                if (b.left != null) {
                    box.left = b.left;
                    box.right = b.left + b.width;
                }
                if (b.top != null) {
                    box.top = b.top;
                    box.bottom = b.top + b.height;
                }
                if (place == BoxPlacement.BottomLeft || place == BoxPlacement.BottomRight) {
                    var h = box.bottom - box.top;
                    box.top = parent_1.bottom - h;
                    box.bottom = parent_1.bottom;
                }
                if (place == BoxPlacement.TopRight || place == BoxPlacement.BottomRight) {
                    var w = box.right - box.left;
                    box.left = parent_1.right - w;
                    box.right = parent_1.right;
                }
                if (debug)
                    console.log('place', b.label, box.left, box.top, box.right, box.bottom, parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.left, parent_1 === null || parent_1 === void 0 ? void 0 : parent_1.top);
                var parents = [parent_1];
                // if approx match, might overlap multiple free boxes
                if (approx)
                    parents = bin.getBoxes(box, 100, bin.free);
                return __assign({ parents: parents, place: place, bin: bin }, box);
            }
        }
        if (debug)
            console.log('cannot place!', b.left, b.top, b.width, b.height);
        return null;
    };
    Packer.prototype.toSVG = function () {
        var s = '';
        var r = { width: 100, height: 70 };
        for (var _i = 0, _a = this.bins; _i < _a.length; _i++) {
            var bin = _a[_i];
            r.width = Math.max(r.width, bin.binbounds.right);
            r.height = Math.max(r.height, bin.binbounds.bottom);
        }
        s += "<svg viewBox=\"0 0 ".concat(r.width, " ").concat(r.height, "\" xmlns=\"http://www.w3.org/2000/svg\"><style><![CDATA[text {font: 1px sans-serif;}]]></style>");
        for (var _b = 0, _c = this.bins; _b < _c.length; _b++) {
            var bin = _c[_b];
            var be = bin.extents;
            s += '<g>';
            s += "<rect width=\"".concat(be.right - be.left, "\" height=\"").concat(be.bottom - be.top, "\" stroke=\"black\" stroke-width=\"0.5\" fill=\"none\"/>");
            var textx = be.right + 1;
            var texty = 0;
            for (var _d = 0, _e = this.boxes; _d < _e.length; _d++) {
                var box = _e[_d];
                var b = box.box;
                if (b) {
                    if (b.bin == bin)
                        s += "<rect width=\"".concat(b.right - b.left, "\" height=\"").concat(b.bottom - b.top, "\" x=\"").concat(b.left, "\" y=\"").concat(b.top, "\" stroke=\"black\" stroke-width=\"0.25\" fill=\"#ccc\"/>");
                    if (b.top == texty)
                        textx += 10;
                    else
                        textx = be.right + 1;
                    texty = b.top;
                    if (box.label)
                        s += "<text x=\"".concat(textx, "\" y=\"").concat(texty, "\" height=\"1\">").concat(box.label, "</text>");
                }
            }
            /*
            for (let b of bin.free) {
                s += `<rect width="${b.right-b.left}" height="${b.bottom-b.top}" x="${b.left}" y="${b.top}" stroke="red" stroke-width="0.1" fill="none"/>`;
            }
            */
            s += '</g>';
        }
        s += "</svg>";
        return s;
    };
    Packer.prototype.toSVGUrl = function () {
        return "data:image/svg+xml;base64,".concat(btoa(this.toSVG()));
    };
    return Packer;
}());
exports.Packer = Packer;

});


// ── /tmp/8bitworkshop/gen/common/ecs/ecs ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/ecs/ecs", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityManager = exports.EntityScope = exports.SourceFileExport = exports.Dialect_CA65 = exports.CodePlaceholderNode = exports.CodeLiteralNode = exports.ActionNode = exports.SELECT_TYPE = exports.SystemStats = exports.ECSError = void 0;
exports.isLiteral = isLiteral;
exports.isLiteralInt = isLiteralInt;
exports.isLookup = isLookup;
exports.isBinOp = isBinOp;
exports.isUnOp = isUnOp;
exports.isBlockStmt = isBlockStmt;
exports.isInlineCode = isInlineCode;
exports.isQueryExpr = isQueryExpr;
var binpack_1 = __require("/tmp/8bitworkshop/gen/common/ecs/binpack");
var ECSError = /** @class */ (function (_super) {
    __extends(ECSError, _super);
    function ECSError(msg, obj) {
        var _this = _super.call(this, msg) || this;
        _this.$sources = [];
        Object.setPrototypeOf(_this, ECSError.prototype);
        if (obj)
            _this.$loc = obj.$loc || obj;
        return _this;
    }
    return ECSError;
}(Error));
exports.ECSError = ECSError;
function mksymbol(c, fieldName) {
    return c.name + '_' + fieldName;
}
function mkscopesymbol(s, c, fieldName) {
    return s.name + '_' + c.name + '_' + fieldName;
}
var SystemStats = /** @class */ (function () {
    function SystemStats() {
    }
    return SystemStats;
}());
exports.SystemStats = SystemStats;
exports.SELECT_TYPE = ['once', 'foreach', 'join', 'with', 'if', 'select', 'unroll'];
var ActionNode = /** @class */ (function () {
    function ActionNode(owner, $loc) {
        this.owner = owner;
        this.$loc = $loc;
    }
    return ActionNode;
}());
exports.ActionNode = ActionNode;
var CodeLiteralNode = /** @class */ (function (_super) {
    __extends(CodeLiteralNode, _super);
    function CodeLiteralNode(owner, $loc, text) {
        var _this = _super.call(this, owner, $loc) || this;
        _this.text = text;
        return _this;
    }
    return CodeLiteralNode;
}(ActionNode));
exports.CodeLiteralNode = CodeLiteralNode;
var CodePlaceholderNode = /** @class */ (function (_super) {
    __extends(CodePlaceholderNode, _super);
    function CodePlaceholderNode(owner, $loc, args) {
        var _this = _super.call(this, owner, $loc) || this;
        _this.args = args;
        return _this;
    }
    return CodePlaceholderNode;
}(ActionNode));
exports.CodePlaceholderNode = CodePlaceholderNode;
function isLiteral(arg) {
    return arg.value != null;
}
function isLiteralInt(arg) {
    return isLiteral(arg) && arg.valtype.dtype == 'int';
}
function isLookup(arg) {
    return arg.name != null;
}
function isBinOp(arg) {
    return arg.op != null && arg.left != null && arg.right != null;
}
function isUnOp(arg) {
    return arg.op != null && arg.expr != null;
}
function isBlockStmt(arg) {
    return arg.stmts != null;
}
function isInlineCode(arg) {
    return arg.code != null;
}
function isQueryExpr(arg) {
    return arg.query != null;
}
/// DIALECT
var Dialect_CA65 = /** @class */ (function () {
    function Dialect_CA65() {
        this.ASM_ITERATE_EACH_ASC = "\n    ldx #0\n@__each:\n    {{%code}}\n    inx\n    cpx #{{%ecount}}\n    jne @__each\n@__exit:\n";
        this.ASM_ITERATE_EACH_DESC = "\n    ldx #{{%ecount}}-1\n@__each:\n    {{%code}}\n    dex\n    jpl @__each\n@__exit:\n";
        this.ASM_ITERATE_JOIN_ASC = "\n    ldy #0\n@__each:\n    ldx {{%joinfield}},y\n    {{%code}}\n    iny\n    cpy #{{%ecount}}\n    jne @__each\n@__exit:\n";
        this.ASM_ITERATE_JOIN_DESC = "\n    ldy #{{%ecount}}-1\n@__each:\n    ldx {{%joinfield}},y\n    {{%code}}\n    dey\n    jpl @__each\n@__exit:\n";
        this.ASM_FILTER_RANGE_LO_X = "\n    cpx #{{%xofs}}\n    jcc @__skipxlo\n    {{%code}}\n@__skipxlo:\n";
        this.ASM_FILTER_RANGE_HI_X = "\n    cpx #{{%xofs}}+{{%ecount}}\n    jcs @__skipxhi\n    {{%code}}\n@__skipxhi:\n";
        this.ASM_LOOKUP_REF_X = "\n    ldx {{%reffield}}\n    {{%code}}\n";
        this.INIT_FROM_ARRAY = "\n    ldy #{{%nbytes}}\n:   lda {{%src}}-1,y\n    sta {{%dest}}-1,y\n    dey\n    bne :-\n";
    }
    Dialect_CA65.prototype.comment = function (s) {
        return "\n;;; ".concat(s, "\n");
    };
    Dialect_CA65.prototype.absolute = function (ident, offset) {
        return this.addOffset(ident, offset || 0);
    };
    Dialect_CA65.prototype.addOffset = function (ident, offset) {
        if (offset > 0)
            return "".concat(ident, "+").concat(offset);
        if (offset < 0)
            return "".concat(ident, "-").concat(-offset);
        return ident;
    };
    Dialect_CA65.prototype.indexed_x = function (ident, offset) {
        return this.addOffset(ident, offset) + ',x';
    };
    Dialect_CA65.prototype.indexed_y = function (ident, offset) {
        return this.addOffset(ident, offset) + ',y';
    };
    Dialect_CA65.prototype.fieldsymbol = function (component, field, bitofs) {
        return "".concat(component.name, "_").concat(field.name, "_b").concat(bitofs);
    };
    Dialect_CA65.prototype.datasymbol = function (component, field, eid, bitofs) {
        return "".concat(component.name, "_").concat(field.name, "_e").concat(eid, "_b").concat(bitofs);
    };
    Dialect_CA65.prototype.debug_file = function (path) {
        return ".dbg file, \"".concat(path, "\", 0, 0");
    };
    Dialect_CA65.prototype.debug_line = function (path, line) {
        return ".dbg line, \"".concat(path, "\", ").concat(line);
    };
    Dialect_CA65.prototype.startScope = function (name) {
        return ".scope ".concat(name);
    };
    Dialect_CA65.prototype.endScope = function (name) {
        return ".endscope\n".concat(this.scopeSymbol(name), " = ").concat(name, "::__Start");
    };
    Dialect_CA65.prototype.scopeSymbol = function (name) {
        return "".concat(name, "__Start");
    };
    Dialect_CA65.prototype.align = function (value) {
        return value > 0 ? ".align ".concat(value) : '';
    };
    Dialect_CA65.prototype.warningIfPageCrossed = function (startlabel) {
        return "\n.assert >(".concat(startlabel, ") = >(*), warning, \"").concat(startlabel, " crosses a page boundary!\"");
    };
    Dialect_CA65.prototype.warningIfMoreThan = function (bytes, startlabel) {
        return "\n.assert (* - ".concat(startlabel, ") <= ").concat(bytes, ", warning, .sprintf(\"").concat(startlabel, " does not fit in ").concat(bytes, " bytes, it took %d!\", (* - ").concat(startlabel, "))");
    };
    Dialect_CA65.prototype.segment = function (segtype) {
        if (segtype == 'bss') {
            return ".zeropage";
        }
        else if (segtype == 'rodata') {
            return '.rodata';
        }
        else {
            return ".code";
        }
    };
    Dialect_CA65.prototype.label = function (sym) {
        return "".concat(sym, ":");
    };
    Dialect_CA65.prototype.export = function (sym) {
        return ".export _".concat(sym, " = ").concat(sym);
    };
    Dialect_CA65.prototype.byte = function (b) {
        if (b === undefined) {
            return ".res 1";
        }
        else if (typeof b === 'number') {
            if (b < 0 || b > 255)
                throw new ECSError("out of range byte ".concat(b));
            return ".byte ".concat(b);
        }
        else {
            if (b.bitofs == 0)
                return ".byte <".concat(b.symbol);
            else if (b.bitofs == 8)
                return ".byte >".concat(b.symbol);
            else
                return ".byte ((".concat(b.symbol, " >> ").concat(b.bitofs, ")&255)");
        }
    };
    Dialect_CA65.prototype.tempLabel = function (inst) {
        return "".concat(inst.system.name, "__").concat(inst.id, "__tmp");
    };
    Dialect_CA65.prototype.equate = function (symbol, value) {
        return "".concat(symbol, " = ").concat(value);
    };
    Dialect_CA65.prototype.define = function (symbol, value) {
        if (value)
            return ".define ".concat(symbol, " ").concat(value);
        else
            return ".define ".concat(symbol);
    };
    Dialect_CA65.prototype.call = function (symbol) {
        return " jsr ".concat(symbol);
    };
    Dialect_CA65.prototype.jump = function (symbol) {
        return " jmp ".concat(symbol);
    };
    Dialect_CA65.prototype.return = function () {
        return ' rts';
    };
    return Dialect_CA65;
}());
exports.Dialect_CA65 = Dialect_CA65;
// TODO: merge with Dialect?
var SourceFileExport = /** @class */ (function () {
    function SourceFileExport() {
        this.lines = [];
    }
    SourceFileExport.prototype.line = function (s) {
        this.text(s);
    };
    SourceFileExport.prototype.text = function (s) {
        for (var _i = 0, _a = s.split('\n'); _i < _a.length; _i++) {
            var l = _a[_i];
            this.lines.push(l);
        }
    };
    SourceFileExport.prototype.toString = function () {
        return this.lines.join('\n');
    };
    return SourceFileExport;
}());
exports.SourceFileExport = SourceFileExport;
var CodeSegment = /** @class */ (function () {
    function CodeSegment() {
        this.codefrags = [];
    }
    CodeSegment.prototype.addCodeFragment = function (code) {
        this.codefrags.push(code);
    };
    CodeSegment.prototype.dump = function (file) {
        for (var _i = 0, _a = this.codefrags; _i < _a.length; _i++) {
            var code = _a[_i];
            file.text(code);
        }
    };
    return CodeSegment;
}());
var DataSegment = /** @class */ (function () {
    function DataSegment() {
        this.symbols = {};
        this.equates = {};
        this.ofs2sym = new Map();
        this.fieldranges = {};
        this.size = 0;
        this.initdata = [];
    }
    DataSegment.prototype.allocateBytes = function (name, bytes) {
        var ofs = this.symbols[name];
        if (ofs == null) {
            ofs = this.size;
            this.declareSymbol(name, ofs);
            this.size += bytes;
        }
        return ofs;
    };
    DataSegment.prototype.declareSymbol = function (name, ofs) {
        var _a;
        this.symbols[name] = ofs;
        if (!this.ofs2sym.has(ofs))
            this.ofs2sym.set(ofs, []);
        (_a = this.ofs2sym.get(ofs)) === null || _a === void 0 ? void 0 : _a.push(name);
    };
    // TODO: ordering should not matter, but it does
    DataSegment.prototype.findExistingInitData = function (bytes) {
        for (var i = 0; i < this.size - bytes.length; i++) {
            for (var j = 0; j < bytes.length; j++) {
                if (this.initdata[i + j] !== bytes[j])
                    break;
            }
            if (j == bytes.length)
                return i;
        }
        return -1;
    };
    DataSegment.prototype.allocateInitData = function (name, bytes) {
        var ofs = this.findExistingInitData(bytes);
        if (ofs >= 0) {
            this.declareSymbol(name, ofs);
        }
        else {
            ofs = this.allocateBytes(name, bytes.length);
            for (var i = 0; i < bytes.length; i++) {
                this.initdata[ofs + i] = bytes[i];
            }
        }
    };
    DataSegment.prototype.dump = function (file, dialect, doExport) {
        // TODO: fewer lines
        for (var i = 0; i < this.size; i++) {
            var syms = this.ofs2sym.get(i);
            if (syms) {
                for (var _i = 0, syms_1 = syms; _i < syms_1.length; _i++) {
                    var sym = syms_1[_i];
                    if (doExport)
                        file.line(dialect.export(sym)); // TODO: this is a hack for C export
                    file.line(dialect.label(sym));
                }
            }
            file.line(dialect.byte(this.initdata[i]));
        }
        for (var _a = 0, _b = Object.entries(this.equates); _a < _b.length; _a++) {
            var _c = _b[_a], symbol = _c[0], value = _c[1];
            file.line(dialect.equate(symbol, value));
        }
    };
    // TODO: move cfname functions in here too
    DataSegment.prototype.getFieldRange = function (component, fieldName) {
        return this.fieldranges[mksymbol(component, fieldName)];
    };
    DataSegment.prototype.getByteOffset = function (range, access, entityID) {
        if (entityID < range.elo)
            throw new ECSError("entity ID ".concat(entityID, " too low for ").concat(access.symbol));
        if (entityID > range.ehi)
            throw new ECSError("entity ID ".concat(entityID, " too high for ").concat(access.symbol));
        var ofs = this.symbols[access.symbol];
        if (ofs !== undefined) {
            return ofs + entityID - range.elo;
        }
        throw new ECSError("cannot find field access for ".concat(access.symbol));
    };
    DataSegment.prototype.getOriginSymbol = function () {
        var a = this.ofs2sym.get(0);
        if (!a)
            throw new ECSError('getOriginSymbol(): no symbol at offset 0'); // TODO
        return a[0];
    };
    return DataSegment;
}());
var UninitDataSegment = /** @class */ (function (_super) {
    __extends(UninitDataSegment, _super);
    function UninitDataSegment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UninitDataSegment;
}(DataSegment));
var ConstDataSegment = /** @class */ (function (_super) {
    __extends(ConstDataSegment, _super);
    function ConstDataSegment() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return ConstDataSegment;
}(DataSegment));
// TODO: none of this makes sense
function getFieldBits(f) {
    //let n = Math.abs(f.lo) + f.hi + 1;
    var n = f.hi - f.lo + 1;
    return Math.ceil(Math.log2(n));
}
function getFieldLength(f) {
    if (f.dtype == 'int') {
        return f.hi - f.lo + 1;
    }
    else {
        return 1; //TODO?
    }
}
function getPackedFieldSize(f, constValue) {
    if (f.dtype == 'int') {
        return getFieldBits(f);
    }
    if (f.dtype == 'array' && f.index) {
        return 0; // TODO? getFieldLength(f.index) * getPackedFieldSize(f.elem);
    }
    if (f.dtype == 'array' && constValue != null && Array.isArray(constValue)) {
        return constValue.length * getPackedFieldSize(f.elem);
    }
    if (f.dtype == 'ref') {
        return 8; // TODO: > 256 entities?
    }
    return 0;
}
var EntitySet = /** @class */ (function () {
    function EntitySet(scope, query, e) {
        this.scope = scope;
        if (query) {
            if (query.entities) {
                this.entities = query.entities.slice(0);
            }
            else {
                this.atypes = scope.em.archetypesMatching(query);
                this.entities = scope.entitiesMatching(this.atypes);
            }
            // TODO: desc?
            if (query.limit) {
                this.entities = this.entities.slice(0, query.limit);
            }
        }
        else if (e) {
            this.entities = e;
        }
        else {
            throw new ECSError('invalid EntitySet constructor');
        }
        if (!this.atypes) {
            var at = new Set();
            for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
                var e_1 = _a[_i];
                at.add(e_1.etype);
            }
            this.atypes = Array.from(at.values());
        }
    }
    EntitySet.prototype.contains = function (c, f, where) {
        // TODO: action for error msg
        return this.scope.em.singleComponentWithFieldName(this.atypes, f.name, where);
    };
    EntitySet.prototype.intersection = function (qr) {
        var ents = this.entities.filter(function (e) { return qr.entities.includes(e); });
        return new EntitySet(this.scope, undefined, ents);
    };
    EntitySet.prototype.union = function (qr) {
        // TODO: remove dups
        var ents = this.entities.concat(qr.entities);
        var atypes = this.atypes.concat(qr.atypes);
        return new EntitySet(this.scope, undefined, ents);
    };
    EntitySet.prototype.isContiguous = function () {
        if (this.entities.length == 0)
            return true;
        var id = this.entities[0].id;
        for (var i = 1; i < this.entities.length; i++) {
            if (this.entities[i].id != ++id)
                return false;
        }
        return true;
    };
    return EntitySet;
}());
var IndexRegister = /** @class */ (function () {
    function IndexRegister(scope, eset) {
        this.scope = scope;
        this.elo = 0;
        this.ehi = scope.entities.length - 1;
        this.lo = null;
        this.hi = null;
        if (eset) {
            this.narrowInPlace(eset);
        }
    }
    IndexRegister.prototype.entityCount = function () {
        return this.ehi - this.elo + 1;
    };
    IndexRegister.prototype.clone = function () {
        return Object.assign(new IndexRegister(this.scope), this);
    };
    IndexRegister.prototype.narrow = function (eset, action) {
        var i = this.clone();
        return i.narrowInPlace(eset, action) ? i : null;
    };
    IndexRegister.prototype.narrowInPlace = function (eset, action) {
        if (this.scope != eset.scope)
            throw new ECSError("scope mismatch", action);
        if (!eset.isContiguous())
            throw new ECSError("entities are not contiguous", action);
        if (this.eset) {
            this.eset = this.eset.intersection(eset);
        }
        else {
            this.eset = eset;
        }
        if (this.eset.entities.length == 0) {
            return false;
        }
        var newelo = this.eset.entities[0].id;
        var newehi = this.eset.entities[this.eset.entities.length - 1].id;
        if (this.lo === null || this.hi === null) {
            this.lo = 0;
            this.hi = newehi - newelo;
            this.elo = newelo;
            this.ehi = newehi;
        }
        else {
            //if (action) console.log((action as any).event, this.elo, '-', this.ehi, '->', newelo, '..', newehi);
            this.lo += newelo - this.elo;
            this.hi += newehi - this.ehi;
        }
        return true;
    };
    // TODO: removegi
    IndexRegister.prototype.offset = function () {
        return this.lo || 0;
    };
    return IndexRegister;
}());
// todo: generalize
var ActionCPUState = /** @class */ (function () {
    function ActionCPUState() {
        this.xreg = null;
        this.yreg = null;
    }
    return ActionCPUState;
}());
var ActionEval = /** @class */ (function () {
    //used = new Set<string>(); // TODO
    function ActionEval(scope, instance, action, eventargs) {
        this.scope = scope;
        this.instance = instance;
        this.action = action;
        this.eventargs = eventargs;
        this.tmplabel = '';
        this.em = scope.em;
        this.dialect = scope.em.dialect;
        this.tmplabel = this.dialect.tempLabel(this.instance);
        //let query = (this.action as ActionWithQuery).query;
        //TODO? if (query && this.entities.length == 0)
        //throw new ECSError(`query doesn't match any entities`, query); // TODO 
        this.seq = this.em.seq++;
        this.label = "".concat(this.instance.system.name, "__").concat(action.event, "__").concat(this.seq);
    }
    ActionEval.prototype.begin = function () {
    };
    ActionEval.prototype.end = function () {
    };
    ActionEval.prototype.codeToString = function () {
        var code = this.exprToCode(this.action.expr);
        return code;
    };
    ActionEval.prototype.replaceTags = function (code, action, props) {
        var _this = this;
        var tag_re = /\{\{(.+?)\}\}/g;
        code = code.replace(tag_re, function (entire, group) {
            var toks = group.split(/\s+/);
            if (toks.length == 0)
                throw new ECSError("empty command", action);
            var cmd = group.charAt(0);
            var arg0 = toks[0].substring(1).trim();
            var args = [arg0].concat(toks.slice(1));
            switch (cmd) {
                case '!': return _this.__emit(args);
                case '$': return _this.__local(args);
                case '^': return _this.__use(args);
                case '#': return _this.__arg(args);
                case '&': return _this.__eid(args);
                case '<': return _this.__get([arg0, '0']);
                case '>': return _this.__get([arg0, '8']);
                default:
                    var value = props[toks[0]];
                    if (value)
                        return value;
                    var fn = _this['__' + toks[0]];
                    if (fn)
                        return fn.bind(_this)(toks.slice(1));
                    throw new ECSError("unrecognized command {{".concat(toks[0], "}}"), action);
            }
        });
        return code;
    };
    ActionEval.prototype.replaceLabels = function (code) {
        var label_re = /@(\w+)\b/g;
        var seq = this.em.seq++;
        var label = "".concat(this.instance.system.name, "__").concat(this.action.event, "__").concat(seq);
        code = code.replace(label_re, function (s, a) { return "".concat(label, "__").concat(a); });
        return code;
    };
    ActionEval.prototype.__get = function (args) {
        return this.getset(args, false);
    };
    ActionEval.prototype.__set = function (args) {
        return this.getset(args, true);
    };
    ActionEval.prototype.getset = function (args, canwrite) {
        var fieldName = args[0];
        var bitofs = parseInt(args[1] || '0');
        return this.generateCodeForField(fieldName, bitofs, canwrite);
    };
    ActionEval.prototype.parseFieldArgs = function (args) {
        var fieldName = args[0];
        var bitofs = parseInt(args[1] || '0');
        var component = this.em.singleComponentWithFieldName(this.scope.state.working.atypes, fieldName, this.action);
        var field = component.fields.find(function (f) { return f.name == fieldName; });
        if (field == null)
            throw new ECSError("no field named \"".concat(fieldName, "\" in component"), this.action);
        return { component: component, field: field, bitofs: bitofs };
    };
    ActionEval.prototype.__base = function (args) {
        var _a = this.parseFieldArgs(args), component = _a.component, field = _a.field, bitofs = _a.bitofs;
        return this.dialect.fieldsymbol(component, field, bitofs);
    };
    ActionEval.prototype.__data = function (args) {
        var _a = this.parseFieldArgs(args), component = _a.component, field = _a.field, bitofs = _a.bitofs;
        var entities = this.scope.state.working.entities;
        if (entities.length != 1)
            throw new ECSError("data operates on exactly one entity", this.action); // TODO?
        var eid = entities[0].id; // TODO?
        return this.dialect.datasymbol(component, field, eid, bitofs);
    };
    ActionEval.prototype.__const = function (args) {
        var _a = this.parseFieldArgs(args), component = _a.component, field = _a.field, bitofs = _a.bitofs;
        var entities = this.scope.state.working.entities;
        if (entities.length != 1)
            throw new ECSError("const operates on exactly one entity", this.action); // TODO?
        var constVal = entities[0].consts[mksymbol(component, field.name)];
        if (constVal === undefined)
            throw new ECSError("field is not constant", this.action); // TODO?
        if (typeof constVal !== 'number')
            throw new ECSError("field is not numeric", this.action); // TODO?
        return constVal << bitofs;
    };
    ActionEval.prototype.__index = function (args) {
        // TODO: check select type and if we actually have an index...
        var ident = args[0];
        var index = parseInt(args[1] || '0');
        var entities = this.scope.state.working.entities;
        if (entities.length == 1) {
            return this.dialect.absolute(ident);
        }
        else {
            return this.dialect.indexed_x(ident, index); //TODO?
        }
    };
    ActionEval.prototype.__eid = function (args) {
        var e = this.scope.getEntityByName(args[0] || '?');
        if (!e)
            throw new ECSError("can't find entity named \"".concat(args[0], "\""), this.action);
        return e.id.toString();
    };
    ActionEval.prototype.__use = function (args) {
        return this.scope.includeResource(args[0]);
    };
    ActionEval.prototype.__emit = function (args) {
        var event = args[0];
        var eventargs = args.slice(1);
        try {
            return this.scope.generateCodeForEvent(event, eventargs);
        }
        catch (e) {
            if (e.$sources)
                e.$sources.push(this.action);
            throw e;
        }
    };
    ActionEval.prototype.__local = function (args) {
        var tempinc = parseInt(args[0]);
        var tempbytes = this.instance.system.tempbytes;
        if (isNaN(tempinc))
            throw new ECSError("bad temporary offset", this.action);
        if (!tempbytes)
            throw new ECSError("this system has no locals", this.action);
        if (tempinc < 0 || tempinc >= tempbytes)
            throw new ECSError("this system only has ".concat(tempbytes, " locals"), this.action);
        this.scope.updateTempLiveness(this.instance);
        return "".concat(this.tmplabel, "+").concat(tempinc);
    };
    ActionEval.prototype.__arg = function (args) {
        var argindex = parseInt(args[0] || '0');
        var argvalue = this.eventargs[argindex] || '';
        //this.used.add(`arg_${argindex}_${argvalue}`);
        return argvalue;
    };
    ActionEval.prototype.__start = function (args) {
        var startSymbol = this.dialect.scopeSymbol(args[0]);
        return this.dialect.jump(startSymbol);
    };
    ActionEval.prototype.generateCodeForField = function (fieldName, bitofs, canWrite) {
        var _a, _b, _c, _d;
        var action = this.action;
        var qr = this.scope.state.working;
        var component;
        var baseLookup = false;
        var entityLookup = false;
        var entities;
        // is qualified field?
        if (fieldName.indexOf('.') > 0) {
            var _e = fieldName.split('.'), entname = _e[0], fname = _e[1];
            var ent = this.scope.getEntityByName(entname);
            if (ent == null)
                throw new ECSError("no entity named \"".concat(entname, "\" in this scope"), action);
            component = this.em.singleComponentWithFieldName([ent.etype], fname, action);
            fieldName = fname;
            entities = [ent];
            entityLookup = true;
        }
        else if (fieldName.indexOf(':') > 0) {
            var _f = fieldName.split(':'), cname = _f[0], fname = _f[1];
            component = this.em.getComponentByName(cname);
            if (component == null)
                throw new ECSError("no component named \"".concat(cname, "\""), action);
            entities = this.scope.state.working.entities;
            fieldName = fname;
            baseLookup = true;
        }
        else {
            component = this.em.singleComponentWithFieldName(qr.atypes, fieldName, action);
            entities = this.scope.state.working.entities;
        }
        // find archetypes
        var field = component.fields.find(function (f) { return f.name == fieldName; });
        if (field == null)
            throw new ECSError("no field named \"".concat(fieldName, "\" in component"), action);
        var ident = this.dialect.fieldsymbol(component, field, bitofs);
        // see if all entities have the same constant value
        // TODO: should be done somewhere else?
        var constValues = new Set();
        var isConst = false;
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var e = entities_1[_i];
            var constVal = e.consts[mksymbol(component, fieldName)];
            if (constVal !== undefined)
                isConst = true;
            constValues.add(constVal); // constVal === undefined is allowed
        }
        // can't write to constant
        if (isConst && canWrite)
            throw new ECSError("can't write to constant field ".concat(fieldName), action);
        // is it a constant?
        if (constValues.size == 1) {
            var value = constValues.values().next().value;
            // TODO: what about symbols?
            // TODO: use dialect
            if (typeof value === 'number') {
                return "#".concat((value >> bitofs) & 0xff);
            }
        }
        // TODO: offset > 0?
        // TODO: don't mix const and init data
        var range = this.scope.getFieldRange(component, field.name);
        if (!range)
            throw new ECSError("couldn't find field for ".concat(component.name, ":").concat(fieldName, ", maybe no entities?")); // TODO
        // TODO: dialect
        // TODO: doesnt work for entity.field
        // TODO: array field baseoffset?
        if (baseLookup) {
            return this.dialect.absolute(ident);
        }
        else if (entities.length == 1) {
            // TODO: qr or this.entites?
            var eidofs = entities[0].id - range.elo; // TODO: negative?
            return this.dialect.absolute(ident, eidofs);
        }
        else {
            var ir = void 0;
            var int = void 0;
            var eidofs = void 0;
            var xreg = this.scope.state.xreg;
            var yreg = this.scope.state.yreg;
            if (xreg && (int = (_a = xreg.eset) === null || _a === void 0 ? void 0 : _a.intersection(qr))) {
                //console.log(eidofs,'x',qr.entities[0].id,xreg.elo,int.entities[0].id,xreg.offset(),range.elo);
                ir = xreg.eset;
                //eidofs -= xreg.offset();
                //eidofs -= int.entities[0].id - xreg.elo;
                eidofs = xreg.elo - range.elo;
                // TODO? if (xreg.ehi > range.ehi) throw new ECSError(`field "${field.name}" could overflow`, action);
            }
            else if (yreg && (int = (_b = yreg.eset) === null || _b === void 0 ? void 0 : _b.intersection(qr))) {
                ir = yreg.eset;
                //eidofs -= yreg.offset();
                eidofs = yreg.elo - range.elo;
            }
            else {
                ir = null;
                eidofs = 0;
            }
            if (!ir) {
                throw new ECSError("no intersection for index register", action);
            }
            if (ir.entities.length == 0)
                throw new ECSError("no common entities for index register", action);
            if (!ir.isContiguous())
                throw new ECSError("entities in query are not contiguous", action);
            if (ir == ((_c = this.scope.state.xreg) === null || _c === void 0 ? void 0 : _c.eset))
                return this.dialect.indexed_x(ident, eidofs);
            if (ir == ((_d = this.scope.state.yreg) === null || _d === void 0 ? void 0 : _d.eset))
                return this.dialect.indexed_y(ident, eidofs);
            throw new ECSError("cannot find \"".concat(component.name, ":").concat(field.name, "\" in state"), action);
        }
    };
    ActionEval.prototype.getJoinField = function (action, atypes, jtypes) {
        var refs = Array.from(this.scope.iterateArchetypeFields(atypes, function (c, f) { return f.dtype == 'ref'; }));
        // TODO: better error message
        if (refs.length == 0)
            throw new ECSError("cannot find join fields", action);
        if (refs.length > 1)
            throw new ECSError("cannot join multiple fields (".concat(refs.map(function (r) { return r.f.name; }).join(' '), ")"), action);
        // TODO: check to make sure join works
        return refs[0]; // TODO
        /* TODO
        let match = refs.map(ref => this.em.archetypesMatching((ref.f as RefType).query));
        for (let ref of refs) {
            let m = this.em.archetypesMatching((ref.f as RefType).query);
            for (let a of m) {
                if (jtypes.includes(a.etype)) {
                    console.log(a,m);
                }
            }
        }
        */
    };
    ActionEval.prototype.isSubroutineSized = function (code) {
        // TODO?
        if (code.length > 20000)
            return false;
        if (code.split('\n ').length >= 4)
            return true; // TODO: :^/
        return false;
    };
    ActionEval.prototype.exprToCode = function (expr) {
        if (isQueryExpr(expr)) {
            return this.queryExprToCode(expr);
        }
        if (isBlockStmt(expr)) {
            return this.blockStmtToCode(expr);
        }
        if (isInlineCode(expr)) {
            return this.evalInlineCode(expr.code);
        }
        throw new ECSError("cannot convert expression to code", expr);
    };
    ActionEval.prototype.evalInlineCode = function (code) {
        var props = this.scope.state.props || {};
        // replace @labels
        code = this.replaceLabels(code);
        // replace {{...}} tags
        // TODO: use nodes instead
        code = this.replaceTags(code, this.action, props);
        return code;
    };
    ActionEval.prototype.blockStmtToCode = function (expr) {
        var _this = this;
        return expr.stmts.map(function (node) { return _this.exprToCode(node); }).join('\n');
    };
    ActionEval.prototype.queryExprToCode = function (qexpr) {
        //console.log('query', this.action.event, qexpr.select, qexpr.query.include);
        var q = this.startQuery(qexpr);
        // TODO: move elsewhere? is "foreach" and "join" part of the empty set?
        var allowEmpty = ['if', 'foreach', 'join'];
        if (q.working.entities.length == 0 && allowEmpty.includes(qexpr.select)) {
            //console.log('empty', this.action.event);
            this.endQuery(q);
            return '';
        }
        else {
            this.scope.state.working = q.working;
            this.scope.state.props = q.props;
            //console.log('begin', this.action.event, this.scope.state);
            q.code = this.evalInlineCode(q.code);
            var body = this.blockStmtToCode(qexpr);
            this.endQuery(q);
            //console.log('end', this.action.event, this.scope.state);
            body = q.code.replace('%%CODE%%', body);
            return body;
        }
    };
    ActionEval.prototype.queryWorkingSet = function (qexpr) {
        var scope = this.scope;
        var instance = this.instance;
        var select = qexpr.select;
        var q = qexpr.query;
        var qr = new EntitySet(scope, q);
        // narrow query w/ working set?
        if (!(qexpr.all || q.entities)) {
            var ir = qr.intersection(scope.state.working);
            // if intersection is empty, take the global set
            // if doing otherwise would generate an error (execpt for "if")
            // TODO: ambiguous?
            if (ir.entities.length || select == 'if') {
                qr = ir;
            }
        }
        // TODO? error if none?
        if (instance.params.refEntity && instance.params.refField) {
            var rf = instance.params.refField;
            if (rf.f.dtype == 'ref') {
                var rq = rf.f.query;
                qr = qr.intersection(new EntitySet(scope, rq));
                //console.log('with', instance.params, rq, this.qr);
            }
        }
        else if (instance.params.query) {
            qr = qr.intersection(new EntitySet(scope, instance.params.query));
        }
        return qr;
    };
    ActionEval.prototype.updateIndexRegisters = function (qr, jr, select) {
        var action = this.action;
        var scope = this.scope;
        var instance = this.instance;
        var state = this.scope.state;
        // TODO: generalize to other cpus/langs
        if (qr.entities.length > 1) {
            switch (select) {
                case 'once':
                    break;
                case 'foreach':
                case 'unroll':
                    if (state.xreg && state.yreg)
                        throw new ECSError('no more index registers', action);
                    if (state.xreg)
                        state.yreg = new IndexRegister(scope, qr);
                    else
                        state.xreg = new IndexRegister(scope, qr);
                    break;
                case 'join':
                    // TODO: Joins don't work in superman (arrays offset?)
                    // ignore the join query, use the ref
                    if (state.xreg || state.yreg)
                        throw new ECSError('no free index registers for join', action);
                    if (jr)
                        state.xreg = new IndexRegister(scope, jr);
                    state.yreg = new IndexRegister(scope, qr);
                    break;
                case 'if':
                case 'with':
                    // TODO: what if not in X because 1 element?
                    if (state.xreg && state.xreg.eset) {
                        state.xreg = state.xreg.narrow(qr, action);
                    }
                    else if (select == 'with') {
                        if (instance.params.refEntity && instance.params.refField) {
                            if (state.xreg)
                                state.xreg.eset = qr;
                            else
                                state.xreg = new IndexRegister(scope, qr);
                            // ???
                        }
                    }
                    break;
            }
        }
    };
    ActionEval.prototype.getCodeAndProps = function (qexpr, qr, jr, oldState) {
        // get properties and code
        var entities = qr.entities;
        var select = qexpr.select;
        var code = '%%CODE%%';
        var props = {};
        // TODO: detect cycles
        // TODO: "source"?
        // TODO: what if only 1 item?
        // TODO: what if join is subset of items?
        if (select == 'join' && jr) {
            //let jentities = this.jr.entities;
            // TODO? 
            // TODO? throw new ECSError(`join query doesn't match any entities`, (action as ActionWithJoin).join); // TODO 
            //console.log('join', qr, jr);
            if (qr.entities.length) {
                var joinfield = this.getJoinField(this.action, qr.atypes, jr.atypes);
                // TODO: what if only 1 item?
                // TODO: should be able to access fields via Y reg
                code = this.wrapCodeInLoop(code, qexpr, qr.entities, joinfield);
                props['%joinfield'] = this.dialect.fieldsymbol(joinfield.c, joinfield.f, 0); //TODO?
            }
        }
        // select subset of entities
        var fullEntityCount = qr.entities.length; //entities.length.toString();
        // TODO: let loopreduce = !loopents || entities.length < loopents.length;
        //console.log(action.event, entities.length, loopents.length);
        // filter entities from loop?
        // TODO: when to ignore if entities.length == 1 and not in for loop?
        if (select == 'with') {
            // TODO? when to load x?
            if (this.instance.params.refEntity && this.instance.params.refField) {
                var re = this.instance.params.refEntity;
                var rf = this.instance.params.refField;
                code = this.wrapCodeInRefLookup(code);
                // TODO: only fetches 1st entity in list, need offset
                var range = this.scope.getFieldRange(rf.c, rf.f.name);
                var eidofs = re.id - range.elo;
                props['%reffield'] = "".concat(this.dialect.fieldsymbol(rf.c, rf.f, 0), "+").concat(eidofs);
            }
            else {
                code = this.wrapCodeInFilter(code, qr, oldState, props);
            }
        }
        if (select == 'if') {
            code = this.wrapCodeInFilter(code, qr, oldState, props);
        }
        if (select == 'foreach' && entities.length > 1) {
            code = this.wrapCodeInLoop(code, qexpr, qr.entities);
        }
        if (select == 'unroll' && entities.length > 1) {
            throw new ECSError('unroll is not yet implemented');
        }
        // define properties
        if (entities.length) {
            props['%elo'] = entities[0].id.toString();
            props['%ehi'] = entities[entities.length - 1].id.toString();
        }
        props['%ecount'] = entities.length.toString();
        props['%efullcount'] = fullEntityCount.toString();
        //console.log('working', action.event, working.entities.length, entities.length);
        return { code: code, props: props };
    };
    ActionEval.prototype.startQuery = function (qexpr) {
        var scope = this.scope;
        var action = this.action;
        var select = qexpr.select;
        // save old state and make clone
        var oldState = this.scope.state;
        this.scope.state = Object.assign(new ActionCPUState(), oldState);
        // get working set for this query
        var qr = this.queryWorkingSet(qexpr);
        // is it a join? query that too
        var jr = qexpr.join && qr.entities.length ? new EntitySet(scope, qexpr.join) : null;
        // update x, y state
        this.updateIndexRegisters(qr, jr, select);
        var _a = this.getCodeAndProps(qexpr, qr, jr, oldState), code = _a.code, props = _a.props;
        // if join, working set is union of both parts
        var working = jr ? qr.union(jr) : qr;
        return { working: working, oldState: oldState, props: props, code: code };
    };
    ActionEval.prototype.endQuery = function (q) {
        this.scope.state = q.oldState;
    };
    ActionEval.prototype.wrapCodeInLoop = function (code, qexpr, ents, joinfield) {
        // TODO: check ents
        // TODO: check segment bounds
        // TODO: what if 0 or 1 entitites?
        // TODO: check > 127 or > 255
        var dir = qexpr.direction;
        var s = dir == 'desc' ? this.dialect.ASM_ITERATE_EACH_DESC : this.dialect.ASM_ITERATE_EACH_ASC;
        if (joinfield)
            s = dir == 'desc' ? this.dialect.ASM_ITERATE_JOIN_DESC : this.dialect.ASM_ITERATE_JOIN_ASC;
        s = s.replace('{{%code}}', code);
        return s;
    };
    ActionEval.prototype.wrapCodeInFilter = function (code, qr, oldState, props) {
        var _a, _b;
        // TODO: :-p filters too often?
        var ents = qr.entities;
        var ents2 = (_b = (_a = oldState.xreg) === null || _a === void 0 ? void 0 : _a.eset) === null || _b === void 0 ? void 0 : _b.entities;
        if (ents && ents.length && ents2) {
            var lo = ents[0].id;
            var hi = ents[ents.length - 1].id;
            var lo2 = ents2[0].id;
            var hi2 = ents2[ents2.length - 1].id;
            if (lo != lo2) {
                code = this.dialect.ASM_FILTER_RANGE_LO_X.replace('{{%code}}', code);
                props['%xofs'] = lo - lo2;
            }
            if (hi != hi2) {
                code = this.dialect.ASM_FILTER_RANGE_HI_X.replace('{{%code}}', code);
            }
        }
        return code;
    };
    ActionEval.prototype.wrapCodeInRefLookup = function (code) {
        code = this.dialect.ASM_LOOKUP_REF_X.replace('{{%code}}', code);
        return code;
    };
    return ActionEval;
}());
var EventCodeStats = /** @class */ (function () {
    function EventCodeStats(inst, action, eventcode) {
        this.inst = inst;
        this.action = action;
        this.eventcode = eventcode;
        this.labels = [];
        this.count = 0;
    }
    return EventCodeStats;
}());
var EntityScope = /** @class */ (function () {
    function EntityScope(em, dialect, name, parent) {
        this.em = em;
        this.dialect = dialect;
        this.name = name;
        this.parent = parent;
        this.childScopes = [];
        this.instances = [];
        this.entities = [];
        this.fieldtypes = {};
        this.sysstats = new Map();
        this.bss = new UninitDataSegment();
        this.rodata = new ConstDataSegment();
        this.code = new CodeSegment();
        this.componentsInScope = new Set();
        this.resources = new Set();
        this.isDemo = false;
        this.filePath = '';
        this.inCritical = 0;
        parent === null || parent === void 0 ? void 0 : parent.childScopes.push(this);
        this.state = new ActionCPUState();
        // TODO: parent scope entities too?
        this.state.working = new EntitySet(this, undefined, this.entities); // working set = all entities
    }
    EntityScope.prototype.newEntity = function (etype, name) {
        // TODO: add parent ID? lock parent scope?
        // TODO: name identical check?
        if (name && this.getEntityByName(name))
            throw new ECSError("already an entity named \"".concat(name, "\""));
        var id = this.entities.length;
        etype = this.em.addArchetype(etype);
        var entity = { id: id, etype: etype, consts: {}, inits: {} };
        for (var _i = 0, _a = etype.components; _i < _a.length; _i++) {
            var c = _a[_i];
            this.componentsInScope.add(c.name);
        }
        entity.name = name;
        this.entities.push(entity);
        return entity;
    };
    EntityScope.prototype.newSystemInstance = function (inst) {
        if (!inst)
            throw new Error();
        inst.id = this.instances.length + 1;
        this.instances.push(inst);
        this.em.registerSystemEvents(inst.system);
        return inst;
    };
    EntityScope.prototype.newSystemInstanceWithDefaults = function (system) {
        return this.newSystemInstance({ system: system, params: {}, id: 0 });
    };
    EntityScope.prototype.getSystemInstanceNamed = function (name) {
        return this.instances.find(function (sys) { return sys.system.name == name; });
    };
    EntityScope.prototype.getEntityByName = function (name) {
        return this.entities.find(function (e) { return e.name == name; });
    };
    EntityScope.prototype.iterateEntityFields = function (entities) {
        var i, e, _i, _a, c, _b, _c, f;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < entities.length)) return [3 /*break*/, 8];
                    e = entities[i];
                    _i = 0, _a = e.etype.components;
                    _d.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    c = _a[_i];
                    _b = 0, _c = c.fields;
                    _d.label = 3;
                case 3:
                    if (!(_b < _c.length)) return [3 /*break*/, 6];
                    f = _c[_b];
                    return [4 /*yield*/, { i: i, e: e, c: c, f: f, v: e.consts[mksymbol(c, f.name)] }];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    };
    EntityScope.prototype.iterateArchetypeFields = function (arch, filter) {
        var i, a, _i, _a, c, _b, _c, f;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    i = 0;
                    _d.label = 1;
                case 1:
                    if (!(i < arch.length)) return [3 /*break*/, 8];
                    a = arch[i];
                    _i = 0, _a = a.components;
                    _d.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 7];
                    c = _a[_i];
                    _b = 0, _c = c.fields;
                    _d.label = 3;
                case 3:
                    if (!(_b < _c.length)) return [3 /*break*/, 6];
                    f = _c[_b];
                    if (!(!filter || filter(c, f))) return [3 /*break*/, 5];
                    return [4 /*yield*/, { i: i, c: c, f: f }];
                case 4:
                    _d.sent();
                    _d.label = 5;
                case 5:
                    _b++;
                    return [3 /*break*/, 3];
                case 6:
                    _i++;
                    return [3 /*break*/, 2];
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    };
    EntityScope.prototype.iterateChildScopes = function () {
        var _i, _a, scope;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = this.childScopes;
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    scope = _a[_i];
                    return [4 /*yield*/, scope];
                case 2:
                    _b.sent();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    EntityScope.prototype.entitiesMatching = function (atypes) {
        var result = [];
        for (var _i = 0, _a = this.entities; _i < _a.length; _i++) {
            var e = _a[_i];
            for (var _b = 0, atypes_1 = atypes; _b < atypes_1.length; _b++) {
                var a = atypes_1[_b];
                // TODO: what about subclasses?
                // TODO: very scary identity ocmpare
                if (e.etype === a) {
                    result.push(e);
                    break;
                }
            }
        }
        return result;
    };
    EntityScope.prototype.hasComponent = function (ctype) {
        return this.componentsInScope.has(ctype.name);
    };
    EntityScope.prototype.buildSegments = function () {
        // build FieldArray for each component/field pair
        // they will be different for bss/rodata segments
        var iter = this.iterateEntityFields(this.entities);
        for (var o = iter.next(); o.value; o = iter.next()) {
            var _a = o.value, i = _a.i, e = _a.e, c = _a.c, f = _a.f, v = _a.v;
            // constants and array pointers go into rodata
            var cfname = mksymbol(c, f.name);
            var ftype = this.fieldtypes[cfname];
            var isConst = ftype == 'const';
            var segment = isConst ? this.rodata : this.bss;
            if (v === undefined && isConst)
                throw new ECSError("no value for const field ".concat(cfname), e);
            // determine range of indices for entities
            var array = segment.fieldranges[cfname];
            if (!array) {
                array = segment.fieldranges[cfname] = { component: c, field: f, elo: i, ehi: i };
            }
            else {
                array.ehi = i;
                if (array.ehi - array.elo + 1 >= 256)
                    throw new ECSError("too many entities have field ".concat(cfname, ", limit is 256"));
            }
            // set default values for entity/field
            if (!isConst) {
                if (f.dtype == 'int' && f.defvalue !== undefined) {
                    var ecfname = mkscopesymbol(this, c, f.name);
                    if (e.inits[ecfname] == null) {
                        this.setInitValue(e, c, f, f.defvalue);
                    }
                }
            }
        }
    };
    // TODO: cull unused entity fields
    EntityScope.prototype.allocateSegment = function (segment, alloc, type) {
        var fields = Object.values(segment.fieldranges);
        // TODO: fields.sort((a, b) => (a.ehi - a.elo + 1) * getPackedFieldSize(a.field));
        for (var _i = 0, fields_1 = fields; _i < fields_1.length; _i++) {
            var f = fields_1[_i];
            if (this.fieldtypes[mksymbol(f.component, f.field.name)] == type) {
                //console.log(f.component.name, f.field.name, type);
                var rangelen = (f.ehi - f.elo + 1);
                // TODO: doesn't work for packed arrays too well
                var bits = getPackedFieldSize(f.field);
                // variable size? make it a pointer
                if (bits == 0)
                    bits = 16; // TODO?
                var bytesperelem = Math.ceil(bits / 8);
                // TODO: packing bits
                // TODO: split arrays
                var access = [];
                for (var i = 0; i < bits; i += 8) {
                    var symbol = this.dialect.fieldsymbol(f.component, f.field, i);
                    access.push({ symbol: symbol, bit: i, width: 8 }); // TODO
                    if (alloc) {
                        segment.allocateBytes(symbol, rangelen); // TODO
                    }
                }
                f.access = access;
            }
        }
    };
    EntityScope.prototype.allocateROData = function (segment) {
        var iter = this.iterateEntityFields(this.entities);
        for (var o = iter.next(); o.value; o = iter.next()) {
            var _a = o.value, i = _a.i, e = _a.e, c = _a.c, f = _a.f, v = _a.v;
            var cfname = mksymbol(c, f.name);
            // TODO: what if mix of var, const, and init values?
            if (this.fieldtypes[cfname] == 'const') {
                var range = segment.fieldranges[cfname];
                var entcount = range ? range.ehi - range.elo + 1 : 0;
                if (v == null && f.dtype == 'int')
                    v = 0;
                if (v == null && f.dtype == 'ref')
                    v = 0;
                if (v == null && f.dtype == 'array')
                    throw new ECSError("no default value for array ".concat(cfname), e);
                //console.log(c.name, f.name, '#'+e.id, '=', v);
                // this is a constant
                // is it a byte array?
                //TODO? if (ArrayBuffer.isView(v) && f.dtype == 'array') {
                if (v instanceof Uint8Array && f.dtype == 'array') {
                    var ptrlosym = this.dialect.fieldsymbol(c, f, 0);
                    var ptrhisym = this.dialect.fieldsymbol(c, f, 8);
                    var loofs = segment.allocateBytes(ptrlosym, entcount);
                    var hiofs = segment.allocateBytes(ptrhisym, entcount);
                    var datasym = this.dialect.datasymbol(c, f, e.id, 0);
                    segment.allocateInitData(datasym, v);
                    if (f.baseoffset)
                        datasym = "(".concat(datasym, "+").concat(f.baseoffset, ")");
                    segment.initdata[loofs + e.id - range.elo] = { symbol: datasym, bitofs: 0 };
                    segment.initdata[hiofs + e.id - range.elo] = { symbol: datasym, bitofs: 8 };
                }
                else if (typeof v === 'number') {
                    // more than 1 entity, add an array
                    // TODO: infer need for array by usage
                    /*if (entcount > 1)*/ {
                        if (!range.access)
                            throw new ECSError("no access for field ".concat(cfname));
                        for (var _i = 0, _b = range.access; _i < _b.length; _i++) {
                            var a = _b[_i];
                            segment.allocateBytes(a.symbol, entcount);
                            var ofs = segment.getByteOffset(range, a, e.id);
                            // TODO: this happens if you forget a const field on an object?
                            if (e.id < range.elo)
                                throw new ECSError('entity out of range ' + c.name + ' ' + f.name, e);
                            if (segment.initdata[ofs] !== undefined)
                                throw new ECSError('initdata already set ' + ofs), e;
                            segment.initdata[ofs] = (v >> a.bit) & 0xff;
                        }
                    }
                }
                else if (v == null && f.dtype == 'array' && f.index) {
                    // TODO
                    var datasym = this.dialect.datasymbol(c, f, e.id, 0);
                    var databytes = getFieldLength(f.index);
                    var offset = this.bss.allocateBytes(datasym, databytes);
                    // TODO? this.allocatePointerArray(c, f, datasym, entcount);
                    var ptrlosym = this.dialect.fieldsymbol(c, f, 0);
                    var ptrhisym = this.dialect.fieldsymbol(c, f, 8);
                    // TODO: what if we don't need a pointer array?
                    var loofs = segment.allocateBytes(ptrlosym, entcount);
                    var hiofs = segment.allocateBytes(ptrhisym, entcount);
                    if (f.baseoffset)
                        datasym = "(".concat(datasym, "+").concat(f.baseoffset, ")");
                    segment.initdata[loofs + e.id - range.elo] = { symbol: datasym, bitofs: 0 };
                    segment.initdata[hiofs + e.id - range.elo] = { symbol: datasym, bitofs: 8 };
                }
                else {
                    // TODO: bad error message - should say "wrong type, should be array"
                    throw new ECSError("unhandled constant ".concat(e.id, ":").concat(cfname, " -- ").concat(typeof v));
                }
            }
        }
        //console.log(segment.initdata)
    };
    EntityScope.prototype.allocateInitData = function (segment) {
        if (segment.size == 0)
            return '';
        var initbytes = new Uint8Array(segment.size);
        var iter = this.iterateEntityFields(this.entities);
        for (var o = iter.next(); o.value; o = iter.next()) {
            var _a = o.value, i = _a.i, e = _a.e, c = _a.c, f = _a.f, v = _a.v;
            var scfname = mkscopesymbol(this, c, f.name);
            var initvalue = e.inits[scfname];
            if (initvalue !== undefined) {
                var range = segment.getFieldRange(c, f.name);
                if (!range)
                    throw new ECSError("no init range for ".concat(scfname), e);
                if (!range.access)
                    throw new ECSError("no init range access for ".concat(scfname), e);
                if (typeof initvalue === 'number') {
                    for (var _i = 0, _b = range.access; _i < _b.length; _i++) {
                        var a = _b[_i];
                        var offset = segment.getByteOffset(range, a, e.id);
                        initbytes[offset] = (initvalue >> a.bit) & ((1 << a.width) - 1);
                    }
                }
                else if (initvalue instanceof Uint8Array) {
                    // TODO: 16/32...
                    var datasym = this.dialect.datasymbol(c, f, e.id, 0);
                    var ofs = this.bss.symbols[datasym];
                    initbytes.set(initvalue, ofs);
                }
                else {
                    // TODO: init arrays?
                    throw new ECSError("cannot initialize ".concat(scfname, " = ").concat(initvalue)); // TODO??
                }
            }
        }
        // build the final init buffer
        // TODO: compress 0s?
        var bufsym = this.name + '__INITDATA';
        var bufofs = this.rodata.allocateInitData(bufsym, initbytes);
        var code = this.dialect.INIT_FROM_ARRAY;
        //TODO: function to repalce from dict?
        code = code.replace('{{%nbytes}}', initbytes.length.toString());
        code = code.replace('{{%src}}', bufsym);
        code = code.replace('{{%dest}}', segment.getOriginSymbol());
        return code;
    };
    EntityScope.prototype.getFieldRange = function (c, fn) {
        return this.bss.getFieldRange(c, fn) || this.rodata.getFieldRange(c, fn);
    };
    EntityScope.prototype.setConstValue = function (e, component, field, value) {
        this.setConstInitValue(e, component, field, value, 'const');
    };
    EntityScope.prototype.setInitValue = function (e, component, field, value) {
        this.setConstInitValue(e, component, field, value, 'init');
    };
    EntityScope.prototype.setConstInitValue = function (e, component, field, value, type) {
        this.checkFieldValue(field, value);
        var fieldName = field.name;
        var cfname = mksymbol(component, fieldName);
        var ecfname = mkscopesymbol(this, component, fieldName);
        if (e.consts[cfname] !== undefined)
            throw new ECSError("\"".concat(fieldName, "\" is already defined as a constant"), e);
        if (e.inits[ecfname] !== undefined)
            throw new ECSError("\"".concat(fieldName, "\" is already defined as a variable"), e);
        if (type == 'const')
            e.consts[cfname] = value;
        if (type == 'init')
            e.inits[ecfname] = value;
        this.fieldtypes[cfname] = type;
    };
    EntityScope.prototype.isConstOrInit = function (component, fieldName) {
        return this.fieldtypes[mksymbol(component, fieldName)];
    };
    EntityScope.prototype.getConstValue = function (entity, fieldName) {
        var component = this.em.singleComponentWithFieldName([entity.etype], fieldName, entity);
        var cfname = mksymbol(component, fieldName);
        return entity.consts[cfname];
    };
    EntityScope.prototype.checkFieldValue = function (field, value) {
        if (field.dtype == 'array') {
            if (!(value instanceof Uint8Array))
                throw new ECSError("This \"".concat(field.name, "\" value should be an array."));
        }
        else if (typeof value !== 'number') {
            throw new ECSError("This \"".concat(field.name, "\" ").concat(field.dtype, " value should be an number."));
        }
        else {
            if (field.dtype == 'int') {
                if (value < field.lo || value > field.hi)
                    throw new ECSError("This \"".concat(field.name, "\" value is out of range, should be between ").concat(field.lo, " and ").concat(field.hi, "."));
            }
            else if (field.dtype == 'ref') {
                // TODO: allow override if number
                var eset = new EntitySet(this, field.query);
                if (value < 0 || value >= eset.entities.length)
                    throw new ECSError("This \"".concat(field.name, "\" value is out of range for this ref type."));
            }
        }
    };
    EntityScope.prototype.generateCodeForEvent = function (event, args, codelabel) {
        // find systems that respond to event
        // and have entities in this scope
        var systems = this.em.event2systems[event];
        if (!systems || systems.length == 0) {
            // TODO: error or warning?
            //throw new ECSError(`warning: no system responds to "${event}"`);
            console.log("warning: no system responds to \"".concat(event, "\""));
            return '';
        }
        this.eventSeq++;
        // generate code
        var code = '';
        // is there a label? generate it first
        if (codelabel) {
            code += this.dialect.label(codelabel) + '\n';
        }
        // if "start" event, initialize data segment
        if (event == 'start') {
            code += this.allocateInitData(this.bss);
        }
        // iterate all instances and generate matching events
        var eventCount = 0;
        var instances = this.instances.filter(function (inst) { return systems.includes(inst.system); });
        for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
            var inst = instances_1[_i];
            var sys = inst.system;
            for (var _a = 0, _b = sys.actions; _a < _b.length; _a++) {
                var action = _b[_a];
                if (action.event == event) {
                    eventCount++;
                    // TODO: use Tokenizer so error msgs are better
                    // TODO: keep event tree
                    var codeeval = new ActionEval(this, inst, action, args || []);
                    codeeval.begin();
                    if (action.critical)
                        this.inCritical++;
                    var eventcode = codeeval.codeToString();
                    if (action.critical)
                        this.inCritical--;
                    if (!this.inCritical && codeeval.isSubroutineSized(eventcode)) {
                        var normcode = this.normalizeCode(eventcode, action);
                        var estats = this.eventCodeStats[normcode];
                        if (!estats) {
                            estats = this.eventCodeStats[normcode] = new EventCodeStats(inst, action, eventcode);
                        }
                        estats.labels.push(codeeval.label);
                        estats.count++;
                        if (action.critical)
                            estats.count++; // always make critical event subroutines
                    }
                    var s = '';
                    s += this.dialect.comment("start action ".concat(codeeval.label));
                    s += eventcode;
                    s += this.dialect.comment("end action ".concat(codeeval.label));
                    code += s;
                    // TODO: check that this happens once?
                    codeeval.end();
                }
            }
        }
        if (eventCount == 0) {
            console.log("warning: event ".concat(event, " not handled"));
        }
        return code;
    };
    EntityScope.prototype.normalizeCode = function (code, action) {
        // TODO: use dialect to help with this
        code = code.replace(/\b(\w+__\w+__)(\d+)__(\w+)\b/g, function (z, a, b, c) { return a + c; });
        return code;
    };
    EntityScope.prototype.getSystemStats = function (inst) {
        var stats = this.sysstats.get(inst);
        if (!stats) {
            stats = new SystemStats();
            this.sysstats.set(inst, stats);
        }
        return stats;
    };
    EntityScope.prototype.updateTempLiveness = function (inst) {
        var stats = this.getSystemStats(inst);
        var n = this.eventSeq;
        if (stats.tempstartseq && stats.tempendseq) {
            stats.tempstartseq = Math.min(stats.tempstartseq, n);
            stats.tempendseq = Math.max(stats.tempendseq, n);
        }
        else {
            stats.tempstartseq = stats.tempendseq = n;
        }
    };
    EntityScope.prototype.includeResource = function (symbol) {
        this.resources.add(symbol);
        return symbol;
    };
    EntityScope.prototype.allocateTempVars = function () {
        var pack = new binpack_1.Packer();
        var maxTempBytes = 128 - this.bss.size; // TODO: multiple data segs
        var bssbin = new binpack_1.Bin({ left: 0, top: 0, bottom: this.eventSeq + 1, right: maxTempBytes });
        pack.bins.push(bssbin);
        for (var _i = 0, _a = this.instances; _i < _a.length; _i++) {
            var instance = _a[_i];
            var stats = this.getSystemStats(instance);
            if (instance.system.tempbytes && stats.tempstartseq && stats.tempendseq) {
                var v = {
                    inst: instance,
                    top: stats.tempstartseq,
                    bottom: stats.tempendseq + 1,
                    width: instance.system.tempbytes,
                    height: stats.tempendseq - stats.tempstartseq + 1,
                    label: instance.system.name
                };
                pack.boxes.push(v);
            }
        }
        if (!pack.pack())
            console.log('cannot pack temporary local vars'); // TODO
        //console.log('tempvars', pack);
        if (bssbin.extents.right > 0) {
            var tempofs = this.bss.allocateBytes('TEMP', bssbin.extents.right);
            for (var _b = 0, _c = pack.boxes; _b < _c.length; _b++) {
                var b = _c[_b];
                var inst = b.inst;
                //console.log(inst.system.name, b.box?.left);
                if (b.box)
                    this.bss.declareSymbol(this.dialect.tempLabel(inst), tempofs + b.box.left);
                //this.bss.equates[this.dialect.tempLabel(inst)] = `TEMP+${b.box?.left}`;
            }
        }
        console.log(pack.toSVGUrl());
    };
    EntityScope.prototype.analyzeEntities = function () {
        this.buildSegments();
        this.allocateSegment(this.bss, true, 'init'); // initialized vars
        this.allocateSegment(this.bss, true, undefined); // uninitialized vars
        this.allocateSegment(this.rodata, false, 'const'); // constants
        this.allocateROData(this.rodata);
    };
    EntityScope.prototype.isMainScope = function () {
        return this.parent == null;
    };
    EntityScope.prototype.generateCode = function () {
        this.eventSeq = 0;
        this.eventCodeStats = {};
        var start;
        var initsys = this.em.getSystemByName('Init');
        if (this.isMainScope() && initsys) {
            this.newSystemInstanceWithDefaults(initsys); //TODO: what if none?
            start = this.generateCodeForEvent('main_init');
        }
        else {
            start = this.generateCodeForEvent('start');
        }
        start = this.replaceSubroutines(start);
        this.code.addCodeFragment(start);
        for (var _i = 0, _a = Array.from(this.resources.values()); _i < _a.length; _i++) {
            var sub = _a[_i];
            if (!this.getSystemInstanceNamed(sub)) {
                var sys = this.em.getSystemByName(sub);
                if (!sys)
                    throw new ECSError("cannot find resource named \"".concat(sub, "\""));
                this.newSystemInstanceWithDefaults(sys);
            }
            var code = this.generateCodeForEvent(sub, [], sub);
            this.code.addCodeFragment(code); // TODO: should be rodata?
        }
        //this.showStats();
    };
    EntityScope.prototype.replaceSubroutines = function (code) {
        // TODO: bin-packing for critical code
        // TODO: doesn't work with nested subroutines?
        // TODO: doesn't work between scopes
        var allsubs = [];
        for (var _i = 0, _a = Object.values(this.eventCodeStats); _i < _a.length; _i++) {
            var stats = _a[_i];
            if (stats.count > 1) {
                if (allsubs.length == 0) {
                    allsubs = [
                        this.dialect.segment('rodata'),
                    ];
                }
                var subcall = this.dialect.call(stats.labels[0]);
                for (var _b = 0, _c = stats.labels; _b < _c.length; _b++) {
                    var label = _c[_b];
                    var startdelim = this.dialect.comment("start action ".concat(label)).trim();
                    var enddelim = this.dialect.comment("end action ".concat(label)).trim();
                    var istart = code.indexOf(startdelim);
                    var iend = code.indexOf(enddelim, istart);
                    if (istart >= 0 && iend > istart) {
                        code = code.substring(0, istart) + subcall + code.substring(iend + enddelim.length);
                    }
                }
                var substart = stats.labels[0];
                var alignment = this.getAlignment(stats.action.fitbytes || 0);
                var sublines = [
                    this.dialect.segment('rodata'),
                    this.dialect.align(alignment),
                    this.dialect.label(substart),
                    stats.eventcode,
                    this.dialect.return(),
                ];
                if (stats.action.critical) {
                    sublines.push(this.dialect.warningIfPageCrossed(substart));
                }
                if (stats.action.fitbytes) {
                    sublines.push(this.dialect.warningIfMoreThan(stats.action.fitbytes, substart));
                }
                allsubs = allsubs.concat(sublines);
            }
        }
        code += allsubs.join('\n');
        return code;
    };
    EntityScope.prototype.getAlignment = function (len) {
        if (!len)
            return 0;
        var align = 2;
        while (align < len) {
            align *= 2;
        }
        return align;
    };
    EntityScope.prototype.showStats = function () {
        for (var _i = 0, _a = this.instances; _i < _a.length; _i++) {
            var inst = _a[_i];
            // TODO?
            console.log(inst.system.name, this.getSystemStats(inst));
        }
    };
    EntityScope.prototype.dumpCodeTo = function (file) {
        var shouldExport = this.instances.length == 0;
        var dialect = this.dialect;
        file.line(dialect.startScope(this.name));
        file.line(dialect.segment('bss'));
        this.bss.dump(file, dialect, shouldExport);
        file.line(dialect.segment('code')); // TODO: rodata for aligned?
        this.rodata.dump(file, dialect, shouldExport);
        //file.segment(`${this.name}_CODE`, 'code');
        file.line(dialect.label('__Start'));
        this.code.dump(file);
        for (var _i = 0, _a = this.childScopes; _i < _a.length; _i++) {
            var subscope = _a[_i];
            // TODO: overlay child BSS segments
            subscope.dump(file);
        }
        file.line(dialect.endScope(this.name));
    };
    EntityScope.prototype.dump = function (file) {
        this.analyzeEntities();
        this.generateCode();
        this.allocateTempVars();
        this.dumpCodeTo(file);
    };
    return EntityScope;
}());
exports.EntityScope = EntityScope;
var EntityManager = /** @class */ (function () {
    function EntityManager(dialect) {
        this.dialect = dialect;
        this.archetypes = {};
        this.components = {};
        this.systems = {};
        this.topScopes = {};
        this.event2systems = {};
        this.name2cfpairs = {};
        this.mainPath = '';
        this.imported = {};
        this.seq = 1;
    }
    EntityManager.prototype.newScope = function (name, parent) {
        var existing = this.topScopes[name];
        if (existing && !existing.isDemo)
            throw new ECSError("scope ".concat(name, " already defined"), existing);
        var scope = new EntityScope(this, this.dialect, name, parent);
        if (!parent)
            this.topScopes[name] = scope;
        return scope;
    };
    EntityManager.prototype.deferComponent = function (name) {
        this.components[name] = { name: name, fields: [] };
    };
    EntityManager.prototype.defineComponent = function (ctype) {
        var existing = this.components[ctype.name];
        // we can defer component definitions, just declare a component with 0 fields?
        if (existing && existing.fields.length > 0)
            throw new ECSError("component ".concat(ctype.name, " already defined"), existing);
        if (existing) {
            existing.fields = ctype.fields;
            ctype = existing;
        }
        for (var _i = 0, _a = ctype.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            var list = this.name2cfpairs[field.name];
            if (!list)
                list = this.name2cfpairs[field.name] = [];
            list.push({ c: ctype, f: field });
        }
        this.components[ctype.name] = ctype;
        return ctype;
    };
    EntityManager.prototype.defineSystem = function (system) {
        var existing = this.systems[system.name];
        if (existing)
            throw new ECSError("system ".concat(system.name, " already defined"), existing);
        return this.systems[system.name] = system;
    };
    EntityManager.prototype.registerSystemEvents = function (system) {
        for (var _i = 0, _a = system.actions; _i < _a.length; _i++) {
            var a = _a[_i];
            var event_1 = a.event;
            var list = this.event2systems[event_1];
            if (list == null)
                list = this.event2systems[event_1] = [];
            if (!list.includes(system))
                list.push(system);
        }
    };
    EntityManager.prototype.addArchetype = function (atype) {
        var key = atype.components.map(function (c) { return c.name; }).join(',');
        if (this.archetypes[key])
            return this.archetypes[key];
        else
            return this.archetypes[key] = atype;
    };
    EntityManager.prototype.componentsMatching = function (q, etype) {
        var _a;
        var list = [];
        for (var _i = 0, _b = etype.components; _i < _b.length; _i++) {
            var c = _b[_i];
            if ((_a = q.exclude) === null || _a === void 0 ? void 0 : _a.includes(c)) {
                return [];
            }
            // TODO: 0 includes == all entities?
            if (q.include.length == 0 || q.include.includes(c)) {
                list.push(c);
            }
        }
        return list.length == q.include.length ? list : [];
    };
    EntityManager.prototype.archetypesMatching = function (q) {
        var result = new Set();
        for (var _i = 0, _a = Object.values(this.archetypes); _i < _a.length; _i++) {
            var etype = _a[_i];
            var cmatch = this.componentsMatching(q, etype);
            if (cmatch.length > 0) {
                result.add(etype);
            }
        }
        return Array.from(result.values());
    };
    EntityManager.prototype.componentsWithFieldName = function (atypes, fieldName) {
        // TODO???
        var comps = new Set();
        for (var _i = 0, atypes_2 = atypes; _i < atypes_2.length; _i++) {
            var at = atypes_2[_i];
            for (var _a = 0, _b = at.components; _a < _b.length; _a++) {
                var c = _b[_a];
                for (var _c = 0, _d = c.fields; _c < _d.length; _c++) {
                    var f = _d[_c];
                    if (f.name == fieldName)
                        comps.add(c);
                }
            }
        }
        return Array.from(comps);
    };
    EntityManager.prototype.getComponentByName = function (name) {
        return this.components[name];
    };
    EntityManager.prototype.getSystemByName = function (name) {
        return this.systems[name];
    };
    EntityManager.prototype.singleComponentWithFieldName = function (atypes, fieldName, where) {
        var cfpairs = this.name2cfpairs[fieldName];
        if (!cfpairs)
            throw new ECSError("cannot find field named \"".concat(fieldName, "\""), where);
        var filtered = cfpairs.filter(function (cf) { return atypes.find(function (a) { return a.components.includes(cf.c); }); });
        if (filtered.length == 0) {
            throw new ECSError("cannot find component with field \"".concat(fieldName, "\" in this context"), where);
        }
        if (filtered.length > 1) {
            throw new ECSError("ambiguous field name \"".concat(fieldName, "\""), where);
        }
        return filtered[0].c;
    };
    EntityManager.prototype.toJSON = function () {
        return JSON.stringify({
            components: this.components,
            systems: this.systems
        });
    };
    EntityManager.prototype.exportToFile = function (file) {
        for (var _i = 0, _a = Object.keys(this.event2systems); _i < _a.length; _i++) {
            var event_2 = _a[_i];
            file.line(this.dialect.equate("EVENT__".concat(event_2), '1'));
        }
        for (var _b = 0, _c = Object.values(this.topScopes); _b < _c.length; _b++) {
            var scope = _c[_b];
            if (!scope.isDemo || scope.filePath == this.mainPath) {
                scope.dump(file);
            }
        }
    };
    EntityManager.prototype.iterateScopes = function () {
        var _i, _a, scope;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _i = 0, _a = Object.values(this.topScopes);
                    _b.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 4];
                    scope = _a[_i];
                    return [4 /*yield*/, scope];
                case 2:
                    _b.sent();
                    scope.iterateChildScopes();
                    _b.label = 3;
                case 3:
                    _i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    };
    EntityManager.prototype.getDebugTree = function () {
        var scopes = this.topScopes;
        var components = this.components;
        var fields = this.name2cfpairs;
        var systems = this.systems;
        var events = this.event2systems;
        var entities = {};
        for (var _i = 0, _a = Array.from(this.iterateScopes()); _i < _a.length; _i++) {
            var scope = _a[_i];
            for (var _b = 0, _c = scope.entities; _b < _c.length; _b++) {
                var e = _c[_b];
                entities[e.name || '#' + e.id.toString()] = e;
            }
        }
        return { scopes: scopes, components: components, fields: fields, systems: systems, events: events, entities: entities };
    };
    // expression stuff
    EntityManager.prototype.evalExpr = function (expr, scope) {
        if (isLiteral(expr))
            return expr;
        if (isBinOp(expr) || isUnOp(expr)) {
            var fn = this['evalop__' + expr.op];
            if (!fn)
                throw new ECSError("no eval function for \"".concat(expr.op, "\""));
        }
        if (isBinOp(expr)) {
            expr.left = this.evalExpr(expr.left, scope);
            expr.right = this.evalExpr(expr.right, scope);
            var e = fn(expr.left, expr.right);
            return e || expr;
        }
        if (isUnOp(expr)) {
            expr.expr = this.evalExpr(expr.expr, scope);
            var e = fn(expr.expr);
            return e || expr;
        }
        return expr;
    };
    EntityManager.prototype.evalop__neg = function (arg) {
        if (isLiteralInt(arg)) {
            var valtype = { dtype: 'int',
                lo: -arg.valtype.hi,
                hi: arg.valtype.hi };
            return { valtype: valtype, value: -arg.value };
        }
    };
    EntityManager.prototype.evalop__add = function (left, right) {
        if (isLiteralInt(left) && isLiteralInt(right)) {
            var valtype = { dtype: 'int',
                lo: left.valtype.lo + right.valtype.lo,
                hi: left.valtype.hi + right.valtype.hi };
            return { valtype: valtype, value: left.value + right.value };
        }
    };
    EntityManager.prototype.evalop__sub = function (left, right) {
        if (isLiteralInt(left) && isLiteralInt(right)) {
            var valtype = { dtype: 'int',
                lo: left.valtype.lo - right.valtype.hi,
                hi: left.valtype.hi - right.valtype.lo };
            return { valtype: valtype, value: left.value - right.value };
        }
    };
    return EntityManager;
}());
exports.EntityManager = EntityManager;

});


// ── /tmp/8bitworkshop/gen/common/ecs/decoder ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/ecs/decoder", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VCSBitmap48Decoder = exports.VCSVersatilePlayfieldDecoder = exports.VCSPlayfieldDecoder = exports.VCSBitmapDecoder = exports.VCSSpriteDecoder = void 0;
exports.newDecoder = newDecoder;
var ecs_1 = __require("/tmp/8bitworkshop/gen/common/ecs/ecs");
var LineDecoder = /** @class */ (function () {
    function LineDecoder(text) {
        this.curline = 0; // for debugging, zero-indexed
        // split the text into lines and into tokens
        this.lines = text.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return !!s; }).map(function (s) { return s.split(/\s+/); });
    }
    LineDecoder.prototype.decodeBits = function (s, n, msbfirst) {
        if (s.length != n)
            throw new ecs_1.ECSError("Expected ".concat(n, " characters"));
        var b = 0;
        for (var i = 0; i < n; i++) {
            var bit = void 0;
            var ch = s.charAt(i);
            if (ch == 'x' || ch == 'X' || ch == '1')
                bit = 1;
            else if (ch == '.' || ch == '0')
                bit = 0;
            else
                throw new ecs_1.ECSError('need x or . (or 0 or 1)');
            if (bit) {
                if (msbfirst)
                    b |= 1 << (n - 1 - i);
                else
                    b |= 1 << i;
            }
        }
        return b;
    };
    LineDecoder.prototype.assertTokens = function (toks, count) {
        if (toks.length != count)
            throw new ecs_1.ECSError("Expected ".concat(count, " tokens on line."));
    };
    LineDecoder.prototype.hex = function (s) {
        var v = parseInt(s, 16);
        if (isNaN(v))
            throw new ecs_1.ECSError("Invalid hex value: ".concat(s));
        return v;
    };
    LineDecoder.prototype.getErrorLocation = function ($loc) {
        // TODO: blank lines mess this up
        $loc.line += this.curline + 1;
        return $loc;
    };
    return LineDecoder;
}());
var VCSSpriteDecoder = /** @class */ (function (_super) {
    __extends(VCSSpriteDecoder, _super);
    function VCSSpriteDecoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VCSSpriteDecoder.prototype.parse = function () {
        var height = this.lines.length;
        var bitmapdata = new Uint8Array(height);
        var colormapdata = new Uint8Array(height);
        for (var i = 0; i < height; i++) {
            this.curline = height - 1 - i;
            var toks = this.lines[this.curline];
            this.assertTokens(toks, 2);
            bitmapdata[i] = this.decodeBits(toks[0], 8, true);
            colormapdata[i] = this.hex(toks[1]);
        }
        return {
            properties: {
                bitmapdata: bitmapdata,
                colormapdata: colormapdata,
                height: height - 1
            }
        };
    };
    return VCSSpriteDecoder;
}(LineDecoder));
exports.VCSSpriteDecoder = VCSSpriteDecoder;
var VCSBitmapDecoder = /** @class */ (function (_super) {
    __extends(VCSBitmapDecoder, _super);
    function VCSBitmapDecoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VCSBitmapDecoder.prototype.parse = function () {
        var height = this.lines.length;
        var bitmapdata = new Uint8Array(height);
        for (var i = 0; i < height; i++) {
            this.curline = height - 1 - i;
            var toks = this.lines[this.curline];
            this.assertTokens(toks, 1);
            bitmapdata[i] = this.decodeBits(toks[0], 8, true);
        }
        return {
            properties: {
                bitmapdata: bitmapdata,
                height: height - 1
            }
        };
    };
    return VCSBitmapDecoder;
}(LineDecoder));
exports.VCSBitmapDecoder = VCSBitmapDecoder;
var VCSPlayfieldDecoder = /** @class */ (function (_super) {
    __extends(VCSPlayfieldDecoder, _super);
    function VCSPlayfieldDecoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VCSPlayfieldDecoder.prototype.parse = function () {
        var height = this.lines.length;
        var pf = new Uint32Array(height);
        for (var i = 0; i < height; i++) {
            this.curline = height - 1 - i;
            var toks = this.lines[this.curline];
            this.assertTokens(toks, 1);
            var pf0 = this.decodeBits(toks[0].substring(0, 4), 4, false) << 4;
            var pf1 = this.decodeBits(toks[0].substring(4, 12), 8, true);
            var pf2 = this.decodeBits(toks[0].substring(12, 20), 8, false);
            pf[i] = (pf0 << 0) | (pf1 << 8) | (pf2 << 16);
        }
        return {
            properties: {
                pf: pf
            }
        };
    };
    return VCSPlayfieldDecoder;
}(LineDecoder));
exports.VCSPlayfieldDecoder = VCSPlayfieldDecoder;
var VCSVersatilePlayfieldDecoder = /** @class */ (function (_super) {
    __extends(VCSVersatilePlayfieldDecoder, _super);
    function VCSVersatilePlayfieldDecoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VCSVersatilePlayfieldDecoder.prototype.parse = function () {
        var height = this.lines.length;
        var data = new Uint8Array(height * 2);
        data.fill(0x3f);
        // pf0 pf1 pf2 colupf colubk ctrlpf trash
        var regs = [0x0d, 0x0e, 0x0f, 0x08, 0x09, 0x0a, 0x3f];
        var prev = [0, 0, 0, 0, 0, 0, 0];
        var cur = [0, 0, 0, 0, 0, 0, 0];
        for (var i = 0; i < height; i++) {
            var dataofs = height * 2 - i * 2;
            this.curline = i;
            var toks = this.lines[this.curline];
            if (toks.length == 2) {
                data[dataofs - 1] = this.hex(toks[0]);
                data[dataofs - 2] = this.hex(toks[1]);
                continue;
            }
            this.assertTokens(toks, 4);
            cur[0] = this.decodeBits(toks[0].substring(0, 4), 4, false) << 4;
            cur[1] = this.decodeBits(toks[0].substring(4, 12), 8, true);
            cur[2] = this.decodeBits(toks[0].substring(12, 20), 8, false);
            if (toks[1] != '..')
                cur[3] = this.hex(toks[1]);
            if (toks[2] != '..')
                cur[4] = this.hex(toks[2]);
            if (toks[3] != '..')
                cur[5] = this.hex(toks[3]);
            var changed = [];
            for (var j = 0; j < cur.length; j++) {
                if (cur[j] != prev[j])
                    changed.push(j);
            }
            if (changed.length > 1) {
                console.log(changed, cur, prev);
                throw new ecs_1.ECSError("More than one register change in line ".concat(i + 1, ": [").concat(changed, "]"));
            }
            var chgidx = changed.length ? changed[0] : regs.length - 1;
            data[dataofs - 1] = regs[chgidx];
            data[dataofs - 2] = cur[chgidx];
            prev[chgidx] = cur[chgidx];
        }
        return {
            properties: {
                data: data
            }
        };
    };
    return VCSVersatilePlayfieldDecoder;
}(LineDecoder));
exports.VCSVersatilePlayfieldDecoder = VCSVersatilePlayfieldDecoder;
var VCSBitmap48Decoder = /** @class */ (function (_super) {
    __extends(VCSBitmap48Decoder, _super);
    function VCSBitmap48Decoder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    VCSBitmap48Decoder.prototype.parse = function () {
        var height = this.lines.length;
        var bitmap0 = new Uint8Array(height);
        var bitmap1 = new Uint8Array(height);
        var bitmap2 = new Uint8Array(height);
        var bitmap3 = new Uint8Array(height);
        var bitmap4 = new Uint8Array(height);
        var bitmap5 = new Uint8Array(height);
        for (var i = 0; i < height; i++) {
            this.curline = height - 1 - i;
            var toks = this.lines[this.curline];
            this.assertTokens(toks, 1);
            bitmap0[i] = this.decodeBits(toks[0].slice(0, 8), 8, true);
            bitmap1[i] = this.decodeBits(toks[0].slice(8, 16), 8, true);
            bitmap2[i] = this.decodeBits(toks[0].slice(16, 24), 8, true);
            bitmap3[i] = this.decodeBits(toks[0].slice(24, 32), 8, true);
            bitmap4[i] = this.decodeBits(toks[0].slice(32, 40), 8, true);
            bitmap5[i] = this.decodeBits(toks[0].slice(40, 48), 8, true);
        }
        return {
            properties: {
                bitmap0: bitmap0,
                bitmap1: bitmap1,
                bitmap2: bitmap2,
                bitmap3: bitmap3,
                bitmap4: bitmap4,
                bitmap5: bitmap5,
                height: height - 1
            }
        };
    };
    return VCSBitmap48Decoder;
}(LineDecoder));
exports.VCSBitmap48Decoder = VCSBitmap48Decoder;
function newDecoder(name, text) {
    var cons = DECODERS[name];
    if (cons)
        return new cons(text);
}
var DECODERS = {
    'vcs_sprite': VCSSpriteDecoder,
    'vcs_bitmap': VCSBitmapDecoder,
    'vcs_playfield': VCSPlayfieldDecoder,
    'vcs_versatile': VCSVersatilePlayfieldDecoder,
    'vcs_bitmap48': VCSBitmap48Decoder,
};

});


// ── /tmp/8bitworkshop/gen/common/ecs/compiler ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/ecs/compiler", function(module, exports, __require) {
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ECSActionCompiler = exports.ECSCompiler = exports.ECSTokenType = void 0;
var tokenizer_1 = __require("/tmp/8bitworkshop/gen/common/tokenizer");
var decoder_1 = __require("/tmp/8bitworkshop/gen/common/ecs/decoder");
var ecs_1 = __require("/tmp/8bitworkshop/gen/common/ecs/ecs");
var ECSTokenType;
(function (ECSTokenType) {
    ECSTokenType["Ellipsis"] = "ellipsis";
    ECSTokenType["Operator"] = "operator";
    ECSTokenType["Relational"] = "relational";
    ECSTokenType["QuotedString"] = "quoted-string";
    ECSTokenType["Integer"] = "integer";
    ECSTokenType["CodeFragment"] = "code-fragment";
    ECSTokenType["Placeholder"] = "placeholder";
})(ECSTokenType || (exports.ECSTokenType = ECSTokenType = {}));
var OPERATORS = {
    'IMP': { f: 'bimp', p: 4 },
    'EQV': { f: 'beqv', p: 5 },
    'XOR': { f: 'bxor', p: 6 },
    'OR': { f: 'bor', p: 7 }, // or "lor" for logical
    'AND': { f: 'band', p: 8 }, // or "land" for logical
    '||': { f: 'lor', p: 17 }, // not used
    '&&': { f: 'land', p: 18 }, // not used
    '=': { f: 'eq', p: 50 },
    '==': { f: 'eq', p: 50 },
    '<>': { f: 'ne', p: 50 },
    '><': { f: 'ne', p: 50 },
    '!=': { f: 'ne', p: 50 },
    '#': { f: 'ne', p: 50 },
    '<': { f: 'lt', p: 50 },
    '>': { f: 'gt', p: 50 },
    '<=': { f: 'le', p: 50 },
    '>=': { f: 'ge', p: 50 },
    'MIN': { f: 'min', p: 75 },
    'MAX': { f: 'max', p: 75 },
    '+': { f: 'add', p: 100 },
    '-': { f: 'sub', p: 100 },
};
function getOperator(op) {
    return OPERATORS[op];
}
function getPrecedence(tok) {
    switch (tok.type) {
        case ECSTokenType.Operator:
        case ECSTokenType.Relational:
        case tokenizer_1.TokenType.Ident:
            var op = getOperator(tok.str);
            if (op)
                return op.p;
    }
    return -1;
}
// is token an end of statement marker? (":" or end of line)
function isEOS(tok) {
    return tok.type == tokenizer_1.TokenType.EOL || tok.type == tokenizer_1.TokenType.Comment
        || tok.str == ':' || tok.str == 'ELSE'; // TODO: only ELSE if ifElse==true
}
///
var ECSCompiler = /** @class */ (function (_super) {
    __extends(ECSCompiler, _super);
    function ECSCompiler(em, isMainFile) {
        var _this = _super.call(this) || this;
        _this.em = em;
        _this.isMainFile = isMainFile;
        _this.currentScope = null;
        _this.currentContext = null;
        _this.includeDebugInfo = false;
        //this.includeEOL = true;
        _this.setTokenRules([
            { type: ECSTokenType.Ellipsis, regex: /\.\./ },
            { type: ECSTokenType.QuotedString, regex: /".*?"/ },
            { type: ECSTokenType.CodeFragment, regex: /---.*?---/ },
            { type: ECSTokenType.Integer, regex: /0[xX][A-Fa-f0-9]+/ },
            { type: ECSTokenType.Integer, regex: /\$[A-Fa-f0-9]+/ },
            { type: ECSTokenType.Integer, regex: /[%][01]+/ },
            { type: ECSTokenType.Integer, regex: /\d+/ },
            { type: ECSTokenType.Relational, regex: /[=<>][=<>]?/ },
            { type: ECSTokenType.Operator, regex: /[.#,:(){}\[\]\-\+]/ },
            { type: tokenizer_1.TokenType.Ident, regex: /[A-Za-z_][A-Za-z0-9_]*/ },
            { type: tokenizer_1.TokenType.Ignore, regex: /\/\/.*?[\n\r]/ },
            { type: tokenizer_1.TokenType.Ignore, regex: /\/\*.*?\*\// },
            { type: tokenizer_1.TokenType.EOL, regex: /[\n\r]+/ },
            { type: tokenizer_1.TokenType.Ignore, regex: /\s+/ },
        ]);
        _this.errorOnCatchAll = true;
        return _this;
    }
    ECSCompiler.prototype.annotate = function (fn) {
        var start = this.peekToken();
        var obj = fn();
        var end = this.lasttoken;
        var $loc = end ? (0, tokenizer_1.mergeLocs)(start.$loc, end.$loc) : start.$loc;
        if (obj)
            obj.$loc = $loc;
        return obj;
    };
    ECSCompiler.prototype.parseFile = function (text, path) {
        this.tokenizeFile(text, path);
        var _loop_1 = function () {
            var top_1 = this_1.parseTopLevel();
            if (top_1) {
                var t_1 = top_1;
                this_1.annotate(function () { return t_1; }); // TODO? typescript bug?
            }
        };
        var this_1 = this;
        while (!this.isEOF()) {
            _loop_1();
        }
        this.runDeferred();
    };
    ECSCompiler.prototype.importFile = function (path) {
        if (!this.em.imported[path]) { // already imported?
            var text = this.getImportFile && this.getImportFile(path);
            if (!text)
                this.compileError("I can't find the import file \"".concat(path, "\"."));
            this.em.imported[path] = true;
            var comp = new ECSCompiler(this.em, false);
            comp.includeDebugInfo = this.includeDebugInfo; // TODO: clone compiler
            try {
                comp.parseFile(text, path);
            }
            catch (e) {
                for (var _i = 0, _a = comp.errors; _i < _a.length; _i++) {
                    var err = _a[_i];
                    this.errors.push(err);
                }
                throw e;
            }
        }
    };
    ECSCompiler.prototype.parseTopLevel = function () {
        //this.skipBlankLines();
        var tok = this.expectTokens(['component', 'system', 'scope', 'resource', 'import', 'demo', 'comment']);
        if (tok.str == 'component') {
            return this.em.defineComponent(this.parseComponentDefinition());
        }
        if (tok.str == 'system') {
            return this.em.defineSystem(this.parseSystem());
        }
        if (tok.str == 'scope') {
            return this.parseScope();
        }
        if (tok.str == 'resource') {
            return this.em.defineSystem(this.parseResource());
        }
        if (tok.str == 'import') {
            var tok_1 = this.expectTokenTypes([ECSTokenType.QuotedString]);
            var path = tok_1.str.substring(1, tok_1.str.length - 1);
            return this.importFile(path);
        }
        if (tok.str == 'demo') {
            if (this.isMainFile) {
                var scope = this.parseScope();
                scope.isDemo = true;
                this.expectToken('demo');
                return scope;
            }
            else {
                this.skipDemo(); // don't even parse it, just skip it
                return;
            }
        }
        if (tok.str == 'comment') {
            this.expectTokenTypes([ECSTokenType.CodeFragment]);
            return;
        }
        this.compileError("Unexpected top-level keyword: ".concat(tok.str));
    };
    ECSCompiler.prototype.skipDemo = function () {
        var tok;
        while ((tok = this.consumeToken()) && !this.isEOF()) {
            if (tok.str == 'end' && this.peekToken().str == 'demo') {
                this.consumeToken();
                return;
            }
        }
        throw new ecs_1.ECSError("Expected \"end demo\" after a \"demo\" declaration.");
    };
    ECSCompiler.prototype.parseComponentDefinition = function () {
        var name = this.expectIdent().str;
        var fields = [];
        this.em.deferComponent(name);
        while (this.peekToken().str != 'end') {
            fields.push(this.parseComponentField());
        }
        this.expectToken('end');
        return { name: name, fields: fields };
    };
    ECSCompiler.prototype.parseComponentField = function () {
        var name = this.expectIdent();
        this.expectToken(':', 'I expected either a ":" or "end" here.'); // TODO
        var type = this.parseDataType();
        return __assign({ name: name.str, $loc: name.$loc }, type);
    };
    ECSCompiler.prototype.parseDataType = function () {
        if (this.peekToken().type == 'integer') {
            var lo = this.parseIntegerConstant();
            this.expectToken('..');
            var hi = this.parseIntegerConstant();
            this.checkLowerLimit(lo, -0x80000000, "lower int range");
            this.checkUpperLimit(hi, 0x7fffffff, "upper int range");
            this.checkUpperLimit(hi - lo, 0xffffffff, "int range");
            this.checkLowerLimit(hi, lo, "int range");
            // TODO: use default value?
            var defvalue = void 0;
            if (this.ifToken('default')) {
                defvalue = this.parseIntegerConstant();
            }
            // TODO: check types
            return { dtype: 'int', lo: lo, hi: hi, defvalue: defvalue };
        }
        if (this.peekToken().str == '[') {
            return { dtype: 'ref', query: this.parseQuery() };
        }
        if (this.ifToken('array')) {
            var index = undefined;
            if (this.peekToken().type == ECSTokenType.Integer) {
                index = this.parseDataType();
            }
            this.expectToken('of');
            var elem = this.parseDataType();
            var baseoffset = void 0;
            if (this.ifToken('baseoffset')) {
                baseoffset = this.parseIntegerConstant();
                this.checkLowerLimit(baseoffset, -32768, "base offset");
                this.checkUpperLimit(baseoffset, 32767, "base offset");
            }
            return { dtype: 'array', index: index, elem: elem, baseoffset: baseoffset };
        }
        if (this.ifToken('enum')) {
            this.expectToken('[');
            var enumtoks = this.parseList(this.parseEnumIdent, ',');
            this.expectToken(']');
            if (enumtoks.length == 0)
                this.compileError("must define at least one enum");
            var lo = 0;
            var hi = enumtoks.length - 1;
            this.checkLowerLimit(hi, 0, "enum count");
            this.checkUpperLimit(hi, 255, "enum count");
            var enums = {};
            for (var i = 0; i <= hi; i++)
                enums[enumtoks[i].str] = i;
            // TODO: use default value?
            var defvalue = void 0;
            if (this.ifToken('default')) {
                defvalue = this.parseIntegerConstant();
            }
            return { dtype: 'int', lo: lo, hi: hi, defvalue: defvalue, enums: enums };
        }
        throw this.compileError("I expected a data type here.");
    };
    ECSCompiler.prototype.parseEnumIdent = function () {
        var tok = this.expectTokenTypes([tokenizer_1.TokenType.Ident]);
        return tok;
    };
    ECSCompiler.prototype.parseEnumValue = function (tok, field) {
        if (!field.enums)
            throw new ecs_1.ECSError("field is not an enum");
        var value = field.enums[tok.str];
        if (value == null)
            throw new ecs_1.ECSError("unknown enum \"".concat(tok.str, "\""));
        return value;
    };
    ECSCompiler.prototype.parseDataValue = function (field) {
        var _a, _b;
        var tok = this.peekToken();
        // TODO: move to expr
        if (tok.type == tokenizer_1.TokenType.Ident && field.dtype == 'int') {
            return this.parseEnumValue(this.consumeToken(), field);
        }
        if (tok.type == tokenizer_1.TokenType.Ident) {
            var entity = (_a = this.currentScope) === null || _a === void 0 ? void 0 : _a.getEntityByName(tok.str);
            if (!entity)
                this.compileError('no entity named "${tok.str}"');
            else {
                this.consumeToken();
                this.expectToken('.');
                var fieldName = this.expectIdent().str;
                var constValue = (_b = this.currentScope) === null || _b === void 0 ? void 0 : _b.getConstValue(entity, fieldName);
                if (constValue == null)
                    throw new ecs_1.ECSError("\"".concat(fieldName, "\" is not defined as a constant"), entity);
                else
                    return constValue;
            }
        }
        if (tok.str == '[') {
            // TODO: 16-bit?
            return new Uint8Array(this.parseDataArray());
        }
        if (tok.str == '#') {
            this.consumeToken();
            var reftype = field.dtype == 'ref' ? field : undefined;
            return this.parseEntityForwardRef(reftype);
        }
        // TODO?
        return this.parseIntegerConstant();
        // TODO: throw this.compileError(`I expected a ${field.dtype} here.`);
    };
    ECSCompiler.prototype.parseEntityForwardRef = function (reftype) {
        var token = this.expectIdent();
        return { reftype: reftype, token: token };
    };
    ECSCompiler.prototype.parseDataArray = function () {
        this.expectToken('[');
        var arr = this.parseList(this.parseIntegerConstant, ',');
        this.expectToken(']');
        return arr;
    };
    ECSCompiler.prototype.expectInteger = function () {
        var s = this.consumeToken().str;
        var i;
        if (s.startsWith('$'))
            i = parseInt(s.substring(1), 16); // hex $...
        else if (s.startsWith('%'))
            i = parseInt(s.substring(1), 2); // binary %...
        else
            i = parseInt(s); // default base 10 or 16 (0x...)
        if (isNaN(i))
            this.compileError('There should be an integer here.');
        return i;
    };
    ECSCompiler.prototype.parseSystem = function () {
        var _this = this;
        var name = this.expectIdent().str;
        var actions = [];
        var system = { name: name, actions: actions };
        var cmd;
        while ((cmd = this.expectTokens(['on', 'locals', 'end']).str) != 'end') {
            if (cmd == 'on') {
                var action = this.annotate(function () { return _this.parseAction(system); });
                actions.push(action);
            }
            else if (cmd == 'locals') {
                system.tempbytes = this.parseIntegerConstant();
            }
            else {
                this.compileError("Unexpected system keyword: ".concat(cmd));
            }
        }
        return system;
    };
    ECSCompiler.prototype.parseResource = function () {
        var _this = this;
        var name = this.expectIdent().str;
        var tempbytes;
        if (this.peekToken().str == 'locals') {
            this.consumeToken();
            tempbytes = this.parseIntegerConstant();
        }
        var system = { name: name, tempbytes: tempbytes, actions: [] };
        var expr = this.annotate(function () { return _this.parseBlockStatement(); });
        var action = { expr: expr, event: name };
        system.actions.push(action);
        return system;
    };
    ECSCompiler.prototype.parseAction = function (system) {
        var _this = this;
        // TODO: unused events?
        var event = this.expectIdent().str;
        this.expectToken('do');
        var fitbytes = undefined;
        var critical = undefined;
        if (this.ifToken('critical'))
            critical = true;
        if (this.ifToken('fit'))
            fitbytes = this.parseIntegerConstant();
        var expr = this.annotate(function () { return _this.parseBlockStatement(); });
        //query, join, select, direction, 
        var action = { expr: expr, event: event, fitbytes: fitbytes, critical: critical };
        return action;
    };
    ECSCompiler.prototype.parseQuery = function () {
        var _this = this;
        var q = { include: [] };
        var start = this.expectToken('[');
        this.parseList(function () { return _this.parseQueryItem(q); }, ',');
        this.expectToken(']');
        // TODO: other params
        q.$loc = (0, tokenizer_1.mergeLocs)(start.$loc, this.lasttoken.$loc);
        return q;
    };
    ECSCompiler.prototype.parseQueryItem = function (q) {
        var _this = this;
        var prefix = this.peekToken();
        if (prefix.type != tokenizer_1.TokenType.Ident) {
            this.consumeToken();
        }
        if (prefix.type == tokenizer_1.TokenType.Ident) {
            var cref = this.parseComponentRef();
            q.include.push(cref);
        }
        else if (prefix.str == '-') {
            var cref = this.parseComponentRef();
            if (!q.exclude)
                q.exclude = [];
            q.exclude.push(cref);
        }
        else if (prefix.str == '#') {
            var scope_1 = this.currentScope;
            if (scope_1 == null) {
                throw this.compileError('You can only reference specific entities inside of a scope.');
            }
            var eref_1 = this.parseEntityForwardRef();
            this.deferred.push(function () {
                var refvalue = _this.resolveEntityRef(scope_1, eref_1);
                if (!q.entities)
                    q.entities = [];
                q.entities.push(scope_1.entities[refvalue]);
            });
        }
        else {
            this.compileError("Query components may be preceded only by a '-'.");
        }
    };
    ECSCompiler.prototype.parseEventName = function () {
        return this.expectIdent().str;
    };
    ECSCompiler.prototype.parseEventList = function () {
        return this.parseList(this.parseEventName, ",");
    };
    ECSCompiler.prototype.parseCode = function () {
        // TODO: add $loc
        var tok = this.expectTokenTypes([ECSTokenType.CodeFragment]);
        var code = tok.str.substring(3, tok.str.length - 3);
        // TODO: add after parsing maybe?
        var lines = code.split('\n');
        if (this.includeDebugInfo)
            this.addDebugInfo(lines, tok.$loc.line);
        code = lines.join('\n');
        //let acomp = new ECSActionCompiler(context);
        //let nodes = acomp.parseFile(code, this.path);
        // TODO: return nodes
        return code;
    };
    ECSCompiler.prototype.addDebugInfo = function (lines, startline) {
        var re = /^\s*(;|\/\/|$)/; // ignore comments and blank lines
        for (var i = 0; i < lines.length; i++) {
            if (!lines[i].match(re))
                lines[i] = this.em.dialect.debug_line(this.path, startline + i) + '\n' + lines[i];
        }
    };
    ECSCompiler.prototype.parseScope = function () {
        var _this = this;
        var name = this.expectIdent().str;
        var scope = this.em.newScope(name, this.currentScope || undefined);
        scope.filePath = this.path;
        this.currentScope = scope;
        var cmd;
        while ((cmd = this.expectTokens(['end', 'using', 'entity', 'scope', 'comment', 'system']).str) != 'end') {
            if (cmd == 'using') {
                this.parseScopeUsing();
            }
            if (cmd == 'entity') {
                this.annotate(function () { return _this.parseEntity(); });
            }
            if (cmd == 'scope') {
                this.annotate(function () { return _this.parseScope(); });
            }
            if (cmd == 'comment') {
                this.expectTokenTypes([ECSTokenType.CodeFragment]);
            }
            // TODO: need to make these local names, otherwise we get "duplicate name"
            if (cmd == 'system') {
                var sys = this.annotate(function () { return _this.parseSystem(); });
                this.em.defineSystem(sys);
                this.currentScope.newSystemInstanceWithDefaults(sys);
            }
        }
        this.currentScope = scope.parent || null;
        return scope;
    };
    ECSCompiler.prototype.parseScopeUsing = function () {
        var _a;
        var instlist = this.parseList(this.parseSystemInstanceRef, ',');
        var params = {};
        if (this.peekToken().str == 'with') {
            this.consumeToken();
            params = this.parseSystemInstanceParameters();
        }
        for (var _i = 0, instlist_1 = instlist; _i < instlist_1.length; _i++) {
            var inst = instlist_1[_i];
            inst.params = params;
            (_a = this.currentScope) === null || _a === void 0 ? void 0 : _a.newSystemInstance(inst);
        }
    };
    ECSCompiler.prototype.parseEntity = function () {
        if (!this.currentScope) {
            throw this.internalError();
        }
        var scope = this.currentScope;
        var entname = '';
        if (this.peekToken().type == tokenizer_1.TokenType.Ident) {
            entname = this.expectIdent().str;
        }
        var etype = this.parseEntityArchetype();
        var entity = this.currentScope.newEntity(etype, entname);
        var cmd2;
        // TODO: remove init?
        while ((cmd2 = this.expectTokens(['const', 'init', 'var', 'decode', 'end']).str) != 'end') {
            var cmd = cmd2; // put in scope
            if (cmd == 'var')
                cmd = 'init'; // TODO: remove?
            if (cmd == 'init' || cmd == 'const') {
                this.parseInitConst(cmd, scope, entity);
            }
            else if (cmd == 'decode') {
                this.parseDecode(scope, entity);
            }
        }
        return entity;
    };
    ECSCompiler.prototype.parseInitConst = function (cmd, scope, entity) {
        var _this = this;
        // TODO: check data types
        var name = this.expectIdent().str;
        var _a = this.getEntityField(entity, name), c = _a.c, f = _a.f;
        var symtype = scope.isConstOrInit(c, name);
        if (symtype && symtype != cmd)
            this.compileError("I can't mix const and init values for a given field in a scope.");
        this.expectToken('=');
        var valueOrRef = this.parseDataValue(f);
        if (valueOrRef.token != null) {
            this.deferred.push(function () {
                _this.lasttoken = valueOrRef.token; // for errors
                var refvalue = _this.resolveEntityRef(scope, valueOrRef);
                if (cmd == 'const')
                    scope.setConstValue(entity, c, f, refvalue);
                if (cmd == 'init')
                    scope.setInitValue(entity, c, f, refvalue);
            });
        }
        else {
            if (cmd == 'const')
                scope.setConstValue(entity, c, f, valueOrRef);
            if (cmd == 'init')
                scope.setInitValue(entity, c, f, valueOrRef);
        }
    };
    ECSCompiler.prototype.parseDecode = function (scope, entity) {
        var decoderid = this.expectIdent().str;
        var codetok = this.expectTokenTypes([ECSTokenType.CodeFragment]);
        var code = codetok.str;
        code = code.substring(3, code.length - 3);
        var decoder = (0, decoder_1.newDecoder)(decoderid, code);
        if (!decoder) {
            throw this.compileError("I can't find a \"".concat(decoderid, "\" decoder."));
        }
        var result;
        try {
            result = decoder.parse();
        }
        catch (e) {
            throw new ecs_1.ECSError(e.message, decoder.getErrorLocation(codetok.$loc));
        }
        for (var _i = 0, _a = Object.entries(result.properties); _i < _a.length; _i++) {
            var entry = _a[_i];
            var _b = this.getEntityField(entity, entry[0]), c = _b.c, f = _b.f;
            scope.setConstValue(entity, c, f, entry[1]);
        }
    };
    ECSCompiler.prototype.getEntityField = function (e, name) {
        if (!this.currentScope) {
            throw this.internalError();
        }
        var comps = this.em.componentsWithFieldName([e.etype], name);
        if (comps.length == 0)
            this.compileError("I couldn't find a field named \"".concat(name, "\" for this entity."));
        if (comps.length > 1)
            this.compileError("I found more than one field named \"".concat(name, "\" for this entity."));
        var component = comps[0];
        var field = component.fields.find(function (f) { return f.name == name; });
        if (!field) {
            throw this.internalError();
        }
        return { c: component, f: field };
    };
    ECSCompiler.prototype.parseEntityArchetype = function () {
        this.expectToken('[');
        var components = this.parseList(this.parseComponentRef, ',');
        this.expectToken(']');
        return { components: components };
    };
    ECSCompiler.prototype.parseComponentRef = function () {
        var name = this.expectIdent().str;
        var cref = this.em.getComponentByName(name);
        if (!cref)
            this.compileError("I couldn't find a component named \"".concat(name, "\"."));
        return cref;
    };
    ECSCompiler.prototype.findEntityByName = function (scope, token) {
        var name = token.str;
        var eref = scope.entities.find(function (e) { return e.name == name; });
        if (!eref) {
            throw this.compileError("I couldn't find an entity named \"".concat(name, "\" in this scope."), token.$loc);
        }
        return eref;
    };
    ECSCompiler.prototype.resolveEntityRef = function (scope, ref) {
        var id = this.findEntityByName(scope, ref.token).id;
        if (ref.reftype) {
            // TODO: make this a function? elo ehi etc?
            var atypes = this.em.archetypesMatching(ref.reftype.query);
            var entities = scope.entitiesMatching(atypes);
            if (entities.length == 0)
                throw this.compileError("This entity doesn't seem to fit the reference type.", ref.token.$loc);
            id -= entities[0].id;
        }
        return id;
    };
    ECSCompiler.prototype.parseSystemInstanceRef = function () {
        var name = this.expectIdent().str;
        var system = this.em.getSystemByName(name);
        if (!system)
            throw this.compileError("I couldn't find a system named \"".concat(name, "\"."), this.lasttoken.$loc);
        var params = {};
        var inst = { system: system, params: params, id: 0 };
        return inst;
    };
    ECSCompiler.prototype.parseSystemInstanceParameters = function () {
        var scope = this.currentScope;
        if (scope == null)
            throw this.internalError();
        if (this.peekToken().str == '[') {
            return { query: this.parseQuery() };
        }
        this.expectToken('#');
        var entname = this.expectIdent();
        this.expectToken('.');
        var fieldname = this.expectIdent();
        var entity = this.findEntityByName(scope, entname);
        var cf = this.getEntityField(entity, fieldname.str);
        return { refEntity: entity, refField: cf };
    };
    ECSCompiler.prototype.exportToFile = function (src) {
        this.em.exportToFile(src);
    };
    ECSCompiler.prototype.export = function () {
        var src = new ecs_1.SourceFileExport();
        src.line(this.em.dialect.debug_file(this.path));
        for (var _i = 0, _a = Object.keys(this.em.imported); _i < _a.length; _i++) {
            var path = _a[_i];
            src.line(this.em.dialect.debug_file(path));
        }
        this.exportToFile(src);
        return src.toString();
    };
    ECSCompiler.prototype.checkUpperLimit = function (value, upper, what) {
        if (value > upper)
            this.compileError("This ".concat(what, " is too high; must be ").concat(upper, " or less"));
    };
    ECSCompiler.prototype.checkLowerLimit = function (value, lower, what) {
        if (value < lower)
            this.compileError("This ".concat(what, " is too low; must be ").concat(lower, " or more"));
    };
    // expression stuff
    ECSCompiler.prototype.parseConstant = function () {
        var expr = this.parseExpr();
        expr = this.em.evalExpr(expr, this.currentScope);
        if ((0, ecs_1.isLiteral)(expr))
            return expr.value;
        throw this.compileError('This expression is not a constant.');
    };
    ECSCompiler.prototype.parseIntegerConstant = function () {
        var value = this.parseConstant();
        if (typeof value === 'number')
            return value;
        throw this.compileError('This expression is not an integer.');
    };
    ECSCompiler.prototype.parseExpr = function () {
        var startloc = this.peekToken().$loc;
        var expr = this.parseExpr1(this.parsePrimary(), 0);
        var endloc = this.lasttoken.$loc;
        expr.$loc = (0, tokenizer_1.mergeLocs)(startloc, endloc);
        return expr;
    };
    ECSCompiler.prototype.parseExpr1 = function (left, minPred) {
        var look = this.peekToken();
        while (getPrecedence(look) >= minPred) {
            var op = this.consumeToken();
            var right = this.parsePrimary();
            look = this.peekToken();
            while (getPrecedence(look) > getPrecedence(op)) {
                right = this.parseExpr1(right, getPrecedence(look));
                look = this.peekToken();
            }
            var opfn = getOperator(op.str).f;
            // use logical operators instead of bitwise?
            if (op.str == 'and')
                opfn = 'land';
            if (op.str == 'or')
                opfn = 'lor';
            var valtype = this.exprTypeForOp(opfn, left, right, op);
            left = { valtype: valtype, op: opfn, left: left, right: right };
        }
        return left;
    };
    ECSCompiler.prototype.parsePrimary = function () {
        var tok = this.consumeToken();
        switch (tok.type) {
            case ECSTokenType.Integer:
                this.pushbackToken(tok);
                var value = this.expectInteger();
                var valtype = { dtype: 'int', lo: value, hi: value };
                return { valtype: valtype, value: value };
            case tokenizer_1.TokenType.Ident:
                if (tok.str == 'not') {
                    var expr = this.parsePrimary();
                    var valtype_1 = { dtype: 'int', lo: 0, hi: 1 };
                    return { valtype: valtype_1, op: 'lnot', expr: expr };
                }
                else {
                    this.pushbackToken(tok);
                    return this.parseVarSubscriptOrFunc();
                }
            case ECSTokenType.Operator:
                if (tok.str == '(') {
                    var expr = this.parseExpr();
                    this.expectToken(')', "There should be another expression or a \")\" here.");
                    return expr;
                }
                else if (tok.str == '-') {
                    var expr = this.parsePrimary(); // TODO: -2^2=-4 and -2-2=-4
                    var valtype_2 = expr.valtype;
                    if ((valtype_2 === null || valtype_2 === void 0 ? void 0 : valtype_2.dtype) == 'int') {
                        var hi = Math.abs(valtype_2.hi);
                        var negtype = { dtype: 'int', lo: -hi, hi: hi };
                        return { valtype: negtype, op: 'neg', expr: expr };
                    }
                }
                else if (tok.str == '+') {
                    return this.parsePrimary(); // ignore unary +
                }
            default:
                throw this.compileError("The expression is incomplete.");
        }
    };
    ECSCompiler.prototype.parseVarSubscriptOrFunc = function () {
        var tok = this.consumeToken();
        switch (tok.type) {
            case tokenizer_1.TokenType.Ident:
                // component:field
                if (this.ifToken(':')) {
                    var ftok_1 = this.consumeToken();
                    var component = this.em.getComponentByName(tok.str);
                    if (!component)
                        throw this.compileError("A component named \"".concat(tok.str, "\" has not been defined."));
                    var field = component.fields.find(function (f) { return f.name == ftok_1.str; });
                    if (!field)
                        throw this.compileError("There is no \"".concat(ftok_1.str, "\" field in the ").concat(tok.str, " component."));
                    if (!this.currentScope)
                        throw this.compileError("This operation only works inside of a scope.");
                    var atypes = this.em.archetypesMatching({ include: [component] });
                    var entities = this.currentScope.entitiesMatching(atypes);
                    return { entities: entities, field: field };
                }
                // entity.field
                if (this.ifToken('.')) {
                    var ftok_2 = this.consumeToken();
                    if (!this.currentScope)
                        throw this.compileError("This operation only works inside of a scope.");
                    var entity = this.currentScope.getEntityByName(tok.str);
                    if (!entity)
                        throw this.compileError("An entity named \"".concat(tok.str, "\" has not been defined."));
                    var component = this.em.singleComponentWithFieldName([entity.etype], ftok_2.str, ftok_2);
                    var field = component.fields.find(function (f) { return f.name == ftok_2.str; });
                    if (!field)
                        throw this.compileError("There is no \"".concat(ftok_2.str, "\" field in this entity."));
                    var entities = [entity];
                    return { entities: entities, field: field };
                }
                var args = [];
                if (this.ifToken('(')) {
                    args = this.parseExprList();
                    this.expectToken(')', "There should be another expression or a \")\" here.");
                }
                var loc = (0, tokenizer_1.mergeLocs)(tok.$loc, this.lasttoken.$loc);
                var valtype = this.exprTypeForSubscript(tok.str, args, loc);
                return { valtype: valtype, name: tok.str, args: args, $loc: loc };
            default:
                throw this.compileError("There should be a variable name here.");
        }
    };
    ECSCompiler.prototype.parseLexpr = function () {
        var lexpr = this.parseVarSubscriptOrFunc();
        //this.vardefs[lexpr.name] = lexpr;
        //this.validateVarName(lexpr);
        return lexpr;
    };
    ECSCompiler.prototype.exprTypeForOp = function (fnname, left, right, optok) {
        return { dtype: 'int', lo: 0, hi: 255 }; // TODO?
    };
    ECSCompiler.prototype.exprTypeForSubscript = function (fnname, args, loc) {
        return { dtype: 'int', lo: 0, hi: 255 }; // TODO?
    };
    ECSCompiler.prototype.parseLexprList = function () {
        return this.parseList(this.parseLexpr, ',');
    };
    ECSCompiler.prototype.parseExprList = function () {
        return this.parseList(this.parseExpr, ',');
    };
    // TODO: annotate with location
    ECSCompiler.prototype.parseBlockStatement = function () {
        var _this = this;
        var valtype = { dtype: 'int', lo: 0, hi: 0 }; // TODO?
        if (this.peekToken().type == ECSTokenType.CodeFragment) {
            return { valtype: valtype, code: this.parseCode() };
        }
        if (this.ifToken('begin')) {
            var stmts = [];
            while (this.peekToken().str != 'end') {
                stmts.push(this.annotate(function () { return _this.parseBlockStatement(); }));
            }
            this.expectToken('end');
            return { valtype: valtype, stmts: stmts };
        }
        var cmd = this.peekToken();
        if (ecs_1.SELECT_TYPE.includes(cmd.str)) {
            return this.parseQueryStatement();
        }
        throw this.compileError("There should be a statement or \"end\" here.", cmd.$loc);
    };
    ECSCompiler.prototype.parseQueryStatement = function () {
        var _this = this;
        // TODO: include modifiers in error msg
        var select = this.expectTokens(ecs_1.SELECT_TYPE).str; // TODO: type check?
        var all = this.ifToken('all') != null;
        var query = undefined;
        var join = undefined;
        if (select == 'once') {
            if (this.peekToken().str == '[')
                this.compileError("A \"".concat(select, "\" action can't include a query."));
        }
        else {
            query = this.parseQuery();
        }
        if (select == 'join') {
            this.expectToken('with');
            join = this.parseQuery();
        }
        if (this.ifToken('limit')) {
            if (!query) {
                this.compileError("A \"".concat(select, "\" query can't include a limit."));
            }
            else
                query.limit = this.parseIntegerConstant();
        }
        var all_modifiers = ['asc', 'desc']; // TODO
        var modifiers = this.parseModifiers(all_modifiers);
        var direction = undefined;
        if (modifiers['asc'])
            direction = 'asc';
        else if (modifiers['desc'])
            direction = 'desc';
        var body = this.annotate(function () { return _this.parseBlockStatement(); });
        return { select: select, query: query, join: join, direction: direction, all: all, stmts: [body], loop: select == 'foreach' };
    };
    return ECSCompiler;
}(tokenizer_1.Tokenizer));
exports.ECSCompiler = ECSCompiler;
///
var ECSActionCompiler = /** @class */ (function (_super) {
    __extends(ECSActionCompiler, _super);
    function ECSActionCompiler(context) {
        var _this = _super.call(this) || this;
        _this.context = context;
        _this.setTokenRules([
            { type: ECSTokenType.Placeholder, regex: /\{\{.*?\}\}/ },
            { type: tokenizer_1.TokenType.CatchAll, regex: /[^{\n]+\n*/ },
        ]);
        _this.errorOnCatchAll = false;
        return _this;
    }
    ECSActionCompiler.prototype.parseFile = function (text, path) {
        this.tokenizeFile(text, path);
        var nodes = [];
        while (!this.isEOF()) {
            var tok = this.consumeToken();
            if (tok.type == ECSTokenType.Placeholder) {
                var args = tok.str.substring(2, tok.str.length - 2).split(/\s+/);
                nodes.push(new ecs_1.CodePlaceholderNode(this.context, tok.$loc, args));
            }
            else if (tok.type == tokenizer_1.TokenType.CatchAll) {
                nodes.push(new ecs_1.CodeLiteralNode(this.context, tok.$loc, tok.str));
            }
        }
        return nodes;
    };
    return ECSActionCompiler;
}(tokenizer_1.Tokenizer));
exports.ECSActionCompiler = ECSActionCompiler;

});


// ── tools/ecs ──────────────────────────────────────────────────────────────────
__define("tools/ecs", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleECS = assembleECS;
var compiler_1 = __require("/tmp/8bitworkshop/gen/common/ecs/compiler");
var ecs_1 = __require("/tmp/8bitworkshop/gen/common/ecs/ecs");
var tokenizer_1 = __require("/tmp/8bitworkshop/gen/common/tokenizer");
var builder_1 = __require("builder");
function assembleECS(step) {
    var em = new ecs_1.EntityManager(new ecs_1.Dialect_CA65()); // TODO
    var compiler = new compiler_1.ECSCompiler(em, true);
    compiler.getImportFile = function (path) {
        return (0, builder_1.getWorkFileAsString)(path);
    };
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.ecs" });
    if (step.mainfile)
        em.mainPath = step.path;
    var destpath = step.prefix + '.ca65';
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        // TODO
        step.params.cfgfile = 'atari2600-ecs.cfg';
        step.params.extra_link_files.push('atari2600-ecs.cfg');
        (0, builder_1.fixParamsWithDefines)(step.path, step.params);
        // remove crt0.o from libargs
        step.params.libargs = step.params.libargs.filter(function (arg) {
            return arg !== 'crt0.o';
        });
        try {
            compiler.includeDebugInfo = true;
            compiler.parseFile(code, step.path);
            var outtext = compiler.export().toString();
            (0, builder_1.putWorkFile)(destpath, outtext);
            var listings = {};
            listings[destpath] = { lines: [], text: outtext }; // TODO
            var debuginfo = compiler.em.getDebugTree();
        }
        catch (e) {
            if (e instanceof ecs_1.ECSError) {
                compiler.addError(e.message, e.$loc);
                for (var _i = 0, _a = e.$sources; _i < _a.length; _i++) {
                    var obj = _a[_i];
                    var name_1 = obj.event;
                    if (name_1 == 'start')
                        break;
                    compiler.addError("... ".concat(name_1), obj.$loc); // TODO?
                }
                return { errors: compiler.errors, listings: listings, debuginfo: debuginfo };
            }
            else if (e instanceof tokenizer_1.CompileError) {
                return { errors: compiler.errors, listings: listings, debuginfo: debuginfo };
            }
            else {
                throw e;
            }
        }
        return {
            nexttool: "ca65",
            path: destpath,
            args: [destpath],
            files: [destpath].concat(step.files),
            listings: listings,
            debuginfo: debuginfo
        };
    }
}

});


// ── /tmp/8bitworkshop/gen/common/workertypes ──────────────────────────────────────────────────────────────────
__define("/tmp/8bitworkshop/gen/common/workertypes", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SourceFile = void 0;
exports.isUnchanged = isUnchanged;
exports.isErrorResult = isErrorResult;
exports.isOutputResult = isOutputResult;
var SourceFile = /** @class */ (function () {
    function SourceFile(lines, text) {
        lines = lines || [];
        this.lines = lines;
        this.text = text;
        this.offset2loc = new Map();
        this.line2offset = new Map();
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var info = lines_1[_i];
            if (info.offset >= 0) {
                // first line wins (is assigned to offset)
                // TODO: handle macros/includes w/ multiple offsets per line
                if (!this.offset2loc[info.offset])
                    this.offset2loc[info.offset] = info;
                if (!this.line2offset[info.line])
                    this.line2offset[info.line] = info.offset;
            }
        }
    }
    // TODO: smarter about looking for source lines between two addresses
    SourceFile.prototype.findLineForOffset = function (PC, lookbehind) {
        if (this.offset2loc) {
            for (var i = 0; i <= lookbehind; i++) {
                var loc = this.offset2loc[PC];
                if (loc) {
                    return loc;
                }
                PC--;
            }
        }
        return null;
    };
    SourceFile.prototype.lineCount = function () { return this.lines.length; };
    return SourceFile;
}());
exports.SourceFile = SourceFile;
;
;
;
function isUnchanged(result) {
    return ('unchanged' in result);
}
function isErrorResult(result) {
    return ('errors' in result);
}
function isOutputResult(result) {
    return ('output' in result);
}

});


// ── tools/remote ──────────────────────────────────────────────────────────────────
__define("tools/remote", function(module, exports, __require) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildRemote = buildRemote;
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var workertypes_1 = __require("/tmp/8bitworkshop/gen/common/workertypes");
var builder_1 = __require("builder");
// create random UID
var sessionID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
// TODO: #include links but #link doesnt link
function buildRemote(step) {
    return __awaiter(this, void 0, void 0, function () {
        var REMOTE_URL, binpath, updates, i, path, entry, data, cmd, result, json;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('../../remote.json')];
                case 1: return [4 /*yield*/, (_a.sent()).json()];
                case 2:
                    REMOTE_URL = (_a.sent()).REMOTE_URL;
                    if (typeof REMOTE_URL !== 'string')
                        throw new Error("No REMOTE_URL in remote.json");
                    (0, builder_1.gatherFiles)(step); // TODO?
                    binpath = "a.out";
                    if (!(0, builder_1.staleFiles)(step, [binpath])) return [3 /*break*/, 5];
                    updates = [];
                    for (i = 0; i < step.files.length; i++) {
                        path = step.files[i];
                        entry = builder_1.store.workfs[path];
                        data = typeof entry.data === 'string' ? entry.data : "data:base64," + btoa((0, util_1.byteArrayToString)(entry.data));
                        updates.push({ path: path, data: data });
                    }
                    cmd = { buildStep: step, updates: updates, sessionID: sessionID };
                    // do a POST to the remote server, sending step as JSON
                    console.log('POST', cmd);
                    return [4 /*yield*/, fetch(REMOTE_URL, {
                            method: "POST",
                            mode: "cors",
                            body: JSON.stringify(cmd),
                            headers: {
                                "Content-Type": "application/json"
                            }
                        })];
                case 3:
                    result = _a.sent();
                    return [4 /*yield*/, result.json()];
                case 4:
                    json = _a.sent();
                    // parse the result as JSON
                    if ((0, workertypes_1.isUnchanged)(json))
                        return [2 /*return*/, json];
                    if ((0, workertypes_1.isErrorResult)(json))
                        return [2 /*return*/, json];
                    if ((0, workertypes_1.isOutputResult)(json)) {
                        json.output = (0, util_1.stringToByteArray)(atob(json.output));
                        return [2 /*return*/, json];
                    }
                    throw new Error("Unexpected result from remote build: ".concat(JSON.stringify(json)));
                case 5: return [2 /*return*/];
            }
        });
    });
}

});


// ── tools/acme ──────────────────────────────────────────────────────────────────
__define("tools/acme", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleACME = assembleACME;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
function parseACMESymbolTable(text) {
    var symbolmap = {};
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].trim();
        // 	init_text	= $81b	; ?
        var m = line.match(/(\w+)\s*=\s*[$]([0-9a-f]+)/i);
        if (m) {
            symbolmap[m[1]] = parseInt(m[2], 16);
        }
    }
    return symbolmap;
}
function parseACMEReportFile(text) {
    var listings = {};
    var listing;
    var lines = text.split("\n");
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i].trim();
        // ; ******** Source: hello.acme
        var m1 = line.match(/^;\s*[*]+\s*Source: (.+)$/);
        if (m1) {
            var file = m1[1];
            listings[file] = listing = {
                lines: [],
            };
            continue;
        }
        //    15  0815 201b08             		jsr init_text		; write line of text
        var m2 = line.match(/^(\d+)\s+([0-9a-f]+)\s+([0-9a-f]+)/i);
        if (m2) {
            if (listing) {
                listing.lines.push({
                    line: parseInt(m2[1]),
                    offset: parseInt(m2[2], 16),
                    insns: m2[3],
                });
            }
        }
    }
    return listings;
}
function assembleACME(step) {
    var _a;
    (0, wasmutils_1.loadNative)("acme");
    var errors = [];
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.acme" });
    var binpath = step.prefix + ".bin";
    var lstpath = step.prefix + ".lst";
    var sympath = step.prefix + ".sym";
    if ((0, builder_1.staleFiles)(step, [binpath])) {
        var binout, lstout, symout;
        var ACME = wasmutils_1.emglobal.acme({
            instantiateWasm: (0, wasmutils_1.moduleInstFn)('acme'),
            noInitialRun: true,
            print: wasmutils_1.print_fn,
            printErr: (0, listingutils_1.msvcErrorMatcher)(errors),
            //printErr: makeErrorMatcher(errors, /(Error|Warning) - File (.+?), line (\d+)[^:]+: (.+)/, 3, 4, step.path, 2),
        });
        var FS = ACME.FS;
        (0, builder_1.populateFiles)(step, FS);
        (0, builder_1.fixParamsWithDefines)(step.path, step.params);
        var args = ['--msvc', '--initmem', '0', '-o', binpath, '-r', lstpath, '-l', sympath, step.path];
        if ((_a = step.params) === null || _a === void 0 ? void 0 : _a.acmeargs) {
            args.unshift.apply(args, step.params.acmeargs);
        }
        else {
            args.unshift.apply(args, ['-f', 'plain']);
        }
        args.unshift.apply(args, ["-D__8BITWORKSHOP__=1"]);
        if (step.mainfile) {
            args.unshift.apply(args, ["-D__MAIN__=1"]);
        }
        (0, wasmutils_1.execMain)(step, ACME, args);
        if (errors.length) {
            var listings = {};
            return { errors: errors, listings: listings };
        }
        binout = FS.readFile(binpath, { encoding: 'binary' });
        lstout = FS.readFile(lstpath, { encoding: 'utf8' });
        symout = FS.readFile(sympath, { encoding: 'utf8' });
        (0, builder_1.putWorkFile)(binpath, binout);
        (0, builder_1.putWorkFile)(lstpath, lstout);
        (0, builder_1.putWorkFile)(sympath, symout);
        return {
            output: binout,
            listings: parseACMEReportFile(lstout),
            errors: errors,
            symbolmap: parseACMESymbolTable(symout),
        };
    }
}

});


// ── tools/cc7800 ──────────────────────────────────────────────────────────────────
__define("tools/cc7800", function(module, exports, __require) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileCC7800 = compileCC7800;
var wasishim_1 = __require("/tmp/8bitworkshop/gen/common/wasi/wasishim");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasiutils_1 = __require("wasiutils");
var wasmutils_1 = __require("wasmutils");
var cc7800_fs = null;
var wasiModule = null;
function compileCC7800(step) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, destpath, wasi, _i, _a, file, stdout, stderr, matcher, _b, _c, line, combinedasm;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    errors = [];
                    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
                    destpath = "./a.out";
                    if (!(0, builder_1.staleFiles)(step, [destpath])) return [3 /*break*/, 3];
                    if (!!cc7800_fs) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, wasiutils_1.loadWASIFilesystemZip)("cc7800-fs.zip")];
                case 1:
                    cc7800_fs = _d.sent();
                    _d.label = 2;
                case 2:
                    if (!wasiModule) {
                        wasiModule = new WebAssembly.Module((0, wasmutils_1.loadWASMBinary)("cc7800"));
                    }
                    wasi = new wasishim_1.WASIRunner();
                    wasi.initSync(wasiModule);
                    wasi.fs.setParent(cc7800_fs);
                    for (_i = 0, _a = step.files; _i < _a.length; _i++) {
                        file = _a[_i];
                        wasi.fs.putFile("./" + file, builder_1.store.getFileData(file));
                    }
                    wasi.addPreopenDirectory("headers");
                    wasi.addPreopenDirectory(".");
                    wasi.setArgs(["cc7800", "-v", "-g", "-S", "-I", "headers", step.path]);
                    try {
                        wasi.run();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                    stdout = wasi.fds[1].getBytesAsString();
                    stderr = wasi.fds[2].getBytesAsString();
                    console.log('stdout', stdout);
                    console.log('stderr', stderr);
                    // Syntax error: Unknown identifier cputes on line 11 of test.c78
                    if (stderr.indexOf("Syntax error:") >= 0) {
                        matcher = (0, listingutils_1.makeErrorMatcher)(errors, /^Syntax error: (.+?) on line (\d+) of (.+)/, 2, 1, step.path, 3);
                        for (_b = 0, _c = stderr.split('\n'); _b < _c.length; _b++) {
                            line = _c[_b];
                            matcher(line);
                        }
                    }
                    if (errors.length) {
                        return [2 /*return*/, { errors: errors }];
                    }
                    console.log(wasi.fs);
                    combinedasm = wasi.fs.getFile(destpath).getBytesAsString();
                    (0, builder_1.putWorkFile)(destpath, combinedasm);
                    _d.label = 3;
                case 3: return [2 /*return*/, {
                        nexttool: "dasm",
                        path: destpath,
                        args: [destpath],
                        files: [destpath]
                    }];
            }
        });
    });
}

});


// ── tools/cc2600 ──────────────────────────────────────────────────────────────────
__define("tools/cc2600", function(module, exports, __require) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compilecc2600 = compilecc2600;
var wasishim_1 = __require("/tmp/8bitworkshop/gen/common/wasi/wasishim");
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasiutils_1 = __require("wasiutils");
var wasmutils_1 = __require("wasmutils");
var cc2600_fs = null;
var wasiModule = null;
function compilecc2600(step) {
    return __awaiter(this, void 0, void 0, function () {
        var errors, destpath, wasi, _i, _a, file, stdout, stderr, matcher, _b, _c, line, combinedasm;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    errors = [];
                    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
                    destpath = "./a.out";
                    if (!(0, builder_1.staleFiles)(step, [destpath])) return [3 /*break*/, 3];
                    if (!!cc2600_fs) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, wasiutils_1.loadWASIFilesystemZip)("cc2600-fs.zip")];
                case 1:
                    cc2600_fs = _d.sent();
                    _d.label = 2;
                case 2:
                    if (!wasiModule) {
                        wasiModule = new WebAssembly.Module((0, wasmutils_1.loadWASMBinary)("cc2600"));
                    }
                    wasi = new wasishim_1.WASIRunner();
                    wasi.initSync(wasiModule);
                    wasi.fs.setParent(cc2600_fs);
                    for (_i = 0, _a = step.files; _i < _a.length; _i++) {
                        file = _a[_i];
                        wasi.fs.putFile("./" + file, builder_1.store.getFileData(file));
                    }
                    wasi.addPreopenDirectory("headers");
                    wasi.addPreopenDirectory(".");
                    wasi.setArgs(["cc2600", "-v", "-g", "-S", "-I", "headers", step.path]);
                    try {
                        wasi.run();
                    }
                    catch (e) {
                        errors.push(e);
                    }
                    stdout = wasi.fds[1].getBytesAsString();
                    stderr = wasi.fds[2].getBytesAsString();
                    console.log('stdout', stdout);
                    console.log('stderr', stderr);
                    // Syntax error: Unknown identifier cputes on line 11 of test.c78
                    if (stderr.indexOf("Syntax error:") >= 0) {
                        matcher = (0, listingutils_1.makeErrorMatcher)(errors, /^Syntax error: (.+?) on line (\d+) of (.+)/, 2, 1, step.path, 3);
                        for (_b = 0, _c = stderr.split('\n'); _b < _c.length; _b++) {
                            line = _c[_b];
                            matcher(line);
                        }
                    }
                    if (errors.length) {
                        return [2 /*return*/, { errors: errors }];
                    }
                    console.log(wasi.fs);
                    combinedasm = wasi.fs.getFile(destpath).getBytesAsString();
                    (0, builder_1.putWorkFile)(destpath, combinedasm);
                    _d.label = 3;
                case 3: return [2 /*return*/, {
                        nexttool: "dasm",
                        path: destpath,
                        args: [destpath],
                        files: [destpath]
                    }];
            }
        });
    });
}

});


// ── tools/bataribasic ──────────────────────────────────────────────────────────────────
__define("tools/bataribasic", function(module, exports, __require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileBatariBasic = compileBatariBasic;
var builder_1 = __require("builder");
var wasmutils_1 = __require("wasmutils");
function preprocessBatariBasic(code) {
    (0, wasmutils_1.load)("bbpreprocess");
    var bbout = "";
    function addbbout_fn(s) {
        bbout += s;
        bbout += "\n";
    }
    var BBPRE = wasmutils_1.emglobal.preprocess({
        noInitialRun: true,
        //logReadFiles:true,
        print: addbbout_fn,
        printErr: wasmutils_1.print_fn,
        noFSInit: true,
    });
    var FS = BBPRE.FS;
    (0, wasmutils_1.setupStdin)(FS, code);
    BBPRE.callMain([]);
    console.log("preprocess " + code.length + " -> " + bbout.length + " bytes");
    return bbout;
}
function compileBatariBasic(step) {
    (0, wasmutils_1.load)("bb2600basic");
    var params = step.params;
    // stdout
    var asmout = "";
    function addasmout_fn(s) {
        asmout += s;
        asmout += "\n";
    }
    // stderr
    var re_err1 = /[(](\d+)[)]:?\s*(.+)/;
    var errors = [];
    var errline = 0;
    function match_fn(s) {
        console.log(s);
        var matches = re_err1.exec(s);
        if (matches) {
            errline = parseInt(matches[1]);
            errors.push({
                line: errline,
                msg: matches[2]
            });
        }
    }
    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.bas" });
    var destpath = step.prefix + '.asm';
    if ((0, builder_1.staleFiles)(step, [destpath])) {
        var BB = wasmutils_1.emglobal.bb2600basic({
            noInitialRun: true,
            //logReadFiles:true,
            print: addasmout_fn,
            printErr: match_fn,
            noFSInit: true,
            TOTAL_MEMORY: 64 * 1024 * 1024,
        });
        var FS = BB.FS;
        (0, builder_1.populateFiles)(step, FS);
        // preprocess, pipe file to stdin
        var code = (0, builder_1.getWorkFileAsString)(step.path);
        code = preprocessBatariBasic(code);
        (0, wasmutils_1.setupStdin)(FS, code);
        (0, wasmutils_1.setupFS)(FS, '2600basic');
        (0, wasmutils_1.execMain)(step, BB, ["-i", "/share", step.path]);
        if (errors.length)
            return { errors: errors };
        // build final assembly output from include file list
        var includesout = FS.readFile("includes.bB", { encoding: 'utf8' });
        var redefsout = FS.readFile("2600basic_variable_redefs.h", { encoding: 'utf8' });
        var includes = includesout.trim().split("\n");
        var combinedasm = "";
        var splitasm = asmout.split("bB.asm file is split here");
        for (var _i = 0, includes_1 = includes; _i < includes_1.length; _i++) {
            var incfile = includes_1[_i];
            var inctext;
            if (incfile == "bB.asm")
                inctext = splitasm[0];
            else if (incfile == "bB2.asm")
                inctext = splitasm[1];
            else
                inctext = FS.readFile("/share/includes/" + incfile, { encoding: 'utf8' });
            console.log(incfile, inctext.length);
            combinedasm += "\n\n;;;" + incfile + "\n\n";
            combinedasm += inctext;
        }
        // TODO: ; bB.asm file is split here
        (0, builder_1.putWorkFile)(destpath, combinedasm);
        (0, builder_1.putWorkFile)("2600basic.h", FS.readFile("/share/includes/2600basic.h"));
        (0, builder_1.putWorkFile)("2600basic_variable_redefs.h", redefsout);
    }
    return {
        nexttool: "dasm",
        path: destpath,
        args: [destpath],
        files: [destpath, "2600basic.h", "2600basic_variable_redefs.h"],
        bblines: true,
    };
}

});


// ── tools/oscar64 ──────────────────────────────────────────────────────────────────
__define("tools/oscar64", function(module, exports, __require) {
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileOscar64 = compileOscar64;
var builder_1 = __require("builder");
var listingutils_1 = __require("listingutils");
var wasmutils_1 = __require("wasmutils");
function compileOscar64(step) {
    return __awaiter(this, void 0, void 0, function () {
        var params, destpath, errors, matcher, oscar64, FS, args, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    (0, wasmutils_1.loadNative)("oscar64");
                    params = step.params;
                    (0, builder_1.gatherFiles)(step, { mainFilePath: "main.c" });
                    destpath = (step.path || "main.c").replace(/\.[^.]+$/, ".prg");
                    errors = [];
                    if (!(0, builder_1.staleFiles)(step, [destpath])) return [3 /*break*/, 2];
                    matcher = (0, listingutils_1.makeErrorMatcher)(errors, /\((\d+),\s+(\d+)\)\s+: error (\d+): (.+)/, 1, 4, step.path);
                    return [4 /*yield*/, wasmutils_1.emglobal.Oscar64({
                            instantiateWasm: (0, wasmutils_1.moduleInstFn)('oscar64'),
                            noInitialRun: true,
                            print: wasmutils_1.print_fn,
                            printErr: matcher,
                        })];
                case 1:
                    oscar64 = _a.sent();
                    FS = oscar64.FS;
                    //setupFS(FS, 'oscar64');
                    (0, builder_1.populateFiles)(step, FS);
                    (0, builder_1.populateExtraFiles)(step, FS, params.extra_compile_files);
                    args = ["-v", "-g", "-i=/root", step.path];
                    (0, wasmutils_1.execMain)(step, oscar64, args);
                    if (errors.length)
                        return [2 /*return*/, { errors: errors }];
                    output = FS.readFile(destpath, { encoding: 'binary' });
                    (0, builder_1.putWorkFile)(destpath, output);
                    return [2 /*return*/, {
                            output: output,
                            errors: errors,
                            //listings,
                            //symbolmap
                        }];
                case 2: return [2 /*return*/];
            }
        });
    });
}

});


// ── workertools ──────────────────────────────────────────────────────────────────
__define("workertools", function(module, exports, __require) {
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_PRELOADFS = exports.TOOLS = void 0;
var misc = __importStar(__require("tools/misc"));
var cc65 = __importStar(__require("tools/cc65"));
var dasm = __importStar(__require("tools/dasm"));
var sdcc = __importStar(__require("tools/sdcc"));
var verilog = __importStar(__require("tools/verilog"));
var m6809 = __importStar(__require("tools/m6809"));
var m6502 = __importStar(__require("tools/m6502"));
var z80 = __importStar(__require("tools/z80"));
var x86 = __importStar(__require("tools/x86"));
var arm = __importStar(__require("tools/arm"));
var ecs = __importStar(__require("tools/ecs"));
var remote = __importStar(__require("tools/remote"));
var acme = __importStar(__require("tools/acme"));
var cc7800 = __importStar(__require("tools/cc7800"));
var cc2600 = __importStar(__require("tools/cc2600"));
var bataribasic = __importStar(__require("tools/bataribasic"));
var oscar64 = __importStar(__require("tools/oscar64"));
exports.TOOLS = {
    'dasm': dasm.assembleDASM,
    'acme': acme.assembleACME,
    'cc65': cc65.compileCC65,
    'ca65': cc65.assembleCA65,
    'ld65': cc65.linkLD65,
    //'z80asm': assembleZ80ASM,
    //'sccz80': compileSCCZ80,
    'sdasz80': sdcc.assembleSDASZ80,
    'sdasgb': sdcc.assembleSDASGB,
    'sdldz80': sdcc.linkSDLDZ80,
    'sdcc': sdcc.compileSDCC,
    'xasm6809': m6809.assembleXASM6809,
    'cmoc': m6809.compileCMOC,
    'lwasm': m6809.assembleLWASM,
    'lwlink': m6809.linkLWLINK,
    //'naken': assembleNAKEN,
    'verilator': verilog.compileVerilator,
    'yosys': verilog.compileYosys,
    'jsasm': verilog.compileJSASMStep,
    'zmac': z80.assembleZMAC,
    'nesasm': m6502.assembleNESASM,
    'smlrc': x86.compileSmallerC,
    'yasm': x86.assembleYASM,
    'bataribasic': bataribasic.compileBatariBasic,
    'markdown': misc.translateShowdown,
    'inform6': misc.compileInform6,
    'merlin32': m6502.assembleMerlin32,
    'fastbasic': m6502.compileFastBasic,
    'basic': misc.compileBASIC,
    'silice': verilog.compileSilice,
    'wiz': misc.compileWiz,
    'armips': arm.assembleARMIPS,
    'vasmarm': arm.assembleVASMARM,
    'ecs': ecs.assembleECS,
    'remote': remote.buildRemote,
    'cc7800': cc7800.compileCC7800,
    'cc2600': cc2600.compilecc2600,
    'armtcc': arm.compileARMTCC,
    'armtcclink': arm.linkARMTCC,
    'oscar64': oscar64.compileOscar64,
};
exports.TOOL_PRELOADFS = {
    'cc65-apple2': '65-apple2',
    'ca65-apple2': '65-apple2',
    'cc65-c64': '65-c64',
    'ca65-c64': '65-c64',
    'cc65-vic20': '65-vic20',
    'ca65-vic20': '65-vic20',
    'cc65-nes': '65-nes',
    'ca65-nes': '65-nes',
    'cc65-atari8': '65-atari8',
    'ca65-atari8': '65-atari8',
    'cc65-vector': '65-none',
    'ca65-vector': '65-none',
    'cc65-atari7800': '65-none',
    'ca65-atari7800': '65-none',
    'cc65-devel': '65-none',
    'ca65-devel': '65-none',
    'cc65-vcs': '65-atari2600',
    'ca65-vcs': '65-atari2600',
    'cc65-pce': '65-pce',
    'ca65-pce': '65-pce',
    'cc65-exidy': '65-none',
    'ca65-exidy': '65-none',
    'sdasz80': 'sdcc',
    'sdasgb': 'sdcc',
    'sdcc': 'sdcc',
    'sccz80': 'sccz80',
    'bataribasic': '2600basic',
    'inform6': 'inform',
    'fastbasic': '65-atari8',
    'silice': 'Silice',
    'wiz': 'wiz',
    'ecs-vcs': '65-atari2600', // TODO: support multiple platforms
    'ecs-nes': '65-nes', // TODO: support multiple platforms
    'ecs-c64': '65-c64', // TODO: support multiple platforms
};

});


// ── builder ──────────────────────────────────────────────────────────────────
__define("builder", function(module, exports, __require) {
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.builder = exports.Builder = exports.store = exports.FileWorkingStore = exports.PWORKER = void 0;
exports.errorResult = errorResult;
exports.starttime = starttime;
exports.endtime = endtime;
exports.putWorkFile = putWorkFile;
exports.getWorkFileAsString = getWorkFileAsString;
exports.populateEntry = populateEntry;
exports.gatherFiles = gatherFiles;
exports.getPrefix = getPrefix;
exports.populateFiles = populateFiles;
exports.populateExtraFiles = populateExtraFiles;
exports.staleFiles = staleFiles;
exports.anyTargetChanged = anyTargetChanged;
exports.fixParamsWithDefines = fixParamsWithDefines;
exports.processEmbedDirective = processEmbedDirective;
var util_1 = __require("/tmp/8bitworkshop/gen/common/util");
var platforms_1 = __require("platforms");
var workertools_1 = __require("workertools");
/// working file store and build steps
var PSRC = "../../src/";
exports.PWORKER = PSRC + "worker/";
;
///
var FileWorkingStore = /** @class */ (function () {
    function FileWorkingStore() {
        this.workfs = {};
        this.workerseq = 0;
        this.reset();
    }
    FileWorkingStore.prototype.reset = function () {
        this.workfs = {};
        this.newVersion();
    };
    FileWorkingStore.prototype.currentVersion = function () {
        return this.workerseq;
    };
    FileWorkingStore.prototype.newVersion = function () {
        var ts = new Date().getTime();
        if (ts <= this.workerseq)
            ts = ++this.workerseq;
        return ts;
    };
    FileWorkingStore.prototype.putFile = function (path, data) {
        var encoding = (typeof data === 'string') ? 'utf8' : 'binary';
        var entry = this.workfs[path];
        if (!entry || !compareData(entry.data, data) || entry.encoding != encoding) {
            this.workfs[path] = entry = { path: path, data: data, encoding: encoding, ts: this.newVersion() };
            console.log('+++', entry.path, entry.encoding, entry.data.length, entry.ts);
        }
        return entry;
    };
    FileWorkingStore.prototype.hasFile = function (path) {
        return this.workfs[path] != null;
    };
    FileWorkingStore.prototype.getFileData = function (path) {
        return this.workfs[path] && this.workfs[path].data;
    };
    FileWorkingStore.prototype.getFileAsString = function (path) {
        var data = this.getFileData(path);
        if (data != null && typeof data !== 'string')
            throw new Error("".concat(path, ": expected string"));
        return data; // TODO
    };
    FileWorkingStore.prototype.getFileEntry = function (path) {
        return this.workfs[path];
    };
    FileWorkingStore.prototype.setItem = function (key, value) {
        this.items[key] = value;
    };
    return FileWorkingStore;
}());
exports.FileWorkingStore = FileWorkingStore;
exports.store = new FileWorkingStore();
///
function errorResult(msg) {
    return { errors: [{ line: 0, msg: msg }] };
}
var Builder = /** @class */ (function () {
    function Builder() {
        this.steps = [];
        this.startseq = 0;
    }
    // returns true if file changed during this build step
    Builder.prototype.wasChanged = function (entry) {
        return entry.ts > this.startseq;
    };
    Builder.prototype.executeBuildSteps = function () {
        return __awaiter(this, void 0, void 0, function () {
            var linkstep, step, platform, _a, tool, remoteTool, toolfn, _b, e_1, r, asmstep;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        this.startseq = exports.store.currentVersion();
                        linkstep = null;
                        _c.label = 1;
                    case 1:
                        if (!this.steps.length) return [3 /*break*/, 6];
                        step = this.steps.shift();
                        platform = step.platform;
                        _a = step.tool.split(':', 2), tool = _a[0], remoteTool = _a[1];
                        toolfn = workertools_1.TOOLS[tool];
                        if (!toolfn) {
                            throw Error("no tool named \"".concat(tool, "\""));
                        }
                        if (remoteTool) {
                            step.tool = remoteTool;
                        }
                        step.params = platforms_1.PLATFORM_PARAMS[(0, util_1.getBasePlatform)(platform)];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        _b = step;
                        return [4 /*yield*/, toolfn(step)];
                    case 3:
                        _b.result = _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        e_1 = _c.sent();
                        console.log("EXCEPTION", e_1, e_1.stack);
                        return [2 /*return*/, errorResult(e_1 + "")]; // TODO: catch errors already generated?
                    case 5:
                        if (step.result) {
                            step.result.params = step.params; // TODO: type check
                            if (step.debuginfo) {
                                r = step.result;
                                if (!r.debuginfo)
                                    r.debuginfo = {};
                                Object.assign(r.debuginfo, step.debuginfo);
                            }
                            // errors? return them
                            if ('errors' in step.result && step.result.errors.length) {
                                applyDefaultErrorPath(step.result.errors, step.path);
                                return [2 /*return*/, step.result];
                            }
                            // if we got some output, return it immediately
                            if ('output' in step.result && step.result.output) {
                                return [2 /*return*/, step.result];
                            }
                            // combine files with a link tool?
                            if ('linktool' in step.result) {
                                // add to existing link step
                                if (linkstep) {
                                    linkstep.files = linkstep.files.concat(step.result.files);
                                    linkstep.args = linkstep.args.concat(step.result.args);
                                }
                                else {
                                    linkstep = {
                                        tool: step.result.linktool,
                                        platform: platform,
                                        files: step.result.files,
                                        args: step.result.args
                                    };
                                }
                                linkstep.debuginfo = step.debuginfo; // TODO: multiple debuginfos
                            }
                            // process with another tool?
                            if ('nexttool' in step.result) {
                                asmstep = __assign({ tool: step.result.nexttool, platform: platform }, step.result);
                                this.steps.push(asmstep);
                            }
                            // process final step?
                            if (this.steps.length == 0 && linkstep) {
                                this.steps.push(linkstep);
                                linkstep = null;
                            }
                        }
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Builder.prototype.handleMessage = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.steps = [];
                        // file updates
                        if (data.updates) {
                            data.updates.forEach(function (u) { return exports.store.putFile(u.path, u.data); });
                        }
                        // object update
                        if (data.setitems) {
                            data.setitems.forEach(function (i) { return exports.store.setItem(i.key, i.value); });
                        }
                        // build steps
                        if (data.buildsteps) {
                            this.steps.push.apply(this.steps, data.buildsteps);
                        }
                        // single-file
                        if (data.code) {
                            this.steps.push(data); // TODO: remove cast
                        }
                        if (!this.steps.length) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.executeBuildSteps()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result ? result : { unchanged: true }];
                    case 2:
                        // TODO: cache results
                        // message not recognized
                        console.log("Unknown message", data);
                        return [2 /*return*/];
                }
            });
        });
    };
    return Builder;
}());
exports.Builder = Builder;
function applyDefaultErrorPath(errors, path) {
    if (!path)
        return;
    for (var i = 0; i < errors.length; i++) {
        var err = errors[i];
        if (!err.path && err.line)
            err.path = path;
    }
}
function compareData(a, b) {
    if (a.length != b.length)
        return false;
    if (typeof a === 'string' && typeof b === 'string') {
        return a == b;
    }
    else {
        for (var i = 0; i < a.length; i++) {
            //if (a[i] != b[i]) console.log('differ at byte',i,a[i],b[i]);
            if (a[i] != b[i])
                return false;
        }
        return true;
    }
}
exports.builder = new Builder();
var _t1;
function starttime() { _t1 = new Date(); }
function endtime(msg) { var _t2 = new Date(); console.log(msg, _t2.getTime() - _t1.getTime(), "ms"); }
///
function putWorkFile(path, data) {
    return exports.store.putFile(path, data);
}
function getWorkFileAsString(path) {
    return exports.store.getFileAsString(path);
}
function populateEntry(fs, path, entry, options) {
    var data = entry.data;
    if (options && options.processFn) {
        data = options.processFn(path, data);
    }
    // create subfolders
    var toks = path.split('/');
    if (toks.length > 1) {
        for (var i = 0; i < toks.length - 1; i++)
            try {
                fs.mkdir(toks[i]);
            }
            catch (e) { }
    }
    // write file
    fs.writeFile(path, data, { encoding: entry.encoding });
    var time = new Date(entry.ts);
    fs.utime(path, time, time);
    console.log("<<<", path, entry.data.length);
}
// can call multiple times (from populateFiles)
function gatherFiles(step, options) {
    var maxts = 0;
    if (step.files) {
        for (var i = 0; i < step.files.length; i++) {
            var path = step.files[i];
            var entry = exports.store.workfs[path];
            if (!entry) {
                throw new Error("No entry for path '" + path + "'");
            }
            else {
                maxts = Math.max(maxts, entry.ts);
            }
        }
    }
    else if (step.code) {
        var path = step.path ? step.path : options.mainFilePath; // TODO: what if options null
        if (!path)
            throw Error("need path or mainFilePath");
        var code = step.code;
        var entry = putWorkFile(path, code);
        step.path = path;
        step.files = [path];
        maxts = entry.ts;
    }
    else if (step.path) {
        var path = step.path;
        var entry = exports.store.workfs[path];
        maxts = entry.ts;
        step.files = [path];
    }
    if (step.path && !step.prefix) {
        step.prefix = getPrefix(step.path);
    }
    step.maxts = maxts;
    return maxts;
}
function getPrefix(s) {
    var pos = s.lastIndexOf('.');
    return (pos > 0) ? s.substring(0, pos) : s;
}
function populateFiles(step, fs, options) {
    gatherFiles(step, options);
    if (!step.files)
        throw Error("call gatherFiles() first");
    for (var i = 0; i < step.files.length; i++) {
        var path = step.files[i];
        populateEntry(fs, path, exports.store.workfs[path], options);
    }
}
function populateExtraFiles(step, fs, extrafiles) {
    if (extrafiles) {
        for (var i = 0; i < extrafiles.length; i++) {
            var xfn = extrafiles[i];
            // is this file cached?
            if (exports.store.workfs[xfn]) {
                fs.writeFile(xfn, exports.store.workfs[xfn].data, { encoding: 'binary' });
                continue;
            }
            // fetch from network
            var xpath = "lib/" + (0, util_1.getBasePlatform)(step.platform) + "/" + xfn;
            var xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            xhr.open("GET", exports.PWORKER + xpath, false); // synchronous request
            xhr.send(null);
            if (xhr.response && xhr.status == 200) {
                var data = new Uint8Array(xhr.response);
                fs.writeFile(xfn, data, { encoding: 'binary' });
                putWorkFile(xfn, data);
                console.log(":::", xfn, data.length);
            }
            else {
                throw Error("Could not load extra file " + xpath);
            }
        }
    }
}
function staleFiles(step, targets) {
    if (!step.maxts)
        throw Error("call populateFiles() first");
    // see if any target files are more recent than inputs
    for (var i = 0; i < targets.length; i++) {
        var entry = exports.store.workfs[targets[i]];
        if (!entry || step.maxts > entry.ts)
            return true;
    }
    console.log("unchanged", step.maxts, targets);
    return false;
}
function anyTargetChanged(step, targets) {
    if (!step.maxts)
        throw Error("call populateFiles() first");
    // see if any target files are more recent than inputs
    for (var i = 0; i < targets.length; i++) {
        var entry = exports.store.workfs[targets[i]];
        if (!entry || entry.ts > step.maxts)
            return true;
    }
    console.log("unchanged", step.maxts, targets);
    return false;
}
function fixParamsWithDefines(path, params) {
    var libargs = params.libargs;
    if (path && libargs) {
        var code = getWorkFileAsString(path);
        if (code) {
            var oldcfgfile = params.cfgfile;
            var ident2index = {};
            // find all lib args "IDENT=VALUE"
            for (var i = 0; i < libargs.length; i++) {
                var toks = libargs[i].split('=');
                if (toks.length == 2) {
                    ident2index[toks[0]] = i;
                }
            }
            // find #defines and replace them
            var re = /^[;/]?#define\s+(\w+)\s+(\S+)/gmi; // TODO: empty string?
            var m;
            while (m = re.exec(code)) {
                var ident = m[1];
                var value = m[2];
                var index = ident2index[ident];
                if (index >= 0) {
                    libargs[index] = ident + "=" + value;
                    console.log('Using libargs', index, libargs[index]);
                    // TODO: MMC3 mapper switch
                    if (ident == 'NES_MAPPER' && value == '4') {
                        params.cfgfile = 'nesbanked.cfg';
                        console.log("using config file", params.cfgfile);
                    }
                }
                else if (ident == 'CFGFILE' && value) {
                    params.cfgfile = value;
                }
                else if (ident == 'LIBARGS' && value) {
                    params.libargs = value.split(',').filter(function (s) { return s != ''; });
                    console.log('Using libargs', params.libargs);
                }
                else if (ident == 'CC65_FLAGS' && value) {
                    params.extra_compiler_args = value.split(',').filter(function (s) { return s != ''; });
                    console.log('Using compiler flags', params.extra_compiler_args);
                }
            }
        }
    }
}
function processEmbedDirective(code) {
    var re3 = /^\s*#embed\s+"(.+?)"/gm;
    // find #embed "filename.bin" and replace with C array data
    return code.replace(re3, function (m, m1) {
        var filename = m1;
        var filedata = exports.store.getFileData(filename);
        var bytes = (0, util_1.convertDataToUint8Array)(filedata);
        if (!bytes)
            throw new Error('#embed: file not found: "' + filename + '"');
        var out = '';
        for (var i = 0; i < bytes.length; i++) {
            out += bytes[i].toString() + ',';
        }
        return out.substring(0, out.length - 1);
    });
}

});


// ── Bootstrap ─────────────────────────────────────────────────────────────
var _builder   = __require("builder");
var _platforms = __require("platforms");
/* workertools registers tools as a side-effect */
__require("workertools");

_g['retroCompileEngine'] = {
  store:           _builder.store,
  builder:         _builder.builder,
  PLATFORM_PARAMS: _platforms.PLATFORM_PARAMS,
  configure: function(opts) {
    var base    = opts.baseUrl    || './';
    var libBase = base + 'lib/';

    // Override PWORKER so loadNative()/loadWASM() fetch from our hosted assets.
    // PWORKER is used as a prefix for both importScripts and XHR calls.
    _builder.PWORKER = base;

    // Also patch it on the wasmutils module's exported reference
    var wu = __require("wasmutils");
    // wasmutils reads PWORKER from builder at call time via builder_1.PWORKER,
    // so patching _builder is sufficient. But guard anyway:
    if (wu && 'PWORKER' in wu) wu.PWORKER = base;

    // Shim importScripts to fetch-and-eval synchronously when called from
    // inside new Function() (the vendor bundle context).
    // In a classic worker importScripts() IS available, so this is only
    // needed as a fallback / path-rewrite layer.
    var origImportScripts = _g['importScripts'];
    _g['importScripts'] = function(url) {
      // Rewrite relative paths that originate inside 8bws source tree
      // e.g. "../../src/worker/wasm/sdcc.js" → base + "wasm/sdcc.js"
      var m = url.match(/(?:wasm|asmjs)\/([^/]+\.js)$/);
      if (m) {
        var dir = url.indexOf('/asmjs/') >= 0 ? 'asmjs/' : 'wasm/';
        url = base + dir + m[1];
      }
      if (origImportScripts) {
        origImportScripts.call(_g, url);
      } else {
        // Fallback: synchronous XHR + eval (for non-worker contexts)
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.send(null);
        if (xhr.status === 200) new Function(xhr.responseText)();
        else throw new Error('importScripts failed: ' + url + ' (' + xhr.status + ')');
      }
    };

    _installXhrInterceptor(libBase);
  },
  syncFs: function(meta, blob) {
    var wu = __require("wasmutils");
    if (!wu || !wu.fsMeta) return;
    Object.assign(wu.fsMeta, meta);
    _g['fsBlob'] = _g['fsBlob'] || {};
    Object.assign(_g['fsBlob'], blob);
  },
};

// XHR interceptor — rewrites 8bws-internal lib/ paths to our hosted assets
function _installXhrInterceptor(libBase) {
  var OrigXHR = _g['XMLHttpRequest'];
  if (!OrigXHR || OrigXHR.__rc_patched) return;
  function PatchedXHR() {
    var inner = new OrigXHR();
    return new Proxy(inner, {
      get: function(_, prop) {
        if (prop === 'open') {
          return function(method, url, async) {
            var m = url.match(/(?:src\/worker\/)?lib\/(.+)$/);
            if (m) url = libBase + m[1];
            return inner.open.call(inner, method, url, async);
          };
        }
        var v = inner[prop];
        return typeof v === 'function' ? v.bind(inner) : v;
      },
      set: function(_, prop, val) { inner[prop] = val; return true; },
    });
  }
  PatchedXHR.__rc_patched = true;
  _g['XMLHttpRequest'] = PatchedXHR;
}

})();
