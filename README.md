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

## 修改文字内容

主要内容集中在：

```text
src/data/portfolio.js
```

可以修改：

- 设计师姓名、邮箱、电话、城市
- 首页服务文字
- 导航文字
- 项目名称、项目说明、项目数量
- 个人优势卡片

## 新增精选项目图集

1. 准备一个原图文件夹，例如：

```text
C:\Users\17364\Desktop\个人作品\新项目
```

2. 运行优化脚本，其中 `new-project` 是英文目录名：

```powershell
pnpm run optimize:project -- -Source "C:\Users\17364\Desktop\个人作品\新项目" -Slug "new-project"
```

3. 脚本会生成：

```text
public/media/portfolio/new-project/cover.jpg
public/media/portfolio/new-project/full/image-01.jpg
public/media/portfolio/new-project/thumb/image-01.jpg
```

4. 打开 `src/data/portfolio.js`，在 `projects` 里新增：

```js
{
  name: '新项目名称',
  meta: '项目类型 / 面积',
  desc: '项目简介。',
  tone: 'project-d',
  image: mediaPath('media/portfolio/new-project/cover.jpg'),
  gallery: createGallery('new-project', 12),
}
```

把 `12` 改成这个项目实际图片数量。

## 原始素材

原始大图放在：

```text
source-media/originals/
```

这个目录已加入 `.gitignore`，不会上传到 GitHub，也不会进入网站发布包。
