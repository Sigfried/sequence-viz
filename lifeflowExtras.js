'use strict';

window.nv = nv || {models:{}, utils:{}};
var lifeflowExtras = function() {
    var exp = function() {}; // export container
    /* menu/control ideas....
     *
     *  Filter out
     *  Filter in
     *  Align by
     *      start, end, evtType
     *  GraphType
     *      lifeflow, timelines, icicle
     *  Show legend, Hide legend
     *  Lifeflow Settings
     *      fill gap from previous event 
     *      show distribution on mouseover
     *          do/don't hide on mouseout so evt mouseover will work
     */
    var dispatch = exp.dispatch = d3.dispatch('refresh', 'distNodeMouseover');

    exp.menu = function(targetSelection, menuData) {
        targetSelection.selectAll('ul').data([1]).enter()
                    .append('div').attr('id','cssmenu') 
                    .append('ul');
        var div = targetSelection.select('div#cssmenu');
        var topULs = div.selectAll('ul').filter(function() { 
            return this.parentNode===targetSelection.select('div#cssmenu').node() 
        })
        menuRecurse(topULs, menuData);

        // fill filter subs
    }
    var tip;
    var showTooltip = exp.showTooltip = function(e, offsetElement) {
        exp.tip = tip = tip || window.nv.models.tooltip().gravity('w').distance(23);
        tip
            .gravity('e')
            .position({ left: e.e.clientX, top: e.e.clientY })
            .data(
                {
                    value: e.text,
                    series: e.series,
                })();
    };
    var hideTooltip = function() {
        nv.tooltip.cleanup();
    };
    function menuRecurse(d3Node, menuItems) {
        var newLIs = d3Node.selectAll('li')
                    .data(menuItems).enter()
                    .append('li')
                        .classed('active', function(d) { return d.active })
        newLIs.append('a').attr('href','#')
            .append('span').text(function(d) { return d.label })
        newLIs.filter(function(d) { return d.action })
            .selectAll('a')
            .on('click',function(d) {
                if (d.refresh) dispatch.refresh();
                d.action.apply(this, arguments)
            })
        newLIs.filter(function(d) { return !d.action })
            .selectAll('a')
            .style('cursor','default')
        d3Node.selectAll('li').each(function(d) {
            d3.select(this).classed('has-sub', d.subs && d.subs.length);
            if (d.subs && d.subs.length) {
                d3.select(this).selectAll('ul')
                            .data([1]).enter().append('ul')
                menuRecurse(d3.select(this).select('ul'), d.subs);
            }
            if (d.LIprops)
                for (var p in d.LIprops) {
                    d3.select(this).attr(p, d.LIprops[p])
                }
        })
    }




    var nodesWithDistributionsShowing = [];
    exp.mouseout = function(lfChart, context, lfnode, i) {
        hideTooltip();
    };
    exp.nodeTooltip = function(lfChart, context, lfnode, i) {
        var tl = lfnode.records[0].timeline();
        tl.unitSettings({unit:'timeline', withUnit:true, round:true});
        showTooltip({
            value: lfnode,
            text: lfnode.namePath(),
            series: lfnode.pedigree().map(function(node, i) {
                return {
                    key: i,
                    value: [
                        i ? node.dx() : '',
                        i ?  '&nbsp;&rarr;&nbsp;' : '',
                        node.toString(),
                        node.records.length + ' evts'
                    ],
                    color: lfChart.color()(node.toString())
                }
            }),
            e: d3.event
        });
        tl.restoreUnitSettings();
    };
    exp.nodeDumpTooltip = function(lfChart, context, lfnode, i) {
        showTooltip({
            value: lfnode,
            text: lfnode.namePath(),
            series: _.unchain(
                lfnode.dump( {unit:{unit:'timeline', 
                    withUnit:true, round:true}}))
                .pairs()
                .map(function(p) {
                    return {key:p[0],value:p[1]};
                })
                .extend({color:lfChart.color()(lfnode.toString())}),
            e: d3.event
        });
    };
    exp.distNodeTooltip = function (lfChart, node, rec, i) {
        var lfnode = node.parentNode.__data__;
        d3.select(node).classed('hover', true)
        var fmt = d3.time.format('%Y-%m-%d');
        var tl = rec.evt.timeline();
        tl.unitSettings({unit:'timeline', withUnit:true, round:true});
        showTooltip({
            value: rec.evt,
            text: tl + ': ' + rec.evt.eventName() + 
                ' - ' + rec.evt.toNext() + ' of ' +
                rec.evt.timeline().duration(),
            series: _(rec.evt.timeline().records).map(function(rec, i) {
                var evtName = rec.eventName();
                if (i > lfnode.depth) {
                    evtName = '(' + evtName + ')';
                }
                return {
                    key: evtName,
                    value: rec.dtStr(),
                    color: lfChart.color()(rec.eventName())
                }
            }),
            e: d3.event
        });
        tl.restoreUnitSettings();
    };
    exp.showEvtDistribution = function(lfChart, context, lfnode, i) {
        /*
        d3.selectAll('rect')
            .transition().duration(700)
            .attr('opacity', 0.4);
            */
        console.log('mouse over ' + nodesWithDistributionsShowing.length);
        console.log(nodesWithDistributionsShowing);
        //lfnode.dump({stringifyLog:false});
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
        d3.select(context).selectAll('rect.gap-fill').attr('opacity',1)
        var recs, xFunc;
        if (!lfnode.parent) {
            recs = [];
        } else {
            recs = lfnode.recs();
        }
        /*
         else if (lfnode.backwards) {
            recs = lfnode.records.sort(function (a, b) {
                return a.toNext() - b.toNext();
            });
            //xFunc = function(d) { return lfChart.relativeX()(-d.toNext()) };
            xFunc = function(d) {
                    return lfChart.relativeX()(-lfnode.parent.dx -
                            d.toNext())
            };
        } else {
            recs = lfnode.records.sort(function (a, b) {
                return a.fromPrev() - b.fromPrev();
            });
            xFunc = function(d) {
                return lfChart.relativeX()(d.fromPrev())
            };
        }
        */
        var line = d3.svg.line()
            //.x(xFunc)
            .x(function(rec) {
                return lfChart.relativeX()(rec.offset); })
            .y(function (d, i) {
                return lfChart.yScale()(i + 0.5)
            });
        var path = d3.select(context).selectAll('path')
            .data([recs])
        path.enter()
            .append('path')
            .attr('d', line)
        path.attr('fill-opacity', 0)
            .attr('stroke', 'black')
            .style('pointer-events', 'none')
            .style('stroke-opacity', 1)
        var circle = d3.select(context).selectAll('circle')
            .data(recs)
        circle.enter()
            .append('circle')
            .attr('cx', function(rec) {
                return lfChart.relativeX()(rec.offset); })
            .attr('cy', function (rec, i) {
                return lfChart.yScale()(i + 0.5)
            })
            .attr('r', 4)
            .on("mouseover", function(d, i) {
                dispatch.distNodeMouseover(lfChart, this, d, i);
            });
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
    exp.xAxis = function(container) {
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

    };
    return exp;
}
