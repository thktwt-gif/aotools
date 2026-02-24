# Strapi 重构说明

本项目前台(`index.html`)与轻量后台(`admin.html`)已改为直接读写 Strapi REST API。

## 1. 创建 Strapi 项目

```bash
npx create-strapi-app@latest cms --quickstart
```

启动后默认地址：`http://127.0.0.1:1337`。

## 2. 创建内容模型（Collection Types）

在 Strapi 后台创建以下 collection types，并开启国际化（i18n）：

1. `layout-block`  
   - `title` (Text)  
   - `body` (Rich Text / Text)  
   - `fitMode` (Enumeration: `wrap`, `truncate`, `auto`)  
   - `maxLines` (Integer, default: 2)  
   - `order` (Integer)

2. `product`  
   - `name` (Text)  
   - `description` (Text)  
   - `spec` (Text)  
   - `order` (Integer)

3. `article`  
   - `title` (Text)  
   - `excerpt` (Text)  
   - `order` (Integer)

4. `lead`（可不开 i18n）  
   - `name` (Text)  
   - `email` (Email)  
   - `message` (Text)  
   - `consent` (Text/Boolean)  
   - `locale` (Text)  
   - `utm_source/utm_medium/utm_campaign/utm_term/utm_content` (Text)  
   - `gclid/fbclid/keyword/landing_page/referrer` (Text)

## 3. 权限配置（Settings -> Users & Permissions -> Roles）

Public 角色：
- `layout-block` / `product` / `article`: `find`, `findOne`
- `lead`: `create`

Authenticated 角色：
- `layout-block` / `product` / `article`: `find`, `findOne`, `create`, `update`, `delete`

## 4. 对接前端

- 前台与后台默认读取 `localStorage.strapi_url`，默认值 `http://127.0.0.1:1337`。
- `admin.html` 登录后会保存 `strapi_jwt` 到 `localStorage`，用于写操作。

## 5. 运行当前静态站

```bash
python3 -m http.server 4173
```

打开：
- 前台：`http://127.0.0.1:4173/index.html`
- 后台：`http://127.0.0.1:4173/admin.html`


## 6. 截图失败排查（Playwright / browser tool）

如果出现 `NS_ERROR_NET_RESET`，通常不是页面代码报错，而是截图进程连不到本地静态服务。

常见原因：
- 启动服务命令把 `python3 -m http.server` 放在复合命令子 shell 中，父 shell 退出后后台进程被回收。
- 服务未绑定到可转发地址/端口，或截图工具运行环境与当前 shell 不是同一网络命名空间。

建议启动方式（更稳定）：

```bash
nohup python3 -m http.server 4173 --bind 0.0.0.0 >/tmp/aotools_http.log 2>&1 &
curl -I http://127.0.0.1:4173/index.html
```

若 `curl` 正常而截图仍失败，则说明是截图容器网络连通问题（环境限制），不是业务前端代码问题。
