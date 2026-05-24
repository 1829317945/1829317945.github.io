---
title: 足迹
date: 2026-03-24 20:55:32
---

<div id="map-container" style="width: 100%; height: 600px; background: #0b1222; border-radius: 8px; position: relative;">
  <div id="map-loading" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #409eff;">地图加载中...</div>
</div>

<script src="https://fastly.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script>
// 如果 fastly 加载失败，尝试使用 unpkg
if (typeof echarts === 'undefined') {
  document.write('<script src="https://unpkg.com/echarts@5.4.3/dist/echarts.min.js"><\/script>');
}
</script>
<script>
(function() {
  const initMap = () => {
    const container = document.getElementById('map-container');
    const loading = document.getElementById('map-loading');
    if (!container || !window.echarts) return;

    const cityCoords = {
      // 国内主要城市
      '泰安': [117.129, 36.1949],
      '成都': [104.0665, 30.5723],
      '北京': [116.4074, 39.9042],
      '上海': [121.4737, 31.2304],
      '广州': [113.2644, 23.1291],
      '深圳': [114.0579, 22.5431],
      '杭州': [120.1536, 30.2874],
      '南京': [118.7965, 32.0603],
      '武汉': [114.3054, 30.5931],
      '西安': [108.9402, 34.3416],
      '重庆': [106.5516, 29.5630],
      '长沙': [112.9388, 28.2282],
      '苏州': [120.5853, 31.2989],
      '天津': [117.2010, 39.0842],
      '郑州': [113.6253, 34.7466],
      '济南': [117.0009, 36.6758],
      '青岛': [120.3826, 36.0671],
      '大连': [121.6147, 38.9140],
      '厦门': [118.1102, 24.4905],
      '福州': [119.3062, 26.0753],
      '昆明': [102.7123, 25.0406],
      '贵阳': [106.7135, 26.5783],
      '海口': [110.3312, 20.0319],
      '南宁': [108.3200, 22.8240],
      '南昌': [115.8921, 28.6765],
      '合肥': [117.2272, 31.8206],
      '沈阳': [123.4294, 41.7943],
      '长春': [125.3235, 43.8171],
      '哈尔滨': [126.6425, 45.7569],
      '石家庄': [114.5149, 38.0423],
      '太原': [112.5489, 37.8706],
      '呼和浩特': [111.7519, 40.8415],
      '银川': [106.2309, 38.4872],
      '兰州': [103.8236, 36.0581],
      '西宁': [101.7782, 36.6171],
      '拉萨': [91.1322, 29.6604],
      '乌鲁木齐': [87.6177, 43.7928],
      '台北': [121.5654, 25.0330],
      '香港': [114.1734, 22.3193],
      '澳门': [113.5439, 22.1912],
      '吕梁': [111.1433, 37.5273],
      '运城': [111.0039, 35.0227],
      '临汾': [111.5176, 36.0841],
      '晋中': [112.7364, 37.6964],
      '忻州': [112.7335, 38.4177],
      '大同': [113.2952, 40.0903],
      '阳泉': [113.5832, 37.8612],
      '长治': [113.1135, 36.1911],
      '晋城': [112.8512, 35.4975],
      '朔州': [112.4333, 39.3312],
      // 国际主要城市
      '纽约': [-74.006, 40.7128],
      '伦敦': [-0.1278, 51.5074],
      '巴黎': [2.3522, 48.8566],
      '东京': [139.6917, 35.6895],
      '柏林': [13.405, 52.52],
      '悉尼': [151.2093, -33.8688],
      '莫斯科': [37.6173, 55.7558],
      '新加坡': [103.8198, 1.3521],
      '曼谷': [100.5018, 13.7563],
      '首尔': [126.978, 37.5665]
    };

    const chart = echarts.init(container);

    // 加载本地 world.json, china.json 和 data.json
    Promise.all([
      fetch('./world.json').then(res => {
        if (!res.ok) throw new Error('world.json not found');
        return res.json();
      }),
      fetch('./china.json').then(res => {
        if (!res.ok) throw new Error('china.json not found');
        return res.json();
      }),
      fetch('./data.json').then(res => {
        if (!res.ok) throw new Error('data.json not found');
        return res.json();
      })
    ]).then(([worldJson, chinaJson, footprints]) => {
      loading.style.display = 'none';

      // 核心：动态合并地图数据，实现真正的一体化
      // 1. 过滤掉世界地图中的中国大轮廓
      const otherCountries = worldJson.features.filter(f => 
        f.properties.name !== 'China' && f.properties.name !== '中国'
      );
      // 2. 将中国精细省份数据合并进去
      const mergedFeatures = otherCountries.concat(chinaJson.features);
      const integratedMap = {
        type: 'FeatureCollection',
        features: mergedFeatures
      };

      // 3. 注册这个一体化地图
      echarts.registerMap('integrated', integratedMap);

      const data = Object.keys(footprints).map(city => {
        const cleanCity = city.replace(/市$/, '');
        const coord = cityCoords[cleanCity] || cityCoords[city];
        if (coord) {
          return {
            name: city,
            value: coord.concat(footprints[city].length),
            posts: footprints[city]
          };
        }
        return null;
      }).filter(item => item !== null);

      const option = {
            backgroundColor: 'transparent',
            tooltip: {
              show: true,
              trigger: 'item',
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderColor: '#409eff',
              borderWidth: 1,
              padding: 0,
              textStyle: { color: '#333' },
              enterable: true,
              triggerOn: 'mousemove|click',
              hideDelay: 1500,
              confine: true,
              extraCssText: 'box-shadow: 0 4px 15px rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; min-width: 220px; z-index: 9999; pointer-events: auto;',
              position: function (point, params, dom, rect, size) {
                return [point[0] - size.viewSize[0] / 10, point[1] - size.contentSize[1] - 20];
              },
              formatter: function(params) {
                 if (params.seriesType !== 'effectScatter') return null;
                  const posts = params.data.posts;
                  if (!posts) return null;
                  let html = `<div style="background: #409eff; color: #fff; padding: 12px 15px; font-weight: bold; font-size: 15px; border-bottom: 1px solid rgba(0,0,0,0.1);">${params.name} · ${posts.length} 篇文章</div>`;
                html += `<div style="padding: 5px 0; max-height: 350px; overflow-y: auto;">`;
                posts.forEach((post, index) => {
                  html += `<a href="${post.path}" class="footprint-post-link" style="display: block; padding: 12px 15px; color: #333; text-decoration: none; border-bottom: ${index === posts.length - 1 ? 'none' : '1px dotted #eee'}; transition: all 0.2s ease;">
                    <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px; line-height: 1.4; color: #2c3e50;">${post.title}</div>
                    <div style="font-size: 12px; color: #7f8c8d; display: flex; align-items: center;">
                      <span style="margin-right: 5px;">📅</span>${post.date}
                    </div>
                  </a>`;
                });
                html += `</div>`;
                html += `<style>
                  .footprint-post-link:hover { background: #ebf5ff !important; color: #409eff !important; transform: translateX(5px); }
                  .footprint-post-link:hover div { color: #409eff !important; }
                </style>`;
                return html;
              }
            },
        geo: {
          map: 'integrated', // 使用一体化地图
          roam: true,
          zoom: 5,
          center: [105, 36],
          tooltip: { show: false },
          selectedMode: 'single',
          nameMap: {
            'United States': '美国',
            'Russia': '俄罗斯',
            'Canada': '加拿大',
            'United Kingdom': '英国',
            'France': '法国',
            'Germany': '德国',
            'Japan': '日本',
            'Korea': '韩国',
            'Australia': '澳大利亚',
            'Brazil': '巴西',
            'India': '印度'
          },
          label: {
            show: true,
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: 10,
            formatter: (params) => {
              // 统一处理省份和国家名字
              let name = params.name;
              // 如果是主要国家
              const majorCountries = ['美国', '俄罗斯', '加拿大', '英国', '法国', '德国', '日本', '韩国', '澳大利亚', '巴西', '印度', '新加坡', '泰国', '越南'];
              if (majorCountries.includes(name)) return name;
              // 如果是中国省份（通过 adcode 或特定后缀判断，也可以直接处理）
              if (params.data && params.data.properties && params.data.properties.level === 'province') {
                 return name.replace('省', '').replace('市', '').replace('自治区', '').replace('特别行政区', '');
              }
              // 处理 china.json 中的省份名
              const provinces = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','台湾','内蒙古','广西','西藏','宁夏','新疆','香港','澳门'];
              for(let p of provinces) {
                if(name.includes(p)) return p;
              }
              return '';
            }
          },
          emphasis: {
            itemStyle: { areaColor: '#1a2b4d' },
            label: {
              show: true,
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 10
            }
          },
          select: {
            itemStyle: { areaColor: '#2c4a8d' },
            label: {
              show: true,
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: 10
            }
          },
          itemStyle: {
            areaColor: '#101c3d',
            borderColor: '#213a7a',
            borderWidth: 1
          }
        },
        series: [
          {
            name: '足迹',
            type: 'effectScatter',
            coordinateSystem: 'geo',
            data: data,
            tooltip: { show: true },
            cursor: 'pointer',
            symbolSize: function(val) {
              return 8 + Math.min(val[2] * 2, 15);
            },
            showEffectOn: 'render',
            rippleEffect: {
              brushType: 'fill',
              scale: 3,
              period: 4
            },
            emphasis: { scale: true },
            label: {
              formatter: '{b}',
              position: 'right',
              show: true,
              color: '#fff',
              fontSize: 12,
              textShadowBlur: 2,
              textShadowColor: '#000'
            },
            itemStyle: {
              color: '#00f2ff',
              shadowBlur: 10,
              shadowColor: '#00f2ff'
            },
            z: 5
          }
        ]
      };

      chart.setOption(option);

      window.addEventListener('resize', () => chart.resize());
    }).catch(err => {
      console.error('Map loading failed:', err);
      let errorMsg = '地图加载失败: ';
      if (err.message.includes('world.json')) {
        errorMsg += '找不到 world.json';
      } else if (err.message.includes('data.json')) {
        errorMsg += '找不到 data.json，请确认是否执行了 hexo g';
      } else {
        errorMsg += err.message;
      }
      loading.innerHTML = `<div style="text-align: center;">${errorMsg}<br><br><button onclick="location.reload()" style="padding: 5px 15px; background: #409eff; color: #fff; border: none; border-radius: 4px; cursor: pointer;">刷新重试</button></div>`;
    });
  };

  if (document.readyState === 'complete') {
    initMap();
  } else {
    window.addEventListener('load', initMap);
  }
})();
</script>
