import "./subworkers-f28dd231-DEgT2DJG.js";
import {ae as e, af as t, B as r, b as o, ag as a, d as n, t as s, O as i, ah as c, ai as l, K as d, n as u, N as f, S as m, aj as h, ak as g, al as p, am as w, V as b, Q as y, Y as x, Z as D, an as A, M as T, ao as M, ap as E, z as P, p as k, aq as I, ar as C, e as v, q as S, T as j} from "./colors-6hnOJkmq.js";
const O = new WeakMap;
class _ extends e {
    constructor(e) {
        super(e),
        this.decoderPath = "",
        this.decoderConfig = {},
        this.decoderBinary = null,
        this.decoderPending = null,
        this.workerLimit = 4,
        this.workerPool = [],
        this.workerNextTaskID = 1,
        this.workerSourceURL = "",
        this.defaultAttributeIDs = {
            position: "POSITION",
            normal: "NORMAL",
            color: "COLOR",
            uv: "TEX_COORD"
        },
        this.defaultAttributeTypes = {
            position: "Float32Array",
            normal: "Float32Array",
            color: "Float32Array",
            uv: "Float32Array"
        }
    }
    setDecoderPath(e) {
        return this.decoderPath = e,
        this
    }
    setDecoderConfig(e) {
        return this.decoderConfig = e,
        this
    }
    setWorkerLimit(e) {
        return this.workerLimit = e,
        this
    }
    load(e, r, o, a) {
        const n = new t(this.manager);
        n.setPath(this.path),
        n.setResponseType("arraybuffer"),
        n.setRequestHeader(this.requestHeader),
        n.setWithCredentials(this.withCredentials),
        n.load(e, (e => {
            const t = {
                attributeIDs: this.defaultAttributeIDs,
                attributeTypes: this.defaultAttributeTypes,
                useUniqueIDs: !1
            };
            this.decodeGeometry(e, t).then(r).catch(a)
        }
        ), o, a)
    }
    decodeDracoFile(e, t, r, o) {
        const a = {
            attributeIDs: r || this.defaultAttributeIDs,
            attributeTypes: o || this.defaultAttributeTypes,
            useUniqueIDs: !!r
        };
        this.decodeGeometry(e, a).then(t)
    }
    decodeGeometry(e, t) {
        for (const e in t.attributeTypes) {
            const r = t.attributeTypes[e];
            void 0 !== r.BYTES_PER_ELEMENT && (t.attributeTypes[e] = r.name)
        }
        const r = JSON.stringify(t);
        if (O.has(e)) {
            const t = O.get(e);
            if (t.key === r)
                return t.promise;
            if (0 === e.byteLength)
                throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")
        }
        let o;
        const a = this.workerNextTaskID++
          , n = e.byteLength
          , s = this._getWorker(a, n).then((r => (o = r,
        new Promise(( (r, n) => {
            o._callbacks[a] = {
                resolve: r,
                reject: n
            },
            o.postMessage({
                type: "decode",
                id: a,
                taskConfig: t,
                buffer: e
            }, [e])
        }
        ))))).then((e => this._createGeometry(e.geometry)));
        return s.catch(( () => !0)).then(( () => {
            o && a && this._releaseTask(o, a)
        }
        )),
        O.set(e, {
            key: r,
            promise: s
        }),
        s
    }
    _createGeometry(e) {
        const t = new r;
        e.index && t.setIndex(new o(e.index.array,1));
        for (let r = 0; r < e.attributes.length; r++) {
            const a = e.attributes[r]
              , n = a.name
              , s = a.array
              , i = a.itemSize;
            t.setAttribute(n, new o(s,i))
        }
        return t
    }
    _loadLibrary(e, r) {
        const o = new t(this.manager);
        return o.setPath(this.decoderPath),
        o.setResponseType(r),
        o.setWithCredentials(this.withCredentials),
        new Promise(( (t, r) => {
            o.load(e, t, void 0, r)
        }
        ))
    }
    preload() {
        return this._initDecoder(),
        this
    }
    _initDecoder() {
        if (this.decoderPending)
            return this.decoderPending;
        const e = "object" != typeof WebAssembly || "js" === this.decoderConfig.type
          , t = [];
        return e ? t.push(this._loadLibrary("draco_decoder.js", "text")) : (t.push(this._loadLibrary("draco_wasm_wrapper.js", "text")),
        t.push(this._loadLibrary("draco_decoder.wasm", "arraybuffer"))),
        this.decoderPending = Promise.all(t).then((t => {
            const r = t[0];
            e || (this.decoderConfig.wasmBinary = t[1]);
            const o = W.toString()
              , a = ["/* draco decoder */", r, "", "/* worker */", o.substring(o.indexOf("{") + 1, o.lastIndexOf("}"))].join("\n");
            this.workerSourceURL = URL.createObjectURL(new Blob([a]))
        }
        )),
        this.decoderPending
    }
    _getWorker(e, t) {
        return this._initDecoder().then(( () => {
            if (this.workerPool.length < this.workerLimit) {
                const e = new Worker(this.workerSourceURL);
                e._callbacks = {},
                e._taskCosts = {},
                e._taskLoad = 0,
                e.postMessage({
                    type: "init",
                    decoderConfig: this.decoderConfig
                }),
                e.onmessage = function(t) {
                    const r = t.data;
                    switch (r.type) {
                    case "decode":
                        e._callbacks[r.id].resolve(r);
                        break;
                    case "error":
                        e._callbacks[r.id].reject(r);
                        break;
                    default:
                        console.error('THREE.DRACOLoader: Unexpected message, "' + r.type + '"')
                    }
                }
                ,
                this.workerPool.push(e)
            } else
                this.workerPool.sort((function(e, t) {
                    return e._taskLoad > t._taskLoad ? -1 : 1
                }
                ));
            const r = this.workerPool[this.workerPool.length - 1];
            return r._taskCosts[e] = t,
            r._taskLoad += t,
            r
        }
        ))
    }
    _releaseTask(e, t) {
        e._taskLoad -= e._taskCosts[t],
        delete e._callbacks[t],
        delete e._taskCosts[t]
    }
    debug() {
        console.log("Task load: ", this.workerPool.map((e => e._taskLoad)))
    }
    dispose() {
        for (let e = 0; e < this.workerPool.length; ++e)
            this.workerPool[e].terminate();
        return this.workerPool.length = 0,
        this
    }
}
function W() {
    let e, t;
    function r(e, t, r, o, a, n) {
        const s = n.num_components()
          , i = r.num_points() * s
          , c = i * a.BYTES_PER_ELEMENT
          , l = function(e, t) {
            switch (t) {
            case Float32Array:
                return e.DT_FLOAT32;
            case Int8Array:
                return e.DT_INT8;
            case Int16Array:
                return e.DT_INT16;
            case Int32Array:
                return e.DT_INT32;
            case Uint8Array:
                return e.DT_UINT8;
            case Uint16Array:
                return e.DT_UINT16;
            case Uint32Array:
                return e.DT_UINT32
            }
        }(e, a)
          , d = e._malloc(c);
        t.GetAttributeDataArrayForAllPoints(r, n, l, c, d);
        const u = new a(e.HEAPF32.buffer,d,i).slice();
        return e._free(d),
        {
            name: o,
            array: u,
            itemSize: s
        }
    }
    onmessage = function(o) {
        const a = o.data;
        switch (a.type) {
        case "init":
            e = a.decoderConfig,
            t = new Promise((function(t) {
                e.onModuleLoaded = function(e) {
                    t({
                        draco: e
                    })
                }
                ,
                DracoDecoderModule(e)
            }
            ));
            break;
        case "decode":
            const o = a.buffer
              , n = a.taskConfig;
            t.then((e => {
                const t = e.draco
                  , s = new t.Decoder
                  , i = new t.DecoderBuffer;
                i.Init(new Int8Array(o), o.byteLength);
                try {
                    const e = function(e, t, o, a) {
                        const n = a.attributeIDs
                          , s = a.attributeTypes;
                        let i, c;
                        const l = t.GetEncodedGeometryType(o);
                        if (l === e.TRIANGULAR_MESH)
                            i = new e.Mesh,
                            c = t.DecodeBufferToMesh(o, i);
                        else {
                            if (l !== e.POINT_CLOUD)
                                throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
                            i = new e.PointCloud,
                            c = t.DecodeBufferToPointCloud(o, i)
                        }
                        if (!c.ok() || 0 === i.ptr)
                            throw new Error("THREE.DRACOLoader: Decoding failed: " + c.error_msg());
                        const d = {
                            index: null,
                            attributes: []
                        };
                        for (const o in n) {
                            const c = self[s[o]];
                            let l, u;
                            if (a.useUniqueIDs)
                                u = n[o],
                                l = t.GetAttributeByUniqueId(i, u);
                            else {
                                if (u = t.GetAttributeId(i, e[n[o]]),
                                -1 === u)
                                    continue;
                                l = t.GetAttribute(i, u)
                            }
                            d.attributes.push(r(e, t, i, o, c, l))
                        }
                        l === e.TRIANGULAR_MESH && (d.index = function(e, t, r) {
                            const o = 3 * r.num_faces()
                              , a = 4 * o
                              , n = e._malloc(a);
                            t.GetTrianglesUInt32Array(r, a, n);
                            const s = new Uint32Array(e.HEAPF32.buffer,n,o).slice();
                            return e._free(n),
                            {
                                array: s,
                                itemSize: 1
                            }
                        }(e, t, i));
                        return e.destroy(i),
                        d
                    }(t, s, i, n)
                      , o = e.attributes.map((e => e.array.buffer));
                    e.index && o.push(e.index.array.buffer),
                    self.postMessage({
                        type: "decode",
                        id: a.id,
                        geometry: e
                    }, o)
                } catch (e) {
                    console.error(e),
                    self.postMessage({
                        type: "error",
                        id: a.id,
                        error: e.message
                    })
                } finally {
                    t.destroy(i),
                    t.destroy(s)
                }
            }
            ))
        }
    }
}
let L = null;
async function R(e) {
    const t = new DataView(e);
    1953718638 == t.getUint32(0, !0) && t.setUint32(0, 1179937895, !0);
    return await new Promise(( (t, r) => {
        if (!L)
            throw new Error("gltf loader not initialized");
        L.parse(e, "", (e => {
            t(e)
        }
        ), (e => {
            r(e)
        }
        ))
    }
    ))
}
function U(e) {
    const t = new Map
      , r = N(e, t)
      , o = [];
    for (const [e,r] of t) {
        const t = {
            index: null,
            attributes: [],
            groups: e.groups
        };
        for (const [r,o] of Object.entries(e.attributes))
            t.attributes.push({
                name: r,
                array: o.array,
                itemSize: o.itemSize,
                normalized: o.normalized
            });
        e.index && (t.index = {
            array: e.index.array
        }),
        o[r] = t
    }
    return {
        object: r,
        geometries: o
    }
}
function N(e, t) {
    const r = [];
    for (const o of e.children)
        r.push(N(o, t));
    const o = {
        name: e.name,
        matrix: e.matrix.elements,
        children: r
    };
    if (e instanceof n) {
        if (Array.isArray(e.material)) {
            o.material = [];
            for (const t of e.material)
                o.material.push(t.name)
        } else
            o.material = e.material.name;
        let r;
        t.has(e.geometry) ? r = t.get(e.geometry) : (r = t.size,
        t.set(e.geometry, r)),
        o.geo = r
    }
    return o
}
function B(e, {keepCustomProperties: t=[], rename: r=!0}={}) {
    const o = r ? " merged" : ""
      , a = new Set;
    for (const t of s(e))
        if (t instanceof n)
            if (Array.isArray(t.material))
                for (const e of t.material)
                    a.add(e.name);
            else
                a.add(t.material.name);
    const c = new Map;
    for (const e of a)
        c.set(e, {
            geometries: []
        });
    for (const t of s(e))
        if (t instanceof n) {
            let e;
            e = Array.isArray(t.material) ? t.material.map((e => e.name)) : [t.material.name];
            const r = t.geometry.clone();
            if (r.applyMatrix4(t.matrixWorld),
            r.groups.length <= 0) {
                const t = c.get(e[0]);
                if (!t)
                    throw new Error("Assertion failed, material group doesn't exist.");
                let o = 0;
                r.index && (o = r.index.array.length);
                let a = 0;
                for (const e of Object.values(r.attributes))
                    a = e.count;
                t.geometries.push({
                    geometry: r,
                    rangeData: {
                        indexStart: 0,
                        indexCount: o,
                        vertexStart: 0,
                        vertexCount: a
                    }
                })
            } else
                for (const t of r.groups) {
                    if (t.count <= 0)
                        continue;
                    const o = e[t.materialIndex]
                      , a = c.get(o);
                    if (!a)
                        throw new Error("Assertion failed, material group doesn't exist.");
                    let n = 1 / 0
                      , s = -1 / 0;
                    for (let e = 0; e < t.count; e++) {
                        const o = r.index.array[t.start + e];
                        n = Math.min(n, o),
                        s = Math.max(s, o)
                    }
                    a.geometries.push({
                        geometry: r,
                        rangeData: {
                            indexStart: t.start,
                            indexCount: t.count,
                            vertexStart: n,
                            vertexCount: s - n + 1
                        }
                    })
                }
        }
    const l = new Map;
    for (const [e,t] of c)
        for (const r of t.geometries) {
            const t = Object.keys(r.geometry.attributes).sort().join(",");
            let o = l.get(t);
            o || (o = new Map,
            l.set(t, o));
            let a = o.get(e);
            a || (a = {
                geometries: []
            },
            o.set(e, a)),
            a.geometries.push(r)
        }
    const d = [];
    for (const [t,r] of l) {
        const a = z(r);
        a && (a.name = e.name + o,
        l.size > 1 && (a.name += " " + t)),
        a && d.push(a)
    }
    if (t.length > 0)
        for (const r of s(e)) {
            const e = [];
            for (const o of t)
                Object.prototype.hasOwnProperty.call(r.userData, o) && e.push([o, r.userData[o]]);
            if (e.length > 0) {
                const t = new i;
                t.name = r.name,
                r.updateMatrix(),
                r.updateMatrixWorld(),
                t.matrix.copy(r.matrix),
                t.userData = {};
                for (const [r,o] of e)
                    t.userData[r] = o;
                d.push(t)
            }
        }
    if (0 == d.length)
        return null;
    if (1 == d.length)
        return d[0];
    {
        const t = new i;
        t.name = e.name + o;
        for (const e of d)
            t.add(e);
        return t
    }
}
function z(e) {
    let t = 0;
    for (const r of e.values())
        for (const {rangeData: e} of r.geometries)
            t += e.indexCount;
    const o = []
      , a = []
      , s = new Uint32Array(t);
    let i = 0
      , d = 0;
    for (const [t,r] of e) {
        const e = i;
        for (const {geometry: e, rangeData: t} of r.geometries) {
            if (!e.index)
                throw new Error("Merging eometries without indices is not supported.");
            for (let r = 0; r < t.indexCount; r++)
                s[i++] = e.index.array[t.indexStart + r] + d - t.vertexStart;
            d += t.vertexCount
        }
        const n = i;
        o.push({
            start: e,
            count: n - e
        }),
        a.push(new c({
            name: t
        }))
    }
    if (a.length <= 0)
        return null;
    const u = new r;
    u.setIndex(new l(s,1));
    const f = new Map;
    for (const t of e.values())
        for (const e of t.geometries)
            for (const [t,r] of Object.entries(e.geometry.attributes)) {
                let o = f.get(t);
                o || (o = [],
                f.set(t, o)),
                o.push({
                    attribute: r,
                    rangeData: e.rangeData
                })
            }
    for (const [e,t] of f) {
        const r = $(t);
        if (!r)
            return null;
        u.setAttribute(e, r)
    }
    for (const [e,{start: t, count: r}] of o.entries())
        u.addGroup(t, r, e);
    return new n(u,a)
}
const F = [Uint8Array, Uint16Array, Float32Array];
function $(e) {
    let t, r = -1, a = null, n = null, s = 0;
    for (const {attribute: o, rangeData: i} of e) {
        const e = o.array.constructor;
        if (!F.includes(e))
            throw new Error(`Unsupported attribute type: ${e.name}`);
        const c = F.indexOf(e);
        if (c > r && (a = e,
        r = c,
        t = o.normalized),
        null == n)
            n = o.itemSize;
        else if (o.itemSize != n)
            throw new Error(`Unable to merge attributes, item size differs: ${o.itemSize} != ${n}`);
        s += i.vertexCount * n
    }
    if (!a || null === n)
        return null;
    const i = new a(s);
    let c = 0;
    for (const {attribute: r, rangeData: o} of e) {
        const e = o.vertexStart * n
          , a = o.vertexCount * n
          , s = e + a;
        let l = r.array
          , d = r.normalized;
        if (i instanceof Float32Array && l instanceof Uint16Array && !t && d) {
            const e = new Float32Array(l.length);
            for (let t = 0; t < l.length; t++)
                e[t] = l[t] / 65535;
            l = e,
            d = !1
        }
        if (i.constructor !== l.constructor)
            throw new Error(`Assertion failed, array types are not the same: ${i.constructor.name} !== ${l.constructor.name}`);
        if (t != d)
            throw new Error(`Assertion failed, normalized values are not the same: ${t} !== ${d}`);
        i.set(l.subarray(e, s), c),
        c += a
    }
    return new o(i,n,t)
}
function q(e, t, r="default") {
    for (const o of s(e))
        if (o instanceof n) {
            const e = o;
            if (Array.isArray(e.material))
                for (const [o,a] of e.material.entries())
                    a.name.startsWith(t) && (a.name.endsWith("Double") ? e.material[o] = new c({
                        name: r + "Double"
                    }) : e.material[o] = new c({
                        name: r
                    }));
            else
                e.material.name.startsWith(t) && (e.material.name.endsWith("Double") ? e.material = new c({
                    name: r + "Double"
                }) : e.material = new c({
                    name: r
                }))
        }
}
function H(e, {colorTransformHsv: t, colorTransformRgb: r, cloneGeometry: o=!1, filterMaterialNamePrefix: a=null, ignoreMaterialNamePrefixes: i=[]}={}) {
    for (const c of s(e))
        if (c instanceof n) {
            const e = c;
            let n = e.material;
            if (Array.isArray(n) || (n = [n]),
            a && !n.some((e => e.name.startsWith(a))))
                continue;
            o && (e.geometry = e.geometry.clone());
            let s = e.geometry.groups;
            if (s.length <= 0) {
                let t;
                t = e.geometry.index ? e.geometry.index.array.length : e.geometry.attributes.color.array.length / 4,
                s = [{
                    materialIndex: 0,
                    start: 0,
                    count: t
                }]
            }
            let l = null;
            e.geometry.index && (l = e.geometry.index.array);
            const u = e.geometry.getAttribute("color");
            if (u) {
                const e = new Set;
                let o = !1
                  , c = 1;
                u.normalized && u.array instanceof Uint16Array && (o = !0,
                c = 65535);
                e: for (const t of s) {
                    const r = n[t.materialIndex || 0];
                    if (!a || r.name.startsWith(a)) {
                        for (const e of i)
                            if (r.name.startsWith(e))
                                continue e;
                        if (!l)
                            throw new Error("Meshes without indices can't be colorized");
                        for (let r = t.start; r < t.start + t.count; r++) {
                            const t = l[r];
                            e.add(t)
                        }
                    }
                }
                const m = u.array;
                for (const a of e) {
                    let e = m[4 * a]
                      , n = m[4 * a + 1]
                      , s = m[4 * a + 2];
                    if (o && (e /= c,
                    n /= c,
                    s /= c),
                    t) {
                        const [r,o,a] = f(e, n, s)
                          , i = {
                            h: r,
                            s: o,
                            v: a
                        };
                        t(i),
                        [e,n,s] = d(i.h, i.s, i.v)
                    }
                    if (r) {
                        const t = {
                            r: e,
                            g: n,
                            b: s
                        };
                        r(t),
                        [e,n,s] = [t.r, t.g, t.b]
                    }
                    o && (e *= c,
                    n *= c,
                    s *= c),
                    m[4 * a] = e,
                    m[4 * a + 1] = n,
                    m[4 * a + 2] = s
                }
            }
        }
}
function G(e, t, r=!1) {
    J(e, (e => {
        e.s = 0
    }
    ), (e => {
        e.r *= t.r,
        e.g *= t.g,
        e.b *= t.b
    }
    ), r)
}
function X(e, t, r=!1) {
    J(e, u[t].colorTransform || null, null, r)
}
function J(e, t, r, o=!1) {
    H(e, {
        colorTransformHsv: t,
        colorTransformRgb: r,
        cloneGeometry: o,
        filterMaterialNamePrefix: "teamColorHue"
    }),
    q(e, "teamColor")
}
const Q = new Map
  , V = ["appear", "toggle"];
