var nv = require('nvd3');

nv.models.lifeflowChart = function () {
    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    var lifeflow = nv.models.lifeflow(),
        xAxis = nv.models.axis(),
        yAxis = nv.models.axis(),
        tip = nv.models.tooltip().gravity('w').distance(23),
        legendHeight = 15,
        hideLegend = nv.models.legend()
            .height(legendHeight)
            .updateState(false)
            .key(function(d) { return d.valueOf() })
            .label('Hide'),
        alignLegend = nv.models.legend().height(legendHeight)
            .updateState(false)
            .radioButtonMode(true)
            .label('Align')
            .key(function(d) { return d.valueOf() })
            ;

    var margin = {
            top: 25,
            right: 20,
            bottom: 0,
            left: 60
        }
        , width = null
        , height = null
        , edata
        , timelines
        , entities
        , showLegend = true
        , stacked = false
        , tooltips = true
        , tooltip = function(key, x, y, e, graph) {
            return '<h3>' + key + ' - ' + x + '</h3>' +
                '<p>' +  y + '</p>'
        }
        , state = {
            stacked: stacked
        }
        , defaultState = null
        , noData = 'No Data Available.'
        , dispatch = d3.dispatch( 'tooltipShow', 'tooltipHide', 
                //'elementMouseover','elementMouseout',
                'stateChange', 'changeState'
                //,'doneDrawing'
                );
    ;
    //============================================================


    //============================================================
    // Private Variables
    //------------------------------------------------------------

    var showTooltip = function(e, offsetElement) {
        tip
            .gravity('e')
            .position({ left: e.e.clientX, top: e.e.clientY })
            .data(
                {
                    value: e.text,
                    series: e.series,
                })();
    };
    var svgHead, svgChart, svgFoot;
    //============================================================
    var rangeLower = new Date('01/01/1980');
    var rangeUpper = new Date('01/01/2030');
    var enddateStuff = _.once(function (data) {
        data.forEach(function (d) {
            d.endDate = new Date(d[chart.endDateField()]);
            if (!(d.endDate > rangeLower && d.endDate < rangeUpper)) {
                d.endDate = null;
            }
        });
    })

    function chart(selection) {
        selection.each(function (data) {
            var container = d3.select(this),
                that = this;

            var chartFullWidth = (chart.width() || parseInt(container.style('width')) || 960),
                chartGraphWidth = chartFullWidth - margin.left - margin.right;
                chartFullHeight = (chart.height() || parseInt(container.style('height')) || 400),
                chartGraphHeight = chartFullHeight - margin.top - margin.bottom;
            chart.width(chartFullWidth);
            chart.height(chartFullHeight);

            if (!data || !data.length) {
                var noDataText = container.selectAll('.nv-noData').data([noData]);
                noDataText.enter().append('p')
                    .attr('class', 'nvd3 nv-noData')
                    .style('text-align', 'center')
                    .style('top', '200px')
                    .text(function (d) {
                        return d
                    });
                return chart;
            } else {
                container.selectAll('.nv-noData').remove();
            }
            lifeflow.xScale(d3.scale.linear().range([0, chartGraphWidth]));
            lifeflow.yScale(d3.scale.linear()
                        .range([0, chartGraphHeight]));

            // Setup containers and skeleton of chart
            container.selectAll('svg.svg-head')
                .data(['stub']).enter()
                .append('svg').attr('class', 'svg-head')
                    //.attr('width', availableWidth)
                .attr('height', legendHeight * 3)
            var svgHead = container.select('svg.svg-head');

            var svgChart = container.selectAll('svg.svg-chart').data(['stub'])
            var gEnter = svgChart.enter()
                            .append('div')
                                //.style('width', availableWidth)
                                .style('height', chartFullHeight)
                                .style('overflow-y', 'scroll')
                            .append('svg').attr('class', 'svg-chart')
                                //.attr('width', availableWidth)
                                .attr('height', chartFullHeight)

            gEnter.append('g').attr('class', 'nv-x nv-axis')
            gEnter
                .append('g').attr('class', 'nvd3 nv-wrap nv-evt-chart')

            svgChart.select('g.nv-evt-chart')
                    .attr('transform', 'translate(' + margin.left + ',' +
                                margin.top + ')')
                    .append('g').attr('class', 'nv-y nv-axis');

            chart.update = function () {
                container.call(chart)
            };
            chart.svgChart = this;
            //------------------------------------------------------------
            // Legend
            var gHead = svgHead.selectAll('g').data(['stub']).enter().append('g')
                .each(function (d) {
                    var head = d3.select(this);
                    head.append('g')
                        .attr('class', 'nv-legendWrap evt-chart hide-legend')
                    head.append('g')
                        .attr('class', 'nv-legendWrap evt-chart align-legend')
                        .attr('transform', 'translate(0,' + legendHeight + ')')
                });
            gHead.selectAll('g.nv-series')
                .attr('evt-name', function (d) {
                    return d.valueOf()
                })


            hideLegend.dispatch.on('legendClick', function (e, i) {
                lifeflow.dispatch.toggleEvt(e,i);
                chart.update();
            });

            /*
            hideLegend.dispatch.on('legendDblclick', function (d) {
                //Double clicking should always enable current series, and disable all others.
                data.forEach(function (d) { // broken
                    d.disabled = true;
                });
                d.disabled = false;

                //state.disabled = data.map(function(d) { return !!d.disabled });
                dispatch.stateChange(state);
                chart.update();
            });
            */
            alignLegend.dispatch.on('legendClick', function (d, i) {
                if (!!d.disabled) {
                    lifeflow.alignChoices().forEach(function (d) {
                        d.disabled = true;
                    });
                    chart.alignBy(d.valueOf());
                    d.disabled = false;
                } else {
                    d.disabled = true;
                    // default is align by start
                    lifeflow.alignChoices()[0].disabled = false;
                    chart.alignBy(lifeflow.alignChoices()[0].valueOf());
                }
                //lifeflow.dispatch.alignBy(d,i);
                chart.update();
            });

            //------------------------------------------------------------
            //------------------------------------------------------------
            // Main Chart Component(s)


            lifeflow 
                //.disabled(data.map(function (series) { return series.disabled })) // commented out with no apparent effect
                .width(chartGraphWidth)
                .height(chartGraphHeight)
            //.color(data.map(function(d,i) { return d.color || chart.color()(d, i); }) .filter(function(d,i) { return !data[i].disabled }))
            svgChart.select('g.nv-evt-chart')
                    .datum(data)
                    //.transition()
                    .call(lifeflow);

            hideLegend.color(lifeflow.color());
            alignLegend.color(lifeflow.color());
            hideLegend.width(chartFullWidth);
            alignLegend.width(chartFullWidth);

            svgHead.selectAll('g.hide-legend')
                .data([lifeflow.eventNames()])
                .call(hideLegend);
            svgHead.select('g.align-legend')
                .data([lifeflow.alignChoices()])
                .call(alignLegend);
            yAxis
                .orient('left')
                .tickPadding(5)
                .highlightZero(false)
                .showMaxMin(false)
                .tickFormat(d3.format('5,'))
            //.tickFormat(function(d) { return d })
            ;
            xAxis
                .orient('top')
                .tickPadding(15)
                .highlightZero(false)
                .showMaxMin(false)
                .tickFormat(d3.format('5,'))

            yAxis.scale(lifeflow.yScale())
                .ticks(chartGraphHeight / 24)
                .tickSize(-chartFullWidth, 0);
            xAxis.scale(lifeflow.xScale())
                .ticks(chartGraphWidth / 55)
                .tickSize(-chartGraphHeight, 0)

            d3.transition()
                .duration(2000)
                .each(function() {
                    svgChart.select('.nv-y.nv-axis')
                    .call(yAxis);
                });
            var yTicks = svgChart.select('.nv-y.nv-axis').selectAll('g');
            yTicks
                .selectAll('line, text')
                .style('opacity', 1)

            svgChart.select('.nv-x.nv-axis')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(xAxis);
            //------------------------------------------------------------



            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------

            // Update chart from a state object passed to event handler
            /*
            dispatch.on('tooltipShow', function(e) {
                if (tooltips) showTooltip(e, that.parentNode);
            });
            dispatch.on('changeState', function(e) {

                if (typeof e.disabled !== 'undefined') {
                data.forEach(function(series,i) {
                    series.disabled = e.disabled[i];
                });

                state.disabled = e.disabled;
                }

                if (typeof e.stacked !== 'undefined') {
                lifeflow.stacked(e.stacked);
                state.stacked = e.stacked;
                }

                selection.call(chart);
            });
            */
            //============================================================
            return;

            //------------------------------------------------------------
            /*
            var svgFoot = container.selectAll('svg.svg-foot')
                            .data([eventNames])
            svgFoot.enter()
                .append('svg')
                    .attr('class', 'svg-foot')
                    //.attr('width', availableWidth)
                    .attr('height', margin.bottom)
                .append('g')
                    .attr('transform', 'translate(' + margin.left + ',0)')
                    .attr('class', 'nv-x nv-axis');
            svgFoot = container.select('svg.svg-foot>g')
            */

            //chart.update = function() { container.transition().call(chart) };

            //set state.disabled
            /*
            state.disabled = data.map(function(d) { return !!d.disabled });

            if (!defaultState) {
                var key;
                defaultState = {};
                for (key in state) {
                if (state[key] instanceof Array)
                    defaultState[key] = state[key].slice(0);
                else
                    defaultState[key] = state[key];
                }
            }
            */
            /*
            if (lifeflow.barColor())
                data.forEach(function(series,i) {
                //series.color = d3.rgb('#ccc').darker(i * 1.5).toString();
                })
            */

            /*
            if ( margin.top != legend.height()) {
                margin.top = legend.height();
                availableHeight = (height || parseInt(svgHead.style('height')) || 400)
                                    - margin.top - margin.bottom;
            }
            gHead.select('.nv-legendWrap')
                .attr('transform', 'translate(0' + 
                    ',' + (-margin.top) +')');
            */


        });

        return chart;
    }


        //============================================================
        // Event Handling/Dispatching (out of chart's scope)
        //------------------------------------------------------------

        lifeflow.dispatch.on('elementMouseover.tooltip', function(e) {
            //e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
            dispatch.tooltipShow(e);
        });
        lifeflow.dispatch.on('elementMouseout.tooltip', function(e) {
            dispatch.tooltipHide(e);
        });
        dispatch.on('tooltipShow', function(e) {
            if (tooltips) showTooltip(e);
        });
        dispatch.on('tooltipHide', function() {
            if (tooltips) nv.tooltip.cleanup();
        });
        lifeflow.dispatch.on('doneDrawing', function(e) {
            // false && 
            $("g.event-node rect").contextMenu('context-menu-1', {
                    'hide these': {
                        click: function(element){  // element is the jquery obj clicked on when context menu launched
                            var node = element[0].__data__;
                            var timelineRecords = 
                                _.chain(node.records)
                                    .invoke('timeline')
                                    .pluck('records')
                                    .flatten()
                                    .value();
                            var remaining = _.difference(
                                lifeflow.timelineData().data(), timelineRecords);
                            lifeflow.dispatch.selectRecs(remaining);
                            if (chart.alignBy() && chart.alignBy() !== node.toString()) {
                                // keep alignBy
                            } else {
                                chart.alignBy(undefined);
                            }
                            chart.update();
                            //element.css({backgroundColor: 'pink'}); // just as example the clicked items backgorund is changed
                        },
                        klass: "filter-this"
                    },
                    'Show only this sequence': {
                        click: function(element){  // element is the jquery obj clicked on when context menu launched
                            var node = element[0].__data__;
                            var timelineRecords = 
                                _.chain(node.records)
                                    .invoke('timeline')
                                    .pluck('records')
                                    .flatten()
                                    .value();
                            lifeflow.dispatch.selectRecs(timelineRecords);
                            chart.alignBy(node.parent ?  node.parent.toString() : node.toString());
                            chart.update();
                            //element.css({backgroundColor: 'pink'}); // just as example the clicked items backgorund is changed
                        },
                        klass: "filter-others" // a custom css class for this menu item (usable for styling)
                    },
                    'Show timelines, sort by evt duration': {
                        click: _.partial(showTimelines, 'eventDur'),
                        klass: "show-timelines" // a custom css class for this menu item (usable for styling)
                    },
                    'Show timelines, sort by timeline duration': {
                        click: _.partial(showTimelines, 'timelineDur'),
                        klass: "show-timelines" // a custom css class for this menu item (usable for styling)
                    },
                }
                ,{
                    //delegateEventTo: 'childrenSelector',
                    disable_native_context_menu: true,
                    showMenu: function(element) { 
                        var node = element[0].__data__;
                        var desc = 
                            '<b>' + node.namePath({noRoot:true}) + '</b>'
                            + ' (' + node.records.length + ' records)';
                        this.find('li.filter-this>a').html('Hide this sequence: ' + desc);
                        //this.find('li.filter-others>a').html('Show only this sequence');
                    },
                    //hideMenu: function() { alert("Hiding menu"); },
                    //leftClick: true // trigger on left click instead of right click
                }
            );
        });
        function showTimelines(sortOrder, element) {  // element is the jquery obj clicked on when context menu launched
            var node = element[0].__data__;
            var children = node.descendants();
            _(children).each(function(d) { 
                d3.select(d.domNode).remove();
                if (d.parent) d3.select(d.parent.domNode).remove();
            })
            var ht = parseFloat(d3.select(element[0]).attr('height'));
            var align = node.parent || node;
            var tmChart = nv.models.timelines()
                .xScale(lifeflow.xScale())
                .height(ht)
                .width(width)
                .eventNames(lifeflow.eventNames())
                .startDateProp(lifeflow.startDateProp())
                .entityIdProp(lifeflow.entityIdProp())
                .eventNameProp(lifeflow.eventNameProp())
                .color(lifeflow.color())
            if (sortOrder === 'eventDur') 
                tmChart.alignBy(align.toString()).sort('asc');
            if (sortOrder === 'timelineDur') 
                tmChart.alignBy('Start')

            element[0].__data__.domNode;
            //tlNode = d3.select(element[0].__data__.domNode.parentElement)
            tlNode = d3.select(align.domNode)
                .append('g')
                    .attr('class', 'lf-timelines')
                    .attr('transform','translate(' + 
                        lifeflow.relativeX()(lifeflow.eventNodeWidth()) + ',0)');
                    //.attr('transform', d3.select(element[0].__data__.domNode) .attr('transform'))
            var recs = _.chain(node.records)
                .map(function(rec) {
                    var toEnd = [rec.prev()||rec];
                    var n = toEnd[0];
                    while (n = n.next()) {
                        toEnd.push(n)
                    }
                    return toEnd;
                })
                .flatten()
                .value();
            tmChart.yScaleLinear(d3.scale.linear()
                    .domain([0,recs.length])
                    .range([0,ht]));
            tmChart.yScaleOrdinal(d3.scale.ordinal()
                    .range([0,ht]));
            tmChart.dispatch.on('elementMouseover.tooltip', function(e) {
                dispatch.tooltipShow(e);
            });
            tmChart.dispatch.on('elementMouseout.tooltip', function(e) {
                dispatch.tooltipHide(e);
            });
            tlNode.datum(recs)
                .call(tmChart);
    }
    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    // expose chart's sub-components
    chart.dispatch = dispatch;
    chart.lifeflow = lifeflow;
    //chart.legend = legend;
    chart.yAxis = yAxis;
    chart.xAxis = xAxis;

    d3.rebind(chart, lifeflow, 'clipEdge', 'id', 'delay', 'showValues', 'valueFormat', 'barColor', 'entityIdProp', 'eventNameProp', 'eventOrder', 'startDateProp', 'endDateField', 'defaultDuration', 'color', 'eventNames', 'alignBy', 'xAxis','unitProp');
    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin.top = typeof _.top != 'undefined' ? _.top : margin.top;
        margin.right = typeof _.right != 'undefined' ? _.right : margin.right;
        margin.bottom = typeof _.bottom != 'undefined' ? _.bottom : margin.bottom;
        margin.left = typeof _.left != 'undefined' ? _.left : margin.left;
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

    chart.showLegend = function (_) {
        if (!arguments.length) return showLegend;
        showLegend = _;
        return chart;
    };

    chart.tooltip = function(_) {
        if (!arguments.length) return tooltip;
        tooltip = _;
        return chart;
    };

    chart.tooltips = function(_) {
        if (!arguments.length) return tooltips;
        tooltips = _;
        return chart;
    };

    chart.tooltipContent = function(_) {
        if (!arguments.length) return tooltip;
        tooltip = _;
        return chart;
    };

    chart.state = function (_) {
        if (!arguments.length) return state;
        state = _;
        return chart;
    };

    chart.defaultState = function (_) {
        if (!arguments.length) return defaultState;
        defaultState = _;
        return chart;
    };

    chart.noData = function (_) {
        if (!arguments.length) return noData;
        noData = _;
        return chart;
    };

    //============================================================


    return chart;
}
