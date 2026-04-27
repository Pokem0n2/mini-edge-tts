import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// Popular Edge TTS voices organized by language
const VOICES: Record<string, { name: string; label: string; locale: string }[]> = {
  "中文": [
    { name: "zh-CN-XiaoxiaoNeural", label: "晓晓 (女声)", locale: "zh-CN" },
    { name: "zh-CN-YunxiNeural", label: "云希 (男声)", locale: "zh-CN" },
    { name: "zh-CN-YunyangNeural", label: "云扬 (新闻)", locale: "zh-CN" },
    { name: "zh-CN-XiaoyiNeural", label: "小艺 (女声)", locale: "zh-CN" },
    { name: "zh-CN-YunfeiNeural", label: "云飞 (男声)", locale: "zh-CN" },
  ],
  "English": [
    { name: "en-US-AriaNeural", label: "Aria (US Female)", locale: "en-US" },
    { name: "en-US-GuyNeural", label: "Guy (US Male)", locale: "en-US" },
    { name: "en-US-JennyNeural", label: "Jenny (US Female)", locale: "en-US" },
    { name: "en-GB-SoniaNeural", label: "Sonia (UK Female)", locale: "en-GB" },
    { name: "en-GB-RyanNeural", label: "Ryan (UK Male)", locale: "en-GB" },
    { name: "en-AU-NatashaNeural", label: "Natasha (AU Female)", locale: "en-AU" },
  ],
  "日本語": [
    { name: "ja-JP-NanamiNeural", label: "七海 (女声)", locale: "ja-JP" },
    { name: "ja-JP-KeitaNeural", label: "圭太 (男声)", locale: "ja-JP" },
  ],
  "한국어": [
    { name: "ko-KR-SunHiNeural", label: "선희 (女声)", locale: "ko-KR" },
    { name: "ko-KR-InJoonNeural", label: "인준 (男声)", locale: "ko-KR" },
  ],
  "Deutsch": [
    { name: "de-DE-KatjaNeural", label: "Katja (女声)", locale: "de-DE" },
    { name: "de-DE-ConradNeural", label: "Conrad (男声)", locale: "de-DE" },
  ],
  "Français": [
    { name: "fr-FR-DeniseNeural", label: "Denise (女声)", locale: "fr-FR" },
    { name: "fr-FR-HenriNeural", label: "Henri (男声)", locale: "fr-FR" },
  ],
  "Español": [
    { name: "es-ES-ElviraNeural", label: "Elvira (女声)", locale: "es-ES" },
    { name: "es-MX-DaliaNeural", label: "Dalia (墨西哥女声)", locale: "es-MX" },
  ],
  "其他": [
    { name: "pt-BR-FranciscaNeural", label: "Francisca (巴西女声)", locale: "pt-BR" },
    { name: "it-IT-ElsaNeural", label: "Elsa (意大利女声)", locale: "it-IT" },
    { name: "ru-RU-SvetlanaNeural", label: "Svetlana (俄语女声)", locale: "ru-RU" },
    { name: "ar-SA-ZariahNeural", label: "Zariah (阿拉伯语女声)", locale: "ar-SA" },
    { name: "hi-IN-SwaraNeural", label: "Swara (印地语女声)", locale: "hi-IN" },
    { name: "th-TH-PremwadeeNeural", label: "Premwadee (泰语女声)", locale: "th-TH" },
    { name: "nl-NL-ColetteNeural", label: "Colette (荷兰女声)", locale: "nl-NL" },
    { name: "pl-PL-AgnieszkaNeural", label: "Agnieszka (波兰女声)", locale: "pl-PL" },
  ],
};

// Flatten for dropdown
const ALL_VOICES = Object.entries(VOICES).flatMap(([lang, voices]) =>
  voices.map((v) => ({ ...v, group: lang }))
);

const DEFAULT_VOICE = "zh-CN-XiaoxiaoNeural";
const DEFAULT_SPEED = 1.0;

