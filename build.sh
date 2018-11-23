#!/bin/bash

cd "$(dirname "$0")"

set -eu -o pipefail -o posix

if [ "${DEBUG:-x}" == "true" ] || [ "${DEBUG:-x}" == "true" ]; then
    set -x
fi

S3_BUCKET="${S3_BUCKET:=aws-codestar-eu-west-1-369205700250-call-api-pipe}"
STACK_NAME="${STACK_NAME:=awscodestar-call-api-lambda}"

echo >&2 "[INFO] Env-Variables:"
echo >&2 "       S3_BUCKET=${S3_BUCKET}"
echo >&2 "       STACK_NAME=${STACK_NAME}"

function runtests {
    >&2 echo "[INFO] run tests"
    bash -c 'cd create_user/ && npm test'
}

function  package {
    >&2 echo "[INFO] packaging node projects"
    bash -c 'cd create_user/ && npm install'
    bash -c 'cd create_event/ && npm install'
    bash -c 'cd list_events/ && npm install'
    bash -c 'cd poll/ && npm install'
    bash -c 'cd notify/ && npm install'
    bash -c 'cd subscribe/ && npm install'
    bash -c 'cd register_nfc/ && npm install'
    bash -c 'cd get_event_by_nfc/ && npm install'

    >&2 echo "[INFO] uploading artifacts"
    sam package --template-file template.yml \
    --output-template-file template-export.yml \
    --s3-bucket "$S3_BUCKET"
}

function deploy {
    >&2 echo "[INFO] deploying project"
    aws cloudformation deploy \
        --template-file template-export.yml \
        --stack-name "$STACK_NAME" \
        --capabilities CAPABILITY_IAM
}

case "${1:-x}" in
    setup_build_functions) setup_build_functions ;;
    test) runtests ;;
    package) package ;;
    deploy) deploy ;;
    all) 
        package
        runtests
        deploy
        ;;
    *) echo  >&2 "usage: $0 runtests|package|deploy|all"
       exit 1
       ;;
esac
