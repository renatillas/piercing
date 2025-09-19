// build/dev/javascript/prelude.mjs
var CustomType = class {
  withFields(fields) {
    let properties = Object.keys(this).map(
      (label) => label in fields ? fields[label] : this[label]
    );
    return new this.constructor(...properties);
  }
};
var List = class {
  static fromArray(array3, tail) {
    let t = tail || new Empty();
    for (let i = array3.length - 1; i >= 0; --i) {
      t = new NonEmpty(array3[i], t);
    }
    return t;
  }
  [Symbol.iterator]() {
    return new ListIterator(this);
  }
  toArray() {
    return [...this];
  }
  // @internal
  atLeastLength(desired) {
    let current = this;
    while (desired-- > 0 && current) current = current.tail;
    return current !== void 0;
  }
  // @internal
  hasLength(desired) {
    let current = this;
    while (desired-- > 0 && current) current = current.tail;
    return desired === -1 && current instanceof Empty;
  }
  // @internal
  countLength() {
    let current = this;
    let length3 = 0;
    while (current) {
      current = current.tail;
      length3++;
    }
    return length3 - 1;
  }
};
function prepend(element4, tail) {
  return new NonEmpty(element4, tail);
}
function toList(elements, tail) {
  return List.fromArray(elements, tail);
}
var ListIterator = class {
  #current;
  constructor(current) {
    this.#current = current;
  }
  next() {
    if (this.#current instanceof Empty) {
      return { done: true };
    } else {
      let { head, tail } = this.#current;
      this.#current = tail;
      return { value: head, done: false };
    }
  }
};
var Empty = class extends List {
};
var NonEmpty = class extends List {
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
};
var BitArray = class {
  /**
   * The size in bits of this bit array's data.
   *
   * @type {number}
   */
  bitSize;
  /**
   * The size in bytes of this bit array's data. If this bit array doesn't store
   * a whole number of bytes then this value is rounded up.
   *
   * @type {number}
   */
  byteSize;
  /**
   * The number of unused high bits in the first byte of this bit array's
   * buffer prior to the start of its data. The value of any unused high bits is
   * undefined.
   *
   * The bit offset will be in the range 0-7.
   *
   * @type {number}
   */
  bitOffset;
  /**
   * The raw bytes that hold this bit array's data.
   *
   * If `bitOffset` is not zero then there are unused high bits in the first
   * byte of this buffer.
   *
   * If `bitOffset + bitSize` is not a multiple of 8 then there are unused low
   * bits in the last byte of this buffer.
   *
   * @type {Uint8Array}
   */
  rawBuffer;
  /**
   * Constructs a new bit array from a `Uint8Array`, an optional size in
   * bits, and an optional bit offset.
   *
   * If no bit size is specified it is taken as `buffer.length * 8`, i.e. all
   * bytes in the buffer make up the new bit array's data.
   *
   * If no bit offset is specified it defaults to zero, i.e. there are no unused
   * high bits in the first byte of the buffer.
   *
   * @param {Uint8Array} buffer
   * @param {number} [bitSize]
   * @param {number} [bitOffset]
   */
  constructor(buffer, bitSize, bitOffset) {
    if (!(buffer instanceof Uint8Array)) {
      throw globalThis.Error(
        "BitArray can only be constructed from a Uint8Array"
      );
    }
    this.bitSize = bitSize ?? buffer.length * 8;
    this.byteSize = Math.trunc((this.bitSize + 7) / 8);
    this.bitOffset = bitOffset ?? 0;
    if (this.bitSize < 0) {
      throw globalThis.Error(`BitArray bit size is invalid: ${this.bitSize}`);
    }
    if (this.bitOffset < 0 || this.bitOffset > 7) {
      throw globalThis.Error(
        `BitArray bit offset is invalid: ${this.bitOffset}`
      );
    }
    if (buffer.length !== Math.trunc((this.bitOffset + this.bitSize + 7) / 8)) {
      throw globalThis.Error("BitArray buffer length is invalid");
    }
    this.rawBuffer = buffer;
  }
  /**
   * Returns a specific byte in this bit array. If the byte index is out of
   * range then `undefined` is returned.
   *
   * When returning the final byte of a bit array with a bit size that's not a
   * multiple of 8, the content of the unused low bits are undefined.
   *
   * @param {number} index
   * @returns {number | undefined}
   */
  byteAt(index2) {
    if (index2 < 0 || index2 >= this.byteSize) {
      return void 0;
    }
    return bitArrayByteAt(this.rawBuffer, this.bitOffset, index2);
  }
  /** @internal */
  equals(other) {
    if (this.bitSize !== other.bitSize) {
      return false;
    }
    const wholeByteCount = Math.trunc(this.bitSize / 8);
    if (this.bitOffset === 0 && other.bitOffset === 0) {
      for (let i = 0; i < wholeByteCount; i++) {
        if (this.rawBuffer[i] !== other.rawBuffer[i]) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (this.rawBuffer[wholeByteCount] >> unusedLowBitCount !== other.rawBuffer[wholeByteCount] >> unusedLowBitCount) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < wholeByteCount; i++) {
        const a2 = bitArrayByteAt(this.rawBuffer, this.bitOffset, i);
        const b = bitArrayByteAt(other.rawBuffer, other.bitOffset, i);
        if (a2 !== b) {
          return false;
        }
      }
      const trailingBitsCount = this.bitSize % 8;
      if (trailingBitsCount) {
        const a2 = bitArrayByteAt(
          this.rawBuffer,
          this.bitOffset,
          wholeByteCount
        );
        const b = bitArrayByteAt(
          other.rawBuffer,
          other.bitOffset,
          wholeByteCount
        );
        const unusedLowBitCount = 8 - trailingBitsCount;
        if (a2 >> unusedLowBitCount !== b >> unusedLowBitCount) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Returns this bit array's internal buffer.
   *
   * @deprecated Use `BitArray.byteAt()` or `BitArray.rawBuffer` instead.
   *
   * @returns {Uint8Array}
   */
  get buffer() {
    bitArrayPrintDeprecationWarning(
      "buffer",
      "Use BitArray.byteAt() or BitArray.rawBuffer instead"
    );
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error(
        "BitArray.buffer does not support unaligned bit arrays"
      );
    }
    return this.rawBuffer;
  }
  /**
   * Returns the length in bytes of this bit array's internal buffer.
   *
   * @deprecated Use `BitArray.bitSize` or `BitArray.byteSize` instead.
   *
   * @returns {number}
   */
  get length() {
    bitArrayPrintDeprecationWarning(
      "length",
      "Use BitArray.bitSize or BitArray.byteSize instead"
    );
    if (this.bitOffset !== 0 || this.bitSize % 8 !== 0) {
      throw new globalThis.Error(
        "BitArray.length does not support unaligned bit arrays"
      );
    }
    return this.rawBuffer.length;
  }
};
function bitArrayByteAt(buffer, bitOffset, index2) {
  if (bitOffset === 0) {
    return buffer[index2] ?? 0;
  } else {
    const a2 = buffer[index2] << bitOffset & 255;
    const b = buffer[index2 + 1] >> 8 - bitOffset;
    return a2 | b;
  }
}
var isBitArrayDeprecationMessagePrinted = {};
function bitArrayPrintDeprecationWarning(name, message2) {
  if (isBitArrayDeprecationMessagePrinted[name]) {
    return;
  }
  console.warn(
    `Deprecated BitArray.${name} property used in JavaScript FFI code. ${message2}.`
  );
  isBitArrayDeprecationMessagePrinted[name] = true;
}
var Result = class _Result extends CustomType {
  // @internal
  static isResult(data) {
    return data instanceof _Result;
  }
};
var Ok = class extends Result {
  constructor(value) {
    super();
    this[0] = value;
  }
  // @internal
  isOk() {
    return true;
  }
};
var Error = class extends Result {
  constructor(detail) {
    super();
    this[0] = detail;
  }
  // @internal
  isOk() {
    return false;
  }
};
function isEqual(x, y) {
  let values3 = [x, y];
  while (values3.length) {
    let a2 = values3.pop();
    let b = values3.pop();
    if (a2 === b) continue;
    if (!isObject(a2) || !isObject(b)) return false;
    let unequal = !structurallyCompatibleObjects(a2, b) || unequalDates(a2, b) || unequalBuffers(a2, b) || unequalArrays(a2, b) || unequalMaps(a2, b) || unequalSets(a2, b) || unequalRegExps(a2, b);
    if (unequal) return false;
    const proto = Object.getPrototypeOf(a2);
    if (proto !== null && typeof proto.equals === "function") {
      try {
        if (a2.equals(b)) continue;
        else return false;
      } catch {
      }
    }
    let [keys2, get2] = getters(a2);
    const ka = keys2(a2);
    const kb = keys2(b);
    if (ka.length !== kb.length) return false;
    for (let k of ka) {
      values3.push(get2(a2, k), get2(b, k));
    }
  }
  return true;
}
function getters(object4) {
  if (object4 instanceof Map) {
    return [(x) => x.keys(), (x, y) => x.get(y)];
  } else {
    let extra = object4 instanceof globalThis.Error ? ["message"] : [];
    return [(x) => [...extra, ...Object.keys(x)], (x, y) => x[y]];
  }
}
function unequalDates(a2, b) {
  return a2 instanceof Date && (a2 > b || a2 < b);
}
function unequalBuffers(a2, b) {
  return !(a2 instanceof BitArray) && a2.buffer instanceof ArrayBuffer && a2.BYTES_PER_ELEMENT && !(a2.byteLength === b.byteLength && a2.every((n, i) => n === b[i]));
}
function unequalArrays(a2, b) {
  return Array.isArray(a2) && a2.length !== b.length;
}
function unequalMaps(a2, b) {
  return a2 instanceof Map && a2.size !== b.size;
}
function unequalSets(a2, b) {
  return a2 instanceof Set && (a2.size != b.size || [...a2].some((e) => !b.has(e)));
}
function unequalRegExps(a2, b) {
  return a2 instanceof RegExp && (a2.source !== b.source || a2.flags !== b.flags);
}
function isObject(a2) {
  return typeof a2 === "object" && a2 !== null;
}
function structurallyCompatibleObjects(a2, b) {
  if (typeof a2 !== "object" && typeof b !== "object" && (!a2 || !b))
    return false;
  let nonstructural = [Promise, WeakSet, WeakMap, Function];
  if (nonstructural.some((c) => a2 instanceof c)) return false;
  return a2.constructor === b.constructor;
}
function makeError(variant, file, module, line, fn, message2, extra) {
  let error = new globalThis.Error(message2);
  error.gleam_error = variant;
  error.file = file;
  error.module = module;
  error.line = line;
  error.function = fn;
  error.fn = fn;
  for (let k in extra) error[k] = extra[k];
  return error;
}

// build/dev/javascript/gleam_stdlib/gleam/option.mjs
var Some = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var None = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/dict.mjs
var SHIFT = 5;
var BUCKET_SIZE = Math.pow(2, SHIFT);
var MASK = BUCKET_SIZE - 1;
var MAX_INDEX_NODE = BUCKET_SIZE / 2;
var MIN_ARRAY_NODE = BUCKET_SIZE / 4;

// build/dev/javascript/gleam_stdlib/gleam/order.mjs
var Lt = class extends CustomType {
};
var Eq = class extends CustomType {
};
var Gt = class extends CustomType {
};

// build/dev/javascript/gleam_stdlib/gleam/string.mjs
function concat_loop(loop$strings, loop$accumulator) {
  while (true) {
    let strings = loop$strings;
    let accumulator = loop$accumulator;
    if (strings instanceof Empty) {
      return accumulator;
    } else {
      let string5 = strings.head;
      let strings$1 = strings.tail;
      loop$strings = strings$1;
      loop$accumulator = accumulator + string5;
    }
  }
}
function concat2(strings) {
  return concat_loop(strings, "");
}
function split2(x, substring) {
  if (substring === "") {
    return graphemes(x);
  } else {
    let _pipe = x;
    let _pipe$1 = identity(_pipe);
    let _pipe$2 = split(_pipe$1, substring);
    return map(_pipe$2, identity);
  }
}

// build/dev/javascript/gleam_stdlib/gleam/dynamic/decode.mjs
var Decoder = class extends CustomType {
  constructor(function$) {
    super();
    this.function = function$;
  }
};
function run(data, decoder) {
  let $ = decoder.function(data);
  let maybe_invalid_data;
  let errors;
  maybe_invalid_data = $[0];
  errors = $[1];
  if (errors instanceof Empty) {
    return new Ok(maybe_invalid_data);
  } else {
    return new Error(errors);
  }
}
function success(data) {
  return new Decoder((_) => {
    return [data, toList([])];
  });
}
function map2(decoder, transformer) {
  return new Decoder(
    (d) => {
      let $ = decoder.function(d);
      let data;
      let errors;
      data = $[0];
      errors = $[1];
      return [transformer(data), errors];
    }
  );
}

// build/dev/javascript/gleam_stdlib/gleam_stdlib.mjs
function identity(x) {
  return x;
}
function to_string(term) {
  return term.toString();
}
function graphemes(string5) {
  const iterator = graphemes_iterator(string5);
  if (iterator) {
    return List.fromArray(Array.from(iterator).map((item) => item.segment));
  } else {
    return List.fromArray(string5.match(/./gsu));
  }
}
var segmenter = void 0;
function graphemes_iterator(string5) {
  if (globalThis.Intl && Intl.Segmenter) {
    segmenter ||= new Intl.Segmenter();
    return segmenter.segment(string5)[Symbol.iterator]();
  }
}
function split(xs, pattern) {
  return List.fromArray(xs.split(pattern));
}
function starts_with(haystack, needle) {
  return haystack.startsWith(needle);
}
var unicode_whitespaces = [
  " ",
  // Space
  "	",
  // Horizontal tab
  "\n",
  // Line feed
  "\v",
  // Vertical tab
  "\f",
  // Form feed
  "\r",
  // Carriage return
  "\x85",
  // Next line
  "\u2028",
  // Line separator
  "\u2029"
  // Paragraph separator
].join("");
var trim_start_regex = /* @__PURE__ */ new RegExp(
  `^[${unicode_whitespaces}]*`
);
var trim_end_regex = /* @__PURE__ */ new RegExp(`[${unicode_whitespaces}]*$`);

// build/dev/javascript/gleam_stdlib/gleam/list.mjs
var Ascending = class extends CustomType {
};
var Descending = class extends CustomType {
};
function reverse_and_prepend(loop$prefix, loop$suffix) {
  while (true) {
    let prefix = loop$prefix;
    let suffix = loop$suffix;
    if (prefix instanceof Empty) {
      return suffix;
    } else {
      let first$1 = prefix.head;
      let rest$1 = prefix.tail;
      loop$prefix = rest$1;
      loop$suffix = prepend(first$1, suffix);
    }
  }
}
function reverse(list4) {
  return reverse_and_prepend(list4, toList([]));
}
function filter_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list4 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      let _block;
      let $ = fun(first$1);
      if ($) {
        _block = prepend(first$1, acc);
      } else {
        _block = acc;
      }
      let new_acc = _block;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = new_acc;
    }
  }
}
function filter(list4, predicate) {
  return filter_loop(list4, predicate, toList([]));
}
function map_loop(loop$list, loop$fun, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let fun = loop$fun;
    let acc = loop$acc;
    if (list4 instanceof Empty) {
      return reverse(acc);
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      loop$list = rest$1;
      loop$fun = fun;
      loop$acc = prepend(fun(first$1), acc);
    }
  }
}
function map(list4, fun) {
  return map_loop(list4, fun, toList([]));
}
function append_loop(loop$first, loop$second) {
  while (true) {
    let first = loop$first;
    let second2 = loop$second;
    if (first instanceof Empty) {
      return second2;
    } else {
      let first$1 = first.head;
      let rest$1 = first.tail;
      loop$first = rest$1;
      loop$second = prepend(first$1, second2);
    }
  }
}
function append2(first, second2) {
  return append_loop(reverse(first), second2);
}
function fold2(loop$list, loop$initial, loop$fun) {
  while (true) {
    let list4 = loop$list;
    let initial = loop$initial;
    let fun = loop$fun;
    if (list4 instanceof Empty) {
      return initial;
    } else {
      let first$1 = list4.head;
      let rest$1 = list4.tail;
      loop$list = rest$1;
      loop$initial = fun(initial, first$1);
      loop$fun = fun;
    }
  }
}
function sequences(loop$list, loop$compare, loop$growing, loop$direction, loop$prev, loop$acc) {
  while (true) {
    let list4 = loop$list;
    let compare5 = loop$compare;
    let growing = loop$growing;
    let direction = loop$direction;
    let prev = loop$prev;
    let acc = loop$acc;
    let growing$1 = prepend(prev, growing);
    if (list4 instanceof Empty) {
      if (direction instanceof Ascending) {
        return prepend(reverse(growing$1), acc);
      } else {
        return prepend(growing$1, acc);
      }
    } else {
      let new$1 = list4.head;
      let rest$1 = list4.tail;
      let $ = compare5(prev, new$1);
      if (direction instanceof Ascending) {
        if ($ instanceof Lt) {
          loop$list = rest$1;
          loop$compare = compare5;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else if ($ instanceof Eq) {
          loop$list = rest$1;
          loop$compare = compare5;
          loop$growing = growing$1;
          loop$direction = direction;
          loop$prev = new$1;
          loop$acc = acc;
        } else {
          let _block;
          if (direction instanceof Ascending) {
            _block = prepend(reverse(growing$1), acc);
          } else {
            _block = prepend(growing$1, acc);
          }
          let acc$1 = _block;
          if (rest$1 instanceof Empty) {
            return prepend(toList([new$1]), acc$1);
          } else {
            let next = rest$1.head;
            let rest$2 = rest$1.tail;
            let _block$1;
            let $1 = compare5(new$1, next);
            if ($1 instanceof Lt) {
              _block$1 = new Ascending();
            } else if ($1 instanceof Eq) {
              _block$1 = new Ascending();
            } else {
              _block$1 = new Descending();
            }
            let direction$1 = _block$1;
            loop$list = rest$2;
            loop$compare = compare5;
            loop$growing = toList([new$1]);
            loop$direction = direction$1;
            loop$prev = next;
            loop$acc = acc$1;
          }
        }
      } else if ($ instanceof Lt) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare5(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending();
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending();
          } else {
            _block$1 = new Descending();
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare5;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else if ($ instanceof Eq) {
        let _block;
        if (direction instanceof Ascending) {
          _block = prepend(reverse(growing$1), acc);
        } else {
          _block = prepend(growing$1, acc);
        }
        let acc$1 = _block;
        if (rest$1 instanceof Empty) {
          return prepend(toList([new$1]), acc$1);
        } else {
          let next = rest$1.head;
          let rest$2 = rest$1.tail;
          let _block$1;
          let $1 = compare5(new$1, next);
          if ($1 instanceof Lt) {
            _block$1 = new Ascending();
          } else if ($1 instanceof Eq) {
            _block$1 = new Ascending();
          } else {
            _block$1 = new Descending();
          }
          let direction$1 = _block$1;
          loop$list = rest$2;
          loop$compare = compare5;
          loop$growing = toList([new$1]);
          loop$direction = direction$1;
          loop$prev = next;
          loop$acc = acc$1;
        }
      } else {
        loop$list = rest$1;
        loop$compare = compare5;
        loop$growing = growing$1;
        loop$direction = direction;
        loop$prev = new$1;
        loop$acc = acc;
      }
    }
  }
}
function merge_ascendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list22 = loop$list2;
    let compare5 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list4 = list22;
      return reverse_and_prepend(list4, acc);
    } else if (list22 instanceof Empty) {
      let list4 = list1;
      return reverse_and_prepend(list4, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list22.head;
      let rest2 = list22.tail;
      let $ = compare5(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare5;
        loop$acc = prepend(first1, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare5;
        loop$acc = prepend(first2, acc);
      } else {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare5;
        loop$acc = prepend(first2, acc);
      }
    }
  }
}
function merge_ascending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare5 = loop$compare;
    let acc = loop$acc;
    if (sequences2 instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let ascending1 = sequences2.head;
        let ascending2 = $.head;
        let rest$1 = $.tail;
        let descending = merge_ascendings(
          ascending1,
          ascending2,
          compare5,
          toList([])
        );
        loop$sequences = rest$1;
        loop$compare = compare5;
        loop$acc = prepend(descending, acc);
      }
    }
  }
}
function merge_descendings(loop$list1, loop$list2, loop$compare, loop$acc) {
  while (true) {
    let list1 = loop$list1;
    let list22 = loop$list2;
    let compare5 = loop$compare;
    let acc = loop$acc;
    if (list1 instanceof Empty) {
      let list4 = list22;
      return reverse_and_prepend(list4, acc);
    } else if (list22 instanceof Empty) {
      let list4 = list1;
      return reverse_and_prepend(list4, acc);
    } else {
      let first1 = list1.head;
      let rest1 = list1.tail;
      let first2 = list22.head;
      let rest2 = list22.tail;
      let $ = compare5(first1, first2);
      if ($ instanceof Lt) {
        loop$list1 = list1;
        loop$list2 = rest2;
        loop$compare = compare5;
        loop$acc = prepend(first2, acc);
      } else if ($ instanceof Eq) {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare5;
        loop$acc = prepend(first1, acc);
      } else {
        loop$list1 = rest1;
        loop$list2 = list22;
        loop$compare = compare5;
        loop$acc = prepend(first1, acc);
      }
    }
  }
}
function merge_descending_pairs(loop$sequences, loop$compare, loop$acc) {
  while (true) {
    let sequences2 = loop$sequences;
    let compare5 = loop$compare;
    let acc = loop$acc;
    if (sequences2 instanceof Empty) {
      return reverse(acc);
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(prepend(reverse(sequence), acc));
      } else {
        let descending1 = sequences2.head;
        let descending2 = $.head;
        let rest$1 = $.tail;
        let ascending = merge_descendings(
          descending1,
          descending2,
          compare5,
          toList([])
        );
        loop$sequences = rest$1;
        loop$compare = compare5;
        loop$acc = prepend(ascending, acc);
      }
    }
  }
}
function merge_all(loop$sequences, loop$direction, loop$compare) {
  while (true) {
    let sequences2 = loop$sequences;
    let direction = loop$direction;
    let compare5 = loop$compare;
    if (sequences2 instanceof Empty) {
      return sequences2;
    } else if (direction instanceof Ascending) {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return sequence;
      } else {
        let sequences$1 = merge_ascending_pairs(sequences2, compare5, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Descending();
        loop$compare = compare5;
      }
    } else {
      let $ = sequences2.tail;
      if ($ instanceof Empty) {
        let sequence = sequences2.head;
        return reverse(sequence);
      } else {
        let sequences$1 = merge_descending_pairs(sequences2, compare5, toList([]));
        loop$sequences = sequences$1;
        loop$direction = new Ascending();
        loop$compare = compare5;
      }
    }
  }
}
function sort(list4, compare5) {
  if (list4 instanceof Empty) {
    return list4;
  } else {
    let $ = list4.tail;
    if ($ instanceof Empty) {
      return list4;
    } else {
      let x = list4.head;
      let y = $.head;
      let rest$1 = $.tail;
      let _block;
      let $1 = compare5(x, y);
      if ($1 instanceof Lt) {
        _block = new Ascending();
      } else if ($1 instanceof Eq) {
        _block = new Ascending();
      } else {
        _block = new Descending();
      }
      let direction = _block;
      let sequences$1 = sequences(
        rest$1,
        compare5,
        toList([x]),
        direction,
        y,
        toList([])
      );
      return merge_all(sequences$1, new Ascending(), compare5);
    }
  }
}

