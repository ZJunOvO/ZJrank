import { db, ensureAuth } from './cloudbase';

const COLLECTIONS_REF = db.collection('collections');

// 模拟数据
const SEED_DATA = [
  {
    title: "2024必看电影Top10",
    template: "classic",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      {
        id: "1",
        rank: 1,
        name: "奥本海默",
        subtitle: "Oppenheimer",
        description: "克里斯托弗·诺兰导演的传记惊悚片，讲述了美国理论物理学家罗伯特·奥本海默参与研制原子弹的故事。",
        image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      },
      {
        id: "2",
        rank: 2,
        name: "芭比",
        subtitle: "Barbie",
        description: "格蕾塔·葛韦格执导的奇幻喜剧片，玛格特·罗比和瑞恩·高斯林主演。",
        image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
      }
    ]
  },
  {
    title: "上海周末探店指南",
    template: "editorial",
    coverImage: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
    items: [
      {
        id: "1",
        rank: 1,
        name: "RAC Bar",
        subtitle: "安福路",
        description: "法式休闲餐厅，绿色复古门面非常出片，可丽饼是招牌。",
        price: "¥120/人",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        tags: ["Brunch", "法式", "网红店"]
      },
      {
        id: "2",
        rank: 2,
        name: "Metal Hands",
        subtitle: "南昌路",
        description: "来自北京的精品咖啡，铁手拿铁口感浓郁，工业风装修。",
        price: "¥45/人",
        image: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        tags: ["咖啡", "工业风"]
      }
    ]
  }
];

export const seedDatabase = async () => {
  await ensureAuth();
  console.log('开始写入模拟数据...');
  
  try {
    for (const data of SEED_DATA) {
      const collectionData = {
        ...data,
        itemCount: data.items.length,
        lastEdited: new Date(),
        createdAt: new Date(),
        isDraft: false
      };
      
      await COLLECTIONS_REF.add(collectionData);
      console.log(`成功写入集合: ${data.title}`);
    }
    console.log('模拟数据写入完成！');
  } catch (error) {
    console.error('写入数据失败:', error);
  }
};