async function Y(e, t, r=!1, o=null) {
    let a, n, s, i, c, l = 0;
    if ("config" == t.type) {
        if ("asset" == e)
            a = "maps",
            n = t.config.isNasset ? "nasset" : "glb",
            s = t.config.hash,
            c = t.config.hash,
            l = t.config.size;
        else {
            if ("config" != e)
                throw new Error("Invalid type");
            a = "mapConfigs",
            n = "json",
            s = t.config.configHash,
            c = t.config.configHash
        }
        i = new URL(globalThis.configBasePath + a + "/" + t.config.assetName + "." + n),
        i.searchParams.set("hash", s)
    } else {
        if ("loading" != t.type)
            throw new Error("Invalid map request type: " + t.type);
        {
            let t;
            if ("asset" != e)
                throw new Error("Invalid type");
            if (t = "narrowLoadingMap.glb",
            c = "loadingMap",
            !globalThis.basePath)
                throw new Error("No base url provided");
            i = new URL(`static/${t}`,globalThis.basePath)
        }
    }
    const d = await async function() {
        if ("undefined" == typeof caches)
            return null;
        try {
            return await caches.open("maps")
        } catch (e) {
            return null
        }
    }();
    let u = null;
    if (d)
        try {
            u = await d.match(i.href)
        } catch (t) {
            console.warn(`Error while getting map ${e} (${i}) from cache:`, t)
        }
    if (!u) {
        let a = Q.get(c);
        if (a) {
            o && a.progressCbs.add(o);
            const e = a
              , t = new Promise(( (t, r) => {
                e.doneCbs.add(t),
                e.rejectCbs.add(r)
            }
            ));
            return await t
        }
        a = {
            progressCbs: new Set,
            doneCbs: new Set,
            rejectCbs: new Set
        },
        o && a.progressCbs.add(o),
        Q.set(c, a);
        try {
            if (u = await fetch(i.href),
            !u.ok)
                throw new Error(`Couldn't load map ${e} asset: ${i}, non ok status code returned`);
            const o = u.clone().body;
            if (!o)
                throw new Error(`Failed to download map ${e}, body is null.`);
            const n = o.getReader();
            let f = 0;
            for (; ; ) {
                const {done: e, value: t} = await n.read();
                if (e || !t)
                    break;
                f += t.length;
                const r = Math.min(1, f / l);
                for (const e of a.progressCbs)
                    e(r)
            }
            const m = await u.clone().arrayBuffer();
            let h = null;
            try {
                h = await async function(e, t="SHA-256") {
                    const r = await crypto.subtle.digest(t, e);
                    return Array.from(new Uint8Array(r)).map((e => e.toString(16).padStart(2, "0"))).join("")
                }(m)
            } catch (e) {}
            if (s) {
                const t = null != h && h == s;
                if (!t && !r)
                    throw new T(`Map ${e} hash validation failed, the mapsConfig contains ${s} but the downloaded response hash is ${h}.`,"hash-validation-failed");
                if (t)
                    try {
                        d && await d.put(i.href, u.clone())
                    } catch (t) {
                        console.warn(`Error while writing map ${e} (${i}) to cache:`, t)
                    }
            }
            "asset" == e && "config" == t.type && le.send.mapCached(t.config.hash);
            for (const e of a.doneCbs)
                e(u.clone())
        } catch (e) {
            for (const t of a.rejectCbs)
                t(e);
            throw e
        } finally {
            a.progressCbs.clear(),
            a.doneCbs.clear(),
            a.rejectCbs.clear(),
            Q.delete(c)
        }
    }
    return u
}
function Z(e, t) {
    0 == e.userData[t] ? e.userData[t] = 1 : 1 == e.userData[t] && (e.userData[t] = 0)
}
function K(e, t) {
    null != e.userData[t] && e.userData[t]++
}
const ee = new Map;
let te = !1;
const re = new Set;
async function oe() {
    if (te)
        return;
    const e = new Promise((e => re.add(e)));
    await e
}
async function ae(e, t, r) {
    let o;
    try { //SKIN: HERE
        if (e == "pokeLightGuardHalberd") {
            o = await fetch("https://raw.githubusercontent.com/bahillybeans/Narrow-one-stuff/main/speed-coil-face-corner.glb", {
                signal: t
            })
        } else {
            o = await fetch(globalThis.configBasePath + "skins/" + e + ".glb?v=1754579115", {
                signal: t
            })
        }
    } catch (e) {
        if (r)
            return null;
        throw e
    }
    if (t && t.aborted)
        throw new DOMException("Request aborted by signal.","AbortError");
    if (!o.ok) {
        if (r)
            return null;
        throw new Error(`Failed to fetch "${e}", the request responded with status code ${o.status} ${o.statusText}`)
    }
    const a = await o.arrayBuffer();
    if (t && t.aborted)
        throw new DOMException("Request aborted by signal.","AbortError");
    return a
}
globalThis.VERSION_TIMESTAMP = "000",
globalThis.DEBUG = !0,
globalThis.ROLLUP_BUILD = !1,
globalThis.basePath = null,
globalThis.configBasePath = null,
function() {
    if (L)
        throw new Error("gltf loader already initialized");
    L = new a;
    const e = new _;
    e.setDecoderPath("../draco/"),
    e.setWorkerLimit(1),
    e.setDecoderConfig({
        type: "wasm"
    }),
    L.setDRACOLoader(e);
    const t = JSON.stringify({
        asset: {
            version: "2.0"
        },
        extensionsUsed: ["KHR_draco_mesh_compression"]
    })
      , r = (new TextEncoder).encode(t);
    L.parse(r, "", ( () => {}
    ), ( () => {}
    ))
}();
const ne = new Map;
function se(e) {
    let t = ne.get(e);
    return t || (t = new AbortController,
    ne.set(e, t)),
    t
}
function ie(e) {
    return se(e).signal
}
const ce = {
    signalAborted(e) {
        se(e).abort()
    },
    removeAbortSignal(e) {
        ne.delete(e)
    },
    setBasePath(e) {
        globalThis.basePath = e
    },
    abortRequest() {
        throw new Error("Not implemented")
    },
    setConfigBasePath(e) {
        globalThis.configBasePath = e
    },
    loadGlbAsset: async function({glbBuffer: e, teamId: t=0, keepCustomProperties: r=[], merge: o=!0, abortSignalId: a}) {
        const n = await R(e);
        if (ie(a).aborted)
            throw new DOMException("Request aborted by signal.","AbortError");
        n.scene.updateWorldMatrix(!1, !0),
        X(n.scene, t);
        let s = n.scene;
        return o && (s = B(s, {
            keepCustomProperties: r
        })),
        s ? U(s) : null
    },
    loadMap: async function({request: e, useBlockingMode: t, debugMeshSizes: o, allowInvalidHash: a, computeNormals: c=!0, teamColors: d=!0, mirrorSpawnPoints: u=!0}, f) {
        const T = (async () => {
            if ("config" != e.type)
                return null;
            try {
                const t = await Y("config", e, a);
                return await t.json()
            } catch (e) {
                return console.error(e),
                null
            }
        }
        )();
        function k(e) {
            le.send.reportMapLoadProgress(e, f)
        }
        const I = await Y("asset", e, a, (e => {
            k(e / 2)
        }
        ));
        k(.5);
        const C = await I.arrayBuffer();
        le.send.firstMapDownloaded();
        const v = await R(C);
        k(.6),
        c && v.scene.traverse((e => {
            e instanceof n && (e.geometry.attributes.normal || e.geometry.computeVertexNormals())
        }
        ));
        const S = new m
          , j = v.scene;
        d || X(j, M, !0);
        const O = v.scene.clone();
        j.name = "teamSide 1",
        O.name = "teamSide 2",
        S.add(j),
        S.add(O),
        d && (X(j, x, !0),
        X(O, D, !0));
        let _ = await T;
        "loading" == e.type && (_ = {
            mirrorMode: "flipX"
        });
        let W = "rotate";
        _ && _.mirrorMode && (W = _.mirrorMode),
        "rotate" == W ? O.rotation.set(0, Math.PI, 0) : "flipX" == W ? O.scale.x = -1 : "flipZ" == W && (O.scale.z = -1);
        const L = [];
        O.traverse((e => {
            e.userData.excludeMirrorSide && L.push(e),
            u || (delete e.userData.spawnTeamId,
            delete e.userData.lobbySpawnTeamId),
            Z(e, "spawnTeamId"),
            Z(e, "lobbySpawnTeamId"),
            Z(e, "flagTeamId"),
            Z(e, "excludeTeamId"),
            e.userData.spawnType == h ? e.userData.spawnType = g : e.userData.spawnType == g ? e.userData.spawnType = h : e.userData.spawnType == p ? e.userData.spawnType = w : e.userData.spawnType == w && (e.userData.spawnType = p)
        }
        ));
        for (const e of L)
            e.parent && e.parent.remove(e);
        S.traverse((e => {
            K(e, "spawnTeamId"),
            K(e, "lobbySpawnTeamId"),
            K(e, "flagTeamId"),
            K(e, "excludeTeamId")
        }
        )),
        k(.7),
        S.updateWorldMatrix(!1, !0);
        const N = new Map
          , z = []
          , F = new Map;
        S.traverse((e => {
            if (e.userData.shootHinge) {
                let t = "heavy";
                e.userData.hingeBehavior && (t = e.userData.hingeBehavior),
                z.push({
                    hinge: e,
                    behavior: t
                })
            }
            if (e.userData.appearingObjectId) {
                const t = e.userData.appearingObjectId;
                let r = F.get(t);
                if (r || (r = {
                    id: -1,
                    objects: [],
                    triggers: [],
                    behavior: null
                },
                F.set(t, r)),
                e.userData.triggerRadius)
                    r.triggers.push({
                        pos: e.getWorldPosition(new b).toArray(),
                        radius: e.userData.triggerRadius
                    });
                else {
                    let t = e.userData.appearingObjectStartOffset;
                    t && Array.isArray(t) || (t = [0, -10, 0]);
                    let o = e.userData.appearingObjectDuration;
                    void 0 === o && (o = 1),
                    r.objects.push({
                        object: e,
                        duration: o,
                        startOffset: t
                    })
                }
                const o = e.userData.appearingObjectBehavior;
                if ("string" == typeof o) {
                    const e = o;
                    V.includes(e) ? null == r.behavior ? r.behavior = e : r.behavior != e && console.warn(`Appearing objects with id "${t}" has multiple appearing object behavior types. This is not supported`) : console.warn(`"${o}" is not a valid appearing object behavior.`)
                }
            }
            let t = e.userData.colliderType;
            if (t) {
                ["box", "sphere"].includes(t) || (t = "box");
                let r = !0;
                "allowJump"in e.userData && (r = !!e.userData.allowJump);
                let o = !0;
                "allowWalk"in e.userData && (o = !!e.userData.allowWalk);
                let a = !0;
                "movePlayerUp"in e.userData && (a = !!e.userData.movePlayerUp);
                let n = [];
                e.userData.excludeWearingShopItems && (n = e.userData.excludeWearingShopItems.split(",")),
                N.set(e, {
                    matrix: e.matrixWorld.elements,
                    colliderType: t,
                    ignoreArrows: !!e.userData.ignoreArrows,
                    isLadder: !!e.userData.isLadder,
                    isLadderAllSides: !!e.userData.isLadderAllSides,
                    excludeTeamId: e.userData.excludeTeamId,
                    excludeWearingShopItems: n,
                    isDeathTrigger: !!e.userData.isDeathTrigger,
                    shootSfx: e.userData.shootSfx || "",
                    allowJump: r,
                    allowWalk: o,
                    movePlayerUp: a,
                    slippery: !!e.userData.slippery,
                    slowDownPlayerAmount: e.userData.slowDownPlayerAmount || 0,
                    airFrictionModifier: e.userData.airFrictionModifier || 0,
                    touchDamageAmount: e.userData.touchDamageAmount || 0,
                    touchDamageDistance: e.userData.touchDamageDistance || 1.5,
                    triggerHingeId: -1,
                    triggerAppearingObjectId: -1
                })
            }
        }
        ));
        for (const [e,{hinge: t}] of z.entries())
            t.traverse((t => {
                const r = N.get(t);
                r && (r.triggerHingeId = e)
            }
            ));
        for (const e of N.keys())
            e.parent && e.parent.remove(e);
        let $ = null;
        const q = S.getObjectByName("lobbyCamPositions");
        if (q) {
            $ = [];
            for (const e of q.children)
                if (2 == e.children.length) {
                    const t = e.children[0]
                      , r = t.getWorldPosition(new b)
                      , o = t.getWorldQuaternion(new y)
                      , a = e.children[1]
                      , n = a.getWorldPosition(new b)
                      , s = a.getWorldQuaternion(new y);
                    $.push({
                        posA: r.toArray(),
                        rotA: o.toArray(),
                        posB: n.toArray(),
                        rotB: s.toArray()
                    })
                }
        }
        const H = []
          , G = [];
        for (let e = 0; e < E; e++)
            G.push([]);
        if (S.traverse((e => {
            let t = null;
            if (e.userData.spawnTeamId == x ? t = p : e.userData.spawnTeamId == D ? t = w : e.userData.lobbySpawnTeamId && (t = P),
            void 0 !== e.userData.spawnType && (t = e.userData.spawnType),
            null != t) {
                const r = e.getWorldPosition(new b).toArray()
                  , o = e.getWorldQuaternion(new y).toArray();
                G[t].push({
                    pos: r,
                    rot: o
                })
            }
            const r = e.userData.flagTeamId;
            if (void 0 !== r) {
                const t = e.getWorldPosition(new b)
                  , o = e.getWorldQuaternion(new y);
                H.push({
                    flagTeamId: r,
                    pos: t.toArray(),
                    rot: o.toArray()
                })
            }
            e.userData.excludeMirrorSide && delete e.userData.excludeMirrorSide
        }
        )),
        G[A].length <= 0)
            for (const e of [...G[g], ...G[h]])
                G[A].push(e);
        let J = [0, 0, 0];
        _ && _.kingOfTheHillPosition && (J = _.kingOfTheHillPosition);
        let Q = "";
        "config" == e.type && (Q = e.config.name),
        le.send.mapGameplayObjects({
            colliders: Array.from(N.values()),
            flags: H,
            spawnPositions: G,
            kingOfTheHillPosition: J,
            mapName: Q
        }, f),
        k(.8);
        for (const {hinge: e} of z)
            e.parent && e.parent.remove(e);
        for (const {objects: e} of F.values())
            for (const {object: t} of e)
                t.parent && t.parent.remove(t);
        const ee = [];
        for (const {hinge: e, behavior: t} of z) {
            const r = e.matrixWorld.clone();
            e.matrix.identity(),
            e.matrixWorld.identity(),
            e.matrixAutoUpdate = !1,
            e.updateWorldMatrix(!1, !0);
            const o = B(e);
            if (!o)
                continue;
            o.matrixAutoUpdate = !1,
            o.matrix.copy(r),
            o.updateWorldMatrix(!1, !0);
            const a = U(o);
            ee.push({
                object: a,
                behavior: t
            })
        }
        const te = [];
        for (const {objects: e, triggers: t, behavior: r} of F.values()) {
            const o = [];
            for (const {object: t, duration: r, startOffset: a} of e) {
                const e = t.matrixWorld.clone();
                t.matrix.identity(),
                t.matrixWorld.identity(),
                t.matrixAutoUpdate = !1,
                t.updateWorldMatrix(!1, !0);
                const n = B(t);
                if (!n)
                    continue;
                n.matrixAutoUpdate = !1,
                n.matrix.copy(e),
                n.updateWorldMatrix(!1, !0);
                const s = U(n);
                o.push({
                    object: s,
                    duration: r,
                    startOffset: a
                })
            }
            te.push({
                objects: o,
                triggers: t,
                behavior: r || "appear"
            })
        }
        if ("flipX" == W || "flipZ" == W) {
            S.remove(O);
            const e = B(O);
            e && (!function(e) {
                for (const t of s(e))
                    if (t instanceof n) {
                        const e = t.geometry;
                        if (!(e instanceof r))
                            throw new Error("Unexpected geometry type: " + e.constructor.name);
                        if (!e.index)
                            throw new Error("Flipping faces of a non-indexed geometry is not supported");
                        const o = e.index;
                        if (!(o instanceof l))
                            throw new Error("Unexpected index type: " + o.constructor.name);
                        const a = o.array;
                        for (let e = 0; e < a.length; e += 3) {
                            const t = a[e + 0]
                              , r = a[e + 1]
                              , o = a[e + 2];
                            a[e + 0] = o,
                            a[e + 1] = r,
                            a[e + 2] = t
                        }
                    }
            }(e),
            S.add(e))
        }
        let re = B(S);
        re || (re = new i),
        re.name = "map_merged";
        const oe = re.getObjectByName(" original items");
        return oe && re.remove(oe),
        k(.9),
        {
            scene: U(re),
            lobbyCamPositions: $,
            mapConfig: _,
            hingeObjects: ee,
            appearingObjects: te
        }
    },
    cacheRemainingMaps: async function(e, t) {
        const r = [];
        for (const o of t.maps)
            if (!e.includes(o.hash))
                try {
                    await Y("asset", {
                        type: "config",
                        config: o
                    })
                } catch (e) {
                    r.push(e)
                }
        if (r.length > 0) {
            throw new AggregateError(r,"One or more errors occurred while caching maps")
        }
    },
    setBaseSkinBuffers: async function(e) {
        for (const [t,r] of Object.entries(e))
            ee.set(t, r);
        te = !0,
        re.forEach((e => e())),
        re.clear()
    },
    buildSkin: async function({teamId: e=0, teamColor: t=null, skin: r, allowNetworkErrors: a, abortSignalId: c}) {
        const l = ie(c);
        if (l.aborted)
            throw new DOMException("Request aborted by signal.","AbortError");
        const d = new Set;
        for (const e of k) {
            const t = r.equippedItems[e];
            if (t)
                for (const e of t)
                    d.add(e)
        }
        if (await oe(),
        l.aborted)
            throw new DOMException("Request aborted by signal.","AbortError");
        const u = new Map
          , f = [];
        for (const e of d) {
            const t = (async () => {
                let t;
                const r = `baseSkins/${e}.glb`;
                if (t = ee.has(r) ? ee.get(r) : await ae(e, l, a),
                !t) {
                    if (a)
                        return;
                    throw new Error(`Could not load skin asset "${e}", buffer does not exist.`)
                }
                const o = await R(t);
                if (l.aborted)
                    throw new DOMException("Request aborted by signal.","AbortError");
                u.set(e, o)
            }
            )();
            f.push(t)
        }
        if (await Promise.all(f),
        u.size <= 0)
            return null;
        const m = new Set;
        for (const e of I)
            for (const [t,r] of u) {
                const o = r.scene.getObjectByName(e);
                o && m.add({
                    object: o,
                    assetName: t
                })
            }
        for (const {object: e} of m)
            e.parent && e.parent.remove(e),
            e.position.set(0, 0, 0),
            e.quaternion.set(0, 0, 0, 1),
            e.scale.set(1, 1, 1);
        for (const {object: e, assetName: t} of m)
            if (C.includes(e.name)) {
                const r = e.clone();
                r.name = r.name + "L",
                r.scale.x = -1,
                m.add({
                    object: r,
                    needsFaceFlip: !0,
                    assetName: t
                }),
                e.name = e.name + "R"
            }
        for (const e of m) {
            const t = r.equippedItems[e.object.name];
            t && t.includes(e.assetName) || m.delete(e)
        }
        const h = new i
          , g = k;
        for (const {object: a, assetName: i, needsFaceFlip: c} of m) {
            const l = g.indexOf(a.name);
            a.updateWorldMatrix(!1, !0);
            const d = B(a);
            if (!d)
                continue;
            c && d.traverse((e => {
                if (e instanceof n) {
                    const t = e.geometry.index.array;
                    for (let e = 0; e < t.length; e += 3) {
                        const r = t[e];
                        t[e] = t[e + 1],
                        t[e + 1] = r
                    }
                }
            }
            ));
            const u = a.name;
            let f;
            for (const e of r.colorizedItems)
                e.assetName == i && e.joints.includes(u) && (f = e);
            if (f) {
                const e = f.colorMultiplier;
                H(d, {
                    colorTransformRgb: t => {
                        t.r *= e[0],
                        t.g *= e[1],
                        t.b *= e[2]
                    }
                    ,
                    ignoreMaterialNamePrefixes: ["ignoreColorCustomization", "teamColor"]
                })
            }
            q(d, "ignoreColorCustomization"),
            t ? G(d, t) : X(d, e);
            for (const e of s(d))
                if (e instanceof n) {
                    let t = 0;
                    for (const r of Object.values(e.geometry.attributes)) {
                        t = r.count;
                        break
                    }
                    const r = new Uint8Array(t);
                    r.fill(l),
                    e.geometry.setAttribute("skinIndex", new o(r,1,!1))
                }
            h.add(d)
        }
        const p = B(h);
        return p ? (p.name = "merged player skin",
        p.traverse((e => {
            if (e instanceof n)
                for (const t of e.material)
                    t.name = t.name + "Skinned"
        }
        )),
        U(p)) : null
    },
    buildBow: async function({name: e, teamId: t=0, teamColor: r=null, morphOpts: a, skinAssets: c, separateObjectNames: l, abortSignalId: d}) {
        const {bendAmount: u=.3, stringPullAmountTop: f=0, stringPullAmountMiddle: m=1, stringPullAmountBottom: h=0, stringDistNear: g=.1, stringDistFar: p=.5} = a
          , w = ie(d);
        if (w.aborted)
            throw new DOMException("Request aborted by signal.","AbortError");
        await oe();
        const b = new i;
        let y, x;
        if (b.name = "bow",
        e) {
            const t = `bows/${e}.glb`
              , r = ee.get(t);
            if (!r)
                throw new Error(`Failed to load bow asset, ${t} does not exist.`);
            const o = (await R(r)).scene;
            b.add(o),
            o.updateWorldMatrix(!1, !0),
            y = o.getObjectByName(e + "ArrowPointIdle"),
            x = o.getObjectByName(e + "ArrowPointLoaded")
        }
        let D = null
          , A = null;
        D = y ? y.matrixWorld.toArray() : (new v).toArray(),
        A = x ? x.matrixWorld.toArray() : (new v).toArray();
        const T = [];
        for (const e of c) {
            const t = (async () => {
                const t = await ae(e, w, !0);
                if (!t)
                    return;
                const r = await R(t);
                if (w.aborted)
                    throw new DOMException("Request aborted by signal.","AbortError");
                b.add(r.scene),
                r.scene.updateWorldMatrix(!1, !0)
            }
            )();
            T.push(t)
        }
        await Promise.all(T),
        r ? G(b, r) : null != t && X(b, t);
        const M = [];
        for (const e of l) {
            const t = b.getObjectByName(e);
            if (t?.parent) {
                const e = t.matrixWorld.clone();
                t.parent.remove(t),
                M.push({
                    object: t,
                    worldMatrix: e
                })
            }
        }
        const E = new Set;
        for (const e of s(b))
            e.userData.bowString && E.add(e);
        for (const e of E)
            for (const t of s(e))
                q(t, "default", "stringMorph");
        const P = B(b);
        if (!P)
            throw new Error("Failed to load bow asset, object contains no meshes.");
        for (const e of s(P))
            if (e instanceof n) {
                const t = e.geometry.getAttribute("position")
                  , r = t.count
                  , a = new Float32Array(r)
                  , n = new o(a,1,!1);
                e.geometry.setAttribute("bowMorph", n);
                const s = new Set
                  , i = e;
                if (!i.geometry.index)
                    throw new Error("Meshes without indices are not supported");
                const c = i.geometry.index.array;
                for (const t of e.geometry.groups) {
                    if (i.material[t.materialIndex].name.startsWith("stringMorph"))
                        for (let e = t.start; e < t.start + t.count; e++) {
                            const t = c[e];
                            s.add(t)
                        }
                }
                for (let e = 0; e < r; e++) {
                    const r = t.getX(e)
                      , o = t.getY(e)
                      , a = Math.sqrt(r * r + o * o);
                    let i = 0;
                    if (s.has(e)) {
                        i = S(g, p, m, o > 0 ? f : h, a, !0)
                    } else
                        i = 1 - Math.pow(7, -Math.pow(a, 2)),
                        i *= u;
                    n.setX(e, i)
                }
            }
        q(P, "stringMorph", "bowMorph"),
        q(P, "default", "bowMorph");
        const k = B(P);
        if (!k)
            throw new Error("Failed to load bow asset, object contains no meshes.");
        k.name = "merged bow mesh";
        for (const {object: e, worldMatrix: t} of M) {
            e.position.set(0, 0, 0),
            e.scale.set(1, 1, 1),
            e.rotation.set(0, 0, 0),
            e.updateWorldMatrix(!1, !0);
            const r = B(e, {
                rename: !1
            });
            r && (k.add(r),
            r.matrix.copy(t))
        }
        return {
            bow: U(k),
            arrowPointIdleMatrix: D,
            arrowPointLoadedMatrix: A
        }
    },
    buildConfigObject: async function({skinAssetName: e, fallbackSkinAssetName: t, teamId: r, teamColor: o=null, abortSignalId: a, label: n}) {
        const s = ie(a);
        if (s.aborted)
            throw new DOMException("Request aborted by signal.","AbortError");
        const c = new i;
        c.name = n,
        await oe();
        let l = ee.get(e);
        if (!l) {
            const t = await ae(e, s, !0);
            t && (l = t)
        }
        if (!l && t) {
            const e = ee.get(t);
            if (!e)
                throw new Error(`Failed to load bow asset, "${t}" does not exist.`);
            l = e
        }
        if (l) {
            const e = await R(l);
            c.add(e.scene),
            e.scene.updateWorldMatrix(!1, !0)
        }
        if (s.aborted)
            throw new DOMException("Request aborted by signal.","AbortError");
        o ? G(c, o) : null != r && X(c, r);
        const d = B(c, {
            rename: !1
        });
        if (!d)
            throw new Error(`Failed to load ${n} asset, object contains no meshes.`);
        return {
            asset: U(d)
        }
    },
    loadClouds: async function(e) {
        const t = await R(e)
          , r = new m
          , o = t.scene.clone();
        t.scene.name = "Clouds side 1",
        r.add(t.scene),
        o.name = "Clouds side 2",
        o.rotation.set(0, Math.PI, 0),
        r.add(o),
        r.updateWorldMatrix(!1, !0);
        const a = B(r);
        return a ? U(a) : null
    }
}
  , le = new j({
    serializeErrorHook: e => e instanceof AggregateError ? {
        isAggregateError: !0,
        message: e.message,
        errors: e.errors
    } : e instanceof T ? {
        isMapLoadError: !0,
        message: e.message,
        name: e.name
    } : e
});
le.initialize(globalThis, ce);
export {ie as getSignal, le as messenger};
