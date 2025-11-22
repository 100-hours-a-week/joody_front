<p align="center">
  <img src="https://github.com/100-hours-a-week/joody_front/blob/feature/week_10/img/logo4.png" 
       alt="로고" width="30%"/>
</p>

<br/>
<br/>

## 1. Project Overview (프로젝트 개요)

- 프로젝트 이름: 아무말 대잔치
- 프로젝트 설명: 다양한 사람들이 모인 자유로운 커뮤니티

<br/>
<br/>

## 2. Introduce (팀원 및 팀 소개)

- 개인프로젝트 : 주다영(FE)

<br/>
<br/>

## 3. Key Features (주요 기능)

- **회원가입**:

  - 회원가입 시 DB에 유저정보가 등록됩니다.

- **로그인**:

  - 사용자 인증 정보를 통해 로그인합니다.

- **게시글 작성**:

  - 새로운 게시글을 작성할 수 있습니다.

- **게시글 검색 기능**:

  - 관심있는 게시글을 즉시 검색해볼 수 있습니다.

- **프로필**:
  - 회원정보 수정(프로필 이미지 수정 및 닉네임 수정), 비밀번호 수정이 가능합니다.

<br/>
<br/>

## 4. Technology Stack (기술 스택)

### 4.1 Language

HTML,CSS,JavaScript
<br/>

### 4.2 Cooperation

Git,Github,Notion
<br/>
<br/>

## 5. Project Structure (프로젝트 구조)

```plaintext
projects/
├── css/                          # 각 페이지별 스타일 파일
│
├── img/                          # 정적 이미지 리소스 (프로필, 아이콘 등)
│
├── js/
│   ├── utils/                    # 공통 유틸리티 모음
│   │   ├── api.js               # API 요청(fetch) 공통 함수
│   │   ├── common.js            # 유틸 함수 (validation, DOM helpers 등)
│   │   └── user.js              # 사용자 프로필/로그인 정보 관리
│   │
│   ├── v-dom/                   # Virtual DOM 기반 페이지 및 core 시스템
│   │   ├── common/
│   │   │   ├── store.js         # 전역 상태 관리 (mini Redux)
│   │   │   └── Vdom.js          # Virtual DOM 핵심 구현부 (h, diff, patch)
│   │   │
│   │   ├── login_virtual.js         # 로그인 페이지(Virtual DOM 버전)
│   │   ├── passwordEdit_virtual.js  # 비밀번호 변경 페이지(Virtual DOM)
│   │   ├── postCreate_virtual.js    # 게시글 작성 페이지(Virtual DOM)
│   │   ├── postDetail_virtual.js    # 게시글 상세 페이지(Virtual DOM)
│   │   ├── postEdit_virtual.js      # 게시글 수정 페이지(Virtual DOM)
│   │   ├── postlist_virtual.js      # 게시글 목록 페이지(Virtual DOM)
│   │   ├── profileEdit_virtual.js   # 프로필 수정 페이지(Virtual DOM)
│   │   ├── signup1_virtual.js       # 회원가입 1단계(Virtual DOM)
│   │   └── signup2_virtual.js       # 회원가입 2단계(Virtual DOM)
│   │
│   ├── login.js                   # 로그인 페이지(일반 DOM 버전)
│   ├── passwordEdit.js            # 비밀번호 수정(일반 DOM)
│   ├── post.js                    # 게시글 + 댓글 관련 공통 동작
│   ├── postAll.js                 # 전체 게시글 불러오기
│   ├── postCreate.js              # 게시글 작성
│   ├── postDetail.js              # 게시글 상세
│   ├── postEdit.js                # 게시글 수정
│   ├── postlist.js                # 게시글 목록(일반 DOM / 인피니티 스크롤)
│   ├── profileEdit.js             # 프로필 수정
│   ├── signup_1.js                # 회원가입 1단계
│   ├── signup_2.js                # 회원가입 2단계
│   └── signup.js                  # 초기 회원가입 버전(통합형)
│
├── login.html                     # 로그인 페이지 템플릿
├── passwordEdit.html              # 비밀번호 변경 페이지
├── post.html                      # 개별 게시글 페이지
├── postCreate.html                # 게시글 작성 페이지
├── postEdit.html                  # 게시글 편집 페이지
├── postlist.html                  # 게시글 목록 페이지
├── profileEdit.html               # 프로필 수정 페이지
├── signup_1.html                  # 회원가입 1단계
├── signup_2.html                  # 회원가입 2단계
└── signup.html                    # 회원가입 초기 템플릿

```

## 🎥 Demonstration (시현 영상)
![회원가입및로그인_내보내기](https://github.com/user-attachments/assets/de9c776e-d1af-4eea-98ce-b04778af332d)

<br/>
<br/>
