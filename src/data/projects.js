export default [
  {
    slug: 'ajouchong',
    title: '총학생회 홈페이지 개발·운영',
    period: '2024.01 ~ 2026.03',
    type: '개인 프로젝트',
    organization: '아주대학교 총학생회',
    techStack: ['React', 'Java', 'Spring Boot', 'PostgreSQL', 'AWS EC2', 'AWS S3', 'Cloudflare', 'GitHub Actions', 'Vercel'],
    summary:
      '총학생회 홈페이지 런칭, 실서비스를 2년간 단독으로 유지보수하며 Admin 페이지 신규 구축',
    responsibilities: [
      'Django → Java/SpringBoot 아키텍처 전면 재설계 주도',
      'AOLDA 클라우드 서비스와 자체 도메인(ajouchong.com)을 연결한 실서비스 배포',
      'GitHub Actions + Vercel 기반 배포 자동화(CI/CD) 파이프라인 구축',
      '관리자(Admin) 페이지 기획 및 구현',
      'AWS 인프라 마이그레이션 및 2년간 서비스 단독 유지보수',
    ],
    troubleshooting: [
      {
        problem:
          'AWS RDS+EC2 설정 오류로 운영비가 월 10만 원에서 50만 원으로 급증했고, 이후 기존 클라우드의 불안정성으로 DB 데이터가 유실되는 장애까지 발생했습니다.',
        cause: '인프라 설정 자체의 비효율성과, 데이터 가용성이 보장되지 않는 클라우드 환경이 근본 원인이었습니다.',
        solution:
          '모니터링으로 비용 원인을 분석해 SpringBoot 기반으로 아키텍처를 전환하고, AWS EC2 환경 설정을 독학해 서버를 직접 이전했습니다. 관리자 페이지를 단독 구현하고 Vercel+GitHub Actions로 CI/CD를 자동화해 데이터 손실 리스크 없는 안정적인 운영 환경을 확보했습니다.',
      },
      {
        problem:
          'OAuth·JWT 연동의 보안 토큰 관리 로직이 복잡했고, 다수가 사용하는 배포/개발 환경을 통일하는 표준이 없어 수동 빌드-배포 과정이 반복됐습니다.',
        cause: '팀 프로젝트 초기 단계에서 개발 환경과 인증 파이프라인에 대한 표준이 마련되지 않았습니다.',
        solution:
          'docker-compose로 팀원 로컬 개발환경을 통일하고, OAuth로 전달받은 정보로 자체 JWT를 발행하는 인증 파이프라인을 Spring Security로 모듈화했습니다.',
      },
    ],
    result: [
      '2년간 단독 운영하며 실사용자 대상 서비스 지속 제공',
      'AWS 운영 비용 80% 이상 절감',
      '방문자 평균 CTR 16% 향상',
    ],
  },
  {
    slug: 'labradorlabs-DBMS',
    title: 'LabradorLabs DBMS',
    period: '2026.02 ~ 2026.04',
    type: '개인 프로젝트',
    organization: '래브라도랩스 인턴 (AI분석엔진팀)',
    techStack: ['Python', 'FastAPI', 'Streamlit', 'SQLite', 'Docker'],
    summary:
      '취약점 감지 현황·크롤링 데이터 통계·운영 설정을 하나의 화면에서 확인·조작할 수 있는 통합 Back-Office 대시보드',
    responsibilities: [
      'Frontend(Streamlit)–Application(Service)–Data Access(Repository) 4계층 아키텍처 설계',
      'ThreadPoolExecutor + st.fragment 기반 비동기 렌더 플랜(build_render_plan)으로 페이지 로딩 속도 개선',
      'MySQL 3개 DB(STAT/COMP/Crawlers)를 SQLAlchemy로 연결하고 도메인별 Repository로 분리',
      'data/*.json 수정만으로 대시보드 UI 변경이 가능하도록 렌더링 파이프라인을 데이터 기반으로 설계',
    ],
    troubleshooting: [
      {
        problem: '대시보드 페이지 로딩에 약 30초가 소요되어 사용성이 매우 낮았습니다.',
        cause: '대량의 데이터를 동기 방식으로 순차 조회하는 구조가 병목이었습니다.',
        solution:
          'ThreadPoolExecutor 기반 비동기 처리를 도입해 여러 데이터 소스를 병렬로 조회하도록 개선했습니다.',
      },
      {
        problem:
          '데이터 타입별로 반환 구조(Shape)가 달라 언패킹 오류와 필수 필드 누락 시 런타임 예외가 자주 발생했습니다.',
        cause: '타입별 표준 반환 구조 없이 각자 다른 형태로 데이터를 반환하고 있었습니다.',
        solution:
          '기본 Shape을 등록하고 NULL_LOADERS로 사전 검증하는 절차를 마련해, 새 타입 추가 시 4단계 표준 개발 절차를 강제함으로써 언패킹 오류를 제거했습니다.',
      },
    ],
    result: ['페이지 로딩 속도 30초 → 2초로 93% 단축', '취약점·크롤러·DB 현황 통계 일/월 단위 시각화 구현'],
  },
  {
    slug: 'crawler-watcher',
    title: 'Crawler Watcher',
    period: '2026.05 ~ 2026.06',
    type: '개인 프로젝트',
    organization: '래브라도랩스 인턴 (AI분석엔진팀)',
    techStack: ['FastAPI', 'Docker', 'SQLite', 'Slack Webhook'],
    summary:
      '다수의 데이터 크롤러들의 로그 실시간 모니터링으로 이상 탐지 자동화, 탐지 건 수 일/월 별 report 생성 시스템',
    responsibilities: [
      'json 설정 파일 기반 Multi Thread 로그 감시 아키텍처 및 FileWatcher 스레드 동적 생성 구조 설계',
      'WatcherManager를 구축해 다중 watcher 스레드의 Life Cycle을 통과하는 오케스트레이터 구현',
      'tail -f 방식 폴링, 정규식 매칭, 쿨다운 등 크롤러 특성에 맞춘 실시간 로그 감시 로직 구현',
      'LogCounter 기반 Severity 집계, DB 영속화 및 Slack Webhook 이상 탐지 즉시 알림 파이프라인 구축',
      'Watcher 생명주기 제어(등록/조회/제어) 및 통계 조회를 위한 FastAPI 기반 REST API 개발',
    ],
    troubleshooting: [
      {
        problem:
          '멀티스레드 환경에서 다중 FileWatcher가 동시 SQLite write를 시도하며 DB lock 경합이 발생했고, Watcher 중지 요청 시 메인 스레드와 종결 스레드 간 lock 점유로 Deadlock이 발생했습니다.',
        cause:
          'SQLite의 기본 동시 쓰기 제어 한계와, lock을 해제하지 않은 상태에서 join()을 호출하는 생명주기 제어 로직의 결함이 원인이었습니다.',
        solution:
          '애플리케이션 레벨 lock 직렬화, SQLite WAL 모드 적용 및 5초 대기 후 재시도 로직으로 동시성 제어를 이중화했습니다. 또한 stop() 시그널 처리만 lock 내부에서 수행하고 join() 호출은 lock 바깥으로 분리하여 Deadlock을 완벽히 해결했습니다.',
      },
    ],
    result: [
      '다중 크롤러 로그 실시간 통합 모니터링 및 이상 탐지 자동화 달성',
      'DB lock 경합 및 deadlock 해결로 멀티스레드 로그 수집 환경의 안정성 확보',
    ],
  },
  {
    slug: 'vulnerability-alert-system',
    title: 'Vulnerability Alert System',
    period: '2025.12 ~ 2026.02',
    type: '개인 프로젝트',
    organization: '래브라도랩스 인턴 (AI분석엔진팀)',
    techStack: ['FastAPI', 'Docker', 'MySQL', 'Slack Webhook', 'KakaoWork Bot API'],
    summary:
      '담당자의 임계치 설정 조건에 따른 데이터 자동 감지·알림 시스템',
    responsibilities: [
      'DBWatcher를 통한 주기적 DB 스캔 및 JSON 정의 규칙 기반 RuleProcessor 룰 엔진 구현',
      '운영 중 코드 수정 없이 JSON 파일 변경만으로 규칙을 추가·수정할 수 있는 구조 설계',
      'Slack Webhook 및 KakaoWork Bot API 연동 Notification Layer 및 FastAPI 규칙 관리 API 개발',
      'Docker Events 기반 Container Watcher 및 Heartbeat Scheduler 구축으로 인프라 장애 모니터링 체계 확보',
    ],
    troubleshooting: [
      {
        problem:
          '규칙 평가 시 규칙마다 now()를 개별 호출하여 동일 검사 사이클 내 rule 간 조회 시간 윈도우 불일치가 발생했습니다.',
        cause: '각 규칙 실행 시점마다 조회 시각이 개별 생성되는 평가 로직 구조가 원인이었습니다.',
        solution:
          '검사 사이클 시작 시 query_time을 1회 고정하여 모든 rule이 동일한 시간 윈도우 기준으로 평가되도록 수정했습니다.',
      },
      {
        problem:
          'FastAPI와 스케줄러의 비동기/멀티스레드 동작 환경에서 공유 자원 동시 접근 위험 및 자정 시점 데이터 유실 우려가 존재했습니다.',
        cause: '스레드 간 안전한 상태 공유 체계 및 날짜 전환 처리 로직이 부재했습니다.',
        solution:
          '클래스 변수 기반 전역 공유 상태 구조를 설계하여 스레드 안전성을 확보하고, 자정 전환 시 자동 데이터 백업 로직을 추가했습니다.',
      },
    ],
    result: [
      '크롤링 데이터 조건 기반 자동 감지 및 multi-channel 알림 자동화 달성',
      'Docker 컨테이너 상태 감시 및 Heartbeat 기반 장애 탐지 체계 구축',
    ],
  },
  {
    slug: 'artifact',
    title: 'Artifact',
    period: '2025.10 ~ 2025.12',
    type: '팀 프로젝트 (3명)',
    organization: '교내 데이터베이스 수업',
    techStack: ['React.js', 'Spring Boot', 'MySQL', 'Git'],
    summary:
      '여러 미술관 사이트에 파편화된 소장품 정보를 통합 조회할 수 있는 미술품 정보 플랫폼',
    responsibilities: [
      '기관별 데이터 통합 분석을 통한 5개 핵심 엔티티 대상 제3정규화(3NF) 적용 및 FK·Cascade 제약조건 설계',
      'Spring Boot 기반 Controller–Service–Repository 계층 분리 아키텍처 구축 및 개발 표준 제시',
      '좋아요 기반 관심 작품 저장 및 사용자 맞춤 마이컬렉션 조회·관리 API 개발',
      'Cursor AI 도구를 활용한 React 기반 UI 신속 구축 및 백엔드 REST API 안정적 연동',
    ],
    troubleshooting: [
      {
        problem:
          '미술관별 데이터 규격 불일치 및 작품-작가-갤러리 간 복잡한 1:N / N:M 관계로 인한 데이터 중복·검색 성능 저하 문제가 존재했습니다.',
        cause: '이종 데이터 원천 통합 시 표준 스키마 및 관계 정의 미비가 원인이었습니다.',
        solution:
          '3NF 정규화 및 주요 검색 컬럼(작품명, 작가명 등) 인덱싱 처리를 수행하여 데이터 정합성 확보 및 검색 속도를 개선했습니다.',
      },
      {
        problem:
          '팀원들의 개발 경험 부족으로 인한 아키텍처 공백 및 코드 병합 난항으로 프로젝트 마감 일정 지연 위험이 발생했습니다.',
        cause: '초기 기술 표준 부재 및 개발 인력 보완책 미비가 원인이었습니다.',
        solution:
          'Controller-Service-Repository 레이어드 아키텍처 전파로 팀 개발 진입장벽을 낮추고, Cursor AI를 적극 활용해 프론트엔드 개발 공수를 보완함으로써 기한 내 개발을 완료했습니다.',
      },
    ],
    result: [
      '3NF 정규화 및 인덱싱을 통한 데이터 정합성 확보 및 검색 성능 개선',
      '표준 아키텍처 제시 및 AI 기반 개발 프로세스 도입으로 팀 생산성 극대화',
    ],
  },
  {
    slug: 'gpu-job-management-dashboard',
    title: 'k8s 기반의 GPU Job Management Dashboard',
    period: '2025.08 ~ 2025.12',
    type: '개인 프로젝트',
    organization: '교내 자기주도 프로젝트',
    techStack: ['React.js', 'MUI', 'FastAPI', 'MongoDB', 'Git', 'Figma'],
    summary:
      '교내 유휴 GPU 리소스를 효율적으로 활용하고 CLI 설정 부담을 줄이기 위한 GUI 기반 실시간 Job 관리 대시보드',
    responsibilities: [
      '작업 제출 시 가용 GPU 자동 할당 및 자원 부족 시 대기열(Pending) 전환 스케줄링 엔진 구축',
      'Job 상태(Pending, Running, Failed, Completed)별 조건부 액션 버튼 동적 렌더링 구현',
      'Python os 모듈 기반 사용자 ID별 격리 홈 디렉토리 재귀 스캔 API 및 맥북 Finder 스타일 File Tree UI 개발',
      'GPU 상태 및 Job 데이터 실시간 동기화/렌더링 최적화를 위한 비동기 Custom Hook 설계',
      'MongoDB 구축을 통한 사용자 정보, Job 실행 이력, GPU 상태 데이터 구조화 및 관리',
    ],
    troubleshooting: [
      {
        problem:
          '교내 코딩 플랫폼(AjoupyterHub) 내 사용자별 독립 로컬 파일 시스템 환경에서, 공유 경로가 아닌 접속자 ID 기준 격리 홈 디렉토리를 동적 인식하고 시각화해야 하는 과제가 존재했습니다.',
        cause: '플랫폼 특성상 사용자별로 파일 시스템 디렉토리 경로가 격리되어 있어 일률적인 static 경로 조회가 불가능했습니다.',
        solution:
          '요청자 ID 식별 기반 재귀 파일 스캔 API를 구축하고 이를 Finder 스타일 File Tree UI로 연동하여, 경로 직접 입력 없이 클릭만으로 GPU Job 코드를 등록할 수 있게 개선했습니다.',
      },
    ],
    result: [
      'CLI 및 서버 설정 부담을 해소하여 AI 학습 진입 장벽 완화',
      'Ajou Softcon 인기상 수상 및 사용자 GPU 수요 패턴 분석 기반 마련',
    ],
  },
  {
    slug: 'chongchongchong',
    title: '총총총 (총학생회 홈페이지 개편 프로젝트)',
    period: '2024.08 ~ 2024.12',
    type: '팀 프로젝트 (5명)',
    organization: '다학제 캡스톤 디자인',
    techStack: ['React', 'Java', 'Spring Boot', 'PostgreSQL', 'AWS S3', 'Cloudflare', 'Vercel', 'GitHub Actions'],
    summary:
      '레거시 시스템의 비용 및 유지보수 문제를 해결하고 브랜드 아이덴티티를 반영하기 위해 Spring Boot 기반으로 전면 재설계한 총학생회 공식 홈페이지 개편 프로젝트',
    responsibilities: [
      '프론트엔드 개발자 2명 영입 및 팀 빌딩, 프로젝트 개발 표준 정립',
      'Django → Java/Spring Boot 아키텍처 전면 재설계 주도',
      'GitHub Actions + Vercel 연동 자동 빌드·배포(CI/CD) 파이프라인 구축',
      'AOLDA 클라우드 및 자체 도메인(ajouchong.com) 연결 실서비스 무료 배포 및 AWS 운영 비용 최적화',
    ],
    troubleshooting: [
      {
        problem:
          '초기 클라우드 배포 직접 핸들링, 로컬 개발 환경 통일 미비로 인한 프론트엔드 개발자의 백엔드·DB 연동 난항, OAuth·JWT 복잡도 문제가 발생했습니다.',
        cause: '다수가 참여하는 개발/배포 환경 표준의 부재와 수동 빌드·배포 반복 구조가 원인이었습니다.',
        solution:
          'AOLDA 클라우드를 통한 무료 배포 환경 마련, docker-compose 개발환경 통일, CI/CD 구축을 완수했습니다. 또한 OAuth 정보 기반 자체 JWT 발행 파이프라인을 Spring Security로 모듈화하여 성공적으로 런칭했습니다.',
      },
    ],
    result: [
      'Spring Boot + React 기반 신규 총학생회 홈페이지 성공적 런칭 및 실서비스 운영',
      'CI/CD 도입 및 docker-compose 표준화로 팀 개발·배포 생산성 대폭 향상',
    ],
  },
  {
    slug: 'aks',
    title: 'AKS (AOLDA K8s managed Service)',
    period: '2024.03 ~ 2024.06',
    type: '팀 프로젝트 (3명)',
    organization: '파란학기(아주도전)',
    techStack: ['Kubernetes', 'Docker', 'Grafana', 'Prometheus', 'AlertManager', 'Git'],
    summary:
      'OpenStack 기반 클라우드 환경에서 Kubernetes 클러스터를 효율적으로 배포 및 관리하는 Managed Service(PaaS)와 모니터링 시스템 설계',
    responsibilities: [
      '실시간 자원 상태 파악을 위한 모니터링 클러스터 아키텍처 설계',
      'Prometheus와 Grafana 연동을 통한 시스템 모니터링 대시보드 구성',
      'Docker 기반 모니터링 도구(Prometheus, Grafana, AlertManager) 컨테이너화',
    ],
    troubleshooting: [
      {
        problem:
          '수집된 원시 메트릭 데이터를 운영자가 직관적으로 파악하고 해석하기 어려웠습니다.',
        cause: '가공되지 않은 원시 메트릭 지표를 단순 노출하는 방식이 원인이었습니다.',
        solution:
          'Grafana 쿼리 및 시각화 방식을 개선하여 직관적인 대시보드를 구성함으로써, 실시간 시스템 모니터링·분석 환경을 구축하고 클라우드 인프라 운영 가시성을 확보했습니다.',
      },
    ],
    result: [
      '클라우드 인프라 운영 가시성을 확보하는 통합 모니터링 환경 구축',
      '교내 프로젝트 최종 평가 A+ 달성',
    ],
  },

  {
    slug: 'oss-video-project',
    title: 'OSS 강의 동영상 제작',
    period: '2023.10 ~ 2023.12',
    type: '개인 프로젝트',
    organization: '교내 오픈소스소프트웨어 수업',
    techStack: ['Docker', 'Prometheus', 'Grafana', 'Linux'],
    summary:
      '<Docker 기반 3-Tier 아키텍처 배포 및 Prometheus·Grafana를 활용한 메트릭 데이터 분석>을 주제로 기획·제작한 실습 중심의 오픈소스 강의 동영상 제작',
    responsibilities: [
      'Docker를 활용한 3-Tier 아키텍처 환경 구축 및 배포 시나리오 기획',
      'Prometheus 메트릭 수집 및 Grafana 대시보드 시각화 연동 실습 가이드 구성',
      '강의 영상 녹화, 편집, 시각 자료 제작 및 기술 개념 입문자 맞춤형 설명 제공',
    ],
    troubleshooting: [
      {
        problem:
          '복잡한 클라우드·컨테이너 인프라 개념과 메트릭 분석 과정을 입문자 관점에서 쉽고 명확하게 전달하는 데 어려움이 존재했습니다.',
        cause: '이론 중심의 구체적이지 못한 설명 방식이 원인이었습니다.',
        solution:
          'Docker 3-Tier 배포부터 Prometheus/Grafana 메트릭 연동까지의 실습 과정을 단계별 시각 자료와 실행 예제로 재구성하여 전달력을 극대화했습니다.',
      },
    ],
    result: [
      'Docker 기반 3-Tier 배포 및 메트릭 분석 실습 강의 영상 제작 완료',
    ],
  },
  {
    slug: 'aju-berry-fighting',
    title: '금연 구역 흡연 감지 알람 시스템',
    period: '2023.08 ~ 2023.12',
    type: '팀 프로젝트 (4명)',
    organization: '교내 시스템 프로그래밍 수업',
    techStack: ['C', 'Raspberry Pi', 'TCP/IP Socket', 'POSIX Threads'],
    summary:
      '라즈베리파이 4대와 다양한 임베디드 센서를 연동하여 골목길 내 화재, 흡연, 무단투기 등 위험 상황을 실시간 감지하고 대응하는 통합 안전 시스템 구축',
    responsibilities: [
      '4개 라즈베리파이 간 데이터 흐름도 및 전체 시스템 네트워크 아키텍처 설계',
      '알림 전담 파이(Notification Pi) 개발 및 POSIX Threads(Pthreads) 기반 멀티스레드 알림 제어(LED·LCD·부저) 구현',
      '가스·불꽃·압력·조도·PIR 센서 및 Pi Camera, GPS 모듈 연동 및 실환경 임계값 최적화',
    ],
    troubleshooting: [
      {
        problem:
          '단일 소켓 공유 구조 시 데이터 충돌 및 알림 지연이 우려되었으며, 기존 RF 통신 모듈의 실시간성 한계 및 센서 오탐지 문제가 존재했습니다.',
        cause: '통신 채널 미분리 및 센서 임계값이 실환경에 맞게 최적화되지 않은 점이 원인이었습니다.',
        solution:
          '기능별 3개 독립 TCP 소켓 채널로 분리 설계하고, 실환경 테스트를 통해 센서 최적 임계값을 도출했습니다. 또한 불꽃 센서에 3초 지속성 판단 로직을 추가하여 오탐을 방지했습니다.',
      },
    ],
    result: [
      '위험 상황 감지부터 알림 전송까지 약 1~3초의 안정적인 실시간 응답 속도 확보',
      '임베디드 센서 연동 및 멀티스레드/소켓 통신 기반 통합 안전 솔루션 구축 완료',
    ],
  },
]