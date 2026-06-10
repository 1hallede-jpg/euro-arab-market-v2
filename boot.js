var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc7) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc7 = __getOwnPropDesc(from, key)) || desc7.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parseCookie = parseCookie;
    exports.parse = parseCookie;
    exports.stringifyCookie = stringifyCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    exports.parseSetCookie = parseSetCookie;
    exports.stringifySetCookie = stringifySetCookie;
    exports.serialize = stringifySetCookie;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var maxAgeRegExp = /^-?\d+$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parseCookie(str, options) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options?.decode || decode;
      let index = 0;
      do {
        const eqIdx = eqIndex(str, index, len);
        if (eqIdx === -1)
          break;
        const endIdx = endIndex(str, index, len);
        if (eqIdx > endIdx) {
          index = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const key = valueSlice(str, index, eqIdx);
        if (obj[key] === void 0) {
          obj[key] = dec(valueSlice(str, eqIdx + 1, endIdx));
        }
        index = endIdx + 1;
      } while (index < len);
      return obj;
    }
    function stringifyCookie(cookie3, options) {
      const enc = options?.encode || encodeURIComponent;
      const cookieStrings = [];
      for (const name of Object.keys(cookie3)) {
        const val = cookie3[name];
        if (val === void 0)
          continue;
        if (!cookieNameRegExp.test(name)) {
          throw new TypeError(`cookie name is invalid: ${name}`);
        }
        const value = enc(val);
        if (!cookieValueRegExp.test(value)) {
          throw new TypeError(`cookie val is invalid: ${val}`);
        }
        cookieStrings.push(`${name}=${value}`);
      }
      return cookieStrings.join("; ");
    }
    function stringifySetCookie(_name, _val, _opts) {
      const cookie3 = typeof _name === "object" ? _name : { ..._opts, name: _name, value: String(_val) };
      const options = typeof _val === "object" ? _val : _opts;
      const enc = options?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(cookie3.name)) {
        throw new TypeError(`argument name is invalid: ${cookie3.name}`);
      }
      const value = cookie3.value ? enc(cookie3.value) : "";
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${cookie3.value}`);
      }
      let str = cookie3.name + "=" + value;
      if (cookie3.maxAge !== void 0) {
        if (!Number.isInteger(cookie3.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${cookie3.maxAge}`);
        }
        str += "; Max-Age=" + cookie3.maxAge;
      }
      if (cookie3.domain) {
        if (!domainValueRegExp.test(cookie3.domain)) {
          throw new TypeError(`option domain is invalid: ${cookie3.domain}`);
        }
        str += "; Domain=" + cookie3.domain;
      }
      if (cookie3.path) {
        if (!pathValueRegExp.test(cookie3.path)) {
          throw new TypeError(`option path is invalid: ${cookie3.path}`);
        }
        str += "; Path=" + cookie3.path;
      }
      if (cookie3.expires) {
        if (!isDate2(cookie3.expires) || !Number.isFinite(cookie3.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${cookie3.expires}`);
        }
        str += "; Expires=" + cookie3.expires.toUTCString();
      }
      if (cookie3.httpOnly) {
        str += "; HttpOnly";
      }
      if (cookie3.secure) {
        str += "; Secure";
      }
      if (cookie3.partitioned) {
        str += "; Partitioned";
      }
      if (cookie3.priority) {
        const priority = typeof cookie3.priority === "string" ? cookie3.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${cookie3.priority}`);
        }
      }
      if (cookie3.sameSite) {
        const sameSite = typeof cookie3.sameSite === "string" ? cookie3.sameSite.toLowerCase() : cookie3.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${cookie3.sameSite}`);
        }
      }
      return str;
    }
    function parseSetCookie(str, options) {
      const dec = options?.decode || decode;
      const len = str.length;
      const endIdx = endIndex(str, 0, len);
      const eqIdx = eqIndex(str, 0, endIdx);
      const setCookie2 = eqIdx === -1 ? { name: "", value: dec(valueSlice(str, 0, endIdx)) } : {
        name: valueSlice(str, 0, eqIdx),
        value: dec(valueSlice(str, eqIdx + 1, endIdx))
      };
      let index = endIdx + 1;
      while (index < len) {
        const endIdx2 = endIndex(str, index, len);
        const eqIdx2 = eqIndex(str, index, endIdx2);
        const attr = eqIdx2 === -1 ? valueSlice(str, index, endIdx2) : valueSlice(str, index, eqIdx2);
        const val = eqIdx2 === -1 ? void 0 : valueSlice(str, eqIdx2 + 1, endIdx2);
        switch (attr.toLowerCase()) {
          case "httponly":
            setCookie2.httpOnly = true;
            break;
          case "secure":
            setCookie2.secure = true;
            break;
          case "partitioned":
            setCookie2.partitioned = true;
            break;
          case "domain":
            setCookie2.domain = val;
            break;
          case "path":
            setCookie2.path = val;
            break;
          case "max-age":
            if (val && maxAgeRegExp.test(val))
              setCookie2.maxAge = Number(val);
            break;
          case "expires":
            if (!val)
              break;
            const date = new Date(val);
            if (Number.isFinite(date.valueOf()))
              setCookie2.expires = date;
            break;
          case "priority":
            if (!val)
              break;
            const priority = val.toLowerCase();
            if (priority === "low" || priority === "medium" || priority === "high") {
              setCookie2.priority = priority;
            }
            break;
          case "samesite":
            if (!val)
              break;
            const sameSite = val.toLowerCase();
            if (sameSite === "lax" || sameSite === "strict" || sameSite === "none") {
              setCookie2.sameSite = sameSite;
            }
            break;
        }
        index = endIdx2 + 1;
      }
      return setCookie2;
    }
    function endIndex(str, min, len) {
      const index = str.indexOf(";", min);
      return index === -1 ? len : index;
    }
    function eqIndex(str, min, max) {
      const index = str.indexOf("=", min);
      return index < max ? index : -1;
    }
    function valueSlice(str, min, max) {
      let start = min;
      let end = max;
      do {
        const code = str.charCodeAt(start);
        if (code !== 32 && code !== 9)
          break;
      } while (++start < end);
      while (end > start) {
        const code = str.charCodeAt(end - 1);
        if (code !== 32 && code !== 9)
          break;
        end--;
      }
      return str.slice(start, end);
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e) {
        return str;
      }
    }
    function isDate2(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/hono/dist/compose.js
var compose = (middleware, onError, onNotFound) => {
  return (context, next) => {
    let index = -1;
    return dispatch(0);
    async function dispatch(i) {
      if (i <= index) {
        throw new Error("next() called multiple times");
      }
      index = i;
      let res;
      let isError2 = false;
      let handler;
      if (middleware[i]) {
        handler = middleware[i][0][0];
        context.req.routeIndex = i;
      } else {
        handler = i === middleware.length && next || void 0;
      }
      if (handler) {
        try {
          res = await handler(context, () => dispatch(i + 1));
        } catch (err) {
          if (err instanceof Error && onError) {
            context.error = err;
            res = await onError(err, context);
            isError2 = true;
          } else {
            throw err;
          }
        }
      } else {
        if (context.finalized === false && onNotFound) {
          res = await onNotFound(context);
        }
      }
      if (res && (context.finalized === false || isError2)) {
        context.res = res;
      }
      return context;
    }
  };
};

// node_modules/hono/dist/request/constants.js
var GET_MATCH_RESULT = /* @__PURE__ */ Symbol();

// node_modules/hono/dist/utils/body.js
var parseBody = async (request, options = /* @__PURE__ */ Object.create(null)) => {
  const { all = false, dot = false } = options;
  const headers = request instanceof HonoRequest ? request.raw.headers : request.headers;
  const contentType = headers.get("Content-Type");
  if (contentType?.startsWith("multipart/form-data") || contentType?.startsWith("application/x-www-form-urlencoded")) {
    return parseFormData(request, { all, dot });
  }
  return {};
};
async function parseFormData(request, options) {
  const formData = await request.formData();
  if (formData) {
    return convertFormDataToBodyData(formData, options);
  }
  return {};
}
function convertFormDataToBodyData(formData, options) {
  const form = /* @__PURE__ */ Object.create(null);
  formData.forEach((value, key) => {
    const shouldParseAllValues = options.all || key.endsWith("[]");
    if (!shouldParseAllValues) {
      form[key] = value;
    } else {
      handleParsingAllValues(form, key, value);
    }
  });
  if (options.dot) {
    Object.entries(form).forEach(([key, value]) => {
      const shouldParseDotValues = key.includes(".");
      if (shouldParseDotValues) {
        handleParsingNestedValues(form, key, value);
        delete form[key];
      }
    });
  }
  return form;
}
var handleParsingAllValues = (form, key, value) => {
  if (form[key] !== void 0) {
    if (Array.isArray(form[key])) {
      ;
      form[key].push(value);
    } else {
      form[key] = [form[key], value];
    }
  } else {
    if (!key.endsWith("[]")) {
      form[key] = value;
    } else {
      form[key] = [value];
    }
  }
};
var handleParsingNestedValues = (form, key, value) => {
  if (/(?:^|\.)__proto__\./.test(key)) {
    return;
  }
  let nestedForm = form;
  const keys = key.split(".");
  keys.forEach((key2, index) => {
    if (index === keys.length - 1) {
      nestedForm[key2] = value;
    } else {
      if (!nestedForm[key2] || typeof nestedForm[key2] !== "object" || Array.isArray(nestedForm[key2]) || nestedForm[key2] instanceof File) {
        nestedForm[key2] = /* @__PURE__ */ Object.create(null);
      }
      nestedForm = nestedForm[key2];
    }
  });
};

// node_modules/hono/dist/utils/url.js
var splitPath = (path2) => {
  const paths = path2.split("/");
  if (paths[0] === "") {
    paths.shift();
  }
  return paths;
};
var splitRoutingPath = (routePath) => {
  const { groups, path: path2 } = extractGroupsFromPath(routePath);
  const paths = splitPath(path2);
  return replaceGroupMarks(paths, groups);
};
var extractGroupsFromPath = (path2) => {
  const groups = [];
  path2 = path2.replace(/\{[^}]+\}/g, (match2, index) => {
    const mark = `@${index}`;
    groups.push([mark, match2]);
    return mark;
  });
  return { groups, path: path2 };
};
var replaceGroupMarks = (paths, groups) => {
  for (let i = groups.length - 1; i >= 0; i--) {
    const [mark] = groups[i];
    for (let j = paths.length - 1; j >= 0; j--) {
      if (paths[j].includes(mark)) {
        paths[j] = paths[j].replace(mark, groups[i][1]);
        break;
      }
    }
  }
  return paths;
};
var patternCache = {};
var getPattern = (label, next) => {
  if (label === "*") {
    return "*";
  }
  const match2 = label.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
  if (match2) {
    const cacheKey = `${label}#${next}`;
    if (!patternCache[cacheKey]) {
      if (match2[2]) {
        patternCache[cacheKey] = next && next[0] !== ":" && next[0] !== "*" ? [cacheKey, match2[1], new RegExp(`^${match2[2]}(?=/${next})`)] : [label, match2[1], new RegExp(`^${match2[2]}$`)];
      } else {
        patternCache[cacheKey] = [label, match2[1], true];
      }
    }
    return patternCache[cacheKey];
  }
  return null;
};
var tryDecode = (str, decoder) => {
  try {
    return decoder(str);
  } catch {
    return str.replace(/(?:%[0-9A-Fa-f]{2})+/g, (match2) => {
      try {
        return decoder(match2);
      } catch {
        return match2;
      }
    });
  }
};
var tryDecodeURI = (str) => tryDecode(str, decodeURI);
var getPath = (request) => {
  const url = request.url;
  const start = url.indexOf("/", url.indexOf(":") + 4);
  let i = start;
  for (; i < url.length; i++) {
    const charCode = url.charCodeAt(i);
    if (charCode === 37) {
      const queryIndex = url.indexOf("?", i);
      const hashIndex = url.indexOf("#", i);
      const end = queryIndex === -1 ? hashIndex === -1 ? void 0 : hashIndex : hashIndex === -1 ? queryIndex : Math.min(queryIndex, hashIndex);
      const path2 = url.slice(start, end);
      return tryDecodeURI(path2.includes("%25") ? path2.replace(/%25/g, "%2525") : path2);
    } else if (charCode === 63 || charCode === 35) {
      break;
    }
  }
  return url.slice(start, i);
};
var getPathNoStrict = (request) => {
  const result = getPath(request);
  return result.length > 1 && result.at(-1) === "/" ? result.slice(0, -1) : result;
};
var mergePath = (base, sub, ...rest) => {
  if (rest.length) {
    sub = mergePath(sub, ...rest);
  }
  return `${base?.[0] === "/" ? "" : "/"}${base}${sub === "/" ? "" : `${base?.at(-1) === "/" ? "" : "/"}${sub?.[0] === "/" ? sub.slice(1) : sub}`}`;
};
var checkOptionalParameter = (path2) => {
  if (path2.charCodeAt(path2.length - 1) !== 63 || !path2.includes(":")) {
    return null;
  }
  const segments = path2.split("/");
  const results = [];
  let basePath = "";
  segments.forEach((segment) => {
    if (segment !== "" && !/\:/.test(segment)) {
      basePath += "/" + segment;
    } else if (/\:/.test(segment)) {
      if (/\?/.test(segment)) {
        if (results.length === 0 && basePath === "") {
          results.push("/");
        } else {
          results.push(basePath);
        }
        const optionalSegment = segment.replace("?", "");
        basePath += "/" + optionalSegment;
        results.push(basePath);
      } else {
        basePath += "/" + segment;
      }
    }
  });
  return results.filter((v, i, a) => a.indexOf(v) === i);
};
var _decodeURI = (value) => {
  if (!/[%+]/.test(value)) {
    return value;
  }
  if (value.indexOf("+") !== -1) {
    value = value.replace(/\+/g, " ");
  }
  return value.indexOf("%") !== -1 ? tryDecode(value, decodeURIComponent_) : value;
};
var _getQueryParam = (url, key, multiple) => {
  let encoded;
  if (!multiple && key && !/[%+]/.test(key)) {
    let keyIndex2 = url.indexOf("?", 8);
    if (keyIndex2 === -1) {
      return void 0;
    }
    if (!url.startsWith(key, keyIndex2 + 1)) {
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    while (keyIndex2 !== -1) {
      const trailingKeyCode = url.charCodeAt(keyIndex2 + key.length + 1);
      if (trailingKeyCode === 61) {
        const valueIndex = keyIndex2 + key.length + 2;
        const endIndex = url.indexOf("&", valueIndex);
        return _decodeURI(url.slice(valueIndex, endIndex === -1 ? void 0 : endIndex));
      } else if (trailingKeyCode == 38 || isNaN(trailingKeyCode)) {
        return "";
      }
      keyIndex2 = url.indexOf(`&${key}`, keyIndex2 + 1);
    }
    encoded = /[%+]/.test(url);
    if (!encoded) {
      return void 0;
    }
  }
  const results = {};
  encoded ??= /[%+]/.test(url);
  let keyIndex = url.indexOf("?", 8);
  while (keyIndex !== -1) {
    const nextKeyIndex = url.indexOf("&", keyIndex + 1);
    let valueIndex = url.indexOf("=", keyIndex);
    if (valueIndex > nextKeyIndex && nextKeyIndex !== -1) {
      valueIndex = -1;
    }
    let name = url.slice(
      keyIndex + 1,
      valueIndex === -1 ? nextKeyIndex === -1 ? void 0 : nextKeyIndex : valueIndex
    );
    if (encoded) {
      name = _decodeURI(name);
    }
    keyIndex = nextKeyIndex;
    if (name === "") {
      continue;
    }
    let value;
    if (valueIndex === -1) {
      value = "";
    } else {
      value = url.slice(valueIndex + 1, nextKeyIndex === -1 ? void 0 : nextKeyIndex);
      if (encoded) {
        value = _decodeURI(value);
      }
    }
    if (multiple) {
      if (!(results[name] && Array.isArray(results[name]))) {
        results[name] = [];
      }
      ;
      results[name].push(value);
    } else {
      results[name] ??= value;
    }
  }
  return key ? results[key] : results;
};
var getQueryParam = _getQueryParam;
var getQueryParams = (url, key) => {
  return _getQueryParam(url, key, true);
};
var decodeURIComponent_ = decodeURIComponent;

// node_modules/hono/dist/request.js
var tryDecodeURIComponent = (str) => tryDecode(str, decodeURIComponent_);
var HonoRequest = class {
  /**
   * `.raw` can get the raw Request object.
   *
   * @see {@link https://hono.dev/docs/api/request#raw}
   *
   * @example
   * ```ts
   * // For Cloudflare Workers
   * app.post('/', async (c) => {
   *   const metadata = c.req.raw.cf?.hostMetadata?
   *   ...
   * })
   * ```
   */
  raw;
  #validatedData;
  // Short name of validatedData
  #matchResult;
  routeIndex = 0;
  /**
   * `.path` can get the pathname of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#path}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const pathname = c.req.path // `/about/me`
   * })
   * ```
   */
  path;
  bodyCache = {};
  constructor(request, path2 = "/", matchResult = [[]]) {
    this.raw = request;
    this.path = path2;
    this.#matchResult = matchResult;
    this.#validatedData = {};
  }
  param(key) {
    return key ? this.#getDecodedParam(key) : this.#getAllDecodedParams();
  }
  #getDecodedParam(key) {
    const paramKey = this.#matchResult[0][this.routeIndex][1][key];
    const param = this.#getParamValue(paramKey);
    return param && /\%/.test(param) ? tryDecodeURIComponent(param) : param;
  }
  #getAllDecodedParams() {
    const decoded = {};
    const keys = Object.keys(this.#matchResult[0][this.routeIndex][1]);
    for (const key of keys) {
      const value = this.#getParamValue(this.#matchResult[0][this.routeIndex][1][key]);
      if (value !== void 0) {
        decoded[key] = /\%/.test(value) ? tryDecodeURIComponent(value) : value;
      }
    }
    return decoded;
  }
  #getParamValue(paramKey) {
    return this.#matchResult[1] ? this.#matchResult[1][paramKey] : paramKey;
  }
  query(key) {
    return getQueryParam(this.url, key);
  }
  queries(key) {
    return getQueryParams(this.url, key);
  }
  header(name) {
    if (name) {
      return this.raw.headers.get(name) ?? void 0;
    }
    const headerData = {};
    this.raw.headers.forEach((value, key) => {
      headerData[key] = value;
    });
    return headerData;
  }
  async parseBody(options) {
    return parseBody(this, options);
  }
  #cachedBody = (key) => {
    const { bodyCache, raw: raw2 } = this;
    const cachedBody = bodyCache[key];
    if (cachedBody) {
      return cachedBody;
    }
    const anyCachedKey = Object.keys(bodyCache)[0];
    if (anyCachedKey) {
      return bodyCache[anyCachedKey].then((body) => {
        if (anyCachedKey === "json") {
          body = JSON.stringify(body);
        }
        return new Response(body)[key]();
      });
    }
    return bodyCache[key] = raw2[key]();
  };
  /**
   * `.json()` can parse Request body of type `application/json`
   *
   * @see {@link https://hono.dev/docs/api/request#json}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.json()
   * })
   * ```
   */
  json() {
    return this.#cachedBody("text").then((text2) => JSON.parse(text2));
  }
  /**
   * `.text()` can parse Request body of type `text/plain`
   *
   * @see {@link https://hono.dev/docs/api/request#text}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.text()
   * })
   * ```
   */
  text() {
    return this.#cachedBody("text");
  }
  /**
   * `.arrayBuffer()` parse Request body as an `ArrayBuffer`
   *
   * @see {@link https://hono.dev/docs/api/request#arraybuffer}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.arrayBuffer()
   * })
   * ```
   */
  arrayBuffer() {
    return this.#cachedBody("arrayBuffer");
  }
  /**
   * `.bytes()` parses the request body as a `Uint8Array`.
   *
   * @see {@link https://hono.dev/docs/api/request#bytes}
   *
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.bytes()
   * })
   * ```
   */
  bytes() {
    return this.#cachedBody("arrayBuffer").then((buffer) => new Uint8Array(buffer));
  }
  /**
   * Parses the request body as a `Blob`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.blob();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#blob
   */
  blob() {
    return this.#cachedBody("blob");
  }
  /**
   * Parses the request body as `FormData`.
   * @example
   * ```ts
   * app.post('/entry', async (c) => {
   *   const body = await c.req.formData();
   * });
   * ```
   * @see https://hono.dev/docs/api/request#formdata
   */
  formData() {
    return this.#cachedBody("formData");
  }
  /**
   * Adds validated data to the request.
   *
   * @param target - The target of the validation.
   * @param data - The validated data to add.
   */
  addValidatedData(target, data) {
    this.#validatedData[target] = data;
  }
  valid(target) {
    return this.#validatedData[target];
  }
  /**
   * `.url()` can get the request url strings.
   *
   * @see {@link https://hono.dev/docs/api/request#url}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const url = c.req.url // `http://localhost:8787/about/me`
   *   ...
   * })
   * ```
   */
  get url() {
    return this.raw.url;
  }
  /**
   * `.method()` can get the method name of the request.
   *
   * @see {@link https://hono.dev/docs/api/request#method}
   *
   * @example
   * ```ts
   * app.get('/about/me', (c) => {
   *   const method = c.req.method // `GET`
   * })
   * ```
   */
  get method() {
    return this.raw.method;
  }
  get [GET_MATCH_RESULT]() {
    return this.#matchResult;
  }
  /**
   * `.matchedRoutes()` can return a matched route in the handler
   *
   * @deprecated
   *
   * Use matchedRoutes helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#matchedroutes}
   *
   * @example
   * ```ts
   * app.use('*', async function logger(c, next) {
   *   await next()
   *   c.req.matchedRoutes.forEach(({ handler, method, path }, i) => {
   *     const name = handler.name || (handler.length < 2 ? '[handler]' : '[middleware]')
   *     console.log(
   *       method,
   *       ' ',
   *       path,
   *       ' '.repeat(Math.max(10 - path.length, 0)),
   *       name,
   *       i === c.req.routeIndex ? '<- respond from here' : ''
   *     )
   *   })
   * })
   * ```
   */
  get matchedRoutes() {
    return this.#matchResult[0].map(([[, route]]) => route);
  }
  /**
   * `routePath()` can retrieve the path registered within the handler
   *
   * @deprecated
   *
   * Use routePath helper defined in "hono/route" instead.
   *
   * @see {@link https://hono.dev/docs/api/request#routepath}
   *
   * @example
   * ```ts
   * app.get('/posts/:id', (c) => {
   *   return c.json({ path: c.req.routePath })
   * })
   * ```
   */
  get routePath() {
    return this.#matchResult[0].map(([[, route]]) => route)[this.routeIndex].path;
  }
};

// node_modules/hono/dist/utils/html.js
var HtmlEscapedCallbackPhase = {
  Stringify: 1,
  BeforeStream: 2,
  Stream: 3
};
var raw = (value, callbacks) => {
  const escapedString = new String(value);
  escapedString.isEscaped = true;
  escapedString.callbacks = callbacks;
  return escapedString;
};
var resolveCallback = async (str, phase, preserveCallbacks, context, buffer) => {
  if (typeof str === "object" && !(str instanceof String)) {
    if (!(str instanceof Promise)) {
      str = str.toString();
    }
    if (str instanceof Promise) {
      str = await str;
    }
  }
  const callbacks = str.callbacks;
  if (!callbacks?.length) {
    return Promise.resolve(str);
  }
  if (buffer) {
    buffer[0] += str;
  } else {
    buffer = [str];
  }
  const resStr = Promise.all(callbacks.map((c) => c({ phase, buffer, context }))).then(
    (res) => Promise.all(
      res.filter(Boolean).map((str2) => resolveCallback(str2, phase, false, context, buffer))
    ).then(() => buffer[0])
  );
  if (preserveCallbacks) {
    return raw(await resStr, callbacks);
  } else {
    return resStr;
  }
};

