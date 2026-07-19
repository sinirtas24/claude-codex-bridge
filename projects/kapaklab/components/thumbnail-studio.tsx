"use client";

/* eslint-disable @next/next/no-img-element -- Object URLs and generated data URLs are already final thumbnail assets. */

import { useEffect, useRef, useState } from "react";
import { Download, ImageIcon, LoaderCircle, Play, Sparkles, Upload, WandSparkles } from "lucide-react";
import type { GenerateResponse, GeneratedThumbnail } from "@/lib/types";

type StatusMode = "checking" | "ai" | "demo" | "unconfigured";

export function ThumbnailStudio() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [results, setResults] = useState<GeneratedThumbnail[]>([]);
  const [mode, setMode] = useState<StatusMode>("checking");
  const [resultMode, setResultMode] = useState<"ai" | "demo" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setMode(data.mode))
      .catch(() => setMode("unconfigured"));
  }, []);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  function choosePhoto(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Lütfen geçerli bir fotoğraf seç.");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPhoto(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photo) {
      setError("Önce net bir yüz fotoğrafı yüklemelisin.");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);
    setResultMode(null);
    const formData = new FormData(event.currentTarget);
    formData.set("photo", photo);

    try {
      const response = await fetch("/api/generate", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Kapaklar oluşturulamadı.");
      const payload = data as GenerateResponse;
      setResults(payload.thumbnails);
      setResultMode(payload.mode);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="shell topbar-inner">
          <div className="brand"><span className="brand-mark"><Play size={19} fill="currentColor" /></span> KapakLab</div>
          <div className="status-chip"><span className="status-dot" /> {mode === "ai" ? "AI üretimi hazır" : mode === "demo" ? "Demo modu aktif" : mode === "checking" ? "Sistem kontrol ediliyor" : "API kurulumu gerekli"}</div>
        </div>
      </header>

      <main className="shell">
        <section className="hero">
          <div className="eyebrow"><Sparkles size={13} /> Yapay zekâ destekli YouTube tasarımı</div>
          <h1>Bir fotoğraf yükle.<br /><span>Üç güçlü kapak al.</span></h1>
          <p>Konunu anlat; sistem başlığı, sahneyi ve kompozisyonu planlasın. Her üretimde birbirinden farklı üç adet 1280×720 kapak hazırlansın.</p>
        </section>

        <section className="workspace">
          <form className="panel form-panel" onSubmit={handleSubmit}>
            <div className="panel-title"><span className="step">1</span><h2>Video bilgileri</h2></div>

            {error && <div className="error-box" role="alert">{error}</div>}

            <div className="field">
              <label>Fotoğrafın</label>
              <div className="dropzone">
                <input name="photo-picker" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => choosePhoto(e.target.files?.[0])} aria-label="Fotoğraf yükle" />
                {previewUrl ? (
                  <><img className="preview-photo" src={previewUrl} alt="Yüklenen fotoğraf önizlemesi" /><div className="preview-shade" /><div className="change-photo">Değiştirmek için tıkla</div></>
                ) : (
                  <div className="dropzone-content"><Upload className="dropzone-icon" /><strong>Net bir yüz fotoğrafı yükle</strong><span>JPG, PNG veya WebP · en fazla 8 MB</span></div>
                )}
              </div>
              <small>En iyi sonuç için yüzün net, önden ve iyi aydınlatılmış olsun.</small>
            </div>

            <div className="field">
              <label htmlFor="topic">Video konusu</label>
              <textarea className="textarea" id="topic" name="topic" minLength={5} maxLength={500} required placeholder="Örn: Bambu Lab A1 yazıcıyı 30 gün kullandım; iyi ve kötü yanlarını dürüstçe anlatıyorum." />
            </div>

            <div className="field">
              <label htmlFor="audience">Hedef kitle <span style={{ color: "#727986", fontWeight: 500 }}>(isteğe bağlı)</span></label>
              <input className="input" id="audience" name="audience" maxLength={120} placeholder="Örn: 3D yazıcıya yeni başlayanlar" />
            </div>

            <div className="grid-two">
              <div className="field">
                <label htmlFor="style">Kapak stili</label>
                <select className="select" id="style" name="style" defaultValue="viral">
                  <option value="viral">Viral / enerjik</option><option value="professional">Profesyonel</option><option value="educational">Eğitici</option><option value="technology">Teknoloji</option><option value="mystery">Gizemli</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="expression">Yüz ifadesi</label>
                <select className="select" id="expression" name="expression" defaultValue="excited">
                  <option value="natural">Doğal</option><option value="excited">Heyecanlı</option><option value="surprised">Şaşkın</option><option value="serious">Ciddi</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label htmlFor="language">Başlık dili</label>
              <select className="select" id="language" name="language" defaultValue="tr">
                <option value="tr">Türkçe</option><option value="de">Almanca</option><option value="en">İngilizce</option>
              </select>
            </div>

            <button className="generate-btn" disabled={loading || mode === "unconfigured"} type="submit">
              {loading ? <><LoaderCircle className="spin" size={18} /> 3 kapak hazırlanıyor…</> : <><WandSparkles size={18} /> 3 KAPAK OLUŞTUR</>}
            </button>
          </form>

          <div className="panel result-panel" ref={resultRef}>
            <div className="result-head">
              <div><h2>Kapak seçeneklerin</h2><p>Her seçenek farklı bir başlık, renk ve kompozisyon kullanır.</p></div>
              <span className="mode-badge">1280 × 720 · JPG</span>
            </div>

            {loading ? (
              <div className="loading-grid"><div className="skeleton" /><div className="skeleton" /><div className="skeleton" /><div className="loading-copy">Önce başlıklar planlanıyor, ardından üç farklı görsel üretiliyor. Gerçek AI üretimi 1–3 dakika sürebilir.</div></div>
            ) : results.length ? (
              <>
                {resultMode === "demo" && <div className="error-box" style={{ borderColor: "rgba(255,200,61,.28)", background: "rgba(255,200,61,.07)", color: "#fde68a" }}>Bu çıktılar ücretsiz demo önizlemesidir. Gerçek sahne ve yüz üretimi için OPENAI_API_KEY eklenmelidir.</div>}
                <div className="results-grid">
                  {results.map((result, index) => (
                    <article className="result-card" key={result.id}>
                      <div className="cover-wrap"><img src={result.image} alt={`${result.title} YouTube kapağı`} /><span className="variant-number">0{index + 1}</span></div>
                      <div className="card-body"><h3>{result.title}</h3><div className="card-meta">{result.hook} · 16:9</div><a className="download-btn" href={result.image} download={`youtube-kapak-${index + 1}.jpg`}><Download size={14} /> JPG indir</a></div>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state"><div className="empty-inner"><ImageIcon className="empty-icon" /><h3>Kapakların burada görünecek</h3><p>Sol taraftan fotoğrafını ve video konusunu eklediğinde üç farklı tasarım aynı anda hazırlanır.</p></div></div>
            )}

            <div className="tips"><div className="tip"><strong>Yüz benzerliği</strong>Tek kişi bulunan, net ve önden çekilmiş fotoğraf kullan.</div><div className="tip"><strong>Doğru başlık</strong>Başlıklar ayrıca işlendiği için AI harf hatası yapmaz.</div><div className="tip"><strong>Gerçek çeşitlilik</strong>Üç seçenek farklı kompozisyon kurallarıyla üretilir.</div></div>
          </div>
        </section>
      </main>
    </>
  );
}
