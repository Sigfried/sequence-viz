'use strict';
var lifeflowData = function () {
    var 
        eventNameProp = null,
        alignmentLineWidth = 28,
        eventNodeWidth = 0,
        endNodeWidth = 0,
        rectWidth = function(recs) {
            return d3.mean(recs.map(function(d) { 
                return d.timeTo(nextFunc(d))
            }));
        },
        nextFunc = function(d) { return d.next() }
            ;
    var makeNodes = function(startRecs, UNUSED, backwards, maxDepth) {
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
        var fakeRoot = enlightenedData.addGroupMethods([]).asRootVal();
        fakeRoot.children = lfnodes;
        //lfnodes = position({children:lfnodes,records:[]}).children;
        lfnodes = position(fakeRoot).children;
        return lfnodes.flattenTree();


        function position(lfnode, yOffset) {
            var children = lfnode.children;
            if (lfnode.parent) {
                lfnode.x = lfnode.parent.x + lfnode.parent.dx 
                    + eventNodeWidth;
                //lfnode.x = lfnode.parent.x + eventNodeWidth;
                lfnode.y = lfnode.parent.y;
            } else {
                lfnode.x = alignmentLineWidth * (!backwards || -1);
                lfnode.y = 0;
            }
            lfnode.y += (yOffset || 0);
            lfnode.dx = rectWidth(lfnode.records);
            //lfnode.x += lfnode.dx;
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
