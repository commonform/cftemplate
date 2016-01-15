```shell
npm install --global cftemplate
mkdir my-first-cftemplate
cd my-first-template
npm init -y
npm install --save '@kemitchell/cform-example'
echo "This form includes another form!\n(( require kemitchell cform-example ))" > test.cftemplate
cftemplate test.cftemplate
```