// build/dev/javascript/gleam_stdlib/gleam/result.mjs
function map3(result, fun) {
  if (result instanceof Ok) {
    let x = result[0];
    return new Ok(fun(x));
  } else {
    return result;
  }
}
function unwrap(result, default$) {
  if (result instanceof Ok) {
    let v = result[0];
    return v;
  } else {
    return default$;
  }
}

// build/dev/javascript/gleam_stdlib/gleam/uri.mjs
var Uri = class extends CustomType {
  constructor(scheme, userinfo, host, port, path, query, fragment3) {
    super();
    this.scheme = scheme;
    this.userinfo = userinfo;
    this.host = host;
    this.port = port;
    this.path = path;
    this.query = query;
    this.fragment = fragment3;
  }
};
function remove_dot_segments_loop(loop$input, loop$accumulator) {
  while (true) {
    let input = loop$input;
    let accumulator = loop$accumulator;
    if (input instanceof Empty) {
      return reverse(accumulator);
    } else {
      let segment = input.head;
      let rest = input.tail;
      let _block;
      if (segment === "") {
        _block = accumulator;
      } else if (segment === ".") {
        _block = accumulator;
      } else if (segment === "..") {
        if (accumulator instanceof Empty) {
          _block = accumulator;
        } else {
          let accumulator$12 = accumulator.tail;
          _block = accumulator$12;
        }
      } else {
        let segment$1 = segment;
        let accumulator$12 = accumulator;
        _block = prepend(segment$1, accumulator$12);
      }
      let accumulator$1 = _block;
      loop$input = rest;
      loop$accumulator = accumulator$1;
    }
  }
}
function remove_dot_segments(input) {
  return remove_dot_segments_loop(input, toList([]));
}
function path_segments(path) {
  return remove_dot_segments(split2(path, "/"));
}

// build/dev/javascript/gleam_stdlib/gleam/bool.mjs
function guard(requirement, consequence, alternative) {
  if (requirement) {
    return consequence;
  } else {
    return alternative();
  }
}

// build/dev/javascript/gleam_stdlib/gleam/function.mjs
function identity2(x) {
  return x;
}

// build/dev/javascript/lustre/lustre/internals/constants.ffi.mjs
var document2 = () => globalThis?.document;
var NAMESPACE_HTML = "http://www.w3.org/1999/xhtml";
var ELEMENT_NODE = 1;
var TEXT_NODE = 3;
var SUPPORTS_MOVE_BEFORE = !!globalThis.HTMLElement?.prototype?.moveBefore;

// build/dev/javascript/lustre/lustre/internals/constants.mjs
var empty_list = /* @__PURE__ */ toList([]);
var option_none = /* @__PURE__ */ new None();

// build/dev/javascript/lustre/lustre/vdom/vattr.ffi.mjs
var GT = /* @__PURE__ */ new Gt();
var LT = /* @__PURE__ */ new Lt();
var EQ = /* @__PURE__ */ new Eq();
function compare3(a2, b) {
  if (a2.name === b.name) {
    return EQ;
  } else if (a2.name < b.name) {
    return LT;
  } else {
    return GT;
  }
}

