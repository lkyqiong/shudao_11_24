# 将 shudao_11_24 项目上传到 GitHub 完整指南

## 一、前置准备

### 1.1 检查 SSH 密钥
查看是否已经有 GitHub 的 SSH 密钥：
```bash
ls ~/.ssh
```

如果没有看到 `id_rsa.pub` 或 `new_id_rsa.pub`，需要生成密钥：
```bash
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

查看公钥内容（用于添加到 GitHub）：
```bash
cat ~/.ssh/id_rsa.pub
# 或
cat ~/.ssh/new_id_rsa.pub
```

### 1.2 在 GitHub 添加 SSH 密钥
1. 复制上面命令输出的公钥内容
2. 打开 GitHub → Settings → SSH and GPG keys
3. 点击 "New SSH key"
4. 粘贴公钥，保存

### 1.3 测试 SSH 连接
```bash
ssh -T git@github.com
```
如果看到 "Hi username! You've successfully authenticated" 就成功了。
以及，似乎不能用校园网链接，我是开的流量
---

## 二、在 GitHub 创建新仓库

### 2.1 创建仓库步骤
1. 登录 GitHub
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息：
   - **Repository name**: `shudao_11_24`（或其他你喜欢的名字）
   - **Description**: 云游蜀道 - 蜀道文化旅游平台
   - **Public/Private**: 选择公开或私有
   - ⚠️ **不要勾选** "Initialize this repository with a README"
   - ⚠️ **不要添加** .gitignore 和 license（本地已经有了）
4. 点击 "Create repository"

### 2.2 记录仓库地址
创建后会显示 SSH 地址，类似：（不用HTTPS而是用SSH，注意）
```
git@github.com:你的用户名/shudao_11_24.git
```
记住这个地址，后面会用到。

---

## 三、本地 Git 初始化和提交

### 3.1 初始化 Git 仓库
```bash
# 进入项目目录（如果不在的话）
cd D:\zuoye2\shudao_11_24\shudao_11_24

# 初始化 Git 仓库
git init
```

### 3.2 配置 Git 用户信息（如果之前没配置）
```bash
# 检查是否配置姓名和邮箱
git config user.name
git config user.email

git config user.name "你的名字"
git config user.email "your_email@example.com"

# 或者配置全局的
git config --global user.name "你的名字"
git config --global user.email "your_email@example.com"
```

### 3.3 检查 .gitignore
查看 .gitignore 内容：（哪些文件或目录不要纳入版本控制（Git 不跟踪它们））
```bash
cat .gitignore
```

当前的 .gitignore 已经包含了必要的忽略项：
- node_modules（依赖包）
- dist（构建产物）
- *.log（日志文件）
- .vscode/（编辑器配置，除了 extensions.json）

### 3.4 添加文件到暂存区
```bash
# 添加所有文件
git add .

# 查看状态
git status
```

### 3.5 提交到本地仓库
```bash
git commit -m "Initial commit: 云游蜀道项目初始化"
```

---

## 四、关联远程仓库并推送

### 4.1 关联 GitHub 远程仓库
```bash
# 方式1：使用 SSH（推荐）
git remote add origin git@github.com:你的用户名/shudao_11_24.git

# 方式2：如果上面添加错了，可以删除后重新添加
git remote remove origin
git remote add origin git@github.com:你的用户名/shudao_11_24.git

# 验证远程仓库
git remote -v
```

### 4.2 重命名分支为 main（GitHub 默认分支）
```bash
# 查看当前分支
git branch

# 如果是 master，重命名为 main
git branch -M main
```

### 4.3 推送到 GitHub
```bash
# 首次推送，使用 -u 参数
git push -u origin main
```

⚠️ **注意：** 不要使用校园网，可能会连接失败！

---

## 五、常见问题和解决方案

### 5.1 推送失败：Permission denied (publickey)
**原因：** SSH 密钥没有正确配置

**解决：**
```bash
# 1. 检查 SSH 密钥是否存在
ls ~/.ssh

# 2. 查看公钥
cat ~/.ssh/id_rsa.pub

# 3. 复制公钥添加到 GitHub
# 4. 测试连接
ssh -T git@github.com
```

### 5.2 推送失败：Connection timed out
**原因：** 网络问题（校园网可能屏蔽了 GitHub）

**解决：**
- 切换到手机热点或其他网络
- 或使用 HTTPS 方式：
```bash
git remote set-url origin https://github.com/你的用户名/shudao_11_24.git
git push -u origin main
```

### 5.3 警告：LF will be replaced by CRLF
**原因：** Windows 和 Linux 换行符不同

**解决（推荐）：**
```bash
git config core.autocrlf true
```

### 5.4 推送到 master 但 GitHub 默认是 main
**情况：** GitHub 新仓库默认分支是 main，但本地提交到了 master

**解决：**
```bash
# 方案1：重命名本地分支
git branch -M main
git push -u origin main

# 方案2：直接推送 master 分支
git push -u origin master
# 然后在 GitHub 网页上修改默认分支为 master
```

### 5.5 .gitignore 不生效
**原因：** 文件已经被 Git 跟踪了

**解决：**
```bash
# 清除缓存
git rm -r --cached .
git add .
git commit -m "Fix: 更新 .gitignore"
git push
```

---

## 六、完整的命令流程（快速版）

```bash
# 1. 进入项目目录
cd D:\zuoye2\shudao_11_24\shudao_11_24

