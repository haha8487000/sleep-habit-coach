import React, { useEffect, useState } from "react";
import {
  AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender,
  interpolate, staticFile, useCurrentFrame, useVideoConfig,
} from "remotion";
import script from "./script.json";

// ---- Design tokens ----
const C = {
  bg0: "#070B18", bg1: "#0E1630", gold: "#D4B483", goldSoft: "rgba(212,180,131,0.35)",
  ink: "#F3EEE4", mute: "rgba(243,238,228,0.55)", faint: "rgba(243,238,228,0.18)",
};
const SERIF = "'NotoSerifKR', serif";
const SANS = "'Pretendard', sans-serif";
const ease = Easing.bezier(0.16, 1, 0.3, 1); // cinematic ease-out

// ---- Fonts ----
const FONTS: [string, string, string][] = [
  ["Pretendard", "Pretendard-Light.woff2", "300"],
  ["Pretendard", "Pretendard-Regular.woff2", "400"],
  ["Pretendard", "Pretendard-SemiBold.woff2", "600"],
  ["NotoSerifKR", "noto-serif-kr-latin-300-normal.woff2", "300"],
  ["NotoSerifKR", "noto-serif-kr-korean-300-normal.woff2", "300"],
  ["NotoSerifKR", "noto-serif-kr-latin-600-normal.woff2", "600"],
  ["NotoSerifKR", "noto-serif-kr-korean-600-normal.woff2", "600"],
];
const useFonts = () => {
  const [h] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(FONTS.map(([f, file, w]) => {
      const ff = new FontFace(f, `url(${staticFile("fonts/" + file)})`, { weight: w });
      return ff.load().then((l) => document.fonts.add(l));
    })).then(() => continueRender(h));
  }, [h]);
};

