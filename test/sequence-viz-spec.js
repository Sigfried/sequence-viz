'use strict()';

/* global: describe */
describe('lifeflow and timelines with simple data', function() {
    var self = this;
    var eventNodeWidth = 2 * 1000 * 60 * 60 * 24; // ends up in miliseconds!
    var alignmentLineWidth = 1 * 1000 * 60 * 60 * 24;
    var csv =   "id,event,date\n" +
                "1,A,1/1/1950\n" +
                "1,B,3/2/1950\n" +
                "1,B,3/12/1950\n" +
                "2,A,1/1/1960\n" +
                "2,B,1/16/1960\n" +
                "2,C,3/31/1960\n" +
                "2,B,6/29/1960\n" +
                "3,B,1/1/1970\n" +
                "3,A,1/11/1970\n" +
                "3,B,5/11/1970\n" +
                "3,B,6/10/1970\n";
    var data = d3.csv.parse(csv);
    it('should have 11 event records', function() {
        expect(data.length).toEqual(11);
    });
    describe('Timelines object', function() {
        beforeEach(function() {
            self.edata = evtData()
                    .entityIdProp('id')
                    .eventNameProp('event')
                    .startDateProp('date')
            self.timelines = self.edata.makeTimelines(data);
            self.startRecs = self.timelines
                                .pluck('records')
                                .map(_.first);
        });
        it('should be Timelines type', function() {
            expect(self.timelines.whatAmI()).toEqual(self.edata.Timelines.prototype);
        });
        it('should have right numbers of Evts', function() {
            expect(self.timelines.length).toEqual(3);
            expect(self.timelines[0].records.length).toEqual(3);
            expect(self.timelines[1].records.length).toEqual(4);
            expect(self.timelines[2].records.length).toEqual(4);
        });
        it('should have year units across the whole set', function() {
            expect(self.timelines.unit("universe")).toEqual("year");
        });
        it('should have month units across individual timelines', function() {
            expect(self.timelines.unit("timeline")).toEqual("month");
        });
        it('should be 20 years duration across whole set', function() {
            expect(Math.round(self.timelines.wholeSetDuration("universe"))).toEqual(20);
        });
        it('should have 6 months longest timeline', function() {
            expect(Math.round(self.timelines.maxDuration("timeline"))).toEqual(6);
        });
        describe('Timeline objects', function() {
            it('should be 3', function() {
                expect(self.timelines.length).toEqual(3);
            });
            it('should be Timeline type', function() {
                self.timelines.each(function(timeline) {
                    expect(timeline.whatAmI()).toEqual(self.edata.Timeline.prototype);
                });
            });
            it('should have year units across the whole set', function() {
                self.timelines.each(function(timeline) {
                    expect(timeline.unit("universe")).toEqual("year");
                });
            });
            it('should have month units across individual timelines', function() {
                self.timelines.each(function(timeline) {
                    expect(timeline.unit("timeline")).toEqual("month");
                });
            });
            describe('Evt objects', function() {
                beforeEach(function() {
                    self.evts = self.timelines.pluck('records').flatten();
                });
                it('should have 10', function() {
                    expect(self.evts.length).toEqual(data.length);
                    self.evts.each(function(evt) {
                        expect(evt).toEqual(jasmine.any(self.edata.Evt));
                    });
                });
                it('should have year units across the whole set', function() {
                    self.evts.each(function(evt) {
                        expect(evt.unit("universe")).toEqual("year");
                    });
                });
                it('should have month units across individual timelines', function() {
                    self.evts.each(function(evt) {
                        expect(evt.unit("timeline")).toEqual("month");
                    });
                });
                it('should refer certain methods up to Timelines', function() {
                    var evt = self.evts[0];
                    evt.unit === evt.timeline().unit === evt.timeline().timelines().unit;
                    evt.dur === evt.timeline().dur === evt.timeline().timelines().dur;
                    evt.unitSettings === evt.timeline().unitSettings === evt.timeline().timelines().unitSettings;
                    evt.restoreUnitSettings === evt.timeline().restoreUnitSettings === evt.timeline().timelines().restoreUnitSettings;
                });
                it('should have these month durations', function() {
                    expect(self.evts
                            .invoke('toNext',0,'timeline')
                            .map(Math.round)
                        ).toEqual([ 2, 0, 0, 1, 2, 3, 0, 0, 4, 1, 0 ]);
                });
                it('should have these day durations', function() {
                    expect(self.evts
                            .invoke('toNext',0,'day')
                            .map(Math.round)
                        ).toEqual([ 60, 10, 0, 15, 75, 90, 0, 10, 120, 30, 0 ]);
                });
            });
        });
    });
    describe('Starting events', function() {
        it('should pluck out the first Evt of each Timeline', function() {
            expect(self.startRecs.length).toEqual(3);
            expect(self.startRecs[0]).toEqual(jasmine.any(self.edata.Evt));
        });
    });
    describe('Lifeflow', function() {
        beforeEach(function() {
            self.nodeTree = lifeflowData()
                    .eventNameProp('event')
                    .timelines(self.timelines)
                    (self.startRecs, 'noflatten');
            self.nodeList = self.nodeTree.flattenTree();
        });
        describe('nodeTree', function() {
            it('should have 2 top-level values', function() {
                expect(self.nodeTree.rawValues()).toEqual(["A","B"]);
            });
        });
        describe('nodeTree', function() {
            it('should have 2 top-level values', function() {
                expect(self.nodeTree.rawValues()).toEqual(["A","B"]);
            });
            it('should have 3 leafNodes', function() {
                expect(self.nodeTree.leafNodes().rawValues()).toEqual(['B','B','B']);
            });
            it('should have these leafNode paths', function() {
                expect(self.nodeTree.leafNodes().invoke('namePath')).toEqual(["A/B/B","A/B/C/B","B/A/B/B"]);
            });
        });
        describe('all nodes', function() {
            it('should have 9 values', function() {
                expect(self.nodeList.rawValues()).toEqual(['A','B','B','C','B','B','A','B','B']);
            });
            it('should have these paths', function() {
                expect(self.nodeList.invoke('namePath')).toEqual(
                    ['A','A/B','A/B/B','A/B/C','A/B/C/B','B','B/A','B/A/B','B/A/B/B']
                );
            });
            it('should have these x values', function() {
return;  // fix
                expect(self.nodeList.invoke('xLogical',
                    {unit:'day',round:true, withUnit: true, dontConvert:false}))
                .toEqual( [ '0 days', '75 days', '85 days', '75 days', '165 days', '0 days', '10 days', '130 days', '160 days' ]);
            });
            it('nodes should have dx === mean(node.records.fromPrev)', function() {
                self.nodeList.each(function(node) {
                    console.log(node.records.invoke('fromPrev', 0).mean() +
                        ' === ' + node.dx());
                    expect(node.records.invoke('fromPrev', 0,
                        {unit:'day',round:false, withUnit: false}).mean().valueOf())
                    .toBeCloseTo(node.dx(
                        {unit:'day',round:false, withUnit: false, dontConvert:false}), 7);
                });
            });
            /*
            it('should write info about nodes to the console', function() {
                self.nodeList.map(function(node) {
                    var toNextMean = node.records.invoke('toNext', 0,
                        {unit:'day',round:false, withUnit: false}).mean();
                    var durs = node.records.invoke('toNext', 0,
                        {unit:'day',round:false, withUnit: false});
                    var info = {
                        node: node.namePath(),
                        xLogical: node.xLogical(
                            {unit:'day',round:false, withUnit: true, dontConvert:false}),
                        x: node.x(
                            {unit:'day',round:false, withUnit: true, dontConvert:false}),
                        dx: node.dx(
                            {unit:'day',round:false, withUnit: true, dontConvert:false}),
                        y: node.y(), dy: node.dy(),
                        durs: durs,
                        toNextMean: toNextMean
                    };
                    console.log(JSON.stringify(info, null, 4));
                    node.dump();
                    return 1;
                });
            });
            */
        });
    });
});
