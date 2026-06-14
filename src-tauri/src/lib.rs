use chrono::Utc;
use serde_json::{json, Value};
use std::{fs, path::PathBuf};
use tauri::{AppHandle, Manager};

fn state_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;
    Ok(dir.join("learner-state.json"))
}

#[tauri::command]
fn load_state(app: AppHandle) -> Result<Value, String> {
    let path = state_path(&app)?;
    if !path.exists() {
        return Ok(json!({}));
    }
    let raw = fs::read_to_string(path).map_err(|e| e.to_string())?;
    serde_json::from_str(&raw).map_err(|e| e.to_string())
}

#[tauri::command]
fn save_state(app: AppHandle, state: Value) -> Result<Value, String> {
    let path = state_path(&app)?;
    let temp = path.with_extension("tmp");
    let raw = serde_json::to_string_pretty(&state).map_err(|e| e.to_string())?;
    fs::write(&temp, raw).map_err(|e| e.to_string())?;
    fs::rename(temp, path).map_err(|e| e.to_string())?;
    Ok(json!({ "savedAt": Utc::now().to_rfc3339() }))
}

#[tauri::command]
fn export_state(app: AppHandle) -> Result<String, String> {
    let path = state_path(&app)?;
    fs::read_to_string(path).map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            load_state,
            save_state,
            export_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running Apex A+ Academy");
}
