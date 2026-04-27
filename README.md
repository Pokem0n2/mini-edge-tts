# Mini Edge TTS

基于微软 Edge TTS 的免费文字转语音工具，使用 Tauri + React 构建桌面应用。

## 功能特性

- 🎙️ **免费微软 Edge TTS** - 无需 API Key，直接调用微软在线语音服务
- 🌐 **多语言音色** - 支持 20+ 种语音（中、英、日、韩、德、法等）
- ⚡ **语速调节** - 滑杆自由调节语速 (0.5x - 2.0x)
- 💾 **MP3 保存** - 一键生成并保存为 MP3 文件到 `results` 文件夹

## 构建步骤

### 1. 安装依赖

**Node.js 20+**
```bash
# Windows: https://nodejs.org/
# 或使用 winget:
winget install OpenJS.NodeJS.LTS
```

**Rust**
```bash
# Windows: https://rustup.rs/
# 或使用 winget:
winget install Rustlang.Rustup
```

### 2. 克隆项目

```bash
git clone https://github.com/Pokem0n2/mini-edge-tts.git
cd mini-edge-tts
```

### 3. 安装前端依赖

```bash
npm install
```

### 4. 构建 exe

```bash
npm run tauri:build
```

exe 文件输出到：

```
src-tauri/target/x86_64-pc-windows-gnu/release/MiniEdgeTTS.exe
```

### 5. 运行

双击 `MiniEdgeTTS.exe` 运行即可。生成的 MP3 文件保存在 exe 同目录下的 `results/` 文件夹中。

## 项目结构

```
mini-edge-tts/
├── src/                      # React 前端
│   └── App.tsx              # 主界面（音色选择、语速滑杆、文本输入）
├── src-tauri/               # Rust 后端
│   ├── src/lib.rs           # Tauri 命令，调用 msedge-tts 生成音频
│   ├── Cargo.toml           # Rust 依赖
│   └── tauri.conf.json      # Tauri 配置
├── results/                  # MP3 输出目录（运行后自动创建）
└── README.md
```

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Tauri 2 (Rust)
- **TTS 引擎**: msedge-tts（纯 Rust，无需 Python）

## 常见问题

**Q: 生成的 MP3 在哪里？**
A: 在 exe 同目录下的 `results/` 文件夹中，每次生成会自动创建。

**Q: 支持哪些音色？**
A: 支持所有微软 Edge TTS 音色，包括中文（晓晓、云希、云扬等）、英文（美式、英式、澳式）、日语、韩语、德语、法语等 20+ 种。

**Q: 语速范围是多少？**
A: 0.5x（半速）到 2.0x（双倍速），默认 1.0x 正常速度。
