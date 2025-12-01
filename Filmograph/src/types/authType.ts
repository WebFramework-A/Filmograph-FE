// 로그인 시 필요한 데이터 타입
export interface LoginCredentials {
  email: string;
  password: string;
}

// 회원가입 시 필요한 데이터 타입
export interface SignUpCredentials extends LoginCredentials {
  nickname: string;
}