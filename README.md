```shell
npm install --global ctemplate
mkdir my-first-ctemplate
cd my-first-template
npm init -y
npm install --save '@kemitchell/cf-example'
echo "This form includes another form!\n(( require kemitchell cf-example ))" > test.ctemplate
ctemplate test.ctemplate
```
