# PSCode

경량 competitive programming 데스크톱 에디터 (Tauri 2 + React + Monaco).

## 사전 요구사항

- Node.js 20+
- Rust ([rustup](https://rustup.rs/))
- Windows: Visual Studio Build Tools, WebView2
- C++17 컴파일러: [MSYS2](https://www.msys2.org/) mingw64 권장

```bash
# MSYS2에서
pacman -S mingw-w64-x86_64-gcc
```

기본 g++ 경로: `C:\msys64\mingw64\bin\g++.exe`

## 설치 및 실행

```bash
npm install
npm run tauri dev
```

## 프로덕션 빌드

```bash
npm run tauri build
```

## 주요 기능

- Monaco C++ 에디터 + CP 스니펫 (`fastio`, `all`, `rall`, `forn`, `forr`, `pb`, `eb`)
- `Ctrl+Enter` 컴파일 및 실행 (g++ C++17)
- 커스텀 테스트 입력 / 출력 콘솔
- 날짜별 문제 폴더 (`projects/YYYY-MM-DD/`)
- 한국어/영어 UI
- 명령 팔레트 (`Ctrl+Shift+P`)
- 자동 저장 및 설정 영속화

## 키보드 단축키

| 단축키 | 동작 |
|--------|------|
| `Ctrl+Enter` | 컴파일 + 실행 |
| `Ctrl+S` | 저장 |
| `Ctrl+Shift+P` | 명령 팔레트 |
| `Ctrl+N` | 새 문제 |
| `Ctrl+,` | 설정 |
| `Ctrl+B` | 사이드바 토글 |
| `` Ctrl+` `` | 출력 콘솔 토글 |

## 작업 폴더

기본값: `Documents/PSCode`  
설정에서 변경 가능. 소스 파일은 `{workspace}/projects/YYYY-MM-DD/*.cpp`에 저장됩니다.

## 설정 파일

`%APPDATA%\com.pscode.app\.pscode\settings.json`