// build/dev/javascript/lustre/lustre/vdom/vattr.mjs
var Attribute = class extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
};
var Property = class extends CustomType {
  constructor(kind, name, value) {
    super();
    this.kind = kind;
    this.name = name;
    this.value = value;
  }
};
var Event2 = class extends CustomType {
  constructor(kind, name, handler, include, prevent_default, stop_propagation, immediate, debounce, throttle) {
    super();
    this.kind = kind;
    this.name = name;
    this.handler = handler;
    this.include = include;
    this.prevent_default = prevent_default;
    this.stop_propagation = stop_propagation;
    this.immediate = immediate;
    this.debounce = debounce;
    this.throttle = throttle;
  }
};
var Handler = class extends CustomType {
  constructor(prevent_default, stop_propagation, message2) {
    super();
    this.prevent_default = prevent_default;
    this.stop_propagation = stop_propagation;
    this.message = message2;
  }
};
var Never = class extends CustomType {
  constructor(kind) {
    super();
    this.kind = kind;
  }
};
function merge(loop$attributes, loop$merged) {
  while (true) {
    let attributes = loop$attributes;
    let merged = loop$merged;
    if (attributes instanceof Empty) {
      return merged;
    } else {
      let $ = attributes.head;
      if ($ instanceof Attribute) {
        let $1 = $.name;
        if ($1 === "") {
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = merged;
        } else if ($1 === "class") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "class") {
                  let kind = $.kind;
                  let class1 = $2;
                  let rest = $3.tail;
                  let class2 = $4.value;
                  let value = class1 + " " + class2;
                  let attribute$1 = new Attribute(kind, "class", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else if ($1 === "style") {
          let $2 = $.value;
          if ($2 === "") {
            let rest = attributes.tail;
            loop$attributes = rest;
            loop$merged = merged;
          } else {
            let $3 = attributes.tail;
            if ($3 instanceof Empty) {
              let attribute$1 = $;
              let rest = $3;
              loop$attributes = rest;
              loop$merged = prepend(attribute$1, merged);
            } else {
              let $4 = $3.head;
              if ($4 instanceof Attribute) {
                let $5 = $4.name;
                if ($5 === "style") {
                  let kind = $.kind;
                  let style1 = $2;
                  let rest = $3.tail;
                  let style2 = $4.value;
                  let value = style1 + ";" + style2;
                  let attribute$1 = new Attribute(kind, "style", value);
                  loop$attributes = prepend(attribute$1, rest);
                  loop$merged = merged;
                } else {
                  let attribute$1 = $;
                  let rest = $3;
                  loop$attributes = rest;
                  loop$merged = prepend(attribute$1, merged);
                }
              } else {
                let attribute$1 = $;
                let rest = $3;
                loop$attributes = rest;
                loop$merged = prepend(attribute$1, merged);
              }
            }
          }
        } else {
          let attribute$1 = $;
          let rest = attributes.tail;
          loop$attributes = rest;
          loop$merged = prepend(attribute$1, merged);
        }
      } else {
        let attribute$1 = $;
        let rest = attributes.tail;
        loop$attributes = rest;
        loop$merged = prepend(attribute$1, merged);
      }
    }
  }
}
function prepare(attributes) {
  if (attributes instanceof Empty) {
    return attributes;
  } else {
    let $ = attributes.tail;
    if ($ instanceof Empty) {
      return attributes;
    } else {
      let _pipe = attributes;
      let _pipe$1 = sort(_pipe, (a2, b) => {
        return compare3(b, a2);
      });
      return merge(_pipe$1, empty_list);
    }
  }
}
var attribute_kind = 0;
function attribute(name, value) {
  return new Attribute(attribute_kind, name, value);
}
var property_kind = 1;
var event_kind = 2;
function event(name, handler, include, prevent_default, stop_propagation, immediate, debounce, throttle) {
  return new Event2(
    event_kind,
    name,
    handler,
    include,
    prevent_default,
    stop_propagation,
    immediate,
    debounce,
    throttle
  );
}
var never_kind = 0;
var never = /* @__PURE__ */ new Never(never_kind);
var always_kind = 2;

// build/dev/javascript/lustre/lustre/attribute.mjs
function attribute2(name, value) {
  return attribute(name, value);
}
function class$(name) {
  return attribute2("class", name);
}
function style(property3, value) {
  if (property3 === "") {
    return class$("");
  } else if (value === "") {
    return class$("");
  } else {
    return attribute2("style", property3 + ":" + value + ";");
  }
}
function href(url) {
  return attribute2("href", url);
}
function alt(text3) {
  return attribute2("alt", text3);
}
function src(url) {
  return attribute2("src", url);
}

// build/dev/javascript/lustre/lustre/effect.mjs
var Effect = class extends CustomType {
  constructor(synchronous, before_paint2, after_paint) {
    super();
    this.synchronous = synchronous;
    this.before_paint = before_paint2;
    this.after_paint = after_paint;
  }
};
var empty = /* @__PURE__ */ new Effect(
  /* @__PURE__ */ toList([]),
  /* @__PURE__ */ toList([]),
  /* @__PURE__ */ toList([])
);
function none() {
  return empty;
}
function from(effect) {
  let task = (actions) => {
    let dispatch = actions.dispatch;
    return effect(dispatch);
  };
  return new Effect(toList([task]), empty.before_paint, empty.after_paint);
}

// build/dev/javascript/lustre/lustre/internals/mutable_map.ffi.mjs
function empty2() {
  return null;
}
function get(map4, key) {
  const value = map4?.get(key);
  if (value != null) {
    return new Ok(value);
  } else {
    return new Error(void 0);
  }
}
function has_key2(map4, key) {
  return map4 && map4.has(key);
}
function insert2(map4, key, value) {
  map4 ??= /* @__PURE__ */ new Map();
  map4.set(key, value);
  return map4;
}
function remove(map4, key) {
  map4?.delete(key);
  return map4;
}

// build/dev/javascript/lustre/lustre/vdom/path.mjs
var Root = class extends CustomType {
};
var Key = class extends CustomType {
  constructor(key, parent) {
    super();
    this.key = key;
    this.parent = parent;
  }
};
var Index = class extends CustomType {
  constructor(index2, parent) {
    super();
    this.index = index2;
    this.parent = parent;
  }
};
function do_matches(loop$path, loop$candidates) {
  while (true) {
    let path = loop$path;
    let candidates = loop$candidates;
    if (candidates instanceof Empty) {
      return false;
    } else {
      let candidate = candidates.head;
      let rest = candidates.tail;
      let $ = starts_with(path, candidate);
      if ($) {
        return $;
      } else {
        loop$path = path;
        loop$candidates = rest;
      }
    }
  }
}
function add2(parent, index2, key) {
  if (key === "") {
    return new Index(index2, parent);
  } else {
    return new Key(key, parent);
  }
}
var root2 = /* @__PURE__ */ new Root();
var separator_element = "	";
function do_to_string(loop$path, loop$acc) {
  while (true) {
    let path = loop$path;
    let acc = loop$acc;
    if (path instanceof Root) {
      if (acc instanceof Empty) {
        return "";
      } else {
        let segments = acc.tail;
        return concat2(segments);
      }
    } else if (path instanceof Key) {
      let key = path.key;
      let parent = path.parent;
      loop$path = parent;
      loop$acc = prepend(separator_element, prepend(key, acc));
    } else {
      let index2 = path.index;
      let parent = path.parent;
      loop$path = parent;
      loop$acc = prepend(
        separator_element,
        prepend(to_string(index2), acc)
      );
    }
  }
}
function to_string2(path) {
  return do_to_string(path, toList([]));
}
function matches(path, candidates) {
  if (candidates instanceof Empty) {
    return false;
  } else {
    return do_matches(to_string2(path), candidates);
  }
}
var separator_event = "\n";
function event2(path, event4) {
  return do_to_string(path, toList([separator_event, event4]));
}

// build/dev/javascript/lustre/lustre/vdom/vnode.mjs
var Fragment = class extends CustomType {
  constructor(kind, key, mapper, children, keyed_children) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.children = children;
    this.keyed_children = keyed_children;
  }
};
var Element = class extends CustomType {
  constructor(kind, key, mapper, namespace, tag, attributes, children, keyed_children, self_closing, void$) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.namespace = namespace;
    this.tag = tag;
    this.attributes = attributes;
    this.children = children;
    this.keyed_children = keyed_children;
    this.self_closing = self_closing;
    this.void = void$;
  }
};
var Text = class extends CustomType {
  constructor(kind, key, mapper, content) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.content = content;
  }
};
var UnsafeInnerHtml = class extends CustomType {
  constructor(kind, key, mapper, namespace, tag, attributes, inner_html) {
    super();
    this.kind = kind;
    this.key = key;
    this.mapper = mapper;
    this.namespace = namespace;
    this.tag = tag;
    this.attributes = attributes;
    this.inner_html = inner_html;
  }
};
function is_void_element(tag, namespace) {
  if (namespace === "") {
    if (tag === "area") {
      return true;
    } else if (tag === "base") {
      return true;
    } else if (tag === "br") {
      return true;
    } else if (tag === "col") {
      return true;
    } else if (tag === "embed") {
      return true;
    } else if (tag === "hr") {
      return true;
    } else if (tag === "img") {
      return true;
    } else if (tag === "input") {
      return true;
    } else if (tag === "link") {
      return true;
    } else if (tag === "meta") {
      return true;
    } else if (tag === "param") {
      return true;
    } else if (tag === "source") {
      return true;
    } else if (tag === "track") {
      return true;
    } else if (tag === "wbr") {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}
function to_keyed(key, node) {
  if (node instanceof Fragment) {
    return new Fragment(
      node.kind,
      key,
      node.mapper,
      node.children,
      node.keyed_children
    );
  } else if (node instanceof Element) {
    return new Element(
      node.kind,
      key,
      node.mapper,
      node.namespace,
      node.tag,
      node.attributes,
      node.children,
      node.keyed_children,
      node.self_closing,
      node.void
    );
  } else if (node instanceof Text) {
    return new Text(node.kind, key, node.mapper, node.content);
  } else {
    return new UnsafeInnerHtml(
      node.kind,
      key,
      node.mapper,
      node.namespace,
      node.tag,
      node.attributes,
      node.inner_html
    );
  }
}
var fragment_kind = 0;
function fragment(key, mapper, children, keyed_children) {
  return new Fragment(fragment_kind, key, mapper, children, keyed_children);
}
var element_kind = 1;
function element(key, mapper, namespace, tag, attributes, children, keyed_children, self_closing, void$) {
  return new Element(
    element_kind,
    key,
    mapper,
    namespace,
    tag,
    prepare(attributes),
    children,
    keyed_children,
    self_closing,
    void$ || is_void_element(tag, namespace)
  );
}
var text_kind = 2;
function text(key, mapper, content) {
  return new Text(text_kind, key, mapper, content);
}
var unsafe_inner_html_kind = 3;

// build/dev/javascript/lustre/lustre/internals/equals.ffi.mjs
var isReferenceEqual = (a2, b) => a2 === b;
var isEqual2 = (a2, b) => {
  if (a2 === b) {
    return true;
  }
  if (a2 == null || b == null) {
    return false;
  }
  const type = typeof a2;
  if (type !== typeof b) {
    return false;
  }
  if (type !== "object") {
    return false;
  }
  const ctor = a2.constructor;
  if (ctor !== b.constructor) {
    return false;
  }
  if (Array.isArray(a2)) {
    return areArraysEqual(a2, b);
  }
  return areObjectsEqual(a2, b);
};
var areArraysEqual = (a2, b) => {
  let index2 = a2.length;
  if (index2 !== b.length) {
    return false;
  }
  while (index2--) {
    if (!isEqual2(a2[index2], b[index2])) {
      return false;
    }
  }
  return true;
};
var areObjectsEqual = (a2, b) => {
  const properties = Object.keys(a2);
  let index2 = properties.length;
  if (Object.keys(b).length !== index2) {
    return false;
  }
  while (index2--) {
    const property3 = properties[index2];
    if (!Object.hasOwn(b, property3)) {
      return false;
    }
    if (!isEqual2(a2[property3], b[property3])) {
      return false;
    }
  }
  return true;
};

// build/dev/javascript/lustre/lustre/vdom/events.mjs
var Events = class extends CustomType {
  constructor(handlers, dispatched_paths, next_dispatched_paths) {
    super();
    this.handlers = handlers;
    this.dispatched_paths = dispatched_paths;
    this.next_dispatched_paths = next_dispatched_paths;
  }
};
function new$3() {
  return new Events(
    empty2(),
    empty_list,
    empty_list
  );
}
function tick(events) {
  return new Events(
    events.handlers,
    events.next_dispatched_paths,
    empty_list
  );
}
function do_remove_event(handlers, path, name) {
  return remove(handlers, event2(path, name));
}
function remove_event(events, path, name) {
  let handlers = do_remove_event(events.handlers, path, name);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function remove_attributes(handlers, path, attributes) {
  return fold2(
    attributes,
    handlers,
    (events, attribute3) => {
      if (attribute3 instanceof Event2) {
        let name = attribute3.name;
        return do_remove_event(events, path, name);
      } else {
        return events;
      }
    }
  );
}
function handle(events, path, name, event4) {
  let next_dispatched_paths = prepend(path, events.next_dispatched_paths);
  let events$1 = new Events(
    events.handlers,
    events.dispatched_paths,
    next_dispatched_paths
  );
  let $ = get(
    events$1.handlers,
    path + separator_event + name
  );
  if ($ instanceof Ok) {
    let handler = $[0];
    return [events$1, run(event4, handler)];
  } else {
    return [events$1, new Error(toList([]))];
  }
}
function has_dispatched_events(events, path) {
  return matches(path, events.dispatched_paths);
}
function do_add_event(handlers, mapper, path, name, handler) {
  return insert2(
    handlers,
    event2(path, name),
    map2(
      handler,
      (handler2) => {
        return new Handler(
          handler2.prevent_default,
          handler2.stop_propagation,
          identity2(mapper)(handler2.message)
        );
      }
    )
  );
}
function add_event(events, mapper, path, name, handler) {
  let handlers = do_add_event(events.handlers, mapper, path, name, handler);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function add_attributes(handlers, mapper, path, attributes) {
  return fold2(
    attributes,
    handlers,
    (events, attribute3) => {
      if (attribute3 instanceof Event2) {
        let name = attribute3.name;
        let handler = attribute3.handler;
        return do_add_event(events, mapper, path, name, handler);
      } else {
        return events;
      }
    }
  );
}
function compose_mapper(mapper, child_mapper) {
  let $ = isReferenceEqual(mapper, identity2);
  let $1 = isReferenceEqual(child_mapper, identity2);
  if ($1) {
    return mapper;
  } else if ($) {
    return child_mapper;
  } else {
    return (msg) => {
      return mapper(child_mapper(msg));
    };
  }
}
function do_remove_children(loop$handlers, loop$path, loop$child_index, loop$children) {
  while (true) {
    let handlers = loop$handlers;
    let path = loop$path;
    let child_index = loop$child_index;
    let children = loop$children;
    if (children instanceof Empty) {
      return handlers;
    } else {
      let child = children.head;
      let rest = children.tail;
      let _pipe = handlers;
      let _pipe$1 = do_remove_child(_pipe, path, child_index, child);
      loop$handlers = _pipe$1;
      loop$path = path;
      loop$child_index = child_index + 1;
      loop$children = rest;
    }
  }
}
function do_remove_child(handlers, parent, child_index, child) {
  if (child instanceof Fragment) {
    let children = child.children;
    let path = add2(parent, child_index, child.key);
    return do_remove_children(handlers, path, 0, children);
  } else if (child instanceof Element) {
    let attributes = child.attributes;
    let children = child.children;
    let path = add2(parent, child_index, child.key);
    let _pipe = handlers;
    let _pipe$1 = remove_attributes(_pipe, path, attributes);
    return do_remove_children(_pipe$1, path, 0, children);
  } else if (child instanceof Text) {
    return handlers;
  } else {
    let attributes = child.attributes;
    let path = add2(parent, child_index, child.key);
    return remove_attributes(handlers, path, attributes);
  }
}
function remove_child(events, parent, child_index, child) {
  let handlers = do_remove_child(events.handlers, parent, child_index, child);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function do_add_children(loop$handlers, loop$mapper, loop$path, loop$child_index, loop$children) {
  while (true) {
    let handlers = loop$handlers;
    let mapper = loop$mapper;
    let path = loop$path;
    let child_index = loop$child_index;
    let children = loop$children;
    if (children instanceof Empty) {
      return handlers;
    } else {
      let child = children.head;
      let rest = children.tail;
      let _pipe = handlers;
      let _pipe$1 = do_add_child(_pipe, mapper, path, child_index, child);
      loop$handlers = _pipe$1;
      loop$mapper = mapper;
      loop$path = path;
      loop$child_index = child_index + 1;
      loop$children = rest;
    }
  }
}
function do_add_child(handlers, mapper, parent, child_index, child) {
  if (child instanceof Fragment) {
    let children = child.children;
    let path = add2(parent, child_index, child.key);
    let composed_mapper = compose_mapper(mapper, child.mapper);
    return do_add_children(handlers, composed_mapper, path, 0, children);
  } else if (child instanceof Element) {
    let attributes = child.attributes;
    let children = child.children;
    let path = add2(parent, child_index, child.key);
    let composed_mapper = compose_mapper(mapper, child.mapper);
    let _pipe = handlers;
    let _pipe$1 = add_attributes(_pipe, composed_mapper, path, attributes);
    return do_add_children(_pipe$1, composed_mapper, path, 0, children);
  } else if (child instanceof Text) {
    return handlers;
  } else {
    let attributes = child.attributes;
    let path = add2(parent, child_index, child.key);
    let composed_mapper = compose_mapper(mapper, child.mapper);
    return add_attributes(handlers, composed_mapper, path, attributes);
  }
}
function add_child(events, mapper, parent, index2, child) {
  let handlers = do_add_child(events.handlers, mapper, parent, index2, child);
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}
function add_children(events, mapper, path, child_index, children) {
  let handlers = do_add_children(
    events.handlers,
    mapper,
    path,
    child_index,
    children
  );
  return new Events(
    handlers,
    events.dispatched_paths,
    events.next_dispatched_paths
  );
}

// build/dev/javascript/lustre/lustre/element.mjs
function element2(tag, attributes, children) {
  return element(
    "",
    identity2,
    "",
    tag,
    attributes,
    children,
    empty2(),
    false,
    false
  );
}
function text2(content) {
  return text("", identity2, content);
}
function none2() {
  return text("", identity2, "");
}

// build/dev/javascript/lustre/lustre/element/html.mjs
function footer(attrs, children) {
  return element2("footer", attrs, children);
}
function h1(attrs, children) {
  return element2("h1", attrs, children);
}
function h2(attrs, children) {
  return element2("h2", attrs, children);
}
function h3(attrs, children) {
  return element2("h3", attrs, children);
}
function h4(attrs, children) {
  return element2("h4", attrs, children);
}
function main(attrs, children) {
  return element2("main", attrs, children);
}
function nav(attrs, children) {
  return element2("nav", attrs, children);
}
function section(attrs, children) {
  return element2("section", attrs, children);
}
function div(attrs, children) {
  return element2("div", attrs, children);
}
function figcaption(attrs, children) {
  return element2("figcaption", attrs, children);
}
function figure(attrs, children) {
  return element2("figure", attrs, children);
}
function li(attrs, children) {
  return element2("li", attrs, children);
}
function p(attrs, children) {
  return element2("p", attrs, children);
}
function ul(attrs, children) {
  return element2("ul", attrs, children);
}
function a(attrs, children) {
  return element2("a", attrs, children);
}
function br(attrs) {
  return element2("br", attrs, empty_list);
}
function img(attrs) {
  return element2("img", attrs, empty_list);
}
function button(attrs, children) {
  return element2("button", attrs, children);
}
function dialog(attrs, children) {
  return element2("dialog", attrs, children);
}

// build/dev/javascript/lustre/lustre/vdom/patch.mjs
var Patch = class extends CustomType {
  constructor(index2, removed, changes, children) {
    super();
    this.index = index2;
    this.removed = removed;
    this.changes = changes;
    this.children = children;
  }
};
var ReplaceText = class extends CustomType {
  constructor(kind, content) {
    super();
    this.kind = kind;
    this.content = content;
  }
};
var ReplaceInnerHtml = class extends CustomType {
  constructor(kind, inner_html) {
    super();
    this.kind = kind;
    this.inner_html = inner_html;
  }
};
var Update = class extends CustomType {
  constructor(kind, added, removed) {
    super();
    this.kind = kind;
    this.added = added;
    this.removed = removed;
  }
};
var Move = class extends CustomType {
  constructor(kind, key, before) {
    super();
    this.kind = kind;
    this.key = key;
    this.before = before;
  }
};
var Replace = class extends CustomType {
  constructor(kind, index2, with$) {
    super();
    this.kind = kind;
    this.index = index2;
    this.with = with$;
  }
};
var Remove = class extends CustomType {
  constructor(kind, index2) {
    super();
    this.kind = kind;
    this.index = index2;
  }
};
var Insert = class extends CustomType {
  constructor(kind, children, before) {
    super();
    this.kind = kind;
    this.children = children;
    this.before = before;
  }
};
function new$5(index2, removed, changes, children) {
  return new Patch(index2, removed, changes, children);
}
var replace_text_kind = 0;
function replace_text(content) {
  return new ReplaceText(replace_text_kind, content);
}
var replace_inner_html_kind = 1;
function replace_inner_html(inner_html) {
  return new ReplaceInnerHtml(replace_inner_html_kind, inner_html);
}
var update_kind = 2;
function update(added, removed) {
  return new Update(update_kind, added, removed);
}
var move_kind = 3;
function move(key, before) {
  return new Move(move_kind, key, before);
}
var remove_kind = 4;
function remove2(index2) {
  return new Remove(remove_kind, index2);
}
var replace_kind = 5;
function replace2(index2, with$) {
  return new Replace(replace_kind, index2, with$);
}
var insert_kind = 6;
function insert3(children, before) {
  return new Insert(insert_kind, children, before);
}

// build/dev/javascript/lustre/lustre/vdom/diff.mjs
var Diff = class extends CustomType {
  constructor(patch, events) {
    super();
    this.patch = patch;
    this.events = events;
  }
};
var AttributeChange = class extends CustomType {
  constructor(added, removed, events) {
    super();
    this.added = added;
    this.removed = removed;
    this.events = events;
  }
};
function is_controlled(events, namespace, tag, path) {
  if (tag === "input" && namespace === "") {
    return has_dispatched_events(events, path);
  } else if (tag === "select" && namespace === "") {
    return has_dispatched_events(events, path);
  } else if (tag === "textarea" && namespace === "") {
    return has_dispatched_events(events, path);
  } else {
    return false;
  }
}
function diff_attributes(loop$controlled, loop$path, loop$mapper, loop$events, loop$old, loop$new, loop$added, loop$removed) {
  while (true) {
    let controlled = loop$controlled;
    let path = loop$path;
    let mapper = loop$mapper;
    let events = loop$events;
    let old = loop$old;
    let new$8 = loop$new;
    let added = loop$added;
    let removed = loop$removed;
    if (new$8 instanceof Empty) {
      if (old instanceof Empty) {
        return new AttributeChange(added, removed, events);
      } else {
        let $ = old.head;
        if ($ instanceof Event2) {
          let prev = $;
          let old$1 = old.tail;
          let name = $.name;
          let removed$1 = prepend(prev, removed);
          let events$1 = remove_event(events, path, name);
          loop$controlled = controlled;
          loop$path = path;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = old$1;
          loop$new = new$8;
          loop$added = added;
          loop$removed = removed$1;
        } else {
          let prev = $;
          let old$1 = old.tail;
          let removed$1 = prepend(prev, removed);
          loop$controlled = controlled;
          loop$path = path;
          loop$mapper = mapper;
          loop$events = events;
          loop$old = old$1;
          loop$new = new$8;
          loop$added = added;
          loop$removed = removed$1;
        }
      }
    } else if (old instanceof Empty) {
      let $ = new$8.head;
      if ($ instanceof Event2) {
        let next = $;
        let new$1 = new$8.tail;
        let name = $.name;
        let handler = $.handler;
        let added$1 = prepend(next, added);
        let events$1 = add_event(events, mapper, path, name, handler);
        loop$controlled = controlled;
        loop$path = path;
        loop$mapper = mapper;
        loop$events = events$1;
        loop$old = old;
        loop$new = new$1;
        loop$added = added$1;
        loop$removed = removed;
      } else {
        let next = $;
        let new$1 = new$8.tail;
        let added$1 = prepend(next, added);
        loop$controlled = controlled;
        loop$path = path;
        loop$mapper = mapper;
        loop$events = events;
        loop$old = old;
        loop$new = new$1;
        loop$added = added$1;
        loop$removed = removed;
      }
    } else {
      let next = new$8.head;
      let remaining_new = new$8.tail;
      let prev = old.head;
      let remaining_old = old.tail;
      let $ = compare3(prev, next);
      if ($ instanceof Lt) {
        if (prev instanceof Event2) {
          let name = prev.name;
          let removed$1 = prepend(prev, removed);
          let events$1 = remove_event(events, path, name);
          loop$controlled = controlled;
          loop$path = path;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = remaining_old;
          loop$new = new$8;
          loop$added = added;
          loop$removed = removed$1;
        } else {
          let removed$1 = prepend(prev, removed);
          loop$controlled = controlled;
          loop$path = path;
          loop$mapper = mapper;
          loop$events = events;
          loop$old = remaining_old;
          loop$new = new$8;
          loop$added = added;
          loop$removed = removed$1;
        }
      } else if ($ instanceof Eq) {
        if (next instanceof Attribute) {
          if (prev instanceof Attribute) {
            let _block;
            let $1 = next.name;
            if ($1 === "value") {
              _block = controlled || prev.value !== next.value;
            } else if ($1 === "checked") {
              _block = controlled || prev.value !== next.value;
            } else if ($1 === "selected") {
              _block = controlled || prev.value !== next.value;
            } else {
              _block = prev.value !== next.value;
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled;
            loop$path = path;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (prev instanceof Event2) {
            let name = prev.name;
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            let events$1 = remove_event(events, path, name);
            loop$controlled = controlled;
            loop$path = path;
            loop$mapper = mapper;
            loop$events = events$1;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          } else {
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            loop$controlled = controlled;
            loop$path = path;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          }
        } else if (next instanceof Property) {
          if (prev instanceof Property) {
            let _block;
            let $1 = next.name;
            if ($1 === "scrollLeft") {
              _block = true;
            } else if ($1 === "scrollRight") {
              _block = true;
            } else if ($1 === "value") {
              _block = controlled || !isEqual2(
                prev.value,
                next.value
              );
            } else if ($1 === "checked") {
              _block = controlled || !isEqual2(
                prev.value,
                next.value
              );
            } else if ($1 === "selected") {
              _block = controlled || !isEqual2(
                prev.value,
                next.value
              );
            } else {
              _block = !isEqual2(prev.value, next.value);
            }
            let has_changes = _block;
            let _block$1;
            if (has_changes) {
              _block$1 = prepend(next, added);
            } else {
              _block$1 = added;
            }
            let added$1 = _block$1;
            loop$controlled = controlled;
            loop$path = path;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed;
          } else if (prev instanceof Event2) {
            let name = prev.name;
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            let events$1 = remove_event(events, path, name);
            loop$controlled = controlled;
            loop$path = path;
            loop$mapper = mapper;
            loop$events = events$1;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          } else {
            let added$1 = prepend(next, added);
            let removed$1 = prepend(prev, removed);
            loop$controlled = controlled;
            loop$path = path;
            loop$mapper = mapper;
            loop$events = events;
            loop$old = remaining_old;
            loop$new = remaining_new;
            loop$added = added$1;
            loop$removed = removed$1;
          }
        } else if (prev instanceof Event2) {
          let name = next.name;
          let handler = next.handler;
          let has_changes = prev.prevent_default.kind !== next.prevent_default.kind || prev.stop_propagation.kind !== next.stop_propagation.kind || prev.immediate !== next.immediate || prev.debounce !== next.debounce || prev.throttle !== next.throttle;
          let _block;
          if (has_changes) {
            _block = prepend(next, added);
          } else {
            _block = added;
          }
          let added$1 = _block;
          let events$1 = add_event(events, mapper, path, name, handler);
          loop$controlled = controlled;
          loop$path = path;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = added$1;
          loop$removed = removed;
        } else {
          let name = next.name;
          let handler = next.handler;
          let added$1 = prepend(next, added);
          let removed$1 = prepend(prev, removed);
          let events$1 = add_event(events, mapper, path, name, handler);
          loop$controlled = controlled;
          loop$path = path;
          loop$mapper = mapper;
          loop$events = events$1;
          loop$old = remaining_old;
          loop$new = remaining_new;
          loop$added = added$1;
          loop$removed = removed$1;
        }
      } else if (next instanceof Event2) {
        let name = next.name;
        let handler = next.handler;
        let added$1 = prepend(next, added);
        let events$1 = add_event(events, mapper, path, name, handler);
        loop$controlled = controlled;
        loop$path = path;
        loop$mapper = mapper;
        loop$events = events$1;
        loop$old = old;
        loop$new = remaining_new;
        loop$added = added$1;
        loop$removed = removed;
      } else {
        let added$1 = prepend(next, added);
        loop$controlled = controlled;
        loop$path = path;
        loop$mapper = mapper;
        loop$events = events;
        loop$old = old;
        loop$new = remaining_new;
        loop$added = added$1;
        loop$removed = removed;
      }
    }
  }
}
function do_diff(loop$old, loop$old_keyed, loop$new, loop$new_keyed, loop$moved, loop$moved_offset, loop$removed, loop$node_index, loop$patch_index, loop$path, loop$changes, loop$children, loop$mapper, loop$events) {
  while (true) {
    let old = loop$old;
    let old_keyed = loop$old_keyed;
    let new$8 = loop$new;
    let new_keyed = loop$new_keyed;
    let moved = loop$moved;
    let moved_offset = loop$moved_offset;
    let removed = loop$removed;
    let node_index = loop$node_index;
    let patch_index = loop$patch_index;
    let path = loop$path;
    let changes = loop$changes;
    let children = loop$children;
    let mapper = loop$mapper;
    let events = loop$events;
    if (new$8 instanceof Empty) {
      if (old instanceof Empty) {
        return new Diff(
          new Patch(patch_index, removed, changes, children),
          events
        );
      } else {
        let prev = old.head;
        let old$1 = old.tail;
        let _block;
        let $ = prev.key === "" || !has_key2(moved, prev.key);
        if ($) {
          _block = removed + 1;
        } else {
          _block = removed;
        }
        let removed$1 = _block;
        let events$1 = remove_child(events, path, node_index, prev);
        loop$old = old$1;
        loop$old_keyed = old_keyed;
        loop$new = new$8;
        loop$new_keyed = new_keyed;
        loop$moved = moved;
        loop$moved_offset = moved_offset;
        loop$removed = removed$1;
        loop$node_index = node_index;
        loop$patch_index = patch_index;
        loop$path = path;
        loop$changes = changes;
        loop$children = children;
        loop$mapper = mapper;
        loop$events = events$1;
      }
    } else if (old instanceof Empty) {
      let events$1 = add_children(
        events,
        mapper,
        path,
        node_index,
        new$8
      );
      let insert4 = insert3(new$8, node_index - moved_offset);
      let changes$1 = prepend(insert4, changes);
      return new Diff(
        new Patch(patch_index, removed, changes$1, children),
        events$1
      );
    } else {
      let next = new$8.head;
      let prev = old.head;
      if (prev.key !== next.key) {
        let new_remaining = new$8.tail;
        let old_remaining = old.tail;
        let next_did_exist = get(old_keyed, next.key);
        let prev_does_exist = has_key2(new_keyed, prev.key);
        if (next_did_exist instanceof Ok) {
          if (prev_does_exist) {
            let match = next_did_exist[0];
            let $ = has_key2(moved, prev.key);
            if ($) {
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new$8;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset - 1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$path = path;
              loop$changes = changes;
              loop$children = children;
              loop$mapper = mapper;
              loop$events = events;
            } else {
              let before = node_index - moved_offset;
              let changes$1 = prepend(
                move(next.key, before),
                changes
              );
              let moved$1 = insert2(moved, next.key, void 0);
              let moved_offset$1 = moved_offset + 1;
              loop$old = prepend(match, old);
              loop$old_keyed = old_keyed;
              loop$new = new$8;
              loop$new_keyed = new_keyed;
              loop$moved = moved$1;
              loop$moved_offset = moved_offset$1;
              loop$removed = removed;
              loop$node_index = node_index;
              loop$patch_index = patch_index;
              loop$path = path;
              loop$changes = changes$1;
              loop$children = children;
              loop$mapper = mapper;
              loop$events = events;
            }
          } else {
            let index2 = node_index - moved_offset;
            let changes$1 = prepend(remove2(index2), changes);
            let events$1 = remove_child(events, path, node_index, prev);
            let moved_offset$1 = moved_offset - 1;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new$8;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset$1;
            loop$removed = removed;
            loop$node_index = node_index;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = changes$1;
            loop$children = children;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else if (prev_does_exist) {
          let before = node_index - moved_offset;
          let events$1 = add_child(
            events,
            mapper,
            path,
            node_index,
            next
          );
          let insert4 = insert3(toList([next]), before);
          let changes$1 = prepend(insert4, changes);
          loop$old = old;
          loop$old_keyed = old_keyed;
          loop$new = new_remaining;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset + 1;
          loop$removed = removed;
          loop$node_index = node_index + 1;
          loop$patch_index = patch_index;
          loop$path = path;
          loop$changes = changes$1;
          loop$children = children;
          loop$mapper = mapper;
          loop$events = events$1;
        } else {
          let change = replace2(node_index - moved_offset, next);
          let _block;
          let _pipe = events;
          let _pipe$1 = remove_child(_pipe, path, node_index, prev);
          _block = add_child(_pipe$1, mapper, path, node_index, next);
          let events$1 = _block;
          loop$old = old_remaining;
          loop$old_keyed = old_keyed;
          loop$new = new_remaining;
          loop$new_keyed = new_keyed;
          loop$moved = moved;
          loop$moved_offset = moved_offset;
          loop$removed = removed;
          loop$node_index = node_index + 1;
          loop$patch_index = patch_index;
          loop$path = path;
          loop$changes = prepend(change, changes);
          loop$children = children;
          loop$mapper = mapper;
          loop$events = events$1;
        }
      } else {
        let $ = old.head;
        if ($ instanceof Fragment) {
          let $1 = new$8.head;
          if ($1 instanceof Fragment) {
            let next$1 = $1;
            let new$1 = new$8.tail;
            let prev$1 = $;
            let old$1 = old.tail;
            let composed_mapper = compose_mapper(mapper, next$1.mapper);
            let child_path = add2(path, node_index, next$1.key);
            let child = do_diff(
              prev$1.children,
              prev$1.keyed_children,
              next$1.children,
              next$1.keyed_children,
              empty2(),
              0,
              0,
              0,
              node_index,
              child_path,
              empty_list,
              empty_list,
              composed_mapper,
              events
            );
            let _block;
            let $2 = child.patch;
            let $3 = $2.children;
            if ($3 instanceof Empty) {
              let $4 = $2.changes;
              if ($4 instanceof Empty) {
                let $5 = $2.removed;
                if ($5 === 0) {
                  _block = children;
                } else {
                  _block = prepend(child.patch, children);
                }
              } else {
                _block = prepend(child.patch, children);
              }
            } else {
              _block = prepend(child.patch, children);
            }
            let children$1 = _block;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = changes;
            loop$children = children$1;
            loop$mapper = mapper;
            loop$events = child.events;
          } else {
            let next$1 = $1;
            let new_remaining = new$8.tail;
            let prev$1 = $;
            let old_remaining = old.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else if ($ instanceof Element) {
          let $1 = new$8.head;
          if ($1 instanceof Element) {
            let next$1 = $1;
            let prev$1 = $;
            if (prev$1.namespace === next$1.namespace && prev$1.tag === next$1.tag) {
              let new$1 = new$8.tail;
              let old$1 = old.tail;
              let composed_mapper = compose_mapper(
                mapper,
                next$1.mapper
              );
              let child_path = add2(path, node_index, next$1.key);
              let controlled = is_controlled(
                events,
                next$1.namespace,
                next$1.tag,
                child_path
              );
              let $2 = diff_attributes(
                controlled,
                child_path,
                composed_mapper,
                events,
                prev$1.attributes,
                next$1.attributes,
                empty_list,
                empty_list
              );
              let added_attrs;
              let removed_attrs;
              let events$1;
              added_attrs = $2.added;
              removed_attrs = $2.removed;
              events$1 = $2.events;
              let _block;
              if (removed_attrs instanceof Empty && added_attrs instanceof Empty) {
                _block = empty_list;
              } else {
                _block = toList([update(added_attrs, removed_attrs)]);
              }
              let initial_child_changes = _block;
              let child = do_diff(
                prev$1.children,
                prev$1.keyed_children,
                next$1.children,
                next$1.keyed_children,
                empty2(),
                0,
                0,
                0,
                node_index,
                child_path,
                initial_child_changes,
                empty_list,
                composed_mapper,
                events$1
              );
              let _block$1;
              let $3 = child.patch;
              let $4 = $3.children;
              if ($4 instanceof Empty) {
                let $5 = $3.changes;
                if ($5 instanceof Empty) {
                  let $6 = $3.removed;
                  if ($6 === 0) {
                    _block$1 = children;
                  } else {
                    _block$1 = prepend(child.patch, children);
                  }
                } else {
                  _block$1 = prepend(child.patch, children);
                }
              } else {
                _block$1 = prepend(child.patch, children);
              }
              let children$1 = _block$1;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path;
              loop$changes = changes;
              loop$children = children$1;
              loop$mapper = mapper;
              loop$events = child.events;
            } else {
              let next$2 = $1;
              let new_remaining = new$8.tail;
              let prev$2 = $;
              let old_remaining = old.tail;
              let change = replace2(node_index - moved_offset, next$2);
              let _block;
              let _pipe = events;
              let _pipe$1 = remove_child(
                _pipe,
                path,
                node_index,
                prev$2
              );
              _block = add_child(
                _pipe$1,
                mapper,
                path,
                node_index,
                next$2
              );
              let events$1 = _block;
              loop$old = old_remaining;
              loop$old_keyed = old_keyed;
              loop$new = new_remaining;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path;
              loop$changes = prepend(change, changes);
              loop$children = children;
              loop$mapper = mapper;
              loop$events = events$1;
            }
          } else {
            let next$1 = $1;
            let new_remaining = new$8.tail;
            let prev$1 = $;
            let old_remaining = old.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else if ($ instanceof Text) {
          let $1 = new$8.head;
          if ($1 instanceof Text) {
            let next$1 = $1;
            let prev$1 = $;
            if (prev$1.content === next$1.content) {
              let new$1 = new$8.tail;
              let old$1 = old.tail;
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path;
              loop$changes = changes;
              loop$children = children;
              loop$mapper = mapper;
              loop$events = events;
            } else {
              let next$2 = $1;
              let new$1 = new$8.tail;
              let old$1 = old.tail;
              let child = new$5(
                node_index,
                0,
                toList([replace_text(next$2.content)]),
                empty_list
              );
              loop$old = old$1;
              loop$old_keyed = old_keyed;
              loop$new = new$1;
              loop$new_keyed = new_keyed;
              loop$moved = moved;
              loop$moved_offset = moved_offset;
              loop$removed = removed;
              loop$node_index = node_index + 1;
              loop$patch_index = patch_index;
              loop$path = path;
              loop$changes = changes;
              loop$children = prepend(child, children);
              loop$mapper = mapper;
              loop$events = events;
            }
          } else {
            let next$1 = $1;
            let new_remaining = new$8.tail;
            let prev$1 = $;
            let old_remaining = old.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        } else {
          let $1 = new$8.head;
          if ($1 instanceof UnsafeInnerHtml) {
            let next$1 = $1;
            let new$1 = new$8.tail;
            let prev$1 = $;
            let old$1 = old.tail;
            let composed_mapper = compose_mapper(mapper, next$1.mapper);
            let child_path = add2(path, node_index, next$1.key);
            let $2 = diff_attributes(
              false,
              child_path,
              composed_mapper,
              events,
              prev$1.attributes,
              next$1.attributes,
              empty_list,
              empty_list
            );
            let added_attrs;
            let removed_attrs;
            let events$1;
            added_attrs = $2.added;
            removed_attrs = $2.removed;
            events$1 = $2.events;
            let _block;
            if (removed_attrs instanceof Empty && added_attrs instanceof Empty) {
              _block = empty_list;
            } else {
              _block = toList([update(added_attrs, removed_attrs)]);
            }
            let child_changes = _block;
            let _block$1;
            let $3 = prev$1.inner_html === next$1.inner_html;
            if ($3) {
              _block$1 = child_changes;
            } else {
              _block$1 = prepend(
                replace_inner_html(next$1.inner_html),
                child_changes
              );
            }
            let child_changes$1 = _block$1;
            let _block$2;
            if (child_changes$1 instanceof Empty) {
              _block$2 = children;
            } else {
              _block$2 = prepend(
                new$5(node_index, 0, child_changes$1, toList([])),
                children
              );
            }
            let children$1 = _block$2;
            loop$old = old$1;
            loop$old_keyed = old_keyed;
            loop$new = new$1;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = changes;
            loop$children = children$1;
            loop$mapper = mapper;
            loop$events = events$1;
          } else {
            let next$1 = $1;
            let new_remaining = new$8.tail;
            let prev$1 = $;
            let old_remaining = old.tail;
            let change = replace2(node_index - moved_offset, next$1);
            let _block;
            let _pipe = events;
            let _pipe$1 = remove_child(_pipe, path, node_index, prev$1);
            _block = add_child(
              _pipe$1,
              mapper,
              path,
              node_index,
              next$1
            );
            let events$1 = _block;
            loop$old = old_remaining;
            loop$old_keyed = old_keyed;
            loop$new = new_remaining;
            loop$new_keyed = new_keyed;
            loop$moved = moved;
            loop$moved_offset = moved_offset;
            loop$removed = removed;
            loop$node_index = node_index + 1;
            loop$patch_index = patch_index;
            loop$path = path;
            loop$changes = prepend(change, changes);
            loop$children = children;
            loop$mapper = mapper;
            loop$events = events$1;
          }
        }
      }
    }
  }
}
function diff(events, old, new$8) {
  return do_diff(
    toList([old]),
    empty2(),
    toList([new$8]),
    empty2(),
    empty2(),
    0,
    0,
    0,
    0,
    root2,
    empty_list,
    empty_list,
    identity2,
    tick(events)
  );
}

// build/dev/javascript/lustre/lustre/vdom/reconciler.ffi.mjs
var setTimeout = globalThis.setTimeout;
var clearTimeout = globalThis.clearTimeout;
var createElementNS = (ns, name) => document2().createElementNS(ns, name);
var createTextNode = (data) => document2().createTextNode(data);
var createDocumentFragment = () => document2().createDocumentFragment();
var insertBefore = (parent, node, reference) => parent.insertBefore(node, reference);
var moveBefore = SUPPORTS_MOVE_BEFORE ? (parent, node, reference) => parent.moveBefore(node, reference) : insertBefore;
var removeChild = (parent, child) => parent.removeChild(child);
var getAttribute = (node, name) => node.getAttribute(name);
var setAttribute = (node, name, value) => node.setAttribute(name, value);
var removeAttribute = (node, name) => node.removeAttribute(name);
var addEventListener = (node, name, handler, options) => node.addEventListener(name, handler, options);
var removeEventListener = (node, name, handler) => node.removeEventListener(name, handler);
var setInnerHtml = (node, innerHtml) => node.innerHTML = innerHtml;
var setData = (node, data) => node.data = data;
var meta = Symbol("lustre");
var MetadataNode = class {
  constructor(kind, parent, node, key) {
    this.kind = kind;
    this.key = key;
    this.parent = parent;
    this.children = [];
    this.node = node;
    this.handlers = /* @__PURE__ */ new Map();
    this.throttles = /* @__PURE__ */ new Map();
    this.debouncers = /* @__PURE__ */ new Map();
  }
  get parentNode() {
    return this.kind === fragment_kind ? this.node.parentNode : this.node;
  }
};
var insertMetadataChild = (kind, parent, node, index2, key) => {
  const child = new MetadataNode(kind, parent, node, key);
  node[meta] = child;
  parent?.children.splice(index2, 0, child);
  return child;
};
var getPath = (node) => {
  let path = "";
  for (let current = node[meta]; current.parent; current = current.parent) {
    if (current.key) {
      path = `${separator_element}${current.key}${path}`;
    } else {
      const index2 = current.parent.children.indexOf(current);
      path = `${separator_element}${index2}${path}`;
    }
  }
  return path.slice(1);
};
var Reconciler = class {
  #root = null;
  #dispatch = () => {
  };
  #useServerEvents = false;
  #exposeKeys = false;
  constructor(root3, dispatch, { useServerEvents = false, exposeKeys = false } = {}) {
    this.#root = root3;
    this.#dispatch = dispatch;
    this.#useServerEvents = useServerEvents;
    this.#exposeKeys = exposeKeys;
  }
  mount(vdom) {
    insertMetadataChild(element_kind, null, this.#root, 0, null);
    this.#insertChild(this.#root, null, this.#root[meta], 0, vdom);
  }
  push(patch) {
    this.#stack.push({ node: this.#root[meta], patch });
    this.#reconcile();
  }
  // PATCHING ------------------------------------------------------------------
  #stack = [];
  #reconcile() {
    const stack = this.#stack;
    while (stack.length) {
      const { node, patch } = stack.pop();
      const { children: childNodes } = node;
      const { changes, removed, children: childPatches } = patch;
      iterate(changes, (change) => this.#patch(node, change));
      if (removed) {
        this.#removeChildren(node, childNodes.length - removed, removed);
      }
      iterate(childPatches, (childPatch) => {
        const child = childNodes[childPatch.index | 0];
        this.#stack.push({ node: child, patch: childPatch });
      });
    }
  }
  #patch(node, change) {
    switch (change.kind) {
      case replace_text_kind:
        this.#replaceText(node, change);
        break;
      case replace_inner_html_kind:
        this.#replaceInnerHtml(node, change);
        break;
      case update_kind:
        this.#update(node, change);
        break;
      case move_kind:
        this.#move(node, change);
        break;
      case remove_kind:
        this.#remove(node, change);
        break;
      case replace_kind:
        this.#replace(node, change);
        break;
      case insert_kind:
        this.#insert(node, change);
        break;
    }
  }
  // CHANGES -------------------------------------------------------------------
  #insert(parent, { children, before }) {
    const fragment3 = createDocumentFragment();
    const beforeEl = this.#getReference(parent, before);
    this.#insertChildren(fragment3, null, parent, before | 0, children);
    insertBefore(parent.parentNode, fragment3, beforeEl);
  }
  #replace(parent, { index: index2, with: child }) {
    this.#removeChildren(parent, index2 | 0, 1);
    const beforeEl = this.#getReference(parent, index2);
    this.#insertChild(parent.parentNode, beforeEl, parent, index2 | 0, child);
  }
  #getReference(node, index2) {
    index2 = index2 | 0;
    const { children } = node;
    const childCount = children.length;
    if (index2 < childCount) {
      return children[index2].node;
    }
    let lastChild = children[childCount - 1];
    if (!lastChild && node.kind !== fragment_kind) return null;
    if (!lastChild) lastChild = node;
    while (lastChild.kind === fragment_kind && lastChild.children.length) {
      lastChild = lastChild.children[lastChild.children.length - 1];
    }
    return lastChild.node.nextSibling;
  }
  #move(parent, { key, before }) {
    before = before | 0;
    const { children, parentNode } = parent;
    const beforeEl = children[before].node;
    let prev = children[before];
    for (let i = before + 1; i < children.length; ++i) {
      const next = children[i];
      children[i] = prev;
      prev = next;
      if (next.key === key) {
        children[before] = next;
        break;
      }
    }
    const { kind, node, children: prevChildren } = prev;
    moveBefore(parentNode, node, beforeEl);
    if (kind === fragment_kind) {
      this.#moveChildren(parentNode, prevChildren, beforeEl);
    }
  }
  #moveChildren(domParent, children, beforeEl) {
    for (let i = 0; i < children.length; ++i) {
      const { kind, node, children: nestedChildren } = children[i];
      moveBefore(domParent, node, beforeEl);
      if (kind === fragment_kind) {
        this.#moveChildren(domParent, nestedChildren, beforeEl);
      }
    }
  }
  #remove(parent, { index: index2 }) {
    this.#removeChildren(parent, index2, 1);
  }
  #removeChildren(parent, index2, count) {
    const { children, parentNode } = parent;
    const deleted = children.splice(index2, count);
    for (let i = 0; i < deleted.length; ++i) {
      const { kind, node, children: nestedChildren } = deleted[i];
      removeChild(parentNode, node);
      this.#removeDebouncers(deleted[i]);
      if (kind === fragment_kind) {
        deleted.push(...nestedChildren);
      }
    }
  }
  #removeDebouncers(node) {
    const { debouncers, children } = node;
    for (const { timeout } of debouncers.values()) {
      if (timeout) {
        clearTimeout(timeout);
      }
    }
    debouncers.clear();
    iterate(children, (child) => this.#removeDebouncers(child));
  }
  #update({ node, handlers, throttles, debouncers }, { added, removed }) {
    iterate(removed, ({ name }) => {
      if (handlers.delete(name)) {
        removeEventListener(node, name, handleEvent);
        this.#updateDebounceThrottle(throttles, name, 0);
        this.#updateDebounceThrottle(debouncers, name, 0);
      } else {
        removeAttribute(node, name);
        SYNCED_ATTRIBUTES[name]?.removed?.(node, name);
      }
    });
    iterate(added, (attribute3) => this.#createAttribute(node, attribute3));
  }
  #replaceText({ node }, { content }) {
    setData(node, content ?? "");
  }
  #replaceInnerHtml({ node }, { inner_html }) {
    setInnerHtml(node, inner_html ?? "");
  }
  // INSERT --------------------------------------------------------------------
  #insertChildren(domParent, beforeEl, metaParent, index2, children) {
    iterate(
      children,
      (child) => this.#insertChild(domParent, beforeEl, metaParent, index2++, child)
    );
  }
  #insertChild(domParent, beforeEl, metaParent, index2, vnode) {
    switch (vnode.kind) {
      case element_kind: {
        const node = this.#createElement(metaParent, index2, vnode);
        this.#insertChildren(node, null, node[meta], 0, vnode.children);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case text_kind: {
        const node = this.#createTextNode(metaParent, index2, vnode);
        insertBefore(domParent, node, beforeEl);
        break;
      }
      case fragment_kind: {
        const head = this.#createTextNode(metaParent, index2, vnode);
        insertBefore(domParent, head, beforeEl);
        this.#insertChildren(
          domParent,
          beforeEl,
          head[meta],
          0,
          vnode.children
        );
        break;
      }
      case unsafe_inner_html_kind: {
        const node = this.#createElement(metaParent, index2, vnode);
        this.#replaceInnerHtml({ node }, vnode);
        insertBefore(domParent, node, beforeEl);
        break;
      }
    }
  }
  #createElement(parent, index2, { kind, key, tag, namespace, attributes }) {
    const node = createElementNS(namespace || NAMESPACE_HTML, tag);
    insertMetadataChild(kind, parent, node, index2, key);
    if (this.#exposeKeys && key) {
      setAttribute(node, "data-lustre-key", key);
    }
    iterate(attributes, (attribute3) => this.#createAttribute(node, attribute3));
    return node;
  }
  #createTextNode(parent, index2, { kind, key, content }) {
    const node = createTextNode(content ?? "");
    insertMetadataChild(kind, parent, node, index2, key);
    return node;
  }
  #createAttribute(node, attribute3) {
    const { debouncers, handlers, throttles } = node[meta];
    const {
      kind,
      name,
      value,
      prevent_default: prevent,
      debounce: debounceDelay,
      throttle: throttleDelay
    } = attribute3;
    switch (kind) {
      case attribute_kind: {
        const valueOrDefault = value ?? "";
        if (name === "virtual:defaultValue") {
          node.defaultValue = valueOrDefault;
          return;
        }
        if (valueOrDefault !== getAttribute(node, name)) {
          setAttribute(node, name, valueOrDefault);
        }
        SYNCED_ATTRIBUTES[name]?.added?.(node, valueOrDefault);
        break;
      }
      case property_kind:
        node[name] = value;
        break;
      case event_kind: {
        if (handlers.has(name)) {
          removeEventListener(node, name, handleEvent);
        }
        const passive = prevent.kind === never_kind;
        addEventListener(node, name, handleEvent, { passive });
        this.#updateDebounceThrottle(throttles, name, throttleDelay);
        this.#updateDebounceThrottle(debouncers, name, debounceDelay);
        handlers.set(name, (event4) => this.#handleEvent(attribute3, event4));
        break;
      }
    }
  }
  #updateDebounceThrottle(map4, name, delay) {
    const debounceOrThrottle = map4.get(name);
    if (delay > 0) {
      if (debounceOrThrottle) {
        debounceOrThrottle.delay = delay;
      } else {
        map4.set(name, { delay });
      }
    } else if (debounceOrThrottle) {
      const { timeout } = debounceOrThrottle;
      if (timeout) {
        clearTimeout(timeout);
      }
      map4.delete(name);
    }
  }
  #handleEvent(attribute3, event4) {
    const { currentTarget, type } = event4;
    const { debouncers, throttles } = currentTarget[meta];
    const path = getPath(currentTarget);
    const {
      prevent_default: prevent,
      stop_propagation: stop,
      include,
      immediate
    } = attribute3;
    if (prevent.kind === always_kind) event4.preventDefault();
    if (stop.kind === always_kind) event4.stopPropagation();
    if (type === "submit") {
      event4.detail ??= {};
      event4.detail.formData = [
        ...new FormData(event4.target, event4.submitter).entries()
      ];
    }
    const data = this.#useServerEvents ? createServerEvent(event4, include ?? []) : event4;
    const throttle = throttles.get(type);
    if (throttle) {
      const now = Date.now();
      const last = throttle.last || 0;
      if (now > last + throttle.delay) {
        throttle.last = now;
        throttle.lastEvent = event4;
        this.#dispatch(data, path, type, immediate);
      }
    }
    const debounce = debouncers.get(type);
    if (debounce) {
      clearTimeout(debounce.timeout);
      debounce.timeout = setTimeout(() => {
        if (event4 === throttles.get(type)?.lastEvent) return;
        this.#dispatch(data, path, type, immediate);
      }, debounce.delay);
    }
    if (!throttle && !debounce) {
      this.#dispatch(data, path, type, immediate);
    }
  }
};
var iterate = (list4, callback) => {
  if (Array.isArray(list4)) {
    for (let i = 0; i < list4.length; i++) {
      callback(list4[i]);
    }
  } else if (list4) {
    for (list4; list4.head; list4 = list4.tail) {
      callback(list4.head);
    }
  }
};
var handleEvent = (event4) => {
  const { currentTarget, type } = event4;
  const handler = currentTarget[meta].handlers.get(type);
  handler(event4);
};
var createServerEvent = (event4, include = []) => {
  const data = {};
  if (event4.type === "input" || event4.type === "change") {
    include.push("target.value");
  }
  if (event4.type === "submit") {
    include.push("detail.formData");
  }
  for (const property3 of include) {
    const path = property3.split(".");
    for (let i = 0, input = event4, output = data; i < path.length; i++) {
      if (i === path.length - 1) {
        output[path[i]] = input[path[i]];
        break;
      }
      output = output[path[i]] ??= {};
      input = input[path[i]];
    }
  }
  return data;
};
var syncedBooleanAttribute = /* @__NO_SIDE_EFFECTS__ */ (name) => {
  return {
    added(node) {
      node[name] = true;
    },
    removed(node) {
      node[name] = false;
    }
  };
};
var syncedAttribute = /* @__NO_SIDE_EFFECTS__ */ (name) => {
  return {
    added(node, value) {
      node[name] = value;
    }
  };
};
var SYNCED_ATTRIBUTES = {
  checked: /* @__PURE__ */ syncedBooleanAttribute("checked"),
  selected: /* @__PURE__ */ syncedBooleanAttribute("selected"),
  value: /* @__PURE__ */ syncedAttribute("value"),
  autofocus: {
    added(node) {
      queueMicrotask(() => {
        node.focus?.();
      });
    }
  },
  autoplay: {
    added(node) {
      try {
        node.play?.();
      } catch (e) {
        console.error(e);
      }
    }
  }
};

