import { useEffect, useRef, useState, type ChangeEvent } from "react";
import {
  ChevronDown,
  Pause,
  Play,
  RotateCcw,
  Upload,
  Volume2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Parcel } from "@/lib/delivery-data";

const WAVE = Array.from({ length: 46 }, (_, index) =>
  Math.round(18 + Math.abs(Math.sin(index * 1.63)) * 74),
);

function buildTranscript(parcel: Parcel) {
  if (parcel.gig) {
    return `Evening dispatch confirmed for parcel ${parcel.id}. ${parcel.gig.rider} from ${parcel.gig.partner}, bike ${parcel.gig.plate}, will collect your ${parcel.weightKg} kilogram parcel from ${parcel.hub} and reach your doorstep by ${parcel.gig.eta}, inside the ${parcel.slot} window. Your four digit doorstep OTP is ${parcel.deliveryOtp}. Share it only after the parcel is in your hands. Thank you for using LastMileSync.`;
  }
  return `Parcel ${parcel.id} from ${parcel.carrier} is currently held at ${parcel.hub} in ${parcel.city}. The daytime delivery attempt was missed, so the parcel is waiting for your instructions. Open the booking panel to choose an evening window, a delivery address and a hyperlocal rider. A full rider briefing, including your pickup and doorstep OTP, will be generated the moment you confirm.`;
}

export function VoiceDispatch({ parcel }: { parcel: Parcel }) {
  const transcript = buildTranscript(parcel);

  // Remount the player when the briefing changes so stale audio always stops.
  return <VoiceBriefing key={transcript} transcript={transcript} />;
}

