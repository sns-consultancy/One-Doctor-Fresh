import React, { useEffect, useRef, useState } from "react";
import "./camera-heart-rate.css";

const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);

export default function CameraHeartRateWeb() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [bpm, setBpm] = useState(null);
  const [quality, setQuality] = useState(0);
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const trackRef = useRef(null);
  const rafRef = useRef(0);
  const times = useRef([]);
  const values = useRef([]);

  // try enabling torch on capable browsers (Chrome/Android)
  const tryTorch = async (on) => {
    try {
      const track = trackRef.current;
      if (!track) return false;
      const cap = track.getCapabilities?.();
      if (!cap || !cap.torch) return false;
      await track.applyConstraints({ advanced: [{ torch: !!on }] });
      setTorchOn(!!on);
      return true;
    } catch {
      return false;
    }
  };

  const start = async () => {
    setBpm(null);
    setQuality(0);
    values.current = [];
    times.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: "environment" },
        frameRate: { ideal: 30, max: 60 },
        width: { ideal: 640 },
        height: { ideal: 480 },
      },
      audio: false,
    });
    const video = videoRef.current;
    video.srcObject = stream;
    await video.play();

    const [track] = stream.getVideoTracks();
    trackRef.current = track;
    const caps = track.getCapabilities?.();
    setTorchSupported(!!caps?.torch);
    if (caps?.torch) await tryTorch(true); // best effort

    setRunning(true);
    loop();
  };

  const stop = () => {
    setRunning(false);
    cancelAnimationFrame(rafRef.current);
    if (trackRef.current) {
      tryTorch(false);
      trackRef.current.stop();
      trackRef.current = null;
    }
    const video = videoRef.current;
    if (video?.srcObject) {
      video.srcObject.getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  };

  const loop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = 160, h = 120; // small buffer for speed
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    // mean red channel
    let sumR = 0;
    for (let i = 0; i < data.length; i += 4) sumR += data[i];
    const redMean = sumR / (data.length / 4);

    const now = performance.now();
    values.current.push(redMean);
    times.current.push(now);

    // keep ~10s
    while (times.current.length && now - times.current[0] > 10000) {
      times.current.shift(); values.current.shift();
    }

    // compute quality (variance of last 2s)
    const idx2s = times.current.findIndex((t) => now - t <= 2000);
    const last = idx2s >= 0 ? values.current.slice(idx2s) : values.current;
    const mu = mean(last);
    const variance = mean(last.map((v) => (v - mu) ** 2));
    const q = Math.max(0, Math.min(1, variance / 50)); // crude normalization
    setQuality(Number(q.toFixed(2)));

    // simple peak count using moving average
    if (times.current.length > 30) {
      const sm = mean(values.current.slice(-15));
      let peaks = 0;
      for (let i = 1; i < values.current.length; i++) {
        if (values.current[i - 1] < sm && values.current[i] >= sm) peaks++;
      }
      const secs = (times.current.at(-1) - times.current[0]) / 1000;
      if (secs > 5) {
        const bpmEst = Math.round((peaks / secs) * 60);
        if (bpmEst > 35 && bpmEst < 200) setBpm(bpmEst);
      }
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => () => stop(), []); // cleanup on unmount

  const save = async () => {
    const base = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
    await fetch(`${base}/vitals/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        type: "bpm", value: bpm, unit: "bpm",
        source: "camera", quality, recorded_at: new Date().toISOString(),
      }),
    });
    alert("Saved!");
  };

  return (
    <div className="ch-container">
      <h2>Camera Heart Rate</h2>
      <p>Cover the rear camera fully with your fingertip. Keep still.</p>

      <div className="ch-videoWrap">
        <video ref={videoRef} playsInline muted className="ch-video" />
        <canvas ref={canvasRef} className="ch-canvas" />
      </div>

      <div className="ch-stats">
        <div>BPM: <strong>{bpm ?? "—"}</strong></div>
        <div>Signal quality: <strong>{quality}</strong></div>
        <div>
          Torch: {torchSupported ? (
            <>
              <button onClick={() => tryTorch(!torchOn)}>
                {torchOn ? "Turn Torch Off" : "Turn Torch On"}
              </button>
            </>
          ) : "Not available (iOS Safari). Use phone flashlight manually."}
        </div>
      </div>

      <div className="ch-actions">
        {!running ? <button onClick={start}>Start</button> : <button onClick={stop}>Stop</button>}
        <button onClick={save} disabled={!bpm}>Save Reading</button>
      </div>

      <p className="ch-note">
        Informational only. Not a medical device. For iOS Safari, torch control isn’t exposed — turn on your flashlight manually.
      </p>
    </div>
  );
}
