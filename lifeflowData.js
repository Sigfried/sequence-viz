'use strict';
var lifeflowData = function () {
    function LifeflowNode() {};
    LifeflowNode.prototype.x = function(unit) {
        return timelines.dur(this._x, unit);
    };
    LifeflowNode.prototype.dx = function(unit) {
        return timelines.dur(this._dx, unit);
    };
    LifeflowNode.prototype.xLogical = function(unit) {
        return timelines.dur(this._xLogical, unit);
    };
    LifeflowNode.prototype.y = function() {
        return this._y;
    };
    LifeflowNode.prototype.dy = function() {
        return this._dy;
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
            res.xLogical = this.xLogical(opts.unit);
            res.y = this.y();
            res.dy = this.dy();
        }
        if (opts.parentCoords && this.parent) {
            var p = this.parent;
            res.parentNamePath = p.namePath(),
            res.parentDepth = p.depth,
            res.parent_x = p.x(opts.unit);
            res.parent_dx = p.dx(opts.unit);
            res.parent_xLogical = p.xLogical(opts.unit);
            res.parent_y = p.y();
            res.parent_dy = p.dy();
        }
        if (opts.recsFromPrev) {
            res.fromPrev = this.records.invoke('fromPrev', 0, opts.unit).sort();
            res.fromPrevMin = res.fromPrev.min().valueOf();
            res.fromPrevMax = res.fromPrev.max().valueOf();
            res.fromPrevMean = res.fromPrev.mean().valueOf();
            res.fromPrevMedian = res.fromPrev.median().valueOf();
        }
        if (opts.recsToNext) {
            res.toNext = this.records.invoke('toNext', 0, opts.unit).sort();
            res.toNextMin = res.toNext.min().valueOf();
            res.toNextMax = res.toNext.max().valueOf();
            res.toNextMean = res.toNext.mean().valueOf();
            res.toNextMedian = res.toNext.median().valueOf();
        }
        opts.logFunc(opts.stringifyLog ? JSON.stringify(res) : res);
        return opts.stringifyReturn ? JSON.stringify(res) : res;
    };
    var 
        eventNameProp = null,
        timelines,  // just for date reporting context
        alignmentLineWidth = 0,
        eventNodeWidth = 0,
        endNodeWidth = 0,
        rectWidth = function(recs) {
            if (! (recs && recs.length)) return 0;
            var durations = recs
                .invoke('fromPrev')
                .compact()
            return durations.length ? durations.mean().valueOf() : 0;
        },
        nextFunc = function(d) { return d.prev() };
    var makeNodes = function(startRecs, noflatten, backwards, maxDepth) {
        var groupKeyName = (backwards ? 'prev' : 'next') + '_' + eventNameProp;
        function preListRecsHook(records) { // group next records, not the ones we start with
            return records.invoke('next').compact();
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
        allNodes.each(function(lfnode) {
            _.extend(lfnode, new LifeflowNode());
        });
        var fakeRoot = supergroup.addListMethods([]).asRootVal();
        _.extend(fakeRoot, new LifeflowNode());
        fakeRoot.children = lfnodes;
        lfnodes.each(function(d) { d.parent = fakeRoot; });
        lfnodes = position(fakeRoot).children;
        lfnodes.each(function(d) { delete d.parent; });


        if (noflatten === "noflatten")
            return lfnodes;

        return allNodes;

        function position(lfnode, yOffset) {
            var children = lfnode.children;
            lfnode._dy = lfnode.records.length;
            if (lfnode.parent) {
                lfnode._dx = rectWidth(lfnode.records); // fromPrev
                lfnode._xLogical = lfnode.parent.xLogical() + lfnode.dx();
                lfnode._x = lfnode._xLogical + eventNodeWidth * lfnode.depth;
                lfnode._y = lfnode.parent.y() + (yOffset || 0);
            } else {
                lfnode._dx = 0;
                lfnode._xLogical = lfnode.dx();
                lfnode._x = lfnode._xLogical + alignmentLineWidth * (!backwards || -1);
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
    makeNodes.alignmentLineWidth = function(_) {
        if (!arguments.length) return alignmentLineWidth;
        alignmentLineWidth = _;
        return makeNodes;
    };
    makeNodes.eventNodeWidth = function(_) {
        if (!arguments.length) return eventNodeWidth;
        eventNodeWidth = _;
        return makeNodes;
    };
    makeNodes.endNodeWidth = function(_) {
        if (!arguments.length) return endNodeWidth;
        endNodeWidth = _;
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
