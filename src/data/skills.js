export const levelLegend = [
  {
    level: 'high',
    label: '많이 해봤어요',
    desc: '해당 기술의 핵심 동작 원리를 이해하고 있으며, 요구사항에 맞춰 독립적으로 기능을 구현하고 트러블슈팅이 가능한 수준',
    levelNum: 3,
  },
  {
    level: 'mid',
    label: '해본 적 있어요',
    desc: '프로젝트의 특정 기능을 구현하기 위해 활용해 본 경험이 있으며, 공식 문서나 레퍼런스를 참고하여 필요한 기능을 적절히 적용할 수 있는 수준',
    levelNum: 2,
  },
  {
    level: 'learning',
    label: '알아가고 있어요',
    desc: '기술의 개념과 도입 목적을 학습 중이며, 기존 프로젝트의 코드를 분석하거나 간단한 튜토리얼 수준의 실습이 가능한 단계',
    levelNum: 1,
  },
]

// color: 각 기술의 실제 브랜드 컬러(simpleicons.org 기준). level이 high인 스킬에만 채움 색으로 사용.
// light: 배경이 밝은 톤이라 흰 글자 대신 어두운 글자를 써야 하는 경우 true.
export const skillCategories = [
  {
    category: 'Language',
    skills: [
      { name: 'Python', level: 'high', color: '#3776AB' },
      { name: 'Java', level: 'high', iconSlug: null, color: '#007396' },
      { name: 'JavaScript', level: 'high', color: '#F7DF1E', light: true },
      { name: 'C', level: 'mid', iconSlug: null },
      { name: 'Go', level: 'learning' },
    ],
  },
  {
    category: 'Frontend',
    skills: [
      { name: 'React.js', level: 'high', iconSlug: 'react', color: '#61DAFB', light: true },
      { name: 'Vue.js', level: 'high', iconSlug: 'vuedotjs', color: '#4FC08D' },
      { name: 'MUI', level: 'mid' },
      { name: 'Vite', level: 'mid' },
      { name: 'Next.js', level: 'learning', iconSlug: 'nextdotjs' },
      { name: 'TypeScript', level: 'learning' },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Spring Boot', level: 'high', color: '#6DB33F' },
      { name: 'FastAPI', level: 'high', color: '#009688' },
      { name: 'Django', level: 'high', color: '#092E20' },
      { name: 'Streamlit', level: 'high', color: '#FF4B4B' },
      { name: 'JWT', level: 'mid', iconSlug: 'jsonwebtokens' },
      { name: 'JUnit', level: 'learning', iconSlug: 'junit5' },
    ],
  },
  {
    category: 'Database',
    skills: [
      { name: 'PostgreSQL', level: 'high', color: '#4169E1' },
      { name: 'MySQL', level: 'high', color: '#4479A1' },
      { name: 'SQLite', level: 'high', color: '#003B57' },
      { name: 'MongoDB', level: 'mid' },
      { name: 'NoSQL', level: 'mid', iconSlug: null },
    ],
  },
  {
    category: 'DevOps',
    skills: [
      { name: 'Git', level: 'high', color: '#F03C2E' },
      { name: 'Docker', level: 'high', color: '#2496ED' },
      { name: 'EC2', level: 'high', iconSlug: null, color: '#FF9900', light: true },
      { name: 'Linux', level: 'high', color: '#FCC624', light: true },
      { name: 'GitHub Actions', level: 'high', color: '#2088FF' },
      { name: 'Vercel', level: 'mid' },
      { name: 'Cloudflare', level: 'mid' },
      { name: 'Nginx', level: 'mid' },
      { name: 'AWS', level: 'mid', iconSlug: null },
      { name: 'Prometheus', level: 'mid' },
      { name: 'Grafana', level: 'mid' },
      { name: 'Kubernetes', level: 'learning' },
    ],
  },
  {
    category: 'Tools',
    skills: [
      { name: 'Figma', level: 'high', color: '#F24E1E' },
      { name: 'Notion', level: 'high', color: '#000000' },
      { name: 'Postman', level: 'high', color: '#FF6C37' },
      { name: 'Cursor', level: 'high', color: '#000000' },
      { name: 'DBeaver', level: 'high', color: '#382923' },
      { name: 'Claude', level: 'high', color: '#D97757' },
      { name: 'Mermaid', level: 'mid' },
    ],
  },
]
