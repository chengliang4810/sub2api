# Home Decoy Knowledge Base Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public `/home` default page with a company internal knowledge-base decoy and add GitHub Actions automation that syncs upstream updates and triggers the existing release workflow.

**Architecture:** Keep the homepage override path intact: `home_content` still wins, otherwise `HomeView.vue` renders neutral knowledge-base content. Add a separate `upstream-sync.yml` orchestration workflow that merges `Wei-Shaw/sub2api` into this fork, creates a release tag, and calls `release.yml` through `workflow_dispatch`.

**Tech Stack:** Vue 3, Vue I18n, Tailwind CSS, GitHub Actions, GoReleaser release workflow.

---

## File Structure

- Modify: `frontend/src/views/HomeView.vue`
  - Keep custom iframe/HTML `homeContent` behavior.
  - Replace AI/API default homepage sections with neutral knowledge-base sections.
  - Remove public GitHub link and terminal/provider visuals.

- Modify: `frontend/src/i18n/locales/zh.ts`
  - Rewrite `home` copy for a Chinese internal knowledge-base decoy.

- Modify: `frontend/src/i18n/locales/en.ts`
  - Rewrite matching English `home` copy so locale switching remains complete.

- Modify: `.github/workflows/release.yml`
  - Add optional `sync_version_file` workflow-dispatch input.
  - Skip VERSION-file backfill when automated sync uses a fallback sync tag.

- Create: `.github/workflows/upstream-sync.yml`
  - Scheduled and manual upstream sync.
  - Merge upstream main, push fork main, create tag, dispatch release workflow.

- Modify: `.gitignore`
  - Allow `docs/superpowers/plans/*.md` to be tracked.

---

### Task 1: Rewrite Homepage Copy Keys

**Files:**
- Modify: `frontend/src/i18n/locales/zh.ts`
- Modify: `frontend/src/i18n/locales/en.ts`

- [ ] **Step 1: Replace Chinese `home` copy**

Set the top-level `home` copy to neutral knowledge-base language. Preserve existing key names where practical so other pages and tests keep working:

```ts
home: {
  viewOnGithub: '在 GitHub 上查看',
  viewDocs: '查看资料',
  docs: '资料',
  switchToLight: '切换到浅色模式',
  switchToDark: '切换到深色模式',
  dashboard: '员工入口',
  login: '员工入口',
  getStarted: '查看资料',
  goToDashboard: '员工入口',
  heroSubtitle: '团队文档、流程说明与协作资料入口',
  heroDescription: '用于整理公开说明、制度流程、项目资料和常用链接，方便成员查阅最新信息。',
  tags: {
    subscriptionToApi: '资料归档',
    stickySession: '流程索引',
    realtimeBilling: '更新记录'
  },
  features: {
    unifiedGateway: '流程手册',
    unifiedGatewayDesc: '整理日常协作流程、审批说明和交付规范，方便快速查阅。',
    multiAccount: '项目资料',
    multiAccountDesc: '归档项目说明、维护记录和协作文档，减少重复沟通。',
    balanceQuota: '常用链接',
    balanceQuotaDesc: '集中维护团队常用资源入口，让资料查找更直接。'
  },
  providers: {
    title: '最近更新',
    description: '同步团队公开资料和维护说明',
    supported: '已更新',
    soon: '计划中',
    claude: '资料索引',
    gemini: '流程说明',
    antigravity: '联系人信息',
    more: '更多记录'
  },
  cta: {
    title: '需要访问内部资料？',
    description: '请使用员工入口登录后查看授权内容。',
    button: '员工入口'
  },
  footer: {
    allRightsReserved: '保留所有权利。'
  }
}
```

- [ ] **Step 2: Replace English `home` copy**

Mirror the neutral meaning in English:

```ts
home: {
  viewOnGithub: 'View on GitHub',
  viewDocs: 'View Resources',
  docs: 'Resources',
  switchToLight: 'Switch to Light Mode',
  switchToDark: 'Switch to Dark Mode',
  dashboard: 'Staff Entry',
  login: 'Staff Entry',
  getStarted: 'View Resources',
  goToDashboard: 'Staff Entry',
  heroSubtitle: 'Team documents, process notes, and collaboration resources',
  heroDescription: 'A shared space for public notes, process references, project materials, and frequently used links.',
  tags: {
    subscriptionToApi: 'Archive',
    stickySession: 'Process Index',
    realtimeBilling: 'Updates'
  },
  features: {
    unifiedGateway: 'Process Guides',
    unifiedGatewayDesc: 'Collect routine workflows, approval notes, and delivery conventions in one place.',
    multiAccount: 'Project Notes',
    multiAccountDesc: 'Archive project descriptions, maintenance notes, and shared references for team review.',
    balanceQuota: 'Common Links',
    balanceQuotaDesc: 'Keep frequently used team resources easy to find and maintain.'
  },
  providers: {
    title: 'Recent Updates',
    description: 'Shared team resources and maintenance notes',
    supported: 'Updated',
    soon: 'Planned',
    claude: 'Resource Index',
    gemini: 'Process Notes',
    antigravity: 'Contact Details',
    more: 'More Records'
  },
  cta: {
    title: 'Need internal access?',
    description: 'Use the staff entry to sign in and view authorized resources.',
    button: 'Staff Entry'
  },
  footer: {
    allRightsReserved: 'All rights reserved.'
  }
}
```

