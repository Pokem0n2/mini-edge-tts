# Mini Edge TTS

基于微软 Edge TTS 的免费文字转语音工具，使用 Tauri + React 构建桌面应用。

## 功能特性

- 🎙️ **免费微软 Edge TTS** - 无需 API Key，直接调用微软在线语音服务
- 🌐 **多语言音色** - 支持 100+ 种语音（中、英、日、韩、德、法等）
- ⚡ **语速调节** - 滑杆自由调节语速 (0.5x - 2.0x)
- 💾 **MP3 保存** - 一键生成并保存为 MP3 文件到 `results` 文件夹

## 使用方法

### 预构建版本

前往 [Releases](https://github.com/你的用户名/mini-edge-tts/releases) 下载最新 `.exe` 文件，双击运行即可。

### 从源码构建

#### Windows (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/你的用户名/mini-edge-tts.git
cd mini-edge-tts

# 2. 安装依赖
npm install

# 3. 构建
npm run tauri:build
```

#### WSL/Linux (交叉编译)

```bash
# 安装 Rust 交叉编译工具链
rustup target add x86_64-pc-windows-gnu
sudo apt-get install mingw-w64

npm install
cd src-tauri && cargo build --target x86_64-pc-windows-gnu --release
```

## 项目结构

```
mini-edge-tts/
├── src/                    # React 前端
│   ├── components/         # UI 组件
│   ├── App.tsx             # 主应用
│   └── main.tsx            # 入口
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   └── main.rs         # Tauri 入口 + 命令
│   ├── Cargo.toml
│   └── tauri.conf.json
└── results/                # 生成的 MP3 文件保存目录
```

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Tauri 2 (Rust)
- **TTS 引擎**: edge-tts (Python)
- **打包**: PyInstaller (将 Python 运行时和 edge-tts 一起打包)

## 授权

MIT License
