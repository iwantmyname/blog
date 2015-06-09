if [ "$TRAVIS_BRANCH" != "master" ] || [ "$TRAVIS_PULL_REQUEST" != "false" ]; then 
    exit 0;
fi

openssl aes-256-cbc -K $encrypted_174f06e19b8d_key -iv $encrypted_174f06e19b8d_iv -in .travis/deploy_key.enc -out .travis/deploy_key -d
chmod 600 .travis/deploy_key
eval "$(ssh-agent)"
ssh-add .travis/deploy_key
git config --global user.name "Travis-CI"
git config --global user.email "kingersoll+travis-ci-deploy@gmail.com"

git clone --no-checkout --branch gh-pages git@github.com:iwantmyname/blog.git gh-pages
mv gh-pages/.git/ site/

pushd site
touch .nojekyll
git add -A
git commit -m "jekyll build $TRAVIS_COMMIT" -m "https://travis-ci.org/$TRAVIS_REPO_SLUG/builds/$TRAVIS_BUILD_ID"
git push origin gh-pages
popd
