export const mediaPath = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

export const designer = {
  name: '刘伟峰',
  title: 'Interior Designer / 全案私宅设计',
  location: '浙江宁波',
  email: '1736454894@QQ.com',
  phone: '联系电话待补充',
  years: '8 年',
  focus: '高端别墅 / 大平层全案设计',
};

export const stats = [
  { value: '10+', label: '年高端私宅经验' },
  { value: '300-800㎡', label: '主力别墅与大宅尺度' },
  { value: '20+', label: '宁波本地落地楼盘' },
  { value: '1:1', label: '效果图到实景还原目标' },
];

export const createGallery = (slug, count) =>
  Array.from({ length: count }, (_, index) => {
    const imageName = `image-${String(index + 1).padStart(2, '0')}.jpg`;
    return {
      full: mediaPath(`media/portfolio/${slug}/full/${imageName}`),
      thumb: mediaPath(`media/portfolio/${slug}/thumb/${imageName}`),
    };
  });

export const projects = [
  {
    name: '江南里独栋别墅',
    meta: '678㎡ / 负二至三层全案',
    desc: '地下社交层、三层双子女套房、分层动静体系与庭院室内一体化设计。',
    tone: 'project-a',
    image: mediaPath('media/portfolio/jiangnan/cover.jpg'),
    gallery: createGallery('jiangnan', 21),
  },
  {
    name: '东海府顶层复式',
    meta: '宁波高端改善私宅',
    desc: '优雅轻法',
    tone: 'project-b',
    image: mediaPath('media/portfolio/donghaifu/cover.jpg'),
    gallery: createGallery('donghaifu', 21),
  },
  {
    name: '玖和府别墅',
    meta: '别墅大宅 / 自然界面',
    desc: '处理采光、防潮、灰空间与复合功能区，建立完整家庭生活场景。',
    tone: 'project-c',
    image: mediaPath('media/portfolio/jiuhefu/cover.jpg'),
    gallery: createGallery('jiuhefu', 19),
  },
  {
    name: '云栖凤鸣',
    meta: '现代自然别墅 / 室内全案',
    desc: '以温润木色、天然石材与庭院绿意，营造通透而沉静的现代东方居所。',
    tone: 'project-d',
    image: mediaPath('media/portfolio/yunqifengming/cover.jpg'),
    gallery: createGallery('yunqifengming', 19),
  },
  {
    name: '宜和东方合院',
    meta: '现代合院 / 全案设计',
    desc: '以通透挑空、天窗引光与石材金属质感，串联会客、餐叙与静谧卧室，呈现现代合院的雅致层次。',
    tone: 'project-a',
    image: mediaPath('media/portfolio/yihedongfang/cover.jpg'),
    gallery: createGallery('yihedongfang', 19),
  },
];

/**
 * 从 public/projects.json 异步加载项目列表。
 * 编辑 projects.json 或运行 add-project 脚本后，重新构建即可生效。
 * 加载失败时回退到上方静态 projects。
 */
export async function loadProjects() {
  try {
    const res = await fetch(mediaPath('projects.json'), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) throw new Error('empty list');
    return list.map((item) => ({
      name: item.name || '未命名项目',
      meta: item.meta || '',
      desc: item.desc || '',
      tone: item.tone || 'project-a',
      image: mediaPath(`media/portfolio/${item.slug}/cover.jpg`),
      gallery: createGallery(item.slug, item.count || 0),
    }));
  } catch (err) {
    console.warn('[portfolio] projects.json 加载失败，使用静态配置:', err.message);
    return projects;
  }
}

export const strengths = [
  {
    title: '全案方案能力',
    text: '从需求分析、户型改造、风格意向到材质色卡和灯光专项，形成完整汇报逻辑。',
  },
  {
    title: '空间结构重构',
    text: '擅长分层动静分区、环形洄游动线、茶室、酒窖、健身区、宴会厅等复合空间规划。',
  },
  {
    title: '材质与灯光深化',
    text: '建立统一材质配比、极窄收口标准、圆弧规范和分层无主灯智能场景。',
  },
  {
    title: '工地落地管控',
    text: '把控木作收口、石材拼接、弧形工艺、悬浮柜体等节点，协同多专业团队推进。',
  },
  {
    title: '高端客户沟通',
    text: '围绕家庭结构、生活痛点、收藏爱好与待客需求，输出可理解、可决策的设计逻辑。',
  },
  {
    title: '供应链整合',
    text: '长期合作石材、木作、灯具、软装与园林资源，支持从选材到陈设的统一落地。',
  },
];

export const navItems = [
  { href: '#profile', label: '设计理念' },
  { href: '#projects', label: '项目' },
  { href: '#strengths', label: '优势' },
  { href: '#contact', label: '联系' },
];

export const heroPhases = ['Define', 'Space', 'Material', 'Delivery'];

export const heroServices = [
  '高端别墅全案',
  '大平层空间重构',
  '灯光 / 材质 / 软装落地',
];

export const heroVideoSrc = '';
