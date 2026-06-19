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
- 配置上游 remote，提供一套可重复的 fork 同步流程。

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

## 上游同步策略

当前本地仓库只有 `origin=https://github.com/chengliang4810/sub2api.git`，需要新增：

```bash
git remote add upstream https://github.com/Wei-Shaw/sub2api.git
```

日常同步建议：

```bash
git fetch upstream
git switch main
git merge upstream/main
git push origin main
```

如果首页文件后续与上游产生冲突，优先保留本 fork 的 `HomeView.vue` 默认页伪装逻辑，同时接受上游在认证、设置加载和公共配置上的必要修复。

## 测试计划

- 前端类型检查：`pnpm --dir frontend typecheck`
- 前端单元测试：优先运行相关视图和路由测试，必要时运行 `pnpm --dir frontend test:run`
- 构建检查：`pnpm --dir frontend build`
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
