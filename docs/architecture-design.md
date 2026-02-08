# スクラムポーカー技術スタック・アーキテクチャ設計

## 1. フロントエンド技術選定

### 比較分析

| 技術スタック | 日本語対応 | パフォーマンス | 開発者体験 | エコシステム | 推奨度 |
|------------|----------|--------------|-----------|------------|--------|
| **Next.js 15** | ✅ 完全対応 | ⭐⭐⭐⭐⭐ App Router、RSC | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ 最大 | **推奨** |
| Vue 3 + Nuxt 3 | ✅ 完全対応 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 代替案 |
| React (Vite) | ✅ 完全対応 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 軽量版 |
| SvelteKit | ✅ 完全対応 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ 成長中 | 検討可 |

### **推奨: Next.js 15 (App Router)**

**選定理由:**
- **パフォーマンス**: React Server Components (RSC) で初期ロード高速化
- **開発者体験**: TypeScript完全サポート、ホットリロード、優れたDX
- **日本語対応**: i18n統合が容易、フォント最適化（next/font）
- **SEO**: 静的生成・SSRでランディングページのSEO最適化
- **エコシステム**: 最大規模のコミュニティ、豊富なライブラリ
- **デプロイ**: Vercel最適化（自動デプロイ、プレビュー環境）

**技術構成:**
```typescript
// 推奨スタック
- Next.js 15 (App Router)
- React 19
- TypeScript 5.x
- Tailwind CSS 4.x (スタイリング)
- shadcn/ui (UIコンポーネント)
- Zustand (状態管理 - 軽量、TypeScript親和性高)
- React Hook Form + Zod (フォーム・バリデーション)
```

---

## 2. リアルタイム通信技術選定

### 比較分析

| 技術 | 双方向通信 | レイテンシ | スケーラビリティ | 実装複雑度 | コスト | 推奨度 |
|------|----------|----------|---------------|-----------|--------|--------|
| **WebSocket (Socket.io)** | ✅ | 低 | 中（スケール要設計） | 中 | 低〜中 | **推奨** |
| **Supabase Realtime** | ✅ | 低 | 高（マネージド） | 低 | 低（無料枠大） | **最推奨** |
| Pusher | ✅ | 低 | 高 | 低 | 高 | 小規模NG |
| SSE (Server-Sent Events) | ❌ 片方向 | 低 | 中 | 低 | 低 | 制限あり |
| WebRTC | ✅ P2P | 最低 | - | 高 | 低 | オーバースペック |

### **推奨: Supabase Realtime**

**選定理由:**
- **マネージドサービス**: インフラ管理不要、自動スケーリング
- **無料枠**: 500MB DB、5万MAU、50GB帯域（個人開発・小規模で十分）
- **統合性**: DB（PostgreSQL）+ Auth + Realtime + Storage を統合
- **開発速度**: バックエンドコード不要、フロントエンドのみで完結
- **TypeScript SDK**: 完全型安全、優れたDX
- **日本語ドキュメント**: 充実したコミュニティ

**代替案: Socket.io（カスタムバックエンド必要時）**
- 完全制御が必要な場合
- 既存Node.jsバックエンドとの統合
- Redis Adapter でスケーリング可能

**技術構成:**
```typescript
// Supabase Realtime実装例
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ルームの投票状態をリアルタイム購読
const channel = supabase
  .channel('room:123')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'votes' },
    (payload) => updateUI(payload)
  )
  .subscribe()
```

---

## 3. バックエンド技術選定

### 比較分析

| 技術 | パフォーマンス | 開発速度 | TypeScript親和性 | エコシステム | 推奨度 |
|------|------------|---------|----------------|------------|--------|
| **Supabase (PostgreSQL)** | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ 最速 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **最推奨** |
| Next.js API Routes | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | **推奨** |
| Node.js + Express | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 柔軟性高 |
| Go (Gin) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | 高性能要時 |
| Python (FastAPI) | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ML統合時 |

### **推奨: Supabase + Next.js API Routes (ハイブリッド)**

**アーキテクチャ:**
```
[クライアント]
    ↓
[Next.js App Router]
    ├─ Server Actions (フォーム送信、Mutation)
    ├─ API Routes (カスタムロジック、外部API連携)
    └─ Supabase Client (リアルタイム、認証、CRUD)
         ↓
[Supabase Backend]
    ├─ PostgreSQL (データ永続化)
    ├─ Realtime (WebSocket購読)
    ├─ Auth (認証・認可)
    └─ Row Level Security (セキュリティ)
```

