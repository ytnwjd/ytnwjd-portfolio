export const levelLegend = [
  {
    level: 'high',
    label: '많이 해봤어요',
    desc: '핵심 동작 원리를 이해하고 있으며, 요구사항에 맞춰 독립적으로 기능을 구현하고 트러블슈팅이 가능한 수준',
    levelNum: 3,
  },
  {
    level: 'mid',
    label: '해본 적 있어요',
    desc: '프로젝트의 특정 기능 구현을 위해 활용해본 경험이 있으며, 공식 문서·레퍼런스를 참고해 필요한 기능을 적절히 적용할 수 있는 수준',
    levelNum: 2,
  },
  {
    level: 'learning',
    label: '알아가고 있어요',
    desc: '개념과 도입 목적을 학습 중이며, 기존 코드 분석이나 튜토리얼 수준의 실습이 가능한 단계',
    levelNum: 1,
  },
]

export const skillCategories = [
  {
    category: 'Language',
    skills: [
      { name: 'Python', level: 'high' },
      { name: 'Java', level: 'high', iconSlug: null },
      { name: 'JavaScript', level: 'high' },
      { name: 'C', level: 'mid', iconSlug: null },
      { name: 'Go', level: 'learning' },
    ],
  },
  {
    category: 'Frontend',
    skills: [
      { name: 'React.js', level: 'high', iconSlug: 'react' },
      { name: 'Vue.js', level: 'high', iconSlug: 'vuedotjs' },
      { name: 'Next.js', level: 'mid', iconSlug: 'nextdotjs' },
      { name: 'Vite', level: 'mid' },
      { name: 'TypeScript', level: 'learning' },
    ],
  },
  {
    category: 'Backend',
    skills: [
      { name: 'Spring Boot', level: 'high' },
      { name: 'FastAPI', level: 'high' },
      { name: 'Django', level: 'high' },
      { name: 'JWT', level: 'mid', iconSlug: 'jsonwebtokens' },
      { name: 'JUnit', level: 'learning', iconSlug: 'junit5' },
    ],
  },
  {
    category: 'Database',
    skills: [
      { name: 'PostgreSQL', level: 'high' },
      { name: 'MySQL', level: 'high' },
      { name: 'MongoDB', level: 'mid' },
      { name: 'NoSQL', level: 'mid', iconSlug: null },
    ],
  },
  {
    category: 'DevOps',
    skills: [
      { name: 'Git', level: 'high' },
      { name: 'Docker', level: 'high' },
      { name: 'EC2', level: 'high', iconSlug: null },
      { name: 'Linux', level: 'high' },
      { name: 'GitHub Actions', level: 'mid' },
      { name: 'Vercel', level: 'mid' },
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
      { name: 'Figma', level: 'high' },
      { name: 'Notion', level: 'high' },
      { name: 'Postman', level: 'high' },
      { name: 'Cursor', level: 'high', iconSlug: null },
      { name: 'DBeaver', level: 'high', iconSlug: null },
      { name: 'Claude', level: 'high' },
      { name: 'Mermaid', level: 'mid' },
    ],
  },
]