hexo.extend.generator.register('footprint_data', function(locals) {
  const posts = locals.posts.filter(post => post.city);
  const footprints = {};
  const root = hexo.config.root || '/';
  
  posts.forEach(post => {
    if (!footprints[post.city]) {
      footprints[post.city] = [];
    }
    footprints[post.city].push({
      title: post.title,
      path: root + post.path,
      date: post.date.format('YYYY-MM-DD')
    });
  });
  return {
    path: 'footprint/data.json',
    data: JSON.stringify(footprints)
  };
});
