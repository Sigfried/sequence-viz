'use strict';
nv.models.timelinesChart = function () {
    var HIDE_Y_AXIS = true;
    //============================================================
    // Public Variables with Default Settings
    //------------------------------------------------------------
    var timelines = timelineChart(),
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
        , lifeflowNodes
        , entities
        , showLegend = true
        , stacked = false
        , tooltips = true
        , state = {
            stacked: stacked
        }
        , defaultState = null
        , noData = 'No Data Available.'
        , dispatch = d3.dispatch( 'tooltipShow', 'tooltipHide', 
                'elementMouseover','elementMouseout',
                'stateChange', 'changeState');
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
                    series: e.series
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
                chartGraphWidth = chartFullWidth - margin.left - margin.right,
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
            tlChart.xScale(d3.scale.linear().range([0, chartGraphWidth]));
            tlChart.yScaleLinear(d3.scale.linear().range([0, chartGraphHeight]))
            tlChart.yScaleOrdinal(d3.scale.ordinal().rangeBands([0, chartGraphHeight]))

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
                tlChart.dispatch.toggleEvt(e,i);
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
                    tlChart.alignChoices().forEach(function (d) {
                        d.disabled = true;
                    });
                    chart.alignBy(d.valueOf());
                    d.disabled = false;
                } else {
                    d.disabled = true;
                    // default is align by start
                    tlChart.alignChoices()[0].disabled = false;
                    chart.alignBy(tlChart.alignChoices()[0].valueOf());
                }
                chart.update();
            });

            //------------------------------------------------------------
            //------------------------------------------------------------
            // Main Chart Component(s)


            tlChart 
                //.disabled(data.map(function (series) { return series.disabled })) // commented out with no apparent effect
                .width(chartGraphWidth)
                .height(chartGraphHeight)
            //.color(data.map(function(d,i) { return d.color || chart.color()(d, i); }) .filter(function(d,i) { return !data[i].disabled }))
            svgChart.select('g.nv-evt-chart')
                    .datum(data)
                    //.transition()
                    .call(tlChart);

            hideLegend.color(tlChart.color());
            alignLegend.color(tlChart.color());
            hideLegend.width(chartFullWidth);
            alignLegend.width(chartFullWidth);

            svgHead.selectAll('g.hide-legend')
                .data([tlChart.eventNames()])
                .call(hideLegend);
            svgHead.select('g.align-legend')
                .data([tlChart.alignChoices()])
                .call(alignLegend);
            yAxis
                .orient('left')
                .tickPadding(5)
                .highlightZero(false)
                .showMaxMin(false)
                //.tickFormat(d3.format('5,'))
            //.tickFormat(function(d) { return d })
            ;
            xAxis
                .orient('top')
                .tickPadding(15)
                .highlightZero(false)
                .showMaxMin(false)
            if (chart.alignBy()) {
                xAxis.tickFormat(d3.format('5,'));
            } else {
                xAxis.tickFormat(d3.time.format('%Y'));
            }

            if (!HIDE_Y_AXIS) {
                yAxis.scale(tlChart.yScaleOrdinal())
                    .ticks(chartGraphHeight / 24)
                    .tickSize(-chartFullWidth, 0);
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
            }

            xAxis.scale(tlChart.xScale())
                .ticks(chartGraphWidth / 55)
                .tickSize(-chartGraphHeight, 0)

            svgChart.select('.nv-x.nv-axis')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
                .call(xAxis);
            //============================================================
            // Event Handling/Dispatching (in chart's scope)
            //------------------------------------------------------------
            // has to be in scope just because showTooltip is
            dispatch.on('tooltipShow', function(e) {
                if (tooltips) showTooltip(e, that.parentNode);
            });

            return;
        });

        return chart;
    }
    //===========================================================
    // Event Handling/Dispatching (out of chart's scope)
    //------------------------------------------------------------

    tlChart.dispatch.on('elementMouseover.tooltip', function(e) {
        //e.pos = [e.pos[0] +  margin.left, e.pos[1] + margin.top];
        dispatch.tooltipShow(e);
    });
    tlChart.dispatch.on('elementMouseout.tooltip', function(e) {
        dispatch.tooltipHide(e);
    });
    dispatch.on('tooltipHide', function() {
        if (tooltips) nv.tooltip.cleanup();
    });
    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------
    // expose chart's sub-components
    chart.dispatch = dispatch;
    //chart.timelines = timelines;
    //chart.legend = legend;
    chart.yAxis = yAxis;
    chart.xAxis = xAxis;

    d3.rebind(chart, /*timelines, */ 'clipEdge', 'id', 'delay', 'showValues', 'valueFormat', 'barColor', 'entityIdProp', 'eventNameProp', 'eventOrder', 'startDateProp', 'endDateField', 'defaultDuration', 'color', 'eventNames', 'alignBy', 'xAxis', 'evtData','unitProp');
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

    chart.tooltips = function(_) {
        if (!arguments.length) return tooltips;
        tooltips = _;
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
