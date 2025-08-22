package ui

import (
	_ "embed"
)

//go:embed dist/atest-ext-store-mermaid.umd.js
var js string

//go:embed dist/atest-ext-store-mermaid.css
var css string

func GetJS() string {
	return js
}

func GetCSS() string {
	return css
}
