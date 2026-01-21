---
title: Typora免付费激活
date: 2025-08-15
description: 'Typora是一个简洁易用（？）的MarkDown编辑器，不想交钱？改几行文件就破解！'
draft: false
taxonomies:
  tags: ["Typora"]
extra:
  image: '/img/67afd0b3f8616b801c1ef6d6ae46f841.png'
  lang: ''
---


进入 [Typora 官方中文站](https://typoraio.cn/)

下载并安装，假设你的安装路径为 `D:/App/Typora`

关闭所有Typora相关进程

用VSCode打开 `D:/App/Typora`

全局搜索，将

```bash
e.hasActivated="true"==e.hasActivated
```

改为

```bash
e.hasActivated="true"==“true”
```

打开 Typora，已激活

![](/img/67afd0b3f8616b801c1ef6d6ae46f841.png)
