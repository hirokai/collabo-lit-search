// var socket = io('http://localhost:3000');
// socket.on('add_node', function (data) {
//   console.log(data);
// });


var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id(function (d) {
    return d.id;
  }).distance(300))
  .force("charge", d3.forceManyBody().strength(-50))
  .force("center", d3.forceCenter(width / 2, height / 2));

d3.json("testdata.json", function (error, graph) {
  if (error) throw error;

  var link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(graph.links,function(d) { return d.source.id + "-" + d.target.id; })
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
    .attr("data-id", function (d) {
      return d.id;
    })
    .on('mouseenter', () => {
      const t = $(d3.event.target);
      t.addClass('hover');
      $('#paper-title').text(t.attr('data-title'));
    })
    .on('mouseleave', () => {
      $(d3.event.target).removeClass('hover');
      $('#paper-title').text('');
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  node.append("title")
    .text(function (d) {
      return d.title || d.id;
    });

  simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

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

  function restart(nodes,links) {

    // Apply the general update pattern to the nodes.
    node = node.data(nodes, function(d) { return d.id;});
    node.exit().remove();
    node = node.enter().append("circle").attr("fill", function(d) { return color(d.id); })
      .attr("data-id", (d) => {return d.id;})
      .attr("r", 50).merge(node);

    node.call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

    // Apply the general update pattern to the links.
    link = link.data(links, function(d) { return d.source.id + "-" + d.target.id; });
    link.exit().remove();
    link = link.enter().append("line").merge(link);

    // Update and restart the simulation.
    simulation.nodes(nodes);
    simulation.force("link").links(links);
    simulation.alpha(1).restart();
  }

  function mk_unique_id(){
    return ""+new Date().valueOf();
  }

  $.contextMenu({
    selector: 'circle',
    trigger: 'left',
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
        const n = {id: mk_unique_id(),title: "New paper"};
        graph.nodes.push(n);
        const from = _.find(graph.nodes, (v)=> {
          return v.id == $(self).attr('data-id');
        });
        // console.log(from,n);
        graph.links.push({source: from, target: n,value: 10});
        restart(graph.nodes,graph.links);

      }
    },
    items: {
      "add": {name: "Add paper", icon: "add"},
      "edit": {name: "Edit", icon: "edit"},
      "cut": {name: "Cut", icon: "cut"},
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
