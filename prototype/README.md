# 齿合平台 - 静态原型项目

一站式口腔产业赋能SaaS平台静态原型，用于需求沟通和演示。

## 项目结构

```
prototype/
├── index.html          # 原型预览入口
├── styles/
│   └── common.css      # 通用样式
├── mobile/             # 移动端H5原型（小程序风格）
│   ├── index.html      # 移动端入口
│   └── pages/          # 页面文件
│       ├── login.html           # 登录/注册
│       ├── home.html            # 首页
│       ├── profile.html         # 个人中心
│       ├── clinic-certify.html # 门诊认证
│       ├── identity-switch.html # 身份切换
│       ├── talent.html          # 人才市场
│       ├── talent-detail.html   # 职位详情
│       ├── talent-resume.html   # 简历库
│       ├── talent-post.html     # 发布职位
│       ├── talent-myresume.html # 我的简历
│       ├── training.html        # 培训学院
│       ├── training-detail.html # 课程详情
│       ├── marketing.html       # 智能获客
│       ├── marketing-create.html # 创建活动
│       ├── marketing-detail.html # 活动详情/预览
│       ├── supply.html          # 供应链集采
│       ├── supply-detail.html   # 商品详情
│       ├── supply-cart.html     # 购物车
│       ├── supply-orders.html   # 订单列表
│       ├── expert.html          # 专家预约
│       ├── expert-detail.html   # 专家详情
│       ├── franchise.html       # 加盟赋能
│       ├── franchise-apply.html # 加盟申请
│       ├── ai-xiaochi.html      # AI小齿
│       └── ai-yixiaobao.html     # AI医小宝
│
└── admin/              # 平台方后台原型（PC风格）
    ├── index.html      # 后台入口
    ├── dashboard.html  # 数据看板
    ├── content.html    # 内容管理
    ├── clinic-audit.html # 门诊审核
    ├── users.html      # 用户管理
    ├── ai-knowledge.html # AI知识库
    └── finance.html    # 订单与财务
```

## 快速预览

### 方式一：直接打开
双击 `prototype/index.html` 即可进入原型预览入口页面。

### 方式二：启动本地服务器（可选）

```bash
# 使用 Python
cd prototype
python -m http.server 8080

# 或使用 Node.js
npx serve prototype
```

然后访问 http://localhost:8080

## 原型范围说明

本原型为**静态演示原型**，不涉及真实业务逻辑和后端对接：

- 移动端模拟小程序H5风格，支持门诊/个人双身份演示
- 后台模拟PC端管理风格，包含平台运营所需功能
- 所有交互均为UI演示，点击后的提示信息为占位内容
- 页面路由通过URL参数模拟不同状态

## 功能模块

### 移动端（六大模块 + AI）
- 人才市场：职位发布/简历库/聊天/面试邀约
- 培训学院：课程学习/进度追踪
- 智能获客：活动模板/线索收集/营销工具
- 供应链集采：商品浏览/购物车/订单管理
- 专家预约：专家库/档期/预约申请
- 加盟赋能：方案展示/加盟申请/进度查询
- AI小齿：智能客服/场景入口
- AI医小宝：医保合规问答

### 平台后台
- 数据看板：用户/门诊/订单/线索统计
- 内容管理：课程/商品/专家/加盟方案
- 门诊审核：资质审核流程
- 用户管理：账号管理
- AI知识库：小齿/医小宝问答配置
- 订单与财务：订单流/加盟申请/营收报表

## 技术栈

- 纯HTML + CSS + JavaScript
- 无框架依赖，可直接浏览器打开
- 响应式设计，支持移动端和桌面端