**API設計方針: REST + GraphQL的アプローチ**
- **Supabase**: CRUD操作（自動生成RESTful API + GraphQL風クエリ）
- **Next.js Server Actions**: フォーム送信、複雑なビジネスロジック
- **API Routes**: Webhook、外部API統合、カスタムエンドポイント

---

## 4. データベース設計

### 比較分析

| DB | リアルタイム | スケーラビリティ | 開発速度 | コスト | 推奨度 |
|----|------------|---------------|---------|--------|--------|
| **Supabase (PostgreSQL)** | ✅ ネイティブ | 高 | ⭐⭐⭐⭐⭐ | 低 | **最推奨** |
| Firebase Firestore | ✅ ネイティブ | 高 | ⭐⭐⭐⭐⭐ | 中 | NoSQL好み時 |
| PostgreSQL + Redis | ✅ Pub/Sub | 高 | ⭐⭐⭐ | 中 | 自前管理時 |
| MongoDB + Redis | ✅ Change Streams | 高 | ⭐⭐⭐⭐ | 中 | NoSQL要時 |

### **推奨: Supabase (PostgreSQL + Realtime)**

**データモデル設計:**

```sql
-- ルームテーブル
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 短縮コード（例: ABC123）
  name VARCHAR(255) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  card_set VARCHAR(50) DEFAULT 'fibonacci', -- fibonacci, t-shirt, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

-- 参加者テーブル
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id), -- NULL for guests
  display_name VARCHAR(100) NOT NULL,
  is_observer BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id),
  UNIQUE(room_id, display_name)
);

-- 投票セッションテーブル
CREATE TABLE voting_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  is_revealed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 投票テーブル
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES voting_sessions(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  card_value VARCHAR(10) NOT NULL,
  voted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);

-- セッション履歴（オプション）
CREATE TABLE session_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  final_estimate VARCHAR(10),
  votes_json JSONB, -- 全投票結果のスナップショット
  decided_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_rooms_code ON rooms(code);
CREATE INDEX idx_rooms_active ON rooms(is_active, expires_at);
CREATE INDEX idx_participants_room ON participants(room_id);
CREATE INDEX idx_votes_session ON votes(session_id);
```

**Row Level Security (RLS) 設定:**
```sql
-- 参加者は自分の参加ルームのみ閲覧可能
CREATE POLICY "Participants can view own rooms"
  ON rooms FOR SELECT
  USING (
    id IN (
      SELECT room_id FROM participants
      WHERE user_id = auth.uid()
    )
  );

-- 参加者は自分の投票のみ更新可能（カード提出）
CREATE POLICY "Participants can update own votes"
  ON votes FOR UPDATE
  USING (participant_id IN (
    SELECT id FROM participants WHERE user_id = auth.uid()
  ));
```

**Redis活用（オプション・将来拡張）:**
- セッションキャッシュ（アクティブユーザー、一時データ）
- Rate Limiting
- リアルタイム参加者状態（typing indicators等）

---

## 5. ホスティング・インフラ

### 比較分析

| プラットフォーム | 無料枠 | デプロイ速度 | スケーリング | DX | 月額コスト（小規模） | 推奨度 |
|--------------|--------|------------|------------|----|--------------------|--------|
| **Vercel** | 100GB帯域、無制限デプロイ | ⭐⭐⭐⭐⭐ | 自動 | ⭐⭐⭐⭐⭐ | $0〜$20 | **最推奨** |
| Cloudflare Pages | 無制限、500ビルド/月 | ⭐⭐⭐⭐⭐ | 自動 | ⭐⭐⭐⭐ | $0〜$5 | コスパ最高 |
| Netlify | 100GB帯域、300分ビルド | ⭐⭐⭐⭐ | 自動 | ⭐⭐⭐⭐ | $0〜$19 | 競合選択肢 |
| AWS (Amplify) | 12ヶ月無料（制限あり） | ⭐⭐⭐ | 手動 | ⭐⭐⭐ | $15〜$50+ | 複雑 |
| Railway | $5無料クレジット | ⭐⭐⭐⭐ | 自動 | ⭐⭐⭐⭐ | $5〜$20 | バックエンド向き |

### **推奨: Vercel (フロントエンド) + Supabase (バックエンド・DB)**

**選定理由:**
- **Vercel for Next.js**: 最適化されたビルド、エッジネットワーク（低レイテンシ）
- **自動デプロイ**: GitHub連携でプッシュ時に自動デプロイ、プレビュー環境
- **無料枠**: 個人プロジェクト・小規模チームで十分（100GB/月帯域）
- **Analytics**: Web Vitals監視、パフォーマンス最適化
- **Edge Functions**: 必要に応じてエッジでロジック実行

