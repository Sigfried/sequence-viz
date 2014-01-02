/**
 * @file Defines the lifeflow chart for {@link sequence-viz}
 * @author Sigfried Gold <sigfried@sigfried.org>
 * @license http://sigfried.mit-license.org/
 * Don't trust this documentation yet. It's just beginning to be
 * written.
 */
'use strict';
var lifeflowChart = function () {
    /** @namespace lifeflowChart */

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
        eventOrder = [],
        unitProp,
        timeUnit,
        alignChoices,
        startDateProp = null,
        endDateField = null,
        defaultDuration = null,
        alignmentLineWidth = 28,
        eventNodeWidth = 0,
        endNodeWidth = 0,
        width = 960,
        height = 500,
        id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
        , x = d3.scale.linear()
        , y = d3.scale.linear()
        , relativeX 
        //, color = nv.utils.defaultColor()
        , color = d3.scale.category20()
        , alignBy
        , dispatch = d3.dispatch('eventNodeMouseover');
        /*
        , dispatch = d3.dispatch('chartClick', 'elementClick', 
                'elementDblClick', 'elementMouseover', 'elementMouseout',
                'toggleEvt','alignBy','selectRecs','doneDrawing'),
        */
            ;
    //============================================================
    function chart(selection) {
        selection.each(function (lifeflowNodes) {
            x = d3.scale.linear().range([0,width])
            y = d3.scale.linear()
                .range([0,height])
                .domain([0,lifeflowNodes
                    .where({depth:0})
                    .pluck('dy')
                    .reduce(function(p,c) { return p + c }) - 1])
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
            var container = d3.select(this);
            var nodes = container.selectAll('g.event-node')
                .data(lifeflowNodes
                    , function (d) {
                        var id = chart.alignBy() + d.namePath({noRoot:false}) + d.backwards
                        d.joinId = id;
                        return id;
                        // paths can be the same on either
                        // side of an alignment, so include backwards flag
                    })
            y.domain([0, _(lifeflowNodes).reduce(
                function(memo,node){
                    return Math.max(memo, node.y + node.dy)
                },0)]);

            enterNodes();
            return
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
                        .attr('transform', function (d) {
                            return 'translate(' + x(d.x) + ',' + y(d.y) + ')'
                        })
                        .on("mouseover", function(d,i) {
                            dispatch.eventNodeMouseover(chart, this, d, i);
                        })
                        //.on("mouseover", gMouseover)
                        //.on("mouseout", gMouseout)
                var newRects = enteringGs
                    //.filter(function(d) { return d.depth !== 0 })
                    .append('rect')
                        .attr('class', 'event-node')
                        .attr('fill', function (d) {
                            return color(d.valueOf())
                        })
                        .attr('x', function(d) { return relativeX(d.dx)})
                        .attr('width', relativeX(eventNodeWidth))
                        .attr('height', function (d) {
                            //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
                            return y(d.dy)
                        })
                        //.attr('y', function(d) { return y(d.y) })
                        .attr('height', function(d) { return y(d.dy) })
                    //.on("mouseover", rectMouseover)
                    //.on("mouseout", rectMouseout)
                return;
                /*
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
                */
                var fmt = d3.format('5.0f');
                nodes.attr('transform', function (d) {
                            var xpos = x(d.x)
                            return 'translate(' + xpos + ',' + y(d.y) + ')'
                        })
                nodes.select('rect.event-node')
                    .attr('height', function (d) {
                        //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
                        return y(d.dy)
                    })
                nodes.select('rect.gap-fill')
                    .attr('height', function (d) {
                        //console.log(d.dy + '   ' + this.className.baseVal + '   ' + d.namePath())
                        return y(d.dy)
                    })
                    .attr('x', function(d) { 
                        var shift = d.backwards ?  d.parent.dx :
                                -d.parent.dx + eventNodeWidth;
                        return relativeX(shift)
                    })
                    .attr('width', function(d) { 
                        return Math.max(relativeX( Math.abs(d.parent.dx) 
                                - eventNodeWidth), 0);
                    })
                    //.attr('y', function(d) { return y(d.y) })
                    .attr('height', function(d) { return y(d.dy) })
            }
        });
        return chart;
    }

    //============================================================
    // mouseover code. tooltips broken for now
    // distribution lines still working
    //------------------------------------------------------------

            function rectMouseover(d, i) {
                console.log("not connected right now")
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
                throw new Error("shouldn't be working now");
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
                var recs, xFunc;
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
                } else {
                    recs = lfnode.records.sort(function (a, b) {
                        return a.fromPrev() - b.fromPrev();
                    });
                    xFunc = function(d) {
                        return relativeX(d.fromPrev())
                    };
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
                                d.timeline().duration() + ' total ' + timeUnit,
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
        //color = nv.utils.getColor(_);
        color = _;
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
        return chart;
    };
    chart.eventNodeWidth = function(_) {
        if (!arguments.length) return eventNodeWidth;
        eventNodeWidth = _;
        return chart;
    };
    chart.endNodeWidth = function(_) {
        if (!arguments.length) return endNodeWidth;
        endNodeWidth = _;
        return chart;
    };
    chart.unitProp = function(_) {
        if (!arguments.length) return unitProp;
        unitProp = _;
        timeUnit = 'units';
        if (unitProp === 1) timeUnit = 'miliseconds';
        if (unitProp === 1000) timeUnit = 'seconds';
        if (unitProp === 1000*60) timeUnit = 'minutes';
        if (unitProp === 1000*60*60) timeUnit = 'hours';
        if (unitProp === 1000*60*60*24) timeUnit = 'days';
        if (unitProp === 1000*60*60*24*7) timeUnit = 'weeks';
        if (unitProp === 1000*60*60*24*365.25) timeUnit = 'years';
        if (unitProp === 1000*60*60*24*365.25/12) timeUnit = 'months';
        return chart;
    };
    return chart;
}