# 2. 初始化 Git
git init

# 3. 配置用户信息（如果需要）
git config user.name "你的名字"
git config user.email "your_email@example.com"

# 4. 添加所有文件
git add .

# 5. 提交到本地仓库
git commit -m "Initial commit: 云游蜀道项目初始化"

# 6. 关联远程仓库（替换为你的仓库地址）
git remote add origin git@github.com:你的用户名/shudao_11_24.git

# 7. 重命名分支为 main
git branch -M main

# 8. 推送到 GitHub
git push -u origin main
```

---

## 七、后续的日常操作

### 7.1 添加新功能后提交
```bash
# 1. 查看修改
git status

# 2. 添加修改的文件
git add .
# 或添加指定文件
git add src/views/user/Profile.vue

# 3. 提交
git commit -m "feat: 添加退出登录功能"

# 4. 推送到远程
git push
```

### 7.2 查看提交历史
```bash
git log
# 或简洁版
git log --oneline
```

### 7.3 拉取远程更新
```bash
git pull origin main
```

### 7.4 查看远程仓库信息
```bash
git remote -v
```

---

## 八、提交信息规范（建议）

使用语义化的提交信息：

| 前缀 | 含义 | 示例 |
|------|------|------|
| `feat:` | 新功能 | `feat: 添加退出登录功能` |
| `fix:` | 修复 bug | `fix: 修复登录页面样式错误` |
| `docs:` | 文档 | `docs: 更新 README` |
| `style:` | 格式调整 | `style: 统一代码缩进` |
| `refactor:` | 重构 | `refactor: 优化路由守卫逻辑` |
| `test:` | 测试 | `test: 添加登录功能测试` |
| `chore:` | 构建/工具 | `chore: 更新依赖包` |

---

## 九、项目文件结构说明

当前项目结构：
```
shudao_11_24/
├── .gitignore          # Git 忽略配置（已存在）
├── package.json        # 项目依赖
├── vite.config.ts      # Vite 配置
├── tsconfig.json       # TypeScript 配置
├── src/
│   ├── main.ts         # 应用入口
│   ├── App.vue         # 根组件
│   ├── router/         # 路由配置
│   ├── views/          # 页面组件
│   ├── assets/         # 静态资源
│   └── style.css       # 全局样式
├── claude/             # Claude 生成的文档
└── public/             # 公共资源
```

**被忽略的文件（不会上传到 GitHub）：**
- `node_modules/` - 依赖包（通过 package.json 安装）
- `dist/` - 构建产物
- `*.log` - 日志文件
- `.vscode/` - 编辑器配置（除了 extensions.json）

---

## 十、注意事项

### 10.1 敏感信息
⚠️ **确保不要提交敏感信息：**
- API 密钥
- 数据库密码
- 私人信息

如果不小心提交了敏感信息，需要：
1. 从历史记录中删除
2. 立即修改密钥/密码

### 10.2 大文件
- GitHub 单个文件不能超过 100MB
- 建议大文件使用 Git LFS 或放到其他存储

### 10.3 node_modules
- **绝对不要提交** node_modules（已在 .gitignore 中）
- 其他人 clone 后运行 `npm install` 自动安装依赖

### 10.4 协作开发
如果多人协作：
1. 使用分支开发功能
2. 通过 Pull Request 合并代码
3. 及时同步远程更新

---

## 十一、GitHub 仓库页面说明

上传成功后，GitHub 仓库页面应该包含：

### 11.1 README.md（建议添加）
创建 `README.md` 介绍项目：
```markdown
# 云游蜀道

蜀道文化旅游平台，基于 Vue 3 + TypeScript + Vite 构建。

## 功能特性
- 用户登录/注册
- 古迹篇、新景篇、脉络篇、行迹篇四大板块
- 个人中心
- AI 助手（待实现）

## 技术栈
- Vue 3
- TypeScript
- Vue Router
- Vite

## 安装运行
\`\`\`bash
npm install
npm run dev
\`\`\`

## 构建
\`\`\`bash
npm run build
\`\`\`
```

### 11.2 LICENSE（可选）
选择合适的开源协议，如 MIT、Apache 2.0 等。

---

## 十二、快速检查清单

在推送前检查：

- [ ] `.gitignore` 文件存在且正确
- [ ] node_modules 未被添加
- [ ] 没有敏感信息（密码、密钥等）
- [ ] SSH 密钥已添加到 GitHub
- [ ] 可以连接 GitHub（`ssh -T git@github.com`）
- [ ] 不使用校园网
- [ ] Git 用户信息已配置
- [ ] GitHub 仓库已创建

推送后验证：

- [ ] GitHub 页面可以看到代码
- [ ] 文件结构完整
- [ ] README.md 显示正常
- [ ] 没有看到 node_modules 或 dist 目录

---

## 十三、总结

完整流程回顾：
1. ✅ 配置 SSH 密钥
2. ✅ 在 GitHub 创建仓库
3. ✅ 本地 `git init` 初始化
4. ✅ `git add .` 添加文件
5. ✅ `git commit` 提交到本地
6. ✅ `git remote add origin` 关联远程
7. ✅ `git branch -M main` 重命名分支
8. ✅ `git push -u origin main` 推送到 GitHub

上传完成后，你的项目就可以在 GitHub 上访问了！
