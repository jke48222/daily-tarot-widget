import { React } from "uebersicht";
// --- Inlined design system (self-contained; formerly theme.js) ---
// Shared design system for the widget set: color tokens, fonts, layout, the
// common card shell, drag/resize handles, a last-known-good cache, and the
// standard data-resolution helper. Imported by every widget so they stay
// visually and behaviorally consistent.
const T = {
  // Accent tints
  tintBlue: "#296BE0",
  tintPink: "#E86E87",
  tintGreen: "#59A875",
  tintOrange: "#D9946B",
  tintPurple: "#A861DE",

  // Cards
  cardLight: "rgba(255,255,255,0.74)",
  cardDark: "rgba(33,36,43,0.88)",

  // Ink (text on light)
  ink: "#1F2129",
  inkDim: "#616670",
  inkMute: "#8C919C",

  // Text on dark
  onDark: "#F7F7FA",
  onDarkDim: "#BDBFC7",
  onDarkMute: "#8F949E",

  // Walls (desktop stand-in backgrounds)
  wall1: "#F0F2F7",
  wall2: "#DBE3ED",
  wall3: "#BFC7DB",

  // GitHub ramp
  ghEmpty: "rgba(255,255,255,0.10)",
  ghGreen1: "#9CE8A8",
  ghGreen2: "#40C463",
  ghGreen3: "#30A14F",
  ghGreen4: "#216E38",

  // Scene colors
  nightSky: "#14141A",
  cosmicBase: "#0A051A",
  cosmicViolet: "#8C338C",
  cosmicMagenta: "#D9598C",
  cosmicIndigo: "#331A66",
  shaderPurple: "#402673",
  shaderTeal: "#268C8C",
  duskBase: "#4D408C",
  duskAmber: "#D9A666",
  duskPurple: "#8C4DA6",
  duskGlow: "#F28073",
  cardCream: "#F2F0E6",
  paperGrain: "#9E8052",

  archivePalette: [
    "#D98C4D", "#A64D33", "#733326", "#E0B359",
    "#8C6640", "#B88CCC", "#594D80", "#8C73BF",
    "#8CBF8C", "#4D8059", "#598CD9", "#334D8C",
  ],

  // Layout
  radius: "24px",
  captionTracking: "1.5px",
};

// Fonts. Install Instrument Serif, Geist, and Geist Mono for the intended look;
// each stack falls back to a system font if the family is missing.
const serif = "'Instrument Serif', Georgia, serif";
const sans = "'Geist', -apple-system, BlinkMacSystemFont, sans-serif";
const mono = "'Geist Mono', 'SF Mono', ui-monospace, monospace";

// Default desktop placement [x, y] per widget. Each widget calls
// card(variant, w, h, ...LAYOUT.<key>) so widgets lay out at distinct positions
// rather than stacking at the origin. These are overridden by any saved
// position from the drag handle.
const LAYOUT = {
  nowSpinning:  [380, 40],
  musicArchive: [40, 40],
  spatial:      [380, 200],
  mosaic:       [1120, 40],
  stack:        [1120, 486],
  drop:         [1120, 708],
  swap:         [380, 672],
  aiDailyPull:  [40, 368],
  apod:         [40, 576],
  atlas:        [1280, 224],
  tarot:        [1120, 224],
};

