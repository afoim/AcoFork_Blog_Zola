const fs = require('fs');
const path = require('path');

// 获取命令行参数中的文章名称
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('请提供文章名称，例如: npm run new-post my-new-post');
    process.exit(1);
}

const postName = args[0];
const postsDir = path.join(__dirname, '../content/posts');
const newPostDir = path.join(postsDir, postName);
const indexFile = path.join(newPostDir, 'index.md');

// 检查文件夹是否已存在
if (fs.existsSync(newPostDir)) {
    console.error(`错误: 文章目录 "${postName}" 已存在`);
    process.exit(1);
}

// 创建文件夹
try {
    fs.mkdirSync(newPostDir, { recursive: true });
} catch (err) {
    console.error(`无法创建目录: ${err.message}`);
    process.exit(1);
}

// 获取当前日期 YYYY-MM-DD
const today = new Date();
const dateStr = today.toISOString().split('T')[0];

// Front Matter 模板
const content = `---
title: ${postName}
date: ${dateStr}
description: 
draft: false
extra:
  image: 
  lang: ''
---
`;

// 写入文件
try {
    fs.writeFileSync(indexFile, content, 'utf8');
    console.log(`成功创建文章: ${indexFile}`);
} catch (err) {
    console.error(`无法写入文件: ${err.message}`);
    process.exit(1);
}