// node_modules/hono/dist/context.js
var TEXT_PLAIN = "text/plain; charset=UTF-8";
var setDefaultContentType = (contentType, headers) => {
  return {
    "Content-Type": contentType,
    ...headers
  };
};
var createResponseInstance = (body, init) => new Response(body, init);
var Context = class {
  #rawRequest;
  #req;
  /**
   * `.env` can get bindings (environment variables, secrets, KV namespaces, D1 database, R2 bucket etc.) in Cloudflare Workers.
   *
   * @see {@link https://hono.dev/docs/api/context#env}
   *
   * @example
   * ```ts
   * // Environment object for Cloudflare Workers
   * app.get('*', async c => {
   *   const counter = c.env.COUNTER
   * })
   * ```
   */
  env = {};
  #var;
  finalized = false;
  /**
   * `.error` can get the error object from the middleware if the Handler throws an error.
   *
   * @see {@link https://hono.dev/docs/api/context#error}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   await next()
   *   if (c.error) {
   *     // do something...
   *   }
   * })
   * ```
   */
  error;
  #status;
  #executionCtx;
  #res;
  #layout;
  #renderer;
  #notFoundHandler;
  #preparedHeaders;
  #matchResult;
  #path;
  /**
   * Creates an instance of the Context class.
   *
   * @param req - The Request object.
   * @param options - Optional configuration options for the context.
   */
  constructor(req, options) {
    this.#rawRequest = req;
    if (options) {
      this.#executionCtx = options.executionCtx;
      this.env = options.env;
      this.#notFoundHandler = options.notFoundHandler;
      this.#path = options.path;
      this.#matchResult = options.matchResult;
    }
  }
  /**
   * `.req` is the instance of {@link HonoRequest}.
   */
  get req() {
    this.#req ??= new HonoRequest(this.#rawRequest, this.#path, this.#matchResult);
    return this.#req;
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#event}
   * The FetchEvent associated with the current request.
   *
   * @throws Will throw an error if the context does not have a FetchEvent.
   */
  get event() {
    if (this.#executionCtx && "respondWith" in this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no FetchEvent");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#executionctx}
   * The ExecutionContext associated with the current request.
   *
   * @throws Will throw an error if the context does not have an ExecutionContext.
   */
  get executionCtx() {
    if (this.#executionCtx) {
      return this.#executionCtx;
    } else {
      throw Error("This context has no ExecutionContext");
    }
  }
  /**
   * @see {@link https://hono.dev/docs/api/context#res}
   * The Response object for the current request.
   */
  get res() {
    return this.#res ||= createResponseInstance(null, {
      headers: this.#preparedHeaders ??= new Headers()
    });
  }
  /**
   * Sets the Response object for the current request.
   *
   * @param _res - The Response object to set.
   */
  set res(_res) {
    if (this.#res && _res) {
      _res = createResponseInstance(_res.body, _res);
      for (const [k, v] of this.#res.headers.entries()) {
        if (k === "content-type") {
          continue;
        }
        if (k === "set-cookie") {
          const cookies = this.#res.headers.getSetCookie();
          _res.headers.delete("set-cookie");
          for (const cookie3 of cookies) {
            _res.headers.append("set-cookie", cookie3);
          }
        } else {
          _res.headers.set(k, v);
        }
      }
    }
    this.#res = _res;
    this.finalized = true;
  }
  /**
   * `.render()` can create a response within a layout.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   return c.render('Hello!')
   * })
   * ```
   */
  render = (...args) => {
    this.#renderer ??= (content) => this.html(content);
    return this.#renderer(...args);
  };
  /**
   * Sets the layout for the response.
   *
   * @param layout - The layout to set.
   * @returns The layout function.
   */
  setLayout = (layout) => this.#layout = layout;
  /**
   * Gets the current layout for the response.
   *
   * @returns The current layout function.
   */
  getLayout = () => this.#layout;
  /**
   * `.setRenderer()` can set the layout in the custom middleware.
   *
   * @see {@link https://hono.dev/docs/api/context#render-setrenderer}
   *
   * @example
   * ```tsx
   * app.use('*', async (c, next) => {
   *   c.setRenderer((content) => {
   *     return c.html(
   *       <html>
   *         <body>
   *           <p>{content}</p>
   *         </body>
   *       </html>
   *     )
   *   })
   *   await next()
   * })
   * ```
   */
  setRenderer = (renderer) => {
    this.#renderer = renderer;
  };
  /**
   * `.header()` can set headers.
   *
   * @see {@link https://hono.dev/docs/api/context#header}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  header = (name, value, options) => {
    if (this.finalized) {
      this.#res = createResponseInstance(this.#res.body, this.#res);
    }
    const headers = this.#res ? this.#res.headers : this.#preparedHeaders ??= new Headers();
    if (value === void 0) {
      headers.delete(name);
    } else if (options?.append) {
      headers.append(name, value);
    } else {
      headers.set(name, value);
    }
  };
  status = (status) => {
    this.#status = status;
  };
  /**
   * `.set()` can set the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.use('*', async (c, next) => {
   *   c.set('message', 'Hono is hot!!')
   *   await next()
   * })
   * ```
   */
  set = (key, value) => {
    this.#var ??= /* @__PURE__ */ new Map();
    this.#var.set(key, value);
  };
  /**
   * `.get()` can use the value specified by the key.
   *
   * @see {@link https://hono.dev/docs/api/context#set-get}
   *
   * @example
   * ```ts
   * app.get('/', (c) => {
   *   const message = c.get('message')
   *   return c.text(`The message is "${message}"`)
   * })
   * ```
   */
  get = (key) => {
    return this.#var ? this.#var.get(key) : void 0;
  };
  /**
   * `.var` can access the value of a variable.
   *
   * @see {@link https://hono.dev/docs/api/context#var}
   *
   * @example
   * ```ts
   * const result = c.var.client.oneMethod()
   * ```
   */
  // c.var.propName is a read-only
  get var() {
    if (!this.#var) {
      return {};
    }
    return Object.fromEntries(this.#var);
  }
  #newResponse(data, arg, headers) {
    const responseHeaders = this.#res ? new Headers(this.#res.headers) : this.#preparedHeaders ?? new Headers();
    if (typeof arg === "object" && "headers" in arg) {
      const argHeaders = arg.headers instanceof Headers ? arg.headers : new Headers(arg.headers);
      for (const [key, value] of argHeaders) {
        if (key.toLowerCase() === "set-cookie") {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    }
    if (headers) {
      for (const [k, v] of Object.entries(headers)) {
        if (typeof v === "string") {
          responseHeaders.set(k, v);
        } else {
          responseHeaders.delete(k);
          for (const v2 of v) {
            responseHeaders.append(k, v2);
          }
        }
      }
    }
    const status = typeof arg === "number" ? arg : arg?.status ?? this.#status;
    return createResponseInstance(data, { status, headers: responseHeaders });
  }
  newResponse = (...args) => this.#newResponse(...args);
  /**
   * `.body()` can return the HTTP response.
   * You can set headers with `.header()` and set HTTP status code with `.status`.
   * This can also be set in `.text()`, `.json()` and so on.
   *
   * @see {@link https://hono.dev/docs/api/context#body}
   *
   * @example
   * ```ts
   * app.get('/welcome', (c) => {
   *   // Set headers
   *   c.header('X-Message', 'Hello!')
   *   c.header('Content-Type', 'text/plain')
   *   // Set HTTP status code
   *   c.status(201)
   *
   *   // Return the response body
   *   return c.body('Thank you for coming')
   * })
   * ```
   */
  body = (data, arg, headers) => this.#newResponse(data, arg, headers);
  /**
   * `.text()` can render text as `Content-Type:text/plain`.
   *
   * @see {@link https://hono.dev/docs/api/context#text}
   *
   * @example
   * ```ts
   * app.get('/say', (c) => {
   *   return c.text('Hello!')
   * })
   * ```
   */
  text = (text2, arg, headers) => {
    return !this.#preparedHeaders && !this.#status && !arg && !headers && !this.finalized ? new Response(text2) : this.#newResponse(
      text2,
      arg,
      setDefaultContentType(TEXT_PLAIN, headers)
    );
  };
  /**
   * `.json()` can render JSON as `Content-Type:application/json`.
   *
   * @see {@link https://hono.dev/docs/api/context#json}
   *
   * @example
   * ```ts
   * app.get('/api', (c) => {
   *   return c.json({ message: 'Hello!' })
   * })
   * ```
   */
  json = (object, arg, headers) => {
    return this.#newResponse(
      JSON.stringify(object),
      arg,
      setDefaultContentType("application/json", headers)
    );
  };
  html = (html, arg, headers) => {
    const res = (html2) => this.#newResponse(html2, arg, setDefaultContentType("text/html; charset=UTF-8", headers));
    return typeof html === "object" ? resolveCallback(html, HtmlEscapedCallbackPhase.Stringify, false, {}).then(res) : res(html);
  };
  /**
   * `.redirect()` can Redirect, default status code is 302.
   *
   * @see {@link https://hono.dev/docs/api/context#redirect}
   *
   * @example
   * ```ts
   * app.get('/redirect', (c) => {
   *   return c.redirect('/')
   * })
   * app.get('/redirect-permanently', (c) => {
   *   return c.redirect('/', 301)
   * })
   * ```
   */
  redirect = (location, status) => {
    const locationString = String(location);
    this.header(
      "Location",
      // Multibyes should be encoded
      // eslint-disable-next-line no-control-regex
      !/[^\x00-\xFF]/.test(locationString) ? locationString : encodeURI(locationString)
    );
    return this.newResponse(null, status ?? 302);
  };
  /**
   * `.notFound()` can return the Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/context#notfound}
   *
   * @example
   * ```ts
   * app.get('/notfound', (c) => {
   *   return c.notFound()
   * })
   * ```
   */
  notFound = () => {
    this.#notFoundHandler ??= () => createResponseInstance();
    return this.#notFoundHandler(this);
  };
};

// node_modules/hono/dist/router.js
var METHOD_NAME_ALL = "ALL";
var METHOD_NAME_ALL_LOWERCASE = "all";
var METHODS = ["get", "post", "put", "delete", "options", "patch"];
var MESSAGE_MATCHER_IS_ALREADY_BUILT = "Can not add a route since the matcher is already built.";
var UnsupportedPathError = class extends Error {
};

// node_modules/hono/dist/utils/constants.js
var COMPOSED_HANDLER = "__COMPOSED_HANDLER";

// node_modules/hono/dist/hono-base.js
var notFoundHandler = (c) => {
  return c.text("404 Not Found", 404);
};
var errorHandler = (err, c) => {
  if ("getResponse" in err) {
    const res = err.getResponse();
    return c.newResponse(res.body, res);
  }
  console.error(err);
  return c.text("Internal Server Error", 500);
};
var Hono = class _Hono {
  get;
  post;
  put;
  delete;
  options;
  patch;
  all;
  on;
  use;
  /*
    This class is like an abstract class and does not have a router.
    To use it, inherit the class and implement router in the constructor.
  */
  router;
  getPath;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  _basePath = "/";
  #path = "/";
  routes = [];
  constructor(options = {}) {
    const allMethods = [...METHODS, METHOD_NAME_ALL_LOWERCASE];
    allMethods.forEach((method) => {
      this[method] = (args1, ...args) => {
        if (typeof args1 === "string") {
          this.#path = args1;
        } else {
          this.#addRoute(method, this.#path, args1);
        }
        args.forEach((handler) => {
          this.#addRoute(method, this.#path, handler);
        });
        return this;
      };
    });
    this.on = (method, path2, ...handlers) => {
      for (const p of [path2].flat()) {
        this.#path = p;
        for (const m of [method].flat()) {
          handlers.map((handler) => {
            this.#addRoute(m.toUpperCase(), this.#path, handler);
          });
        }
      }
      return this;
    };
    this.use = (arg1, ...handlers) => {
      if (typeof arg1 === "string") {
        this.#path = arg1;
      } else {
        this.#path = "*";
        handlers.unshift(arg1);
      }
      handlers.forEach((handler) => {
        this.#addRoute(METHOD_NAME_ALL, this.#path, handler);
      });
      return this;
    };
    const { strict, ...optionsWithoutStrict } = options;
    Object.assign(this, optionsWithoutStrict);
    this.getPath = strict ?? true ? options.getPath ?? getPath : getPathNoStrict;
  }
  #clone() {
    const clone = new _Hono({
      router: this.router,
      getPath: this.getPath
    });
    clone.errorHandler = this.errorHandler;
    clone.#notFoundHandler = this.#notFoundHandler;
    clone.routes = this.routes;
    return clone;
  }
  #notFoundHandler = notFoundHandler;
  // Cannot use `#` because it requires visibility at JavaScript runtime.
  errorHandler = errorHandler;
  /**
   * `.route()` allows grouping other Hono instance in routes.
   *
   * @see {@link https://hono.dev/docs/api/routing#grouping}
   *
   * @param {string} path - base Path
   * @param {Hono} app - other Hono instance
   * @returns {Hono} routed Hono instance
   *
   * @example
   * ```ts
   * const app = new Hono()
   * const app2 = new Hono()
   *
   * app2.get("/user", (c) => c.text("user"))
   * app.route("/api", app2) // GET /api/user
   * ```
   */
  route(path2, app2) {
    const subApp = this.basePath(path2);
    app2.routes.map((r) => {
      let handler;
      if (app2.errorHandler === errorHandler) {
        handler = r.handler;
      } else {
        handler = async (c, next) => (await compose([], app2.errorHandler)(c, () => r.handler(c, next))).res;
        handler[COMPOSED_HANDLER] = r.handler;
      }
      subApp.#addRoute(r.method, r.path, handler, r.basePath);
    });
    return this;
  }
  /**
   * `.basePath()` allows base paths to be specified.
   *
   * @see {@link https://hono.dev/docs/api/routing#base-path}
   *
   * @param {string} path - base Path
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * const api = new Hono().basePath('/api')
   * ```
   */
  basePath(path2) {
    const subApp = this.#clone();
    subApp._basePath = mergePath(this._basePath, path2);
    return subApp;
  }
  /**
   * `.onError()` handles an error and returns a customized Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#error-handling}
   *
   * @param {ErrorHandler} handler - request Handler for error
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.onError((err, c) => {
   *   console.error(`${err}`)
   *   return c.text('Custom Error Message', 500)
   * })
   * ```
   */
  onError = (handler) => {
    this.errorHandler = handler;
    return this;
  };
  /**
   * `.notFound()` allows you to customize a Not Found Response.
   *
   * @see {@link https://hono.dev/docs/api/hono#not-found}
   *
   * @param {NotFoundHandler} handler - request handler for not-found
   * @returns {Hono} changed Hono instance
   *
   * @example
   * ```ts
   * app.notFound((c) => {
   *   return c.text('Custom 404 Message', 404)
   * })
   * ```
   */
  notFound = (handler) => {
    this.#notFoundHandler = handler;
    return this;
  };
  /**
   * `.mount()` allows you to mount applications built with other frameworks into your Hono application.
   *
   * @see {@link https://hono.dev/docs/api/hono#mount}
   *
   * @param {string} path - base Path
   * @param {Function} applicationHandler - other Request Handler
   * @param {MountOptions} [options] - options of `.mount()`
   * @returns {Hono} mounted Hono instance
   *
   * @example
   * ```ts
   * import { Router as IttyRouter } from 'itty-router'
   * import { Hono } from 'hono'
   * // Create itty-router application
   * const ittyRouter = IttyRouter()
   * // GET /itty-router/hello
   * ittyRouter.get('/hello', () => new Response('Hello from itty-router'))
   *
   * const app = new Hono()
   * app.mount('/itty-router', ittyRouter.handle)
   * ```
   *
   * @example
   * ```ts
   * const app = new Hono()
   * // Send the request to another application without modification.
   * app.mount('/app', anotherApp, {
   *   replaceRequest: (req) => req,
   * })
   * ```
   */
  mount(path2, applicationHandler, options) {
    let replaceRequest;
    let optionHandler;
    if (options) {
      if (typeof options === "function") {
        optionHandler = options;
      } else {
        optionHandler = options.optionHandler;
        if (options.replaceRequest === false) {
          replaceRequest = (request) => request;
        } else {
          replaceRequest = options.replaceRequest;
        }
      }
    }
    const getOptions = optionHandler ? (c) => {
      const options2 = optionHandler(c);
      return Array.isArray(options2) ? options2 : [options2];
    } : (c) => {
      let executionContext = void 0;
      try {
        executionContext = c.executionCtx;
      } catch {
      }
      return [c.env, executionContext];
    };
    replaceRequest ||= (() => {
      const mergedPath = mergePath(this._basePath, path2);
      const pathPrefixLength = mergedPath === "/" ? 0 : mergedPath.length;
      return (request) => {
        const url = new URL(request.url);
        url.pathname = this.getPath(request).slice(pathPrefixLength) || "/";
        return new Request(url, request);
      };
    })();
    const handler = async (c, next) => {
      const res = await applicationHandler(replaceRequest(c.req.raw), ...getOptions(c));
      if (res) {
        return res;
      }
      await next();
    };
    this.#addRoute(METHOD_NAME_ALL, mergePath(path2, "*"), handler);
    return this;
  }
  #addRoute(method, path2, handler, baseRoutePath) {
    method = method.toUpperCase();
    path2 = mergePath(this._basePath, path2);
    const r = {
      basePath: baseRoutePath !== void 0 ? mergePath(this._basePath, baseRoutePath) : this._basePath,
      path: path2,
      method,
      handler
    };
    this.router.add(method, path2, [handler, r]);
    this.routes.push(r);
  }
  #handleError(err, c) {
    if (err instanceof Error) {
      return this.errorHandler(err, c);
    }
    throw err;
  }
  #dispatch(request, executionCtx, env2, method) {
    if (method === "HEAD") {
      return (async () => new Response(null, await this.#dispatch(request, executionCtx, env2, "GET")))();
    }
    const path2 = this.getPath(request, { env: env2 });
    const matchResult = this.router.match(method, path2);
    const c = new Context(request, {
      path: path2,
      matchResult,
      env: env2,
      executionCtx,
      notFoundHandler: this.#notFoundHandler
    });
    if (matchResult[0].length === 1) {
      let res;
      try {
        res = matchResult[0][0][0][0](c, async () => {
          c.res = await this.#notFoundHandler(c);
        });
      } catch (err) {
        return this.#handleError(err, c);
      }
      return res instanceof Promise ? res.then(
        (resolved) => resolved || (c.finalized ? c.res : this.#notFoundHandler(c))
      ).catch((err) => this.#handleError(err, c)) : res ?? this.#notFoundHandler(c);
    }
    const composed = compose(matchResult[0], this.errorHandler, this.#notFoundHandler);
    return (async () => {
      try {
        const context = await composed(c);
        if (!context.finalized) {
          throw new Error(
            "Context is not finalized. Did you forget to return a Response object or `await next()`?"
          );
        }
        return context.res;
      } catch (err) {
        return this.#handleError(err, c);
      }
    })();
  }
  /**
   * `.fetch()` will be entry point of your app.
   *
   * @see {@link https://hono.dev/docs/api/hono#fetch}
   *
   * @param {Request} request - request Object of request
   * @param {Env} Env - env Object
   * @param {ExecutionContext} - context of execution
   * @returns {Response | Promise<Response>} response of request
   *
   */
  fetch = (request, ...rest) => {
    return this.#dispatch(request, rest[1], rest[0], request.method);
  };
  /**
   * `.request()` is a useful method for testing.
   * You can pass a URL or pathname to send a GET request.
   * app will return a Response object.
   * ```ts
   * test('GET /hello is ok', async () => {
   *   const res = await app.request('/hello')
   *   expect(res.status).toBe(200)
   * })
   * ```
   * @see https://hono.dev/docs/api/hono#request
   */
  request = (input, requestInit, Env, executionCtx) => {
    if (input instanceof Request) {
      return this.fetch(requestInit ? new Request(input, requestInit) : input, Env, executionCtx);
    }
    input = input.toString();
    return this.fetch(
      new Request(
        /^https?:\/\//.test(input) ? input : `http://localhost${mergePath("/", input)}`,
        requestInit
      ),
      Env,
      executionCtx
    );
  };
  /**
   * `.fire()` automatically adds a global fetch event listener.
   * This can be useful for environments that adhere to the Service Worker API, such as non-ES module Cloudflare Workers.
   * @deprecated
   * Use `fire` from `hono/service-worker` instead.
   * ```ts
   * import { Hono } from 'hono'
   * import { fire } from 'hono/service-worker'
   *
   * const app = new Hono()
   * // ...
   * fire(app)
   * ```
   * @see https://hono.dev/docs/api/hono#fire
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
   * @see https://developers.cloudflare.com/workers/reference/migrate-to-module-workers/
   */
  fire = () => {
    addEventListener("fetch", (event) => {
      event.respondWith(this.#dispatch(event.request, event, void 0, event.request.method));
    });
  };
};

// node_modules/hono/dist/router/reg-exp-router/matcher.js
var emptyParam = [];
function match(method, path2) {
  const matchers = this.buildAllMatchers();
  const match2 = ((method2, path22) => {
    const matcher = matchers[method2] || matchers[METHOD_NAME_ALL];
    const staticMatch = matcher[2][path22];
    if (staticMatch) {
      return staticMatch;
    }
    const match3 = path22.match(matcher[0]);
    if (!match3) {
      return [[], emptyParam];
    }
    const index = match3.indexOf("", 1);
    return [matcher[1][index], match3];
  });
  this.match = match2;
  return match2(method, path2);
}

// node_modules/hono/dist/router/reg-exp-router/node.js
var LABEL_REG_EXP_STR = "[^/]+";
var ONLY_WILDCARD_REG_EXP_STR = ".*";
var TAIL_WILDCARD_REG_EXP_STR = "(?:|/.*)";
var PATH_ERROR = /* @__PURE__ */ Symbol();
var regExpMetaChars = new Set(".\\+*[^]$()");
function compareKey(a, b) {
  if (a.length === 1) {
    return b.length === 1 ? a < b ? -1 : 1 : -1;
  }
  if (b.length === 1) {
    return 1;
  }
  if (a === ONLY_WILDCARD_REG_EXP_STR || a === TAIL_WILDCARD_REG_EXP_STR) {
    return 1;
  } else if (b === ONLY_WILDCARD_REG_EXP_STR || b === TAIL_WILDCARD_REG_EXP_STR) {
    return -1;
  }
  if (a === LABEL_REG_EXP_STR) {
    return 1;
  } else if (b === LABEL_REG_EXP_STR) {
    return -1;
  }
  return a.length === b.length ? a < b ? -1 : 1 : b.length - a.length;
}
var Node = class _Node {
  #index;
  #varIndex;
  #children = /* @__PURE__ */ Object.create(null);
  insert(tokens, index, paramMap, context, pathErrorCheckOnly) {
    if (tokens.length === 0) {
      if (this.#index !== void 0) {
        throw PATH_ERROR;
      }
      if (pathErrorCheckOnly) {
        return;
      }
      this.#index = index;
      return;
    }
    const [token, ...restTokens] = tokens;
    const pattern = token === "*" ? restTokens.length === 0 ? ["", "", ONLY_WILDCARD_REG_EXP_STR] : ["", "", LABEL_REG_EXP_STR] : token === "/*" ? ["", "", TAIL_WILDCARD_REG_EXP_STR] : token.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);
    let node;
    if (pattern) {
      const name = pattern[1];
      let regexpStr = pattern[2] || LABEL_REG_EXP_STR;
      if (name && pattern[2]) {
        if (regexpStr === ".*") {
          throw PATH_ERROR;
        }
        regexpStr = regexpStr.replace(/^\((?!\?:)(?=[^)]+\)$)/, "(?:");
        if (/\((?!\?:)/.test(regexpStr)) {
          throw PATH_ERROR;
        }
      }
      node = this.#children[regexpStr];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[regexpStr] = new _Node();
        if (name !== "") {
          node.#varIndex = context.varIndex++;
        }
      }
      if (!pathErrorCheckOnly && name !== "") {
        paramMap.push([name, node.#varIndex]);
      }
    } else {
      node = this.#children[token];
      if (!node) {
        if (Object.keys(this.#children).some(
          (k) => k.length > 1 && k !== ONLY_WILDCARD_REG_EXP_STR && k !== TAIL_WILDCARD_REG_EXP_STR
        )) {
          throw PATH_ERROR;
        }
        if (pathErrorCheckOnly) {
          return;
        }
        node = this.#children[token] = new _Node();
      }
    }
    node.insert(restTokens, index, paramMap, context, pathErrorCheckOnly);
  }
  buildRegExpStr() {
    const childKeys = Object.keys(this.#children).sort(compareKey);
    const strList = childKeys.map((k) => {
      const c = this.#children[k];
      return (typeof c.#varIndex === "number" ? `(${k})@${c.#varIndex}` : regExpMetaChars.has(k) ? `\\${k}` : k) + c.buildRegExpStr();
    });
    if (typeof this.#index === "number") {
      strList.unshift(`#${this.#index}`);
    }
    if (strList.length === 0) {
      return "";
    }
    if (strList.length === 1) {
      return strList[0];
    }
    return "(?:" + strList.join("|") + ")";
  }
};

// node_modules/hono/dist/router/reg-exp-router/trie.js
var Trie = class {
  #context = { varIndex: 0 };
  #root = new Node();
  insert(path2, index, pathErrorCheckOnly) {
    const paramAssoc = [];
    const groups = [];
    for (let i = 0; ; ) {
      let replaced = false;
      path2 = path2.replace(/\{[^}]+\}/g, (m) => {
        const mark = `@\\${i}`;
        groups[i] = [mark, m];
        i++;
        replaced = true;
        return mark;
      });
      if (!replaced) {
        break;
      }
    }
    const tokens = path2.match(/(?::[^\/]+)|(?:\/\*$)|./g) || [];
    for (let i = groups.length - 1; i >= 0; i--) {
      const [mark] = groups[i];
      for (let j = tokens.length - 1; j >= 0; j--) {
        if (tokens[j].indexOf(mark) !== -1) {
          tokens[j] = tokens[j].replace(mark, groups[i][1]);
          break;
        }
      }
    }
    this.#root.insert(tokens, index, paramAssoc, this.#context, pathErrorCheckOnly);
    return paramAssoc;
  }
  buildRegExp() {
    let regexp = this.#root.buildRegExpStr();
    if (regexp === "") {
      return [/^$/, [], []];
    }
    let captureIndex = 0;
    const indexReplacementMap = [];
    const paramReplacementMap = [];
    regexp = regexp.replace(/#(\d+)|@(\d+)|\.\*\$/g, (_, handlerIndex, paramIndex) => {
      if (handlerIndex !== void 0) {
        indexReplacementMap[++captureIndex] = Number(handlerIndex);
        return "$()";
      }
      if (paramIndex !== void 0) {
        paramReplacementMap[Number(paramIndex)] = ++captureIndex;
        return "";
      }
      return "";
    });
    return [new RegExp(`^${regexp}`), indexReplacementMap, paramReplacementMap];
  }
};

// node_modules/hono/dist/router/reg-exp-router/router.js
var nullMatcher = [/^$/, [], /* @__PURE__ */ Object.create(null)];
var wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
function buildWildcardRegExp(path2) {
  return wildcardRegExpCache[path2] ??= new RegExp(
    path2 === "*" ? "" : `^${path2.replace(
      /\/\*$|([.\\+*[^\]$()])/g,
      (_, metaChar) => metaChar ? `\\${metaChar}` : "(?:|/.*)"
    )}$`
  );
}
function clearWildcardRegExpCache() {
  wildcardRegExpCache = /* @__PURE__ */ Object.create(null);
}
function buildMatcherFromPreprocessedRoutes(routes) {
  const trie = new Trie();
  const handlerData = [];
  if (routes.length === 0) {
    return nullMatcher;
  }
  const routesWithStaticPathFlag = routes.map(
    (route) => [!/\*|\/:/.test(route[0]), ...route]
  ).sort(
    ([isStaticA, pathA], [isStaticB, pathB]) => isStaticA ? 1 : isStaticB ? -1 : pathA.length - pathB.length
  );
  const staticMap = /* @__PURE__ */ Object.create(null);
  for (let i = 0, j = -1, len = routesWithStaticPathFlag.length; i < len; i++) {
    const [pathErrorCheckOnly, path2, handlers] = routesWithStaticPathFlag[i];
    if (pathErrorCheckOnly) {
      staticMap[path2] = [handlers.map(([h]) => [h, /* @__PURE__ */ Object.create(null)]), emptyParam];
    } else {
      j++;
    }
    let paramAssoc;
    try {
      paramAssoc = trie.insert(path2, j, pathErrorCheckOnly);
    } catch (e) {
      throw e === PATH_ERROR ? new UnsupportedPathError(path2) : e;
    }
    if (pathErrorCheckOnly) {
      continue;
    }
    handlerData[j] = handlers.map(([h, paramCount]) => {
      const paramIndexMap = /* @__PURE__ */ Object.create(null);
      paramCount -= 1;
      for (; paramCount >= 0; paramCount--) {
        const [key, value] = paramAssoc[paramCount];
        paramIndexMap[key] = value;
      }
      return [h, paramIndexMap];
    });
  }
  const [regexp, indexReplacementMap, paramReplacementMap] = trie.buildRegExp();
  for (let i = 0, len = handlerData.length; i < len; i++) {
    for (let j = 0, len2 = handlerData[i].length; j < len2; j++) {
      const map = handlerData[i][j]?.[1];
      if (!map) {
        continue;
      }
      const keys = Object.keys(map);
      for (let k = 0, len3 = keys.length; k < len3; k++) {
        map[keys[k]] = paramReplacementMap[map[keys[k]]];
      }
    }
  }
  const handlerMap = [];
  for (const i in indexReplacementMap) {
    handlerMap[i] = handlerData[indexReplacementMap[i]];
  }
  return [regexp, handlerMap, staticMap];
}
function findMiddleware(middleware, path2) {
  if (!middleware) {
    return void 0;
  }
  for (const k of Object.keys(middleware).sort((a, b) => b.length - a.length)) {
    if (buildWildcardRegExp(k).test(path2)) {
      return [...middleware[k]];
    }
  }
  return void 0;
}
var RegExpRouter = class {
  name = "RegExpRouter";
  #middleware;
  #routes;
  constructor() {
    this.#middleware = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
    this.#routes = { [METHOD_NAME_ALL]: /* @__PURE__ */ Object.create(null) };
  }
  add(method, path2, handler) {
    const middleware = this.#middleware;
    const routes = this.#routes;
    if (!middleware || !routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    if (!middleware[method]) {
      ;
      [middleware, routes].forEach((handlerMap) => {
        handlerMap[method] = /* @__PURE__ */ Object.create(null);
        Object.keys(handlerMap[METHOD_NAME_ALL]).forEach((p) => {
          handlerMap[method][p] = [...handlerMap[METHOD_NAME_ALL][p]];
        });
      });
    }
    if (path2 === "/*") {
      path2 = "*";
    }
    const paramCount = (path2.match(/\/:/g) || []).length;
    if (/\*$/.test(path2)) {
      const re = buildWildcardRegExp(path2);
      if (method === METHOD_NAME_ALL) {
        Object.keys(middleware).forEach((m) => {
          middleware[m][path2] ||= findMiddleware(middleware[m], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
        });
      } else {
        middleware[method][path2] ||= findMiddleware(middleware[method], path2) || findMiddleware(middleware[METHOD_NAME_ALL], path2) || [];
      }
      Object.keys(middleware).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(middleware[m]).forEach((p) => {
            re.test(p) && middleware[m][p].push([handler, paramCount]);
          });
        }
      });
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          Object.keys(routes[m]).forEach(
            (p) => re.test(p) && routes[m][p].push([handler, paramCount])
          );
        }
      });
      return;
    }
    const paths = checkOptionalParameter(path2) || [path2];
    for (let i = 0, len = paths.length; i < len; i++) {
      const path22 = paths[i];
      Object.keys(routes).forEach((m) => {
        if (method === METHOD_NAME_ALL || method === m) {
          routes[m][path22] ||= [
            ...findMiddleware(middleware[m], path22) || findMiddleware(middleware[METHOD_NAME_ALL], path22) || []
          ];
          routes[m][path22].push([handler, paramCount - len + i + 1]);
        }
      });
    }
  }
  match = match;
  buildAllMatchers() {
    const matchers = /* @__PURE__ */ Object.create(null);
    Object.keys(this.#routes).concat(Object.keys(this.#middleware)).forEach((method) => {
      matchers[method] ||= this.#buildMatcher(method);
    });
    this.#middleware = this.#routes = void 0;
    clearWildcardRegExpCache();
    return matchers;
  }
  #buildMatcher(method) {
    const routes = [];
    let hasOwnRoute = method === METHOD_NAME_ALL;
    [this.#middleware, this.#routes].forEach((r) => {
      const ownRoute = r[method] ? Object.keys(r[method]).map((path2) => [path2, r[method][path2]]) : [];
      if (ownRoute.length !== 0) {
        hasOwnRoute ||= true;
        routes.push(...ownRoute);
      } else if (method !== METHOD_NAME_ALL) {
        routes.push(
          ...Object.keys(r[METHOD_NAME_ALL]).map((path2) => [path2, r[METHOD_NAME_ALL][path2]])
        );
      }
    });
    if (!hasOwnRoute) {
      return null;
    } else {
      return buildMatcherFromPreprocessedRoutes(routes);
    }
  }
};

