# GAS バックエンド

## セットアップ

1. [スプレッドシート](https://docs.google.com/spreadsheets/d/1J9syVvFHcV9SiRpgCU67TIPtZICCaDmadnmDWNpfnVg) を開く
2. **拡張機能 → Apps Script**
3. `Code.gs` の内容をこのフォルダの `Code.gs` で置き換え
4. **デプロイ → 新しいデプロイ → ウェブアプリ**
   - 実行ユーザー: 自分
   - アクセス: 全員
5. フロントの `.env` に `VITE_GAS_API_URL` を設定済み

## Settings シート（1行目ヘッダー）

| 列 | 内容 | 備考 |
|----|------|------|
| id | メンバーID | 必須 |
| name | 氏名 | |
| email | メール | |
| campus | 相模原 / 青山 | |
| preferredRole1/2 | 希望楽器 | |
| instruments | 担当楽器（カンマ区切り） | |
| **J列** | **avatarUrl** | アップロード画像（Base64 data URL または URL）。空なら ui-avatars デフォルト |
| **K列** | **参加可能曜日** | プルダウン複数選択: `火曜日,木曜日,金曜日` |
| bio, joinedYear | | |

## ServiceLog シート（1行目ヘッダー）

| 列 | 内容 | 備考 |
|----|------|------|
| id | 奉仕ID | 新規は GAS 自動採番 |
| date | 日付 | |
| campus | キャンパス | |
| memberId | メンバーID | |
| memberName | 氏名 | |
| instrument | 楽器（`リード` 等。旧 `エレキギター` は読み取り時に正規化） | |
| **G列** | **eventName** | じょいふる / めぐみたいむ / 夕礼拝 / ACF礼拝 / コンテンポラリー礼拝 |

## API 一覧

| action | メソッド | 説明 |
|--------|----------|------|
| getMembers | GET | 全員 + 履歴 + 集計 |
| getMemberByEmail | GET | email で1人 |
| linkAccount | GET | 初回ログイン紐づけ |
| updateProfile | POST | プロフィール更新（曜日は K列、アバターは J列） |
| uploadAvatar | POST | アバター画像アップロード（J列に Base64 保存） |
| registerServicesBulk | POST | 奉仕一括登録（eventName 含む） |

## CORS について

- **開発時**: Vite が `/gas-api` をプロキシ
- **本番（Vercel）**: `vercel.json` が `/gas-api` を GAS の `/exec` に rewrite

`Code.gs` を更新したら **必ずウェブアプリを再デプロイ**してください。

## Vercel 本番

環境変数 `VITE_GAS_API_URL` を設定してから **Redeploy** しないとモック10名のままになります。