**デプロイ構成:**
```
┌─────────────────┐
│  Vercel CDN     │ ← Next.js App (Static + SSR)
│  (Edge Network) │
└────────┬────────┘
         │
         ├─→ [Supabase] PostgreSQL + Realtime + Auth
         └─→ [Vercel Edge Functions] カスタムロジック（オプション）
```

**代替案: Cloudflare Pages（コスト最優先時）**
- 無制限帯域、完全無料スタート
- Cloudflare Workers for API
- ただしNext.js一部機能制限あり（ISR等）

---

## 6. 認証戦略

### 比較分析

| 方式 | UX | セキュリティ | 実装複雑度 | コスト | 推奨度 |
|------|-----|------------|-----------|--------|--------|
| **ゲスト参加（匿名）** | ⭐⭐⭐⭐⭐ 即参加 | ⭐⭐⭐ | 低 | 無料 | **推奨** |
| OAuth (Google/GitHub) | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 中 | 無料 | 併用推奨 |
| Email Magic Link | ⭐⭐⭐ | ⭐⭐⭐⭐ | 中 | 無料 | オプション |
| 完全ログイン必須 | ⭐⭐ 摩擦大 | ⭐⭐⭐⭐⭐ | 中 | 無料 | NG |

### **推奨: ハイブリッド認証（ゲスト + OAuth）**

**実装方針:**
```typescript
// 1. ゲスト参加（デフォルト）
// - ルームコード入力 → 表示名入力 → 即参加
// - SessionStorageに一時識別子保存
// - 匿名ユーザーとしてSupabase Auth利用

supabase.auth.signInAnonymously()
  .then(({ data }) => {
    // 一時ユーザーID発行
    localStorage.setItem('guest_id', data.user.id)
  })

// 2. オプションでログイン（履歴保存・複数デバイス同期用）
// - Google OAuth / GitHub OAuth
// - ログイン後もゲスト参加可能

supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${origin}/auth/callback` }
})

// 3. セキュリティ
// - ルームコードのみで参加可能
// - Rate Limiting（1IPあたり10ルーム/時間）
// - 自動失効（24時間後にルーム削除）
```

**ユーザーフロー:**
```
[新規訪問者]
    ↓
[ランディングページ]
    ├─ "新しいルームを作成" → 表示名入力 → ルーム作成（ゲスト）
    └─ "ルームに参加" → コード入力 → 表示名入力 → 参加（ゲスト）
         ↓
    [セッション中]
         ↓
    [オプション: "アカウント作成してログイン"]
         ├─ Google OAuth
         └─ GitHub OAuth
              ↓
         [ログイン完了] → 履歴保存・設定同期
```

---

## 7. コスト見積もり

### 個人開発〜小規模チーム（月間1000アクティブユーザー想定）

| サービス | プラン | 月額コスト | 備考 |
|---------|-------|-----------|------|
| **Vercel** | Hobby | $0 | 100GB帯域、無制限デプロイ（個人利用） |
| **Supabase** | Free | $0 | 500MB DB、5万MAU、50GB帯域 |
| **ドメイン** | - | $12/年 ≈ $1 | お名前.com等 |
| **合計（個人）** | - | **$0〜$1/月** | 無料枠内で運用可能 |

### 成長フェーズ（月間10,000アクティブユーザー想定）

| サービス | プラン | 月額コスト | 備考 |
|---------|-------|-----------|------|
| **Vercel** | Pro | $20 | 1TB帯域、優先サポート |
| **Supabase** | Pro | $25 | 8GB DB、10万MAU、250GB帯域 |
| **監視** | Sentry (Free) | $0 | エラー追跡、パフォーマンス監視 |
| **合計（成長）** | - | **$45/月** | ≈ $0.0045/ユーザー |

### スケールフェーズ（月間100,000アクティブユーザー想定）

| サービス | プラン | 月額コスト | 備考 |
|---------|-------|-----------|------|
| **Vercel** | Pro + 追加帯域 | $50〜$100 | 従量課金 |
| **Supabase** | Team/Enterprise | $599 | 専用インスタンス、SLA保証 |
| **CDN** | Cloudflare Pro | $20 | DDoS保護、高速配信 |
| **監視** | Sentry Team | $26 | 高度な分析 |
| **合計（スケール）** | - | **$695〜$745/月** | ≈ $0.007/ユーザー |

**コスト最適化戦略:**
1. **無料枠最大活用**: Vercel Hobby + Supabase Freeで開始
2. **段階的スケーリング**: ユーザー増に応じてプラン変更
3. **CDN活用**: 静的アセットはVercel CDN、画像は最適化
4. **DB最適化**: インデックス、クエリ最適化でDB負荷軽減
5. **自動クリーンアップ**: 24時間後に古いルーム自動削除

---

## 8. 推奨技術スタック（最終決定）

```yaml
フロントエンド:
  フレームワーク: Next.js 15 (App Router)
  言語: TypeScript 5.x
  UIライブラリ: React 19
  スタイリング: Tailwind CSS 4.x
  UIコンポーネント: shadcn/ui
  状態管理: Zustand
  フォーム: React Hook Form + Zod

