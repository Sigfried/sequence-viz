/*
 * # lifeflowData.js
 * Author: [Sigfried Gold](http://sigfried.org)  
 * License: [MIT](http://sigfried.mit-license.org/)  
 */
'use strict';
var _ = require('supergroup');
var lifeflowData = function () {
    function LifeflowNode() {};
    LifeflowNode.prototype.x = function(unit) {
        return timelines.dur(this._x, unit);
    };
    LifeflowNode.prototype.dx = function(unit) {
        return timelines.dur(this._dx, unit);
    };
    LifeflowNode.prototype.y = function() {
        return this._y;
    };
    LifeflowNode.prototype.dy = function() {
        return this._dy;
    };
    LifeflowNode.prototype.recs = function() {
        var lfnode = this;
        return lfnode.records.map(function(evt) {
            var rec = {
                toEvtInParent: toEvtInParent(lfnode, evt),
                evt: evt
            };
            rec.offset = rec.toEvtInParent - lfnode.dx() * 
                (lfnode.backwards ? -1 : 1);
            return rec;
        }).sortBy('offset');
    };
    var dumpOpts = {
                logFunc: function(o) { console.log(o) },
                unit: { unit: 'timeline',
                        withUnit: false,
                        round: false },
                path: true,
                coords: true,
                parentCoords: true,
                stringifyReturn: false,
                stringifyLog: false,
                recsFromPrev: true,
                recsToNext: true
            };
    LifeflowNode.prototype.dump = function(opts) {
        var holdUnit = opts && opts.unit;
        opts = _.extend(_.clone(dumpOpts), opts);
        opts.unit = _.extend(_.clone(opts.unit), holdUnit);
        var res = {};
        if (opts.path) {
            res.namePath = this.namePath();
            res.depth = this.depth;
        }
        if (opts.coords) {
            res.x = this.x(opts.unit);
            res.dx = this.dx(opts.unit);
            res.y = this.y();
            res.dy = this.dy();
        }
        if (opts.parentCoords && this.parent) {
            var p = this.parent;
            res.parentNamePath = p.namePath(),
            res.parentDepth = p.depth,
            res.parent_x = p.x(opts.unit);
            res.parent_dx = p.dx(opts.unit);
            res.parent_y = p.y();
            res.parent_dy = p.dy();
        }
        if (opts.recsFromPrev) {
            res.fromPrev = _(this.records).invoke('fromPrev', 0, opts.unit).sort();
            res.fromPrevMin = res.fromPrev.min().value();
            res.fromPrevMax = res.fromPrev.max().value();
            res.fromPrevMean = res.fromPrev.mean().value();
            res.fromPrevMedian = res.fromPrev.median().value();
        }
        if (opts.recsToNext) {
            res.toNext = _(this.records).invoke('toNext', 0, opts.unit).sort();
            res.toNextMin = res.toNext.min().value();
            res.toNextMax = res.toNext.max().value();
            res.toNextMean = res.toNext.mean().value();
            res.toNextMedian = res.toNext.median().value();
        }
        opts.logFunc(opts.stringifyLog ? JSON.stringify(res) : res);
        return opts.stringifyReturn ? JSON.stringify(res) : res;
    };
    function toEvtInParent(lfnode, evt) {
        if (lfnode.backwards)
            return evt.toNext();
        return evt.fromPrev();
    }
    var 
        eventNameProp = null,
        timelines,  // just for date reporting context
        rectWidth = function(lfnode) {
            var recs = lfnode.records;
            if (! (recs && recs.length)) return 0;
            var durations = _(recs)
                .map(function(rec) { return toEvtInParent(lfnode,rec); })
                //.invoke('fromPrev')
                .compact().value();
            return durations.length ? _(durations).mean().value() : 0;
        },
        nextFunc = function(d) { return d.prev() };
    var makeNodes = function(startRecs, noflatten, backwards, maxDepth) {
        var groupKeyName = (backwards ? 'prev' : 'next') + '_' + eventNameProp;
        function preListRecsHook(records) { // group next records, not the ones we start with
            return _(records).invoke('next').compact().value();
        }
        function addChildren(list, notRoot) {
            if (maxDepth && list.length && list[0].depth && list[0].depth >= maxDepth)
                return;
            if (!notRoot) {
                list = _.supergroup(startRecs, eventNameProp);
                list.sort(function(a,b) {
                            return b.records.length - a.records.length
                        })
            }
            _.each(list, function(d) { 
                //d.depth = d.parent ? d.parent.depth + 1 : 0;
                d.addLevel(eventNameProp, {
                    preListRecsHook:preListRecsHook,
                    childProp:'children'})
                addChildren(d.children, true);
                d.children.sort(function(a,b) {
                            return b.records.length - a.records.length
                        })
                })
            return list;
        }
        var lfnodes = addChildren(startRecs);
        //lfnodes = position({children:lfnodes,records:[]}).children;
        var allNodes = lfnodes.flattenTree();
        _(allNodes).each(function(lfnode) {
            _.extend(lfnode, LifeflowNode.prototype);
        });
        var fakeRoot = _.supergroup([]).asRootVal();
        _.extend(fakeRoot, LifeflowNode.prototype);
        fakeRoot.children = lfnodes;
        _(lfnodes).each(function(d) { d.parent = fakeRoot; });
        lfnodes = position(fakeRoot).children;
        _(lfnodes).each(function(d) { delete d.parent; });


        if (noflatten === "noflatten")
            return lfnodes;

        return allNodes;

        function position(lfnode, yOffset) {
            var children = lfnode.children;
            lfnode._dy = lfnode.records.length;
            if (lfnode.parent) {
                lfnode._dx = rectWidth(lfnode); // fromPrev
                lfnode._x = lfnode.parent.x() + lfnode.dx();
                lfnode._y = lfnode.parent.y() + (yOffset || 0);
            } else {
                lfnode._dx = 0;
                lfnode._x = lfnode.dx();
                lfnode._y = 0;
            }
            
            if (children && (n = children.length)) {
                var i = -1, c, yOffset = 0, n;
                while (++i < n) {
                    position(c = children[i], yOffset)
                    yOffset += c.dy();
                }
            }
            lfnode.backwards = !!backwards;
            return lfnode;
        }
    }
    //============================================================
    // Expose Public Variables
    //------------------------------------------------------------

    makeNodes.eventNameProp = function (_) {
        if (!arguments.length) return eventNameProp;
        eventNameProp = _;
        return makeNodes;
    };
    makeNodes.rectWidth = function(_) {
        if (!arguments.length) return rectWidth;
        rectWidth = _;
        return makeNodes;
    };
    makeNodes.nextFunc = function(_) {
        if (!arguments.length) return nextFunc;
        nextFunc = _;
        return makeNodes;
    };
    makeNodes.timelines = function(_) {
        if (!arguments.length) return timelines;
        timelines = _;
        return makeNodes;
    };
    //============================================================
    function endNode(parent) {  // not using yet
        var enode = {
            parent:parent,
            next: function() { 
                return this },
            prev: function() { return this }
        };
        enode[eventNameProp] = 'END_NODE';
        return enode;
    }
    return makeNodes;
}
module.exports = lifeflowData;
