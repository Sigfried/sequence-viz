'use strict()';

/* global: describe */
describe('lifeflow and timelines with simple data', function() {
    var self = this;
    var csv =   "id,event,date\n" +
                "1,A,1/1/1950\n" +
                "1,B,1/1/1960\n" +
                "1,B,1/1/1970\n" +
                "2,A,1/1/1990\n" +
                "2,C,1/1/2010\n" +
                "2,B,1/1/2013\n" +
                "3,B,1/1/1960\n" +
                "3,A,1/1/1965\n" +
                "3,B,1/1/1970\n" +
                "3,B,1/1/1990\n";
    var data = d3.csv.parse(csv);
    it('should have 10 event records', function() {
        expect(data.length).toEqual(10);
    });
    describe('Timelines', function() {
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
        it('should have timelines', function() {
            expect(self.timelines.length).toEqual(3);
        });
        it('should have Evts in timelines', function() {
            expect(self.timelines.length).toEqual(3);
            expect(self.timelines[0].records.length).toEqual(3);
            expect(self.timelines[1].records.length).toEqual(3);
            expect(self.timelines[2].records.length).toEqual(4);
            expect(self.timelines[1].records[1])
                .toEqual(jasmine.any(self.edata.Evt));
        });
        it('should pluck out the starting event records', function() {
            expect(self.startRecs.length).toEqual(3);
            expect(self.startRecs[0]).toEqual(jasmine.any(self.edata.Evt));
        });
    });
    describe('Lifeflow', function() {
        beforeEach(function() {
            self.nodeTree = lifeflowData()
                    .eventNameProp('event')
                    (self.startRecs, 'noflatten');
            self.nodeList = self.nodeTree.flattenTree();
        });
        it('should have 9 lifeflowNodes', function() {
            expect(self.nodeTree.length).toEqual(2);
            expect(self.nodeList.length).toEqual(9);
            console.log(self.nodeTree.leafNodes().invoke('namePath'));
            expect(self.nodeList.invoke('namePath')).toEqual(
                ["A","A/B","A/B/B","A/C","A/C/B","B","B/A","B/A/B","B/A/B/B"]
                );
        });
    });
});