// node_modules/hono/dist/router/smart-router/router.js
var SmartRouter = class {
  name = "SmartRouter";
  #routers = [];
  #routes = [];
  constructor(init) {
    this.#routers = init.routers;
  }
  add(method, path2, handler) {
    if (!this.#routes) {
      throw new Error(MESSAGE_MATCHER_IS_ALREADY_BUILT);
    }
    this.#routes.push([method, path2, handler]);
  }
  match(method, path2) {
    if (!this.#routes) {
      throw new Error("Fatal error");
    }
    const routers = this.#routers;
    const routes = this.#routes;
    const len = routers.length;
    let i = 0;
    let res;
    for (; i < len; i++) {
      const router = routers[i];
      try {
        for (let i2 = 0, len2 = routes.length; i2 < len2; i2++) {
          router.add(...routes[i2]);
        }
        res = router.match(method, path2);
      } catch (e) {
        if (e instanceof UnsupportedPathError) {
          continue;
        }
        throw e;
      }
      this.match = router.match.bind(router);
      this.#routers = [router];
      this.#routes = void 0;
      break;
    }
    if (i === len) {
      throw new Error("Fatal error");
    }
    this.name = `SmartRouter + ${this.activeRouter.name}`;
    return res;
  }
  get activeRouter() {
    if (this.#routes || this.#routers.length !== 1) {
      throw new Error("No active router has been determined yet.");
    }
    return this.#routers[0];
  }
};

// node_modules/hono/dist/router/trie-router/node.js
var emptyParams = /* @__PURE__ */ Object.create(null);
var hasChildren = (children) => {
  for (const _ in children) {
    return true;
  }
  return false;
};
var Node2 = class _Node2 {
  #methods;
  #children;
  #patterns;
  #order = 0;
  #params = emptyParams;
  constructor(method, handler, children) {
    this.#children = children || /* @__PURE__ */ Object.create(null);
    this.#methods = [];
    if (method && handler) {
      const m = /* @__PURE__ */ Object.create(null);
      m[method] = { handler, possibleKeys: [], score: 0 };
      this.#methods = [m];
    }
    this.#patterns = [];
  }
  insert(method, path2, handler) {
    this.#order = ++this.#order;
    let curNode = this;
    const parts = splitRoutingPath(path2);
    const possibleKeys = [];
    for (let i = 0, len = parts.length; i < len; i++) {
      const p = parts[i];
      const nextP = parts[i + 1];
      const pattern = getPattern(p, nextP);
      const key = Array.isArray(pattern) ? pattern[0] : p;
      if (key in curNode.#children) {
        curNode = curNode.#children[key];
        if (pattern) {
          possibleKeys.push(pattern[1]);
        }
        continue;
      }
      curNode.#children[key] = new _Node2();
      if (pattern) {
        curNode.#patterns.push(pattern);
        possibleKeys.push(pattern[1]);
      }
      curNode = curNode.#children[key];
    }
    curNode.#methods.push({
      [method]: {
        handler,
        possibleKeys: possibleKeys.filter((v, i, a) => a.indexOf(v) === i),
        score: this.#order
      }
    });
    return curNode;
  }
  #pushHandlerSets(handlerSets, node, method, nodeParams, params) {
    for (let i = 0, len = node.#methods.length; i < len; i++) {
      const m = node.#methods[i];
      const handlerSet = m[method] || m[METHOD_NAME_ALL];
      const processedSet = {};
      if (handlerSet !== void 0) {
        handlerSet.params = /* @__PURE__ */ Object.create(null);
        handlerSets.push(handlerSet);
        if (nodeParams !== emptyParams || params && params !== emptyParams) {
          for (let i2 = 0, len2 = handlerSet.possibleKeys.length; i2 < len2; i2++) {
            const key = handlerSet.possibleKeys[i2];
            const processed = processedSet[handlerSet.score];
            handlerSet.params[key] = params?.[key] && !processed ? params[key] : nodeParams[key] ?? params?.[key];
            processedSet[handlerSet.score] = true;
          }
        }
      }
    }
  }
  search(method, path2) {
    const handlerSets = [];
    this.#params = emptyParams;
    const curNode = this;
    let curNodes = [curNode];
    const parts = splitPath(path2);
    const curNodesQueue = [];
    const len = parts.length;
    let partOffsets = null;
    for (let i = 0; i < len; i++) {
      const part = parts[i];
      const isLast = i === len - 1;
      const tempNodes = [];
      for (let j = 0, len2 = curNodes.length; j < len2; j++) {
        const node = curNodes[j];
        const nextNode = node.#children[part];
        if (nextNode) {
          nextNode.#params = node.#params;
          if (isLast) {
            if (nextNode.#children["*"]) {
              this.#pushHandlerSets(handlerSets, nextNode.#children["*"], method, node.#params);
            }
            this.#pushHandlerSets(handlerSets, nextNode, method, node.#params);
          } else {
            tempNodes.push(nextNode);
          }
        }
        for (let k = 0, len3 = node.#patterns.length; k < len3; k++) {
          const pattern = node.#patterns[k];
          const params = node.#params === emptyParams ? {} : { ...node.#params };
          if (pattern === "*") {
            const astNode = node.#children["*"];
            if (astNode) {
              this.#pushHandlerSets(handlerSets, astNode, method, node.#params);
              astNode.#params = params;
              tempNodes.push(astNode);
            }
            continue;
          }
          const [key, name, matcher] = pattern;
          if (!part && !(matcher instanceof RegExp)) {
            continue;
          }
          const child = node.#children[key];
          if (matcher instanceof RegExp) {
            if (partOffsets === null) {
              partOffsets = new Array(len);
              let offset = path2[0] === "/" ? 1 : 0;
              for (let p = 0; p < len; p++) {
                partOffsets[p] = offset;
                offset += parts[p].length + 1;
              }
            }
            const restPathString = path2.substring(partOffsets[i]);
            const m = matcher.exec(restPathString);
            if (m) {
              params[name] = m[0];
              this.#pushHandlerSets(handlerSets, child, method, node.#params, params);
              if (hasChildren(child.#children)) {
                child.#params = params;
                const componentCount = m[0].match(/\//)?.length ?? 0;
                const targetCurNodes = curNodesQueue[componentCount] ||= [];
                targetCurNodes.push(child);
              }
              continue;
            }
          }
          if (matcher === true || matcher.test(part)) {
            params[name] = part;
            if (isLast) {
              this.#pushHandlerSets(handlerSets, child, method, params, node.#params);
              if (child.#children["*"]) {
                this.#pushHandlerSets(
                  handlerSets,
                  child.#children["*"],
                  method,
                  params,
                  node.#params
                );
              }
            } else {
              child.#params = params;
              tempNodes.push(child);
            }
          }
        }
      }
      const shifted = curNodesQueue.shift();
      curNodes = shifted ? tempNodes.concat(shifted) : tempNodes;
    }
    if (handlerSets.length > 1) {
      handlerSets.sort((a, b) => {
        return a.score - b.score;
      });
    }
    return [handlerSets.map(({ handler, params }) => [handler, params])];
  }
};

// node_modules/hono/dist/router/trie-router/router.js
var TrieRouter = class {
  name = "TrieRouter";
  #node;
  constructor() {
    this.#node = new Node2();
  }
  add(method, path2, handler) {
    const results = checkOptionalParameter(path2);
    if (results) {
      for (let i = 0, len = results.length; i < len; i++) {
        this.#node.insert(method, results[i], handler);
      }
      return;
    }
    this.#node.insert(method, path2, handler);
  }
  match(method, path2) {
    return this.#node.search(method, path2);
  }
};

// node_modules/hono/dist/hono.js
var Hono2 = class extends Hono {
  /**
   * Creates an instance of the Hono class.
   *
   * @param options - Optional configuration options for the Hono instance.
   */
  constructor(options = {}) {
    super(options);
    this.router = options.router ?? new SmartRouter({
      routers: [new RegExpRouter(), new TrieRouter()]
    });
  }
};

// api/boot.ts
import { bodyLimit } from "hono/body-limit";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// api/auth-router.ts
var cookie = __toESM(require_dist(), 1);

// contracts/constants.ts
var Session = {
  cookieName: "kimi_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1e3
};
var ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions"
};
var Paths = {
  login: "/login",
  oauthCallback: "/api/oauth/callback"
};

// api/lib/cookies.ts
function isLocalhost(headers) {
  const host = headers.get("host") || "";
  return host.startsWith("localhost:") || host.startsWith("127.0.0.1:");
}
function getSessionCookieOptions(headers) {
  const localhost = isLocalhost(headers);
  return {
    httpOnly: true,
    path: "/",
    sameSite: localhost ? "Lax" : "None",
    secure: !localhost
  };
}

// api/middleware.ts
import { initTRPC, TRPCError } from "@trpc/server";

// node_modules/superjson/dist/double-indexed-kv.js
var DoubleIndexedKV = class {
  constructor() {
    this.keyToValue = /* @__PURE__ */ new Map();
    this.valueToKey = /* @__PURE__ */ new Map();
  }
  set(key, value) {
    this.keyToValue.set(key, value);
    this.valueToKey.set(value, key);
  }
  getByKey(key) {
    return this.keyToValue.get(key);
  }
  getByValue(value) {
    return this.valueToKey.get(value);
  }
  clear() {
    this.keyToValue.clear();
    this.valueToKey.clear();
  }
};

// node_modules/superjson/dist/registry.js
var Registry = class {
  constructor(generateIdentifier) {
    this.generateIdentifier = generateIdentifier;
    this.kv = new DoubleIndexedKV();
  }
  register(value, identifier) {
    if (this.kv.getByValue(value)) {
      return;
    }
    if (!identifier) {
      identifier = this.generateIdentifier(value);
    }
    this.kv.set(identifier, value);
  }
  clear() {
    this.kv.clear();
  }
  getIdentifier(value) {
    return this.kv.getByValue(value);
  }
  getValue(identifier) {
    return this.kv.getByKey(identifier);
  }
};

// node_modules/superjson/dist/class-registry.js
var ClassRegistry = class extends Registry {
  constructor() {
    super((c) => c.name);
    this.classToAllowedProps = /* @__PURE__ */ new Map();
  }
  register(value, options) {
    if (typeof options === "object") {
      if (options.allowProps) {
        this.classToAllowedProps.set(value, options.allowProps);
      }
      super.register(value, options.identifier);
    } else {
      super.register(value, options);
    }
  }
  getAllowedProps(value) {
    return this.classToAllowedProps.get(value);
  }
};

