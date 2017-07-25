safe: safe-js safe-validate safe-cft safe-diffs

clean: safe-clean

safe-clean:
	rm examples/SAFE-*.diff examples/SAFE-*.commonform examples/SAFE.js

safe-js: examples/SAFE.js

%.js : %.ts
	tsc $<

safe-validate: 
	jayschema examples/SAFE-MFN.json          examples/SAFE.schema.json
	jayschema examples/SAFE-cap.json          examples/SAFE.schema.json
	jayschema examples/SAFE-discount.json     examples/SAFE.schema.json
	jayschema examples/SAFE-cap-discount.json examples/SAFE.schema.json

safe-cft:   examples/SAFE-MFN.commonform \
			examples/SAFE-cap.commonform \
			examples/SAFE-discount.commonform \
			examples/SAFE-cap-discount.commonform

%.commonform : %.json
	cftemplate examples/SAFE.cftemplate $< examples/SAFE.js > $@

safe-diffs: examples/SAFE-MFN.diff \
			examples/SAFE-cap.diff \
			examples/SAFE-discount.diff \
			examples/SAFE-cap-discount.diff

%.diff : %.commonform
	-diff -u $< ../commonform-samples/$(*F).commonform > $@

# https://www.gnu.org/software/make/manual/html_node/Automatic-Variables.html#Automatic-Variables
