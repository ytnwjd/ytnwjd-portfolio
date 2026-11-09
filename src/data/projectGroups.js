// PROJECTS 섹션의 묶음 구성 — 위에서부터 순서대로 노출된다.
// slugs 순서가 그룹 안 카드 순서이고, 어느 그룹에도 속하지 않은 프로젝트는
// 섹션 하단 "Other Projects" 목록으로 내려간다.
export const projectGroups = [
  {
    key: 'intern',
    title: '래브라도랩스 · AI분석엔진팀 인턴',
    period: '2025.12 ~ 2026.06',
    description: '크롤러·취약점 데이터 운영을 자동화하는 사내 Back-office 3종을 단독으로 설계·개발했습니다.',
    layout: 'cards',
    // 성과 수치를 포인트 컬러로 강조 — 나머지 그룹은 남색(navy)으로 한 단계 낮춘다
    highlight: true,
    // 왼쪽 → 오른쪽으로 갈수록 최신 프로젝트
    slugs: ['vulnerability-alert-system', 'labradorlabs-DBMS', 'crawler-watcher'],
  },
  {
    key: 'service',
    title: '실서비스 운영 · 아주대학교 총학생회',
    period: '2024.01 ~ 2026.03',
    description: '5인 팀으로 공식 홈페이지를 개편·런칭하고 이후 2년간 운영했습니다.',
    layout: 'wide',
    slugs: ['ajouchong'],
  },
  {
    key: 'self-driven',
    title: '자기주도 프로젝트 · 아주대학교',
    period: '2025.08 ~ 2025.12',
    description: '교내 유휴 GPU를 CLI 설정 없이 쓸 수 있도록 Job 관리 대시보드를 혼자 개발했습니다.',
    layout: 'wide',
    slugs: ['gpu-job-management-dashboard'],
  },
]