// build/dev/javascript/lustre/lustre/element/keyed.mjs
function do_extract_keyed_children(loop$key_children_pairs, loop$keyed_children, loop$children) {
  while (true) {
    let key_children_pairs = loop$key_children_pairs;
    let keyed_children = loop$keyed_children;
    let children = loop$children;
    if (key_children_pairs instanceof Empty) {
      return [keyed_children, reverse(children)];
    } else {
      let rest = key_children_pairs.tail;
      let key = key_children_pairs.head[0];
      let element$1 = key_children_pairs.head[1];
      let keyed_element = to_keyed(key, element$1);
      let _block;
      if (key === "") {
        _block = keyed_children;
      } else {
        _block = insert2(keyed_children, key, keyed_element);
      }
      let keyed_children$1 = _block;
      let children$1 = prepend(keyed_element, children);
      loop$key_children_pairs = rest;
      loop$keyed_children = keyed_children$1;
      loop$children = children$1;
    }
  }
}
function extract_keyed_children(children) {
  return do_extract_keyed_children(
    children,
    empty2(),
    empty_list
  );
}
function element3(tag, attributes, children) {
  let $ = extract_keyed_children(children);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return element(
    "",
    identity2,
    "",
    tag,
    attributes,
    children$1,
    keyed_children,
    false,
    false
  );
}
function namespaced2(namespace, tag, attributes, children) {
  let $ = extract_keyed_children(children);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return element(
    "",
    identity2,
    namespace,
    tag,
    attributes,
    children$1,
    keyed_children,
    false,
    false
  );
}
function fragment2(children) {
  let $ = extract_keyed_children(children);
  let keyed_children;
  let children$1;
  keyed_children = $[0];
  children$1 = $[1];
  return fragment("", identity2, children$1, keyed_children);
}

