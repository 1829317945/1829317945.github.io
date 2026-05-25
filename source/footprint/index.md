---
title: 足迹
date: 2026-03-24 20:55:32
---

<div id="map-container" style="width:100%;height:620px;background:radial-gradient(ellipse at 50% 35%,rgba(240,162,97,0.07) 0%,transparent 55%),linear-gradient(175deg,#060b17 0%,#0b1628 45%,#101d33 100%);border-radius:12px;position:relative;overflow:hidden;box-shadow:0 4px 30px rgba(0,0,0,0.4),0 0 0 1px rgba(45,90,138,0.12) inset;">
  <div id="map-loading" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;color:#8899bb;font-size:14px;z-index:2;pointer-events:none;">
    <div class="fp-pulse-dot" style="width:10px;height:10px;background:#f0a261;border-radius:50%;margin:0 auto;animation:fp-pulse-glow 1.5s ease-in-out infinite;"></div>
    <p style="margin:18px 0 10px;color:#c8d6e5;font-family:'Noto Serif SC',serif;font-size:16px;letter-spacing:3px;">正在加载足迹地图</p>
    <div class="fp-loading-files" style="display:flex;gap:14px;justify-content:center;margin-top:12px;">
      <div class="fp-file-dot" data-file="world" style="width:6px;height:6px;background:#2d4060;border-radius:50%;transition:all 0.4s ease;"></div>
      <div class="fp-file-dot" data-file="china" style="width:6px;height:6px;background:#2d4060;border-radius:50%;transition:all 0.4s ease;"></div>
      <div class="fp-file-dot" data-file="data" style="width:6px;height:6px;background:#2d4060;border-radius:50%;transition:all 0.4s ease;"></div>
    </div>
  </div>
  <div id="map-stats" style="position:absolute;bottom:24px;left:50%;transform:translate(-50%,0);display:none;z-index:10;white-space:nowrap;"></div>
</div>

