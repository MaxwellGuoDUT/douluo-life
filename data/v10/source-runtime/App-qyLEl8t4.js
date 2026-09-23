const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "./index-CfLpLgGT.js",
      "./author-revision-aliases-DpeVpXl5.js",
      "./index-C02WUcAm.js",
      "./index-CMqB6Wop.css",
      "./douluo1-pack-C6xEgEus.js",
      "./human-foundation-CduvzjjO.js",
      "./douluo2-pack-BsEUb2l9.js",
      "./web-o1RBLk9_.js",
      "./web-Cj-s7K4J.js",
      "./web-BFkHZPEz.js",
      "./web-BlS0Pskc.js",
    ]),
) => i.map((i) => d[i]);
import {
  d as de,
  r as T,
  o as Qt,
  n as Be,
  a as P,
  c as E,
  b as r,
  t as v,
  u as V,
  e as A,
  _ as jn,
  f as Go,
  g as O,
  h as dt,
  i as _,
  F as me,
  j as Ye,
  w as Ee,
  k as tt,
  l as zn,
  m as _e,
  p as Ze,
  v as Ho,
  q as Rt,
  s as jr,
  x as Se,
  y as zr,
  z as Ge,
  A as Un,
  B as Bs,
  E as kn,
  C as wt,
  S as $n,
  D as Ur,
  G as Bt,
  H as Pn,
  I as Lt,
  J as Vi,
  K as Wr,
  L as Cn,
} from "./index-C02WUcAm.js";
const qr = "" + new URL("../qq-guild-qrcode.jpg", import.meta.url).href,
  Gr = { class: "author-note-overlay", role: "presentation" },
  Hr = {
    class: "author-note-dialog",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "author-note-title",
    "aria-describedby": "author-note-content",
  },
  Yr = {
    id: "author-note-content",
    class: "author-note-content",
    tabindex: "0",
  },
  Kr = de({
    __name: "AuthorNoteDialog",
    emits: ["continue"],
    setup(t) {
      const e = T(null);
      return (
        Qt(async () => {
          var n;
          (await Be(), (n = e.value) == null || n.focus());
        }),
        (n, o) => (
          P(),
          E("div", Gr, [
            r("section", Hr, [
              o[4] ||
                (o[4] = r(
                  "header",
                  null,
                  [
                    r("span", { "aria-hidden": "true" }, "言"),
                    r("div", null, [
                      r("p", null, "斗灵命运转盘"),
                      r("h1", { id: "author-note-title" }, "作者有话说"),
                    ]),
                  ],
                  -1,
                )),
              r("div", Yr, [
                o[1] ||
                  (o[1] = r(
                    "p",
                    null,
                    " 斗灵命运转盘中的情节与内容均属虚构，请勿将转盘结果上升至原著角色，也请理性看待各类同人创作。 ",
                    -1,
                  )),
                r(
                  "p",
                  null,
                  v(
                    V(A)(
                      "观看相关视频后，请勿在无关作品或创作者的评论区跟风刷屏、引战或“骑脸”。例如，请不要在其他冰帝二创作者的视频下刷“野狗”，也不要在斗三二创视频下刷“古月娜水蛇”等与作品无关的内容。",
                    ),
                  ),
                  1,
                ),
                o[2] ||
                  (o[2] = r(
                    "p",
                    null,
                    " 未来还会持续更新更多视频与游戏内容。若出现上述不文明刷评、引战等行为，均属于个人行为，与相关转盘视频制作者及斗灵命运转盘制作组无关。感谢理解，也请共同维护友善、理性的交流环境。 ",
                    -1,
                  )),
                o[3] ||
                  (o[3] = r(
                    "img",
                    {
                      src: qr,
                      alt: "斗灵命运转盘交流频道二维码，频道号 pd68132170",
                    },
                    null,
                    -1,
                  )),
              ]),
              r("footer", null, [
                r(
                  "button",
                  {
                    ref_key: "confirmButton",
                    ref: e,
                    type: "button",
                    onClick: o[0] || (o[0] = (i) => n.$emit("continue")),
                  },
                  " 我知道了 ",
                  512,
                ),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  Jr = jn(Kr, [["__scopeId", "data-v-51e030eb"]]),
  Qr = { class: "disclaimer-screen" },
  Xr = { class: "disclaimer-card", "aria-labelledby": "disclaimer-title" },
  Zr = { class: "disclaimer-actions" },
  el = { key: 0, class: "read-hint", role: "status" },
  tl = { class: "disclaimer-button-wrap" },
  nl = ["disabled"],
  ol = de({
    __name: "DisclaimerScreen",
    emits: ["continue"],
    setup(t) {
      const e = T(null),
        n = T(!1),
        o = T("");
      function i() {
        const a = e.value;
        if (!a) return;
        const l = a.scrollHeight - a.scrollTop - a.clientHeight;
        ((n.value = l <= 2), n.value && (o.value = ""));
      }
      function s() {
        o.value = "请先滑动到最底端，阅读完免责声明后再进入游戏。";
      }
      return (
        Qt(async () => {
          (await Be(), i());
        }),
        (a, l) => (
          P(),
          E("main", Qr, [
            r("section", Xr, [
              l[2] ||
                (l[2] = r(
                  "header",
                  { class: "disclaimer-header" },
                  [
                    r(
                      "span",
                      { class: "disclaimer-mark", "aria-hidden": "true" },
                      "命",
                    ),
                    r("div", null, [
                      r("p", null, "斗灵命运转盘"),
                      r("h1", { id: "disclaimer-title" }, "免责声明"),
                    ]),
                  ],
                  -1,
                )),
              r(
                "div",
                {
                  ref_key: "contentElement",
                  ref: e,
                  class: "disclaimer-content",
                  tabindex: "0",
                  onScroll: i,
                },
                l[1] ||
                  (l[1] = [
                    Go(
                      '<section data-v-b9a787b7><h2 data-v-b9a787b7>1. 版权归属声明</h2><p data-v-b9a787b7> 本作品《斗灵命运转盘》（以下简称“本作”）为基于《斗罗大陆》小说及衍生作品世界观创作的<strong data-v-b9a787b7>非官方同人游戏</strong>。 </p><p data-v-b9a787b7> 开发组<strong data-v-b9a787b7>未取得</strong>《斗罗大陆》版权方（包括但不限于作者唐家三少、阅文集团等）的授权或许可，<strong data-v-b9a787b7>不主张</strong>对《斗罗大陆》相关角色名、设定、情节等原有内容享有任何著作权或商标权。 </p></section><section data-v-b9a787b7><h2 data-v-b9a787b7>2. 开发组权利范围</h2><p data-v-b9a787b7> 本作中由开发组独立创作的<strong data-v-b9a787b7>代码逻辑、界面设计、音效素材、原创文案及美术资源</strong>，其著作权归“斗灵命运转盘开发组”所有。 </p><p data-v-b9a787b7> 上述原创内容可受《著作权法》保护，但<strong data-v-b9a787b7>不包含</strong>任何《斗罗大陆》原著的受保护元素。 </p></section><section data-v-b9a787b7><h2 data-v-b9a787b7>3. 非商业公益声明</h2><p data-v-b9a787b7> 本作<strong data-v-b9a787b7>完全免费</strong>，开发组<strong data-v-b9a787b7>不通过本作收取任何费用</strong>（包括但不限于下载费、内购、打赏、广告分成、会员订阅）。 </p><p data-v-b9a787b7>任何第三方若以本作名义收费，均属侵权行为，与本开发组无关。</p></section><section data-v-b9a787b7><h2 data-v-b9a787b7>4. 使用限制</h2><ul data-v-b9a787b7><li data-v-b9a787b7><strong data-v-b9a787b7>禁止</strong>将本作或其修改版本用于任何商业目的（包括盈利性直播、线下活动、捆绑销售等）。</li><li data-v-b9a787b7><strong data-v-b9a787b7>禁止</strong>对本作进行<strong data-v-b9a787b7>二次开发、反编译、拆包、改编、移植</strong>或提取其中任何原创素材，除非获得开发组书面授权。</li><li data-v-b9a787b7><strong data-v-b9a787b7>禁止</strong>在未标明来源的情况下转载、分发本作。</li></ul></section><section data-v-b9a787b7><h2 data-v-b9a787b7>5. 用户责任与风险</h2><p data-v-b9a787b7> 本作以“现状”提供，<strong data-v-b9a787b7>不提供任何明示或暗示的担保</strong>（包括稳定性、兼容性、无错误等）。 </p><p data-v-b9a787b7> 用户因使用本作产生的任何设备损坏、数据丢失或其他损失，开发组<strong data-v-b9a787b7>不承担任何责任</strong>。 </p></section><section data-v-b9a787b7><h2 data-v-b9a787b7>6. 侵权投诉与联系</h2><p data-v-b9a787b7> 若您认为本作侵犯了您的合法权益，请通过以下邮箱联系我们，我们将在核实后<strong data-v-b9a787b7>48小时内</strong>采取删除、下架或修改措施。 </p><p data-v-b9a787b7> 联系邮箱：<a href="mailto:1330399265@qq.com" data-v-b9a787b7>1330399265@qq.com</a></p></section><section data-v-b9a787b7><h2 data-v-b9a787b7>7. 声明更新</h2><p data-v-b9a787b7> 本声明自发布之日起生效，开发组保留根据法律要求或实际情况进行修改的权利，修改后将在本作发布页面公示。 </p></section>',
                      7,
                    ),
                  ]),
                544,
              ),
              r("footer", Zr, [
                o.value ? (P(), E("p", el, v(o.value), 1)) : O("", !0),
                r("div", tl, [
                  r(
                    "button",
                    {
                      type: "button",
                      disabled: !n.value,
                      onClick: l[0] || (l[0] = (u) => a.$emit("continue")),
                    },
                    " 我已阅读，进入游戏 ",
                    8,
                    nl,
                  ),
                  n.value
                    ? O("", !0)
                    : (P(),
                      E("button", {
                        key: 0,
                        class: "read-hint-trigger",
                        type: "button",
                        "aria-label": "请先滑动到最底端阅读免责声明",
                        onClick: s,
                      })),
                ]),
              ]),
            ]),
          ])
        )
      );
    },
  }),
  il = jn(ol, [["__scopeId", "data-v-b9a787b7"]]),
  sl = { class: "flow-card" },
  al = de({
    __name: "CurrentFlowCard",
    props: { title: {} },
    setup(t) {
      return (e, n) => (
        P(),
        E("section", sl, [r("p", null, v(V(A)(e.title)), 1)])
      );
    },
  }),
  rl = ["aria-live"],
  ll = de({
    __name: "CurrentResultCard",
    props: { text: {}, spinning: { type: Boolean } },
    setup(t) {
      return (e, n) => (
        P(),
        E(
          "section",
          {
            class: dt(["result-card", { spinning: e.spinning }]),
            "aria-live": e.spinning ? "off" : "polite",
          },
          [r("p", null, v(V(A)(e.text)), 1)],
          10,
          rl,
        )
      );
    },
  }),
  ji = [
    { minimumLevel: 1, basePower: 1, powerPerLevel: 1 },
    { minimumLevel: 11, basePower: 12, powerPerLevel: 2 },
    { minimumLevel: 21, basePower: 33, powerPerLevel: 3 },
    { minimumLevel: 31, basePower: 64, powerPerLevel: 4 },
    { minimumLevel: 41, basePower: 105, powerPerLevel: 5 },
    { minimumLevel: 51, basePower: 156, powerPerLevel: 6 },
    { minimumLevel: 61, basePower: 217, powerPerLevel: 7 },
    { minimumLevel: 71, basePower: 288, powerPerLevel: 8 },
    { minimumLevel: 81, basePower: 370, powerPerLevel: 10 },
    { minimumLevel: 91, basePower: 480, powerPerLevel: 20 },
    { minimumLevel: 96, basePower: 610, powerPerLevel: 50 },
    { minimumLevel: 100, basePower: 1260, powerPerLevel: 500 },
    { minimumLevel: 110, basePower: 6760, powerPerLevel: 1e3 },
    { minimumLevel: 120, basePower: 17760, powerPerLevel: 2e3 },
    { minimumLevel: 130, basePower: 39760, powerPerLevel: 4e3 },
    { minimumLevel: 140, basePower: 81760, powerPerLevel: 6e3 },
    { minimumLevel: 150, basePower: 145760, powerPerLevel: 1e4 },
    { minimumLevel: 160, basePower: 255760, powerPerLevel: 2e4 },
  ],
  zi = [
    { minimumYears: 10, basePower: 2, yearsPerStep: 10, powerPerStep: 2 },
    { minimumYears: 100, basePower: 30, yearsPerStep: 100, powerPerStep: 5 },
    { minimumYears: 1e3, basePower: 100, yearsPerStep: 1e3, powerPerStep: 15 },
    { minimumYears: 1e4, basePower: 300, yearsPerStep: 1e4, powerPerStep: 50 },
    { minimumYears: 1e5, basePower: 900, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 2e5, basePower: 1090, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 3e5, basePower: 1280, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 4e5, basePower: 1470, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 5e5, basePower: 1660, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 6e5, basePower: 1850, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 7e5, basePower: 2040, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 8e5, basePower: 2230, yearsPerStep: 1e4, powerPerStep: 10 },
    { minimumYears: 9e5, basePower: 2420, yearsPerStep: 1e4, powerPerStep: 10 },
  ],
  Ns = [
    { minimumYears: 1e6, power: 200 },
    { minimumYears: 9e5, power: 110 },
    { minimumYears: 8e5, power: 100 },
    { minimumYears: 7e5, power: 90 },
    { minimumYears: 6e5, power: 80 },
    { minimumYears: 5e5, power: 70 },
    { minimumYears: 4e5, power: 60 },
    { minimumYears: 3e5, power: 50 },
    { minimumYears: 2e5, power: 40 },
    { minimumYears: 1e5, power: 30 },
    { minimumYears: 5e4, power: 21 },
    { minimumYears: 1e4, power: 16 },
    { minimumYears: 5e3, power: 11 },
    { minimumYears: 1e3, power: 8 },
    { minimumYears: 500, power: 5 },
    { minimumYears: 100, power: 3 },
    { minimumYears: 10, power: 1 },
  ],
  ul = {
    low: 1e3,
    ordinary: 1e4,
    top: 2e4,
    "sub-dragon": 2e4,
    "earth-dragon": 2e4,
    "pure-dragon": 3e4,
  },
  dl = { low: 0, ordinary: 1e3, top: 2500, ultimate: 3e3 },
  cl = { low: 500, ordinary: 1e3, top: 2500, ultimate: 3e3 },
  fl = { ordinary: 500, ultimate: 1200, "law-seed": 2e3, "complete-law": 3e3 },
  Ui = {
    low: -5e3,
    ordinary: 0,
    top: 1e3,
    "sub-dragon": 2e3,
    "earth-dragon": 1e3,
    "pure-dragon": 5e3,
    supreme: 1e4,
  },
  pl = {
    marquis: 500,
    king: 1e3,
    emperor: 1500,
    sovereign: 2e3,
    ruler: 3e3,
    "beast-king": 3e3,
    "dragon-king": 3e3,
  },
  Eo = { third: 300, second: 500, first: 800, king: 1e3, "supreme-king": 2e3 },
  Ds = 169,
  ml = 760,
  Fs = 1e3,
  hl = 1e3,
  gl = 5e3,
  vl = 1e3;
function Ke(t, e) {
  if (!Number.isFinite(t)) throw new Error(`${e}必须是有限数值`);
  return t;
}
function qe(t) {
  const e = Ke(t, "战力");
  return e < 0 ? -Math.floor(-e + 0.5) : Math.floor(e + 0.5);
}
function En(t) {
  return Math.max(1, qe(t));
}
function an(t, e) {
  return Math.max(0, Math.trunc(Ke(t ?? 0, e)));
}
function Ie(t) {
  return t.reduce((e, n) => e + Ke(n, "战力构成"), 0);
}
function We(t, e, n = !0) {
  const o = (t * e) / 1e4;
  return e === 0 ? 0 : e < 0 ? qe(o) : n ? En(o) : qe(o);
}
function Vs(t) {
  const e = Math.min(Ds, Math.max(1, Math.floor(Ke(t, "等级"))));
  let n = ji[0];
  for (const o of ji) e >= o.minimumLevel && (n = o);
  return n.basePower + (e - n.minimumLevel) * n.powerPerLevel;
}
function js(t, e = !1) {
  const n = Math.max(0, Math.floor(Ke(t, "魂兽修为")));
  if (n < 10) return 1;
  if (n >= 1e6) return e ? 3510 : 2510;
  let o = zi[0];
  for (const i of zi) n >= i.minimumYears && (o = i);
  return (
    o.basePower +
    Math.floor((n - o.minimumYears) / o.yearsPerStep) * o.powerPerStep
  );
}
function bl(t, e = !1) {
  var o;
  if (e) return Fs;
  const n = Math.max(0, Math.floor(Ke(t, "魂环年限")));
  return (
    ((o = Ns.find((i) => n >= i.minimumYears)) == null ? void 0 : o.power) ?? 0
  );
}
function yl(t) {
  var n;
  const e = Math.max(0, Math.floor(Ke(t, "魂骨年限")));
  return (
    ((n = Ns.find((o) => e >= o.minimumYears)) == null ? void 0 : n.power) ?? 0
  );
}
function zs(t, e = "ordinary", n = !1) {
  return t <= 0 ? 0 : We(t, n ? 2e4 : ul[e]);
}
function wl(t) {
  let e = 0,
    n = 0;
  for (const o of t) {
    const i = bl(o.years, o.godLevel),
      s = o.godLevel ? Fs : zs(i, o.quality, o.divine);
    ((e += i), (n += s - i));
  }
  return { base: e, quality: n };
}
function Wi(t, e) {
  return e ? [...e] : t ? [t] : [];
}
function Sl(t, e) {
  let n = 0,
    o = 0,
    i = 0;
  for (const l of t) {
    const u = yl(l.years),
      d = zs(u, l.quality, l.divine);
    if (l.godArmor === !0 || (e.length > 0 && l.slot !== "external")) {
      const f = Math.max(1, e.length);
      i += d * 3 * f;
    } else ((n += u), (o += d - u));
  }
  const s = Ie(e.map((l) => Eo[l])),
    a = i + s;
  return {
    boneBase: n,
    boneQuality: o,
    godArmor: e.length > 1 ? En(a * 0.8) : a,
  };
}
function qi(t, e) {
  const n = e.filter((i) => i.kind === "default").length;
  return (
    Ie(e.filter((i) => i.kind === "fixed").map((i) => qe(i.value ?? 0))) +
    (n > 0 ? We(t, vl * n) : 0)
  );
}
function Il(t, e, n) {
  const o = new Map();
  for (const i of e) o.set(i, (o.get(i) ?? 0) + 1);
  return Ie([...o].map(([i, s]) => We(t, n[i] * s)));
}
function pe(t, e, n) {
  const o = qe(n);
  o !== 0 && (t[e] = o);
}
function kl(t) {
  var b;
  const e = Math.min(Ds, Math.max(1, Math.floor(Ke(t.level ?? 1, "等级")))),
    n =
      t.route === "beast"
        ? js(t.beastYears ?? 0, t.passedMillionYearTribulation)
        : Vs(e),
    o = {};
  if (t.route === "human") {
    const c = t.martialSoulQualities ?? [];
    if (
      (pe(o, "martialSoulQuality", Ie(c.map((m) => We(n, dl[m])))),
      t.martialSoulTrueBody && e >= 70)
    ) {
      const m = t.martialSoulBodyQuality ? [t.martialSoulBodyQuality] : c;
      pe(o, "martialSoulTrueBody", Ie(m.map((h) => We(n, cl[h]))));
    }
    const L = wl(t.soulRings ?? []);
    (pe(o, "soulRingBase", L.base), pe(o, "soulRingQuality", L.quality));
  }
  const i = t.route === "human" ? e >= 100 : !!t.passedMillionYearTribulation,
    s = i ? Wi(t.godArmor, t.godArmorSets) : [],
    a =
      t.route === "human"
        ? Sl(t.soulBones ?? [], s)
        : { boneBase: 0, boneQuality: 0, godArmor: 0 };
  (pe(o, "soulBoneBase", a.boneBase),
    pe(o, "soulBoneQuality", a.boneQuality),
    pe(o, "godArmor", a.godArmor),
    i && pe(o, "godhood", Ie(Wi(t.godhood, t.godhoods).map((c) => Eo[c]))));
  const l = an(t.domains, "领域数量");
  pe(o, "domains", l > 0 ? We(n, hl * l) : 0);
  const u = an(t.artifactFixedPower, "神器固定战力"),
    d =
      Ie(
        (t.artifacts ?? []).map((c) => {
          const L = Eo[c];
          return t.route === "human" && e < 100 ? qe(L / 10) : L;
        }),
      ) + (t.route === "human" && e < 100 ? qe(u / 10) : u);
  pe(o, "artifacts", d);
  const p = [
    ...(t.attributeQualities ?? []),
    ...Array.from({ length: an(t.attributes, "属性数量") }, () => "ordinary"),
  ];
  if ((pe(o, "attributes", Il(n, p, fl)), t.route === "beast")) {
    const c = {
        0: "ordinary",
        1: "low",
        2: "top",
        3: "sub-dragon",
        4: "earth-dragon",
        5: "pure-dragon",
      },
      L = t.beastBloodlineComposition ?? [];
    if (L.length > 1)
      pe(
        o,
        "bloodlineFusion",
        Ie(
          L.map((h) =>
            We(
              n,
              (Ui[h.quality] * Ke(h.ratioBasisPoints, "血脉占比")) / 1e4,
              !1,
            ),
          ),
        ) + qe(t.bloodlineFusionBonus ?? 0),
      );
    else {
      const h =
        ((b = L[0]) == null ? void 0 : b.quality) ??
        t.beastBloodlineQuality ??
        (t.beastBloodlineLevel === void 0 ? void 0 : c[t.beastBloodlineLevel]);
      (h && pe(o, "beastBloodline", We(n, Ui[h], !1)),
        pe(o, "bloodlineFusion", qe(t.bloodlineFusionBonus ?? 0)));
    }
    const m = Ie((t.beastTitles ?? []).map((h) => pl[h]));
    pe(
      o,
      "beastTitles",
      (m === 0 ? 0 : We(n, m)) + Ie(t.beastTitleBonuses ?? []),
    );
  }
  pe(o, "plotCharacterTemplate", qe(t.plotCharacterTemplate ?? 0));
  const f = an(t.soulCoreCount, "魂核数量"),
    I = t.route === "human" ? Math.min(n, ml) : n;
  (pe(o, "soulCores", f > 0 ? We(I, f * gl) : 0),
    pe(o, "items", qi(n, t.items ?? []) + Ie(t.itemBonuses ?? [])),
    pe(
      o,
      "specialSkills",
      qi(n, t.specialSkills ?? []) + Ie(t.specialSkillBonuses ?? []),
    ),
    pe(o, "special", Ie(t.bonuses ?? [])));
  const k = Ie(t.statusModifiers ?? []);
  let g = n + Ie(Object.values(o)),
    w = Math.max(1, qe(g + k));
  for (const c of t.statusEffects ?? [])
    w = En(c === "severely-injured" ? w * 0.5 : w * 1.5);
  return (
    pe(o, "status", w - g),
    {
      base: n,
      baseCategory: t.route === "beast" ? "beastCultivation" : "level",
      components: o,
      total: w,
    }
  );
}
function $l(t, e) {
  return Ke(t, "参战战力") >= Ke(e, "战斗阈值");
}
const Pl = new Set([
    "91f81f",
    "d07259",
    "105779",
    "c095ab",
    "d96e26",
    "91d405",
    "50bf46",
    "a8999d",
    "50df3d",
    "58f1b5",
    "26189f",
    "6eae6c",
    "ddb393",
    "535532",
    "90a340",
    "80dda7",
    "085dda",
    "010f3c",
    "70eee4",
    "1b3e6d",
    "2982e1",
    "a1899b",
    "5b37fa",
    "7ce2aa",
    "ac7151",
    "253e6c",
    "2299dc",
    "9959f7",
    "2e1d80",
    "37ab68",
    "f4363a",
    "af37d3",
    "ec0b09",
    "27a3bb",
    "14c039",
    "23e74a",
  ]),
  Cl = new Set([
    "3eadd3",
    "211d29",
    "f1b091",
    "03723c",
    "a62a1b",
    "6dea33",
    "6a4784",
    "b9503e",
    "19b21b",
    "23d24a",
    "8df1b1",
    "33e513",
    "3a74da",
    "f2c36e",
    "f99c23",
    "2e65a6",
    "86f306",
    "ec9455",
    "694eef",
    "9ebb37",
    "e8f617",
    "f6321b",
    "7f883c",
    "aadbf9",
    "cb769b",
    "7cc957",
    "c80831",
    "a4856d",
    "636076",
    "72dab4",
    "1924d2",
    "dc6c18",
    "490626",
    "973ffa",
    "1d09a1",
    "f8fa12",
    "604793",
    "c27be2",
    "d761ec",
    "0d8596",
    "334906",
    "130846",
    "c16fd7",
    "f4fe04",
    "4e5031",
    "974def",
    "3f5c8c",
    "908ee3",
    "fef5a7",
    "31df22",
    "650679",
    "3773c7",
    "f165b5",
    "f66f45",
    "eddca3",
    "392275",
    "8d6017",
    "274df9",
    "697d0a",
    "bce304",
    "89c50a",
    "9d7cff",
    "85fd1a",
    "7616d7",
    "b18294",
    "be9150",
    "412d4f",
    "5d5aa3",
    "06e17d",
    "147fd1",
    "4ef17e",
    "ec19c3",
    "c42d5a",
    "13c304",
    "5b6917",
    "c0cb12",
    "2e7973",
    "710547",
    "0fd97a",
    "5afcec",
    "458c99",
    "8209da",
    "745049",
    "961837",
    "a89e7a",
    "e58fd7",
    "d3b532",
    "ef316e",
    "411997",
    "ab2bc6",
    "53c0b6",
    "43cdcc",
    "b5db60",
    "cb5424",
    "e43691",
    "2019ea",
    "3bed6c",
    "a2b1c9",
    "783745",
    "2c5df6",
    "a5f53d",
    "0810c3",
    "d4f60a",
    "7b058d",
    "ab3ca1",
    "bf75b7",
    "ddd7ef",
    "defab7",
    "cbcea9",
    "e35cb9",
    "c9040e",
    "6eb96c",
    "9a0264",
    "645a22",
    "8fcc9a",
    "08974b",
    "e5b67d",
    "dd015d",
    "2159ba",
    "9baab3",
    "41c0b7",
    "6620d8",
    "bfe91c",
    "de4547",
    "25508b",
    "727277",
    "5852ea",
    "bbd7e4",
    "4110f8",
    "182a80",
    "f9c228",
    "5fdecb",
    "b9ef31",
    "2af219",
    "3928b9",
    "696230",
    "7ffe6e",
    "36ede0",
    "ed129f",
    "7783d4",
    "f6add6",
    "d6ed28",
    "6a5a92",
    "ba0cb3",
    "a27bba",
    "e1584d",
    "bfcf94",
    "6a616b",
    "d8afe4",
    "c514cd",
    "63d4cc",
    "5d67ef",
    "e47839",
    "edc4f1",
    "dd9986",
    "4dd9b9",
    "19d730",
    "150a0e",
    "c0c794",
    "a606aa",
    "56b559",
    "e01a6e",
    "5aa758",
    "07e753",
    "98c5ad",
    "1493fb",
    "5b549e",
    "d89970",
    "469b21",
  ]),
  El = new Set([
    "899307",
    "c94f2f",
    "2bdf0b",
    "9e8e80",
    "9d24ca",
    "f92dfc",
    "ccb4c6",
    "347486",
    "1e5243",
  ]),
  Ll = new Set([
    "0a87d4",
    "ec1cb4",
    "838519",
    "65d32f",
    "0c7919",
    "737bc9",
    "5a62ac",
    "f71926",
    "1114d9",
  ]),
  Al = new Set([
    "7bbe67",
    "4c82df",
    "730cb3",
    "e85765",
    "6b6961",
    "852a87",
    "2dcdb3",
    "86cec7",
    "52d5f4",
  ]),
  Us = new Set([
    "83cab9",
    "a0225c",
    "a5592d",
    "98e780",
    "cc4275",
    "5c8993",
    "362ec0",
    "2e584f",
    "4423a9",
    "34e9cc",
    "20b035",
    "523cc7",
    "226ec1",
    "a37544",
    "065164",
    "98e3da",
    "02e096",
    "338595",
    "25fd89",
    "51ebbb",
    "4176fe",
    "300571",
    "a2b3ac",
    "6ba7e5",
    "1782ff",
  ]),
  Ws = new Set([
    "4ed7e8",
    "3b2226",
    "b429ef",
    "fe3d52",
    "0f2ca6",
    "9b0825",
    "952625",
    "3999e3",
    "909021",
    "b23d59",
    "78799e",
    "c2bd6e",
    "15a713",
    "5065c4",
    "67492d",
    "2bcb04",
    "e03682",
    "ab60ef",
    "3bc0d1",
    "0f8551",
    "e69fe2",
    "128c3b",
    "b38ee8",
    "2dac29",
    "009bcc",
    "fb8754",
    "43d87d",
    "3d72e8",
    "b68ee6",
    "4caa74",
    "8cdede",
    "b95ea9",
    "cf891a",
    "a60b50",
    "013ad4",
    "b349d5",
    "a2869e",
    "323589",
    "26d484",
    "584cb2",
    "6c025a",
    "d40166",
    "a52cd6",
    "6ced46",
    "bd1932",
    "f26f1c",
    "b31e07",
    "de54b1",
    "5a6d2b",
    "b9e5dc",
    "13fece",
    "9f3523",
    "fc46f4",
    "586b05",
    "247d4f",
    "6fe244",
    "b15e98",
    "9baaa6",
    "eb090c",
    "50e541",
    "3bf50d",
    "78ad2e",
    "a28a72",
    "78d2f8",
    "537420",
    "7a2d74",
    "2d58bb",
  ]),
  co = {
    head: "head",
    torso: "torso",
    leftArm: "left-arm",
    rightArm: "right-arm",
    leftLeg: "left-leg",
    rightLeg: "right-leg",
    external: "external",
    "left-arm": "left-arm",
    "right-arm": "right-arm",
    "left-leg": "left-leg",
    "right-leg": "right-leg",
    "40809b": "head",
    672129: "left-arm",
    "5c21d5": "left-leg",
    "7f9b7a": "right-arm",
    751286: "torso",
    "082528": "right-leg",
    "9a5039": "external",
    fe17d1: "external",
  },
  Gi = {
    侯: "marquis",
    王: "king",
    皇: "emperor",
    帝: "sovereign",
    主宰: "ruler",
    兽王: "beast-king",
    龙王: "dragon-king",
  };
function Rl(t) {
  var i;
  const e = { low: 0, ordinary: 1, top: 2, ultimate: 3 },
    n = (s) => (Pl.has(s) ? "low" : Cl.has(s) ? "top" : "ordinary"),
    o = [n(t.id), ...(t.awakenings ?? []).map((s) => n(s.optionId))];
  return (
    (((i = t.tags) != null && i.includes("ultimate")) ||
      t.category === "极致武魂") &&
      o.push("ultimate"),
    o.reduce((s, a) => (e[a] > e[s] ? a : s))
  );
}
function _l(t) {
  var n;
  if (t.quality && t.quality !== "divine") return t.quality;
  const e = (n = t.typeSelection) == null ? void 0 : n.optionId;
  return t.speciesSelection && Us.has(t.speciesSelection.optionId)
    ? "low"
    : e && Al.has(e)
      ? "pure-dragon"
      : e && Ll.has(e)
        ? "earth-dragon"
        : e && El.has(e)
          ? "sub-dragon"
          : t.speciesSelection && Ws.has(t.speciesSelection.optionId)
            ? "top"
            : "ordinary";
}
function Tl(t) {
  return t.partId && co[t.partId]
    ? co[t.partId]
    : t.id.startsWith("growth-external:")
      ? "external"
      : co[t.id];
}
function xl(t) {
  if (t === "三级") return "third";
  if (t === "二级") return "second";
  if (t === "一级") return "first";
  if (t === "神王") return "king";
}
function Hi(t, e, n) {
  return Object.entries(t.flags)
    .filter(([o]) => o.startsWith(`combat:${e}:level-percent:`))
    .reduce((o, [i, s]) => {
      const a = i.split(":"),
        l = a.length === 4,
        u = Number(l ? (s ?? 0) : a[3]),
        d = l ? 1 : Number(s ?? 0),
        p = Number(l ? a[3] : a[4]);
      return (Number.isFinite(p) && t.level >= p) ||
        !Number.isFinite(u) ||
        !Number.isFinite(d)
        ? o
        : o + We(n, u) * Math.max(0, Math.trunc(d));
    }, 0);
}
function Ol(t) {
  var s;
  const e = (s = t.beast) == null ? void 0 : s.attributeStages;
  if (e && Object.keys(e).length > 0)
    return Object.values(e).flatMap((a) =>
      a >= 4
        ? ["complete-law"]
        : a === 3
          ? ["law-seed"]
          : a === 2
            ? ["ultimate"]
            : a === 1
              ? ["ordinary"]
              : [],
    );
  if (t.elementProgress && Object.keys(t.elementProgress).length > 0)
    return Object.values(t.elementProgress).flatMap((a) =>
      a >= 4
        ? ["complete-law"]
        : a === 3
          ? ["law-seed"]
          : a === 2
            ? ["ultimate"]
            : a === 1
              ? ["ordinary"]
              : [],
    );
  const n = { ordinary: 1, ultimate: 2, "law-seed": 3, "complete-law": 4 },
    o = new Map();
  for (const a of t.attributes) o.set(a, "ordinary");
  const i = [
    { suffix: ".ultimate", quality: "ultimate" },
    { suffix: ".law-seed", quality: "law-seed" },
    { suffix: ".complete-law", quality: "complete-law" },
  ];
  for (const a of t.traits) {
    const l = a.startsWith("formal:element.")
      ? "formal:element."
      : a.startsWith("douluo2:element.")
        ? "douluo2:element."
        : void 0;
    if (!l) continue;
    const u = i.find((f) => a.endsWith(f.suffix));
    if (!u) continue;
    const d = a.slice(l.length, -u.suffix.length);
    if (!d) continue;
    const p = o.get(d);
    (!p || n[u.quality] > n[p]) && o.set(d, u.quality);
  }
  return [...o.values()];
}
function Yi(t, e, n) {
  var o;
  return n &&
    (t.flags["formal:beast-supreme-bloodline"] === !0 ||
      ((o = t.beast) != null && o.nameSuffixes.includes("主宰")))
    ? "supreme"
    : Us.has(e.selection.optionId)
      ? "low"
      : e.typeOptionId === "fc8f55"
        ? "pure-dragon"
        : e.typeOptionId === "5ee629"
          ? "earth-dragon"
          : e.typeOptionId === "f7fb5e"
            ? "sub-dragon"
            : Ws.has(e.selection.optionId)
              ? "top"
              : "ordinary";
}
function Ml(t) {
  var i, s;
  const e = ((i = t.beast) == null ? void 0 : i.bloodlines) ?? [],
    n = ((s = t.beast) == null ? void 0 : s.bloodlineComponents) ?? [];
  if (n.length > 0)
    return n.map((a, l) => {
      const u = e.find((d) => d.selection.optionId === a.bloodlineId) ?? e[l];
      return {
        quality: u ? Yi(t, u, a.role === "primary") : "ordinary",
        ratioBasisPoints: a.ratioBasisPoints,
      };
    });
  const o = e.map((a, l) => ({
    quality: Yi(t, a, l === 0),
    ratioBasisPoints: Math.max(0, Math.round(a.percentage * 100)),
  }));
  if (o.length > 0) {
    const a = 1e4 - Ie(o.map((l) => l.ratioBasisPoints));
    o[o.length - 1].ratioBasisPoints += a;
  }
  return o;
}
class Ln {
  static breakdown(e) {
    var b, c, L, m, h;
    const n = e.route === "beast" ? "beast" : "human",
      o =
        n === "beast"
          ? js(
              e.beastYears,
              !!((b = e.beast) != null && b.tribulationsPassed.includes(1e6)),
            )
          : Vs(e.level),
      i = e.martialSouls.map(Rl),
      s = e.martialSouls.flatMap(($) =>
        $.rings.map((N, te) => ({
          years: N.years,
          quality: _l(N),
          divine: N.quality === "divine",
          godLevel: e.level >= 100 && te >= 9,
        })),
      ),
      a = xl(
        ((c = e.godhood) == null ? void 0 : c.tier) ??
          ((L = e.godTrial) == null ? void 0 : L.tier),
      ),
      l = e.flags.godTrialArmor === !0 && a ? [a] : [],
      u = e.artifacts.filter(($) => $.stage === "complete"),
      d = u
        .filter(($) => $.combatPower === void 0)
        .flatMap(() => (a ? [a] : [])),
      p = Ie(u.map(($) => $.combatPower ?? 0)),
      f = [
        ...new Set([
          ...(((m = e.beast) == null ? void 0 : m.nameSuffixes) ?? []),
          ...e.titles,
        ]),
      ].flatMap(($) => (Gi[$] ? [Gi[$]] : [])),
      I = Number(e.flags["combat:status-multiplier-basis-points"] ?? 1e4),
      k = I === 5e3 ? ["severely-injured"] : I === 15e3 ? ["desperate"] : [],
      g = Number(e.flags["combat:item-bonus"] ?? 0),
      w = Number(e.flags["combat:special-skill-bonus"] ?? 0);
    return kl({
      route: n,
      level: e.level,
      beastYears: e.beastYears,
      passedMillionYearTribulation: !!(
        (h = e.beast) != null && h.tribulationsPassed.includes(1e6)
      ),
      martialSoulQualities: i,
      martialSoulTrueBody: e.level >= 70,
      soulRings: s,
      soulBones: e.soulBones.map(($) => ({
        years: $.years,
        quality: $.quality === "divine" ? "ordinary" : $.quality,
        divine: $.quality === "divine",
        slot: Tl($),
      })),
      godhood: a,
      godArmorSets: l,
      domains: e.domains.length,
      artifacts: d,
      artifactFixedPower: p,
      attributeQualities: Ol(e),
      beastBloodlineComposition: Ml(e),
      beastTitles: f,
      soulCoreCount: Number(e.flags.soulCoreCount ?? 0),
      statusEffects: k,
      statusModifiers: [Number(e.flags["combat:status-modifier"] ?? 0)],
      itemBonuses: [g, Hi(e, "item", o)],
      specialSkillBonuses: [w, Hi(e, "special-skill", o)],
    });
  }
  static total(e) {
    return this.breakdown(e).total;
  }
  static meets(e, n) {
    return $l(this.total(e), n);
  }
}
const He = 100,
  Tt = 1e4;
function Yo(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("货币金额必须是非负安全整数");
  return t;
}
function pn(t) {
  const e = Yo(t.amount);
  if (!t.reason.trim() || !t.referenceId.trim() || !t.idempotencyKey.trim())
    throw new Error("货币交易缺少原因、关联 ID 或幂等 ID");
  return {
    id: t.idempotencyKey,
    idempotencyKey: t.idempotencyKey,
    currency: t.currency,
    direction: t.direction,
    amount: e,
    reason: t.reason,
    referenceId: t.referenceId,
    status: "committed",
    undoPolicy:
      t.undoPolicy ?? (t.currency === "fufu-hundredths" ? "retain" : "restore"),
  };
}
function An(t) {
  return t.undoPolicy
    ? t.undoPolicy
    : t.currency === "fufu-hundredths" ||
        t.reason === "formal-undo-fee" ||
        t.reason === "formal-reroll-fee"
      ? "retain"
      : "restore";
}
function Bl(t) {
  return An(t) === "retain";
}
function qs(t, e) {
  return (
    t.id === e.id &&
    t.idempotencyKey === e.idempotencyKey &&
    t.currency === e.currency &&
    t.direction === e.direction &&
    t.amount === e.amount &&
    t.reason === e.reason &&
    t.referenceId === e.referenceId &&
    t.status === e.status &&
    An(t) === An(e)
  );
}
function Gs(t, e, n) {
  const o =
    t.reason === "migrated-ending-settlement" &&
    t.amount === 0 &&
    e.reason === "ending-combat-power-reward" &&
    t.id === e.id &&
    t.currency === e.currency &&
    t.direction === e.direction &&
    t.referenceId === e.referenceId;
  if (!qs(t, e) && !o)
    throw new Error(`货币幂等 ID ${e.idempotencyKey} 与既有交易语义不一致`);
  return {
    committed: !1,
    duplicate: !0,
    insufficient: !1,
    balance: n,
    transaction: t,
  };
}
function Hs(t) {
  if (!Number.isSafeInteger(t.copper) || t.copper < 0)
    throw new Error("单局铜币余额必须是非负安全整数");
  if (!Lo(t.transactions, "run-copper"))
    throw new Error("单局钱包交易记录无效、重复或币种不匹配");
}
function pt(t) {
  const e = t.wallet ?? (t.wallet = { copper: 0, transactions: [] });
  return (e.transactions ?? (e.transactions = []), Hs(e), e);
}
function Nl(t) {
  const e = Yo(t);
  return {
    gold: Math.floor(e / Tt),
    silver: Math.floor((e % Tt) / He),
    copper: e % He,
  };
}
function _t(t) {
  const e = Nl(t);
  return `${e.gold}金 ${e.silver}银 ${e.copper}铜`;
}
function Ys(t) {
  if (!Number.isSafeInteger(t)) throw new Error("货币等级必须是自然数");
  const e = Math.max(1, t);
  return e >= 100 ? Tt : e >= 91 ? He : Math.ceil(e / 10) * 10;
}
function Dl(t) {
  return Ys(t);
}
function Fl(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("魂兽年限修为必须是非负安全整数");
  return t >= 1e6
    ? 100 * Tt
    : t >= 1e5
      ? Tt
      : t >= 1e4
        ? 10 * He
        : t >= 1e3
          ? He
          : t >= 100
            ? 10
            : t >= 10
              ? 1
              : 0;
}
function Vl(t) {
  if (!Number.isSafeInteger(t) || t < 0)
    throw new Error("魂兽年限修为必须是非负安全整数");
  return t >= 1e6
    ? 10 * Tt
    : t >= 1e5
      ? 20 * He
      : t >= 1e4
        ? 2 * He
        : t >= 1e3
          ? 20
          : t >= 100
            ? 5
            : t >= 10
              ? 1
              : 0;
}
function Ki(t) {
  return !(t.flags.formalHumanSetupComplete || t.flags.beastSetupComplete)
    ? 0
    : t.route === "beast"
      ? Vl(t.beastYears)
      : Dl(t.level);
}
function jl(t, e, n) {
  if (
    !Number.isSafeInteger(t) ||
    t < 0 ||
    !Number.isSafeInteger(e) ||
    !Number.isSafeInteger(n) ||
    n < 0
  )
    throw new Error("魂兽时间跳跃参数必须是有效安全整数");
  let o = 0;
  for (let i = 0; i < n; i += 1) {
    const s = Math.max(0, t + Math.floor((e * i) / Math.max(1, n)));
    if (((o += Fl(s)), !Number.isSafeInteger(o)))
      throw new Error("魂兽时间跳跃收入超出安全整数范围");
  }
  return o;
}
function Ko(t, e) {
  if (e.currency !== "run-copper") throw new Error("单局钱包只能提交铜币交易");
  const n = pt(t),
    o = pn(e),
    i = n.transactions.find((a) => a.idempotencyKey === e.idempotencyKey);
  if (i) return Gs(i, o, n.copper);
  if (o.direction === "debit" && n.copper < o.amount)
    return {
      committed: !1,
      duplicate: !1,
      insufficient: !0,
      balance: n.copper,
    };
  const s = n.copper + (o.direction === "credit" ? o.amount : -o.amount);
  if (!Number.isSafeInteger(s) || s < 0)
    throw new Error("单局铜币余额超出安全整数范围");
  return (
    (n.copper = s),
    n.transactions.push(o),
    {
      committed: !0,
      duplicate: !1,
      insufficient: !1,
      balance: n.copper,
      transaction: o,
    }
  );
}
function gt(t, e, n) {
  return Ko(t, {
    ...n,
    currency: "run-copper",
    direction: "credit",
    amount: e,
  });
}
function Rn(t, e, n) {
  return Ko(t, { ...n, currency: "run-copper", direction: "debit", amount: e });
}
function Ks(t, e) {
  const n = pt(t).copper;
  return n === 0
    ? { committed: !1, duplicate: !1, insufficient: !1, balance: 0 }
    : Rn(t, n, e);
}
function zl(t) {
  if (!Number.isFinite(t)) throw new Error("结局战力必须是有限数值");
  const e = Math.floor(Math.max(0, t) / 1e3);
  if (!Number.isSafeInteger(e)) throw new Error("结局芙芙奖励超出安全整数范围");
  return e;
}
function xt(t) {
  return (Yo(t) / 100)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1");
}
const Ji = "dlzp:v6:fufu-hundredths",
  Qi = "dlzp:v6:fufu-account-v1",
  Xi = "dlzp:v6:fufu-run-sequence",
  Zi = "dlzp:v6:fufu-settlements";
function Ul(t) {
  if (!t || typeof t != "object") return !1;
  const e = t;
  return (
    typeof e.id == "string" &&
    e.id.trim().length > 0 &&
    typeof e.idempotencyKey == "string" &&
    e.idempotencyKey.trim().length > 0 &&
    e.id === e.idempotencyKey &&
    (e.currency === "run-copper" || e.currency === "fufu-hundredths") &&
    (e.direction === "credit" || e.direction === "debit") &&
    Number.isSafeInteger(e.amount) &&
    Number(e.amount) >= 0 &&
    typeof e.reason == "string" &&
    e.reason.trim().length > 0 &&
    typeof e.referenceId == "string" &&
    e.referenceId.trim().length > 0 &&
    e.status === "committed" &&
    (e.undoPolicy === void 0 ||
      e.undoPolicy === "restore" ||
      e.undoPolicy === "retain")
  );
}
function Lo(t, e) {
  if (!Array.isArray(t)) return !1;
  const n = new Set();
  for (const o of t) {
    if (!Ul(o) || o.currency !== e || n.has(o.idempotencyKey)) return !1;
    n.add(o.idempotencyKey);
  }
  return !0;
}
class Wl {
  constructor(e) {
    this.storage = e;
  }
  legacyInteger(e) {
    const n = Number(this.storage.getItem(e));
    return Number.isSafeInteger(n) && n >= 0 ? n : 0;
  }
  legacySettlements() {
    try {
      const e = JSON.parse(this.storage.getItem(Zi) ?? "[]");
      return Array.isArray(e)
        ? e.filter((n) => typeof n == "string" && n.length > 0)
        : [];
    } catch {
      return [];
    }
  }
  account() {
    let e = null;
    const n = this.storage.getItem(Qi);
    try {
      const d = JSON.parse(n ?? "null");
      if (d && typeof d == "object") {
        const p = d;
        p.version === 1 &&
          Number.isSafeInteger(p.balanceHundredths) &&
          Number(p.balanceHundredths) >= 0 &&
          Lo(p.transactions, "fufu-hundredths") &&
          (e = p);
      }
    } catch {
      if (n !== null)
        throw new Error("芙芙账户 JSON 已损坏，已停止读写以避免余额丢失");
    }
    if (n !== null && !e)
      throw new Error("芙芙账户结构无效，已停止读写以避免余额丢失");
    if (
      (e == null ? void 0 : e.runSequence) !== void 0 &&
      (!Number.isSafeInteger(e.runSequence) || Number(e.runSequence) < 0)
    )
      throw new Error("芙芙账户命运序号无效，已停止读写以避免交易 ID 重复");
    if (
      (e == null ? void 0 : e.operationSequence) !== void 0 &&
      (!Number.isSafeInteger(e.operationSequence) ||
        Number(e.operationSequence) < 0)
    )
      throw new Error("芙芙账户操作序号无效，已停止读写以避免交易 ID 重复");
    const o = n === null ? this.legacyInteger(Ji) : 0,
      i = ((e == null ? void 0 : e.transactions) ?? []).map((d) => ({
        ...d,
        undoPolicy: An(d),
      })),
      s = e ? Number(e.balanceHundredths) : o,
      a = i.reduce(
        (d, p) => d + (p.direction === "credit" ? p.amount : -p.amount),
        0,
      ),
      l = s - a;
    if (l < 0)
      throw new Error("芙芙账户账本与余额不一致，已停止读写以避免重复发放");
    if (l > 0) {
      const d = pn({
          currency: "fufu-hundredths",
          direction: "credit",
          amount: l,
          reason: "migrated-opening-balance",
          referenceId: "legacy-fufu-account",
          idempotencyKey: "migration:legacy-fufu-opening-balance",
        }),
        p = i.find((f) => f.idempotencyKey === d.idempotencyKey);
      if (p) {
        if (!qs(p, d)) throw new Error("芙芙账户迁移交易冲突");
      } else i.unshift(d);
    }
    for (const d of this.legacySettlements()) {
      const p = `ending:${d}`;
      i.some((f) => f.idempotencyKey === p) ||
        i.push(
          pn({
            currency: "fufu-hundredths",
            direction: "credit",
            amount: 0,
            reason: "migrated-ending-settlement",
            referenceId: d,
            idempotencyKey: p,
          }),
        );
    }
    const u = this.legacyInteger(Xi);
    return {
      version: 1,
      balanceHundredths: s,
      runSequence:
        Number.isSafeInteger(e == null ? void 0 : e.runSequence) &&
        Number(e == null ? void 0 : e.runSequence) >= 0
          ? Number(e == null ? void 0 : e.runSequence)
          : n === null
            ? u
            : 0,
      operationSequence:
        Number.isSafeInteger(e == null ? void 0 : e.operationSequence) &&
        Number(e == null ? void 0 : e.operationSequence) >= 0
          ? Number(e == null ? void 0 : e.operationSequence)
          : 0,
      transactions: i,
    };
  }
  write(e) {
    var n, o, i, s, a, l;
    if (
      !Number.isSafeInteger(e.balanceHundredths) ||
      e.balanceHundredths < 0 ||
      !Number.isSafeInteger(e.runSequence) ||
      e.runSequence < 0 ||
      !Number.isSafeInteger(e.operationSequence) ||
      e.operationSequence < 0 ||
      !Lo(e.transactions, "fufu-hundredths")
    )
      throw new Error("芙芙账户包含无效或溢出的数据");
    this.storage.setItem(Qi, JSON.stringify(e));
    try {
      (o = (n = this.storage).removeItem) == null || o.call(n, Ji);
    } catch {}
    try {
      (s = (i = this.storage).removeItem) == null || s.call(i, Xi);
    } catch {}
    try {
      (l = (a = this.storage).removeItem) == null || l.call(a, Zi);
    } catch {}
  }
  balance() {
    return this.account().balanceHundredths;
  }
  transactions() {
    return this.account().transactions.map((e) => ({ ...e }));
  }
  commitCurrencyTransaction(e) {
    if (e.currency !== "fufu-hundredths")
      throw new Error("芙芙账户只能提交百分之一枚交易");
    const n = this.account(),
      o = pn(e),
      i = n.transactions.find((l) => l.idempotencyKey === e.idempotencyKey);
    if (i) return Gs(i, o, n.balanceHundredths);
    if (o.direction === "debit" && n.balanceHundredths < o.amount)
      return {
        committed: !1,
        duplicate: !1,
        insufficient: !0,
        balance: n.balanceHundredths,
      };
    const s =
      n.balanceHundredths + (o.direction === "credit" ? o.amount : -o.amount);
    if (!Number.isSafeInteger(s) || s < 0)
      throw new Error("芙芙余额超出安全整数范围");
    const a = {
      ...n,
      balanceHundredths: s,
      transactions: [...n.transactions, o],
    };
    return (
      this.write(a),
      {
        committed: !0,
        duplicate: !1,
        insufficient: !1,
        balance: a.balanceHundredths,
        transaction: o,
      }
    );
  }
  credit(e, n) {
    const o = this.account();
    return this.commitCurrencyTransaction({
      currency: "fufu-hundredths",
      direction: "credit",
      amount: e,
      reason: (n == null ? void 0 : n.reason) ?? "legacy-fufu-credit",
      referenceId: (n == null ? void 0 : n.referenceId) ?? "legacy-api",
      idempotencyKey:
        (n == null ? void 0 : n.idempotencyKey) ??
        `legacy-credit:${o.transactions.length}:${e}`,
    }).balance;
  }
  spend(e, n) {
    const o = this.account(),
      i = this.commitCurrencyTransaction({
        currency: "fufu-hundredths",
        direction: "debit",
        amount: e,
        reason: (n == null ? void 0 : n.reason) ?? "legacy-fufu-spend",
        referenceId: (n == null ? void 0 : n.referenceId) ?? "legacy-api",
        idempotencyKey:
          (n == null ? void 0 : n.idempotencyKey) ??
          `legacy-spend:${o.transactions.length}:${e}`,
      });
    return i.committed || i.duplicate;
  }
  allocateRunId(e) {
    const n = this.account(),
      o = n.runSequence + 1;
    if (!Number.isSafeInteger(o)) throw new Error("命运编号已超出安全整数范围");
    return (this.write({ ...n, runSequence: o }), `${o}:${e}`);
  }
  allocateOperationId(e, n = "") {
    if (!e.trim()) throw new Error("芙芙交易操作类型不能为空");
    const o = this.account(),
      i = o.operationSequence + 1;
    if (!Number.isSafeInteger(i))
      throw new Error("芙芙交易编号已超出安全整数范围");
    return (
      this.write({ ...o, operationSequence: i }),
      `${e}:${i}${n ? `:${n}` : ""}`
    );
  }
  settle(e, n) {
    const o = `ending:${e}`;
    return this.commitCurrencyTransaction({
      currency: "fufu-hundredths",
      direction: "credit",
      amount: n,
      reason: "ending-combat-power-reward",
      referenceId: e,
      idempotencyKey: o,
    }).balance;
  }
  isSettled(e) {
    return this.transactions().some((n) => n.idempotencyKey === `ending:${e}`);
  }
}
const Jo = {
    fire: "火",
    dark: "暗",
    wood: "木",
    life: "生命",
    light: "光",
    strength: "力量",
    ice: "冰",
    water: "水",
    wind: "风",
    lightning: "雷",
    earth: "土",
    speed: "速度",
    defense: "防御",
    spirit: "精神",
    death: "死亡",
    destruction: "毁灭",
    poison: "毒",
    time: "时间",
    space: "空间",
    metal: "锐金",
    solar: "太阳",
    moon: "月亮",
    haze: "岚",
  },
  rt = Object.keys(Jo),
  ql = {
    ...Object.fromEntries(Object.entries(Jo).map(([t, e]) => [e, t])),
    金: "metal",
    锐金: "metal",
    力: "strength",
    力量: "strength",
    防御: "defense",
    速度: "speed",
    精神: "spirit",
    月: "moon",
    月亮: "moon",
    太阳: "solar",
    雷: "lightning",
    风: "wind",
    光: "light",
    暗: "dark",
    木: "wood",
    水: "water",
    土: "earth",
    火: "fire",
    冰: "ice",
    时间: "time",
    空间: "space",
    生命: "life",
    死亡: "death",
    毁灭: "destruction",
    毒: "poison",
  };
function st(t) {
  const e = (t ?? "").trim();
  if (!e) return { id: "", qualifier: null };
  if (rt.includes(e)) return { id: e, qualifier: null };
  const n = /^完整(.+)法则$/.exec(e);
  if (n) return { id: bt(n[1]), qualifier: 4 };
  const o = /^(.+)法则雏形$/.exec(e);
  if (o) return { id: bt(o[1]), qualifier: 3 };
  const i = /^(?:极致|极)(.+?)(?:属性)?$/.exec(e);
  if (i) return { id: bt(i[1]), qualifier: 2 };
  const s = /^(.+)属性$/.exec(e);
  return s ? { id: bt(s[1]), qualifier: 1 } : { id: bt(e), qualifier: null };
}
function bt(t) {
  const e = (t ?? "").trim();
  return e ? (rt.includes(e) ? e : (ql[e] ?? e)) : "";
}
const Gl = {
  "formal:domain.black-dragon": "黑龙领域",
  "formal:domain.life": "生命领域",
  "formal:domain.light": "光明领域",
  "formal:domain.azure-flame": "青炎领域",
  "formal:domain.red-lotus": "红莲领域",
  "formal:domain.dark-dragon": "暗龙领域",
  "formal:domain.fire-phoenix": "火凤凰领域",
  "formal:domain.ice-god": "冰神领域",
  "formal:domain.ocean": "苍海领域",
  "formal:domain.heart-flame": "心炎领域",
  "formal:domain.storm": "风暴领域",
  "formal:domain.light-dragon": "光龙领域",
  "formal:domain.exorcising-thunder": "辟邪领域",
  "formal:domain.gold-dragon": "金龙领域",
  "formal:domain.angel": "天使领域",
  "formal:domain.dark-angel": "暗天使领域",
  "formal:domain.gravity": "重力领域",
  "formal:domain.thunder-wolf": "雷狼领域",
  "formal:domain.ice-dark": "冰暗领域",
  "formal:domain.sea-god": "海神领域",
  "formal:domain.ice-snow": "冰雪领域",
  "formal:domain.azure-dragon": "青龙领域",
  "formal:domain.nothingness": "虚无领域",
  "formal:domain.black-tortoise": "玄武领域",
  "formal:domain.healing": "治愈领域",
  "formal:domain.ice-emperor": "冰帝领域",
  "formal:domain.purple-thunder": "紫雷领域",
  "formal:domain.fire-plume": "火凤领域",
  "formal:domain.phoenix": "凤凰领域",
  "formal:domain.stardust": "星尘领域",
  "formal:domain.divine-thunder": "神雷领域",
  "formal:domain.wind-dragon": "风龙领域",
  "formal:domain.night": "黑夜领域",
  "formal:domain.comet": "彗星领域",
  "formal:domain.golden-thunder": "金雷领域",
  "formal:domain.snow-maiden": "雪女领域",
  "formal:domain.purple-heaven": "紫霄领域",
  "formal:domain.limitless-void": "无量空处",
};
function lt(t, e) {
  var n;
  return Math.max(
    0,
    Math.min(
      4,
      Math.trunc(((n = t.elementProgress) == null ? void 0 : n[e]) ?? 0),
    ),
  );
}
function _n(t, e, n) {
  const o = Math.max(0, Math.min(4, Math.trunc(n)));
  (t.elementProgress ?? (t.elementProgress = {}),
    (t.elementProgress[e] = o),
    o > 0 && !t.attributes.includes(e) && t.attributes.push(e));
  const i = `formal:element.${e}.`;
  t.traits = t.traits.filter((a) => !a.startsWith(i));
  const s =
    o === 2
      ? "ultimate"
      : o === 3
        ? "law-seed"
        : o === 4
          ? "complete-law"
          : null;
  return (s && t.traits.push(`${i}${s}`), o);
}
function Ao(t, e, n = 1) {
  return _n(t, e, lt(t, e) + n);
}
function rn(t, e, n) {
  const o = Math.max(0, Math.min(4, Math.trunc(n)));
  return (lt(t, e) < o && _n(t, e, o), lt(t, e));
}
function Hl(t, e) {
  (t.elementProgress && delete t.elementProgress[e],
    (t.attributes = t.attributes.filter((o) => o !== e)));
  const n = `formal:element.${e}.`;
  ((t.traits = t.traits.filter((o) => !o.startsWith(n))),
    delete t.flags[`formal:attribute-progress:${e}`]);
}
function Yl(t, e) {
  const n = Jo[t] ?? t;
  return e >= 4
    ? `完整${n}法则`
    : e === 3
      ? `${n}法则雏形`
      : e === 2
        ? `极致${n}属性`
        : `${n}属性`;
}
function Kl(t) {
  return Object.entries(t.elementProgress ?? {})
    .filter((e) => e[1] >= 1 && e[1] <= 4)
    .map(([e, n]) => Yl(e, n));
}
function Jl(t) {
  const e = "formal:domain.martial-name.";
  return Gl[t] ?? (t.startsWith(e) ? t.slice(e.length) : t);
}
function Js(t) {
  const e = new Map();
  for (const n of t.domains) e.set(n, (e.get(n) ?? 0) + 1);
  return [...e].map(([n, o]) => `${Jl(n)}${o > 1 ? ` ×${o}` : ""}`);
}
const Ql = "identity:opportunity-per-time-skip",
  Xl = "identity:suppress-encounter-before-12",
  Ro = "formal:opportunity-draws",
  Zl = "formal:suppress-encounter";
function es(t) {
  const e = Number(t ?? 0);
  return Number.isFinite(e) ? Math.max(0, Math.trunc(e)) : 0;
}
function eu(t) {
  const e = es(t.flags[Ql]);
  e !== 0 && (t.flags[Ro] = es(t.flags[Ro]) + e);
}
function Rg(t) {
  t.flags[Zl] = t.flags[Xl] === !0 && t.age < 12;
}
const Qs = "formal:element-draws",
  Xs = "formal:domain-draws",
  _g = "formal:affinity",
  Gt = "douluo2:npc.huo",
  Tg = "13e60019-9d99-411a-8739-65d3d1eb13bd",
  tu = "159312b5-6754-4153-b654-3643dd8eb5e9",
  nu = "f2abac93-6b26-4e3e-aa92-a168db671577",
  Zs = { element: Qs, domain: Xs, opportunity: Ro };
function ou(t, e) {
  return Math.max(0, Math.trunc(Number(t.flags[Zs[e]] ?? 0)));
}
function xg(t, e) {
  const n = ou(t, e);
  return n < 1 ? !1 : ((t.flags[Zs[e]] = n - 1), !0);
}
const ts = [
    "锐金",
    "生命",
    "火",
    "空间",
    "月亮",
    "岚",
    "毁灭",
    "时间",
    "水",
    "暗",
    "冰",
    "太阳",
    "木",
    "雷",
    "土",
    "死亡",
    "光",
    "毒",
  ],
  iu = {
    [tu]: [
      "2d6e1a",
      "8fdaa8",
      "a43dba",
      "bd3a0a",
      "1a5fcf",
      "db0e17",
      "7bf1d9",
      "b38e88",
      "901eb5",
      "eacf93",
      "f72d90",
      "07ff8c",
      "26ec27",
      "467ba2",
      "bd6845",
      "10e65b",
      "f68d9d",
      "067703",
    ],
    "d93d6db0-2081-4361-a713-84d776c6460e": [
      "22c627",
      "e5d029",
      "e3b77f",
      "1a466a",
      "274486",
      "e11cc1",
      "9d77f6",
      "6b52de",
      "fd4205",
      "9e21a1",
      "cf674b",
      "4a4216",
      "05d47f",
      "091fb1",
      "d5e53b",
      "bd37da",
      "4703e3",
      "bc0883",
    ],
    "ecb4b15c-72f9-4978-b796-c495b0a1c2d1": [
      "ab5162",
      "9c3e2b",
      "03ffc4",
      "3503ed",
      "6c12f5",
      "466e18",
      "bbccfc",
      "49c34e",
      "58d982",
      "b331ee",
      "d3a142",
      "048bf9",
      "14ab8c",
      "9542ca",
      "a075fa",
      "843dd3",
      "09e243",
      "c94562",
    ],
    "78d5f5b3-71b6-400d-850b-74a68c37d0da": [
      "2e1af6",
      "54bf79",
      "6ac516",
      "bbe05f",
      "bda2b0",
      "6c4bcf",
      "9de576",
      "22b57e",
      "38ceb2",
      "1294b5",
      "1d42c2",
      "78a9ec",
      "dc238d",
      "083af3",
      "281025",
      "260f51",
      "ee4627",
      "b50543",
    ],
    "e7fbd142-8003-4845-bc7b-796bf5352bdf": [
      "db5d56",
      "bfa16d",
      "ccbc4d",
      "11e494",
      "609b16",
      "664c70",
      "33acc7",
      "5d4302",
      "e028df",
      "0b3be9",
      "8ab163",
      "36bdd9",
      "330265",
      "6788e9",
      "c2d536",
      "8772b0",
      "af8f09",
      "833bee",
    ],
    "f0d8a41d-f45a-4dea-bf3c-32e65938d12d": [
      "72160a",
      "26ebb6",
      "d7615e",
      "5c7a17",
      "340006",
      "8c0af5",
      "d07720",
      "20fdfd",
      "944b11",
      "46aef2",
      "7a191f",
      "6450cb",
      "cb4750",
      "8a2313",
      "b73934",
      "b3e406",
      "f55c23",
      "936f93",
    ],
    "91179d70-fbad-4f84-999f-8ba2e60db4b9": [
      "c70c60",
      "975088",
      "5f6c08",
      "967f29",
      "482891",
      "6d97a9",
      "3e1403",
      "6b9635",
      "4d3939",
      "1bf69f",
      "6c841a",
      "cd74db",
      "65cf1f",
      "dd47f8",
      "55bf3c",
      "dde098",
      "f2bcd2",
      "a5b640",
    ],
    "b372b169-4ebe-4021-9443-a144ed9d9504": [
      "a1f3e5",
      "1f88cb",
      "f60497",
      "78e6cc",
      "5823a3",
      "1b9fc7",
      "acce95",
      "48e988",
      "908cb5",
      "a732ad",
      "2db9ff",
      "997914",
      "5290fd",
      "c3f34f",
      "afbe82",
      "c6b3e7",
      "932e1a",
      "3d9f22",
    ],
    [nu]: [
      "b40176",
      "3c8d55",
      "d4025a",
      "e1418c",
      "357201",
      "3fc6af",
      "f16385",
      "bea013",
      "a935ef",
      "408f78",
      "18afd8",
      "681776",
      "15670e",
      "de2fe2",
      "5f2c4d",
      "d5d414",
      "acb5c0",
      "591576",
    ],
  },
  ea = new Map();
for (const [t, e] of Object.entries(iu)) {
  if (e.length !== ts.length) throw new Error(`正式元素池映射数量错误 ${t}`);
  e.forEach((n, o) => ea.set(`${t}:${n}`, ts[o]));
}
function Og(t, e) {
  return ea.get(`${t}:${e}`);
}
function Mg(t, e) {
  Ao(t, bt(e) || e);
}
const ta = {
  "986eaf": "蓝银领域",
  "9cb38d": "杀神领域",
  432690: "天使领域",
  "0f4ac7": "罗刹领域",
  "65cef5": "修罗领域",
  "87cefb": "生命领域",
  "3ae437": "毁灭领域",
  "591bfc": "雷神领域",
  d653e0: "火神领域",
  "338a2d": "海神领域",
  "9ffd7c": "风神领域",
  b45c4a: "冰神领域",
  ed7959: "龙神领域",
  "7fd9b6": "剑神领域",
  acd00d: "刀神领域",
  aa547b: "弓神领域",
  b93cb3: "战神领域",
  "4c86b7": "蝶神领域",
  e5b07e: "斗神领域",
  eaa6c2: "月神领域",
  "3c6471": "日神领域",
  c98606: "死神领域",
  "6645a0": "人神领域",
  "58718a": "魔神领域",
  a6b561: "恶魔领域",
  "3ab59d": "力神领域",
  "0a8fdf": "速神领域",
  298048: "凤凰领域",
};
function Bg(t) {
  const e = ta[t];
  if (e)
    return {
      requirements: [{ type: "lacksDomain", value: e }],
      effects: [{ type: "addDomain", domainId: e }],
    };
}
function Ng(t) {
  return Object.values(ta).some((e) => !t.domains.includes(e));
}
function Dg(t) {
  return (
    t.traits.includes("domain-prototype") ||
    t.flags.pendingDomainPrototype === !0
  );
}
function Fg(t) {
  ((t.traits = t.traits.filter((e) => e !== "domain-prototype")),
    delete t.flags.pendingDomainPrototype);
}
const su = ["data-state-revision"],
  au = { class: "status-primary" },
  ru = { class: "status-route", "data-status": "route" },
  lu = { class: "status-period", "data-status": "age" },
  uu = { "data-status": "progression" },
  du = { class: "status-power", "data-status": "power" },
  cu = { class: "power-popover" },
  fu = { class: "status-wallets" },
  pu = { class: "status-identity" },
  mu = { key: 0, class: "status-affinity", "data-status": "npc-affinity" },
  hu = de({
    __name: "StatusSummary",
    props: { character: {}, fufuHundredths: {}, stateRevision: {} },
    emits: ["wallet"],
    setup(t, { emit: e }) {
      const n = t,
        o = e;
      function i() {
        return (n.stateRevision, n.character);
      }
      const s = _(() =>
          i().flags.routeSelected
            ? i().route === "human"
              ? "人类"
              : "魂兽"
            : "待抽取",
        ),
        a = _(() => {
          var k;
          return i().route === "beast"
            ? `${(((k = i().beast) == null ? void 0 : k.chronologicalAge) ?? 0).toLocaleString()}岁`
            : `${i().age.toLocaleString()}岁`;
        }),
        l = _(() =>
          i().flags.routeSelected
            ? i().route === "beast"
              ? `${i().beastYears.toLocaleString()} 年修为`
              : `${i().level} 级`
            : "待确定",
        ),
        u = _(() => Ln.breakdown(i())),
        d = _(() => {
          var k;
          return _t(((k = i().wallet) == null ? void 0 : k.copper) ?? 0);
        }),
        p = {
          "douluo2:identity.commoner": "平民",
          "douluo2:identity.free-soul-master": "自由魂师",
          "douluo2:identity.knight": "骑士",
          "douluo2:identity.noble": "贵族",
          "douluo2:identity.royal": "皇室",
          "douluo2:identity.have-nothing": "一无所有之人",
          "douluo2:identity.sect-disciple": "宗门子弟",
          "douluo2:identity.child-of-god": "神之子",
          "douluo2:identity.god-reincarnation": "神明转世",
          "douluo2:identity.reborn": "重生者",
          "douluo2:identity.traveler": "穿越者",
          "douluo2:identity.child-of-fortune": "气运之子",
        },
        f = _(() => {
          var k;
          return (
            p[((k = i().background) == null ? void 0 : k.identityId) ?? ""] ??
            "身份待定"
          );
        }),
        I = _(() => {
          var k, g;
          return (g = (k = i().npcRelationships) == null ? void 0 : k[Gt]) ==
            null
            ? void 0
            : g.affinity;
        });
      return (k, g) => (
        P(),
        E(
          "section",
          {
            class: "status-overview",
            "data-testid": "status-overview",
            "data-state-revision": k.stateRevision,
            "aria-label": "角色状态摘要",
          },
          [
            r("div", au, [
              r("span", ru, [
                g[2] || (g[2] = r("small", null, "路线", -1)),
                r("strong", null, v(s.value), 1),
              ]),
              r("span", lu, [
                g[3] || (g[3] = r("small", null, "年龄", -1)),
                r("strong", null, v(a.value), 1),
              ]),
              r("span", uu, [
                r(
                  "small",
                  null,
                  v(k.character.route === "beast" ? "修为" : "等级"),
                  1,
                ),
                r("strong", null, v(l.value), 1),
              ]),
              r("details", du, [
                r("summary", null, [
                  g[4] || (g[4] = r("small", null, "战力", -1)),
                  r("strong", null, v(u.value.total.toLocaleString()), 1),
                ]),
                r("div", cu, [
                  r("span", null, [
                    g[5] || (g[5] = r("small", null, "基础", -1)),
                    r("b", null, v(u.value.base.toLocaleString()), 1),
                  ]),
                  (P(!0),
                  E(
                    me,
                    null,
                    Ye(
                      u.value.components,
                      (w, b) => (
                        P(),
                        E("span", { key: b }, [
                          r("small", null, v(b), 1),
                          r("b", null, v(w.toLocaleString()), 1),
                        ])
                      ),
                    ),
                    128,
                  )),
                ]),
              ]),
            ]),
            r("div", fu, [
              r(
                "button",
                {
                  type: "button",
                  "data-wallet": "session",
                  onClick: g[0] || (g[0] = (w) => o("wallet")),
                },
                [
                  g[6] || (g[6] = r("small", null, "本局灵币", -1)),
                  r("strong", null, v(d.value), 1),
                ],
              ),
              r(
                "button",
                {
                  type: "button",
                  "data-wallet": "fufu",
                  onClick: g[1] || (g[1] = (w) => o("wallet")),
                },
                [
                  g[7] || (g[7] = r("small", null, "跨局芙芙", -1)),
                  r("strong", null, v(V(xt)(k.fufuHundredths)) + " 枚", 1),
                ],
              ),
              r("span", pu, [
                g[8] || (g[8] = r("small", null, "身份", -1)),
                r("strong", null, v(f.value), 1),
              ]),
              I.value !== void 0
                ? (P(),
                  E("span", mu, [
                    g[9] || (g[9] = r("small", null, "NPC好感度", -1)),
                    r("strong", null, "小霍娘 " + v(I.value) + "点", 1),
                  ]))
                : O("", !0),
            ]),
          ],
          8,
          su,
        )
      );
    },
  }),
  gu = {
    class: "game-action-dock",
    "data-testid": "game-action-dock",
    "aria-label": "命运推进",
  },
  vu = ["disabled"],
  bu = { class: "dock-secondary-controls" },
  yu = ["disabled"],
  wu = ["disabled", "aria-pressed"],
  Su = ["disabled"],
  Iu = ["disabled"],
  ku = { class: "undo-dialog-actions" },
  $u = ["disabled"],
  Pu = de({
    __name: "GameActionDock",
    props: {
      busy: { type: Boolean },
      finished: { type: Boolean },
      resultCommitted: { type: Boolean },
      canAdvance: { type: Boolean },
      hasUndo: { type: Boolean },
      autoActive: { type: Boolean },
      canLeave: { type: Boolean },
    },
    emits: ["manual", "auto", "fast", "leave", "undo", "advance", "ending"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T(!1),
        s = T(null),
        a = T(null);
      function l() {
        n.busy ||
          n.finished ||
          ((i.value = !0),
          Be(() => {
            var f;
            return (f = a.value) == null ? void 0 : f.focus();
          }));
      }
      function u() {
        ((i.value = !1),
          Be(() => {
            var f;
            return (f = s.value) == null ? void 0 : f.focus();
          }));
      }
      function d() {
        ((i.value = !1),
          o("fast"),
          Be(() => {
            var f;
            return (f = s.value) == null ? void 0 : f.focus();
          }));
      }
      function p(f) {
        f.key === "Escape" && (f.preventDefault(), u());
      }
      return (
        Ee(
          () => n.busy || n.finished,
          (f) => {
            f && (i.value = !1);
          },
        ),
        (f, I) => (
          P(),
          E(
            me,
            null,
            [
              r("nav", gu, [
                f.resultCommitted && !f.busy
                  ? (P(),
                    E(
                      me,
                      { key: 0 },
                      [
                        f.hasUndo
                          ? (P(),
                            E(
                              "button",
                              {
                                key: 0,
                                class: "dock-secondary",
                                type: "button",
                                "data-action": "undo",
                                onClick: I[0] || (I[0] = (k) => o("undo")),
                              },
                              "撤销 / 重抽",
                            ))
                          : O("", !0),
                        f.finished
                          ? (P(),
                            E(
                              "button",
                              {
                                key: 1,
                                class: "dock-primary",
                                type: "button",
                                "data-action": "ending",
                                onClick: I[1] || (I[1] = (k) => o("ending")),
                              },
                              "查看结局",
                            ))
                          : (P(),
                            E(
                              "button",
                              {
                                key: 2,
                                class: "dock-primary",
                                type: "button",
                                disabled: !f.canAdvance,
                                "data-action": "advance",
                                onClick: I[2] || (I[2] = (k) => o("advance")),
                              },
                              "继续",
                              8,
                              vu,
                            )),
                        f.autoActive && !f.finished
                          ? (P(),
                            E(
                              "button",
                              {
                                key: 3,
                                class: "dock-quiet",
                                type: "button",
                                "data-action": "auto",
                                onClick: I[3] || (I[3] = (k) => o("auto")),
                              },
                              "暂停自动",
                            ))
                          : O("", !0),
                      ],
                      64,
                    ))
                  : (P(),
                    E(
                      me,
                      { key: 1 },
                      [
                        r("div", bu, [
                          f.canLeave
                            ? (P(),
                              E(
                                "button",
                                {
                                  key: 0,
                                  class: "dock-quiet",
                                  type: "button",
                                  disabled: f.busy || f.finished,
                                  "data-action": "leave",
                                  onClick: I[4] || (I[4] = (k) => o("leave")),
                                },
                                "离开商店",
                                8,
                                yu,
                              ))
                            : O("", !0),
                          r(
                            "button",
                            {
                              class: dt([
                                "dock-quiet",
                                { active: f.autoActive },
                              ]),
                              type: "button",
                              disabled: f.finished || (f.busy && !f.autoActive),
                              "aria-pressed": f.autoActive,
                              "data-action": "auto",
                              onClick: I[5] || (I[5] = (k) => o("auto")),
                            },
                            v(f.autoActive ? "停止自动" : "自动"),
                            11,
                            wu,
                          ),
                          r(
                            "button",
                            {
                              ref_key: "fastButton",
                              ref: s,
                              class: "dock-quiet",
                              type: "button",
                              disabled: f.busy || f.finished,
                              "data-action": "fast",
                              onClick: l,
                            },
                            "极速",
                            8,
                            Su,
                          ),
                        ]),
                        r(
                          "button",
                          {
                            class: "dock-primary",
                            type: "button",
                            disabled: f.busy || f.finished,
                            "data-action": "spin",
                            onClick: I[6] || (I[6] = (k) => o("manual")),
                          },
                          v(
                            f.finished
                              ? "命运落幕"
                              : f.busy
                                ? "命运转动中"
                                : "转动命运",
                          ),
                          9,
                          Iu,
                        ),
                      ],
                      64,
                    )),
              ]),
              i.value
                ? (P(),
                  E(
                    "div",
                    {
                      key: 0,
                      class: "undo-dialog-overlay",
                      role: "presentation",
                      onClick: tt(u, ["self"]),
                    },
                    [
                      r(
                        "section",
                        {
                          class: "undo-dialog",
                          role: "dialog",
                          "aria-modal": "true",
                          "aria-labelledby": "fast-confirmation-title",
                          onKeydown: p,
                        },
                        [
                          I[7] ||
                            (I[7] = r(
                              "h2",
                              { id: "fast-confirmation-title" },
                              "确认极速结算？",
                              -1,
                            )),
                          I[8] ||
                            (I[8] = r(
                              "p",
                              null,
                              "系统会连续推进到本段命运结束，期间仍保持相同随机种子与规则顺序。",
                              -1,
                            )),
                          r("div", ku, [
                            r(
                              "button",
                              {
                                ref_key: "cancelButton",
                                ref: a,
                                class: "undo-dialog-secondary",
                                type: "button",
                                onClick: u,
                              },
                              "取消",
                              512,
                            ),
                            r(
                              "button",
                              {
                                class: "undo-dialog-primary",
                                type: "button",
                                disabled: f.busy || f.finished,
                                onClick: d,
                              },
                              "继续极速结算",
                              8,
                              $u,
                            ),
                          ]),
                        ],
                        32,
                      ),
                    ],
                  ))
                : O("", !0),
            ],
            64,
          )
        )
      );
    },
  });
function Cu(t = 0, e = 0, n = 14) {
  return parseFloat((Math.random() * (e - t) + t).toFixed(n));
}
function Oe(t = 0) {
  return (t * Math.PI) / 180;
}
function Eu(t, e, n) {
  return e < n ? e <= t && t < n : e <= t || t < n;
}
function Lu(t, e, n, o) {
  (o.save(), (o.font = `1px ${e}`));
  const i = o.measureText(t).width;
  return (o.restore(), n / i);
}
function Au(t = { x: 0, y: 0 }, e, n, o) {
  return (t.x - e) ** 2 + (t.y - n) ** 2 <= o ** 2;
}
function fo(t = { x: 0, y: 0 }, e = {}, n = 1) {
  const o = e.getBoundingClientRect();
  return { x: (t.x - o.left) * n, y: (t.y - o.top) * n };
}
function Ru(t, e, n, o) {
  const i = t - n,
    s = e - o;
  let a = Math.atan2(-s, -i);
  return ((a *= 180 / Math.PI), a < 0 && (a += 360), a);
}
function _u(t = 0, e = 0) {
  const n = t + e;
  let o;
  return (
    n > 0 ? (o = n % 360) : (o = 360 + (n % 360)),
    o === 360 && (o = 0),
    o
  );
}
function Tu(t = 0, e = 0) {
  const n = 180 - e;
  return 180 - _u(t, n);
}
function xu(t = 0, e = 0, n = 1) {
  let o = ((t % 360) + e) % 360;
  return (
    (o = Ou(o)),
    (o = (n === 1 ? 360 - o : 360 + o) % 360),
    (o *= n),
    t + o
  );
}
function Tn(t) {
  return typeof t == "object" && !Array.isArray(t) && t !== null;
}
function we(t) {
  return typeof t == "number" && !Number.isNaN(t);
}
function ie({
  val: t,
  isValid: e,
  errorMessage: n,
  defaultValue: o,
  action: i = null,
}) {
  if (e) return i ? i() : t;
  if (t === void 0) return o;
  throw new Error(n);
}
function Ou(t = 0) {
  return Number(t.toFixed(9));
}
function Mu(t) {
  return Math.sin((t * Math.PI) / 2);
}
function Bu(t = {}, e = {}) {
  if (window.ResizeObserver) {
    const n = new ResizeObserver(() => {
      e({ redraw: !0 });
    });
    return (
      n.observe(t),
      {
        stop: () => {
          (n.unobserve(t), n.disconnect());
        },
      }
    );
  }
  return (
    window.addEventListener("resize", e),
    {
      stop: () => {
        window.removeEventListener("resize", e);
      },
    }
  );
}
const Qe = -90,
  _o = 500,
  ns = 250,
  mn = Object.freeze({ left: "left", right: "right", center: "center" }),
  G = Object.freeze({
    wheel: {
      borderColor: "#000",
      borderWidth: 1,
      debug: !1,
      image: null,
      isInteractive: !0,
      itemBackgroundColors: ["#fff"],
      itemLabelAlign: mn.right,
      itemLabelBaselineOffset: 0,
      itemLabelColors: ["#000"],
      itemLabelFont: "sans-serif",
      itemLabelFontSizeMax: _o,
      itemLabelRadius: 0.85,
      itemLabelRadiusMax: 0.2,
      itemLabelRotation: 0,
      itemLabelStrokeColor: "#fff",
      itemLabelStrokeWidth: 0,
      items: [],
      lineColor: "#000",
      lineWidth: 1,
      pixelRatio: 0,
      radius: 0.95,
      rotation: 0,
      rotationResistance: -35,
      rotationSpeedMax: 300,
      offset: { x: 0, y: 0 },
      onCurrentIndexChange: null,
      onRest: null,
      onSpin: null,
      overlayImage: null,
      pointerAngle: 0,
    },
    item: {
      backgroundColor: null,
      image: null,
      imageOpacity: 1,
      imageRadius: 0.5,
      imageRotation: 0,
      imageScale: 1,
      label: "",
      labelColor: null,
      value: null,
      weight: 1,
    },
  }),
  At = Object.freeze({
    pointerLineColor: "#ff00ff",
    labelBoundingBoxColor: "#ff00ff",
    labelRadiusColor: "#00ff00",
    dragPointHue: 300,
  });
function Nu(t = {}) {
  (Fu(t),
    (t._handler_onResize = Bu(t._canvasContainer, ({ redraw: n = !0 }) => {
      (t.resize(), n && t.draw(performance.now()));
    })));
  const e = () => {
    ((t._mediaQueryList = window.matchMedia(
      `(resolution: ${window.devicePixelRatio}dppx)`,
    )),
      t._mediaQueryList.addEventListener(
        "change",
        t._handler_onDevicePixelRatioChange,
        { once: !0 },
      ));
  };
  ((t._handler_onDevicePixelRatioChange = () => {
    (t.resize(), e());
  }),
    e());
}
function Du(t = {}) {
  const e = t.canvas;
  ("PointerEvent" in window
    ? (e.removeEventListener("pointerdown", t._handler_onPointerDown),
      e.removeEventListener(
        "pointermove",
        t._handler_onPointerMoveRefreshCursor,
      ))
    : (e.removeEventListener("touchstart", t._handler_onTouchStart),
      e.removeEventListener("mousedown", t._handler_onMouseDown),
      e.removeEventListener("mousemove", t._handler_onMouseMoveRefreshCursor)),
    t._handler_onResize.stop(),
    t._mediaQueryList.removeEventListener(
      "change",
      t._handler_onDevicePixelRatioChange,
    ));
}
function Fu(t = {}) {
  const e = t.canvas;
  ((t._handler_onPointerMoveRefreshCursor = (n = {}) => {
    const o = { x: n.clientX, y: n.clientY };
    ((t._isCursorOverWheel = t.wheelHitTest(o)), t.refreshCursor());
  }),
    (t._handler_onMouseMoveRefreshCursor = (n = {}) => {
      const o = { x: n.clientX, y: n.clientY };
      ((t._isCursorOverWheel = t.wheelHitTest(o)), t.refreshCursor());
    }),
    (t._handler_onPointerDown = (n = {}) => {
      const o = { x: n.clientX, y: n.clientY };
      if (!t.isInteractive || !t.wheelHitTest(o)) return;
      (n.preventDefault(),
        t.dragStart(o),
        e.setPointerCapture(n.pointerId),
        e.addEventListener("pointermove", i),
        e.addEventListener("pointerup", s),
        e.addEventListener("pointercancel", s),
        e.addEventListener("pointerout", s));
      function i(a = {}) {
        (a.preventDefault(), t.dragMove({ x: a.clientX, y: a.clientY }));
      }
      function s(a = {}) {
        (a.preventDefault(),
          e.releasePointerCapture(a.pointerId),
          e.removeEventListener("pointermove", i),
          e.removeEventListener("pointerup", s),
          e.removeEventListener("pointercancel", s),
          e.removeEventListener("pointerout", s),
          t.dragEnd());
      }
    }),
    (t._handler_onMouseDown = (n = {}) => {
      const o = { x: n.clientX, y: n.clientY };
      if (!t.isInteractive || !t.wheelHitTest(o)) return;
      (t.dragStart(o),
        document.addEventListener("mousemove", i),
        document.addEventListener("mouseup", s));
      function i(a = {}) {
        (a.preventDefault(), t.dragMove({ x: a.clientX, y: a.clientY }));
      }
      function s(a = {}) {
        (a.preventDefault(),
          document.removeEventListener("mousemove", i),
          document.removeEventListener("mouseup", s),
          t.dragEnd());
      }
    }),
    (t._handler_onTouchStart = (n = {}) => {
      const o = {
        x: n.targetTouches[0].clientX,
        y: n.targetTouches[0].clientY,
      };
      if (!t.isInteractive || !t.wheelHitTest(o)) return;
      (n.preventDefault(),
        t.dragStart(o),
        e.addEventListener("touchmove", i),
        e.addEventListener("touchend", s),
        e.addEventListener("touchcancel", s));
      function i(a = {}) {
        (a.preventDefault(),
          t.dragMove({
            x: a.targetTouches[0].clientX,
            y: a.targetTouches[0].clientY,
          }));
      }
      function s(a = {}) {
        (a.preventDefault(),
          e.removeEventListener("touchmove", i),
          e.removeEventListener("touchend", s),
          e.removeEventListener("touchcancel", s),
          t.dragEnd());
      }
    }),
    "PointerEvent" in window
      ? (e.addEventListener("pointerdown", t._handler_onPointerDown),
        e.addEventListener(
          "pointermove",
          t._handler_onPointerMoveRefreshCursor,
        ))
      : (e.addEventListener("touchstart", t._handler_onTouchStart),
        e.addEventListener("mousedown", t._handler_onMouseDown),
        e.addEventListener("mousemove", t._handler_onMouseMoveRefreshCursor)));
}
class Vu {
  constructor(e, n = {}) {
    if (!Tn(e)) throw new Error("wheel must be an instance of Wheel");
    if (!Tn(n) && n !== null)
      throw new Error("props must be an Object or null");
    this._wheel = e;
    for (const o of Object.keys(G.item)) this["_" + o] = G.item[o];
    n ? this.init(n) : this.init(G.item);
  }
  init(e = {}) {
    ((this.backgroundColor = e.backgroundColor),
      (this.image = e.image),
      (this.imageOpacity = e.imageOpacity),
      (this.imageRadius = e.imageRadius),
      (this.imageRotation = e.imageRotation),
      (this.imageScale = e.imageScale),
      (this.label = e.label),
      (this.labelColor = e.labelColor),
      (this.value = e.value),
      (this.weight = e.weight));
  }
  get backgroundColor() {
    return this._backgroundColor;
  }
  set backgroundColor(e) {
    (typeof e == "string"
      ? (this._backgroundColor = e)
      : (this._backgroundColor = G.item.backgroundColor),
      this._wheel.refresh());
  }
  get image() {
    return this._image;
  }
  set image(e) {
    (e instanceof HTMLImageElement
      ? (this._image = e)
      : (this._image = G.item.image),
      this._wheel.refresh());
  }
  get imageOpacity() {
    return this._imageOpacity;
  }
  set imageOpacity(e) {
    (typeof e == "number"
      ? (this._imageOpacity = e)
      : (this._imageOpacity = G.item.imageOpacity),
      this._wheel.refresh());
  }
  get imageRadius() {
    return this._imageRadius;
  }
  set imageRadius(e) {
    (typeof e == "number"
      ? (this._imageRadius = e)
      : (this._imageRadius = G.item.imageRadius),
      this._wheel.refresh());
  }
  get imageRotation() {
    return this._imageRotation;
  }
  set imageRotation(e) {
    (typeof e == "number"
      ? (this._imageRotation = e)
      : (this._imageRotation = G.item.imageRotation),
      this._wheel.refresh());
  }
  get imageScale() {
    return this._imageScale;
  }
  set imageScale(e) {
    (typeof e == "number"
      ? (this._imageScale = e)
      : (this._imageScale = G.item.imageScale),
      this._wheel.refresh());
  }
  get label() {
    return this._label;
  }
  set label(e) {
    (typeof e == "string" ? (this._label = e) : (this._label = G.item.label),
      this._wheel.refresh());
  }
  get labelColor() {
    return this._labelColor;
  }
  set labelColor(e) {
    (typeof e == "string"
      ? (this._labelColor = e)
      : (this._labelColor = G.item.labelColor),
      this._wheel.refresh());
  }
  get value() {
    return this._value;
  }
  set value(e) {
    e !== void 0 ? (this._value = e) : (this._value = G.item.value);
  }
  get weight() {
    return this._weight;
  }
  set weight(e) {
    typeof e == "number" ? (this._weight = e) : (this._weight = G.item.weight);
  }
  getIndex() {
    const e = this._wheel.items.findIndex((n) => n === this);
    if (e === -1) throw new Error("Item not found in parent Wheel");
    return e;
  }
  getCenterAngle() {
    const e = this._wheel.getItemAngles()[this.getIndex()];
    return e.start + (e.end - e.start) / 2;
  }
  getStartAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].start;
  }
  getEndAngle() {
    return this._wheel.getItemAngles()[this.getIndex()].end;
  }
  getRandomAngle() {
    return Cu(this.getStartAngle(), this.getEndAngle());
  }
}
class ju {
  constructor(e, n = {}) {
    if (!(e instanceof Element))
      throw new Error("container must be an instance of Element");
    if (!Tn(n) && n !== null)
      throw new Error("props must be an Object or null");
    ((this._frameRequestId = null),
      (this._rotationSpeed = 0),
      (this._rotationDirection = 1),
      (this._spinToTimeEnd = null),
      (this._lastSpinFrameTime = null),
      (this._isCursorOverWheel = !1),
      this.add(e));
    for (const o of Object.keys(G.wheel)) this["_" + o] = G.wheel[o];
    n ? this.init(n) : this.init(G.wheel);
  }
  init(e = {}) {
    ((this._isInitialising = !0),
      (this.borderColor = e.borderColor),
      (this.borderWidth = e.borderWidth),
      (this.debug = e.debug),
      (this.image = e.image),
      (this.isInteractive = e.isInteractive),
      (this.itemBackgroundColors = e.itemBackgroundColors),
      (this.itemLabelAlign = e.itemLabelAlign),
      (this.itemLabelBaselineOffset = e.itemLabelBaselineOffset),
      (this.itemLabelColors = e.itemLabelColors),
      (this.itemLabelFont = e.itemLabelFont),
      (this.itemLabelFontSizeMax = e.itemLabelFontSizeMax),
      (this.itemLabelRadius = e.itemLabelRadius),
      (this.itemLabelRadiusMax = e.itemLabelRadiusMax),
      (this.itemLabelRotation = e.itemLabelRotation),
      (this.itemLabelStrokeColor = e.itemLabelStrokeColor),
      (this.itemLabelStrokeWidth = e.itemLabelStrokeWidth),
      (this.items = e.items),
      (this.lineColor = e.lineColor),
      (this.lineWidth = e.lineWidth),
      (this.pixelRatio = e.pixelRatio),
      (this.rotationSpeedMax = e.rotationSpeedMax),
      (this.radius = e.radius),
      (this.rotation = e.rotation),
      (this.rotationResistance = e.rotationResistance),
      (this.offset = e.offset),
      (this.onCurrentIndexChange = e.onCurrentIndexChange),
      (this.onRest = e.onRest),
      (this.onSpin = e.onSpin),
      (this.overlayImage = e.overlayImage),
      (this.pointerAngle = e.pointerAngle));
  }
  add(e) {
    ((this._canvasContainer = e),
      (this.canvas = document.createElement("canvas")),
      (this.canvas.style.display = "block"),
      (this._context = this.canvas.getContext("2d")),
      this._canvasContainer.append(this.canvas),
      Nu(this),
      this._isInitialising === !1 && this.resize());
  }
  remove() {
    this.canvas !== null &&
      (this._frameRequestId !== null &&
        window.cancelAnimationFrame(this._frameRequestId),
      Du(this),
      this._canvasContainer.removeChild(this.canvas),
      (this._canvasContainer = null),
      (this.canvas = null),
      (this._context = null));
  }
  resize() {
    if (this.canvas === null) return;
    ((this.canvas.style.width = this._canvasContainer.clientWidth + "px"),
      (this.canvas.style.height = this._canvasContainer.clientHeight + "px"));
    const [e, n] = [
      this._canvasContainer.clientWidth * this.getActualPixelRatio(),
      this._canvasContainer.clientHeight * this.getActualPixelRatio(),
    ];
    ((this.canvas.width = e), (this.canvas.height = n));
    const o = Math.min(e, n),
      i = { w: o - o * this._offset.x, h: o - o * this._offset.y },
      s = Math.min(e / i.w, n / i.h);
    ((this._size = Math.max(i.w * s, i.h * s)),
      (this._center = {
        x: e / 2 + e * this._offset.x,
        y: n / 2 + n * this._offset.y,
      }),
      (this._actualRadius = (this._size / 2) * this.radius),
      (this._itemLabelFontSize = this.itemLabelFontSizeMax * (this._size / _o)),
      (this._labelMaxWidth =
        this._actualRadius * (this.itemLabelRadius - this.itemLabelRadiusMax)),
      this.itemLabelAlign === "center" && (this._labelMaxWidth *= 2));
    for (const a of this._items)
      this._itemLabelFontSize = Math.min(
        this._itemLabelFontSize,
        Lu(a.label, this.itemLabelFont, this._labelMaxWidth, this._context),
      );
    this.refresh();
  }
  draw(e = 0) {
    if (
      ((this._frameRequestId = null),
      this._context === null || this.canvas === null)
    )
      return;
    const n = this._context;
    (n.clearRect(0, 0, this.canvas.width, this.canvas.height),
      this.animateRotation(e));
    const o = this.getItemAngles(this._rotation),
      i = this.getScaledNumber(this._borderWidth);
    ((n.textBaseline = "middle"),
      (n.textAlign = this.itemLabelAlign),
      (n.font = this._itemLabelFontSize + "px " + this.itemLabelFont));
    for (const [s, a] of o.entries()) {
      const l = this._items[s],
        u = new Path2D();
      (u.moveTo(this._center.x, this._center.y),
        u.arc(
          this._center.x,
          this._center.y,
          this._actualRadius - i / 2,
          Oe(a.start + Qe),
          Oe(a.end + Qe),
        ),
        (l.path = u));
    }
    (this.drawItemBackgrounds(n, o),
      this.drawItemImages(n, o),
      this.drawItemLines(n, o),
      this.drawItemLabels(n, o),
      this.drawBorder(n),
      this.drawImage(n, this._image, !1),
      this.drawImage(n, this._overlayImage, !0),
      this.drawDebugPointerLine(n),
      (this._isInitialising = !1));
  }
  drawItemBackgrounds(e, n = []) {
    for (const [o, i] of n.entries()) {
      const s = this._items[o];
      ((e.fillStyle =
        s.backgroundColor ??
        this._itemBackgroundColors[o % this._itemBackgroundColors.length]),
        e.fill(s.path));
    }
  }
  drawItemImages(e, n = []) {
    for (const [o, i] of n.entries()) {
      const s = this._items[o];
      if (s.image === null) continue;
      (e.save(), e.clip(s.path));
      const a = i.start + (i.end - i.start) / 2;
      (e.translate(
        this._center.x +
          Math.cos(Oe(a + Qe)) * (this._actualRadius * s.imageRadius),
        this._center.y +
          Math.sin(Oe(a + Qe)) * (this._actualRadius * s.imageRadius),
      ),
        e.rotate(Oe(a + s.imageRotation)),
        (e.globalAlpha = s.imageOpacity));
      const l = (this._size / 500) * s.image.width * s.imageScale,
        u = (this._size / 500) * s.image.height * s.imageScale,
        d = -l / 2,
        p = -u / 2;
      (e.drawImage(s.image, d, p, l, u), e.restore());
    }
  }
  drawImage(e, n, o = !1) {
    if (n === null) return;
    (e.translate(this._center.x, this._center.y),
      o || e.rotate(Oe(this._rotation)));
    const i = o ? this._size : this._size * this.radius,
      s = -(i / 2);
    (e.drawImage(n, s, s, i, i), e.resetTransform());
  }
  drawDebugPointerLine(e) {
    this.debug &&
      (e.translate(this._center.x, this._center.y),
      e.rotate(Oe(this._pointerAngle + Qe)),
      e.beginPath(),
      e.moveTo(0, 0),
      e.lineTo(this._actualRadius * 2, 0),
      (e.strokeStyle = At.pointerLineColor),
      (e.lineWidth = this.getScaledNumber(2)),
      e.stroke(),
      e.resetTransform());
  }
  drawBorder(e) {
    if (this._borderWidth <= 0) return;
    const n = this.getScaledNumber(this._borderWidth),
      o = this._borderColor || "transparent";
    if (
      (e.beginPath(),
      (e.strokeStyle = o),
      (e.lineWidth = n),
      e.arc(
        this._center.x,
        this._center.y,
        this._actualRadius - n / 2,
        0,
        2 * Math.PI,
      ),
      e.stroke(),
      this.debug)
    ) {
      const i = this.getScaledNumber(1);
      (e.beginPath(),
        (e.strokeStyle = e.strokeStyle = At.labelRadiusColor),
        (e.lineWidth = i),
        e.arc(
          this._center.x,
          this._center.y,
          this._actualRadius * this.itemLabelRadius,
          0,
          2 * Math.PI,
        ),
        e.stroke(),
        e.beginPath(),
        (e.strokeStyle = e.strokeStyle = At.labelRadiusColor),
        (e.lineWidth = i),
        e.arc(
          this._center.x,
          this._center.y,
          this._actualRadius * this.itemLabelRadiusMax,
          0,
          2 * Math.PI,
        ),
        e.stroke());
    }
  }
  drawItemLines(e, n = []) {
    if (this._lineWidth <= 0) return;
    const o = this.getScaledNumber(this._lineWidth),
      i = this.getScaledNumber(this._borderWidth);
    e.translate(this._center.x, this._center.y);
    for (const s of n)
      (e.rotate(Oe(s.start + Qe)),
        e.beginPath(),
        e.moveTo(0, 0),
        e.lineTo(this._actualRadius - i, 0),
        (e.strokeStyle = this.lineColor),
        (e.lineWidth = o),
        e.stroke(),
        e.rotate(-Oe(s.start + Qe)));
    e.resetTransform();
  }
  drawItemLabels(e, n = []) {
    const o = this._itemLabelFontSize * -this.itemLabelBaselineOffset,
      i = this.getScaledNumber(1),
      s = this.getScaledNumber(this._itemLabelStrokeWidth * 2);
    for (const [a, l] of n.entries()) {
      const u = this._items[a],
        d =
          u.labelColor ||
          this._itemLabelColors[a % this._itemLabelColors.length] ||
          "transparent";
      if (u.label.trim() === "" || d === "transparent") continue;
      (e.save(), e.clip(u.path));
      const p = l.start + (l.end - l.start) / 2;
      if (
        (e.translate(
          this._center.x +
            Math.cos(Oe(p + Qe)) * (this._actualRadius * this.itemLabelRadius),
          this._center.y +
            Math.sin(Oe(p + Qe)) * (this._actualRadius * this.itemLabelRadius),
        ),
        e.rotate(Oe(p + Qe)),
        e.rotate(Oe(this.itemLabelRotation)),
        this.debug)
      ) {
        e.save();
        let f = 0;
        (this.itemLabelAlign === "left"
          ? (f = this._labelMaxWidth)
          : this.itemLabelAlign === "center" && (f = this._labelMaxWidth / 2),
          e.beginPath(),
          e.moveTo(f, 0),
          e.lineTo(-this._labelMaxWidth + f, 0),
          (e.strokeStyle = At.labelBoundingBoxColor),
          (e.lineWidth = i),
          e.stroke(),
          e.strokeRect(
            f,
            -this._itemLabelFontSize / 2,
            -this._labelMaxWidth,
            this._itemLabelFontSize,
          ),
          e.restore());
      }
      if (
        (this._itemLabelStrokeWidth > 0 &&
          ((e.lineWidth = s),
          (e.strokeStyle = this._itemLabelStrokeColor),
          (e.lineJoin = "round"),
          e.strokeText(u.label, 0, o)),
        (e.fillStyle = d),
        e.fillText(u.label, 0, o),
        this.debug)
      ) {
        const f = this.getScaledNumber(2);
        (e.beginPath(),
          e.arc(0, 0, f, 0, 2 * Math.PI),
          (e.fillStyle = At.labelRadiusColor),
          e.fill());
      }
      e.restore();
    }
  }
  drawDebugDragPoints(e) {
    var s;
    if (!this.debug || !((s = this._dragEvents) != null && s.length)) return;
    const n = [...this._dragEvents].reverse(),
      o = this.getScaledNumber(0.5),
      i = this.getScaledNumber(4);
    for (const [a, l] of n.entries()) {
      const u = (a / this._dragEvents.length) * 100;
      (e.beginPath(),
        e.arc(l.x, l.y, i, 0, 2 * Math.PI),
        (e.fillStyle = `hsl(${At.dragPointHue},100%,${u}%)`),
        (e.strokeStyle = "#000"),
        (e.lineWidth = o),
        e.fill(),
        e.stroke());
    }
  }
  animateRotation(e = 0) {
    if (this._spinToTimeEnd !== null) {
      if (e >= this._spinToTimeEnd) {
        ((this.rotation = this._spinToEndRotation),
          (this._spinToTimeEnd = null),
          this.raiseEvent_onRest());
        return;
      }
      const n = this._spinToTimeEnd - this._spinToTimeStart;
      let o = (e - this._spinToTimeStart) / n;
      o = o < 0 ? 0 : o;
      const i = this._spinToEndRotation - this._spinToStartRotation;
      ((this.rotation =
        this._spinToStartRotation + i * this._spinToEasingFunction(o)),
        this.refresh());
      return;
    }
    if (this._lastSpinFrameTime !== null) {
      const n = e - this._lastSpinFrameTime;
      (n > 0 &&
        ((this.rotation += ((n / 1e3) * this._rotationSpeed) % 360),
        (this._rotationSpeed = this.getRotationSpeedPlusDrag(n)),
        this._rotationSpeed === 0
          ? (this.raiseEvent_onRest(), (this._lastSpinFrameTime = null))
          : (this._lastSpinFrameTime = e)),
        this.refresh());
      return;
    }
  }
  getRotationSpeedPlusDrag(e = 0) {
    const n =
      this._rotationSpeed +
      this.rotationResistance * (e / 1e3) * this._rotationDirection;
    return (this._rotationDirection === 1 && n < 0) ||
      (this._rotationDirection === -1 && n >= 0)
      ? 0
      : n;
  }
  spin(e = 0) {
    if (!we(e)) throw new Error("rotationSpeed must be a number");
    ((this._dragEvents = []), this.beginSpin(e, "spin"));
  }
  spinTo(e = 0, n = 0, o = null) {
    if (!we(e)) throw new Error("Error: rotation must be a number");
    if (!we(n)) throw new Error("Error: duration must be a number");
    (this.stop(),
      (this._dragEvents = []),
      this.animate(e, n, o),
      this.raiseEvent_onSpin({
        method: "spinto",
        targetRotation: e,
        duration: n,
      }));
  }
  spinToItem(e = 0, n = 0, o = !0, i = 1, s = 1, a = null) {
    (this.stop(), (this._dragEvents = []));
    const l = o
      ? this.items[e].getCenterAngle()
      : this.items[e].getRandomAngle();
    let u = xu(this.rotation, l - this._pointerAngle, s);
    ((u += i * 360 * s),
      this.animate(u, n, a),
      this.raiseEvent_onSpin({
        method: "spintoitem",
        targetItemIndex: e,
        targetRotation: u,
        duration: n,
      }));
  }
  animate(e, n, o) {
    ((this._spinToStartRotation = this.rotation),
      (this._spinToEndRotation = e),
      (this._spinToTimeStart = performance.now()),
      (this._spinToTimeEnd = this._spinToTimeStart + n),
      (this._spinToEasingFunction = o || Mu),
      this.refresh());
  }
  stop() {
    ((this._spinToTimeEnd = null),
      (this._rotationSpeed = 0),
      (this._lastSpinFrameTime = null));
  }
  getScaledNumber(e) {
    return (e / _o) * this._size;
  }
  getActualPixelRatio() {
    return this._pixelRatio !== 0 ? this._pixelRatio : window.devicePixelRatio;
  }
  wheelHitTest(e = { x: 0, y: 0 }) {
    if (this.canvas === null) return !1;
    const n = fo(e, this.canvas, this.getActualPixelRatio());
    return Au(n, this._center.x, this._center.y, this._actualRadius);
  }
  refreshCursor() {
    if (this.canvas !== null) {
      if (this.isInteractive) {
        if (this.isDragging) {
          this.canvas.style.cursor = "grabbing";
          return;
        }
        if (this._isCursorOverWheel) {
          this.canvas.style.cursor = "grab";
          return;
        }
      }
      this.canvas.style.cursor = "";
    }
  }
  getAngleFromCenter(e = { x: 0, y: 0 }) {
    return (Ru(this._center.x, this._center.y, e.x, e.y) + 90) % 360;
  }
  getCurrentIndex() {
    return this._currentIndex;
  }
  refreshCurrentIndex(e = []) {
    this._items.length === 0 && (this._currentIndex = -1);
    for (const [n, o] of e.entries())
      if (Eu(this._pointerAngle, o.start % 360, o.end % 360)) {
        if (this._currentIndex === n) break;
        ((this._currentIndex = n),
          this._isInitialising || this.raiseEvent_onCurrentIndexChange());
        break;
      }
  }
  getItemAngles(e = 0) {
    let n = 0;
    for (const l of this.items) n += l.weight;
    const o = 360 / n;
    let i,
      s = e;
    const a = [];
    for (const l of this._items)
      ((i = l.weight * o), a.push({ start: s, end: s + i }), (s += i));
    return (
      this._items.length > 1 && (a[a.length - 1].end = a[0].start + 360),
      a
    );
  }
  refresh() {
    this._frameRequestId === null &&
      (this._frameRequestId = window.requestAnimationFrame((e) =>
        this.draw(e),
      ));
  }
  limitSpeed(e = 0, n = 0) {
    const o = Math.min(e, n);
    return Math.max(o, -n);
  }
  beginSpin(e = 0, n = "") {
    (this.stop(),
      (this._rotationSpeed = this.limitSpeed(e, this._rotationSpeedMax)),
      (this._lastSpinFrameTime = performance.now()),
      (this._rotationDirection = this._rotationSpeed >= 0 ? 1 : -1),
      this._rotationSpeed !== 0 &&
        this.raiseEvent_onSpin({
          method: n,
          rotationSpeed: this._rotationSpeed,
          rotationResistance: this._rotationResistance,
        }),
      this.refresh());
  }
  refreshAriaLabel() {
    if (this.canvas === null) return;
    this.canvas.setAttribute("role", "img");
    const e =
      this.items.length >= 2
        ? ` The wheel has ${this.items.length} slices.`
        : "";
    this.canvas.setAttribute(
      "aria-label",
      "An image of a spinning prize wheel." + e,
    );
  }
  get borderColor() {
    return this._borderColor;
  }
  set borderColor(e) {
    ((this._borderColor = ie({
      val: e,
      isValid: typeof e == "string",
      errorMessage: "Wheel.borderColor must be a string",
      defaultValue: G.wheel.borderColor,
    })),
      this.refresh());
  }
  get borderWidth() {
    return this._borderWidth;
  }
  set borderWidth(e) {
    ((this._borderWidth = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.borderWidth must be a number",
      defaultValue: G.wheel.borderWidth,
    })),
      this.refresh());
  }
  get debug() {
    return this._debug;
  }
  set debug(e) {
    ((this._debug = ie({
      val: e,
      isValid: typeof e == "boolean",
      errorMessage: "Wheel.debug must be a boolean",
      defaultValue: G.wheel.debug,
    })),
      this.refresh());
  }
  get image() {
    return this._image;
  }
  set image(e) {
    ((this._image = ie({
      val: e,
      isValid: e instanceof HTMLImageElement || e === null,
      errorMessage: "Wheel.image must be a HTMLImageElement or null",
      defaultValue: G.wheel.image,
    })),
      this.refresh());
  }
  get isInteractive() {
    return this._isInteractive;
  }
  set isInteractive(e) {
    ((this._isInteractive = ie({
      val: e,
      isValid: typeof e == "boolean",
      errorMessage: "Wheel.isInteractive must be a boolean",
      defaultValue: G.wheel.isInteractive,
    })),
      this.refreshCursor());
  }
  get itemBackgroundColors() {
    return this._itemBackgroundColors;
  }
  set itemBackgroundColors(e) {
    ((this._itemBackgroundColors = ie({
      val: e,
      isValid: Array.isArray(e),
      errorMessage: "Wheel.itemBackgroundColors must be an array",
      defaultValue: G.wheel.itemBackgroundColors,
    })),
      this.refresh());
  }
  get itemLabelAlign() {
    return this._itemLabelAlign;
  }
  set itemLabelAlign(e) {
    ((this._itemLabelAlign = ie({
      val: e,
      isValid:
        typeof e == "string" &&
        (e === mn.left || e === mn.right || e === mn.center),
      errorMessage: "Wheel.itemLabelAlign must be one of Constants.AlignText",
      defaultValue: G.wheel.itemLabelAlign,
    })),
      this.resize());
  }
  get itemLabelBaselineOffset() {
    return this._itemLabelBaselineOffset;
  }
  set itemLabelBaselineOffset(e) {
    ((this._itemLabelBaselineOffset = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.itemLabelBaselineOffset must be a number",
      defaultValue: G.wheel.itemLabelBaselineOffset,
    })),
      this.resize());
  }
  get itemLabelColors() {
    return this._itemLabelColors;
  }
  set itemLabelColors(e) {
    ((this._itemLabelColors = ie({
      val: e,
      isValid: Array.isArray(e),
      errorMessage: "Wheel.itemLabelColors must be an array",
      defaultValue: G.wheel.itemLabelColors,
    })),
      this.refresh());
  }
  get itemLabelFont() {
    return this._itemLabelFont;
  }
  set itemLabelFont(e) {
    ((this._itemLabelFont = ie({
      val: e,
      isValid: typeof e == "string",
      errorMessage: "Wheel.itemLabelFont must be a string",
      defaultValue: G.wheel.itemLabelFont,
    })),
      this.resize());
  }
  get itemLabelFontSizeMax() {
    return this._itemLabelFontSizeMax;
  }
  set itemLabelFontSizeMax(e) {
    ((this._itemLabelFontSizeMax = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.itemLabelFontSizeMax must be a number",
      defaultValue: G.wheel.itemLabelFontSizeMax,
    })),
      this.resize());
  }
  get itemLabelRadius() {
    return this._itemLabelRadius;
  }
  set itemLabelRadius(e) {
    ((this._itemLabelRadius = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.itemLabelRadius must be a number",
      defaultValue: G.wheel.itemLabelRadius,
    })),
      this.resize());
  }
  get itemLabelRadiusMax() {
    return this._itemLabelRadiusMax;
  }
  set itemLabelRadiusMax(e) {
    ((this._itemLabelRadiusMax = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.itemLabelRadiusMax must be a number",
      defaultValue: G.wheel.itemLabelRadiusMax,
    })),
      this.resize());
  }
  get itemLabelRotation() {
    return this._itemLabelRotation;
  }
  set itemLabelRotation(e) {
    ((this._itemLabelRotation = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.itemLabelRotation must be a number",
      defaultValue: G.wheel.itemLabelRotation,
    })),
      this.refresh());
  }
  get itemLabelStrokeColor() {
    return this._itemLabelStrokeColor;
  }
  set itemLabelStrokeColor(e) {
    ((this._itemLabelStrokeColor = ie({
      val: e,
      isValid: typeof e == "string",
      errorMessage: "Wheel.itemLabelStrokeColor must be a string",
      defaultValue: G.wheel.itemLabelStrokeColor,
    })),
      this.refresh());
  }
  get itemLabelStrokeWidth() {
    return this._itemLabelStrokeWidth;
  }
  set itemLabelStrokeWidth(e) {
    ((this._itemLabelStrokeWidth = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.itemLabelStrokeWidth must be a number",
      defaultValue: G.wheel.itemLabelStrokeWidth,
    })),
      this.refresh());
  }
  get items() {
    return this._items;
  }
  set items(e) {
    ((this._items = ie({
      val: e,
      isValid: Array.isArray(e),
      errorMessage: "Wheel.items must be an array of Items",
      defaultValue: G.wheel.items,
      action: () => {
        const n = [];
        for (const o of e) n.push(new Vu(this, o));
        return n;
      },
    })),
      this.refreshAriaLabel(),
      this.refreshCurrentIndex(this.getItemAngles(this._rotation)),
      this.resize());
  }
  get lineColor() {
    return this._lineColor;
  }
  set lineColor(e) {
    ((this._lineColor = ie({
      val: e,
      isValid: typeof e == "string",
      errorMessage: "Wheel.lineColor must be a string",
      defaultValue: G.wheel.lineColor,
    })),
      this.refresh());
  }
  get lineWidth() {
    return this._lineWidth;
  }
  set lineWidth(e) {
    ((this._lineWidth = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.lineWidth must be a number",
      defaultValue: G.wheel.lineWidth,
    })),
      this.refresh());
  }
  get offset() {
    return this._offset;
  }
  set offset(e) {
    ((this._offset = ie({
      val: e,
      isValid: Tn(e),
      errorMessage: "Wheel.offset must be an object",
      defaultValue: G.wheel.offset,
    })),
      this.resize());
  }
  get onCurrentIndexChange() {
    return this._onCurrentIndexChange;
  }
  set onCurrentIndexChange(e) {
    this._onCurrentIndexChange = ie({
      val: e,
      isValid: typeof e == "function" || e === null,
      errorMessage: "Wheel.onCurrentIndexChange must be a function or null",
      defaultValue: G.wheel.onCurrentIndexChange,
    });
  }
  get onRest() {
    return this._onRest;
  }
  set onRest(e) {
    this._onRest = ie({
      val: e,
      isValid: typeof e == "function" || e === null,
      errorMessage: "Wheel.onRest must be a function or null",
      defaultValue: G.wheel.onRest,
    });
  }
  get onSpin() {
    return this._onSpin;
  }
  set onSpin(e) {
    this._onSpin = ie({
      val: e,
      isValid: typeof e == "function" || e === null,
      errorMessage: "Wheel.onSpin must be a function or null",
      defaultValue: G.wheel.onSpin,
    });
  }
  get overlayImage() {
    return this._overlayImage;
  }
  set overlayImage(e) {
    ((this._overlayImage = ie({
      val: e,
      isValid: e instanceof HTMLImageElement || e === null,
      errorMessage: "Wheel.overlayImage must be a HTMLImageElement or null",
      defaultValue: G.wheel.overlayImage,
    })),
      this.refresh());
  }
  get pixelRatio() {
    return this._pixelRatio;
  }
  set pixelRatio(e) {
    ((this._pixelRatio = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.pixelRatio must be a number",
      defaultValue: G.wheel.pixelRatio,
    })),
      (this._dragEvents = []),
      this.resize());
  }
  get pointerAngle() {
    return this._pointerAngle;
  }
  set pointerAngle(e) {
    ((this._pointerAngle = ie({
      val: e,
      isValid: we(e) && e >= 0,
      errorMessage: "Wheel.pointerAngle must be a number between 0 and 360",
      defaultValue: G.wheel.pointerAngle,
      action: () => e % 360,
    })),
      this.debug && this.refresh());
  }
  get radius() {
    return this._radius;
  }
  set radius(e) {
    ((this._radius = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.radius must be a number",
      defaultValue: G.wheel.radius,
    })),
      this.resize());
  }
  get rotation() {
    return this._rotation;
  }
  set rotation(e) {
    ((this._rotation = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.rotation must be a number",
      defaultValue: G.wheel.rotation,
    })),
      this.refreshCurrentIndex(this.getItemAngles(this._rotation)),
      this.refresh());
  }
  get rotationResistance() {
    return this._rotationResistance;
  }
  set rotationResistance(e) {
    this._rotationResistance = ie({
      val: e,
      isValid: we(e),
      errorMessage: "Wheel.rotationResistance must be a number",
      defaultValue: G.wheel.rotationResistance,
    });
  }
  get rotationSpeed() {
    return this._rotationSpeed;
  }
  get rotationSpeedMax() {
    return this._rotationSpeedMax;
  }
  set rotationSpeedMax(e) {
    this._rotationSpeedMax = ie({
      val: e,
      isValid: we(e) && e >= 0,
      errorMessage: "Wheel.rotationSpeedMax must be a number >= 0",
      defaultValue: G.wheel.rotationSpeedMax,
    });
  }
  dragStart(e = { x: 0, y: 0 }) {
    if (this.canvas === null) return;
    const n = fo(e, this.canvas, this.getActualPixelRatio());
    ((this.isDragging = !0),
      this.stop(),
      (this._dragEvents = [
        { distance: 0, x: n.x, y: n.y, now: performance.now() },
      ]),
      this.refreshCursor());
  }
  dragMove(e = { x: 0, y: 0 }) {
    if (this.canvas === null) return;
    const n = fo(e, this.canvas, this.getActualPixelRatio()),
      o = this.getAngleFromCenter(n),
      i = this._dragEvents[0],
      s = this.getAngleFromCenter(i),
      a = Tu(s, o);
    (this._dragEvents.unshift({
      distance: a,
      x: n.x,
      y: n.y,
      now: performance.now(),
    }),
      this.debug && this._dragEvents.length >= 40 && this._dragEvents.pop(),
      (this.rotation += a));
  }
  dragEnd() {
    this.isDragging = !1;
    let e = 0;
    const n = performance.now();
    for (const [o, i] of this._dragEvents.entries()) {
      if (!this.isDragEventTooOld(n, i)) {
        e += i.distance;
        continue;
      }
      ((this._dragEvents.length = o), this.debug && this.refresh());
      break;
    }
    (this.refreshCursor(),
      e !== 0 && this.beginSpin(e * (1e3 / ns), "interact"));
  }
  isDragEventTooOld(e = 0, n = {}) {
    return e - n.now > ns;
  }
  raiseEvent_onCurrentIndexChange(e = {}) {
    var n;
    (n = this.onCurrentIndexChange) == null ||
      n.call(this, {
        type: "currentIndexChange",
        currentIndex: this._currentIndex,
        ...e,
      });
  }
  raiseEvent_onRest(e = {}) {
    var n;
    (n = this.onRest) == null ||
      n.call(this, {
        type: "rest",
        currentIndex: this._currentIndex,
        rotation: this._rotation,
        ...e,
      });
  }
  raiseEvent_onSpin(e = {}) {
    var n;
    (n = this.onSpin) == null || n.call(this, { type: "spin", ...e });
  }
}
function zu(t, e) {
  if (e < 0 || e >= t.length) return null;
  const n = t.reduce((s, a) => s + a.weight, 0);
  return !Number.isFinite(n) || n <= 0
    ? null
    : (360 -
        ((t.slice(0, e).reduce((s, a) => s + a.weight, 0) + t[e].weight / 2) /
          n) *
          360) %
        360;
}
const Uu = ["aria-busy"],
  Qo = de({
    __name: "GameWheel",
    props: {
      items: {},
      wheelKey: { default: "" },
      targetIndex: {},
      restingIndex: { default: null },
      duration: {},
      disabled: { type: Boolean, default: !1 },
      itemToggleEnabled: { type: Boolean, default: !1 },
      reducedMotion: { type: Boolean, default: !1 },
    },
    emits: ["spinStart", "tick", "spinEnd", "itemToggle"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T();
      let s, a;
      const l = [
        "#234e70",
        "#8c3f4d",
        "#2f6b62",
        "#76507b",
        "#93633e",
        "#355b3e",
        "#315b72",
        "#984b32",
        "#4f4f78",
        "#607744",
        "#8a6a2f",
        "#375f62",
      ];
      function u() {
        return n.items.map((b, c) => ({
          label: A(b.label),
          value: b.id,
          weight: b.weight,
          backgroundColor: b.excluded
            ? "#252a2d"
            : (b.backgroundColor ?? l[c % l.length]),
          labelColor: b.excluded ? "#737b80" : (b.textColor ?? "#fff"),
        }));
      }
      function d() {
        return {
          items: u(),
          isInteractive: !1,
          rotationResistance: -35,
          itemLabelFont: "system-ui, sans-serif",
          itemLabelFontSizeMax: 18,
          itemLabelRadius: 0.84,
          itemLabelRadiusMax: 0.22,
          lineColor: "#e5edf2",
          lineWidth: 1,
          borderColor: "#d4dde3",
          borderWidth: 2,
          onCurrentIndexChange: (b) => o("tick", b.currentIndex),
          onSpin: () => o("spinStart"),
          onRest: (b) => o("spinEnd", b.currentIndex),
        };
      }
      function p() {
        i.value &&
          (s == null || s.remove(),
          (s = new ju(i.value, d())),
          n.targetIndex === null &&
            n.restingIndex !== null &&
            f(n.restingIndex),
          s.resize());
      }
      function f(b) {
        const c = zu(n.items, b);
        s && c !== null && (s.rotation = c);
      }
      function I() {
        if (!s) {
          p();
          return;
        }
        const b = s.rotation;
        ((s.items = u()), (s.rotation = b), s.resize());
      }
      function k() {
        s == null || s.resize();
      }
      function g(b) {
        !s ||
          b < 0 ||
          b >= n.items.length ||
          s.spinToItem(b, n.reducedMotion ? 1 : n.duration, !0, 3, 1);
      }
      function w(b) {
        if (!n.itemToggleEnabled || n.disabled || !s || n.items.length < 2)
          return;
        const L = b.currentTarget.getBoundingClientRect(),
          m = b.clientX - L.left - L.width / 2,
          h = b.clientY - L.top - L.height / 2,
          $ = Math.hypot(m, h);
        if ($ < 42 || $ > Math.min(L.width, L.height) * 0.48) return;
        const te =
            ((((Math.atan2(h, m) * 180) / Math.PI + 90 + 360) % 360) -
              s.rotation +
              360) %
            360,
          ne = n.items.reduce((R, C) => R + C.weight, 0);
        let ue = 0;
        for (let R = 0; R < n.items.length; R += 1)
          if (((ue += (n.items[R].weight / ne) * 360), te < ue)) {
            o("itemToggle", R);
            break;
          }
      }
      return (
        Qt(() => {
          (p(),
            (a = k),
            window.addEventListener("resize", a),
            window.addEventListener("orientationchange", a),
            document.addEventListener("visibilitychange", k));
        }),
        zn(() => {
          (s == null || s.remove(),
            window.removeEventListener("resize", a),
            window.removeEventListener("orientationchange", a),
            document.removeEventListener("visibilitychange", k));
        }),
        Ee(
          [() => n.wheelKey, () => n.items],
          ([b], [c]) => {
            b !== c ? p() : I();
          },
          { deep: !0 },
        ),
        Ee(
          () => n.targetIndex,
          (b) => {
            b !== null && g(b);
          },
        ),
        Ee(
          () => n.restingIndex,
          (b) => {
            n.targetIndex === null && b !== null && f(b);
          },
        ),
        (b, c) => (
          P(),
          E(
            "div",
            {
              class: dt([
                "wheel-shell",
                { selectable: b.itemToggleEnabled && !b.disabled },
              ]),
              "aria-busy": b.targetIndex !== null,
              onClick: w,
            },
            [
              r(
                "div",
                { ref_key: "host", ref: i, class: "wheel-canvas" },
                null,
                512,
              ),
              c[0] ||
                (c[0] = r(
                  "div",
                  { class: "wheel-pointer", "aria-hidden": "true" },
                  null,
                  -1,
                )),
              c[1] || (c[1] = r("div", { class: "wheel-hub" }, "命运", -1)),
            ],
            10,
            Uu,
          )
        )
      );
    },
  });
function Wu(t) {
  const e = Array.from(t.trim());
  return e.length <= 14 ? e.join("") : `${e.slice(0, 14).join("")}…`;
}
function na(t, e = []) {
  const n = new Set(e);
  return t
    .filter((o) => o.enabled !== !1)
    .map((o) => ({
      id: o.id,
      label: o.wheelLabel || Wu(o.text),
      weight: o.weight,
      ...(n.has(o.id) ? { excluded: !0 } : {}),
    }));
}
const qu = { class: "drawer" },
  Gu = { class: "drawer-head" },
  Hu = { class: "drawer-section" },
  Yu = ["value"],
  Ku = ["value"],
  Ju = { class: "toggle-line" },
  Qu = ["checked"],
  Xu = { class: "drawer-section" },
  Zu = { class: "toggle-line" },
  ed = ["checked"],
  td = { class: "toggle-line" },
  nd = ["checked"],
  od = { class: "toggle-line" },
  id = ["checked"],
  sd = ["value"],
  ad = ["value"],
  rd = ["value"],
  ld = { class: "speech-diagnostics", "aria-live": "polite" },
  ud = ["disabled"],
  dd = { key: 0, class: "speech-message" },
  cd = { key: 1 },
  fd = { class: "drawer-section" },
  pd = de({
    __name: "SettingsDrawer",
    props: {
      open: { type: Boolean },
      settings: {},
      speechCapability: {},
      speechTesting: { type: Boolean },
      speechMessage: {},
    },
    emits: ["close", "update", "testSpeech", "openAntiResale"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = _(
          () =>
            ({
              "android-native": "Android 原生",
              web: "浏览器语音",
              unavailable: "不可用",
            })[n.speechCapability.platform],
        ),
        s = _(() =>
          n.speechCapability.initialized
            ? n.speechCapability.languageAvailable
              ? "可用"
              : "不可用"
            : "待检测",
        );
      function a(u, d) {
        o("update", { [u]: Number(d.target.value) });
      }
      function l(u, d) {
        o("update", { [u]: d.target.checked });
      }
      return (u, d) =>
        u.open
          ? (P(),
            E(
              "div",
              {
                key: 0,
                class: "drawer-overlay",
                onClick: d[12] || (d[12] = tt((p) => o("close"), ["self"])),
              },
              [
                r("aside", qu, [
                  r("div", Gu, [
                    d[13] || (d[13] = r("h2", null, "游戏设置", -1)),
                    r(
                      "button",
                      {
                        type: "button",
                        onClick: d[0] || (d[0] = (p) => o("close")),
                      },
                      "完成",
                    ),
                  ]),
                  r("section", Hu, [
                    d[17] || (d[17] = r("h3", null, "节奏与动画", -1)),
                    r("label", null, [
                      d[14] || (d[14] = _e(" 转盘动画时长 ")),
                      r(
                        "b",
                        null,
                        v((u.settings.wheelDuration / 1e3).toFixed(1)) + " 秒",
                        1,
                      ),
                      r(
                        "input",
                        {
                          type: "range",
                          min: "300",
                          max: "4000",
                          step: "100",
                          value: u.settings.wheelDuration,
                          onInput:
                            d[1] || (d[1] = (p) => a("wheelDuration", p)),
                        },
                        null,
                        40,
                        Yu,
                      ),
                    ]),
                    r("label", null, [
                      d[15] || (d[15] = _e(" 自动模式结果停顿 ")),
                      r(
                        "b",
                        null,
                        v((u.settings.resultHoldDuration / 1e3).toFixed(1)) +
                          " 秒",
                        1,
                      ),
                      r(
                        "input",
                        {
                          type: "range",
                          min: "0",
                          max: "3000",
                          step: "50",
                          value: u.settings.resultHoldDuration,
                          onInput:
                            d[2] || (d[2] = (p) => a("resultHoldDuration", p)),
                        },
                        null,
                        40,
                        Ku,
                      ),
                    ]),
                    r("label", Ju, [
                      d[16] || (d[16] = r("span", null, "减少动画", -1)),
                      r(
                        "input",
                        {
                          type: "checkbox",
                          checked: u.settings.reducedMotion,
                          onChange:
                            d[3] || (d[3] = (p) => l("reducedMotion", p)),
                        },
                        null,
                        40,
                        Qu,
                      ),
                    ]),
                  ]),
                  r("section", Xu, [
                    d[31] || (d[31] = r("h3", null, "声音与朗读", -1)),
                    r("label", Zu, [
                      d[18] || (d[18] = r("span", null, "机械刻度音", -1)),
                      r(
                        "input",
                        {
                          type: "checkbox",
                          checked: u.settings.tickSound,
                          onChange: d[4] || (d[4] = (p) => l("tickSound", p)),
                        },
                        null,
                        40,
                        ed,
                      ),
                    ]),
                    r("label", td, [
                      d[19] || (d[19] = r("span", null, "结果命中音", -1)),
                      r(
                        "input",
                        {
                          type: "checkbox",
                          checked: u.settings.hitSound,
                          onChange: d[5] || (d[5] = (p) => l("hitSound", p)),
                        },
                        null,
                        40,
                        nd,
                      ),
                    ]),
                    r("label", od, [
                      d[20] || (d[20] = r("span", null, "朗读抽取结果", -1)),
                      r(
                        "input",
                        {
                          type: "checkbox",
                          checked: u.settings.speech,
                          onChange: d[6] || (d[6] = (p) => l("speech", p)),
                        },
                        null,
                        40,
                        id,
                      ),
                    ]),
                    r("label", null, [
                      d[21] || (d[21] = _e(" 转盘刻度 / 旋转音量 ")),
                      r("b", null, v(u.settings.wheelVolume) + "%", 1),
                      r(
                        "input",
                        {
                          type: "range",
                          min: "0",
                          max: "100",
                          step: "1",
                          value: u.settings.wheelVolume,
                          onInput: d[7] || (d[7] = (p) => a("wheelVolume", p)),
                        },
                        null,
                        40,
                        sd,
                      ),
                    ]),
                    r("label", null, [
                      d[22] || (d[22] = _e(" 抽取结果提示音量 ")),
                      r("b", null, v(u.settings.resultVolume) + "%", 1),
                      r(
                        "input",
                        {
                          type: "range",
                          min: "0",
                          max: "100",
                          step: "1",
                          value: u.settings.resultVolume,
                          onInput: d[8] || (d[8] = (p) => a("resultVolume", p)),
                        },
                        null,
                        40,
                        ad,
                      ),
                    ]),
                    r("label", null, [
                      d[23] || (d[23] = _e(" 语音朗读音量 ")),
                      r("b", null, v(u.settings.speechVolume) + "%", 1),
                      r(
                        "input",
                        {
                          type: "range",
                          min: "0",
                          max: "100",
                          step: "1",
                          value: u.settings.speechVolume,
                          onInput: d[9] || (d[9] = (p) => a("speechVolume", p)),
                        },
                        null,
                        40,
                        rd,
                      ),
                    ]),
                    r("div", ld, [
                      r("p", null, [
                        d[24] || (d[24] = r("span", null, "朗读方式", -1)),
                        r("b", null, v(i.value), 1),
                      ]),
                      r("p", null, [
                        d[25] || (d[25] = r("span", null, "中文语音", -1)),
                        r("b", null, v(s.value), 1),
                      ]),
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: u.speechTesting,
                          onClick: d[10] || (d[10] = (p) => o("testSpeech")),
                        },
                        v(u.speechTesting ? "正在检测…" : "测试朗读"),
                        9,
                        ud,
                      ),
                      u.speechMessage
                        ? (P(), E("p", dd, v(V(A)(u.speechMessage)), 1))
                        : O("", !0),
                      u.speechCapability.initialized ||
                      u.speechCapability.reason
                        ? (P(),
                          E("details", cd, [
                            d[30] ||
                              (d[30] = r("summary", null, "语音诊断详情", -1)),
                            r("small", null, [
                              _e(" 平台：" + v(u.speechCapability.platform), 1),
                              d[26] || (d[26] = r("br", null, null, -1)),
                              _e(
                                " 语言：" +
                                  v(
                                    V(A)(
                                      u.speechCapability.selectedLanguage ??
                                        "未选择",
                                    ),
                                  ),
                                1,
                              ),
                              d[27] || (d[27] = r("br", null, null, -1)),
                              _e(
                                " Voice：" +
                                  v(
                                    V(A)(
                                      u.speechCapability.selectedVoice ??
                                        "系统默认",
                                    ),
                                  ),
                                1,
                              ),
                              d[28] || (d[28] = r("br", null, null, -1)),
                              _e(
                                " 引擎：" +
                                  v(
                                    V(A)(
                                      u.speechCapability.engineName ?? "未报告",
                                    ),
                                  ),
                                1,
                              ),
                              d[29] || (d[29] = r("br", null, null, -1)),
                              _e(
                                " 状态：" +
                                  v(V(A)(u.speechCapability.reason ?? "正常")),
                                1,
                              ),
                            ]),
                          ]))
                        : O("", !0),
                    ]),
                    d[32] ||
                      (d[32] = r(
                        "p",
                        { class: "drawer-note" },
                        "Android 应用优先使用系统原生语音，网页使用浏览器语音；不可用时会静默跳过，不影响抽取、随机种子或流程。",
                        -1,
                      )),
                  ]),
                  r("section", fd, [
                    d[34] || (d[34] = r("h3", null, "关于与声明", -1)),
                    r(
                      "button",
                      {
                        class: "settings-link-button",
                        type: "button",
                        onClick: d[11] || (d[11] = (p) => o("openAntiResale")),
                      },
                      d[33] ||
                        (d[33] = [
                          r("span", null, "防倒卖提醒", -1),
                          r("small", null, "重新查看", -1),
                        ]),
                    ),
                    d[35] ||
                      (d[35] = r(
                        "p",
                        { class: "drawer-note" },
                        "查看官方永久免费、退款与举报安全说明。",
                        -1,
                      )),
                  ]),
                ]),
              ],
            ))
          : O("", !0);
    },
  }),
  md = {
    "5c8993": "野猪",
    "2e584f": "野鱼",
    "226ec1": "野草",
    a37544: "野兔",
    "02e096": "野狗",
    "51ebbb": "野猫（圆头耄耋）",
    "4176fe": "野鸟",
    a2b3ac: "野熊",
    "6ba7e5": "野蛇",
    "1782ff": "野猴",
  };
function Xo(t) {
  if (!Number.isFinite(t)) return "0";
  const e = Math.trunc(t * 100) / 100;
  return String(Object.is(e, -0) ? 0 : e);
}
function oa(t) {
  const e =
    (t == null ? void 0 : t.deathCause) ?? (t == null ? void 0 : t.cause);
  return e != null && e.trim() ? A(e) : null;
}
function ia(t) {
  const e = t == null ? void 0 : t.text;
  if (!(e != null && e.trim())) return null;
  const n =
    (t == null ? void 0 : t.deathCause) ?? (t == null ? void 0 : t.cause);
  return n != null && n.trim() && e.trim() === n.trim() ? null : A(e);
}
function sa(t) {
  var e, n;
  return t.route !== "beast"
    ? t.age
    : (((e = t.beast) == null ? void 0 : e.chronologicalAge) ??
        ((n = t.beastOrigin) == null ? void 0 : n.chronologicalAge) ??
        t.age);
}
function Zo(t) {
  if (!t) return null;
  const e = t.species ? (md[t.species.optionId] ?? t.species.text) : void 0,
    o = [
      ...(t.namePrefixes ?? []).map((i) => (i === "路边" ? "路边的" : i)),
      e,
      ...(t.nameSuffixes ?? []),
    ]
      .map((i) => (i == null ? void 0 : i.trim()))
      .filter((i) => !!i);
  return o.length ? A(o.join("")) : null;
}
function xn(t, e, n) {
  const o = Math.max(0, Math.floor(t)),
    i = Math.max(1, Math.floor(n)),
    s = Math.max(1, Math.ceil(o / i)),
    a = Math.min(s - 1, Math.max(0, Math.floor(e))),
    l = a * i;
  return { page: a, pageCount: s, start: l, end: Math.min(o, l + i) };
}
const hd = 6;
function ei(t) {
  const e = t.trim();
  if (!e) throw new Error("正式神位 ID 不能为空");
  return e;
}
function Wn(t) {
  const e = [],
    n = new Set(),
    o = [...(t.godhoods ?? []), ...(t.godhood ? [t.godhood] : [])];
  for (const i of o) {
    const s = ei(i.id);
    n.has(s) || (n.add(s), e.push({ ...i, id: s }));
  }
  return e;
}
function Nt(t) {
  const e = Wn(t);
  if (((t.godhoods = e), t.godhood)) {
    const n = ei(t.godhood.id);
    t.godhood = { ...(e.find((o) => o.id === n) ?? t.godhood), id: n };
  } else e.length && (t.godhood = { ...e[e.length - 1] });
  return e;
}
function gd(t) {
  return Wn(t).length;
}
function vd(t) {
  return gd(t) < hd;
}
const aa = ["head", "torso", "leftArm", "rightArm", "leftLeg", "rightLeg"],
  bd = {
    head: 1,
    torso: 1,
    leftArm: 1,
    rightArm: 1,
    leftLeg: 1,
    rightLeg: 1,
    external: 100,
  },
  ra = {
    head: "头骨",
    torso: "躯干骨",
    leftArm: "左臂骨",
    rightArm: "右臂骨",
    leftLeg: "左腿骨",
    rightLeg: "右腿骨",
    external: "外附魂骨",
  },
  os = {
    "40809b": "head",
    751286: "torso",
    672129: "leftArm",
    "7f9b7a": "rightArm",
    "5c21d5": "leftLeg",
    "082528": "rightLeg",
    "9a5039": "external",
    fe17d1: "external",
    head: "head",
    torso: "torso",
    leftArm: "leftArm",
    rightArm: "rightArm",
    leftLeg: "leftLeg",
    rightLeg: "rightLeg",
    external: "external",
    "left-arm": "leftArm",
    "right-arm": "rightArm",
    "left-leg": "leftLeg",
    "right-leg": "rightLeg",
  };
function Ve(t) {
  if (!t) return null;
  const e = os[t];
  if (e) return e;
  const n = t.split(":", 1)[0];
  return n ? (os[n] ?? null) : null;
}
function Ht(t) {
  return Ve(t.partId) ?? Ve(t.id);
}
function Dt(t, e) {
  return t.soulBones.filter((n) => Ht(n) === e).length;
}
function Vg(t, e) {
  return Dt(t, e) < bd[e];
}
function ti(t) {
  return aa.filter((e) => Dt(t, e) > 0).length;
}
function la(t) {
  return aa.filter((e) => Dt(t, e) < 1);
}
function yd(t) {
  return la(t).length === 0;
}
function ua(t) {
  return {
    regularCount: ti(t),
    missingSlots: la(t),
    externalCount: Dt(t, "external"),
  };
}
const wd = { class: "drawer drawer-paginated" },
  Sd = { class: "drawer-head" },
  Id = { key: 0 },
  kd = { key: 1 },
  $d = { key: 2 },
  Pd = { key: 0 },
  Cd = { key: 1 },
  Ed = { key: 0 },
  Ld = { key: 1 },
  Ad = { key: 0 },
  Rd = { key: 1 },
  _d = { key: 2, "data-character": "npc-relationships" },
  Td = { key: 0 },
  xd = { "data-character": "soul-bone-slot-summary" },
  Od = { class: "drawer-pagination", "aria-label": "角色档案分页" },
  Md = ["disabled"],
  Bd = ["disabled"],
  Nd = de({
    __name: "CharacterDrawer",
    props: { open: { type: Boolean }, character: {}, stateRevision: {} },
    emits: ["close"],
    setup(t) {
      const e = t;
      function n() {
        return (e.stateRevision, e.character);
      }
      const o = {
          qualified: "已取得资格",
          active: "考核中",
          failed: "考核失败",
          abandoned: "已放弃",
          completed: "已完成",
        },
        i = {
          yellow: "黄级",
          purple: "紫级",
          black: "黑级",
          top: "顶级",
          seaGod: "海神九考",
        },
        s = _(() => n().beast ?? n().beastOrigin),
        a = _(() => Zo(s.value)),
        l = T(0),
        u = T(null),
        d = _(() => xn(3, l.value, 1));
      function p(h) {
        return A(h ?? "");
      }
      function f(h, $ = "、") {
        return A(h.join($));
      }
      const I = _(() => Kl(n())),
        k = _(() => Js(n())),
        g = _(() => {
          const h = n();
          return Wn(h).map(
            (N) => `${N.name ?? N.id}${N.tier ? `（${N.tier}）` : ""}`,
          );
        }),
        w = _(() => {
          var h;
          return (h = n().npcRelationships) == null ? void 0 : h[Gt];
        }),
        b = _(() => ua(n())),
        c = _(() => b.value.missingSlots.map((h) => ra[h]).join("、"));
      function L(h) {
        ((l.value = xn(3, l.value + h, 1).page), m());
      }
      async function m() {
        (await Be(), u.value && (u.value.scrollTop = 0));
      }
      return (
        Ee(
          () => e.open,
          (h) => {
            h && ((l.value = 0), m());
          },
        ),
        (h, $) => {
          var N,
            te,
            ne,
            ue,
            R,
            C,
            W,
            K,
            F,
            fe,
            re,
            q,
            ve,
            ae,
            ye,
            M,
            Z,
            ke,
            J,
            $t,
            Le;
          return h.open
            ? (P(),
              E(
                "div",
                {
                  key: 0,
                  class: "drawer-overlay",
                  onClick:
                    $[3] || ($[3] = tt((Q) => h.$emit("close"), ["self"])),
                },
                [
                  r("aside", wd, [
                    r("div", Sd, [
                      $[4] || ($[4] = r("h2", null, "角色档案", -1)),
                      r(
                        "button",
                        {
                          type: "button",
                          onClick: $[0] || ($[0] = (Q) => h.$emit("close")),
                        },
                        "完成",
                      ),
                    ]),
                    r(
                      "div",
                      {
                        ref_key: "pageContent",
                        ref: u,
                        class: "drawer-page-content",
                      },
                      [
                        r(
                          "section",
                          {
                            class: dt([
                              "drawer-page",
                              { active: d.value.page === 0 },
                            ]),
                          },
                          [
                            h.character.route === "beast"
                              ? (P(),
                                E(
                                  me,
                                  { key: 0 },
                                  [
                                    r(
                                      "p",
                                      null,
                                      "时代：" +
                                        v(
                                          p(
                                            (te =
                                              (N = h.character.beast) == null
                                                ? void 0
                                                : N.period) == null
                                              ? void 0
                                              : te.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "性别：" +
                                        v(
                                          p(
                                            (ne = h.character.gender) == null
                                              ? void 0
                                              : ne.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "本体类型：" +
                                        v(
                                          p(
                                            (R =
                                              (ue = h.character.beast) == null
                                                ? void 0
                                                : ue.type) == null
                                              ? void 0
                                              : R.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "灵兽本体：" +
                                        v(
                                          p(
                                            (W =
                                              (C = h.character.beast) == null
                                                ? void 0
                                                : C.species) == null
                                              ? void 0
                                              : W.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "灵兽名号：" +
                                        v(p(a.value) || "尚未获得"),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "名称前缀：" +
                                        v(
                                          f(
                                            ((K = s.value) == null
                                              ? void 0
                                              : K.namePrefixes) ?? [],
                                          ) || "无",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "名称后缀：" +
                                        v(
                                          f(
                                            ((F = s.value) == null
                                              ? void 0
                                              : F.nameSuffixes) ?? [],
                                          ) || "无",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "栖息地：" +
                                        v(
                                          p(
                                            (re =
                                              (fe = h.character.beast) == null
                                                ? void 0
                                                : fe.area) == null
                                              ? void 0
                                              : re.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "实际年龄：" +
                                        v(
                                          (
                                            ((q = h.character.beast) == null
                                              ? void 0
                                              : q.chronologicalAge) ?? 0
                                          ).toLocaleString(),
                                        ) +
                                        " 岁",
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "修为年限：" +
                                        v(
                                          h.character.beastYears.toLocaleString(),
                                        ) +
                                        " 年",
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "血脉：" +
                                        v(
                                          p(
                                            (ve = h.character.beast) == null
                                              ? void 0
                                              : ve.bloodlines
                                                  .map(
                                                    (Q) =>
                                                      `${Q.selection.text}${V(Xo)(Q.percentage)}%`,
                                                  )
                                                  .join(" + "),
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "属性与法则：" +
                                        v(f(I.value) || "尚未觉醒"),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "已渡雷劫：" +
                                        v(
                                          ((ae = h.character.beast) == null
                                            ? void 0
                                            : ae.tribulationsPassed
                                                .map((Q) => `${Q / 1e4}万年`)
                                                .join("、")) || "无",
                                        ),
                                      1,
                                    ),
                                  ],
                                  64,
                                ))
                              : (P(),
                                E(
                                  me,
                                  { key: 1 },
                                  [
                                    r(
                                      "p",
                                      null,
                                      "路线：" +
                                        v(
                                          h.character.route === "transformed"
                                            ? "灵兽化形"
                                            : "人类灵师",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "年龄 / 等级：" +
                                        v(h.character.age.toLocaleString()) +
                                        " 岁 / " +
                                        v(h.character.level) +
                                        " 级（上限 " +
                                        v(h.character.maxLevel) +
                                        "）",
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "时间线：" +
                                        v(
                                          p(
                                            (ye = h.character.timelineEra) ==
                                              null
                                              ? void 0
                                              : ye.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "性别：" +
                                        v(
                                          p(
                                            (M = h.character.gender) == null
                                              ? void 0
                                              : M.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "容貌：" +
                                        v(
                                          p(
                                            (Z = h.character.appearance) == null
                                              ? void 0
                                              : Z.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "穿越时期：" +
                                        v(
                                          p(
                                            (ke = h.character.storyTime) == null
                                              ? void 0
                                              : ke.selection.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "初始灵力：" +
                                        v(
                                          p(
                                            (J =
                                              h.character.initialPowerResult) ==
                                              null
                                              ? void 0
                                              : J.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "初始势力：" +
                                        v(
                                          p(
                                            ($t = h.character.faction) == null
                                              ? void 0
                                              : $t.text,
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    r(
                                      "p",
                                      null,
                                      "武灵天赋：" +
                                        v(
                                          p(
                                            h.character.martialSoulTalents
                                              .map((Q) => Q.text)
                                              .join("、"),
                                          ) || "尚未确定",
                                        ),
                                      1,
                                    ),
                                    h.character.beastOrigin
                                      ? (P(),
                                        E(
                                          "p",
                                          Id,
                                          "灵兽原身名号：" +
                                            v(p(a.value) || "尚未获得"),
                                          1,
                                        ))
                                      : O("", !0),
                                    h.character.beastOrigin
                                      ? (P(),
                                        E(
                                          "p",
                                          kd,
                                          "原身名称前缀：" +
                                            v(
                                              f(
                                                h.character.beastOrigin
                                                  .namePrefixes,
                                              ) || "无",
                                            ),
                                          1,
                                        ))
                                      : O("", !0),
                                    h.character.beastOrigin
                                      ? (P(),
                                        E(
                                          "p",
                                          $d,
                                          "原身名称后缀：" +
                                            v(
                                              f(
                                                h.character.beastOrigin
                                                  .nameSuffixes,
                                              ) || "无",
                                            ),
                                          1,
                                        ))
                                      : O("", !0),
                                  ],
                                  64,
                                )),
                          ],
                          2,
                        ),
                        r(
                          "section",
                          {
                            class: dt([
                              "drawer-page",
                              { active: d.value.page === 1 },
                            ]),
                          },
                          [
                            (P(!0),
                            E(
                              me,
                              null,
                              Ye(
                                h.character.martialSouls,
                                (Q, he) => (
                                  P(),
                                  E(
                                    "section",
                                    {
                                      key: `${he}:${Q.id}`,
                                      class: "soul-detail",
                                    },
                                    [
                                      r(
                                        "h3",
                                        null,
                                        "第" +
                                          v(he + 1) +
                                          "武灵：" +
                                          v(p(Q.name)),
                                        1,
                                      ),
                                      Q.rings.length
                                        ? (P(),
                                          E("ol", Cd, [
                                            (P(!0),
                                            E(
                                              me,
                                              null,
                                              Ye(
                                                Q.rings,
                                                (Je, Ae) => (
                                                  P(),
                                                  E(
                                                    "li",
                                                    { key: `${Ae}:${Je.name}` },
                                                    "第" +
                                                      v(Ae + 1) +
                                                      "灵环：" +
                                                      v(p(Je.name)) +
                                                      " · " +
                                                      v(
                                                        Je.years.toLocaleString(),
                                                      ) +
                                                      "年",
                                                    1,
                                                  )
                                                ),
                                              ),
                                              128,
                                            )),
                                          ]))
                                        : (P(), E("p", Pd, "尚无灵环")),
                                    ],
                                  )
                                ),
                              ),
                              128,
                            )),
                            r(
                              "p",
                              null,
                              "特殊天赋：" +
                                v(
                                  p(
                                    h.character.talents
                                      .map((Q) => Q.text)
                                      .join("、"),
                                  ) || "无",
                                ),
                              1,
                            ),
                            h.character.route !== "beast"
                              ? (P(),
                                E(
                                  "p",
                                  Ed,
                                  "血脉：" +
                                    v(f(h.character.bloodlines) || "无"),
                                  1,
                                ))
                              : O("", !0),
                            h.character.route !== "beast"
                              ? (P(),
                                E("p", Ld, "属性：" + v(f(I.value) || "无"), 1))
                              : O("", !0),
                          ],
                          2,
                        ),
                        r(
                          "section",
                          {
                            class: dt([
                              "drawer-page",
                              { active: d.value.page === 2 },
                            ]),
                          },
                          [
                            h.character.godTrial
                              ? (P(),
                                E(
                                  "p",
                                  Ad,
                                  " 神考：" +
                                    v(
                                      p(
                                        h.character.godTrial.tierSelection.text,
                                      ),
                                    ) +
                                    " · " +
                                    v(
                                      p(
                                        (Le =
                                          h.character.godTrial
                                            .deitySelection) == null
                                          ? void 0
                                          : Le.text,
                                      ) || "尚未抽取传承方向",
                                    ) +
                                    " · " +
                                    v(
                                      h.character.godTrial.completedStages
                                        .length,
                                    ) +
                                    "/" +
                                    v(h.character.godTrial.totalStages) +
                                    "考 · " +
                                    v(o[h.character.godTrial.status]),
                                  1,
                                ))
                              : O("", !0),
                            h.character.seaTrial
                              ? (P(),
                                E(
                                  "p",
                                  Rd,
                                  " 海神岛考核：" +
                                    v(i[h.character.seaTrial.tier]) +
                                    "（" +
                                    v(p(h.character.seaTrial.selection.text)) +
                                    "）· 已完成 " +
                                    v(
                                      h.character.seaTrial.completedStages
                                        .length,
                                    ) +
                                    "/" +
                                    v(h.character.seaTrial.totalStages) +
                                    "考 · " +
                                    v(o[h.character.seaTrial.status]),
                                  1,
                                ))
                              : O("", !0),
                            r(
                              "p",
                              null,
                              "神器：" +
                                v(
                                  p(
                                    h.character.artifacts
                                      .map(
                                        (Q) =>
                                          `${Q.name}（${Q.stage === "complete" ? "完整" : "胚胎"}，位阶${Q.rank}）`,
                                      )
                                      .join("、"),
                                  ) || "无",
                                ),
                              1,
                            ),
                            r(
                              "p",
                              null,
                              "正式神位：" + v(f(g.value) || "无"),
                              1,
                            ),
                            r(
                              "p",
                              null,
                              "称号：" + v(f(h.character.titles) || "无"),
                              1,
                            ),
                            r("p", null, "领域：" + v(f(k.value) || "无"), 1),
                            w.value
                              ? (P(),
                                E("section", _d, [
                                  $[5] || ($[5] = r("h3", null, "NPC关系", -1)),
                                  r("p", null, [
                                    _e(
                                      "小霍娘：" + v(w.value.affinity) + "点",
                                      1,
                                    ),
                                    w.value.status
                                      ? (P(),
                                        E(
                                          "span",
                                          Td,
                                          " · " + v(w.value.status),
                                          1,
                                        ))
                                      : O("", !0),
                                  ]),
                                ]))
                              : O("", !0),
                            r(
                              "p",
                              null,
                              "灵骨：" +
                                v(
                                  p(
                                    h.character.soulBones
                                      .map(
                                        (Q) =>
                                          `${Q.name}（${Q.years.toLocaleString()}年）`,
                                      )
                                      .join("、"),
                                  ) || "无",
                                ),
                              1,
                            ),
                            r(
                              "p",
                              xd,
                              "六大常规灵骨：" +
                                v(b.value.regularCount) +
                                "/6 · 缺少：" +
                                v(c.value || "无") +
                                " · 外附灵骨：" +
                                v(b.value.externalCount),
                              1,
                            ),
                            r(
                              "p",
                              null,
                              "固有技能：" +
                                v(
                                  p(
                                    h.character.skills
                                      .map((Q) => `${Q.name} Lv.${Q.level}`)
                                      .join("、"),
                                  ) || "无",
                                ),
                              1,
                            ),
                          ],
                          2,
                        ),
                      ],
                      512,
                    ),
                    r("nav", Od, [
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: d.value.page === 0,
                          onClick: $[1] || ($[1] = (Q) => L(-1)),
                        },
                        "上一页",
                        8,
                        Md,
                      ),
                      r(
                        "span",
                        null,
                        "第 " +
                          v(d.value.page + 1) +
                          " / " +
                          v(d.value.pageCount) +
                          " 页",
                        1,
                      ),
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: d.value.page === d.value.pageCount - 1,
                          onClick: $[2] || ($[2] = (Q) => L(1)),
                        },
                        "下一页",
                        8,
                        Bd,
                      ),
                    ]),
                  ]),
                ],
              ))
            : O("", !0);
        }
      );
    },
  }),
  Dd = { class: "drawer drawer-paginated" },
  Fd = { class: "drawer-head" },
  Vd = { class: "timeline-filters" },
  jd = { class: "timeline-filter-row" },
  zd = { class: "timeline-major-toggle" },
  Ud = { class: "save-meta" },
  Wd = { key: 0, class: "empty-state" },
  qd = { key: 0, class: "drawer-pagination", "aria-label": "命运纪事分页" },
  Gd = ["disabled"],
  Hd = ["disabled"],
  is = 8,
  Yd = de({
    __name: "TimelineDrawer",
    props: { open: { type: Boolean }, items: {} },
    emits: ["close"],
    setup(t) {
      const e = t,
        n = T(""),
        o = T("all"),
        i = T(!1),
        s = T(0),
        a = T(null),
        l = (k) => A(k.text),
        u = _(() =>
          e.items.filter(
            (k) =>
              (o.value === "all" || k.kind === o.value) &&
              (!i.value || k.major === !0) &&
              (!n.value.trim() || l(k).includes(n.value.trim())),
          ),
        ),
        d = _(() => xn(u.value.length, s.value, is));
      function p() {
        ((n.value = ""), (o.value = "all"), (i.value = !1));
      }
      function f(k) {
        ((s.value = xn(u.value.length, s.value + k, is).page), I());
      }
      async function I() {
        (await Be(), a.value && (a.value.scrollTop = 0));
      }
      return (
        Ee([n, o, i], () => {
          ((s.value = 0), I());
        }),
        Ee(
          () => e.open,
          (k) => {
            k && ((s.value = 0), I());
          },
        ),
        (k, g) =>
          k.open
            ? (P(),
              E(
                "div",
                {
                  key: 0,
                  class: "drawer-overlay",
                  onClick:
                    g[6] || (g[6] = tt((w) => k.$emit("close"), ["self"])),
                },
                [
                  r("aside", Dd, [
                    r("div", Fd, [
                      g[7] || (g[7] = r("h2", null, "命运纪事", -1)),
                      r(
                        "button",
                        {
                          type: "button",
                          onClick: g[0] || (g[0] = (w) => k.$emit("close")),
                        },
                        "完成",
                      ),
                    ]),
                    r(
                      "div",
                      {
                        ref_key: "pageContent",
                        ref: a,
                        class: "drawer-page-content",
                      },
                      [
                        r("div", Vd, [
                          Ze(
                            r(
                              "input",
                              {
                                "onUpdate:modelValue":
                                  g[1] || (g[1] = (w) => (n.value = w)),
                                placeholder: "搜索纪事",
                              },
                              null,
                              512,
                            ),
                            [[Ho, n.value]],
                          ),
                          r("div", jd, [
                            Ze(
                              r(
                                "select",
                                {
                                  "onUpdate:modelValue":
                                    g[2] || (g[2] = (w) => (o.value = w)),
                                },
                                g[8] ||
                                  (g[8] = [
                                    r(
                                      "option",
                                      { value: "all" },
                                      "全部类型",
                                      -1,
                                    ),
                                    r(
                                      "option",
                                      { value: "result" },
                                      "抽取结果",
                                      -1,
                                    ),
                                    r(
                                      "option",
                                      { value: "system" },
                                      "系统事件",
                                      -1,
                                    ),
                                  ]),
                                512,
                              ),
                              [[Rt, o.value]],
                            ),
                            r("label", zd, [
                              Ze(
                                r(
                                  "input",
                                  {
                                    "onUpdate:modelValue":
                                      g[3] || (g[3] = (w) => (i.value = w)),
                                    type: "checkbox",
                                  },
                                  null,
                                  512,
                                ),
                                [[jr, i.value]],
                              ),
                              g[9] || (g[9] = r("span", null, "只看重大", -1)),
                            ]),
                          ]),
                          r(
                            "button",
                            { type: "button", onClick: p },
                            "清除筛选",
                          ),
                        ]),
                        r(
                          "p",
                          Ud,
                          "显示 " +
                            v(u.value.length) +
                            " / " +
                            v(k.items.length) +
                            " 条",
                          1,
                        ),
                        u.value.length
                          ? O("", !0)
                          : (P(), E("p", Wd, "没有符合条件的纪事。")),
                        r("ol", null, [
                          (P(!0),
                          E(
                            me,
                            null,
                            Ye(
                              u.value,
                              (w, b) => (
                                P(),
                                E(
                                  "li",
                                  {
                                    key: b,
                                    class: dt([
                                      "timeline-entry",
                                      {
                                        "mobile-page-hidden":
                                          b < d.value.start || b >= d.value.end,
                                      },
                                    ]),
                                  },
                                  v(l(w)),
                                  3,
                                )
                              ),
                            ),
                            128,
                          )),
                        ]),
                      ],
                      512,
                    ),
                    d.value.pageCount > 1
                      ? (P(),
                        E("nav", qd, [
                          r(
                            "button",
                            {
                              type: "button",
                              disabled: d.value.page === 0,
                              onClick: g[4] || (g[4] = (w) => f(-1)),
                            },
                            "上一页",
                            8,
                            Gd,
                          ),
                          r(
                            "span",
                            null,
                            "第 " +
                              v(d.value.page + 1) +
                              " / " +
                              v(d.value.pageCount) +
                              " 页",
                            1,
                          ),
                          r(
                            "button",
                            {
                              type: "button",
                              disabled: d.value.page === d.value.pageCount - 1,
                              onClick: g[5] || (g[5] = (w) => f(1)),
                            },
                            "下一页",
                            8,
                            Hd,
                          ),
                        ]))
                      : O("", !0),
                  ]),
                ],
              ))
            : O("", !0)
      );
    },
  }),
  Kd = { class: "drawer" },
  Jd = { class: "drawer-head" },
  Qd = { class: "save-meta" },
  Xd = { class: "save-meta" },
  Zd = { key: 0, class: "drawer-note" },
  ec = { class: "drawer-section" },
  tc = { class: "drawer-actions" },
  nc = ["disabled"],
  oc = ["disabled"],
  ic = ["disabled"],
  sc = ["disabled"],
  ac = { class: "drawer-section" },
  rc = { class: "drawer-actions" },
  lc = ["disabled"],
  uc = ["disabled"],
  dc = { class: "drawer-section" },
  cc = { class: "drawer-actions single-action" },
  fc = ["disabled"],
  pc = de({
    __name: "SaveDrawer",
    props: { open: { type: Boolean }, game: {}, locked: { type: Boolean } },
    emits: [
      "close",
      "save",
      "load",
      "deleteSave",
      "undo",
      "exportJson",
      "importJson",
      "exportChronicle",
    ],
    setup(t, { emit: e }) {
      const n = t,
        o = e;
      function i(s) {
        var u;
        const a = s.target;
        if (n.locked) {
          a.value = "";
          return;
        }
        const l = (u = a.files) == null ? void 0 : u[0];
        (l && o("importJson", l), (a.value = ""));
      }
      return (s, a) =>
        s.open
          ? (P(),
            E(
              "div",
              {
                key: 0,
                class: "drawer-overlay",
                onClick: a[7] || (a[7] = tt((l) => o("close"), ["self"])),
              },
              [
                r("aside", Kd, [
                  r("div", Jd, [
                    a[8] || (a[8] = r("h2", null, "存档与导出", -1)),
                    r(
                      "button",
                      {
                        type: "button",
                        onClick: a[0] || (a[0] = (l) => o("close")),
                      },
                      "完成",
                    ),
                  ]),
                  r(
                    "p",
                    Qd,
                    "命运种子：" +
                      v(V(A)(s.game.random.seed)) +
                      " · 随机进度 " +
                      v(s.game.random.cursor),
                    1,
                  ),
                  r(
                    "p",
                    Xd,
                    "纪事 " +
                      v(s.game.timeline.length) +
                      " 条 · " +
                      v(s.game.finished ? "本局已结束" : "命运进行中"),
                    1,
                  ),
                  s.locked
                    ? (P(),
                      E(
                        "p",
                        Zd,
                        "正在结算本次抽取，完成后才可保存、读取或导出。",
                      ))
                    : O("", !0),
                  r("section", ec, [
                    a[9] || (a[9] = r("h3", null, "本机存档", -1)),
                    r("div", tc, [
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: s.locked,
                          onClick: a[1] || (a[1] = (l) => o("save")),
                        },
                        "保存到本机",
                        8,
                        nc,
                      ),
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: s.locked,
                          onClick: a[2] || (a[2] = (l) => o("load")),
                        },
                        "读取本机存档",
                        8,
                        oc,
                      ),
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: s.locked,
                          onClick: a[3] || (a[3] = (l) => o("deleteSave")),
                        },
                        "删除本机存档",
                        8,
                        ic,
                      ),
                      r(
                        "button",
                        {
                          type: "button",
                          disabled:
                            s.locked ||
                            !s.game.lastResolvedSpin ||
                            !s.game.history.length,
                          onClick: a[4] || (a[4] = (l) => o("undo")),
                        },
                        "撤销 / 重抽",
                        8,
                        sc,
                      ),
                    ]),
                  ]),
                  r("section", ac, [
                    a[11] || (a[11] = r("h3", null, "JSON 存档", -1)),
                    r("div", rc, [
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: s.locked,
                          onClick: a[5] || (a[5] = (l) => o("exportJson")),
                        },
                        "导出 JSON",
                        8,
                        lc,
                      ),
                      r(
                        "label",
                        { class: dt(["file-button", { disabled: s.locked }]) },
                        [
                          a[10] || (a[10] = _e("导入 JSON")),
                          r(
                            "input",
                            {
                              type: "file",
                              disabled: s.locked,
                              accept: "application/json,.json",
                              onChange: i,
                            },
                            null,
                            40,
                            uc,
                          ),
                        ],
                        2,
                      ),
                    ]),
                  ]),
                  r("section", dc, [
                    a[12] || (a[12] = r("h3", null, "人物传记", -1)),
                    r("div", cc, [
                      r(
                        "button",
                        {
                          type: "button",
                          disabled: s.locked,
                          onClick:
                            a[6] || (a[6] = (l) => o("exportChronicle", !1)),
                        },
                        "导出完整传记",
                        8,
                        fc,
                      ),
                    ]),
                  ]),
                ]),
              ],
            ))
          : O("", !0);
    },
  });
function On(t, e) {
  return t.timelineScope
    ? t.timelineScope
    : t.contentOwner === "shared" || t.contentOwner === "shared-beast-core"
      ? "shared"
      : t.contentOwner === "douluo1" || t.contentOwner === "douluo2"
        ? t.contentOwner
        : t.contentOwner === "staging" || t.contentOwner === "unresolved"
          ? "unresolved"
          : e;
}
function ss(t) {
  return t === "shared"
    ? "通用基础"
    : t === "douluo1"
      ? "第一部·唐三时期"
      : t === "douluo2"
        ? "第二部·霍雨浩时期"
        : "未确认";
}
function mc(t, e, n = "compatible", o = !1) {
  return t.filter((i) => {
    const s = On(i, e);
    return !o &&
      (i.contentStatus === "staging" ||
        i.developmentOnly === !0 ||
        s === "unresolved")
      ? !1
      : n === "all"
        ? o
        : n === "compatible"
          ? s === "shared" || s === e
          : o && s === n;
  });
}
function hc(t, e) {
  return t.map((n) => ({
    poolId: n.id,
    canonicalId: n.canonicalId ?? n.id,
    name: n.name,
    timelineScope: On(n, e),
    contentOwner: n.contentOwner ?? null,
    contentStatus: n.contentStatus ?? "formal",
    developmentOnly: n.developmentOnly === !0,
    optionCount: Mn(n).length,
  }));
}
function gc(t) {
  const e = Array.from(t.trim());
  return e.length <= 14 ? e.join("") : `${e.slice(0, 14).join("")}…`;
}
function Mn(t) {
  return t.options
    .filter(
      (e) => e.enabled !== !1 && Number.isFinite(e.weight) && e.weight > 0,
    )
    .map((e) => ({
      id: e.id,
      text: e.text,
      label: e.wheelLabel || gc(e.text),
      weight: e.weight,
    }));
}
function vc(t, e) {
  const n = t.find((o) => o.id === e);
  if (!n) throw new Error(`自由转盘不存在：${e || "未选择"}`);
  return n;
}
function bc() {
  var e;
  const t = new Uint32Array(1);
  return (e = globalThis.crypto) != null && e.getRandomValues
    ? (globalThis.crypto.getRandomValues(t), t[0] / 4294967296)
    : Math.random();
}
function yc(t) {
  const e = t();
  if (!Number.isFinite(e) || e < 0 || e >= 1)
    throw new Error("自由转盘随机源必须返回 [0, 1) 范围内的数值");
  return e;
}
function wc(t, e, n = null, o = bc) {
  const i = vc(t, e),
    s = Mn(i);
  if (!s.length) throw new Error(`自由转盘 ${i.name} 没有可展示的选项`);
  let a;
  if (n) {
    if (((a = s.findIndex((l) => l.id === n)), a < 0))
      throw new Error(`自由转盘选项不存在或不可用：${n}`);
  } else {
    const l = yc(o) * s.reduce((d, p) => d + p.weight, 0);
    let u = 0;
    ((a = s.findIndex((d) => ((u += d.weight), l < u))),
      a < 0 && (a = s.length - 1));
  }
  return {
    poolId: i.id,
    poolName: i.name,
    option: s[a],
    targetIndex: a,
    options: s,
  };
}
function Sc(t, e, n, o) {
  if (!t || e !== t.id) return null;
  const i = t.options.find((s) => s.id === n);
  return !i ||
    i.contentStatus === "staging" ||
    i.enabled === !1 ||
    !Number.isFinite(i.weight) ||
    i.weight <= 0 ||
    (o && !o.includes(n))
    ? null
    : { poolId: t.id, optionId: n };
}
const Ic = { class: "advanced-wheel-tools" },
  kc = { class: "advanced-wheel-fields" },
  $c = { key: 0 },
  Pc = ["disabled"],
  Cc = ["disabled"],
  Ec = ["disabled"],
  Lc = { key: 0, value: "" },
  Ac = ["value"],
  Rc = { key: 1, class: "drawer-note advanced-pool-meta" },
  _c = ["disabled"],
  Tc = ["value"],
  xc = ["data-option-id"],
  Oc = { key: 0, class: "advanced-wheel-stage" },
  Mc = { key: 1, class: "drawer-note" },
  Bc = ["disabled"],
  Nc = ["disabled"],
  Dc = { key: 2, class: "risk-warning", role: "alert" },
  Fc = de({
    __name: "AdvancedWheelTools",
    props: {
      pools: {},
      duration: { default: 3600 },
      reducedMotion: { type: Boolean, default: !1 },
      initialPoolId: { default: "" },
      worldEra: {},
      developmentMode: { type: Boolean, default: !1 },
      resolveFormalDraw: {},
      commitFormalDraw: {},
    },
    emits: ["spinStart", "tick", "spinEnd"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T(""),
        s = T("compatible"),
        a = T(n.initialPoolId),
        l = T(""),
        u = T(null),
        d = T(null),
        p = T(null),
        f = T("???"),
        I = T(""),
        k = T(!1),
        g = _(() => mc(n.pools, n.worldEra, s.value, n.developmentMode)),
        w = _(() => {
          const R = i.value.trim(),
            C = g.value.filter((W) => {
              var K;
              return (
                !R ||
                A(W.name).includes(R) ||
                W.id.includes(R) ||
                ((K = W.canonicalId) == null ? void 0 : K.includes(R))
              );
            });
          return [...new Map(C.map((W) => [W.id, W])).values()];
        }),
        b = _(() => g.value.find((R) => R.id === a.value)),
        c = _(() => (b.value ? Mn(b.value) : [])),
        L = _(() =>
          c.value.map((R) => ({
            id: R.id,
            label: A(R.label),
            weight: R.weight,
          })),
        ),
        m = _(() => {
          var R;
          return k.value
            ? A(f.value)
            : A(((R = p.value) == null ? void 0 : R.option.text) ?? "???");
        });
      function h() {
        var C;
        g.value.some((W) => W.id === a.value) ||
          (a.value =
            n.initialPoolId && g.value.some((W) => W.id === n.initialPoolId)
              ? n.initialPoolId
              : (((C = g.value[0]) == null ? void 0 : C.id) ?? ""));
      }
      (Ee(g, h, { immediate: !0 }),
        Ee(a, () => {
          ((l.value = ""),
            (u.value = null),
            (d.value = null),
            (p.value = null),
            (f.value = "???"),
            (I.value = ""),
            (k.value = !1));
        }));
      async function $() {
        var R;
        if (!k.value) {
          I.value = "";
          try {
            const C =
                ((R = n.resolveFormalDraw) == null
                  ? void 0
                  : R.call(n, a.value)) ?? null,
              W = wc(g.value, a.value, C || l.value || null);
            ((d.value = W),
              (p.value = null),
              (f.value = "???"),
              (u.value = null),
              (k.value = !0),
              await Be(),
              (u.value = W.targetIndex));
          } catch (C) {
            ((d.value = null),
              (k.value = !1),
              (I.value = C instanceof Error ? C.message : "自由转盘无法开始"));
          }
        }
      }
      function N() {
        const R = d.value;
        R && o("spinStart", R.poolId, R.option.id, R.targetIndex);
      }
      function te(R) {
        const C = c.value[R];
        C && ((f.value = C.text), o("tick", R, C.id));
      }
      function ne(R) {
        var W;
        const C = d.value;
        C &&
          ((p.value = C),
          (W = n.commitFormalDraw) == null || W.call(n, C.poolId, C.option.id),
          (d.value = null),
          (u.value = null),
          (k.value = !1),
          o("spinEnd", C.poolId, C.option.id, C.targetIndex));
      }
      function ue() {
        const R = {
            format: "dlzp-v6-advanced-pool-catalog",
            worldEra: n.worldEra,
            scopeFilter: s.value,
            pools: hc(w.value, n.worldEra),
          },
          C = URL.createObjectURL(
            new Blob(
              [
                `${JSON.stringify(R, null, 2)}
`,
              ],
              { type: "application/json;charset=utf-8" },
            ),
          ),
          W = document.createElement("a");
        ((W.href = C),
          (W.download = `dlzp-v6-pools-${s.value}.json`),
          (W.style.display = "none"),
          document.body.appendChild(W),
          W.click(),
          W.remove(),
          window.setTimeout(() => URL.revokeObjectURL(C), 0));
      }
      return (R, C) => {
        var W;
        return (
          P(),
          E("div", Ic, [
            r("div", kc, [
              R.developmentMode
                ? (P(),
                  E("label", $c, [
                    C[5] || (C[5] = r("span", null, "时代范围", -1)),
                    Ze(
                      r(
                        "select",
                        {
                          "onUpdate:modelValue":
                            C[0] || (C[0] = (K) => (s.value = K)),
                          disabled: k.value,
                        },
                        C[4] ||
                          (C[4] = [
                            Go(
                              '<option value="compatible" data-v-d3fe9edf>当前时代兼容</option><option value="shared" data-v-d3fe9edf>通用基础</option><option value="douluo1" data-v-d3fe9edf>第一部·唐三时期</option><option value="douluo2" data-v-d3fe9edf>第二部·霍雨浩时期</option><option value="unresolved" data-v-d3fe9edf>未确认</option><option value="all" data-v-d3fe9edf>全部开发内容</option>',
                              6,
                            ),
                          ]),
                        8,
                        Pc,
                      ),
                      [[Rt, s.value]],
                    ),
                  ]))
                : O("", !0),
              r("label", null, [
                C[6] || (C[6] = r("span", null, "搜索转盘", -1)),
                Ze(
                  r(
                    "input",
                    {
                      "onUpdate:modelValue":
                        C[1] || (C[1] = (K) => (i.value = K)),
                      class: "drawer-input",
                      disabled: k.value,
                      placeholder: "名称或原始 pool ID",
                    },
                    null,
                    8,
                    Cc,
                  ),
                  [[Ho, i.value]],
                ),
              ]),
              r("label", null, [
                C[7] || (C[7] = r("span", null, "展示转盘", -1)),
                Ze(
                  r(
                    "select",
                    {
                      "onUpdate:modelValue":
                        C[2] || (C[2] = (K) => (a.value = K)),
                      disabled: k.value,
                    },
                    [
                      w.value.length
                        ? O("", !0)
                        : (P(), E("option", Lc, "没有匹配转盘")),
                      (P(!0),
                      E(
                        me,
                        null,
                        Ye(
                          w.value,
                          (K, F) => (
                            P(),
                            E(
                              "option",
                              {
                                key: `${K.contentOwner ?? "unknown"}:${K.timelineScope ?? "shared"}:${K.id}:${F}`,
                                value: K.id,
                              },
                              v(V(A)(K.name)) +
                                " · " +
                                v(V(ss)(V(On)(K, R.worldEra))) +
                                "（" +
                                v(V(Mn)(K).length) +
                                "项） ",
                              9,
                              Ac,
                            )
                          ),
                        ),
                        128,
                      )),
                    ],
                    8,
                    Ec,
                  ),
                  [[Rt, a.value]],
                ),
              ]),
              b.value
                ? (P(),
                  E(
                    "p",
                    Rc,
                    v(V(ss)(V(On)(b.value, R.worldEra))) +
                      " · " +
                      v(b.value.canonicalId ?? b.value.id),
                    1,
                  ))
                : O("", !0),
              r("label", null, [
                C[9] || (C[9] = r("span", null, "视觉结果", -1)),
                Ze(
                  r(
                    "select",
                    {
                      "onUpdate:modelValue":
                        C[3] || (C[3] = (K) => (l.value = K)),
                      disabled: k.value || !c.value.length,
                    },
                    [
                      C[8] ||
                        (C[8] = r("option", { value: "" }, "独立随机", -1)),
                      (P(!0),
                      E(
                        me,
                        null,
                        Ye(
                          c.value,
                          (K) => (
                            P(),
                            E(
                              "option",
                              { key: K.id, value: K.id },
                              v(V(A)(K.text)) + "（权重 " + v(K.weight) + "） ",
                              9,
                              Tc,
                            )
                          ),
                        ),
                        128,
                      )),
                    ],
                    8,
                    _c,
                  ),
                  [[Rt, l.value]],
                ),
              ]),
            ]),
            r(
              "p",
              {
                class: "advanced-wheel-result",
                "aria-live": "polite",
                "data-option-id": (W = p.value) == null ? void 0 : W.option.id,
              },
              v(m.value),
              9,
              xc,
            ),
            L.value.length
              ? (P(),
                E("div", Oc, [
                  Se(
                    Qo,
                    {
                      items: L.value,
                      "wheel-key": a.value,
                      "target-index": u.value,
                      duration: R.duration,
                      disabled: !0,
                      "reduced-motion": R.reducedMotion,
                      onSpinStart: N,
                      onTick: te,
                      onSpinEnd: ne,
                    },
                    null,
                    8,
                    [
                      "items",
                      "wheel-key",
                      "target-index",
                      "duration",
                      "reduced-motion",
                    ],
                  ),
                ]))
              : (P(), E("p", Mc, "该转盘没有可展示的启用选项。")),
            r(
              "button",
              {
                class: "advanced-wheel-start",
                disabled: k.value || !b.value || !c.value.length,
                onClick: $,
              },
              v(
                k.value ? "转动中…" : l.value ? "转到指定结果" : "独立随机转动",
              ),
              9,
              Bc,
            ),
            r(
              "button",
              {
                class: "advanced-wheel-export",
                type: "button",
                disabled: k.value || !w.value.length,
                onClick: ue,
              },
              " 导出当前池清单 ",
              8,
              Nc,
            ),
            I.value ? (P(), E("p", Dc, v(V(A)(I.value)), 1)) : O("", !0),
            C[10] ||
              (C[10] = r(
                "p",
                { class: "drawer-note" },
                " 本工具只播放独立展示动画，不执行效果，不修改角色、正式随机游标、纪事或撤销记录。 ",
                -1,
              )),
          ])
        );
      };
    },
  }),
  Vc = jn(Fc, [["__scopeId", "data-v-d3fe9edf"]]),
  jc = { class: "drawer" },
  zc = { class: "drawer-head" },
  Uc = { key: 0, class: "drawer-section" },
  Wc = ["value", "disabled"],
  qc = { key: 0, class: "risk-warning" },
  Gc = { class: "drawer-actions" },
  Hc = ["disabled"],
  Yc = ["disabled"],
  Kc = { key: 1, class: "save-meta" },
  Jc = { class: "drawer-section" },
  Qc = de({
    __name: "AdvancedToolsDrawer",
    props: {
      open: { type: Boolean },
      pack: {},
      currentPool: {},
      forcedOptionId: {},
      availableOptionIds: {},
      wheelDuration: { default: 3600 },
      reducedMotion: { type: Boolean, default: !1 },
      catalogPools: {},
      worldEra: {},
      developmentMode: { type: Boolean, default: !1 },
      resolveFormalDraw: {},
      commitFormalDraw: {},
    },
    emits: ["close", "force", "clearForce"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T(""),
        s = _(() => {
          var p;
          return (
            ((p = n.currentPool) == null
              ? void 0
              : p.options.filter((f) => f.enabled !== !1)) ?? []
          );
        }),
        a = _(() => {
          var p;
          return (p = n.currentPool) == null
            ? void 0
            : p.options.find((f) => f.id === i.value);
        }),
        l = _(() => {
          var f, I, k;
          const p = a.value;
          return p
            ? (f = p.effects) != null && f.some((g) => g.type === "death")
              ? "高风险：该结果会直接触发死亡结算。"
              : (I = p.effects) != null && I.some((g) => g.type === "ending")
                ? "高风险：该结果会直接进入终局。"
                : (k = p.effects) != null &&
                    k.some((g) => g.type === "grantGodhood")
                  ? "重要结果：该结果会正式授予神位。"
                  : p.customHandler
                    ? "注意：该结果包含已注册的剧情处理器。"
                    : ""
            : "";
        });
      Ee(
        () => {
          var p;
          return (p = n.currentPool) == null ? void 0 : p.id;
        },
        () => {
          i.value = "";
        },
      );
      function u() {
        var f;
        const p = Sc(
          n.currentPool,
          ((f = n.currentPool) == null ? void 0 : f.id) ?? "",
          i.value,
          n.availableOptionIds,
        );
        p && o("force", p.poolId, p.optionId);
      }
      function d() {
        !n.currentPool ||
          !n.forcedOptionId ||
          o("clearForce", n.currentPool.id);
      }
      return (p, f) => {
        var I, k;
        return p.open
          ? (P(),
            E(
              "div",
              {
                key: 0,
                class: "drawer-overlay",
                onClick: f[2] || (f[2] = tt((g) => o("close"), ["self"])),
              },
              [
                r("aside", jc, [
                  r("div", zc, [
                    f[3] || (f[3] = r("h2", null, "转盘与高级工具", -1)),
                    r(
                      "button",
                      { onClick: f[0] || (f[0] = (g) => o("close")) },
                      "完成",
                    ),
                  ]),
                  p.developmentMode
                    ? (P(),
                      E("section", Uc, [
                        f[5] || (f[5] = r("h3", null, "当前流程指定结果", -1)),
                        f[6] ||
                          (f[6] = r(
                            "p",
                            { class: "drawer-note" },
                            " 锁定不会消耗正式随机游标，且只能选择当前池中满足条件、不会被主动规避的选项。 ",
                            -1,
                          )),
                        Ze(
                          r(
                            "select",
                            {
                              "onUpdate:modelValue":
                                f[1] || (f[1] = (g) => (i.value = g)),
                            },
                            [
                              f[4] ||
                                (f[4] = r(
                                  "option",
                                  { value: "" },
                                  "选择结果",
                                  -1,
                                )),
                              (P(!0),
                              E(
                                me,
                                null,
                                Ye(
                                  s.value,
                                  (g) => (
                                    P(),
                                    E(
                                      "option",
                                      {
                                        key: g.id,
                                        value: g.id,
                                        disabled: p.availableOptionIds
                                          ? !p.availableOptionIds.includes(g.id)
                                          : !1,
                                      },
                                      v(V(A)(g.text)) +
                                        "（权重 " +
                                        v(g.weight) +
                                        "） ",
                                      9,
                                      Wc,
                                    )
                                  ),
                                ),
                                128,
                              )),
                            ],
                            512,
                          ),
                          [[Rt, i.value]],
                        ),
                        l.value ? (P(), E("p", qc, v(l.value), 1)) : O("", !0),
                        r("div", Gc, [
                          r(
                            "button",
                            {
                              disabled: !p.currentPool || !i.value,
                              onClick: u,
                            },
                            " 锁定下次结果 ",
                            8,
                            Hc,
                          ),
                          r(
                            "button",
                            {
                              disabled: !p.currentPool || !p.forcedOptionId,
                              onClick: d,
                            },
                            " 清除锁定 ",
                            8,
                            Yc,
                          ),
                        ]),
                        p.forcedOptionId
                          ? (P(),
                            E(
                              "p",
                              Kc,
                              " 已锁定：" +
                                v(
                                  V(A)(
                                    ((k =
                                      (I = p.currentPool) == null
                                        ? void 0
                                        : I.options.find(
                                            (g) => g.id === p.forcedOptionId,
                                          )) == null
                                      ? void 0
                                      : k.text) ?? "",
                                  ),
                                ),
                              1,
                            ))
                          : O("", !0),
                      ]))
                    : O("", !0),
                  r("section", Jc, [
                    f[7] || (f[7] = r("h3", null, "独立自由转盘", -1)),
                    Se(
                      Vc,
                      {
                        pools: p.catalogPools ?? p.pack.pools,
                        "world-era": p.worldEra,
                        "development-mode": p.developmentMode,
                        duration: p.wheelDuration,
                        "reduced-motion": p.reducedMotion,
                        "resolve-formal-draw": p.resolveFormalDraw,
                        "commit-formal-draw": p.commitFormalDraw,
                      },
                      null,
                      8,
                      [
                        "pools",
                        "world-era",
                        "development-mode",
                        "duration",
                        "reduced-motion",
                        "resolve-formal-draw",
                        "commit-formal-draw",
                      ],
                    ),
                  ]),
                ]),
              ],
            ))
          : O("", !0);
      };
    },
  }),
  Xc = ["data-testid"],
  Zc = ["aria-labelledby", "aria-describedby"],
  ef = { class: "app-drawer-head" },
  tf = ["id"],
  nf = ["id"],
  of = { class: "app-drawer-content" },
  qn = de({
    __name: "AppDrawer",
    props: {
      open: { type: Boolean },
      title: {},
      drawerId: {},
      description: { default: void 0 },
      testId: { default: void 0 },
    },
    emits: ["close"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T(null);
      let s = null,
        a = "",
        l = !1;
      function u() {
        return i.value
          ? [
              ...i.value.querySelectorAll(
                'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
              ),
            ].filter((f) => f.getAttribute("aria-hidden") !== "true")
          : [];
      }
      function d() {
        o("close");
      }
      function p(f) {
        var w;
        if (f.key === "Escape") {
          (f.preventDefault(), d());
          return;
        }
        if (f.key !== "Tab") return;
        const I = u();
        if (!I.length) {
          (f.preventDefault(), (w = i.value) == null || w.focus());
          return;
        }
        const k = I[0],
          g = I[I.length - 1];
        f.shiftKey && document.activeElement === k
          ? (f.preventDefault(), g.focus())
          : !f.shiftKey &&
            document.activeElement === g &&
            (f.preventDefault(), k.focus());
      }
      return (
        Ee(
          () => n.open,
          (f) => {
            if (f) {
              ((l = !0),
                (s =
                  document.activeElement instanceof HTMLElement
                    ? document.activeElement
                    : null),
                (a = document.body.style.overflow),
                (document.body.style.overflow = "hidden"),
                Be(() => {
                  var k;
                  const I = u()[0];
                  I ? I.focus() : (k = i.value) == null || k.focus();
                }));
              return;
            }
            l &&
              ((l = !1),
              (document.body.style.overflow = a),
              Be(() => {
                var I;
                s != null && s.isConnected
                  ? s.focus()
                  : (I = document.querySelector(
                      '[data-menu-trigger="more"]',
                    )) == null || I.focus();
              }));
          },
          { immediate: !0 },
        ),
        zn(() => {
          document.body.style.overflow = a;
        }),
        (f, I) =>
          f.open
            ? (P(),
              E(
                "div",
                {
                  key: 0,
                  class: "app-drawer-overlay",
                  role: "presentation",
                  "data-testid": f.testId,
                  onClick: tt(d, ["self"]),
                },
                [
                  r(
                    "aside",
                    {
                      ref_key: "panel",
                      ref: i,
                      class: "app-drawer",
                      role: "dialog",
                      "aria-modal": "true",
                      "aria-labelledby": `${f.drawerId}-title`,
                      "aria-describedby": f.description
                        ? `${f.drawerId}-description`
                        : void 0,
                      tabindex: "-1",
                      onKeydown: p,
                    },
                    [
                      r("header", ef, [
                        r("div", null, [
                          r(
                            "h2",
                            { id: `${f.drawerId}-title` },
                            v(f.title),
                            9,
                            tf,
                          ),
                          f.description
                            ? (P(),
                              E(
                                "p",
                                { key: 0, id: `${f.drawerId}-description` },
                                v(f.description),
                                9,
                                nf,
                              ))
                            : O("", !0),
                        ]),
                        r(
                          "button",
                          {
                            class: "app-drawer-close",
                            type: "button",
                            "aria-label": "关闭",
                            onClick: d,
                          },
                          "关闭",
                        ),
                      ]),
                      r("div", of, [zr(f.$slots, "default")]),
                    ],
                    40,
                    Zc,
                  ),
                ],
                8,
                Xc,
              ))
            : O("", !0)
      );
    },
  }),
  sf = { class: "more-menu", "aria-label": "更多功能" },
  af = { class: "menu-group", "data-menu-group": "fate" },
  rf = { class: "menu-grid" },
  lf = ["disabled"],
  uf = { class: "menu-group", "data-menu-group": "account" },
  df = { class: "menu-grid two-columns" },
  cf = { class: "menu-group", "data-menu-group": "controls" },
  ff = { class: "menu-grid" },
  pf = ["disabled", "aria-pressed"],
  mf = ["disabled"],
  hf = { class: "menu-group", "data-menu-group": "data" },
  gf = { class: "menu-grid two-columns" },
  vf = ["disabled"],
  bf = ["disabled"],
  yf = ["disabled"],
  wf = ["disabled"],
  Sf = { class: "menu-group", "data-menu-group": "about" },
  If = {
    key: 0,
    class: "menu-group dev-menu-group",
    "data-menu-group": "development",
  },
  kf = de({
    __name: "MoreDrawer",
    props: {
      open: { type: Boolean },
      busy: { type: Boolean },
      autoActive: { type: Boolean },
      fufuLabel: {},
      developmentMode: { type: Boolean },
      version: {},
    },
    emits: [
      "close",
      "newFate",
      "character",
      "timeline",
      "wallet",
      "intervention",
      "toggleAuto",
      "fast",
      "settings",
      "save",
      "load",
      "data",
      "about",
      "development",
    ],
    setup(t, { emit: e }) {
      const n = e;
      return (o, i) => (
        P(),
        Ge(
          qn,
          {
            open: o.open,
            title: "更多",
            "drawer-id": "more-menu",
            "test-id": "more-menu",
            description: "命运、账户、控制与数据均在这里。",
            onClose: i[14] || (i[14] = (s) => n("close")),
          },
          {
            default: Un(() => [
              r("nav", sf, [
                r("section", af, [
                  i[15] || (i[15] = r("h3", null, "命运", -1)),
                  r("div", rf, [
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy,
                        "data-menu-action": "new-fate",
                        onClick: i[0] || (i[0] = (s) => n("newFate")),
                      },
                      "新命运",
                      8,
                      lf,
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        "data-menu-action": "character",
                        onClick: i[1] || (i[1] = (s) => n("character")),
                      },
                      "角色",
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        "data-menu-action": "timeline",
                        onClick: i[2] || (i[2] = (s) => n("timeline")),
                      },
                      "纪事",
                    ),
                  ]),
                ]),
                r("section", uf, [
                  i[18] || (i[18] = r("h3", null, "账户", -1)),
                  r("div", df, [
                    r(
                      "button",
                      {
                        type: "button",
                        "data-menu-action": "wallet",
                        onClick: i[3] || (i[3] = (s) => n("wallet")),
                      },
                      i[16] ||
                        (i[16] = [
                          r("span", null, "钱包", -1),
                          r("small", null, "灵币与芙芙", -1),
                        ]),
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        "data-menu-action": "intervention",
                        onClick: i[4] || (i[4] = (s) => n("intervention")),
                      },
                      [
                        i[17] || (i[17] = r("span", null, "命运干预", -1)),
                        r("small", null, "芙芙 " + v(o.fufuLabel) + " 枚", 1),
                      ],
                    ),
                  ]),
                ]),
                r("section", cf, [
                  i[19] || (i[19] = r("h3", null, "控制", -1)),
                  r("div", ff, [
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy && !o.autoActive,
                        "aria-pressed": o.autoActive,
                        "data-menu-action": "auto",
                        onClick: i[5] || (i[5] = (s) => n("toggleAuto")),
                      },
                      v(o.autoActive ? "停止自动" : "自动推进"),
                      9,
                      pf,
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy,
                        "data-menu-action": "fast",
                        onClick: i[6] || (i[6] = (s) => n("fast")),
                      },
                      "极速结算",
                      8,
                      mf,
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        "data-menu-action": "settings",
                        onClick: i[7] || (i[7] = (s) => n("settings")),
                      },
                      "语音、音量与动画",
                    ),
                  ]),
                ]),
                r("section", hf, [
                  i[20] || (i[20] = r("h3", null, "数据", -1)),
                  r("div", gf, [
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy,
                        "data-menu-action": "save",
                        onClick: i[8] || (i[8] = (s) => n("save")),
                      },
                      "保存",
                      8,
                      vf,
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy,
                        "data-menu-action": "load",
                        onClick: i[9] || (i[9] = (s) => n("load")),
                      },
                      "读取",
                      8,
                      bf,
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy,
                        "data-menu-action": "import",
                        onClick: i[10] || (i[10] = (s) => n("data")),
                      },
                      "导入",
                      8,
                      yf,
                    ),
                    r(
                      "button",
                      {
                        type: "button",
                        disabled: o.busy,
                        "data-menu-action": "export",
                        onClick: i[11] || (i[11] = (s) => n("data")),
                      },
                      "导出",
                      8,
                      wf,
                    ),
                  ]),
                ]),
                r("section", Sf, [
                  i[22] || (i[22] = r("h3", null, "关于", -1)),
                  r(
                    "button",
                    {
                      class: "menu-wide-action",
                      type: "button",
                      "data-menu-action": "about",
                      onClick: i[12] || (i[12] = (s) => n("about")),
                    },
                    [
                      i[21] || (i[21] = r("span", null, "说明与免责声明", -1)),
                      r("small", null, "当前版本 " + v(o.version), 1),
                    ],
                  ),
                ]),
                o.developmentMode
                  ? (P(),
                    E("section", If, [
                      i[23] || (i[23] = r("h3", null, "开发", -1)),
                      r(
                        "button",
                        {
                          class: "menu-wide-action",
                          type: "button",
                          "data-menu-action": "development",
                          onClick: i[13] || (i[13] = (s) => n("development")),
                        },
                        "开发者工具",
                      ),
                    ]))
                  : O("", !0),
              ]),
            ]),
            _: 1,
          },
          8,
          ["open"],
        )
      );
    },
  }),
  $f = { class: "wallet-balances", "aria-label": "钱包余额" },
  Pf = { "data-wallet": "session" },
  Cf = { "data-wallet": "fufu" },
  Ef = { class: "wallet-ledger" },
  Lf = { key: 0, class: "empty-state" },
  Af = { key: 1 },
  Rf = de({
    __name: "WalletDrawer",
    props: {
      open: { type: Boolean },
      runCopper: {},
      fufuHundredths: {},
      runTransactions: {},
      fufuTransactions: {},
    },
    emits: ["close"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = _(() =>
          [
            ...n.runTransactions.map((s) => ({ ...s, scope: "灵币" })),
            ...n.fufuTransactions.map((s) => ({ ...s, scope: "芙芙" })),
          ]
            .slice(-12)
            .reverse(),
        );
      return (s, a) => (
        P(),
        Ge(
          qn,
          {
            open: s.open,
            title: "钱包",
            "drawer-id": "wallet-drawer",
            "test-id": "wallet-drawer",
            description: "灵币属于当前命运，芙芙属于跨命运账户。",
            onClose: a[0] || (a[0] = (l) => o("close")),
          },
          {
            default: Un(() => [
              r("section", $f, [
                r("article", Pf, [
                  a[1] || (a[1] = r("span", null, "当前命运 · 灵币", -1)),
                  r("strong", null, v(V(_t)(s.runCopper)), 1),
                  a[2] ||
                    (a[2] = r(
                      "p",
                      null,
                      "100 铜 = 1 银，100 银 = 1 金。结局后清空。",
                      -1,
                    )),
                ]),
                r("article", Cf, [
                  a[3] || (a[3] = r("span", null, "跨局账户 · 芙芙", -1)),
                  r("strong", null, v(V(xt)(s.fufuHundredths)) + " 枚", 1),
                  a[4] ||
                    (a[4] = r(
                      "p",
                      null,
                      "命运干预每次成功提交消耗 1 枚；撤销不退还。",
                      -1,
                    )),
                ]),
              ]),
              r("section", Ef, [
                a[5] || (a[5] = r("h3", null, "最近交易", -1)),
                i.value.length
                  ? (P(),
                    E("ol", Af, [
                      (P(!0),
                      E(
                        me,
                        null,
                        Ye(
                          i.value,
                          (l) => (
                            P(),
                            E("li", { key: `${l.scope}:${l.id}` }, [
                              r(
                                "span",
                                null,
                                v(l.scope) + " · " + v(l.reason),
                                1,
                              ),
                              r(
                                "b",
                                { class: dt(l.direction) },
                                v(l.direction === "credit" ? "+" : "−") +
                                  v(
                                    l.currency === "run-copper"
                                      ? V(_t)(l.amount)
                                      : `${V(xt)(l.amount)} 枚`,
                                  ),
                                3,
                              ),
                            ])
                          ),
                        ),
                        128,
                      )),
                    ]))
                  : (P(), E("p", Lf, "尚无交易记录")),
              ]),
            ]),
            _: 1,
          },
          8,
          ["open"],
        )
      );
    },
  }),
  _f = { class: "intervention-balance", "aria-live": "polite" },
  Tf = { class: "intervention-section" },
  xf = { key: 0, class: "intervention-wheel" },
  Of = { key: 1, class: "intervention-unavailable" },
  Mf = ["disabled"],
  Bf = { class: "intervention-section" },
  Nf = ["disabled"],
  Df = ["value"],
  Ff = ["disabled"],
  Vf = { key: 0, class: "intervention-current" },
  jf = { key: 0, class: "intervention-message", role: "status" },
  zf = { key: 1, class: "intervention-section intervention-undo" },
  Uf = ["disabled"],
  Wf = 100,
  qf = de({
    __name: "FateInterventionDrawer",
    props: {
      open: { type: Boolean },
      balanceHundredths: {},
      cheatPool: { default: void 0 },
      currentPool: { default: void 0 },
      availableOptionIds: { default: void 0 },
      forcedOptionId: { default: void 0 },
      wheelDuration: { default: 3600 },
      reducedMotion: { type: Boolean, default: !1 },
      resolveDraw: {},
      commitDraw: {},
      cancelDraw: {},
      purchaseForcedResult: {},
      canUndoIntervention: { type: Boolean },
      undoIntervention: {},
    },
    emits: ["close", "changed"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T(null),
        s = T(null),
        a = T(0),
        l = T(!1),
        u = T(""),
        d = T(""),
        p = _(() => n.balanceHundredths >= Wf),
        f = _(() => (n.cheatPool ? na(n.cheatPool.options, []) : [])),
        I = _(() => {
          var h;
          return (
            ((h = n.currentPool) == null
              ? void 0
              : h.options.filter(
                  ($) =>
                    $.enabled !== !1 &&
                    (!n.availableOptionIds ||
                      n.availableOptionIds.includes($.id)),
                )) ?? []
          );
        }),
        k = _(() => {
          var h;
          return `intervention:${a.value}:${((h = n.cheatPool) == null ? void 0 : h.id) ?? "none"}`;
        });
      (Ee(
        () => {
          var h;
          return (h = n.currentPool) == null ? void 0 : h.id;
        },
        () => {
          d.value = "";
        },
      ),
        Ee(
          () => n.open,
          (h) => {
            h ? (u.value = "") : g(!0);
          },
        ));
      function g(h = !0) {
        (h && i.value && n.cancelDraw(),
          (i.value = null),
          (s.value = null),
          (l.value = !1),
          (a.value += 1));
      }
      function w() {
        (g(!0), o("close"));
      }
      function b() {
        if (i.value || l.value || !p.value || !n.cheatPool) return;
        u.value = "";
        const h = n.resolveDraw();
        if (!h) {
          u.value = "当前无法进行命运干预，请稍后再试。";
          return;
        }
        const $ = f.value.findIndex((N) => N.id === h.id);
        if ($ < 0) {
          (n.cancelDraw(), (u.value = "干预结果不在正式转盘中。"));
          return;
        }
        ((i.value = h), (s.value = $));
      }
      function c(h) {
        const $ = i.value;
        if (!$ || s.value !== h || l.value) return;
        ((l.value = !0),
          n.commitDraw($.id)
            ? ((u.value = `干预已提交：${A($.text)}`),
              (i.value = null),
              (s.value = null),
              (a.value += 1),
              o("changed"))
            : (n.cancelDraw(),
              (u.value = "干预未能提交，本次未扣除芙芙。"),
              g(!1)),
          (l.value = !1));
      }
      function L() {
        if (!n.currentPool || !d.value || !p.value || l.value) return;
        l.value = !0;
        const h = I.value.find((N) => N.id === d.value),
          $ = n.purchaseForcedResult(n.currentPool.id, d.value);
        ((u.value = $
          ? `已干预下次结果：${A((h == null ? void 0 : h.text) ?? "指定结果")}`
          : "未能锁定下次结果，本次未扣除芙芙。"),
          $ && o("changed"),
          (l.value = !1));
      }
      function m() {
        if (l.value || !n.canUndoIntervention) return;
        l.value = !0;
        const h = n.undoIntervention();
        ((u.value = h
          ? "最近一次干预效果已撤销；已支付的芙芙不会返还。"
          : "最近一次干预无法撤销。"),
          h && o("changed"),
          (l.value = !1));
      }
      return (h, $) => (
        P(),
        Ge(
          qn,
          {
            open: h.open,
            title: "命运干预",
            "drawer-id": "fate-intervention",
            "test-id": "fate-intervention-drawer",
            description: "正式干预会消耗芙芙的硬币，查看与取消不会扣费。",
            onClose: w,
          },
          {
            default: Un(() => [
              r("section", _f, [
                $[1] || ($[1] = r("span", null, "当前芙芙", -1)),
                r("strong", null, v(V(xt)(h.balanceHundredths)) + " 枚", 1),
                $[2] || ($[2] = r("small", null, "每次成功提交需要 1 枚", -1)),
              ]),
              r("section", Tf, [
                $[3] || ($[3] = r("h3", null, "干预转盘", -1)),
                $[4] ||
                  ($[4] = r(
                    "p",
                    null,
                    "结果由正式作弊池抽取；动画只展示已由控制器确定的结果。",
                    -1,
                  )),
                h.cheatPool
                  ? (P(),
                    E("div", xf, [
                      Se(
                        Qo,
                        {
                          items: f.value,
                          "wheel-key": k.value,
                          "target-index": s.value,
                          duration: h.wheelDuration,
                          disabled: !!i.value || l.value || !p.value,
                          "reduced-motion": h.reducedMotion,
                          onSpinEnd: c,
                        },
                        null,
                        8,
                        [
                          "items",
                          "wheel-key",
                          "target-index",
                          "duration",
                          "disabled",
                          "reduced-motion",
                        ],
                      ),
                    ]))
                  : (P(),
                    E(
                      "p",
                      Of,
                      "先完成时期抽取，正式干预池将在进入对应世界后开放。",
                    )),
                r(
                  "button",
                  {
                    class: "intervention-primary",
                    type: "button",
                    disabled: !h.cheatPool || !p.value || !!i.value || l.value,
                    "data-intervention-action": "draw",
                    onClick: b,
                  },
                  v(
                    i.value
                      ? "命运转动中"
                      : p.value
                        ? "消耗 1 枚并提交结果"
                        : `需要 1 枚，当前 ${V(xt)(h.balanceHundredths)} 枚`,
                  ),
                  9,
                  Mf,
                ),
              ]),
              r("section", Bf, [
                $[6] || ($[6] = r("h3", null, "锁定下次结果", -1)),
                $[7] ||
                  ($[7] = r(
                    "p",
                    null,
                    "仅可选择当前正式流程中满足条件的结果；成功锁定时消耗 1 枚。",
                    -1,
                  )),
                Ze(
                  r(
                    "select",
                    {
                      "onUpdate:modelValue":
                        $[0] || ($[0] = (N) => (d.value = N)),
                      "aria-label": "选择下次正式结果",
                      disabled: !I.value.length || l.value,
                    },
                    [
                      $[5] ||
                        ($[5] = r("option", { value: "" }, "选择下次结果", -1)),
                      (P(!0),
                      E(
                        me,
                        null,
                        Ye(
                          I.value,
                          (N) => (
                            P(),
                            E(
                              "option",
                              { key: N.id, value: N.id },
                              v(V(A)(N.text)),
                              9,
                              Df,
                            )
                          ),
                        ),
                        128,
                      )),
                    ],
                    8,
                    Nf,
                  ),
                  [[Rt, d.value]],
                ),
                r(
                  "button",
                  {
                    class: "intervention-secondary",
                    type: "button",
                    disabled: !p.value || !d.value || l.value,
                    "data-intervention-action": "force-result",
                    onClick: L,
                  },
                  v(p.value ? "消耗 1 枚并锁定" : "芙芙余额不足"),
                  9,
                  Ff,
                ),
                h.forcedOptionId
                  ? (P(), E("p", Vf, "当前流程已有一项干预锁定。"))
                  : O("", !0),
              ]),
              u.value ? (P(), E("p", jf, v(u.value), 1)) : O("", !0),
              h.canUndoIntervention
                ? (P(),
                  E("section", zf, [
                    $[8] || ($[8] = r("h3", null, "撤销最近干预", -1)),
                    $[9] ||
                      ($[9] = r(
                        "p",
                        null,
                        "干预产生的本局效果会回滚；已经支付的芙芙不返还，再次干预仍需重新付费。",
                        -1,
                      )),
                    r(
                      "button",
                      {
                        class: "intervention-secondary",
                        type: "button",
                        disabled: l.value || !!i.value,
                        "data-intervention-action": "undo",
                        onClick: m,
                      },
                      "撤销干预效果（芙芙不退）",
                      8,
                      Uf,
                    ),
                  ]))
                : O("", !0),
            ]),
            _: 1,
          },
          8,
          ["open"],
        )
      );
    },
  }),
  Gf = { class: "about-section" },
  Hf = { class: "about-version" },
  Yf = { class: "about-section" },
  Kf = de({
    __name: "AboutDrawer",
    props: { open: { type: Boolean }, version: {} },
    emits: ["close", "antiResale"],
    setup(t, { emit: e }) {
      const n = e;
      return (o, i) => (
        P(),
        Ge(
          qn,
          {
            open: o.open,
            title: "关于斗灵命途",
            "drawer-id": "about-game",
            "test-id": "about-drawer",
            description: "版本、使用说明与非商业同人声明。",
            onClose: i[1] || (i[1] = (s) => n("close")),
          },
          {
            default: Un(() => [
              r("section", Gf, [
                i[2] || (i[2] = r("h3", null, "当前版本", -1)),
                r("p", Hf, "V" + v(o.version), 1),
              ]),
              i[6] ||
                (i[6] = r(
                  "section",
                  { class: "about-section" },
                  [
                    r("h3", null, "玩法说明"),
                    r(
                      "p",
                      null,
                      "路线、世界线与穿越时期均由正式转盘决定；相同种子与相同操作会得到相同结果。",
                    ),
                    r(
                      "p",
                      null,
                      "本局灵币会在命运结束时清空，芙芙属于跨局账户。命运干预成功提交时才会消耗芙芙。",
                    ),
                  ],
                  -1,
                )),
              r("section", Yf, [
                i[3] || (i[3] = r("h3", null, "免责声明", -1)),
                i[4] ||
                  (i[4] = r(
                    "p",
                    null,
                    "本作为非官方、完全免费的同人游戏，未取得原著版权方授权，不主张原著角色、设定与情节的相关权利。",
                    -1,
                  )),
                i[5] ||
                  (i[5] = r(
                    "p",
                    null,
                    "请勿购买、倒卖或安装来源不明的二次打包版本。",
                    -1,
                  )),
                r(
                  "button",
                  {
                    class: "menu-wide-action",
                    type: "button",
                    onClick: i[0] || (i[0] = (s) => n("antiResale")),
                  },
                  "查看防倒卖与安全说明",
                ),
              ]),
            ]),
            _: 1,
          },
          8,
          ["open"],
        )
      );
    },
  }),
  Jf = { key: 0, class: "ending-overlay" },
  Qf = { class: "ending-card" },
  Xf = { key: 0, class: "ending-text" },
  Zf = { key: 1, class: "death-cause" },
  ep = { key: 2, class: "death-cause", "data-ending": "soul-bone-requirement" },
  tp = { class: "ending-actions" },
  np = de({
    __name: "EndingModal",
    props: { game: {} },
    emits: ["close", "exportBiography"],
    setup(t) {
      const e = t,
        n = _(() => e.game.character.ending),
        o = _(() => A(ia(n.value) ?? "")),
        i = _(() => A(oa(n.value) ?? "")),
        s = _(() => ua(e.game.character)),
        a = _(() => {
          var w, b, c, L;
          return !!(
            ((b = (w = n.value) == null ? void 0 : w.cause) != null &&
              b.includes("missing-six-soul-bones")) ||
            ((L = (c = n.value) == null ? void 0 : c.deathCause) != null &&
              L.includes("missing-six-soul-bones"))
          );
        }),
        l = _(() => s.value.missingSlots.map((w) => ra[w]).join("、")),
        u = _(() => sa(e.game.character)),
        d = _(() => e.game.character.beast ?? e.game.character.beastOrigin),
        p = _(() => {
          const w = Zo(d.value);
          return w ? A(w) : void 0;
        }),
        f = _(() => {
          var b;
          const w = e.game.character;
          return w.route === "beast" &&
            (b = w.beast) != null &&
            b.bloodlines.length
            ? A(
                w.beast.bloodlines
                  .map((c) => `${c.selection.text}${Xo(c.percentage)}%`)
                  .join("、"),
              )
            : A(w.bloodlines.join("、")) || "无";
        }),
        I = _(
          () =>
            ({ human: "人类灵师", beast: "灵兽", transformed: "灵兽化形" })[
              e.game.character.route
            ],
        ),
        k = _(() => {
          var w;
          return {
            alive: "存活",
            dead: "已陨落",
            god: "正式神祇",
            "pseudo-god": "自斩神位",
          }[((w = n.value) == null ? void 0 : w.finalStatus) ?? "alive"];
        }),
        g = _(() => {
          var b;
          const w = (b = n.value) == null ? void 0 : b.godhoodAtEnding;
          return w
            ? A(`${w.name ?? w.id}${w.tier ? `（${w.tier}）` : ""}`)
            : "无";
        });
      return (w, b) => {
        var c;
        return w.game.finished && n.value
          ? (P(),
            E("div", Jf, [
              r("section", Qf, [
                b[16] || (b[16] = r("span", null, "命运终章", -1)),
                r("h2", null, v(V(A)(n.value.title)), 1),
                o.value ? (P(), E("p", Xf, v(o.value), 1)) : O("", !0),
                i.value
                  ? (P(), E("p", Zf, "陨落原因：" + v(i.value), 1))
                  : O("", !0),
                a.value
                  ? (P(),
                    E(
                      "p",
                      ep,
                      "神铠着装失败：六大常规灵骨 " +
                        v(s.value.regularCount) +
                        "/6，缺少 " +
                        v(l.value || "无") +
                        "；外附灵骨 " +
                        v(s.value.externalCount) +
                        " 块，不计入六大常规灵骨要求。",
                      1,
                    ))
                  : O("", !0),
                r("dl", null, [
                  b[6] || (b[6] = r("dt", null, "角色路线", -1)),
                  r("dd", null, v(I.value), 1),
                  b[7] || (b[7] = r("dt", null, "最终年龄", -1)),
                  r("dd", null, v(u.value.toLocaleString()) + " 岁", 1),
                  w.game.character.route === "beast"
                    ? (P(),
                      E(
                        me,
                        { key: 0 },
                        [
                          b[2] || (b[2] = r("dt", null, "最终修为", -1)),
                          r(
                            "dd",
                            null,
                            v(
                              (
                                n.value.finalBeastYears ??
                                w.game.character.beastYears
                              ).toLocaleString(),
                            ) + " 年",
                            1,
                          ),
                        ],
                        64,
                      ))
                    : (P(),
                      E(
                        me,
                        { key: 1 },
                        [
                          b[3] || (b[3] = r("dt", null, "最终等级", -1)),
                          r(
                            "dd",
                            null,
                            v(n.value.finalLevel ?? w.game.character.level) +
                              " 级",
                            1,
                          ),
                        ],
                        64,
                      )),
                  b[8] || (b[8] = r("dt", null, "最终状态", -1)),
                  r("dd", null, v(k.value), 1),
                  d.value
                    ? (P(),
                      E(
                        me,
                        { key: 2 },
                        [
                          r(
                            "dt",
                            null,
                            v(
                              w.game.character.route === "transformed"
                                ? "灵兽原身名号"
                                : "灵兽名号",
                            ),
                            1,
                          ),
                          r("dd", null, v(p.value ?? "尚未获得"), 1),
                          b[4] || (b[4] = r("dt", null, "名称前缀", -1)),
                          r(
                            "dd",
                            null,
                            v(V(A)(d.value.namePrefixes.join("、")) || "无"),
                            1,
                          ),
                          b[5] || (b[5] = r("dt", null, "名称后缀", -1)),
                          r(
                            "dd",
                            null,
                            v(V(A)(d.value.nameSuffixes.join("、")) || "无"),
                            1,
                          ),
                        ],
                        64,
                      ))
                    : O("", !0),
                  b[9] || (b[9] = r("dt", null, "神位", -1)),
                  r("dd", null, v(g.value), 1),
                  b[10] || (b[10] = r("dt", null, "阵营", -1)),
                  r(
                    "dd",
                    null,
                    v(
                      V(A)(
                        ((c = w.game.character.faction) == null
                          ? void 0
                          : c.text) ?? "",
                      ) || "无",
                    ),
                    1,
                  ),
                  b[11] || (b[11] = r("dt", null, "武灵", -1)),
                  r(
                    "dd",
                    null,
                    v(
                      V(A)(
                        w.game.character.martialSouls
                          .map((L) => L.name)
                          .join(" / "),
                      ) || "无",
                    ),
                    1,
                  ),
                  b[12] || (b[12] = r("dt", null, "血脉", -1)),
                  r("dd", null, v(f.value), 1),
                  b[13] || (b[13] = r("dt", null, "称号", -1)),
                  r(
                    "dd",
                    null,
                    v(V(A)(w.game.character.titles.join("、")) || "无"),
                    1,
                  ),
                  b[14] || (b[14] = r("dt", null, "领域", -1)),
                  r(
                    "dd",
                    null,
                    v(V(A)(V(Js)(w.game.character).join("、")) || "无"),
                    1,
                  ),
                  b[15] || (b[15] = r("dt", null, "命运种子", -1)),
                  r("dd", null, v(V(A)(w.game.random.seed)), 1),
                ]),
                (P(!0),
                E(
                  me,
                  null,
                  Ye(
                    w.game.character.martialSouls,
                    (L, m) => (
                      P(),
                      E(
                        "section",
                        { key: `${m}:${L.id}`, class: "ending-soul" },
                        [
                          r(
                            "b",
                            null,
                            "第" + v(m + 1) + "武灵 · " + v(V(A)(L.name)),
                            1,
                          ),
                          r(
                            "p",
                            null,
                            v(
                              L.rings.length
                                ? V(A)(
                                    L.rings
                                      .map(
                                        (h, $) =>
                                          `${$ + 1}环 ${h.years.toLocaleString()}年`,
                                      )
                                      .join(" · "),
                                  )
                                : "尚无灵环",
                            ),
                            1,
                          ),
                        ],
                      )
                    ),
                  ),
                  128,
                )),
                r("div", tp, [
                  r(
                    "button",
                    {
                      type: "button",
                      onClick:
                        b[0] || (b[0] = (L) => w.$emit("exportBiography")),
                    },
                    "导出命运传记",
                  ),
                  r(
                    "button",
                    {
                      class: "ending-close",
                      type: "button",
                      onClick: b[1] || (b[1] = (L) => w.$emit("close")),
                    },
                    "关闭",
                  ),
                ]),
              ]),
            ]))
          : O("", !0);
      };
    },
  }),
  op = {
    class: "undo-dialog",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "undo-dialog-title",
    "aria-describedby": "undo-dialog-description",
  },
  ip = { class: "undo-cost", "data-testid": "undo-cost" },
  sp = { key: 0, class: "undo-insufficient", role: "status" },
  ap = { class: "undo-dialog-actions" },
  rp = ["disabled"],
  lp = ["disabled"],
  up = ["disabled"],
  dp = de({
    __name: "UndoSpinDialog",
    props: {
      open: { type: Boolean },
      busy: { type: Boolean },
      affordable: { type: Boolean },
      costLabel: {},
      balanceLabel: {},
      shortfallLabel: {},
    },
    emits: ["undo", "reroll", "cancel"],
    setup(t, { emit: e }) {
      const n = t,
        o = e;
      function i() {
        n.busy || o("cancel");
      }
      return (s, a) =>
        s.open
          ? (P(),
            E(
              "div",
              {
                key: 0,
                class: "undo-dialog-overlay",
                role: "presentation",
                onClick: tt(i, ["self"]),
                onKeydown: Bs(i, ["esc"]),
              },
              [
                r("section", op, [
                  a[4] ||
                    (a[4] = r(
                      "h2",
                      { id: "undo-dialog-title" },
                      "撤销本次抽取？",
                      -1,
                    )),
                  a[5] ||
                    (a[5] = r(
                      "p",
                      { id: "undo-dialog-description" },
                      " 仅撤销会回到本次抽取前。撤销并重新抽取会回到抽取前，默认排除刚才的结果，并使用新的随机数再次抽取；若只有一个合法结果则仍会抽到它。 ",
                      -1,
                    )),
                  r("div", ip, [
                    r("p", null, [
                      a[2] || (a[2] = _e("本阶段每次撤销/重抽需要消耗：")),
                      r("strong", null, v(s.costLabel), 1),
                    ]),
                    r("p", null, [
                      a[3] || (a[3] = _e("当前余额：")),
                      r("strong", null, v(s.balanceLabel), 1),
                    ]),
                    s.affordable
                      ? O("", !0)
                      : (P(),
                        E("p", sp, "余额不足，还差 " + v(s.shortfallLabel), 1)),
                  ]),
                  r("div", ap, [
                    r(
                      "button",
                      {
                        class: "undo-dialog-secondary",
                        type: "button",
                        disabled: s.busy || !s.affordable,
                        onClick: a[0] || (a[0] = (l) => o("undo")),
                      },
                      " 仅撤销（消耗 " + v(s.costLabel) + "） ",
                      9,
                      rp,
                    ),
                    r(
                      "button",
                      {
                        class: "undo-dialog-primary",
                        type: "button",
                        disabled: s.busy || !s.affordable,
                        onClick: a[1] || (a[1] = (l) => o("reroll")),
                      },
                      v(
                        s.busy
                          ? "处理中…"
                          : `撤销并重新抽取（消耗 ${s.costLabel}）`,
                      ),
                      9,
                      lp,
                    ),
                    r(
                      "button",
                      {
                        class: "undo-dialog-cancel",
                        type: "button",
                        disabled: s.busy,
                        onClick: i,
                      },
                      " 取消 ",
                      8,
                      up,
                    ),
                  ]),
                ]),
              ],
              32,
            ))
          : O("", !0);
    },
  }),
  cp = { class: "anti-resale-screen" },
  fp = {
    class: "anti-resale-card",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "anti-resale-title",
    "aria-describedby": "anti-resale-summary",
  },
  pp = { class: "notice-content", tabindex: "0" },
  mp = { class: "evidence-gallery", "aria-label": "疑似收费转售页面示例" },
  hp = ["aria-label", "onClick"],
  gp = ["src", "alt", "onError"],
  vp = {
    key: 1,
    class: "image-fallback",
    role: "status",
    "aria-live": "polite",
  },
  bp = ["open"],
  yp = { class: "notice-actions" },
  wp = ["aria-expanded"],
  Sp = {
    class: "image-preview-panel",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "evidence-preview-title",
  },
  Ip = { id: "evidence-preview-title" },
  kp = { class: "image-preview-scroll" },
  $p = ["src", "alt"],
  Pp = de({
    __name: "AntiResaleNotice",
    props: { allowClose: { type: Boolean, default: !1 } },
    emits: ["confirm", "close"],
    setup(t, { emit: e }) {
      const n = t,
        o = e,
        i = T([]),
        s = T(null),
        a = T(!1),
        l = T(null),
        u = T(null),
        d = [
          {
            id: "listing-grid",
            src: "./assets/anti-resale/xianyu-resale-warning.jpg",
            title: "收费转售账号及商品记录",
            caption:
              "按本次提供的完整截图展示账号页、服务次数、商品价格和热度等信息。",
            alt: "闲鱼账号及服务页面完整截图，包含疑似收费转售历史旧版“斗罗转盘”游戏资源的商品、价格、热度和公开账号资料",
          },
          {
            id: "listing-detail",
            src: "./assets/anti-resale/xianyu-resale-detail-warning.jpg",
            title: "收费转售商品详情示例",
            caption:
              "保留商品标题、已售数量、价格、介绍和游戏截图，系统导航与操作栏已经裁剪。",
            alt: "闲鱼疑似收费转售历史旧版“斗罗转盘”游戏资源的商品详情截图，显示已售三十余、价格三点八八元及游戏页面",
          },
        ],
        p = _(() => d.find((L) => L.id === s.value)),
        f = _(() => !!p.value);
      function I(L) {
        return !i.value.includes(L);
      }
      function k(L) {
        I(L.id) && (s.value = L.id);
      }
      function g() {
        s.value = null;
      }
      function w(L) {
        (i.value.includes(L) || (i.value = [...i.value, L]),
          s.value === L && g());
      }
      async function b() {
        var L;
        ((a.value = !a.value),
          a.value &&
            (await Be(),
            (L = l.value) == null || L.scrollIntoView({ block: "nearest" })));
      }
      function c(L) {
        if (L.key === "Escape") {
          if (f.value) {
            g();
            return;
          }
          n.allowClose && o("close");
        }
      }
      return (
        Qt(async () => {
          var L;
          (document.addEventListener("keydown", c),
            await Be(),
            (L = u.value) == null || L.focus());
        }),
        zn(() => {
          document.removeEventListener("keydown", c);
        }),
        (L, m) => (
          P(),
          E("div", cp, [
            r("section", fp, [
              m[10] ||
                (m[10] = r(
                  "header",
                  { class: "notice-header" },
                  [
                    r(
                      "span",
                      { class: "warning-mark", "aria-hidden": "true" },
                      "!",
                    ),
                    r("div", null, [
                      r("p", null, "斗灵命运转盘"),
                      r("h1", { id: "anti-resale-title" }, "请勿购买倒卖版本"),
                    ]),
                  ],
                  -1,
                )),
              r("div", pp, [
                m[8] ||
                  (m[8] = Go(
                    '<p class="free-badge" data-v-507515a9>官方版本：永久免费</p><p id="anti-resale-summary" class="key-warning" data-v-507515a9><strong data-v-507515a9>本游戏官方版本永久免费。</strong>如果你通过截图所示渠道付费购买， 你可能购买了未经授权转售或二次打包的版本，请尽快申请退款并根据实际情况举报相关商品。 </p><p class="historical-evidence-note" data-v-507515a9> 下方截图保留历史旧版名称与界面，仅用于说明疑似收费转售情况；第一张按本次提供的完整原图展示，第二张沿用此前的证据裁剪版。 </p><section class="copy-section" aria-labelledby="free-release-title" data-v-507515a9><h2 id="free-release-title" data-v-507515a9>免费制作与发布</h2><p data-v-507515a9> 本游戏由开发者和社区成员免费制作、免费发布，不会通过闲鱼等二手交易平台向玩家收取安装包费用。 </p><p data-v-507515a9> 如果你通过截图所示渠道付费购买了本游戏，你购买的可能是未经授权转售或二次打包的版本。 </p></section>',
                    4,
                  )),
                r("div", mp, [
                  (P(),
                  E(
                    me,
                    null,
                    Ye(d, (h) =>
                      r("figure", { key: h.id, class: "evidence-card" }, [
                        r("figcaption", null, [
                          r("strong", null, v(h.title), 1),
                          r(
                            "span",
                            null,
                            v(h.caption) + "点击图片可放大查看。",
                            1,
                          ),
                        ]),
                        I(h.id)
                          ? (P(),
                            E(
                              "button",
                              {
                                key: 0,
                                class: "evidence-image-button",
                                type: "button",
                                "aria-label": `放大查看已脱敏的${h.title}`,
                                onClick: ($) => k(h),
                              },
                              [
                                r(
                                  "img",
                                  {
                                    src: h.src,
                                    alt: h.alt,
                                    onError: ($) => w(h.id),
                                  },
                                  null,
                                  40,
                                  gp,
                                ),
                                m[3] ||
                                  (m[3] = r(
                                    "span",
                                    { "aria-hidden": "true" },
                                    "点击放大",
                                    -1,
                                  )),
                              ],
                              8,
                              hp,
                            ))
                          : (P(),
                            E(
                              "div",
                              vp,
                              m[4] ||
                                (m[4] = [
                                  r(
                                    "span",
                                    { "aria-hidden": "true" },
                                    "图",
                                    -1,
                                  ),
                                  r(
                                    "p",
                                    null,
                                    "这张证据图片暂时无法加载，不影响阅读提醒或继续游戏。",
                                    -1,
                                  ),
                                ]),
                            )),
                      ]),
                    ),
                    64,
                  )),
                ]),
                m[9] ||
                  (m[9] = r(
                    "section",
                    {
                      class: "advice-card",
                      "aria-labelledby": "safety-advice-title",
                    },
                    [
                      r("h2", { id: "safety-advice-title" }, "退款与安全建议"),
                      r(
                        "p",
                        null,
                        " 请尽快向交易平台申请退款，并根据实际情况举报相关商品。为了设备和存档安全，请勿继续安装来源不明的 APK。 ",
                      ),
                    ],
                    -1,
                  )),
                r(
                  "details",
                  {
                    ref_key: "reportGuideElement",
                    ref: l,
                    id: "anti-resale-report-guide",
                    class: "report-guide",
                    open: a.value,
                  },
                  [
                    r(
                      "summary",
                      { onClick: tt(b, ["prevent"]) },
                      "举报操作说明",
                    ),
                    m[5] ||
                      (m[5] = r(
                        "ol",
                        null,
                        [
                          r("li", null, "打开对应闲鱼商品页面；"),
                          r("li", null, "点击右上角“…”；"),
                          r("li", null, "选择举报或反馈入口；"),
                          r("li", null, "根据实际情况选择最接近的类别；"),
                          r("li", null, "提交商品截图和官方免费声明；"),
                          r(
                            "li",
                            null,
                            "如已付款，优先申请退款并保存交易记录。",
                          ),
                        ],
                        -1,
                      )),
                    m[6] ||
                      (m[6] = r(
                        "p",
                        null,
                        " 举报时请如实描述情况并提交商品截图，请勿辱骂、骚扰卖家或公开其个人信息。正式的知识产权投诉由项目权利人处理。 ",
                        -1,
                      )),
                    m[7] ||
                      (m[7] = r(
                        "p",
                        { class: "report-note" },
                        "你不需要完成举报，也可以继续进入游戏。",
                        -1,
                      )),
                  ],
                  8,
                  bp,
                ),
              ]),
              r("footer", yp, [
                r(
                  "button",
                  {
                    ref_key: "confirmButton",
                    ref: u,
                    class: "primary-action",
                    type: "button",
                    onClick: m[0] || (m[0] = (h) => L.$emit("confirm")),
                  },
                  " 我知道了，继续游戏 ",
                  512,
                ),
                r(
                  "button",
                  {
                    class: "secondary-action",
                    type: "button",
                    "aria-controls": "anti-resale-report-guide",
                    "aria-expanded": a.value,
                    onClick: b,
                  },
                  v(a.value ? "收起举报说明" : "查看举报说明"),
                  9,
                  wp,
                ),
                L.allowClose
                  ? (P(),
                    E(
                      "button",
                      {
                        key: 0,
                        class: "secondary-action",
                        type: "button",
                        onClick: m[1] || (m[1] = (h) => L.$emit("close")),
                      },
                      " 关闭提醒 ",
                    ))
                  : O("", !0),
              ]),
            ]),
            p.value
              ? (P(),
                E(
                  "div",
                  {
                    key: 0,
                    class: "image-preview",
                    role: "presentation",
                    onClick: tt(g, ["self"]),
                  },
                  [
                    r("section", Sp, [
                      r("header", null, [
                        r("h2", Ip, v(p.value.title), 1),
                        r(
                          "button",
                          {
                            type: "button",
                            "aria-label": "关闭图片预览",
                            onClick: g,
                          },
                          "×",
                        ),
                      ]),
                      r("div", kp, [
                        r(
                          "img",
                          {
                            src: p.value.src,
                            alt: p.value.alt,
                            onError: m[2] || (m[2] = (h) => w(p.value.id)),
                          },
                          null,
                          40,
                          $p,
                        ),
                      ]),
                    ]),
                  ],
                ))
              : O("", !0),
          ])
        )
      );
    },
  }),
  da = jn(Pp, [["__scopeId", "data-v-507515a9"]]);
class ce extends Error {
  constructor(e) {
    (super(e), (this.name = "ContentPackError"));
  }
}
function Bn(t, e, n) {
  return ca(n, e) ? n : `${t}:${e}.${n}`;
}
function ca(t, e) {
  const n = `:${e}.`;
  return t.indexOf(n) > 0;
}
class po {
  constructor(e, n, o, i) {
    ((this.packId = e),
      (this.kind = n),
      (this.base = new Map()),
      (this.explicit = new Map()),
      (this.canonicalByRuntime = new Map()));
    for (const s of o) {
      const a = typeof s == "string" ? s : s.id,
        l = typeof s == "string" ? e : (s.canonicalOwner ?? e),
        u = typeof s == "string" ? Bn(l, n, a) : (s.canonicalId ?? Bn(l, n, a));
      (this.addBase(a, a),
        this.addBase(u, a),
        this.canonicalByRuntime.set(a, u));
    }
    for (const { alias: s, target: a } of i) {
      const l = this.explicit.get(s);
      if (l && l !== a)
        throw new ce(`${e} maps ${n} alias ${s} to multiple targets`);
      this.explicit.set(s, a);
    }
    for (const [s, a] of this.explicit) {
      const l = this.resolve(a, [s]),
        u = this.base.get(s);
      if (u && u !== l)
        throw new ce(`${e} alias ${s} conflicts with an existing ${n} ID`);
    }
  }
  addBase(e, n) {
    const o = this.base.get(e);
    if (o && o !== n)
      throw new ce(`${this.packId} has ambiguous ${this.kind} alias ${e}`);
    this.base.set(e, n);
  }
  resolve(e, n = []) {
    const o = this.base.get(e);
    if (o) return o;
    const i = this.explicit.get(e);
    if (!i) throw new ce(`${this.packId} has no ${this.kind} ID ${e}`);
    if (n.includes(e))
      throw new ce(
        `${this.packId} has a cyclic ${this.kind} alias: ${[...n, e].join(" -> ")}`,
      );
    return this.resolve(i, [...n, e]);
  }
  canonical(e) {
    const n = this.resolve(e),
      o = this.canonicalByRuntime.get(n);
    if (!o)
      throw new ce(`${this.packId} cannot canonicalize ${this.kind} ID ${e}`);
    return o;
  }
}
class Cp {
  constructor(e, n, o) {
    ((this.packId = e),
      (this.targetsByAlias = new Map()),
      (this.canonicalByScope = new Map()),
      (this.explicit = new Map()));
    const i = new Map();
    for (const s of n) i.set(s.id, (i.get(s.id) ?? 0) + 1);
    for (const s of n) {
      const a = s.canonicalOwner ?? e,
        l = ca(s.id, "option")
          ? s.id
          : i.get(s.id) === 1
            ? Bn(a, "option", s.id)
            : Bn(a, "option", `${s.id}@${encodeURIComponent(s.poolId)}`);
      (this.addTarget(s.id, s),
        this.addTarget(l, s),
        this.canonicalByScope.set(this.scopeKey(s), l));
    }
    for (const { alias: s, target: a } of o) {
      const l = this.explicit.get(s);
      if (l && l !== a)
        throw new ce(`${e} maps option alias ${s} to multiple targets`);
      this.explicit.set(s, a);
    }
    for (const [s, a] of this.explicit) {
      const l = this.resolveTargets(a, [s]);
      if (l.length !== 1)
        throw new ce(`${e} option alias ${s} maps to multiple scoped options`);
      const u = this.targetsByAlias.get(s);
      if (u && (u.length !== 1 || this.scopeKey(u[0]) !== this.scopeKey(l[0])))
        throw new ce(
          `${e} option alias ${s} conflicts with an existing option ID`,
        );
    }
  }
  scopeKey(e) {
    return `${e.poolId}\0${e.id}`;
  }
  addTarget(e, n) {
    const o = this.targetsByAlias.get(e) ?? [];
    (o.some((i) => this.scopeKey(i) === this.scopeKey(n)) || o.push(n),
      this.targetsByAlias.set(e, o));
  }
  resolveTargets(e, n = []) {
    const o = this.targetsByAlias.get(e);
    if (o) return o;
    const i = this.explicit.get(e);
    if (!i) throw new ce(`${this.packId} has no option ID ${e}`);
    if (n.includes(e))
      throw new ce(
        `${this.packId} has a cyclic option alias: ${[...n, e].join(" -> ")}`,
      );
    return this.resolveTargets(i, [...n, e]);
  }
  resolve(e, n) {
    const o = this.resolveTargets(e).filter(
      (i) => n === void 0 || i.poolId === n,
    );
    if (o.length !== 1) {
      const i = n ? ` in pool ${n}` : "";
      throw new ce(`${this.packId} has ambiguous option ID ${e}${i}`);
    }
    return o[0].id;
  }
  canonical(e, n) {
    const o = this.resolveTargets(e).filter(
      (s) => n === void 0 || s.poolId === n,
    );
    if (o.length !== 1) {
      const s = n ? ` in pool ${n}` : "";
      throw new ce(`${this.packId} has ambiguous option ID ${e}${s}`);
    }
    const i = this.canonicalByScope.get(this.scopeKey(o[0]));
    if (!i) throw new ce(`${this.packId} cannot canonicalize option ID ${e}`);
    return i;
  }
  isKnown(e) {
    try {
      return this.resolveTargets(e).length > 0;
    } catch {
      return !1;
    }
  }
}
class Ep {
  constructor(e, n, o = {}) {
    ((this.pools = new po(e, "pool", n.poolIds, o.pools ?? [])),
      (this.flows = new po(e, "flow", n.flowIds, o.flows ?? [])),
      (this.options = new Cp(e, n.options, o.options ?? [])),
      (this.handlers = new po(e, "handler", n.handlerIds, o.handlers ?? [])));
  }
  resolvePoolId(e) {
    return this.pools.resolve(e);
  }
  canonicalPoolId(e) {
    return this.pools.canonical(e);
  }
  resolveFlowId(e) {
    return this.flows.resolve(e);
  }
  canonicalFlowId(e) {
    return this.flows.canonical(e);
  }
  resolveOptionId(e, n) {
    const o = n === void 0 ? void 0 : this.resolvePoolId(n);
    return this.options.resolve(e, o);
  }
  canonicalOptionId(e, n) {
    const o = n === void 0 ? void 0 : this.resolvePoolId(n);
    return this.options.canonical(e, o);
  }
  isKnownOptionId(e) {
    return this.options.isKnown(e);
  }
  resolveHandlerId(e) {
    return this.handlers.resolve(e);
  }
  canonicalHandlerId(e) {
    return this.handlers.canonical(e);
  }
}
function as(t) {
  return t.split(".", 1)[0];
}
function ln(t, e, n) {
  const o = new Map();
  for (const i of t) {
    if (o.has(i.id)) throw new ce(`${n} has duplicate ${e} ${i.id}`);
    o.set(i.id, i);
  }
  return o;
}
function rs(t, e) {
  return e.timelineScope === "shared" ? "shared" : (e.contentOwner ?? t);
}
function Lp(t) {
  const { manifest: e, game: n } = t;
  if (e.id !== n.id) throw new ce("manifest and game pack IDs differ");
  if (!e.id || !e.entryFlowId) throw new ce("pack manifest is incomplete");
  if (!n.flows[e.entryFlowId]) throw new ce(`${e.id} entry flow is missing`);
  if (as(e.engineRange) !== as(kn))
    throw new ce(`${e.id} is incompatible with engine ${kn}`);
  const o = ln(n.pools, "pool", e.id),
    i = ln(Object.values(n.flows), "flow", e.id),
    s = new Map(Object.entries(n.customHandlers ?? {})),
    a = new Ep(
      e.id,
      {
        poolIds: n.pools.map((l) => ({
          id: l.id,
          canonicalOwner: rs(e.id, l),
          canonicalId: l.canonicalId,
        })),
        flowIds: Object.keys(n.flows),
        options: n.pools.flatMap((l) =>
          l.options.map((u) => ({
            id: u.id,
            poolId: l.id,
            canonicalOwner: rs(e.id, l),
          })),
        ),
        handlerIds: Object.keys(n.customHandlers ?? {}),
      },
      t.aliases,
    );
  return {
    manifest: e,
    game: n,
    pools: o,
    flows: i,
    handlers: s,
    flowActions: new Map(Object.entries(n.flowActions ?? {})),
    flowResolvers: new Map(Object.entries(n.flowResolvers ?? {})),
    identities: ln(t.identities ?? [], "identity", e.id),
    origins: ln(t.origins ?? [], "origin", e.id),
    ids: a,
  };
}
class Ap {
  constructor() {
    ((this.loaders = new Map()), (this.loaded = new Map()));
  }
  registerLoader(e, n) {
    if (this.loaders.has(e))
      throw new ce(`pack loader already registered: ${e}`);
    this.loaders.set(e, n);
  }
  async load(e) {
    const n = this.loaded.get(e);
    if (n) return n;
    const o = this.loaders.get(e);
    if (!o) throw new ce(`unknown content pack: ${e}`);
    const i = Lp((await o()).default);
    if (i.manifest.id !== e)
      throw new ce(`loader returned unexpected pack: ${i.manifest.id}`);
    return (this.loaded.set(e, i), i);
  }
  unload(e) {
    this.loaded.delete(e);
  }
  loadedPack(e) {
    return this.loaded.get(e) ?? null;
  }
  registeredPackIds() {
    return [...this.loaders.keys()];
  }
  loadedPackIds() {
    return [...this.loaded.keys()];
  }
}
function Rp() {
  const t = new Ap();
  return (
    t.registerLoader("bootstrap", () =>
      wt(
        () => import("./index-CfLpLgGT.js"),
        __vite__mapDeps([0, 1, 2, 3]),
        import.meta.url,
      ),
    ),
    t.registerLoader("douluo1", () =>
      wt(
        () => import("./douluo1-pack-C6xEgEus.js"),
        __vite__mapDeps([4, 5, 2, 3]),
        import.meta.url,
      ),
    ),
    t.registerLoader("douluo2", () =>
      wt(
        () => import("./douluo2-pack-BsEUb2l9.js"),
        __vite__mapDeps([6, 5, 1, 2, 3]),
        import.meta.url,
      ),
    ),
    t
  );
}
const fa = "pcg32-counter-v1",
  ls = 4294967296;
function _p(t) {
  let e = 1779033703 ^ t.length;
  for (let n = 0; n < t.length; n += 1)
    ((e = Math.imul(e ^ t.charCodeAt(n), 3432918353)),
      (e = (e << 13) | (e >>> 19)));
  return (
    (e = Math.imul(e ^ (e >>> 16), 2246822507)),
    (e = Math.imul(e ^ (e >>> 13), 3266489909)),
    (e ^ (e >>> 16)) >>> 0
  );
}
function Tp(t) {
  const e = (Math.imul(t >>> 0, 747796405) + 2891336453) >>> 0,
    n = Math.imul(((e >>> ((e >>> 28) + 4)) ^ e) >>> 0, 277803737) >>> 0;
  return ((n >>> 22) ^ n) >>> 0;
}
function xp(t, e) {
  if (!Number.isSafeInteger(e) || e < 0)
    throw new Error("随机数游标必须是非负安全整数");
  const n = e >>> 0,
    o = Math.floor(e / ls) >>> 0,
    i = (_p(t) + n + Math.imul(o, 2654435769)) >>> 0;
  return Tp(i) / ls;
}
function pa(t) {
  const e = xp(t.seed, t.cursor);
  return ((t.cursor += 1), (t.algorithm = fa), e);
}
function To() {
  return {
    period: null,
    realm: null,
    type: null,
    species: null,
    area: null,
    chronologicalAge: 0,
    bloodlines: [],
    bloodlineComponents: [],
    elementProgress: null,
    attributeStages: {},
    laws: [],
    tribulationsPassed: [],
    evolvedThresholds: [],
    plotDone: [],
    beastGod: !1,
    deathShields: 0,
    pseudoReverseShield: null,
    namePrefixes: [],
    nameSuffixes: [],
    lightningShields: [],
    interactions: {},
    godTrialQualification: null,
  };
}
function Op(t) {
  return {
    route: t,
    wallet: { copper: 0, transactions: [] },
    entrySelections: {
      route: null,
      worldLine: null,
      mainLine: null,
      period: null,
      periodPoolId: null,
    },
    age: t === "transformed" ? 6 : 0,
    level: t === "beast" ? 0 : 1,
    maxLevel: 99,
    beastYears: t === "beast" ? 135 : 0,
    timelineEra: null,
    gender: null,
    appearance: null,
    appearanceRank: null,
    storyTime: null,
    timelineAge: null,
    elapsedYears: 0,
    npcAges: {},
    npcRelationships: {},
    innatePower: null,
    initialPowerResult: null,
    faction: null,
    storyBranch: null,
    branchStartTimelineAge: null,
    beast: t === "beast" ? To() : null,
    beastOrigin: null,
    godTrial: null,
    godTrials: [],
    seaTrial: null,
    martialSoulTalents: [],
    talents: [],
    martialSouls: [],
    bloodlines: [],
    attributes: [],
    elementProgress: {},
    soulBones: [],
    skills: [],
    artifacts: [],
    traits: [],
    titles: [],
    domains: [],
    godhood: null,
    godhoods: [],
    ending: null,
    flags: {},
  };
}
function Mp(t, e, n = {}) {
  const o = n.contentPackId ?? "douluo1";
  return {
    character: Op(t),
    currentStepId: t === "beast" ? "beastPeriod" : "humanTimeline",
    currentPoolId: null,
    pendingNextStepId: null,
    pendingFollowUps: [],
    awaitingAdvance: !1,
    random: { seed: e, cursor: 0, algorithm: fa },
    timeline: [],
    finished: !1,
    forcedResults: {},
    forcedResultSources: {},
    lastResolvedSpin: null,
    pendingRing: null,
    additionalSoulRingBatch: null,
    pendingSoulBone: null,
    pendingBeastSpecies: null,
    history: [],
    packId: o,
    worldEra:
      n.worldEra ??
      (o === "bootstrap"
        ? "unresolved"
        : o === "douluo2"
          ? "douluo2"
          : "douluo1"),
  };
}
function ma(t, e = {}) {
  const n = Mp("human", t, e);
  return (
    (n.currentStepId = "routeChoice"),
    (n.character.flags.routeSelected = !1),
    n
  );
}
const us = 1e4;
function ha(t) {
  if (!t.beast) throw new Error("内容配置错误：当前角色不是魂兽状态");
  return t.beast;
}
function Bp(t) {
  return t >= 4
    ? "complete-law"
    : t === 3
      ? "law-seed"
      : t === 2
        ? "ultimate"
        : "normal";
}
function ga(t, e) {
  var o;
  const n = (o = t.beast) == null ? void 0 : o.elementProgress;
  return (n == null ? void 0 : n.elementId) === e && n.stage === "complete-law";
}
function Np(t, e) {
  const n = ha(t);
  if (ga(t, e)) throw new Error(`元素 ${e} 已完成法则，必须在 effects 前重抽`);
  const o = n.elementProgress,
    i = (o == null ? void 0 : o.elementId) === e ? o.consecutiveCount + 1 : 1,
    s = { elementId: e, consecutiveCount: i, stage: Bp(i) };
  if (
    ((n.elementProgress = s),
    (n.attributeStages[e] = Math.max(n.attributeStages[e] ?? 0, i)),
    i === 2)
  )
    t.traits.includes(`douluo2:element.${e}.ultimate`) ||
      t.traits.push(`douluo2:element.${e}.ultimate`);
  else if (i === 3)
    t.traits.includes(`douluo2:element.${e}.law-seed`) ||
      t.traits.push(`douluo2:element.${e}.law-seed`);
  else if (i === 4) {
    t.traits.includes(`douluo2:element.${e}.complete-law`) ||
      t.traits.push(`douluo2:element.${e}.complete-law`);
    const a = `douluo2:law.${e}`;
    n.laws.includes(a) || n.laws.push(a);
  }
  return s;
}
function Dp(t) {
  var i;
  const e = t.filter((s) => s.role === "primary");
  if (
    e.length !== 1 ||
    ((i = e[0]) == null ? void 0 : i.ratioBasisPoints) !== 5e3
  )
    throw new Error("血脉融合必须且只能有一个占 5000 basis points 的本体血脉");
  if (t.length < 2 || t.some((s) => s.ratioBasisPoints < 0))
    throw new Error("血脉融合缺少有效的次要血脉");
  if (new Set(t.map((s) => s.bloodlineId)).size !== t.length)
    throw new Error("血脉融合不能重复同一血脉 ID");
  if (t.reduce((s, a) => s + a.ratioBasisPoints, 0) !== us)
    throw new Error(`血脉融合比例必须合计 ${us}`);
}
function Fp(t, e) {
  const n = ha(t);
  (Dp(e), (n.bloodlineComponents = e.map((o) => ({ ...o }))));
}
function Nn(t, e) {
  var n,
    o,
    i,
    s,
    a,
    l,
    u,
    d,
    p,
    f,
    I,
    k,
    g,
    w,
    b,
    c,
    L,
    m,
    h,
    $,
    N,
    te,
    ne,
    ue,
    R,
    C,
    W,
    K,
    F,
    fe,
    re,
    q,
    ve,
    ae,
    ye;
  switch (e.type) {
    case "levelAtLeast":
      return t.level >= e.value;
    case "levelBelow":
      return t.level < e.value;
    case "innatePowerAtLeast":
      return (t.innatePower ?? 0) >= e.value;
    case "talentGradeAtLeast": {
      const M = { F: 0, E: 1, D: 2, C: 3, B: 4, A: 5, S: 6, divine: 7 },
        Z = (n = t.talentProgression) == null ? void 0 : n.talentGrade;
      return Z != null && M[Z] >= M[e.value];
    }
    case "beastYearsAtLeast":
      return t.beastYears >= e.value;
    case "beastYearsBelow":
      return t.beastYears < e.value;
    case "beastAttributeStageBelow":
      return (
        (((o = t.beast) == null ? void 0 : o.attributeStages[e.attribute]) ??
          0) < e.value
      );
    case "beastElementComplete":
      return ga(t, e.elementId);
    case "beastFullLawsAtLeast":
      return (((i = t.beast) == null ? void 0 : i.laws.length) ?? 0) >= e.value;
    case "beastFullLawsBelow":
      return (((s = t.beast) == null ? void 0 : s.laws.length) ?? 0) < e.value;
    case "beastLawPrototypesAtLeast":
      return t.traits.filter((M) => M.endsWith("法则雏形")).length >= e.value;
    case "beastBloodlineCountAtLeast":
      return (
        (((a = t.beast) == null ? void 0 : a.bloodlines.length) ?? 0) >= e.value
      );
    case "beastAreaOptionIs":
      return (
        ((u = (l = t.beast) == null ? void 0 : l.area) == null
          ? void 0
          : u.optionId) === e.value
      );
    case "hasBeastPrefix":
      return (
        ((p = (d = t.beast) == null ? void 0 : d.namePrefixes) == null
          ? void 0
          : p.includes(e.prefix)) ?? !1
      );
    case "lacksBeastPrefix":
      return !(
        ((I = (f = t.beast) == null ? void 0 : f.namePrefixes) == null
          ? void 0
          : I.includes(e.prefix)) ?? !1
      );
    case "hasBeastNameSuffix":
      return (
        ((g = (k = t.beast) == null ? void 0 : k.nameSuffixes) == null
          ? void 0
          : g.includes(e.suffix)) ?? !1
      );
    case "lacksBeastNameSuffix":
      return !(
        ((b = (w = t.beast) == null ? void 0 : w.nameSuffixes) == null
          ? void 0
          : b.includes(e.suffix)) ?? !1
      );
    case "beastNameSuffixCountAtLeast": {
      const M = ((c = t.beast) == null ? void 0 : c.nameSuffixes) ?? [];
      return (
        (e.suffixes
          ? new Set(e.suffixes.filter((ke) => M.includes(ke))).size
          : new Set(M).size) >= e.value
      );
    }
    case "beastNameSuffixCountBelow": {
      const M = ((L = t.beast) == null ? void 0 : L.nameSuffixes) ?? [];
      return (
        (e.suffixes
          ? new Set(e.suffixes.filter((ke) => M.includes(ke))).size
          : new Set(M).size) < e.value
      );
    }
    case "isDragonBeast":
      return !!t.flags.beastHasDragonBloodline;
    case "isNotDragonBeast":
      return !t.flags.beastHasDragonBloodline;
    case "isPureDragonBeast":
      return !!t.flags.beastPrimaryPureDragon;
    case "hasAnyDomain":
      return t.domains.length > 0;
    case "domainCountAtLeast":
      return t.domains.length >= e.value;
    case "hasTrait":
      return t.traits.includes(e.value);
    case "lacksTrait":
      return !t.traits.includes(e.value);
    case "hasTitle":
      return t.titles.includes(e.value);
    case "lacksTitle":
      return !t.titles.includes(e.value);
    case "hasFlag":
      return !!t.flags[e.value];
    case "lacksFlag":
      return !t.flags[e.value];
    case "genderOptionIs":
      return ((m = t.gender) == null ? void 0 : m.optionId) === e.value;
    case "lacksMartialSoul":
      return !t.martialSouls.some((M) => M.id === e.value);
    case "hasMartialSoulTag":
      return t.martialSouls.some((M) => {
        var Z;
        return (Z = M.tags) == null ? void 0 : Z.includes(e.value);
      });
    case "hasDomain":
      return t.domains.includes(e.value);
    case "lacksDomain":
      return !t.domains.includes(e.value);
    case "hasGodTrial":
      return t.godTrial !== null;
    case "lacksGodTrial":
      return t.godTrial === null;
    case "hasGodhood":
      return t.godhood !== null;
    case "lacksGodhood":
      return t.godhood === null;
    case "godhoodTierAtLeast": {
      const M = { 三级: 1, 二级: 2, 一级: 3, 神王: 4 },
        Z = (h = t.godhood) == null ? void 0 : h.tier;
      return !!(Z && M[Z] >= M[e.value]);
    }
    case "godTrialStatusIs":
      return (($ = t.godTrial) == null ? void 0 : $.status) === e.value;
    case "godTrialTierIs":
      return ((N = t.godTrial) == null ? void 0 : N.tier) === e.value;
    case "godTrialStageIs":
      return ((te = t.godTrial) == null ? void 0 : te.currentStage) === e.value;
    case "godTrialRewardUnclaimed":
      return !!(
        t.godTrial && !t.godTrial.claimedRewardStages.includes(e.stage)
      );
    case "seaTrialStatusIs":
      return ((ne = t.seaTrial) == null ? void 0 : ne.status) === e.value;
    case "seaTrialTierIs":
      return ((ue = t.seaTrial) == null ? void 0 : ue.tier) === e.value;
    case "seaTrialStageIs":
      return ((R = t.seaTrial) == null ? void 0 : R.currentStage) === e.value;
    case "seaTrialRewardUnclaimed":
      return !!(
        t.seaTrial && !t.seaTrial.claimedRewardStages.includes(e.stage)
      );
    case "ageBelow":
      return t.age < e.value;
    case "appearanceRankBelow":
      return (t.appearanceRank ?? -1) < e.value;
    case "appearanceRankAtLeast":
      return (t.appearanceRank ?? -1) >= e.value;
    case "appearanceRankIs":
      return t.appearanceRank === e.value;
    case "lacksMartialSoulCategory":
      return !t.martialSouls.some((M) => M.category === e.value);
    case "martialSoulCategoryIsNot":
      return (
        ((C = t.martialSouls[e.soulIndex]) == null ? void 0 : C.category) !==
        e.value
      );
    case "lacksSoulBonePart": {
      const M = Ve(e.value);
      return M
        ? !t.soulBones.some((Z) => Ht(Z) === M)
        : !t.soulBones.some((Z) => Z.id === e.value || Z.partId === e.value);
    }
    case "soulBonePartCountBelow": {
      const M = Ve(e.partId);
      return (
        (M
          ? Dt(t, M)
          : t.soulBones.filter(
              (ke) => ke.id === e.partId || ke.partId === e.partId,
            ).length) < e.value
      );
    }
    case "hasSoulBonePart": {
      const M = Ve(e.value);
      return M
        ? t.soulBones.some((Z) => Ht(Z) === M)
        : t.soulBones.some((Z) => Z.id === e.value || Z.partId === e.value);
    }
    case "hasAnySoulBone":
      return t.soulBones.length > 0;
    case "soulBoneCountAtLeast":
      return (
        (e.bodyOnly ? Array.from({ length: ti(t) }) : t.soulBones).length >=
        e.value
      );
    case "currencyAtLeast":
      return (
        (((W = t.wallet) == null ? void 0 : W.copper) ?? 0) >=
        Math.max(0, Math.trunc(e.copper))
      );
    case "currencyBelow":
      return (
        (((K = t.wallet) == null ? void 0 : K.copper) ?? 0) <
        Math.max(0, Math.trunc(e.copper))
      );
    case "inventoryAtLeast":
      return (
        Number(t.flags[`formal:inventory:${e.category}:${e.itemId}`] ?? 0) >=
        e.value
      );
    case "inventoryBelow":
      return (
        Number(t.flags[`formal:inventory:${e.category}:${e.itemId}`] ?? 0) <
        e.value
      );
    case "hasAttribute": {
      const M = st(e.value);
      return M.id &&
        rt.includes(M.id) &&
        (lt(t, M.id) ?? 0) >= (M.qualifier ?? 1)
        ? !0
        : t.attributes.includes(e.value) ||
            ((F = /^完整(.+)法则$/.exec(e.value)) != null && F[1]
              ? t.traits.includes(
                  `formal:element.${/^完整(.+)法则$/.exec(e.value)[1]}.complete-law`,
                ) ||
                t.traits.includes(
                  `douluo2:element.${/^完整(.+)法则$/.exec(e.value)[1]}.complete-law`,
                ) ||
                ((fe = t.beast) == null
                  ? void 0
                  : fe.laws.includes(
                      `douluo2:law.${/^完整(.+)法则$/.exec(e.value)[1]}`,
                    )) === !0
              : !1);
    }
    case "lacksAttribute": {
      const M = st(e.value);
      return M.id && rt.includes(M.id) && (lt(t, M.id) ?? 0) > 0
        ? !1
        : !t.attributes.includes(e.value);
    }
    case "completeLawCountAtLeast": {
      const M = t.traits.filter((ke) => ke.endsWith(".complete-law")),
        Z = ((re = t.beast) == null ? void 0 : re.laws) ?? [];
      return new Set([...M, ...Z]).size >= e.value;
    }
    case "counterAtLeast":
      return Number(t.flags[e.key] ?? 0) >= e.value;
    case "counterBelow":
      return Number(t.flags[e.key] ?? 0) < e.value;
    case "npcAffinityAtLeast":
      return (
        (((ve = (q = t.npcRelationships) == null ? void 0 : q[e.npcId]) == null
          ? void 0
          : ve.affinity) ?? 0) >= e.value
      );
    case "npcAffinityBelow":
      return (
        (((ye = (ae = t.npcRelationships) == null ? void 0 : ae[e.npcId]) ==
        null
          ? void 0
          : ye.affinity) ?? 0) < e.value
      );
    case "combatPowerAtLeast":
      return Ln.total(t) >= e.value;
    case "combatPowerBelow":
      return Ln.total(t) < e.value;
    case "allOf":
      return e.conditions.every((M) => Nn(t, M));
    case "anyOf":
      return e.conditions.some((M) => Nn(t, M));
  }
}
function Yt(t, e = []) {
  return e.every((n) => Nn(t, n));
}
const va = [
  { optionId: "9ce095", text: "F级（丑到发瘟）" },
  { optionId: "4e3f46", text: "E级（有点丑）" },
  { optionId: "3e26b6", text: "D级（平平无奇）" },
  { optionId: "4a43b8", text: "C级（比较耐看）" },
  { optionId: "b157d7", text: "B级（7分帅哥美女）" },
  { optionId: "b67fd5", text: "A级（顶帅顶美）" },
  { optionId: "6e3da9", text: "S级（与千仞雪或者穿越前的唐三同颜值）" },
  {
    optionId: "9eeb0b",
    text: "EX级容貌（魅魔转世，不分性别原著男女都喜欢你）",
  },
];
function jg(t) {
  return va.findIndex((e) => e.optionId === t);
}
function Vp(t) {
  return va[t] ?? null;
}
function jp(t) {
  return t === null
    ? null
    : t === 0
      ? "F"
      : t === 1
        ? "E"
        : t === 2 || t === 3
          ? "D"
          : t === 4 || t === 5
            ? "C"
            : t === 6 || t === 7
              ? "B"
              : t === 8 || t === 9
                ? "A"
                : t === 10
                  ? "S"
                  : t === 20
                    ? "divine"
                    : null;
}
function ba(t) {
  const e = jp(t);
  return {
    talentGrade: e,
    ordinaryGrowthLocked: e === "F",
    unresolvedTalentGrade: t !== null && e === null,
  };
}
function zp(t) {
  t.talentProgression = ba(t.innatePower);
}
function ds(t) {
  return t <= 0 ? 0 : Math.floor((t - 1) / 10) * 10 + 1;
}
function Up(t, e) {
  var l;
  const n = t.talentProgression ?? ba(t.innatePower),
    o = t.annualGrowthPolicy,
    i =
      e.levelDelta < 0 &&
      !!(
        (l = e.sourceTags) != null &&
        l.some(
          (u) =>
            (o == null ? void 0 : o.preventLevelPenaltySources.includes(u)) ??
            !1,
        )
      );
  let s = i ? 0 : e.levelDelta;
  return (
    (s += (o == null ? void 0 : o.annualLevelBonus) ?? 0),
    (e.ordinary ?? !0) &&
      n.ordinaryGrowthLocked &&
      !e.allowOrdinaryGrowthOverride &&
      s > 0 &&
      (s = 0),
    {
      requestedLevelDelta: e.levelDelta,
      resolvedLevelDelta: s,
      preventedPenalty: i,
      ordinaryGrowthLocked: n.ordinaryGrowthLocked,
    }
  );
}
const cs = "formal:inventory:skill:";
function Ft(t) {
  const e = new Map((t.skills ?? []).map((n) => [n.id, { ...n }]));
  for (const [n, o] of Object.entries(t.flags)) {
    if (!n.startsWith(cs) || typeof o != "number") continue;
    const i = n.slice(cs.length),
      s = Math.max(0, Math.trunc(o));
    s > 0 ? e.set(i, { id: i, name: i, level: s }) : e.delete(i);
  }
  return (
    (t.skills = [...e.values()].sort((n, o) =>
      n.id.localeCompare(o.id, "zh-CN"),
    )),
    t.skills
  );
}
let Xe;
const Wp = {
  lang: void 0,
  message: void 0,
  abortEarly: void 0,
  abortPipeEarly: void 0,
};
function ya(t) {
  return !t && !Xe
    ? Wp
    : {
        lang: (t == null ? void 0 : t.lang) ?? (Xe == null ? void 0 : Xe.lang),
        message: t == null ? void 0 : t.message,
        abortEarly:
          (t == null ? void 0 : t.abortEarly) ??
          (Xe == null ? void 0 : Xe.abortEarly),
        abortPipeEarly:
          (t == null ? void 0 : t.abortPipeEarly) ??
          (Xe == null ? void 0 : Xe.abortPipeEarly),
      };
}
let mo;
function qp(t) {
  return mo == null ? void 0 : mo.get(t);
}
let ho;
function Gp(t) {
  return ho == null ? void 0 : ho.get(t);
}
let go;
function Hp(t, e) {
  var n;
  return (n = go == null ? void 0 : go.get(t)) == null ? void 0 : n.get(e);
}
function St(t) {
  var n, o;
  const e = typeof t;
  return e === "string"
    ? `"${t}"`
    : e === "number" || e === "bigint" || e === "boolean"
      ? `${t}`
      : e === "object" || e === "function"
        ? ((t &&
            ((o =
              (n = Object.getPrototypeOf(t)) == null
                ? void 0
                : n.constructor) == null
              ? void 0
              : o.name)) ??
          "null")
        : e;
}
function be(t, e, n, o, i) {
  const s = i && "input" in i ? i.input : n.value,
    a = (i == null ? void 0 : i.expected) ?? t.expects ?? null,
    l = (i == null ? void 0 : i.received) ?? St(s),
    u = {
      kind: t.kind,
      type: t.type,
      input: s,
      expected: a,
      received: l,
      message: `Invalid ${e}: ${a ? `Expected ${a} but r` : "R"}eceived ${l}`,
      requirement: t.requirement,
      path: i == null ? void 0 : i.path,
      issues: i == null ? void 0 : i.issues,
      lang: o.lang,
      abortEarly: o.abortEarly,
      abortPipeEarly: o.abortPipeEarly,
    },
    d = t.kind === "schema",
    p =
      (i == null ? void 0 : i.message) ??
      t.message ??
      Hp(t.reference, u.lang) ??
      (d ? Gp(u.lang) : null) ??
      o.message ??
      qp(u.lang);
  (p !== void 0 && (u.message = typeof p == "function" ? p(u) : p),
    d && (n.typed = !1),
    n.issues ? n.issues.push(u) : (n.issues = [u]));
}
const fs = new WeakMap();
function Ne(t) {
  let e = fs.get(t);
  return (
    e ||
      ((e = {
        version: 1,
        vendor: "valibot",
        validate(n) {
          return t["~run"]({ value: n }, ya());
        },
      }),
      fs.set(t, e)),
    e
  );
}
function Yp(t, e) {
  return (
    Object.prototype.hasOwnProperty.call(t, e) &&
    e !== "__proto__" &&
    e !== "prototype" &&
    e !== "constructor"
  );
}
function wa(t, e) {
  const n = [...new Set(t)];
  return n.length > 1 ? `(${n.join(` ${e} `)})` : (n[0] ?? "never");
}
function Kp(t) {
  if (t.path) {
    let e = "";
    for (const n of t.path)
      if (typeof n.key == "string" || typeof n.key == "number")
        e ? (e += `.${n.key}`) : (e += n.key);
      else return null;
    return e;
  }
  return null;
}
const Jp =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:[12]\d|0[1-9]|3[01])[T ](?:0\d|1\d|2[0-3])(?::[0-5]\d){2}(?:\.\d{1,9})?(?:Z| ?[+-](?:0\d|1\d|2[0-3])(?::?[0-5]\d)?)$/u;
function Sa(t) {
  return {
    kind: "validation",
    type: "finite",
    reference: Sa,
    async: !1,
    expects: null,
    requirement: Number.isFinite,
    message: t,
    "~run"(e, n) {
      return (
        e.typed && !this.requirement(e.value) && be(this, "finite", e, n),
        e
      );
    },
  };
}
function xo(t) {
  return {
    kind: "validation",
    type: "iso_timestamp",
    reference: xo,
    async: !1,
    expects: null,
    requirement: Jp,
    message: t,
    "~run"(e, n) {
      return (
        e.typed &&
          !this.requirement.test(e.value) &&
          be(this, "timestamp", e, n),
        e
      );
    },
  };
}
function Ia(t, e) {
  return {
    kind: "validation",
    type: "max_value",
    reference: Ia,
    async: !1,
    expects: `<=${t instanceof Date ? t.toJSON() : St(t)}`,
    requirement: t,
    message: e,
    "~run"(n, o) {
      return (
        n.typed &&
          !(n.value <= this.requirement) &&
          be(this, "value", n, o, {
            received: n.value instanceof Date ? n.value.toJSON() : St(n.value),
          }),
        n
      );
    },
  };
}
function ni(t, e) {
  return {
    kind: "validation",
    type: "min_value",
    reference: ni,
    async: !1,
    expects: `>=${t instanceof Date ? t.toJSON() : St(t)}`,
    requirement: t,
    message: e,
    "~run"(n, o) {
      return (
        n.typed &&
          !(n.value >= this.requirement) &&
          be(this, "value", n, o, {
            received: n.value instanceof Date ? n.value.toJSON() : St(n.value),
          }),
        n
      );
    },
  };
}
function ka(t) {
  return {
    kind: "validation",
    type: "non_empty",
    reference: ka,
    async: !1,
    expects: "!0",
    message: t,
    "~run"(e, n) {
      return (
        e.typed &&
          e.value.length === 0 &&
          be(this, "length", e, n, { received: "0" }),
        e
      );
    },
  };
}
function oi(t) {
  return {
    kind: "validation",
    type: "safe_integer",
    reference: oi,
    async: !1,
    expects: null,
    requirement: Number.isSafeInteger,
    message: t,
    "~run"(e, n) {
      return (
        e.typed && !this.requirement(e.value) && be(this, "safe integer", e, n),
        e
      );
    },
  };
}
function Qp(t, e, n) {
  return typeof t.fallback == "function" ? t.fallback(e, n) : t.fallback;
}
function ii(t, e, n) {
  return typeof t.default == "function" ? t.default(e, n) : t.default;
}
function H(t, e) {
  return {
    kind: "schema",
    type: "array",
    reference: H,
    expects: "Array",
    async: !1,
    item: t,
    message: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      var s;
      const i = n.value;
      if (Array.isArray(i)) {
        ((n.typed = !0), (n.value = []));
        for (let a = 0; a < i.length; a++) {
          const l = i[a],
            u = this.item["~run"]({ value: l }, o);
          if (u.issues) {
            const d = {
              type: "array",
              origin: "value",
              input: i,
              key: a,
              value: l,
            };
            for (const p of u.issues)
              (p.path ? p.path.unshift(d) : (p.path = [d]),
                (s = n.issues) == null || s.push(p));
            if ((n.issues || (n.issues = u.issues), o.abortEarly)) {
              n.typed = !1;
              break;
            }
          }
          (u.typed || (n.typed = !1), n.value.push(u.value));
        }
      } else be(this, "type", n, o);
      return n;
    },
  };
}
function je(t) {
  return {
    kind: "schema",
    type: "boolean",
    reference: je,
    expects: "boolean",
    async: !1,
    message: t,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(e, n) {
      return (
        typeof e.value == "boolean" ? (e.typed = !0) : be(this, "type", e, n),
        e
      );
    },
  };
}
function Ot(t, e) {
  return {
    kind: "schema",
    type: "literal",
    reference: Ot,
    expects: St(t),
    async: !1,
    literal: t,
    message: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      return (
        n.value === this.literal ? (n.typed = !0) : be(this, "type", n, o),
        n
      );
    },
  };
}
function z(t, e) {
  return {
    kind: "schema",
    type: "nullable",
    reference: z,
    expects: `(${t.expects} | null)`,
    async: !1,
    wrapped: t,
    default: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      return n.value === null &&
        (this.default !== void 0 && (n.value = ii(this, n, o)),
        n.value === null)
        ? ((n.typed = !0), n)
        : this.wrapped["~run"](n, o);
    },
  };
}
function Gn(t) {
  return {
    kind: "schema",
    type: "number",
    reference: Gn,
    expects: "number",
    async: !1,
    message: t,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(e, n) {
      return (
        typeof e.value == "number" && !isNaN(e.value)
          ? (e.typed = !0)
          : be(this, "type", e, n),
        e
      );
    },
  };
}
function x(t, e) {
  return {
    kind: "schema",
    type: "optional",
    reference: x,
    expects: `(${t.expects} | undefined)`,
    async: !1,
    wrapped: t,
    default: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      return n.value === void 0 &&
        (this.default !== void 0 && (n.value = ii(this, n, o)),
        n.value === void 0)
        ? ((n.typed = !0), n)
        : this.wrapped["~run"](n, o);
    },
  };
}
function le(t, e) {
  return {
    kind: "schema",
    type: "picklist",
    reference: le,
    expects: wa(t.map(St), "|"),
    async: !1,
    options: t,
    message: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      return (
        this.options.includes(n.value)
          ? (n.typed = !0)
          : be(this, "type", n, o),
        n
      );
    },
  };
}
function ut(t, e, n) {
  return {
    kind: "schema",
    type: "record",
    reference: ut,
    expects: "Object",
    async: !1,
    key: t,
    value: e,
    message: n,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(o, i) {
      var a, l;
      const s = o.value;
      if (s && typeof s == "object") {
        ((o.typed = !0), (o.value = {}));
        for (const u in s)
          if (Yp(s, u)) {
            const d = s[u],
              p = this.key["~run"]({ value: u }, i);
            if (p.issues) {
              const I = {
                type: "object",
                origin: "key",
                input: s,
                key: u,
                value: d,
              };
              for (const k of p.issues)
                ((k.path = [I]), (a = o.issues) == null || a.push(k));
              if ((o.issues || (o.issues = p.issues), i.abortEarly)) {
                o.typed = !1;
                break;
              }
            }
            const f = this.value["~run"]({ value: d }, i);
            if (f.issues) {
              const I = {
                type: "object",
                origin: "value",
                input: s,
                key: u,
                value: d,
              };
              for (const k of f.issues)
                (k.path ? k.path.unshift(I) : (k.path = [I]),
                  (l = o.issues) == null || l.push(k));
              if ((o.issues || (o.issues = f.issues), i.abortEarly)) {
                o.typed = !1;
                break;
              }
            }
            ((!p.typed || !f.typed) && (o.typed = !1),
              p.typed && (o.value[p.value] = f.value));
          }
      } else be(this, "type", o, i);
      return o;
    },
  };
}
function X(t, e) {
  return {
    kind: "schema",
    type: "strict_object",
    reference: X,
    expects: "Object",
    async: !1,
    entries: t,
    message: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      var s;
      const i = n.value;
      if (i && typeof i == "object") {
        ((n.typed = !0), (n.value = {}));
        for (const a in this.entries) {
          const l = this.entries[a];
          if (
            a in i ||
            ((l.type === "exact_optional" ||
              l.type === "optional" ||
              l.type === "nullish") &&
              l.default !== void 0)
          ) {
            const u = a in i ? i[a] : ii(l),
              d = l["~run"]({ value: u }, o);
            if (d.issues) {
              const p = {
                type: "object",
                origin: "value",
                input: i,
                key: a,
                value: u,
              };
              for (const f of d.issues)
                (f.path ? f.path.unshift(p) : (f.path = [p]),
                  (s = n.issues) == null || s.push(f));
              if ((n.issues || (n.issues = d.issues), o.abortEarly)) {
                n.typed = !1;
                break;
              }
            }
            (d.typed || (n.typed = !1), (n.value[a] = d.value));
          } else if (l.fallback !== void 0) n.value[a] = Qp(l);
          else if (
            l.type !== "exact_optional" &&
            l.type !== "optional" &&
            l.type !== "nullish" &&
            (be(this, "key", n, o, {
              input: void 0,
              expected: `"${a}"`,
              path: [
                {
                  type: "object",
                  origin: "key",
                  input: i,
                  key: a,
                  value: i[a],
                },
              ],
            }),
            o.abortEarly)
          )
            break;
        }
        if (!n.issues || !o.abortEarly) {
          for (const a in i)
            if (!(a in this.entries)) {
              be(this, "key", n, o, {
                input: a,
                expected: "never",
                path: [
                  {
                    type: "object",
                    origin: "key",
                    input: i,
                    key: a,
                    value: i[a],
                  },
                ],
              });
              break;
            }
        }
      } else be(this, "type", n, o);
      return n;
    },
  };
}
function oe(t) {
  return {
    kind: "schema",
    type: "string",
    reference: oe,
    expects: "string",
    async: !1,
    message: t,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(e, n) {
      return (
        typeof e.value == "string" ? (e.typed = !0) : be(this, "type", e, n),
        e
      );
    },
  };
}
function ps(t) {
  let e;
  if (t)
    for (const n of t)
      if (e) for (const o of n.issues) e.push(o);
      else e = n.issues;
  return e;
}
function $a(t, e) {
  return {
    kind: "schema",
    type: "union",
    reference: $a,
    expects: wa(
      t.map((n) => n.expects),
      "|",
    ),
    async: !1,
    options: t,
    message: e,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(n, o) {
      let i, s, a;
      for (const l of this.options) {
        const u = l["~run"]({ value: n.value }, o);
        if (u.typed)
          if (u.issues) s ? s.push(u) : (s = [u]);
          else {
            i = u;
            break;
          }
        else a ? a.push(u) : (a = [u]);
      }
      if (i) return i;
      if (s) {
        if (s.length === 1) return s[0];
        (be(this, "type", n, o, { issues: ps(s) }), (n.typed = !0));
      } else {
        if ((a == null ? void 0 : a.length) === 1) return a[0];
        be(this, "type", n, o, { issues: ps(a) });
      }
      return n;
    },
  };
}
function Xp(t, e) {
  const n = { ...t.entries };
  for (const o of e) delete n[o];
  return {
    ...t,
    entries: n,
    get "~standard"() {
      return Ne(this);
    },
  };
}
function It(...t) {
  return {
    ...t[0],
    pipe: t,
    get "~standard"() {
      return Ne(this);
    },
    "~run"(e, n) {
      for (const o of t)
        if (o.kind !== "metadata") {
          if (
            e.issues &&
            (o.kind === "schema" || o.kind === "transformation")
          ) {
            e.typed = !1;
            break;
          }
          (!e.issues || (!n.abortEarly && !n.abortPipeEarly)) &&
            (e = o["~run"](e, n));
        }
      return e;
    },
  };
}
function kt(t, e, n) {
  const o = t["~run"]({ value: e }, ya(n));
  return {
    typed: o.typed,
    success: !o.issues,
    output: o.value,
    issues: o.issues,
  };
}
class Fe extends Error {
  constructor(e) {
    (super(e), (this.name = "PoolTimelineCompatibilityError"));
  }
}
function si(t) {
  if (t.ownership) {
    if (t.ownership.contentPackId !== t.id)
      throw new Fe(
        `时代隔离错误：内容包 ownership ${t.ownership.contentPackId} 与 ${t.id} 不一致`,
      );
    return t.ownership.defaultWorldEra;
  }
  return t.id === "douluo2" ? "douluo2" : "douluo1";
}
function Zp(t, e) {
  return e.timelineScope ?? si(t);
}
function Hn(t, e) {
  if (e.packId !== t.id)
    throw new Fe(
      `时代隔离错误：状态内容包 ${e.packId} 与运行内容包 ${t.id} 不一致`,
    );
  const n = si(t);
  if (e.worldEra !== n)
    throw new Fe(
      `时代隔离错误：内容包 ${t.id} 要求世界时代 ${n}，实际为 ${e.worldEra}`,
    );
}
function ai(t, e, n) {
  if ((Hn(t, e), e.currentPoolId !== null && e.currentPoolId !== n.id))
    throw new Fe(
      `流程/转盘隔离错误：currentPoolId ${e.currentPoolId} 与流程转盘 ${n.id} 不一致`,
    );
  if (n.contentStatus === "staging")
    throw new Fe(`内容隔离错误：转盘 ${n.id} 仍为 staging，不能进入正式运行时`);
  const o = n.contentOwner ?? t.id;
  if (o === "unresolved")
    throw new Fe(`时代隔离错误：转盘 ${n.id} 的内容归属尚未解析`);
  const i =
    o === "shared-beast-core" || o === "shared-cheat" || o === "formal-shared";
  if (o !== t.id && !(i && n.timelineScope === "shared"))
    throw new Fe(`时代隔离错误：转盘 ${n.id} 属于 ${o}，当前内容包为 ${t.id}`);
  const s = Zp(t, n);
  if (s === "unresolved")
    throw new Fe(`时代隔离错误：转盘 ${n.id} 的时代范围尚未解析`);
  if (s !== "shared" && s !== e.worldEra)
    throw new Fe(
      `时代隔离错误：转盘 ${n.id} 的时代范围 ${s} 与当前世界 ${e.worldEra} 不兼容`,
    );
}
function Pa(t, e) {
  const n = t.pools.find((o) => o.id === e);
  if (!n) throw new Error(`内容配置错误：转盘 ${e} 不存在`);
  return n;
}
function Oo(t, e) {
  if ((Hn(t, e), !e.currentStepId)) {
    e.currentPoolId = null;
    return;
  }
  const n = t.flows[e.currentStepId];
  if (!n) throw new Error(`内容配置错误：流程节点 ${e.currentStepId} 不存在`);
  if (!n.poolId) {
    e.currentPoolId = null;
    return;
  }
  const o = Pa(t, n.poolId);
  return (ai(t, { ...e, currentPoolId: o.id }, o), (e.currentPoolId = o.id), o);
}
function hn(t, e) {
  if ((Hn(t, e), !e.currentStepId)) {
    if (e.currentPoolId !== null)
      throw new Fe(
        `流程/转盘隔离错误：无当前流程时 currentPoolId 必须为空，实际为 ${e.currentPoolId}`,
      );
    return;
  }
  const n = t.flows[e.currentStepId];
  if (!n) throw new Error(`内容配置错误：流程节点 ${e.currentStepId} 不存在`);
  if (!n.poolId) {
    if (e.currentPoolId !== null)
      throw new Fe(
        `流程/转盘隔离错误：动作流程 ${n.id} 不应保存 currentPoolId ${e.currentPoolId}`,
      );
    return;
  }
  const o = Pa(t, n.poolId);
  if (e.currentPoolId !== o.id)
    throw new Fe(
      `流程/转盘隔离错误：流程 ${n.id} 要求 currentPoolId ${o.id}，实际为 ${e.currentPoolId ?? "null"}`,
    );
  ai(t, e, o);
}
const ri = { activeSave: "dlzp:v6:active-save", settings: "dlzp:v6:settings" },
  Ca = ["douluo-v5-save"],
  em = `检测到 V5 旧版本存档。

V6 使用了全新的内容包与存档结构，无法继续读取 V5 角色存档。
你可以开启新的 V6 命运。`;
class ee extends Error {
  constructor(e, n, o) {
    (super(n), (this.code = e), (this.name = "V6SaveError"), (this.cause = o));
  }
}
const Ce = oe(),
  j = It(oe(), ka()),
  Y = It(Gn(), Sa()),
  Te = It(Gn(), oi(), ni(0)),
  et = It(Gn(), oi(), ni(1)),
  tm = $a([oe(), Y, je()]),
  se = X({ optionId: j, text: Ce }),
  nm = X({
    selection: se,
    tangAge: Y,
    marker: x(le(["beforeAwakening", "birth"])),
  }),
  om = X({
    years: Y,
    name: Ce,
    source: x(se),
    typeSelection: x(se),
    speciesSelection: x(se),
    quality: x(
      le([
        "low",
        "ordinary",
        "top",
        "sub-dragon",
        "earth-dragon",
        "pure-dragon",
        "divine",
      ]),
    ),
  }),
  im = X({
    id: j,
    name: Ce,
    years: Y,
    partId: x(j),
    quality: x(
      le([
        "low",
        "ordinary",
        "top",
        "sub-dragon",
        "earth-dragon",
        "pure-dragon",
        "divine",
      ]),
    ),
  }),
  sm = X({ id: j, name: Ce, level: et }),
  am = X({ selection: se, percentage: Y, typeOptionId: x(j) }),
  rm = X({
    bloodlineId: j,
    ratioBasisPoints: It(Te, Ia(1e4)),
    role: le(["primary", "secondary"]),
  }),
  lm = X({
    elementId: j,
    consecutiveCount: et,
    stage: le(["normal", "ultimate", "law-seed", "complete-law"]),
  }),
  um = X({ sourceOptionId: j, minYears: Y, maxYears: Y }),
  Mo = X({
    period: z(se),
    realm: z(se),
    type: z(se),
    species: z(se),
    area: z(se),
    chronologicalAge: Y,
    bloodlines: H(am),
    bloodlineComponents: x(H(rm)),
    elementProgress: x(z(lm)),
    attributeStages: ut(oe(), Y),
    laws: H(oe()),
    tribulationsPassed: H(Y),
    evolvedThresholds: H(Y),
    plotDone: H(oe()),
    beastGod: je(),
    deathShields: Y,
    pseudoReverseShield: z(um),
    namePrefixes: H(oe()),
    nameSuffixes: H(oe()),
    lightningShields: H(X({ min: Y, max: Y })),
    interactions: ut(oe(), Y),
    godTrialQualification: z(oe()),
  }),
  dm = X({
    id: j,
    name: Ce,
    category: Ce,
    rings: H(om),
    tags: x(H(oe())),
    passives: x(H(oe())),
    awakenings: x(H(se)),
  }),
  Ea = le(["三级", "二级", "一级", "神王"]),
  ms = X({
    tier: Ea,
    tierSelection: se,
    trialId: x(j),
    deityId: z(oe()),
    deityName: z(oe()),
    deitySelection: z(se),
    currentStage: Te,
    totalStages: et,
    completedStages: H(et),
    claimedRewardStages: H(et),
    claimedRewardIds: H(j),
    status: le(["qualified", "active", "failed", "abandoned", "completed"]),
    startedAtAge: x(Y),
    completedAtAge: x(Y),
    completed: Te,
    total: et,
  }),
  cm = X({
    id: j,
    name: Ce,
    stage: le(["embryo", "complete"]),
    rank: Y,
    combatPower: x(Te),
    sourceOptionId: x(j),
  }),
  Bo = X({
    id: j,
    name: x(Ce),
    tier: x(Ea),
    levelCap: x(Y),
    levelBeforeAscension: x(Y),
    grantedAtAge: x(Y),
  }),
  fm = X({
    tier: le(["yellow", "purple", "black", "top", "seaGod"]),
    selection: se,
    totalStages: et,
    plannedStages: Te,
    currentStage: et,
    completedStages: H(et),
    claimedRewardStages: H(et),
    claimedRewardOptionIds: H(j),
    status: le(["qualified", "active", "failed", "completed"]),
    startedAtAge: Y,
    completedAtAge: x(Y),
  }),
  pm = X({
    id: j,
    title: Ce,
    kind: x(le(["success", "death", "neutral"])),
    text: x(Ce),
    finalStatus: x(le(["alive", "dead", "god", "pseudo-god"])),
    finalLevel: x(Y),
    finalBeastYears: x(Y),
    deathCause: x(Ce),
    cause: x(Ce),
    godhoodAtEnding: x(z(Bo)),
  }),
  mm = X({ identityId: x(j), originId: x(j), appliedRuleIds: H(j) }),
  hm = X({
    talentGrade: z(le(["F", "E", "D", "C", "B", "A", "S", "divine"])),
    ordinaryGrowthLocked: je(),
    unresolvedTalentGrade: je(),
  }),
  gm = X({
    preventLevelPenaltySources: H(le(["qi-deviation", "inner-demon"])),
    annualLevelBonus: Y,
  }),
  vm = X({
    id: j,
    idempotencyKey: j,
    currency: Ot("run-copper"),
    direction: le(["credit", "debit"]),
    amount: Te,
    reason: j,
    referenceId: j,
    status: Ot("committed"),
    undoPolicy: x(le(["restore", "retain"])),
  }),
  bm = X({
    factionId: j,
    status: le(["member", "ally", "enemy", "former-member"]),
    joinedAtAge: x(Y),
    leftAtAge: x(Y),
  }),
  La = X({
    route: le(["human", "beast", "transformed"]),
    wallet: x(X({ copper: Te, transactions: x(H(vm), []) })),
    entrySelections: x(
      X({
        route: z(se),
        worldLine: z(se),
        mainLine: x(z(se)),
        period: z(se),
        periodPoolId: z(j),
      }),
    ),
    age: Y,
    level: Y,
    maxLevel: Y,
    beastYears: Y,
    timelineEra: z(se),
    gender: z(se),
    appearance: z(se),
    appearanceRank: z(Y),
    storyTime: z(nm),
    timelineAge: z(Y),
    elapsedYears: Y,
    npcAges: x(ut(oe(), Y), {}),
    npcRelationships: x(
      ut(oe(), X({ affinity: Y, status: x(oe()), achievements: x(H(oe())) })),
      {},
    ),
    innatePower: z(Y),
    initialPowerResult: z(se),
    talentProgression: x(hm),
    annualGrowthPolicy: x(gm),
    faction: z(se),
    storyBranch: z(le([1, 2, 3])),
    branchStartTimelineAge: z(Y),
    beast: z(Mo),
    beastOrigin: z(Mo),
    godTrial: z(ms),
    godTrials: x(H(ms), []),
    seaTrial: z(fm),
    martialSoulTalents: H(se),
    talents: H(se),
    martialSouls: H(dm),
    bloodlines: H(oe()),
    attributes: H(oe()),
    elementProgress: x(ut(oe(), le([0, 1, 2, 3, 4])), {}),
    soulBones: H(im),
    skills: x(H(sm), []),
    artifacts: H(cm),
    traits: H(oe()),
    titles: H(oe()),
    domains: H(oe()),
    godhood: z(Bo),
    godhoods: x(H(Bo), []),
    ending: z(pm),
    flags: ut(oe(), tm),
    background: x(mm),
    affiliations: x(H(bm)),
  }),
  ym = X({
    kind: le(["result", "system"]),
    text: Ce,
    poolId: x(j),
    optionId: x(j),
    source: x(
      le([
        "normal",
        "forced-result",
        "advanced-tool",
        "intervention",
        "cheat",
        "free-wheel",
      ]),
    ),
    hiddenInShowcase: x(je()),
    major: x(je()),
  }),
  hs = X({ id: j, text: Ce, label: Ce, weight: Y, available: x(je()) }),
  wm = X({
    stepId: j,
    poolId: j,
    poolTitle: Ce,
    items: H(hs),
    selectedOption: hs,
    selectedIndex: Te,
    result: se,
    forced: je(),
    randomCursorBefore: Te,
    randomCursorAfter: Te,
  }),
  Sm = X({
    soulIndex: Te,
    ringIndex: Te,
    years: Y,
    source: z(se),
    typeSelection: z(se),
    speciesSelection: z(se),
    grantsSoulBone: je(),
    levelBefore: Y,
  }),
  Im = X({
    years: Y,
    source: se,
    quality: x(
      le([
        "low",
        "ordinary",
        "top",
        "sub-dragon",
        "earth-dragon",
        "pure-dragon",
        "divine",
      ]),
    ),
  }),
  km = X({
    mode: le(["primary", "fusion"]),
    returnStep: j,
    typeOptionId: x(j),
  }),
  $m = X({
    id: j,
    sourcePoolId: j,
    sourceOptionId: j,
    targetPoolId: j,
    targetFlowId: j,
    remainingDraws: Te,
    returnStepId: z(j),
    reason: oe(),
  }),
  Pm = X({ seed: oe(), cursor: Te, algorithm: Ot("pcg32-counter-v1") }),
  li = X({
    character: La,
    currentStepId: z(j),
    currentPoolId: z(j),
    pendingNextStepId: z(j),
    pendingFollowUps: x(H($m), []),
    awaitingAdvance: je(),
    random: Pm,
    timeline: H(ym),
    finished: je(),
    forcedResults: ut(j, j),
    forcedResultSources: x(ut(j, le(["advanced-tool", "intervention"])), {}),
    lastResolvedSpin: z(wm),
    pendingRing: z(Sm),
    additionalSoulRingBatch: z(H(Te)),
    pendingSoulBone: z(Im),
    pendingBeastSpecies: z(km),
    history: H(oe()),
    packId: j,
    worldEra: le(["unresolved", "douluo1", "douluo2"]),
  }),
  ui = Xp(li, ["history"]),
  Cm = X({
    format: Ot("dlzp-v6"),
    schemaVersion: Ot($n),
    appVersion: j,
    engineVersion: j,
    contentPackId: j,
    contentPackVersion: j,
    createdAt: It(oe(), xo()),
    updatedAt: It(oe(), xo()),
    state: li,
  }),
  Aa = "dlzp-v6-undo-compact-1";
function gn(t) {
  return typeof t == "object" && t !== null && !Array.isArray(t);
}
function Em(t) {
  return (
    gn(t) &&
    t.format === Aa &&
    Number.isSafeInteger(t.timelineLength) &&
    Number(t.timelineLength) >= 0 &&
    Number.isSafeInteger(t.walletTransactionLength) &&
    Number(t.walletTransactionLength) >= 0 &&
    "state" in t
  );
}
function Xt() {
  try {
    return typeof localStorage > "u" ? void 0 : localStorage;
  } catch {
    return;
  }
}
function Yn(t, e) {
  const n = t[0] ? Kp(t[0]) : null,
    o = [e, n].filter(Boolean).join(".");
  return new ee(
    "invalid-schema",
    o ? `V6 存档格式无效：${o}` : "V6 存档格式无效",
  );
}
function Kn(t, e, n) {
  return Yn(e, n);
}
function Jn(t, e) {
  var i;
  try {
    Hs(t.character.wallet ?? { copper: 0, transactions: [] });
  } catch (s) {
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：${e}.character.wallet ${s instanceof Error ? s.message : String(s)}`,
      s,
    );
  }
  for (const [s, a] of Object.entries(t.forcedResultSources)) {
    if (!t.forcedResults[s])
      throw new ee(
        "invalid-schema",
        `V6 存档格式无效：${e}.forcedResultSources.${s} 缺少锁定结果`,
      );
    if (a !== "advanced-tool" && a !== "intervention")
      throw new ee(
        "invalid-schema",
        `V6 存档格式无效：${e}.forcedResultSources.${s} 来源无效`,
      );
  }
  for (const [s, a] of Object.entries(t.forcedResults))
    (i = t.forcedResultSources)[s] ??
      (i[s] = t.timeline.some(
        (l) =>
          l.source === "intervention" && l.poolId === s && l.optionId === a,
      )
        ? "intervention"
        : "advanced-tool");
  if (!t.finished && !t.currentStepId)
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：${e} 未结束游戏缺少当前流程`,
    );
  if (!t.currentStepId && t.currentPoolId)
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：${e}.currentPoolId 缺少对应流程`,
    );
  const n = t.lastResolvedSpin;
  if (!n) return;
  const o = n.items[n.selectedIndex];
  if (!o || o.id !== n.selectedOption.id || n.result.optionId !== o.id)
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：${e}.lastResolvedSpin 选中项不一致`,
    );
  if (n.randomCursorAfter < n.randomCursorBefore)
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：${e}.lastResolvedSpin RNG cursor 倒退`,
    );
}
function Qn(t, e = 0, n) {
  var s, a;
  let o;
  try {
    o = JSON.parse(t);
  } catch (l) {
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：state.history.${e} 不是有效 JSON`,
      l,
    );
  }
  if (Em(o)) {
    if (!n)
      throw new ee(
        "invalid-schema",
        `V6 存档格式无效：state.history.${e} 紧凑快照缺少恢复上下文`,
      );
    const l =
      ((s = n.character.wallet) == null ? void 0 : s.transactions) ?? [];
    if (
      o.timelineLength > n.timeline.length ||
      o.walletTransactionLength > l.length
    )
      throw new ee(
        "invalid-schema",
        `V6 存档格式无效：state.history.${e} 紧凑快照长度越界`,
      );
    if (!gn(o.state))
      throw new ee(
        "invalid-schema",
        `V6 存档格式无效：state.history.${e}.state 无效`,
      );
    const u = gn(o.state.character) ? o.state.character : {},
      d = gn(u.wallet) ? u.wallet : {};
    o = {
      ...o.state,
      timeline: n.timeline.slice(0, o.timelineLength).map((p) => ({ ...p })),
      character: {
        ...u,
        wallet: {
          ...d,
          transactions: l
            .slice(0, o.walletTransactionLength)
            .map((p) => ({ ...p })),
        },
      },
    };
  }
  const i = kt(ui, o, { abortEarly: !0 });
  if (!i.success) throw Yn(i.issues, `state.history.${e}`);
  if (
    ((a = i.output.character).wallet ??
      (a.wallet = { copper: 0, transactions: [] }),
    Nt(i.output.character),
    Ft(i.output.character),
    (i.output.packId === "bootstrap" && i.output.worldEra !== "unresolved") ||
      ((i.output.packId === "douluo1" || i.output.packId === "douluo2") &&
        i.output.worldEra !== i.output.packId))
  )
    throw new ee(
      "invalid-schema",
      `V6 存档格式无效：state.history.${e} 内容包与时代不一致`,
    );
  return (Jn(i.output, `state.history.${e}`), i.output);
}
function Ra(t) {
  t.history = t.history.map((e, n) => Mt(Qn(e, n, t)));
}
function _a(t) {
  var n;
  const e = kt(Cm, t, { abortEarly: !0 });
  if (!e.success) throw Yn(e.issues);
  if (
    ((n = e.output.state.character).wallet ??
      (n.wallet = { copper: 0, transactions: [] }),
    Nt(e.output.state.character),
    Ft(e.output.state.character),
    Date.parse(e.output.updatedAt) < Date.parse(e.output.createdAt))
  )
    throw new ee("invalid-schema", "V6 存档格式无效：updatedAt 早于 createdAt");
  if (e.output.state.packId !== e.output.contentPackId)
    throw new ee(
      "invalid-schema",
      "V6 存档格式无效：state.packId 与 contentPackId 不一致",
    );
  if (
    (e.output.contentPackId === "douluo1" ||
      e.output.contentPackId === "douluo2") &&
    e.output.state.worldEra !== e.output.contentPackId
  )
    throw new ee(
      "invalid-schema",
      "V6 存档格式无效：state.worldEra 与 contentPackId 不一致",
    );
  if (e.output.engineVersion.split(".", 1)[0] !== kn.split(".", 1)[0])
    throw new ee(
      "incompatible-engine-version",
      `V6 存档引擎版本不兼容：${e.output.engineVersion}`,
    );
  return (Jn(e.output.state, "state"), Ra(e.output.state), e.output);
}
const Lm = new Set([
    "douluo2:pool.origin",
    "douluo2:pool.identity",
    "douluo2:pool.wheel",
    "douluo2:pool.ending",
    "douluo2:option.origin",
    "douluo2:option.identity",
    "douluo2:option.result",
    "douluo2:option.blocked",
    "douluo2:option.ending",
  ]),
  un = "douluo2:npc.huo";
function Am(t, e) {
  var o;
  (t.wallet ?? (t.wallet = { copper: 0, transactions: [] }),
    t.entrySelections ??
      (t.entrySelections = {
        route: null,
        worldLine: null,
        mainLine: null,
        period: null,
        periodPoolId: null,
      }),
    t.entrySelections &&
      typeof t.entrySelections == "object" &&
      !Array.isArray(t.entrySelections) &&
      ((o = t.entrySelections).mainLine ?? (o.mainLine = null)));
  const n = t.flags;
  if (
    n &&
    typeof n == "object" &&
    !Array.isArray(n) &&
    n["formal:double-level-gain"] === !0
  ) {
    delete n["formal:double-level-gain"];
    const i = t.annualGrowthPolicy,
      s =
        i && typeof i == "object" && !Array.isArray(i)
          ? i
          : { preventLevelPenaltySources: [], annualLevelBonus: 0 };
    ((s.annualLevelBonus = Number(s.annualLevelBonus ?? 0) + 4),
      (t.annualGrowthPolicy = s));
  }
  if (e < 3) {
    const i = t.route,
      s =
        typeof t.elapsedYears == "number" && Number.isFinite(t.elapsedYears)
          ? Math.max(0, t.elapsedYears)
          : 0;
    (i === "human" || i === "transformed") && (t.age = 6 + s);
    const a = Array.isArray(t.attributes)
        ? t.attributes.filter((g) => typeof g == "string")
        : [],
      l = {},
      u = (g) => {
        const w = /完整(.+)法则/.exec(g);
        if (w) return { id: w[1], level: 4 };
        const b = /(.+)法则雏形/.exec(g);
        if (b) return { id: b[1], level: 3 };
        const c = /^(?:极致|极)(.+?)(?:属性)?$/.exec(g);
        return c
          ? { id: c[1], level: 2 }
          : { id: g.replace(/属性$/, ""), level: 1 };
      };
    for (const g of a) {
      const w = u(g);
      w.id && (l[w.id] = Math.max(l[w.id] ?? 0, w.level));
    }
    const d = t.elementProgress;
    if (d && typeof d == "object")
      for (const [g, w] of Object.entries(d))
        typeof w == "number" &&
          (l[g] = Math.max(l[g] ?? 0, Math.min(4, Math.max(0, Math.trunc(w)))));
    const p = {};
    for (const [g, w] of Object.entries(l)) {
      const b = bt(g);
      b && (p[b] = Math.max(p[b] ?? 0, w));
    }
    ((t.elementProgress = p), (t.attributes = Object.keys(p)));
    const f =
        t.npcRelationships && typeof t.npcRelationships == "object"
          ? { ...t.npcRelationships }
          : {},
      I = t.flags && typeof t.flags == "object" ? t.flags : {};
    (!f[un] &&
      typeof I["formal:affinity"] == "number" &&
      (f[un] = { affinity: I["formal:affinity"] }),
      (t.npcRelationships = f));
    const k = t.npcAges && typeof t.npcAges == "object" ? { ...t.npcAges } : {};
    (k[un] === void 0 &&
      I["douluo2:story:initialized"] === !0 &&
      typeof t.timelineAge == "number" &&
      (k[un] = t.timelineAge),
      (t.npcAges = k));
  }
  if (e < 4 && Array.isArray(t.soulBones)) {
    const i = [
      ["外附", "external"],
      ["躯干", "torso"],
      ["左臂", "leftArm"],
      ["右臂", "rightArm"],
      ["左腿", "leftLeg"],
      ["右腿", "rightLeg"],
      ["头骨", "head"],
      ["头部", "head"],
    ];
    t.soulBones = t.soulBones.map((s) => {
      var f;
      if (!s || typeof s != "object" || Array.isArray(s)) return s;
      const a = { ...s },
        l = typeof a.id == "string" ? a.id : null,
        u = typeof a.partId == "string" ? a.partId : null,
        d = typeof a.name == "string" ? a.name : "",
        p =
          Ve(u) ??
          Ve(l) ??
          ((f = i.find(([I]) => d.includes(I))) == null ? void 0 : f[1]);
      return (p && (a.partId = p), a);
    });
  }
}
function Ta(t, e) {
  const n = { ...t },
    o = n.character;
  if (o && typeof o == "object") {
    const i = { ...o };
    (Am(i, e), (n.character = i));
  }
  return (
    n.pendingFollowUps ?? (n.pendingFollowUps = []),
    Array.isArray(n.history) &&
      (n.history = n.history.map((i) => {
        if (typeof i != "string") return i;
        try {
          return JSON.stringify(Ta(JSON.parse(i), e));
        } catch {
          return i;
        }
      })),
    n
  );
}
function Rm(t) {
  if (!t || typeof t != "object") return t;
  const e = t;
  if (
    e.format !== "dlzp-v6" ||
    typeof e.schemaVersion != "number" ||
    e.schemaVersion >= $n
  )
    return t;
  const n = { ...e },
    o = e.state,
    i = e.schemaVersion,
    s = o && typeof o == "object" ? Ta(o, i) : void 0;
  if ((s && (n.state = s), !s)) return n;
  const a = JSON.stringify(s),
    l = [...Lm].find((u) => a.includes(`"${u}"`));
  if (l)
    throw new ee(
      "invalid-state-reference",
      `V6 beta 存档引用已退役内容 ${l}；该测试流程没有可确认的正式映射，请从正式入口开启新命运`,
    );
  return ((n.schemaVersion = $n), n);
}
function vo(t, e, n) {
  const o = n();
  if (o) return o;
  const i = { flow: "流程", pool: "转盘", option: "选项" },
    s = {
      flow: "unknown-flow",
      pool: "unknown-pool",
      option: "unknown-option",
    };
  throw new ee(s[t], `V6 存档引用了未知${i[t]}：${e}`);
}
function _m(t, e) {
  var i, s;
  const n = (a) => {
      a && (a.optionId = e(a.optionId));
    },
    o = (a) => {
      if (a) {
        (n(a.period), n(a.realm), n(a.type), n(a.species), n(a.area));
        for (const l of a.bloodlines)
          (n(l.selection),
            l.typeOptionId && (l.typeOptionId = e(l.typeOptionId)));
        a.pseudoReverseShield &&
          (a.pseudoReverseShield.sourceOptionId = e(
            a.pseudoReverseShield.sourceOptionId,
          ));
      }
    };
  (n(t.timelineEra),
    t.entrySelections &&
      (n(t.entrySelections.route),
      n(t.entrySelections.worldLine),
      n(t.entrySelections.mainLine),
      n(t.entrySelections.period)),
    n(t.gender),
    n(t.appearance),
    n((i = t.storyTime) == null ? void 0 : i.selection),
    ((s = t.initialPowerResult) == null ? void 0 : s.optionId) === "99f6e9" &&
      (t.initialPowerResult.optionId = "238698"),
    n(t.initialPowerResult),
    n(t.faction),
    o(t.beast),
    o(t.beastOrigin));
  for (const a of t.martialSoulTalents) n(a);
  for (const a of t.talents) n(a);
  for (const a of t.martialSouls) {
    for (const l of a.rings)
      (n(l.source), n(l.typeSelection), n(l.speciesSelection));
    for (const l of a.awakenings ?? []) n(l);
  }
  (t.godTrial && (n(t.godTrial.tierSelection), n(t.godTrial.deitySelection)),
    t.seaTrial &&
      (n(t.seaTrial.selection),
      (t.seaTrial.claimedRewardOptionIds =
        t.seaTrial.claimedRewardOptionIds.map((a) => e(a)))));
  for (const a of t.artifacts)
    a.sourceOptionId && (a.sourceOptionId = e(a.sourceOptionId));
}
function di(t, e, n, o = !1) {
  var k;
  const i =
      n === "runtime"
        ? (e.resolveRuntimeFlowId ?? e.resolveFlowId)
        : e.resolveFlowId,
    s =
      n === "runtime"
        ? (e.resolveRuntimePoolId ?? e.resolvePoolId)
        : e.resolvePoolId,
    a =
      n === "runtime"
        ? (e.resolveRuntimeOptionId ?? e.resolveOptionId)
        : e.resolveOptionId,
    l = (g) => vo("flow", g, () => i(g)),
    u = (g) => vo("pool", g, () => s(g)),
    d = (g, w) => {
      var c;
      g === "99f6e9" &&
        w === "4cf4487d-cd5b-4689-9b81-e0792932b93c" &&
        (g = "238698");
      const b = a(g, w);
      return (
        b ||
        (w === void 0 && (c = e.isKnownOptionId) != null && c.call(e, g)
          ? g
          : vo("option", g, () => {}))
      );
    };
  if (
    (t.currentStepId && (t.currentStepId = l(t.currentStepId)),
    t.currentPoolId && (t.currentPoolId = u(t.currentPoolId)),
    t.pendingNextStepId && (t.pendingNextStepId = l(t.pendingNextStepId)),
    t.pendingBeastSpecies &&
      ((t.pendingBeastSpecies.returnStep = l(t.pendingBeastSpecies.returnStep)),
      t.pendingBeastSpecies.typeOptionId &&
        (t.pendingBeastSpecies.typeOptionId = d(
          t.pendingBeastSpecies.typeOptionId,
        ))),
    t.pendingRing)
  ) {
    const g = [
      t.pendingRing.source,
      t.pendingRing.typeSelection,
      t.pendingRing.speciesSelection,
    ];
    for (const w of g) w && (w.optionId = d(w.optionId));
  }
  (t.pendingSoulBone &&
    (t.pendingSoulBone.source.optionId = d(t.pendingSoulBone.source.optionId)),
    _m(t.character, d));
  const p = {},
    f = {};
  for (const [g, w] of Object.entries(t.forcedResults)) {
    const b = u(g),
      c = d(w, b);
    if (p[b] && p[b] !== c)
      throw new ee(
        "invalid-state-reference",
        `V6 存档中多个旧 ID 映射到同一转盘：${b}`,
      );
    p[b] = c;
    const L = t.forcedResultSources[g];
    f[b] =
      L ??
      (t.timeline.some(
        (m) =>
          m.source === "intervention" && m.poolId === g && m.optionId === w,
      )
        ? "intervention"
        : "advanced-tool");
  }
  ((t.forcedResults = p), (t.forcedResultSources = f));
  for (const g of t.timeline)
    (g.poolId && (g.poolId = u(g.poolId)),
      g.optionId && (g.optionId = d(g.optionId, g.poolId)));
  const I = t.lastResolvedSpin;
  if (I) {
    ((I.stepId = l(I.stepId)), (I.poolId = u(I.poolId)));
    for (const g of I.items) g.id = d(g.id, I.poolId);
    ((I.selectedOption.id = d(I.selectedOption.id, I.poolId)),
      (I.result.optionId = d(I.result.optionId, I.poolId)));
  }
  return (
    "history" in t &&
      (t.history = t.history.map((g, w) => {
        var c, L;
        const b = Qn(g, w, t);
        return b.packId !== t.packId
          ? (o &&
              ((c = e.validateState) == null ||
                c.call(e, { ...b, history: [] })),
            Mt(b))
          : (di(b, e, n, !1),
            o &&
              ((L = e.validateState) == null ||
                L.call(e, { ...b, history: [] })),
            Mt(b));
      })),
    o &&
      ((k = e.validateState) == null ||
        k.call(e, "history" in t ? t : { ...t, history: [] })),
    t
  );
}
function Tm(t, e) {
  if (t.contentPackId !== e.contentPackId)
    throw new ee("unknown-pack", `V6 存档内容包不匹配：${t.contentPackId}`);
  if (e.contentPackVersion && t.contentPackVersion !== e.contentPackVersion)
    throw new ee(
      "incompatible-pack-version",
      `V6 存档内容包版本不兼容：${t.contentPackVersion}`,
    );
  return (di(t.state, e, "canonical", !0), t);
}
function dn(t, e = {}, n = []) {
  const o = [t, ...n.filter((l) => l.manifest.id !== t.manifest.id)],
    i = (l) => {
      var u;
      return ((u = e.resolveFlowId) == null ? void 0 : u.call(e, l)) ?? l;
    },
    s = (l) => {
      var u;
      return ((u = e.resolvePoolId) == null ? void 0 : u.call(e, l)) ?? l;
    },
    a = (l) => {
      var u;
      return ((u = e.resolveOptionId) == null ? void 0 : u.call(e, l)) ?? l;
    };
  return {
    contentPackId: t.manifest.id,
    contentPackVersion: t.manifest.version,
    resolveFlowId(l) {
      for (const u of o)
        try {
          return u.ids.canonicalFlowId(i(l));
        } catch {}
    },
    resolvePoolId(l) {
      for (const u of o)
        try {
          return u.ids.canonicalPoolId(s(l));
        } catch {}
    },
    resolveOptionId(l, u) {
      for (const d of o)
        try {
          return d.ids.canonicalOptionId(a(l), u);
        } catch {}
    },
    isKnownOptionId(l) {
      return o.some((u) => u.ids.isKnownOptionId(a(l)));
    },
    resolveRuntimeFlowId(l) {
      for (const u of o)
        try {
          return u.ids.resolveFlowId(i(l));
        } catch {}
    },
    resolveRuntimePoolId(l) {
      for (const u of o)
        try {
          return u.ids.resolvePoolId(s(l));
        } catch {}
    },
    resolveRuntimeOptionId(l, u) {
      for (const d of o)
        try {
          return d.ids.resolveOptionId(a(l), u);
        } catch {}
    },
    validateState(l) {
      try {
        const u = o.find((f) => f.manifest.id === l.packId);
        if (!u) throw new Error(`未加载历史内容包 ${l.packId}`);
        const d = l.currentStepId
            ? u.ids.resolveFlowId(i(l.currentStepId))
            : null,
          p = l.currentPoolId ? u.ids.resolvePoolId(s(l.currentPoolId)) : null;
        hn(u.game, { ...l, currentStepId: d, currentPoolId: p });
      } catch (u) {
        throw new ee(
          "invalid-state-reference",
          `V6 存档时代或当前转盘不兼容：${u instanceof Error ? u.message : String(u)}`,
          u,
        );
      }
    },
  };
}
function Me(t, e = {}) {
  var i;
  const n =
      e.randomCursor === void 0
        ? t
        : { ...t, random: { ...t.random, cursor: e.randomCursor } },
    o = kt(li, n, { abortEarly: !0 });
  if (!o.success) throw Kn(n, o.issues);
  return (
    (i = o.output.character).wallet ??
      (i.wallet = { copper: 0, transactions: [] }),
    Nt(o.output.character),
    Ft(o.output.character),
    Jn(o.output, "state"),
    e.validateHistory !== !1 && Ra(o.output),
    o.output
  );
}
function xa(t) {
  return Me(t);
}
function gs(t, e = {}) {
  var a;
  const { history: n, ...o } = t,
    i =
      e.randomCursor === void 0
        ? o
        : { ...o, random: { ...t.random, cursor: e.randomCursor } },
    s = kt(ui, i, { abortEarly: !0 });
  if (!s.success) throw Kn(i, s.issues, "undoSnapshot");
  return (
    (a = s.output.character).wallet ??
      (a.wallet = { copper: 0, transactions: [] }),
    Nt(s.output.character),
    Ft(s.output.character),
    Jn(s.output, "undoSnapshot"),
    s.output
  );
}
function Mt(t, e = {}) {
  const n = "history" in t ? gs(t, e) : gs({ ...t, history: [] }, e),
    o = n.character.wallet ?? { copper: 0, transactions: [] },
    i = {
      ...n,
      timeline: [],
      character: { ...n.character, wallet: { ...o, transactions: [] } },
    },
    s = kt(ui, i, { abortEarly: !0 });
  if (!s.success) throw Kn(i, s.issues, "undoSnapshot");
  return JSON.stringify({
    format: Aa,
    timelineLength: n.timeline.length,
    walletTransactionLength: o.transactions.length,
    state: s.output,
  });
}
function zg(t) {
  const e = kt(Mo, t, { abortEarly: !0 });
  if (!e.success) throw Yn(e.issues, "character.beast");
  return e.output;
}
function xm(t) {
  var n;
  const e = kt(La, t, { abortEarly: !0 });
  if (!e.success) throw Kn(t, e.issues, "character");
  return (
    (n = e.output).wallet ?? (n.wallet = { copper: 0, transactions: [] }),
    Nt(e.output),
    Ft(e.output),
    e.output
  );
}
function Oa(t, e, n, o = new Date().toISOString(), i = o) {
  return _a({
    format: "dlzp-v6",
    schemaVersion: $n,
    appVersion: Ur,
    engineVersion: kn,
    contentPackId: t,
    contentPackVersion: e,
    createdAt: i,
    updatedAt: o,
    state: xa(n),
  });
}
function Om(t, e, n = new Date().toISOString()) {
  const o = Zt(t);
  return Oa(o.contentPackId, o.contentPackVersion, e, n, o.createdAt);
}
function Zt(t, e) {
  const n = _a(Rm(t));
  return e ? Tm(n, e) : n;
}
function Ma(t, e) {
  return JSON.stringify(Zt(t, e));
}
function No(t, e) {
  let n;
  try {
    n = JSON.parse(t);
  } catch (o) {
    throw new ee("invalid-json", "V6 存档 JSON 已损坏，无法读取", o);
  }
  return Zt(n, e);
}
function vs(t, e) {
  const n = xa(Zt(t, e).state);
  return (e && di(n, e, "runtime", !1), n);
}
function Xn(t) {
  if (!t) throw new ee("storage-unavailable", "当前浏览器无法使用本机存档");
  return t;
}
function bs(t, e = Xt(), n) {
  const o = Ma(t, n);
  try {
    Xn(e).setItem(ri.activeSave, o);
  } catch (i) {
    throw i instanceof ee
      ? i
      : new ee("storage-write-failed", "V6 本机存档写入失败", i);
  }
}
function Mm(t = Xt(), e) {
  let n;
  try {
    n = Xn(t).getItem(ri.activeSave);
  } catch (o) {
    throw o instanceof ee
      ? o
      : new ee("storage-read-failed", "V6 本机存档读取失败", o);
  }
  return n === null ? null : No(n, e);
}
function Bm(t = Xt()) {
  try {
    Xn(t).removeItem(ri.activeSave);
  } catch (e) {
    throw e instanceof ee
      ? e
      : new ee("storage-write-failed", "V6 本机存档删除失败", e);
  }
}
function Nm(t = Xt()) {
  if (!t) return !1;
  try {
    return Ca.some((e) => t.getItem(e) !== null);
  } catch {
    return !1;
  }
}
function Dm(t = Xt()) {
  try {
    const e = Xn(t);
    Ca.forEach((n) => e.removeItem(n));
  } catch (e) {
    throw e instanceof ee
      ? e
      : new ee("storage-write-failed", "V5 旧存档清除失败", e);
  }
}
const Fm = 150;
function Pe(t, e) {
  const n =
      t.martialSouls.some((i) => {
        var s;
        return (s = i.passives) == null ? void 0 : s.includes("levelCap:29");
      }) &&
      !t.flags.immortalHerb &&
      !t.traits.includes("innate-dao-body"),
    o = t.flags.noSoulPower ? 0 : 1;
  return Math.max(o, Math.min(t.maxLevel, n ? 29 : e));
}
function zt(t, e) {
  return !t.flags.noSoulPower || e <= t.level;
}
function bo(t, e) {
  t.some((n) => n.optionId === e.optionId) || t.push({ ...e });
}
function De(t) {
  return { ...t };
}
function ys(t) {
  return {
    ...t,
    ...(t.source ? { source: De(t.source) } : {}),
    ...(t.typeSelection ? { typeSelection: De(t.typeSelection) } : {}),
    ...(t.speciesSelection ? { speciesSelection: De(t.speciesSelection) } : {}),
  };
}
function Do(t, e = []) {
  return e.some((n) => t.traits.includes(n));
}
const Ba = (t, e) => `formal:inventory:${t}:${e}`,
  yo = "formal:pending-soul-bone-upgrade-years";
function Re(t, e) {
  const n = Number(t.flags[e] ?? 0);
  return Number.isFinite(n) ? n : 0;
}
function ot(t, e) {
  return e;
}
function Vm(t) {
  const e = "formal:domain-embryo-unlock:";
  for (const [n, o] of Object.entries(t.flags))
    !n.startsWith(e) ||
      t.level < Number(o) ||
      ((t.flags["formal:domain-draws"] = Re(t, "formal:domain-draws") + 1),
      delete t.flags[n]);
}
function ws(t) {
  if (t.flags["formal:pending-domain-seed"] !== !0) return;
  const e = Object.keys(t.flags).find((o) =>
    o.startsWith("formal:domain-embryo-unlock:"),
  );
  if (!e) return;
  (delete t.flags[e],
    (t.flags["formal:pending-domain-seed"] = !1),
    (t.flags["formal:domain-draws"] = Re(t, "formal:domain-draws") + 1));
  const n = Ba("item", "领域种子");
  t.flags[n] = Math.max(0, Re(t, n) - 1);
}
function wo(t) {
  const e = Object.entries(t.flags).find(([n, o]) => {
    if (!n.startsWith("formal:level-loss-shield:") || Number(o ?? 0) < 1)
      return !1;
    const i = Number(n.split(":")[2]);
    return !Number.isFinite(i) || t.level <= i;
  });
  return e
    ? ((t.flags[e[0]] = Math.max(0, Number(e[1]) - 1)),
      (t.flags["formal:last-level-loss-prevented"] = e[0]),
      !0)
    : !1;
}
function Ss(t) {
  const e = Object.entries(t.flags).filter(([o, i]) => {
    if (!o.startsWith("formal:death-shield:") || Number(i ?? 0) < 1) return !1;
    const s = Number(o.split(":")[2]);
    return !Number.isFinite(s) || t.level <= s;
  });
  e.sort(
    ([o], [i]) =>
      Number(o.includes(":reset-human-cultivation:")) -
        Number(i.includes(":reset-human-cultivation:")) || o.localeCompare(i),
  );
  const n = e[0];
  if (!n) return !1;
  if (
    ((t.flags[n[0]] = Math.max(0, Number(n[1]) - 1)),
    n[0].includes(":reset-human-cultivation:"))
  ) {
    ((t.level = Math.max(t.flags.noSoulPower ? 0 : 1, 1)), (t.soulBones = []));
    for (const o of t.martialSouls) o.rings = [];
  }
  return ((t.flags["formal:last-death-prevented"] = n[0]), !0);
}
function jm(t, e, n = !1) {
  const o = Ve(n ? "external" : e);
  return o ? Ht(t) === o : t.id === e || t.partId === e;
}
function zm(t, e) {
  const n = t.martialSouls.flatMap((u) => u.passives ?? []);
  (n.includes("formal:element-opportunity-per-time-skip") &&
    (t.flags["formal:element-draws"] = Re(t, "formal:element-draws") + 1),
    n.includes("formal:level-minus-one-per-time-skip") &&
      t.level > 0 &&
      (t.level = Pe(t, t.level - 1)));
  const o =
    (n.includes("formal:level-plus-two-per-time-skip") ? 2 : 0) +
    (n.includes("formal:level-plus-four-per-time-skip") ? 4 : 0);
  if (
    (o > 0 && (t.level = Pe(t, t.level + o)),
    !t.martialSouls.some((u) => {
      var d;
      return (d = u.passives) == null
        ? void 0
        : d.includes("mindDeviation:loseLevelEvery2Years");
    }))
  )
    return;
  const s = "periodicYears:evilFirePhoenix",
    a = (typeof t.flags[s] == "number" ? t.flags[s] : 0) + e,
    l = Math.floor(a / 2);
  ((t.flags[s] = a % 2),
    l > 0 &&
      !Do(t, ["clear-dao-heart", "innate-dao-body"]) &&
      (t.level = Pe(t, t.level - l)));
}
const Um = { 三级: 109, 二级: 119, 一级: 139, 神王: 159 };
function So(t, e) {
  const n = e.kind === "death" ? e.deathCause : void 0,
    o = t.flags.finalStatus,
    i =
      e.finalStatus ??
      (e.kind === "death"
        ? "dead"
        : o === "pseudo-god"
          ? "pseudo-god"
          : t.godhood
            ? "god"
            : "alive");
  return {
    id: e.id,
    title: e.title,
    kind: e.kind,
    text: e.text,
    finalStatus: i,
    finalLevel: t.level,
    finalBeastYears: t.beastYears,
    deathCause: n,
    cause: n,
    godhoodAtEnding: t.godhood ? { ...t.godhood } : null,
  };
}
function Wm(t, e) {
  var u;
  const n = Nt(t),
    o = ei(e.id),
    i = () => {
      t.godTrial &&
        ((t.godTrial.status = "completed"),
        (t.godTrial.completedAtAge = t.age),
        (t.godTrial.currentStage = t.godTrial.totalStages));
    };
  if (n.some((d) => d.id === o)) return (i(), "NO_OP_DUPLICATE");
  if (!vd(t)) return (i(), "NO_OP_CAP_REACHED");
  const s = t.level,
    a = e.tier ?? ((u = t.godTrial) == null ? void 0 : u.tier),
    l = e.maxLevel ?? (a ? Um[a] : 100);
  return (
    (t.godhood =
      a || e.name || e.maxLevel !== void 0
        ? {
            id: o,
            name: e.name,
            tier: a,
            levelCap: l,
            levelBeforeAscension: s,
            grantedAtAge: t.age,
          }
        : { id: o }),
    n.push({ ...t.godhood }),
    (t.maxLevel = Math.max(t.maxLevel, l, 100)),
    (t.level = Math.max(t.level, 100)),
    i(),
    (t.flags.finalStatus = "god"),
    "GRANTED"
  );
}
function Na(t, e, n) {
  var i, s, a, l, u, d, p, f, I, k, g, w;
  const o =
    n.idempotencyKeyPrefix ?? `effect-batch:${pt(t).transactions.length}`;
  for (const [b, c] of e.entries()) {
    const L = {
      reason: n.reason ?? `rule-effect:${c.type}`,
      referenceId: n.referenceId ?? "effect-engine",
      idempotencyKey: `${o}:${b}:${c.type}`,
    };
    switch (c.type) {
      case "conditional":
        Na(t, Nn(t, c.condition) ? c.thenEffects : (c.elseEffects ?? []), {
          ...n,
          idempotencyKeyPrefix: `${o}:${b}:conditional`,
        });
        break;
      case "setRoute":
        ((t.route = c.route),
          (t.age = 0),
          (t.level = c.route === "beast" ? 0 : 1),
          (t.beastYears = c.route === "beast" ? 10 : 0),
          (t.flags.routeSelected = !0),
          (t.beast = c.route === "beast" ? To() : null),
          (t.beastOrigin = null));
        break;
      case "setTimelineEra":
        t.timelineEra = De(c.selection);
        break;
      case "setBeastPeriod":
        (t.beast || (t.beast = To()),
          (t.beast.period = De(c.selection)),
          (t.beast.chronologicalAge = 0),
          (t.timelineAge = 0),
          (t.elapsedYears = 0));
        break;
      case "setGender":
        t.gender = De(c.selection);
        break;
      case "setAppearance":
        ((t.appearance = De(c.selection)), (t.appearanceRank = c.rank));
        break;
      case "changeAppearanceRank":
        ((t.appearanceRank = Math.max(
          0,
          Math.min(7, (t.appearanceRank ?? 0) + c.amount),
        )),
          (t.appearance = Vp(t.appearanceRank) ?? t.appearance));
        break;
      case "setStoryTime":
        ((t.storyTime = { ...c.value, selection: De(c.value.selection) }),
          (t.timelineAge = c.value.tangAge));
        break;
      case "setAge":
        t.age = Math.max(0, c.value);
        break;
      case "setInnatePower":
        {
          const m =
              typeof t.flags["douluo2:innate-fixed"] == "number"
                ? t.flags["douluo2:innate-fixed"]
                : void 0,
            h = t.flags["douluo2:innate-cap-10"] === !0,
            $ =
              typeof t.flags["douluo2:innate-offset"] == "number"
                ? t.flags["douluo2:innate-offset"]
                : 0,
            N = m ?? c.value + $,
            te = h ? Math.min(10, N) : N,
            ne = t.flags["identity:innate-min-1"] === !0 ? Math.max(1, te) : te;
          t.innatePower = Math.max(0, ne);
          const ue =
            c.value === 20 &&
            t.innatePower === 19 &&
            $ === -1 &&
            t.flags["identity:innate-min-1"] === !0;
          ((t.initialPowerResult = De(c.selection)),
            (t.level = t.innatePower === 0 ? 0 : Pe(t, t.innatePower)),
            zp(t),
            ue &&
              t.talentProgression &&
              ((t.talentProgression.talentGrade = "divine"),
              (t.talentProgression.unresolvedTalentGrade = !1)));
        }
        break;
      case "setTalentGrade":
        t.talentProgression = {
          talentGrade: c.grade,
          ordinaryGrowthLocked: c.grade === "F",
          unresolvedTalentGrade: !1,
        };
        break;
      case "configureAnnualGrowthPolicy": {
        const m = t.annualGrowthPolicy ?? {
          preventLevelPenaltySources: [],
          annualLevelBonus: 0,
        };
        ((i = c.preventLevelPenaltySources) != null &&
          i.length &&
          (m.preventLevelPenaltySources = [
            ...new Set([
              ...m.preventLevelPenaltySources,
              ...c.preventLevelPenaltySources,
            ]),
          ]),
          c.annualLevelBonus !== void 0 &&
            (m.annualLevelBonus = c.annualLevelBonus),
          (t.annualGrowthPolicy = m));
        break;
      }
      case "applyAnnualGrowth": {
        const m = t.level,
          h = Up(t, c),
          $ = m + ot(t, h.resolvedLevelDelta),
          N = c.clampToMajorTierFloor ? Math.max(ds(m), $) : $;
        zt(t, N) && (t.level = Pe(t, N));
        break;
      }
      case "setFaction":
        t.faction = De(c.selection);
        break;
      case "setIdentity":
        (t.background ?? (t.background = { appliedRuleIds: [] }),
          (t.background.identityId = c.identityId));
        break;
      case "setOrigin":
        (t.background ?? (t.background = { appliedRuleIds: [] }),
          (t.background.originId = c.originId));
        break;
      case "setAffiliation": {
        t.affiliations ?? (t.affiliations = []);
        const m = t.affiliations.findIndex(
          (h) => h.factionId === c.affiliation.factionId,
        );
        m >= 0
          ? (t.affiliations[m] = { ...c.affiliation })
          : t.affiliations.push({ ...c.affiliation });
        break;
      }
      case "changeCurrency":
        if (c.copper >= 0) gt(t, c.copper, L);
        else {
          const m = -c.copper;
          if (c.insufficient === "clamp") {
            const h = pt(t),
              $ = Math.min(m, h.copper),
              N = h.copper < m;
            (Rn(t, $, L),
              N &&
                (s = c.onInsufficientEffects) != null &&
                s.length &&
                Kt(t, c.onInsufficientEffects, {
                  reason: "formal-option-effect",
                }));
          } else if (Rn(t, m, L).insufficient)
            throw new Error(`灵币不足：需要 ${-c.copper} 铜灵币`);
        }
        break;
      case "clearRunCurrency":
        Ks(t, L);
        break;
      case "setStoryBranch":
        ((t.storyBranch = c.branch),
          (t.branchStartTimelineAge = t.timelineAge));
        break;
      case "startGodTrial":
        if (t.godTrial) {
          if (
            t.godTrial.status === "active" ||
            t.godTrial.status === "qualified"
          )
            throw new Error(
              "已有神考正在进行，新的神考机会必须保留到当前神考结束后",
            );
          (t.godTrials ?? (t.godTrials = []),
            t.godTrials.push(structuredClone(t.godTrial)));
        }
        t.godTrial = {
          tier: c.tier,
          tierSelection: De(c.selection),
          trialId: void 0,
          deityId: null,
          deityName: null,
          deitySelection: null,
          currentStage: 0,
          totalStages: c.total,
          completedStages: [],
          claimedRewardStages: [],
          claimedRewardIds: [],
          status: "qualified",
          startedAtAge: t.age,
          completed: 0,
          total: c.total,
        };
        break;
      case "setGodTrialDeity":
        if (!t.godTrial) throw new Error("内容配置错误：尚未获得神考等级");
        ((t.godTrial.deityId = c.deityId),
          (t.godTrial.deityName = c.deityName),
          (t.godTrial.deitySelection = De(c.selection)),
          (t.godTrial.trialId = c.deityId),
          (t.godTrial.status = "active"),
          (t.godTrial.currentStage = Math.max(1, t.godTrial.currentStage)));
        break;
      case "changeLevel":
        if (c.amount < 0 && wo(t)) break;
        zt(t, t.level + ot(t, c.amount)) &&
          (t.level = Pe(t, t.level + ot(t, c.amount)));
        break;
      case "changeGodTrialLevel": {
        const m = Math.trunc(c.amount);
        if (m < 0) throw new Error("神考等级奖励不能为负数");
        ((t.level += m), (t.maxLevel = Math.max(t.maxLevel, t.level)));
        break;
      }
      case "changeLevelUnlessTraits":
        if (c.amount < 0 && wo(t)) break;
        !Do(t, c.traitIds) &&
          zt(t, t.level + ot(t, c.amount)) &&
          (t.level = Pe(t, t.level + ot(t, c.amount)));
        break;
      case "changeLevelWithTierFloor": {
        if ((c.amount < 0 && wo(t)) || Do(t, c.unlessTraitIds)) break;
        const m = t.level,
          h = ds(m);
        t.level = Pe(t, Math.max(h, m + ot(t, c.amount)));
        break;
      }
      case "setLevel":
        zt(t, c.value) && (t.level = Pe(t, c.value));
        break;
      case "raiseLevelToAtLeast":
        t.level < c.value && zt(t, c.value) && (t.level = Pe(t, c.value));
        break;
      case "advanceHumanTime":
        (gt(
          t,
          (Ys(t.level) +
            (typeof t.flags["identity:annual-income-bonus-copper"] == "number"
              ? t.flags["identity:annual-income-bonus-copper"]
              : 0)) *
            Math.max(0, Math.floor(c.years)),
          { ...L, reason: "formal-annual-income" },
        ),
          (t.age = Math.max(0, t.age + c.years)),
          (t.timelineAge =
            (t.timelineAge ??
              ((a = t.storyTime) == null ? void 0 : a.tangAge) ??
              0) + c.years),
          (t.elapsedYears += c.years));
        {
          const m = Math.trunc(Re(t, "formal:next-time-skip-level-bonus"));
          m !== 0 &&
            ((t.level = Pe(t, t.level + ot(t, m))),
            (t.flags["formal:next-time-skip-level-bonus"] = 0));
        }
        (zm(t, c.years), eu(t));
        break;
      case "advanceBeastTime": {
        if (t.route !== "beast" || !t.beast)
          throw new Error("纯魂兽时间推进缺少魂兽状态");
        const m = Math.max(0, Math.trunc(c.years)),
          h = Math.trunc(c.cultivationDelta);
        (gt(t, jl(t.beastYears, h, m), {
          ...L,
          reason: "formal-beast-time-income",
        }),
          (t.beastYears = Math.max(0, t.beastYears + h)),
          (t.beast.chronologicalAge += m),
          (t.elapsedYears += m),
          (t.timelineAge = (t.timelineAge ?? 0) + m));
        break;
      }
      case "advanceStoryProtagonistAge": {
        const m = Math.max(0, Math.trunc(c.years ?? 1));
        ((t.timelineAge =
          (t.timelineAge ??
            ((l = t.storyTime) == null ? void 0 : l.tangAge) ??
            0) + m),
          t.storyTime && (t.storyTime.tangAge += m),
          typeof t.npcAges[Gt] == "number" && (t.npcAges[Gt] += m));
        break;
      }
      case "changeBeastYears":
        t.beastYears = Math.max(0, t.beastYears + c.amount);
        break;
      case "changeBeastYearsWithFloor":
        t.beastYears = Math.max(c.minimum, t.beastYears + c.amount);
        break;
      case "setBeastYears":
        t.beastYears = Math.max(0, c.value);
        break;
      case "advanceBeastElement":
        {
          const m = t.route === "beast" && !t.attributes.includes(c.elementId);
          (Np(t, c.elementId),
            m && gt(t, He, { ...L, reason: "formal-beast-attribute-bonus" }));
        }
        break;
      case "setBeastBloodlineComposition":
        Fp(t, c.components);
        break;
      case "addMartialSoulTalent":
        bo(t.martialSoulTalents, c.selection);
        break;
      case "addMartialSoul":
        (t.martialSouls.push({
          id: c.soulId,
          name: c.name,
          category: c.category,
          rings: [],
          tags: c.tags ? [...c.tags] : void 0,
          passives: c.passives ? [...c.passives] : void 0,
        }),
          (t.level = Pe(t, t.level)));
        break;
      case "replaceMartialSoul":
        ((t.martialSouls[c.soulIndex] = {
          id: c.soulId,
          name: c.name,
          category: c.category,
          rings: [],
          tags: c.tags ? [...c.tags] : void 0,
          passives: c.passives ? [...c.passives] : void 0,
        }),
          (t.level = Pe(t, t.level)));
        break;
      case "awakenMartialSoul": {
        const m = t.martialSouls[c.soulIndex];
        if (!m)
          throw new Error(`内容配置错误：武魂槽 ${c.soulIndex + 1} 不存在`);
        (m.awakenings ?? (m.awakenings = []),
          bo(m.awakenings, c.awakening),
          (u = c.tags) != null &&
            u.length &&
            (m.tags = [...new Set([...(m.tags ?? []), ...c.tags])]),
          (d = c.passives) != null &&
            d.length &&
            (m.passives = [...new Set([...(m.passives ?? []), ...c.passives])]),
          (t.level = Pe(t, t.level)));
        break;
      }
      case "addSoulRing": {
        const m = t.martialSouls[c.soulIndex];
        m &&
          !m.rings.some((h) => h.name === c.ring.name) &&
          m.rings.push(ys(c.ring));
        break;
      }
      case "setSoulRing": {
        const m = t.martialSouls[c.soulIndex];
        if (!m) throw new Error(`魂环归属的武魂槽位不存在：${c.soulIndex}`);
        const h = m.rings[c.ringIndex];
        if (!h) {
          m.rings[c.ringIndex] = ys(c.ring);
          break;
        }
        if (
          !(
            h.years === c.ring.years &&
            h.name === c.ring.name &&
            ((p = h.source) == null ? void 0 : p.optionId) ===
              ((f = c.ring.source) == null ? void 0 : f.optionId) &&
            ((I = h.typeSelection) == null ? void 0 : I.optionId) ===
              ((k = c.ring.typeSelection) == null ? void 0 : k.optionId) &&
            ((g = h.speciesSelection) == null ? void 0 : g.optionId) ===
              ((w = c.ring.speciesSelection) == null ? void 0 : w.optionId)
          )
        )
          throw new Error(
            `禁止覆盖${c.soulIndex + 1}号武魂的第${c.ringIndex + 1}魂环`,
          );
        break;
      }
      case "addSoulBone":
        if (c.partCapacity !== void 0) {
          const m = Ve(c.soulBone.partId ?? c.soulBone.id);
          (m ? Dt(t, m) : 0) < c.partCapacity &&
            t.soulBones.push({ ...c.soulBone, ...(m ? { partId: m } : {}) });
        } else if (
          !t.soulBones.some(
            (m) =>
              m.id === c.soulBone.id ||
              !!(c.soulBone.partId && Ht(m) === Ve(c.soulBone.partId)),
          )
        ) {
          const m = Ve(c.soulBone.partId ?? c.soulBone.id);
          t.soulBones.push({ ...c.soulBone, ...(m ? { partId: m } : {}) });
        }
        break;
      case "addTalent":
        bo(t.talents, c.selection);
        break;
      case "addTrait":
        t.traits.includes(c.traitId) || t.traits.push(c.traitId);
        break;
      case "addTitle":
        t.titles.includes(c.titleId) || t.titles.push(c.titleId);
        break;
      case "removeTitle":
        t.titles = t.titles.filter((m) => m !== c.titleId);
        break;
      case "addBeastNamePrefix": {
        const m = t.beast;
        if (!m) throw new Error("内容配置错误：非魂兽角色不能获得魂兽名称前缀");
        (m.namePrefixes.includes(c.prefix) || m.namePrefixes.push(c.prefix),
          c.prefix === "路边" && (t.flags.beastPrimaryRoadside = !0));
        break;
      }
      case "addBeastNameSuffix": {
        const m = t.beast;
        if (!m) throw new Error("内容配置错误：非魂兽角色不能获得魂兽名称后缀");
        m.nameSuffixes.includes(c.suffix) || m.nameSuffixes.push(c.suffix);
        break;
      }
      case "removeBeastNamePrefix": {
        const m = t.beast;
        if (!m) throw new Error("内容配置错误：非魂兽角色不能移除魂兽名称前缀");
        ((m.namePrefixes = m.namePrefixes.filter((h) => h !== c.prefix)),
          c.prefix === "路边" && (t.flags.beastPrimaryRoadside = !1));
        break;
      }
      case "addBloodline":
        t.bloodlines.includes(c.bloodlineId) ||
          t.bloodlines.push(c.bloodlineId);
        break;
      case "addAttribute": {
        const { id: m, qualifier: h } = st(c.attributeId);
        let $ = !1;
        (m && rt.includes(m)
          ? (($ = lt(t, m) === 0),
            h !== null ? rn(t, m, h) : _n(t, m, Math.max(1, lt(t, m))))
          : t.attributes.includes(c.attributeId) ||
            (t.attributes.push(c.attributeId), ($ = !0)),
          $ &&
            t.route === "beast" &&
            gt(t, He, { ...L, reason: "formal-beast-attribute-bonus" }));
        break;
      }
      case "advanceHumanElement": {
        const { id: m } = st(c.elementId);
        m && Ao(t, m, c.amount ?? 1);
        break;
      }
      case "ensureHumanElementLevel": {
        const { id: m, qualifier: h } = st(c.elementId);
        m && rn(t, m, h ?? c.level);
        break;
      }
      case "removeHumanElement": {
        const { id: m } = st(c.elementId);
        m && Hl(t, m);
        break;
      }
      case "grantCompleteLaw": {
        const { id: m } = st(c.elementId);
        if (!m) break;
        const h = !t.attributes.includes(m);
        (h && t.attributes.push(m),
          _n(t, m, 4),
          h &&
            t.route === "beast" &&
            gt(t, He, { ...L, reason: "formal-beast-attribute-bonus" }));
        const N = `${t.beast ? "douluo2" : "formal"}:element.${m}.complete-law`;
        if ((t.traits.includes(N) || t.traits.push(N), t.beast)) {
          t.beast.attributeStages[m] = Math.max(
            t.beast.attributeStages[m] ?? 0,
            4,
          );
          const te = `douluo2:law.${m}`;
          t.beast.laws.includes(te) || t.beast.laws.push(te);
        }
        break;
      }
      case "addDomain":
        (t.domains.push(c.domainId),
          t.route === "beast" &&
            gt(t, 10 * He, { ...L, reason: "formal-beast-domain-bonus" }));
        break;
      case "addDomainEmbryo": {
        const m = `formal:domain-embryo:${c.embryoId}`;
        (t.traits.includes(m) || t.traits.push(m),
          (t.flags[`formal:domain-embryo-unlock:${c.embryoId}`] = Math.max(
            1,
            Math.trunc(c.unlockLevel),
          )),
          ws(t));
        break;
      }
      case "addDomainSeed": {
        ((t.flags["formal:pending-domain-seed"] = !0), ws(t));
        break;
      }
      case "addArtifact": {
        const m = t.artifacts.find((h) => h.id === c.artifact.id);
        m
          ? ((m.stage = c.artifact.stage === "complete" ? "complete" : m.stage),
            (m.rank = Math.max(m.rank, c.artifact.rank)),
            (m.combatPower = Math.max(
              m.combatPower ?? 0,
              c.artifact.combatPower ?? 0,
            )))
          : t.artifacts.push({ ...c.artifact });
        break;
      }
      case "upgradeArtifacts": {
        const m = [0, 300, 500, 800, 1e3, 2e3],
          h = Math.max(0, Math.trunc(c.amount));
        for (const $ of t.artifacts) {
          const N = m.findIndex((ue) => ue >= ($.combatPower ?? 0)),
            te = N < 0 ? m.length - 1 : N,
            ne = Math.min(m.length - 1, te + h);
          (($.combatPower = m[ne]), ($.rank = Math.max($.rank, ne)));
        }
        break;
      }
      case "changeAllSoulRingYears":
        for (const m of t.martialSouls)
          for (const h of m.rings) h.years = Math.max(0, h.years + c.amount);
        break;
      case "changeAllSoulBoneYears":
        for (const m of t.soulBones) m.years = Math.max(0, m.years + c.amount);
        break;
      case "queueSoulBoneUpgrade":
        t.flags[yo] = Math.max(0, Math.trunc(c.amount));
        break;
      case "applyPendingSoulBoneUpgrade": {
        const m = Math.max(0, Math.trunc(Re(t, yo)));
        if (m <= 0) throw new Error("内容配置错误：没有待结算的魂骨年限提升");
        const h = t.soulBones.filter(($) => jm($, c.partId, c.external));
        if (!h.length)
          throw new Error(`内容配置错误：角色没有可升级的魂骨部位 ${c.partId}`);
        for (const $ of h) $.years = Math.max(0, $.years + m);
        delete t.flags[yo];
        break;
      }
      case "addInventoryStack": {
        const m = Ba(c.category, c.itemId),
          h = Math.max(0, Math.trunc(Re(t, m) + c.amount));
        ((t.flags[m] = c.maxStacks === void 0 ? h : Math.min(c.maxStacks, h)),
          c.category === "skill" && Ft(t));
        break;
      }
      case "addCombatPowerBonus":
        {
          const m =
            c.category === "status"
              ? "combat:status-modifier"
              : `combat:${c.category}-bonus`;
          t.flags[m] = Re(t, m) + c.amount;
        }
        break;
      case "addLevelCombatPowerPercentBonus": {
        const m = c.activeBelowLevel ?? Number.POSITIVE_INFINITY,
          h = `combat:${c.category}:level-percent:${Math.trunc(c.basisPoints)}:${Number.isFinite(m) ? m : "always"}`;
        t.flags[h] = Re(t, h) + 1;
        break;
      }
      case "changeAnnualIncome":
        t.flags["identity:annual-income-bonus-copper"] =
          Re(t, "identity:annual-income-bonus-copper") + c.copper;
        break;
      case "addNextTimeSkipLevelBonus":
        t.flags["formal:next-time-skip-level-bonus"] =
          Re(t, "formal:next-time-skip-level-bonus") + c.amount;
        break;
      case "changeAnnualLevelBonus": {
        const m = t.annualGrowthPolicy ?? {
          preventLevelPenaltySources: [],
          annualLevelBonus: 0,
        };
        ((m.annualLevelBonus += c.amount), (t.annualGrowthPolicy = m));
        break;
      }
      case "changeCounterWithLevelReward": {
        const m = Math.max(0, Math.trunc(Re(t, c.key))),
          h = Math.max(0, m + Math.trunc(c.amount));
        t.flags[c.key] = h;
        const $ = Math.floor(h / c.threshold) - Math.floor(m / c.threshold);
        $ > 0 && (t.level = Pe(t, t.level + ot(t, $ * c.levelPerThreshold)));
        break;
      }
      case "progressAttribute": {
        const { id: m, qualifier: h } = st(c.attributeId),
          $ = c.completedAttributeId ? st(c.completedAttributeId).id : void 0,
          N =
            $ && rt.includes($)
              ? $
              : c.completedAttributeId &&
                  t.attributes.includes(c.completedAttributeId)
                ? c.completedAttributeId
                : void 0;
        if (
          (N
            ? rt.includes(N)
              ? lt(t, N) >= 4
              : t.attributes.includes(N)
            : !1) &&
          c.levelIfComplete
        ) {
          t.level = Pe(t, t.level + ot(t, c.levelIfComplete));
          break;
        }
        if (!m) break;
        h !== null
          ? rn(t, m, h)
          : rt.includes(m)
            ? Ao(t, m, Math.max(1, Math.trunc(c.amount ?? 1)))
            : t.attributes.includes(c.attributeId) ||
              t.attributes.push(c.attributeId);
        const ne = `formal:attribute-progress:${m}`;
        if (
          ((t.flags[ne] = Math.max(0, Math.trunc(Re(t, ne) + (c.amount ?? 1)))),
          c.completionThreshold &&
            c.completedAttributeId &&
            (lt(t, m) ?? 0) >= c.completionThreshold)
        ) {
          const ue = $ && rt.includes($) ? $ : void 0;
          ue && rn(t, ue, 4);
        }
        break;
      }
      case "addDeathShield": {
        const m = c.maxLevel ?? "any",
          h = c.resurrectionCost ?? "none",
          $ = `formal:death-shield:${m}:${h}:${c.shieldId}`;
        t.flags[$] = Re(t, $) + Math.max(0, Math.trunc(c.amount));
        break;
      }
      case "addLevelLossShield": {
        const m = `formal:level-loss-shield:${c.maxLevel ?? "any"}:${c.shieldId}`;
        t.flags[m] = Re(t, m) + Math.max(0, Math.trunc(c.amount));
        break;
      }
      case "setAllSoulRingQuality":
        for (const m of t.martialSouls)
          for (const h of m.rings) h.quality = c.quality;
        break;
      case "setAllSoulBoneQuality":
        for (const m of t.soulBones) m.quality = c.quality;
        break;
      case "equipGodArmorOrDie": {
        const m = Math.max(0, Math.trunc(c.minimumSoulBones));
        (m >= 6 ? yd(t) : ti(t) >= m)
          ? (t.flags.godTrialArmor = !0)
          : Ss(t) ||
            ((t.flags.finalStatus = "dead"),
            (t.ending = So(t, {
              id: "death",
              title: "神考失败",
              kind: "death",
              deathCause: c.cause,
              finalStatus: "dead",
            })));
        break;
      }
      case "setFlag":
        t.flags[c.key] = c.value;
        break;
      case "changeCounter":
        t.flags[c.key] = Number(t.flags[c.key] ?? 0) + c.amount;
        break;
      case "adjustNpcAffinity": {
        t.npcRelationships ?? (t.npcRelationships = {});
        const m = t.npcRelationships[c.npcId] ?? { affinity: 0 };
        t.npcRelationships[c.npcId] = { ...m, affinity: m.affinity + c.amount };
        break;
      }
      case "death":
        if (Ss(t)) break;
        ((t.flags.finalStatus = "dead"),
          (t.ending = So(t, {
            id: "death",
            title: "陨落",
            kind: "death",
            deathCause: c.cause,
            finalStatus: "dead",
          })));
        break;
      case "grantGodhood":
        Wm(t, {
          id: c.godhoodId,
          name: c.name,
          tier: c.tier,
          maxLevel: c.maxLevel,
        });
        break;
      case "ending":
        if (
          t.route !== "beast" &&
          t.flags.formalHumanSetupComplete === !0 &&
          t.age < Fm
        ) {
          ((t.flags[`formal:deferred-ending:${c.endingId}`] = !0),
            (t.flags["formal:free-mode"] = !0));
          break;
        }
        t.ending = So(t, {
          id: c.endingId,
          title: c.title ?? c.endingId,
          kind: c.kind ?? "success",
          text: c.text,
        });
        break;
    }
  }
  Vm(t);
}
function Kt(t, e = [], n = {}) {
  if (
    !e.length ||
    (n.idempotencyKeyPrefix &&
      pt(t).transactions.some((i) =>
        i.idempotencyKey.startsWith(`${n.idempotencyKeyPrefix}:`),
      ))
  )
    return;
  const o = xm(t);
  (Na(o, e, n), Object.assign(t, o));
}
function Io(t, e) {
  return !(e != null && e.length) || Yt(t.character, [...e]);
}
function qm(t, e) {
  const n =
      e.subject === "innatePower"
        ? (t.character.innatePower ?? 0)
        : e.subject === "appearanceRank"
          ? (t.character.appearanceRank ?? 0)
          : t.character[e.subject],
    o =
      e.operation === "add"
        ? n + e.value
        : e.operation === "set"
          ? e.value
          : e.operation === "min"
            ? Math.max(n, e.value)
            : Math.min(n, e.value);
  e.subject === "level"
    ? (t.character.level = Math.max(0, o))
    : e.subject === "beastYears"
      ? (t.character.beastYears = Math.max(0, o))
      : e.subject === "innatePower"
        ? (t.character.innatePower = Math.max(0, o))
        : (t.character.appearanceRank = Math.max(0, Math.min(7, o)));
}
class cn {
  constructor(e) {
    this.pack = e;
  }
  activeDefinitions(e) {
    const n = e.character.background,
      o = n != null && n.originId ? this.pack.origins.get(n.originId) : void 0,
      i =
        n != null && n.identityId
          ? this.pack.identities.get(n.identityId)
          : void 0;
    if (n != null && n.originId && !o)
      throw new Error(`内容配置错误：所属 ${n.originId} 未注册`);
    if (n != null && n.identityId && !i)
      throw new Error(`内容配置错误：身份 ${n.identityId} 未注册`);
    return [o, i].filter((s) => s !== void 0);
  }
  synchronizeDefinitions(e) {
    if (e.character.background)
      for (const n of this.activeDefinitions(e)) {
        const o = `${n.id}:initial-effects`;
        e.character.background.appliedRuleIds.includes(o) ||
          (Kt(e.character, n.initialEffects ?? [], {
            reason: "identity-or-origin-initial-state",
            referenceId: n.id,
            idempotencyKeyPrefix: `background:${n.id}:initial-effects`,
          }),
          e.character.background.appliedRuleIds.push(o));
        for (const i of n.persistentRules ?? [])
          i.type !== "modify-initial-value" ||
            e.character.background.appliedRuleIds.includes(i.id) ||
            (qm(e, i), e.character.background.appliedRuleIds.push(i.id));
      }
  }
  activeRules(e) {
    return (
      this.synchronizeDefinitions(e),
      this.activeDefinitions(e)
        .flatMap((n) => [...(n.persistentRules ?? [])])
        .filter((n) => n.type !== "modify-initial-value")
    );
  }
  samePool(e, n) {
    return this.pack.ids.resolvePoolId(e) === n;
  }
  sameOption(e, n, o) {
    return this.pack.ids.resolveOptionId(e, o) === n;
  }
  preparePool(e) {
    for (let n = 0; n < 20; n += 1) {
      const o = e.currentStepId
          ? this.pack.game.flows[e.currentStepId]
          : void 0,
        i = o != null && o.poolId ? this.pack.pools.get(o.poolId) : void 0;
      if (!i) throw new Error("当前流程没有转盘");
      const s = this.activeRules(e).filter(
          (f) => f.type === "pool-policy" && Io(e, f.when),
        ),
        a = s
          .filter((f) => f.policy.type === "force-pool")
          .map((f) => this.pack.ids.resolvePoolId(f.policy.poolId));
      if (new Set(a).size > 1)
        throw new Error("背景规则冲突：同时强制进入多个转盘");
      const l = a[0];
      if (l && l !== i.id) {
        const f = [...this.pack.flows.values()].find((I) => I.poolId === l);
        if (!f) throw new Error(`背景规则强制的转盘 ${l} 没有流程入口`);
        e.currentStepId = f.id;
        continue;
      }
      const u = s.find(
        (f) =>
          f.policy.type === "skip-pool" && this.samePool(f.policy.poolId, i.id),
      );
      if ((u == null ? void 0 : u.policy.type) === "skip-pool") {
        e.currentStepId = this.pack.ids.resolveFlowId(u.policy.nextFlowId);
        continue;
      }
      if (
        s.some(
          (f) =>
            f.policy.type === "deny-pool" &&
            this.samePool(f.policy.poolId, i.id),
        )
      )
        throw new Error(
          `背景规则禁止进入转盘 ${this.pack.ids.canonicalPoolId(i.id)}`,
        );
      const d = new Set();
      let p;
      for (const f of s)
        if (this.samePool(f.policy.poolId, i.id)) {
          if (f.policy.type === "deny-option")
            d.add(this.pack.ids.resolveOptionId(f.policy.optionId, i.id));
          else if (f.policy.type === "fixed-result") {
            const I = this.pack.ids.resolveOptionId(f.policy.optionId, i.id);
            if (p && p !== I)
              throw new Error(`背景规则冲突：转盘 ${i.id} 存在多个固定结果`);
            p = I;
          }
        }
      for (const f of this.activeRules(e))
        f.type === "reroll-policy" &&
          Io(e, f.when) &&
          this.samePool(f.poolId, i.id) &&
          d.add(this.pack.ids.resolveOptionId(f.optionId, i.id));
      if (p && d.has(p))
        throw new Error(`背景规则冲突：固定结果 ${p} 同时被禁止`);
      return { pool: i, excludedOptionIds: [...d], fixedOptionId: p };
    }
    throw new Error("背景规则重定向超过安全步数");
  }
  dispatch(e, n) {
    this.synchronizeDefinitions(e);
    for (const o of this.activeRules(e))
      if (
        !(
          o.type !== "lifecycle-event" ||
          o.event !== n.type ||
          !Io(e, o.when)
        ) &&
        !(
          "poolId" in n &&
          o.poolId &&
          this.pack.ids.canonicalPoolId(o.poolId) !== n.poolId
        )
      ) {
        if ("optionId" in n && o.optionId) {
          const i = e.currentStepId
              ? this.pack.game.flows[e.currentStepId]
              : void 0,
            s = i == null ? void 0 : i.poolId;
          if (
            !s ||
            this.pack.ids.canonicalOptionId(o.optionId, s) !== n.optionId
          )
            continue;
        }
        Kt(e.character, o.effects, {
          reason: "persistent-background-rule",
          referenceId: o.id,
          idempotencyKeyPrefix: `background:${o.id}:${e.timeline.length}:${n.type}`,
        });
      }
  }
}
function Da(t, e) {
  const n = t.flows[e];
  if (!n) throw new Error(`内容配置错误：流程节点 ${e} 不存在`);
  return n;
}
function Fa(t, e, n, o) {
  var s;
  if (!n.getNext) return n.next ?? null;
  const i = (s = t.flowResolvers) == null ? void 0 : s[n.getNext];
  if (!i) throw new Error(`内容配置错误：流程分支 ${n.getNext} 未注册`);
  return i({ pack: t, state: e, step: n, option: o });
}
function Gm(t, e, n) {
  if (e.character.ending) return null;
  const o = Da(t, e.currentStepId);
  return n.next ?? Fa(t, e, o, n);
}
function Va(t, e, n) {
  var i;
  Hn(t, e);
  let o = n;
  for (let s = 0; s < 50; s += 1) {
    if (e.character.ending || !o) return ((e.currentPoolId = null), null);
    const a = Da(t, o);
    if (a.poolId) {
      const d = t.pools.find((p) => p.id === a.poolId);
      if (!d) throw new Error(`内容配置错误：转盘 ${a.poolId} 不存在`);
      return (
        ai(t, { ...e, currentPoolId: d.id }, d),
        (e.currentStepId = o),
        (e.currentPoolId = d.id),
        o
      );
    }
    if (((e.currentStepId = o), (e.currentPoolId = null), !a.action))
      throw new Error(`内容配置错误：流程节点 ${o} 既没有转盘也没有动作`);
    const l = (i = t.flowActions) == null ? void 0 : i[a.action];
    if (!l) throw new Error(`内容配置错误：流程动作 ${a.action} 未注册`);
    const u = l({ pack: t, state: e, step: a });
    o = u === void 0 ? Fa(t, e, a) : u;
  }
  throw new Error("内容配置错误：流程动作链超过安全步数");
}
function Hm(t, e, n) {
  const o = Me({ ...e, history: [] });
  Va(t, o, n);
}
const ct = new WeakMap();
function Jt(t) {
  return t.contentStatus !== "staging";
}
function vn(t, e = !0) {
  const n = ct.get(t);
  (e &&
    n &&
    t.random.cursor === n.cursorAfter &&
    (t.random.cursor = n.cursorBefore),
    ct.delete(t));
}
function Fo(t, e = !0) {
  const n = Array.from(t.text.trim()),
    o =
      t.wheelLabel ??
      (n.length <= 14 ? n.join("") : `${n.slice(0, 14).join("")}…`);
  return {
    id: t.id,
    text: t.text,
    label: o,
    weight: t.weight,
    ...(e ? {} : { available: !1 }),
  };
}
function Vt(t, e) {
  return Oo(t, e);
}
function Is(t, e, n, o, i = "advanced-tool") {
  var l;
  if (e.finished || e.awaitingAdvance)
    throw new Error("当前结果已经提交，不能再锁定本次转盘");
  if (ct.has(e)) throw new Error("当前转盘结果已经确定，请等待动画与提交完成");
  const s = t.pools.find((u) => u.id === n);
  if (!s) throw new Error(`指定结果的转盘 ${n} 不存在`);
  if (!s.options.find((u) => u.id === o && u.enabled !== !1 && Jt(u)))
    throw new Error(`指定结果 ${o} 不属于转盘 ${n}`);
  if (((l = Vt(t, e)) == null ? void 0 : l.id) !== n)
    throw new Error("只能锁定当前正式流程的结果");
  if (!eo(t, e).some((u) => u.id === o))
    throw new Error(`指定结果 ${o} 当前不满足结构化条件`);
  ((e.forcedResults[n] = o), (e.forcedResultSources[n] = i));
}
function Zn(t, e) {
  (delete t.forcedResults[e], delete t.forcedResultSources[e]);
}
function Dn(t, e, n = []) {
  return eo(t, e, n).filter((o) => !bn(e, o));
}
function eo(t, e, n = []) {
  const o = Vt(t, e);
  if (!o) return [];
  const i = new Set(n);
  return o.options.filter(
    (s) =>
      s.enabled !== !1 &&
      Jt(s) &&
      !i.has(s.id) &&
      Yt(e.character, s.requirements),
  );
}
function bn(t, e) {
  var n;
  return !!(
    (n = e.rerollWhen) != null &&
    n.length &&
    Yt(t.character, e.rerollWhen)
  );
}
function Ym(t, e, n = [], o = {}) {
  const i = Vt(t, e);
  if (!i) throw new Error("当前流程没有转盘");
  const s = eo(t, e, n),
    a = s.filter((w) => !bn(e, w));
  if (!a.length) throw new Error(`转盘 ${i.id} 没有可用选项`);
  const l = e.random.cursor,
    u = e.forcedResults[i.id],
    d = new Set(a.map((w) => w.id)),
    p = i.options.filter((w) => w.enabled !== !1 && Jt(w)),
    f = p.map((w) => Fo(w, d.has(w.id)));
  if (o.fixedOptionId) {
    const w = a.find((b) => b.id === o.fixedOptionId);
    if (!w)
      throw new Error(
        `转盘 ${i.id} 的背景固定结果 ${o.fixedOptionId} 当前无效`,
      );
    return (
      ct.set(e, {
        stepId: e.currentStepId,
        poolId: i.id,
        optionId: w.id,
        cursorBefore: l,
        cursorAfter: e.random.cursor,
        forced: !1,
        items: f,
        selectedIndex: p.findIndex((b) => b.id === w.id),
      }),
      w
    );
  }
  if (u) {
    const w = s.find((b) => b.id === u);
    if (!w)
      throw new Error(
        `转盘 ${i.id} 的指定结果 ${u} 当前无效，请清除或重新选择`,
      );
    if (!bn(e, w))
      return (
        ct.set(e, {
          stepId: e.currentStepId,
          poolId: i.id,
          optionId: w.id,
          cursorBefore: l,
          cursorAfter: e.random.cursor,
          forced: !0,
          items: f,
          selectedIndex: p.findIndex((b) => b.id === w.id),
        }),
        w
      );
    Zn(e, i.id);
  }
  const I = s.reduce((w, b) => w + b.weight, 0);
  let k,
    g = 0;
  do {
    const w = pa(e.random) * I;
    let b = 0;
    if (
      ((k = s.find((c) => (b += c.weight) >= w) ?? s[s.length - 1]),
      (g += 1),
      g > 1e3)
    )
      throw new Error(`转盘 ${i.id} 主动重抽超过安全次数`);
  } while (bn(e, k));
  return (
    ct.set(e, {
      stepId: e.currentStepId,
      poolId: i.id,
      optionId: k.id,
      cursorBefore: l,
      cursorAfter: e.random.cursor,
      forced: !1,
      items: f,
      selectedIndex: p.findIndex((w) => w.id === k.id),
    }),
    k
  );
}
function Fn(t, e, n) {
  ((e.pendingNextStepId = null), (e.awaitingAdvance = !1));
  const o = Va(t, e, n);
  (e.character.ending || !o) &&
    (e.character.ending ||
      (e.character.ending = { id: "complete", title: "命运落幕" }),
    (e.currentStepId = null),
    (e.currentPoolId = null),
    (e.finished = !0));
}
function Km(t, e, n, o = {}) {
  var l, u, d, p, f, I;
  const i = ct.get(e),
    s =
      i && i.cursorAfter === e.random.cursor ? i.cursorBefore : e.random.cursor,
    a = Me(e, { randomCursor: s, validateHistory: !1 });
  try {
    const k = e.currentStepId ? t.flows[e.currentStepId] : void 0;
    if (!(k != null && k.poolId))
      throw new Error("内容配置错误：当前流程没有可提交的转盘");
    const g = Vt(t, e);
    if (
      !(
        g != null &&
        g.options.some((q) => q.id === n.id && q.enabled !== !1 && Jt(q))
      )
    )
      throw new Error(`内容配置错误：结果 ${n.id} 不属于当前转盘`);
    if (
      (l = n.requirements) != null &&
      l.length &&
      !Yt(e.character, n.requirements)
    )
      throw new Error(`结果 ${n.id} 当前不满足正式条件，禁止提交`);
    const w = new Set(Dn(t, e).map((q) => q.id)),
      b = g.options
        .filter((q) => q.enabled !== !1 && Jt(q))
        .map((q) => Fo(q, w.has(q.id))),
      c =
        i &&
        i.stepId === e.currentStepId &&
        i.poolId === g.id &&
        i.optionId === n.id &&
        i.cursorAfter === e.random.cursor
          ? i.cursorBefore
          : e.random.cursor;
    (ct.delete(e), e.history.push(Mt(e, { randomCursor: c })));
    const L = e.forcedResults[g.id] === n.id,
      m = L ? (e.forcedResultSources[g.id] ?? "advanced-tool") : void 0;
    L &&
      (Zn(e, g.id),
      e.timeline.push({
        kind: "system",
        text:
          m === "intervention"
            ? `命运干预·锁定结果：${n.text}`
            : `高级工具·指定结果：${n.text}`,
        poolId: g.id,
        optionId: n.id,
        hiddenInShowcase: m === "advanced-tool",
        source: m,
      }));
    const h = e.character.ending,
      $ = e.character.godhood;
    let N = 0;
    const te = (q) => {
      var ae, ye;
      const ve = q.filter(
        (M) => M.type === "advanceHumanTime" || M.type === "advanceBeastTime",
      );
      for (const M of ve)
        (ae = o.beforeTimeSkip) == null || ae.call(o, M.years);
      Kt(e.character, [...q], {
        reason: "formal-option-effect",
        referenceId: `${g.id}:${n.id}`,
        idempotencyKeyPrefix: `spin:${e.packId}:${g.id}:${n.id}:${e.history.length}:${N++}`,
      });
      for (const M of ve) (ye = o.afterTimeSkip) == null || ye.call(o, M.years);
    };
    (u = o.beforeEffects) == null || u.call(o);
    const ne = e.pendingFollowUps[0],
      ue =
        (ne == null ? void 0 : ne.targetPoolId) === g.id &&
        ne.reason === "formal-soul-bone-part-draw";
    if (ue) {
      const q = e.pendingSoulBone;
      if (!q) throw new Error("内容配置错误：魂骨奖励池缺少待结算年限");
      const ve = Ve(n.id),
        ae = [
          {
            type: "addSoulBone",
            soulBone: {
              id: `${ne.sourceOptionId}:${n.id}`,
              name: n.text,
              years: q.years,
              partId: ve ?? n.id,
              ...(q.quality ? { quality: q.quality } : {}),
            },
            ...(ve === "external" ? { partCapacity: 100 } : {}),
          },
        ];
      (te(ae), (e.pendingSoulBone = null));
    } else te(n.effects ?? []);
    if (n.customHandler && !ue) {
      const q = (d = t.customHandlers) == null ? void 0 : d[n.customHandler];
      if (!q)
        throw new Error(`内容配置错误：选项处理器 ${n.customHandler} 未注册`);
      q({ pack: t, state: e, step: k, option: n, applyEffects: te });
    }
    (p = o.afterEffects) == null || p.call(o);
    let R = Gm(t, e, n);
    const C = e.pendingFollowUps[0];
    if (C && C.targetPoolId === g.id)
      if (((C.remainingDraws -= 1), C.remainingDraws > 0)) R = C.targetFlowId;
      else {
        const q = e.pendingFollowUps.shift();
        R =
          ((f = e.pendingFollowUps[0]) == null ? void 0 : f.targetFlowId) ??
          q.returnStepId;
      }
    const W = (n.followUps ?? []).filter((q) =>
      Yt(e.character, q.requirements),
    );
    if (W.length) {
      const q = R;
      for (const [ve, ae] of W.entries()) {
        const ye = Object.values(t.flows).find(
          (M) => M.poolId === ae.targetPoolId,
        );
        if (!ye)
          throw new Error(
            `内容配置错误：后续奖励池 ${ae.targetPoolId} 没有正式流程`,
          );
        if (((I = ae.prepare) == null ? void 0 : I.type) === "soulBone") {
          if (e.pendingSoulBone)
            throw new Error("内容配置错误：后续魂骨奖励覆盖了尚未结算的魂骨");
          e.pendingSoulBone = {
            years: ae.prepare.years,
            source: { optionId: n.id, text: n.text },
            ...(ae.prepare.quality ? { quality: ae.prepare.quality } : {}),
          };
        }
        e.pendingFollowUps.push({
          id: `${g.id}:${n.id}:${e.history.length}:${ve}`,
          sourcePoolId: g.id,
          sourceOptionId: n.id,
          targetPoolId: ae.targetPoolId,
          targetFlowId: ye.id,
          remainingDraws: Math.max(1, Math.trunc(ae.count)),
          returnStepId: q,
          reason: ae.reason,
        });
      }
      R = e.pendingFollowUps[0].targetFlowId;
    }
    (Hm(t, e, R),
      e.timeline.push({
        kind: "result",
        text: n.text,
        poolId: g.id,
        optionId: n.id,
        source: L ? "forced-result" : "normal",
        major: (!h && !!e.character.ending) || (!$ && !!e.character.godhood),
      }));
    const K =
        i && i.stepId === k.id && i.poolId === g.id && i.optionId === n.id,
      F = K ? i.items : b,
      fe = K ? i.selectedIndex : F.findIndex((q) => q.id === n.id),
      re = F[fe] ?? Fo(n);
    if (
      ((e.lastResolvedSpin = {
        stepId: k.id,
        poolId: g.id,
        poolTitle: g.name,
        items: F,
        selectedOption: re,
        selectedIndex: fe >= 0 ? fe : F.length,
        result: { optionId: n.id, text: n.text },
        forced: K ? i.forced : L,
        randomCursorBefore: K ? i.cursorBefore : e.random.cursor,
        randomCursorAfter: K ? i.cursorAfter : e.random.cursor,
      }),
      o.deferAdvance && !e.character.ending)
    ) {
      ((e.pendingNextStepId = R), (e.awaitingAdvance = !0));
      return;
    }
    Fn(t, e, R);
  } catch (k) {
    throw (ct.delete(e), Object.assign(e, a), k);
  }
}
function Jm(t, e) {
  e.awaitingAdvance && Fn(t, e, e.pendingNextStepId);
}
function ja(t, e) {
  if (e.finished || e.awaitingAdvance || !e.currentStepId) return !1;
  const n = t.flows[e.currentStepId],
    o = e.pendingFollowUps[0];
  return !!(
    n != null &&
    n.poolId &&
    (n.leaveNext || (o == null ? void 0 : o.targetFlowId) === n.id)
  );
}
function Qm(t, e) {
  var i;
  if (!ja(t, e)) throw new Error("当前流程没有可用的离开操作");
  const n = t.flows[e.currentStepId];
  vn(e);
  const o = e.pendingFollowUps[0];
  if ((o == null ? void 0 : o.targetFlowId) === n.id) {
    const s = e.pendingFollowUps.shift();
    ((e.pendingSoulBone = null),
      e.timeline.push({
        kind: "system",
        text: "奖励池当前没有合法候选，已明确离开并返回原流程",
        poolId: n.poolId,
        optionId: s.sourceOptionId,
        source: "normal",
      }),
      Fn(
        t,
        e,
        ((i = e.pendingFollowUps[0]) == null ? void 0 : i.targetFlowId) ??
          s.returnStepId,
      ));
    return;
  }
  (e.timeline.push({
    kind: "system",
    text: "离开本次可选流程",
    poolId: n.poolId,
    source: "normal",
  }),
    Fn(t, e, n.leaveNext));
}
function yn(t, e = {}) {
  const n = t.lastResolvedSpin,
    o = t.history.pop();
  if (o) {
    const i = t.history;
    if (
      (Object.assign(t, Qn(o, 0, t)),
      (t.history = i),
      (t.lastResolvedSpin = null),
      n != null && n.forced)
    ) {
      const s =
        t.forcedResultSources[n.poolId] ??
        (t.timeline.some(
          (a) =>
            a.source === "intervention" &&
            a.poolId === n.poolId &&
            a.optionId === n.result.optionId,
        )
          ? "intervention"
          : "advanced-tool");
      (e.reroll || s === "intervention") && Zn(t, n.poolId);
    }
    e.reroll && (t.random.cursor += 1);
  }
}
function Xm(t, e) {
  var s;
  const n = e.history.length,
    o = e.lastResolvedSpin;
  if (
    (yn(e, { reroll: !0 }),
    !n ||
      e.history.length !== n - 1 ||
      !o ||
      ((s = Vt(t, e)) == null ? void 0 : s.id) !== o.poolId)
  )
    return [];
  const i = [o.result.optionId];
  return Dn(t, e, i).length ? i : [];
}
const ko = {
    route: "851ae183-f33c-4221-86aa-531212bb4f10",
    worldLine: "4c109966-16a5-4441-b54c-2f353831ac0b",
    douluo1HumanPeriod: "164595fb-c335-41c4-826e-787504b7f0cd",
    douluo2HumanMainLine: "ebcdfc44-71a8-41fb-a887-04f9eb7922fb",
    douluo2HumanPeriod: "35b23a82-1884-428d-968b-8a0a0388e489",
    beastPeriod: "45881d7e-a7f2-47a6-8455-11c98be9ed8a",
  },
  Zm = new Set([
    "444aa1",
    "789013",
    "11a956",
    "1986f2",
    "7c11fe",
    "dfebd3",
    "738dfe",
  ]),
  eh = new Set([
    "59e386",
    "ba905f",
    "4c8fd7",
    "8702ff",
    "b7137a",
    "e189ee",
    "f33cca",
    "1b3ec8",
  ]);
function ks(t, e) {
  if (t === ko.douluo1HumanPeriod)
    return {
      packId: "douluo1",
      worldEra: "douluo1",
      entryFlowId: "douluo1:flow.formal-human.identity",
      route: "human",
    };
  if (t === ko.douluo2HumanPeriod)
    return {
      packId: "douluo2",
      worldEra: "douluo2",
      entryFlowId: "douluo2:flow.human.entry",
      route: "human",
    };
  if (t !== ko.beastPeriod) return null;
  if (Zm.has(e))
    return {
      packId: "douluo1",
      worldEra: "douluo1",
      entryFlowId: "beastGender",
      route: "beast",
    };
  if (eh.has(e))
    return {
      packId: "douluo2",
      worldEra: "douluo2",
      entryFlowId: "douluo2:flow.foundation.beastGender",
      route: "beast",
    };
  throw new Error(`正式魂兽时期缺少显式路由映射：${t}:${e}`);
}
const th = [
    {
      id: "f8379bd3-2800-475c-bfb3-1d6e13da9fa1",
      name: "属性惩罚",
      tags: ["272b645d-e6d6-4ae1-92a8-57d93cd2aa2d"],
      rank: "0|hzzs53:",
      options: [
        { id: "754e54", text: "土", weight: 1, enabled: !0 },
        { id: "b873a4", text: "水1", weight: 1, enabled: !0 },
        { id: "728200", text: "金1", weight: 1, enabled: !0 },
        { id: "f3ee2c", text: "月亮", weight: 1, enabled: !0 },
        { id: "22af71", text: "力量", weight: 1, enabled: !0 },
        { id: "95b76c", text: "体型", weight: 1, enabled: !0 },
        { id: "949824", text: "防御", weight: 1, enabled: !0 },
        { id: "48e5de", text: "精神", weight: 1, enabled: !0 },
        { id: "b11fdd", text: "空间", weight: 1, enabled: !0 },
        { id: "61cf62", text: "水2", weight: 1, enabled: !0 },
        { id: "061f21", text: "金2", weight: 1, enabled: !0 },
      ],
    },
    {
      id: "f7057860-b1da-4892-920f-f250ebf3d194",
      name: "作弊池（每次抽取都需要消耗1枚【芙芙的硬币】，【芙芙的硬币】不足1枚时无法抽取该池）",
      tags: ["272b645d-e6d6-4ae1-92a8-57d93cd2aa2d"],
      rank: "0|hzzs5z:",
      options: [
        { id: "8fae68", text: "全部灵环年限+10000年", weight: 1, enabled: !1 },
        { id: "ef2881", text: "全部灵骨年限+10000年", weight: 1, enabled: !1 },
        {
          id: "eb858f",
          text: "全部灵环品质变成【纯血龙】品质",
          weight: 1,
          enabled: !1,
        },
        {
          id: "3d600d",
          text: "全部灵骨品质变成【纯血龙】品质",
          weight: 1,
          enabled: !1,
        },
        { id: "5809cc", text: "等级+5", weight: 1, enabled: !1 },
        { id: "e783a6", text: "金灵币+100", weight: 1, enabled: !1 },
        { id: "7585c3", text: "小霍娘的好感度+100点", weight: 1, enabled: !0 },
        {
          id: "2fe5ab",
          text: "获得一次元素进化抽取池的抽取机会",
          weight: 1,
          enabled: !1,
        },
        {
          id: "108119",
          text: "获得一个领域抽取池的抽取机会",
          weight: 1,
          enabled: !1,
        },
        { id: "e5278d", text: "获得一个灵核", weight: 1, enabled: !1 },
      ],
    },
  ],
  za = { pools: th },
  yt = "f7057860-b1da-4892-920f-f250ebf3d194",
  nh = {
    "8fae68": [{ type: "changeAllSoulRingYears", amount: 1e4 }],
    ef2881: [{ type: "changeAllSoulBoneYears", amount: 1e4 }],
    eb858f: [{ type: "setAllSoulRingQuality", quality: "pure-dragon" }],
    "3d600d": [{ type: "setAllSoulBoneQuality", quality: "pure-dragon" }],
    "5809cc": [{ type: "changeLevel", amount: 5 }],
    e783a6: [{ type: "changeCurrency", copper: 1e6 }],
    "7585c3": [{ type: "adjustNpcAffinity", npcId: Gt, amount: 100 }],
    "2fe5ab": [{ type: "changeCounter", key: Qs, amount: 1 }],
    108119: [{ type: "changeCounter", key: Xs, amount: 1 }],
    e5278d: [{ type: "changeCounter", key: "soulCoreCount", amount: 1 }],
  },
  Ut = za.pools.find((t) => t.id === yt);
if (!Ut) throw new Error(`最新版正式源缺少作弊池 ${yt}`);
const Ug = {
    id: Ut.id,
    name: Ut.name,
    tags: Ut.tags,
    timelineScope: "shared",
    contentOwner: "shared-cheat",
    contentStatus: "formal",
    poolKind: "opportunity",
    options: Ut.options.map((t) => ({
      ...t,
      contentStatus: "formal",
      effects: nh[t.id] ?? [],
    })),
  },
  Ua = "f8379bd3-2800-475c-bfb3-1d6e13da9fa1",
  Wt = za.pools.find((t) => t.id === Ua);
if (!Wt) throw new Error(`最新版正式源缺少属性惩罚池 ${Ua}`);
const Wg = {
  id: Wt.id,
  name: Wt.name,
  tags: Wt.tags,
  timelineScope: "shared",
  contentOwner: "shared-cheat",
  contentStatus: "formal",
  poolKind: "opportunity",
  options: Wt.options.map((t) => ({
    ...t,
    contentStatus: "formal",
    effects: [{ type: "addLog", text: t.text }],
  })),
};
function oh(t) {
  let e = 2166136261;
  for (let n = 0; n < t.length; n += 1)
    ((e ^= t.charCodeAt(n)), (e = Math.imul(e, 16777619)));
  return `${t.length.toString(36)}:${(e >>> 0).toString(16).padStart(8, "0")}`;
}
class ih {
  constructor(e, n) {
    ((this.registry = e),
      (this.fufuStore = n),
      (this.state = { phase: "idle", game: null, packId: null, error: null }),
      (this.loadedPack = null),
      (this.backgroundRuntime = null),
      (this.pendingOption = null),
      (this.pendingCheat = null),
      (this.lastCheatCommit = null),
      (this.lastEnteredPoolId = null),
      (this.gameEndedEmitted = !1),
      (this.generation = 0),
      (this.listeners = new Set()),
      (this.revision = 0));
  }
  onEvent(e) {
    return (this.listeners.add(e), () => this.listeners.delete(e));
  }
  emit(e) {
    this.listeners.forEach((n) => n(e));
  }
  publish(e) {
    ((this.revision += 1),
      this.emit({ type: "state-changed", revision: this.revision, reason: e }));
  }
  fastModeTrace(e, n, o) {
    var u, d, p, f, I;
    const i = this.state.game;
    if (!i) return null;
    const a = Object.fromEntries(
        [
          "formal:god-trial-draws",
          "formal:element-draws",
          "formal:domain-draws",
          "formal:opportunity-draws",
        ].flatMap((k) => {
          const g = Number(i.character.flags[k] ?? 0);
          return Number.isFinite(g) && g > 0 ? [[k, Math.trunc(g)]] : [];
        }),
      ),
      l = Number(i.character.flags["formal:status:王座层数"]);
    return {
      seed: i.random.seed,
      route: i.character.route,
      stepCount: e,
      wallClockMs: Math.max(0, Date.now() - n),
      level: i.character.level,
      age: i.character.age,
      timelineAge: i.character.timelineAge ?? null,
      currentPoolId: i.currentPoolId,
      currentOptionId:
        ((u = i.lastResolvedSpin) == null ? void 0 : u.result.optionId) ?? null,
      pendingFollowUps: i.pendingFollowUps.length,
      pendingFormalOpportunities: a,
      queueLength: i.pendingFollowUps.length,
      throneFloor: Number.isFinite(l) ? Math.trunc(l) : null,
      godTrials: {
        archived:
          ((d = i.character.godTrials) == null ? void 0 : d.length) ?? 0,
        active:
          ((p = i.character.godTrial) == null ? void 0 : p.status) ?? null,
        godhoods: ((f = i.character.godhoods) == null ? void 0 : f.length) ?? 0,
      },
      terminalState:
        ((I = i.character.ending) == null ? void 0 : I.id) ??
        (i.finished ? "finished" : null),
      lastStateFingerprint: oh(o),
    };
  }
  async loadPack(e) {
    const n = ++this.generation;
    (this.resetSession(),
      (this.state.phase = "loading-pack"),
      (this.state.error = null));
    try {
      const o = await this.registry.load(e);
      return n !== this.generation
        ? null
        : ((this.loadedPack = o),
          (this.backgroundRuntime = new cn(o)),
          (this.state.packId = e),
          this.emit({ type: "pack-loaded", packId: e }),
          o);
    } catch (o) {
      return (n !== this.generation || this.fail(o), null);
    }
  }
  async createNew(e, n) {
    const o = n === void 0 ? "bootstrap" : e,
      i = n ?? e,
      s = await this.loadPack(o);
    if (!s) return null;
    try {
      const a = ma(i, { contentPackId: o, worldEra: si(s.game) });
      return (
        o !== "bootstrap" && (a.character.age = 6),
        this.fufuStore &&
          (a.character.flags["formal:run-id"] =
            this.fufuStore.allocateRunId(i)),
        (a.currentStepId = s.ids.resolveFlowId(s.manifest.entryFlowId)),
        (a.currentPoolId = null),
        Oo(s.game, a),
        (this.state.game = a),
        (this.state.phase = "ready"),
        this.dispatchLifecycle({ type: "character-created" }),
        this.notifyPoolEntered(),
        this.publish("create-new"),
        a
      );
    } catch (a) {
      return (this.fail(a), null);
    }
  }
  async restore(e, n) {
    var a;
    const o = await this.loadPack(e);
    if (!o) return !1;
    let i;
    try {
      i = Me(n);
    } catch (l) {
      return this.fail(l);
    }
    this.fufuStore &&
      typeof i.character.flags["formal:run-id"] != "string" &&
      (i.character.flags["formal:run-id"] = `legacy:${e}:${i.random.seed}`);
    const s = new Set();
    for (const [l, u] of i.history.entries())
      try {
        const d = Qn(u, l, i);
        d.packId !== e && s.add(d.packId);
      } catch (d) {
        return this.fail(d);
      }
    try {
      await Promise.all([...s].map((l) => this.registry.load(l)));
    } catch (l) {
      return this.fail(l);
    }
    if (i.packId !== e) return this.fail("存档内容包与会话内容包不一致");
    try {
      (i.currentStepId &&
        (i.currentStepId = o.ids.resolveFlowId(i.currentStepId)),
        i.currentPoolId &&
          (i.currentPoolId = o.ids.resolvePoolId(i.currentPoolId)),
        i.pendingNextStepId &&
          (i.pendingNextStepId = o.ids.resolveFlowId(i.pendingNextStepId)),
        i.pendingBeastSpecies &&
          (i.pendingBeastSpecies.returnStep = o.ids.resolveFlowId(
            i.pendingBeastSpecies.returnStep,
          )));
      const l = {},
        u = {};
      for (const [d, p] of Object.entries(i.forcedResults)) {
        const f = o.ids.resolvePoolId(d);
        ((l[f] = o.ids.resolveOptionId(p, f)),
          (u[f] = i.forcedResultSources[d] ?? "advanced-tool"));
      }
      ((i.forcedResults = l),
        (i.forcedResultSources = u),
        this.normalizeLastResolvedSpin(i, o));
    } catch (l) {
      return this.fail(l);
    }
    if (i.currentStepId && !o.game.flows[i.currentStepId])
      return this.fail(`存档流程不存在：${i.currentStepId}`);
    try {
      hn(o.game, i);
    } catch (l) {
      return this.fail(l);
    }
    return (
      (this.state.game = i),
      (this.state.phase = i.finished
        ? "finished"
        : i.awaitingAdvance
          ? "showing-result"
          : "ready"),
      (this.lastEnteredPoolId =
        ((a = this.pool) == null ? void 0 : a.id) ?? null),
      (this.gameEndedEmitted = !1),
      (i.finished || i.character.ending) && this.notifyGameEnded(),
      this.publish("restore"),
      !0
    );
  }
  get pack() {
    var e;
    return ((e = this.loadedPack) == null ? void 0 : e.game) ?? null;
  }
  get loadedContentPack() {
    return this.loadedPack;
  }
  get pool() {
    return this.pack && this.state.game
      ? Vt(this.pack, this.state.game)
      : void 0;
  }
  get ids() {
    var e;
    return ((e = this.loadedPack) == null ? void 0 : e.ids) ?? null;
  }
  get fufuBalanceHundredths() {
    var e;
    return ((e = this.fufuStore) == null ? void 0 : e.balance()) ?? 0;
  }
  get fufuTransactions() {
    var e;
    return ((e = this.fufuStore) == null ? void 0 : e.transactions()) ?? [];
  }
  get stateRevision() {
    return this.revision;
  }
  undoCost() {
    var i;
    const e = (i = this.state.game) == null ? void 0 : i.character,
      n = e ? Ki(e) : 0,
      o = e ? pt(e).copper : 0;
    return {
      cost: n,
      balance: o,
      affordable: o >= n,
      shortfall: Math.max(0, n - o),
    };
  }
  resolveSpin(e = []) {
    if (
      this.state.phase !== "ready" ||
      !this.pack ||
      !this.state.game ||
      !this.loadedPack
    )
      return null;
    try {
      this.state.phase = "resolving";
      const n = this.preparePool();
      if (!n) return null;
      const o = [...new Set([...e, ...n.excludedOptionIds])];
      if (n.fixedOptionId && o.includes(n.fixedOptionId))
        throw new Error(`背景固定结果 ${n.fixedOptionId} 同时被排除`);
      ((this.pendingOption = Ym(this.pack, this.state.game, o, {
        fixedOptionId: n.fixedOptionId,
      })),
        (this.state.phase = "spinning"));
      const i = this.loadedPack.ids.canonicalOptionId(
        this.pendingOption.id,
        n.pool.id,
      );
      return (
        this.emit({
          type: "lifecycle",
          event: { type: "option-resolved", optionId: i },
        }),
        this.emit({ type: "spin-resolved", optionId: i }),
        this.pendingOption
      );
    } catch (n) {
      return (this.fail(n), null);
    }
  }
  candidates(e = []) {
    if (!this.pack || !this.state.game || !this.backgroundRuntime) return [];
    try {
      const n = this.backgroundRuntime.preparePool(this.state.game);
      return Dn(this.pack, this.state.game, [
        ...new Set([...e, ...n.excludedOptionIds]),
      ]);
    } catch {
      return [];
    }
  }
  eligibleCandidates(e = []) {
    if (!this.pack || !this.state.game || !this.backgroundRuntime) return [];
    try {
      const n = this.backgroundRuntime.preparePool(this.state.game);
      return eo(this.pack, this.state.game, [
        ...new Set([...e, ...n.excludedOptionIds]),
      ]);
    } catch {
      return [];
    }
  }
  canLeaveCurrentPool() {
    return !!(this.pack && this.state.game && ja(this.pack, this.state.game));
  }
  leaveCurrentPool() {
    const e = this.state.game;
    if (!e || !this.pack || !["ready", "error"].includes(this.state.phase))
      return this.rejectAction("当前流程不能离开");
    try {
      return (
        Qm(this.pack, e),
        (this.pendingOption = null),
        (this.state.phase = e.finished ? "finished" : "ready"),
        (this.state.error = null),
        (this.lastEnteredPoolId = null),
        this.notifyPoolEntered(),
        this.notifyGameEnded(),
        this.publish("leave-pool"),
        !0
      );
    } catch (n) {
      return this.fail(n);
    }
  }
  setForcedResult(e, n) {
    if (!this.pack || !this.state.game || !this.loadedPack)
      return this.fail("内容包尚未加载");
    try {
      const o = this.loadedPack.ids.resolvePoolId(e),
        i = this.loadedPack.ids.resolveOptionId(n, o);
      return (Is(this.pack, this.state.game, o, i), !0);
    } catch (o) {
      return this.fail(o);
    }
  }
  clearForcedResult(e) {
    if (!this.state.game || !this.loadedPack) return !1;
    try {
      return (Zn(this.state.game, this.loadedPack.ids.resolvePoolId(e)), !0);
    } catch (n) {
      return this.fail(n);
    }
  }
  commitSpin() {
    var e;
    if (
      this.state.phase !== "spinning" ||
      !this.pack ||
      !this.state.game ||
      !this.pendingOption ||
      !this.loadedPack ||
      !this.backgroundRuntime
    )
      return !1;
    try {
      this.state.phase = "committing";
      const n = (e = this.pool) == null ? void 0 : e.id;
      if (!n) throw new Error("当前流程没有可提交的转盘");
      const o = this.loadedPack.ids.canonicalOptionId(this.pendingOption.id, n),
        i = { type: "option-resolved", optionId: o },
        s = this.pendingOption.customHandler
          ? {
              ...this.pendingOption,
              customHandler: this.loadedPack.ids.resolveHandlerId(
                this.pendingOption.customHandler,
              ),
            }
          : this.pendingOption,
        a = this.state.game.history.length,
        l = this.state.game.lastResolvedSpin;
      try {
        Km(this.pack, this.state.game, s, {
          deferAdvance: !0,
          beforeEffects: () => {
            this.backgroundRuntime.dispatch(this.state.game, i);
          },
          beforeTimeSkip: (u) =>
            this.dispatchLifecycle({ type: "before-time-skip", years: u }),
          afterTimeSkip: (u) =>
            this.dispatchLifecycle({ type: "after-time-skip", years: u }),
          afterEffects: () => {
            (this.backgroundRuntime.synchronizeDefinitions(this.state.game),
              this.dispatchLifecycle({
                type: "option-committed",
                optionId: o,
              }));
          },
        });
      } catch (u) {
        throw (
          this.state.game.history.length > a &&
            (yn(this.state.game), (this.state.game.lastResolvedSpin = l)),
          u
        );
      }
      return (
        (this.pendingOption = null),
        (this.state.phase = this.state.game.finished
          ? "finished"
          : "showing-result"),
        this.emit({ type: "spin-committed", optionId: o }),
        this.notifyGameEnded(),
        this.publish("commit-spin"),
        !0
      );
    } catch (n) {
      return (this.fail(n), !1);
    }
  }
  resolveCheat() {
    var a;
    const e = this.state.game,
      n = (a = this.pack) == null ? void 0 : a.pools.find((l) => l.id === yt);
    if (!e || !n || !this.fufuStore)
      return this.rejectAction("作弊池或芙芙钱包不可用");
    if (this.pendingCheat) return this.pendingCheat.option;
    if (this.state.phase !== "ready" || e.awaitingAdvance)
      return this.rejectAction("请先结算当前命运结果");
    if (this.fufuStore.balance() < 100)
      return this.rejectAction("芙芙的硬币不足 1 枚");
    const o = n.options.filter((l) => l.enabled !== !1 && l.weight > 0),
      i = o.reduce((l, u) => l + u.weight, 0);
    if (!Number.isFinite(i) || i <= 0)
      return this.rejectAction("作弊池没有可用选项");
    const s = e.random.cursor;
    try {
      const l = { ...e.random };
      let u = pa(l) * i;
      const d = o.find((I) => (u -= I.weight) < 0) ?? o.at(-1);
      if (!d) throw new Error("作弊池没有可用选项");
      const p = String(e.character.flags["formal:run-id"] ?? e.random.seed),
        f = this.fufuStore.allocateOperationId("cheat", p);
      return (
        (this.pendingCheat = {
          option: d,
          cursorBefore: s,
          cursorAfter: l.cursor,
          transactionId: f,
        }),
        (this.state.error = null),
        d
      );
    } catch (l) {
      return this.rejectAction(l);
    }
  }
  commitCheat(e) {
    var a, l;
    const n = this.state.game,
      o = this.pendingCheat;
    if (
      !o &&
      ((a = this.lastCheatCommit) == null ? void 0 : a.optionId) === e &&
      (l = this.fufuStore) != null &&
      l
        .transactions()
        .some((u) => u.idempotencyKey === this.lastCheatCommit.transactionId)
    )
      return !0;
    if (!n || !o || o.option.id !== e || !this.fufuStore)
      return this.rejectAction("作弊结果与控制器预定结果不一致");
    const i = Me(n);
    let s = !1;
    try {
      const u = Me(n, { validateHistory: !1 });
      (u.history.push(Mt(n, { randomCursor: o.cursorBefore })),
        (u.random.cursor = o.cursorAfter),
        Kt(u.character, o.option.effects ?? [], {
          reason: "formal-fate-intervention",
          referenceId: `${yt}:${o.option.id}`,
          idempotencyKeyPrefix: `cheat-effect:${o.transactionId}`,
        }),
        u.timeline.push({
          kind: "result",
          text: o.option.text,
          poolId: yt,
          optionId: o.option.id,
          source: "cheat",
          major: !0,
        }));
      const d = Me(u);
      (Object.assign(n, d), (s = !0));
      const p = this.fufuStore.commitCurrencyTransaction({
        currency: "fufu-hundredths",
        direction: "debit",
        amount: 100,
        reason: "formal-fate-intervention",
        referenceId: `${yt}:${o.option.id}`,
        idempotencyKey: o.transactionId,
      });
      if (p.insufficient) throw new Error("芙芙的硬币不足 1 枚");
      if (!p.committed && !p.duplicate) throw new Error("命运干预扣费未能提交");
      return (
        (this.lastCheatCommit = {
          optionId: e,
          transactionId: o.transactionId,
        }),
        (this.pendingCheat = null),
        (this.state.error = null),
        this.publish("commit-intervention"),
        !0
      );
    } catch (u) {
      return (
        s && Object.assign(n, i),
        (this.pendingCheat = null),
        this.rejectAction(u)
      );
    }
  }
  cancelCheatIntervention() {
    return !this.pendingCheat || !this.state.game
      ? !1
      : ((this.pendingCheat = null), (this.state.error = null), !0);
  }
  canUndoIntervention() {
    var o;
    const e = this.state.game,
      n =
        (o = e == null ? void 0 : e.timeline.at(-1)) == null
          ? void 0
          : o.source;
    return !!(
      e &&
      this.state.phase === "ready" &&
      e.history.length &&
      (n === "cheat" || n === "intervention")
    );
  }
  undoIntervention() {
    const e = this.state.game;
    if (!e || !this.canUndoIntervention())
      return this.rejectAction("最近一次记录不是可撤销的命运干预");
    const n = e.history.length;
    this.undo(!1);
    const o = e.history.length < n;
    return (o && (this.lastCheatCommit = null), o);
  }
  purchaseForcedResult(e, n) {
    const o = this.state.game;
    if (!o || !this.pack || !this.loadedPack || !this.fufuStore)
      return this.rejectAction("内容包或芙芙钱包尚未加载");
    if (this.state.phase !== "ready" || o.awaitingAdvance || this.pendingOption)
      return this.rejectAction("当前命运结果已经确定，不能再干预");
    let i = null,
      s = !1;
    try {
      const a = this.loadedPack.ids.resolvePoolId(e),
        l = this.loadedPack.ids.resolveOptionId(n, a);
      if (
        o.forcedResults[a] === l &&
        o.forcedResultSources[a] === "intervention"
      )
        return !0;
      if (this.fufuStore.balance() < 100)
        throw new Error("芙芙的硬币不足 1 枚");
      i = Me(o);
      const u = Me(o, { validateHistory: !1 });
      (u.history.push(Mt(o)),
        Is(this.pack, u, a, l, "intervention"),
        u.timeline.push({
          kind: "system",
          text: "命运干预已锁定下一次结果",
          poolId: a,
          optionId: l,
          source: "intervention",
          major: !0,
        }));
      const d = Me(u),
        p = String(o.character.flags["formal:run-id"] ?? o.random.seed),
        f = this.fufuStore.allocateOperationId("forced-result", p);
      (Object.assign(o, d), (s = !0));
      const I = this.fufuStore.commitCurrencyTransaction({
        currency: "fufu-hundredths",
        direction: "debit",
        amount: 100,
        reason: "paid-forced-result",
        referenceId: `${a}:${l}`,
        idempotencyKey: f,
      });
      if (I.insufficient) throw new Error("芙芙的硬币不足 1 枚");
      if (!I.committed && !I.duplicate) throw new Error("命运干预扣费未能提交");
      return (
        (this.state.error = null),
        this.publish("purchase-forced-result"),
        !0
      );
    } catch (a) {
      return (s && i && Object.assign(o, i), this.rejectAction(a));
    }
  }
  advance() {
    if (this.state.phase !== "showing-result" || !this.pack || !this.state.game)
      return !1;
    const e = this.state.game.lastResolvedSpin;
    if (
      this.state.game.packId === "bootstrap" &&
      e &&
      ks(e.poolId, e.result.optionId)
    )
      return this.fail("正式时期切换必须等待异步内容包加载");
    try {
      return (
        Jm(this.pack, this.state.game),
        (this.state.phase = this.state.game.finished ? "finished" : "ready"),
        this.notifyPoolEntered(),
        this.notifyGameEnded(),
        this.publish("advance"),
        !0
      );
    } catch (n) {
      return (this.fail(n), !1);
    }
  }
  async advanceAsync() {
    const e = this.state.game,
      n = e == null ? void 0 : e.lastResolvedSpin;
    if (
      this.state.phase === "showing-result" &&
      (e == null ? void 0 : e.packId) === "bootstrap" &&
      n
    ) {
      const o = ks(n.poolId, n.result.optionId);
      if (o) return this.transitionToEra(o);
    }
    return this.advance();
  }
  async transitionToEra(e) {
    const n = this.state.game;
    if (!n || n.packId !== "bootstrap" || !e)
      return this.fail("只有正式时期结果可以切换时代");
    this.state.phase = "loading-pack";
    try {
      const o = await this.registry.load(e.packId);
      if (!o.game.flows[e.entryFlowId])
        throw new Error(`目标内容包缺少入口 ${e.entryFlowId}`);
      const i = Me(n);
      return (
        (i.packId = e.packId),
        (i.worldEra = e.worldEra),
        (i.character.route = e.route),
        e.route === "human" && (i.character.age = 6),
        (i.currentStepId = e.entryFlowId),
        (i.currentPoolId = null),
        (i.pendingNextStepId = null),
        (i.awaitingAdvance = !1),
        (i.finished = !1),
        Oo(o.game, i),
        hn(o.game, i),
        Object.assign(n, i),
        (this.loadedPack = o),
        (this.backgroundRuntime = new cn(o)),
        (this.state.packId = e.packId),
        (this.state.phase = "ready"),
        (this.lastEnteredPoolId = null),
        this.emit({ type: "pack-loaded", packId: e.packId }),
        this.notifyPoolEntered(),
        this.publish("era-transition"),
        !0
      );
    } catch (o) {
      return (
        (this.loadedPack = this.registry.loadedPack("bootstrap")),
        (this.backgroundRuntime = this.loadedPack
          ? new cn(this.loadedPack)
          : null),
        (this.state.packId = "bootstrap"),
        (this.state.phase = "showing-result"),
        this.fail(o)
      );
    }
  }
  undo(e = !1) {
    var s, a;
    const n = this.state.game;
    if (!n) return (this.rejectAction("没有可撤销的会话"), []);
    if (this.pendingCheat) return (this.cancelCheatIntervention(), []);
    if (this.pendingOption)
      return (
        vn(n),
        (this.pendingOption = null),
        (this.state.phase = n.awaitingAdvance ? "showing-result" : "ready"),
        []
      );
    const o =
        e && n.lastResolvedSpin && this.loadedPack
          ? (() => {
              try {
                return (
                  this.loadedPack.ids.resolvePoolId(n.lastResolvedSpin.poolId),
                  this.loadedPack.ids.resolveFlowId(n.lastResolvedSpin.stepId),
                  !1
                );
              } catch {
                return !0;
              }
            })()
          : !1,
      i = (s = n.lastResolvedSpin) == null ? void 0 : s.result.optionId;
    try {
      const l = pt(n.character)
          .transactions.filter(Bl)
          .map((g) => ({ ...g })),
        u = Me(n, { validateHistory: !1 }),
        d = u.history.length;
      let p;
      if (
        (e && o
          ? (yn(u, { reroll: !0 }), (p = i ? [i] : []))
          : (p = e && this.pack ? Xm(this.pack, u) : (yn(u), [])),
        u.history.length === d)
      )
        return [];
      for (const g of l)
        if (
          Ko(u.character, {
            currency: "run-copper",
            direction: g.direction,
            amount: g.amount,
            reason: g.reason,
            referenceId: g.referenceId,
            idempotencyKey: g.idempotencyKey,
            undoPolicy: "retain",
          }).insufficient
        )
          throw new Error(
            "更早的撤销快照余额不足以保留已经支付的撤销/重抽费用",
          );
      const f =
        u.packId === this.state.packId
          ? this.loadedPack
          : this.registry.loadedPack(u.packId);
      if (!f) throw new Error(`撤销需要的内容包尚未加载：${u.packId}`);
      const I = Ki(n.character);
      if (I > 0) {
        const g = pt(u.character),
          w = String(u.character.flags["formal:run-id"] ?? u.random.seed);
        if (
          Rn(u.character, I, {
            reason: e ? "formal-reroll-fee" : "formal-undo-fee",
            referenceId: i ?? "latest-result",
            idempotencyKey: `${e ? "reroll" : "undo"}:${w}:${g.transactions.length}:${d}`,
            undoPolicy: "retain",
          }).insufficient
        )
          throw new Error(`灵币不足：撤销/重抽需要 ${I} 铜灵币`);
      }
      (o && p.length && !Dn(f.game, u, p).length && (p = []), hn(f.game, u));
      const k = Me(u);
      return (
        Object.assign(n, k),
        f !== this.loadedPack &&
          ((this.loadedPack = f),
          (this.backgroundRuntime = new cn(f)),
          (this.state.packId = f.manifest.id)),
        (this.pendingOption = null),
        (this.pendingCheat = null),
        (this.state.phase = "ready"),
        (this.state.error = null),
        (this.lastEnteredPoolId =
          ((a = this.pool) == null ? void 0 : a.id) ?? null),
        (this.gameEndedEmitted = !!n.character.ending),
        this.publish(e ? "reroll" : "undo"),
        p
      );
    } catch (l) {
      return (this.rejectAction(l), []);
    }
  }
  runToEnd(e = 1e3, n = []) {
    const o = this.state.game;
    if (
      !o ||
      !this.pack ||
      !["ready", "showing-result"].includes(this.state.phase)
    )
      return this.fail("会话当前不能极速结算");
    try {
      if (this.state.phase === "showing-result" && !this.advance()) return !1;
      let i = 0;
      for (let s = 0; s < e && !o.finished; s += 1) {
        const a = JSON.stringify({
            step: o.currentStepId,
            character: o.character,
          }),
          l = s === 0 ? n : [];
        if (
          this.eligibleCandidates(l).length === 0 &&
          this.canLeaveCurrentPool()
        ) {
          if (!this.leaveCurrentPool()) return !1;
          continue;
        }
        if (
          !this.resolveSpin(l) ||
          !this.commitSpin() ||
          (this.state.phase === "showing-result" && !this.advance())
        )
          return !1;
        const d = JSON.stringify({
          step: o.currentStepId,
          character: o.character,
        });
        if (((i = a === d ? i + 1 : 0), i >= 3))
          throw new Error(
            `自动结算检测到流程 ${o.currentStepId ?? "未知"} 连续无状态变化`,
          );
      }
      if (!o.finished) throw new Error("自动结算超过安全步数");
      return !0;
    } catch (i) {
      return this.fail(i);
    }
  }
  async runToEndAsync(e = 1e3, n = [], o) {
    const i = this.state.game;
    if (
      !i ||
      !this.pack ||
      !["ready", "showing-result"].includes(this.state.phase)
    )
      return this.fail("会话当前不能极速结算");
    try {
      const s = Date.now(),
        a = Math.max(1, Math.trunc((o == null ? void 0 : o.interval) ?? 25));
      if (this.state.phase === "showing-result" && !(await this.advanceAsync()))
        return !1;
      let l = 0;
      for (let u = 0; u < e && !i.finished; u += 1) {
        const d = JSON.stringify({
            step: i.currentStepId,
            character: i.character,
          }),
          p = u === 0 ? n : [];
        if (
          this.eligibleCandidates(p).length === 0 &&
          this.canLeaveCurrentPool()
        ) {
          if (!this.leaveCurrentPool()) return !1;
          continue;
        }
        if (
          !this.resolveSpin(p) ||
          !this.commitSpin() ||
          (this.state.phase === "showing-result" &&
            !(await this.advanceAsync()))
        )
          return !1;
        const I = JSON.stringify({
          step: i.currentStepId,
          character: i.character,
        });
        if (((l = d === I ? l + 1 : 0), l >= 3))
          throw new Error(
            `自动结算检测到流程 ${i.currentStepId ?? "未知"} 连续无状态变化`,
          );
        if (
          o != null &&
          o.onTrace &&
          (u % a === a - 1 || i.finished || i.character.level >= 145)
        ) {
          const k = this.fastModeTrace(u + 1, s, I);
          k && o.onTrace(k);
        }
        u % 8 === 7 && (await new Promise((k) => setTimeout(k, 0)));
      }
      if (!i.finished) throw new Error("自动结算超过安全步数");
      return !0;
    } catch (s) {
      return this.fail(s);
    }
  }
  cancelPending() {
    (this.cancelCheatIntervention(),
      this.state.game && vn(this.state.game),
      (this.pendingOption = null),
      this.state.game &&
        !this.state.game.finished &&
        (this.state.phase = this.state.game.awaitingAdvance
          ? "showing-result"
          : "ready"));
  }
  pause() {
    (this.state.phase === "ready" || this.state.phase === "showing-result") &&
      (this.state.phase = "paused");
  }
  resume() {
    this.state.phase === "paused" && (this.state.phase = "ready");
  }
  stop() {
    ((this.generation += 1), this.resetSession());
  }
  resetSession() {
    (this.state.game && vn(this.state.game),
      (this.pendingOption = null),
      (this.pendingCheat = null),
      (this.lastCheatCommit = null),
      (this.loadedPack = null),
      (this.backgroundRuntime = null),
      (this.state.game = null),
      (this.state.packId = null),
      (this.state.phase = "idle"),
      (this.lastEnteredPoolId = null),
      (this.gameEndedEmitted = !1));
  }
  preparePool() {
    if (!this.state.game || !this.backgroundRuntime || !this.loadedPack)
      return null;
    for (let e = 0; e < 20; e += 1) {
      const n = this.backgroundRuntime.preparePool(this.state.game);
      if (n.pool.id === this.lastEnteredPoolId) return n;
      ((this.lastEnteredPoolId = n.pool.id),
        this.dispatchLifecycle({
          type: "before-pool-enter",
          poolId: this.loadedPack.ids.canonicalPoolId(n.pool.id),
        }));
    }
    throw new Error("背景规则进入转盘超过安全次数");
  }
  notifyPoolEntered() {
    !this.state.game ||
      this.state.game.finished ||
      !this.backgroundRuntime ||
      this.preparePool();
  }
  dispatchLifecycle(e) {
    !this.state.game ||
      !this.backgroundRuntime ||
      (this.backgroundRuntime.dispatch(this.state.game, e),
      this.emit({ type: "lifecycle", event: e }));
  }
  notifyGameEnded() {
    const e = this.state.game,
      n = e == null ? void 0 : e.character.ending;
    if (!n || !e) return;
    const o =
      typeof e.character.flags["formal:run-id"] == "string"
        ? e.character.flags["formal:run-id"]
        : `legacy:${e.packId}:${e.random.seed}`;
    if (
      ((e.character.flags["formal:run-id"] = o),
      Ks(e.character, {
        reason: "ending-clear-run-currency",
        referenceId: n.id,
        idempotencyKey: `ending-clear:${o}`,
      }),
      this.fufuStore)
    )
      try {
        (this.fufuStore.settle(o, zl(Ln.total(e.character))),
          (e.character.flags["formal:fufu-settled"] = !0));
      } catch (s) {
        (delete e.character.flags["formal:fufu-settled"], this.rejectAction(s));
      }
    if (this.gameEndedEmitted) return;
    this.gameEndedEmitted = !0;
    const i = n.id.startsWith(`${this.state.packId}:ending.`)
      ? n.id
      : `${this.state.packId}:ending.${n.id}`;
    this.dispatchLifecycle({ type: "game-ended", endingId: i });
  }
  normalizeLastResolvedSpin(e, n) {
    const o = e.lastResolvedSpin;
    if (!o) return;
    const s = [n, this.registry.loadedPack("bootstrap")]
      .filter((l) => !!l)
      .find((l) => {
        try {
          return (
            l.ids.resolvePoolId(o.poolId),
            l.ids.resolveFlowId(o.stepId),
            !0
          );
        } catch {
          return !1;
        }
      });
    if (!s) throw new Error(`存档最近结果的转盘不存在：${o.poolId}`);
    const a = s.ids.resolvePoolId(o.poolId);
    ((o.stepId = s.ids.resolveFlowId(o.stepId)),
      (o.poolId = a),
      (o.items = o.items.map((l) => ({
        ...l,
        id: s.ids.resolveOptionId(l.id, a),
      }))),
      (o.selectedOption = {
        ...o.selectedOption,
        id: s.ids.resolveOptionId(o.selectedOption.id, a),
      }),
      (o.result = {
        ...o.result,
        optionId: s.ids.resolveOptionId(o.result.optionId, a),
      }));
  }
  fail(e) {
    const n = e instanceof Error ? e.message : String(e);
    return (
      (this.state.error = n),
      (this.state.phase = "error"),
      this.emit({ type: "failed", message: n }),
      !1
    );
  }
  rejectAction(e) {
    const n = e instanceof Error ? e.message : String(e);
    return (
      (this.state.error = n),
      this.emit({ type: "failed", message: n }),
      !1
    );
  }
}
const sh = { human: "人类灵师", beast: "灵兽", transformed: "灵兽化形" },
  ah = {
    qualified: "已取得资格",
    active: "考核中",
    failed: "考核失败",
    abandoned: "已放弃",
    completed: "已完成",
  },
  rh = {
    qualified: "已取得资格",
    active: "考核中",
    failed: "考核失败",
    completed: "已完成",
  },
  lh = {
    yellow: "黄级考核",
    purple: "紫级考核",
    black: "黑级考核",
    top: "顶级考核",
    seaGod: "海神九考",
  },
  uh = { success: "成功", death: "陨落", neutral: "中立" },
  dh = {
    alive: "存活",
    dead: "已陨落",
    god: "正式神祇",
    "pseudo-god": "自斩神位",
  };
function at(t) {
  return t && { ...t, text: A(t.text) };
}
function wn(t) {
  return t ? { ...t, ...(t.name === void 0 ? {} : { name: A(t.name) }) } : null;
}
function ch(t) {
  return t
    ? {
        ...t,
        tierSelection: at(t.tierSelection),
        deityName: t.deityName === null ? null : A(t.deityName),
        deitySelection: at(t.deitySelection) ?? null,
        completedStages: [...t.completedStages],
        claimedRewardStages: [...t.claimedRewardStages],
        claimedRewardIds: [...t.claimedRewardIds],
      }
    : null;
}
function fh(t) {
  return t
    ? {
        ...t,
        selection: at(t.selection),
        completedStages: [...t.completedStages],
        claimedRewardStages: [...t.claimedRewardStages],
        claimedRewardOptionIds: [...t.claimedRewardOptionIds],
      }
    : null;
}
function ph(t) {
  return t
    ? {
        ...t,
        title: A(t.title),
        ...(t.text === void 0 ? {} : { text: A(t.text) }),
        ...(t.deathCause === void 0 ? {} : { deathCause: A(t.deathCause) }),
        ...(t.cause === void 0 ? {} : { cause: A(t.cause) }),
        godhoodAtEnding: wn(t.godhoodAtEnding),
      }
    : null;
}
function mh(t, e) {
  const n = new Set(["forced-result", "advanced-tool", "free-wheel"]);
  return t.timeline
    .filter(
      (o) =>
        !e ||
        (!o.hiddenInShowcase &&
          (o.kind === "result" || !n.has(o.source ?? "normal"))),
    )
    .map((o) => ({ ...o, text: A(o.text) }));
}
function hh(t, e = !1) {
  const n = t.character,
    o = n.beast ?? n.beastOrigin,
    i = ph(n.ending),
    s =
      n.ending && n.ending.godhoodAtEnding !== void 0
        ? wn(n.ending.godhoodAtEnding)
        : wn(n.godhood),
    a = Wn(n).map((l) => wn(l));
  return {
    title: e ? "斗灵命途·展示版传记" : "斗灵命途·完整传记",
    showcase: e,
    seed: t.random.seed,
    route: n.route,
    routeName: sh[n.route],
    age: sa(n),
    chronologicalAge: (o == null ? void 0 : o.chronologicalAge) ?? null,
    level: n.level,
    maxLevel: n.maxLevel,
    beastYears: n.beastYears,
    timelineAge: n.timelineAge,
    gender: n.gender ? A(n.gender.text) : null,
    appearance: n.appearance ? A(n.appearance.text) : null,
    faction: n.faction ? A(n.faction.text) : null,
    beastName: Zo(o),
    beastNamePrefixes: ((o == null ? void 0 : o.namePrefixes) ?? []).map(A),
    beastNameSuffixes: ((o == null ? void 0 : o.nameSuffixes) ?? []).map(A),
    martialSouls: n.martialSouls.map((l) => ({
      id: l.id,
      name: A(l.name),
      category: A(l.category),
      rings: l.rings.map((u) => ({
        ...u,
        name: A(u.name),
        source: at(u.source) ?? void 0,
        typeSelection: at(u.typeSelection) ?? void 0,
        speciesSelection: at(u.speciesSelection) ?? void 0,
      })),
      tags: (l.tags ?? []).map(A),
      passives: (l.passives ?? []).map(A),
      awakenings: (l.awakenings ?? []).map((u) => at(u)),
    })),
    soulBones: n.soulBones.map((l) => ({ ...l, name: A(l.name) })),
    bloodlines: [
      ...(n.route === "beast"
        ? []
        : n.bloodlines.map((l) => ({ name: A(l), source: "human" }))),
      ...((o == null ? void 0 : o.bloodlines) ?? []).map((l) => ({
        name: A(l.selection.text),
        percentage: l.percentage,
        source: "beast",
      })),
    ],
    attributes: n.attributes.map(A),
    laws: ((o == null ? void 0 : o.laws) ?? []).map(A),
    traits: n.traits.map(A),
    martialSoulTalents: n.martialSoulTalents.map((l) => at(l)),
    talents: n.talents.map((l) => at(l)),
    titles: n.titles.map(A),
    domains: n.domains.map(A),
    godTrial: ch(n.godTrial),
    seaTrial: fh(n.seaTrial),
    artifacts: n.artifacts.map((l) => ({ ...l, name: A(l.name) })),
    godhood: s,
    godhoods: a,
    ending: i,
    timeline: mh(t, e),
  };
}
function Ue(t) {
  return t.length ? t.join("、") : "无";
}
function vt(t) {
  return t.toLocaleString("zh-CN");
}
function $s(t) {
  if (!t) return "无";
  const e = t.tier ? `（${t.tier}）` : "",
    n = t.levelCap !== void 0 ? `，等级上限 ${t.levelCap}` : "";
  return `${t.name ?? t.id}${e}${n}`;
}
const gh = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
function vh(t, e) {
  let n = 0,
    o = "";
  for (const i of t) {
    const s = i.codePointAt(0) ?? 0,
      a = s <= 127 ? 1 : s <= 2047 ? 2 : s <= 65535 ? 3 : 4;
    if (n + a > e) break;
    ((o += i), (n += a));
  }
  return o;
}
function bh(t) {
  let e = t
    .trim()
    .replace(/[\u0000-\u001f\\/:*?"<>|]/g, "-")
    .replace(/[. ]+$/g, "");
  return (
    e || (e = "命运种子"),
    gh.test(e) && (e = `${e}-命运`),
    (e = vh(e, 236).replace(/[. ]+$/g, "")),
    `${e || "命运种子"}.txt`
  );
}
function yh(t, e = !1) {
  var i, s;
  const n = hh(t, e),
    o = [
      n.title,
      "",
      "【基本档案】",
      `路线：${n.routeName}`,
      `年龄：${vt(n.age)} 岁`,
    ];
  if (
    (n.route === "beast"
      ? (n.beastName && o.push(`魂兽名号：${n.beastName}`),
        o.push(`名称前缀：${Ue(n.beastNamePrefixes)}`),
        o.push(`名称后缀：${Ue(n.beastNameSuffixes)}`),
        o.push(`魂兽修为：${vt(n.beastYears)} 年`),
        n.chronologicalAge !== null &&
          n.chronologicalAge !== n.age &&
          o.push(`实际年龄：${vt(n.chronologicalAge)} 岁`))
      : (o.push(`魂力等级：${n.level} 级（上限 ${n.maxLevel}）`),
        n.timelineAge !== null &&
          o.push(`人类成长时间：${vt(n.timelineAge)} 岁`),
        n.route === "transformed" &&
          n.beastName &&
          (o.push(`魂兽原身名号：${n.beastName}`),
          o.push(`原身名称前缀：${Ue(n.beastNamePrefixes)}`),
          o.push(`原身名称后缀：${Ue(n.beastNameSuffixes)}`))),
    o.push(
      `性别：${n.gender ?? "未记录"}`,
      `容貌：${n.appearance ?? "未记录"}`,
      `阵营：${n.faction ?? "无"}`,
      `命运种子：${n.seed}`,
      "",
      "【武魂与魂环】",
    ),
    n.martialSouls.length
      ? n.martialSouls.forEach((a, l) => {
          (o.push(`第${l + 1}武魂：${a.name}（${a.category}）`),
            a.rings.length
              ? a.rings.forEach((u, d) => {
                  o.push(`  第${d + 1}魂环：${u.name} · ${vt(u.years)} 年`);
                })
              : o.push("  魂环：无"),
            a.awakenings.length &&
              o.push(`  觉醒：${a.awakenings.map((u) => u.text).join("、")}`));
        })
      : o.push("无"),
    o.push(
      "",
      "【魂骨、血脉与属性】",
      `魂骨：${n.soulBones.length ? n.soulBones.map((a) => `${a.name}（${vt(a.years)} 年）`).join("、") : "无"}`,
      `血脉：${n.bloodlines.length ? n.bloodlines.map((a) => `${a.name}${a.percentage === void 0 ? "" : ` ${Xo(a.percentage)}%`}`).join("、") : "无"}`,
      `属性：${Ue(n.attributes)}`,
      `法则：${Ue(n.laws)}`,
      `特殊状态：${Ue(n.traits)}`,
      `武魂天赋：${Ue(n.martialSoulTalents.map((a) => a.text))}`,
      `其他天赋：${Ue(n.talents.map((a) => a.text))}`,
      `称号：${Ue(n.titles)}`,
      `领域：${Ue(n.domains)}`,
      "",
      "【考核、神器与神位】",
    ),
    n.godTrial)
  ) {
    const a =
      n.godTrial.deityName ??
      ((i = n.godTrial.deitySelection) == null ? void 0 : i.text) ??
      "传承方向未定";
    o.push(
      `神考：${n.godTrial.tierSelection.text} · ${a} · ${ah[n.godTrial.status]} · 已完成 ${n.godTrial.completedStages.length}/${n.godTrial.totalStages} 考`,
    );
  } else o.push("神考：无");
  if (
    (n.seaTrial
      ? o.push(
          `海神岛考核：${lh[n.seaTrial.tier]} · ${rh[n.seaTrial.status]} · 已完成 ${n.seaTrial.completedStages.length}/${n.seaTrial.totalStages} 考`,
        )
      : o.push("海神岛考核：无"),
    o.push(
      `神器：${n.artifacts.length ? n.artifacts.map((a) => `${a.name}（${a.stage === "complete" ? "完整" : "胚胎"}，位阶 ${a.rank}）`).join("、") : "无"}`,
      `${((s = n.ending) == null ? void 0 : s.kind) === "death" ? "生前神位" : "正式神位"}：${n.godhoods.length ? n.godhoods.map($s).join("、") : $s(n.godhood)}`,
      "",
      "【最终结局】",
    ),
    !n.ending)
  )
    o.push("命运尚未结束");
  else {
    (o.push(
      `结局标题：${n.ending.title}`,
      `结局类型：${n.ending.kind ? uh[n.ending.kind] : "未分类"}`,
      `最终状态：${n.ending.finalStatus ? dh[n.ending.finalStatus] : "未记录"}`,
    ),
      n.route === "beast"
        ? o.push(`最终修为：${vt(n.ending.finalBeastYears ?? n.beastYears)} 年`)
        : o.push(`最终等级：${n.ending.finalLevel ?? n.level} 级`));
    const a = ia(n.ending),
      l = oa(n.ending);
    (a && o.push(`结局正文：${a}`), l && o.push(`陨落原因：${l}`));
  }
  return (
    o.push("", "【命运纪事】"),
    n.timeline.length
      ? n.timeline.forEach((a, l) => o.push(`${l + 1}. ${a.text}`))
      : o.push("无"),
    A(
      o.join(`
`),
    )
  );
}
function wh(t) {
  let e,
    n = null;
  function o() {
    if (typeof window > "u") return;
    const s = window.AudioContext ?? window.webkitAudioContext;
    if (s)
      try {
        return (
          e ?? (e = new s()),
          e.state === "suspended" && e.resume().catch(() => {}),
          e
        );
      } catch {
        return;
      }
  }
  function i(s, a, l, u, d = 1) {
    const p = Math.max(0, Math.min(100, s)) / 100;
    if (p <= 0) return;
    const f = o();
    if (f)
      try {
        const I = f.createOscillator(),
          k = f.createGain(),
          g = f.currentTime;
        ((I.type = u),
          I.frequency.setValueAtTime(a, g),
          I.frequency.exponentialRampToValueAtTime(
            Math.max(80, a * 0.62),
            g + l,
          ),
          k.gain.setValueAtTime(Math.max(1e-4, p * d), g),
          k.gain.exponentialRampToValueAtTime(1e-4, g + l),
          I.connect(k),
          k.connect(f.destination),
          I.start(g),
          I.stop(g + l));
      } catch {}
  }
  return {
    beginSpin() {
      ((n = null), o());
    },
    tick(s) {
      const a = t();
      !a.tickSound ||
        s === n ||
        ((n = s), i(a.wheelVolume, 1250, 0.025, "square", 0.18));
    },
    hit() {
      const s = t();
      s.hitSound && i(s.resultVolume, 520, 0.16, "sine", 0.38);
    },
    pause() {
      try {
        (e == null ? void 0 : e.state) === "running" &&
          e.suspend().catch(() => {});
      } catch {}
    },
    dispose() {
      try {
        e && e.close().catch(() => {});
      } catch {}
      e = void 0;
    },
  };
}
const it = {
    wheelDuration: 1400,
    resultHoldDuration: 650,
    reducedMotion: !1,
    tickSound: !0,
    hitSound: !0,
    speech: !1,
    wheelVolume: 35,
    resultVolume: 35,
    speechVolume: 35,
  },
  Wa = "douluo-v5-ui-settings";
function Vo(t, e, n, o) {
  return typeof t == "number" && Number.isFinite(t)
    ? Math.max(n, Math.min(o, t))
    : e;
}
function fn(t, e) {
  return typeof t == "boolean" ? t : e;
}
function $o(t, e) {
  return Math.round(Vo(t, e, 0, 100));
}
function qt(t) {
  const e = t && typeof t == "object" ? t : {},
    n =
      typeof e.volume == "number" && Number.isFinite(e.volume)
        ? Math.round(Math.max(0, Math.min(1, e.volume)) * 100)
        : void 0;
  return {
    wheelDuration: Vo(e.wheelDuration, it.wheelDuration, 300, 4e3),
    resultHoldDuration: Vo(e.resultHoldDuration, it.resultHoldDuration, 0, 5e3),
    reducedMotion: fn(e.reducedMotion, it.reducedMotion),
    tickSound: fn(e.tickSound, it.tickSound),
    hitSound: fn(e.hitSound, it.hitSound),
    speech: fn(e.speech, it.speech),
    wheelVolume: $o(e.wheelVolume, n ?? it.wheelVolume),
    resultVolume: $o(e.resultVolume, n ?? it.resultVolume),
    speechVolume: $o(e.speechVolume, n ?? it.speechVolume),
  };
}
function qa() {
  try {
    return typeof localStorage > "u" ? void 0 : localStorage;
  } catch {
    return;
  }
}
function Sh(t = qa()) {
  if (!t) return qt(void 0);
  try {
    const e = t.getItem(Wa);
    return qt(e ? JSON.parse(e) : void 0);
  } catch {
    return qt(void 0);
  }
}
function Ih(t, e = qa()) {
  if (e)
    try {
      e.setItem(Wa, JSON.stringify(qt(t)));
    } catch {}
}
const kh = "douluo-v5-feature-unlocks";
function $h() {
  try {
    return typeof localStorage > "u" ? void 0 : localStorage;
  } catch {
    return;
  }
}
function Ph(t = $h()) {
  if (!t) return !1;
  try {
    return (t.removeItem(kh), !0);
  } catch {
    return !1;
  }
}
const Po = Bt("App", {
  web: () =>
    wt(
      () => import("./web-o1RBLk9_.js"),
      __vite__mapDeps([7, 2, 3]),
      import.meta.url,
    ).then((t) => new t.AppWeb()),
});
function Ch(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, n) {
        return new Proxy(
          {},
          {
            get(o, i) {
              return (s, a, l) => {
                const u = t.Capacitor.Plugins[n];
                if (u === void 0) {
                  l(new Error(`Capacitor plugin ${n} not found`));
                  return;
                }
                if (typeof u[i] != "function") {
                  l(
                    new Error(`Method ${i} not found in Capacitor plugin ${n}`),
                  );
                  return;
                }
                (async () => {
                  try {
                    const d = await u[i](s);
                    a(d);
                  } catch (d) {
                    l(d);
                  }
                })();
              };
            },
          },
        );
      },
    },
  );
}
function Eh(t) {
  t.CapacitorUtils.Synapse = new Proxy(
    {},
    {
      get(e, n) {
        return t.cordova.plugins[n];
      },
    },
  );
}
function Lh(t = !1) {
  typeof window > "u" ||
    ((window.CapacitorUtils = window.CapacitorUtils || {}),
    window.Capacitor !== void 0 && !t
      ? Ch(window)
      : window.cordova !== void 0 && Eh(window));
}
var jo;
(function (t) {
  ((t.Documents = "DOCUMENTS"),
    (t.Data = "DATA"),
    (t.Library = "LIBRARY"),
    (t.Cache = "CACHE"),
    (t.External = "EXTERNAL"),
    (t.ExternalStorage = "EXTERNAL_STORAGE"),
    (t.ExternalCache = "EXTERNAL_CACHE"),
    (t.LibraryNoCloud = "LIBRARY_NO_CLOUD"),
    (t.Temporary = "TEMPORARY"));
})(jo || (jo = {}));
var zo;
(function (t) {
  ((t.UTF8 = "utf8"), (t.ASCII = "ascii"), (t.UTF16 = "utf16"));
})(zo || (zo = {}));
const Ah = Bt("Filesystem", {
  web: () =>
    wt(
      () => import("./web-Cj-s7K4J.js"),
      __vite__mapDeps([8, 2, 3]),
      import.meta.url,
    ).then((t) => new t.FilesystemWeb()),
});
Lh();
const Rh = Bt("Share", {
    web: () =>
      wt(
        () => import("./web-BFkHZPEz.js"),
        __vite__mapDeps([9, 2, 3]),
        import.meta.url,
      ).then((t) => new t.ShareWeb()),
  }),
  _h = Bt("SplashScreen", {
    web: () =>
      wt(
        () => import("./web-BlS0Pskc.js"),
        __vite__mapDeps([10, 2, 3]),
        import.meta.url,
      ).then((t) => new t.SplashScreenWeb()),
  });
var Uo;
(function (t) {
  ((t.Dark = "DARK"), (t.Light = "LIGHT"), (t.Default = "DEFAULT"));
})(Uo || (Uo = {}));
var Ps;
(function (t) {
  ((t.None = "NONE"), (t.Slide = "SLIDE"), (t.Fade = "FADE"));
})(Ps || (Ps = {}));
const Co = Bt("StatusBar");
function Th(t) {
  return !t.busy && !t.undoing;
}
function xh(t) {
  return t.undoOpen
    ? "undo"
    : t.endingOpen
      ? "ending"
      : t.drawerOpen
        ? "drawer"
        : t.startOpen && t.hasStartedGame
          ? "start"
          : "background";
}
async function Cs(t) {
  await Promise.all(t.map((e) => e.remove().catch(() => {})));
}
async function Oh(t) {
  if (!Pn.isNativePlatform()) return async () => {};
  const e = [];
  (Pn.getPlatform() === "android" &&
    (await Promise.all([
      Co.setOverlaysWebView({ overlay: !1 }).catch(() => {}),
      Co.setBackgroundColor({ color: "#ffffff" }).catch(() => {}),
      Co.setStyle({ style: Uo.Light }).catch(() => {}),
    ])),
    await _h.hide().catch(() => {}));
  try {
    (e.push(
      await Po.addListener("backButton", () => {
        t.onBackButton() || Po.minimizeApp().catch(() => {});
      }),
    ),
      e.push(
        await Po.addListener("appStateChange", ({ isActive: n }) => {
          var o;
          n ? (o = t.onResume) == null || o.call(t) : t.onPause();
        }),
      ));
  } catch (n) {
    throw (await Cs(e), n);
  }
  return () => Cs(e);
}
function Mh(t) {
  return t.replace(/[\\/:*?"<>|]/g, "-").slice(0, 120);
}
async function Bh(t, e) {
  if (!Pn.isNativePlatform()) return !1;
  const n = Mh(t),
    o = await Ah.writeFile({
      path: `exports/${n}`,
      data: e,
      directory: jo.Cache,
      encoding: zo.UTF8,
      recursive: !0,
    });
  return (
    await Rh.share({ title: n, files: [o.uri], dialogTitle: "保存或分享文件" }),
    !0
  );
}
let Es = 0;
function ci(t) {
  return Number.isFinite(t) ? Math.min(1, Math.max(0, t)) : 0;
}
function Ls(t) {
  return Number.isFinite(t) ? ci(t / 100) : 0;
}
function fi(t = "speech") {
  return ((Es += 1), `${t}-${Date.now().toString(36)}-${Es.toString(36)}`);
}
class pi {
  constructor() {
    this.listeners = new Set();
  }
  subscribe(e) {
    return (this.listeners.add(e), () => this.listeners.delete(e));
  }
  emit(e) {
    for (const n of this.listeners)
      try {
        n(e);
      } catch {}
  }
  clear() {
    this.listeners.clear();
  }
}
class Ga {
  constructor(e = "当前环境没有可用的语音服务") {
    this.capability = {
      supported: !1,
      platform: "unavailable",
      initialized: !1,
      languageAvailable: !1,
      reason: e,
    };
  }
  async prepare() {
    return { ...this.capability };
  }
  async getCapability() {
    return { ...this.capability };
  }
  async speak(e) {}
  async stop() {}
}
class Nh {
  constructor(e) {
    ((this.service = e), (this.lastSpokenResultId = null), (this.sequence = 0));
  }
  prepare() {
    return this.service
      .prepare()
      .catch(() => ({
        supported: !1,
        platform: "unavailable",
        initialized: !1,
        languageAvailable: !1,
        reason: "语音服务初始化失败",
      }));
  }
  async speakCommittedResult(e, n) {
    if (!e || e === this.lastSpokenResultId) return !1;
    ((this.lastSpokenResultId = e), (this.sequence += 1));
    try {
      await this.service.speak({
        ...n,
        utteranceId: `result-${e}-${this.sequence}`,
      });
    } catch {}
    return !0;
  }
  async stop() {
    await this.service.stop().catch(() => {});
  }
  resetResultIdentity() {
    this.lastSpokenResultId = null;
  }
}
function As(t) {
  return {
    supported: t.supported,
    platform: "android-native",
    initialized: t.initialized,
    languageAvailable: t.languageAvailable,
    selectedLanguage: t.language,
    selectedVoice: t.voiceName,
    engineName: t.engineName,
    reason: t.reason,
  };
}
const Dh = {
    supported: !0,
    platform: "android-native",
    initialized: !1,
    languageAvailable: !1,
  },
  Fh = 7e3;
function Rs(t) {
  return { supported: !1, initialized: !1, languageAvailable: !1, reason: t };
}
class Vh {
  constructor(e) {
    ((this.plugin = e),
      (this.capability = { ...Dh }),
      (this.initializationPromise = null),
      (this.listenerPromise = null),
      (this.listenerHandle = null),
      (this.disposed = !1),
      (this.currentUtteranceId = null),
      (this.initializationAttempt = 0),
      (this.events = new pi()));
  }
  onEvent(e) {
    return this.events.subscribe(e);
  }
  attachListener() {
    this.listenerPromise ||
      !this.plugin.addListener ||
      (this.listenerPromise = this.plugin
        .addListener("speechEvent", (e) => {
          this.disposed ||
            (e.utteranceId && e.utteranceId !== this.currentUtteranceId) ||
            ((e.type === "done" ||
              e.type === "error" ||
              e.type === "stopped") &&
              (this.currentUtteranceId = null),
            this.events.emit(e));
        })
        .then((e) => {
          if (this.disposed) return e.remove().catch(() => {});
          this.listenerHandle = e;
        })
        .catch(() => {}));
  }
  prepare() {
    if (this.disposed)
      return Promise.resolve({
        supported: !1,
        platform: "android-native",
        initialized: !1,
        languageAvailable: !1,
        reason: "语音服务已释放",
      });
    if (this.capability.initialized)
      return Promise.resolve({ ...this.capability });
    if (this.initializationPromise) return this.initializationPromise;
    this.attachListener();
    const e = ++this.initializationAttempt;
    let n;
    const o = this.plugin
        .initialize()
        .catch((a) =>
          Rs(a instanceof Error ? a.message : "Android 原生语音初始化失败"),
        ),
      i = new Promise((a) => {
        n = setTimeout(() => a(Rs("Android 原生语音初始化超时")), Fh);
      }),
      s = Promise.race([o, i]).then(
        (a) => (
          n !== void 0 && clearTimeout(n),
          this.disposed || e !== this.initializationAttempt
            ? {
                supported: !1,
                platform: "android-native",
                initialized: !1,
                languageAvailable: !1,
                reason: "语音服务已释放",
              }
            : ((this.capability = As(a)), { ...this.capability })
        ),
      );
    return (
      (this.initializationPromise = s),
      s.finally(() => {
        !this.capability.initialized &&
          this.initializationPromise === s &&
          (this.initializationPromise = null);
      }),
      s
    );
  }
  async getCapability() {
    var e;
    if (!this.initializationPromise && !this.capability.initialized)
      return this.prepare();
    await ((e = this.initializationPromise) == null
      ? void 0
      : e.catch(() => {}));
    try {
      !this.disposed &&
        this.capability.initialized &&
        (this.capability = As(await this.plugin.getStatus()));
    } catch {}
    return { ...this.capability };
  }
  async speak(e) {
    const n = e.text.trim(),
      o = ci(e.volume);
    if (!n || o <= 0 || this.disposed) return;
    const i = await this.prepare();
    if (!i.supported || !i.initialized || !i.languageAvailable) return;
    const s = e.utteranceId || fi("android");
    this.currentUtteranceId = s;
    try {
      const a = await this.plugin.speak({
        text: n,
        volume: o,
        rate: e.rate ?? 1,
        pitch: e.pitch ?? 1,
        flush: e.interrupt !== !1,
        utteranceId: s,
      });
      !a.accepted &&
        this.currentUtteranceId === s &&
        ((this.currentUtteranceId = null),
        this.events.emit({
          type: "error",
          utteranceId: s,
          message: a.reason || "Android 语音请求未被接受",
        }));
    } catch (a) {
      (this.currentUtteranceId === s && (this.currentUtteranceId = null),
        this.events.emit({
          type: "error",
          utteranceId: s,
          message: a instanceof Error ? a.message : "Android 语音请求失败",
        }));
    }
  }
  async stop() {
    const e = this.currentUtteranceId;
    this.currentUtteranceId = null;
    try {
      await this.plugin.stop();
    } catch {}
    e && this.events.emit({ type: "stopped", utteranceId: e });
  }
  async dispose() {
    var e, n;
    if (!this.disposed) {
      ((this.disposed = !0),
        (this.initializationAttempt += 1),
        await this.stop(),
        await ((e = this.listenerPromise) == null ? void 0 : e.catch(() => {})),
        await ((n = this.listenerHandle) == null
          ? void 0
          : n.remove().catch(() => {})),
        (this.listenerHandle = null));
      try {
        await this.plugin.shutdown();
      } catch {}
      this.events.clear();
    }
  }
}
function jh() {
  if (typeof window > "u") return null;
  const t = window.speechSynthesis,
    e = window.SpeechSynthesisUtterance;
  return !t || !e
    ? null
    : {
        getVoices: () => t.getVoices(),
        speak: (n) => t.speak(n),
        cancel: () => t.cancel(),
        createUtterance: (n) => new e(n),
        addVoicesChangedListener: (n) => t.addEventListener("voiceschanged", n),
        removeVoicesChangedListener: (n) =>
          t.removeEventListener("voiceschanged", n),
      };
}
function Sn(t) {
  return t.trim().replace("_", "-").toLowerCase();
}
function zh(t) {
  const e = t.find((i) => Sn(i.lang) === "zh-cn"),
    n = t.find((i) => Sn(i.lang).startsWith("zh-hans")),
    o = t.find((i) => Sn(i.lang).startsWith("zh"));
  return e ?? n ?? o ?? t.find((i) => i.default) ?? t[0] ?? null;
}
function _s(t) {
  return !!(t && Sn(t.lang).startsWith("zh"));
}
class Uh {
  constructor(e) {
    ((this.environment = e),
      (this.selectedVoice = null),
      (this.listeningForVoices = !1),
      (this.disposed = !1),
      (this.currentUtteranceId = null),
      (this.events = new pi()),
      (this.onVoicesChanged = () => this.refreshVoices()));
  }
  onEvent(e) {
    return this.events.subscribe(e);
  }
  refreshVoices() {
    if (!this.disposed)
      try {
        this.selectedVoice = zh(this.environment.getVoices());
      } catch {
        this.selectedVoice = null;
      }
  }
  capability() {
    var e, n;
    return {
      supported: !this.disposed,
      platform: "web",
      initialized: !this.disposed,
      languageAvailable: _s(this.selectedVoice),
      selectedLanguage:
        ((e = this.selectedVoice) == null ? void 0 : e.lang) || "zh-CN",
      selectedVoice: (n = this.selectedVoice) == null ? void 0 : n.name,
      reason:
        this.selectedVoice && !_s(this.selectedVoice)
          ? "未找到中文语音，将尝试使用系统默认语音"
          : this.selectedVoice
            ? void 0
            : "尚未发现可用语音，将尝试系统默认语音",
    };
  }
  async prepare() {
    if (this.disposed) return this.capability();
    if (!this.listeningForVoices)
      try {
        (this.environment.addVoicesChangedListener(this.onVoicesChanged),
          (this.listeningForVoices = !0));
      } catch {}
    return (this.refreshVoices(), this.capability());
  }
  async getCapability() {
    return (await this.prepare(), this.capability());
  }
  async speak(e) {
    const n = e.text.trim(),
      o = ci(e.volume);
    if (!n || o <= 0 || this.disposed) return;
    await this.prepare();
    const i = e.utteranceId || fi("web");
    (e.interrupt !== !1 && (await this.stop()), (this.currentUtteranceId = i));
    try {
      const s = this.environment.createUtterance(n);
      ((s.lang = "zh-CN"),
        (s.volume = o),
        (s.rate = e.rate ?? 1),
        (s.pitch = e.pitch ?? 1),
        (s.voice = this.selectedVoice),
        (s.onstart = () => {
          this.currentUtteranceId === i &&
            this.events.emit({ type: "start", utteranceId: i });
        }),
        (s.onend = () => {
          this.currentUtteranceId === i &&
            ((this.currentUtteranceId = null),
            this.events.emit({ type: "done", utteranceId: i }));
        }),
        (s.onerror = (a) => {
          this.currentUtteranceId === i &&
            ((this.currentUtteranceId = null),
            this.events.emit({
              type: "error",
              utteranceId: i,
              code: "error" in a ? a.error : void 0,
            }));
        }),
        this.environment.speak(s));
    } catch (s) {
      (this.currentUtteranceId === i && (this.currentUtteranceId = null),
        this.events.emit({
          type: "error",
          utteranceId: i,
          message: s instanceof Error ? s.message : "浏览器语音请求失败",
        }));
    }
  }
  async stop() {
    const e = this.currentUtteranceId;
    this.currentUtteranceId = null;
    try {
      this.environment.cancel();
    } catch {}
    e && this.events.emit({ type: "stopped", utteranceId: e });
  }
  async dispose() {
    if (!this.disposed) {
      if ((await this.stop(), (this.disposed = !0), this.listeningForVoices)) {
        try {
          this.environment.removeVoicesChangedListener(this.onVoicesChanged);
        } catch {}
        this.listeningForVoices = !1;
      }
      this.events.clear();
    }
  }
}
const Wh = Bt("NativeTextToSpeech");
function qh(t) {
  return t.supported && t.initialized && t.languageAvailable;
}
class Gh {
  constructor(e, n) {
    ((this.native = e),
      (this.fallback = n),
      (this.active = null),
      (this.preparation = null),
      (this.lastCapability = null),
      (this.events = new pi()),
      (this.unsubscribers = []),
      e.onEvent &&
        this.unsubscribers.push(e.onEvent((o) => this.events.emit(o))),
      n != null &&
        n.onEvent &&
        this.unsubscribers.push(n.onEvent((o) => this.events.emit(o))));
  }
  onEvent(e) {
    return this.events.subscribe(e);
  }
  prepare() {
    if (this.active) return this.active.getCapability();
    if (this.preparation) return this.preparation;
    const e = (async () => {
      const n = await this.native.prepare().catch(() => null);
      if (n && qh(n))
        return ((this.active = this.native), (this.lastCapability = n), n);
      if (this.fallback) {
        const i = await this.fallback.prepare().catch(() => null);
        if (i != null && i.supported)
          return ((this.active = this.fallback), (this.lastCapability = i), i);
      }
      const o = n ?? {
        supported: !1,
        platform: "android-native",
        initialized: !1,
        languageAvailable: !1,
        reason: "Android 原生语音不可用",
      };
      return ((this.lastCapability = o), o);
    })();
    return (
      (this.preparation = e),
      e.finally(() => {
        !this.active && this.preparation === e && (this.preparation = null);
      }),
      e
    );
  }
  async getCapability() {
    var e;
    return (
      await this.prepare(),
      ((e = this.active) == null ? void 0 : e.getCapability()) ??
        this.lastCapability ??
        new Ga().getCapability()
    );
  }
  async speak(e) {
    var n;
    (await this.prepare(),
      await ((n = this.active) == null ? void 0 : n.speak(e).catch(() => {})));
  }
  async stop() {
    var e;
    await Promise.all([
      this.native.stop().catch(() => {}),
      (e = this.fallback) == null ? void 0 : e.stop().catch(() => {}),
    ]);
  }
  async dispose() {
    var e, n, o, i;
    for (const s of this.unsubscribers.splice(0)) s();
    (await Promise.all([
      (n = (e = this.native).dispose) == null
        ? void 0
        : n.call(e).catch(() => {}),
      (i = (o = this.fallback) == null ? void 0 : o.dispose) == null
        ? void 0
        : i.call(o).catch(() => {}),
    ]),
      this.events.clear());
  }
}
function Hh(t = {}) {
  const e = t.platform ?? Pn,
    n = t.webEnvironment === void 0 ? jh() : t.webEnvironment,
    o = n ? new Uh(n) : null;
  if (e.isNativePlatform() && e.getPlatform() === "android") {
    const i = new Vh(t.nativePlugin ?? Wh);
    return new Gh(i, o);
  }
  return o || new Ga();
}
const Wo = {
  supported: !1,
  platform: "unavailable",
  initialized: !1,
  languageAvailable: !1,
  reason: "尚未检测语音服务",
};
class Yh {
  constructor(e, n) {
    ((this.service = e), (this.getSettings = n), (this.committed = new Nh(e)));
  }
  prepareForSpin() {
    return this.service.prepare().catch(() => ({ ...Wo }));
  }
  getCapability() {
    return this.service.getCapability().catch(() => ({ ...Wo }));
  }
  speakCommittedResult(e, n) {
    const o = this.getSettings();
    if (!o.speech || !n.trim()) return Promise.resolve(!1);
    const i = Ls(o.speechVolume);
    return i <= 0
      ? Promise.resolve(!1)
      : this.committed.speakCommittedResult(e, {
          text: A(n),
          volume: i,
          rate: 1,
          pitch: 1,
          interrupt: !0,
        });
  }
  async testCurrentVoice(e = "语音朗读测试成功") {
    const n = Ls(this.getSettings().speechVolume);
    if (n <= 0 || !e.trim()) return !1;
    const o = fi("diagnostic");
    let i = !1,
      s,
      a;
    const l = (u, d) => {
      i || ((i = !0), a !== void 0 && clearTimeout(a), s == null || s(), d(u));
    };
    return new Promise((u) => {
      var d, p;
      ((s =
        (p = (d = this.service).onEvent) == null
          ? void 0
          : p.call(d, (f) => {
              f.utteranceId === o &&
                (f.type === "start" || f.type === "done"
                  ? l(!0, u)
                  : (f.type === "error" || f.type === "stopped") && l(!1, u));
            })),
        (a = setTimeout(() => l(!1, u), 2500)),
        this.service
          .speak({
            text: A(e),
            volume: n,
            rate: 1,
            pitch: 1,
            interrupt: !0,
            utteranceId: o,
          })
          .then(() => {
            this.service.onEvent || l(!0, u);
          })
          .catch(() => l(!1, u)));
    });
  }
  async stop(e = !1) {
    (e && this.committed.resetResultIdentity(), await this.committed.stop());
  }
  async dispose() {
    var e, n;
    (await this.stop(),
      await ((n = (e = this.service).dispose) == null
        ? void 0
        : n.call(e).catch(() => {})));
  }
}
function Kh(t, e) {
  return new Yh(t, e);
}
function Jh() {
  return { ...Wo };
}
function Qh(t) {
  const e = t === "development";
  return Object.freeze({ developerTools: e, optionBlocking: e });
}
const Ts = Qh("production"),
  Xh = { key: 0, class: "game-screen" },
  Zh = { class: "app-bar", "data-testid": "game-topbar" },
  eg = { class: "brand" },
  tg = { key: 0, class: "route-guidance" },
  ng = { class: "narrative-zone" },
  og = { class: "wheel-zone" },
  ig = { key: 0, class: "exclude-hint" },
  sg = { key: 1, class: "exclude-hint result-ready" },
  ag = {
    key: 1,
    class: "app-notice-toast speech-notice-toast",
    role: "status",
  },
  rg = { key: 1, class: "start-overlay" },
  lg = { class: "start-dialog" },
  ug = { key: 0, role: "status" },
  dg = { key: 1 },
  cg = ["disabled"],
  fg = ["disabled"],
  pg = ["disabled"],
  mg = ["disabled"],
  hg = ["disabled"],
  gg = ["disabled"],
  vg = { key: 2, role: "status" },
  bg = ["disabled"],
  yg = de({
    __name: "GameScreen",
    setup(t) {
      var Fi;
      function e() {
        var y;
        const S = new Uint32Array(2);
        return (
          (y = window.crypto) == null || y.getRandomValues(S),
          `命运-${S[0].toString(36)}-${S[1].toString(36)}`
        );
      }
      const n = T(e()),
        o = Lt(ma(n.value)),
        i = Rp(),
        s = new Wl(localStorage),
        a = T(s.balance()),
        l = Lt(s.transactions()),
        u = T(0),
        d = new ih(i, s);
      function p() {
        ((a.value = s.balance()), (l.value = s.transactions()));
      }
      function f() {
        (Vi(o), p());
      }
      function I() {
        const S = d.state.game;
        if (!S) throw new Error("会话控制器没有可用的游戏状态");
        return ((o.value = S), S);
      }
      const k = d.onEvent((S) => {
          if (S.type !== "state-changed") return;
          u.value = S.revision;
          const y = d.state.game;
          (y && o.value !== y ? (o.value = y) : Vi(o), p());
        }),
        g = Ts.developerTools,
        w = Ts.optionBlocking,
        b = Lt(null),
        c = Lt(null),
        L = Lt(null),
        m = Lt([]);
      function h() {
        ((b.value = d.pack ? Pi(d.pack) : null),
          (c.value = d.loadedContentPack));
      }
      const $ = T(!1),
        N = T(!0),
        te = T(null),
        ne = T(null),
        ue = T(0),
        R = T([]),
        C = T("？？？"),
        W = T(""),
        K = T(!1),
        F = T(!1),
        fe = T(!1),
        re = Wr(Sh()),
        q = wh(() => re),
        ve = Hh(),
        ae = Kh(ve, () => re),
        ye = T(Jh()),
        M = T(!1),
        Z = T(""),
        ke = T(""),
        J = T(""),
        $t =
          (Fi = ve.onEvent) == null
            ? void 0
            : Fi.call(ve, (S) => {
                if (S.type !== "error") return;
                const y = S.code ? `（错误 ${S.code}）` : "";
                ((ye.value = { ...ye.value, reason: `最近一次朗读失败${y}` }),
                  J.value === "settings" &&
                    (Z.value = "朗读暂时不可用，游戏仍可正常使用。"));
              }),
        Le = T(!1),
        Q = T(!1),
        he = T(!1),
        Je = T(!1),
        Ae = _(() => (o.value, d.pool)),
        Si = _(() => {
          var S;
          return new Map(
            ((S = b.value) == null ? void 0 : S.pools.map((y) => [y.id, y])) ??
              [],
          );
        }),
        tn = _(() => (Ae.value ? Si.value.get(Ae.value.id) : void 0)),
        Xa = _(() => Si.value.get(yt)),
        Za = _(() => (o.value, d.canUndoIntervention())),
        er = _(() => xt(a.value)),
        Pt = _(() =>
          F.value || he.value || o.value.awaitingAdvance || o.value.finished
            ? void 0
            : tn.value,
        ),
        Ii = _(() => (o.value, d.eligibleCandidates().map((S) => S.id))),
        ze = _(() => o.value.lastResolvedSpin),
        tr = _(
          () => !!(ze.value && Ae.value && ze.value.poolId === Ae.value.id),
        ),
        Ct = _(
          () =>
            !!(
              ze.value &&
              (o.value.finished ||
                !Ae.value ||
                (o.value.awaitingAdvance && tr.value))
            ),
        ),
        nr = _(() => {
          var S;
          return (
            ((S = tn.value) == null ? void 0 : S.name) ??
            (ze.value ? A(ze.value.poolTitle) : void 0) ??
            "暂无转盘"
          );
        }),
        or = _(() => {
          var S;
          return Ct.value
            ? (S = ze.value) == null
              ? void 0
              : S.result.optionId
            : void 0;
        }),
        nn = _(() => {
          const S = Ae.value,
            y = or.value;
          if (Ct.value && ze.value)
            return ze.value.items.map((U) => ({
              id: U.id,
              label: A(U.label),
              weight: U.weight,
              ...(U.available === !1 ? { excluded: !0 } : {}),
              ...(U.id === y
                ? { backgroundColor: "#b58225", textColor: "#fff" }
                : {}),
            }));
          const B = tn.value;
          if (S && B) {
            const U = w ? R.value : [];
            return na(B.options, U).map((D) =>
              D.id === y
                ? { ...D, backgroundColor: "#b58225", textColor: "#fff" }
                : D,
            );
          }
          return [];
        }),
        ir = _(() => {
          var S;
          return `${ue.value}:${((S = Ae.value) == null ? void 0 : S.id) ?? (ze.value ? `resolved:${ze.value.poolId}` : "")}`;
        }),
        sr = _(() => {
          var S;
          return Ct.value
            ? (((S = ze.value) == null ? void 0 : S.selectedIndex) ?? null)
            : null;
        }),
        to = _(() => !!(Ct.value && o.value.history.length)),
        ar = _(() => (o.value, d.canLeaveCurrentPool())),
        on = _(() => (o.value, d.undoCost())),
        rr = _(() => _t(on.value.cost)),
        lr = _(() => _t(on.value.balance)),
        ur = _(() => _t(on.value.shortfall)),
        ft = _(() => !Th({ busy: F.value, undoing: he.value }));
      let mt,
        Et,
        no,
        oo = !1,
        ki = !1;
      function dr(S) {
        Object.assign(re, qt({ ...re, ...S }));
      }
      function ge() {
        ((fe.value = !1),
          mt !== void 0 && (window.clearTimeout(mt), (mt = void 0)));
      }
      function ht(S = !1) {
        ae.stop(S);
      }
      function cr(S) {
        ki ||
          ((ki = !0),
          (ke.value = S),
          Et !== void 0 && window.clearTimeout(Et),
          (Et = window.setTimeout(() => {
            ((ke.value = ""), (Et = void 0));
          }, 3600)));
      }
      async function io(S = !0) {
        const y = await ae.prepareForSpin();
        return (
          oo ||
            ((ye.value = y),
            S &&
              re.speech &&
              !y.languageAvailable &&
              cr("当前设备没有可用的中文语音服务，游戏仍可正常使用。")),
          y
        );
      }
      async function $i() {
        ye.value = await ae.getCapability();
      }
      async function fr() {
        if (!M.value) {
          ((M.value = !0), (Z.value = ""));
          try {
            const S = await io(!1);
            if (re.speechVolume === 0) {
              Z.value = "语音音量为 0，请调高后再测试。";
              return;
            }
            if (
              !S.supported ||
              S.platform === "unavailable" ||
              (S.platform === "android-native" && !S.languageAvailable)
            ) {
              Z.value = "当前设备没有可用的中文语音服务，游戏仍可正常使用。";
              return;
            }
            const y = await ae.testCurrentVoice();
            ((Z.value = y
              ? S.languageAvailable
                ? "已发起测试朗读。"
                : "未找到中文语音，已尝试系统默认语音。"
              : "测试朗读未能启动，游戏仍可正常使用。"),
              await $i());
          } finally {
            M.value = !1;
          }
        }
      }
      function pr() {
        ((J.value = "settings"), (Z.value = ""), $i());
      }
      function Pi(S) {
        return {
          ...S,
          name: A(S.name),
          pools: S.pools.map((y) => ({
            ...y,
            name: A(y.name),
            options: y.options.map((B) => ({
              ...B,
              text: A(B.text),
              ...(B.wheelLabel === void 0
                ? {}
                : { wheelLabel: A(B.wheelLabel) }),
            })),
          })),
        };
      }
      function mr(S) {
        const y = new Map();
        for (const B of S)
          for (const U of B.pools) {
            const D = U.canonicalId ?? `${U.timelineScope ?? B.id}:${U.id}`;
            y.has(D) || y.set(D, U);
          }
        return [...y.values()];
      }
      async function hr() {
        if (
          g &&
          b.value &&
          ((m.value = b.value.pools), (J.value = "tools"), !!g)
        )
          try {
            const S = await Promise.all(
              i.registeredPackIds().map((y) => i.load(y)),
            );
            m.value = mr(S.map((y) => Pi(y.game)));
          } catch (S) {
            C.value = `开发内容目录加载失败：${xe(S, "未知错误")}`;
          }
      }
      function Ci() {
        (p(), (J.value = "wallet"));
      }
      function gr() {
        (p(), (J.value = "intervention"));
      }
      function vr() {
        ((J.value = ""), Mi());
      }
      function br() {
        ((J.value = ""), Ni());
      }
      function yr() {
        ((J.value = ""), ro());
      }
      function wr() {
        ((J.value = ""), lo());
      }
      function Sr() {
        const S = d.resolveCheat();
        return (f(), S || (C.value = d.state.error ?? "命运干预暂时不可用"), S);
      }
      function Ir(S) {
        var B;
        const y = d.commitCheat(S);
        return (
          f(),
          y
            ? (C.value = A(
                ((B = o.value.timeline.at(-1)) == null ? void 0 : B.text) ??
                  "命运干预已提交",
              ))
            : (C.value = d.state.error ?? "命运干预提交失败"),
          y
        );
      }
      function kr() {
        const S = d.cancelCheatIntervention();
        return (f(), S);
      }
      function $r(S, y) {
        const B = d.purchaseForcedResult(S, y);
        return (
          f(),
          (C.value = B
            ? "已锁定当前流程的下次结果"
            : (d.state.error ?? "无法锁定下次结果")),
          B
        );
      }
      function Pr() {
        const S = d.undoIntervention();
        return (
          f(),
          h(),
          (C.value = S
            ? "最近一次命运干预效果已撤销（芙芙不退）"
            : (d.state.error ?? "无法撤销命运干预")),
          S
        );
      }
      function sn() {
        if (!c.value) throw new Error("内容包尚未加载");
        return c.value;
      }
      function Ei(S) {
        const y = i.loadedPack("bootstrap");
        return dn(S, {}, y ? [y] : []);
      }
      function so() {
        var B;
        const S = sn(),
          y =
            ((B = L.value) == null ? void 0 : B.contentPackId) ===
            o.value.packId
              ? Om(L.value, o.value)
              : Oa(S.manifest.id, S.manifest.version, o.value);
        return ((L.value = y), y);
      }
      function xe(S, y) {
        return A(S instanceof Error ? S.message : y);
      }
      function Li() {
        (ge(), (J.value = ""), (Je.value = !0));
      }
      function Cr() {
        F.value ||
          he.value ||
          (ge(),
          q.pause(),
          ht(!0),
          (n.value = e()),
          (W.value = ""),
          (N.value = !0));
      }
      async function ao() {
        if (F.value) return;
        if (
          (ge(),
          ht(!0),
          (W.value = ""),
          d.cancelPending(),
          n.value.trim() || (n.value = e()),
          (F.value = !0),
          !(await d.createNew(n.value.trim())) || !d.pack)
        ) {
          ((F.value = !1),
            (W.value = `内容加载失败：${d.state.error ?? "未知错误"}`));
          return;
        }
        (I(),
          h(),
          (L.value = null),
          (te.value = null),
          (ne.value = null),
          (ue.value += 1),
          (R.value = []),
          (C.value = "？？？"),
          (F.value = !1),
          (he.value = !1),
          (Q.value = !1),
          ($.value = !0),
          (N.value = !1),
          (Le.value = !1));
      }
      async function Ai(S, y, B = null) {
        if (
          (ge(),
          ht(!0),
          d.cancelPending(),
          !(await d.restore(S.packId, S)) || !d.pack)
        )
          throw new Error(d.state.error ?? "无法恢复内容包");
        const D = I();
        (h(),
          (L.value = B),
          (te.value = null),
          (ne.value = null),
          (ue.value += 1),
          (R.value = []),
          (he.value = !1),
          (Q.value = !1),
          (fe.value = !1));
        const $e = d.pool,
          nt =
            D.lastResolvedSpin &&
            (!$e || (D.awaitingAdvance && D.lastResolvedSpin.poolId === $e.id))
              ? A(D.lastResolvedSpin.result.text)
              : null;
        ((C.value = nt ?? y),
          (n.value = o.value.random.seed),
          ($.value = !0),
          (N.value = !1),
          (Le.value = !1));
      }
      function Er(S, y) {
        if (g) {
          if ((d.setForcedResult(S, y), f(), d.state.phase === "error")) {
            C.value = `锁定失败：${xe(d.state.error, "未知错误")}`;
            return;
          }
          ((R.value = []), (C.value = "已锁定当前流程的下次结果"));
        }
      }
      function Lr(S) {
        g && (d.clearForcedResult(S), f(), (C.value = "已清除当前流程锁定"));
      }
      function ro() {
        if (ft.value) {
          C.value = "转盘结算完成后才能保存";
          return;
        }
        try {
          const S = sn();
          (bs(so(), void 0, Ei(S)), (C.value = "已保存到本机"));
        } catch (S) {
          C.value = `保存失败：${xe(S, "未知错误")}`;
        }
      }
      async function lo() {
        if (ft.value || F.value) {
          ((C.value = "转盘结算完成后才能读取存档"), (W.value = C.value));
          return;
        }
        F.value = !0;
        try {
          const S = Mm();
          if (!S) {
            ((C.value = "本机还没有可读取的存档"), (W.value = C.value));
            return;
          }
          const [y, B] = await Promise.all([
              i.load(S.contentPackId),
              i.load("bootstrap"),
            ]),
            U = dn(y, {}, [B]),
            D = Zt(S, U);
          await Ai(vs(D, U), "已读取本机存档", D);
        } catch (S) {
          ((C.value = `读取失败：${xe(S, "未知错误")}`), (W.value = C.value));
        } finally {
          F.value = !1;
        }
      }
      async function Ri(S, y, B) {
        if (await Bh(S, y)) return;
        const U = document.createElement("a"),
          D = URL.createObjectURL(new Blob([y], { type: B }));
        ((U.href = D),
          (U.download = S),
          (U.style.display = "none"),
          document.body.appendChild(U),
          U.click(),
          U.remove(),
          window.setTimeout(() => URL.revokeObjectURL(D), 0));
      }
      async function Ar() {
        if (ft.value) {
          C.value = "转盘结算完成后才能导出存档";
          return;
        }
        try {
          const S = sn();
          (await Ri(
            `斗灵命途-${o.value.random.seed}.json`,
            Ma(so(), Ei(S)),
            "application/json;charset=utf-8",
          ),
            (C.value = "已生成 JSON 存档"));
        } catch (S) {
          C.value = `导出失败：${xe(S, "无法分享文件")}`;
        }
      }
      function Rr(S) {
        return new Promise((y, B) => {
          const U = new FileReader();
          ((U.onload = () => y(typeof U.result == "string" ? U.result : "")),
            (U.onerror = () => B(U.error ?? new Error("无法读取文件"))),
            U.readAsText(S, "utf-8"));
        });
      }
      async function _r(S) {
        if (ft.value || F.value) {
          C.value = "转盘结算完成后才能导入存档";
          return;
        }
        F.value = !0;
        try {
          const y = await Rr(S),
            B = No(y),
            [U, D] = await Promise.all([
              i.load(B.contentPackId),
              i.load("bootstrap"),
            ]),
            $e = dn(U, {}, [D]),
            nt = No(y, $e);
          await Ai(vs(nt, $e), "已导入 JSON 存档", nt);
        } catch (y) {
          C.value = `导入失败：${xe(y, "存档格式无效")}`;
        } finally {
          F.value = !1;
        }
      }
      async function _i(S) {
        if (ft.value) {
          C.value = "转盘结算完成后才能导出传记";
          return;
        }
        const B = S
          ? `${S ? "斗灵命途·展示版传记" : "斗灵命途·完整传记"}-${o.value.random.seed}.txt`
          : bh(o.value.random.seed);
        try {
          (await Ri(B, yh(o.value, S), "text/plain;charset=utf-8"),
            (C.value = S ? "已生成展示版传记" : "已生成完整传记"));
        } catch (U) {
          C.value = `导出失败：${xe(U, "无法分享文件")}`;
        }
      }
      function Ti() {
        F.value ||
          he.value ||
          !to.value ||
          Q.value ||
          (ge(),
          q.pause(),
          ht(!0),
          (J.value = ""),
          (Le.value = !1),
          (Q.value = !0));
      }
      function xi() {
        he.value || (Q.value = !1);
      }
      async function Oi(S = !1) {
        if (!(he.value || !Q.value || !to.value)) {
          (ge(), (he.value = !0), (Le.value = !1));
          try {
            ((te.value = null), (ne.value = null));
            const y = o.value.history.length;
            if (
              (S ? (R.value = d.undo(!0) ?? []) : ((R.value = []), d.undo()),
              o.value.history.length >= y)
            )
              throw new Error(d.state.error ?? "撤销未提交");
            (h(),
              (ue.value += 1),
              f(),
              (C.value = "？？？"),
              (Q.value = !1),
              S && (await Be(), (he.value = !1), jt("manual")));
          } catch (y) {
            C.value = `撤销失败：${xe(y, "未知错误")}`;
          } finally {
            he.value = !1;
          }
        }
      }
      function jt(S) {
        if (
          !(
            F.value ||
            he.value ||
            Q.value ||
            o.value.awaitingAdvance ||
            o.value.finished
          )
        ) {
          if (!Ae.value) {
            (ge(),
              (C.value = `无法推进：当前流程 ${o.value.currentStepId ?? "未知"} 没有可用转盘`));
            return;
          }
          (S === "manual" && ge(), io());
          try {
            if (
              d.eligibleCandidates(R.value).length === 0 &&
              d.canLeaveCurrentPool()
            ) {
              if (!d.leaveCurrentPool())
                throw Error(d.state.error ?? "无法离开当前可选流程");
              ((R.value = []),
                f(),
                (C.value = "已离开当前可选流程"),
                S === "auto" &&
                  fe.value &&
                  (mt = window.setTimeout(() => {
                    ((mt = void 0), fe.value && jt("auto"));
                  }, 1)));
              return;
            }
            const y = d.resolveSpin(R.value);
            if ((f(), !y)) throw Error(d.state.error ?? "无法确定转盘结果");
            const B = nn.value.findIndex((U) => U.id === y.id);
            if (B < 0) throw Error("引擎结果不在当前转盘中");
            ((C.value = "？？？"),
              (te.value = y),
              (ne.value = B),
              (F.value = !0));
          } catch (y) {
            (ge(),
              (C.value = `无法推进：${xe(y, "未知错误")}`),
              (F.value = !1));
          }
        }
      }
      function Mi() {
        if (fe.value) {
          ge();
          return;
        }
        F.value || o.value.finished || ((fe.value = !0), jt("auto"));
      }
      function Tr(S) {
        var B, U, D;
        if (!F.value) return;
        q.tick(S);
        const y = (B = nn.value[S]) == null ? void 0 : B.id;
        C.value =
          ((D =
            (U = tn.value) == null
              ? void 0
              : U.options.find(($e) => $e.id === y)) == null
            ? void 0
            : D.text) ?? "？？？";
      }
      function xr() {
        if (!(F.value || o.value.awaitingAdvance)) {
          if ((ge(), !d.leaveCurrentPool())) {
            (f(),
              (C.value = `无法离开：${d.state.error ?? "当前流程不能离开"}`));
            return;
          }
          ((R.value = []), (C.value = "？？？"), f());
        }
      }
      function Or() {
        if (ft.value) {
          C.value = "转盘结算完成后才能删除存档";
          return;
        }
        try {
          (Bm(), (L.value = null), (C.value = "已删除 V6 本机存档"));
        } catch (S) {
          C.value = `删除失败：${xe(S, "未知错误")}`;
        }
      }
      function Mr() {
        try {
          (Dm(), (K.value = !1), (W.value = "已清除 V5 旧存档。"));
        } catch (S) {
          W.value = `清除失败：${xe(S, "未知错误")}`;
        }
      }
      function Br(S) {
        var nt;
        if (!w || F.value || o.value.awaitingAdvance || !Ae.value) return;
        const y = (nt = nn.value[S]) == null ? void 0 : nt.id,
          B = Ae.value.options.find((uo) => uo.id === y);
        if (!B) return;
        const U = R.value.includes(B.id),
          D = U ? R.value.filter((uo) => uo !== B.id) : [...R.value, B.id],
          $e = d.candidates(D);
        if ((f(), !U && !$e.length)) {
          C.value = "至少需要保留一个可抽取选项";
          return;
        }
        ((R.value = D), (C.value = "？？？"));
      }
      async function Bi() {
        var S, y;
        if (!(F.value || he.value || Q.value || !o.value.awaitingAdvance))
          try {
            if (!(await d.advanceAsync()))
              throw new Error(d.state.error ?? "无法推进");
            (f(),
              h(),
              (R.value = []),
              o.value.finished
                ? ((C.value = A(
                    ((S = o.value.lastResolvedSpin) == null
                      ? void 0
                      : S.result.text) ??
                      ((y = o.value.character.ending) == null
                        ? void 0
                        : y.title) ??
                      "命运落幕",
                  )),
                  ge(),
                  (Le.value = !1))
                : (C.value = "？？？"));
          } catch (B) {
            (f(), ge(), (C.value = `无法进入下一流程：${xe(B, "未知错误")}`));
          }
      }
      function Nr() {
        (ge(), Bi());
      }
      function Dr(S) {
        const y = te.value;
        if (!y || ne.value !== S) return;
        const B = A(y.text),
          U = o.value.history.length;
        let D = !1;
        try {
          if (!d.commitSpin()) throw new Error(d.state.error ?? "无法提交结果");
          ((C.value = B), (D = !0));
        } catch ($e) {
          (o.value.history.length > U && d.undo(),
            d.cancelPending(),
            ge(),
            (C.value = `结果结算失败：${xe($e, "未知错误")}`));
        }
        if (
          ((te.value = null),
          (ne.value = null),
          (R.value = []),
          (F.value = !1),
          f(),
          D)
        ) {
          q.hit();
          const $e = o.value.lastResolvedSpin,
            nt = $e
              ? `${$e.poolId}:${$e.result.optionId}:${o.value.history.length}:${$e.randomCursorAfter}`
              : `${y.id}:${o.value.history.length}`;
          ae.speakCommittedResult(nt, B);
        }
        o.value.finished
          ? (ge(), (Le.value = !1))
          : fe.value &&
            (mt = window.setTimeout(
              async () => {
                ((mt = void 0),
                  fe.value &&
                    (await Bi(), fe.value && !o.value.finished && jt("auto")));
              },
              re.reducedMotion ? 1 : re.resultHoldDuration,
            ));
      }
      async function Ni() {
        var S, y;
        if (!(F.value || he.value || Q.value || o.value.finished)) {
          (ge(), io(), (F.value = !0));
          try {
            if (!(await d.runToEndAsync(1e3, R.value)))
              throw new Error(d.state.error ?? "无法极速结算");
            (h(),
              (R.value = []),
              (C.value = A(
                ((S = o.value.lastResolvedSpin) == null
                  ? void 0
                  : S.result.text) ??
                  ((y = o.value.character.ending) == null ? void 0 : y.title) ??
                  "已结算",
              )),
              (Le.value = !1),
              q.hit());
            const B = o.value.lastResolvedSpin;
            B &&
              ae.speakCommittedResult(
                `${B.poolId}:${B.result.optionId}:${o.value.history.length}:${B.randomCursorAfter}`,
                A(B.result.text),
              );
          } catch (B) {
            C.value = `无法极速结算：${xe(B, "未知错误")}`;
          } finally {
            ((F.value = !1), f());
          }
        }
      }
      function Di() {
        document.hidden && (ge(), q.pause(), ht());
      }
      function Fr() {
        if (Je.value) return ((Je.value = !1), !0);
        const S = xh({
          undoOpen: Q.value,
          endingOpen: Le.value,
          drawerOpen: !!J.value,
          startOpen: N.value,
          hasStartedGame: $.value,
        });
        return S === "undo"
          ? (xi(), !0)
          : S === "ending"
            ? ((Le.value = !1), !0)
            : S === "drawer"
              ? ((J.value = ""), !0)
              : S === "start"
                ? ((N.value = !1), !0)
                : !1;
      }
      function Vr() {
        if ((ge(), q.pause(), ht(), $.value && !F.value))
          try {
            ro();
          } catch {}
      }
      return (
        Qt(() => {
          (Ph(),
            (K.value = Nm()),
            document.addEventListener("visibilitychange", Di),
            Oh({ onBackButton: Fr, onPause: Vr })
              .then((S) => {
                oo ? S().catch(() => {}) : (no = S);
              })
              .catch(() => {}));
        }),
        zn(() => {
          ((oo = !0),
            ge(),
            Et !== void 0 && window.clearTimeout(Et),
            no && no().catch(() => {}),
            $t == null || $t(),
            k(),
            q.dispose(),
            ae.dispose(),
            document.removeEventListener("visibilitychange", Di));
        }),
        Ee(o, () => {
          if (!(!$.value || F.value))
            try {
              const S = sn();
              bs(so(), void 0, dn(S));
            } catch {}
        }),
        Ee(re, () => Ih(re), { deep: !0 }),
        Ee(
          () => [re.speech, re.speechVolume],
          ([S, y]) => {
            (!S || y === 0) && ht();
          },
        ),
        (S, y) => {
          var B, U;
          return (
            P(),
            E(
              me,
              null,
              [
                $.value
                  ? (P(),
                    E("main", Xh, [
                      r("header", Zh, [
                        r("div", eg, [
                          y[28] ||
                            (y[28] = r(
                              "span",
                              { class: "brand-seal" },
                              "命",
                              -1,
                            )),
                          r("div", null, [
                            y[27] || (y[27] = r("b", null, "斗灵命途", -1)),
                            r(
                              "small",
                              null,
                              "当前命运 · " + v(o.value.random.seed),
                              1,
                            ),
                          ]),
                        ]),
                        r(
                          "button",
                          {
                            class: "more-trigger",
                            type: "button",
                            "data-menu-trigger": "more",
                            "aria-label": "打开更多菜单",
                            onClick: y[0] || (y[0] = (D) => (J.value = "more")),
                          },
                          "更多",
                        ),
                      ]),
                      Se(
                        hu,
                        {
                          character: o.value.character,
                          "state-revision": u.value,
                          "fufu-hundredths": a.value,
                          onWallet: Ci,
                        },
                        null,
                        8,
                        ["character", "state-revision", "fufu-hundredths"],
                      ),
                      o.value.character.flags.routeSelected
                        ? O("", !0)
                        : (P(),
                          E(
                            "p",
                            tg,
                            "人类或魂兽、世界线与时期，均由转盘决定。",
                          )),
                      r("section", ng, [
                        Se(al, { title: nr.value }, null, 8, ["title"]),
                        Se(ll, { text: C.value, spinning: F.value }, null, 8, [
                          "text",
                          "spinning",
                        ]),
                      ]),
                      r("section", og, [
                        Se(
                          Qo,
                          {
                            items: nn.value,
                            "wheel-key": ir.value,
                            "target-index": ne.value,
                            "resting-index": sr.value,
                            duration: re.wheelDuration,
                            disabled:
                              F.value || o.value.awaitingAdvance || !Ae.value,
                            "item-toggle-enabled": V(w),
                            "reduced-motion": re.reducedMotion,
                            onItemToggle: Br,
                            onSpinStart:
                              y[1] || (y[1] = (D) => V(q).beginSpin()),
                            onTick: Tr,
                            onSpinEnd: Dr,
                          },
                          null,
                          8,
                          [
                            "items",
                            "wheel-key",
                            "target-index",
                            "resting-index",
                            "duration",
                            "disabled",
                            "item-toggle-enabled",
                            "reduced-motion",
                          ],
                        ),
                        V(w) &&
                        Ae.value &&
                        !o.value.awaitingAdvance &&
                        R.value.length
                          ? (P(),
                            E(
                              "p",
                              ig,
                              "已排除 " + v(R.value.length) + " 项",
                              1,
                            ))
                          : Ct.value
                            ? (P(),
                              E("p", sg, "结果已确定，可查看、撤销或继续"))
                            : O("", !0),
                      ]),
                      Se(
                        Pu,
                        {
                          busy: F.value || he.value,
                          finished: o.value.finished,
                          "result-committed": Ct.value,
                          "can-advance": o.value.awaitingAdvance,
                          "has-undo": to.value,
                          "auto-active": fe.value,
                          "can-leave": ar.value,
                          onManual: y[2] || (y[2] = (D) => jt("manual")),
                          onAuto: Mi,
                          onFast: Ni,
                          onLeave: xr,
                          onUndo: Ti,
                          onAdvance: Nr,
                          onEnding: y[3] || (y[3] = (D) => (Le.value = !0)),
                        },
                        null,
                        8,
                        [
                          "busy",
                          "finished",
                          "result-committed",
                          "can-advance",
                          "has-undo",
                          "auto-active",
                          "can-leave",
                        ],
                      ),
                      ke.value ? (P(), E("p", ag, v(ke.value), 1)) : O("", !0),
                      Se(
                        kf,
                        {
                          open: J.value === "more",
                          busy: F.value || he.value || ft.value,
                          "auto-active": fe.value,
                          "fufu-label": er.value,
                          "development-mode": V(g),
                          version: V(Cn),
                          onClose: y[4] || (y[4] = (D) => (J.value = "")),
                          onNewFate:
                            y[5] ||
                            (y[5] = (D) => {
                              ((J.value = ""), Cr());
                            }),
                          onCharacter:
                            y[6] || (y[6] = (D) => (J.value = "character")),
                          onTimeline:
                            y[7] || (y[7] = (D) => (J.value = "timeline")),
                          onWallet: Ci,
                          onIntervention: gr,
                          onToggleAuto: vr,
                          onFast: br,
                          onSettings: pr,
                          onSave: yr,
                          onLoad: wr,
                          onData: y[8] || (y[8] = (D) => (J.value = "save")),
                          onAbout: y[9] || (y[9] = (D) => (J.value = "about")),
                          onDevelopment: hr,
                        },
                        null,
                        8,
                        [
                          "open",
                          "busy",
                          "auto-active",
                          "fufu-label",
                          "development-mode",
                          "version",
                        ],
                      ),
                      Se(
                        Rf,
                        {
                          open: J.value === "wallet",
                          "run-copper":
                            ((B = o.value.character.wallet) == null
                              ? void 0
                              : B.copper) ?? 0,
                          "fufu-hundredths": a.value,
                          "run-transactions":
                            ((U = o.value.character.wallet) == null
                              ? void 0
                              : U.transactions) ?? [],
                          "fufu-transactions": l.value,
                          onClose: y[10] || (y[10] = (D) => (J.value = "")),
                        },
                        null,
                        8,
                        [
                          "open",
                          "run-copper",
                          "fufu-hundredths",
                          "run-transactions",
                          "fufu-transactions",
                        ],
                      ),
                      Se(
                        qf,
                        {
                          open: J.value === "intervention",
                          "balance-hundredths": a.value,
                          "cheat-pool": Xa.value,
                          "current-pool": Pt.value,
                          "available-option-ids": Ii.value,
                          "forced-option-id": Pt.value
                            ? o.value.forcedResults[Pt.value.id]
                            : void 0,
                          "wheel-duration": re.wheelDuration,
                          "reduced-motion": re.reducedMotion,
                          "resolve-draw": Sr,
                          "commit-draw": Ir,
                          "cancel-draw": kr,
                          "purchase-forced-result": $r,
                          "can-undo-intervention": Za.value,
                          "undo-intervention": Pr,
                          onClose: y[11] || (y[11] = (D) => (J.value = "")),
                          onChanged: f,
                        },
                        null,
                        8,
                        [
                          "open",
                          "balance-hundredths",
                          "cheat-pool",
                          "current-pool",
                          "available-option-ids",
                          "forced-option-id",
                          "wheel-duration",
                          "reduced-motion",
                          "can-undo-intervention",
                        ],
                      ),
                      Se(
                        Kf,
                        {
                          open: J.value === "about",
                          version: V(Cn),
                          onClose: y[12] || (y[12] = (D) => (J.value = "")),
                          onAntiResale: Li,
                        },
                        null,
                        8,
                        ["open", "version"],
                      ),
                      Se(
                        pd,
                        {
                          open: J.value === "settings",
                          settings: re,
                          "speech-capability": ye.value,
                          "speech-testing": M.value,
                          "speech-message": Z.value,
                          onClose: y[13] || (y[13] = (D) => (J.value = "")),
                          onUpdate: dr,
                          onTestSpeech: fr,
                          onOpenAntiResale: Li,
                        },
                        null,
                        8,
                        [
                          "open",
                          "settings",
                          "speech-capability",
                          "speech-testing",
                          "speech-message",
                        ],
                      ),
                      Se(
                        Nd,
                        {
                          open: J.value === "character",
                          character: o.value.character,
                          "state-revision": u.value,
                          onClose: y[14] || (y[14] = (D) => (J.value = "")),
                        },
                        null,
                        8,
                        ["open", "character", "state-revision"],
                      ),
                      Se(
                        Yd,
                        {
                          open: J.value === "timeline",
                          items: o.value.timeline,
                          onClose: y[15] || (y[15] = (D) => (J.value = "")),
                        },
                        null,
                        8,
                        ["open", "items"],
                      ),
                      Se(
                        pc,
                        {
                          open: J.value === "save",
                          game: o.value,
                          locked: ft.value,
                          onClose: y[16] || (y[16] = (D) => (J.value = "")),
                          onSave: ro,
                          onLoad: lo,
                          onDeleteSave: Or,
                          onUndo: Ti,
                          onExportJson: Ar,
                          onImportJson: _r,
                          onExportChronicle: _i,
                        },
                        null,
                        8,
                        ["open", "game", "locked"],
                      ),
                      V(g) && b.value
                        ? (P(),
                          Ge(
                            Qc,
                            {
                              key: 2,
                              open: J.value === "tools",
                              pack: b.value,
                              "catalog-pools": m.value,
                              "world-era": o.value.worldEra,
                              "development-mode": V(g),
                              "current-pool": Pt.value,
                              "available-option-ids": Ii.value,
                              "forced-option-id": Pt.value
                                ? o.value.forcedResults[Pt.value.id]
                                : void 0,
                              "wheel-duration": re.wheelDuration,
                              "reduced-motion": re.reducedMotion,
                              onClose: y[17] || (y[17] = (D) => (J.value = "")),
                              onForce: Er,
                              onClearForce: Lr,
                            },
                            null,
                            8,
                            [
                              "open",
                              "pack",
                              "catalog-pools",
                              "world-era",
                              "development-mode",
                              "current-pool",
                              "available-option-ids",
                              "forced-option-id",
                              "wheel-duration",
                              "reduced-motion",
                            ],
                          ))
                        : O("", !0),
                      Le.value && o.value.finished
                        ? (P(),
                          Ge(
                            np,
                            {
                              key: 3,
                              game: o.value,
                              onClose:
                                y[18] || (y[18] = (D) => (Le.value = !1)),
                              onExportBiography:
                                y[19] || (y[19] = (D) => _i(!1)),
                            },
                            null,
                            8,
                            ["game"],
                          ))
                        : O("", !0),
                      Se(
                        dp,
                        {
                          open: Q.value,
                          busy: he.value,
                          affordable: on.value.affordable,
                          "cost-label": rr.value,
                          "balance-label": lr.value,
                          "shortfall-label": ur.value,
                          onUndo: y[20] || (y[20] = (D) => Oi(!1)),
                          onReroll: y[21] || (y[21] = (D) => Oi(!0)),
                          onCancel: xi,
                        },
                        null,
                        8,
                        [
                          "open",
                          "busy",
                          "affordable",
                          "cost-label",
                          "balance-label",
                          "shortfall-label",
                        ],
                      ),
                      Je.value
                        ? (P(),
                          Ge(da, {
                            key: 4,
                            "allow-close": "",
                            onConfirm:
                              y[22] || (y[22] = (D) => (Je.value = !1)),
                            onClose: y[23] || (y[23] = (D) => (Je.value = !1)),
                          }))
                        : O("", !0),
                    ]))
                  : O("", !0),
                N.value
                  ? (P(),
                    E("div", rg, [
                      r("section", lg, [
                        y[30] ||
                          (y[30] = r(
                            "span",
                            { class: "start-mark" },
                            "命",
                            -1,
                          )),
                        y[31] || (y[31] = r("h1", null, "开启一段新命运", -1)),
                        y[32] ||
                          (y[32] = r(
                            "p",
                            null,
                            "命运由转盘决定：种族、世界线与穿越时期将在旅程中逐一揭晓。",
                            -1,
                          )),
                        K.value ? (P(), E("p", ug, v(V(em)), 1)) : O("", !0),
                        K.value
                          ? (P(),
                            E("div", dg, [
                              r(
                                "button",
                                {
                                  class: "seed-button",
                                  type: "button",
                                  disabled: F.value,
                                  onClick: Mr,
                                },
                                "清除旧存档",
                                8,
                                cg,
                              ),
                              r(
                                "button",
                                {
                                  class: "seed-button",
                                  type: "button",
                                  disabled: F.value,
                                  onClick: ao,
                                },
                                "保留旧存档但不读取",
                                8,
                                fg,
                              ),
                            ]))
                          : O("", !0),
                        r("label", null, [
                          y[29] || (y[29] = _e("命运种子")),
                          Ze(
                            r(
                              "input",
                              {
                                "onUpdate:modelValue":
                                  y[24] || (y[24] = (D) => (n.value = D)),
                                disabled: F.value,
                                autocomplete: "off",
                                onKeyup: Bs(ao, ["enter"]),
                              },
                              null,
                              40,
                              pg,
                            ),
                            [[Ho, n.value]],
                          ),
                        ]),
                        r(
                          "button",
                          {
                            class: "seed-button",
                            type: "button",
                            disabled: F.value,
                            onClick: y[25] || (y[25] = (D) => (n.value = e())),
                          },
                          "随机生成",
                          8,
                          mg,
                        ),
                        r(
                          "button",
                          {
                            class: "start-button",
                            type: "button",
                            disabled: F.value,
                            onClick: ao,
                          },
                          "开启新命运",
                          8,
                          hg,
                        ),
                        r(
                          "button",
                          {
                            class: "seed-button",
                            type: "button",
                            disabled: F.value,
                            onClick: lo,
                          },
                          "读取本机存档",
                          8,
                          gg,
                        ),
                        W.value ? (P(), E("p", vg, v(W.value), 1)) : O("", !0),
                        $.value
                          ? (P(),
                            E(
                              "button",
                              {
                                key: 3,
                                class: "cancel-button",
                                type: "button",
                                disabled: F.value,
                                onClick:
                                  y[26] || (y[26] = (D) => (N.value = !1)),
                              },
                              "返回当前命运",
                              8,
                              bg,
                            ))
                          : O("", !0),
                      ]),
                    ]))
                  : O("", !0),
              ],
              64,
            )
          );
        }
      );
    },
  }),
  xs = 1,
  Vn = 1,
  Ha = "douluo-v5-local-notices";
function en() {
  try {
    return typeof localStorage > "u" ? void 0 : localStorage;
  } catch {
    return;
  }
}
function Os(t) {
  return typeof t == "number" && Number.isInteger(t) && t >= 0 ? t : 0;
}
function mi(t, e) {
  return Number.isInteger(t) && t > 0 ? t : e;
}
function In(t) {
  const e = t && typeof t == "object" ? t : {};
  return {
    privacyAcceptedVersion: Os(e.privacyAcceptedVersion),
    antiResaleNoticeVersion: Os(e.antiResaleNoticeVersion),
  };
}
function hi(t = en()) {
  if (!t) return In(void 0);
  try {
    const e = t.getItem(Ha);
    return In(e ? JSON.parse(e) : void 0);
  } catch {
    return In(void 0);
  }
}
function Ya(t, e = en()) {
  const n = In(t);
  try {
    e == null || e.setItem(Ha, JSON.stringify(n));
  } catch {}
  return n;
}
function wg(t = en(), e = Vn) {
  const n = mi(e, Vn);
  return hi(t).antiResaleNoticeVersion >= n;
}
function Ms(t = en(), e = xs) {
  const n = hi(t);
  return Ya({ ...n, privacyAcceptedVersion: mi(e, xs) }, t);
}
function Sg(t = en(), e = Vn) {
  const n = hi(t);
  return Ya({ ...n, antiResaleNoticeVersion: mi(e, Vn) }, t);
}
const Ka = "douluo-v5-disclaimer-consent",
  Ja = "2026-07-17",
  Qa = "2026-07-17";
function gi() {
  try {
    return typeof localStorage > "u" ? void 0 : localStorage;
  } catch {
    return;
  }
}
function vi() {
  try {
    if (typeof crypto < "u" && typeof crypto.randomUUID == "function")
      return crypto.randomUUID();
  } catch {}
  return `browser-${Date.now().toString(36)}`;
}
function qo(t) {
  return {
    browserId: t(),
    acceptedVersion: null,
    acceptedAuthorNoteVersion: null,
  };
}
function Ig(t, e) {
  if (!t || typeof t != "object") return qo(e);
  const n = t;
  return {
    browserId:
      typeof n.browserId == "string" && n.browserId.trim() ? n.browserId : e(),
    acceptedVersion:
      typeof n.acceptedVersion == "string" ? n.acceptedVersion : null,
    acceptedAuthorNoteVersion:
      typeof n.acceptedAuthorNoteVersion == "string"
        ? n.acceptedAuthorNoteVersion
        : null,
  };
}
function bi(t) {
  return {
    browserId: t.browserId,
    accepted: t.acceptedVersion === Ja,
    authorNoteAccepted: t.acceptedAuthorNoteVersion === Qa,
  };
}
function yi(t, e) {
  if (!t) return qo(e);
  try {
    const n = t.getItem(Ka);
    return Ig(n ? JSON.parse(n) : void 0, e);
  } catch {
    return qo(e);
  }
}
function wi(t, e) {
  try {
    t == null || t.setItem(Ka, JSON.stringify(e));
  } catch {}
}
function kg(t = gi(), e = vi) {
  const n = yi(t, e);
  return (wi(t, n), bi(n));
}
function $g(t = gi(), e = vi) {
  const n = yi(t, e),
    o = {
      browserId: n.browserId,
      acceptedVersion: Ja,
      acceptedAuthorNoteVersion: n.acceptedAuthorNoteVersion,
    };
  return (wi(t, o), bi(o));
}
function Pg(t = gi(), e = vi) {
  const n = yi(t, e),
    o = {
      browserId: n.browserId,
      acceptedVersion: n.acceptedVersion,
      acceptedAuthorNoteVersion: Qa,
    };
  return (wi(t, o), bi(o));
}
function Cg(t) {
  return t.disclaimerAccepted
    ? t.antiResaleNoticeAccepted
      ? t.authorNoteAccepted
        ? "game"
        : "author-note"
      : "anti-resale"
    : "disclaimer";
}
const Eg = ["aria-label"],
  Lg = de({
    __name: "App",
    setup(t) {
      const e = kg(),
        n = T(e.accepted),
        o = T(e.authorNoteAccepted),
        i = T(wg());
      e.accepted && Ms();
      const s = _(() =>
        Cg({
          disclaimerAccepted: n.value,
          antiResaleNoticeAccepted: i.value,
          authorNoteAccepted: o.value,
        }),
      );
      function a() {
        ((n.value = $g().accepted), n.value && Ms());
      }
      function l() {
        (Sg(), (i.value = !0));
      }
      function u() {
        o.value = Pg().authorNoteAccepted;
      }
      return (d, p) => (
        P(),
        E(
          me,
          null,
          [
            s.value === "disclaimer"
              ? (P(), Ge(il, { key: 0, onContinue: a }))
              : s.value === "anti-resale"
                ? (P(), Ge(da, { key: 1, onConfirm: l }))
                : s.value === "author-note"
                  ? (P(), Ge(Jr, { key: 2, onContinue: u }))
                  : s.value === "game"
                    ? (P(), Ge(yg, { key: 3 }))
                    : O("", !0),
            s.value !== "game"
              ? (P(),
                E(
                  "small",
                  {
                    key: 4,
                    class: "app-version-label",
                    "aria-label": `当前版本 ${V(Cn)}`,
                  },
                  v(V(Cn)),
                  9,
                  Eg,
                ))
              : O("", !0),
          ],
          64,
        )
      );
    },
  }),
  qg = Object.freeze(
    Object.defineProperty(
      { __proto__: null, default: Lg },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  );
export {
  To as A,
  Xo as B,
  Ln as C,
  nu as D,
  Jo as E,
  ko as F,
  Ve as G,
  Vg as H,
  Xl as I,
  Ql as J,
  bt as K,
  jg as L,
  zo as M,
  qg as N,
  Kt as a,
  Tg as b,
  za as c,
  Fm as d,
  Qs as e,
  Bg as f,
  xg as g,
  Ng as h,
  Dg as i,
  Fg as j,
  lt as k,
  Yt as l,
  Xs as m,
  yd as n,
  Wm as o,
  ou as p,
  So as q,
  pa as r,
  Rg as s,
  Og as t,
  Mg as u,
  Wg as v,
  Ug as w,
  Gt as x,
  _g as y,
  zg as z,
};
