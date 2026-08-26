# GitHub + Netlify 部署 & 在线编辑指南

## 为什么用 GitHub + Netlify？

- ✅ 可以在**任何设备**（电脑/手机）的浏览器上直接改文字、换作品、调价目
- ✅ 改完保存后 **Netlify 自动重新部署**，1-2 分钟生效
- ✅ 不需要本地装任何软件，不需要懂命令行
- ✅ 所有修改有历史记录，改错了可以回退

---

## 第一步：在 GitHub 创建仓库

1. 打开 https://github.com/new （需要先注册/登录 GitHub 账号）
2. **Repository name** 填：`9th-studio-website`
3. 选 **Public**（公开，Netlify 免费部署需要）
4. **不要**勾选 "Add a README file"（我们已经有了）
5. 点 **Create repository**

---

## 第二步：上传文件到 GitHub

创建仓库后，你会看到一个 "Quick setup" 页面：

1. 点页面上的 **"uploading an existing file"** 链接
2. 打开本地文件夹 `C:\Users\Lenovo\Desktop\作品集\9th-studio-website`
3. **全选所有文件和文件夹**（Ctrl+A），直接拖到 GitHub 网页的上传区域
4. 等上传完成（avatar.gif 较大，需要等一下）
5. 页面底部点 **Commit changes**

> 注意：要把 `assets` 文件夹也一起拖进去，GitHub 支持拖拽上传文件夹。

---

## 第三步：Netlify 连接 GitHub 仓库

1. 打开 https://app.netlify.com （登录/注册 Netlify 账号）
2. 点 **Add new site** → **Import an existing project**
3. 选 **GitHub**（授权 Netlify 访问你的 GitHub）
4. 找到并选择 `9th-studio-website` 仓库
5. 配置页面：
   - **Branch to deploy**：`main`
   - **Build command**：留空（不需要构建）
   - **Publish directory**：留空（根目录就是网站）
6. 点 **Deploy site**
7. 等 1-2 分钟，网站上线！会生成一个网址如 `xxx-xxx-xxx.netlify.app`

---

## 第四步：以后如何在线修改（最重要）

### 修改文字 / 翻译
1. 打开你的 GitHub 仓库页面：`https://github.com/你的用户名/9th-studio-website`
2. 点 `i18n.js` 文件
3. 点右上角 **铅笔图标** ✏️ 进入编辑
4. 找到对应语言（如 `"zh-TW"`），修改文字
5. 拉到页面底部，点 **Commit changes**
6. 等 1-2 分钟，Netlify 自动更新网站

### 修改作品展示
1. 点 `app.jsx` 文件 → 铅笔图标 ✏️
2. 找到 `const WORKS_DATA = [` 这一行
3. 按格式添加/修改/删除作品（每个作品是一个 `{...}` 对象）
4. Commit changes → 自动部署

### 修改价目表
1. 点 `app.jsx` → 铅笔图标 ✏️
2. 找到 `function Pricing` 里的 `const items = [`
3. 修改 `title`、`price`、`desc`
4. Commit changes → 自动部署

### 修改委托档期状态
1. 点 `app.jsx` → 铅笔图标 ✏️
2. 找到 `const COMMISSION_STATUS = "open"`
3. 改成 `"open"`（开放）/ `"full"`（额满）/ `"paused"`（暂停）
4. Commit changes → 自动部署

### 替换头像
1. GitHub 仓库页面点 `assets` → `avatar` 文件夹
2. 点 **Add file** → **Upload files**
3. 上传新的头像图片，**文件名必须是 `avatar.gif`**（会覆盖旧的）
4. Commit changes → 自动部署

---

## 常见问题

**Q: 改错了怎么办？**
A: GitHub 有完整历史记录。点文件页面的 **History** 可以看到所有修改版本，随时可以回退。

**Q: 手机上能改吗？**
A: 可以！用手机浏览器打开 GitHub 仓库，操作方式和电脑一样。

**Q: 上传后网站还是旧的？**
A: 等 1-2 分钟，Netlify 需要时间自动构建。可以在 Netlify 后台的 **Deploys** 页面查看进度。

**Q: 想要自己的域名（如 9thstudio.com）？**
A: Netlify 后台 → Site settings → Domain management → Add custom domain，按提示配置 DNS。