export default function App() {
  const [text, setText] = useState("你好，欢迎使用 Mini Edge TTS！这是一个免费的文字转语音工具。");
  const [voice, setVoice] = useState(DEFAULT_VOICE);
  const [speed, setSpeed] = useState(DEFAULT_SPEED);
  const [status, setStatus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [outputPath, setOutputPath] = useState("");
  const [voiceExpanded, setVoiceExpanded] = useState(false);

  async function handleGenerate() {
    if (!text.trim()) {
      setStatus("请输入要转换的文本！");
      return;
    }
    setIsGenerating(true);
    setStatus("正在生成语音...");
    setOutputPath("");
    try {
      const resultPath: string = await invoke("generate_tts", {
        text: text.trim(),
        voice,
        speed,
      });
      setOutputPath(resultPath);
      setStatus(`✅ 已保存至: ${resultPath}`);
    } catch (err) {
      setStatus(`❌ 生成失败: ${String(err)}`);
    } finally {
      setIsGenerating(false);
    }
  }

  const speedLabel =
    speed === 1.0 ? "正常" : speed < 1.0 ? `慢 ${(speed * 100).toFixed(0)}%` : `快 ${(speed * 100).toFixed(0)}%`;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>🎙️ Mini Edge TTS</h1>
        <p style={styles.subtitle}>免费微软 Edge 文字转语音 · 无需 API Key</p>
      </div>

      {/* Voice Selector */}
      <div style={styles.section}>
        <label style={styles.label}>🎤 音色</label>
        <div style={styles.voiceSelector}>
          <button style={styles.voiceToggle} onClick={() => setVoiceExpanded(!voiceExpanded)}>
            {ALL_VOICES.find((v) => v.name === voice)?.label ?? voice}
            <span style={{ marginLeft: 8 }}>{voiceExpanded ? "▲" : "▼"}</span>
          </button>
          {voiceExpanded && (
            <div style={styles.voiceDropdown}>
              {Object.entries(VOICES).map(([lang, voices]) => (
                <div key={lang}>
                  <div style={styles.voiceGroup}>{lang}</div>
                  {voices.map((v) => (
                    <button
                      key={v.name}
                      style={{ ...styles.voiceOption, ...(voice === v.name ? styles.voiceOptionActive : {}) }}
                      onClick={() => { setVoice(v.name); setVoiceExpanded(false); }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Speed Slider */}
      <div style={styles.section}>
        <label style={styles.label}>
          ⚡ 语速 <span style={styles.badge}>{speedLabel}</span>
        </label>
        <div style={styles.sliderRow}>
          <span style={styles.sliderHint}>0.5x</span>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={styles.slider}
          />
          <span style={styles.sliderHint}>2.0x</span>
        </div>
      </div>

      {/* Text Input */}
      <div style={styles.section}>
        <label style={styles.label}>📝 输入文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在这里输入需要转换为语音的文本..."
          style={styles.textarea}
          rows={5}
        />
        <div style={styles.charCount}>{text.length} 字符</div>
      </div>

      {/* Generate Button */}
      <button
        style={{ ...styles.button, ...(isGenerating ? styles.buttonDisabled : {}) }}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? "🔄 生成中..." : "🎵 生成 MP3"}
      </button>

      {/* Status */}
      {status && (
        <div style={styles.status}>
          {status}
          {outputPath && (
            <div style={{ marginTop: 8, fontSize: 12, color: "#aaa" }}>
              结果目录: <code style={{ background: "#2a2a4a", padding: "2px 6px", borderRadius: 4 }}>{outputPath}</code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    padding: "32px 24px",
    maxWidth: 640,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },
  header: { textAlign: "center", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#888" },
  section: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: "#ccc" },
  badge: {
    fontSize: 12,
    background: "#3a3a5c",
    color: "#a0a0c0",
    padding: "2px 8px",
    borderRadius: 10,
    marginLeft: 8,
    fontWeight: 400,
  },
  voiceSelector: { position: "relative" as const },
  voiceToggle: {
    width: "100%",
    padding: "10px 14px",
    background: "#252540",
    border: "1px solid #3a3a5c",
    borderRadius: 8,
    color: "#e0e0e0",
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left" as const,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  voiceDropdown: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    background: "#1e1e38",
    border: "1px solid #3a3a5c",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 300,
    overflowY: "auto" as const,
    zIndex: 100,
    boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
  },
  voiceGroup: {
    padding: "6px 12px 2px",
    fontSize: 11,
    fontWeight: 700,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  },
  voiceOption: {
    width: "100%",
    padding: "8px 12px",
    background: "transparent",
    border: "none",
    color: "#c0c0d0",
    fontSize: 13,
    cursor: "pointer",
    textAlign: "left" as const,
  },
  voiceOptionActive: { background: "#2a2a50", color: "#7dd3fc" },
  sliderRow: { display: "flex", alignItems: "center", gap: 12 },
  sliderHint: { fontSize: 12, color: "#666", minWidth: 28 },
  slider: { flex: 1, accentColor: "#7dd3fc" },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    background: "#252540",
    border: "1px solid #3a3a5c",
    borderRadius: 8,
    color: "#e0e0e0",
    fontSize: 14,
    resize: "vertical" as const,
    fontFamily: "inherit",
    lineHeight: 1.6,
    outline: "none",
  },
  charCount: { fontSize: 12, color: "#666", textAlign: "right" as const },
  button: {
    padding: "14px 24px",
    background: "linear-gradient(135deg, #3a7bd5, #00d2ff)",
    border: "none",
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
  status: {
    padding: "12px 16px",
    background: "#1e1e38",
    border: "1px solid #3a3a5c",
    borderRadius: 8,
    fontSize: 13,
    color: "#c0c0d0",
    wordBreak: "break-all" as const,
  },
};