// Shared card shell. variant is "dark" or "light"; x/y set the on-desktop
// position. The common loading/empty/stale state styles are appended so every
// widget can render those states without repeating CSS.
const card = (variant, w, h, x = 0, y = 0) => `
  position: absolute;
  left: ${x}px; top: ${y}px;
  width: ${w}px;
  height: ${h}px;
  border-radius: ${T.radius};
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0,0,0,0.35);
  background: ${variant === "dark" ? T.cardDark : T.cardLight};
  backdrop-filter: blur(20px);
  color: ${variant === "dark" ? T.onDark : T.ink};
  font-family: ${sans};
  box-sizing: border-box;
  transform-origin: top left;

  /* Promote each card to its own GPU layer so a sibling widget's frequent
     refresh cannot trigger a backdrop-filter recomposite, which otherwise made
     the blur flicker on and off. */
  will-change: transform;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;

  .ws-stale { position:absolute; top:8px; right:10px; z-index:5;
              font-family:${mono}; font-size:8px; letter-spacing:1px;
              text-transform:uppercase; opacity:0.72;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute}; }
  .ws-empty { position:absolute; inset:0; display:flex; align-items:center;
              justify-content:center; padding:24px; text-align:center;
              font-family:${serif}; font-style:italic; font-size:18px;
              opacity:0.6; color:${variant === "dark" ? T.onDarkDim : T.inkDim}; }
  .ws-skel  { position:absolute; inset:14px; border-radius:14px; opacity:0.18;
              animation: ws-pulse 1.6s ease-in-out infinite; }
  @keyframes ws-pulse { 0%,100% { opacity:0.10; } 50% { opacity:0.24; } }
  @media (prefers-reduced-motion: reduce) {
    .ws-skel { animation:none; opacity:0.16; }
  }

  .ws-drag  { position:absolute; top:6px; left:6px; z-index:30;
              width:18px; height:18px; border-radius:6px;
              display:flex; align-items:center; justify-content:center;
              font-size:11px; line-height:1; cursor:grab; opacity:0.22;
              transition:opacity .15s ease; user-select:none;
              -webkit-user-select:none;
              color:${variant === "dark" ? T.onDarkMute : T.inkMute};
              background:${variant === "dark"
                ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-drag:hover  { opacity:0.95; }
  .ws-drag:active { cursor:grabbing; }

  .ws-resize { position:absolute; bottom:5px; right:5px; z-index:30;
               width:16px; height:16px; border-radius:5px;
               display:flex; align-items:center; justify-content:center;
               font-size:11px; line-height:1; cursor:nwse-resize; opacity:0.22;
               transition:opacity .15s ease; user-select:none;
               -webkit-user-select:none;
               color:${variant === "dark" ? T.onDarkMute : T.inkMute};
               background:${variant === "dark"
                 ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}; }
  .ws-resize:hover { opacity:0.95; }
`;

// Small uppercase monospace caption used for metadata labels.
const caption = (color) => `
  font-family: ${mono};
  text-transform: uppercase;
  letter-spacing: ${T.captionTracking};
  color: ${color};
`;

// State helpers, returned as React elements (this is plain JS, not JSX).
const h = React.createElement;

// Loading: an accent-tinted skeleton block.
const Skel = ({ tint = T.tintBlue }) =>
  h("div", { className: "ws-skel", style: { background: tint } });

// Empty: a single quiet line of text.
const Empty = ({ text }) => h("div", { className: "ws-empty" }, text);

// Stale: a small marker showing the time of the last successful refresh.
const Stale = ({ ts }) =>
  h("div", { className: "ws-stale" }, `stale · ${clockStamp(ts)}`);

// Drag and resize support.
//
// Übersicht renders each widget into its own absolutely-positioned `.widget`
// node, all inside a shared `#uebersicht` container. The wrapper to move is the
// nearest `.widget` ancestor of a handle — not the topmost absolute element,
// which is the shared container.
//
// DragHandle updates the wrapper's left/top. ResizeHandle scales it uniformly
// via a top-left-anchored CSS transform, keeping these fixed-layout cards crisp
// instead of clipping. Both persist to localStorage, so position and size
// survive refreshes and reboots.
const posKey = (k) => `ws:pos:${k}`;
const scaleKey = (k) => `ws:scale:${k}`;
const MIN_SCALE = 0.4, MAX_SCALE = 3;

const findWrapper = (node) => node && node.closest(".widget");