- [ ] **Step 3: Run focused locale search**

Run:

```bash
rg "AI|API|Claude|GPT|Gemini|Antigravity|模型|密钥|网关|订阅" frontend/src/i18n/locales/zh.ts frontend/src/i18n/locales/en.ts
```

Expected: no matches inside the `home` sections. Matches elsewhere are acceptable because this task only changes the public homepage copy.

---

### Task 2: Rewrite `HomeView.vue`

**Files:**
- Modify: `frontend/src/views/HomeView.vue`

- [ ] **Step 1: Preserve custom homepage override**

Keep the first template branch unchanged:

```vue
<div v-if="homeContent" class="min-h-screen">
  <iframe
    v-if="isHomeContentUrl"
    :src="homeContent.trim()"
    class="h-screen w-full border-0"
    allowfullscreen
  ></iframe>
  <div v-else v-html="homeContent"></div>
</div>
```

- [ ] **Step 2: Replace default page template**

Use neutral sections:

```vue
<section id="resources" class="grid gap-4 md:grid-cols-3">
  <article v-for="item in resourceCards" :key="item.titleKey">
    <Icon :name="item.icon" />
    <h3>{{ t(item.titleKey) }}</h3>
    <p>{{ t(item.descriptionKey) }}</p>
  </article>
</section>
```

Define data in script:

```ts
const resourceCards = [
  {
    icon: 'book' as const,
    titleKey: 'home.features.unifiedGateway',
    descriptionKey: 'home.features.unifiedGatewayDesc'
  },
  {
    icon: 'chart' as const,
    titleKey: 'home.features.multiAccount',
    descriptionKey: 'home.features.multiAccountDesc'
  },
  {
    icon: 'link' as const,
    titleKey: 'home.features.balanceQuota',
    descriptionKey: 'home.features.balanceQuotaDesc'
  }
]
```

If `Icon.vue` has no `link` icon, use an existing safe icon such as `server`, `chart`, or `book`.

- [ ] **Step 3: Remove public GitHub exposure**

Delete:

```ts
const githubUrl = 'https://github.com/Wei-Shaw/sub2api'
```

Delete the footer GitHub anchor. Keep the docs anchor only when `docUrl` exists.

- [ ] **Step 4: Run focused homepage keyword scan**

Run:

```bash
rg "AI|API|Claude|GPT|Gemini|Antigravity|模型|密钥|网关|订阅|github.com/Wei-Shaw" frontend/src/views/HomeView.vue frontend/src/i18n/locales/zh.ts frontend/src/i18n/locales/en.ts
```

Expected: no matches in `HomeView.vue` and no matches in the `home` locale sections.

---

### Task 3: Add Automated Upstream Sync Workflow

**Files:**
- Create: `.github/workflows/upstream-sync.yml`

- [ ] **Step 1: Create the workflow**

Create this workflow:

```yaml
name: Sync Upstream

on:
  workflow_dispatch:
    inputs:
      simple_release:
        description: 'Use simple release after sync'
        required: false
        type: boolean
        default: true
  schedule:
    - cron: '30 19 * * *'

permissions:
  contents: write
  actions: write

concurrency:
  group: upstream-sync
  cancel-in-progress: false

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout fork
        uses: actions/checkout@v6
        with:
          fetch-depth: 0
          ref: ${{ github.event.repository.default_branch }}

      - name: Configure git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

      - name: Fetch upstream
        run: |
          git remote add upstream https://github.com/Wei-Shaw/sub2api.git
          git fetch upstream main --tags

      - name: Check for upstream changes
        id: changes
        run: |
          if git merge-base --is-ancestor upstream/main HEAD; then
            echo "has_changes=false" >> "$GITHUB_OUTPUT"
            exit 0
          fi
          echo "has_changes=true" >> "$GITHUB_OUTPUT"

      - name: Merge upstream
        if: steps.changes.outputs.has_changes == 'true'
        run: git merge --no-edit upstream/main

      - name: Push synced branch
        if: steps.changes.outputs.has_changes == 'true'
        run: git push origin HEAD:${{ github.event.repository.default_branch }}

      - name: Resolve release tag
        if: steps.changes.outputs.has_changes == 'true'
        id: tag
        run: |
          VERSION="$(tr -d '\r\n' < backend/cmd/server/VERSION)"
          BASE_TAG="v${VERSION}"
          TAG_NAME="$BASE_TAG"
          SYNC_VERSION_FILE="true"
          if git ls-remote --exit-code --tags origin "refs/tags/${BASE_TAG}" >/dev/null 2>&1; then
            TAG_NAME="${BASE_TAG}-sync.${GITHUB_RUN_NUMBER}"
            SYNC_VERSION_FILE="false"
          fi
          echo "tag=${TAG_NAME}" >> "$GITHUB_OUTPUT"
          echo "sync_version_file=${SYNC_VERSION_FILE}" >> "$GITHUB_OUTPUT"

      - name: Create and push release tag
        if: steps.changes.outputs.has_changes == 'true'
        run: |
          TAG_NAME="${{ steps.tag.outputs.tag }}"
          git tag -a "$TAG_NAME" -m "Sync upstream ${TAG_NAME}"
          git push origin "$TAG_NAME"

      - name: Trigger release workflow
        if: steps.changes.outputs.has_changes == 'true'
        env:
          GH_TOKEN: ${{ github.token }}
          TAG_NAME: ${{ steps.tag.outputs.tag }}
          SYNC_VERSION_FILE: ${{ steps.tag.outputs.sync_version_file }}
          SIMPLE_RELEASE: ${{ github.event.inputs.simple_release || 'true' }}
        run: |
          gh workflow run release.yml \
            --ref "${{ github.event.repository.default_branch }}" \
            -f tag="$TAG_NAME" \
            -f simple_release="$SIMPLE_RELEASE" \
            -f sync_version_file="$SYNC_VERSION_FILE"
```

