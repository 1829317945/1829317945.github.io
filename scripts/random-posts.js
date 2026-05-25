hexo.extend.helper.register('random_post_links', function(currentPath, count) {
  var posts = this.site.posts.toArray().filter(function(p) {
    return p.path !== currentPath;
  });

  // Fisher-Yates shuffle
  for (var i = posts.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = posts[i];
    posts[i] = posts[j];
    posts[j] = tmp;
  }

  var selected = posts.slice(0, count || 3);
  var html = '';
  selected.forEach(function(post) {
    html += '<a class="random-post-item" href="' + this.url_for(post.path) + '"><i class="fas fa-arrow-right" style="font-size:11px;margin-right:8px;color:#bbb;"></i>' + post.title + '</a>';
  }, this);
  return html;
});
