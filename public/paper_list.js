function update_paper_list(papers) {
  console.log('update_paper_list()');
  const list = $('#paper-list');
  _.map(papers, (p) => {
    const n = $('<div/>');
    n.toggleClass('paper-list-entry', true);
    const t = $('<h3/>');
    t.text(p.title);
    const t2 = $('<p/>');
    t2.text('Some abstract text');
    n.append(t);
    n.append(t2);
    list.append(n);
  })
}