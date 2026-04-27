use anyhow::Result;
use msedge_tts::{Client, SynthesisOutputFormat};
use serde::{Deserialize, Serialize};
use std::env;
use std::fs;
use std::path::PathBuf;
use tauri::Manager;

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

#[tauri::command]
async fn generate_tts(text: String, voice: String, speed: f64) -> Result<String, String> {
    let results_dir = get_results_dir();
    let output_path = results_dir.join(format!("tts_{}.mp3", timestamp()));

    // Convert speed (0.5-2.0) to rate factor
    // speed=1.0 → rate=0, speed>1 → positive rate, speed<1 → negative rate
    let rate = (speed - 1.0) * 100.0;

    // Set up the Edge TTS client
    let mut client = Client::new();
    client
        .set_voice(&voice)
        .map_err(|e| e.to_string())?;

    // Set output format to MP3
    client
        .set_output_format(SynthesisOutputFormat::AudioFormat_Mp3_Abr22050Hz)
        .map_err(|e| e.to_string())?;

    // Set rate (e.g. "+10%" or "-20%")
    let rate_str = if rate >= 0.0 {
        format!("+{:.0}%", rate)
    } else {
        format!("{:.0}%", rate)
    };
    client.set_rate(&rate_str).map_err(|e| e.to_string())?;

    // Synthesize
    let audio = client
        .synthesize(&text)
        .await
        .map_err(|e| format!("synthesis failed: {}", e))?;

    // Write to file
    fs::write(&output_path, audio.audio_bytes())
        .map_err(|e| format!("failed to write audio file: {}", e))?;

    Ok(output_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_voices() -> Result<Vec<VoiceInfo>, String> {
    // Return the same voice list as the frontend
    // The frontend uses the same data, this is for potential future use
    Ok(vec![])
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VoiceInfo {
    pub name: String,
    pub label: String,
    pub locale: String,
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
