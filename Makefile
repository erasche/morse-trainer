.PHONY: release

release:
	grunt
	git checkout gh-pages
	rm -rf css/ index.html js/ partials/
	mv dist/* .
	rmdir dist
	git add css/ js/ partials/ index.html
	git commit -a -m "Automated build from master"
	git checkout master
