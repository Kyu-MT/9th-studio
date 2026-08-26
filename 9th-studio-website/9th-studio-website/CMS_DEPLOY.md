# 可视化编辑后台 (Decap CMS) 部署指南

## 这是什么？

装完后，访问 `你的网址/admin` 就能进入一个可视化后台，像编辑博客一样：
- ✅ 增删改作品（标题、分类、描述、视频链接、技术标签）
- ✅ 增删改价目表（服务名、价格、描述）
- ✅ 切换委托档期状态（开放/额满/暂停）
- ✅ 修改 Logo 和头像链接
- ✅ 手机电脑都能用，改完自动发布

---

## 第一步：上传新文件到 GitHub

把以下**新增/修改的文件**上传到 GitHub 仓库的 `9th-studio-website` 文件夹里：

**新增文件：**
- `admin/index.html`
- `admin/config.yml`
- `content/settings.json`
- `content/works.json`
- `content/pricing.json`
- `assets/uploads/` （空文件夹，上传图片用）

**修改文件：**
- `app.jsx` （已改为从 JSON 读取数据）

上传方法：
1. GitHub 仓库 → 点进 `9th-studio-website` 文件夹
2. 点 **Add file** → **Upload files**
3. 把本地 `9th-studio-website` 文件夹里的**所有文件和文件夹**拖进去（会覆盖旧的 app.jsx）
4. 等上传完 → 底部 **Commit changes**

> Netlify 会自动重新部署，等 1-2 分钟。

---

## 第二步：启用 Netlify Identity（登录认证）

1. 打开 Netlify 后台 → 你的网站
2. 左侧菜单点 **Integrations**（集成）
3. 找到 **Identity** → 点 **Enable**
4. 启用后，点 Identity 进入设置
5. 找到 **Registration** → 选 **Invite only**（仅邀请，防止别人注册）
6. 找到 **Services** → **Git Gateway** → 点 **Enable**（启用，这样 CMS 才能修改 GitHub 文件）

---

## 第三步：邀请自己为管理员

1. 在 Identity 设置页面，点 **Invite users**
2. 输入你的邮箱地址
3. 点 **Send**
4. 去邮箱查收邀请邮件，点里面的链接设置密码

---

## 第四步：登录使用

1. 访问 `你的网址/admin`（比如 `https://9th-studio.netlify.app/admin`）
2. 用你刚才设置的邮箱和密码登录
3. 进入后台后，左侧有三个栏目：
   - **网站设置**：改档期状态、Logo、头像
   - **作品展示**：增删改作品
   - **价目表**：增删改价格项目

4. 改完后点 **Publish**（发布）→ 网站自动更新

---

## 常见问题

**Q: 访问 /admin 显示空白或报错？**
A: 确认 admin/index.html 和 admin/config.yml 都上传到了正确位置（在 9th-studio-website/admin/ 下）。

**Q: 登录后提示没有权限？**
A: 确认 Git Gateway 已启用（Identity → Services → Git Gateway → Enable）。

**Q: 改完内容网站没更新？**
A: CMS 改完后会自动提交到 GitHub，Netlify 需要 1-2 分钟构建。可以在 Netlify 后台 Deploys 页面查看进度。

**Q: 想让别人也能编辑？**
A: 在 Identity 设置里 Invite users，邀请他们的邮箱即可。

**Q: 文字内容（自我介绍、按钮文字等）能在 CMS 里改吗？**
A: 目前 CMS 管理作品、价目表、档期状态。文字内容在 `i18n.js` 里，需要在 GitHub 上直接编辑。如果需要也加到 CMS，可以告诉我。

---

## 文件结构说明

```
9th-studio-website/
├── admin/
│   ├── index.html      ← CMS 登录页面
│   └── config.yml      ← CMS 配置（定义能编辑什么）
├── content/
│   ├── settings.json   ← 网站设置（档期、Logo、头像）
│   ├── works.json      ← 作品列表
│   └── pricing.json    ← 价目表
├── assets/
│   ├── avatar/
│   │   └── avatar.gif
│   └── uploads/        ← CMS 上传的图片存在这里
├── index.html
├── styles.css
├── app.jsx             ← 已改为从 JSON 读取数据
├── i18n.js             ← 多语言文字（手动编辑）
└── ...
```
