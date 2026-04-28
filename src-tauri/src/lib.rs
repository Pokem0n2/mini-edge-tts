use std::env;
use std::fs;
use std::path::PathBuf;
use std::process::Command;

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

fn run_tts(text: String, voice: String, speed: f64) -> Result<String, String> {
    let results_dir = get_results_dir();
    let output_path = results_dir.join(format!("tts_{}.mp3", timestamp()));

    let rate_pct = ((speed - 1.0) * 100.0).round() as i32;
    let rate_str = if rate_pct >= 0 {
        format!("+{}%", rate_pct)
    } else {
        format!("{}%", rate_pct)
    };

    let exe_dir = env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()));

    // Try wrapper first
    if let Some(result) = try_wrapper(&exe_dir, &text, &voice, &rate_str, &output_path) {
        return result;
    }

    // Fallback: direct edge-tts
    direct_edge_tts(&text, &voice, &rate_str, &output_path)
}

fn try_wrapper(
    exe_dir: &Option<PathBuf>,
    text: &str,
    voice: &str,
    rate: &str,
    output_path: &PathBuf,
) -> Option<Result<String, String>> {
    let search_dirs: Vec<PathBuf> = exe_dir.iter().cloned().collect();
    let search_dirs = if search_dirs.is_empty() {
        vec![PathBuf::from(".")]
    } else {
        search_dirs
    };

    for dir in &search_dirs {
        // Bundled: edge_tts_wrapper.exe (same dir as main exe) — check first
        let exe_wrapper = dir.join("edge_tts_wrapper.exe");
        if exe_wrapper.exists() {
            let output = Command::new(&exe_wrapper)
                .arg(format!("--text={}", text))
                .arg(format!("--voice={}", voice))
                .arg(format!("--rate={}", rate))
                .arg(format!("--output={}", output_path.to_str().unwrap()))
                .output()
                .ok()?;

            if output.status.success() {
                return Some(Ok(output_path.to_string_lossy().to_string()));
            }
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Some(Err(format!("wrapper error: {}", stderr)));
        }

        // Dev: src-tauri/edge_tts_wrapper.py
        let py_wrapper = dir.join("edge_tts_wrapper.py");
        if py_wrapper.exists() {
            let output = Command::new("python")
                .arg(&py_wrapper)
                .arg(format!("--text={}", text))
                .arg(format!("--voice={}", voice))
                .arg(format!("--rate={}", rate))
                .arg(format!("--output={}", output_path.to_str().unwrap()))
                .output()
                .ok()?;

            if output.status.success() {
                return Some(Ok(output_path.to_string_lossy().to_string()));
            }
            let stderr = String::from_utf8_lossy(&output.stderr);
            return Some(Err(format!("wrapper error: {}", stderr)));
        }
    }

    None
}

fn direct_edge_tts(text: &str, voice: &str, rate: &str, output_path: &PathBuf) -> Result<String, String> {
    let output = Command::new("python")
        .args(["-m", "edge_tts"])
        .arg(format!("--text={}", text))
        .arg(format!("--voice={}", voice))
        .arg(format!("--rate={}", rate))
        .arg(format!("--write-media={}", output_path.to_str().unwrap()))
        .output()
        .or_else(|_| {
            Command::new("edge-tts")
                .arg(format!("--text={}", text))
                .arg(format!("--voice={}", voice))
                .arg(format!("--rate={}", rate))
                .arg(format!("--write-media={}", output_path.to_str().unwrap()))
                .output()
        })
        .map_err(|e| format!("edge-tts not available: {}", e))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("edge-tts failed: {}", stderr));
    }

    Ok(output_path.to_string_lossy().to_string())
}

#[tauri::command]
fn generate_tts(text: String, voice: String, speed: f64) -> Result<String, String> {
    run_tts(text, voice, speed)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
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
