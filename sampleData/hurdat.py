
#  http://www.nhc.noaa.gov/data/hurdat/hurdat2-format-atlantic.pdf
storms = {'WV':'Tropical Wave','HU':'Hurricane','TS':'Tropical Storm',
        'EX':'Extratropical','SD':'Subtropical Depression',
        'TD':'Tropical Depression',
        'SS':'Subtropical storm','DB':'Disturbance','LO':'Low'}
events = {'L':'Landfall', 'I':'Intensity Peak', 'W':'Maximum wind',
        'S':'Status change','G':'Genesis'}
print 'hur_id,date,status'
f=open('./hurdat2-atlantic-1851-2012-060513.txt')
for line in f:
    flds = line.split(',')
    stripped = [x.strip() for x in flds]
    if len(stripped) == 4:
        id = '_'.join(stripped[0:3])
        status = 'new'
    else:
        if len(stripped[2]) and not stripped[2] in ['C','T','P']:
            stripped[2] = events[stripped[2]]
            print ','.join([id, stripped[0][0:4] + '-' +
                stripped[0][4:6] + '-' + stripped[0][6:8] + ' ' +
                stripped[1][0:2] + ':' + stripped[1][2:4], stripped[2]])
        if status != "new" and status == stripped[3]:
            pass
        else:
            status = stripped[3]
            stripped[3] = storms[stripped[3]]
            print ','.join([id, stripped[0][0:4] + '-' +
                stripped[0][4:6] + '-' + stripped[0][6:8] + ' ' +
                stripped[1][0:2] + ':' + stripped[1][2:4], stripped[3]])
