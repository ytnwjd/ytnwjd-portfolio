# 유수정 포트폴리오 (ytnwjd.dev)

Full-cycle 개발자 유수정의 개인 포트폴리오 웹사이트. 채용 서류의 "포트폴리오 URL" 제출용이라,
**읽는 사람은 채용담당자·면접관**이다. 짧은 시간 안에 성과 수치와 문제 해결 과정이 보이는 것이 목표.

## 명령어

```bash
npm run dev                  # 개발 서버 (Vite)
npm run build                # dist/ 빌드
npm run format               # src/ 전체 Prettier
npm run generate:resume-pdf  # 빌드된 dist/의 /resume 페이지를 dist/resume.pdf로 저장 (Puppeteer)
```

- Node `^22.18.0 || >=24.12.0`
- 로컬에서 PDF가 필요 없으면 `PUPPETEER_SKIP_DOWNLOAD=1 npm ci`로 Chromium 다운로드를 건너뛸 수 있다.
- 테스트 코드는 없다. 변경 후에는 `npm run build` 통과 + 브라우저로 직접 확인(데스크톱·모바일 375px).

## 스택 · 배포

- Vue 3 (`<script setup>`, **JavaScript — TypeScript 미사용**), Vite, vue-router, Prettier
- 아이콘 `@tabler/icons-vue`, 다이어그램 `mermaid` (상세 페이지에서만, flows가 있을 때 동적 import)
- 배포: `master` push → GitHub Actions(`.github/workflows/deploy.yml`) → GitHub Pages, 커스텀 도메인 `public/CNAME`
  - CI에서 빌드 후 `generate:resume-pdf`로 `dist/resume.pdf`까지 만들어 함께 배포한다.
- 브랜치: `develop`에서 작업 → `master`에 머지하면 배포된다.

## 라우트

| 경로 | 뷰 | 비고 |
| --- | --- | --- |
| `/` | `HomeView` | Hero → About → Skills → Projects → Activities 원페이지 스크롤 |
| `/projects/:slug` | `ProjectDetail` | 케이스 스터디형 상세 페이지 |
| `/resume` | `ResumeView` | 인쇄/PDF 전용. `App.vue`에서 TopNav·Footer 없이 렌더링, 페이지 크기는 `@page` CSS |

## 구조

```
src/
├── assets/styles/main.css   # 전역 스타일 · 디자인 토큰(:root CSS 변수)
├── components/
│   ├── layout/              # TopNav, Footer
│   ├── sections/            # 홈 섹션들 + ProjectCard
│   ├── project-detail/      # 상세 페이지 조각 — CaseSection(섹션 껍데기), ProjectArchitecture,
│   │                        #   ProjectFlows(mermaid), ProjectDeepDive(이슈 탭)
│   └── ui/                  # SkillIcon, ImageLightbox(사진·다이어그램 공용 라이트박스)
├── composables/             # useScrollSpy (상세 페이지 고정 탭)
├── data/                    # 모든 콘텐츠 — 컴포넌트에 텍스트를 하드코딩하지 않는다
├── router/index.js
├── utils/                   # text.js(splitHeadline), asset.js(publicAsset)
└── views/                   # HomeView, ProjectDetail, ResumeView
public/images/               # 프로젝트 다이어그램 등 (data에서 'images/...' 상대경로로 참조)
scripts/generate-resume-pdf.js
```

## 콘텐츠 데이터 (`src/data/`)

콘텐츠 수정은 대부분 여기서 끝난다. 같은 데이터를 홈 카드 · 상세 페이지 · 이력서가 함께 쓴다.

- `projects.js` — 프로젝트 배열. 주요 필드:
  - `slug`, `title`, `organization`, `type`, `period`, `summary`, `techStack`
  - `hook`(카드 한 줄 소개, 없으면 summary), `metrics`(카드 수치 `{ value, label }`), `featured`
  - `responsibilities`, `result` — 문자열 배열
  - `troubleshooting` — `{ title, problem, cause, solution }` 배열 (상세 페이지 Deep dive 탭)
  - `diagrams` — `{ title, image }` 배열
  - 상세 페이지가 선택적으로 읽는 필드: `tldr { problem, built }`, `background`, `decisions`, `flows`(mermaid),
    `retrospective`, `sectionNotes` — **없으면 해당 섹션이 렌더링되지 않는다.**
  - `hidden: true` — 목록·상세 어디에도 노출하지 않음 (URL로 직접 들어와도 숨김)