function VoiceBriefing({ transcript }: { transcript: string }) {
  const [playing, setPlaying] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [sourceName, setSourceName] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [audioError, setAudioError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  function stopPlayback() {
    window.speechSynthesis?.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaying(false);
  }

  useEffect(() => {
    audioRef.current?.pause();
    audioRef.current = null;
  }, [audioSrc]);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  async function togglePlayback() {
    if (playing) {
      stopPlayback();
      return;
    }
    setAudioError(null);

    if (audioSrc) {
      const audio = audioRef.current ?? new Audio(audioSrc);
      audioRef.current = audio;
      audio.addEventListener("ended", () => setPlaying(false), { once: true });
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        setAudioError("That clip could not play. Check the MP3 link and try again.");
      }
      return;
    }

    const synth = window.speechSynthesis;
    if (!synth) {
      setAudioError("This browser has no speech engine. Paste an MP3 link instead.");
      return;
    }
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(transcript);
    utterance.rate = 1.02;
    utterance.pitch = 1;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    synth.speak(utterance);
    setPlaying(true);
  }

  function applyUrl() {
    const trimmed = urlDraft.trim();
    if (!/^(https?:\/\/|blob:|data:)/i.test(trimmed)) {
      setAudioError("Paste a direct audio link starting with https://");
      return;
    }
    stopPlayback();
    setAudioSrc(trimmed);
    setSourceName("Custom ElevenLabs clip");
    setAudioError(null);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    stopPlayback();
    setAudioSrc(url);
    setSourceName(file.name);
    setAudioError(null);
  }

  function resetSource() {
    stopPlayback();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setAudioSrc(null);
    setSourceName(null);
    setUrlDraft("");
    setAudioError(null);
  }

  return (
    <section className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-[#080e18]">
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-route/10 blur-3xl" />
      <div className="relative border-b border-border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Volume2 className="size-3.5 text-route" strokeWidth={1.8} />
            <p className="eyebrow text-muted-foreground">
              ElevenLabs · voice dispatch
            </p>
          </div>
          <span className="rounded-full border border-route/25 bg-route-soft px-2 py-0.5 text-[9px] uppercase tracking-[0.1em] text-route-deep mono">
            AI voice
          </span>
        </div>
        <h3 className="mt-3 font-display text-[22px] font-semibold leading-tight tracking-[-0.02em] text-foreground">
          Live voice dispatch alert
        </h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Automated briefing · rider, arrival window and OTP
        </p>
      </div>

      <div className="relative flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={playing ? "Pause voice briefing" : "Play voice briefing"}
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-route text-primary-foreground transition-transform hover:scale-[1.04] active:scale-95"
          >
            {playing ? (
              <Pause className="size-4" fill="currentColor" strokeWidth={0} />
            ) : (
              <Play
                className="ml-0.5 size-4"
                fill="currentColor"
                strokeWidth={0}
              />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[9px] uppercase tracking-[0.1em] text-foreground/70 mono">
                {playing ? "Playing briefing" : "Play voice briefing"}
              </p>
              <p className="text-[10px] tabular-nums text-muted-foreground/50 mono">
                0:24
              </p>
            </div>
            <div
              className="mt-2.5 flex h-8 items-center justify-between gap-[2px]"
              aria-hidden="true"
            >
              {WAVE.map((height, index) => (
                <span
                  key={index}
                  className={cn(
                    "w-[2px] shrink-0 rounded-full bg-route",
                    playing ? "wave-bar" : "opacity-30",
                  )}
                  style={{
                    height: `${playing ? height : Math.max(14, height * 0.45)}%`,
                    animationDelay: `${(index % 9) * 0.08}s`,
                    animationDuration: `${0.9 + (index % 5) * 0.12}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-white/[0.03] p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono">
              Transcript
            </p>
            <p className="text-[9px] uppercase tracking-[0.1em] text-route-deep mono">
              Live parcel state
            </p>
          </div>
          <p className="chat-scroll mt-2 max-h-36 overflow-y-auto pr-1 text-[12px] leading-6 text-foreground/70">
            {transcript}
          </p>
        </div>

        <div className="mt-3.5">
          <button
            type="button"
            onClick={() => setShowSource((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 transition-colors hover:text-foreground/80 mono"
          >
            <span>Use real ElevenLabs audio</span>
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform",
                showSource && "rotate-180",
              )}
            />
          </button>

          {showSource && (
            <div className="animate-rise mt-2.5 rounded-lg border border-border bg-white/[0.03] p-3">
              <label
                htmlFor="voice-url"
                className="text-[9px] uppercase tracking-[0.1em] text-muted-foreground/60 mono"
              >
                Paste a public MP3 URL
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  id="voice-url"
                  value={urlDraft}
                  onChange={(event) => setUrlDraft(event.target.value)}
                  placeholder="https://…/briefing.mp3"
                  spellCheck={false}
                  className="h-8 min-w-0 flex-1 rounded border border-border bg-background px-2.5 text-[11px] text-foreground outline-none placeholder:text-muted-foreground/40 focus:border-route/50"
                />
                <button
                  type="button"
                  onClick={applyUrl}
                  className="h-8 shrink-0 rounded border border-route/40 px-2.5 text-[9px] uppercase tracking-[0.08em] text-route-deep transition-colors hover:bg-route-soft mono"
                >
                  Load
                </button>
              </div>

              <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                <label className="flex cursor-pointer items-center gap-1.5 rounded border border-border px-2 py-1.5 text-[9px] uppercase tracking-[0.08em] text-muted-foreground transition-colors hover:border-white/25 hover:text-foreground mono">
                  <Upload className="size-3" />
                  Upload MP3
                  <input
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/*"
                    onChange={handleFile}
                    className="sr-only"
                  />
                </label>
                {sourceName ? (
                  <span className="flex min-w-0 items-center gap-2 text-[10px] text-route-deep">
                    <span className="truncate">{sourceName}</span>
                    <button
                      type="button"
                      onClick={resetSource}
                      aria-label="Reset to simulated voice"
                      className="shrink-0 text-muted-foreground/60 transition-colors hover:text-foreground"
                    >
                      <RotateCcw className="size-3" />
                    </button>
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground/50">
                    Falls back to the browser narrator
                  </span>
                )}
              </div>

              {audioError && (
                <p className="mt-2 text-[10px] text-hub-deep">{audioError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative mt-auto flex items-center justify-between border-t border-border px-5 py-2.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground/40 mono sm:px-6">
        <span>ElevenLabs Flash v2.1</span>
        <span className="flex items-center gap-1.5">
          <span className="size-1 rounded-full bg-route" />
          {audioSrc ? "Custom clip loaded" : "Simulated narrator"}
        </span>
      </div>
    </section>
  );
}
