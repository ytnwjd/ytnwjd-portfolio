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

export function findSkillIconSlug(name) {
  for (const category of skillCategories) {
    const skill = category.skills.find((item) => item.name === name)
    if (skill) return skill.iconSlug
  }
  return undefined
}
