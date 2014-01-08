'use strict';
var timelineChart = function () {

    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------

    var margin = {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
        , edata, entityIdProp = null
        , timelineData
        , eventNameProp = null
        , eventNames = null
        , eventOrder = []
        , alignChoices
        , startDateProp = null
        , unitProp
        , timeUnit
        , defaultDuration = null
        , sortParam
        , width = 960
        , height = 500
        , id = Math.floor(Math.random() * 10000) //Create semi-unique ID in case user doesn't select one
        , x = d3.scale.linear()
        , y = d3.scale.linear()
        , yOrd = d3.scale.ordinal()
        //, color = nv.utils.defaultColor()
        , color = d3.scale.category20()
        , showValues = false
        , valuePadding = 60
        , valueFormat = d3.format(',.2f')
        , delay = 1200
        , dispatch = d3.dispatch('chartClick', 'elementClick', 
                'elementDblClick', 'elementMouseover', 'elementMouseout',
                'toggleEvt','alignBy')
        , controlsData
        , alignBy
        , level = true
        , sortFunc
            ;
    var lifeflow = nv.models.lifeflow();
    var evtLFMap;
    //============================================================
    var domIds = 1;
    var lfnodes;  // move this!!!

    function chart(selection) {
        selection.each(function (timelineData) {
            var container = d3.select(this);
            x = d3.scale.linear().range([0,width])
            y = d3.scale.linear().range([0,height])
                    .domain([0,timelineData.length])
            var fmt = d3.format('15.0f');
            if (alignBy === "Lifeflow") {
                //lfnodes = edata.nodes('first', true);
                var startRecs = _.chain(timelineData)
                                    .pluck('records')
                                    .map(_.first)
                                    .value();
                x = d3.scale.linear()
                        .range(x.range())
                        .domain([0,
                            d3.max(_(timelineData).map(function(d) {
                                return d.duration()
                            })) ]);
                var xDayScale = d3.scale.linear()
                        .range(x.range())
                        .domain([0, (x.domain()[1] -x.domain()[0])]);
                var xx = function(d) {
                    return x(d.startIdx())
                }
                sortFunc = function(a,b) {
                    return a.records[a.records.length-1].lfnode(lfnodes).lfIdx - 
                           b.records[b.records.length-1].lfnode(lfnodes).lfIdx
                }
                evtLFMap = {};
                lifeflow
                    .width(width)
                    .height(height)
                    .eventNames(eventNames)
                    .startDateProp(startDateProp)
                    .entityIdProp(entityIdProp)
                    .eventNameProp(eventNameProp)
                    .color(color)

                //_.sortBy(timelineData, 'lforder');

                // next two lines duplicate general case
                y.domain([0, timelineData.length]);
                var lineHeight = (y.range()[1] - y.range()[0]) / timelineData.length;
                //lfnodes = edata.nodes('first', true);
                lifeflow
                    .xScale(x)
                    //.yScale(d3.scale.linear() .range([0, height]))
                    .yScale(y)
                lfnodes = lifeflow.makeLifeflowNodes(startRecs,
                    function(d) { return d.next() });
                _(lfnodes).each(function(lfnode) {
                    _(lfnode.records).each(function(evt, i) {
                        if (evtLFMap[evt.evtIdx() + '_' + evt.id()]) throw new Error("dup")
                        evtLFMap[evt.evtIdx() + '_' + evt.id()] = {idx:i, lfnode:lfnode};
                    })
                })
                x.domain([
                                d3.min([0].concat(lfnodes.map(function(d) { 
                                    return d.x + d.dx
                                }))),
                                d3.max([0].concat(lfnodes.map(function(d) { 
                                    return d.x + d.dx 
                                })))
                            ]);
                var maxSequenceLength = d3.max(
                        _.chain(timelineData).pluck('records')
                        .flatten().invoke('evtIdx').value());
                var timelines = container.selectAll('g.rect');
                var evts = timelines.selectAll('rect');
                var dur = 5000;
                var lfNodeOfEvt = function(evt) {
                    return evtLFMap[evt.evtIdx() + '_' + evt.id()].lfnode;
                }
                var tlSortFunc = function(a,b) {
                        var A = lfNodeOfEvt(_(a.records).last());
                        var B = lfNodeOfEvt(_(b.records).last());
                        return (A.y + A.dy) - (B.y + B.dy)
                    }
                timelines.on("mouseover", null);
                evts.on("mouseover", function (evt, i) {
                        var tl = evt.timeline();
                        d3.select(this).classed('hover', true)
                        var fmt = d3.time.format('%Y-%m-%d');
                        dispatch.elementMouseover({
                            value: tl,
                            text: tl.toString() + ' - ' + tl.duration() + ' ' + timeUnit + ' ' +
                                    lfNodeOfEvt(evt).namePath() + ' ' +
                                    lfNodeOfEvt(evt).y + ':' +
                                    lfNodeOfEvt(evt).dy,
                            series: _(tl.records).map(function(rec) {
                                return {
                                    key: rec.eventName(),
                                    value: fmt(rec.startDate()),
                                    color: color(rec.eventName())
                                }
                            }),
                            e: d3.event
                        });
                    })
                evts.attr('stroke-width',0)
                            .attr('rx', 0)
                            .attr('height', lineHeight)
                            .attr('y', 0)
                var maxDepth = _.max(lfnodes.pluck('depth'));
                var durScale = d3.scale.pow().domain([0,1]).range([0,dur])
                var durFunc = function(level) { 
                    return durScale(1/(level+1)) };
                var delayFunc = function(level) { 
                    return _.chain(_.range(1,(level+1))).map(
                        function(d) { return durScale(1/d) }).reduce(
                        function(prev, cur) { return prev + cur; },0).value() }

                _.each(_.range(0,maxDepth), function(level) {
                    var lfn = lifeflow.makeLifeflowNodes(startRecs,
                        function(d) { return d.next() }, false, level);
                    evtLFMap = {};
                    _(lfn).each(function(lfnode) {
                        _(lfnode.records).each(function(evt, i) {
                            if (evtLFMap[evt.evtIdx() + '_' + evt.id()]) throw new Error("dup")
                            evtLFMap[evt.evtIdx() + '_' + evt.id()] = {idx:i, lfnode:lfnode};
                        })
                    })
                    var sortedTLs = timelineData.sortBy(function(tl) {
                        var evt = tl.records[Math.min(level, tl.records.length-1)];
                        var lfnode = lfNodeOfEvt(evt)
                        return lfnode.y + lfnode.dy
                    })

                    var timelines = container.selectAll('g.rect')
                        .data(sortedTLs, function(d) { return d.toString() })
                    //timelines.exit().remove();
                    timelines
                        .order()
                        .transition().duration(durFunc(level)).delay(delayFunc(level))
                        .attr('transform', function(tl,i) {
                            return 'translate(' + 0 + ',' + y(i) + ')';
                        })

                    evts.transition().duration(durFunc(level)).delay(delayFunc(level))
                        .attr('x', function(evt, i, j) {
                            var newX = _.chain(
                                evt.timeline().records.slice(0,evt.evtIdx()))
                                .map(function(e) {
                                    if (_(evtLFMap).has(e.evtIdx() + '_' + e.id()))
                                        return evtLFMap[e.evtIdx() + '_' + e.id()].lfnode.dx
                                    else
                                        return e.toNext()
                                })
                            /*
                                .tap(function(d) {
                                    var newX = _.reduce(d,function(prev, cur) { return prev + cur; },0)
                                    if (evt.id()==="A5030/In Development/Fri Jun 12 1998 00:00:00 GMT-0400 (EDT)")
                            console.log(level + ' -- ' + i + ':' + j + ', new: ' + newX + ' ' + d)
                                })
                            */
                                .reduce(function(prev, cur) { return prev + cur; },0)
                                .value()
                            return xDayScale(newX);
                        })
                        .attr('width', function(evt) {
                            var w;
                            if (evt.evtIdx() <= level && _(evtLFMap).has(evt.evtIdx() + '_' + evt.id()))
                                w = xDayScale(evtLFMap[evt.evtIdx() + '_' + evt.id()].lfnode.dx)
                            else
                                w = xDayScale(evt.toNext())
                            if (isNaN(w)) w = 5;
                            return w
                        })
                })
                return;
            } else if (alignBy === "Icicle") {
                var evtNames = enlightenedData.group(timelineData
                        .pluck('records').flatten(), eventNameProp)
                    .sort(function(a,b) {
                        return eventOrder.indexOf(a.toString()) -
                            eventOrder.indexOf(b.toString())
                    })
                evtNames.each(function(evtName, i) {
                    evtName.x = i ? (evtNames[i-1].x + evtNames[i-1].width) : 0;
                    evtName.width = d3.max(evtName.records.invoke('toNext'))
                    evtName.records.sort(function(a,b) { 
                        return (b.toNext()||0) - (a.toNext()||0) })
                })
                y.domain([0, timelineData.length]);
                var lineHeight = (y.range()[1] - y.range()[0]) / timelineData.length;
                container.selectAll('g.rect')
                    .each(function(g, i) {
                        d3.select(this).selectAll('rect')
                            .attr('y', y(i))
                    })
                    .attr('transform',null)
                x = d3.scale.linear()
                        .range(x.range())
                        .domain([0, _.max(evtNames.map(function(d) {
                            return d.x + d.width }))])
                evtNames.each(function(evtName) {
                    var evts = container.selectAll('g.rect>rect')
                        .data(evtName.records, function(evt) { return evt.id() });
                    evts
                        .attr('stroke-width',0)
                        .attr('rx', 0)
                        .attr('height', lineHeight)
                        .on("mouseover", function (d, i) {
                            container.selectAll('g.rect>rect')
                                .attr('opacity', 0.5)
                                .attr('height', lineHeight)
                                .filter(function(evt) {
                                    return evt.timeline().toString() === d.timeline().toString()
                                })
                                .attr('opacity', 1)
                                .attr('height', Math.max(lineHeight, 5))
                        })
                        .on("mouseout", function (d, i) {
                            container.selectAll('g.rect>rect')
                                .attr('opacity', 1)
                                .attr('height', lineHeight)
                        })
                        .transition().duration(3000)
                        .attr('x', function(evt) {
                            return x(evtNames.lookup(evt.eventName()).x)
                        })
                        .attr('width', function(evt) {
                            return x(evt.toNext() || 5)
                        })
                        .attr('y', function(evt, i) {
                            return y(i)
                        })
                })
                return;
            } else if (alignBy) {
                var alignDayIdx = function(tl) {
                    var alignRec = tl.evtLookup(alignBy);
                    return alignRec ? alignRec.startIdx() : 0;
                }
                x = d3.scale.linear()
                        .range(x.range())
                        .domain([
                            -d3.max(_(timelineData).map(alignDayIdx)),
                            d3.max(_(timelineData).map(function(d) {
                                return d.duration() - alignDayIdx(d)
                            })) ]);
                var xDayScale = d3.scale.linear()
                        .range(x.range())
                        .domain([0, (x.domain()[1] -x.domain()[0])]);
                var xx = function(d) {
                    return x(d.startIdx() - alignDayIdx(d.timeline()))
                }
                if (alignBy === 'Start') {
                    sortFunc = function(a,b) {
                        return b.duration() - a.duration();
                    };
                    var xx = function(d) {
                        return x(d.startIdx())
                    }
                } else if (alignBy === 'End') {
                    sortFunc = function(a,b) {
                        return b.duration() - a.duration();
                    };
                    var xx = function(d) {
                        return x(d.startIdx() - d.timeline().duration()) +
                            x.range()[1]
                    }
                } else {
                    sortFunc = timelineData.evtDurationSortFunc(alignBy);
                }
            } else {
                x = d3.time.scale()
                        .range(x.range())
                        .domain([
                            d3.min(_(timelineData).invoke('startDate')), 
                            d3.max(_(timelineData).invoke('endDate')), 
                        ]);
                xDayScale = d3.scale.linear().range(x.range())
                                .domain([0, (x.domain()[1] -x.domain()[0]) / 
                                            chart.unitProp()]);
                var xx = function(d) {
                    return x(d.startDate());
                }
                /* can't do this anymore with immutable data
                _.each(timelineData, function(d) {
                    d.sortVal = d.sortVal ? ('.'+d.sortVal) : '';
                    d.sortVal = fmt(d.startDate()) + d.sortVal;
                });
                timelineData.sort(function(a,b) { 
                    return d3.ascending(a.sortVal,b.sortVal);
                });
                */
                sortFunc = function(a,b) { 
                    return d3.ascending(a.startDate(),b.startDate());
                };
            }
            y.domain([0, timelineData.length]);
            var lineHeight = (y.range()[1] - y.range()[0]) / timelineData.length;
            // lineHeight should be same as yOrd.rangeBand(), right?




            var sortedTimelines = timelineData.sort(sortFunc);
            if (sortParam === 'asc') sortedTimelines.reverse();
            yOrd.domain(sortedTimelines.rawValues());


            var tlnodes = container.selectAll('g.rect')
                .data(sortedTimelines, function (d) { return d })
                .order()
            tlnodes.exit()
                .transition()
                .duration(2000)
                .attr('transform', function (d) {
                    var ptr = d,
                        backwardsPath = [];
                    while (ptr.parent) {
                        backwardsPath.push(ptr);
                        ptr = ptr.parent;
                    }
                    var startX = 0;
                    for (var i = backwardsPath.length - 1; i >= 0; i--) {
                        var ptr = backwardsPath[i];
                        startX = ptr.x;
                        if (eventNames.lookup(ptr.valueOf()) &&
                            eventNames.lookup(ptr.valueOf()).disabled)
                            break;
                    }
                    return 'translate(' + x(startX) + ',' + y(d.y) + ')'
                })
            tlnodes.exit().select('rect')
                .transition()
                .duration(2000)
                .attr('width', 0)
            tlnodes.exit()
                .transition().delay(2000)
                .remove();
            tlnodes.enter().append('g')
                    .attr('class', 'rect')
                    .attr('path', function (d) {
                        return d.valueOf()
                    })
                    .attr('transform', function (d,i) {
                        return 'translate(0,' + y(i) + ')'
                    })
                .on("mouseout", function (d, i) {
                    d3.select(this).classed('hover', false)
                    dispatch.elementMouseout(d,i);
                })
                .on("mouseover", function (d, i) {
                    d3.select(this).classed('hover', true)
                    var fmt = d3.time.format('%Y-%m-%d');
                    dispatch.elementMouseover({
                        value: d,
                        text: d.toString() + ' - ' + d.duration() + ' ' + timeUnit,
                        series: _(d.records).map(function(rec) {
                            return {
                                key: rec.eventName(),
                                value: (rec.toNext()||0) + ' ' + timeUnit + ' ' +
                                        fmt(rec.startDate()) ,
                                color: color(rec.eventName())
                            }
                        }),
                        e: d3.event
                    });
                })
            var rects = tlnodes.selectAll('rect')
                    .data(function(d) { return d.records }
                            , function(d) { 
                                return d.id() }
                            )
            rects.exit()
                .transition()
                .duration(1000)
                .attr('width', 0)
                .remove();
            rects.enter()
                .append('rect')
                    .attr('height', lineHeight)
                    .attr('width', 0)
                    .attr('fill', function (d) {
                        return color(d[eventNameProp])
                    })
            rects
                .transition()
                .duration(2000)
                .attr('x', function (d,i) {
                    //console.log(d[entityIdProp] + ' ' + d.EVENT + ' ' + d.startIdx())
                    return xx(d) - (d.next() ? 0 : lineHeight);
                })
                .attr('width', function (d) {
                    //console.log(d.timeline() + ' ' + d.EVENT + ' ' )
                    var w = xDayScale(d.toNext()) || 0;
                    if (w < 0 || isNaN(w)) throw new Error("wrong")
                    //if (w > 10000) throw new Error("something going on?");
                    if (w === 0) {
                        d3.select(this)
                            .attr('stroke-width',1)
                            .attr('stroke','black')
                            //.attr('rx', Math.max(lineHeight/2, 3))
                            .attr('rx', lineHeight)
                            .attr('height', lineHeight * 2)
                            .attr('y', d3.select(this).attr('y') - lineHeight / 3)
                        return lineHeight * 2;
                    } else {
                        return w;
                    }
                })
            tlnodes
                .transition()
                .delay(2000)
                .duration(2000)
                    .attr('transform', function (d,i) {
                        return 'translate(0,' + y(i) + ')'
                    })
            chart.dispatch.on('toggleEvt', function (evtName) {
                evtName.disabled = !evtName.disabled;
                var recs = _(data).filter(function(d) {
                    return !eventNames.lookup(d[eventNameProp]).disabled;
                });
                timelineData = edata.makeTimelines(recs);
            });
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
        if (eventOrder.length) {
            if (_.difference(eventNames.rawValues(), eventOrder).length) {
                throw new Error("found unexpected eventNames")
            }
        } else {
            eventOrder = eventNames
                            // this sort not tested
                            .sortBy(function(d) { return d.records.length })
                            .rawValues();
        }
        alignChoices = [new String('Start'),
                        new String('End'),
                        new String('Lifeflow'),
                        new String('Icicle')
                            ]
                .concat(eventNames.map(function(d) { 
                    return new String(d.valueOf())}));
        _.each(alignChoices, function(d) { d.disabled = true });
        alignChoices[0].disabled = false;
        var evtColor = d3.scale.category20()
            .domain(eventNames.rawValues().concat(['Start','End','Lifeflow','Icicle']));
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

    chart.yScaleLinear = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };
    chart.yScaleOrdinal = function (_) {
        if (!arguments.length) return yOrd;
        yOrd = _;
        return chart;
    };

    chart.color = function (_) {
        if (!arguments.length) return color;
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

    chart.delay = function (_) {
        if (!arguments.length) return delay;
        delay = _;
        return chart;
    };

    chart.showValues = function (_) {
        if (!arguments.length) return showValues;
        showValues = _;
        return chart;
    };

    chart.valueFormat = function (_) {
        if (!arguments.length) return valueFormat;
        valueFormat = _;
        return chart;
    };

    chart.valuePadding = function (_) {
        if (!arguments.length) return valuePadding;
        valuePadding = _;
        return chart;
    };

    chart.controlsData = function (_) {
        if (!arguments.length) return controlsData;
        controlsData = _;
        return chart;
    };
    chart.alignBy = function (_) {
        if (!arguments.length) return alignBy;
        alignBy = _;
        return chart;
    };
    chart.level = function (_) {
        if (!arguments.length) return level;
        level = _;
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
    chart.timelineData = function (_) {
        if (!arguments.length) return timelineData;
        timelineData = _;
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
    chart.sort = function (_) {
        if (!arguments.length) return sortParam;
        sortParam = _;
        return chart;
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


    return chart;
}
