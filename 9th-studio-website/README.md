# 9th Studio — 个人作品集网站

## 项目结构

```
9th-studio-website/
├── index.html          # 入口页面
├── styles.css          # 样式文件（星空渐变背景、动画等）
├── app.jsx             # React 主应用（页面结构、交互逻辑）
├── i18n.js             # 6语言翻译（繁中/简中/英/日/韩/西）
├── package.json        # 项目配置
├── .gitignore
└── assets/
    └── avatar/
        └── avatar.gif  # 头像图片
```

## 技术说明

- 纯静态网站，**无需构建步骤**，直接部署即可
- 使用 React 18 + Babel Standalone（浏览器端编译 JSX）
- 支持 6 种语言切换（默认繁體中文）
- 星空渐变背景 + 滚动动画 + 委托档期状态

---

## 部署方式一：Netlify 拖拽上线（最简单）

### 步骤：

1. 打开 https://app.netlify.com/drop
2. 把整个 `9th-studio-website` 文件夹**直接拖进去**
3. 等待几秒，Netlify 会自动生成一个网址（如 `random-name.netlify.app`）
4. 完成！网站已上线

### 自定义域名：
- 在 Netlify 后台 → Site settings → Domain management → Add custom domain
- 按提示配置 DNS 即可

---

## 部署方式二：Vercel 拖拽上线

### 步骤：

1. 打开 https://vercel.com/new
2. 选择 **"Deploy"** → **"Upload"**（或直接拖拽文件夹到页面）
3. 把 `9th-studio-website` 文件夹拖进去
4. Framework Preset 选择 **"Other"**（因为是纯静态）
5. 点击 **Deploy**
6. 等待完成，Vercel 会生成网址（如 `project-name.vercel.app`）

### Vercel CLI 方式（可选）：
```bash
npm i -g vercel
cd 9th-studio-website
vercel
```

---

## 部署方式三：GitHub Pages

1. 在 GitHub 创建新仓库
2. 上传所有文件到仓库
3. Settings → Pages → Source 选 `main` 分支 → Save
4. 等待几分钟，网站会在 `用户名.github.io/仓库名` 上线

---

## 后续修改指南

### 修改文字内容
- 打开 `i18n.js`，找到对应语言（如 `"zh-TW"`），修改对应字段即可
- 所有页面文字都在这个文件里，改完保存重新上传即可

### 修改作品展示
- 打开 `app.jsx`，找到 `WORKS_DATA` 数组
- 每个作品包含：`id`, `category`, `title`, `desc`, `video`, `tech`
- 添加/修改/删除作品后保存即可
- 视频链接替换为你自己的视频 URL

### 修改头像
- 替换 `assets/avatar/avatar.gif` 文件（保持文件名不变）
- 或在 `app.jsx` 中修改 `AVATAR_URL` 常量

### 修改 Logo
- 在 `app.jsx` 中修改 `LOGO_URL` 常量为你的 Logo 图片 URL

### 修改委托档期状态
- 在 `app.jsx` 中修改 `COMMISSION_STATUS` 常量：
  - `"open"` = 开放委托
  - `"full"` = 额满
  - `"paused"` = 暂停

### 修改价目表
- 打开 `app.jsx`，找到 `Pricing` 组件中的 `items` 数组
- 修改 `title`, `price`, `desc` 即可

---

## 本地预览

直接双击 `index.html` 即可在浏览器中预览。

如果遇到跨域问题，可以用本地服务器：
```bash
# Python
python -m http.server 8000

# 或 Node.js
npx serve
```
然后访问 http://localhost:8000
