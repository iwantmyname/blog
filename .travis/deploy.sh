DEPLOY_BRANCH="staging"
if [ "$TRAVIS_BRANCH" == "master" ] && [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
    DEPLOY_BRANCH="gh-pages"
fi

openssl aes-256-cbc -K $encrypted_174f06e19b8d_key -iv $encrypted_174f06e19b8d_iv -in .travis/deploy_key.enc -out .travis/deploy_key -d
chmod 600 .travis/deploy_key
eval "$(ssh-agent)"
ssh-add .travis/deploy_key
git config --global user.name "Travis-CI"
git config --global user.email "kingersoll+travis-ci-deploy@gmail.com"

git clone --no-checkout --branch $DEPLOY_BRANCH git@github.com:iwantmyname/blog.git site.git
mv site.git/.git/ site/

pushd site
touch .nojekyll
git add -A
git commit -m "gostatic $TRAVIS_COMMIT" -m "https://travis-ci.org/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID"
git push origin $DEPLOY_BRANCH
PUSH_EXIT_CODE=$?
DEPLOY_SHA=$(git rev-parse --short HEAD)
popd

if [ $PUSH_EXIT_CODE == 0 ] && [ "$TRAVIS_PULL_REQUEST" != "false" ]; then
    curl -X POST \
         -H "Authorization: Bearer $HIPCHAT_TOKEN" \
         -H "Content-type: application/json" \
         -d "{\"color\": \"green\", \"message_type\": \"html\", \"message\": \"Successful <a href='https://travis-ci.org/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID'>build</a> of <a href='https://github.com/$TRAVIS_REPO_SLUG/pull/$TRAVIS_PULL_REQUEST'>pull request $TRAVIS_PULL_REQUEST</a>. Preview it <a href='https://rawgit.com/iwantmyname/blog/$DEPLOY_SHA/'>here</a>.\"}" \
         https://api.hipchat.com/v2/room/$HIPCHAT_ROOM/notification
fi