- **`"헤드라인 — 설명"` 규칙**: `responsibilities`/`result` 문장 앞부분(30자 이내)을 ` — `(em dash, 앞뒤 공백)로
  나누면 앞부분이 굵은 헤드라인/성과 카드 제목이 된다. 헤드라인이 없는 성과는 문장 속 수치(%, `A → B`, 기간·횟수)를
  자동으로 뽑아 헤드라인으로 쓰고, 수치 성과가 카드 앞쪽으로 정렬된다. (분리 규칙은 `src/utils/text.js`의
  `splitHeadline` 하나를 상세 페이지와 이력서가 같이 쓴다)
- `projectGroups.js` — 홈 PROJECTS 섹션의 그룹 구성과 순서. 상세 페이지의 이전/다음 순서도 이걸 따른다.
  어느 그룹에도 없는 프로젝트는 "Other Projects"로 내려간다.
- `hero.js` — 히어로 KPI 카드. `projectSlug`로 프로젝트와 연결된다.
- `skills.js` — 기술 스택 + 브랜드 컬러. `techColors.js`가 이 컬러를 재사용해 기술 태그 색을 만든다.
- `aboutMe.js`, `activities.js`, `certifications.js`, `profile.js`

**같은 성과 수치가 여러 곳(hero.js · projects.js의 metrics/result/troubleshooting)에 나온다. 수치를 고칠 때는
전부 검색해서 서로 모순되지 않게 맞출 것.** 면접관이 가장 먼저 잡아내는 부분이다.

## 디자인

- 토큰은 `src/assets/styles/main.css`의 `:root` 변수만 사용. 색을 하드코딩하지 않는다.
- 무채색(흑백 명도 단계) 베이스 + 포인트 컬러 하나 `--color-accent: #ec6446`(차분한 코랄). 포인트는 강조 지점에만 아껴 쓴다.
- 폰트: 영문·숫자 Inter Tight, 한글 Pretendard, 라벨 JetBrains Mono (`index.html`에서 로드).
- 기술 태그는 브랜드 컬러를 옅게 깐 light tint 스타일.
- 디자인 작업 시 `.claude/skills/frontend-design` 스킬 참고.

## 코드 컨벤션

- Prettier: 세미콜론 없음, 작은따옴표, printWidth 100. (`HomeView`·`ProjectDetail`은 현재 4칸 들여쓰기, 나머지는 2칸 —
  파일 안에서는 기존 들여쓰기를 따른다)
- 주석은 한국어로, "무엇"보다 "왜"를 쓴다. 파일 첫 줄에 `<!-- src/... -->` 경로 주석을 두는 패턴이 있다.
- 커밋 메시지: `feat: / fix: / style: / refactor: / chore:` + 영어 소문자 요약.

## 주의할 점 (과거에 실제로 밟은 것들)

- **`body`에 `overflow-x`를 걸지 말 것.** body가 별도 스크롤 컨테이너가 되어 `window.scrollTo`가 먹히지 않는다.
  `html`에만 건다. (main.css 주석 참고)
- `ProjectDetail`은 이전/다음 프로젝트로 이동할 때 컴포넌트가 재사용되어 `onMounted`가 다시 불리지 않는다.
  slug별로 초기화할 상태는 `watch(() => route.params.slug)`에서 처리하거나, 자식 컴포넌트에 `:key="project.slug"`를
  줘서 새로 마운트한다(ProjectDeepDive가 이 방식).
- 라우터는 `createWebHistory`인데 GitHub Pages는 SPA fallback이 없다. `public/404.html` 같은 처리가 없으면
  `/projects/...`, `/resume`을 직접 열거나 새로고침할 때 GitHub 404가 뜬다.
- 이력서 PDF는 CI의 headless Chromium이 렌더링한다. 한글 폰트(`fonts-noto-cjk`)는 워크플로우에서 설치한다.
