```shell
npm install --global cftemplate
mkdir my-first-cftemplate
cd my-first-cftemplate
npm init -y
npm install --save '@kemitchell/cform-example'
echo "(( require kemitchell cform-example ))" > test.cftemplate
cftemplate test.cftemplate
```