// node_modules/superjson/dist/util.js
function valuesOfObj(record) {
  if ("values" in Object) {
    return Object.values(record);
  }
  const values = [];
  for (const key in record) {
    if (record.hasOwnProperty(key)) {
      values.push(record[key]);
    }
  }
  return values;
}
function find(record, predicate) {
  const values = valuesOfObj(record);
  if ("find" in values) {
    return values.find(predicate);
  }
  const valuesNotNever = values;
  for (let i = 0; i < valuesNotNever.length; i++) {
    const value = valuesNotNever[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}
function forEach(record, run) {
  Object.entries(record).forEach(([key, value]) => run(value, key));
}
function includes(arr, value) {
  return arr.indexOf(value) !== -1;
}
function findArr(record, predicate) {
  for (let i = 0; i < record.length; i++) {
    const value = record[i];
    if (predicate(value)) {
      return value;
    }
  }
  return void 0;
}

// node_modules/superjson/dist/custom-transformer-registry.js
var CustomTransformerRegistry = class {
  constructor() {
    this.transfomers = {};
  }
  register(transformer) {
    this.transfomers[transformer.name] = transformer;
  }
  findApplicable(v) {
    return find(this.transfomers, (transformer) => transformer.isApplicable(v));
  }
  findByName(name) {
    return this.transfomers[name];
  }
};

// node_modules/superjson/dist/is.js
var getType = (payload) => Object.prototype.toString.call(payload).slice(8, -1);
var isUndefined = (payload) => typeof payload === "undefined";
var isNull = (payload) => payload === null;
var isPlainObject = (payload) => {
  if (typeof payload !== "object" || payload === null)
    return false;
  if (payload === Object.prototype)
    return false;
  if (Object.getPrototypeOf(payload) === null)
    return true;
  return Object.getPrototypeOf(payload) === Object.prototype;
};
var isEmptyObject = (payload) => isPlainObject(payload) && Object.keys(payload).length === 0;
var isArray = (payload) => Array.isArray(payload);
var isString = (payload) => typeof payload === "string";
var isNumber = (payload) => typeof payload === "number" && !isNaN(payload);
var isBoolean = (payload) => typeof payload === "boolean";
var isRegExp = (payload) => payload instanceof RegExp;
var isMap = (payload) => payload instanceof Map;
var isSet = (payload) => payload instanceof Set;
var isSymbol = (payload) => getType(payload) === "Symbol";
var isDate = (payload) => payload instanceof Date && !isNaN(payload.valueOf());
var isError = (payload) => payload instanceof Error;
var isNaNValue = (payload) => typeof payload === "number" && isNaN(payload);
var isPrimitive = (payload) => isBoolean(payload) || isNull(payload) || isUndefined(payload) || isNumber(payload) || isString(payload) || isSymbol(payload);
var isBigint = (payload) => typeof payload === "bigint";
var isInfinite = (payload) => payload === Infinity || payload === -Infinity;
var isTypedArray = (payload) => ArrayBuffer.isView(payload) && !(payload instanceof DataView);
var isURL = (payload) => payload instanceof URL;

// node_modules/superjson/dist/pathstringifier.js
var escapeKey = (key) => key.replace(/\\/g, "\\\\").replace(/\./g, "\\.");
var stringifyPath = (path2) => path2.map(String).map(escapeKey).join(".");
var parsePath = (string, legacyPaths) => {
  const result = [];
  let segment = "";
  for (let i = 0; i < string.length; i++) {
    let char = string.charAt(i);
    if (!legacyPaths && char === "\\") {
      const escaped = string.charAt(i + 1);
      if (escaped === "\\") {
        segment += "\\";
        i++;
        continue;
      } else if (escaped !== ".") {
        throw Error("invalid path");
      }
    }
    const isEscapedDot = char === "\\" && string.charAt(i + 1) === ".";
    if (isEscapedDot) {
      segment += ".";
      i++;
      continue;
    }
    const isEndOfSegment = char === ".";
    if (isEndOfSegment) {
      result.push(segment);
      segment = "";
      continue;
    }
    segment += char;
  }
  const lastSegment = segment;
  result.push(lastSegment);
  return result;
};

// node_modules/superjson/dist/transformer.js
function simpleTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
var simpleRules = [
  simpleTransformation(isUndefined, "undefined", () => null, () => void 0),
  simpleTransformation(isBigint, "bigint", (v) => v.toString(), (v) => {
    if (typeof BigInt !== "undefined") {
      return BigInt(v);
    }
    console.error("Please add a BigInt polyfill.");
    return v;
  }),
  simpleTransformation(isDate, "Date", (v) => v.toISOString(), (v) => new Date(v)),
  simpleTransformation(isError, "Error", (v, superJson) => {
    const baseError = {
      name: v.name,
      message: v.message
    };
    if ("cause" in v) {
      baseError.cause = v.cause;
    }
    superJson.allowedErrorProps.forEach((prop) => {
      baseError[prop] = v[prop];
    });
    return baseError;
  }, (v, superJson) => {
    const e = new Error(v.message, { cause: v.cause });
    e.name = v.name;
    e.stack = v.stack;
    superJson.allowedErrorProps.forEach((prop) => {
      e[prop] = v[prop];
    });
    return e;
  }),
  simpleTransformation(isRegExp, "regexp", (v) => "" + v, (regex) => {
    const body = regex.slice(1, regex.lastIndexOf("/"));
    const flags = regex.slice(regex.lastIndexOf("/") + 1);
    return new RegExp(body, flags);
  }),
  simpleTransformation(
    isSet,
    "set",
    // (sets only exist in es6+)
    // eslint-disable-next-line es5/no-es6-methods
    (v) => [...v.values()],
    (v) => new Set(v)
  ),
  simpleTransformation(isMap, "map", (v) => [...v.entries()], (v) => new Map(v)),
  simpleTransformation((v) => isNaNValue(v) || isInfinite(v), "number", (v) => {
    if (isNaNValue(v)) {
      return "NaN";
    }
    if (v > 0) {
      return "Infinity";
    } else {
      return "-Infinity";
    }
  }, Number),
  simpleTransformation((v) => v === 0 && 1 / v === -Infinity, "number", () => {
    return "-0";
  }, Number),
  simpleTransformation(isURL, "URL", (v) => v.toString(), (v) => new URL(v))
];
function compositeTransformation(isApplicable, annotation, transform, untransform) {
  return {
    isApplicable,
    annotation,
    transform,
    untransform
  };
}
var symbolRule = compositeTransformation((s, superJson) => {
  if (isSymbol(s)) {
    const isRegistered = !!superJson.symbolRegistry.getIdentifier(s);
    return isRegistered;
  }
  return false;
}, (s, superJson) => {
  const identifier = superJson.symbolRegistry.getIdentifier(s);
  return ["symbol", identifier];
}, (v) => v.description, (_, a, superJson) => {
  const value = superJson.symbolRegistry.getValue(a[1]);
  if (!value) {
    throw new Error("Trying to deserialize unknown symbol");
  }
  return value;
});
var constructorToName = [
  Int8Array,
  Uint8Array,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  Uint8ClampedArray
].reduce((obj, ctor) => {
  obj[ctor.name] = ctor;
  return obj;
}, {});
var typedArrayRule = compositeTransformation(isTypedArray, (v) => ["typed-array", v.constructor.name], (v) => [...v], (v, a) => {
  const ctor = constructorToName[a[1]];
  if (!ctor) {
    throw new Error("Trying to deserialize unknown typed array");
  }
  return new ctor(v);
});
function isInstanceOfRegisteredClass(potentialClass, superJson) {
  if (potentialClass?.constructor) {
    const isRegistered = !!superJson.classRegistry.getIdentifier(potentialClass.constructor);
    return isRegistered;
  }
  return false;
}
var classRule = compositeTransformation(isInstanceOfRegisteredClass, (clazz, superJson) => {
  const identifier = superJson.classRegistry.getIdentifier(clazz.constructor);
  return ["class", identifier];
}, (clazz, superJson) => {
  const allowedProps = superJson.classRegistry.getAllowedProps(clazz.constructor);
  if (!allowedProps) {
    return { ...clazz };
  }
  const result = {};
  allowedProps.forEach((prop) => {
    result[prop] = clazz[prop];
  });
  return result;
}, (v, a, superJson) => {
  const clazz = superJson.classRegistry.getValue(a[1]);
  if (!clazz) {
    throw new Error(`Trying to deserialize unknown class '${a[1]}' - check https://github.com/blitz-js/superjson/issues/116#issuecomment-773996564`);
  }
  return Object.assign(Object.create(clazz.prototype), v);
});
var customRule = compositeTransformation((value, superJson) => {
  return !!superJson.customTransformerRegistry.findApplicable(value);
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return ["custom", transformer.name];
}, (value, superJson) => {
  const transformer = superJson.customTransformerRegistry.findApplicable(value);
  return transformer.serialize(value);
}, (v, a, superJson) => {
  const transformer = superJson.customTransformerRegistry.findByName(a[1]);
  if (!transformer) {
    throw new Error("Trying to deserialize unknown custom value");
  }
  return transformer.deserialize(v);
});
var compositeRules = [classRule, symbolRule, customRule, typedArrayRule];
var transformValue = (value, superJson) => {
  const applicableCompositeRule = findArr(compositeRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableCompositeRule) {
    return {
      value: applicableCompositeRule.transform(value, superJson),
      type: applicableCompositeRule.annotation(value, superJson)
    };
  }
  const applicableSimpleRule = findArr(simpleRules, (rule) => rule.isApplicable(value, superJson));
  if (applicableSimpleRule) {
    return {
      value: applicableSimpleRule.transform(value, superJson),
      type: applicableSimpleRule.annotation
    };
  }
  return void 0;
};
var simpleRulesByAnnotation = {};
simpleRules.forEach((rule) => {
  simpleRulesByAnnotation[rule.annotation] = rule;
});
var untransformValue = (json, type, superJson) => {
  if (isArray(type)) {
    switch (type[0]) {
      case "symbol":
        return symbolRule.untransform(json, type, superJson);
      case "class":
        return classRule.untransform(json, type, superJson);
      case "custom":
        return customRule.untransform(json, type, superJson);
      case "typed-array":
        return typedArrayRule.untransform(json, type, superJson);
      default:
        throw new Error("Unknown transformation: " + type);
    }
  } else {
    const transformation = simpleRulesByAnnotation[type];
    if (!transformation) {
      throw new Error("Unknown transformation: " + type);
    }
    return transformation.untransform(json, superJson);
  }
};

// node_modules/superjson/dist/accessDeep.js
var getNthKey = (value, n) => {
  if (n > value.size)
    throw new Error("index out of bounds");
  const keys = value.keys();
  while (n > 0) {
    keys.next();
    n--;
  }
  return keys.next().value;
};
function validatePath(path2) {
  if (includes(path2, "__proto__")) {
    throw new Error("__proto__ is not allowed as a property");
  }
  if (includes(path2, "prototype")) {
    throw new Error("prototype is not allowed as a property");
  }
  if (includes(path2, "constructor")) {
    throw new Error("constructor is not allowed as a property");
  }
}
var getDeep = (object, path2) => {
  validatePath(path2);
  for (let i = 0; i < path2.length; i++) {
    const key = path2[i];
    if (isSet(object)) {
      object = getNthKey(object, +key);
    } else if (isMap(object)) {
      const row = +key;
      const type = +path2[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(object, row);
      switch (type) {
        case "key":
          object = keyOfRow;
          break;
        case "value":
          object = object.get(keyOfRow);
          break;
      }
    } else {
      object = object[key];
    }
  }
  return object;
};
var setDeep = (object, path2, mapper) => {
  validatePath(path2);
  if (path2.length === 0) {
    return mapper(object);
  }
  let parent = object;
  for (let i = 0; i < path2.length - 1; i++) {
    const key = path2[i];
    if (isArray(parent)) {
      const index = +key;
      parent = parent[index];
    } else if (isPlainObject(parent)) {
      parent = parent[key];
    } else if (isSet(parent)) {
      const row = +key;
      parent = getNthKey(parent, row);
    } else if (isMap(parent)) {
      const isEnd = i === path2.length - 2;
      if (isEnd) {
        break;
      }
      const row = +key;
      const type = +path2[++i] === 0 ? "key" : "value";
      const keyOfRow = getNthKey(parent, row);
      switch (type) {
        case "key":
          parent = keyOfRow;
          break;
        case "value":
          parent = parent.get(keyOfRow);
          break;
      }
    }
  }
  const lastKey = path2[path2.length - 1];
  if (isArray(parent)) {
    parent[+lastKey] = mapper(parent[+lastKey]);
  } else if (isPlainObject(parent)) {
    parent[lastKey] = mapper(parent[lastKey]);
  }
  if (isSet(parent)) {
    const oldValue = getNthKey(parent, +lastKey);
    const newValue = mapper(oldValue);
    if (oldValue !== newValue) {
      parent.delete(oldValue);
      parent.add(newValue);
    }
  }
  if (isMap(parent)) {
    const row = +path2[path2.length - 2];
    const keyToRow = getNthKey(parent, row);
    const type = +lastKey === 0 ? "key" : "value";
    switch (type) {
      case "key": {
        const newKey = mapper(keyToRow);
        parent.set(newKey, parent.get(keyToRow));
        if (newKey !== keyToRow) {
          parent.delete(keyToRow);
        }
        break;
      }
      case "value": {
        parent.set(keyToRow, mapper(parent.get(keyToRow)));
        break;
      }
    }
  }
  return object;
};

// node_modules/superjson/dist/plainer.js
var enableLegacyPaths = (version) => version < 1;
function traverse(tree, walker2, version, origin = []) {
  if (!tree) {
    return;
  }
  const legacyPaths = enableLegacyPaths(version);
  if (!isArray(tree)) {
    forEach(tree, (subtree, key) => traverse(subtree, walker2, version, [
      ...origin,
      ...parsePath(key, legacyPaths)
    ]));
    return;
  }
  const [nodeValue, children] = tree;
  if (children) {
    forEach(children, (child, key) => {
      traverse(child, walker2, version, [
        ...origin,
        ...parsePath(key, legacyPaths)
      ]);
    });
  }
  walker2(nodeValue, origin);
}
function applyValueAnnotations(plain, annotations, version, superJson) {
  traverse(annotations, (type, path2) => {
    plain = setDeep(plain, path2, (v) => untransformValue(v, type, superJson));
  }, version);
  return plain;
}
function applyReferentialEqualityAnnotations(plain, annotations, version) {
  const legacyPaths = enableLegacyPaths(version);
  function apply(identicalPaths, path2) {
    const object = getDeep(plain, parsePath(path2, legacyPaths));
    identicalPaths.map((path3) => parsePath(path3, legacyPaths)).forEach((identicalObjectPath) => {
      plain = setDeep(plain, identicalObjectPath, () => object);
    });
  }
  if (isArray(annotations)) {
    const [root, other] = annotations;
    root.forEach((identicalPath) => {
      plain = setDeep(plain, parsePath(identicalPath, legacyPaths), () => plain);
    });
    if (other) {
      forEach(other, apply);
    }
  } else {
    forEach(annotations, apply);
  }
  return plain;
}
var isDeep = (object, superJson) => isPlainObject(object) || isArray(object) || isMap(object) || isSet(object) || isError(object) || isInstanceOfRegisteredClass(object, superJson);
function addIdentity(object, path2, identities) {
  const existingSet = identities.get(object);
  if (existingSet) {
    existingSet.push(path2);
  } else {
    identities.set(object, [path2]);
  }
}
function generateReferentialEqualityAnnotations(identitites, dedupe) {
  const result = {};
  let rootEqualityPaths = void 0;
  identitites.forEach((paths) => {
    if (paths.length <= 1) {
      return;
    }
    if (!dedupe) {
      paths = paths.map((path2) => path2.map(String)).sort((a, b) => a.length - b.length);
    }
    const [representativePath, ...identicalPaths] = paths;
    if (representativePath.length === 0) {
      rootEqualityPaths = identicalPaths.map(stringifyPath);
    } else {
      result[stringifyPath(representativePath)] = identicalPaths.map(stringifyPath);
    }
  });
  if (rootEqualityPaths) {
    if (isEmptyObject(result)) {
      return [rootEqualityPaths];
    } else {
      return [rootEqualityPaths, result];
    }
  } else {
    return isEmptyObject(result) ? void 0 : result;
  }
}
var walker = (object, identities, superJson, dedupe, path2 = [], objectsInThisPath = [], seenObjects = /* @__PURE__ */ new Map()) => {
  const primitive = isPrimitive(object);
  if (!primitive) {
    addIdentity(object, path2, identities);
    const seen = seenObjects.get(object);
    if (seen) {
      return dedupe ? {
        transformedValue: null
      } : seen;
    }
  }
  if (!isDeep(object, superJson)) {
    const transformed2 = transformValue(object, superJson);
    const result2 = transformed2 ? {
      transformedValue: transformed2.value,
      annotations: [transformed2.type]
    } : {
      transformedValue: object
    };
    if (!primitive) {
      seenObjects.set(object, result2);
    }
    return result2;
  }
  if (includes(objectsInThisPath, object)) {
    return {
      transformedValue: null
    };
  }
  const transformationResult = transformValue(object, superJson);
  const transformed = transformationResult?.value ?? object;
  const transformedValue = isArray(transformed) ? [] : {};
  const innerAnnotations = {};
  forEach(transformed, (value, index) => {
    if (index === "__proto__" || index === "constructor" || index === "prototype") {
      throw new Error(`Detected property ${index}. This is a prototype pollution risk, please remove it from your object.`);
    }
    const recursiveResult = walker(value, identities, superJson, dedupe, [...path2, index], [...objectsInThisPath, object], seenObjects);
    transformedValue[index] = recursiveResult.transformedValue;
    if (isArray(recursiveResult.annotations)) {
      innerAnnotations[escapeKey(index)] = recursiveResult.annotations;
    } else if (isPlainObject(recursiveResult.annotations)) {
      forEach(recursiveResult.annotations, (tree, key) => {
        innerAnnotations[escapeKey(index) + "." + key] = tree;
      });
    }
  });
  const result = isEmptyObject(innerAnnotations) ? {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type] : void 0
  } : {
    transformedValue,
    annotations: !!transformationResult ? [transformationResult.type, innerAnnotations] : innerAnnotations
  };
  if (!primitive) {
    seenObjects.set(object, result);
  }
  return result;
};

// node_modules/is-what/dist/getType.js
function getType2(payload) {
  return Object.prototype.toString.call(payload).slice(8, -1);
}

// node_modules/is-what/dist/isArray.js
function isArray2(payload) {
  return getType2(payload) === "Array";
}

// node_modules/is-what/dist/isPlainObject.js
function isPlainObject2(payload) {
  if (getType2(payload) !== "Object")
    return false;
  const prototype = Object.getPrototypeOf(payload);
  return !!prototype && prototype.constructor === Object && prototype === Object.prototype;
}

// node_modules/copy-anything/dist/index.js
function assignProp(carry, key, newVal, originalObject, includeNonenumerable) {
  const propType = {}.propertyIsEnumerable.call(originalObject, key) ? "enumerable" : "nonenumerable";
  if (propType === "enumerable")
    carry[key] = newVal;
  if (includeNonenumerable && propType === "nonenumerable") {
    Object.defineProperty(carry, key, {
      value: newVal,
      enumerable: false,
      writable: true,
      configurable: true
    });
  }
}
function copy(target, options = {}) {
  if (isArray2(target)) {
    return target.map((item) => copy(item, options));
  }
  if (!isPlainObject2(target)) {
    return target;
  }
  const props = Object.getOwnPropertyNames(target);
  const symbols = Object.getOwnPropertySymbols(target);
  return [...props, ...symbols].reduce((carry, key) => {
    if (key === "__proto__")
      return carry;
    if (isArray2(options.props) && !options.props.includes(key)) {
      return carry;
    }
    const val = target[key];
    const newVal = copy(val, options);
    assignProp(carry, key, newVal, target, options.nonenumerable);
    return carry;
  }, {});
}

// node_modules/superjson/dist/index.js
var SuperJSON = class {
  /**
   * @param dedupeReferentialEqualities  If true, SuperJSON will make sure only one instance of referentially equal objects are serialized and the rest are replaced with `null`.
   */
  constructor({ dedupe = false } = {}) {
    this.classRegistry = new ClassRegistry();
    this.symbolRegistry = new Registry((s) => s.description ?? "");
    this.customTransformerRegistry = new CustomTransformerRegistry();
    this.allowedErrorProps = [];
    this.dedupe = dedupe;
  }
  serialize(object) {
    const identities = /* @__PURE__ */ new Map();
    const output = walker(object, identities, this, this.dedupe);
    const res = {
      json: output.transformedValue
    };
    if (output.annotations) {
      res.meta = {
        ...res.meta,
        values: output.annotations
      };
    }
    const equalityAnnotations = generateReferentialEqualityAnnotations(identities, this.dedupe);
    if (equalityAnnotations) {
      res.meta = {
        ...res.meta,
        referentialEqualities: equalityAnnotations
      };
    }
    if (res.meta)
      res.meta.v = 1;
    return res;
  }
  deserialize(payload, options) {
    const { json, meta } = payload;
    let result = options?.inPlace ? json : copy(json);
    if (meta?.values) {
      result = applyValueAnnotations(result, meta.values, meta.v ?? 0, this);
    }
    if (meta?.referentialEqualities) {
      result = applyReferentialEqualityAnnotations(result, meta.referentialEqualities, meta.v ?? 0);
    }
    return result;
  }
  stringify(object) {
    return JSON.stringify(this.serialize(object));
  }
  parse(string) {
    return this.deserialize(JSON.parse(string), { inPlace: true });
  }
  registerClass(v, options) {
    this.classRegistry.register(v, options);
  }
  registerSymbol(v, identifier) {
    this.symbolRegistry.register(v, identifier);
  }
  registerCustom(transformer, name) {
    this.customTransformerRegistry.register({
      name,
      ...transformer
    });
  }
  allowErrorProps(...props) {
    this.allowedErrorProps.push(...props);
  }
};
SuperJSON.defaultInstance = new SuperJSON();
SuperJSON.serialize = SuperJSON.defaultInstance.serialize.bind(SuperJSON.defaultInstance);
SuperJSON.deserialize = SuperJSON.defaultInstance.deserialize.bind(SuperJSON.defaultInstance);
SuperJSON.stringify = SuperJSON.defaultInstance.stringify.bind(SuperJSON.defaultInstance);
SuperJSON.parse = SuperJSON.defaultInstance.parse.bind(SuperJSON.defaultInstance);
SuperJSON.registerClass = SuperJSON.defaultInstance.registerClass.bind(SuperJSON.defaultInstance);
SuperJSON.registerSymbol = SuperJSON.defaultInstance.registerSymbol.bind(SuperJSON.defaultInstance);
SuperJSON.registerCustom = SuperJSON.defaultInstance.registerCustom.bind(SuperJSON.defaultInstance);
SuperJSON.allowErrorProps = SuperJSON.defaultInstance.allowErrorProps.bind(SuperJSON.defaultInstance);
var dist_default = SuperJSON;
var serialize = SuperJSON.serialize;
var deserialize = SuperJSON.deserialize;
var stringify = SuperJSON.stringify;
var parse = SuperJSON.parse;
var registerClass = SuperJSON.registerClass;
var registerCustom = SuperJSON.registerCustom;
var registerSymbol = SuperJSON.registerSymbol;
var allowErrorProps = SuperJSON.allowErrorProps;

// api/middleware.ts
var t = initTRPC.context().create({
  transformer: dist_default
});
var createRouter = t.router;
var publicQuery = t.procedure;
var requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});
function requireRole(role) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== role) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole
      });
    }
    return next({ ctx: { ...ctx, user: ctx.user } });
  });
}
var authedQuery = t.procedure.use(requireAuth);
var adminQuery = authedQuery.use(requireRole("admin"));

// api/auth-router.ts
var authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),
  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase(),
        secure: opts.secure,
        maxAge: 0
      })
    );
    return { success: true };
  })
});

// api/merchant-router.ts
import { z } from "zod";

// api/queries/connection.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// api/lib/env.ts
import "dotenv/config";
function getEnv(name, defaultValue = "") {
  return process.env[name] ?? defaultValue;
}
function detectIsProduction() {
  if (process.env.NODE_ENV === "production") return true;
  if (process.env.PORT) return true;
  if (process.env.RENDER) return true;
  return false;
}
var env = {
  appId: getEnv("APP_ID", "euro-arab-market"),
  appSecret: getEnv("APP_SECRET", "sk-euro-arab-secret-2024"),
  isProduction: detectIsProduction(),
  databaseUrl: getEnv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/euroarabmarket"),
  kimiAuthUrl: getEnv("KIMI_AUTH_URL", ""),
  kimiOpenUrl: getEnv("KIMI_OPEN_URL", ""),
  ownerUnionId: getEnv("OWNER_UNION_ID", "")
};

// db/schema.ts
var schema_exports = {};
__export(schema_exports, {
  chatMessages: () => chatMessages,
  claims: () => claims,
  favorites: () => favorites,
  jobs: () => jobs,
  merchants: () => merchants,
  reviews: () => reviews,
  searchLogs: () => searchLogs,
  subscriptions: () => subscriptions,
  users: () => users
});
import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  bigint,
  jsonb
} from "drizzle-orm/pg-core";
var roleEnum = pgEnum("role", ["user", "admin"]);
var merchantCategoryEnum = pgEnum("merchant_category", [
  "restaurant",
  "supermarket",
  "sweets",
  "barber",
  "butcher",
  "bakery",
  "cafe",
  "clothing",
  "electronics",
  "pharmacy",
  "halal_grocery",
  "shisha_lounge",
  "travel_agency",
  "money_transfer",
  "mosque",
  "cultural_center",
  "car_dealer",
  "repair_shop",
  "other"
]);
var merchantStatusEnum = pgEnum("merchant_status", [
  "pending",
  "active",
  "suspended",
  "rejected",
  "claimed"
]);
var jobCategoryEnum = pgEnum("job_category", [
  "construction",
  "driving",
  "photography",
  "painting",
  "plumbing",
  "electrician",
  "carpentry",
  "cleaning",
  "cooking",
  "it",
  "translation",
  "accounting",
  "medical",
  "education",
  "other"
]);
var jobTypeEnum = pgEnum("job_type", [
  "full_time",
  "part_time",
  "contract",
  "freelance",
  "temporary"
]);
var experienceLevelEnum = pgEnum("experience_level", [
  "entry",
  "mid",
  "senior",
  "expert"
]);
var jobStatusEnum = pgEnum("job_status", [
  "open",
  "closed",
  "filled",
  "paused"
]);
var chatRoleEnum = pgEnum("chat_role", ["user", "assistant"]);
var searchTypeEnum = pgEnum("search_type", ["merchant", "job", "general"]);
var subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
  "trial"
]);
var subscriptionPlanEnum = pgEnum("subscription_plan", [
  "basic",
  "premium",
  "featured"
]);
var claimStatusEnum = pgEnum("claim_status", [
  "pending",
  "approved",
  "rejected"
]);
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull()
});
var merchants = pgTable("merchants", {
  // Basic Info
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  // Business Name
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessNameAr: varchar("businessNameAr", { length: 255 }),
  slug: varchar("slug", { length: 255 }).unique(),
  // Description
  description: text("description"),
  descriptionAr: text("descriptionAr"),
  shortDescription: varchar("shortDescription", { length: 500 }),
  // Category
  category: merchantCategoryEnum("category").notNull(),
  subcategory: varchar("subcategory", { length: 100 }),
  tags: text("tags"),
  // Media (Images)
  logo: text("logo"),
  coverImage: text("coverImage"),
  galleryImages: jsonb("galleryImages").default("[]"),
  // Contact
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  email: varchar("email", { length: 320 }),
  website: varchar("website", { length: 255 }),
  // Social Media
  facebookUrl: text("facebookUrl"),
  instagramUrl: text("instagramUrl"),
  tiktokUrl: text("tiktokUrl"),
  youtubeUrl: text("youtubeUrl"),
  // Address
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  address: text("address"),
  addressAr: text("addressAr"),
  postalCode: varchar("postalCode", { length: 20 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  // Location (Google Maps)
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  googleMapsUrl: text("googleMapsUrl"),
  // Opening Hours (Yelp-style)
  openingHours: jsonb("openingHours").default("{}"),
  isOpen24Hours: boolean("isOpen24Hours").default(false),
  // Features & Amenities
  amenities: jsonb("amenities").default("[]"),
  features: jsonb("features").default("[]"),
  // Payment Methods
  paymentMethods: jsonb("paymentMethods").default("[]"),
  acceptsCash: boolean("acceptsCash").default(true),
  acceptsCard: boolean("acceptsCard").default(false),
  // Pricing
  priceRange: varchar("priceRange", { length: 10 }).default("$$"),
  // Status
  status: merchantStatusEnum("status").default("pending").notNull(),
  isVerified: boolean("isVerified").default(false),
  isFeatured: boolean("isFeatured").default(false),
  // Rating
  rating: decimal("rating", { precision: 2, scale: 1 }).default("0.0"),
  reviewCount: integer("reviewCount").default(0),
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  keywords: text("keywords"),
  // Claim Info
  claimedBy: bigint("claimedBy", { mode: "number" }).references(() => users.id),
  claimedAt: timestamp("claimedAt"),
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  titleAr: varchar("titleAr", { length: 255 }),
  companyName: varchar("companyName", { length: 255 }),
  description: text("description").notNull(),
  descriptionAr: text("descriptionAr"),
  category: jobCategoryEnum("category").notNull(),
  type: jobTypeEnum("type").notNull(),
  requirements: text("requirements"),
  requirementsAr: text("requirementsAr"),
  skills: text("skills"),
  experienceLevel: experienceLevelEnum("experienceLevel").default("entry"),
  salaryMin: decimal("salaryMin", { precision: 10, scale: 2 }),
  salaryMax: decimal("salaryMax", { precision: 10, scale: 2 }),
  salaryCurrency: varchar("salaryCurrency", { length: 3 }).default("EUR"),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  isRemote: boolean("isRemote").default(false),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 50 }),
  status: jobStatusEnum("status").default("open").notNull(),
  slug: varchar("slug", { length: 255 }).unique(),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date()),
  expiresAt: timestamp("expiresAt")
});
var reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number" }).references(() => jobs.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isVerified: boolean("isVerified").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id).notNull(),
  plan: subscriptionPlanEnum("plan").default("basic").notNull(),
  status: subscriptionStatusEnum("status").default("trial").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("EUR"),
  billingCycle: varchar("billingCycle", { length: 20 }).default("monthly"),
  // monthly, yearly
  startedAt: timestamp("startedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  cancelledAt: timestamp("cancelledAt"),
  paymentMethod: varchar("paymentMethod", { length: 50 }),
  // paypal, stripe
  paymentId: varchar("paymentId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => /* @__PURE__ */ new Date())
});
var claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id).notNull(),
  status: claimStatusEnum("status").default("pending").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  proofDocument: text("proofDocument"),
  // URL to uploaded document
  businessRegistration: text("businessRegistration"),
  message: text("message"),
  reviewedBy: bigint("reviewedBy", { mode: "number" }).references(() => users.id),
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  role: chatRoleEnum("role").notNull(),
  content: text("content").notNull(),
  wishesUsed: integer("wishesUsed").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var searchLogs = pgTable("search_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id),
  query: varchar("query", { length: 500 }).notNull(),
  type: searchTypeEnum("type").default("general"),
  filters: jsonb("filters"),
  resultsCount: integer("resultsCount").default(0),
  ipAddress: varchar("ipAddress", { length: 50 }),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});
var favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number" }).references(() => users.id).notNull(),
  merchantId: bigint("merchantId", { mode: "number" }).references(() => merchants.id),
  jobId: bigint("jobId", { mode: "number" }).references(() => jobs.id),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// db/relations.ts
var relations_exports = {};
__export(relations_exports, {
  chatMessagesRelations: () => chatMessagesRelations,
  favoritesRelations: () => favoritesRelations,
  jobsRelations: () => jobsRelations,
  merchantsRelations: () => merchantsRelations,
  reviewsRelations: () => reviewsRelations,
  searchLogsRelations: () => searchLogsRelations,
  usersRelations: () => usersRelations
});
import { relations } from "drizzle-orm";
var usersRelations = relations(users, ({ many }) => ({
  merchants: many(merchants),
  jobs: many(jobs),
  reviews: many(reviews),
  chatMessages: many(chatMessages),
  searchLogs: many(searchLogs),
  favorites: many(favorites)
}));
var merchantsRelations = relations(merchants, ({ one, many }) => ({
  user: one(users, { fields: [merchants.userId], references: [users.id] }),
  reviews: many(reviews),
  favorites: many(favorites)
}));
var jobsRelations = relations(jobs, ({ one, many }) => ({
  user: one(users, { fields: [jobs.userId], references: [users.id] }),
  favorites: many(favorites)
}));
var reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, { fields: [reviews.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [reviews.merchantId], references: [merchants.id] })
}));
var chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, { fields: [chatMessages.userId], references: [users.id] })
}));
var searchLogsRelations = relations(searchLogs, ({ one }) => ({
  user: one(users, { fields: [searchLogs.userId], references: [users.id] })
}));
var favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, { fields: [favorites.userId], references: [users.id] }),
  merchant: one(merchants, { fields: [favorites.merchantId], references: [merchants.id] }),
  job: one(jobs, { fields: [favorites.jobId], references: [jobs.id] })
}));

