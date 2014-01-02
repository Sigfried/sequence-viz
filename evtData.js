'use strict';
var evtData = function() {
    // public
    var   entityIdProp
        , eventNameProp
        , startDateProp
        , oneDay = 1000 * 60 * 60 * 24
        , timeUnitMS
        , timeUnits
        , eventOrder
        , hiddenEvents = []
        //, timelineArray
        , eventNameArray
        , origDataRef
        , rawRecsImmutable
        , filterFunc = function() { return true }
        ;
    // private
    /*
    rawRecs:        array of raw event objects, each expected to have an
                    entityId, and eventName, and a start date string

    timelineArray:  rawRecs grouped by entityId. each entity has a records 
                    array pointing to its raw event records and each of
                    those should have a pointer back to the timeline and
                    should be sorted in time order and should have
                    nextEvt/prevEvt pointers as appropriate

    eventNameArray: rawRecs grouped by eventName 

    OBSOLETE nodeArray:      timelines turned into a flattened tree using the 
                    lifeflow layout I added to D3 based on the hierarchy
                    layout. lots of ways to make these depending on where
                    you want the root to be and whether you're building the
                    hierarchy forwards in time or back
    */

        /*
    function curry3(fun) {
        return function(last) {
            return function(middle) {
                return function(first) {
                    return fun(first, middle, last);
                };
            };
        };
    }
    function addCalcField(o, fun, fieldName) { 
        // clones o and adds new field with value resulting from calling
        // fun on the clone
            var c = _.clone(o);
            c[fieldName] = fun(c);
            return c;
    }
    function idGen(pref) { // generator for unique ids
        return function() {
            return _.uniqueId(pref) 
        }
    }
    // addEid returns a function that takes an object, clones it,
    //  and adds eId field containing a unique id starting with 'e'
    var addEid = curry3(addCalcField)('eId')(idGen('e'))
    var addStartDate = curry3(addCalcField)('_startDate')(function(rawRec) {
        return toDate(rawRec[startDateProp]); });
    */
    function edata(data) {
        origDataRef = data;
        edata.eventNames();
        rawRecsImmutable = _.chain(origDataRef)
                            //.tap(log)
                            .map(makeEvt) // add ids to clones of data objs
                            //.tap(log)
                            .filter(filterFunc)
                            //.tap(log)
                            .tap(makeTimelines)
                            .value();
        freezeList(rawRecsImmutable);
        return edata;
    };
    edata.newFilter = function(fun) {
        var newEdata = evtData()
                    .entityIdProp(entityIdProp)
                    .eventNameProp(eventNameProp)
                    .startDateProp(startDateProp)
                    .filterFunc(fun)
                    (origDataRef)
        return newEdata;
    };
    edata.subSelection = function(records) {
        var selected = [];
        selected.length = origDataRef.length;
        _(records).each(function(d) {
            selected[d.eId] = true;
        });
        return edata.newFilter(function(rec) {
            return selected[rec.eId];
        });
    };
    function log(o) { console.log(o) };
    /*
    function eventName() {}
    eventName.prototype.toggleReturnNew = function() {
        var evtList = eventNameArray.rawValues();
        var disabled = _.chain(eventNameArray)
                            .filter(function(e) { return e.disabled; })
                            .invoke('toString')
                            .value();
        if (this.disabled) {
            disabled = _(disabled).without(this.valueOf());
        } else {
            disabled.push(this.valueOf());
        }
        var evtFilter;
        if (disabled.length > evtList.length / 2) {
            evtFilter = function(rec) {
                return evtList.indexOf(rec[eventNameProp]) !== -1;
            };
        } else {
            evtFilter = function(rec) {
                return disabled.indexOf(rec[eventNameProp]) === -1;
            };
        }
        return edata.newFilter(evtFilter).setEventNames(evtList, disabled)
    };
    */
    /*
    function evtIsActive(evt) {
        return !eventNameArray.lookup(evt[eventNameProp]).disabled;
    }
    */
    edata.setEventNames = function(nameList, disabledList) {
        eventNameArray = enlightenedData.group(
            _(nameList).map(function(d) {return {name:d}}),'name');
        if (disabledList) {
            _(disabledList).each(function(d) {
                var name = eventNameArray.lookup(d);
                if (name) {
                    name.disabled = true;
                } else {
                    fail("can't find " + d + " in " + nameList.join(','))
                }
            });
        }
        _(eventNameArray).each(function(d) {
            _.extend(d, eventName.prototype);
        });
        freezeList(eventNameArray);
        return edata;
    }
    edata.eventNames = function() {
        if (eventNameArray) {
            return eventNameArray;
        }
        eventNameArray = enlightenedData.group(origDataRef, eventNameProp);
        _(eventNameArray).each(function(d) {
            _.extend(d, eventName.prototype);
        });
        freezeList(eventNameArray);
        return eventNameArray;
    }
    function fail(thing) {
        throw new Error(thing);
    }
    function toDate(dateStr, lowerBound, upperBound) {
        lowerBound = lowerBound || new Date('01/01/1900');
        upperBound = upperBound || new Date('01/01/2100');
        var dt = new Date(dateStr);
        if (!(dt > lowerBound && dt < upperBound)) {
            fail("invalid date string: " + dateStr);
        }
        return dt;
    }
    function timeline() {}
    timeline.prototype.startDate = function() {
        return this.records[0].startDate();
    }
    timeline.prototype.endDate = function() {
        return this.records[this.records.length - 1].startDate();
    }
    timeline.prototype.duration = function(unit) {
        var ms = unitMS(unit || timeUnits || 'day');
        return Math.round((this.endDate() - this.startDate()) / ms)
    }
    function makeEvt(o, i) {
        var e = _.extend(new evt(), o);
        //e.eId = _.uniqueId('e');
        // need evts to get the same ID between calls
        e.eId = i;
        e._startDate = toDate(e[startDateProp]);
        e._entityId = e[entityIdProp];
        e._eventName = e[eventNameProp];
        return e;
    }
    function evt() {}
    evt.prototype.id = function() {
        return [this._entityId, this._eventName, this._startDate].join('/');
    }
    evt.prototype.startDate = function() {
        return this._startDate;
    }
    evt.prototype.eventName = function() {
        return this._eventName;
    }
    evt.prototype.entityId = function() {
        return this._entityId;
    }
    evt.prototype.next = function() {
        return this.timeline().records[this.evtIdx() + 1];
    }
    evt.prototype.prev = function() {
        return this.timeline().records[this.evtIdx() - 1];
    }
    evt.prototype.toNext = function(unit) {
        var ms = unitMS(unit || timeUnits || 'day');
        if (this.next()) {
            return this.timeTo(this.next(), ms);
        }
    };
    evt.prototype.fromPrev = function(unit) {
        var ms = unitMS(unit || timeUnits || 'day');
        if (this.prev()) {
            return this.prev().timeTo(this, ms);
        }
        return 0;
    };
    evt.prototype.startIdx = function(unit) {
        var ms = unitMS(unit || timeUnits || 'day');
        return Math.round((this.startDate() - this.timeline().startDate()) / ms);
    };
    evt.prototype.timeTo = function(otherEvt, unit) {
        var ms = unitMS(unit || timeUnits || 'day');
        if (!otherEvt) return 0;
        return otherEvt.startIdx(ms) - this.startIdx(ms);
    };
    evt.prototype.timeline = function (_) {
        if (!arguments.length) return this._timeline;
        this._timeline = _;
        return this;
    };
    evt.prototype.evtIdx = function (_) {
        if (!arguments.length) return this._evtIdx;
        this._evtIdx = _;
        return this;
    };
    var makeTimelines = function(data) {
        var rawRecs = _.chain(data)
                            //.tap(log)
                            .map(makeEvt) // add ids to clones of data objs
                            //.tap(log)
                            .filter(filterFunc)
                            //.tap(log)
                            .value();
        /*
        //if (!crossEntityTimeUnits) {
        var ms = milisecondRange(rawRecs);
        crossEntityTimeUnits = unitsToScale(ms)
        crossEntityTimeFormat = timeFormat(crossEntityTimeUnits);
        crossEntityDuration = ms / unitMS(crossEntityTimeUnits);
        //}
        */
        var idFunc = function(d) { return d.entityId() };
        var timelineArray = enlightenedData.group(rawRecs, idFunc);
        _(timelineArray).each(function (tl, i) {
            _.extend(tl, timeline.prototype);
            //var addTimelineToRec = curry3(addCalcField)('timeline')(function(){return tl});
            // too hard to maintain immutability through all this
            tl.records.sort(function (a, b) {
                var cmp = a.startDate() - b.startDate();
                if (cmp === 0) {
                    if (eventOrder) {
                        cmp = eventOrder.indexOf(a.eventName())
                            - eventOrder.indexOf(b.eventName())
                    }
                }
                return cmp;
            })
            _.each(tl.records, function (r, i) {
                r.timeline(tl);
                r.evtIdx(i);
            })
            tl._evtLookup = {};
            tl.evtLookup = function(evtName) {
                //fail('need to fix for dup evts');
                console.log('FIX DUP PROBLEM!!!')
                if (_(this._evtLookup).has(evtName)) {
                    return this.records[this._evtLookup[evtName]];
                }
            }
            _.each(tl.records, function (r, i) {
                if (!_(tl._evtLookup).has(r.eventName())) {
                    tl._evtLookup[r.eventName()] = i;
                }
            });
            /*
            tl.startDate() = tl.records[0].startDate();
            tl.endDate = tl.records[tl.records.length - 1].endDate;
            tl.days = tl.records[tl.records.length - 1].dayIdx + 1; // days for last rec is always 1
            tl.activeRecords = function() {
                return _(this.records).filter(function(rec) {
                    return !eventNameArray.lookup(rec[eventNameProp]).disabled;
                });
            }
            //tl.firstEvt = tl.records[0][eventNameProp];
            */
        });
        /*
        if (!intraEntityTimeUnits) {
            var maxMS = d3.max(_.chain(timelineArray).pluck('records')
                .map(function(recs) { 
                    return _(recs).last().startDate() -
                           _(recs).first().startDate()
                }).value())
            this.intraEntityTimeUnits(unitsToScale(maxMS))
            //intraEntityTimeFormat = timeFormat(intraEntityTimeUnits);
        }
        */
        timelineArray.sort = function(func) {
            return enlightenedData.addGroupMethods(this.slice(0).sort(func));
        }
        timelineArray.evtDurationSortFunc = function(evtName) {
            return function(a,b) {
                var arec = a.evtLookup(evtName);
                var brec = b.evtLookup(evtName);
                if (!arec && !brec) return 0;
                if (!arec) return 1;
                if (!brec) return -1;
                var A = arec.toNext();
                var B = brec.toNext();
                A = isNaN(A) ? -Infinity : A;
                B = isNaN(B) ? -Infinity : B;
                return B - A;
                if (B < A) return -1; // descending order
                if (A < B) return 1;
                if (A === B) return 0;
                fail("what did I forget?")
            }
        }
        timelineArray.sortByEvtDuration = function(evtName) {
            return this.sort(this.evtDurationSortFunc(evtName));
        };
        timelineArray.data = function() {
            return rawRecs;
        }
        freezeList(rawRecs);
        freezeList(timelineArray);
        return timelineArray;
    }
    edata.timelines = function(data) {
        var clone = unfreezeList(data);
        return freezeList(makeTimelines(clone));
    };
    edata.entityIdProp = function (_) {
        if (!arguments.length) return entityIdProp;
        entityIdProp = _;
        return edata;
    };
    edata.eventNameProp = function (_) {
        if (!arguments.length) return eventNameProp;
        eventNameProp = _;
        return edata;
    };
    edata.startDateProp = function (_) {
        if (!arguments.length) return startDateProp;
        startDateProp = _;
        return edata;
    };
    edata.timeUnits = function (_) {
        if (!arguments.length) return timeUnits;
        timeUnits = _;
        return edata;
    };
    edata.timeUnitMS = function (_) {
        if (!arguments.length) return timeUnitMS;
        timeUnitMS = _;
        return edata;
    };
    edata.intraEntityTimeUnits = function (_) {
        if (!arguments.length) return intraEntityTimeUnits;
        intraEntityTimeUnits = _;
        intraEntityTimeFormat = timeFormat(intraEntityTimeUnits);
        return edata;
    };
    edata.filterFunc = function (_) {
        if (!arguments.length) return filterFunc;
        filterFunc = _;
        return edata;
    };
    edata.origDataRef = function () {
        return origDataRef;
    };
    edata.data = function () {
        return rawRecsImmutable;
    };
    edata.makeTimelines = makeTimelines;
    function canLookup(o) {
        // don't have a decent test for enlightenedData lists or values
        if (_.isFunction(o.lookup)) {
            if (o instanceof Array) return true;
            if (o.kids) return true; // can lookup on vals if they have kids
        }
    }
    function freezeList(list) {
        if (canLookup(list)) {
            // have to initialize enlightenedData lookup lists before freezing
            list.lookup('foo'); 
        }
        _(list).each(function(d) {
            if (canLookup(d)) {
                d.lookup('foo'); 
            }
            Object.freeze(d);
        });
        Object.freeze(list);
        return list;
    };
    function unfreezeList(list) {
        return _(list).map(_.clone);
    }
    // @param {evt[]} recs
    // @return {Number} miliseconds from earliest to latest
    function milisecondRange(recs) {
        var range = d3.extent(_(recs).invoke('startDate'))
        return range[1] - range[0];
    }
    // @param {number} miliseconds
    // @return {String} time unit
    function unitsToScale(miliseconds) {
        if (isNaN(miliseconds) || miliseconds < 1) fail('bad range number');
        else if (miliseconds >= 1000*60*60*24*365.25) return 'years';
        else if (miliseconds >= 1000*60*60*24*365.25/12) return 'months';
        else if (miliseconds >= 1000*60*60*24*7) return 'weeks';
        else if (miliseconds >= 1000*60*60*24) return 'days';
        else if (miliseconds >= 1000*60*60) return 'hours';
        else if (miliseconds >= 1000*60) return 'minutes';
        else if (miliseconds >= 1000) return 'seconds';
        return 'miliseconds';
    }
    // @param {String} time unit
    // @return {Number} of miliseconds in that unit
    function unitMS(unit) {
        if      (unit === 'years') return 1000*60*60*24*365.25;
        else if (unit === 'months') return 1000*60*60*24*365.25/12;
        else if (unit === 'weeks') return 1000*60*60*24*7;
        else if (unit === 'days') return 1000*60*60*24;
        else if (unit === 'hours') return 1000*60*60;
        else if (unit === 'minutes') return 1000*60;
        else if (unit === 'seconds') return 1000;
        else if (unit === 'miliseconds') return 1;
        fail('bad unit name')
    }
    // @param {String} unit
    // @return {Function} appropriate d3.time.format
    function timeFormat(unit) {
        if      (unit === 'years') return d3.time.format('%Y');
        else if (unit === 'months') return d3.time.format('%b %Y');
        else if (unit === 'weeks') return d3.time.format('%b %Y %d');
        else if (unit === 'days') return d3.time.format('%Y-%m-%d');
        else if (unit === 'hours') return d3.time.format('%Y-%m-%d %H:%M');
        else if (unit === 'minutes') return d3.time.format('%Y-%m-%d %H:%M');
        else if (unit === 'seconds') return d3.time.format('%Y-%m-%d %H:%M:%s');
        else if (unit === 'miliseconds') return d3.time.format('%Y-%m-%d %H:%M:%L');
    }
    edata.milisecondRange = milisecondRange;
    edata.unitsToScale = unitsToScale;
    edata.unitMS = unitMS;
    edata.timeFormat = timeFormat;
    return edata;
}
