# 刘伟峰个人作品集网站

React + Vite 实现的室内设计师作品集网站，支持 GitHub Pages 自动部署。

## 本地预览

```powershell
pnpm install
pnpm run dev
```

默认访问：

```text
http://127.0.0.1:5173/
```

如果 5173 被占用，Vite 会自动换端口。

## 构建检查

```powershell
pnpm run build
```

构建产物在 `dist/`，GitHub Pages 会自动发布这个目录。

## 用 GitHub Desktop 上传并部署

1. 打开 GitHub Desktop。
2. 选择 `File -> Add local repository...`。
3. 选择这个项目目录：

```text
C:\Users\17364\Documents\个人作品集网站
```

4. 左下角填写提交说明，例如：

```text
Initial portfolio website
```

5. 点击 `Commit to main`。
6. 点击顶部 `Publish repository` 上传到 GitHub。
7. 打开 GitHub 网页里的这个仓库，进入 `Settings -> Pages`。
8. `Build and deployment` 选择 `GitHub Actions`。
9. 回到 `Actions` 页面，等待 `Deploy Portfolio` 执行完成。
10. 完成后，Pages 会显示网站地址。

## 修改项目文字（无需改代码）

所有项目的名称、说明、图片数量都在这个文件里：

```text
public/projects.json
```

用记事本或 VS Code 打开，直接修改对应的 `name`、`meta`、`desc`、`count` 字段，保存后重新构建即可。

设计师个人信息（姓名、邮箱、电话等）和首页文字仍在：

```text
src/data/portfolio.js
```

## 一键添加新项目（推荐）

1. 准备一个原图文件夹，把项目照片放进去（jpg/jpeg/png 均可），例如：

```text
C:\Users\17364\Desktop\个人作品\新项目
```

2. 运行一键添加脚本（自动优化图片 + 更新配置）：

```powershell
pnpm run add:project -- -Source "C:\Users\17364\Desktop\个人作品\新项目" -Slug "new-villa" -Name "新项目名称" -Meta "项目类型 / 面积" -Desc "项目简介" -Tone "project-a"
```

参数说明：

| 参数 | 说明 | 示例 |
|---|---|---|
| `-Source` | 原图文件夹路径（必填） | `C:\Users\...\新项目` |
| `-Slug` | 英文标识，用于文件夹和网址（必填） | `new-villa` |
| `-Name` | 项目中文名称（必填） | `云栖山庄` |
| `-Meta` | 副标题 | `500㎡ / 独栋别墅` |
| `-Desc` | 项目简介 | `以温润木色...` |
| `-Tone` | 配色主题，可选 `project-a`~`project-d` | `project-d` |

3. 脚本会自动完成：
   - 优化图片（生成 full 大图、thumb 缩略图、cover 封面）
   - 更新 `public/projects.json`（自动统计图片数量）

4. 重新构建发布：

```powershell
pnpm run build
```

## 仅优化图片（不更新配置）

如果只需要生成优化后的图片，手动管理配置：

```powershell
pnpm run optimize:project -- -Source "C:\Users\17364\Desktop\个人作品\新项目" -Slug "new-project"
```

## 原始素材

原始大图放在：

```text
source-media/originals/
```

这个目录已加入 `.gitignore`，不会上传到 GitHub，也不会进入网站发布包。