// build/dev/javascript/lustre/lustre/vdom/virtualise.ffi.mjs
var virtualise = (root3) => {
  const rootMeta = insertMetadataChild(element_kind, null, root3, 0, null);
  let virtualisableRootChildren = 0;
  for (let child = root3.firstChild; child; child = child.nextSibling) {
    if (canVirtualiseNode(child)) virtualisableRootChildren += 1;
  }
  if (virtualisableRootChildren === 0) {
    const placeholder = document2().createTextNode("");
    insertMetadataChild(text_kind, rootMeta, placeholder, 0, null);
    root3.replaceChildren(placeholder);
    return none2();
  }
  if (virtualisableRootChildren === 1) {
    const children2 = virtualiseChildNodes(rootMeta, root3);
    return children2.head[1];
  }
  const fragmentHead = document2().createTextNode("");
  const fragmentMeta = insertMetadataChild(fragment_kind, rootMeta, fragmentHead, 0, null);
  const children = virtualiseChildNodes(fragmentMeta, root3);
  root3.insertBefore(fragmentHead, root3.firstChild);
  return fragment2(children);
};
var canVirtualiseNode = (node) => {
  switch (node.nodeType) {
    case ELEMENT_NODE:
      return true;
    case TEXT_NODE:
      return !!node.data;
    default:
      return false;
  }
};
var virtualiseNode = (meta2, node, key, index2) => {
  if (!canVirtualiseNode(node)) {
    return null;
  }
  switch (node.nodeType) {
    case ELEMENT_NODE: {
      const childMeta = insertMetadataChild(element_kind, meta2, node, index2, key);
      const tag = node.localName;
      const namespace = node.namespaceURI;
      const isHtmlElement = !namespace || namespace === NAMESPACE_HTML;
      if (isHtmlElement && INPUT_ELEMENTS.includes(tag)) {
        virtualiseInputEvents(tag, node);
      }
      const attributes = virtualiseAttributes(node);
      const children = virtualiseChildNodes(childMeta, node);
      const vnode = isHtmlElement ? element3(tag, attributes, children) : namespaced2(namespace, tag, attributes, children);
      return vnode;
    }
    case TEXT_NODE:
      insertMetadataChild(text_kind, meta2, node, index2, null);
      return text2(node.data);
    default:
      return null;
  }
};
var INPUT_ELEMENTS = ["input", "select", "textarea"];
var virtualiseInputEvents = (tag, node) => {
  const value = node.value;
  const checked = node.checked;
  if (tag === "input" && node.type === "checkbox" && !checked) return;
  if (tag === "input" && node.type === "radio" && !checked) return;
  if (node.type !== "checkbox" && node.type !== "radio" && !value) return;
  queueMicrotask(() => {
    node.value = value;
    node.checked = checked;
    node.dispatchEvent(new Event("input", { bubbles: true }));
    node.dispatchEvent(new Event("change", { bubbles: true }));
    if (document2().activeElement !== node) {
      node.dispatchEvent(new Event("blur", { bubbles: true }));
    }
  });
};
var virtualiseChildNodes = (meta2, node) => {
  let children = null;
  let child = node.firstChild;
  let ptr = null;
  let index2 = 0;
  while (child) {
    const key = child.nodeType === ELEMENT_NODE ? child.getAttribute("data-lustre-key") : null;
    if (key != null) {
      child.removeAttribute("data-lustre-key");
    }
    const vnode = virtualiseNode(meta2, child, key, index2);
    const next = child.nextSibling;
    if (vnode) {
      const list_node = new NonEmpty([key ?? "", vnode], null);
      if (ptr) {
        ptr = ptr.tail = list_node;
      } else {
        ptr = children = list_node;
      }
      index2 += 1;
    } else {
      node.removeChild(child);
    }
    child = next;
  }
  if (!ptr) return empty_list;
  ptr.tail = empty_list;
  return children;
};
var virtualiseAttributes = (node) => {
  let index2 = node.attributes.length;
  let attributes = empty_list;
  while (index2-- > 0) {
    const attr = node.attributes[index2];
    if (attr.name === "xmlns") {
      continue;
    }
    attributes = new NonEmpty(virtualiseAttribute(attr), attributes);
  }
  return attributes;
};
var virtualiseAttribute = (attr) => {
  const name = attr.localName;
  const value = attr.value;
  return attribute2(name, value);
};

