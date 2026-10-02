-- 投票値の検証は submitVote（Server Action）が card_set と照合して行うが、
-- votes の INSERT ポリシーは WITH CHECK (true) なので、anon key で PostgREST を
-- 直接叩けば Server Action を迂回して任意の文字列を書き込める。
--
-- 空白だけの値は統計カードの最頻値欄に「不可視のブロック」として表示され、
-- 画面を見ても何が起きているか分からない。最低限これだけは DB 側でも弾く。
--
-- カード集合そのもの（fibonacci / tshirt / powerOf2 / custom）との照合は、
-- プリセットが TypeScript 側（src/lib/constants.ts）にしか無いため、ここで
-- 再定義すると二重管理になる。したがって完全な照合は Server Action 側に残す。
-- 根本的には votes の INSERT ポリシーを絞る必要がある（別課題）。

ALTER TABLE votes
  ADD CONSTRAINT votes_card_value_not_blank CHECK (btrim(card_value) <> '');
