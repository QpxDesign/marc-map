echo "switching to branch master"
git checkout master

echo "Building//App"
npm run build

echo "deploying files to server"
scp -r build/* quinn@173.73.44.167:/var/www/173.73.44.167/

echo "DONE!"