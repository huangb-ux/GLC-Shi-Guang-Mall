/* ============================================================
   拾光集 · 手绘插画与图标
   统一 400×300 画布、圆头线条、柔和的纸张配色
   ============================================================ */
(function () {
  'use strict';

  const P = {
    sage:   { bg: '#E8EEE4', soft: '#D4E1CC', deep: '#2C4A38', mid: '#8FAE95', light: '#F7FAF3', accent: '#D9542B' },
    peach:  { bg: '#F9E7DB', soft: '#F2D3C0', deep: '#5C3423', mid: '#D9A88D', light: '#FDF5EF', accent: '#1F6B4E' },
    butter: { bg: '#F8EFD3', soft: '#F0E0B0', deep: '#514018', mid: '#CBB26A', light: '#FCF8EA', accent: '#1F5A45' },
    sky:    { bg: '#E1EBF0', soft: '#CBDDE5', deep: '#24414D', mid: '#8FB2C1', light: '#F5FAFC', accent: '#D9542B' },
    lilac:  { bg: '#EBE4F0', soft: '#DBD0E3', deep: '#3C2C48', mid: '#B4A1C4', light: '#F9F5FB', accent: '#C4552D' },
    clay:   { bg: '#F1E0D7', soft: '#E5C9BA', deep: '#4B2D22', mid: '#C79C86', light: '#FBF4EE', accent: '#1F5A45' },
    mint:   { bg: '#E0EFE8', soft: '#C8E2D6', deep: '#1F4438', mid: '#8AB8A5', light: '#F3FAF6', accent: '#D9542B' },
    rose:   { bg: '#F7E6E4', soft: '#EFD0CD', deep: '#522C2A', mid: '#D0A09B', light: '#FCF5F4', accent: '#1F5A45' }
  };

  let seq = 0;

  function spokes(cx, cy, r, n) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n;
      out += `<line x1="${cx}" y1="${cy}" x2="${(cx + r * Math.cos(a)).toFixed(1)}" y2="${(cy + r * Math.sin(a)).toFixed(1)}"/>`;
    }
    return out;
  }

  const ART = {
    /* 山地车 */
    bike(p) {
      return `
      <g fill="none" stroke="${p.deep}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="118" cy="206" r="52" stroke-width="8"/>
        <circle cx="286" cy="206" r="52" stroke-width="8"/>
        <g stroke-width="2" opacity=".55">${spokes(118, 206, 44, 8)}${spokes(286, 206, 44, 8)}</g>
        <circle cx="118" cy="206" r="21" opacity=".28" stroke-dasharray="4 5"/>
        <circle cx="286" cy="206" r="7" fill="${p.deep}"/>
        <circle cx="118" cy="206" r="7" fill="${p.deep}"/>
      </g>
      <g fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M118 206 L162 132 L252 128 L202 206 L118 206"/>
        <path d="M162 132 L202 206"/>
        <path d="M252 128 L286 206"/>
      </g>
      <g fill="none" stroke="${p.deep}" stroke-width="7" stroke-linecap="round">
        <path d="M162 132 L160 116"/>
        <path d="M142 113 L180 111" stroke-width="10"/>
        <path d="M252 128 L258 108 L272 104"/>
        <path d="M202 206 L214 220 L228 220" stroke-width="6"/>
      </g>
      <circle cx="202" cy="206" r="13" fill="${p.light}" stroke="${p.deep}" stroke-width="4"/>
      <circle cx="202" cy="206" r="4" fill="${p.accent}"/>
      <circle cx="258" cy="106" r="5" fill="${p.accent}"/>
      <path d="M202 206 C176 216 150 214 132 206" fill="none" stroke="${p.deep}" stroke-width="2" stroke-dasharray="3 4" opacity=".6"/>`;
    },

    /* 降噪耳机 */
    headphones(p) {
      return `
      <path d="M110 160v-18c0-68 180-68 180 0v18" fill="none" stroke="${p.deep}" stroke-width="14" stroke-linecap="round"/>
      <path d="M124 152c4-48 148-48 152 0" fill="none" stroke="${p.light}" stroke-width="4" opacity=".35"/>
      <rect x="84" y="148" width="62" height="104" rx="30" fill="${p.deep}"/>
      <rect x="254" y="148" width="62" height="104" rx="30" fill="${p.deep}"/>
      <rect x="96" y="162" width="38" height="76" rx="19" fill="${p.accent}"/>
      <rect x="266" y="162" width="38" height="76" rx="19" fill="${p.accent}"/>
      <path d="M106 174c0-8 6-14 14-14" fill="none" stroke="${p.light}" stroke-width="4" opacity=".5" stroke-linecap="round"/>
      <path d="M276 174c0-8 6-14 14-14" fill="none" stroke="${p.light}" stroke-width="4" opacity=".5" stroke-linecap="round"/>
      <circle cx="115" cy="200" r="4" fill="${p.light}" opacity=".55"/>
      <circle cx="115" cy="216" r="4" fill="${p.light}" opacity=".3"/>
      <path d="M316 124c24 10 26 34 10 48c-10 9-10 20-2 30" fill="none" stroke="${p.deep}" stroke-width="4" stroke-linecap="round" opacity=".55"/>`;
    },

    /* 书堆 */
    books(p) {
      return `
      <g transform="rotate(-3 200 180)">
        <rect x="82" y="204" width="232" height="46" rx="5" fill="${p.deep}"/>
        <rect x="300" y="210" width="18" height="34" rx="3" fill="${p.light}"/>
        <path d="M104 204v46M120 204v46" stroke="${p.mid}" stroke-width="3" opacity=".45"/>
        <rect x="104" y="220" width="88" height="7" rx="3" fill="${p.light}" opacity=".7"/>
        <rect x="104" y="234" width="52" height="5" rx="2" fill="${p.light}" opacity=".35"/>

        <rect x="98" y="158" width="200" height="46" rx="5" fill="${p.accent}"/>
        <rect x="284" y="164" width="18" height="34" rx="3" fill="${p.light}"/>
        <rect x="118" y="174" width="74" height="7" rx="3" fill="${p.light}" opacity=".75"/>
        <rect x="118" y="188" width="44" height="4" rx="2" fill="${p.light}" opacity=".4"/>

        <rect x="116" y="112" width="176" height="46" rx="5" fill="${p.mid}"/>
        <rect x="278" y="118" width="18" height="34" rx="3" fill="${p.light}"/>
        <rect x="134" y="128" width="66" height="7" rx="3" fill="${p.deep}" opacity=".55"/>
        <rect x="134" y="142" width="38" height="4" rx="2" fill="${p.deep}" opacity=".3"/>
        <path d="M244 112v44l-12-8-12 8v-44" fill="${p.deep}" opacity=".7"/>
      </g>
      <path d="M236 92c10-8 22-10 34-8" fill="none" stroke="${p.accent}" stroke-width="3" stroke-dasharray="2 5" stroke-linecap="round" opacity=".7"/>`;
    },

    /* 黄铜台灯 */
    lamp(p) {
      return `
      <path d="M250 172 L214 254 L330 254 L318 158 Z" fill="${p.light}" opacity=".55"/>
      <path d="M144 254h132" stroke="${p.deep}" stroke-width="4" stroke-linecap="round" opacity=".28"/>
      <ellipse cx="188" cy="248" rx="62" ry="12" fill="${p.deep}"/>
      <ellipse cx="188" cy="244" rx="52" ry="8" fill="${p.mid}" opacity=".55"/>
      <path d="M188 240 L188 182 L244 140" fill="none" stroke="${p.deep}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="188" cy="182" r="7" fill="${p.accent}"/>
      <path d="M226 120 L292 96 L318 154 L250 176 Z" fill="${p.accent}"/>
      <path d="M250 176 L318 154 L314 164 L254 184 Z" fill="${p.deep}" opacity=".28"/>
      <path d="M240 132 L290 114" stroke="${p.light}" stroke-width="5" stroke-linecap="round" opacity=".55"/>
      <path d="M188 240c0-22-26-28-26-50" fill="none" stroke="${p.deep}" stroke-width="3" stroke-dasharray="2 5" opacity=".55"/>
      <circle cx="306" cy="112" r="4" fill="${p.light}" opacity=".7"/>`;
    },

    /* 微单相机 */
    camera(p) {
      return `
      <rect x="88" y="120" width="224" height="132" rx="22" fill="${p.deep}"/>
      <rect x="122" y="102" width="120" height="30" rx="10" fill="${p.deep}"/>
      <rect x="104" y="132" width="36" height="108" rx="12" fill="${p.mid}" opacity=".5"/>
      <path d="M88 168h224" stroke="${p.light}" stroke-width="2" opacity=".12"/>
      <circle cx="202" cy="186" r="54" fill="${p.mid}"/>
      <circle cx="202" cy="186" r="40" fill="${p.deep}"/>
      <circle cx="202" cy="186" r="23" fill="${p.light}" opacity=".9"/>
      <circle cx="202" cy="186" r="14" fill="${p.deep}" opacity=".75"/>
      <circle cx="191" cy="175" r="7" fill="#FFFFFF" opacity=".9"/>
      <circle cx="278" cy="112" r="9" fill="${p.accent}"/>
      <rect x="244" y="100" width="36" height="16" rx="7" fill="${p.mid}"/>
      <circle cx="124" cy="110" r="6" fill="${p.accent}"/>
      <path d="M108 230h54" stroke="${p.light}" stroke-width="5" stroke-linecap="round" opacity=".18"/>
      <circle cx="292" cy="230" r="4" fill="${p.light}" opacity=".5"/>`;
    },

    /* 民谣吉他 */
    guitar(p) {
      return `
      <g transform="rotate(-18 200 168)">
        <rect x="189" y="30" width="22" height="120" rx="4" fill="${p.mid}"/>
        <rect x="179" y="8" width="42" height="38" rx="8" fill="${p.deep}"/>
        <circle cx="172" cy="18" r="4" fill="${p.accent}"/><circle cx="172" cy="34" r="4" fill="${p.accent}"/>
        <circle cx="228" cy="18" r="4" fill="${p.accent}"/><circle cx="228" cy="34" r="4" fill="${p.accent}"/>
        <path d="M200 126 C168 126 146 148 146 172 C146 190 160 198 153 211 C145 230 168 246 200 246 C232 246 255 230 247 211 C240 198 254 190 254 172 C254 148 232 126 200 126 Z" fill="${p.accent}" stroke="${p.deep}" stroke-width="5" stroke-linejoin="round"/>
        <circle cx="200" cy="194" r="21" fill="${p.deep}"/>
        <circle cx="200" cy="194" r="15" fill="${p.bg}" opacity=".35"/>
        <rect x="174" y="224" width="52" height="9" rx="4" fill="${p.deep}"/>
        <path d="M192 30 L192 228 M208 30 L208 228" stroke="${p.light}" stroke-width="2" opacity=".55"/>
        <path d="M150 206 C150 226 176 236 200 236" fill="none" stroke="${p.light}" stroke-width="2" opacity=".3"/>
        <path d="M244 156c10 12 12 26 6 38" fill="none" stroke="${p.deep}" stroke-width="3" opacity=".35"/>
      </g>`;
    },

    /* 折叠小桌板 */
    desk(p) {
      return `
      <g transform="rotate(-3 200 185)">
        <path d="M78 174 L318 154 L330 198 L88 222 Z" fill="${p.mid}" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M88 222 L330 198 L326 212 L82 236 Z" fill="${p.deep}" opacity=".82"/>
        <path d="M78 174 L318 154" stroke="${p.light}" stroke-width="4" opacity=".35"/>
        <g stroke="${p.deep}" stroke-width="6" stroke-linecap="round">
          <path d="M112 232 L94 264"/><path d="M150 226 L134 258"/>
          <path d="M300 206 L316 242"/><path d="M266 210 L280 246"/>
        </g>
        <g transform="rotate(7 200 174)">
          <rect x="164" y="146" width="72" height="24" rx="2" fill="${p.light}"/>
          <rect x="164" y="146" width="72" height="6" rx="2" fill="${p.accent}" opacity=".8"/>
          <path d="M172 160h34" stroke="${p.deep}" stroke-width="2" opacity=".3"/>
        </g>
        <ellipse cx="258" cy="166" rx="15" ry="5" fill="${p.deep}" opacity=".25"/>
        <path d="M244 144h28l-4 22h-20z" fill="${p.accent}" stroke="${p.deep}" stroke-width="2.5"/>
        <path d="M272 148c8 0 8 12 0 12" fill="none" stroke="${p.deep}" stroke-width="3"/>
        <path d="M252 138c-3-6 3-8 0-13M260 138c-3-6 3-8 0-13" fill="none" stroke="${p.light}" stroke-width="2" opacity=".7" stroke-linecap="round"/>
      </g>`;
    },

    /* 运动鞋 */
    sneaker(p) {
      return `
      <path d="M70 206 C72 230 94 244 134 244 L304 244 C328 244 334 226 322 214 C306 196 288 196 268 200 L186 208 C144 212 94 194 70 206 Z" fill="${p.deep}"/>
      <path d="M80 208 C88 182 106 170 136 166 L204 156 C224 152 240 140 252 122 C260 110 276 108 288 118 C302 132 312 166 310 192 C276 204 230 212 176 212 C132 212 100 216 80 208 Z" fill="${p.accent}"/>
      <path d="M80 208 C100 216 140 214 176 210 L310 192 L310 204 C276 214 220 220 172 218 C132 218 98 216 76 206 Z" fill="${p.deep}" opacity=".22"/>
      <path d="M252 122 C266 132 278 154 286 178" fill="none" stroke="${p.light}" stroke-width="7" opacity=".55" stroke-linecap="round"/>
      <g stroke="${p.light}" stroke-width="4" stroke-linecap="round" opacity=".85">
        <path d="M212 162 L236 152"/><path d="M219 172 L243 162"/><path d="M226 182 L250 172"/>
      </g>
      <g fill="${p.deep}">
        <circle cx="214" cy="158" r="2.5"/><circle cx="221" cy="168" r="2.5"/><circle cx="228" cy="178" r="2.5"/>
      </g>
      <path d="M72 218 C120 230 200 228 310 208" fill="none" stroke="${p.light}" stroke-width="2" stroke-dasharray="4 5" opacity=".55"/>
      <rect x="282" y="156" width="18" height="9" rx="4" fill="${p.light}" opacity=".7" transform="rotate(-14 291 160)"/>`;
    },

    /* 平板 + 键盘 */
    tablet(p) {
      return `
      <rect x="108" y="48" width="184" height="184" rx="18" fill="${p.deep}"/>
      <rect x="120" y="60" width="160" height="160" rx="9" fill="${p.soft}"/>
      <circle cx="248" cy="94" r="20" fill="${p.accent}" opacity=".9"/>
      <path d="M120 192 L166 142 L202 180 L230 154 L280 200 V220 H120 Z" fill="${p.mid}" opacity=".8"/>
      <path d="M120 206 L164 172 L204 202 L244 174 L280 200 V220 H120 Z" fill="${p.deep}" opacity=".45"/>
      <path d="M120 60h160" stroke="${p.light}" stroke-width="2" opacity=".2"/>
      <circle cx="200" cy="52" r="2" fill="${p.light}" opacity=".5"/>
      <rect x="96" y="232" width="208" height="38" rx="10" fill="${p.mid}" stroke="${p.deep}" stroke-width="3"/>
      <g stroke="${p.deep}" stroke-width="2" opacity=".55">
        <path d="M112 244h44M164 244h44M216 244h44M268 244h20"/>
        <path d="M122 256h34M164 256h44M216 256h44M268 256h20"/>
      </g>
      <path d="M178 238h44" stroke="${p.light}" stroke-width="4" opacity=".5" stroke-linecap="round"/>`;
    },

    /* 鼠标 */
    mouse(p) {
      return `
      <path d="M200 66 C240 66 266 112 266 168 C266 224 238 252 200 252 C162 252 134 224 134 168 C134 112 160 66 200 66 Z" fill="${p.deep}"/>
      <path d="M200 66 C160 66 134 112 134 168 C134 200 142 224 158 238" fill="none" stroke="${p.light}" stroke-width="9" opacity=".14"/>
      <rect x="192" y="88" width="16" height="46" rx="8" fill="${p.accent}"/>
      <path d="M200 142v34" stroke="${p.light}" stroke-width="2" opacity=".2"/>
      <path d="M246 132c10 4 12 16 4 22l-12 8" fill="${p.mid}" opacity=".75"/>
      <circle cx="200" cy="76" r="4" fill="${p.light}" opacity=".3"/>
      <path d="M200 66 C206 38 234 26 254 42" fill="none" stroke="${p.deep}" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <path d="M160 200c4 16 18 26 36 28" fill="none" stroke="${p.light}" stroke-width="3" opacity=".12"/>`;
    },

    /* 羽毛球拍 */
    racket(p, id) {
      const clip = id + 'rc';
      let grid = '';
      for (let x = 146; x <= 254; x += 12) grid += `<line x1="${x}" y1="36" x2="${x}" y2="200"/>`;
      for (let y = 44; y <= 196; y += 12) grid += `<line x1="136" y1="${y}" x2="264" y2="${y}"/>`;
      return `
      <g transform="rotate(-22 200 170)">
        <ellipse cx="200" cy="118" rx="60" ry="82" fill="${p.light}" stroke="${p.deep}" stroke-width="7"/>
        <g clip-path="url(#${clip})" stroke="${p.mid}" stroke-width="2" opacity=".85">${grid}</g>
        <ellipse cx="200" cy="118" rx="60" ry="82" fill="none" stroke="${p.deep}" stroke-width="7"/>
        <path d="M193 196 L193 252 M207 196 L207 252" stroke="${p.deep}" stroke-width="4"/>
        <rect x="186" y="246" width="28" height="46" rx="11" fill="${p.accent}" stroke="${p.deep}" stroke-width="3"/>
        <path d="M192 258h16M192 270h16M192 282h16" stroke="${p.light}" stroke-width="2" opacity=".45"/>
        <g transform="translate(316 84) rotate(18)">
          <circle cx="0" cy="16" r="10" fill="${p.accent}" stroke="${p.deep}" stroke-width="3"/>
          <path d="M-6 8 L-20 -20 M0 7 L0 -28 M6 8 L20 -20" fill="none" stroke="${p.light}" stroke-width="3" stroke-linecap="round" opacity=".8"/>
        </g>
      </g>
      <defs><clipPath id="${clip}"><ellipse cx="200" cy="118" rx="55" ry="77"/></clipPath></defs>`;
    },

    /* 三脚架 */
    tripod(p) {
      return `
      <g stroke="${p.deep}" stroke-width="7" stroke-linecap="round" fill="none">
        <path d="M200 148 L136 260"/><path d="M200 148 L264 260"/><path d="M200 148 L202 262"/>
        <path d="M160 210 L234 210" stroke-width="5" opacity=".7"/>
      </g>
      <path d="M128 262h18M256 262h18M194 262h16" stroke="${p.deep}" stroke-width="8" stroke-linecap="round"/>
      <rect x="186" y="120" width="28" height="34" rx="5" fill="${p.mid}" stroke="${p.deep}" stroke-width="3"/>
      <circle cx="200" cy="138" r="8" fill="${p.accent}"/>
      <rect x="158" y="52" width="84" height="58" rx="11" fill="${p.deep}"/>
      <rect x="170" y="42" width="34" height="14" rx="5" fill="${p.deep}"/>
      <circle cx="200" cy="80" r="20" fill="${p.mid}"/>
      <circle cx="200" cy="80" r="11" fill="${p.light}"/>
      <circle cx="195" cy="75" r="4" fill="#FFFFFF" opacity=".8"/>
      <circle cx="230" cy="60" r="4" fill="${p.accent}"/>
      <path d="M170 94h22" stroke="${p.light}" stroke-width="3" opacity=".25" stroke-linecap="round"/>`;
    },

    /* 羊毛围巾 */
    scarf(p) {
      return `
      <g transform="rotate(-5 200 168)">
        <ellipse cx="200" cy="104" rx="88" ry="46" fill="${p.accent}" stroke="${p.deep}" stroke-width="4"/>
        <ellipse cx="200" cy="102" rx="56" ry="24" fill="${p.bg}"/>
        <path d="M150 132 C144 176 150 204 146 238 L196 238 C192 204 196 174 190 132 Z" fill="${p.accent}" stroke="${p.deep}" stroke-width="3.5"/>
        <path d="M212 132 C208 170 214 198 210 228 L254 228 C250 198 256 168 250 132 Z" fill="${p.accent}" stroke="${p.deep}" stroke-width="3.5"/>
        <g stroke="${p.light}" stroke-width="2.5" opacity=".35">
          <path d="M152 150h38M150 168h40M148 186h44"/>
          <path d="M214 148h36M212 166h38M214 184h34"/>
          <path d="M146 210h44M210 202h42"/>
        </g>
        <g stroke="${p.deep}" stroke-width="3" stroke-linecap="round" opacity=".75">
          <path d="M150 238v14M158 238v10M166 238v14M174 238v10M182 238v14"/>
          <path d="M216 228v14M224 228v10M232 228v14M240 228v10M248 228v14"/>
        </g>
        <path d="M126 92c18-16 44-22 74-22s56 6 74 22" fill="none" stroke="${p.light}" stroke-width="4" opacity=".3" stroke-linecap="round"/>
      </g>`;
    },

    /* 小冰箱 */
    fridge(p) {
      return `
      <rect x="132" y="58" width="136" height="192" rx="14" fill="${p.light}" stroke="${p.deep}" stroke-width="5"/>
      <path d="M132 130h136" stroke="${p.deep}" stroke-width="5"/>
      <rect x="246" y="74" width="8" height="38" rx="4" fill="${p.deep}"/>
      <rect x="246" y="150" width="8" height="48" rx="4" fill="${p.deep}"/>
      <rect x="150" y="86" width="34" height="5" rx="2" fill="${p.mid}"/>
      <rect x="150" y="154" width="24" height="5" rx="2" fill="${p.mid}" opacity=".6"/>
      <circle cx="168" cy="196" r="9" fill="${p.accent}"/>
      <rect x="186" y="184" width="22" height="26" rx="3" fill="${p.mid}" transform="rotate(-7 197 197)"/>
      <path d="M190 192h12M190 199h8" stroke="${p.light}" stroke-width="2" opacity=".7"/>
      <rect x="144" y="250" width="20" height="10" rx="3" fill="${p.deep}"/>
      <rect x="236" y="250" width="20" height="10" rx="3" fill="${p.deep}"/>
      <path d="M276 96c12 2 18 10 18 22" fill="none" stroke="${p.deep}" stroke-width="2" opacity=".2" stroke-linecap="round"/>`;
    },

    /* 滑板 */
    skateboard(p) {
      return `
      <g transform="rotate(-8 200 178)">
        <rect x="46" y="148" width="308" height="26" rx="13" fill="${p.deep}" transform="rotate(4 200 161)"/>
        <path d="M58 174 C150 188 250 188 342 174" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linecap="round" opacity=".9"/>
        <path d="M64 154 C152 164 248 164 336 154" fill="none" stroke="${p.light}" stroke-width="2" stroke-dasharray="3 6" opacity=".45"/>
        <rect x="112" y="178" width="48" height="12" rx="4" fill="${p.mid}"/>
        <rect x="240" y="178" width="48" height="12" rx="4" fill="${p.mid}"/>
        <g fill="${p.accent}" stroke="${p.deep}" stroke-width="4">
          <circle cx="106" cy="204" r="17"/><circle cx="150" cy="204" r="17"/>
          <circle cx="250" cy="204" r="17"/><circle cx="294" cy="204" r="17"/>
        </g>
        <g fill="${p.light}">
          <circle cx="106" cy="204" r="6"/><circle cx="150" cy="204" r="6"/>
          <circle cx="250" cy="204" r="6"/><circle cx="294" cy="204" r="6"/>
        </g>
        <path d="M84 140l10-14M300 140l10-14" stroke="${p.deep}" stroke-width="3" opacity=".25" stroke-linecap="round"/>
      </g>`;
    },

    /* 龟背竹 */
    plant(p) {
      return `
      <g fill="none" stroke="${p.deep}" stroke-width="4" stroke-linecap="round">
        <path d="M200 204 C196 168 172 148 154 126"/>
        <path d="M202 204 C206 164 230 146 246 122"/>
        <path d="M200 204 C200 170 200 152 198 128"/>
      </g>
      <g>
        <path d="M154 126 C122 118 108 88 124 64 C146 34 186 52 180 86 C176 108 168 120 154 126 Z" fill="${p.mid}" stroke="${p.deep}" stroke-width="4"/>
        <path d="M246 122 C278 112 290 80 272 58 C250 30 212 50 218 84 C222 104 232 116 246 122 Z" fill="${p.mid}" stroke="${p.deep}" stroke-width="4"/>
        <path d="M198 128 C174 114 170 82 190 66 C214 46 246 68 238 96 C232 114 216 126 198 128 Z" fill="${p.deep}" stroke="${p.deep}" stroke-width="4" opacity=".88"/>
        <g stroke="${p.bg}" stroke-width="4" stroke-linecap="round">
          <path d="M150 100 L170 94M136 80 L158 76M148 62 L164 66"/>
          <path d="M250 96 L230 90M262 74 L242 70M250 58 L236 62"/>
          <path d="M202 100 L218 94M196 84 L212 82"/>
        </g>
      </g>
      <path d="M158 214h84l-12 46h-60z" fill="${p.accent}" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="148" y="202" width="104" height="18" rx="6" fill="${p.mid}" stroke="${p.deep}" stroke-width="4"/>
      <path d="M160 218h80" stroke="${p.light}" stroke-width="3" opacity=".3" stroke-linecap="round"/>
      <ellipse cx="200" cy="266" rx="58" ry="6" fill="${p.deep}" opacity=".12"/>`;
    },

    /* 桌面风扇 */
    fan(p) {
      return `
      <ellipse cx="200" cy="260" rx="62" ry="9" fill="${p.deep}" opacity=".12"/>
      <rect x="196" y="196" width="8" height="56" rx="4" fill="${p.deep}"/>
      <path d="M170 252h60" stroke="${p.deep}" stroke-width="8" stroke-linecap="round"/>
      <circle cx="200" cy="148" r="78" fill="${p.light}" stroke="${p.deep}" stroke-width="5"/>
      <circle cx="200" cy="148" r="64" fill="${p.bg}" stroke="${p.mid}" stroke-width="3"/>
      <g fill="${p.accent}" stroke="${p.deep}" stroke-width="3">
        <path d="M200 148 C178 122 190 90 216 86 C238 82 246 106 230 126 C220 138 210 144 200 148Z"/>
        <path d="M200 148 C178 122 190 90 216 86 C238 82 246 106 230 126 C220 138 210 144 200 148Z" transform="rotate(120 200 148)"/>
        <path d="M200 148 C178 122 190 90 216 86 C238 82 246 106 230 126 C220 138 210 144 200 148Z" transform="rotate(240 200 148)"/>
      </g>
      <circle cx="200" cy="148" r="15" fill="${p.mid}" stroke="${p.deep}" stroke-width="3"/>
      <circle cx="200" cy="148" r="5" fill="${p.light}" opacity=".8"/>
      <path d="M140 86c-8-12 8-18 0-30M258 86c8-12-8-18 0-30" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
    },

    /* 帆布托特包 */
    bag(p) {
      return `
      <path d="M136 116h128l12 130H124Z" fill="${p.mid}" stroke="${p.deep}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M168 118V96c0-28 64-28 64 0v22" fill="none" stroke="${p.deep}" stroke-width="7" stroke-linecap="round"/>
      <path d="M140 150h120" stroke="${p.light}" stroke-width="3" opacity=".35"/>
      <rect x="184" y="170" width="32" height="22" rx="5" fill="${p.accent}" stroke="${p.deep}" stroke-width="3"/>
      <path d="M192 181h16" stroke="${p.light}" stroke-width="2" opacity=".6"/>
      <path d="M148 214h104M156 228h88" stroke="${p.light}" stroke-width="2" stroke-dasharray="4 6" opacity=".25"/>`;
    },

    /* 小型加湿器 */
    humidifier(p) {
      return `
      <ellipse cx="200" cy="258" rx="58" ry="9" fill="${p.deep}" opacity=".12"/>
      <rect x="148" y="112" width="104" height="128" rx="22" fill="${p.light}" stroke="${p.deep}" stroke-width="5"/>
      <path d="M148 144h104" stroke="${p.deep}" stroke-width="4"/>
      <ellipse cx="200" cy="112" rx="52" ry="12" fill="${p.mid}" stroke="${p.deep}" stroke-width="4"/>
      <circle cx="200" cy="188" r="22" fill="${p.accent}" stroke="${p.deep}" stroke-width="4"/>
      <path d="M192 188h16M200 180v16" stroke="${p.light}" stroke-width="3" stroke-linecap="round" opacity=".65"/>
      <path d="M174 98c-10-14 10-20 0-34M226 98c10-14 0-20 0-34" fill="none" stroke="${p.accent}" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <path d="M168 226h64" stroke="${p.light}" stroke-width="3" stroke-linecap="round" opacity=".35"/>`;
    },

    /* 收纳盒 */
    box(p) {
      return `
      <g transform="rotate(-3 200 176)">
        <path d="M118 152 L200 122 L282 152 L282 240 L200 270 L118 240 Z" fill="${p.mid}" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M118 152 L200 182 L282 152" fill="none" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M200 182 V270" stroke="${p.deep}" stroke-width="4"/>
        <path d="M154 137 L236 107 L244 127 L162 157 Z" fill="${p.accent}" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M118 152 L200 122 L200 96 L118 126 Z" fill="${p.accent}" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M282 152 L200 122 L200 96 L282 126 Z" fill="${p.soft}" stroke="${p.deep}" stroke-width="4" stroke-linejoin="round"/>
        <rect x="228" y="196" width="34" height="24" rx="3" fill="${p.light}" transform="rotate(6 245 208)"/>
        <path d="M236 204h18M236 211h12" stroke="${p.deep}" stroke-width="2" opacity=".45"/>
        <path d="M200 122 V182" stroke="${p.light}" stroke-width="3" opacity=".25" stroke-dasharray="4 6"/>
        <path d="M296 190c16-4 24 6 20 18" fill="none" stroke="${p.deep}" stroke-width="3" opacity=".35" stroke-linecap="round"/>
      </g>`;
    }
  };

  function render(type, tone, opts) {
    const p = P[tone] || P.sage;
    const draw = ART[type] || ART.box;
    const id = 'shgArt' + (++seq);
    const dots = [
      [58, 58, 3], [76, 44, 2], [316, 218, 3], [334, 236, 2], [46, 152, 2]
    ].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
    return `<svg class="art-svg" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true" focusable="false">
      <rect width="400" height="300" fill="${p.bg}"/>
      <circle cx="344" cy="48" r="88" fill="${p.soft}" opacity=".55"/>
      <circle cx="52" cy="270" r="66" fill="${p.soft}" opacity=".4"/>
      <path d="M0 252 C80 218 150 258 232 246 C300 236 350 250 400 238 V300 H0 Z" fill="${p.soft}" opacity=".28"/>
      <g fill="${p.deep}" opacity=".12">${dots}</g>
      <ellipse cx="200" cy="264" rx="112" ry="11" fill="${p.deep}" opacity=".1"/>
      ${draw(p, id)}
    </svg>`;
  }

  /* ---------------- UI 图标 ---------------- */
  const paths = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
    heart: '<path d="M12 20.2c-5.2-3.3-8-6.3-8-9.7A4.5 4.5 0 0 1 8.5 6c1.4 0 2.7.7 3.5 1.8A4.3 4.3 0 0 1 15.5 6 4.5 4.5 0 0 1 20 10.5c0 3.4-2.8 6.4-8 9.7Z"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
    back: '<path d="M20 12H5M11 6l-6 6 6 6"/>',
    chat: '<path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9h8M8 12h5"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1Z"/>',
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 2-1.6L21 8H6"/>',
    logout: '<path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    check: '<path d="m5 12 5 5L19 7"/>',
    filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    shield: '<path d="M12 3 5 6v6c0 4.4 3 7.5 7 9 4-1.5 7-4.6 7-9V6Z"/><path d="m9 12 2 2 4-4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5"/>',
    edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17Z"/><path d="m14 7 3 3"/>',
    camera: '<path d="M4 8h4l2-3h4l2 3h4v11H4Z"/><circle cx="12" cy="13" r="3.5"/>',
    eye: '<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.6"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z"/>',
    send: '<path d="m4 20 17-8L4 4l3 8Z"/><path d="M7 12h14"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m4 17 5-5 4 4 3-3 4 4"/>',
    pause: '<path d="M9 5v14M15 5v14"/>',
    play: '<path d="m8 5 11 7-11 7Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/>',
    bag: '<path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v5H5V6h5"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    location: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>'
  };

  const icons = {
    device: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="M8 21h8M12 18v3"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 18.5Z"/><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20"/>',
    bike: '<circle cx="6" cy="17" r="4"/><circle cx="18" cy="17" r="4"/><path d="M6 17 10 7h4l4 10M10 7h4M8 12h8"/>',
    lamp: '<path d="M8 4h8l4 8H4Z"/><path d="M12 12v6M8 21h8"/>',
    racket: '<ellipse cx="12" cy="8.5" rx="4.5" ry="6"/><path d="M9 14 6 21M15 14l3 7M8 8h8M12 3v11"/>',
    shirt: '<path d="m8 4-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3-2 2h-4Z"/>',
    guitar: '<path d="M14 3v9M11 6l3-3 3 3"/><circle cx="12" cy="15" r="5"/><circle cx="12" cy="15" r="1.6"/>',
    plant: '<path d="M7 13h10l-1 8H8Z"/><path d="M12 13c0-5 3-7 6-7 0 4-2 6-6 7ZM12 13C12 9 9 7 6 7c0 3 2 5 6 6Z"/>',
    box: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="M4 7.5 12 12l8-4.5M12 12v9"/>'
  };

  window.icon = function (name, cls) {
    const d = paths[name] || paths.info;
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
  };

  window.iconFilled = function (name, cls) {
    const d = paths[name] || paths.info;
    return `<svg class="icon ${cls || ''}" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">${d}</svg>`;
  };

  window.categoryIcon = function (name, cls) {
    return `<svg class="cat-svg ${cls || ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.box}</svg>`;
  };

  window.Art = { render, palettes: P };
})();
