/*
 * # sequence-viz.js
 * Author: [Sigfried Gold](http://sigfried.org)  
 * License: [MIT](http://sigfried.mit-license.org/)  
 * Version: 0.0.2
 */

module.exports = {
    supergroup : require('supergroup'),
    evtData : require('./evtData.js'),
    //lifeflow : require('./lifeflow.js'), moved to sequence-viz-demo
    //lifeflowChart : require('./lifeflowChart.js'), moved to sequence-viz-demo
    lifeflowData : require('./lifeflowData.js'),
    //lifeflowExtras : require('./lifeflowExtras.js'),
    //timelines : require('./timelines.js'),
    //timelinesChart : require('./timelinesChart.js')
}

console.log(module.exports.evtData);
