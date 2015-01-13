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
    time_off = series[start][0]
    print 'time,volume'
    for t, v in series[start:]:
        print '%s\t%s' % (t - time_off, v)

if __name__ == '__main__':
    exit(main())
