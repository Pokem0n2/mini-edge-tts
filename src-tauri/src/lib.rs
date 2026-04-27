use anyhow::Result;
use msedge_tts::tts::client::connect;
use msedge_tts::{SpeechConfig, Voice};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;

fn get_results_dir() -> PathBuf {
    let exe_dir = env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));
    let results = exe_dir.join("results");
    if !results.exists() {
        let _ = fs::create_dir_all(&results);
    }
    results
}

fn timestamp() -> String {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    format!("{}", now.as_secs())
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TtsResult {
    pub path: String,
}

fn find_voice(voice_name: &str) -> Result<Voice> {
    let voices = msedge_tts::voice::get_voices_list()?;
    voices
        .into_iter()
        .find(|v| v.name == voice_name)
        .ok_or_else(|| anyhow::anyhow!("Voice not found: {}", voice_name))
}

#[tauri::command]
async fn generate_tts(text: String, voice: String, speed: f64) -> Result<String, String> {
    let results_dir = get_results_dir();
    let output_path = results_dir.join(format!("tts_{}.mp3", timestamp()));

    // Convert speed (0.5-2.0) to rate percentage
    let rate_pct = ((speed - 1.0) * 100.0).round() as i32;
    let rate_str = if rate_pct >= 0 {
        format!("+{}%", rate_pct)
    } else {
        format!("{}%", rate_pct)
    };

    // Find the voice
    let voice_obj = find_voice(&voice).map_err(|e| e.to_string())?;

    // Build SpeechConfig from voice
    let mut config = SpeechConfig::from(&voice_obj);
    config.set_rate(&rate_str).map_err(|e| e.to_string())?;

    // Synthesize
    let mut client = connect().map_err(|e| format!("failed to connect: {}", e))?;
    let audio = client
        .synthesize(&text, &config)
        .map_err(|e| format!("synthesis failed: {}", e))?;

    // Write to file
    fs::write(&output_path, audio.audio_bytes())
        .map_err(|e| format!("failed to write audio file: {}", e))?;

    Ok(output_path.to_string_lossy().to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![generate_tts])
        .setup(|_app| {
            let results = get_results_dir();
            let _ = fs::create_dir_all(&results);
            println!("[MiniEdgeTTS] Results directory: {:?}", results);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