// Apply any saved position and scale. Runs on every mount, since the wrapper
// may have been recreated on refresh.
const applySaved = (wrapper, key) => {
  try {
    const pos = JSON.parse(localStorage.getItem(posKey(key)) || "null");
    if (pos && typeof pos.x === "number") {
      wrapper.style.left = pos.x + "px";
      wrapper.style.top = pos.y + "px";
    }
  } catch (e) { /* storage unavailable */ }
  try {
    const scale = parseFloat(localStorage.getItem(scaleKey(key)));
    if (scale > 0) wrapper.style.transform = `scale(${scale})`;
  } catch (e) { /* storage unavailable */ }
};

const initDrag = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsDragWired) return; // attach listeners once per node
  node.__wsDragWired = true;

  // Keep grip clicks from reaching the card's own onClick handler.
  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    const origX = parseFloat(wrapper.style.left || cs.left) || 0;
    const origY = parseFloat(wrapper.style.top || cs.top) || 0;
    const onMove = (ev) => {
      wrapper.style.left = origX + (ev.clientX - startX) + "px";
      wrapper.style.top = origY + (ev.clientY - startY) + "px";
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      try {
        localStorage.setItem(posKey(key), JSON.stringify({
          x: parseFloat(wrapper.style.left) || 0,
          y: parseFloat(wrapper.style.top) || 0,
        }));
      } catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the grip to snap back to the card's default LAYOUT slot.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(posKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.left = "";
    wrapper.style.top = "";
  });
};

const initResize = (node, key) => {
  if (!node) return;
  const wrapper = findWrapper(node);
  if (!wrapper) return;
  applySaved(wrapper, key);

  if (node.__wsResizeWired) return;
  node.__wsResizeWired = true;

  node.addEventListener("click", (e) => e.stopPropagation());

  node.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX, startY = e.clientY;
    const cs = getComputedStyle(wrapper);
    // Layout width/height are unaffected by transform, so they stay constant.
    const baseW = parseFloat(cs.width) || 1;
    const baseH = parseFloat(cs.height) || 1;
    const m = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
    const origScale = m ? parseFloat(m[1]) || 1 : 1;
    const onMove = (ev) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / (baseW + baseH);
      const next = Math.max(MIN_SCALE, Math.min(MAX_SCALE, origScale + delta));
      wrapper.style.transform = `scale(${next})`;
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      const m2 = /scale\(([^)]+)\)/.exec(wrapper.style.transform || "");
      try { localStorage.setItem(scaleKey(key), String(m2 ? m2[1] : 1)); }
      catch (e) { /* storage unavailable */ }
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  });

  // Double-click the corner to restore the card's default size.
  node.addEventListener("dblclick", (e) => {
    e.preventDefault();
    e.stopPropagation();
    try { localStorage.removeItem(scaleKey(key)); } catch (e) { /* ignore */ }
    wrapper.style.transform = "";
  });
};

// Each handle takes the widget's LAYOUT key so position and scale are stored
// per widget. DragHandle renders top-left, ResizeHandle bottom-right.
const DragHandle = ({ k }) =>
  h("div", { className: "ws-drag", title: "Drag to move · double-click to reset",
             ref: (n) => initDrag(n, k) }, "☰");

const ResizeHandle = ({ k }) =>
  h("div", { className: "ws-resize", title: "Drag to resize · double-click to reset",
             ref: (n) => initResize(n, k) }, "⤡");

// Last-known-good cache, persisted in localStorage with a timestamp.
const remember = (key, data) => {
  try { localStorage.setItem(`ws:${key}`, JSON.stringify({ data, ts: Date.now() })); }
  catch (e) { /* storage unavailable; skip */ }
};

const recall = (key) => {
  try { return JSON.parse(localStorage.getItem(`ws:${key}`)); }
  catch (e) { return null; }
};

const clockStamp = (ms) =>
  new Date(ms).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

// True before the command has produced any output (the initial load tick).
const isLoading = ({ output, error }) =>
  output === undefined && !error;

