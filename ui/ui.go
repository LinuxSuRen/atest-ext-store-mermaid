package ui

import (
	"embed"
	"path/filepath"
)

//go:embed dist
var dist embed.FS

//go:embed public
var public embed.FS

func GetJS() string {
	return fileContentOrError(dist, "dist/atest-ext-store-mermaid.umd.js")
}

func GetCSS() string {
	return fileContentOrError(dist, "dist/atest-ext-store-mermaid.css")
}

func GetStaticFile(file string) string {
	return fileContentOrError(public, filepath.Join("public", "data", file))
}

func fileContentOrError(os embed.FS, path string) string {
	data, err := os.ReadFile(path)
	if err == nil {
		return string(data)
	}
	return err.Error()
}