- [ ] **Step 2: Check workflow syntax**

Run:

```bash
rg "sync_version_file|workflow_dispatch|gh workflow run release.yml" .github/workflows/upstream-sync.yml
```

Expected: all three terms are present.

---

### Task 4: Update Release Workflow Dispatch Inputs

**Files:**
- Modify: `.github/workflows/release.yml`

- [ ] **Step 1: Add `sync_version_file` input**

Under `workflow_dispatch.inputs`, add:

```yaml
      sync_version_file:
        description: 'Sync VERSION file back to default branch after release'
        required: false
        type: boolean
        default: true
```

- [ ] **Step 2: Gate VERSION sync job**

Change:

```yaml
    if: ${{ needs.release.result == 'success' }}
```

to:

```yaml
    if: ${{ needs.release.result == 'success' && github.event.inputs.sync_version_file != 'false' }}
```

- [ ] **Step 3: Verify tag push compatibility**

Run:

```bash
rg "sync_version_file|push:|tags:|workflow_dispatch:" .github/workflows/release.yml
```

Expected: tag push trigger remains present; `sync_version_file` appears only in workflow-dispatch input and the VERSION sync job condition.

---

### Task 5: Validate Frontend and Workflows

**Files:**
- Test only.

- [ ] **Step 1: Install frontend dependencies if missing**

Run:

```bash
pnpm --dir frontend install --frozen-lockfile
```

Expected: dependencies install or are already up to date.

- [ ] **Step 2: Run typecheck**

Run:

```bash
pnpm --dir frontend typecheck
```

Expected: TypeScript reports no errors.

- [ ] **Step 3: Run frontend build**

Run:

```bash
pnpm --dir frontend build
```

Expected: build completes and writes frontend dist.

- [ ] **Step 4: Run keyword scan**

Run:

```bash
rg "AI|API|Claude|GPT|Gemini|Antigravity|模型|密钥|网关|订阅|github.com/Wei-Shaw" frontend/src/views/HomeView.vue
```

Expected: no output.

- [ ] **Step 5: Inspect final diff**

Run:

```bash
git diff --stat
git diff -- .github/workflows frontend/src/views/HomeView.vue frontend/src/i18n/locales/zh.ts frontend/src/i18n/locales/en.ts
```

Expected: only scoped homepage, locale, and workflow changes.

---

### Task 6: Commit Implementation

**Files:**
- All modified implementation files.

- [ ] **Step 1: Check status**

Run:

```bash
git status --short
```

Expected: implementation files and plan changes are listed.

- [ ] **Step 2: Commit**

Run:

```bash
git add .github/workflows/release.yml .github/workflows/upstream-sync.yml frontend/src/views/HomeView.vue frontend/src/i18n/locales/zh.ts frontend/src/i18n/locales/en.ts .gitignore docs/superpowers/plans/2026-06-19-home-decoy-knowledge-base.md
git commit -m "feat: add decoy homepage and upstream sync workflow"
```

Expected: commit succeeds.

---

## Self-Review

- Spec coverage: homepage decoy, `home_content` override preservation, GitHub link removal, GitHub Actions upstream sync, release workflow dispatch, fallback tag handling, and verification steps are covered.
- Placeholder scan: this plan contains no TBD/TODO/fill-later placeholders.
- Type consistency: i18n keys match existing `home.*` usage; workflow input name is consistently `sync_version_file`; homepage keeps existing `dashboardPath`, `isAuthenticated`, `docUrl`, `siteName`, `siteLogo`, and `homeContent` concepts.
