#!/bin/bash

set -e

VERSION=`grep "version" package.json | cut -d '"' -f 4`
GIT_CMD="git -c user.name=\"CircleCI\" -c user.email=\"tech+circleci@tictail.com\""

npm pack

echo "Creating git tag ${VERSION}"
set +e
${GIT_CMD} tag -a ${VERSION} -m ${VERSION} HEAD
GIT_RET_CODE=$?
set -e

if [ ${GIT_RET_CODE} -eq 0 ]; then
    curl --fail -F package=@`ls -1 appkit-*.tgz | sort -r | head -1` ${GEMFURY_INDEX}
    echo "Pushing git tag ${VERSION}"
    ${GIT_CMD} push --tags
else
    echo "Creating git tag failed, most likely due to tag already existing - upload to Gemfury skipped"
fi

rm -rf appkit-*.tgz