// build/dev/javascript/lustre/lustre/runtime/client/runtime.ffi.mjs
var is_browser = () => !!document2();
var Runtime = class {
  constructor(root3, [model, effects], view3, update3) {
    this.root = root3;
    this.#model = model;
    this.#view = view3;
    this.#update = update3;
    this.root.addEventListener("context-request", (event4) => {
      if (!(event4.context && event4.callback)) return;
      if (!this.#contexts.has(event4.context)) return;
      event4.stopImmediatePropagation();
      const context = this.#contexts.get(event4.context);
      if (event4.subscribe) {
        const unsubscribe = () => {
          context.subscribers = context.subscribers.filter(
            (subscriber) => subscriber !== event4.callback
          );
        };
        context.subscribers.push([event4.callback, unsubscribe]);
        event4.callback(context.value, unsubscribe);
      } else {
        event4.callback(context.value);
      }
    });
    this.#reconciler = new Reconciler(this.root, (event4, path, name) => {
      const [events, result] = handle(this.#events, path, name, event4);
      this.#events = events;
      if (result.isOk()) {
        const handler = result[0];
        if (handler.stop_propagation) event4.stopPropagation();
        if (handler.prevent_default) event4.preventDefault();
        this.dispatch(handler.message, false);
      }
    });
    this.#vdom = virtualise(this.root);
    this.#events = new$3();
    this.#shouldFlush = true;
    this.#tick(effects);
  }
  // PUBLIC API ----------------------------------------------------------------
  root = null;
  dispatch(msg, immediate = false) {
    this.#shouldFlush ||= immediate;
    if (this.#shouldQueue) {
      this.#queue.push(msg);
    } else {
      const [model, effects] = this.#update(this.#model, msg);
      this.#model = model;
      this.#tick(effects);
    }
  }
  emit(event4, data) {
    const target = this.root.host ?? this.root;
    target.dispatchEvent(
      new CustomEvent(event4, {
        detail: data,
        bubbles: true,
        composed: true
      })
    );
  }
  // Provide a context value for any child nodes that request it using the given
  // key. If the key already exists, any existing subscribers will be notified
  // of the change. Otherwise, we store the value and wait for any `context-request`
  // events to come in.
  provide(key, value) {
    if (!this.#contexts.has(key)) {
      this.#contexts.set(key, { value, subscribers: [] });
    } else {
      const context = this.#contexts.get(key);
      context.value = value;
      for (let i = context.subscribers.length - 1; i >= 0; i--) {
        const [subscriber, unsubscribe] = context.subscribers[i];
        if (!subscriber) {
          context.subscribers.splice(i, 1);
          continue;
        }
        subscriber(value, unsubscribe);
      }
    }
  }
  // PRIVATE API ---------------------------------------------------------------
  #model;
  #view;
  #update;
  #vdom;
  #events;
  #reconciler;
  #contexts = /* @__PURE__ */ new Map();
  #shouldQueue = false;
  #queue = [];
  #beforePaint = empty_list;
  #afterPaint = empty_list;
  #renderTimer = null;
  #shouldFlush = false;
  #actions = {
    dispatch: (msg, immediate) => this.dispatch(msg, immediate),
    emit: (event4, data) => this.emit(event4, data),
    select: () => {
    },
    root: () => this.root,
    provide: (key, value) => this.provide(key, value)
  };
  // A `#tick` is where we process effects and trigger any synchronous updates.
  // Once a tick has been processed a render will be scheduled if none is already.
  // p0
  #tick(effects) {
    this.#shouldQueue = true;
    while (true) {
      for (let list4 = effects.synchronous; list4.tail; list4 = list4.tail) {
        list4.head(this.#actions);
      }
      this.#beforePaint = listAppend(this.#beforePaint, effects.before_paint);
      this.#afterPaint = listAppend(this.#afterPaint, effects.after_paint);
      if (!this.#queue.length) break;
      [this.#model, effects] = this.#update(this.#model, this.#queue.shift());
    }
    this.#shouldQueue = false;
    if (this.#shouldFlush) {
      cancelAnimationFrame(this.#renderTimer);
      this.#render();
    } else if (!this.#renderTimer) {
      this.#renderTimer = requestAnimationFrame(() => {
        this.#render();
      });
    }
  }
  #render() {
    this.#shouldFlush = false;
    this.#renderTimer = null;
    const next = this.#view(this.#model);
    const { patch, events } = diff(this.#events, this.#vdom, next);
    this.#events = events;
    this.#vdom = next;
    this.#reconciler.push(patch);
    if (this.#beforePaint instanceof NonEmpty) {
      const effects = makeEffect(this.#beforePaint);
      this.#beforePaint = empty_list;
      queueMicrotask(() => {
        this.#shouldFlush = true;
        this.#tick(effects);
      });
    }
    if (this.#afterPaint instanceof NonEmpty) {
      const effects = makeEffect(this.#afterPaint);
      this.#afterPaint = empty_list;
      requestAnimationFrame(() => {
        this.#shouldFlush = true;
        this.#tick(effects);
      });
    }
  }
};
function makeEffect(synchronous) {
  return {
    synchronous,
    after_paint: empty_list,
    before_paint: empty_list
  };
}
function listAppend(a2, b) {
  if (a2 instanceof Empty) {
    return b;
  } else if (b instanceof Empty) {
    return a2;
  } else {
    return append2(a2, b);
  }
}

// build/dev/javascript/lustre/lustre/runtime/server/runtime.mjs
var EffectDispatchedMessage = class extends CustomType {
  constructor(message2) {
    super();
    this.message = message2;
  }
};
var EffectEmitEvent = class extends CustomType {
  constructor(name, data) {
    super();
    this.name = name;
    this.data = data;
  }
};
var SystemRequestedShutdown = class extends CustomType {
};

// build/dev/javascript/lustre/lustre/component.mjs
var Config2 = class extends CustomType {
  constructor(open_shadow_root, adopt_styles, delegates_focus, attributes, properties, contexts, is_form_associated, on_form_autofill, on_form_reset, on_form_restore) {
    super();
    this.open_shadow_root = open_shadow_root;
    this.adopt_styles = adopt_styles;
    this.delegates_focus = delegates_focus;
    this.attributes = attributes;
    this.properties = properties;
    this.contexts = contexts;
    this.is_form_associated = is_form_associated;
    this.on_form_autofill = on_form_autofill;
    this.on_form_reset = on_form_reset;
    this.on_form_restore = on_form_restore;
  }
};
function new$6(options) {
  let init3 = new Config2(
    true,
    true,
    false,
    empty_list,
    empty_list,
    empty_list,
    false,
    option_none,
    option_none,
    option_none
  );
  return fold2(
    options,
    init3,
    (config, option) => {
      return option.apply(config);
    }
  );
}

// build/dev/javascript/lustre/lustre/runtime/client/spa.ffi.mjs
var Spa = class {
  #runtime;
  constructor(root3, [init3, effects], update3, view3) {
    this.#runtime = new Runtime(root3, [init3, effects], view3, update3);
  }
  send(message2) {
    switch (message2.constructor) {
      case EffectDispatchedMessage: {
        this.dispatch(message2.message, false);
        break;
      }
      case EffectEmitEvent: {
        this.emit(message2.name, message2.data);
        break;
      }
      case SystemRequestedShutdown:
        break;
    }
  }
  dispatch(msg, immediate) {
    this.#runtime.dispatch(msg, immediate);
  }
  emit(event4, data) {
    this.#runtime.emit(event4, data);
  }
};
var start = ({ init: init3, update: update3, view: view3 }, selector, flags) => {
  if (!is_browser()) return new Error(new NotABrowser());
  const root3 = selector instanceof HTMLElement ? selector : document2().querySelector(selector);
  if (!root3) return new Error(new ElementNotFound(selector));
  return new Ok(new Spa(root3, init3(flags), update3, view3));
};

// build/dev/javascript/lustre/lustre.mjs
var App = class extends CustomType {
  constructor(init3, update3, view3, config) {
    super();
    this.init = init3;
    this.update = update3;
    this.view = view3;
    this.config = config;
  }
};
var ElementNotFound = class extends CustomType {
  constructor(selector) {
    super();
    this.selector = selector;
  }
};
var NotABrowser = class extends CustomType {
};
function application(init3, update3, view3) {
  return new App(init3, update3, view3, new$6(empty_list));
}
function start3(app, selector, start_args) {
  return guard(
    !is_browser(),
    new Error(new NotABrowser()),
    () => {
      return start(app, selector, start_args);
    }
  );
}

// build/dev/javascript/modem/modem.ffi.mjs
var defaults = {
  handle_external_links: false,
  handle_internal_links: true
};
var initial_location = globalThis?.window?.location?.href;
var do_initial_uri = () => {
  if (!initial_location) {
    return new Error(void 0);
  } else {
    return new Ok(uri_from_url(new URL(initial_location)));
  }
};
var do_init = (dispatch, options = defaults) => {
  document.addEventListener("click", (event4) => {
    const a2 = find_anchor(event4.target);
    if (!a2) return;
    try {
      const url = new URL(a2.href);
      const uri = uri_from_url(url);
      const is_external = url.host !== window.location.host;
      if (!options.handle_external_links && is_external) return;
      if (!options.handle_internal_links && !is_external) return;
      event4.preventDefault();
      if (!is_external) {
        window.history.pushState({}, "", a2.href);
        window.requestAnimationFrame(() => {
          if (url.hash) {
            document.getElementById(url.hash.slice(1))?.scrollIntoView();
          } else {
            window.scrollTo(0, 0);
          }
        });
      }
      return dispatch(uri);
    } catch {
      return;
    }
  });
  window.addEventListener("popstate", (e) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    const uri = uri_from_url(url);
    window.requestAnimationFrame(() => {
      if (url.hash) {
        document.getElementById(url.hash.slice(1))?.scrollIntoView();
      } else {
        window.scrollTo(0, 0);
      }
    });
    dispatch(uri);
  });
  window.addEventListener("modem-push", ({ detail }) => {
    dispatch(detail);
  });
  window.addEventListener("modem-replace", ({ detail }) => {
    dispatch(detail);
  });
};
var find_anchor = (el) => {
  if (!el || el.tagName === "BODY") {
    return null;
  } else if (el.tagName === "A") {
    return el;
  } else {
    return find_anchor(el.parentElement);
  }
};
var uri_from_url = (url) => {
  return new Uri(
    /* scheme   */
    url.protocol ? new Some(url.protocol.slice(0, -1)) : new None(),
    /* userinfo */
    new None(),
    /* host     */
    url.hostname ? new Some(url.hostname) : new None(),
    /* port     */
    url.port ? new Some(Number(url.port)) : new None(),
    /* path     */
    url.pathname,
    /* query    */
    url.search ? new Some(url.search.slice(1)) : new None(),
    /* fragment */
    url.hash ? new Some(url.hash.slice(1)) : new None()
  );
};

// build/dev/javascript/modem/modem.mjs
function init(handler) {
  return from(
    (dispatch) => {
      return guard(
        !is_browser(),
        void 0,
        () => {
          return do_init(
            (uri) => {
              let _pipe = uri;
              let _pipe$1 = handler(_pipe);
              return dispatch(_pipe$1);
            }
          );
        }
      );
    }
  );
}

// build/dev/javascript/piercing/piercing/about.mjs
function about_page() {
  return div(
    toList([
      class$(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
      )
    ]),
    toList([
      h2(
        toList([
          class$(
            "font-[Dark_Reborn] text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 tracking-wide sm:tracking-widest text-white"
          )
        ]),
        toList([text2("\uE094obre m\uE12C")])
      ),
      div(
        toList([
          class$(
            "max-w-5xl mx-auto p-6 sm:p-8 lg:p-12 border border-gray-700"
          )
        ]),
        toList([
          p(
            toList([
              class$(
                "mb-4 sm:mb-6 text-base sm:text-lg text-gray-300 leading-relaxed"
              )
            ]),
            toList([
              text2(
                "Kei Te Pinxa es un estudio de perforaciones corporales premier dedicado a proporcionar modificaciones corporales seguras, profesionales y art\xEDsticas. Nuestros perforadores experimentados usan solo materiales de la m\xE1s alta calidad y mantienen los est\xE1ndares de higiene m\xE1s estrictos."
              )
            ])
          ),
          p(
            toList([
              class$(
                "text-base sm:text-lg text-gray-300 leading-relaxed"
              )
            ]),
            toList([
              text2(
                "Creemos que las perforaciones corporales son una forma de arte y expresi\xF3n personal. Nuestro objetivo es ayudarte a lograr el look que deseas mientras aseguramos tu seguridad y comodidad durante todo el proceso."
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/piercing/piercing/components/footer.mjs
function footer2() {
  return footer(
    toList([class$("relative")]),
    toList([
      div(
        toList([
          class$("w-full overflow-hidden flex justify-center z-50")
        ]),
        toList([
          img(
            toList([
              src("/priv/static/footer-divisor.png"),
              class$("shadow max-w-7xl h-auto object-cover"),
              alt("Footer divisor"),
              attribute2("loading", "lazy")
            ])
          )
        ])
      ),
      div(
        toList([
          class$("relative py-6 px-4 sm:px-6 lg:px-8"),
          style(
            "background",
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 100%)"
          )
        ]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              div(
                toList([
                  class$(
                    "grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6"
                  )
                ]),
                toList([
                  div(
                    toList([class$("text-center md:text-left")]),
                    toList([
                      h4(
                        toList([
                          class$(
                            "text-lg font-bold text-white mb-3 tracking-wide"
                          ),
                          style(
                            "font-family",
                            "'Dark Reborn', sans-serif"
                          )
                        ]),
                        toList([text2("CONTACTO")])
                      ),
                      p(
                        toList([class$("text-gray-300 mb-2")]),
                        toList([text2("+34 663 73 66 31")])
                      ),
                      p(
                        toList([class$("text-gray-300 mb-2")]),
                        toList([text2("@keitepinxa")])
                      )
                    ])
                  ),
                  div(
                    toList([class$("text-center md:text-left")]),
                    toList([
                      h4(
                        toList([
                          class$(
                            "text-lg font-bold text-white mb-3 tracking-wide"
                          ),
                          style(
                            "font-family",
                            "'Dark Reborn', sans-serif"
                          )
                        ]),
                        toList([text2("HORARIO")])
                      ),
                      p(
                        toList([class$("text-gray-300 mb-2")]),
                        toList([text2("Lunes a S\xE1bado: 14:00 - 20:00")])
                      ),
                      p(
                        toList([class$("text-gray-300")]),
                        toList([text2("Domingo: Cerrado")])
                      )
                    ])
                  ),
                  div(
                    toList([class$("text-center md:text-left")]),
                    toList([
                      h4(
                        toList([
                          class$(
                            "text-lg font-bold text-white mb-3 tracking-wide"
                          ),
                          style(
                            "font-family",
                            "'Dark Reborn', sans-serif"
                          )
                        ]),
                        toList([text2("DIRECCI\xD3N")])
                      ),
                      p(
                        toList([class$("text-gray-300")]),
                        toList([
                          text2("C/ Doctor Jaume Segarra, 4"),
                          br(toList([])),
                          text2("46019 Valencia, Espa\xF1a")
                        ])
                      )
                    ])
                  )
                ])
              ),
              div(
                toList([class$("pt-4")]),
                toList([
                  div(
                    toList([
                      class$(
                        "flex flex-col md:flex-row justify-between items-center gap-4"
                      )
                    ]),
                    toList([
                      div(
                        toList([class$("text-center md:text-left")]),
                        toList([
                          p(
                            toList([
                              class$("text-gray-400 text-sm"),
                              style(
                                "font-family",
                                "'Dark Reborn', sans-serif"
                              )
                            ]),
                            toList([
                              text2(
                                "Piercer y modificadora corporal desde 2023"
                              )
                            ])
                          )
                        ])
                      ),
                      div(
                        toList([
                          class$("flex gap-4 text-sm text-gray-400")
                        ]),
                        toList([
                          a(
                            toList([
                              class$(
                                "hover:text-white transition-colors"
                              ),
                              href("/aviso-legal")
                            ]),
                            toList([text2("Aviso legal")])
                          ),
                          a(
                            toList([
                              class$(
                                "hover:text-white transition-colors"
                              ),
                              href("/politica-privacidad")
                            ]),
                            toList([text2("Pol\xEDtica de privacidad")])
                          ),
                          a(
                            toList([
                              class$(
                                "hover:text-white transition-colors"
                              ),
                              href("/politica-cookies")
                            ]),
                            toList([text2("Pol\xEDtica de Cookies")])
                          )
                        ])
                      )
                    ])
                  )
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/lustre/lustre/event.mjs
function is_immediate_event(name) {
  if (name === "input") {
    return true;
  } else if (name === "change") {
    return true;
  } else if (name === "focus") {
    return true;
  } else if (name === "focusin") {
    return true;
  } else if (name === "focusout") {
    return true;
  } else if (name === "blur") {
    return true;
  } else if (name === "select") {
    return true;
  } else {
    return false;
  }
}
function on(name, handler) {
  return event(
    name,
    map2(handler, (msg) => {
      return new Handler(false, false, msg);
    }),
    empty_list,
    never,
    never,
    is_immediate_event(name),
    0,
    0
  );
}
function on_click(msg) {
  return on("click", success(msg));
}

// build/dev/javascript/piercing/piercing/components/modal.mjs
var Closed = class extends CustomType {
};
var Open = class extends CustomType {
  constructor(image_src, image_alt) {
    super();
    this.image_src = image_src;
    this.image_alt = image_alt;
  }
};
function modal_view(modal, close_modal_event) {
  if (modal instanceof Closed) {
    return div(toList([]), toList([]));
  } else {
    let src2 = modal.image_src;
    let alt2 = modal.image_alt;
    return dialog(
      toList([
        class$(
          "fixed inset-0 z-50 bg-black/80 backdrop-blur-sm m-0 max-w-none max-h-none w-full h-full flex items-center justify-center p-4"
        ),
        attribute2("open", ""),
        on_click(close_modal_event)
      ]),
      toList([
        div(
          toList([
            class$(
              "relative max-w-5xl max-h-[90vh] bg-black border-2 border-transparent shadow-2xl shadow-black/80"
            )
          ]),
          toList([
            button(
              toList([
                class$(
                  "absolute top-2 right-2 text-white text-2xl font-bold z-10 w-8 h-8 flex items-center justify-center rounded-full bg-transparent border border-white/20 backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:scale-110 hover:shadow-lg hover:shadow-white/30"
                ),
                attribute2("aria-label", "Close modal"),
                on_click(close_modal_event)
              ]),
              toList([text2("\xD7")])
            ),
            figure(
              toList([
                class$(
                  "bg-black border border-white/10 relative overflow-hidden m-0"
                )
              ]),
              toList([
                img(
                  toList([
                    src(src2),
                    alt(alt2),
                    class$("max-w-full max-h-[80vh] object-contain")
                  ])
                ),
                figcaption(
                  toList([
                    class$(
                      "modal-caption-accent bg-transparent border-t border-white/10 p-4 text-center text-gray-300 uppercase tracking-[2px] relative"
                    ),
                    style("font-family", "'Dark Reborn', sans-serif"),
                    style(
                      "text-shadow",
                      "0 0 10px rgba(255,255,255,0.3), 2px 2px 4px rgba(0,0,0,0.8)"
                    )
                  ]),
                  toList([text2(alt2)])
                )
              ])
            )
          ])
        )
      ])
    );
  }
}

// build/dev/javascript/piercing/piercing/components/navbar.mjs
var Home = class extends CustomType {
};
var Gallery = class extends CustomType {
};
var About = class extends CustomType {
};
var Contact = class extends CustomType {
};
var AvisoLegal = class extends CustomType {
};
var PoliticaPrivacidad = class extends CustomType {
};
var PoliticaCookies = class extends CustomType {
};
function get_nav_class(current_route, button_route) {
  let base_class = "nav-button border-2 border-transparent text-white px-2 py-1 lg:text-2xl sm:px-4 sm:py-2 sm:text-base font-bold tracking-wide";
  let $ = isEqual(current_route, button_route);
  if ($) {
    return base_class + " active";
  } else {
    return base_class;
  }
}
function set_text_contact(route) {
  if (route instanceof Contact) {
    return "CON\uE047ACTO";
  } else {
    return "CONTACTO";
  }
}
function set_text_gallery(route) {
  if (route instanceof Gallery) {
    return "GAL\uE038R\xCDA";
  } else {
    return "GALER\xCDA";
  }
}
function set_text_about(route) {
  if (route instanceof About) {
    return "SO\uE035RE MI";
  } else {
    return "SOBRE MI";
  }
}
function navbar(current_route) {
  return nav(
    toList([
      class$(
        "font-[Dark_Reborn] bg-black/50 navbar-metallic-border px-4 sm:px-6 lg:px-8 lg:pt-5 sm:py-4 sticky top-0 z-50"
      ),
      style(
        "background",
        "linear-gradient(to top, transparent 0%, rgba(0,0,0,0.3) 20%, rgba(0,0,0,0.9) 100%)"
      )
    ]),
    toList([
      div(
        toList([
          class$(
            "flex flex-col sm:flex-row justify-items-center justify-between items-center mx-auto w-full relative"
          )
        ]),
        toList([
          div(
            toList([class$("nav-brand mb-2 sm:mb-0 sm:left-0")]),
            toList([
              a(
                toList([
                  class$(
                    "text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider text-white"
                  ),
                  href("/")
                ]),
                toList([text2("\uE072EI \uE193 PINX\uE01A")])
              )
            ])
          ),
          div(
            toList([
              class$(
                "flex flex-wrap gap-2 sm:gap-4 lg:gap-8 justify-center"
              )
            ]),
            toList([
              a(
                toList([
                  class$(get_nav_class(current_route, new Gallery())),
                  href("/gallery")
                ]),
                toList([text2(set_text_gallery(current_route))])
              ),
              a(
                toList([
                  class$(get_nav_class(current_route, new About())),
                  href("/about")
                ]),
                toList([text2(set_text_about(current_route))])
              ),
              a(
                toList([
                  class$(get_nav_class(current_route, new Contact())),
                  href("/contact")
                ]),
                toList([text2(set_text_contact(current_route))])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/piercing/piercing/contact.mjs
function contact_page() {
  return div(
    toList([
      class$(
        "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8"
      )
    ]),
    toList([
      h2(
        toList([
          class$(
            "font-[Dark_Reborn] text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 sm:mb-8 lg:mb-12 tracking-wide sm:tracking-widest text-white"
          )
        ]),
        toList([text2("\uE036ontacta con nosotro\uE136")])
      ),
      div(
        toList([
          class$(
            "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-5xl mx-auto"
          )
        ]),
        toList([
          div(
            toList([
              class$(
                "p-4 sm:p-6 lg:p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 transition-all duration-300"
              )
            ]),
            toList([
              h3(
                toList([
                  class$(
                    "mb-3 sm:mb-4 text-white text-lg sm:text-xl font-bold tracking-wide"
                  )
                ]),
                toList([text2("Horarios")])
              ),
              p(
                toList([class$("text-gray-300 mb-2")]),
                toList([text2("Lun-S\xE1b: 14pm-8pm")])
              ),
              p(
                toList([class$("text-gray-300")]),
                toList([text2("Domingo: Cerrado")])
              )
            ])
          ),
          div(
            toList([
              class$(
                "p-4 sm:p-6 lg:p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 transition-all duration-300"
              )
            ]),
            toList([
              h3(
                toList([
                  class$(
                    "mb-3 sm:mb-4 text-white text-lg sm:text-xl font-bold tracking-wide"
                  )
                ]),
                toList([text2("Tel\xE9fono")])
              ),
              p(
                toList([class$("text-gray-300")]),
                toList([text2("+34 663 73 66 31")])
              )
            ])
          ),
          div(
            toList([
              class$(
                "p-4 sm:p-6 lg:p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 transition-all duration-300"
              )
            ]),
            toList([
              h3(
                toList([
                  class$(
                    "mb-3 sm:mb-4 text-white text-lg sm:text-xl font-bold tracking-wide"
                  )
                ]),
                toList([text2("Direcci\xF3n")])
              ),
              p(
                toList([class$("text-gray-300")]),
                toList([
                  text2("C/ Doctor Jaume Segarra, 4"),
                  br(toList([])),
                  text2("46019 Valencia, Espa\xF1a")
                ])
              )
            ])
          ),
          div(
            toList([
              class$(
                "p-4 sm:p-6 lg:p-8 border border-gray-700 text-center hover:border-white hover:-translate-y-2 transition-all duration-300"
              )
            ]),
            toList([
              h3(
                toList([
                  class$(
                    "mb-3 sm:mb-4 text-white text-lg sm:text-xl font-bold tracking-wide"
                  )
                ]),
                toList([text2("Instagram")])
              ),
              p(
                toList([class$("text-gray-300")]),
                toList([text2("@keitepinxa")])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/piercing/piercing/gallery.mjs
var All = class extends CustomType {
};
var Ear = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var Facial = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var Body = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var FacialAll = class extends CustomType {
};
var Nostril = class extends CustomType {
};
var Septum = class extends CustomType {
};
var Labret = class extends CustomType {
};
var Ceja = class extends CustomType {
};
var Bridge = class extends CustomType {
};
var Medusa = class extends CustomType {
};
var Venom = class extends CustomType {
};
var Lengua = class extends CustomType {
};
var BodyAll = class extends CustomType {
};
var Ombligo = class extends CustomType {
};
var Superficie = class extends CustomType {
};
var Microdermal = class extends CustomType {
};
var EarAll = class extends CustomType {
};
var Lobulo = class extends CustomType {
};
var Helix = class extends CustomType {
};
var Industrial = class extends CustomType {
};
var Conch = class extends CustomType {
};
var Tragus = class extends CustomType {
};
var Daith = class extends CustomType {
};
var Flat = class extends CustomType {
};
function gallery_section_card(title, description, filter3, image_src, filter_event) {
  return div(
    toList([
      class$("gallery-section-card relative group overflow-hidden")
    ]),
    toList([
      div(
        toList([class$("relative aspect-[4/3] overflow-hidden")]),
        toList([
          img(
            toList([
              src(image_src),
              class$(
                "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              ),
              alt(title)
            ])
          ),
          div(
            toList([
              class$(
                "absolute inset-0 flex flex-col justify-end p-6 text-white"
              ),
              style(
                "background",
                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.9) 95%)"
              )
            ]),
            toList([
              h3(
                toList([
                  class$(
                    "text-2xl lg:text-3xl font-bold mb-2 tracking-wide transform group-hover:scale-105 transition-transform duration-300"
                  ),
                  style("font-family", "'Dark Reborn', sans-serif")
                ]),
                toList([text2(title)])
              ),
              p(
                toList([
                  class$(
                    "text-lg opacity-90 group-hover:opacity-100 transition-opacity duration-300"
                  )
                ]),
                toList([text2(description)])
              )
            ])
          )
        ])
      ),
      button(
        toList([
          class$("absolute inset-0 w-full h-full"),
          on_click(filter_event(filter3))
        ]),
        toList([])
      )
    ])
  );
}
function gallery_home_page(filter_event) {
  return div(
    toList([class$("min-h-screen")]),
    toList([
      div(
        toList([class$("px-4 sm:px-6 lg:px-8 py-8 sm:py-12")]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              h1(
                toList([
                  class$(
                    "text-4xl sm:text-5xl lg:text-6xl font-bold text-center mb-8 sm:mb-12 text-white tracking-wide"
                  ),
                  style("font-family", "'Dark Reborn', sans-serif")
                ]),
                toList([text2("Explora nuestro trabajo")])
              ),
              div(
                toList([
                  class$(
                    "grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
                  )
                ]),
                toList([
                  gallery_section_card(
                    "Perforaciones de oreja",
                    "H\xE9lix, tragus, conch y m\xE1s",
                    new Ear(new EarAll()),
                    "/priv/static/lobulo.jpeg",
                    filter_event
                  ),
                  gallery_section_card(
                    "Perforaciones faciales",
                    "Nariz, cejas, labios y lengua",
                    new Facial(new FacialAll()),
                    "/priv/static/nostril-1.jpeg",
                    filter_event
                  ),
                  gallery_section_card(
                    "Perforaciones corporales",
                    "Ombligo y dermales",
                    new Body(new BodyAll()),
                    "/priv/static/ombligo.jpeg",
                    filter_event
                  )
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}
function filter_category_list(items, filter_event, current_filter) {
  return div(
    toList([class$("ml-10 space-y-2")]),
    (() => {
      let _pipe = items;
      return map(
        _pipe,
        (item) => {
          let name;
          let filter3;
          name = item[0];
          filter3 = item[1];
          let is_active = isEqual(filter3, current_filter);
          return button(
            toList([
              class$(
                "block w-full text-left px-3 py-2 text-white hover:bg-white/30 transition-all duration-300" + (() => {
                  if (is_active) {
                    return " pl-3 bg-white/20 font-bold";
                  } else {
                    return "";
                  }
                })()
              ),
              on_click(filter_event(filter3))
            ]),
            toList([
              text2(
                (() => {
                  if (is_active) {
                    return "\u2727 " + name;
                  } else {
                    return name;
                  }
                })()
              )
            ])
          );
        }
      );
    })()
  );
}
function collapsible_category_section(title, items, items_filter, filter_event, current_filter) {
  return div(
    toList([]),
    toList([
      button(
        toList([
          class$(
            "w-full text-left flex items-center justify-between mb-4 hover:bg-white/5 transition-colors duration-200 p-2 rounded"
          )
        ]),
        toList([
          h2(
            toList([
              class$(
                "text-2xl font-bold text-white tracking-wide" + (() => {
                  if (items_filter instanceof Ear && current_filter instanceof Ear) {
                    return " font-bold text-shadow-[0_0_10px_rgba(255,255,255,0.7)]";
                  } else if (items_filter instanceof Facial && current_filter instanceof Facial) {
                    return " font-bold text-shadow-[0_0_10px_rgba(255,255,255,0.7)]";
                  } else if (items_filter instanceof Body && current_filter instanceof Body) {
                    return " font-bold text-shadow-[0_0_10px_rgba(255,255,255,0.7)]";
                  } else {
                    return "text-shadow-none!";
                  }
                })()
              ),
              style("font-family", "'Dark Reborn', sans-serif"),
              on_click(filter_event(items_filter))
            ]),
            toList([
              text2(
                (() => {
                  if (items_filter instanceof Ear && current_filter instanceof Ear) {
                    return "\uE00Ferforaciones " + title + " \u2727";
                  } else if (items_filter instanceof Facial && current_filter instanceof Facial) {
                    return "\uE00Ferforaciones " + title + " \u2727";
                  } else if (items_filter instanceof Body && current_filter instanceof Body) {
                    return "\uE00Ferforaciones " + title + " \u2727";
                  } else {
                    return title;
                  }
                })()
              )
            ])
          )
        ])
      ),
      (() => {
        if (items_filter instanceof Ear && current_filter instanceof Ear) {
          return filter_category_list(items, filter_event, current_filter);
        } else if (items_filter instanceof Facial && current_filter instanceof Facial) {
          return filter_category_list(items, filter_event, current_filter);
        } else if (items_filter instanceof Body && current_filter instanceof Body) {
          return filter_category_list(items, filter_event, current_filter);
        } else {
          return div(toList([]), toList([]));
        }
      })()
    ])
  );
}
function get_filtered_images(filter3) {
  let all_images = toList([
    ["/priv/static/lobulo.jpeg", "Perforaci\xF3n de l\xF3bulo", new Ear(new Lobulo())],
    ["/priv/static/flat.jpeg", "Perforaci\xF3n flat", new Ear(new Flat())],
    [
      "/priv/static/industrial.jpeg",
      "Perforaci\xF3n industrial",
      new Ear(new Industrial())
    ],
    ["/priv/static/oreja.jpeg", "Perforaci\xF3n h\xE9lix", new Ear(new Helix())],
    [
      "/priv/static/nostril-1.jpeg",
      "Perforaci\xF3n nostril",
      new Facial(new Nostril())
    ],
    [
      "/priv/static/nostril-2.jpeg",
      "Perforaci\xF3n nostril",
      new Facial(new Nostril())
    ],
    [
      "/priv/static/nostril-3.jpeg",
      "Perforaci\xF3n nostril",
      new Facial(new Nostril())
    ],
    [
      "/priv/static/nostril-4.jpeg",
      "Perforaci\xF3n nostril",
      new Facial(new Nostril())
    ],
    [
      "/priv/static/nostril-5.jpeg",
      "Perforaci\xF3n nostril",
      new Facial(new Nostril())
    ],
    ["/priv/static/ceja-1.heic", "Perforaci\xF3n de ceja", new Facial(new Ceja())],
    ["/priv/static/ceja-2.jpeg", "Perforaci\xF3n de ceja", new Facial(new Ceja())],
    ["/priv/static/venom.jpeg", "Perforaci\xF3n venom", new Facial(new Venom())],
    [
      "/priv/static/lengua-1.jpeg",
      "Perforaci\xF3n de lengua",
      new Facial(new Lengua())
    ],
    [
      "/priv/static/lengua-2.jpeg",
      "Perforaci\xF3n de lengua",
      new Facial(new Lengua())
    ],
    [
      "/priv/static/ombligo.jpeg",
      "Perforaci\xF3n de ombligo",
      new Body(new Ombligo())
    ],
    [
      "/priv/static/microdermal.jpeg",
      "Microdermal",
      new Body(new Microdermal())
    ],
    ["/priv/static/cuerpo.heic", "Surface", new Body(new Superficie())]
  ]);
  if (filter3 instanceof All) {
    return all_images;
  } else if (filter3 instanceof Ear) {
    let $ = filter3[0];
    if ($ instanceof EarAll) {
      let _pipe = all_images;
      return filter(
        _pipe,
        (img2) => {
          let img_filter;
          img_filter = img2[2];
          if (img_filter instanceof Ear) {
            return true;
          } else {
            return false;
          }
        }
      );
    } else {
      let specific_filter = filter3;
      let _pipe = all_images;
      return filter(
        _pipe,
        (img2) => {
          let img_filter;
          img_filter = img2[2];
          return isEqual(img_filter, specific_filter);
        }
      );
    }
  } else if (filter3 instanceof Facial) {
    let $ = filter3[0];
    if ($ instanceof FacialAll) {
      let _pipe = all_images;
      return filter(
        _pipe,
        (img2) => {
          let img_filter;
          img_filter = img2[2];
          if (img_filter instanceof Facial) {
            return true;
          } else {
            return false;
          }
        }
      );
    } else {
      let specific_filter = filter3;
      let _pipe = all_images;
      return filter(
        _pipe,
        (img2) => {
          let img_filter;
          img_filter = img2[2];
          return isEqual(img_filter, specific_filter);
        }
      );
    }
  } else {
    let $ = filter3[0];
    if ($ instanceof BodyAll) {
      let _pipe = all_images;
      return filter(
        _pipe,
        (img2) => {
          let img_filter;
          img_filter = img2[2];
          if (img_filter instanceof Body) {
            return true;
          } else {
            return false;
          }
        }
      );
    } else {
      let specific_filter = filter3;
      let _pipe = all_images;
      return filter(
        _pipe,
        (img2) => {
          let img_filter;
          img_filter = img2[2];
          return isEqual(img_filter, specific_filter);
        }
      );
    }
  }
}
function gallery_grid(filter3, open_modal_event) {
  let images = get_filtered_images(filter3);
  return div(
    toList([
      class$(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      )
    ]),
    (() => {
      let _pipe = images;
      return map(
        _pipe,
        (img2) => {
          let src2;
          let alt2;
          src2 = img2[0];
          alt2 = img2[1];
          return button(
            toList([
              class$(
                "aspect-square overflow-hidden border border-gray-700 hover:border-white transition-all duration-300 group"
              ),
              on_click(open_modal_event(src2, alt2))
            ]),
            toList([
              img(
                toList([
                  src(src2),
                  class$(
                    "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  ),
                  alt(alt2)
                ])
              )
            ])
          );
        }
      );
    })()
  );
}
var categories = /* @__PURE__ */ toList([
  [
    "Oreja",
    /* @__PURE__ */ new Ear(/* @__PURE__ */ new EarAll()),
    /* @__PURE__ */ toList([
      ["L\xF3bulo", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Lobulo())],
      ["H\xE9lix", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Helix())],
      ["Industrial", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Industrial())],
      ["Conch", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Conch())],
      ["Tragus", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Tragus())],
      ["Daith", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Daith())],
      ["Flat", /* @__PURE__ */ new Ear(/* @__PURE__ */ new Flat())]
    ])
  ],
  [
    "Faciales",
    /* @__PURE__ */ new Facial(/* @__PURE__ */ new FacialAll()),
    /* @__PURE__ */ toList([
      ["Nostril", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Nostril())],
      ["Septum", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Septum())],
      ["Labret", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Labret())],
      ["Ceja", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Ceja())],
      ["Bridge", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Bridge())],
      ["Medusa", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Medusa())],
      ["Venom", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Venom())],
      ["Lengua", /* @__PURE__ */ new Facial(/* @__PURE__ */ new Lengua())]
    ])
  ],
  [
    "Corporales",
    /* @__PURE__ */ new Body(/* @__PURE__ */ new BodyAll()),
    /* @__PURE__ */ toList([
      ["Ombligo", /* @__PURE__ */ new Body(/* @__PURE__ */ new Ombligo())],
      ["Superficie", /* @__PURE__ */ new Body(/* @__PURE__ */ new Superficie())],
      [
        "Microdermal",
        /* @__PURE__ */ new Body(/* @__PURE__ */ new Microdermal())
      ]
    ])
  ]
]);
function filter_sidebar(filter_event, current_filter) {
  return div(
    toList([class$("space-y-6")]),
    (() => {
      let _pipe = categories;
      return map(
        _pipe,
        (category) => {
          let title;
          let filter3;
          let items;
          title = category[0];
          filter3 = category[1];
          items = category[2];
          return collapsible_category_section(
            title,
            items,
            filter3,
            filter_event,
            current_filter
          );
        }
      );
    })()
  );
}
function gallery_filtered_page(filter3, filter_event, open_modal_event) {
  return div(
    toList([class$("min-h-screen")]),
    toList([
      div(
        toList([class$("px-4 sm:px-6 lg:px-8 py-8 sm:py-12")]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              div(
                toList([
                  class$("flex flex-col lg:flex-row gap-8 lg:gap-12")
                ]),
                toList([
                  div(
                    toList([class$("lg:w-64 flex-shrink-0")]),
                    toList([
                      div(
                        toList([class$("sticky top-24")]),
                        toList([filter_sidebar(filter_event, filter3)])
                      )
                    ])
                  ),
                  div(
                    toList([class$("flex-1")]),
                    toList([gallery_grid(filter3, open_modal_event)])
                  )
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}
function gallery_page(filter3, filter_event, open_modal_event) {
  if (filter3 instanceof All) {
    return gallery_home_page(filter_event);
  } else {
    return gallery_filtered_page(filter3, filter_event, open_modal_event);
  }
}

// build/dev/javascript/piercing/piercing/home.mjs
function home_page(set_category_filter_event) {
  return div(
    toList([class$("relative min-h-screen")]),
    toList([
      section(
        toList([
          class$(
            "relative text-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8"
          )
        ]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              div(
                toList([
                  class$(
                    "grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center"
                  )
                ]),
                toList([
                  div(
                    toList([
                      class$(
                        "order-1 lg:order-1 flex justify-center"
                      )
                    ]),
                    toList([
                      div(
                        toList([
                          class$(
                            "w-80 h-96 lg:w-96 lg:h-[32rem] bg-white rounded-lg flex items-center justify-center overflow-hidden"
                          )
                        ]),
                        toList([
                          img(
                            toList([
                              src(
                                "/priv/static/profile_picture.jpeg"
                              ),
                              alt("Avatar de Kei"),
                              class$("w-full h-full object-cover")
                            ])
                          )
                        ])
                      )
                    ])
                  ),
                  div(
                    toList([
                      class$(
                        "flex flex-col order-2 lg:order-2 text-center  lg:text-left"
                      )
                    ]),
                    toList([
                      h1(
                        toList([
                          class$(
                            "pb-3 text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-wide font-[Dark_Reborn]"
                          )
                        ]),
                        toList([text2("\uE007ola, soy \uE03Ee\uE12C")])
                      ),
                      p(
                        toList([
                          class$(
                            "text-lg sm:text-xl text-gray-300 mb-8 max-w-md mx-auto leading-relaxed"
                          )
                        ]),
                        toList([
                          text2(
                            "Anilladora aprendiz en proceso de convertirse en un profesional m\xE1s del mundo del body piercing. Cada d\xEDa me esfuerzo por perfeccionar mis t\xE9cnicas y brindar el mejor servicio. Mi pasi\xF3n por el arte corporal me impulsa a seguir creciendo en esta hermosa profesi\xF3n."
                          )
                        ])
                      ),
                      a(
                        toList([
                          class$(
                            "self-center max-w-[30%] text-center inline-block text-white border-2 border-white px-8 py-3 text-lg font-bold tracking-wide hover:bg-white hover:text-black transition-all duration-300 "
                          ),
                          href("/about")
                        ]),
                        toList([text2("Saber m\xE1s")])
                      )
                    ])
                  )
                ])
              )
            ])
          )
        ])
      ),
      section(
        toList([class$("px-4 sm:px-6 lg:px-8 py-12 sm:py-16")]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              div(
                toList([
                  class$(
                    "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                  )
                ]),
                toList([
                  div(
                    toList([
                      class$(
                        "justify-items-center order-2 lg:order-1"
                      )
                    ]),
                    toList([
                      h2(
                        toList([
                          class$(
                            "font-[Dark_Reborn] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-wide"
                          )
                        ]),
                        toList([text2("\uE004st\xE9ri\uE0FB")])
                      ),
                      p(
                        toList([
                          class$(
                            "text-xl text-gray-300 mb-8 leading-relaxed"
                          )
                        ]),
                        toList([
                          text2(
                            "Todo el equipo esterilizado usando tecnolog\xEDa de autoclave"
                          )
                        ])
                      )
                    ])
                  ),
                  a(
                    toList([
                      class$("order-1 lg:order-2 group "),
                      on_click(
                        set_category_filter_event(
                          new Ear(new EarAll())
                        )
                      ),
                      style(
                        "background",
                        "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0.9) 95%)"
                      ),
                      href("/gallery")
                    ]),
                    toList([
                      div(
                        toList([
                          class$(
                            "relative overflow-hidden rounded-lg"
                          )
                        ]),
                        toList([
                          img(
                            toList([
                              src("/priv/static/oreja.jpeg"),
                              alt("Perforaciones de oreja"),
                              class$(
                                "w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-300"
                              )
                            ])
                          ),
                          div(
                            toList([
                              class$(
                                "absolute bottom-0 left-0 right-0 text-white p-4"
                              ),
                              style(
                                "background",
                                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.8) 100%)"
                              )
                            ]),
                            toList([
                              p(
                                toList([
                                  class$("text-xl font-medium")
                                ]),
                                toList([text2("Perforaciones de oreja")])
                              )
                            ])
                          )
                        ])
                      )
                    ])
                  )
                ])
              )
            ])
          )
        ])
      ),
      section(
        toList([class$("px-4 sm:px-6 lg:px-8 py-12 sm:py-16")]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              div(
                toList([
                  class$(
                    "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                  )
                ]),
                toList([
                  a(
                    toList([
                      class$("order-1 lg:order-1 group "),
                      on_click(
                        set_category_filter_event(
                          new Ear(new EarAll())
                        )
                      ),
                      href("/gallery")
                    ]),
                    toList([
                      div(
                        toList([
                          class$(
                            "relative overflow-hidden rounded-lg"
                          )
                        ]),
                        toList([
                          img(
                            toList([
                              src("/priv/static/ceja-1.heic"),
                              alt("Perforaciones faciales"),
                              class$(
                                "w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-300"
                              )
                            ])
                          ),
                          div(
                            toList([
                              class$(
                                "absolute bottom-0 left-0 right-0 text-white p-4"
                              ),
                              style(
                                "background",
                                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.8) 100%)"
                              )
                            ]),
                            toList([
                              p(
                                toList([
                                  class$("text-xl font-medium")
                                ]),
                                toList([text2("Perforaciones faciales")])
                              )
                            ])
                          )
                        ])
                      )
                    ])
                  ),
                  div(
                    toList([
                      class$(
                        "justify-items-center order-2 lg:order-2 lg:text-right"
                      )
                    ]),
                    toList([
                      h2(
                        toList([
                          class$(
                            "font-[Dark_Reborn] text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-white tracking-wide"
                          )
                        ]),
                        toList([text2("\uE00Fremiu\uE0FC")])
                      ),
                      p(
                        toList([
                          class$(
                            "text-xl text-gray-300 mb-8 leading-relaxed"
                          )
                        ]),
                        toList([
                          text2(
                            "Joyer\xEDa de titanio y acero quir\xFArgico de alta calidad"
                          )
                        ])
                      )
                    ])
                  )
                ])
              )
            ])
          )
        ])
      ),
      section(
        toList([
          class$("px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:pb-20")
        ]),
        toList([
          div(
            toList([class$("max-w-7xl mx-auto")]),
            toList([
              div(
                toList([
                  class$(
                    "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
                  )
                ]),
                toList([
                  div(
                    toList([
                      class$(
                        "justify-items-center order-2 lg:order-1"
                      )
                    ]),
                    toList([
                      h2(
                        toList([
                          class$(
                            "font-[Dark_Reborn] text-3xl sm:text-5xl lg:text-6xl font-bold mb-6 text-white tracking-wide"
                          )
                        ]),
                        toList([text2("\uE004xperienci\uE0F0")])
                      ),
                      p(
                        toList([
                          class$(
                            "text-xl text-gray-300 mb-8 leading-relaxed"
                          )
                        ]),
                        toList([
                          text2(
                            "M\xE1s de 2 a\xF1os de experiencia profesional en perforaciones"
                          )
                        ])
                      )
                    ])
                  ),
                  a(
                    toList([
                      class$("order-1 lg:order-2 group "),
                      on_click(
                        set_category_filter_event(
                          new Body(new BodyAll())
                        )
                      ),
                      href("/gallery")
                    ]),
                    toList([
                      div(
                        toList([
                          class$(
                            "relative overflow-hidden rounded-lg"
                          )
                        ]),
                        toList([
                          img(
                            toList([
                              src("/priv/static/cuerpo.heic"),
                              alt("Perforaciones corporales"),
                              class$(
                                "w-full h-64 sm:h-80 lg:h-96 object-cover group-hover:scale-110 transition-transform duration-300"
                              )
                            ])
                          ),
                          div(
                            toList([
                              class$(
                                "absolute bottom-0 left-0 right-0 text-white p-4"
                              ),
                              style(
                                "background",
                                "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.1) 20%,rgba(0,0,0,0.7) 85%, rgba(0,0,0,0.8) 100%)"
                              )
                            ]),
                            toList([
                              p(
                                toList([
                                  class$("text-xl font-medium")
                                ]),
                                toList([
                                  text2("Perforaciones corporales")
                                ])
                              )
                            ])
                          )
                        ])
                      )
                    ])
                  )
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}

// build/dev/javascript/piercing/piercing/legal.mjs
var AvisoLegal2 = class extends CustomType {
};
var PoliticaPrivacidad2 = class extends CustomType {
};
var PoliticaCookies2 = class extends CustomType {
};
function aviso_legal_content() {
  return div(
    toList([class$("max-w-5xl mx-auto")]),
    toList([
      h1(
        toList([
          class$(
            "text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-white tracking-wide"
          ),
          style("font-family", "'Dark Reborn', sans-serif")
        ]),
        toList([text2("Aviso Legal")])
      ),
      div(
        toList([
          class$(
            "prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6"
          )
        ]),
        toList([
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("1. Informaci\xF3n General")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este sitio web tiene car\xE1cter meramente informativo y de portfolio profesional. En cumplimiento de la normativa vigente, se informa:"
                  )
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2")]),
                toList([
                  li(
                    toList([]),
                    toList([text2("Titular: Kei Te Pinxa")])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Actividad: Servicios de piercing y modificaciones corporales"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Ubicaci\xF3n: C/ Doctor Jaume Segarra, 4, 46019 Valencia, Espa\xF1a"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([text2("Tel\xE9fono: +34 663 73 66 31")])
                  ),
                  li(
                    toList([]),
                    toList([text2("Contacto: @keitepinxa (Instagram)")])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2("Horario: Lunes a S\xE1bado de 14:00 a 20:00h")
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("2. Finalidad del Sitio Web")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este sitio web es un portfolio informativo que muestra nuestro trabajo y proporciona informaci\xF3n sobre nuestros servicios de piercing. No se realizan transacciones comerciales online."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("3. Condiciones de Uso")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "El acceso y navegaci\xF3n por este sitio web es gratuito. El uso del sitio implica la aceptaci\xF3n de estas condiciones:"
                  )
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2 mt-3")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2(
                        "La informaci\xF3n mostrada es orientativa y puede estar sujeta a cambios"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Para servicios reales, contactar directamente en el establecimiento"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "El usuario debe usar el sitio de forma responsable y l\xEDcita"
                      )
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("4. Propiedad Intelectual")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Todos los contenidos de este sitio web (textos, im\xE1genes, fotograf\xEDas, dise\xF1o) son propiedad de Kei Te Pinxa y est\xE1n protegidos por derechos de propiedad intelectual. Queda prohibida su reproducci\xF3n sin autorizaci\xF3n."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("5. Exenci\xF3n de Responsabilidad")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Kei Te Pinxa no garantiza la disponibilidad continua del sitio web ni se responsabiliza de:"
                  )
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2 mt-3")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Interrupciones t\xE9cnicas o errores en el sitio"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Decisiones tomadas bas\xE1ndose \xFAnicamente en la informaci\xF3n del sitio"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Da\xF1os derivados del uso inadecuado del sitio web"
                      )
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("6. Enlaces Externos")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este sitio puede contener enlaces a p\xE1ginas de terceros (redes sociales). Kei Te Pinxa no se responsabiliza del contenido o pol\xEDticas de privacidad de estos sitios externos."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("7. Legislaci\xF3n Aplicable")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este aviso legal se rige por la legislaci\xF3n espa\xF1ola. Para cualquier controversia, ser\xE1 competente la jurisdicci\xF3n de Valencia, Espa\xF1a."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("8. Modificaciones")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este aviso legal puede modificarse. La versi\xF3n vigente ser\xE1 siempre la publicada en este sitio web."
                  )
                ])
              ),
              p(
                toList([class$("text-sm text-gray-400 mt-4")]),
                toList([text2("\xDAltima actualizaci\xF3n: Enero 2025")])
              )
            ])
          )
        ])
      )
    ])
  );
}
function politica_privacidad_content() {
  return div(
    toList([class$("max-w-5xl mx-auto")]),
    toList([
      h1(
        toList([
          class$(
            "text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-white tracking-wide"
          ),
          style("font-family", "'Dark Reborn', sans-serif")
        ]),
        toList([text2("Pol\xEDtica de Privacidad")])
      ),
      div(
        toList([
          class$(
            "prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6"
          )
        ]),
        toList([
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("1. Informaci\xF3n B\xE1sica")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este sitio web es un portfolio informativo. Los datos que pudi\xE9ramos recopilar se tratar\xE1n con total respeto a su privacidad y conforme al RGPD:"
                  )
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2 mt-3")]),
                toList([
                  li(
                    toList([]),
                    toList([text2("Responsable: Kei Te Pinxa")])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2("Contacto: +34 663 73 66 31 / @keitepinxa")
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Ubicaci\xF3n: C/ Doctor Jaume Segarra, 4, Valencia"
                      )
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("2. Qu\xE9 Datos Recopilamos")])
              ),
              p(
                toList([class$("mb-4")]),
                toList([text2("En este sitio web podemos recopilar:")])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Datos de navegaci\xF3n: Cookies t\xE9cnicas necesarias para el funcionamiento"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Datos de contacto: Solo si nos contacta por tel\xE9fono o redes sociales"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "No recopilamos datos personales autom\xE1ticamente a trav\xE9s del sitio web"
                      )
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("3. Para Qu\xE9 Usamos los Datos")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Los datos que pudieran proporcionarse se usan \xFAnicamente para:"
                  )
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2 mt-3")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2("Responder a consultas sobre servicios")
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Gestionar citas (presencialmente o por tel\xE9fono)"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2("Mejorar el funcionamiento del sitio web")
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("4. Sus Derechos")])
              ),
              p(
                toList([class$("mb-4")]),
                toList([text2("Tiene derecho a:")])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2("Saber qu\xE9 datos tenemos sobre usted")
                    ])
                  ),
                  li(
                    toList([]),
                    toList([text2("Corregir datos incorrectos")])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2("Solicitar la eliminaci\xF3n de sus datos")
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Retirar su consentimiento en cualquier momento"
                      )
                    ])
                  )
                ])
              ),
              p(
                toList([class$("mt-4")]),
                toList([
                  text2(
                    "Para ejercer estos derechos, contacte en +34 663 73 66 31 o visite el estudio."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("5. Seguridad")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Aplicamos medidas de seguridad adecuadas para proteger sus datos personales contra acceso no autorizado, p\xE9rdida o uso indebido."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("6. Cookies")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Este sitio web utiliza \xFAnicamente cookies t\xE9cnicas necesarias para su funcionamiento b\xE1sico. No utilizamos cookies de marketing o an\xE1lisis sin su consentimiento. Consulte nuestra Pol\xEDtica de Cookies para m\xE1s informaci\xF3n."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("7. Terceros")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "No compartimos sus datos personales con terceros, excepto cuando sea legalmente requerido."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("8. Reclamaciones")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Si considera que no tratamos sus datos correctamente, puede presentar una reclamaci\xF3n ante la Agencia Espa\xF1ola de Protecci\xF3n de Datos (www.aepd.es) o contactar con nosotros directamente."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("9. Actualizaciones")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Esta pol\xEDtica puede actualizarse ocasionalmente. La versi\xF3n actual estar\xE1 siempre disponible en este sitio web."
                  )
                ])
              ),
              p(
                toList([class$("text-sm text-gray-400 mt-4")]),
                toList([text2("\xDAltima actualizaci\xF3n: Enero 2025")])
              )
            ])
          )
        ])
      )
    ])
  );
}
function politica_cookies_content() {
  return div(
    toList([class$("max-w-5xl mx-auto")]),
    toList([
      h1(
        toList([
          class$(
            "text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-8 text-white tracking-wide"
          ),
          style("font-family", "'Dark Reborn', sans-serif")
        ]),
        toList([text2("Pol\xEDtica de Cookies")])
      ),
      div(
        toList([
          class$(
            "prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6"
          )
        ]),
        toList([
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("1. \xBFQu\xE9 son las Cookies?")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Las cookies son peque\xF1os archivos que se almacenan en su dispositivo cuando visita nuestro sitio web. Este es un portfolio informativo que utiliza cookies de forma muy limitada."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("2. Cookies que Utilizamos")])
              ),
              h3(
                toList([
                  class$(
                    "text-xl font-semibold text-white mb-3 mt-6"
                  )
                ]),
                toList([text2("Cookies T\xE9cnicas (Necesarias)")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Solo utilizamos cookies esenciales para el funcionamiento b\xE1sico del sitio:"
                  )
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2 mt-3")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2("Cookies de sesi\xF3n para la navegaci\xF3n")
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Cookies para recordar preferencias de la interfaz"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2("Estas cookies no requieren consentimiento")
                    ])
                  )
                ])
              ),
              h3(
                toList([
                  class$(
                    "text-xl font-semibold text-white mb-3 mt-6"
                  )
                ]),
                toList([text2("Cookies Anal\xEDticas")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Actualmente NO utilizamos cookies de an\xE1lisis como Google Analytics, pero si en el futuro las implement\xE1ramos, solicitaremos su consentimiento."
                  )
                ])
              ),
              h3(
                toList([
                  class$(
                    "text-xl font-semibold text-white mb-3 mt-6"
                  )
                ]),
                toList([text2("Cookies de Redes Sociales")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Si visita nuestras redes sociales desde el sitio, esos servicios pueden establecer sus propias cookies seg\xFAn sus pol\xEDticas."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("3. Control de Cookies")])
              ),
              p(
                toList([class$("mb-4")]),
                toList([
                  text2(
                    "Usted puede controlar las cookies de las siguientes formas:"
                  )
                ])
              ),
              h3(
                toList([
                  class$(
                    "text-xl font-semibold text-white mb-3 mt-6"
                  )
                ]),
                toList([text2("En su Navegador:")])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Chrome: Configuraci\xF3n > Privacidad y seguridad > Cookies"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Firefox: Preferencias > Privacidad y Seguridad"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([text2("Safari: Preferencias > Privacidad")])
                  ),
                  li(
                    toList([]),
                    toList([text2("Edge: Configuraci\xF3n > Privacidad")])
                  )
                ])
              ),
              p(
                toList([class$("mt-4 text-sm")]),
                toList([
                  text2(
                    "Nota: Desactivar las cookies t\xE9cnicas puede afectar al funcionamiento del sitio web."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("4. Duraci\xF3n")])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2")]),
                toList([
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Cookies de sesi\xF3n: Se eliminan al cerrar el navegador"
                      )
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2("Cookies de preferencias: M\xE1ximo 1 a\xF1o")
                    ])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Futuras cookies anal\xEDticas: M\xE1ximo 2 a\xF1os (si se implementan)"
                      )
                    ])
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("5. Consentimiento")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Las cookies t\xE9cnicas no requieren consentimiento al ser necesarias para el funcionamiento del sitio. Si en el futuro implementamos cookies de an\xE1lisis o marketing, solicitaremos su consentimiento previo con opciones claras para aceptar o rechazar."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("6. Terceros")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Actualmente no utilizamos servicios de terceros que establezcan cookies en nuestro sitio. Los enlaces a redes sociales no establecen cookies hasta que haga clic en ellos."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("7. Actualizaciones")])
              ),
              p(
                toList([]),
                toList([
                  text2(
                    "Esta pol\xEDtica se actualiza si cambiamos el uso de cookies. Cualquier cambio importante ser\xE1 comunicado en el sitio web."
                  )
                ])
              )
            ])
          ),
          section(
            toList([]),
            toList([
              h2(
                toList([class$("text-2xl font-bold text-white mb-4")]),
                toList([text2("8. Contacto")])
              ),
              p(
                toList([]),
                toList([
                  text2("Para consultas sobre cookies, contacte:")
                ])
              ),
              ul(
                toList([class$("list-disc ml-6 space-y-2 mt-3")]),
                toList([
                  li(
                    toList([]),
                    toList([text2("Tel\xE9fono: +34 663 73 66 31")])
                  ),
                  li(
                    toList([]),
                    toList([text2("Instagram: @keitepinxa")])
                  ),
                  li(
                    toList([]),
                    toList([
                      text2(
                        "Establecimiento: C/ Doctor Jaume Segarra, 4, Valencia"
                      )
                    ])
                  )
                ])
              ),
              p(
                toList([class$("text-sm text-gray-400 mt-4")]),
                toList([
                  text2(
                    "\xDAltima actualizaci\xF3n: Enero 2025 - Portfolio informativo"
                  )
                ])
              )
            ])
          )
        ])
      )
    ])
  );
}
function legal_page(page_type) {
  return div(
    toList([
      class$("max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12")
    ]),
    toList([
      (() => {
        if (page_type instanceof AvisoLegal2) {
          return aviso_legal_content();
        } else if (page_type instanceof PoliticaPrivacidad2) {
          return politica_privacidad_content();
        } else {
          return politica_cookies_content();
        }
      })()
    ])
  );
}

// build/dev/javascript/piercing/piercing.mjs
var FILEPATH = "src/piercing.gleam";
var Home2 = class extends CustomType {
};
var Gallery2 = class extends CustomType {
};
var About2 = class extends CustomType {
};
var Contact2 = class extends CustomType {
};
var AvisoLegal3 = class extends CustomType {
};
var PoliticaPrivacidad3 = class extends CustomType {
};
var PoliticaCookies3 = class extends CustomType {
};
var OnRouteChange = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var OpenModal = class extends CustomType {
  constructor($0, $1) {
    super();
    this[0] = $0;
    this[1] = $1;
  }
};
var CloseModal = class extends CustomType {
};
var SetGalleryFilter = class extends CustomType {
  constructor($0) {
    super();
    this[0] = $0;
  }
};
var Model = class extends CustomType {
  constructor(route, modal, gallery_filter) {
    super();
    this.route = route;
    this.modal = modal;
    this.gallery_filter = gallery_filter;
  }
};
function uri_to_route(uri) {
  let _pipe = path_segments(uri.path);
  return ((path) => {
    if (path instanceof Empty) {
      return new Home2();
    } else {
      let $ = path.tail;
      if ($ instanceof Empty) {
        let $1 = path.head;
        if ($1 === "gallery") {
          return new Gallery2();
        } else if ($1 === "about") {
          return new About2();
        } else if ($1 === "contact") {
          return new Contact2();
        } else if ($1 === "aviso-legal") {
          return new AvisoLegal3();
        } else if ($1 === "politica-privacidad") {
          return new PoliticaPrivacidad3();
        } else if ($1 === "politica-cookies") {
          return new PoliticaCookies3();
        } else {
          return new Home2();
        }
      } else {
        return new Home2();
      }
    }
  })(_pipe);
}
function on_route_change(uri) {
  let route = uri_to_route(uri);
  return new OnRouteChange(route);
}
function init2(_) {
  let _block;
  let _pipe = do_initial_uri();
  let _pipe$1 = map3(_pipe, uri_to_route);
  _block = unwrap(_pipe$1, new Home2());
  let route = _block;
  return [
    new Model(route, new Closed(), new All()),
    init(on_route_change)
  ];
}
function route_to_navbar_route(route) {
  if (route instanceof Home2) {
    return new Home();
  } else if (route instanceof Gallery2) {
    return new Gallery();
  } else if (route instanceof About2) {
    return new About();
  } else if (route instanceof Contact2) {
    return new Contact();
  } else if (route instanceof AvisoLegal3) {
    return new AvisoLegal();
  } else if (route instanceof PoliticaPrivacidad3) {
    return new PoliticaPrivacidad();
  } else {
    return new PoliticaCookies();
  }
}
function update2(model, msg) {
  if (msg instanceof OnRouteChange) {
    let route = msg[0];
    return [new Model(route, model.modal, model.gallery_filter), none()];
  } else if (msg instanceof OpenModal) {
    let src2 = msg[0];
    let alt2 = msg[1];
    return [
      new Model(model.route, new Open(src2, alt2), model.gallery_filter),
      none()
    ];
  } else if (msg instanceof CloseModal) {
    return [
      new Model(model.route, new Closed(), model.gallery_filter),
      none()
    ];
  } else {
    let filter3 = msg[0];
    return [new Model(model.route, model.modal, filter3), none()];
  }
}
function view2(model) {
  return div(
    toList([
      class$(
        "min-h-[100dvh] bg-black/85 black text-white flex flex-col cursor-[url('/priv/static/cursor-32.png'),auto]"
      )
    ]),
    toList([
      div(toList([class$("fixed-overlay-1")]), toList([])),
      div(toList([class$("fixed-overlay-2")]), toList([])),
      navbar(route_to_navbar_route(model.route)),
      main(
        toList([class$("flex-1")]),
        toList([
          (() => {
            let $ = model.route;
            if ($ instanceof Home2) {
              return home_page(
                (var0) => {
                  return new SetGalleryFilter(var0);
                }
              );
            } else if ($ instanceof Gallery2) {
              return gallery_page(
                model.gallery_filter,
                (var0) => {
                  return new SetGalleryFilter(var0);
                },
                (var0, var1) => {
                  return new OpenModal(var0, var1);
                }
              );
            } else if ($ instanceof About2) {
              return about_page();
            } else if ($ instanceof Contact2) {
              return contact_page();
            } else if ($ instanceof AvisoLegal3) {
              return legal_page(new AvisoLegal2());
            } else if ($ instanceof PoliticaPrivacidad3) {
              return legal_page(new PoliticaPrivacidad2());
            } else {
              return legal_page(new PoliticaCookies2());
            }
          })()
        ])
      ),
      footer2(),
      modal_view(model.modal, new CloseModal())
    ])
  );
}
function main2() {
  let app = application(init2, update2, view2);
  let $ = start3(app, "#app", void 0);
  if (!($ instanceof Ok)) {
    throw makeError(
      "let_assert",
      FILEPATH,
      "piercing",
      45,
      "main",
      "Pattern match failed, no pattern matched the value.",
      { value: $, start: 811, end: 860, pattern_start: 822, pattern_end: 827 }
    );
  }
  return void 0;
}

// build/.lustre/entry.mjs
main2();