// api/queries/connection.ts
var fullSchema = { ...schema_exports, ...relations_exports };
var instance;
function needsSsl(url) {
  if (url.includes("render.com")) return true;
  if (url.includes("amazonaws.com")) return true;
  if (url.includes("supabase.co")) return true;
  if (url.includes("localhost") || url.includes("127.0.0.1")) return false;
  return env.isProduction;
}
function getDb() {
  if (!instance) {
    const useSsl = needsSsl(env.databaseUrl);
    console.log("[DB] DATABASE_URL:", env.databaseUrl.substring(0, 30) + "...");
    console.log("[DB] SSL enabled:", useSsl);
    const client = postgres(env.databaseUrl, {
      ssl: useSsl ? { rejectUnauthorized: false } : false,
      max: 5,
      idle_timeout: 20,
      connect_timeout: 15,
      onnotice: () => {
      },
      onparameter: () => {
      }
    });
    instance = drizzle(client, { schema: fullSchema });
  }
  return instance;
}

// api/merchant-router.ts
import { eq, and, desc, sql } from "drizzle-orm";
var merchantRouter = createRouter({
  // Get all merchants with optional filters
  list: publicQuery.input(
    z.object({
      category: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      status: z.string().optional(),
      featured: z.boolean().optional(),
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    try {
      const db = getDb();
      let query = db.select().from(merchants);
      const conditions = [];
      const targetStatus = input?.status || "active";
      conditions.push(sql`${merchants.status} = ${targetStatus}`);
      if (input?.category) {
        conditions.push(sql`${merchants.category} = ${input.category}`);
      }
      if (input?.country) {
        conditions.push(sql`${merchants.country} = ${input.country}`);
      }
      if (input?.city) {
        conditions.push(sql`${merchants.city} = ${input.city}`);
      }
      if (input?.featured) {
        conditions.push(sql`${merchants.isFeatured} = true`);
      }
      if (input?.search) {
        const term = `%${input.search}%`;
        conditions.push(sql`(
            ${merchants.businessName} ILIKE ${term} OR
            ${merchants.businessNameAr} ILIKE ${term} OR
            ${merchants.description} ILIKE ${term} OR
            ${merchants.descriptionAr} ILIKE ${term} OR
            ${merchants.tags} ILIKE ${term}
          )`);
      }
      const where = conditions.length > 1 ? and(...conditions) : conditions[0];
      const items = await query.where(where).limit(input?.limit || 20).offset(input?.offset || 0).orderBy(desc(merchants.id));
      const countResult = await db.select({ count: sql`count(*)` }).from(merchants).where(where);
      return {
        items,
        total: countResult[0]?.count || 0
      };
    } catch (error) {
      console.error("[merchant.list] Error:", error?.message || error);
      return { items: [], total: 0, error: error?.message };
    }
  }),
  // Get single merchant by ID
  getById: publicQuery.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const merchant = await db.select().from(merchants).where(eq(merchants.id, input.id)).limit(1);
    if (!merchant[0]) {
      throw new Error("Merchant not found");
    }
    const merchantReviews = await db.select().from(reviews).where(eq(reviews.merchantId, input.id)).orderBy(desc(reviews.createdAt));
    return {
      ...merchant[0],
      reviews: merchantReviews
    };
  }),
  // Get merchant by slug
  getBySlug: publicQuery.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = getDb();
    const merchant = await db.select().from(merchants).where(eq(merchants.slug, input.slug)).limit(1);
    if (!merchant[0]) {
      throw new Error("Merchant not found");
    }
    return merchant[0];
  }),
  // Create merchant
  create: publicQuery.input(
    z.object({
      businessName: z.string().min(1),
      businessNameAr: z.string().optional(),
      description: z.string().optional(),
      descriptionAr: z.string().optional(),
      category: z.enum([
        "restaurant",
        "supermarket",
        "sweets",
        "barber",
        "butcher",
        "bakery",
        "cafe",
        "clothing",
        "electronics",
        "pharmacy",
        "other"
      ]),
      subcategory: z.string().optional(),
      phone: z.string().optional(),
      whatsapp: z.string().optional(),
      email: z.string().email().optional(),
      website: z.string().optional(),
      country: z.string().min(1),
      city: z.string().min(1),
      address: z.string().optional(),
      postalCode: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
      openingHours: z.any().optional(),
      tags: z.string().optional(),
      userId: z.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const slug = input.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
    const result = await db.insert(merchants).values({
      ...input,
      slug,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning({ id: merchants.id });
    return { id: result[0].id, slug };
  }),
  // Get featured merchants
  featured: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(merchants).where(and(eq(merchants.status, "active"), eq(merchants.isVerified, true))).orderBy(desc(merchants.rating)).limit(6);
  }),
  // Get categories with counts
  categories: publicQuery.query(async () => {
    const db = getDb();
    const categories = [
      { id: 1, name: "\u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629", nameEn: "restaurant", icon: "Utensils", color: "#ef4444", count: 0 },
      { id: 2, name: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644", nameEn: "supermarket", icon: "ShoppingCart", color: "#22c55e", count: 0 },
      { id: 3, name: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629", nameEn: "sweets", icon: "Cake", color: "#f59e0b", count: 0 },
      { id: 4, name: "\u0635\u0627\u0644\u0648\u0646\u0627\u062A \u062D\u0644\u0627\u0642\u0629", nameEn: "barber", icon: "Scissors", color: "#3b82f6", count: 0 },
      { id: 5, name: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", nameEn: "butcher", icon: "Beef", color: "#ef4444", count: 0 },
      { id: 6, name: "\u0645\u062E\u0627\u0628\u0632", nameEn: "bakery", icon: "Bread", color: "#f59e0b", count: 0 },
      { id: 7, name: "\u0645\u0642\u0627\u0647\u064A", nameEn: "cafe", icon: "Coffee", color: "#8b5cf6", count: 0 },
      { id: 8, name: "\u0645\u0644\u0627\u0628\u0633", nameEn: "clothing", icon: "Shirt", color: "#ec4899", count: 0 },
      { id: 9, name: "\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A", nameEn: "electronics", icon: "Smartphone", color: "#06b6d4", count: 0 },
      { id: 10, name: "\u0635\u064A\u062F\u0644\u064A\u0627\u062A", nameEn: "pharmacy", icon: "Pill", color: "#10b981", count: 0 }
    ];
    for (const cat of categories) {
      const result = await db.select({ count: sql`count(*)` }).from(merchants).where(and(eq(merchants.category, cat.nameEn), eq(merchants.status, "active")));
      cat.count = result[0]?.count || 0;
    }
    return categories;
  }),
  // Get cities list
  cities: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({
      city: merchants.city,
      country: merchants.country,
      count: sql`count(*)`
    }).from(merchants).where(eq(merchants.status, "active")).groupBy(merchants.city, merchants.country).orderBy(desc(sql`count(*)`));
    return result;
  })
});

