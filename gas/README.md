# GAS バックエンド

## セットアップ

1. [スプレッドシート](https://docs.google.com/spreadsheets/d/1J9syVvFHcV9SiRpgCU67TIPtZICCaDmadnmDWNpfnVg) を開く
2. **拡張機能 → Apps Script**
3. `Code.gs` の内容をこのフォルダの `Code.gs` で置き換え
4. **デプロイ → 新しいデプロイ → ウェブアプリ**
   - 実行ユーザー: 自分
   - アクセス: 全員
5. フロントの `.env` に `VITE_GAS_API_URL` を設定済み

## CORS について

- **開発時**: Vite が `/gas-api` を `script.google.com` にプロキシ（同一オリジン化）
- **初回紐づけ `linkAccount`**: **GET** で実行（POST の CORS を回避）
- **その他 POST**: `Content-Type: text/plain` で JSON 送信（`src/api/gasFetch.ts`）

`Code.gs` を更新したら **必ずウェブアプリを再デプロイ**してください（`linkAccount` の GET 対応が必要です）。

## Settings シート（1行目ヘッダー）

| 列名 | 必須 | 例 |
|------|------|-----|
| id | ○ | m001 |
| name | ○ | 田中 健太 |
| email | ○ | xxx@gmail.com |
| campus | ○ | 相模原（「相模原キャンパス」等もGASが正規化） |
| preferredRole1 | ○ | ボーカル |
| preferredRole2 | | アコースティックギター |
| instruments | | ボーカル,PA（空なら1+2+3から自動生成） |
| availableWeekdays | | 木,金 |
| bio | | 自己紹介 |
| joinedYear | | 2022 |
| avatarUrl | | URL（空なら自動生成） |

## ServiceLog シート（1行目ヘッダー）

| 列名 | 必須 | 例 |
|------|------|-----|
| id | | svc-xxx（新規登録時はGASが自動採番） |
| date | ○ | 2026-05-30 |
| campus | ○ | 青山 |
| memberId | ○ | m001 |
| memberName | | 田中 健太 |
| instrument | ○ | ボーカル |
| eventName | | 主日礼拝 |

## API 一覧

| action | メソッド | 説明 |
|--------|----------|------|
| getMembers | GET | 全員 + 履歴 + 集計 |
| getMemberByEmail | GET | email で1人 |
| registerServicesBulk | POST | 奉仕一括登録 |
| updateProfile | POST | プロフィール更新 |
| linkAccount | POST | 初回ログイン（id + Googleメールで email 列を上書き） |
