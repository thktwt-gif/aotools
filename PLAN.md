# OmniReach 重构版功能规划（含后台）

## 1) 目标
- 提供多语言营销建站 SaaS：页面/产品/博客/线索/SEO/分发/运维一体化。
- 采用“同一布局，多语言内容覆盖”的架构，避免每种语言复制页面。

## 2) 已在原型落地的能力
- 前台：多语言切换、语言级断词策略、伪本地化测试、溢出预警。
- 组件 fitMode：`wrap`、`truncate`、`auto`。
- 留言提交：写入 Strapi `leads` 集合，可扩展 webhook/邮件自动化。
- 后台原型：Strapi 登录后管理布局区块、产品、文章。

## 3) 后续建议（分期）
### MVP
- 多租户、权限、页面管理、拖放编辑、发布与回滚。
- 多语言 SEO（hreflang、sitemap、canonical）。
- 表单与线索中心、邮件与企业微信机器人推送。

### V1
- 产品展示、博客、社交同步插件、自动备份。
- SEO 体检（缺 H1、描述缺失、断链）。

### V2
- 小程序原生渲染器（非 WebView）。
- 模板市场、A/B 测试、企业 SSO、2FA。

## 4) 免费且低侵权风险素材建议
- UI/CSS：Tailwind CSS（MIT）、Bootstrap（MIT）。
- 图标：Heroicons（MIT）、Lucide（ISC）、Tabler（MIT）。
- 图片：Openverse 检索（按许可过滤）、Unsplash/Pexels（遵守各自许可条款）。
- 系统侧必须记录素材来源、许可、作者与归因要求。


## 5) Strapi 重构原则
- 以 Strapi 作为统一 CMS：`layout-blocks/products/articles/leads`。
- 前台仅消费公开 API；后台通过 JWT 调用写接口。
- 保留静态前端部署能力，CMS 可独立扩容。

- Strapi 安装脚本：仓库内置 `strapi/install.sh`，可一键创建 CMS 并注入内容模型模板。
