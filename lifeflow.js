'use strict';
nv.models.lifeflow = function () {

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
        }
        , edata
        , timelineData
        , entityIdProp = null,
        eventNameProp = null,
        eventNames = null,
        eventOrder = null,
        alignChoices,
        startDateProp = null,
        endDateField = null,
        defaultDuration = null,
        alignmentLineWidth = 28,
        eventNodeWidth = 50,
        endNodeWidth = 0,
        width = 960,
        height = 500,
        id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
        , x = d3.scale.linear()
        , y = d3.scale.linear()
        , relativeX 
        , color = nv.utils.defaultColor()
        , dispatch = d3.dispatch('chartClick', 'elementClick', 
                'elementDblClick', 'elementMouseover', 'elementMouseout',
                'toggleEvt','alignBy','selectRecs','doneDrawing'),
        alignBy
            ;
    //============================================================
    function chart(selection) {
        selection.each(function (data) {
            edata = evtData()
                        .entityIdProp(chart.entityIdProp())
                        .eventNameProp(chart.eventNameProp())
                        .startDateProp(chart.startDateProp())
            if (!eventNames) setEventNames(data);
            if (!timelineData) timelineData = edata.timelines(data);
            var lifeflowNodes;
            if (chart.alignBy() === 'Start' || !chart.alignBy()) {
                var startRecs = _.chain(timelineData)
                                    .pluck('records')
                                    .map(_.first)
                                    .value();
                lifeflowNodes = makeLifeflowNodes(startRecs,
                    function(d) { return d.next() });
                //lifeflowNodes.shift();
            } else if (chart.alignBy() === 'End') {
                var startRecs = _.chain(timelineData)
                                    .pluck('records')
                                    .map(_.last)
                                    .value();
                lifeflowNodes = makeLifeflowNodes(startRecs,
                    function(d) { return d.prev() });
            } else {
                var startRecs = _.chain(timelineData.data())
                                    .filter(function(d) {
                                        return d[eventNameProp] === chart.alignBy() 
                                    })
                                    .value();
                var lifeflowNodesRight = makeLifeflowNodes(startRecs,
                    function(d) { return d.next() });
                var lifeflowNodesLeft = makeLifeflowNodes(startRecs,
                    function(d) { return d.prev() }, true);
                //lifeflowNodesLeft = [];
                lifeflowNodes = lifeflowNodesLeft.concat(lifeflowNodesRight);
            }
            x.domain([
                            d3.min([0].concat(lifeflowNodes.map(function(d) { 
                                return d.x + d.dx
                            }))),
                            d3.max([0].concat(lifeflowNodes.map(function(d) { 
                                return d.x + d.dx 
                            })))
                        ]);
            relativeX = d3.scale.linear()
                                .range(x.range())
                                .domain([0, x.domain()[1] - x.domain()[0]]);
            var availableWidth = width - margin.left - margin.right,
                availableHeight = height - margin.top - margin.bottom,
                container = d3.select(this);
            var nodes = container.selectAll('g.event-node')
                .data(lifeflowNodes
                    //_(lifeflowNodes).filter(function (d) { return d.dx !== 0 })
                    , function (d) {
                        //return _.uniqueId('nodups')
                        //console.log(d.namePath() + (d.dx > 0));
                        var id = chart.alignBy() + d.namePath({noRoot:false}) + d.backwards
                        //if (d.joinId && d.joinId !== id) throw new Error('weird!')
                        d.joinId = id;
                        return id;
                        // paths can be the same on either
                        // side of an alignment, so include dx
                    })
            //nodes.exit().selectAll('rect').attr('stroke','red');
            //y.domain([0, timelineData.length]);
            y.domain([0, _(lifeflowNodes).reduce(
                function(memo,node){
                    return Math.max(memo, node.y + node.dy)
                },0)]);

            var updateInterval = 10; // miliseconds/jump
            var xExtent = x.range()[1] - x.range()[0];
            var exitTime = nodes.exit().size() ? 1000 : 0;
            var jumps = exitTime / updateInterval;
            var jumpDistance = xExtent / jumps;
            var domainSlider = x.range()[1];
            //var endTime = x.domain[0];
            var doneSliding = false;
            var jumpNum = 0;
            var timerId = setInterval(function() {
                domainSlider -= jumpDistance;
                //console.log('slider at  ' + domainSlider);
                if (jumpNum++ >= jumps) {
                    clearInterval(timerId);
                    doneSliding = true;
                    enterNodes();
                    nodes.each(function(d) {
                        d.domNode = this;
                    })
                    nodes.filter(function(d) {
                        return d.depth === 0;
                    }).each(function(d) {
                        bloom(this, 0);
                    })
                    dispatch.doneDrawing();
                }
            }, updateInterval);
            nodes.exit()
                .each(function(d,i) {
                    var exitingNode = d3.select(this);
                    if (d.toString() === "Root") //return; // kludgy?
                        throw new Error("no longer needed, right?")
                    var match = exitingNode.attr('transform')
                        .match(/translate\(([^,]*),([^)]*)\)/)

                    if (match) {
                        var nodeX = Number(match[1]);
                        var nodeY = Number(match[2]);
                        var bar = exitingNode.select('rect.event-node');
                        bar.attr('x',0);
                        var gap = exitingNode.select('rect.gap-fill');
                        var gapWidth = 0, gapX = 0;
                        if (gap.size()) {
                            gapWidth = parseInt(gap.attr('width'));
                            var gapX = parseInt(gap.attr('x'));
                        }
                        var timerId = setInterval(function() {
                            if (nodeX + gapWidth > domainSlider) {
                                var gapDur = updateInterval * gapWidth / jumpDistance;
                                d3.transition()
                                    .duration(gapDur)
                                    .ease('linear')
                                    .each(function() {
                                        bar.transition()
                                            .attr('x', gapX)
                                        gap.transition()
                                            .attr('width', 0)
                                    })
                                exitingNode.transition().delay(gapDur).remove()
                                clearInterval(timerId);
                            }
                            if (doneSliding) {
                                throw new Error("shouldn't get here")
                                clearInterval(timerId);
                                exitingNode.remove();
                            }
                        }, updateInterval);
                    }
                })
            function enterNodes() {
                var enteringGs = nodes.enter()
                    .append('g')
                        .attr('class', 'event-node')
                        .attr('depth', function(d) { return d.depth })
                        .attr('path', function (d) {
                            return d.namePath({noRoot:false}) // don't need noRoot anymore
                        })
                        /* try creating in final position
                        .attr('transform', function (d) {
                            return 'translate(0,' + y(d.y) + ')'
                        })
                        */
                        .on("mouseover", gMouseover)
                        .on("mouseout", gMouseout)
                var newRects = enteringGs
                    //.filter(function(d) { return d.depth !== 0 })
                    .append('rect')
                        .attr('class', 'event-node')
                        .attr('fill', function (d) {
                            return color(d.valueOf())
                        })
                        .attr('width', 0)
                    .on("mouseover", rectMouseover)
                    .on("mouseout", rectMouseout)
                        // transform to actual width!!!
                        // .attr('width', relativeX(eventNodeWidth))
                        /*
                        .attr('height', function (d) {
                            return y(d.dy)
                        })
                        */
                var fillRects = enteringGs
                    .filter(function(d) { return d.parent })
                    .append('rect')
                        .attr('class', 'gap-fill')
                        .attr('fill', function (d) {
                            return color(d.parent.valueOf())
                        })
                        .attr('stroke', '#888')
                        .attr('stroke-width', '1px')
                        .attr('opacity', .5)
                        .attr('width', 0)
                        .attr('height', function (d) {
                            //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
                            return y(d.dy)
                        })
                    .on("mouseover", rectMouseover)
                    .on("mouseout", rectMouseout)
                var fmt = d3.format('5.0f');
                nodes.attr('transform', function (d) {
                            var xpos = x(d.x)
                            return 'translate(' + xpos + ',' + y(d.y) + ')'
                        })
                nodes.select('rect.event-node')
                    //.transition().duration(exitTime)
                    .attr('height', function (d) {
                        //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
                        return y(d.dy)
                    })
                nodes.select('rect.gap-fill')
                    //.transition().duration(exitTime)
                    .attr('height', function (d) {
                        //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
                        return y(d.dy)
                    })
                /*  moved up to creation
                container.selectAll('g.event-node')
                        .attr('transform', function (d) {
                            var xpos = x(d.x)
                            return 'translate(' + xpos + ',' + y(d.y) + ')'
                            return 'translate(0,' + y(d.y) + ')'
                        })
                        */
return;
                var gapDays = 0;
                nodes.select('rect.gap-fill')
                    //.transition().delay(2000).duration(2000)
                    .attr('width', function (d) {
                        return Math.max(relativeX(Math.abs(d.parent.dx) 
                                - eventNodeWidth - gapDays * 2), 0);
                    })
                    .attr('x', function (d) {
                        if (d.parent.backwards) {
                            return relativeX(gapDays);
                        } else {
                            return relativeX(-d.parent.dx +  gapDays);
                        }
                    })
            }
            var gapDays = 0;
            var bloomTime = 3000;
            var distance = relativeX.range()[1];
            function bloom(bloomingNode, delay) {
                var sel = d3.select(bloomingNode).select('rect.gap-fill');
                var datum = bloomingNode.__data__;
                //console.log(datum.backwards);
                var dur = 0;
                if (sel.size()) {
                    var width = Math.max(relativeX(
                                Math.abs(datum.parent.dx) 
                                - eventNodeWidth - gapDays * 2), 0);
                    dur = width * bloomTime / distance;
                    if (datum.backwards) {
                        sel.attr('transform', 'scale(-1,1)')
                        //sel.attr('x',0)
                        sel.attr('x', relativeX(datum.parent.dx + 
                                    0*eventNodeWidth - gapDays));
                        //sel.attr('x', relativeX(gapDays+ eventNodeWidth))
                        sel.transition().delay(delay).duration(dur)
                            .ease('linear')
                        .attr('width', width)
                        //.attr('x', relativeX(gapDays+ eventNodeWidth))
                    } else {
                        sel.attr('x', relativeX(-datum.parent.dx + eventNodeWidth + gapDays));
                        //sel.attr('transform', 'scale(-1,-1)')
                        //sel.attr('x', relativeX(gapDays+ eventNodeWidth))
                        sel.transition().delay(delay).duration(dur)
                            .ease('linear')
                        .attr('width', width)
                    }
                }
                d3.select(bloomingNode).select('rect.event-node')
                    .transition().delay(delay + dur)
                    .attr('width', relativeX(eventNodeWidth))
                _.each(datum.children, function(d) {
                    bloom(d.domNode, delay + dur);
                })
            }
            /*
            container.selectAll('rect.event-node')
                .attr('height', function (d) {
                    //if (d.namePath({noRoot:true})==="Pending/Open") 
                    console.log(d.dy + '->' + y(d.dy) + '   ' + this.className.baseVal + '   ' + d.namePath())
                    return y(d.dy)
                })
            */
            chart.dispatch.on('toggleEvt', function (evtName) {
                evtName.disabled = !evtName.disabled;
                var recs = _(data).filter(function(d) {
                    return !eventNames.lookup(d[eventNameProp]).disabled;
                });
                timelineData = edata.makeTimelines(recs);
            });
            chart.dispatch.on('selectRecs', function (recs) {
                timelineData = edata.makeTimelines(recs);
            });

            function rectMouseover(d, i) {
                d3.select(this)
                    .classed('hover', true)
                var path = d.namePath({noRoot:false})
                //var avgDays = d3.mean(_(d.records).invoke('fromPrev'));
                var avg = Math.round(d3.mean(_.chain(d.records).invoke('timeline').invoke('duration').value()));
                var tt = d.toString() + ', ' + d.records.length + ' timelines with ';
                tt += avg + ' mean duration';
                dispatch.elementMouseover({
                    value: d,
                    text: tt,
                    series: _(d.pedigree({asValues:true}))
                        .map(function(lfnode) {
                            return {
                                key: lfnode.toString(),
                                value: Math.round(d3.mean(_(lfnode.records).invoke('toNext'))),
                                color: color(lfnode.toString())
                            }
                        }),
                    e: d3.event
                });
            }
            function rectMouseout(d, i) {
                dispatch.elementMouseout();
            }
            function TOOLTIP_HOLD_gMouseover(d, i) {
                d3.select(this)
                    .classed('hover', true)
                var path = d.namePath({noRoot:false})
                var avgDays = d3.mean(_(d.records).invoke('fromPrev'));

                var tt = path + ', ' + d.records.length + ' timelines';
                tt += ', mean days: ' + avgDays;
                dispatch.elementMouseover({
                    value: d,
                    text: tt,
                    idx: i,
                    e: d3.event
                });
            }
            function gMouseout(d, i) {
                d3.select(this).selectAll('rect.gap-fill').attr('opacity',.5)
                var path = d3.select(this).selectAll('path');
                //path.remove();
                path.transition().duration(4000).style('opacity', 0).remove()
                var circle = d3.select(this).selectAll('circle');
                //circle.remove();
                circle.transition().duration(4000).style('opacity', 0).remove()
                    /*
                d3.selectAll('rect.gap-fill')
                    .transition().delay(3000).duration(700)
                    .attr('opacity', 0.5);
                d3.selectAll('rect.event-node')
                    .transition().delay(3000).duration(700)
                    .attr('opacity', 0.5);
                    */
            }
            var nodesWithDistributionsShowing = [];
            function gMouseover(lfnode, i) {
                /*
                d3.selectAll('rect')
                    .transition().duration(700)
                    .attr('opacity', 0.4);
                    */
                console.log('mouse over ' + nodesWithDistributionsShowing.length);
                console.log(nodesWithDistributionsShowing);
                var alreadyDisplayed = false;
                _(nodesWithDistributionsShowing).each(function(d) {
                    if (d === lfnode) {
                        alreadyDisplayed = true;
                        return;
                    }
                    d.distCircles.remove();
                    d.distPath.remove();
                    delete d.distCircles;
                    delete d.distPath;
                });
                nodesWithDistributionsShowing.length = 0;
                if (alreadyDisplayed) {
                    nodesWithDistributionsShowing.push(lfnode);
                }
                d3.select(this).selectAll('rect.gap-fill').attr('opacity',1)
                var recs, xFunc, durationFunc;
                if (!lfnode.parent) {
                    recs = [];
                } else if (lfnode.backwards) {
                    recs = lfnode.records.sort(function (a, b) {
                        return a.toNext() - b.toNext();
                    });
                    //xFunc = function(d) { return relativeX(-d.toNext()) };
                    xFunc = function(d) {
                            return relativeX(-lfnode.parent.dx -
                                    d.toNext())
                    };
                    durationFunc = 'toNext';
                } else {
                    recs = lfnode.records.sort(function (a, b) {
                        return a.fromPrev() - b.fromPrev();
                    });
                    xFunc = function(d) {
                            return relativeX(-lfnode.parent.dx +
                                    d.fromPrev() + eventNodeWidth)
                    };
                    durationFunc = 'fromPrev';
                }
                var line = d3.svg.line()
                    .x(xFunc)
                    .y(function (d, i) {
                        return y(i)
                    });
                var path = d3.select(this).selectAll('path')
                    .data([recs])
                path.enter()
                    .append('path')
                    .attr('d', line)
                path.attr('fill-opacity', 0)
                    .attr('stroke', 'black')
                    .style('pointer-events', 'none')
                    .style('stroke-opacity', 1)
                var circle = d3.select(this).selectAll('circle')
                    .data(recs)
                circle.enter()
                    .append('circle')
                    .attr('cx', xFunc)
                    .attr('cy', function (d, i) {
                        return y(i)
                    })
                    .attr('r', 4)
                    .on("mouseover", function (d, i) {
                        d3.select(this).classed('hover', true)
                        var fmt = d3.time.format('%Y-%m-%d');
                        dispatch.elementMouseover({
                            value: d,
                            text: d.timeline() + ': ' + d.eventName() + 
                                ' - ' + d.toNext() + ' of ' +
                                d.timeline().duration() + ' total days',
                            series: _(d.timeline().records).map(function(rec) {
                                return {
                                    key: rec.eventName(),
                                    value: fmt(rec.startDate()),
                                    color: color(rec.eventName())
                                }
                            }),
                            e: d3.event
                        });
                    })
                circle.style('fill-opacity', 0)
                //.style('stroke-opacity',1)
                //.style('pointer-events','none')
                .attr('stroke', 'black')
                    .attr('stroke-opacity', 0.2)
                //.attr('stroke', function() { return color(d.valueOf()) })
                if (alreadyDisplayed) {
                    if (!_(lfnode).has('distCircles'))
                        throw new Error('what up');
                } else {
                    lfnode.distCircles = circle;
                    lfnode.distPath = path;
                    nodesWithDistributionsShowing.push(lfnode);
                }
            }

            return;
            rects
                .on('mouseout', function (d, i) {
                    d3.select(this).classed('hover', false);
                    dispatch.elementMouseout({
                        value: getY(d, i),
                        point: d,
                        series: data[d.series],
                        pointIndex: i,
                        seriesIndex: d.series,
                        e: d3.event
                    });
                })
                .on('click', function (d, i) {
                    dispatch.elementClick({
                        value: getY(d, i),
                        point: d,
                        series: data[d.series],
                        pos: [
                            x(getX(d, i)),
                            y(getY(d, i)) + (y.rangeBand() * d.series + .5 / data.length)
                        ], // TODO: Figure out why the value appears to be shifted
                        pointIndex: i,
                        seriesIndex: d.series,
                        e: d3.event
                    });
                    d3.event.stopPropagation();
                })
                .on('dblclick', function (d, i) {
                    dispatch.elementDblClick({
                        value: getY(d, i),
                        point: d,
                        series: data[d.series],
                        pos: [
                            x(getX(d, i)),
                            y(getY(d, i)) + (y.rangeBand() * d.series + .5 / data.length)
                        ],
                        pointIndex: i,
                        seriesIndex: d.series,
                        e: d3.event
                    });
                    d3.event.stopPropagation();
                });


        });
        return chart;
    }
    function setEventNames(data) {
        eventNames = enlightenedData.group(data, eventNameProp)
                .sort(function(a,b) {
                    return eventOrder.indexOf(a.toString()) -
                           eventOrder.indexOf(b.toString())
                });
        if (eventOrder) {
            if (_.difference(eventNames.rawValues(), eventOrder).length) {
                throw new Error("found unexpected eventNames")
            }
        } else {
            eventOrder = eventNames.rawValues();
        }
        alignChoices = [new String('Start'),
                        new String('End') ]
                .concat(eventNames.map(function(d) { 
                    return new String(d.valueOf())}));
        _.each(alignChoices, function(d) { d.disabled = true });
        alignChoices[0].disabled = false;
        //chart.eventNames(eventNames); // not necessary
        var evtColor = d3.scale.category20()
            .domain(eventNames.rawValues().concat(['Start','End']));
            //.domain(eventNames.rawValues().concat(['Start','End']));
        chart.color(evtColor);
    }

    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    chart.dispatch = dispatch;

    chart.entityIdProp = function (_) {
        if (!arguments.length) return entityIdProp;
        entityIdProp = _;
        return chart;
    };
    chart.eventNameProp = function (_) {
        if (!arguments.length) return eventNameProp;
        eventNameProp = _;
        return chart;
    };
    chart.eventOrder = function (_) {
        if (!arguments.length) return eventOrder;
        eventOrder = _;
        return chart;
    };
    chart.startDateProp = function (_) {
        if (!arguments.length) return startDateProp;
        startDateProp = _;
        return chart;
    };
    chart.endDateField = function (_) {
        if (!arguments.length) return endDateField;
        endDateField = _;
        return chart;
    };
    chart.defaultDuration = function (_) {
        if (!arguments.length) return defaultDuration;
        defaultDuration = _;
        return chart;
    };
    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
        return chart;
    };

    chart.eventNames = function (_) {
        if (!arguments.length) return eventNames;
        eventNames = _;
        return chart;
    };
    chart.timelineData = function (_) {
        if (!arguments.length) return timelineData;
        timelineData = _;
        return chart;
    };
    chart.width = function (_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    };

    chart.height = function (_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    };

    chart.xScale = function (_) {
        if (!arguments.length) return x;
        x = _;
        return chart;
    };
    chart.relativeX = function (_) {
        if (!arguments.length) return relativeX;
        relativeX = _;
        return chart;
    };

    chart.yScale = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
        color = nv.utils.getColor(_);
        return chart;
    };

    chart.disabled = function (_) {
        if (!arguments.length) return disabled;
        disabled = _;
        return chart;
    };

    chart.id = function (_) {
        if (!arguments.length) return id;
        id = _;
        return chart;
    };

    chart.alignBy = function (_) {
        if (!arguments.length) return alignBy;
        alignBy = _;
        return chart;
    };
    chart.xAxis = function (_) {
        if (!arguments.length) return xAxis;
        xAxis = _;
        return chart;
    };
    chart.evtData = function (_) {
        if (!arguments.length) return edata;
        edata = _;
        return chart;
    };
    chart.alignChoices = function (_) {
        if (!arguments.length) return alignChoices;
        alignChoices = _;
        return chart;
    };
    chart.alignmentLineWidth = function(_) {
        if (!arguments.length) return alignmentLineWidth;
        alignmentLineWidth = _;
        return lifeflow;
    };
    chart.eventNodeWidth = function(_) {
        if (!arguments.length) return eventNodeWidth;
        eventNodeWidth = _;
        return lifeflow;
    };
    chart.endNodeWidth = function(_) {
        if (!arguments.length) return endNodeWidth;
        endNodeWidth = _;
        return lifeflow;
    };

    function makeGetterSetter(obj, prop) { // might be nice
        // but lose the link to enclosed public vars
        var closureVals = {};
        obj[prop] = function (_) {
            if (!arguments.length) console.log('getting ' + prop + ': ' + closureVals[prop]);
            if (!arguments.length) return closureVals[prop];
            console.log('setting ' + prop + ': ' + _);
            closureVals[prop] = _;
            return obj;
        };
    }
    //============================================================

    // not sure where this belongs. allowed it to use closure vars from
    // chart right now
    function endNode(parent) {
        var enode = {
            parent:parent,
            next: function() { 
                return this },
            prev: function() { return this }
        };
        enode[eventNameProp] = 'END_NODE';
        return enode;
    }
    var makeLifeflowNodes = function(startRecs, nextFunc, backwards, maxDepth) {
        var groupKeyName = (backwards ? 'prev' : 'next') + '_' + eventNameProp;
        function preGroupRecsHook(records) { // group next records, not the ones we start with
            return _.chain(records)
                            //.tap(function(d) { console.log(d) })
                            .filter(nextFunc)
                            .map(nextFunc)
                            .value();
        }
        function addChildren(list, notRoot) {
            if (maxDepth && list.length && list[0].depth && list[0].depth >= maxDepth)
                return;
            if (!notRoot) {
                list = enlightenedData.group(startRecs, eventNameProp);
                list.sort(function(a,b) {
                            return b.records.length - a.records.length
                        })
            }
            _.each(list, function(d) { 
                //d.depth = d.parent ? d.parent.depth + 1 : 0;
                d.extendGroupBy(eventNameProp, {
                    preGroupRecsHook:preGroupRecsHook,
                    childProp:'children'})
                addChildren(d.children, true);
                d.children.sort(function(a,b) {
                            return b.records.length - a.records.length
                        })
                })
            return list;
        }
        var lfnodes = addChildren(startRecs);
        lfnodes = position({children:lfnodes,records:[]}).children;
        return lfnodes.flattenTree();


        function rectWidth(recs) {
            return d3.mean(recs.map(function(d) { 
                return d.timeTo(nextFunc(d))
            }));
        }
        function position(lfnode, yOffset) {
            var children = lfnode.children;
            if (lfnode.parent) {
                lfnode.x = lfnode.parent.x + lfnode.parent.dx 
                    //+ eventNodeWidth * (!negative || -1);;
                lfnode.y = lfnode.parent.y;
            } else {
                lfnode.x = alignmentLineWidth * (!backwards || -1);
                lfnode.y = 0;
            }
            lfnode.y += (yOffset || 0);
            lfnode.dx = rectWidth(lfnode.records) + eventNodeWidth;
            lfnode.dy = lfnode.records.length;
            if (children && (n = children.length)) {
                var i = -1, c, yOffset = 0, n;
                while (++i < n) {
                    position(c = children[i], yOffset)
                    yOffset += c.dy;
                }
            }
            lfnode.backwards = !!backwards;
            return lfnode;
        }
        var nodes = enlightenedData.group(startRecs, eventNameProp, {
                        preGroupRecsHook: preGroupRecsHook,
                        postGroupGroupsHook: postGroupGroupsHook,
                        dimName: groupKeyName,
                        //postGroupValHook: postGroupValHook,
                        recurse: childrenFunc,
                        childProp: 'children'
                    });
        nodes = position({children:nodes,records:[]}).children;
        return nodes.flattenTree();
    }
    chart.makeLifeflowNodes = makeLifeflowNodes;
    return chart;
}