// api/job-router.ts
import { z as z2 } from "zod";
import { eq as eq2, and as and2, like as like2, or as or2, desc as desc2, sql as sql2 } from "drizzle-orm";
var jobRouter = createRouter({
  // Get all jobs with optional filters
  list: publicQuery.input(
    z2.object({
      category: z2.string().optional(),
      type: z2.string().optional(),
      country: z2.string().optional(),
      city: z2.string().optional(),
      search: z2.string().optional(),
      experienceLevel: z2.string().optional(),
      status: z2.string().optional(),
      limit: z2.number().min(1).max(100).default(20),
      offset: z2.number().min(0).default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.category) {
      conditions.push(eq2(jobs.category, input.category));
    }
    if (input?.type) {
      conditions.push(eq2(jobs.type, input.type));
    }
    if (input?.country) {
      conditions.push(eq2(jobs.country, input.country));
    }
    if (input?.city) {
      conditions.push(eq2(jobs.city, input.city));
    }
    if (input?.experienceLevel) {
      conditions.push(eq2(jobs.experienceLevel, input.experienceLevel));
    }
    if (input?.status) {
      conditions.push(eq2(jobs.status, input.status));
    } else {
      conditions.push(eq2(jobs.status, "open"));
    }
    if (input?.search) {
      const searchTerm = `%${input.search}%`;
      conditions.push(
        or2(
          like2(jobs.title, searchTerm),
          like2(jobs.titleAr, searchTerm),
          like2(jobs.description, searchTerm),
          like2(jobs.descriptionAr, searchTerm),
          like2(jobs.tags, searchTerm)
        )
      );
    }
    const where = conditions.length > 0 ? and2(...conditions) : void 0;
    const [items, countResult] = await Promise.all([
      db.select().from(jobs).where(where).limit(input?.limit || 20).offset(input?.offset || 0).orderBy(desc2(jobs.createdAt)),
      db.select({ count: sql2`count(*)` }).from(jobs).where(where)
    ]);
    return {
      items,
      total: countResult[0]?.count || 0
    };
  }),
  // Get single job by ID
  getById: publicQuery.input(z2.object({ id: z2.number() })).query(async ({ input }) => {
    const db = getDb();
    const job = await db.select().from(jobs).where(eq2(jobs.id, input.id)).limit(1);
    if (!job[0]) {
      throw new Error("Job not found");
    }
    return job[0];
  }),
  // Create job
  create: publicQuery.input(
    z2.object({
      title: z2.string().min(1),
      titleAr: z2.string().optional(),
      description: z2.string().min(1),
      descriptionAr: z2.string().optional(),
      category: z2.enum([
        "construction",
        "driving",
        "photography",
        "painting",
        "plumbing",
        "electrician",
        "carpentry",
        "cleaning",
        "cooking",
        "it",
        "translation",
        "accounting",
        "medical",
        "education",
        "other"
      ]),
      type: z2.enum(["full_time", "part_time", "contract", "freelance", "temporary"]),
      requirements: z2.string().optional(),
      requirementsAr: z2.string().optional(),
      skills: z2.string().optional(),
      experienceLevel: z2.enum(["entry", "mid", "senior", "expert"]).optional(),
      salaryMin: z2.string().optional(),
      salaryMax: z2.string().optional(),
      salaryCurrency: z2.string().optional(),
      country: z2.string().min(1),
      city: z2.string().min(1),
      isRemote: z2.boolean().optional(),
      contactEmail: z2.string().email().optional(),
      contactPhone: z2.string().optional(),
      tags: z2.string().optional(),
      userId: z2.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();
    const result = await db.insert(jobs).values({
      ...input,
      slug,
      status: "open",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning({ id: jobs.id });
    return { id: result[0].id, slug };
  }),
  // Get job categories
  categories: publicQuery.query(async () => {
    const db = getDb();
    const categories = [
      { id: 1, name: "\u0628\u0646\u0627\u0621", nameEn: "construction", icon: "HardHat", color: "#f59e0b", count: 0 },
      { id: 2, name: "\u0642\u064A\u0627\u062F\u0629", nameEn: "driving", icon: "Car", color: "#3b82f6", count: 0 },
      { id: 3, name: "\u062A\u0635\u0648\u064A\u0631", nameEn: "photography", icon: "Camera", color: "#8b5cf6", count: 0 },
      { id: 4, name: "\u062F\u0647\u0627\u0646", nameEn: "painting", icon: "Paintbrush", color: "#ec4899", count: 0 },
      { id: 5, name: "\u0633\u0628\u0627\u0643\u0629", nameEn: "plumbing", icon: "Wrench", color: "#06b6d4", count: 0 },
      { id: 6, name: "\u0643\u0647\u0631\u0628\u0627\u0621", nameEn: "electrician", icon: "Zap", color: "#f59e0b", count: 0 },
      { id: 7, name: "\u0646\u062C\u0627\u0631\u0629", nameEn: "carpentry", icon: "Hammer", color: "#8b4513", count: 0 },
      { id: 8, name: "\u062A\u0646\u0638\u064A\u0641", nameEn: "cleaning", icon: "Sparkles", color: "#10b981", count: 0 },
      { id: 9, name: "\u0637\u0628\u062E", nameEn: "cooking", icon: "ChefHat", color: "#ef4444", count: 0 },
      { id: 10, name: "\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627", nameEn: "it", icon: "Laptop", color: "#6366f1", count: 0 },
      { id: 11, name: "\u062A\u0631\u062C\u0645\u0629", nameEn: "translation", icon: "Languages", color: "#14b8a6", count: 0 },
      { id: 12, name: "\u0645\u062D\u0627\u0633\u0628\u0629", nameEn: "accounting", icon: "Calculator", color: "#f97316", count: 0 },
      { id: 13, name: "\u0637\u0628", nameEn: "medical", icon: "Stethoscope", color: "#ef4444", count: 0 },
      { id: 14, name: "\u062A\u0639\u0644\u064A\u0645", nameEn: "education", icon: "GraduationCap", color: "#3b82f6", count: 0 },
      { id: 15, name: "\u0623\u062E\u0631\u0649", nameEn: "other", icon: "Briefcase", color: "#6b7280", count: 0 }
    ];
    for (const cat of categories) {
      const result = await db.select({ count: sql2`count(*)` }).from(jobs).where(and2(eq2(jobs.category, cat.nameEn), eq2(jobs.status, "open")));
      cat.count = result[0]?.count || 0;
    }
    return categories;
  }),
  // Get recent jobs
  recent: publicQuery.input(z2.object({ limit: z2.number().default(6) }).optional()).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(jobs).where(eq2(jobs.status, "open")).orderBy(desc2(jobs.createdAt)).limit(input?.limit || 6);
  })
});

// api/search-router.ts
import { z as z3 } from "zod";
import { like as like3, or as or3, and as and3, eq as eq3, sql as sql3, desc as desc3 } from "drizzle-orm";
var searchRouter = createRouter({
  // Universal search across merchants and jobs
  search: publicQuery.input(
    z3.object({
      query: z3.string().min(1),
      type: z3.enum(["all", "merchants", "jobs"]).default("all"),
      country: z3.string().optional(),
      city: z3.string().optional(),
      category: z3.string().optional(),
      limit: z3.number().min(1).max(50).default(20)
    })
  ).query(async ({ input }) => {
    const db = getDb();
    const searchTerm = `%${input.query}%`;
    const results = { merchants: [], jobs: [], total: 0 };
    if (input.type === "all" || input.type === "merchants") {
      const merchantConditions = [
        or3(
          like3(merchants.businessName, searchTerm),
          like3(merchants.businessNameAr, searchTerm),
          like3(merchants.description, searchTerm),
          like3(merchants.descriptionAr, searchTerm),
          like3(merchants.tags, searchTerm),
          like3(merchants.city, searchTerm),
          like3(merchants.country, searchTerm)
        ),
        eq3(merchants.status, "active")
      ];
      if (input.country) {
        merchantConditions.push(eq3(merchants.country, input.country));
      }
      if (input.city) {
        merchantConditions.push(eq3(merchants.city, input.city));
      }
      if (input.category) {
        merchantConditions.push(eq3(merchants.category, input.category));
      }
      results.merchants = await db.select().from(merchants).where(and3(...merchantConditions)).limit(input.limit).orderBy(desc3(merchants.rating));
    }
    if (input.type === "all" || input.type === "jobs") {
      const jobConditions = [
        or3(
          like3(jobs.title, searchTerm),
          like3(jobs.titleAr, searchTerm),
          like3(jobs.description, searchTerm),
          like3(jobs.descriptionAr, searchTerm),
          like3(jobs.tags, searchTerm),
          like3(jobs.city, searchTerm),
          like3(jobs.country, searchTerm)
        ),
        eq3(jobs.status, "open")
      ];
      if (input.country) {
        jobConditions.push(eq3(jobs.country, input.country));
      }
      if (input.city) {
        jobConditions.push(eq3(jobs.city, input.city));
      }
      if (input.category) {
        jobConditions.push(eq3(jobs.category, input.category));
      }
      results.jobs = await db.select().from(jobs).where(and3(...jobConditions)).limit(input.limit).orderBy(desc3(jobs.createdAt));
    }
    results.total = results.merchants.length + results.jobs.length;
    return results;
  }),
  // Get popular searches
  popularSearches: publicQuery.query(async () => {
    return [
      { id: 1, query: "\u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0628\u0627\u0631\u064A\u0633", type: "merchant", count: 1250 },
      { id: 2, query: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", type: "merchant", count: 980 },
      { id: 3, query: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0641\u064A \u0644\u0646\u062F\u0646", type: "merchant", count: 850 },
      { id: 4, query: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", type: "merchant", count: 720 },
      { id: 5, query: "\u0645\u0647\u0646\u062F\u0633 \u0641\u064A \u0645\u064A\u0648\u0646\u062E", type: "job", count: 650 },
      { id: 6, query: "\u0633\u0627\u0626\u0642 \u0641\u064A \u0641\u064A\u064A\u0646\u0627", type: "job", count: 540 },
      { id: 7, query: "\u0645\u0639\u0644\u0645 \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644", type: "job", count: 480 },
      { id: 8, query: "\u062D\u0644\u0648\u0627\u0646\u064A \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", type: "job", count: 390 },
      { id: 9, query: "\u0645\u062D\u0627\u0633\u0628 \u0641\u064A \u0645\u062F\u0631\u064A\u062F", type: "job", count: 350 },
      { id: 10, query: "\u0637\u0628\u064A\u0628 \u0641\u064A \u0631\u0648\u0645\u0627", type: "job", count: 320 }
    ];
  }),
  // Get suggestions based on query
  suggestions: publicQuery.input(z3.object({ query: z3.string().min(1) })).query(async ({ input }) => {
    const db = getDb();
    const searchTerm = `%${input.query}%`;
    const [merchantResults, jobResults] = await Promise.all([
      db.select({
        id: merchants.id,
        name: merchants.businessName,
        type: sql3`'merchant'`,
        category: merchants.category,
        city: merchants.city
      }).from(merchants).where(
        and3(
          or3(
            like3(merchants.businessName, searchTerm),
            like3(merchants.businessNameAr, searchTerm)
          ),
          eq3(merchants.status, "active")
        )
      ).limit(5),
      db.select({
        id: jobs.id,
        name: jobs.title,
        type: sql3`'job'`,
        category: jobs.category,
        city: jobs.city
      }).from(jobs).where(
        and3(
          or3(
            like3(jobs.title, searchTerm),
            like3(jobs.titleAr, searchTerm)
          ),
          eq3(jobs.status, "open")
        )
      ).limit(5)
    ]);
    return [...merchantResults, ...jobResults];
  })
});

// api/sindbad-router.ts
import { z as z4 } from "zod";
import { eq as eq4, and as and4, sql as sql4 } from "drizzle-orm";
function createSessionId(userId) {
  return `${userId || "anon"}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
var MAX_WISHES = 3;
async function callKimiAPI(message, apiKey) {
  try {
    const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "moonshot-v1-8k",
        messages: [
          {
            role: "system",
            content: `\u0623\u0646\u062A \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0641\u064A \u0645\u0648\u0642\u0639 "\u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A" - \u062F\u0644\u064A\u0644 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0648\u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627.`
          },
          { role: "user", content: message }
        ],
        temperature: 0.7,
        max_tokens: 1e3
      })
    });
    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status}`);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0645 \u0623\u0641\u0647\u0645. \u062C\u0631\u0628 \u0645\u0631\u0629 \u0623\u062E\u0631\u0649!";
  } catch (error) {
    console.error("Kimi API error:", error);
    throw error;
  }
}
function getFallbackResponse(message, wishesRemaining) {
  const msg = message.toLowerCase();
  if (msg.includes("\u0645\u0637\u0639\u0645") || msg.includes("\u0645\u0637\u0627\u0639\u0645") || msg.includes("\u0623\u0643\u0644") || msg.includes("\u0637\u0639\u0627\u0645")) {
    return `\u0623\u0647\u0644\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F37D}\uFE0F

\u064A\u0648\u062C\u062F \u0627\u0644\u0639\u062F\u064A\u062F \u0645\u0646 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0645\u0645\u062A\u0627\u0632\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627. \u0625\u0644\u064A\u0643 \u0628\u0639\u0636 \u0627\u0644\u0627\u0642\u062A\u0631\u0627\u062D\u0627\u062A:

**\u0628\u0627\u0631\u064A\u0633 \u{1F1EB}\u{1F1F7}**
- \u0645\u0637\u0639\u0645 \u0627\u0644\u0634\u0627\u0645 - \u0645\u0637\u0627\u0639\u0645 \u0633\u0648\u0631\u064A\u0629
- \u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646 \u0627\u0644\u062D\u0644\u0648 - \u0645\u0637\u0627\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A\u0629

**\u0628\u0631\u0644\u064A\u0646 \u{1F1E9}\u{1F1EA}**
- \u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642 - \u0645\u0637\u0627\u0639\u0645 \u0633\u0648\u0631\u064A\u0629
- \u0645\u0637\u0639\u0645 \u0628\u064A\u0631\u0648\u062A - \u0645\u0637\u0627\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A\u0629

\u064A\u0645\u0643\u0646\u0643 \u0627\u0644\u0628\u062D\u062B \u0641\u064A \u0645\u0648\u0642\u0639\u0646\u0627 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0623\u0631\u0642\u0627\u0645 \u0647\u0648\u0627\u062A\u0641 \u0647\u0630\u0647 \u0627\u0644\u0645\u0637\u0627\u0639\u0645! \u{1F50D}`;
  }
  if (msg.includes("\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A") || msg.includes("\u062D\u0644\u0627\u0644") || msg.includes("\u0628\u0642\u0627\u0644\u0629")) {
    return `\u0637\u0628\u0639\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F6D2}

\u0647\u0630\u0647 \u0628\u0639\u0636 \u0623\u0634\u0647\u0631 \u0627\u0644\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627:

**\u0628\u0627\u0631\u064A\u0633 \u{1F1EB}\u{1F1F7}**
- \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0623\u0646\u062F\u0644\u0633 - \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0644\u0627\u0644 \u0648\u0639\u0631\u0628\u064A\u0629
- \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0645\u0646\u0648\u0631\u0629 - \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644

**\u0628\u0631\u0644\u064A\u0646 \u{1F1E9}\u{1F1EA}**
- \u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0633\u0644\u0627\u0645 - \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0644\u0627\u0644
- \u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0623\u0646\u0635\u0627\u0631 - \u062E\u0636\u0627\u0631 \u0648\u0641\u0648\u0627\u0643\u0647 \u0639\u0631\u0628\u064A\u0629

\u062C\u0645\u064A\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u062A\u0627\u062C\u0631 \u0645\u0639\u062A\u0645\u062F\u0629 \u0645\u0646 \u0627\u0644\u0647\u064A\u0626\u0627\u062A \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A\u0629 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627! \u2705`;
  }
  if (msg.includes("\u062D\u0644\u0627\u0642") || msg.includes("\u0635\u0627\u0644\u0648\u0646") || msg.includes("\u062D\u0644\u0627\u0642\u0629")) {
    return `\u0639\u0646\u062F\u064A \u0644\u0643 \u062E\u064A\u0627\u0631\u0627\u062A \u0645\u0645\u062A\u0627\u0632\u0629 \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F488}

**\u0635\u0627\u0644\u0648\u0646\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629:**

**\u0628\u0627\u0631\u064A\u0633 \u{1F1EB}\u{1F1F7}**
- \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 - \u062D\u0644\u0627\u0642\u0629 \u0631\u062C\u0627\u0644\u064A\u0629 \u0639\u0631\u0628\u064A\u0629
- \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0634\u0627\u0645 - \u062D\u0644\u0627\u0642\u0629 \u0648\u062A\u062C\u0645\u064A\u0644

**\u0644\u0646\u062F\u0646 \u{1F1EC}\u{1F1E7}**
- \u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0645\u0644\u0643 - \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A\u0629 \u0641\u0627\u062E\u0631\u0629
- \u0635\u0627\u0644\u0648\u0646 \u062F\u0645\u0634\u0642 - \u062D\u0644\u0627\u0642\u0629 \u0648\u062A\u0635\u0641\u064A\u0641 \u0634\u0639\u0631

\u0645\u0639\u0638\u0645\u0647\u0627 \u064A\u062A\u062D\u062F\u062B \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u064A\u0639\u0631\u0641 \u0627\u0644\u0627\u0633\u062A\u0627\u064A\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629! \u2702\uFE0F`;
  }
  if (msg.includes("\u0648\u0638\u064A\u0641\u0629") || msg.includes("\u0634\u063A\u0644") || msg.includes("\u0639\u0645\u0644")) {
    return `\u0628\u0627\u0644\u062A\u0623\u0643\u064A\u062F! \u064A\u0648\u062C\u062F \u0627\u0644\u0639\u062F\u064A\u062F \u0645\u0646 \u0627\u0644\u0641\u0631\u0635 \u0627\u0644\u0648\u0638\u064A\u0641\u064A\u0629 \u0644\u0644\u0639\u0631\u0628 \u0641\u064A \u0623\u0648\u0631\u0648\u0628\u0627 \u{1F4BC}

**\u0623\u0643\u062B\u0631 \u0627\u0644\u0645\u0647\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629:**

1. **\u0627\u0644\u0628\u0646\u0627\u0621 \u0648\u0627\u0644\u0625\u0646\u0634\u0627\u0621\u0627\u062A** \u{1F3D7}\uFE0F - \u20AC1,800 - \u20AC3,500
2. **\u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0648\u0627\u0644\u062A\u0648\u0635\u064A\u0644** \u{1F697} - \u20AC2,000 - \u20AC3,000
3. **\u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0648\u0627\u0644\u0641\u0646\u0627\u062F\u0642** \u{1F37D}\uFE0F - \u20AC1,500 - \u20AC2,800
4. **\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A** \u{1F4BB} - \u20AC3,000 - \u20AC6,000
5. **\u0627\u0644\u062A\u0631\u062C\u0645\u0629 \u0648\u0627\u0644\u062A\u0639\u0644\u064A\u0645** \u{1F4DA} - \u20AC2,500 - \u20AC4,500

\u062A\u0641\u0636\u0644 \u0628\u0632\u064A\u0627\u0631\u0629 \u0642\u0633\u0645 \u0627\u0644\u0645\u0647\u0646 \u0641\u064A \u0645\u0648\u0642\u0639\u0646\u0627 \u0644\u0645\u0632\u064A\u062F \u0645\u0646 \u0627\u0644\u062A\u0641\u0627\u0635\u064A\u0644! \u{1F4CB}`;
  }
  if (msg.includes("\u0645\u0631\u062D\u0628\u0627") || msg.includes("\u0647\u0644\u0627") || msg.includes("\u0627\u0644\u0633\u0644\u0627\u0645") || msg.includes("\u0623\u0647\u0644\u0627")) {
    return `\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0648\u0631\u062D\u0645\u0629 \u0627\u0644\u0644\u0647 \u0648\u0628\u0631\u0643\u0627\u062A\u0647 \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F319}

\u0623\u0646\u0627 \u0633\u0646\u062F\u0628\u0627\u062F\u060C \u0645\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u0630\u0643\u064A \u0641\u064A \u064A\u0648\u0631\u0648 \u0639\u0631\u0628 \u0645\u0627\u0631\u0643\u062A. \u0639\u0646\u062F\u0643 ${wishesRemaining} \u0623\u0645\u0646\u064A\u0629 \u064A\u0648\u0645\u064A\u0627\u064B!

\u0627\u0643\u062A\u0628 \u0644\u064A \u0623\u064A \u0627\u0633\u062A\u0641\u0633\u0627\u0631 \u0639\u0646:
\u2022 \u{1F37D}\uFE0F \u0645\u0637\u0627\u0639\u0645 \u0639\u0631\u0628\u064A\u0629
\u2022 \u{1F6D2} \u0645\u062A\u0627\u062C\u0631 \u062D\u0644\u0627\u0644
\u2022 \u{1F488} \u0635\u0627\u0644\u0648\u0646\u0627\u062A \u062D\u0644\u0627\u0642\u0629
\u2022 \u{1F527} \u062E\u062F\u0645\u0627\u062A \u0648\u0645\u0647\u0646
\u2022 \u{1F4CD} \u0623\u0645\u0627\u0643\u0646 \u0648\u0639\u0646\u0627\u0648\u064A\u0646

\u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u064A\u0648\u0645\u061F \u2728`;
  }
  if (msg.includes("\u0639\u0646\u0648\u0627\u0646") || msg.includes("\u0645\u0648\u0642\u0639") || msg.includes("\u0645\u0643\u0627\u0646")) {
    return `\u0623\u0643\u064A\u062F \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F4CD}

\u0642\u0644 \u0644\u064A:
1. \u0641\u064A \u0623\u064A \u0645\u062F\u064A\u0646\u0629 \u0623\u0646\u062A\u061F
2. \u0634\u0648 \u062A\u062F\u0648\u0631 \u0628\u0627\u0644\u0636\u0628\u0637\u061F

\u0648\u0631\u0627\u062D \u0623\u0639\u0637\u064A\u0643 \u0627\u0644\u0639\u0646\u0627\u0648\u064A\u0646 \u0627\u0644\u062F\u0642\u064A\u0642\u0629! \u{1F5FA}\uFE0F`;
  }
  return `\u0634\u0643\u0631\u0627\u064B \u0644\u0633\u0624\u0627\u0644\u0643 \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u{1F31F}

\u0623\u0646\u0627 \u0633\u0646\u062F\u0628\u0627\u062F \u0647\u0646\u0627 \u0644\u0623\u0633\u0627\u0639\u062F\u0643 \u0641\u064A:
1. **\u0627\u0644\u0628\u062D\u062B \u0639\u0646 \u0645\u062A\u0627\u062C\u0631 \u0639\u0631\u0628\u064A\u0629**
2. **\u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0648\u0638\u0627\u0626\u0641**
3. **\u0627\u0644\u0639\u0646\u0627\u0648\u064A\u0646 \u0648\u0627\u0644\u0645\u0648\u0627\u0642\u0639**
4. **\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0627\u0645\u0629**

\u0639\u0646\u062F\u0643 ${wishesRemaining} \u0623\u0645\u0646\u064A\u0629 \u0645\u062A\u0628\u0642\u064A\u0629 \u0627\u0644\u064A\u0648\u0645! \u{1F9DE}\u200D\u2642\uFE0F

\u0643\u064A\u0641 \u0623\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643\u061F`;
}
var sindbadRouter = createRouter({
  // Send message to Sindbad
  chat: publicQuery.input(
    z4.object({
      message: z4.string().min(1),
      sessionId: z4.string().optional(),
      userId: z4.number().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const sessionId = input.sessionId || createSessionId(input.userId);
    await db.insert(chatMessages).values({
      userId: input.userId,
      sessionId,
      role: "user",
      content: input.message,
      createdAt: /* @__PURE__ */ new Date()
    });
    const wishesUsedToday = await db.select({ count: sql4`count(*)` }).from(chatMessages).where(
      and4(
        eq4(chatMessages.userId, input.userId || 0),
        eq4(chatMessages.role, "user"),
        sql4`DATE(${chatMessages.createdAt}) = DATE(NOW())`
      )
    );
    const wishesUsed = wishesUsedToday[0]?.count || 0;
    const wishesRemaining = Math.max(0, MAX_WISHES - wishesUsed);
    let response;
    let responseType = "general";
    if (wishesUsed >= MAX_WISHES && !input.userId) {
      response = `\u0639\u0630\u0631\u0627\u064B \u064A\u0627 \u0635\u062F\u064A\u0642\u064A! \u0644\u0642\u062F \u0627\u0633\u062A\u0646\u0641\u0630\u062A ${MAX_WISHES} \u0623\u0645\u0646\u064A\u0627\u062A\u0643 \u0644\u0647\u0630\u0627 \u0627\u0644\u064A\u0648\u0645. \u0633\u062C\u0644 \u062F\u062E\u0648\u0644 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0623\u0645\u0646\u064A\u0627\u062A \u063A\u064A\u0631 \u0645\u062D\u062F\u0648\u062F\u0629! \u{1F9DE}\u200D\u2642\uFE0F`;
    } else {
      const kimiApiKey = process.env.KIMI_API_KEY;
      if (kimiApiKey) {
        try {
          response = await callKimiAPI(input.message, kimiApiKey);
          responseType = "ai";
        } catch {
          response = getFallbackResponse(input.message, wishesRemaining);
        }
      } else {
        response = getFallbackResponse(input.message, wishesRemaining);
      }
    }
    await db.insert(chatMessages).values({
      userId: input.userId,
      sessionId,
      role: "assistant",
      content: response,
      wishesUsed: wishesUsed + 1,
      createdAt: /* @__PURE__ */ new Date()
    });
    return {
      response,
      responseType,
      sessionId,
      wishesUsed: wishesUsed + 1,
      wishesRemaining: Math.max(0, MAX_WISHES - wishesUsed - 1),
      maxWishes: MAX_WISHES
    };
  }),
  // Get chat history for a session
  history: publicQuery.input(z4.object({ sessionId: z4.string() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(chatMessages).where(eq4(chatMessages.sessionId, input.sessionId)).orderBy(chatMessages.createdAt);
  }),
  // Get user's daily wishes status
  wishesStatus: publicQuery.input(z4.object({ userId: z4.number().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    if (!input?.userId) {
      return {
        wishesUsed: 0,
        wishesRemaining: MAX_WISHES,
        maxWishes: MAX_WISHES,
        isUnlimited: false
      };
    }
    const wishesUsedToday = await db.select({ count: sql4`count(*)` }).from(chatMessages).where(
      and4(
        eq4(chatMessages.userId, input.userId),
        eq4(chatMessages.role, "user"),
        sql4`DATE(${chatMessages.createdAt}) = DATE(NOW())`
      )
    );
    const wishesUsed = wishesUsedToday[0]?.count || 0;
    return {
      wishesUsed,
      wishesRemaining: Math.max(0, MAX_WISHES - wishesUsed),
      maxWishes: MAX_WISHES,
      isUnlimited: wishesUsed >= MAX_WISHES ? false : true
    };
  })
});

// api/admin-router.ts
import { z as z5 } from "zod";
import { eq as eq5, and as and5, like as like4, or as or4, desc as desc4, sql as sql5 } from "drizzle-orm";
var adminRouter = createRouter({
  // Dashboard stats
  stats: adminQuery.query(async () => {
    const db = getDb();
    const [
      usersCount,
      merchantsCount,
      jobsCount,
      reviewsCount,
      pendingMerchants,
      openJobs,
      todaySearches
    ] = await Promise.all([
      db.select({ count: sql5`count(*)` }).from(users),
      db.select({ count: sql5`count(*)` }).from(merchants),
      db.select({ count: sql5`count(*)` }).from(jobs),
      db.select({ count: sql5`count(*)` }).from(reviews),
      db.select({ count: sql5`count(*)` }).from(merchants).where(eq5(merchants.status, "pending")),
      db.select({ count: sql5`count(*)` }).from(jobs).where(eq5(jobs.status, "open")),
      db.select({ count: sql5`count(*)` }).from(searchLogs).where(sql5`DATE(${searchLogs.createdAt}) = DATE(NOW())`)
    ]);
    return {
      users: usersCount[0]?.count || 0,
      merchants: merchantsCount[0]?.count || 0,
      jobs: jobsCount[0]?.count || 0,
      reviews: reviewsCount[0]?.count || 0,
      pendingMerchants: pendingMerchants[0]?.count || 0,
      openJobs: openJobs[0]?.count || 0,
      todaySearches: todaySearches[0]?.count || 0
    };
  }),
  // List all merchants (admin view with pending)
  merchants: adminQuery.input(
    z5.object({
      status: z5.string().optional(),
      search: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq5(merchants.status, input.status));
    }
    if (input?.search) {
      const term = `%${input.search}%`;
      conditions.push(
        or4(
          like4(merchants.businessName, term),
          like4(merchants.businessNameAr, term),
          like4(merchants.email, term)
        )
      );
    }
    const where = conditions.length > 0 ? and5(...conditions) : void 0;
    const [items, totalResult] = await Promise.all([
      db.select().from(merchants).where(where).limit(input?.limit || 50).offset(input?.offset || 0).orderBy(desc4(merchants.createdAt)),
      db.select({ count: sql5`count(*)` }).from(merchants).where(where)
    ]);
    return { items, total: totalResult[0]?.count || 0 };
  }),
  // Update merchant status
  updateMerchantStatus: adminQuery.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["pending", "active", "suspended", "rejected"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(merchants).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(merchants.id, input.id));
    return { success: true };
  }),
  // Delete merchant
  deleteMerchant: adminQuery.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(merchants).where(eq5(merchants.id, input.id));
    return { success: true };
  }),
  // List all jobs (admin view)
  jobs: adminQuery.input(
    z5.object({
      status: z5.string().optional(),
      search: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq5(jobs.status, input.status));
    }
    if (input?.search) {
      const term = `%${input.search}%`;
      conditions.push(
        or4(
          like4(jobs.title, term),
          like4(jobs.titleAr, term),
          like4(jobs.description, term)
        )
      );
    }
    const where = conditions.length > 0 ? and5(...conditions) : void 0;
    const [items, totalResult] = await Promise.all([
      db.select().from(jobs).where(where).limit(input?.limit || 50).offset(input?.offset || 0).orderBy(desc4(jobs.createdAt)),
      db.select({ count: sql5`count(*)` }).from(jobs).where(where)
    ]);
    return { items, total: totalResult[0]?.count || 0 };
  }),
  // Update job status
  updateJobStatus: adminQuery.input(
    z5.object({
      id: z5.number(),
      status: z5.enum(["open", "closed", "filled", "paused"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(jobs).set({ status: input.status, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(jobs.id, input.id));
    return { success: true };
  }),
  // Delete job
  deleteJob: adminQuery.input(z5.object({ id: z5.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.delete(jobs).where(eq5(jobs.id, input.id));
    return { success: true };
  }),
  // Get all users
  users: adminQuery.input(
    z5.object({
      search: z5.string().optional(),
      role: z5.string().optional(),
      limit: z5.number().default(50),
      offset: z5.number().default(0)
    }).optional()
  ).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.role) {
      conditions.push(eq5(users.role, input.role));
    }
    if (input?.search) {
      const term = `%${input.search}%`;
      conditions.push(
        or4(like4(users.name, term), like4(users.email, term))
      );
    }
    const where = conditions.length > 0 ? and5(...conditions) : void 0;
    const [items, totalResult] = await Promise.all([
      db.select().from(users).where(where).limit(input?.limit || 50).offset(input?.offset || 0).orderBy(desc4(users.createdAt)),
      db.select({ count: sql5`count(*)` }).from(users).where(where)
    ]);
    return { items, total: totalResult[0]?.count || 0 };
  }),
  // Update user role
  updateUserRole: adminQuery.input(
    z5.object({
      id: z5.number(),
      role: z5.enum(["user", "admin"])
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(users).set({ role: input.role, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(users.id, input.id));
    return { success: true };
  }),
  // Get recent activity
  recentActivity: adminQuery.query(async () => {
    const db = getDb();
    const [recentMerchants, recentJobs, recentUsers, recentReviews] = await Promise.all([
      db.select().from(merchants).orderBy(desc4(merchants.createdAt)).limit(5),
      db.select().from(jobs).orderBy(desc4(jobs.createdAt)).limit(5),
      db.select().from(users).orderBy(desc4(users.createdAt)).limit(5),
      db.select().from(reviews).orderBy(desc4(reviews.createdAt)).limit(5)
    ]);
    return {
      merchants: recentMerchants,
      jobs: recentJobs,
      users: recentUsers,
      reviews: recentReviews
    };
  }),
  // Update merchant (full edit)
  updateMerchant: adminQuery.input(
    z5.object({
      id: z5.number(),
      businessName: z5.string().optional(),
      businessNameAr: z5.string().optional(),
      shortDescription: z5.string().optional(),
      description: z5.string().optional(),
      descriptionAr: z5.string().optional(),
      category: z5.string().optional(),
      subcategory: z5.string().optional(),
      country: z5.string().optional(),
      city: z5.string().optional(),
      address: z5.string().optional(),
      addressAr: z5.string().optional(),
      neighborhood: z5.string().optional(),
      postalCode: z5.string().optional(),
      phone: z5.string().optional(),
      whatsapp: z5.string().optional(),
      email: z5.string().optional(),
      website: z5.string().optional(),
      facebookUrl: z5.string().optional(),
      instagramUrl: z5.string().optional(),
      youtubeUrl: z5.string().optional(),
      latitude: z5.string().optional(),
      longitude: z5.string().optional(),
      googleMapsUrl: z5.string().optional(),
      priceRange: z5.string().optional(),
      isFeatured: z5.boolean().optional(),
      acceptsCash: z5.boolean().optional(),
      acceptsCard: z5.boolean().optional(),
      isOpen24Hours: z5.boolean().optional(),
      logo: z5.string().optional(),
      coverImage: z5.string().optional(),
      galleryImages: z5.any().optional(),
      amenities: z5.any().optional(),
      features: z5.any().optional(),
      tags: z5.string().optional(),
      metaTitle: z5.string().optional(),
      metaDescription: z5.string().optional()
    })
  ).mutation(async ({ input }) => {
    const { id, ...data } = input;
    const db = getDb();
    await db.update(merchants).set({ ...data, updatedAt: /* @__PURE__ */ new Date() }).where(eq5(merchants.id, id));
    return { success: true };
  }),
  // Get search analytics
  searchAnalytics: adminQuery.query(async () => {
    const db = getDb();
    const popularSearches = await db.select({
      query: searchLogs.query,
      count: sql5`count(*)`
    }).from(searchLogs).groupBy(searchLogs.query).orderBy(desc4(sql5`count(*)`)).limit(20);
    const searchesByDay = await db.select({
      date: sql5`DATE(${searchLogs.createdAt})`,
      count: sql5`count(*)`
    }).from(searchLogs).where(sql5`${searchLogs.createdAt} > DATE_SUB(NOW(), INTERVAL 30 DAY)`).groupBy(sql5`DATE(${searchLogs.createdAt})`).orderBy(sql5`DATE(${searchLogs.createdAt})`);
    return { popularSearches, searchesByDay };
  })
});

// api/admin-auth-router.ts
import { z as z6 } from "zod";
import * as jose from "jose";
var JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || "euro-arab-market-admin-secret-key-2024"
);
var adminAuthRouter = createRouter({
  // Login with username/password
  login: publicQuery.input(
    z6.object({
      username: z6.string().min(1),
      password: z6.string().min(1)
    })
  ).mutation(async ({ input }) => {
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EuroArab2024!";
    if (input.username !== ADMIN_USERNAME || input.password !== ADMIN_PASSWORD) {
      throw new Error("Invalid credentials");
    }
    const token = await new jose.SignJWT({
      username: input.username,
      role: "admin"
    }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").sign(JWT_SECRET);
    return { token, username: input.username };
  }),
  // Verify token
  verify: publicQuery.input(z6.object({ token: z6.string() })).query(async ({ input }) => {
    try {
      const { payload } = await jose.jwtVerify(input.token, JWT_SECRET, {
        clockTolerance: 60
      });
      return { valid: true, username: payload.username };
    } catch {
      return { valid: false, username: "" };
    }
  })
});

// api/subscription-router.ts
import { z as z7 } from "zod";
import { eq as eq6, and as and6, desc as desc5 } from "drizzle-orm";
var subscriptionRouter = createRouter({
  // Create subscription
  create: publicQuery.input(
    z7.object({
      userId: z7.number(),
      merchantId: z7.number(),
      plan: z7.enum(["basic", "premium", "featured"]).default("basic"),
      billingCycle: z7.enum(["monthly", "yearly"]).default("monthly"),
      price: z7.string(),
      paymentMethod: z7.string().optional(),
      paymentId: z7.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const now = /* @__PURE__ */ new Date();
    const expiresAt = new Date(now);
    if (input.billingCycle === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }
    const result = await db.insert(subscriptions).values({
      ...input,
      status: "active",
      expiresAt,
      createdAt: now,
      updatedAt: now
    }).returning({ id: subscriptions.id });
    return result[0];
  }),
  // Get merchant subscription
  getByMerchant: publicQuery.input(z7.object({ merchantId: z7.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(subscriptions).where(eq6(subscriptions.merchantId, input.merchantId)).orderBy(desc5(subscriptions.createdAt)).limit(1);
  }),
  // Check if subscription is active
  checkStatus: publicQuery.input(z7.object({ merchantId: z7.number() })).query(async ({ input }) => {
    const db = getDb();
    const sub = await db.select().from(subscriptions).where(
      and6(
        eq6(subscriptions.merchantId, input.merchantId),
        eq6(subscriptions.status, "active")
      )
    ).orderBy(desc5(subscriptions.createdAt)).limit(1);
    if (!sub[0]) return { isActive: false, plan: null, expiresAt: null };
    const now = /* @__PURE__ */ new Date();
    const isActive = sub[0].status === "active" && new Date(sub[0].expiresAt) > now;
    return {
      isActive,
      plan: sub[0].plan,
      expiresAt: sub[0].expiresAt,
      status: isActive ? sub[0].status : "expired"
    };
  }),
  // Cancel subscription
  cancel: publicQuery.input(z7.object({ id: z7.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(subscriptions).set({ status: "cancelled", cancelledAt: /* @__PURE__ */ new Date(), updatedAt: /* @__PURE__ */ new Date() }).where(eq6(subscriptions.id, input.id));
    return { success: true };
  }),
  // List all subscriptions (admin)
  list: publicQuery.input(z7.object({ status: z7.string().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq6(subscriptions.status, input.status));
    }
    return db.select().from(subscriptions).where(conditions.length > 0 ? and6(...conditions) : void 0).orderBy(desc5(subscriptions.createdAt));
  })
});

// api/claim-router.ts
import { z as z8 } from "zod";
import { eq as eq7, and as and7, desc as desc6 } from "drizzle-orm";
var claimRouter = createRouter({
  // Submit claim request
  create: publicQuery.input(
    z8.object({
      userId: z8.number(),
      merchantId: z8.number(),
      fullName: z8.string().min(1),
      email: z8.string().email(),
      phone: z8.string().optional(),
      proofDocument: z8.string().optional(),
      businessRegistration: z8.string().optional(),
      message: z8.string().optional()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    const existing = await db.select().from(claims).where(
      and7(
        eq7(claims.merchantId, input.merchantId),
        eq7(claims.status, "pending")
      )
    ).limit(1);
    if (existing[0]) {
      throw new Error("There is already a pending claim for this business");
    }
    const result = await db.insert(claims).values({
      ...input,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    }).returning({ id: claims.id });
    return result[0];
  }),
  // Get claims by merchant
  getByMerchant: publicQuery.input(z8.object({ merchantId: z8.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.select().from(claims).where(eq7(claims.merchantId, input.merchantId)).orderBy(desc6(claims.createdAt));
  }),
  // Approve claim (admin)
  approve: publicQuery.input(
    z8.object({
      id: z8.number(),
      reviewedBy: z8.number()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(claims).set({
      status: "approved",
      reviewedBy: input.reviewedBy,
      reviewedAt: /* @__PURE__ */ new Date()
    }).where(eq7(claims.id, input.id));
    const claim = await db.select().from(claims).where(eq7(claims.id, input.id)).limit(1);
    if (claim[0]) {
      await db.update(merchants).set({
        status: "claimed",
        claimedBy: claim[0].userId,
        claimedAt: /* @__PURE__ */ new Date()
      }).where(eq7(merchants.id, claim[0].merchantId));
    }
    return { success: true };
  }),
  // Reject claim (admin)
  reject: publicQuery.input(
    z8.object({
      id: z8.number(),
      reviewedBy: z8.number(),
      rejectionReason: z8.string()
    })
  ).mutation(async ({ input }) => {
    const db = getDb();
    await db.update(claims).set({
      status: "rejected",
      reviewedBy: input.reviewedBy,
      reviewedAt: /* @__PURE__ */ new Date(),
      rejectionReason: input.rejectionReason
    }).where(eq7(claims.id, input.id));
    return { success: true };
  }),
  // List all claims (admin)
  list: publicQuery.input(z8.object({ status: z8.string().optional() }).optional()).query(async ({ input }) => {
    const db = getDb();
    const conditions = [];
    if (input?.status) {
      conditions.push(eq7(claims.status, input.status));
    }
    return db.select().from(claims).where(conditions.length > 0 ? and7(...conditions) : void 0).orderBy(desc6(claims.createdAt));
  })
});

// api/seed-router.ts
import { sql as sql6 } from "drizzle-orm";
var merchantsData = [
  { businessName: "Al Ajami Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0642\u0644\u0628 \u0628\u0627\u0631\u064A\u0633", description: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0639\u062C\u0645\u064A \u0647\u0648 \u0648\u0627\u062D\u062F \u0645\u0646 \u0623\u0634\u0647\u0631 \u0627\u0644\u0645\u0637\u0627\u0639\u0645 \u0627\u0644\u0633\u0648\u0631\u064A\u0629 \u0641\u064A \u0628\u0627\u0631\u064A\u0633.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "3 Rue du Faubourg Montmartre, 75009 Paris", phone: "+33 1 42 46 04 38", email: "contact@alajami.fr", priceRange: "$$", rating: "4.7", tags: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A, \u0628\u0627\u0631\u064A\u0633, \u062D\u0644\u0627\u0644, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Bakdash Ice Cream", businessNameAr: "\u0628\u0643\u062F\u0627\u0634 - \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A", shortDescription: "\u0623\u0634\u0647\u0631 \u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0627\u0631\u064A\u0633", description: "\u0628\u0643\u062F\u0627\u0634 \u064A\u0642\u062F\u0645 \u0627\u0644\u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u0627\u0644\u062D\u0644\u0628\u064A \u0627\u0644\u0623\u0635\u064A\u0644.", category: "sweets", subcategory: "\u0622\u064A\u0633 \u0643\u0631\u064A\u0645 \u062D\u0644\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "12 Rue des Rosiers, 75004 Paris", phone: "+33 1 42 72 91 42", email: "info@bakdash.fr", priceRange: "$", rating: "4.8", tags: "\u0622\u064A\u0633 \u0643\u0631\u064A\u0645, \u062D\u0644\u0628\u064A, \u0641\u0633\u062A\u0642", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Barber Shop", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u0644\u0644\u062D\u0644\u0627\u0642\u0629", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631", description: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0627\u0644\u0631\u062C\u0627\u0644\u064A.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0631\u062C\u0627\u0644\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "8 Rue du Faubourg Saint-Denis, 75010 Paris", phone: "+33 1 42 38 59 27", priceRange: "$$", rating: "4.6", tags: "\u062D\u0644\u0627\u0642\u0629, \u0635\u0627\u0644\u0648\u0646, \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Bazar du Monde Arabe", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0639\u0627\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644 \u0641\u064A \u0628\u0627\u0631\u064A\u0633", description: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "45 Rue de Belleville, 75020 Paris", phone: "+33 1 43 58 42 61", email: "bazar@monde-arabe.fr", priceRange: "$$", rating: "4.4", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0645\u0646\u062A\u062C\u0627\u062A \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "La Mosquee de Paris Cafe", businessNameAr: "\u0645\u0642\u0647\u0649 \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u062A\u0642\u0644\u064A\u062F\u064A \u0641\u064A \u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0643\u0628\u064A\u0631", description: "\u0645\u0642\u0647\u0649 \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0628\u0627\u0644\u0646\u0639\u0646\u0627\u0639 \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u062A\u0642\u0644\u064A\u062F\u064A\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "39 Rue Geoffroy-Saint-Hilaire, 75005 Paris", phone: "+33 1 43 31 18 14", priceRange: "$", rating: "4.7", tags: "\u0645\u0642\u0647\u0649, \u0634\u0627\u064A \u0645\u063A\u0631\u0628\u064A, \u062D\u0644\u0648\u064A\u0627\u062A, \u062C\u0627\u0645\u0639 \u0628\u0627\u0631\u064A\u0633", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Damaskus Restaurant Berlin", businessNameAr: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642 - \u0628\u0631\u0644\u064A\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0642\u0644\u0628 \u0628\u0631\u0644\u064A\u0646", description: "\u0645\u0637\u0639\u0645 \u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u062F\u0645\u0634\u0642\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062F\u0645\u0634\u0642\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnenallee 87, 12045 Berlin", phone: "+49 30 623 72 14", email: "info@damaskus-berlin.de", priceRange: "$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A, \u0628\u0631\u0644\u064A\u0646, \u062F\u0645\u0634\u0642\u064A, \u0645\u0646\u0633\u0641", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Babylon Supermarkt", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0628\u0627\u0628\u0644", shortDescription: "\u0643\u0644 \u0645\u0627 \u064A\u062D\u062A\u0627\u062C\u0647 \u0627\u0644\u0639\u0631\u0628 \u0641\u064A \u0628\u0631\u0644\u064A\u0646", description: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0644\u064A\u0646", address: "Sonnenallee 120, 12045 Berlin", phone: "+49 30 624 89 33", priceRange: "$$", rating: "4.4", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0639\u0631\u0628\u064A, \u0628\u0631\u0644\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Levant Restaurant London", businessNameAr: "\u0645\u0637\u0639\u0645 \u0628\u0644\u0627\u062F \u0627\u0644\u0634\u0627\u0645 - \u0644\u0646\u062F\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A \u0631\u0627\u0642\u064A \u0641\u064A \u0642\u0644\u0628 \u0644\u0646\u062F\u0646", description: "\u064A\u0642\u062F\u0645 \u062A\u062C\u0631\u0628\u0629 \u0637\u0639\u0627\u0645 \u0634\u0627\u0645\u064A\u0629 \u0641\u0627\u062E\u0631\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A \u0641\u0627\u062E\u0631", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "76-77 London Wall, London EC2M 5NX", phone: "+44 20 7256 1122", email: "info@levant-london.co.uk", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u0644\u0646\u062F\u0646, \u0641\u0627\u062E\u0631, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Edgware Road Halal Butcher", businessNameAr: "\u062C\u0632\u0627\u0631 \u0627\u0644\u0637\u0631\u064A\u0642 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 Edgware Road", description: "\u0645\u062A\u062C\u0631 \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629 \u064A\u0648\u0645\u064A\u0627\u064B.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "142 Edgware Road, London W2 2DZ", phone: "+44 20 7723 8765", priceRange: "$$", rating: "4.5", tags: "\u062C\u0632\u0627\u0631, \u062D\u0644\u0627\u0644, \u0644\u062D\u0645, \u062F\u0648\u0627\u062C\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "The Arabica Lounge", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0623\u0631\u0627\u0628\u064A\u0643\u0627", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A \u0644\u0644\u0634\u064A\u0634\u0629 \u0641\u064A \u0644\u0646\u062F\u0646", description: "\u0644\u0627\u0648\u0646\u062C \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0628\u0646\u0643\u0647\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "35 Maida Vale, London W9 1RS", phone: "+44 20 7286 5492", priceRange: "$$", rating: "4.3", tags: "\u0634\u064A\u0634\u0629, \u0645\u0642\u0647\u0649, \u0639\u0631\u0628\u064A, \u0644\u0646\u062F\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Souk Amsterdam", businessNameAr: "\u0633\u0648\u0642 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u0641\u064A \u0648\u0633\u0637 \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u062C\u0645\u0639 \u0628\u064A\u0646 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0637\u0628\u062E \u0627\u0644\u0623\u0648\u0631\u0648\u0628\u064A.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", address: "Utrechtsestraat 65, 1017 VJ Amsterdam", phone: "+31 20 624 52 19", email: "hello@soukamsterdam.nl", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A, \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645, \u0645\u0642\u0647\u0649", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Iman Halal Market", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0625\u064A\u0645\u0627\u0646 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0648\u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u0642\u062F\u0645 \u0645\u0646\u062A\u062C\u0627\u062A \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629\u060C \u062A\u0645\u0648\u0631\u060C \u0632\u064A\u062A \u0632\u064A\u062A\u0648\u0646\u060C \u0628\u0647\u0627\u0631\u0627\u062A.", category: "supermarket", subcategory: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645", address: "Bos en Lommerweg 126, 1055 ED Amsterdam", phone: "+31 20 684 83 21", priceRange: "$$", rating: "4.3", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0623\u0645\u0633\u062A\u0631\u062F\u0627\u0645, \u0628\u0642\u0627\u0644\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Le Sahara Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 - \u0628\u0631\u0648\u0643\u0633\u0644", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u062C\u0632\u0627\u0626\u0631\u064A \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u063A\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062C\u0632\u0627\u0626\u0631\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0645\u0646 \u0627\u0644\u0643\u0633\u0643\u0633\u060C \u0627\u0644\u0637\u0627\u062C\u064A\u0646.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u062C\u0632\u0627\u0626\u0631\u064A", country: "\u0628\u0644\u062C\u064A\u0643\u0627", city: "\u0628\u0631\u0648\u0643\u0633\u0644", address: "Chaussee d'Ixelles 112, 1050 Ixelles", phone: "+32 2 512 43 68", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A, \u0628\u0631\u0648\u0643\u0633\u0644, \u0643\u0633\u0643\u0633, \u0637\u0627\u062C\u064A\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Baklava Palace Brussels", businessNameAr: "\u0642\u0635\u0631 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 - \u0628\u0631\u0648\u0643\u0633\u0644", shortDescription: "\u062D\u0644\u0648\u064A\u0627\u062A \u062A\u0631\u0643\u064A\u0629 \u0648\u0639\u0631\u0628\u064A\u0629 \u0641\u0627\u062E\u0631\u0629", description: "\u0623\u0641\u0636\u0644 \u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 \u0627\u0644\u062A\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0641\u0627\u062E\u0631\u0629.", category: "sweets", subcategory: "\u062D\u0644\u0648\u064A\u0627\u062A \u062A\u0631\u0643\u064A\u0629", country: "\u0628\u0644\u062C\u064A\u0643\u0627", city: "\u0628\u0631\u0648\u0643\u0633\u0644", address: "Rue du Marche aux Herbes 78, 1000 Bruxelles", phone: "+32 2 217 09 83", priceRange: "$$", rating: "4.7", tags: "\u0628\u0642\u0644\u0627\u0648\u0629, \u062D\u0644\u0648\u064A\u0627\u062A, \u062A\u0631\u0643\u064A\u0629, \u0628\u0631\u0648\u0643\u0633\u0644", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Oriental Vienna", businessNameAr: "\u0627\u0644\u0634\u0631\u0642\u064A - \u0641\u064A\u064A\u0646\u0627", shortDescription: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0639\u0631\u0627\u0642\u064A \u0641\u064A \u0641\u064A\u064A\u0646\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0639\u0631\u0627\u0642\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0645\u0646 \u0627\u0644\u062A\u0645\u0646 \u0648\u0627\u0644\u0645\u0642\u0644\u0648\u0628\u0629 \u0648\u0627\u0644\u0643\u0628\u0627\u0628.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0627\u0642\u064A", country: "\u0627\u0644\u0646\u0645\u0633\u0627", city: "\u0641\u064A\u064A\u0646\u0627", address: "Praterstrasse 42, 1020 Wien", phone: "+43 1 214 22 87", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0627\u0642\u064A, \u0641\u064A\u064A\u0646\u0627, \u0643\u0628\u0627\u0628, \u062A\u0645\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sahara Hookah Lounge Vienna", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0635\u062D\u0631\u0627\u0621 - \u0641\u064A\u064A\u0646\u0627", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A \u0641\u064A \u0641\u064A\u064A\u0646\u0627", description: "\u0623\u062C\u0648\u0627\u0621 \u0639\u0631\u0628\u064A\u0629 \u0623\u0635\u064A\u0644\u0629 \u0645\u0639 \u0627\u0644\u0634\u064A\u0634\u0629 \u0648\u0627\u0644\u0634\u0627\u064A \u0648\u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0646\u0645\u0633\u0627", city: "\u0641\u064A\u064A\u0646\u0627", address: "Mariahilfer Strasse 89, 1060 Wien", phone: "+43 1 597 63 42", priceRange: "$$", rating: "4.3", tags: "\u0634\u064A\u0634\u0629, \u0641\u064A\u064A\u0646\u0627, \u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "El Oasis Halal Madrid", businessNameAr: "\u0627\u0644\u0648\u0627\u062D\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0645\u062F\u0631\u064A\u062F", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0645\u0642\u0647\u0649 \u062D\u0644\u0627\u0644 \u0641\u064A \u0642\u0644\u0628 \u0645\u062F\u0631\u064A\u062F", description: "\u064A\u0642\u062F\u0645 \u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0639\u0631\u0628\u064A\u0629 \u0625\u0633\u0628\u0627\u0646\u064A\u0629 \u0645\u062F\u0645\u062C\u0629 \u0628\u0625\u0634\u0631\u0627\u0641 \u062D\u0644\u0627\u0644 \u0643\u0627\u0645\u0644.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0625\u0633\u0628\u0627\u0646\u064A", country: "\u0625\u0633\u0628\u0627\u0646\u064A\u0627", city: "\u0645\u062F\u0631\u064A\u062F", address: "Calle de Fuencarral 127, 28010 Madrid", phone: "+34 915 32 76 45", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644, \u0645\u062F\u0631\u064A\u062F, \u0639\u0631\u0628\u064A \u0625\u0633\u0628\u0627\u0646\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Mezquita Central Halal Market", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0645\u0633\u062C\u062F \u0627\u0644\u0645\u0631\u0643\u0632\u064A \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0628\u0627\u0644\u0642\u0631\u0628 \u0645\u0646 \u0645\u0633\u062C\u062F \u0645\u062F\u0631\u064A\u062F", description: "\u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "supermarket", subcategory: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", country: "\u0625\u0633\u0628\u0627\u0646\u064A\u0627", city: "\u0645\u062F\u0631\u064A\u062F", address: "Calle de Alcala 480, 28027 Madrid", phone: "+34 913 67 22 81", priceRange: "$$", rating: "4.2", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u062D\u0644\u0627\u0644, \u0645\u062F\u0631\u064A\u062F, \u0645\u0633\u062C\u062F", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Restaurant Roma", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0633\u0644\u0637\u0627\u0646 - \u0631\u0648\u0645\u0627", shortDescription: "\u0645\u0637\u0639\u0645 \u062A\u0631\u0643\u064A \u0639\u0631\u0628\u064A \u0641\u064A \u0631\u0648\u0645\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0645\u0646 \u0627\u0644\u0643\u0628\u0627\u0628 \u0627\u0644\u062A\u0631\u0643\u064A \u0648\u0627\u0644\u0645\u0627\u0632\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062A\u0631\u0643\u064A \u0639\u0631\u0628\u064A", country: "\u0625\u064A\u0637\u0627\u0644\u064A\u0627", city: "\u0631\u0648\u0645\u0627", address: "Via Merulana 251, 00185 Roma", phone: "+39 06 770 99 182", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u062A\u0631\u0643\u064A, \u0631\u0648\u0645\u0627, \u0643\u0628\u0627\u0628, \u062D\u0644\u0627\u0644", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Oriental Bakery Stockholm", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0634\u0631\u0642 - \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", shortDescription: "\u0645\u062E\u0628\u0632 \u0648\u062D\u0644\u0648\u064A\u0627\u062A \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0637\u0627\u0632\u062C \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0642\u064A\u0629.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0648\u062D\u0644\u0648\u064A\u0627\u062A \u0639\u0631\u0628\u064A\u0629", country: "\u0627\u0644\u0633\u0648\u064A\u062F", city: "\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", address: "Odengatan 78, 113 22 Stockholm", phone: "+46 8 30 18 42", priceRange: "$", rating: "4.5", tags: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645, \u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0631\u0642\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Dar Restaurant Geneva", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u062F\u0627\u0631 - \u062C\u0646\u064A\u0641", shortDescription: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0634\u0627\u0645\u064A \u0641\u064A \u062C\u0646\u064A\u0641", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0633\u062E\u0646 \u0627\u0644\u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0648\u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0634\u0627\u0645\u064A", country: "\u0633\u0648\u064A\u0633\u0631\u0627", city: "\u062C\u0646\u064A\u0641", address: "Rue de Lausanne 48, 1202 Geneve", phone: "+41 22 731 77 93", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0633\u0637\u064A\u0646\u064A, \u062C\u0646\u064A\u0641, \u0645\u0633\u062E\u0646, \u0634\u0627\u0645\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Casablanca Cafe Paris", businessNameAr: "\u0645\u0642\u0647\u0649 \u0627\u0644\u062F\u0627\u0631 \u0627\u0644\u0628\u064A\u0636\u0627\u0621 - \u0628\u0627\u0631\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0628\u0627\u0644\u0646\u0639\u0646\u0627\u0639", description: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A \u0623\u0635\u064A\u0644 \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0628\u0627\u0631\u064A\u0633", address: "18 Rue de la Huchette, 75005 Paris", phone: "+33 1 43 29 47 82", priceRange: "$", rating: "4.4", tags: "\u0645\u0642\u0647\u0649 \u0645\u063A\u0631\u0628\u064A, \u0628\u0627\u0631\u064A\u0633, \u0634\u0627\u064A, \u062D\u0644\u0648\u064A\u0627\u062A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Arabian Nights London", businessNameAr: "\u0644\u064A\u0627\u0644\u064A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 - \u0644\u0646\u062F\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631 \u0641\u064A Mayfair", description: "\u062A\u062C\u0631\u0628\u0629 \u0637\u0639\u0627\u0645 \u0639\u0631\u0628\u064A\u0629 \u0641\u0627\u062E\u0631\u0629 \u0641\u064A \u0623\u0631\u0642\u0649 \u0645\u0646\u0627\u0637\u0642 \u0644\u0646\u062F\u0646.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u0627\u062E\u0631", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "34 Curzon Street, London W1J 7TN", phone: "+44 20 7491 3832", priceRange: "$$$$", rating: "4.8", tags: "\u0645\u0637\u0639\u0645 \u0641\u0627\u062E\u0631, \u0644\u0646\u062F\u0646, Mayfair, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Al-Baraka Travel Hamburg", businessNameAr: "\u0633\u0641\u0631 \u0627\u0644\u0628\u0631\u0643\u0629 - \u0647\u0627\u0645\u0628\u0648\u0631\u063A", shortDescription: "\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631 \u0639\u0631\u0628\u064A\u0629 \u0641\u064A \u0647\u0627\u0645\u0628\u0648\u0631\u063A", description: "\u062A\u0646\u0638\u0645 \u0631\u062D\u0644\u0627\u062A \u0627\u0644\u062D\u062C \u0648\u0627\u0644\u0639\u0645\u0631\u0629 \u0648\u0627\u0644\u0633\u064A\u0627\u062D\u0629 \u0644\u0644\u0639\u0631\u0628.", category: "travel_agency", subcategory: "\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0647\u0627\u0645\u0628\u0648\u0631\u063A", address: "Steindamm 52, 20099 Hamburg", phone: "+49 40 284 12 39", priceRange: "$$$", rating: "4.3", tags: "\u0648\u0643\u0627\u0644\u0629 \u0633\u0641\u0631, \u062D\u062C, \u0639\u0645\u0631\u0629, \u0647\u0627\u0645\u0628\u0648\u0631\u063A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Halal Barber Munich", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0645\u064A\u0648\u0646\u062E", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0644\u0644\u0631\u062C\u0627\u0644 \u0641\u064A \u0645\u064A\u0648\u0646\u062E", description: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A\u0647 \u0644\u0644\u0631\u062C\u0627\u0644 \u0648\u0627\u0644\u0623\u0637\u0641\u0627\u0644.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0645\u064A\u0648\u0646\u062E", address: "Schwanthalerstrasse 155, 80339 Munchen", phone: "+49 89 545 32 18", priceRange: "$$", rating: "4.4", tags: "\u062D\u0644\u0627\u0642\u0629, \u0645\u064A\u0648\u0646\u062E, \u0635\u0627\u0644\u0648\u0646 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Falafel King Rotterdam", businessNameAr: "\u0645\u0644\u0643 \u0627\u0644\u0641\u0644\u0627\u0641\u0644 - \u0631\u0648\u062A\u0631\u062F\u0627\u0645", shortDescription: "\u0623\u0641\u0636\u0644 \u0641\u0644\u0627\u0641\u0644 \u0641\u064A \u0631\u0648\u062A\u0631\u062F\u0627\u0645", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0641\u0644\u0627\u0641\u0644 \u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0623\u0635\u064A\u0644 \u0648\u0627\u0644\u0634\u0627\u0648\u0631\u0645\u0627 \u0648\u0627\u0644\u062D\u0645\u0635.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0641\u0644\u0627\u0641\u0644", country: "\u0647\u0648\u0644\u0646\u062F\u0627", city: "\u0631\u0648\u062A\u0631\u062F\u0627\u0645", address: "Kruiskade 125, 3012 DE Rotterdam", phone: "+31 10 214 78 56", priceRange: "$", rating: "4.6", tags: "\u0641\u0644\u0627\u0641\u0644, \u0631\u0648\u062A\u0631\u062F\u0627\u0645, \u0634\u0627\u0648\u0631\u0645\u0627, \u062D\u0645\u0635", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Falah Mosque", businessNameAr: "\u0645\u0633\u062C\u062F \u0627\u0644\u0641\u0644\u0627\u062D - \u0628\u0631\u0648\u0643\u0633\u0644", shortDescription: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A \u0641\u064A \u0628\u0631\u0648\u0643\u0633\u0644", description: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0645\u062C\u062A\u0645\u0639\u064A \u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629.", category: "mosque", subcategory: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A", country: "\u0628\u0644\u062C\u064A\u0643\u0627", city: "\u0628\u0631\u0648\u0643\u0633\u0644", address: "Rue du Progres 323, 1030 Schaerbeek", phone: "+32 2 215 88 44", priceRange: "free", rating: "4.7", tags: "\u0645\u0633\u062C\u062F, \u0628\u0631\u0648\u0643\u0633\u0644, \u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A, \u0635\u0644\u0627\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Zaytouna Halal Butcher Lyon", businessNameAr: "\u062C\u0632\u0627\u0631 \u0627\u0644\u0632\u064A\u062A\u0648\u0646\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0644\u064A\u0648\u0646", shortDescription: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644 \u0641\u064A \u0644\u064A\u0648\u0646", description: "\u064A\u0642\u062F\u0645 \u0644\u062D\u0648\u0645 \u062D\u0644\u0627\u0644 \u0637\u0627\u0632\u062C\u0629 \u0645\u0646 \u0644\u062D\u0645 \u063A\u0646\u0645 \u0648\u0639\u062C\u0644 \u0648\u062F\u0648\u0627\u062C\u0646.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0644\u064A\u0648\u0646", address: "Rue Moncey 17, 69002 Lyon", phone: "+33 4 78 42 19 37", priceRange: "$$", rating: "4.3", tags: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644, \u0644\u064A\u0648\u0646, \u0644\u062D\u0645, \u062F\u0648\u0627\u062C\u0646", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Nour Bakery Copenhagen", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0646\u0648\u0631 - \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", shortDescription: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A \u0641\u064A \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0648\u0627\u0644\u0643\u0646\u0627\u0641\u0629 \u0648\u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u062F\u0646\u0645\u0627\u0631\u0643", city: "\u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", address: "Norrebrogade 78, 2200 Kobenhavn", phone: "+45 35 24 18 92", priceRange: "$", rating: "4.4", tags: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646, \u062D\u0644\u0648\u064A\u0627\u062A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sham Palace Dublin", businessNameAr: "\u0642\u0635\u0631 \u0627\u0644\u0634\u0627\u0645 - \u062F\u0628\u0644\u0646", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0634\u0627\u0645\u064A \u0641\u064A \u062F\u0628\u0644\u0646", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629 \u0641\u064A \u0642\u0644\u0628 \u062F\u0628\u0644\u0646.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A", country: "\u0623\u064A\u0631\u0644\u0646\u062F\u0627", city: "\u062F\u0628\u0644\u0646", address: "Capel Street 143, Dublin 1", phone: "+353 1 873 42 61", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u062F\u0628\u0644\u0646, \u0633\u0648\u0631\u064A, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Medina Money Transfer", businessNameAr: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644 \u0627\u0644\u0645\u062F\u064A\u0646\u0629 - \u0644\u0646\u062F\u0646", shortDescription: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644 \u0644\u0644\u062F\u0648\u0644 \u0627\u0644\u0639\u0631\u0628\u064A\u0629", description: "\u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0623\u0645\u0648\u0627\u0644 \u0644\u0644\u062F\u0648\u0644 \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "money_transfer", subcategory: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0644\u0646\u062F\u0646", address: "Edgware Road 201, London W2 1ES", phone: "+44 20 7723 91 44", priceRange: "$", rating: "4.2", tags: "\u062A\u062D\u0648\u064A\u0644 \u0623\u0645\u0648\u0627\u0644, \u0644\u0646\u062F\u0646, Edgware Road", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Desert Rose Oslo", businessNameAr: "\u0648\u0631\u062F\u0629 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 - \u0623\u0648\u0633\u0644\u0648", shortDescription: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0633\u0644\u0648", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0648\u064A \u0648\u0627\u0644\u0645\u0627\u0632\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0646\u0631\u0648\u064A\u062C", city: "\u0623\u0648\u0633\u0644\u0648", address: "Gronlandsleiret 25, 0190 Oslo", phone: "+47 22 17 38 56", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A, \u0623\u0648\u0633\u0644\u0648, \u0645\u0634\u0627\u0648\u064A, \u0645\u0627\u0632\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Huda Islamic Center", businessNameAr: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0647\u062F\u0627\u064A\u0629 - \u0647\u0644\u0633\u0646\u0643\u064A", shortDescription: "\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A \u0641\u064A \u0647\u0644\u0633\u0646\u0643\u064A", description: "\u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u062F\u064A\u0646\u064A\u0629 \u0648\u0627\u062C\u062A\u0645\u0627\u0639\u064A\u0629 \u0648\u062A\u0639\u0644\u064A\u0645\u064A\u0629.", category: "mosque", subcategory: "\u0645\u0633\u062C\u062F \u0648\u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A", country: "\u0641\u0646\u0644\u0646\u062F\u0627", city: "\u0647\u0644\u0633\u0646\u0643\u064A", address: "Kaenkuja 1, 00500 Helsinki", phone: "+358 9 739 67 82", priceRange: "free", rating: "4.5", tags: "\u0645\u0633\u062C\u062F, \u0647\u0644\u0633\u0646\u0643\u064A, \u0645\u0631\u0643\u0632 \u0625\u0633\u0644\u0627\u0645\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Mecca Restaurant Lisbon", businessNameAr: "\u0645\u0637\u0639\u0645 \u0645\u0643\u0629 - \u0644\u0634\u0628\u0648\u0646\u0629", shortDescription: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A \u0641\u064A \u0644\u0634\u0628\u0648\u0646\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u062D\u0644\u0627\u0644.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0628\u0631\u062A\u063A\u0627\u0644", city: "\u0644\u0634\u0628\u0648\u0646\u0629", address: "Rua da Palma 258, 1100-394 Lisboa", phone: "+351 21 882 34 71", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644, \u0644\u0634\u0628\u0648\u0646\u0629, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Rashid Supermarket Prague", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0631\u0634\u064A\u062F - \u0628\u0631\u0627\u063A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0631\u0627\u063A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u0628\u0647\u0627\u0631\u0627\u062A.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u062A\u0634\u064A\u0643", city: "\u0628\u0631\u0627\u063A", address: "Sokolovska 192/541, 190 00 Praha 9", phone: "+420 284 681 32 7", priceRange: "$$", rating: "4.2", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0628\u0631\u0627\u063A, \u0645\u0646\u062A\u062C\u0627\u062A \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Nile Restaurant Warsaw", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0646\u064A\u0644 - \u0648\u0627\u0631\u0633\u0648", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A \u0639\u0631\u0628\u064A \u0641\u064A \u0648\u0627\u0631\u0633\u0648", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u064A\u0629 \u0627\u0644\u0623\u0635\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A", country: "\u0628\u0648\u0644\u0646\u062F\u0627", city: "\u0648\u0627\u0631\u0633\u0648", address: "Marszalkowska 99/101, 00-693 Warszawa", phone: "+48 22 622 43 78", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A, \u0648\u0627\u0631\u0633\u0648, \u0643\u0634\u0631\u064A, \u0641\u0648\u0644", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Quds Bakery Budapest", businessNameAr: "\u0645\u062E\u0628\u0632 \u0627\u0644\u0642\u062F\u0633 - \u0628\u0648\u062F\u0627\u0628\u0633\u062A", shortDescription: "\u0645\u062E\u0628\u0632 \u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0648\u062F\u0627\u0628\u0633\u062A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0641\u0644\u0633\u0637\u064A\u0646\u064A \u0648\u0627\u0644\u0639\u0631\u0628\u064A \u0627\u0644\u0637\u0627\u0632\u062C.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0641\u0644\u0633\u0637\u064A\u0646\u064A", country: "\u0627\u0644\u0645\u062C\u0631", city: "\u0628\u0648\u062F\u0627\u0628\u0633\u062A", address: "Rakoczi ut 69, 1078 Budapest", phone: "+36 1 322 41 95", priceRange: "$", rating: "4.5", tags: "\u0645\u062E\u0628\u0632 \u0641\u0644\u0633\u0637\u064A\u0646\u064A, \u0628\u0648\u062F\u0627\u0628\u0633\u062A, \u062E\u0628\u0632 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sahara Cafe Zurich", businessNameAr: "\u0645\u0642\u0647\u0649 \u0627\u0644\u0635\u062D\u0631\u0627\u0621 - \u0632\u064A\u0648\u0631\u062E", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A \u0641\u064A \u0632\u064A\u0648\u0631\u062E", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u062A\u0631\u0643\u064A\u0629 \u0648\u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u062E\u0641\u064A\u0641\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A", country: "\u0633\u0648\u064A\u0633\u0631\u0627", city: "\u0632\u064A\u0648\u0631\u062E", address: "Langstrasse 215, 8005 Zurich", phone: "+41 43 488 76 22", priceRange: "$$", rating: "4.4", tags: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A, \u0632\u064A\u0648\u0631\u062E, \u0634\u0627\u064A, \u0642\u0647\u0648\u0629 \u062A\u0631\u0643\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Habibi Shisha Vienna", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u062D\u0628\u064A\u0628\u064A - \u0641\u064A\u064A\u0646\u0627", shortDescription: "\u0644\u0627\u0648\u0646\u062C \u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A \u0639\u0635\u0631\u064A \u0641\u064A \u0641\u064A\u064A\u0646\u0627", description: "\u0644\u0627\u0648\u0646\u062C \u0639\u0635\u0631\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0628\u0646\u0643\u0647\u0627\u062A \u0645\u062A\u0646\u0648\u0639\u0629.", category: "shisha_lounge", subcategory: "\u0644\u0627\u0648\u0646\u062C \u0634\u064A\u0634\u0629", country: "\u0627\u0644\u0646\u0645\u0633\u0627", city: "\u0641\u064A\u064A\u0646\u0627", address: "Praterstrasse 21, 1020 Wien", phone: "+43 1 214 52 88", priceRange: "$$", rating: "4.2", tags: "\u0634\u064A\u0634\u0629, \u0644\u0627\u0648\u0646\u062C, \u0641\u064A\u064A\u0646\u0627, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Masry Marseille", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0645\u0635\u0631\u064A - \u0645\u0631\u0633\u064A\u0644\u064A\u0627", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A \u0623\u0635\u064A\u0644 \u0641\u064A \u0645\u0631\u0633\u064A\u0644\u064A\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u0635\u0631\u064A\u0629 \u0645\u0646 \u0627\u0644\u0643\u0634\u0631\u064A \u0648\u0627\u0644\u0645\u0644\u0648\u062E\u064A\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0645\u0631\u0633\u064A\u0644\u064A\u0627", address: "63 La Canebiere, 13001 Marseille", phone: "+33 4 91 08 12 44", priceRange: "$$", rating: "4.4", tags: "\u0645\u0637\u0639\u0645 \u0645\u0635\u0631\u064A, \u0645\u0631\u0633\u064A\u0644\u064A\u0627, \u0643\u0634\u0631\u064A, \u0634\u0627\u0648\u0631\u0645\u0627", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Cafe Beyrouth Nice", businessNameAr: "\u0645\u0642\u0647\u0649 \u0628\u064A\u0631\u0648\u062A - \u0646\u064A\u0633", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A \u0641\u064A \u0646\u064A\u0633", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0627\u0632\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0648\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0644\u0628\u0646\u0627\u0646\u064A\u0629.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A", country: "\u0641\u0631\u0646\u0633\u0627", city: "\u0646\u064A\u0633", address: "12 Rue Massena, 06000 Nice", phone: "+33 4 93 87 22 11", priceRange: "$$", rating: "4.3", tags: "\u0645\u0637\u0639\u0645 \u0644\u0628\u0646\u0627\u0646\u064A, \u0646\u064A\u0633, \u0645\u0627\u0632\u0629, \u0645\u0634\u0627\u0648\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sham Palace Frankfurt", businessNameAr: "\u0642\u0635\u0631 \u0627\u0644\u0634\u0627\u0645 - \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", shortDescription: "\u0645\u0637\u0639\u0645 \u0633\u0648\u0631\u064A \u0634\u0627\u0645\u064A \u0641\u064A \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0623\u0637\u0628\u0627\u0642 \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0645\u0646 \u0627\u0644\u0645\u0634\u0627\u0648\u064A \u0648\u0627\u0644\u0641\u062A\u0629 \u0648\u0627\u0644\u0643\u0628\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A", address: "Kaiserstrasse 52, 60329 Frankfurt am Main", phone: "+49 69 272 38 22", priceRange: "$$", rating: "4.5", tags: "\u0645\u0637\u0639\u0645 \u0634\u0627\u0645\u064A, \u0641\u0631\u0627\u0646\u0643\u0641\u0648\u0631\u062A, \u0645\u0634\u0627\u0648\u064A, \u0643\u0628\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Sultan Supermarket Cologne", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0627\u0644\u0633\u0644\u0637\u0627\u0646 - \u0643\u0648\u0644\u0648\u0646\u064A\u0627", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0641\u064A \u0643\u0648\u0644\u0648\u0646\u064A\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u062A\u0645\u0648\u0631.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0643\u0648\u0644\u0648\u0646\u064A\u0627", address: "Venloer Str. 385, 50825 Koln", phone: "+49 221 168 91 33", priceRange: "$$", rating: "4.3", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0643\u0648\u0644\u0648\u0646\u064A\u0627, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Al-Sham Sweets Stuttgart", businessNameAr: "\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0627\u0645 - \u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A", shortDescription: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0627\u0645\u064A\u0629 \u0641\u0627\u062E\u0631\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0628\u0642\u0644\u0627\u0648\u0629 \u0627\u0644\u0634\u0627\u0645\u064A\u0629 \u0648\u0627\u0644\u0643\u0646\u0627\u0641\u0629 \u0627\u0644\u0646\u0627\u0628\u0644\u0633\u064A\u0629.", category: "sweets", subcategory: "\u062D\u0644\u0648\u064A\u0627\u062A \u0634\u0627\u0645\u064A\u0629", country: "\u0623\u0644\u0645\u0627\u0646\u064A\u0627", city: "\u0634\u062A\u0648\u062A\u063A\u0627\u0631\u062A", address: "Konigstrasse 45, 70173 Stuttgart", phone: "+49 711 293 84 17", priceRange: "$$", rating: "4.6", tags: "\u062D\u0644\u0648\u064A\u0627\u062A, \u0634\u0627\u0645\u064A\u0629, \u0628\u0642\u0644\u0627\u0648\u0629, \u0643\u0646\u0627\u0641\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Manchester Halal Butcher", businessNameAr: "\u062C\u0632\u0627\u0631 \u0645\u0627\u0646\u0634\u0633\u062A\u0631 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u062C\u0632\u0627\u0631 \u0648\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0644\u062D\u0648\u0645 \u0627\u0644\u062D\u0644\u0627\u0644 \u0627\u0644\u0637\u0627\u0632\u062C\u0629 \u0648\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "butcher", subcategory: "\u062C\u0632\u0627\u0631 \u0648\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0645\u0627\u0646\u0634\u0633\u062A\u0631", address: "Wilmslow Road 142, Rusholme, Manchester M14 5AW", phone: "+44 161 224 55 88", priceRange: "$$", rating: "4.4", tags: "\u062C\u0632\u0627\u0631 \u062D\u0644\u0627\u0644, \u0645\u0627\u0646\u0634\u0633\u062A\u0631, \u0628\u0642\u0627\u0644\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Birmingham Cultural Center", businessNameAr: "\u0645\u0631\u0643\u0632 \u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645 \u0627\u0644\u062B\u0642\u0627\u0641\u064A", shortDescription: "\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A \u0639\u0631\u0628\u064A", description: "\u064A\u0642\u062F\u0645 \u0623\u0646\u0634\u0637\u0629 \u062B\u0642\u0627\u0641\u064A\u0629 \u0648\u062F\u0648\u0631\u0627\u062A \u0644\u063A\u0629 \u0639\u0631\u0628\u064A\u0629.", category: "mosque", subcategory: "\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0645\u062A\u062D\u062F\u0629", city: "\u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645", address: "Stratford Road 298, Birmingham B11 1AA", phone: "+44 121 766 22 44", priceRange: "free", rating: "4.5", tags: "\u0645\u0631\u0643\u0632 \u062B\u0642\u0627\u0641\u064A, \u0628\u0631\u0645\u0646\u063A\u0647\u0627\u0645, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Barcelona Arab Lounge", businessNameAr: "\u0644\u0627\u0648\u0646\u062C \u0628\u0631\u0634\u0644\u0648\u0646\u0629 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0645\u0637\u0639\u0645 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A \u0641\u064A \u0628\u0631\u0634\u0644\u0648\u0646\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0634\u064A\u0634\u0629.", category: "shisha_lounge", subcategory: "\u0645\u0637\u0639\u0645 \u0648\u0644\u0627\u0648\u0646\u062C \u0639\u0631\u0628\u064A", country: "\u0625\u0633\u0628\u0627\u0646\u064A\u0627", city: "\u0628\u0631\u0634\u0644\u0648\u0646\u0629", address: "Carrer de Mallorca 234, 08008 Barcelona", phone: "+34 934 88 12 55", priceRange: "$$", rating: "4.3", tags: "\u0644\u0627\u0648\u0646\u062C, \u0634\u064A\u0634\u0629, \u0628\u0631\u0634\u0644\u0648\u0646\u0629, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Milan Arabic Bakery", businessNameAr: "\u0645\u062E\u0628\u0632 \u0645\u064A\u0644\u0627\u0646 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A \u0641\u064A \u0645\u064A\u0644\u0627\u0646\u0648", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u062E\u0628\u0632 \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u062D\u0644\u0648\u064A\u0627\u062A \u0627\u0644\u0634\u0631\u0642\u064A\u0629.", category: "bakery", subcategory: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A", country: "\u0625\u064A\u0637\u0627\u0644\u064A\u0627", city: "\u0645\u064A\u0644\u0627\u0646\u0648", address: "Via Paolo Sarpi 28, 20154 Milano", phone: "+39 02 349 41 88", priceRange: "$", rating: "4.4", tags: "\u0645\u062E\u0628\u0632 \u0639\u0631\u0628\u064A, \u0645\u064A\u0644\u0627\u0646\u0648, \u062E\u0628\u0632", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Athens Halal Restaurant", businessNameAr: "\u0645\u0637\u0639\u0645 \u0623\u062B\u064A\u0646\u0627 \u0627\u0644\u062D\u0644\u0627\u0644", shortDescription: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A \u0641\u064A \u0623\u062B\u064A\u0646\u0627", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0623\u0643\u0648\u0644\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0645\u0634\u0627\u0648\u064A.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u064A\u0648\u0646\u0627\u0646", city: "\u0623\u062B\u064A\u0646\u0627", address: "Athinas Street 45, Athens 10551", phone: "+30 21 0321 88 42", priceRange: "$$", rating: "4.2", tags: "\u0645\u0637\u0639\u0645 \u062D\u0644\u0627\u0644, \u0623\u062B\u064A\u0646\u0627, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Oasis Market Bucharest", businessNameAr: "\u0633\u0648\u0642 \u0627\u0644\u0648\u0627\u062D\u0629 \u0627\u0644\u062D\u0644\u0627\u0644 - \u0628\u0648\u062E\u0627\u0631\u0633\u062A", shortDescription: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0648\u0639\u0631\u0628\u064A\u0629", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0644 \u0648\u0627\u0644\u0639\u0631\u0628\u064A\u0629.", category: "supermarket", subcategory: "\u0628\u0642\u0627\u0644\u0629 \u062D\u0644\u0627\u0644 \u0639\u0631\u0628\u064A\u0629", country: "\u0631\u0648\u0645\u0627\u0646\u064A\u0627", city: "\u0628\u0648\u062E\u0627\u0631\u0633\u062A", address: "Strada Barcanesti 18, Sector 2, Bucuresti", phone: "+40 21 322 15 88", priceRange: "$$", rating: "4.3", tags: "\u0628\u0642\u0627\u0644\u0629, \u062D\u0644\u0627\u0644, \u0628\u0648\u062E\u0627\u0631\u0633\u062A, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Budapest Arabic Cafe", businessNameAr: "\u0645\u0642\u0647\u0649 \u0628\u0648\u062F\u0627\u0628\u0633\u062A \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u0648\u0645\u0637\u0639\u0645 \u0641\u064A \u0628\u0648\u062F\u0627\u0628\u0633\u062A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0642\u0647\u0648\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u0634\u0627\u064A \u0627\u0644\u0645\u063A\u0631\u0628\u064A.", category: "cafe", subcategory: "\u0645\u0642\u0647\u0649 \u0648\u0645\u0637\u0639\u0645 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0645\u062C\u0631", city: "\u0628\u0648\u062F\u0627\u0628\u0633\u062A", address: "Kiraly utca 28, 1075 Budapest", phone: "+36 1 782 22 44", priceRange: "$$", rating: "4.5", tags: "\u0645\u0642\u0647\u0649, \u0628\u0648\u062F\u0627\u0628\u0633\u062A, \u0642\u0647\u0648\u0629 \u0639\u0631\u0628\u064A\u0629", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Andalusia Restaurant Lisbon", businessNameAr: "\u0645\u0637\u0639\u0645 \u0627\u0644\u0623\u0646\u062F\u0644\u0633 - \u0644\u0634\u0628\u0648\u0646\u0629", shortDescription: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u0623\u0646\u062F\u0644\u0633\u064A", description: "\u064A\u0642\u062F\u0645 \u0627\u0644\u0643\u0633\u0643\u0633 \u0648\u0627\u0644\u0637\u0627\u062C\u064A\u0646 \u0648\u0627\u0644\u0628\u0633\u0637\u064A\u0644\u0629.", category: "restaurant", subcategory: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A \u0623\u0646\u062F\u0644\u0633\u064A", country: "\u0627\u0644\u0628\u0631\u062A\u063A\u0627\u0644", city: "\u0644\u0634\u0628\u0648\u0646\u0629", address: "Rua de Sao Juliao 72, 1100-524 Lisboa", phone: "+351 21 887 65 22", priceRange: "$$$", rating: "4.6", tags: "\u0645\u0637\u0639\u0645 \u0645\u063A\u0631\u0628\u064A, \u0644\u0634\u0628\u0648\u0646\u0629, \u0643\u0633\u0643\u0633, \u0637\u0627\u062C\u064A\u0646", status: "active", isVerified: true, isFeatured: true },
  { businessName: "Oslo Arabic Barber", businessNameAr: "\u0635\u0627\u0644\u0648\u0646 \u0623\u0648\u0633\u0644\u0648 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A \u0641\u064A \u0623\u0648\u0633\u0644\u0648", description: "\u064A\u0642\u062F\u0645 \u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0644\u0627\u0642\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644 \u0644\u0644\u0631\u062C\u0627\u0644 \u0648\u0627\u0644\u0623\u0637\u0641\u0627\u0644.", category: "barber", subcategory: "\u0635\u0627\u0644\u0648\u0646 \u062D\u0644\u0627\u0642\u0629 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u0646\u0631\u0648\u064A\u062C", city: "\u0623\u0648\u0633\u0644\u0648", address: "Gronland 18, 0188 Oslo", phone: "+47 22 42 18 33", priceRange: "$$", rating: "4.4", tags: "\u062D\u0644\u0627\u0642\u0629, \u0623\u0648\u0633\u0644\u0648, \u0635\u0627\u0644\u0648\u0646 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Stockholm Arabic Supermarket", businessNameAr: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645 \u0627\u0644\u0639\u0631\u0628\u064A", shortDescription: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644", description: "\u064A\u0642\u062F\u0645 \u0643\u0644 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u0644\u062D\u0644\u0627\u0644.", category: "supermarket", subcategory: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A \u0639\u0631\u0628\u064A \u0645\u062A\u0643\u0627\u0645\u0644", country: "\u0627\u0644\u0633\u0648\u064A\u062F", city: "\u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645", address: "Soderhallarna 11, 118 72 Stockholm", phone: "+46 8 669 28 44", priceRange: "$$", rating: "4.3", tags: "\u0633\u0648\u0628\u0631\u0645\u0627\u0631\u0643\u062A, \u062D\u0644\u0627\u0644, \u0633\u062A\u0648\u0643\u0647\u0648\u0644\u0645, \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false },
  { businessName: "Copenhagen Shisha Garden", businessNameAr: "\u062D\u062F\u064A\u0642\u0629 \u0627\u0644\u0634\u064A\u0634\u0629 - \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", shortDescription: "\u0645\u0642\u0647\u0649 \u0648\u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A", description: "\u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A \u064A\u0642\u062F\u0645 \u0627\u0644\u0634\u064A\u0634\u0629 \u0648\u0627\u0644\u0634\u0627\u064A.", category: "shisha_lounge", subcategory: "\u0645\u0642\u0647\u0649 \u0648\u0634\u064A\u0634\u0629 \u0639\u0631\u0628\u064A", country: "\u0627\u0644\u062F\u0646\u0645\u0627\u0631\u0643", city: "\u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646", address: "Vesterbrogade 62, 1620 Kobenhavn", phone: "+45 33 21 44 88", priceRange: "$$", rating: "4.2", tags: "\u0634\u064A\u0634\u0629, \u0643\u0648\u0628\u0646\u0647\u0627\u063A\u0646, \u0645\u0642\u0647\u0649 \u0639\u0631\u0628\u064A", status: "active", isVerified: true, isFeatured: false }
];
var seedRouter = createRouter({
  runSeed: publicQuery.mutation(async () => {
    const db = getDb();
    const existingCount = await db.select({ count: sql6`count(*)` }).from(merchants);
    const count = existingCount[0]?.count || 0;
    if (count >= 50) {
      return { success: true, message: "Already seeded!", count, alreadySeeded: true };
    }
    let inserted = 0;
    for (const merchant of merchantsData) {
      try {
        await db.insert(merchants).values({
          ...merchant,
          slug: merchant.businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now() + "-" + Math.floor(Math.random() * 1e3),
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        });
        inserted++;
      } catch (err) {
        console.error(`Failed: ${merchant.businessNameAr}`);
      }
    }
    return { success: true, message: `Inserted ${inserted} merchants!`, count: inserted, alreadySeeded: false };
  }),
  status: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ count: sql6`count(*)` }).from(merchants);
    return { count: result[0]?.count || 0 };
  })
});

// api/router.ts
var appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  merchant: merchantRouter,
  job: jobRouter,
  search: searchRouter,
  sindbad: sindbadRouter,
  admin: adminRouter,
  adminAuth: adminAuthRouter,
  subscription: subscriptionRouter,
  claim: claimRouter,
  seed: seedRouter
});

// api/kimi/auth.ts
var cookie2 = __toESM(require_dist(), 1);
import { setCookie } from "hono/cookie";
import * as jose3 from "jose";

// contracts/errors.ts
function appError(status, message) {
  return { tag: "app_error", status, message };
}
var Errors = {
  badRequest: (msg) => appError(400, msg),
  unauthorized: (msg) => appError(401, msg),
  forbidden: (msg) => appError(403, msg),
  notFound: (msg) => appError(404, msg),
  internal: (msg) => appError(500, msg)
};

// api/kimi/session.ts
import * as jose2 from "jose";
var JWT_ALG = "HS256";
async function signSessionToken(payload) {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose2.SignJWT(payload).setProtectedHeader({ alg: JWT_ALG }).setIssuedAt().setExpirationTime("1 year").sign(secret);
}
async function verifySessionToken(token) {
  if (!token) {
    console.warn("[session] No token provided for verification.");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose2.jwtVerify(token, secret, {
      algorithms: [JWT_ALG]
    });
    const { unionId, clientId } = payload;
    if (!unionId || !clientId) {
      console.warn("[session] JWT payload missing required fields.");
      return null;
    }
    return { unionId, clientId };
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}

// api/kimi/platform.ts
async function kimiRequest(path2, token, init) {
  const resp = await fetch(`${env.kimiOpenUrl}${path2}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers
    }
  });
  if (!resp.ok) {
    const text2 = await resp.text();
    console.warn(
      `[kimi] Request to ${path2} failed (${resp.status}): ${text2}`
    );
    return null;
  }
  return resp.json();
}
var users2 = {
  getProfile: (token) => kimiRequest("/v1/users/me/profile", token)
};

// api/queries/users.ts
import { eq as eq8 } from "drizzle-orm";
async function findUserByUnionId(unionId) {
  const rows = await getDb().select().from(users).where(eq8(users.unionId, unionId)).limit(1);
  return rows.at(0);
}
async function upsertUser(data) {
  const values = { ...data };
  const updateSet = {
    lastSignInAt: /* @__PURE__ */ new Date(),
    ...data
  };
  if (values.role === void 0 && values.unionId && values.unionId === env.ownerUnionId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await getDb().insert(users).values(values).onConflictDoUpdate({
    target: users.unionId,
    set: updateSet
  });
}

// api/kimi/auth.ts
async function exchangeAuthCode(code, redirectUri) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.appId,
    redirect_uri: redirectUri,
    client_secret: env.appSecret
  });
  const resp = await fetch(`${env.kimiAuthUrl}/api/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });
  if (!resp.ok) {
    const text2 = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text2}`);
  }
  return resp.json();
}
function getJwks() {
  const authUrl = env.kimiAuthUrl || "https://kimi-auth.example.com";
  return jose3.createRemoteJWKSet(
    new URL(`${authUrl}/api/.well-known/jwks.json`)
  );
}
async function verifyAccessToken(accessToken) {
  const { payload } = await jose3.jwtVerify(accessToken, getJwks());
  const userId = payload.user_id;
  const clientId = payload.client_id;
  if (!userId) {
    throw new Error("user_id missing from access token");
  }
  return { userId, clientId };
}
async function authenticateRequest(headers) {
  const cookies = cookie2.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}
function createOAuthCallbackHandler() {
  return async (c) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");
    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400
      );
    }
    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }
    try {
      const redirectUri = atob(state);
      const tokenResp = await exchangeAuthCode(code, redirectUri);
      const { userId } = await verifyAccessToken(tokenResp.access_token);
      const userProfile = await users2.getProfile(tokenResp.access_token);
      if (!userProfile) {
        throw new Error("Failed to fetch user profile from Kimi Open");
      }
      await upsertUser({
        unionId: userId,
        name: userProfile.name,
        avatar: userProfile.avatar_url,
        lastSignInAt: /* @__PURE__ */ new Date()
      });
      const token = await signSessionToken({
        unionId: userId,
        clientId: env.appId
      });
      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1e3
      });
      return c.redirect("/", 302);
    } catch (error2) {
      console.error("[OAuth] Callback failed", error2);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

// api/context.ts
async function createContext(opts) {
  const ctx = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
  }
  return ctx;
}

// api/boot.ts
import fs from "fs";
import path from "path";
var app = new Hono2();
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));
var possiblePaths = [
  path.join(process.cwd(), "dist", "public"),
  path.join(process.cwd(), "public"),
  "/opt/render/project/src/public",
  "/opt/render/project/public"
];
var publicPath = "";
for (const p of possiblePaths) {
  console.log("[Static] Checking:", p, "exists:", fs.existsSync(p));
  if (fs.existsSync(p)) {
    publicPath = p;
    break;
  }
}
if (!publicPath) {
  console.error("[Static] ERROR: No public folder found!");
  app.use("*", async (c) => c.json({
    error: "public folder not found",
    cwd: process.cwd(),
    files: fs.existsSync(process.cwd()) ? fs.readdirSync(process.cwd()) : "N/A"
  }, 500));
} else {
  console.log("[Static] Serving from:", publicPath);
  app.use("/assets/*", async (c) => {
    const file = path.basename(c.req.path);
    const filePath = path.join(publicPath, "assets", file);
    if (!fs.existsSync(filePath)) return c.json({ error: "Not found" }, 404);
    const ext = path.extname(filePath);
    const mime = {
      ".js": "application/javascript",
      ".css": "text/css",
      ".png": "image/png",
      ".svg": "image/svg+xml"
    };
    return new Response(fs.readFileSync(filePath), {
      headers: { "Content-Type": mime[ext] || "text/plain" }
    });
  });
  app.use("*", async (c) => {
    const indexPath = path.join(publicPath, "index.html");
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, "utf-8"));
    }
    return c.json({ error: "index.html missing", publicPath }, 500);
  });
}
var { serve } = await import("@hono/node-server");
var port = parseInt(process.env.PORT || "3000");
serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running on http://localhost:${port}/`);
});
var boot_default = app;
export {
  boot_default as default
};