バックエンド:
  BaaS: Supabase
  API: Next.js Server Actions + API Routes
  データベース: PostgreSQL (Supabase)
  リアルタイム: Supabase Realtime (WebSocket)

認証:
  方式: ハイブリッド（ゲスト + OAuth）
  プロバイダー: Supabase Auth
  OAuth: Google, GitHub

ホスティング:
  フロントエンド: Vercel
  バックエンド・DB: Supabase Cloud

開発ツール:
  パッケージマネージャー: pnpm
  リンター: ESLint + Prettier
  テスト: Vitest (Unit) + Playwright (E2E)
  CI/CD: GitHub Actions + Vercel Auto Deploy

監視・分析:
  エラー追跡: Sentry (無料プラン)
  分析: Vercel Analytics
  ログ: Supabase Logs
```

---

## 9. アーキテクチャ図

```
┌──────────────────────────────────────────────────────────┐
│                    クライアント                            │
│  Next.js 15 App + Zustand + shadcn/ui + Tailwind CSS     │
└───────────────────┬──────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼─────────┐    ┌────────▼────────────┐
│  Vercel Edge    │    │  Supabase Client    │
│  (Next.js SSR)  │    │  (Direct Access)    │
└───────┬─────────┘    └────────┬────────────┘
        │                       │
        │              ┌────────▼────────────────────┐
        │              │   Supabase Backend          │
        │              ├─────────────────────────────┤
        │              │ • PostgreSQL (DB)           │
        │              │ • Realtime (WebSocket)      │
        │              │ • Auth (認証・認可)          │
        │              │ • Storage (ファイル)         │
        │              │ • Row Level Security (RLS)  │
        │              └─────────────────────────────┘
        │
┌───────▼─────────────────────────────────────────┐
│            Vercel Analytics                     │
│            Sentry (Error Tracking)              │
└─────────────────────────────────────────────────┘
```

---

## 10. 実装優先順位

### Phase 1: MVP (2週間)
- [ ] Next.js + Supabaseプロジェクト初期化
- [ ] DB設計・マイグレーション
- [ ] ルーム作成・参加機能（ゲスト認証）
- [ ] 基本的な投票機能（カード選択・提出）
- [ ] リアルタイム同期（Supabase Realtime）
- [ ] Vercelデプロイ設定

### Phase 2: 機能拡張 (1週間)
- [ ] カードセット選択（Fibonacci、Tシャツ等）
- [ ] 投票結果の統計表示
- [ ] セッション履歴保存
- [ ] UI/UXポリッシュ（アニメーション、レスポンシブ）

### Phase 3: 品質向上 (1週間)
- [ ] OAuth認証（Google/GitHub）
- [ ] エラーハンドリング・ローディング状態
- [ ] E2Eテスト（Playwright）
- [ ] パフォーマンス最適化
- [ ] SEO対策（メタタグ、OGP）

### Phase 4: 運用準備
- [ ] Sentry統合（エラー監視）
- [ ] Vercel Analytics設定
- [ ] ドキュメント整備
- [ ] 本番環境デプロイ

---

## 11. リスクと対策

| リスク | 影響度 | 対策 |
|--------|-------|------|
| **Supabase無料枠超過** | 中 | 使用量監視、アラート設定、有料プラン移行準備 |
| **スパム・悪用** | 高 | Rate Limiting、ルーム自動削除、通報機能 |
| **リアルタイム同期遅延** | 中 | Connection Pool最適化、再接続ロジック |
| **スケーラビリティ** | 低 | 初期はSupabase自動スケーリングに依存 |
| **セキュリティ脆弱性** | 高 | RLS厳密化、入力バリデーション、定期監査 |

---

## 12. 次のステップ

1. **プロジェクト初期化**: `create-next-app` + Supabase CLI
2. **DB設計レビュー**: このドキュメントのSQL実行
3. **プロトタイプ開発**: 最小機能で動作検証
4. **ユーザーテスト**: 社内テストで改善点洗い出し
5. **本番リリース**: Vercel + Supabase本番環境デプロイ

---

**設計完了日**: 2026-02-08
**設計者**: architect (Claude Sonnet 4.5)
**レビュー待ち**: team-lead
