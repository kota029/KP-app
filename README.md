# ACF 奉仕者管理 Web App

React + Vite + TypeScript の奉仕者カタログ・構成アシスト・奉仕登録・マイページアプリ。  
データは Google スプレッドシート + Google Apps Script（`gas/Code.gs`）で管理します。

## ローカル開発

```bash
npm install
cp .env.example .env   # 値を設定
npm run dev
```

## 環境変数

| 変数名 | 説明 |
|--------|------|
| `VITE_GAS_API_URL` | GAS ウェブアプリ URL（末尾 `/exec`） |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth クライアント ID |

`.env` は Git に含めません（`.env.example` を参照）。

## デプロイ（Vercel）

1. GitHub リポジトリ `kota029/kp-app` に push
2. [Vercel](https://vercel.com) でリポジトリを Import
3. Framework: **Vite**、Build: `npm run build`、Output: `dist`
4. 環境変数に `VITE_GAS_API_URL` と `VITE_GOOGLE_CLIENT_ID` を設定（下記の値）
5. **Deploy のあと、環境変数を変えたら必ず Redeploy**（Vite はビルド時に環境変数を埋め込む）
6. Google Cloud Console の「承認済み JavaScript 生成元」に本番 URL（例: `https://kp-app-nu.vercel.app`）を追加

本番の GAS 通信は `/gas-api` プロキシ（`vercel.json`）経由です。`VITE_GAS_API_URL` が無いと画面上部に「デモモード（10名）」と表示されます。

## GAS

`gas/README.md` を参照。コード変更後はウェブアプリを再デプロイしてください。
