// var socket = io('http://localhost:3000');
// socket.on('add_node', function (data) {
//   console.log(data);
// });


var globalState = {
  state: 'normal',
  selections: [],
  scale: 1
};

var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) {
    return d.id;
  }).strength((d)=> {
    return d.typ == 'relationship' ? 0.1 : 0.03;
  }))
  .force("charge", d3.forceManyBody().strength((d)=> {
    return d.typ == 'relationship' ? 10 : -400;
  }))
  .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("testdata.json", function (error, graph) {
  if (error) throw error;

  svg.on('click', (d)=> {
    console.log(d3.event.target);
    globalState.selections = [];
  });

  const papers = [
    {title: "Hoge"},
    {title: "Fuga"}
  ];

  update_paper_list(papers);

  function get_transform() {
    return 'translate(300,300) scale(' + globalState.scale + ')';
  }

  d3.select('body').on('keydown', ()=> {
    console.log(d3.event.keyCode);
    if (d3.event.keyCode == 189) {
      globalState.scale -= 0.1;
      const tr = get_transform();
      d3.selectAll('g.nodes').attr('transform', tr);
      d3.selectAll('g.links').attr('transform', tr);
    } else if (d3.event.keyCode == 187) {
      globalState.scale += 0.1;
      const tr = get_transform();
      d3.selectAll('g.nodes').attr('transform', tr);
      d3.selectAll('g.links').attr('transform', tr);
    }
  });


  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links, function (d) {
      return d.source.id + "-" + d.target.id;
    })
    .enter().append("line")
    .attr("stroke-width", function (d) {
      return Math.sqrt(d.value);
    });

  var node = svg.append("g")
    .attr("class", "nodes")
    .selectAll("circle")
    .data(graph.nodes)
    .enter().append("circle")
    .attr("r", 50)
    .attr("fill", function (d) {
      return color(d.group);
    })
    .attr("data-title", function (d) {
      return d.title;
    })
    .style('stroke', (d) => {
      console.log(d.id);
      return _.findIndex(globalState.selections, (s)=> {
        console.log('s.id=', s.id);
        return s.id == d.id
      }) != -1 ? 'red' : 'white';
    })
    .attr("data-id", function (d) {
      return d.id;
    });

  d3.selectAll('g.nodes').attr('transform', get_transform());
  d3.selectAll('g.links').attr('transform', get_transform());


  node.append("title")
    .text(function (d) {
      return d.title || d.id;
    });

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

  restart(graph.nodes, graph.links);

  simulation.force("link")
    .links(graph.links);

  function ticked() {
    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });

    node
      .attr("cx", function (d) {
        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  }

  console.log(graph.links);

  function restart(nodes, links) {

    // Apply the general update pattern to the nodes.
    node = node.data(nodes, function (d) {
      return d.id;
    });
    node.exit().remove();
    node = node.enter().append("circle").attr("fill", function (d) {
      return color(d.id);
    })
      .attr("data-title", function (d) {
        return d.title;
      })
      .style('stroke', (d) => {
        console.log('d.id=', d.id);
        // return 'red';
        return _.findIndex(globalState.selections, (s)=> {
          console.log('s.id=', s.id);
          return s.id == d.id
        }) != -1 ? 'red' : 'white';
      })
      .attr("data-id", (d) => {
        return d.id;
      })
      .attr("r", (d)=> {
        return d.typ == 'relationship' ? 10 : 50
      }).merge(node);

    node.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    node.on('mouseenter', () => {
      const t = $(d3.event.target);
      t.addClass('hover');
      $('#paper-title').text(t.attr('data-title'));
    }).on('mouseleave', () => {
      $(d3.event.target).removeClass('hover');
      $('#paper-title').text('');
    })


    node.on('click', (d)=> {
      globalState.selections.push(d);
      globalState.selections = _.uniqBy(globalState.selections, 'id');
      console.log('' + globalState.selections.length + ' selections.');
      d3.event.stopPropagation();
    });

    // Apply the general update pattern to the links.
    link = link.data(links, function (d) {
      return d.source.id + "-" + d.target.id;
    });
    link.exit().remove();
    link = link.enter().append("line").merge(link);

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
  }

  function mk_unique_id() {
    return "" + new Date().valueOf();
  }

  $.contextMenu({
    selector: 'circle',
    trigger: 'right',
    callback: function (key, options) {
      const self = this;
      if (key == 'delete') {
        _.remove(graph.nodes, (v)=> {
          console.log(v.id, $(self).attr('data-id'));
          return v.id == $(self).attr('data-id');
        });
        _.remove(graph.links, (v)=> {
          const id = $(self).attr('data-id');
          return v.source.id == id || v.target.id == id;
        });
        node.data(graph.nodes).exit().remove();
        link.data(graph.links).exit().remove();
      } else if (key == 'add') {
        console.log(graph.links);
        const n = {id: mk_unique_id(), title: "New paper"};
        graph.nodes.push(n);
        const from = _.find(graph.nodes, (v)=> {
          return v.id == $(self).attr('data-id');
        });
        // console.log(from,n);
        graph.links.push({source: from, target: n, value: 10});
        restart(graph.nodes, graph.links);
      } else if (key == 'connect') {
        const desc = window.prompt('グルーピングの理由を入力');
        if (desc) {
          const n = {id: mk_unique_id(), title: desc, typ: "relationship"};
          graph.nodes.push(n);
          _.map(globalState.selections, (s) => {
            graph.links.push({source: s.id, target: n.id, value: 10});
          });
          globalState.selections = [];
          restart(graph.nodes, graph.links);
        }
      }
    },
    items: {
      "add": {name: "Add paper", icon: "add"},
      "edit": {name: "Edit", icon: "edit"},
      "connect": {name: "Connect", icon: "fa-arrow-right"},
      copy: {name: "Copy", icon: "copy"},
      "paste": {name: "Paste", icon: "paste"},
      "delete": {name: "Delete", icon: "delete"},
      "sep1": "---------",
      "quit": {
        name: "Quit", icon: function () {
          return 'context-menu-icon context-menu-icon-quit';
        }
      }
    }
  });

  $('.context-menu-one').on('click', function (e) {
    console.log('clicked', this);
  })


});

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
