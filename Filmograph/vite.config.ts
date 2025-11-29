import { defineConfig } from "vite";
import react from "@vitejs/plugin-react"; // [필수] React 플러그인 임포트
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),       // [필수] React 플러그인 추가
    tailwindcss()  // Tailwind 플러그인
  ],
  server: {
    proxy: {
      '/kobis': {
        target: 'http://www.kobis.or.kr', // KOBIS API 서버 주소
        changeOrigin: true, // 호스트 헤더 변경 (CORS 우회 핵심)
        rewrite: (path) => path.replace(/^\/kobis/, ''), // 요청 경로에서 '/kobis' 제거
        secure: false, // HTTPS 인증서 오류 무시 (http 대상일 때 유용)
      },
    },
  },
});