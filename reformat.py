#!/usr/bin/env python
'''reformats the JSON timeseries stored in s3 into a format that can be
imported into google docs spreadsheet (TSV).'''
import json
import sys


def main():
    series = json.loads(sys.stdin.read())

    start = -1
    for i in range(len(series)):
        if series[i][1] != 0:
            start = i-1
            break
    series = series[start:]
    time_off = series[0][0]
    print 'time\tvolume\tdelta'
    for i in range(len(series)):
        t, v = series[i]
        if i == 0:
            delta = 0
        else:
            pt, pv = series[i-1]
            delta = (v-pv)/float(t-pt)
        print '%s\t%s\t%s' % (t - time_off, v, delta)

if __name__ == '__main__':
    exit(main())
