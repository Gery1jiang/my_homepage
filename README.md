# 本地书签导航主页 - 部署使用指南

本项目是一个完全本地化的浏览器起始页，支持书签管理（导入、导出浏览器收藏书签（书签可视化））、点击统计、拖拽排序、文件夹层级、本地所有浏览器无感“同步”等功能，所有数据存储在本地，无需联网，服务开机自启。

## 📦 前置条件

- **Node.js** (v16 或更高版本)  
  下载安装: [https://nodejs.org/](https://nodejs.org/)
- **Git** (用于克隆仓库，可选，也可直接下载ZIP)  
  下载安装: [https://git-scm.com/](https://git-scm.com/)
- **Windows 用户** 建议以管理员身份运行部分命令

## 🚀 快速开始

### 1️⃣ 获取项目代码

**方式一：使用 Git 克隆**
```bash
git clone https://github.com/Gery1jiang/my_homepage.git
cd my_homepage
```

**方式二：直接下载 ZIP**  
访问 `https://github.com/Gery1jiang/my_homepage` → 点击 "Code" → "Download ZIP" → 解压到任意文件夹，如 `D:\my_homepage`

### 2️⃣ 安装依赖

项目只需要一个全局工具 `http-server` 和进程管理器 `pm2`。  
在项目文件夹内打开命令提示符 (或 PowerShell)，执行：

```bash
npm install -g http-server pm2
```

> 如果提示权限错误，请以管理员身份运行命令行。

### 3️⃣ 启动服务

在项目文件夹内执行：

```bash
pm2 start server.js --name "my-homepage"
```

然后保存 PM2 配置：

```bash
pm2 save
```

现在打开浏览器访问 `http://localhost:51888`，应该能看到你的主页。

### 4️⃣ (可选) 修改端口

编辑 `server.js` 文件，找到 `const port = 51888;` 这一行，改成你想要的端口号（比如 `3000`、`8080` 等），然后重启服务：

```bash
pm2 restart my-homepage
```

## 🧩 开机自启配置 (Windows)

由于 `pm2 startup` 在 Windows 上不完全支持，我们使用 `pm2-windows-startup` 工具。

1. 安装工具：
   ```bash
   npm install -g pm2-windows-startup
   ```

2. 安装开机启动项：
   ```bash
   pm2-startup install
   ```

   > 执行后，会在 Windows 启动文件夹中创建一个快捷方式，系统启动时会自动恢复之前 `pm2 save` 保存的进程列表。

3. 重启电脑验证：
   ```bash
   shutdown /r /t 0
   ```
   重启后打开浏览器访问 `http://localhost:51888`，主页应正常显示。

## 🛠️ 日常使用与维护

### 修改书签和外观

- 所有书签数据和点击统计保存在 `data.json` 文件中（首次启动自动生成）。
- 修改前端样式或逻辑只需编辑 `index.html`，保存后刷新浏览器即可生效（无需重启服务）。
- **最简工作流**：
  ```bash
  git pull                   # 拉取最新更新（若有）
  # 编辑 index.html 或 server.js
  pm2 restart my-homepage    # 如果修改了 server.js 需要重启
  ```

### 数据备份与恢复

- **备份**：直接复制 `data.json` 文件保存即可。
- **恢复**：将备份的 `data.json` 复制回项目文件夹，然后重启服务：
  ```bash
  pm2 restart my-homepage
  ```

### 导入/导出书签 (HTML格式)

- 在主界面左下角点击 **导入书签** 按钮，选择从浏览器导出的书签 HTML 文件（增量合并）。
- 点击 **导出书签** 按钮，可将当前书签结构保存为标准 HTML 文件，兼容 Chrome/Firefox 导入。

### 常用 PM2 命令

| 命令 | 作用 |
|------|------|
| `pm2 status` | 查看服务运行状态 |
| `pm2 logs my-homepage` | 查看实时日志 |
| `pm2 restart my-homepage` | 重启服务 |
| `pm2 stop my-homepage` | 停止服务 |
| `pm2 delete my-homepage` | 删除进程（需重新启动） |
| `pm2 save` | 保存当前进程列表（用于开机恢复） |

## ❓ 常见问题

### 1. 端口被占用怎么办？
- 修改 `server.js` 中的 `port` 变量，例如改为 `58000`，然后重启服务。
- 同时修改浏览器新标签页扩展中设置的 URL 为 `http://localhost:58000`。

### 2. 图标显示不出来？
- 默认使用 Google Favicon 服务，个别网站可能无法获取。可尝试刷新页面或检查网络连接。
- 若使用 Edge 浏览器，请确保没有禁用第三方图像的加载（设置 → 隐私和安全 → 允许加载不安全内容）。

### 3. 如何将本主页设置为浏览器新标签页？
- 安装 Chrome/Edge 扩展 **New Tab Redirect**。
- 在扩展选项中填写 URL：`http://localhost:51888`（或你修改后的端口）。
- 开启“替换新标签页”选项。

### 4. 开机自启没有生效？
- 确认以管理员身份执行过 `pm2-startup install`。
- 检查 Windows 启动文件夹（`shell:startup`）中是否存在 `PM2 Startup` 快捷方式。
- 若无，可手动创建一个 `start_homepage.bat` 文件，内容为：
  ```batch
  @echo off
  cd /d "D:\my_homepage"   (改成你的实际路径)
  pm2 resurrect
  ```
  然后将该 `.bat` 文件的快捷方式放入启动文件夹。

### 5. 数据丢失了怎么办？
- 检查 `data.json` 文件是否被意外删除。如果没有备份，数据无法恢复。建议定期复制 `data.json` 到其他位置。

## 📄 项目结构

```
my_homepage/
├── server.js           # Node.js 后端 (提供API和静态文件)
├── index.html          # 前端主页
├── data.json           # 自动生成，存储书签和点击统计
├── package.json        # (可选，如果没有可以忽略)
└── README.md           # 本文件
```

## 📌 更新项目

如果你之前是从 GitHub 克隆的，且希望获取最新代码：

```bash
git pull
pm2 restart my-homepage
```

如果修改过端口等配置，可能需要同步修改 `server.js` 中的端口。

## ⚠️ 注意事项

- **不要删除 `data.json`**，否则会丢失所有书签和点击记录。
- 如果更换电脑或重装系统，请备份 `data.json` 和项目文件夹。
- 建议使用私有的 Git 仓库存储代码，避免将 `data.json` 上传（已在 `.gitignore` 中忽略）。

---

**Enjoy!** 🎉