// Standard data flow for command-backed widgets. parse(output) must return a
// falsy value when there is nothing usable.
//   loading -> { loading: true }            render <Skel/>
//   success -> { data }                     cached as last-known-good
//   failure -> { data, staleTs }            last-known-good + time, render <Stale/>
//   cold    -> { data, mock: true }         mock data, nothing cached yet
const resolve = (key, props, parse, mock) => {
  if (isLoading(props)) return { loading: true };
  let data = null;
  try { data = parse(props.output); } catch (e) { data = null; }
  if (data) { remember(key, data); return { data }; }
  const cached = recall(key);
  if (cached && cached.data) return { data: cached.data, staleTs: cached.ts };
  return { data: mock, mock: true };
};
// --- End inlined design system ---

// A daily tarot card and its reading, stable for the full day.
//
// The deck is bundled: 22 Major Arcana are written out and 56 Minor Arcana are
// generated from suit and rank. The card is selected by day of year (mod 78);
// an independent seed decides upright or reversed, and each card carries both
// meanings. The card-back-to-face flip is a CSS hover transition, disabled
// under prefers-reduced-motion.
//
// Card art: Rider-Waite-Smith Tarot Cards by Luciella Elisabeth Scarlett,
// released under CC0 (public domain):
// https://luciellaes.itch.io/rider-waite-smith-tarot-cards-cc0
export const command = false;
export const refreshFrequency = 1000 * 60 * 60; // hourly is enough to roll the card without interrupting a hover flip

const MAJOR = [
  ["0","✺","The Fool","A clean beginning.","Step off the known path; the drop is shorter than it looks.","A reckless leap.","Look before this one — the ground is not where you assume."],
  ["I","☉","The Magician","Will into form.","Every tool is on the table; focus turns intent into result.","Scattered power.","Talent spent on tricks, or doubt that you hold the tools at all."],
  ["II","☽","The High Priestess","Inner knowing.","The answer is beneath the surface; listen before you speak.","Noise over signal.","Intuition drowned out; secrets kept from yourself."],
  ["III","✿","The Empress","Abundant growth.","Nurture what is alive; creation rewards patience and care.","Stalled bloom.","Smothering or neglect; creativity blocked at the root."],
  ["IV","♔","The Emperor","Order and structure.","Build the frame; authority earned holds the weight.","Rigid control.","Rules for their own sake, or a foundation that cracks."],
  ["V","☩","The Hierophant","Shared tradition.","Lean on the proven way; mentorship lights the path.","Hollow doctrine.","Convention that no longer fits; question the inherited rule."],
  ["VI","♡","The Lovers","Aligned choice.","Two halves meet in agreement; choose with the whole self.","Misalignment.","Values at odds; a choice made for the wrong reason."],
  ["VII","✶","The Chariot","Directed will.","Hold the reins of opposing forces and drive straight on.","Loss of control.","Pulled in two directions; momentum without a course."],
  ["VIII","✷","Strength","Quiet courage.","Power is gentleness under pressure; soothe the wild thing.","Self-doubt.","Force where patience was needed; nerve gone soft."],
  ["IX","✦","The Hermit","Inward attention.","Turn the lamp toward your own work; the answer is quiet.","Isolation.","Withdrawal that hides rather than heals."],
  ["X","❂","Wheel of Fortune","The turn arrives.","What was fixed loosens; ride the change, do not brace.","Resisted change.","Clinging to a turn already past; luck feels withheld."],
  ["XI","⚖","Justice","Cause and effect.","Truth is weighed plainly; act so the ledger balances.","Imbalance.","Consequence dodged, or a verdict skewed by bias."],
  ["XII","✸","The Hanged Man","Useful surrender.","A new view comes from letting go; suspend the struggle.","Pointless delay.","Stalling dressed as patience; sacrifice with no return."],
  ["XIII","✹","Death","Necessary end.","Let the old form die so the next can begin; clear the ground.","Clung-to past.","Refusing the ending that would free you."],
  ["XIV","☆","Temperance","Measured blend.","Mix the extremes in the right proportion; patience is the art.","Excess.","Overdone or out of balance; the recipe is off."],
  ["XV","♄","The Devil","Binding want.","Name the chain you chose; the lock is looser than it feels.","Release.","A grip loosens; you see the bargain for what it was."],
  ["XVI","☄","The Tower","Sudden break.","What was built on sand falls fast; let the false thing go.","Averted ruin.","A collapse delayed, or change resisted at a cost."],
  ["XVII","✶","The Star","Renewal & quiet faith.","Hope returns after a long passage; follow the line in the dark.","Lost faith.","The signal feels far; refill the well before you give up."],
  ["XVIII","☾","The Moon","Uncertain ground.","Not all is as it seems; move slowly through the half-light.","Clearing fog.","Illusion lifts, or fear is faced and named."],
  ["XIX","☉","The Sun","Open clarity.","Warmth and plain truth; let the good thing be simple.","Dimmed light.","Joy deferred or doubted; the cloud is temporary."],
  ["XX","✷","Judgement","The call to rise.","Reckon honestly and answer; a new chapter is named.","Self-doubt.","The call ignored, or judgment turned too harsh."],
  ["XXI","❉","The World","Completion.","A cycle closes whole; stand in the finished thing, then begin again.","Loose ends.","Almost there; one piece left unintegrated."],
];

