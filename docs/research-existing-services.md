# 既存スクラムポーカーサービスの調査・分析

調査日: 2026-02-08

## エグゼクティブサマリー

本調査では、主要なスクラムポーカーサービス5社を分析し、機能比較、UXパターン、技術実装、差別化ポイントを特定しました。市場は**無料＋広告モデル**と**Freemiumモデル**に二極化しており、**非同期投票**と**Jira連携**が競争優位性の鍵となっています。

---

## 1. 主要サービス概要

### 1.1 PlanITpoker (planitpoker.com)

**特徴:**
- 完全無料（広告サポート）
- 有料プランなし（広告削除不可）
- マルチプロジェクト対応
- Jira/Trello連携

**強み:**
- シンプルで使いやすいUI
- 登録不要で即利用可能
- 複数プロジェクトの管理機能

**弱み:**
- 広告が常時表示
- プレミアム機能なし

**ターゲット:** 小規模チーム、予算制約のあるスタートアップ

**参考:** [PlanITpoker: Online Scrum planning poker](https://planitpoker.com/)

---

### 1.2 Pointing Poker

**特徴:**
- 登録不要
- 完全無料（任意の寄付制）
- 即時投票結果表示

**強み:**
- シンプルで軽量
- 必要最小限の機能に特化
- ストーリー説明フィールドが控えめで邪魔にならない

**弱み:**
- **投票後すぐに他人の投票が見える**（アンカリングバイアスのリスク）
- リアルタイムで統計が更新される
- 機能が限定的

**問題点:** 投票の同時公開原則が守られていない（Planning Pokerの基本ルール違反）

**参考:** [Best Planning Poker Tools Comparison](https://www.parabol.co/blog/best-planning-poker-tools/)

---

### 1.3 Scrumpy Poker

**特徴:**
- 登録不要で即開始可能
- **非同期投票**対応
- **自動Confluenceサマリー生成**
- 複数のスコアリングシステム
- Jira Marketplace アプリ

**強み:**
- 非同期投票により、タイムゾーンが異なるチームでも対応可能
- Jira/Confluence/monday.com/Azure DevOps/GitHub/GitLab/Slack連携
- Jiraプロジェクトボードから直接起動可能
- **面白い画像やジョークで飽きさせない工夫**

**価格モデル:**
- 無料プラン: 基本機能
- Jira統合: Atlassian Marketplace経由

**ターゲット:** Atlassianエコシステム利用チーム、分散チーム

**参考:**
- [Scrumpy Planning Poker](https://scrumpy.poker/)
- [Scrumpy Jira Integration](https://marketplace.atlassian.com/apps/1219205/scrumpy-planning-poker-for-jira)

---

### 1.4 Parabol Sprint Poker (parabol.co)

**特徴:**
- **完全無料**（無制限ユーザー、無制限ボード）
- アンカリングバイアス防止の投票メカニズム
- 非同期サポート
- 自動ミーティングサマリー
- AI搭載のスプリントサマリーと見積もり分析

**強み:**
- **最も寛大な無料プラン**（制限なし）
- 高度な投票メカニズム
- バックログ・チャットツール連携が豊富
- ビデオ会議ツールとのシームレスな統合

**価格モデル:**
- Free: 無制限
- Premium: 高度な機能（詳細不明）

**評価:** **ベストフリーツール**として評価（UX品質、機能数、連携の豊富さ）

**ターゲット:** あらゆる規模のチーム、特にコスト重視の組織

**参考:**
- [The 5 Best Planning Poker Tools](https://www.parabol.co/blog/best-planning-poker-tools/)
- [Best Planning Poker Tools for 2025](https://www.zenhub.com/blog-posts/best-planning-poker-tools-for-2025-from-free-to-enterprise)

---

### 1.5 Sprint Poker (その他のツール)

その他の主要ツール:
- **Zenhub:** 非同期投票、自動見積もり計算、GitHub Issue同期、AI搭載分析
- **PlanningPoker.live:** Basic無料（5人まで、広告あり）、$14.95/月〜（10人まで）
- **PlanningPokerOnline.com:** Freemium、ファシリテーター単位の課金

**参考:**
- [Planning Poker for Developers](https://planningpoker.live/)
- [Best Planning Poker Tools for Agile Teams](https://www.teamretro.com/best-planning-poker-tools-for-agile-teams/)

---

## 2. 主要機能比較

| 機能カテゴリ | PlanITpoker | Pointing Poker | Scrumpy | Parabol | Zenhub |
|------------|-------------|----------------|---------|---------|--------|
| **基本機能** |
| ルーム作成 | ✅ | ✅ | ✅ | ✅ | ✅ |
| リアルタイム投票 | ✅ | ✅ | ✅ | ✅ | ✅ |
| 結果表示 | ✅ | ⚠️即時表示 | ✅ | ✅同時公開 | ✅ |
| 複数スコアリングシステム | ✅ | ❌ | ✅ | ✅ | ✅ |
| **高度機能** |
| 非同期投票 | ❌ | ❌ | ✅ | ✅ | ✅ |
| 自動サマリー生成 | ❌ | ❌ | ✅Confluence | ✅ | ✅AI搭載 |
| アンカリングバイアス防止 | ✅ | ❌ | ✅ | ✅高度 | ✅ |
| **連携** |
| Jira | ✅ | ❌ | ✅ | ✅ | ❌ |
| GitHub | ❌ | ❌ | ✅ | ✅ | ✅ネイティブ |
| Confluence | ❌ | ❌ | ✅ | ❌ | ❌ |
| Slack | ❌ | ❌ | ✅ | ✅ | ✅ |
| **価格** |
| 無料プラン | ✅広告あり | ✅寄付制 | ✅ | ✅無制限 | 制限あり |
| 有料プラン | ❌ | ❌ | 詳細不明 | ✅ | ✅ |

**参考:**
- [Planning Poker Tools Comparison](https://www.scrumpoker.it/en/blog/4)
- [Free Planning Poker Tools](https://kollabe.com/posts/best-free-planning-poker-tools)

---

## 3. UXパターン分析

### 3.1 投票フロー

**標準的な投票フロー:**

1. **準備フェーズ:** ストーリーの説明、質疑応答
2. **投票フェーズ:** 各メンバーが秘密裏にカードを選択
3. **公開フェーズ:** 全員が準備完了後、**同時に公開**
4. **議論フェーズ:** 見積もりの差異について議論
5. **再投票または確定:** コンセンサスに達するまで繰り返し

**重要原則:**
- **同時公開** - アンカリングバイアス（最初の見積もりが他者に影響を与える認知バイアス）を防ぐ
- **秘密投票** - 他者の投票を見る前に自分の見積もりを提出

**参考:**
- [What is Planning Poker?](https://www.productplan.com/glossary/planning-poker/)
- [Planning Poker Guide](https://planningpoker.live/what-is-planning-poker)

---

### 3.2 カード表示とアニメーション

**視覚的要素:**
- ✅ **投票状況の可視化:** 絵文字で表現（👍 投票完了、🤔 未投票）
- ✅ **カードの明確な表示:** 大きく読みやすいカード
- ✅ **公開アクション:** 明確な「公開」ボタン
- ✅ **進捗の透明性:** 誰が投票済みかリアルタイム表示

**エンゲージメント強化:**
- 絵文字によるリアクション（混乱、同意、興奮を即座に表現）
- リモートセッションでも個人的で魅力的な雰囲気を演出
- 自動公開機能でスピーディーな見積もりセッションを実現

**参考:**
- [Planning Poker UX Design Case Study](https://bootcamp.uxdesign.cc/case-study-planning-poker-online-identity-and-ux-ui-design-for-a-scrum-poker-web-application-e2348d43b2f5)
- [Free Planning Poker Tools](https://blog.online-planning-poker.com/poker-planning-online-free/)

---

### 3.3 モデレーター制御

**モデレーター権限:**
- ストーリーポイントの公開タイミング制御
- セッションのリスタート
- ストーリーの追加・編集
- 参加者の管理

**参考:** [Planning Poker Features](https://planningpoker.live/)

---

## 4. リアルタイム通信技術

### 4.1 WebSocketベースの実装

**主要技術スタック:**
- **Node.js + Socket.IO:** 最も一般的な組み合わせ
- **Spring Framework + WebSocket:** Javaバックエンド
- **Actix (Rust) + WebSocket:** 高性能な実装例

**オープンソース実装例:**

1. **ScrumPoker (Node.js)**
   - HTML5 WebSocket + Socket.IO
   - リアルタイムスクラムポーカー

2. **Scrum Poker Planning (Spring)**
   - WebSocket + Spring Framework
   - チームフレンドリーなリアルタイム実装

3. **AstroX Scrum Poker (Rust + Astro)**
   - Actix WebSocket + Astro フロントエンド
   - 高性能な実装

**参考:**
- [ScrumPoker on GitHub](https://github.com/WayneYe/ScrumPoker)
- [Spring WebSocket Scrum Poker](https://github.com/Hazem-Ben-Khalfallah/scrum-poker-planning)
- [AstroX Scrum Poker](https://github.com/MassivDash/scrumpoker)

---

### 4.2 リアルタイム同期の特徴

**実装される機能:**
- リアルタイム投票状況の更新
- 即座のカード公開
- 参加者の入退室通知
- チャット・リアクション機能
- 自動統計計算

**参考:**
- [Open Source Planning Poker Tools](https://www.scrumexpert.com/tools/open-source-planning-poker-tools/)
- [Scrum Poker GitHub Topics](https://github.com/topics/scrum-poker)

---

## 5. 連携機能

### 5.1 Jira連携

**連携方法:**

**方法1: Atlassianプラグイン**
- Jira内から直接Planning Pokerルームを開く
- 現在選択中のプロジェクトボードと自動連携
- 最も直接的な統合方法

**方法2: APIトークン**
- JiraとConfluenceを代理で使用
- 機能:
  - Jiraチケットの検索
  - ストーリーポイント見積もりの自動更新
  - チケットへのコメント追加（サマリー付き）
  - Confluenceサマリーページの生成

**主要プラグイン:**
- Scrumpy Planning Poker for Jira
- Scrum Poker Estimates for Jira
- Agile Poker for Jira
- Scrum Poker Confluence Jira Integration

**参考:**
- [Scrumpy Jira Integration](https://scrumpy.poker/2018/04/01/jira-integration-for-scrumpy-planning-poker/)
- [Scrum Poker for Jira Documentation](https://planningpoker.atlassian.net/wiki/spaces/DOC/pages/688619525/Scrum+Poker+Estimates+for+Jira)

---

### 5.2 その他の連携

**サポートされる主要ツール:**
- Confluence
- monday.com
- Azure DevOps
- GitHub / GitLab
- Slack
- ビデオ会議ツール（Zoom、Teams、Google Meet）

**参考:** [Free Online Planning Poker for Agile Teams](https://scrumpy.poker/)

---

## 6. 非同期投票機能

### 6.1 非同期投票の重要性

**必要性:**
- グローバル分散チーム（異なるタイムゾーン）
- フレキシブルな作業時間
- 不便な時間帯の会議を避ける

**効果:**
- 参加率が**最大25%向上**（研究データ）
- チームメンバーが自分のスケジュールで投票可能
- 全投票完了後に自動通知

**参考:**
- [Async Poker Tools for Remote Teams](https://www.quely.io/blog/top-5-async-poker-tools-for-remote-distributed-teams)
- [Asynchronous Planning Poker](https://kollabe.com/blog/posts/asynchronous-planning-poker)

---

### 6.2 実装パターン

**事前投票方式（Scrumpy）:**
- 異なるタイムゾーンで作業するチーム向け
- メンバーが事前に投票
- スクラムマスターが後で投票を収集し、見積もりを完了

**通知システム:**
- ローカルタイムゾーンで特定の時刻にPlanning Poker質問を送信
- 全投票完了時にチーム全体に通知

**ハイブリッドアプローチ:**
- 同期・非同期の両方をサポート
- チームメンバーが自分のスケジュールで投票
- Planning Pokerのメリットを維持しつつ、分散環境の現実に対応

**主要ツール:**
- **DoAsync Async Poker:** 分散チーム向け、全員が同時参加不要
- **Parabol:** 非同期サポート、自動ミーティングサマリー
- **Zenhub:** 非同期投票、全投票後に自動見積もり計算

**参考:**
- [How to conduct planning poker for remote teams](https://www.troopr.ai/post/how-to-conduct-planning-poker-for-remote-teams-new)
- [Planning Poker for Remote Teams](https://liquitim.com/blog/planning-poker-online)

---

## 7. ゲーミフィケーション・エンゲージメント

### 7.1 ゲーミフィケーション要素

**Planning Pokerの本質:**
- スプリント計画を**ゲーム化**する楽しくコラボレーティブな方法
- カードデッキを活用して見積もりをより魅力的でコラボレーティブに

**具体的な要素:**
- 🃏 カードベースのメカニクス
- ☕ "コーヒーブレーク"カード（ジョーク要素）
- 😄 面白い画像やジョーク（Scrumpy）
- 🎭 絵文字リアクション（混乱、同意、興奮）

**効果:**
- セッションがより楽しく、退屈にならない
- 計画セッションが恐怖ではなく楽しみに
- チームモラルの向上

**参考:**
- [How to Play Planning Poker](https://www.easyagile.com/blog/planning-poker)
- [The Gamification of Effort Estimation](https://doasync.com/blog/the-gamification-of-effort-estimation-with-planning-poker/)
- [Make Planning Poker Fun](https://dev.to/mattlewandowski93/make-planning-poker-fun-45eh)

---

### 7.2 チームビルディング効果

**コラボレーション促進:**
- 全員が参加し、つながりを促進
- サイロを打破し、ポジティブなチーム文化を推進
- 一人の独裁ではなく、チーム全体のコンセンサス

**エンゲージメント向上:**
- クロスファンクショナルチーム全員に投票権
- オーナーシップと連帯感の促進
- 正確なプロジェクトタイムラインのためのツールかつ、仲間意識の触媒

**会議の質向上:**
- 参加率の向上
- 全員にとって楽しい体験
- Jira連携、カスタムカードセット、匿名投票、ビデオ会議ツール統合

**参考:**
- [Planning Poker Visualization Game-changer](https://activecollab.com/blog/project-management/planning-poker-guide)
- [Benefits of Planning Poker](https://www.invensislearning.com/blog/planning-poker/)

---

## 8. カードデッキシステム

### 8.1 Modified Fibonacciシーケンス

**標準シーケンス:**
```
0, 1, 2, 3, 5, 8, 13, 20, 40, 100
```

**Fibonacci vs Modified Fibonacci:**
- **純粋なFibonacci:** 1, 2, 3, 5, 8, 13, 21, 34, 55, 89...
- **Modified:** 13以降は単一桁の精度（20, 40, 100）

**Modified を使う理由（Mike Cohnの言葉）:**
> "21ではなく20と見積もったことに、非常に確信があるに違いない"
>
> 単一桁の精度を使うことで、見積もりの不確実性を示す

**なぜFibonacciが機能するか:**
- ギャップが進むにつれて大きくなる
- 小さなチャンク（できればスプリント内で達成可能）への分解を促進
- ストーリーポイントで見積もるチームに有用

**参考:**
- [Planning Poker - Wikipedia](https://en.wikipedia.org/wiki/Planning_poker)
- [Print Your Own Planning Poker Cards](https://teamworx.co.nz/agile-articles/print-planning-poker-cards-fibonacci-t-shirt-sizes/)

---

### 8.2 T-Shirtサイジング

**T-Shirtサイズ:**
```
XS, S, M, L, XL, XXL
```

**使用目的:**
- ストーリーがストーリーポイントではなくT-Shirtサイズに視覚的にバインドされている場合
- 小/大スケールでタスクを評価（ストーリーポイントを考えずに）
- 相対的なサイジングに便利

**参考:**
- [Fibonacci and T-Shirt Release](https://scrumpy.poker/2018/07/28/fibonacci-tshirt-release-jul-28/)
- [Planning Poker vs T-Shirt Sizing](https://doasync.com/blog/planning-poker-vs-t-shirt-sizing-vs-dot-voting-key-differences/)

---

### 8.3 複合デッキと特殊カード

**複合カードデッキ:**
- 数字とT-Shirtサイズの両方
- 例: 0-5のカードがXS〜XXLのT-Shirtサイズも兼ねる

**特殊カード:**
- **❓ (?)** - 不確実、わからない
- **∞ (無限大)** - このタスクは完了できない
- **☕ (コーヒーカップ)** - 休憩が必要、チームにコーヒーを淹れる

**商用デッキの例:**
```
0, ½, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?, ∞, ☕
```

**参考:**
- [Estimation Techniques: Story Points, Planning Poker, and T-Shirt Sizing](https://medium.com/@noorfatimaafzalbutt/estimation-techniques-story-points-planning-poker-and-t-shirt-sizing-581f04874ea1)
- [Planning Poker Cards - The Agile Box](https://theagilebox.com/product/planning-poker-cards/)

---

## 9. モバイル・PWA対応

### 9.1 ネイティブアプリ

**iOS:**
- Planning-Poker: モダンなカードデザイン、アニメーション
- My Poker Planning: アジャイルストーリー見積もり、投票共有
- Scrum Poker Planning: 3種類のカードデッキ（標準、Fibonacci、T-Shirt）

**Android:**
- Planning Poker: スマホ、タブレット、Android Wear対応
- デザイン最適化済み

**参考:**
- [Planning-Poker - App Store](https://apps.apple.com/us/app/planning-poker/id6478492379)
- [PlanningPoker on GitHub](https://github.com/saschpe/PlanningPoker)

---

### 9.2 Progressive Web Apps (PWA)

**PWAの利点:**
- ホーム画面にインストール可能
- オフラインで使用可能（ネイティブアプリのように）
- クロスプラットフォーム（iOS、Android両対応）
- インストール不要でブラウザからも利用可能

**オープンソースPWA例:**
- Planning Poker PWA (GitHub)
- Free Scrum/Agile Planning Poker Web App

**参考:**
- [Planning Poker PWA on GitHub](https://github.com/emersonsoares/planning-poker-pwa)
- [Free Planning Poker App](https://planning-poker-agile.web.app/)

---

## 10. 価格モデル比較

### 10.1 価格戦略の類型

**1. 完全無料（広告サポート）**
- **PlanITpoker:** 無制限無料、広告あり、有料プランなし
- **ターゲット:** 予算制約のある小規模チーム

**2. 完全無料（寄付制）**
- **Pointing Poker:** 任意寄付、登録不要
- **ターゲット:** ミニマリスト志向のチーム

**3. 完全無料（無制限）**
- **Parabol:** 無制限ユーザー、無制限ボード、プレミアム機能あり
- **ターゲット:** あらゆる規模のチーム、コスト重視

**4. Freemiumモデル**
- **PlanningPoker.live:**
  - Free: 5人まで、広告あり
  - Paid: $14.95/月〜（10人まで）
- **PlanningPokerOnline.com:**
  - Free: 制限あり
  - Premium: フル機能、ファシリテーター単位課金

**5. Pay-per-Useモデル**
- 新規ルーム作成ごとに1クレジット課金

**6. チームベース課金**
- $25/月〜（1チーム）
- 大規模グループではユーザー単位より割安

**参考:**
- [Planning Poker Pricing](https://planningpoker.live/pricing)
- [5 Best Free Planning Poker Tools](https://dev.to/mattlewandowski93/5-best-free-planning-poker-tools-for-agile-teams-in-2025-2i02)

---

### 10.2 競合他社の価格設定

| サービス | 無料プラン | 有料プラン | 課金方式 |
|---------|-----------|-----------|---------|
| PlanITpoker | ✅ 無制限（広告） | ❌ | 広告収益 |
| Pointing Poker | ✅ 無制限 | ❌ | 寄付 |
| Parabol | ✅ 無制限 | ✅ | Freemium |
| PlanningPoker.live | 5人まで | $14.95/月〜 | ユーザー数 |
| Scrumpy | ✅ 基本機能 | 詳細不明 | Freemium |
| Zenhub | 制限あり | ✅ | Freemium |

**参考:** [Top 5 Scrum Poker Tools](https://www.scrumpoker.it/en/blog/4)

---

## 11. 差別化ポイントと提案

### 11.1 市場ギャップ分析

**既存サービスの弱点:**

1. **UX不足:**
   - Pointing Poker: アンカリングバイアス防止が不十分
   - 一部サービス: 投票後即時表示（Planning Pokerルール違反）

2. **非同期投票の不足:**
   - 多くの無料ツールは同期的な投票のみ
   - グローバルチームには不十分

3. **モバイル体験:**
   - PWA対応が限定的
   - ネイティブアプリは少数

4. **カスタマイズ性:**
   - カードデッキのカスタマイズが制限的
   - チームごとの設定保存が弱い

5. **エンゲージメント:**
   - ゲーミフィケーション要素が浅い
   - チームビルディング機能が限定的

---

### 11.2 差別化戦略の提案

#### **戦略1: 最高のUX × 非同期ファースト**

**コンセプト:**
- **アンカリングバイアス完全防止**（厳密な同時公開）
- **非同期投票をコア機能に**（オプションではなくデフォルト）
- **タイムゾーン自動調整**
- **美しいアニメーション**（カード公開の演出）

**差別化ポイント:**
- Pointing Pokerの欠点を解消
- グローバル分散チームに最適化
- 視覚的に優れたUX

---

#### **戦略2: ディープなJira/GitHub統合**

**コンセプト:**
- **双方向同期**（見積もり自動反映）
- **Jira/GitHubからワンクリック起動**
- **自動Confluenceレポート生成**
- **GitHubプロジェクトボード連携**

**差別化ポイント:**
- Scrumpy以上の統合深度
- 開発ワークフローにシームレスに組み込み
- 手動入力の削減

---

#### **戦略3: ゲーミフィケーション × チームビルディング**

**コンセプト:**
- **チームアチーブメントシステム**
- **見積もり精度トラッキング**（過去の見積もりvs実績）
- **カスタムカードデッキ作成**（チームのミーム、画像）
- **リアクションGIF/Stickerサポート**
- **バーチャルコーヒーブレイク機能**

**差別化ポイント:**
- Planning Pokerを"楽しい体験"に昇華
- リモートチームの連帯感醸成
- 継続利用率の向上

---

#### **戦略4: AI搭載の見積もり支援**

**コンセプト:**
- **過去の見積もりデータから類似タスクを提案**
- **見積もりのばらつきが大きい場合にアラート**
- **スプリントベロシティ予測**
- **AIサマリー自動生成**（Parabolより高度）

**差別化ポイント:**
- データドリブンな見積もり
- チームの見積もり精度向上
- AI活用の最先端

---

#### **戦略5: オールインワンアジャイルツール**

**コンセプト:**
- **Planning Poker + レトロスペクティブ**
- **Planning Poker + スプリント計画**
- **Planning Poker + デイリースタンドアップ**
- 一つのツールで全アジャイル儀式をカバー

**差別化ポイント:**
- ツールの統合管理
- 学習コストの低減
- データの一元化

---

### 11.3 推奨戦略

**優先度1: 戦略1（UX × 非同期ファースト）**
- 実装コスト: 中
- 差別化インパクト: 高
- 市場ニーズ: 高（グローバルチーム増加）

**優先度2: 戦略3（ゲーミフィケーション）**
- 実装コスト: 中
- 差別化インパクト: 中〜高
- 市場ニーズ: 中（エンゲージメント重視）

**優先度3: 戦略2（Jira/GitHub統合）**
- 実装コスト: 高
- 差別化インパクト: 高
- 市場ニーズ: 高（エンタープライズチーム）

**長期ビジョン: 戦略4（AI搭載）**
- 実装コスト: 高
- 差別化インパクト: 非常に高
- 市場ニーズ: 中〜高（成熟チーム）

---

## 12. 技術実装の推奨事項

### 12.1 フロントエンド

**推奨スタック:**
- **React + TypeScript**（型安全性）
- **Tailwind CSS**（高速スタイリング）
- **Framer Motion**（アニメーション）
- **PWA対応**（Next.jsのPWAサポート）

**理由:**
- 最新のPWA標準
- オフライン対応
- モバイル最適化
- インストール可能

---

### 12.2 バックエンド

**推奨スタック:**
- **Node.js + Socket.IO**（リアルタイム通信の標準）
- または **Rust + Actix WebSocket**（高性能）

**理由:**
- 豊富なコミュニティサポート
- WebSocketのベストプラクティス確立
- スケーラビリティ

---

### 12.3 データベース

**推奨:**
- **PostgreSQL**（リレーショナルデータ）
- **Redis**（セッション管理、リアルタイムデータ）

**理由:**
- 非同期投票のデータ永続化
- セッション状態の高速アクセス

---

## 13. まとめ

### 13.1 主要発見

1. **市場は二極化:**
   - 完全無料（広告/寄付）vs Freemium
   - Parabolが最も寛大な無料プラン

2. **差別化の鍵:**
   - **非同期投票**（グローバルチーム対応）
   - **Jira/GitHub連携**（ワークフロー統合）
   - **ゲーミフィケーション**（エンゲージメント）

3. **技術トレンド:**
   - WebSocket（Socket.IO）が標準
   - PWA対応が増加
   - AI搭載が最新トレンド（Zenhub、Parabol）

4. **UX重要性:**
   - アンカリングバイアス防止が必須
   - 同時公開の徹底
   - 視覚的フィードバック（絵文字、アニメーション）

---

### 13.2 次のステップ

1. **技術スタック決定:**
   - フロントエンド: React + TypeScript + PWA
   - バックエンド: Node.js + Socket.IO
   - データベース: PostgreSQL + Redis

2. **MVP機能定義:**
   - 必須: リアルタイム投票、同時公開、Fibonacciデッキ
   - 差別化: 非同期投票、美しいアニメーション

3. **統合優先順位:**
   - フェーズ1: Jira連携
   - フェーズ2: GitHub連携
   - フェーズ3: Slack通知

4. **ゲーミフィケーション設計:**
   - カスタムカードデッキ
   - チームアチーブメント
   - リアクション機能

---

## 参考文献

### 主要ソース

- [The 5 Best Planning Poker Tools for Online Estimation [2025]](https://www.parabol.co/blog/best-planning-poker-tools/)
- [Best Planning Poker Tools for Agile Teams (2026 Edition) | TeamRetro](https://www.teamretro.com/best-planning-poker-tools-for-agile-teams/)
- [PlanITpoker: Online Scrum planning poker](https://planitpoker.com/)
- [Scrumpy Planning Poker](https://scrumpy.poker/)
- [Best Planning Poker Tools for 2025: From Free to Enterprise | Zenhub Blog](https://www.zenhub.com/blog-posts/best-planning-poker-tools-for-2025-from-free-to-enterprise)

### 技術実装

- [ScrumPoker on GitHub](https://github.com/WayneYe/ScrumPoker)
- [Spring WebSocket Scrum Poker](https://github.com/Hazem-Ben-Khalfallah/scrum-poker-planning)
- [AstroX Scrum Poker](https://github.com/MassivDash/scrumpoker)
- [Planning Poker PWA on GitHub](https://github.com/emersonsoares/planning-poker-pwa)

### 非同期投票

- [Top 7 Async Poker Tools for Remote & Distributed Teams](https://www.quely.io/blog/top-5-async-poker-tools-for-remote-distributed-teams)
- [Asynchronous Planning Poker](https://kollabe.com/blog/posts/asynchronous-planning-poker)

### Jira連携

- [Scrumpy Jira Integration](https://scrumpy.poker/2018/04/01/jira-integration-for-scrumpy-planning-poker/)
- [Scrum Poker for Jira Documentation](https://planningpoker.atlassian.net/wiki/spaces/DOC/pages/688619525/Scrum+Poker+Estimates+for+Jira)

### UX・ゲーミフィケーション

- [Planning Poker UX Design Case Study](https://bootcamp.uxdesign.cc/case-study-planning-poker-online-identity-and-ux-ui-design-for-a-scrum-poker-web-application-e2348d43b2f5)
- [The Gamification of Effort Estimation](https://doasync.com/blog/the-gamification-of-effort-estimation-with-planning-poker/)
- [Make Planning Poker Fun](https://dev.to/mattlewandowski93/make-planning-poker-fun-45eh)

### カードデッキ

- [Planning Poker - Wikipedia](https://en.wikipedia.org/wiki/Planning_poker)
- [Print Your Own Planning Poker Cards](https://teamworx.co.nz/agile-articles/print-planning-poker-cards-fibonacci-t-shirt-sizes/)
- [Planning Poker vs T-Shirt Sizing](https://doasync.com/blog/planning-poker-vs-t-shirt-sizing-vs-dot-voting-key-differences/)

### 価格モデル

- [Planning Poker Pricing](https://planningpoker.live/pricing)
- [5 Best Free Planning Poker Tools](https://dev.to/mattlewandowski93/5-best-free-planning-poker-tools-for-agile-teams-in-2025-2i02)
- [Top 5 Scrum Poker Tools](https://www.scrumpoker.it/en/blog/4)

---

**調査担当:** researcher
**チーム:** scrum-poker-design
**ステータス:** 完了
**最終更新:** 2026-02-08
