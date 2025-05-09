/* 
 * node-vibrant
 * MIT License
 * https://github.com/Vibrant-Colors/node-vibrant/blob/main/packages/node-vibrant/LICENSE.md
 * */

let vibraudioVibrant = function () {
  // node_modules/@vibrant/image/dist/esm/histogram.js
  var Histogram = class {
    constructor(pixels, opts) {
      this.pixels = pixels;
      this.opts = opts;
      const { sigBits } = opts;
      const getColorIndex = (r2, g2, b2) => (r2 << 2 * sigBits) + (g2 << sigBits) + b2;
      this.getColorIndex = getColorIndex;
      const rshift = 8 - sigBits;
      const hn = 1 << 3 * sigBits;
      const hist = new Uint32Array(hn);
      let rmax;
      let rmin;
      let gmax;
      let gmin;
      let bmax;
      let bmin;
      let r;
      let g;
      let b;
      let a;
      rmax = gmax = bmax = 0;
      rmin = gmin = bmin = Number.MAX_VALUE;
      const n = pixels.length / 4;
      let i = 0;
      while (i < n) {
        const offset = i * 4;
        i++;
        r = pixels[offset + 0];
        g = pixels[offset + 1];
        b = pixels[offset + 2];
        a = pixels[offset + 3];
        if (a === 0) continue;
        r = r >> rshift;
        g = g >> rshift;
        b = b >> rshift;
        const index = getColorIndex(r, g, b);
        if (hist[index] === void 0) hist[index] = 0;
        hist[index] += 1;
        if (r > rmax) rmax = r;
        if (r < rmin) rmin = r;
        if (g > gmax) gmax = g;
        if (g < gmin) gmin = g;
        if (b > bmax) bmax = b;
        if (b < bmin) bmin = b;
      }
      this._colorCount = hist.reduce(
        (total, c) => c > 0 ? total + 1 : total,
        0
      );
      this.hist = hist;
      this.rmax = rmax;
      this.rmin = rmin;
      this.gmax = gmax;
      this.gmin = gmin;
      this.bmax = bmax;
      this.bmin = bmin;
    }
    get colorCount() {
      return this._colorCount;
    }
  };

  // node_modules/@vibrant/image/dist/esm/index.js
  var ImageBase = class {
    scaleDown(opts) {
      const width = this.getWidth();
      const height = this.getHeight();
      let ratio = 1;
      if (opts.maxDimension > 0) {
        const maxSide = Math.max(width, height);
        if (maxSide > opts.maxDimension) ratio = opts.maxDimension / maxSide;
      } else {
        ratio = 1 / opts.quality;
      }
      if (ratio < 1) this.resize(width * ratio, height * ratio, ratio);
    }
  };
  function applyFilters(imageData, filters) {
    var _a;
    if (filters.length > 0) {
      const pixels = imageData.data;
      const n = pixels.length / 4;
      let offset;
      let r;
      let g;
      let b;
      let a;
      for (let i = 0; i < n; i++) {
        offset = i * 4;
        r = pixels[offset + 0];
        g = pixels[offset + 1];
        b = pixels[offset + 2];
        a = pixels[offset + 3];
        for (let j = 0; j < filters.length; j++) {
          if (!((_a = filters[j]) == null ? void 0 : _a.call(filters, r, g, b, a))) {
            pixels[offset + 3] = 0;
            break;
          }
        }
      }
    }
    return imageData;
  }

  // node_modules/@vibrant/image-browser/dist/esm/index.js
  function isRelativeUrl(url) {
    const u = new URL(url, location.href);
    return u.protocol === location.protocol && u.host === location.host && u.port === location.port;
  }
  function isSameOrigin(a, b) {
    const ua = new URL(a);
    const ub = new URL(b);
    return ua.protocol === ub.protocol && ua.hostname === ub.hostname && ua.port === ub.port;
  }
  var BrowserImage = class extends ImageBase {
    _getCanvas() {
      if (!this._canvas) {
        throw new Error("Canvas is not initialized");
      }
      return this._canvas;
    }
    _getContext() {
      if (!this._context) {
        throw new Error("Context is not initialized");
      }
      return this._context;
    }
    _getWidth() {
      if (!this._width) {
        throw new Error("Width is not initialized");
      }
      return this._width;
    }
    _getHeight() {
      if (!this._height) {
        throw new Error("Height is not initialized");
      }
      return this._height;
    }
    _initCanvas() {
      const img = this.image;
      if (!img) {
        throw new Error("Image is not initialized");
      }
      const canvas = this._canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new ReferenceError("Failed to create canvas context");
      this._context = context;
      canvas.className = "@vibrant/canvas";
      canvas.style.display = "none";
      this._width = canvas.width = img.width;
      this._height = canvas.height = img.height;
      context.drawImage(img, 0, 0);
      document.body.appendChild(canvas);
    }
    load(image) {
      let img;
      let src;
      if (typeof image === "string") {
        img = document.createElement("img");
        src = image;
        if (!isRelativeUrl(src) && !isSameOrigin(window.location.href, src)) {
          img.crossOrigin = "anonymous";
        }
        img.src = src;
      } else if (image instanceof HTMLImageElement) {
        img = image;
        src = image.src;
      } else {
        return Promise.reject(
          new Error(`Cannot load buffer as an image in browser`)
        );
      }
      this.image = img;
      return new Promise((resolve, reject) => {
        const onImageLoad = () => {
          this._initCanvas();
          resolve(this);
        };
        if (img.complete) {
          onImageLoad();
        } else {
          img.onload = onImageLoad;
          img.onerror = (_e) => reject(new Error(`Fail to load image: ${src}`));
        }
      });
    }
    clear() {
      this._getContext().clearRect(0, 0, this._getWidth(), this._getHeight());
    }
    update(imageData) {
      this._getContext().putImageData(imageData, 0, 0);
    }
    getWidth() {
      return this._getWidth();
    }
    getHeight() {
      return this._getHeight();
    }
    resize(targetWidth, targetHeight, ratio) {
      if (!this.image) {
        throw new Error("Image is not initialized");
      }
      this._width = this._getCanvas().width = targetWidth;
      this._height = this._getCanvas().height = targetHeight;
      this._getContext().scale(ratio, ratio);
      this._getContext().drawImage(this.image, 0, 0);
    }
    getPixelCount() {
      return this._getWidth() * this._getHeight();
    }
    getImageData() {
      return this._getContext().getImageData(
        0,
        0,
        this._getWidth(),
        this._getHeight()
      );
    }
    remove() {
      if (this._canvas && this._canvas.parentNode) {
        this._canvas.parentNode.removeChild(this._canvas);
      }
    }
  };

  // node_modules/@vibrant/core/dist/esm/utils.js
  function assignDeep(target, ...sources) {
    sources.forEach((s) => {
      if (!s) return;
      for (const key in s) {
        if (s.hasOwnProperty(key)) {
          const v = s[key];
          if (Array.isArray(v)) {
            target[key] = v.slice(0);
          } else if (typeof v === "object") {
            if (!target[key]) target[key] = {};
            assignDeep(target[key], v);
          } else {
            target[key] = v;
          }
        }
      }
    });
    return target;
  }

  // node_modules/@vibrant/core/dist/esm/options.js
  function buildProcessOptions(opts, override) {
    const { colorCount, quantizer, generators, filters } = opts;
    const commonQuantizerOpts = { colorCount };
    const q = typeof quantizer === "string" ? { name: quantizer, options: {} } : quantizer;
    q.options = assignDeep({}, commonQuantizerOpts, q.options);
    return assignDeep(
      {},
      {
        quantizer: q,
        generators,
        filters
      },
      override
    );
  }

  // node_modules/@vibrant/core/dist/esm/builder.js
  var Builder = class {
    /**
     * Arguments are the same as `Vibrant.constructor`.
     */
    constructor(src, opts = {}) {
      this._src = src;
      this._opts = assignDeep({}, Vibrant.DefaultOpts, opts);
    }
    /**
     * Sets `opts.colorCount` to `n`.
     * @returns this `Builder` instance.
     */
    maxColorCount(n) {
      this._opts.colorCount = n;
      return this;
    }
    /**
     * Sets `opts.maxDimension` to `d`.
     * @returns this `Builder` instance.
     */
    maxDimension(d) {
      this._opts.maxDimension = d;
      return this;
    }
    /**
     * Adds a filter function
     * @returns this `Builder` instance.
     */
    addFilter(name) {
      if (!this._opts.filters) {
        this._opts.filters = [name];
      } else {
        this._opts.filters.push(name);
      }
      return this;
    }
    /**
     * Removes a filter function.
     * @returns this `Builder` instance.
     */
    removeFilter(name) {
      if (this._opts.filters) {
        const i = this._opts.filters.indexOf(name);
        if (i > 0) this._opts.filters.splice(i);
      }
      return this;
    }
    /**
     * Clear all filters.
     * @returns this `Builder` instance.
     */
    clearFilters() {
      this._opts.filters = [];
      return this;
    }
    /**
     * Sets `opts.quality` to `q`.
     * @returns this `Builder` instance.
     */
    quality(q) {
      this._opts.quality = q;
      return this;
    }
    /**
     * Specifies which `Image` implementation class to use.
     * @returns this `Builder` instance.
     */
    useImageClass(imageClass) {
      this._opts.ImageClass = imageClass;
      return this;
    }
    /**
     * Sets `opts.generator` to `generator`
     * @returns this `Builder` instance.
     */
    useGenerator(generator, options) {
      if (!this._opts.generators) this._opts.generators = [];
      this._opts.generators.push(
        options ? { name: generator, options } : generator
      );
      return this;
    }
    /**
     * Specifies which `Quantizer` implementation class to use
     * @returns this `Builder` instance.
     */
    useQuantizer(quantizer, options) {
      this._opts.quantizer = options ? { name: quantizer, options } : quantizer;
      return this;
    }
    /**
     * Builds and returns a `Vibrant` instance as configured.
     */
    build() {
      return new Vibrant(this._src, this._opts);
    }
    /**
     * Builds a `Vibrant` instance as configured and calls its `getPalette` method.
     */
    getPalette() {
      return this.build().getPalette();
    }
  };

  // node_modules/@vibrant/core/dist/esm/pipeline/index.js
  var Stage = class {
    constructor(pipeline2) {
      this.pipeline = pipeline2;
      this._map = {};
    }
    names() {
      return Object.keys(this._map);
    }
    has(name) {
      return !!this._map[name];
    }
    get(name) {
      return this._map[name];
    }
    register(name, stageFn) {
      this._map[name] = stageFn;
      return this.pipeline;
    }
  };
  var BasicPipeline = class {
    constructor() {
      this.filter = new Stage(this);
      this.quantizer = new Stage(this);
      this.generator = new Stage(this);
    }
    _buildProcessTasks({
      filters,
      quantizer,
      generators
    }) {
      if (generators.length === 1 && generators[0] === "*") {
        generators = this.generator.names();
      }
      return {
        filters: filters.map((f) => createTask(this.filter, f)),
        quantizer: createTask(this.quantizer, quantizer),
        generators: generators.map((g) => createTask(this.generator, g))
      };
      function createTask(stage, o) {
        let name;
        let options;
        if (typeof o === "string") {
          name = o;
        } else {
          name = o.name;
          options = o.options;
        }
        return {
          name,
          fn: stage.get(name),
          options
        };
      }
    }
    async process(imageData, opts) {
      const { filters, quantizer, generators } = this._buildProcessTasks(opts);
      const imageFilterData = await this._filterColors(filters, imageData);
      const colors = await this._generateColors(quantizer, imageFilterData);
      const palettes = await this._generatePalettes(generators, colors);
      return {
        colors,
        palettes
      };
    }
    _filterColors(filters, imageData) {
      return Promise.resolve(
        applyFilters(
          imageData,
          filters.map(({ fn }) => fn)
        )
      );
    }
    _generateColors(quantizer, imageData) {
      return Promise.resolve(quantizer.fn(imageData.data, quantizer.options));
    }
    async _generatePalettes(generators, colors) {
      const promiseArr = await Promise.all(
        generators.map(({ fn, options }) => Promise.resolve(fn(colors, options)))
      );
      return Promise.resolve(
        promiseArr.reduce(
          (promises, promiseVal, i) => {
            promises[generators[i].name] = promiseVal;
            return promises;
          },
          {}
        )
      );
    }
  };

  // node_modules/@vibrant/color/dist/esm/converter.js
  function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1, 7);
  }
  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    let r;
    let g;
    let b;
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    return [r * 255, g * 255, b * 255];
  }

  // node_modules/@vibrant/color/dist/esm/index.js
  var Swatch = class _Swatch {
    static applyFilters(colors, filters) {
      return filters.length > 0 ? colors.filter(({ r, g, b }) => {
        var _a;
        for (let j = 0; j < filters.length; j++) {
          if (!((_a = filters[j]) == null ? void 0 : _a.call(filters, r, g, b, 255))) return false;
        }
        return true;
      }) : colors;
    }
    /**
     * Make a value copy of a swatch based on a previous one. Returns a new Swatch instance
     * @param {Swatch} swatch
     */
    static clone(swatch) {
      return new _Swatch(swatch._rgb, swatch._population);
    }
    /**
     * The red value in the RGB value
     */
    get r() {
      return this._rgb[0];
    }
    /**
     * The green value in the RGB value
     */
    get g() {
      return this._rgb[1];
    }
    /**
     * The blue value in the RGB value
     */
    get b() {
      return this._rgb[2];
    }
    /**
     * The color value as a rgb value
     */
    get rgb() {
      return this._rgb;
    }
    /**
     * The color value as a hsl value
     */
    get hsl() {
      if (!this._hsl) {
        const [r, g, b] = this._rgb;
        this._hsl = rgbToHsl(r, g, b);
      }
      return this._hsl;
    }
    /**
     * The color value as a hex string
     */
    get hex() {
      if (!this._hex) {
        const [r, g, b] = this._rgb;
        this._hex = rgbToHex(r, g, b);
      }
      return this._hex;
    }
    get population() {
      return this._population;
    }
    /**
     * Get the JSON object for the swatch
     */
    toJSON() {
      return {
        rgb: this.rgb,
        population: this.population
      };
    }
    getYiq() {
      if (!this._yiq) {
        const rgb = this._rgb;
        this._yiq = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1e3;
      }
      return this._yiq;
    }
    /**
     * Returns an appropriate color to use for any 'title' text which is displayed over this Swatch's color.
     */
    get titleTextColor() {
      if (!this._titleTextColor) {
        this._titleTextColor = this.getYiq() < 200 ? "#fff" : "#000";
      }
      return this._titleTextColor;
    }
    /**
     * Returns an appropriate color to use for any 'body' text which is displayed over this Swatch's color.
     */
    get bodyTextColor() {
      if (!this._bodyTextColor) {
        this._bodyTextColor = this.getYiq() < 150 ? "#fff" : "#000";
      }
      return this._bodyTextColor;
    }
    /**
     * Internal use.
     * @param rgb `[r, g, b]`
     * @param population Population of the color in an image
     */
    constructor(rgb, population) {
      this._rgb = rgb;
      this._population = population;
    }
  };

  // node_modules/@vibrant/core/dist/esm/index.js
  var _Vibrant = class _Vibrant2 {
    /**
     *
     * @param _src Path to image file (supports HTTP/HTTPs)
     * @param opts Options (optional)
     */
    constructor(_src, opts) {
      this._src = _src;
      this.opts = assignDeep({}, _Vibrant2.DefaultOpts, opts);
    }
    static use(pipeline2) {
      this._pipeline = pipeline2;
    }
    static from(src) {
      return new Builder(src);
    }
    get result() {
      return this._result;
    }
    _process(image, opts) {
      image.scaleDown(this.opts);
      const processOpts = buildProcessOptions(this.opts, opts);
      return _Vibrant2._pipeline.process(image.getImageData(), processOpts);
    }
    async getPalette() {
      const image = new this.opts.ImageClass();
      try {
        const image1 = await image.load(this._src);
        const result1 = await this._process(image1, {
          generators: ["default"]
        });
        this._result = result1;
        const res = result1.palettes["default"];
        if (!res) {
          throw new Error(
            `Something went wrong and a palette was not found, please file a bug against our GitHub repo: https://github.com/vibrant-Colors/node-vibrant/`
          );
        }
        image.remove();
        return res;
      } catch (err) {
        image.remove();
        return Promise.reject(err);
      }
    }
    async getPalettes() {
      const image = new this.opts.ImageClass();
      try {
        const image1 = await image.load(this._src);
        const result1 = await this._process(image1, {
          generators: ["*"]
        });
        this._result = result1;
        const res = result1.palettes;
        image.remove();
        return res;
      } catch (err) {
        image.remove();
        return Promise.reject(err);
      }
    }
  };
  _Vibrant.DefaultOpts = {
    colorCount: 64,
    quality: 5,
    filters: []
  };
  var Vibrant = _Vibrant;

  // node_modules/node-vibrant/dist/esm/configs/config.js
  Vibrant.DefaultOpts.quantizer = "mmcq";
  Vibrant.DefaultOpts.generators = ["default"];
  Vibrant.DefaultOpts.filters = ["default"];

  // node_modules/node-vibrant/dist/esm/configs/browser.js
  Vibrant.DefaultOpts.ImageClass = BrowserImage;

  // node_modules/@vibrant/quantizer-mmcq/dist/esm/vbox.js
  var SIGBITS = 5;
  var RSHIFT = 8 - SIGBITS;
  var VBox = class _VBox {
    constructor(r1, r2, g1, g2, b1, b2, histogram) {
      this.histogram = histogram;
      this._volume = -1;
      this._avg = null;
      this._count = -1;
      this.dimension = { r1, r2, g1, g2, b1, b2 };
    }
    static build(pixels) {
      const h = new Histogram(pixels, { sigBits: SIGBITS });
      const { rmin, rmax, gmin, gmax, bmin, bmax } = h;
      return new _VBox(rmin, rmax, gmin, gmax, bmin, bmax, h);
    }
    invalidate() {
      this._volume = this._count = -1;
      this._avg = null;
    }
    volume() {
      if (this._volume < 0) {
        const { r1, r2, g1, g2, b1, b2 } = this.dimension;
        this._volume = (r2 - r1 + 1) * (g2 - g1 + 1) * (b2 - b1 + 1);
      }
      return this._volume;
    }
    count() {
      if (this._count < 0) {
        const { hist, getColorIndex } = this.histogram;
        const { r1, r2, g1, g2, b1, b2 } = this.dimension;
        let c = 0;
        for (let r = r1; r <= r2; r++) {
          for (let g = g1; g <= g2; g++) {
            for (let b = b1; b <= b2; b++) {
              const index = getColorIndex(r, g, b);
              if (!hist[index]) {
                continue;
              }
              c += hist[index];
            }
          }
        }
        this._count = c;
      }
      return this._count;
    }
    clone() {
      const { histogram } = this;
      const { r1, r2, g1, g2, b1, b2 } = this.dimension;
      return new _VBox(r1, r2, g1, g2, b1, b2, histogram);
    }
    avg() {
      if (!this._avg) {
        const { hist, getColorIndex } = this.histogram;
        const { r1, r2, g1, g2, b1, b2 } = this.dimension;
        let ntot = 0;
        const mult = 1 << 8 - SIGBITS;
        let rsum;
        let gsum;
        let bsum;
        rsum = gsum = bsum = 0;
        for (let r = r1; r <= r2; r++) {
          for (let g = g1; g <= g2; g++) {
            for (let b = b1; b <= b2; b++) {
              const index = getColorIndex(r, g, b);
              const h = hist[index];
              if (!h) continue;
              ntot += h;
              rsum += h * (r + 0.5) * mult;
              gsum += h * (g + 0.5) * mult;
              bsum += h * (b + 0.5) * mult;
            }
          }
        }
        if (ntot) {
          this._avg = [~~(rsum / ntot), ~~(gsum / ntot), ~~(bsum / ntot)];
        } else {
          this._avg = [
            ~~(mult * (r1 + r2 + 1) / 2),
            ~~(mult * (g1 + g2 + 1) / 2),
            ~~(mult * (b1 + b2 + 1) / 2)
          ];
        }
      }
      return this._avg;
    }
    contains(rgb) {
      let [r, g, b] = rgb;
      const { r1, r2, g1, g2, b1, b2 } = this.dimension;
      r >>= RSHIFT;
      g >>= RSHIFT;
      b >>= RSHIFT;
      return r >= r1 && r <= r2 && g >= g1 && g <= g2 && b >= b1 && b <= b2;
    }
    split() {
      const { hist, getColorIndex } = this.histogram;
      const { r1, r2, g1, g2, b1, b2 } = this.dimension;
      const count = this.count();
      if (!count) return [];
      if (count === 1) return [this.clone()];
      const rw = r2 - r1 + 1;
      const gw = g2 - g1 + 1;
      const bw = b2 - b1 + 1;
      const maxw = Math.max(rw, gw, bw);
      let accSum = null;
      let sum;
      let total;
      sum = total = 0;
      let maxd = null;
      if (maxw === rw) {
        maxd = "r";
        accSum = new Uint32Array(r2 + 1);
        for (let r = r1; r <= r2; r++) {
          sum = 0;
          for (let g = g1; g <= g2; g++) {
            for (let b = b1; b <= b2; b++) {
              const index = getColorIndex(r, g, b);
              if (!hist[index]) continue;
              sum += hist[index];
            }
          }
          total += sum;
          accSum[r] = total;
        }
      } else if (maxw === gw) {
        maxd = "g";
        accSum = new Uint32Array(g2 + 1);
        for (let g = g1; g <= g2; g++) {
          sum = 0;
          for (let r = r1; r <= r2; r++) {
            for (let b = b1; b <= b2; b++) {
              const index = getColorIndex(r, g, b);
              if (!hist[index]) continue;
              sum += hist[index];
            }
          }
          total += sum;
          accSum[g] = total;
        }
      } else {
        maxd = "b";
        accSum = new Uint32Array(b2 + 1);
        for (let b = b1; b <= b2; b++) {
          sum = 0;
          for (let r = r1; r <= r2; r++) {
            for (let g = g1; g <= g2; g++) {
              const index = getColorIndex(r, g, b);
              if (!hist[index]) continue;
              sum += hist[index];
            }
          }
          total += sum;
          accSum[b] = total;
        }
      }
      let splitPoint = -1;
      const reverseSum = new Uint32Array(accSum.length);
      for (let i = 0; i < accSum.length; i++) {
        const d = accSum[i];
        if (!d) continue;
        if (splitPoint < 0 && d > total / 2) splitPoint = i;
        reverseSum[i] = total - d;
      }
      const vbox = this;
      function doCut(d) {
        const dim1 = d + "1";
        const dim2 = d + "2";
        const d1 = vbox.dimension[dim1];
        let d2 = vbox.dimension[dim2];
        const vbox1 = vbox.clone();
        const vbox2 = vbox.clone();
        const left = splitPoint - d1;
        const right = d2 - splitPoint;
        if (left <= right) {
          d2 = Math.min(d2 - 1, ~~(splitPoint + right / 2));
          d2 = Math.max(0, d2);
        } else {
          d2 = Math.max(d1, ~~(splitPoint - 1 - left / 2));
          d2 = Math.min(vbox.dimension[dim2], d2);
        }
        while (!accSum[d2]) d2++;
        let c2 = reverseSum[d2];
        while (!c2 && accSum[d2 - 1]) c2 = reverseSum[--d2];
        vbox1.dimension[dim2] = d2;
        vbox2.dimension[dim1] = d2 + 1;
        return [vbox1, vbox2];
      }
      return doCut(maxd);
    }
  };

  // node_modules/@vibrant/quantizer-mmcq/dist/esm/pqueue.js
  var PQueue = class {
    _sort() {
      if (!this._sorted) {
        this.contents.sort(this._comparator);
        this._sorted = true;
      }
    }
    constructor(comparator) {
      this._comparator = comparator;
      this.contents = [];
      this._sorted = false;
    }
    push(item) {
      this.contents.push(item);
      this._sorted = false;
    }
    peek(index) {
      this._sort();
      index = typeof index === "number" ? index : this.contents.length - 1;
      return this.contents[index];
    }
    pop() {
      this._sort();
      return this.contents.pop();
    }
    size() {
      return this.contents.length;
    }
    map(mapper) {
      this._sort();
      return this.contents.map(mapper);
    }
  };

  // node_modules/@vibrant/quantizer-mmcq/dist/esm/index.js
  var fractByPopulations = 0.75;
  function _splitBoxes(pq, target) {
    let lastSize = pq.size();
    while (pq.size() < target) {
      const vbox = pq.pop();
      if (vbox && vbox.count() > 0) {
        const [vbox1, vbox2] = vbox.split();
        if (!vbox1) break;
        pq.push(vbox1);
        if (vbox2 && vbox2.count() > 0) pq.push(vbox2);
        if (pq.size() === lastSize) {
          break;
        } else {
          lastSize = pq.size();
        }
      } else {
        break;
      }
    }
  }
  var MMCQ = (pixels, opts) => {
    if (pixels.length === 0 || opts.colorCount < 2 || opts.colorCount > 256) {
      throw new Error("Wrong MMCQ parameters");
    }
    const vbox = VBox.build(pixels);
    vbox.histogram.colorCount;
    const pq = new PQueue((a, b) => a.count() - b.count());
    pq.push(vbox);
    _splitBoxes(pq, fractByPopulations * opts.colorCount);
    const pq2 = new PQueue(
      (a, b) => a.count() * a.volume() - b.count() * b.volume()
    );
    pq2.contents = pq.contents;
    _splitBoxes(pq2, opts.colorCount - pq2.size());
    return generateSwatches(pq2);
  };
  function generateSwatches(pq) {
    const swatches = [];
    while (pq.size()) {
      const v = pq.pop();
      const color = v.avg();
      swatches.push(new Swatch(color, v.count()));
    }
    return swatches;
  }

  // node_modules/@vibrant/generator-default/dist/esm/index.js
  var DefaultOpts = {
    targetDarkLuma: 0.26,
    maxDarkLuma: 0.45,
    minLightLuma: 0.55,
    targetLightLuma: 0.74,
    minNormalLuma: 0.3,
    targetNormalLuma: 0.5,
    maxNormalLuma: 0.7,
    targetMutesSaturation: 0.3,
    maxMutesSaturation: 0.4,
    targetVibrantSaturation: 1,
    minVibrantSaturation: 0.35,
    weightSaturation: 3,
    weightLuma: 6.5,
    weightPopulation: 0.5
  };
  function _findMaxPopulation(swatches) {
    let p = 0;
    swatches.forEach((s) => {
      p = Math.max(p, s.population);
    });
    return p;
  }
  function _isAlreadySelected(palette, s) {
    return palette.Vibrant === s || palette.DarkVibrant === s || palette.LightVibrant === s || palette.Muted === s || palette.DarkMuted === s || palette.LightMuted === s;
  }
  function _createComparisonValue(saturation, targetSaturation, luma, targetLuma, population, maxPopulation, opts) {
    function weightedMean(...values) {
      let sum = 0;
      let weightSum = 0;
      for (let i = 0; i < values.length; i += 2) {
        const value = values[i];
        const weight = values[i + 1];
        if (!value || !weight) continue;
        sum += value * weight;
        weightSum += weight;
      }
      return sum / weightSum;
    }
    function invertDiff(value, targetValue) {
      return 1 - Math.abs(value - targetValue);
    }
    return weightedMean(
      invertDiff(saturation, targetSaturation),
      opts.weightSaturation,
      invertDiff(luma, targetLuma),
      opts.weightLuma,
      population / maxPopulation,
      opts.weightPopulation
    );
  }
  function _findColorVariation(palette, swatches, maxPopulation, targetLuma, minLuma, maxLuma, targetSaturation, minSaturation, maxSaturation, opts) {
    let max = null;
    let maxValue = 0;
    swatches.forEach((swatch) => {
      const [, s, l] = swatch.hsl;
      if (s >= minSaturation && s <= maxSaturation && l >= minLuma && l <= maxLuma && !_isAlreadySelected(palette, swatch)) {
        const value = _createComparisonValue(
          s,
          targetSaturation,
          l,
          targetLuma,
          swatch.population,
          maxPopulation,
          opts
        );
        if (max === null || value > maxValue) {
          max = swatch;
          maxValue = value;
        }
      }
    });
    return max;
  }
  function _generateVariationColors(swatches, maxPopulation, opts) {
    const palette = {
      Vibrant: null,
      DarkVibrant: null,
      LightVibrant: null,
      Muted: null,
      DarkMuted: null,
      LightMuted: null
    };
    palette.Vibrant = _findColorVariation(
      palette,
      swatches,
      maxPopulation,
      opts.targetNormalLuma,
      opts.minNormalLuma,
      opts.maxNormalLuma,
      opts.targetVibrantSaturation,
      opts.minVibrantSaturation,
      1,
      opts
    );
    palette.LightVibrant = _findColorVariation(
      palette,
      swatches,
      maxPopulation,
      opts.targetLightLuma,
      opts.minLightLuma,
      1,
      opts.targetVibrantSaturation,
      opts.minVibrantSaturation,
      1,
      opts
    );
    palette.DarkVibrant = _findColorVariation(
      palette,
      swatches,
      maxPopulation,
      opts.targetDarkLuma,
      0,
      opts.maxDarkLuma,
      opts.targetVibrantSaturation,
      opts.minVibrantSaturation,
      1,
      opts
    );
    palette.Muted = _findColorVariation(
      palette,
      swatches,
      maxPopulation,
      opts.targetNormalLuma,
      opts.minNormalLuma,
      opts.maxNormalLuma,
      opts.targetMutesSaturation,
      0,
      opts.maxMutesSaturation,
      opts
    );
    palette.LightMuted = _findColorVariation(
      palette,
      swatches,
      maxPopulation,
      opts.targetLightLuma,
      opts.minLightLuma,
      1,
      opts.targetMutesSaturation,
      0,
      opts.maxMutesSaturation,
      opts
    );
    palette.DarkMuted = _findColorVariation(
      palette,
      swatches,
      maxPopulation,
      opts.targetDarkLuma,
      0,
      opts.maxDarkLuma,
      opts.targetMutesSaturation,
      0,
      opts.maxMutesSaturation,
      opts
    );
    return palette;
  }
  function _generateEmptySwatches(palette, _maxPopulation, opts) {
    if (!palette.Vibrant && !palette.DarkVibrant && !palette.LightVibrant) {
      if (!palette.DarkVibrant && palette.DarkMuted) {
        let [h, s, l] = palette.DarkMuted.hsl;
        l = opts.targetDarkLuma;
        palette.DarkVibrant = new Swatch(hslToRgb(h, s, l), 0);
      }
      if (!palette.LightVibrant && palette.LightMuted) {
        let [h, s, l] = palette.LightMuted.hsl;
        l = opts.targetDarkLuma;
        palette.DarkVibrant = new Swatch(hslToRgb(h, s, l), 0);
      }
    }
    if (!palette.Vibrant && palette.DarkVibrant) {
      let [h, s, l] = palette.DarkVibrant.hsl;
      l = opts.targetNormalLuma;
      palette.Vibrant = new Swatch(hslToRgb(h, s, l), 0);
    } else if (!palette.Vibrant && palette.LightVibrant) {
      let [h, s, l] = palette.LightVibrant.hsl;
      l = opts.targetNormalLuma;
      palette.Vibrant = new Swatch(hslToRgb(h, s, l), 0);
    }
    if (!palette.DarkVibrant && palette.Vibrant) {
      let [h, s, l] = palette.Vibrant.hsl;
      l = opts.targetDarkLuma;
      palette.DarkVibrant = new Swatch(hslToRgb(h, s, l), 0);
    }
    if (!palette.LightVibrant && palette.Vibrant) {
      let [h, s, l] = palette.Vibrant.hsl;
      l = opts.targetLightLuma;
      palette.LightVibrant = new Swatch(hslToRgb(h, s, l), 0);
    }
    if (!palette.Muted && palette.Vibrant) {
      let [h, s, l] = palette.Vibrant.hsl;
      l = opts.targetMutesSaturation;
      palette.Muted = new Swatch(hslToRgb(h, s, l), 0);
    }
    if (!palette.DarkMuted && palette.DarkVibrant) {
      let [h, s, l] = palette.DarkVibrant.hsl;
      l = opts.targetMutesSaturation;
      palette.DarkMuted = new Swatch(hslToRgb(h, s, l), 0);
    }
    if (!palette.LightMuted && palette.LightVibrant) {
      let [h, s, l] = palette.LightVibrant.hsl;
      l = opts.targetMutesSaturation;
      palette.LightMuted = new Swatch(hslToRgb(h, s, l), 0);
    }
  }
  var DefaultGenerator = (swatches, opts) => {
    opts = Object.assign({}, DefaultOpts, opts);
    const maxPopulation = _findMaxPopulation(swatches);
    const palette = _generateVariationColors(swatches, maxPopulation, opts);
    _generateEmptySwatches(palette, maxPopulation, opts);
    return palette;
  };

  // node_modules/node-vibrant/dist/esm/pipeline/index.js
  var pipeline = new BasicPipeline().filter.register(
    "default",
    (r, g, b, a) => a >= 125 && !(r > 250 && g > 250 && b > 250)
  ).quantizer.register("mmcq", MMCQ).generator.register("default", DefaultGenerator);

  // node_modules/node-vibrant/dist/esm/browser.js
  Vibrant.use(pipeline);

  // index.js
  window.vibraudio_Vibrant = Vibrant;
};

vibraudioVibrant() 