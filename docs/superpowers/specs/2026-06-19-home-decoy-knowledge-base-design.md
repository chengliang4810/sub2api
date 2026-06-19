# /home 公司内部知识库伪装页设计

## 背景

当前 `/home` 默认首页会展示 AI、API、模型供应商和调用示意等真实业务线索。用户希望将公开首页改成与真实业务完全无关的公司内部知识库方向，用来降低真实 AI 业务被扫描、识别和定向攻击的概率。

本设计只处理公开首页的默认展示与 fork 同步策略，不改变后端接口、登录鉴权、管理后台和真实业务能力。

## 目标

- `/home` 默认页伪装成普通公司内部知识库、资料归档和流程索引页面。
- 页面保留普通“员工入口”，链接到现有 `/login`。
- 页面不出现 AI、API、模型、订阅、密钥、网关、Claude、GPT、Gemini、Antigravity 等真实业务词。
- 保留现有后台 `home_content` 自定义覆盖能力：配置了自定义内容时仍按原逻辑展示 iframe 或 HTML。
- 去掉公开首页的 GitHub 链接，避免暴露上游项目和真实仓库来源。
- 改动集中在前端首页和本地化文案，降低未来同步上游时的冲突面。
- 提供 GitHub Actions 自动同步上游、自动打包发布的流程。

## 非目标

- 不隐藏源码仓库中的业务实现。
- 不改 `/login`、用户后台、管理员后台的真实业务文案。
- 不重构路由、鉴权、后端接口或部署方式。
- 不新增复杂假功能，避免维护与真实业务无关的页面。

## 首页信息架构

默认 `/home` 分为四块：

1. 顶部导航
   - 左侧使用站点 logo 和站点名。
   - 右侧保留语言切换、主题切换、文档链接和“员工入口”。
   - “员工入口”在未登录时链接到 `/login`；已登录时链接到现有 `dashboardPath`，但显示文案仍保持中性。

2. Hero 区
   - 主标题：团队文档、流程说明、协作资料入口。
   - 副标题：用于整理公开说明、制度流程、项目资料和常用链接。
   - 主按钮：查看资料，保持页面内锚点或无敏感跳转。
   - 次按钮：员工入口，链接到现有登录入口。

3. 内容区
   - 三个知识库栏目：流程手册、项目资料、常用链接。
   - 最近更新列表使用中性内容，例如资料索引维护、流程说明更新、联系人同步。
   - 所有文案均避免暗示真实系统用途。

4. 页脚
   - 保留版权和文档链接。
   - 移除 GitHub 链接。

## 技术设计

### 文件边界

- `frontend/src/views/HomeView.vue`
  - 保留 `homeContent` 分支。
  - 重写默认页 template。
  - 删除 terminal 动画和 provider 展示。
  - 删除 `githubUrl` 常量及页脚 GitHub 链接。
  - 保留 `siteName`、`siteLogo`、`siteSubtitle`、`docUrl`、主题切换、登录状态、`dashboardPath` 等既有逻辑。

- `frontend/src/i18n/locales/zh.ts`
  - 更新 `home` 下默认页文案为公司内部知识库方向。

- `frontend/src/i18n/locales/en.ts`
  - 同步英文文案，保持语言切换不缺 key。

### 数据流

页面加载时仍沿用现有流程：

1. `App.vue` 拉取 public settings。
2. `HomeView.vue` 读取 `appStore.cachedPublicSettings`。
3. 若 `home_content` 存在，优先展示自定义 iframe 或 HTML。
4. 若不存在，展示新的知识库伪装页。
5. 点击“员工入口”走现有 `/login` 或登录后的 `dashboardPath`。

### 安全边界

该改动是前台暴露面降低，不是完整安全方案。它能减少公开首页直接暴露真实业务关键词，但不能替代：

- 后端鉴权和权限控制。
- 管理入口访问控制。
- 接口限流和日志审计。
- 错误信息脱敏。
- 部署层防火墙、WAF、反向代理规则。

## 上游同步与自动打包策略

用户要的同步不是本地 `git fetch upstream`，而是 GitHub 自动触发：定时检查上游、合并到 fork、合并成功后自动打包。

### 现有发布链路

仓库已有 `.github/workflows/release.yml`：

- `push tags: v*` 时发布。
- `workflow_dispatch` 手动传入 tag 时发布。
- 发布流程会构建前端、运行 GoReleaser、推送 GHCR 镜像，并在配置 DockerHub secret 时推送 DockerHub。

### 新增同步 workflow

新增 `.github/workflows/upstream-sync.yml`：

- 触发方式：
  - `workflow_dispatch` 手动触发。
  - `schedule` 定时触发，例如每天一次。