const SUITS = [
  ["Wands","✦","Energy, drive, and creation.","Scattered or stalled energy."],
  ["Cups","♥","Emotion, bonds, and intuition.","Blocked or spilled feeling."],
  ["Swords","⚔","Mind, truth, and conflict.","Confusion or cutting words."],
  ["Pentacles","★","Craft, body, and resources.","Insecurity or waste."],
];

const RANKS = [
  ["Ace","A","A clean source opens; accept the first spark before shaping it.","The source is there but ignored, or forced too soon."],
  ["Two","II","Two paths weigh evenly; choose, or hold the tension on purpose.","Indecision stalls the moment."],
  ["Three","III","Early growth shows; share the work to make it real.","Plans slip out of sync."],
  ["Four","IV","A stable footing; rest here before the next move.","Stability hardens into stagnation."],
  ["Five","V","Friction enters; loss teaches what comfort could not.","The conflict eases, or you cling to it."],
  ["Six","VI","A turn toward better; movement, aid, or small victory.","Help is delayed; progress feels uneven."],
  ["Seven","VII","Hold your ground and assess; patience over haste.","Doubt or overreach undercuts the stand."],
  ["Eight","VIII","Swift change in motion; skill compounds with focus.","Momentum scatters or speeds the wrong way."],
  ["Nine","IX","Near the finish, guard what you built.","Defensiveness or fatigue sets in."],
  ["Ten","X","A cycle completes, full and heavy; set down what is done.","The weight lingers past its time."],
  ["Page","P","A young, curious signal; news or a first study arrives.","Restlessness without follow-through."],
  ["Knight","N","Bold pursuit; commit and ride the line.","Recklessness, or a charge that stalls."],
  ["Queen","Q","Mastery held inward; steady, generous command.","That mastery turns guarded or cold."],
  ["King","K","Mastery turned outward; lead with earned authority.","Authority overreaches or rigidifies."],
];

// Major Arcana art filenames, resolved against the bundled cards-png/ folder.
const MAJOR_FILES = [
  "00-TheFool","01-TheMagician","02-TheHighPriestess","03-TheEmpress","04-TheEmperor",
  "05-TheHierophant","06-TheLovers","07-TheChariot","08-Strength","09-TheHermit",
  "10-WheelOfFortune","11-Justice","12-TheHangedMan","13-Death","14-Temperance",
  "15-TheDevil","16-TheTower","17-TheStar","18-TheMoon","19-TheSun","20-Judgement","21-TheWorld",
];

const DECK = [
  ...MAJOR.map(([num, glyph, name, heading, reading, rHeading, rReading], i) =>
    ({ num, glyph, name, heading, reading, rHeading, rReading, file: MAJOR_FILES[i] + ".png" })),
  ...SUITS.flatMap(([sName, glyph, sUp, sDown]) =>
    RANKS.map(([rLabel, num, up, rev], ri) =>
      ({ num, glyph, name: `${rLabel} of ${sName}`, heading: sUp, reading: up, rHeading: sDown, rReading: rev,
         file: `${sName}${String(ri + 1).padStart(2, "0")}.png` }))),
];