// ---- Helpers ----
const fadeUp = (f: number, start: number, dur = 18, dist = 24) => ({
  opacity: interpolate(f, [start, start + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  transform: `translateY(${interpolate(f, [start, start + dur], [dist, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease })}px)`,
});
const sceneFade = (f: number, len: number) =>
  interpolate(f, [0, 10, len - 10, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Center: React.FC<{ children: React.ReactNode; top?: number }> = ({ children, top = 0 }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", transform: `translateY(${top}px)` }}>
    {children}
  </AbsoluteFill>
);
const Label: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: SANS, fontWeight: 300, fontSize: 40, letterSpacing: 10, color: C.mute, ...style }}>{children}</div>
);

// ---- Background ----
const Background: React.FC = () => {
  const f = useCurrentFrame();
  const x = 50 + Math.sin(f / 90) * 12, y = 38 + Math.cos(f / 110) * 6;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.bg1} 0%, ${C.bg0} 70%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${x}% ${y}%, rgba(212,180,131,0.16) 0%, rgba(212,180,131,0) 45%)` }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      {/* frame lines */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 150, height: 1, background: C.faint }} />
      <div style={{ position: "absolute", left: 80, top: 110, fontFamily: SANS, fontWeight: 300, fontSize: 26, letterSpacing: 8, color: C.mute }}>
        웃음에 관한 오해
      </div>
      <div style={{ position: "absolute", right: 80, top: 110, fontFamily: SERIF, fontWeight: 300, fontSize: 26, letterSpacing: 4, color: C.gold }}>
        No. 01
      </div>
    </AbsoluteFill>
  );
};

// ---- Scenes ----
const Hook: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const drop = 66; // frame where 400 becomes 7
  const n = Math.round(interpolate(f, [8, 52], [0, 400], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const outA = interpolate(f, [drop, drop + 14], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fall = interpolate(f, [drop, drop + 18], [0, 160], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const inB = interpolate(f, [drop + 10, drop + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const blur = interpolate(f, [drop + 10, drop + 30], [12, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, len) }}>
      <Center top={-120}>
        <div style={{ position: "relative", height: 560, width: 900 }}>
          <AbsoluteFill style={{ alignItems: "center", opacity: outA, transform: `translateY(${fall}px)` }}>
            <Label style={fadeUp(f, 0)}>아이 · 하루</Label>
            <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 340, color: C.gold, lineHeight: 1.1, fontVariantNumeric: "tabular-nums" }}>{n}</div>
          </AbsoluteFill>
          <AbsoluteFill style={{ alignItems: "center", opacity: inB, filter: `blur(${blur}px)` }}>
            <Label>어른 · 하루</Label>
            <div style={{ fontFamily: SERIF, fontWeight: 300, fontSize: 340, color: C.ink, lineHeight: 1.1 }}>7</div>
          </AbsoluteFill>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Twist: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const strike = interpolate(f, [10, 34], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, len) }}>
      <Center top={-140}>
        <div style={{ position: "relative", fontFamily: SERIF, fontWeight: 300, fontSize: 200, color: C.mute, letterSpacing: 6 }}>
          400 <span style={{ color: C.faint }}>/</span> 7
          <div style={{ position: "absolute", left: -20, top: "52%", height: 3, width: `calc(${strike}% + 40px)`, background: C.gold }} />
        </div>
        <div style={{ ...fadeUp(f, 30), marginTop: 70, fontFamily: SANS, fontWeight: 600, fontSize: 64, color: C.ink, letterSpacing: -1 }}>
          출처가 <span style={{ color: C.gold }}>없습니다</span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Origin: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const track = interpolate(f, [0, len], [30, 4]);
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, len) }}>
      <Center top={-140}>
        <Label style={fadeUp(f, 6)}>THE ORIGIN</Label>
        <div style={{ ...fadeUp(f, 0, 30, 60), fontFamily: SERIF, fontWeight: 300, fontSize: 300, color: C.ink, letterSpacing: track, lineHeight: 1.15 }}>1998</div>
        <div style={{ width: interpolate(f, [24, 54], [0, 360], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }), height: 1, background: C.gold, margin: "20px 0 40px" }} />
        <div style={{ ...fadeUp(f, 40), fontFamily: SANS, fontWeight: 300, fontSize: 54, color: C.ink, textAlign: "center", lineHeight: 1.5 }}>
          한 학회에서 나온 말이<br />퍼졌다고 합니다
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Pivot: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, len) }}>
      <Center top={-120}>
        <div style={{ ...fadeUp(f, 4), fontFamily: SANS, fontWeight: 300, fontSize: 60, color: C.mute }}>하지만 진짜 중요한 건</div>
        <div style={{ ...fadeUp(f, 30), marginTop: 40, fontFamily: SERIF, fontWeight: 600, fontSize: 110, color: C.ink }}>
          숫자가 <span style={{ color: C.gold }}>아닙니다</span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Decline: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [6, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const W = 820, H = 420;
  const pts = Array.from({ length: 60 }, (_, i) => {
    const x = (i / 59) * W;
    const y = 60 + (H - 120) * (1 - Math.exp(-i / 18)) + Math.sin(i / 3) * 6;
    return [x, y];
  });
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const len2 = 1400;
  const [ex, ey] = pts[Math.min(59, Math.floor(p * 59))];
  return (
    <AbsoluteFill style={{ opacity: sceneFade(f, len) }}>
      <Center top={-140}>
        <svg width={W} height={H} style={{ overflow: "visible" }}>
          <line x1={0} y1={H - 30} x2={W} y2={H - 30} stroke={C.faint} strokeWidth={1} />
          <path d={d} fill="none" stroke={C.gold} strokeWidth={3} strokeDasharray={len2} strokeDashoffset={len2 * (1 - p)} strokeLinecap="round" />
          <circle cx={ex} cy={ey} r={9} fill={C.gold} />
          <text x={0} y={H + 30} fill={C.mute} fontFamily={SANS} fontWeight={300} fontSize={34} letterSpacing={4}>어린 시절</text>
          <text x={W} y={H + 30} fill={C.mute} fontFamily={SANS} fontWeight={300} fontSize={34} letterSpacing={4} textAnchor="end">어른</text>
        </svg>
        <div style={{ ...fadeUp(f, 30), marginTop: 90, fontFamily: SANS, fontWeight: 600, fontSize: 62, color: C.ink, textAlign: "center", lineHeight: 1.45 }}>
          어른이 될수록<br /><span style={{ color: C.gold }}>웃음은 줄어듭니다</span>
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Cta: React.FC<{ len: number }> = ({ len }) => {
  const f = useCurrentFrame();
  const u = interpolate(f, [30, 66], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  return (
    <AbsoluteFill style={{ opacity: interpolate(f, [0, 10, len - 20, len], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
      <Center top={-130}>
        <Label style={fadeUp(f, 0)}>TODAY</Label>
        <div style={{ ...fadeUp(f, 8, 24, 40), marginTop: 30, fontFamily: SERIF, fontWeight: 600, fontSize: 96, color: C.ink, textAlign: "center", lineHeight: 1.35 }}>
          오늘, <span style={{ color: C.gold }}>세 번만</span><br />더 웃어보세요
          <div style={{ height: 3, width: `${u}%`, background: C.gold, margin: "24px auto 0" }} />
        </div>
        <div style={{ display: "flex", gap: 34, marginTop: 80 }}>
          {[0, 1, 2].map((i) => {
            const on = interpolate(f, [80 + i * 14, 92 + i * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <div key={i} style={{ width: 22, height: 22, borderRadius: 11, border: `2px solid ${C.gold}`, background: `rgba(212,180,131,${on})`, boxShadow: `0 0 ${24 * on}px ${C.goldSoft}` }} />;
          })}
        </div>
        <div style={{ ...fadeUp(f, 110), marginTop: 70, fontFamily: SANS, fontWeight: 300, fontSize: 40, color: C.mute }}>
          오늘의 웃음 횟수를 댓글로 남겨주세요
        </div>
      </Center>
    </AbsoluteFill>
  );
};

const Caption: React.FC<{ text: string; len: number }> = ({ text, len }) => {
  const f = useCurrentFrame();
  const words = text.split(" ");
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 470, opacity: sceneFade(f, len) }}>
      <div style={{ maxWidth: 860, textAlign: "center", fontFamily: SANS, fontWeight: 400, fontSize: 42, lineHeight: 1.5, color: C.ink, textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>
        {words.map((w, i) => {
          const o = interpolate(f, [4 + i * 5, 12 + i * 5], [0.25, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return <span key={i} style={{ opacity: o }}>{w} </span>;
        })}
      </div>
    </AbsoluteFill>
  );
};

const SCENES: Record<string, React.FC<{ len: number }>> = { hook: Hook, twist: Twist, origin: Origin, pivot: Pivot, decline: Decline, cta: Cta };

export const LaughShorts: React.FC = () => {
  useFonts();
  const { fps, durationInFrames } = useVideoConfig();
  let at = 0;
  const seqs = script.scenes.map((s) => {
    const len = Math.round(s.seconds * fps);
    const from = at; at += len;
    const Comp = SCENES[s.id];
    return (
      <Sequence key={s.id} from={from} durationInFrames={len}>
        <Comp len={len} />
        <Caption text={s.caption} len={len} />
        <Sequence from={4}><Audio src={staticFile(s.vo)} volume={1} /></Sequence>
      </Sequence>
    );
  });
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg0 }}>
      <Background />
      {seqs}
      <Audio src={staticFile("music.wav")} volume={(f) => interpolate(f, [0, 20, durationInFrames - 40, durationInFrames], [0, 0.22, 0.22, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
      <Sequence from={66}><Audio src={staticFile("boom.wav")} volume={0.5} /></Sequence>
    </AbsoluteFill>
  );
};