<style>
@keyframes fp-pulse-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(240,162,97,0.3); transform: scale(0.8); }
  50% { box-shadow: 0 0 18px rgba(240,162,97,0.65); transform: scale(1.25); }
}
@keyframes fp-fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<script src="https://fastly.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js"></script>
<script>
if (typeof echarts === 'undefined') {
  document.write('<script src="https://unpkg.com/echarts@5.4.3/dist/echarts.min.js"><\/script>');
}
</script>
<script>
(function() {
  var initMap = function() {
    var container = document.getElementById('map-container');
    var loading = document.getElementById('map-loading');
    if (!container || !window.echarts) return;

    var cityCoords = {
      '泰安': [117.129, 36.1949], '成都': [104.0665, 30.5723], '北京': [116.4074, 39.9042],
      '上海': [121.4737, 31.2304], '广州': [113.2644, 23.1291], '深圳': [114.0579, 22.5431],
      '杭州': [120.1536, 30.2874], '南京': [118.7965, 32.0603], '武汉': [114.3054, 30.5931],
      '西安': [108.9402, 34.3416], '重庆': [106.5516, 29.5630], '长沙': [112.9388, 28.2282],
      '苏州': [120.5853, 31.2989], '天津': [117.2010, 39.0842], '郑州': [113.6253, 34.7466],
      '济南': [117.0009, 36.6758], '青岛': [120.3826, 36.0671], '大连': [121.6147, 38.9140],
      '厦门': [118.1102, 24.4905], '福州': [119.3062, 26.0753], '昆明': [102.7123, 25.0406],
      '贵阳': [106.7135, 26.5783], '海口': [110.3312, 20.0319], '南宁': [108.3200, 22.8240],
      '南昌': [115.8921, 28.6765], '合肥': [117.2272, 31.8206], '沈阳': [123.4294, 41.7943],
      '长春': [125.3235, 43.8171], '哈尔滨': [126.6425, 45.7569], '石家庄': [114.5149, 38.0423],
      '太原': [112.5489, 37.8706], '呼和浩特': [111.7519, 40.8415], '银川': [106.2309, 38.4872],
      '兰州': [103.8236, 36.0581], '西宁': [101.7782, 36.6171], '拉萨': [91.1322, 29.6604],
      '乌鲁木齐': [87.6177, 43.7928], '台北': [121.5654, 25.0330], '香港': [114.1734, 22.3193],
      '澳门': [113.5439, 22.1912], '吕梁': [111.1433, 37.5273], '运城': [111.0039, 35.0227],
      '临汾': [111.5176, 36.0841], '晋中': [112.7364, 37.6964], '忻州': [112.7335, 38.4177],
      '大同': [113.2952, 40.0903], '阳泉': [113.5832, 37.8612], '长治': [113.1135, 36.1911],
      '晋城': [112.8512, 35.4975], '朔州': [112.4333, 39.3312],
      '纽约': [-74.006, 40.7128], '伦敦': [-0.1278, 51.5074], '巴黎': [2.3522, 48.8566],
      '东京': [139.6917, 35.6895], '柏林': [13.405, 52.52], '悉尼': [151.2093, -33.8688],
      '莫斯科': [37.6173, 55.7558], '新加坡': [103.8198, 1.3521], '曼谷': [100.5018, 13.7563],
      '首尔': [126.978, 37.5665]
    };

    var chart = echarts.init(container);
    var CACHE_PREFIX = 'fp_';
    var CACHE_VERSION = 'v2';
    var CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

    function fetchWithCache(url) {
      var key = CACHE_PREFIX + CACHE_VERSION + '_' + url;
      var cached = localStorage.getItem(key);
      if (cached) {
        try {
          var data = JSON.parse(cached);
          if (data._ts && Date.now() - data._ts < CACHE_TTL) {
            return Promise.resolve(data._payload);
          }
        } catch(e) {}
      }
      return fetch(url).then(function(res) {
        if (!res.ok) throw new Error(url + ' not found');
        return res.json();
      }).then(function(json) {
        try {
          localStorage.setItem(key, JSON.stringify({_ts: Date.now(), _payload: json}));
        } catch(e) {}
        return json;
      });
    }

    var dots = document.querySelectorAll('.fp-file-dot');
    function markLoaded(index) {
      if (dots[index]) {
        dots[index].style.background = '#f0a261';
        dots[index].style.boxShadow = '0 0 8px rgba(240,162,97,0.6)';
      }
    }

    var fetchWorld = fetchWithCache('./world.json').then(function(json) { markLoaded(0); return json; });
    var fetchChina = fetchWithCache('./china.json').then(function(json) { markLoaded(1); return json; });
    var fetchData = fetchWithCache('./data.json').then(function(json) { markLoaded(2); return json; });

    Promise.all([fetchWorld, fetchChina, fetchData]).then(function(_a) {
      var worldJson = _a[0], chinaJson = _a[1], footprints = _a[2];

      var otherCountries = worldJson.features.filter(function(f) {
        return f.properties.name !== 'China' && f.properties.name !== '中国';
      });
      var mergedFeatures = otherCountries.concat(chinaJson.features);
      var integratedMap = { type: 'FeatureCollection', features: mergedFeatures };

      echarts.registerMap('integrated', integratedMap);

      var data = Object.keys(footprints).map(function(city) {
        var cleanCity = city.replace(/市$/, '');
        var coord = cityCoords[cleanCity] || cityCoords[city];
        if (coord) {
          return {
            name: city,
            value: coord.concat(footprints[city].length),
            posts: footprints[city]
          };
        }
        return null;
      }).filter(function(item) { return item !== null; });

      var option = {
        backgroundColor: 'transparent',
        tooltip: {
          show: true,
          trigger: 'item',
          backgroundColor: 'rgba(8,18,35,0.96)',
          borderColor: 'rgba(45,90,138,0.4)',
          borderWidth: 1,
          padding: 0,
          textStyle: { color: '#c8d6e5', fontSize: 13 },
          enterable: true,
          triggerOn: 'mousemove|click',
          hideDelay: 2000,
          confine: true,
          extraCssText: 'box-shadow:0 12px 40px rgba(0,0,0,0.5),0 0 0 1px rgba(45,90,138,0.2) inset;border-radius:12px;overflow:hidden;min-width:240px;backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);pointer-events:auto;z-index:9999;',
          position: function(point, params, dom, rect, size) {
            return [point[0] - size.viewSize[0] / 10, point[1] - size.contentSize[1] - 20];
          },
          formatter: function(params) {
            if (params.seriesType !== 'effectScatter') return null;
            var posts = params.data.posts;
            if (!posts) return null;
            var html = '<div style="background:linear-gradient(135deg,#1a3355,#0d1a30);color:#e8eef5;padding:14px 18px;font-weight:600;font-size:14px;letter-spacing:1px;border-bottom:1px solid rgba(240,162,97,0.2);">';
            html += '<i class="fas fa-map-marker-alt" style="color:#f0a261;margin-right:6px;"></i>' + params.name;
            html += '<span style="float:right;font-weight:400;font-size:12px;color:#8899bb;">' + posts.length + ' 篇</span></div>';
            html += '<div style="padding:4px 0;max-height:320px;overflow-y:auto;">';
            posts.forEach(function(post, index) {
              var isLast = index === posts.length - 1;
              html += '<a href="' + post.path + '" class="fp-tip-link" style="display:block;padding:14px 18px;color:#c8d6e5;text-decoration:none;border-bottom:' + (isLast ? 'none' : '1px solid rgba(45,90,138,0.18)') + ';transition:all 0.25s ease;">';
              html += '<div style="font-size:13px;line-height:1.5;font-weight:500;margin-bottom:4px;color:#e0e8f0;">' + post.title + '</div>';
              html += '<div style="font-size:11px;color:#5e7a99;display:flex;align-items:center;gap:5px;"><i class="far fa-calendar-alt" style="font-size:10px;"></i>' + post.date + '</div>';
              html += '</a>';
            });
            html += '</div>';
            html += '<style>.fp-tip-link:hover{background:rgba(240,162,97,0.08)!important;padding-left:24px!important;}.fp-tip-link:hover div:first-child{color:#f0a261!important;}</style>';
            return html;
          }
        },
        geo: {
          map: 'integrated',
          roam: true,
          zoom: 5,
          center: [105, 36],
          tooltip: { show: false },
          selectedMode: 'single',
          nameMap: {
            'United States': '美国', 'Russia': '俄罗斯', 'Canada': '加拿大',
            'United Kingdom': '英国', 'France': '法国', 'Germany': '德国',
            'Japan': '日本', 'Korea': '韩国', 'Australia': '澳大利亚',
            'Brazil': '巴西', 'India': '印度'
          },
          label: {
            show: true,
            color: 'rgba(120,155,190,0.5)',
            fontSize: 9,
            formatter: function(params) {
              var name = params.name;
              var majorCountries = ['美国','俄罗斯','加拿大','英国','法国','德国','日本','韩国','澳大利亚','巴西','印度','新加坡','泰国','越南'];
              if (majorCountries.indexOf(name) !== -1) return name;
              if (params.data && params.data.properties && params.data.properties.level === 'province') {
                return name.replace('省','').replace('市','').replace('自治区','').replace('特别行政区','');
              }
              var provinces = ['北京','天津','上海','重庆','河北','山西','辽宁','吉林','黑龙江','江苏','浙江','安徽','福建','江西','山东','河南','湖北','湖南','广东','海南','四川','贵州','云南','陕西','甘肃','青海','台湾','内蒙古','广西','西藏','宁夏','新疆','香港','澳门'];
              for (var i = 0; i < provinces.length; i++) {
                if (name.indexOf(provinces[i]) !== -1) return provinces[i];
              }
              return '';
            }
          },
          emphasis: {
            itemStyle: { areaColor: '#132a48', borderColor: '#3a6590', borderWidth: 1.2, shadowColor: 'rgba(61,148,240,0.15)', shadowBlur: 30 },
            label: { show: true, color: 'rgba(200,220,245,0.85)', fontSize: 11 }
          },
          select: {
            itemStyle: { areaColor: '#1a3058' },
            label: { show: true, color: 'rgba(200,220,245,0.85)', fontSize: 11 }
          },
          itemStyle: {
            areaColor: '#0b1a30',
            borderColor: '#1a2d4a',
            borderWidth: 0.8,
            shadowColor: 'rgba(0,0,0,0.4)',
            shadowBlur: 15
          }
        },
        series: [{
          name: '足迹',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: data,
          tooltip: { show: true },
          cursor: 'pointer',
          symbolSize: function(val) {
            return 8 + Math.min(val[2] * 4, 20);
          },
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3.5,
            period: 4,
            color: 'rgba(240,162,97,0.3)'
          },
          emphasis: {
            scale: 2.8,
            itemStyle: {
              shadowBlur: 30,
              shadowColor: '#ffd700'
            }
          },
          label: {
            formatter: '{b}',
            position: 'right',
            show: true,
            color: '#e8eef5',
            fontSize: 11,
            fontWeight: 500,
            textShadowBlur: 6,
            textShadowColor: 'rgba(0,0,0,0.8)',
            offset: [6, -4]
          },
          itemStyle: {
            color: '#f0a261',
            shadowBlur: 18,
            shadowColor: 'rgba(240,162,97,0.7)'
          },
          z: 5
        }]
      };

      chart.setOption(option);

      var statsEl = document.getElementById('map-stats');
      if (statsEl && data.length > 0) {
        var totalCities = data.length;
        var totalPosts = data.reduce(function(s, d) { return s + d.value[2]; }, 0);

        statsEl.innerHTML = '<div style="background:rgba(8,18,35,0.88);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border:1px solid rgba(45,90,138,0.25);border-radius:30px;padding:10px 28px;display:flex;align-items:center;gap:20px;box-shadow:0 8px 32px rgba(0,0,0,0.4);">'
          + '<div style="display:flex;align-items:center;gap:8px;"><i class="fas fa-map-pin" style="color:#f0a261;font-size:14px;"></i><span style="color:#8899bb;font-size:13px;"><span id="stat-cities" style="color:#f0a261;font-weight:700;font-size:18px;font-variant-numeric:tabular-nums;">0</span> 座城市</span></div>'
          + '<div style="width:1px;height:16px;background:rgba(45,90,138,0.3);"></div>'
          + '<div style="display:flex;align-items:center;gap:8px;"><i class="far fa-file-alt" style="color:#61d4f0;font-size:14px;"></i><span style="color:#8899bb;font-size:13px;"><span id="stat-posts" style="color:#61d4f0;font-weight:700;font-size:18px;font-variant-numeric:tabular-nums;">0</span> 篇文章</span></div>'
          + '<div style="width:1px;height:16px;background:rgba(45,90,138,0.3);"></div>'
          + '<div style="display:flex;align-items:center;gap:6px;"><i class="fas fa-globe-asia" style="color:#5e7a99;font-size:13px;"></i><span style="color:#5e7a99;font-size:12px;">探索中</span></div>'
          + '</div>';
        statsEl.style.display = 'flex';

        // 入场动画
        if (typeof anime !== 'undefined') {
          // 先隐藏
          container.style.opacity = '0';
          container.style.transform = 'scale(0.97)';
          statsEl.style.opacity = '0';
          statsEl.style.transform = 'translate(-50%, 20px)';

          var tl = anime.timeline({ easing: 'easeOutExpo' });
          tl.add({ targets: loading, opacity: [1, 0], duration: 400, complete: function() { loading.style.display = 'none'; } })
            .add({ targets: container, opacity: [0, 1], scale: [0.97, 1], duration: 800, easing: 'easeOutCubic' }, '-=200')
            .add({ targets: statsEl, opacity: [0, 1], translateY: [20, 0], duration: 600, easing: 'easeOutExpo' }, '-=400');

          var countObj = { cities: 0, posts: 0 };
          anime({ targets: countObj, cities: totalCities, posts: totalPosts, round: 1, easing: 'easeOutExpo', duration: 1500, delay: 400,
            update: function() {
              var citiesEl = document.getElementById('stat-cities');
              var postsEl = document.getElementById('stat-posts');
              if (citiesEl) citiesEl.textContent = countObj.cities;
              if (postsEl) postsEl.textContent = countObj.posts;
            }
          });
        } else {
          // 无 anime.js 时的回退
          loading.style.display = 'none';
          container.style.opacity = '1';
          container.style.transform = 'scale(1)';
          document.getElementById('stat-cities').textContent = totalCities;
          document.getElementById('stat-posts').textContent = totalPosts;
        }
      }

      window.addEventListener('resize', function() { chart.resize(); });
    }).catch(function(err) {
      console.error('Map loading failed:', err);
      var errorMsg = '地图加载失败: ';
      if (err.message.indexOf('world.json') !== -1) errorMsg += '找不到 world.json';
      else if (err.message.indexOf('china.json') !== -1) errorMsg += '找不到 china.json';
      else if (err.message.indexOf('data.json') !== -1) errorMsg += '找不到 data.json，请确认是否执行了 hexo g';
      else errorMsg += err.message;
      loading.innerHTML = '<div style="text-align:center;">' + errorMsg + '<br><br><button onclick="location.reload()" style="padding:5px 15px;background:#409eff;color:#fff;border:none;border-radius:4px;cursor:pointer;">刷新重试</button></div>';
    });
  };

  if (document.readyState === 'complete') {
    initMap();
  } else {
    window.addEventListener('load', initMap);
  }
})();
</script>
