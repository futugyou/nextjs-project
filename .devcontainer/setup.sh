#!/bin/bash
sleep 2
if [ -n "$CODESPACES" ]; then
    gh codespace ports visibility 3000:public -c $CODESPACE_NAME > /dev/null 2>&1
elif [ -n "$GITPOD_WORKSPACE_URL" ]; then
    gp ports visibility 3000:public > /dev/null 2>&1
fi 