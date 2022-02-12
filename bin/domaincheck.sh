#!/usr/bin/env bash

# https://stackoverflow.com/questions/23048702/bash-while-loop-threading/23048757
GREEN="\033[0;32m"
NC="\033[0m"

WAIT_FOR_RATE_LIMIT=10

for i in {00000..99999}; do
    {
        echo "Checking bcm$i.com..."
        sleep 1
        whois bcm$i.com | grep -q -E '^No match|^NOT FOUND|^Not fo|AVAILABLE|^No Data Fou|has not been regi|No entri'
        if (($? != 0)); then
            printf "${GREEN}bcm$i.com : available${NC}\n"
            echo "bcm$i.com" >> list.txt
        fi
    } &
    ii=$(echo $i | sed -E 's/0*([0-9]*)/\1/')
    if ((ii != 0 && ii % 1000 == 0)); then
        echo "Wait for chunk to finish ..."
        wait
        echo "Wait ${WAIT_FOR_RATE_LIMIT}s ..."
        sleep $WAIT_FOR_RATE_LIMIT
    fi
done

wait
