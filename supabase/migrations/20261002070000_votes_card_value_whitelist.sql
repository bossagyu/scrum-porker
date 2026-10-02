-- 20261002060000 で入れた votes_card_value_not_blank は目的を達成していなかった。
-- btrim(card_value) は引数なしだと U+0020 しか削らないため、
-- U+00A0 / U+200B / U+3000 / U+0009 / U+000A / U+2007 はすべて通過し、
-- 統計カードの最頻値欄に不可視のブロックとして表示されてしまう
-- （anon key での PostgREST 直叩きで HTTP 201 になることを実測で確認済み）。
--
-- 空白の除去ではなくホワイトリストに切り替える。votes の INSERT ポリシーは
-- WITH CHECK (true) なので、Server Action（submitVote）を迂回する経路に対しては
-- これが唯一の歯止めになる。
--
-- 許可する形:
--   - 十進数            … fibonacci / powerOf2 / custom のカード面
--                         （custom は isValidCustomCardValue が /^\d+(\.\d+)?$/ に
--                           限定しているので、ここで十進数だけ許せば過不足ない）
--   - XS S M L XL XXL   … tshirt のカード面
--   - ? ∞ ☕            … 特殊カード（SPECIAL_CARDS）
--
-- 注意: カード面の集合は src/lib/constants.ts の CARD_SETS / SPECIAL_CARDS が正。
-- 非数値のプリセットを追加・変更するときは、この制約も合わせて更新すること。
-- 更新を忘れた場合は投票時に 23514 で失敗するため、黙って壊れることはない。

ALTER TABLE votes DROP CONSTRAINT IF EXISTS votes_card_value_not_blank;

ALTER TABLE votes
  ADD CONSTRAINT votes_card_value_allowed
  CHECK (card_value ~ '^([0-9]+(\.[0-9]+)?|XS|S|M|L|XL|XXL|\?|∞|☕)$');
