const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'votes.json');

// 初始化投票数据
!fs.existsSync(DATA_FILE) && fs.writeFileSync(DATA_FILE, JSON.stringify({
  '1':0,'2':0,'3':0,'4':0,'5':0,'6':0,'7':0,'8':0
}));

app.use(express.json());
app.use(express.static(__dirname));

// 允许跨域（GitHub Pages访问需要）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.get('/api/vote', (req, res) => res.json(JSON.parse(fs.readFileSync(DATA_FILE))));

app.post('/api/vote', (req, res) => {
  const votes = JSON.parse(fs.readFileSync(DATA_FILE));
  votes[req.body.flavorId] = (votes[req.body.flavorId] || 0) + 1;
  fs.writeFileSync(DATA_FILE, JSON.stringify(votes));
  res.json({success:true, votes});
});

app.listen(PORT, () => console.log(`
🍙 粽王争霸后端已启动！
📡 本地: http://localhost:${PORT}
🌐 运行 npx localtunnel --port 3000 获取全网地址
`));