- 权限：
  - `contents: write` 用于推送合并提交和 tag。
  - `actions: write` 用于调用现有 `release.yml` 的 `workflow_dispatch`。
- 同步步骤：
  1. checkout 当前 fork 的默认分支，`fetch-depth: 0`。
  2. 添加并 fetch 上游 `https://github.com/Wei-Shaw/sub2api.git`。
  3. 比较当前 HEAD 与 `upstream/main`。
  4. 无新增上游提交时退出。
  5. 有新增提交时执行 `git merge --no-edit upstream/main`。
  6. 如果出现冲突，workflow 失败，不自动覆盖本 fork 改动。
  7. 合并成功后推送到 `origin/main`。
  8. 创建发布 tag。
  9. 调用 `release.yml` 的 `workflow_dispatch` 进行打包。

### 为什么不用 tag push 触发 release

GitHub Actions 使用仓库默认 `GITHUB_TOKEN` 推送代码或 tag 时，普通 `push` 事件不会再触发新的 workflow，以避免递归触发。例外是显式的 `workflow_dispatch` 和 `repository_dispatch`。因此自动同步 workflow 创建 tag 后，应直接调用 `release.yml` 的 `workflow_dispatch`，而不是依赖 tag push 间接触发。

### tag 策略

优先使用 `backend/cmd/server/VERSION` 生成发布 tag：

- 默认 tag：`v<VERSION>`，例如 `v0.1.138`。
- 如果该 tag 已存在但上游仍有新提交，可使用 `v<VERSION>-sync.<run_number>` 作为兜底。
- 当使用 `-sync.<run_number>` 这类 tag 时，需要避免 release workflow 把 `backend/cmd/server/VERSION` 回写成带 `sync` 后缀的版本号。

为此，`release.yml` 增加一个可选输入：

- `sync_version_file`，默认 `true`。
- 自动同步 workflow 用兜底 tag 调用 release 时传 `false`。
- `sync-version-file` job 只有在 `sync_version_file != false` 时才回写版本文件。

### 冲突处理

如果上游改动与本 fork 的首页伪装、workflow 或发布配置冲突，自动同步 workflow 应失败并保留现场。不要在 CI 里用 `-X theirs` 或 `-X ours` 自动吞掉冲突。后续人工处理原则：

- `HomeView.vue` 默认页继续保留知识库伪装逻辑。
- 认证、公共配置加载、设置读取等运行逻辑优先吸收上游修复。
- `release.yml` 和 `upstream-sync.yml` 的自动发布能力保留在本 fork。

## 测试计划

- 前端类型检查：`pnpm --dir frontend typecheck`
- 前端单元测试：优先运行相关视图和路由测试，必要时运行 `pnpm --dir frontend test:run`
- 构建检查：`pnpm --dir frontend build`
- workflow 静态检查：
  - YAML 文件语法正确。
  - `release.yml` 的新增输入不影响 tag push 发布。
  - `upstream-sync.yml` 在无上游更新时能正常退出。
  - `upstream-sync.yml` 在合并冲突时失败，不推送破坏性结果。
- 浏览器检查：
  - `/home` 未配置 `home_content` 时展示知识库伪装页。
  - 页面无 AI/API/model/provider/GPT/Claude/Gemini/Antigravity 等敏感词。
  - “员工入口”可进入 `/login`。
  - 登录后入口仍按现有 `dashboardPath` 行为进入对应页面。
  - 中英文切换不缺文案。
  - 暗色模式可读。

## 风险与缓解

- 风险：伪装首页降低关键词暴露，但真实业务仍可能通过接口路径、登录页和网络流量被识别。
  - 缓解：本次只做首页伪装，后续可单独加固登录页、路由命名、反向代理和访问策略。

- 风险：未来上游更新 `HomeView.vue` 时发生冲突。
  - 缓解：改动集中在一个视图和本地化文案；同步时优先人工处理这些文件。

- 风险：公开文档链接仍可能暴露真实业务。
  - 缓解：本次保留现有 `docUrl` 能力，但只在配置存在时展示。若实际配置指向真实业务文档，部署时应清空或替换为普通知识库链接。

- 风险：自动同步 workflow 创建的 tag 如果只依赖 tag push，不会触发现有 release workflow。
  - 缓解：同步 workflow 显式调用 `release.yml` 的 `workflow_dispatch`。

- 风险：上游未更新 VERSION 但有代码更新时，自动发布 tag 可能重复。
  - 缓解：使用 `v<VERSION>-sync.<run_number>` 兜底，并让 release workflow 跳过 VERSION 回写。
