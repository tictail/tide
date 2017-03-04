#!/bin/bash

set -e

VERSION=`grep "version" package.json | cut -d '"' -f 4`
GIT_CMD="git -c user.name=\"CircleCI\" -c user.email=\"tech+circleci@tictail.com\""

echo "Creating git tag ${VERSION}"
set +e
${GIT_CMD} tag -a ${VERSION} -m ${VERSION} HEAD
GIT_RET_CODE=$?
set -e

if [ ${GIT_RET_CODE} -eq 0 ]; then
    echo "Publishing ${VERSION} to npm"
    echo -e "$NPM_USERNAME\n$NPM_PASSWORD\n$NPM_EMAIL" | npm login
    cd lib
    npm run 2npm
    echo "Pushing git tag ${VERSION}"
    ${GIT_CMD} push --tags
else
    echo "Creating git tag failed, most likely due to tag already existing"
fi