export const className = card("light", 180, 240, ...LAYOUT.tarot) + `
  background: transparent; box-shadow: none; backdrop-filter: none; overflow: visible;
  padding: 0; display: flex; align-items: center; justify-content: center;
  .card   { width:140px; height:240px; border-radius:10px;
            transform:rotate(-3deg); position:relative;
            transition: transform 0.5s ease 0.12s;
            transform-style: preserve-3d; -webkit-transform-style: preserve-3d; }
  .card:hover { transform: rotate(-3deg) rotateY(180deg); }
  @media (prefers-reduced-motion: reduce) {
    .card { transition: none; }
    .card:hover { transform: rotate(-3deg); }
  }
  .face, .back { position:absolute; inset:0; border-radius:10px; overflow:hidden;
                 background:transparent; box-shadow:0 8px 22px rgba(0,0,0,0.32);
                 backface-visibility:hidden; -webkit-backface-visibility:hidden; }
  .face   { transform: rotateY(0deg); }
  .back   { transform: rotateY(180deg); }
  .cardimg { position:absolute; inset:0; width:100%; height:100%; object-fit:contain;
             border-radius:10px; }
  .cardimg.rev { transform: rotate(180deg); }
  .frame  { position:absolute; inset:4px; border:1px solid rgba(31,33,41,0.10);
            border-radius:8px; z-index:3; pointer-events:none; }
  .ctop   { position:absolute; left:0; right:0; top:0; z-index:2;
            padding:12px 12px 22px; text-align:center;
            background: linear-gradient(to bottom, rgba(242,240,230,0.95) 42%, rgba(242,240,230,0.0)); }
  .caption { position:absolute; left:0; right:0; bottom:0; z-index:2;
             padding:30px 12px 12px; text-align:center;
             background: linear-gradient(to top, rgba(18,16,12,0.94) 38%, rgba(18,16,12,0.0)); }
  .cname  { font-family:${mono}; font-size:8px; letter-spacing:1.2px; text-transform:uppercase;
            color:${T.ink}; }
  .chead  { font-family:${serif}; font-style:italic; font-size:14px; color:${T.onDark};
            margin-top:4px; line-height:1.15; }
  .cread  { font-family:${serif}; font-style:italic; font-size:11px; color:${T.onDarkDim};
            margin-top:5px; line-height:1.38; }
`;

const dayOfYear = () => {
  const now = new Date();
  return Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
};

// Independent seed used to decide card orientation (upright vs reversed).
const hash = (n) => { let x = (n * 2654435761) >>> 0; x ^= x >>> 13; x = (x * 2246822519) >>> 0; return (x ^ (x >>> 16)) >>> 0; };

export const render = () => {
  const doy = dayOfYear();
  const c = DECK[doy % DECK.length];
  const reversed = hash(doy + 101) % 2 === 1;
  const heading = reversed ? c.rHeading : c.heading;
  const reading = reversed ? c.rReading : c.reading;

  return (
    <div aria-label={`Tarot for today: ${c.name}${reversed ? " reversed" : ""}. ${heading} ${reading}`}>
      <DragHandle k="tarot" />
      <ResizeHandle k="tarot" />
      <div className="card">
        <div className="face">
          <img className="cardimg" src="cards-png/CardBacks.png" />
          <div className="frame" />
        </div>
        <div className="back">
          <img className={`cardimg ${reversed ? "rev" : ""}`} src={`cards-png/${c.file}`} />
          <div className="frame" />
          <div className="ctop">
            <div className="cname">{c.name}{reversed ? " · reversed" : " · upright"}</div>
          </div>
          <div className="caption">
            <div className="chead">{heading}</div>
            <div className="cread">{reading}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
