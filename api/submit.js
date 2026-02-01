import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// 簡單關卡答案對照表
const LEVELS = {
  "p1": "apple",
  "p2": "banana",
  "p3": "cherry"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, level, answer } = req.body;

  // 先檢查答案是否正確
  if (!LEVELS[level] || LEVELS[level] !== answer) {
    return res.status(400).json({ success: false, message: "答案錯誤" });
  }

  // 取得使用者資料
  const { data: user, error: getError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();

  if (getError || !user) {
    return res.status(404).json({ success: false, message: "找不到使用者" });
  }

  // 檢查是否已經通關過
  const cleared = user.cleared || [];
  if (cleared.includes(level)) {
    return res.status(200).json({ success: true, message: "已經通過此關", score: user.score });
  }

  // 更新分數與 cleared 陣列
  const newScore = (user.score || 0) + 10;
  const { data: updated, error: updateError } = await supabase
    .from('users')
    .update({
      score: newScore,
      cleared: [...cleared, level]
    })
    .eq('username', username)
    .single();

  if (updateError) {
    return res.status(500).json({ success: false, message: "更新失敗" });
  }

  return res.status(200).json({
    success: true,
    message: "關卡完成",
    score: updated.score,
    cleared: updated.cleared
  });
}
