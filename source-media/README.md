这里用于存放作品集网站的原始素材。

- `originals/`：原始大图备份，不会进入网站发布包，也已加入 `.gitignore`。
- `public/media/portfolio/`：网站实际使用的优化图片，包含 `cover`、`full` 和 `thumb`。

后续新增项目时，建议先把原图放到 `source-media/originals/项目名/`，再生成优化图放入 `public/media/portfolio/项目名/`。
